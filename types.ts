
export interface Person {
  id: string;
  name: string;
  role: string;
  defaultShift: 'M' | 'T' | 'B' | 'JF';
  schedule: Record<string, string>; // key: 'YYYY-MM-DD', value: code
}

export type TeamMember = Omit<Person, 'schedule'>;

export interface LegendItem {
  code: string;
  description: string;
  color: string;
}

export interface DiagnosticResult {
    name: string;
    eligible: boolean;
    reason: string;
    score: number;
    lastWorkedInfo: string;
}