import { Client, WorkEntry, AppSettings } from '../types';

const KEYS = {
  clients: 'suivi_clients',
  entries: 'suivi_entries',
  settings: 'suivi_settings',
} as const;

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getClients: (): Client[] => get<Client[]>(KEYS.clients, []),
  setClients: (clients: Client[]) => set(KEYS.clients, clients),

  getEntries: (): WorkEntry[] => get<WorkEntry[]>(KEYS.entries, []),
  setEntries: (entries: WorkEntry[]) => set(KEYS.entries, entries),

  getSettings: (): AppSettings =>
    get<AppSettings>(KEYS.settings, { defaultHourlyRate: 35, currency: '€' }),
  setSettings: (settings: AppSettings) => set(KEYS.settings, settings),
};
