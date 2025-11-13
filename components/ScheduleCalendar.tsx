import React, { useState, useMemo } from 'react';
// FIX: Changed date-fns deep imports from default to named to fix "not callable" errors. This is likely due to an upgrade to date-fns v3.
import { addDays } from 'date-fns/addDays';
import { format } from 'date-fns/format';
import { getDay } from 'date-fns/getDay';
import { getDaysInMonth } from 'date-fns/getDaysInMonth';
import { startOfMonth } from 'date-fns/startOfMonth';
import { startOfWeek } from 'date-fns/startOfWeek';
// FIX: Changed locale import to a named import for date-fns v3 compatibility.
import { es } from 'date-fns/locale/es';
import type { Person, DiagnosticResult } from '../types';
import { LEGEND_DATA, CONFIG } from '../constants';
import { findBestCandidate, runDiagnostics } from '../services/scheduleLogic';
import { DiagnosticModal } from './DiagnosticModal';
import { AssignmentChoicePopover } from './AssignmentChoicePopover';

interface ScheduleCalendarProps {
  scheduleData: Person[];
  currentDate: Date;
  onUpdateSchedule: (personId: string, updates: Record<string, string>, isWeekAssignment?: boolean) => void;
  onReactivateFromDate: (personId: string, activationDate: Date, newShift: 'M' | 'T' | 'JF') => void;
  onShowWeek: (date: Date) => void;
}

interface PopoverState {
  personId: string;
  dateStr: string;
  code: string;
  top: number;
  left: number;
}

