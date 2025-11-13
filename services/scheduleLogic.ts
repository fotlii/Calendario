
import type { Person, DiagnosticResult } from '../types';
// FIX: Changed date-fns deep imports from default to named to fix "not callable" errors. This is likely due to an upgrade to date-fns v3.
import { format } from 'date-fns/format';
import { getDay } from 'date-fns/getDay';
import { isBefore } from 'date-fns/isBefore';
import { startOfDay } from 'date-fns/startOfDay';
import { subDays } from 'date-fns/subDays';
import { CONFIG } from '../constants';

const formatDate = (date: Date): string => format(date, 'yyyy-MM-dd');

const getCode = (person: Person, date: Date): string => {
  return person.schedule[formatDate(date)]?.toUpperCase() || '';
};

const isStatusBacktracking = (person: Person, startDate: Date, targets: string[], passthrough: string[]): boolean => {
  let currentDate = startDate;
  while (true) {
    const code = getCode(person, currentDate);
    if (!code) return false;
    if (passthrough.includes(code)) {
      currentDate = subDays(currentDate, 1);
    } else {
      return targets.includes(code);
    }
  }
};

const findLastWorkedSaturday = (person: Person, beforeDate: Date, allPeople: Person[]): { date: Date | null; saturdaysSince: number } => {
  const allDates = [...new Set(allPeople.flatMap(p => Object.keys(p.schedule)))].sort().reverse();
  
  let lastWorkedDate: Date | null = null;
  
  for (const dateStr of allDates) {
    const date = new Date(dateStr);
    if (getDay(date) === 6 && isBefore(date, startOfDay(beforeDate))) {
       const code = person.schedule[dateStr]?.toUpperCase() || '';
       if (CONFIG.COD_TRABAJO_SABADO.includes(code)) {
         lastWorkedDate = date;
         break;
       }
    }
  }

  if (!lastWorkedDate) {
    return { date: null, saturdaysSince: Infinity };
  }

  let saturdaysSince = 0;
  let currentDate = new Date(lastWorkedDate);
  while(isBefore(currentDate, startOfDay(beforeDate))) {
      currentDate = subDays(currentDate, -1); // move to next day
      if (getDay(currentDate) === 6) {
          saturdaysSince++;
      }
  }
  
  return { date: lastWorkedDate, saturdaysSince: saturdaysSince -1 };
};

export const runDiagnostics = (saturdayDate: Date, allPeople: Person[]): DiagnosticResult[] => {
  const results: DiagnosticResult[] = [];

  for (const person of allPeople) {
    let eligible = true;
    let reason = 'Elegible.';
    let score = 0;

    if (person.role.toUpperCase() === CONFIG.ROL_EXCLUIR) {
      eligible = false;
      reason = `EXCLUIDO: Rol ${CONFIG.ROL_EXCLUIR}.`;
    } else if (CONFIG.COD_NO_TRABAJA_SABADO.includes(getCode(person, saturdayDate))) {
      eligible = false;
      reason = 'EXCLUIDO: FN/FA en la persona.';
    } else {
      const friday = subDays(saturdayDate, 1);
      const thursday = subDays(saturdayDate, 2);

      if (isStatusBacktracking(person, friday, CONFIG.BAJA, CONFIG.PASSTHROUGH)) {
        eligible = false;
        reason = 'EXCLUIDO: Baja en viernes (con retroceso).';
      } else if (isStatusBacktracking(person, friday, CONFIG.FORMACION, CONFIG.PASSTHROUGH)) {
        eligible = false;
        reason = 'EXCLUIDO: Formación en viernes (con retroceso).';
      } else if (
        CONFIG.VACACIONES.includes(getCode(person, friday)) &&
        CONFIG.VACACIONES.includes(getCode(person, thursday))
      ) {
        eligible = false;
        reason = 'EXCLUIDO: Vacaciones Jueves + Viernes.';
      }
    }
    
    let lastWorkedInfo = "Nunca ha trabajado un sábado.";
    if (eligible) {
      const { date, saturdaysSince } = findLastWorkedSaturday(person, saturdayDate, allPeople);
      score = saturdaysSince;
      if (date) {
        lastWorkedInfo = `Último sábado trabajado: ${formatDate(date)}. Sábados desde entonces: ${saturdaysSince}.`;
      } else {
          lastWorkedInfo = "Nunca trabajó un sábado. Máxima prioridad.";
      }
    }

    results.push({
      name: person.name,
      eligible,
      reason,
      score: eligible ? score : -1,
      lastWorkedInfo,
    });
  }

  return results;
};

export const findBestCandidate = (saturdayDate: Date, allPeople: Person[]): Person | null => {
    const diagnostics = runDiagnostics(saturdayDate, allPeople);
    const eligibleCandidates = diagnostics.filter(d => d.eligible);

    if (eligibleCandidates.length === 0) {
        return null;
    }
    
    eligibleCandidates.sort((a, b) => b.score - a.score);

    const bestCandidateName = eligibleCandidates[0].name;

    return allPeople.find(p => p.name === bestCandidateName) || null;
}
