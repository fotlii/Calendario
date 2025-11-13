import React, { useMemo } from 'react';
import type { Person } from '../types';
// FIX: Changed date-fns deep imports from default to named to fix "not callable" errors. This is likely due to an upgrade to date-fns v3.
import { addDays } from 'date-fns/addDays';
import { format } from 'date-fns/format';
// FIX: Changed locale import to a named import for date-fns v3 compatibility.
import { es } from 'date-fns/locale/es';
import { LEGEND_DATA } from '../constants';

interface WeekViewProps {
  weekDate: Date; // The start of the week (Monday)
  scheduleData: Person[];
  onClose: () => void;
}

const getCodeColor = (code: string): string => {
    const item = LEGEND_DATA.find(i => i.code.toUpperCase() === code.toUpperCase());
    return item ? item.color : 'bg-gray-200';
};

export const WeekView: React.FC<WeekViewProps> = ({ weekDate, scheduleData, onClose }) => {
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(weekDate, i);
      return {
        date,
        dateStr: format(date, 'yyyy-MM-dd'),
        dayName: format(date, 'eeee', { locale: es }),
        dayOfMonth: format(date, 'd'),
      };
    });
  }, [weekDate]);

  const weekTitle = `Semana del ${format(weekDate, 'd \'de\' MMMM', { locale: es })}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{weekTitle}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl font-light leading-none">&times;</button>
        </div>
        <div className="overflow-auto p-2 sm:p-4">
          <table className="min-w-full divide-y divide-gray-200 border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-1/4">
                  Empleado
                </th>
                {weekDays.map(day => (
                  <th key={day.dateStr} className="px-3 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <span className="capitalize">{day.dayName}</span>
                    <span className="block text-lg font-semibold">{day.dayOfMonth}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scheduleData.map(person => (
                <tr key={person.id} className="h-14">
                  <td className="whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                     <div className="flex items-center h-full px-3">
                        {person.name}
                     </div>
                  </td>
                  {weekDays.map(day => {
                    const code = person.schedule[day.dateStr]?.toUpperCase() || 'D';
                    const codes = code.split('/').filter(Boolean);
                    const hasSplitView = codes.length > 1;

                    let tdClassName = `text-center text-sm font-bold text-black border-l`;

                    if (!hasSplitView) {
                       tdClassName += ` ${getCodeColor(code)}`;
                    } else {
                       tdClassName += ' p-0';
                    }

                    return (
                        <td key={day.dateStr} className={tdClassName}>
                           {hasSplitView ? (
                               <div className="flex w-full h-full">
                                   <div className={`w-1/2 h-full flex items-center justify-center ${getCodeColor(codes[0])}`}>{codes[0] === 'D' ? '' : codes[0]}</div>
                                   <div className={`w-1/2 h-full flex items-center justify-center ${getCodeColor(codes[1])}`}>{codes[1]}</div>
                               </div>
                           ) : (
                               <div className="w-full h-full flex items-center justify-center">
                                   {code === 'D' ? '' : code}
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
         <div className="p-4 border-t bg-gray-50 text-right">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};