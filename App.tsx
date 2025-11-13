
import React, { useState, useMemo } from 'react';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { Legend } from './components/Legend';
import { mockScheduleData, LEGEND_DATA } from './constants';
import type { Person } from './types';
import { subMonths, addMonths } from 'date-fns';

const App: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<Person[]>(mockScheduleData);
  const [currentDate, setCurrentDate] = useState(new Date(2024, 7, 1)); // August 2024

  const handleUpdateSchedule = (personId: string, date: string, code: string) => {
    setScheduleData(prevData =>
      prevData.map(person => {
        if (person.id === personId) {
          return {
            ...person,
            schedule: {
              ...person.schedule,
              [date]: code,
            },
          };
        }
        return person;
      })
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const monthName = useMemo(() => currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }), [currentDate]);

  return (
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
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
                    scheduleData={scheduleData}
                    currentDate={currentDate}
                    onUpdateSchedule={handleUpdateSchedule}
                />
            </div>
          </div>
          <aside className="lg:col-span-1">
            <Legend legendData={LEGEND_DATA} />
          </aside>
        </div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Scheduler App. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
