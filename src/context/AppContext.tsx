import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Client, WorkEntry, AppSettings } from '../types';
import { storage } from '../utils/storage';

interface AppContextType {
  clients: Client[];
  entries: WorkEntry[];
  settings: AppSettings;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addEntry: (entry: Omit<WorkEntry, 'id' | 'createdAt'>) => WorkEntry;
  updateEntry: (entry: WorkEntry) => void;
  deleteEntry: (id: string) => void;
  updateSettings: (settings: AppSettings) => void;
}

const AppContext = createContext<AppContextType | null>(null);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(() => storage.getClients());
  const [entries, setEntries] = useState<WorkEntry[]>(() => storage.getEntries());
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());

  useEffect(() => { storage.setClients(clients); }, [clients]);
  useEffect(() => { storage.setEntries(entries); }, [entries]);
  useEffect(() => { storage.setSettings(settings); }, [settings]);

  const addClient = useCallback((data: Omit<Client, 'id' | 'createdAt'>): Client => {
    const client: Client = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setClients((prev) => [...prev, client]);
    return client;
  }, []);

  const updateClient = useCallback((client: Client) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addEntry = useCallback((data: Omit<WorkEntry, 'id' | 'createdAt'>): WorkEntry => {
    const entry: WorkEntry = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    setEntries((prev) => [...prev, entry]);
    return entry;
  }, []);

  const updateEntry = useCallback((entry: WorkEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const updateSettings = useCallback((s: AppSettings) => {
    setSettings(s);
  }, []);

  return (
    <AppContext.Provider
      value={{
        clients,
        entries,
        settings,
        addClient,
        updateClient,
        deleteClient,
        addEntry,
        updateEntry,
        deleteEntry,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
