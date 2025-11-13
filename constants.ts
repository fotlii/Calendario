
import type { Person, LegendItem } from './types';

// Configuration based on VBA macro
export const CONFIG = {
  VACACIONES: ['V', 'VA'],
  COD_NO_TRABAJA_SABADO: ['FN', 'FA'],
  BAJA: ['B'],
  FORMACION: ['F', 'MF', 'TF'],
  PASSTHROUGH: ['FA', 'FN'],
  COD_TRABAJO_SABADO: ['MS'],
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
    { code: 'MS', description: 'ENTRESEMANA CON SÁBADO', color: 'bg-teal-400 text-white' },
    { code: 'FN', description: 'FESTIVO NACIONAL', color: 'bg-orange-300' },
    { code: 'FL', description: 'FESTIVO LOCAL', color: 'bg-orange-200' },
    { code: 'T', description: 'TARDE', color: 'bg-indigo-200' },
    { code: 'TD', description: 'TARDE CON SABADOS', color: 'bg-indigo-300' },
    { code: 'F', description: 'FORMACIÓN', color: 'bg-pink-200' },
    { code: 'TC', description: 'Torn de contingència', color: 'bg-cyan-200' },
    { code: 'TDE', description: 'Horari torn tarda', color: 'bg-lime-200' },
    { code: 'FA', description: 'FESTIVO AUTONÓMICO', color: 'bg-orange-400' },
];


export const mockScheduleData: Person[] = [
  {
    id: 'p1',
    name: 'Ana García',
    role: 'Agent',
    schedule: {
      '2024-07-01': 'JF', '2024-07-02': 'JF', '2024-07-03': 'JF', '2024-07-04': 'JF', '2024-07-05': 'JF', '2024-07-06': '', 
      '2024-07-13': 'MS', 
      '2024-08-01': 'JF', '2024-08-02': 'JF', '2024-08-03': '',
      '2024-08-08': 'V', '2024-08-09': 'V', '2024-08-10': '',
      '2024-08-15': 'FN', '2024-08-16': 'JF', '2024-08-17': '',
      '2024-08-23': 'B', '2024-08-24': '',
      '2024-08-30': 'JF', '2024-08-31': '',
    },
  },
  {
    id: 'p2',
    name: 'Carlos Perez',
    role: 'Agent',
    schedule: {
      '2024-07-06': 'MS',
      '2024-08-01': 'T', '2024-08-02': 'T', '2024-08-03': '',
      '2024-08-09': 'F', '2024-08-10': '',
      '2024-08-16': 'P', '2024-08-17': '',
      '2024-08-23': 'JF', '2024-08-24': '',
      '2024-08-30': 'JF', '2024-08-31': '',
    },
  },
  {
    id: 'p3',
    name: 'Laura Martinez',
    role: 'COOR',
    schedule: {
      '2024-08-01': 'M', '2024-08-02': 'M', '2024-08-03': '',
      '2024-08-09': 'M', '2024-08-10': '',
      '2024-08-16': 'M', '2024-08-17': '',
      '2024-08-23': 'M', '2024-08-24': '',
      '2024-08-30': 'M', '2024-08-31': '',
    },
  },
  {
    id: 'p4',
    name: 'David Sanchez',
    role: 'Agent',
    schedule: {
      '2024-06-29': 'MS',
      '2024-08-01': 'JF', '2024-08-02': 'FA', '2024-08-03': '',
      '2024-08-09': 'JF', '2024-08-10': '',
      '2024-08-16': 'JF', '2024-08-17': '',
      '2024-08-23': 'JF', '2024-08-24': '',
      '2024-08-30': 'JF', '2024-08-31': '',
    },
  },
  {
    id: 'p5',
    name: 'Sofia Reyes',
    role: 'Agent',
    schedule: {
      // Never worked a saturday
      '2024-08-01': 'T', '2024-08-02': 'T', '2024-08-03': '',
      '2024-08-09': 'T', '2024-08-10': '',
      '2024-08-16': 'T', '2024-08-17': '',
      '2024-08-23': 'T', '2024-08-24': '',
      '2024-08-30': 'V', '2024-08-31': '',
    },
  },
];
