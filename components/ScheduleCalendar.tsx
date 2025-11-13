import React, { useState, useMemo } from 'react';
import { getDaysInMonth, startOfMonth, getDay, format, startOfWeek, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Person, DiagnosticResult } from '../types';
import { LEGEND_DATA, CONFIG } from '../constants';
import { findBestCandidate, runDiagnostics } from '../services/scheduleLogic';
import { DiagnosticModal } from './DiagnosticModal';
import { AssignmentChoicePopover } from './AssignmentChoicePopover';

interface ScheduleCalendarProps {
  scheduleData: Person[];
  currentDate: Date;
  onUpdateSchedule: (personId: string, updates: Record<string, string>) => void;
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
  return item ? item.color : 'bg-white';
};

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ scheduleData, currentDate, onUpdateSchedule, onShowWeek }) => {
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
    if (dayOfWeek === 0) return; // No se puede asignar en Domingo

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
    
    const dayOfWeek = getDay(new Date(dateStr));
    const allowedSaturdayCodes = ['MS', 'TD'];
    if (dayOfWeek === 6 && !allowedSaturdayCodes.includes(code.toUpperCase())) {
        alert("En sábado solo se pueden asignar los turnos 'MS' o 'TD'.");
    } else {
        onUpdateSchedule(personId, { [dateStr]: code });
    }
    setPopover(null);
  };

  const handleAssignWeek = () => {
    if (!popover) return;
    const { personId, dateStr, code } = popover;

    const weekStart = startOfWeek(new Date(dateStr), { weekStartsOn: 1 }); // Lunes
    const updates: Record<string, string> = {};
    const allowedSaturdayCodes = ['MS', 'TD'];

    for (let i = 0; i < 7; i++) {
      const dayInWeek = addDays(weekStart, i);
      const dayOfWeek = getDay(dayInWeek);

      if (dayOfWeek === 0) continue; // Saltar Domingos
      if (dayOfWeek === 6 && !allowedSaturdayCodes.includes(code.toUpperCase())) continue; // Sábados solo aceptan MS o TD

      updates[format(dayInWeek, 'yyyy-MM-dd')] = code;
    }
    onUpdateSchedule(personId, updates);
    setPopover(null);
  };


  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-20">
                  Empleado
                </th>
                {daysInMonth.map(({ date, dayOfMonth, dayOfWeek, isSaturday, isSunday }) => (
                  <th key={dayOfMonth} scope="col" className={`w-28 text-center text-xs font-medium uppercase tracking-wider ${isSunday ? 'bg-red-100 text-red-700' : ''} ${isSaturday ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500'}`}>
                    <div className="flex flex-col items-center justify-center py-2">
                        <span>{dayOfWeek}</span>
                        <span className="text-lg font-semibold cursor-pointer hover:text-indigo-600" onClick={() => onShowWeek(date)}>{dayOfMonth}</span>
                        {isSaturday && (
                            <div className="flex space-x-1 mt-2">
                                <button onClick={() => handleSuggest(date)} title="Sugerir" className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 text-xs">S</button>
                                <button onClick={() => handleAssign(date)} title="Asignar" className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 text-xs">A</button>
                                <button onClick={() => handleDiagnose(date)} title="Diagnóstico" className="p-1 rounded-full bg-yellow-100 text-yellow-600 hover:bg-yellow-200 text-xs">D</button>
                            </div>
                        )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scheduleData.map(person => (
                <tr key={person.id} className={`${suggestion?.id === person.id ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}`}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                    <div>{person.name}</div>
                    <div className="text-xs text-gray-500">{person.role}</div>
                  </td>
                  {daysInMonth.map(({ date, dayOfMonth, isSunday, isSaturday }) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const code = person.schedule[dateStr]?.toUpperCase() || '';
                    const isWeekend = isSaturday || isSunday;
                    const isDayOff = code === '' || code === 'D';

                    return (
                      <td 
                        key={`${person.id}-${dayOfMonth}`} 
                        className={`px-2 py-2 text-center text-sm font-bold text-black transition-all duration-200 ${getCodeColor(code)} ${isSunday ? 'bg-red-50' : ''}`}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, person.id, dateStr)}
                      >
                        {isWeekend && isDayOff ? '✨' : code}
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