
import React, { useState, useMemo } from 'react';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { Legend } from './components/Legend';
import { teamMembers, LEGEND_DATA, generalHolidays } from './constants';
import type { Person } from './types';
import { subMonths, addMonths, getDaysInMonth, format, getDay, startOfWeek } from 'date-fns';
import { WeekView } from './components/WeekView';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleOverrides, setScheduleOverrides] = useState<Record<string, Record<string, string>>>({});
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);

  const handleUpdateSchedule = (personId: string, updates: Record<string, string>) => {
    setScheduleOverrides(prev => {
      const newPersonOverrides = { ...(prev[personId] || {}), ...updates };
      return { ...prev, [personId]: newPersonOverrides };
    });
  };

  const goToPreviousMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  const monthName = useMemo(() => currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }), [currentDate]);

  const processedScheduleData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = getDaysInMonth(currentDate);

    // 1. Generate base schedule from default shifts
    let baseData: Person[] = teamMembers.map(person => {
      const schedule: Record<string, string> = {};
      for (let day = 1; day <= numDays; day++) {
        const date = new Date(year, month, day);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayOfWeek = getDay(date); // 0=Sun, 6=Sat

        if (person.id === 'p5') { // BAILÓN SONIA is always 'B'
          schedule[dateStr] = 'B';
        } else if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          schedule[dateStr] = person.defaultShift;
        }
      }
      return { ...person, schedule };
    });
    
    // 2. Apply overrides
    baseData.forEach(person => {
        const personOverrides = scheduleOverrides[person.id];
        if (personOverrides) {
            person.schedule = { ...person.schedule, ...personOverrides };
        }
    });

    // 3. Apply general holidays
    for (let day = 1; day <= numDays; day++) {
      const date = new Date(year, month, day);
      const dateStr = format(date, 'yyyy-MM-dd');
      const holidayType = generalHolidays[dateStr];

      if (holidayType) {
        baseData.forEach((person: Person) => {
          if (holidayType === 'FN' || holidayType === 'FA') {
            person.schedule[dateStr] = holidayType;
          } else if (holidayType === 'FL') {
            const currentCode = person.schedule[dateStr]?.toUpperCase();
            if (currentCode !== 'M' && currentCode !== 'T') {
              person.schedule[dateStr] = holidayType;
            }
          }
        });
      }
    }
    return baseData;
  }, [currentDate, scheduleOverrides]);

  const sortedAndProcessedData = useMemo(() => {
    const shiftOrder: Record<string, number> = { 'M': 1, 'T': 2, 'B': 3, 'JF': 4 };
    return [...processedScheduleData].sort((a, b) => {
      const orderA = shiftOrder[a.defaultShift] || 99;
      const orderB = shiftOrder[b.defaultShift] || 99;
      return orderA !== orderB ? orderA - orderB : a.name.localeCompare(b.name);
    });
  }, [processedScheduleData]);
  
  const handleShowWeek = (date: Date) => {
    setSelectedWeek(startOfWeek(date, { weekStartsOn: 1 })); // week starts on Monday
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Planificador de Sábados
            </h1>
            <p className="text-gray-600 mt-1">
              Asignación inteligente de turnos de sábado.
            </p>
          </div>
        </header>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <button
                onClick={goToPreviousMonth}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                &larr; Anterior
              </button>
              <h2 className="text-xl font-semibold capitalize">{monthName}</h2>
              <button
                onClick={goToNextMonth}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Siguiente &rarr;
              </button>
            </div>
            <ScheduleCalendar
              scheduleData={sortedAndProcessedData}
              currentDate={currentDate}
              onUpdateSchedule={handleUpdateSchedule}
              onShowWeek={handleShowWeek}
            />
          </div>

          <div className="mt-8">
            <Legend legendData={LEGEND_DATA.filter(item => item.code !== 'D')} />
          </div>
        </main>

        <footer className="text-center py-6 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Scheduler App. All rights reserved.</p>
        </footer>
      </div>
      {selectedWeek && (
        <WeekView 
            weekDate={selectedWeek}
            scheduleData={sortedAndProcessedData}
            onClose={() => setSelectedWeek(null)}
        />
      )}
    </>
  );
};

export default App;