const getCodeColor = (code: string): string => {
  const item = LEGEND_DATA.find(i => i.code.toUpperCase() === code.toUpperCase());
  return item ? item.color : 'bg-gray-200';
};

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ scheduleData, currentDate, onUpdateSchedule, onReactivateFromDate, onShowWeek }) => {
  const [suggestion, setSuggestion] = useState<Person | null>(null);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResult[] | null>(null);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  
  const daysInMonth = useMemo(() => {
    const date = startOfMonth(currentDate);
    const numDays = getDaysInMonth(date);
    return Array.from({ length: numDays }, (_, i) => {
      const dayDate = new Date(date.getFullYear(), date.getMonth(), i + 1);
      return {
        date: dayDate,
        dayOfMonth: i + 1,
        dayOfWeek: format(dayDate, 'EEEEE', { locale: es }).toUpperCase(),
        dayOfWeekNum: getDay(dayDate),
        isSaturday: getDay(dayDate) === 6,
        isSunday: getDay(dayDate) === 0,
      };
    });
  }, [currentDate]);

  const handleSuggest = (saturdayDate: Date) => {
    const candidate = findBestCandidate(saturdayDate, scheduleData);
    setSuggestion(candidate);
    setTimeout(() => setSuggestion(null), 5000);
  };

  const handleAssign = (saturdayDate: Date) => {
    const candidate = findBestCandidate(saturdayDate, scheduleData);
    if (candidate) {
      onUpdateSchedule(candidate.id, { [format(saturdayDate, 'yyyy-MM-dd')]: CONFIG.CODIGO_ASIGNAR });
    } else {
      alert("No hay candidatos elegibles para este sábado.");
    }
  };

  const handleDiagnose = (saturdayDate: Date) => {
    const results = runDiagnostics(saturdayDate, scheduleData);
    setDiagnosticData(results);
  };

  const handleDrop = (e: React.DragEvent, personId: string, dateStr: string) => {
    e.preventDefault();
    setPopover(null);
    const code = e.dataTransfer.getData('text/plain');
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const dayOfWeek = getDay(new Date(dateStr));
    if (dayOfWeek === 0) return;

    setPopover({
      personId,
      dateStr,
      code,
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };
  
  const handleAssignDay = () => {
    if (!popover) return;
    const { personId, dateStr, code } = popover;
    
    const person = scheduleData.find(p => p.id === personId);
    if (!person) return;

    // Check for reactivation
    const isPrimaryShift = ['M', 'T', 'JF'].includes(code.toUpperCase());
    if (person.defaultShift === 'B' && isPrimaryShift) {
        onReactivateFromDate(personId, new Date(dateStr), code.toUpperCase() as 'M' | 'T' | 'JF');
        setPopover(null);
        return;
    }
    
    const existingCode = person.schedule[dateStr] || 'D';
    let newCode = code;

    if (code.toUpperCase() === 'P') {
      const parts = existingCode.split('/').filter(c => c && c !== 'D' && c.toUpperCase() !== 'P');
      if (existingCode.includes('P')) {
          newCode = parts.length > 0 ? parts[0] : 'D';
      } else {
          newCode = parts.length > 0 ? `${parts[0]}/P` : 'D/P';
      }
    } else {
      newCode = code;
    }

    const dayOfWeek = getDay(new Date(dateStr));
    const allowedSaturdayCodes = ['MS', 'TD'];
    if (dayOfWeek === 6 && !allowedSaturdayCodes.some(c => newCode.toUpperCase().includes(c))) {
        alert("En sábado solo se pueden asignar los turnos 'MS' o 'TD'.");
        setPopover(null);
        return;
    }
    
    onUpdateSchedule(personId, { [dateStr]: newCode }, false);
    setPopover(null);
  };

  const handleAssignWeek = () => {
    if (!popover) return;
    const { personId, dateStr, code } = popover;

    const person = scheduleData.find(p => p.id === personId);
    if (!person) return;

    // Handle reactivation
    const isPrimaryShift = ['M', 'T', 'JF'].includes(code.toUpperCase());
    if (person.defaultShift === 'B' && isPrimaryShift) {
        onReactivateFromDate(personId, new Date(dateStr), code.toUpperCase() as 'M' | 'T' | 'JF');
        setPopover(null);
        return;
    }

    const weekStart = startOfWeek(new Date(dateStr), { weekStartsOn: 1 });
    const updates: Record<string, string> = {};
    for (let i = 0; i < 7; i++) {
      const dayInWeek = addDays(weekStart, i);
      const dayOfWeek = getDay(dayInWeek);
      const currentDayStr = format(dayInWeek, 'yyyy-MM-dd');

      if (dayOfWeek === 0) continue;

      const existingCode = person.schedule[currentDayStr] || 'D';
      let newCode = code;

      if (code.toUpperCase() === 'P') {
        const parts = existingCode.split('/').filter(c => c && c !== 'D' && c.toUpperCase() !== 'P');
         if (existingCode.includes('P')) {
            newCode = parts.length > 0 ? parts[0] : 'D';
        } else {
            newCode = parts.length > 0 ? `${parts[0]}/P` : 'D/P';
        }
      } else {
        newCode = code;
      }
      
      const allowedSaturdayCodes = ['MS', 'TD'];
      if (dayOfWeek === 6 && !allowedSaturdayCodes.some(c => newCode.toUpperCase().includes(c))) {
        continue;
      }
      updates[currentDayStr] = newCode;
    }

    onUpdateSchedule(personId, updates, true);
    setPopover(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20 border-b">
                  Empleado
                </th>
                {daysInMonth.map(({ date, dayOfMonth, dayOfWeek, isSaturday, isSunday }) => (
                  <th key={dayOfMonth} scope="col" className={`w-28 text-center text-xs font-medium uppercase tracking-wider border-b border-l ${isSunday ? 'bg-red-100 text-red-700' : ''} ${isSaturday ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}>
                    <div className="flex flex-col items-center justify-center py-2">
                        <span>{dayOfWeek}</span>
                        <span className="text-lg font-semibold cursor-pointer hover:text-indigo-600" onClick={() => onShowWeek(date)}>{dayOfMonth}</span>
                        {isSaturday && (
                            <div className="flex space-x-1 mt-2">
                                <button onClick={() => handleSuggest(date)} title="Sugerir" className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs flex items-center justify-center font-bold">S</button>
                                <button onClick={() => handleAssign(date)} title="Asignar" className="w-6 h-6 rounded-full bg-green-100 text-green-600 hover:bg-green-200 text-xs flex items-center justify-center font-bold">A</button>
                                <button onClick={() => handleDiagnose(date)} title="Diagnóstico" className="w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 text-xs flex items-center justify-center font-bold">D</button>
                            </div>
                        )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {scheduleData.map(person => (
                <tr key={person.id} className={`border-b h-14 ${suggestion?.id === person.id ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}>
                  <td className="whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10 border-r">
                     <div className="flex flex-col justify-center h-full px-4">
                        <div>{person.name}</div>
                        <div className="text-xs text-gray-500">{person.role}</div>
                     </div>
                  </td>
                  {daysInMonth.map(({ date, dayOfMonth, isSunday, isSaturday }) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const code = person.schedule[dateStr]?.toUpperCase() || 'D';
                    const isWeekend = isSaturday || isSunday;
                    const isDayOff = code === 'D';
                    const codes = code.split('/').filter(Boolean);
                    const hasSplitView = codes.length > 1;

                    let tdClassName = `text-center text-sm font-bold text-black transition-all duration-200 border-l`;

                    if (!hasSplitView) {
                       tdClassName += ` ${getCodeColor(code)}`;
                    } else {
                       tdClassName += ` p-0 ${isSunday ? 'bg-red-50' : 'bg-white'}`;
                    }

                    return (
                      <td 
                        key={`${person.id}-${dayOfMonth}`} 
                        className={tdClassName}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, person.id, dateStr)}
                      >
                         {hasSplitView ? (
                           <div className="flex w-full h-full">
                             <div className={`w-1/2 h-full flex items-center justify-center ${getCodeColor(codes[0])}`}>{codes[0] === 'D' ? '' : codes[0]}</div>
                             <div className={`w-1/2 h-full flex items-center justify-center ${getCodeColor(codes[1])}`}>{codes[1]}</div>
                           </div>
                         ) : (
                           <div className="w-full h-full flex items-center justify-center">
                             {isWeekend && isDayOff ? '✨' : (code === 'D' ? '' : code)}
                           </div>
                         )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {popover && (
        <AssignmentChoicePopover
          top={popover.top}
          left={popover.left}
          onAssignDay={handleAssignDay}
          onAssignWeek={handleAssignWeek}
          onClose={() => setPopover(null)}
        />
      )}
      {diagnosticData && <DiagnosticModal results={diagnosticData} onClose={() => setDiagnosticData(null)} />}
    </>
  );
};