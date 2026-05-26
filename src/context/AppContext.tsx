import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Client, WorkEntry, AppSettings } from '../types'
import * as db from '../lib/db'

interface AppContextType {
  clients: Client[]
  entries: WorkEntry[]
  settings: AppSettings
  loading: boolean
  error: string | null
  addClient: (data: Omit<Client, 'id' | 'createdAt'>) => Promise<Client>
  updateClient: (client: Client) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  addEntry: (data: Omit<WorkEntry, 'id' | 'createdAt'>) => Promise<WorkEntry>
  updateEntry: (entry: WorkEntry) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  updateSettings: (settings: AppSettings) => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

const DEFAULT_SETTINGS: AppSettings = { defaultHourlyRate: 35, currency: '€' }

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [entries, setEntries] = useState<WorkEntry[]>([])
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [c, e, s] = await Promise.all([
          db.fetchClients(),
          db.fetchEntries(),
          db.fetchSettings(),
        ])
        setClients(c)
        setEntries(e)
        setSettings(s)
      } catch (err) {
        console.error(err)
        setError('Impossible de charger les données. Vérifiez votre connexion.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const addClient = useCallback(async (data: Omit<Client, 'id' | 'createdAt'>): Promise<Client> => {
    const client: Client = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    setClients((prev) => [...prev, client])
    await db.insertClient(client)
    return client
  }, [])

  const updateClient = useCallback(async (client: Client): Promise<void> => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)))
    await db.updateClient(client)
  }, [])

  const deleteClient = useCallback(async (id: string): Promise<void> => {
    setClients((prev) => prev.filter((c) => c.id !== id))
    await db.deleteClient(id)
  }, [])

  const addEntry = useCallback(async (data: Omit<WorkEntry, 'id' | 'createdAt'>): Promise<WorkEntry> => {
    const entry: WorkEntry = { ...data, id: generateId(), createdAt: new Date().toISOString() }
    setEntries((prev) => [...prev, entry])
    await db.insertEntry(entry)
    return entry
  }, [])

  const updateEntry = useCallback(async (entry: WorkEntry): Promise<void> => {
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)))
    await db.updateEntry(entry)
  }, [])

  const deleteEntry = useCallback(async (id: string): Promise<void> => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    await db.deleteEntry(id)
  }, [])

  const updateSettings = useCallback(async (s: AppSettings): Promise<void> => {
    setSettings(s)
    await db.saveSettings(s)
  }, [])

  return (
    <AppContext.Provider
      value={{
        clients, entries, settings, loading, error,
        addClient, updateClient, deleteClient,
        addEntry, updateEntry, deleteEntry,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
