export interface Client {
  id: string;
  name: string;
  color: string;
  hourlyRate?: number;
  notes?: string;
  createdAt: string;
}

export interface WorkEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  clientId: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  breakMinutes: number;
  hourlyRate: number;
  notes?: string;
  createdAt: string;
}

export interface AppSettings {
  defaultHourlyRate: number;
  currency: string;
  userName?: string;
}

export interface MonthSummary {
  year: number;
  month: number;
  totalHours: number;
  totalRevenue: number;
  byClient: ClientSummary[];
}

export interface ClientSummary {
  clientId: string;
  clientName: string;
  color: string;
  totalHours: number;
  totalRevenue: number;
}

export type ViewMode = 'month' | 'week' | 'day';
