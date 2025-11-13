
import React, { useState, useMemo } from 'react';
import { ScheduleCalendar } from './components/ScheduleCalendar';
import { Legend } from './components/Legend';
import { initialTeamMembers, LEGEND_DATA, generalHolidays, CONFIG } from './constants';
import type { Person, TeamMember } from './types';
import { subMonths, addMonths, getDaysInMonth, format, getDay, startOfWeek, addDays, differenceInDays, isAfter, startOfToday } from 'date-fns';
import { WeekView } from './components/WeekView';
import { TeamManager } from './components/TeamManager';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduleOverrides, setScheduleOverrides] = useState<Record<string, Record<string, string>>>({});
  const [selectedWeek, setSelectedWeek] = useState<Date | null>(null);
  const [team, setTeam] = useState<TeamMember[]>(initialTeamMembers);
  const [isTeamManagerOpen, setIsTeamManagerOpen] = useState(false);

  const handleUpdateSchedule = (personId: string, updates: Record<string, string>) => {
    setScheduleOverrides(prev => {
      const newPersonOverrides = { ...(prev[personId] || {}), ...updates };
      return { ...prev, [personId]: newPersonOverrides };
    });
  };

  const handleAddMember = (newMember: Omit<TeamMember, 'id'>) => {
    const newId = `p${Date.now()}`;
    setTeam(prev => [...prev, { ...newMember, id: newId }]);
  };

  const handleRemoveMember = (personId: string) => {
    setTeam(prev => prev.filter(p => p.id !== personId));
    setScheduleOverrides(prev => {
        const newOverrides = {...prev};
        delete newOverrides[personId];
        return newOverrides;
    });
  };

  const handleReactivateMember = (personId: string, newShift: 'M' | 'T' | 'JF') => {
    setTeam(prev => prev.map(p => p.id === personId ? { ...p, defaultShift: newShift } : p));
    
    // Clear future 'B' overrides for this person so the new default shift can apply
    setScheduleOverrides(prev => {
        const newOverrides = { ...prev };
        const personOverrides = { ...(newOverrides[personId] || {}) };
        const today = startOfToday();

        Object.keys(personOverrides).forEach(dateStr => {
            const date = new Date(dateStr);
            if (isAfter(date, today) && personOverrides[dateStr] === 'B') {
                delete personOverrides[dateStr];
            }
        });

        newOverrides[personId] = personOverrides;
        return newOverrides;
    });
    
    setIsTeamManagerOpen(false);
  };

  const goToPreviousMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  const monthName = useMemo(() => currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' }), [currentDate]);

  const eligibleForRotation = useMemo(() => team
    .filter(p => p.role.toUpperCase() !== CONFIG.ROL_EXCLUIR && p.defaultShift !== 'B')
    .sort((a, b) => a.id.localeCompare(b.id)), [team]);

  const processedScheduleData: Person[] = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = getDaysInMonth(currentDate);

    // 1. Generate base schedule from default shifts
    let baseData: Person[] = team.map(person => {
      const schedule: Record<string, string> = {};
      for (let day = 1; day <= numDays; day++) {
        const date = new Date(year, month, day);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayOfWeek = getDay(date);

        if (person.defaultShift === 'B') {
            schedule[dateStr] = 'B';
        } else if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          schedule[dateStr] = person.defaultShift;
        } else {
          schedule[dateStr] = 'D';
        }
      }
      return { ...person, schedule };
    });
    
    // 2. Auto assign Saturdays (Round Robin)
    const rotationStartDate = new Date('2024-01-01');
    let firstSaturdayAfterStart = new Date(rotationStartDate);
    while (getDay(firstSaturdayAfterStart) !== 6) {
        firstSaturdayAfterStart = addDays(firstSaturdayAfterStart, 1);
    }
    
    if (eligibleForRotation.length > 0) {
        for (let day = 1; day <= numDays; day++) {
            const date = new Date(year, month, day);
            if (getDay(date) === 6) {
                const dateStr = format(date, 'yyyy-MM-dd');
                
                const daysSinceFirstSaturday = differenceInDays(date, firstSaturdayAfterStart);
                if (daysSinceFirstSaturday < 0) continue;

                const saturdayIndex = Math.floor(daysSinceFirstSaturday / 7);
                const assignedPersonIndex = saturdayIndex % eligibleForRotation.length;
                const assignedPerson = eligibleForRotation[assignedPersonIndex];
                
                const personToUpdate = baseData.find(p => p.id === assignedPerson.id);
                if (personToUpdate) {
                    if (personToUpdate.schedule[dateStr] === 'D') {
                        personToUpdate.schedule[dateStr] = CONFIG.CODIGO_ASIGNAR;
                    }
                }
            }
        }
    }
    
    // 3. Apply general holidays (overwrites auto-assignment)
    for (let day = 1; day <= numDays; day++) {
      const date = new Date(year, month, day);
      const dateStr = format(date, 'yyyy-MM-dd');
      const holidayType = generalHolidays[dateStr];

      if (holidayType) {
        baseData.forEach((person: Person) => {
          if (person.defaultShift === 'B') return; // Skip if on leave
          if (holidayType === 'FN' || holidayType === 'FA') {
            person.schedule[dateStr] = holidayType;
          } else if (holidayType === 'FL') {
            const currentCode = person.schedule[dateStr]?.split('/')[0].toUpperCase();
            if (currentCode !== 'M' && currentCode !== 'T') {
              person.schedule[dateStr] = holidayType;
            }
          }
        });
      }
    }

    // 4. Apply manual overrides (highest priority)
    baseData.forEach(person => {
        const personOverrides = scheduleOverrides[person.id];
        if (personOverrides) {
            person.schedule = { ...person.schedule, ...personOverrides };
        }
    });

    return baseData;
  }, [currentDate, scheduleOverrides, eligibleForRotation, team]);

  const sortedAndProcessedData = useMemo(() => {
    const shiftOrder: Record<string, number> = { 'M': 1, 'T': 2, 'B': 3, 'JF': 4 };
    return [...processedScheduleData].sort((a, b) => {
      const orderA = shiftOrder[a.defaultShift] || 99;
      const orderB = shiftOrder[b.defaultShift] || 99;
      return orderA !== orderB ? orderA - orderB : a.name.localeCompare(b.name);
    });
  }, [processedScheduleData]);
  
  const handleShowWeek = (date: Date) => {
    setSelectedWeek(startOfWeek(date, { weekStartsOn: 1 }));
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Planificador de Turnos
            </h1>
            <p className="text-gray-600 mt-1">
              Gestión de turnos, permisos y asignación automática de sábados.
            </p>
          </div>
        </header>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b gap-2">
              <button
                onClick={goToPreviousMonth}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                &larr; Anterior
              </button>
              <h2 className="text-xl font-semibold capitalize text-center">{monthName}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsTeamManagerOpen(true)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                  Gestionar Equipo
                </button>
                <button
                  onClick={goToNextMonth}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Siguiente &rarr;
                </button>
              </div>
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
      {isTeamManagerOpen && (
        <TeamManager
            teamMembers={team}
            onClose={() => setIsTeamManagerOpen(false)}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onReactivateMember={handleReactivateMember}
        />
      )}
    </>
  );
};

export default App;