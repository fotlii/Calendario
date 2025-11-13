import type { Person, LegendItem } from './types';

// Configuration based on VBA macro
export const CONFIG = {
  VACACIONES: ['V', 'VA'],
  COD_NO_TRABAJA_SABADO: ['FN', 'FA'],
  BAJA: ['B'],
  FORMACION: ['F', 'MF', 'TF'],
  PASSTHROUGH: ['FA', 'FN'],
  COD_TRABAJO_SABADO: ['MS', 'TD'],
  ROL_EXCLUIR: 'COOR',
  CODIGO_ASIGNAR: 'MS',
};

export const LEGEND_DATA: LegendItem[] = [
    { code: 'D', description: 'DESCANSO', color: 'bg-gray-200' },
    { code: 'V', description: 'VACACIONES PEDIDAS', color: 'bg-blue-200' },
    { code: 'P', description: 'PERMISO', color: 'bg-purple-200' },
    { code: 'B', description: 'BAJA (09:00-21:00)', color: 'bg-red-300' },
    { code: 'JF', description: 'JORNADA FLEXIBLE', color: 'bg-green-200' },
    { code: 'M', description: 'MAÑANA COMPLETA', color: 'bg-yellow-200' },
    { code: 'MP', description: '7H Matí', color: 'bg-yellow-300' },
    { code: 'MS', description: 'ENTRESEMANA CON SÁBADO', color: 'bg-teal-200' },
    { code: 'FN', description: 'FESTIVO NACIONAL', color: 'bg-orange-300' },
    { code: 'FL', description: 'FESTIVO LOCAL', color: 'bg-orange-200' },
    { code: 'T', description: 'TARDE', color: 'bg-indigo-200' },
    { code: 'TD', description: 'TARDE CON SABADOS', color: 'bg-indigo-300' },
    { code: 'F', description: 'FORMACIÓN', color: 'bg-pink-200' },
    { code: 'TC', description: 'Torn de contingència', color: 'bg-cyan-200' },
    { code: 'TDE', description: 'Horari torn tarda', color: 'bg-lime-200' },
    { code: 'FA', description: 'FESTIVO AUTONÓMICO', color: 'bg-orange-300' },
];

export const generalHolidays: Record<string, string> = {
    // Example for current year, should be dynamic in a real app
    [`${new Date().getFullYear()}-08-15`]: 'FN',
    [`${new Date().getFullYear()}-08-09`]: 'FL', 
    [`${new Date().getFullYear()}-10-12`]: 'FN',
    [`${new Date().getFullYear()}-11-01`]: 'FN',
    [`${new Date().getFullYear()}-12-06`]: 'FN',
    [`${new Date().getFullYear()}-12-25`]: 'FN',
};

type TeamMember = Omit<Person, 'schedule'>;

export const teamMembers: TeamMember[] = [
  { id: 'p1', name: 'SÁNCHEZ MARÍA', role: 'Agent', defaultShift: 'M' },
  { id: 'p2', name: 'MARINA JIMENEZ', role: 'Agent', defaultShift: 'T' },
  { id: 'p3', name: 'CARLOS BUENO', role: 'Agent', defaultShift: 'M' },
  { id: 'p4', name: 'ESTELLER GEMMA', role: 'Agent', defaultShift: 'M' },
  { id: 'p5', name: 'BAILÓN SONIA', role: 'Agent', defaultShift: 'B' },
  { id: 'p6', name: 'DOUTON DAVID', role: 'Agent', defaultShift: 'T' },
  { id: 'p7', name: 'OSUNA ALFONSO', role: 'Agent', defaultShift: 'M' },
  { id: 'p8', name: 'GALAN ADRIAN', role: 'Agent', defaultShift: 'T' },
  { id: 'p9', name: 'GARGALLO MARÇAL', role: 'COOR', defaultShift: 'JF' },
  { id: 'p10', name: 'MARTÍN VÍCTOR', role: 'COOR', defaultShift: 'JF' },
];