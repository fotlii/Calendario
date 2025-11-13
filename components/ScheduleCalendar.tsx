
import React, { useState, useMemo } from 'react';
import { getDaysInMonth, startOfMonth, getDay, format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Person, DiagnosticResult } from '../types';
import { LEGEND_DATA, CONFIG } from '../constants';
import { findBestCandidate, runDiagnostics } from '../services/scheduleLogic';
import { DiagnosticModal } from './DiagnosticModal';

interface ScheduleCalendarProps {
  scheduleData: Person[];
  currentDate: Date;
  onUpdateSchedule: (personId: string, date: string, code: string) => void;
}

const getCodeColor = (code: string): string => {
  const item = LEGEND_DATA.find(i => i.code.toUpperCase() === code.toUpperCase());
  return item ? item.color : 'bg-white';
};

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ scheduleData, currentDate, onUpdateSchedule }) => {
  const [suggestion, setSuggestion] = useState<Person | null>(null);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResult[] | null>(null);
  
  const daysInMonth = useMemo(() => {
    const date = startOfMonth(currentDate);
    const numDays = getDaysInMonth(date);
    return Array.from({ length: numDays }, (_, i) => {
      const dayDate = new Date(date.getFullYear(), date.getMonth(), i + 1);
      return {
        date: dayDate,
        dayOfMonth: i + 1,
        dayOfWeek: format(dayDate, 'EEEEE', { locale: es }).toUpperCase(),
        isSaturday: getDay(dayDate) === 6,
        isSunday: getDay(dayDate) === 0,
      };
    });
  }, [currentDate]);

  const handleSuggest = (saturdayDate: Date) => {
    const candidate = findBestCandidate(saturdayDate, scheduleData);
    setSuggestion(candidate);
    setTimeout(() => setSuggestion(null), 5000); // Highlight for 5 seconds
  };

  const handleAssign = (saturdayDate: Date) => {
    const candidate = findBestCandidate(saturdayDate, scheduleData);
    if (candidate) {
      onUpdateSchedule(candidate.id, format(saturdayDate, 'yyyy-MM-dd'), CONFIG.CODIGO_ASIGNAR);
    } else {
      alert("No hay candidatos elegibles para este sábado.");
    }
  };

  const handleDiagnose = (saturdayDate: Date) => {
    const results = runDiagnostics(saturdayDate, scheduleData);
    setDiagnosticData(results);
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
                  <th key={dayOfMonth} scope="col" className={`w-28 text-center text-xs font-medium uppercase tracking-wider ${isSunday ? 'bg-red-100 text-red-700' : 'text-gray-500'} ${isSaturday ? 'bg-indigo-100 text-indigo-700' : ''}`}>
                    <div className="flex flex-col items-center justify-center py-2">
                        <span>{dayOfWeek}</span>
                        <span className="text-lg font-semibold">{dayOfMonth}</span>
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
                  {daysInMonth.map(({ date, dayOfMonth, isSunday }) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const code = person.schedule[dateStr] || '';
                    return (
                      <td key={`${person.id}-${dayOfMonth}`} className={`px-2 py-2 text-center text-sm font-semibold ${getCodeColor(code)} ${isSunday ? 'bg-red-50' : ''}`}>
                        {code}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {diagnosticData && <DiagnosticModal results={diagnosticData} onClose={() => setDiagnosticData(null)} />}
    </>
  );
};
