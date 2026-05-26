import { supabase } from './supabase'
import { Client, WorkEntry, AppSettings } from '../types'

// --- Row types (snake_case from PostgreSQL) ---

interface DbClient {
  id: string
  name: string
  color: string
  hourly_rate: number | null
  notes: string | null
  created_at: string
}

interface DbEntry {
  id: string
  date: string
  client_id: string
  start_time: string
  end_time: string
  break_minutes: number
  hourly_rate: number
  notes: string | null
  created_at: string
}

interface DbSettings {
  id: number
  default_hourly_rate: number
  currency: string
  user_name: string | null
}

// --- Mappers ---

function toClient(r: DbClient): Client {
  return {
    id: r.id,
    name: r.name,
    color: r.color,
    hourlyRate: r.hourly_rate ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  }
}

function toEntry(r: DbEntry): WorkEntry {
  return {
    id: r.id,
    date: r.date,
    clientId: r.client_id,
    startTime: r.start_time,
    endTime: r.end_time,
    breakMinutes: r.break_minutes,
    hourlyRate: r.hourly_rate,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  }
}

function toSettings(r: DbSettings): AppSettings {
  return {
    defaultHourlyRate: r.default_hourly_rate,
    currency: r.currency,
    userName: r.user_name ?? undefined,
  }
}

// --- Clients ---

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as DbClient[]).map(toClient)
}

export async function insertClient(client: Client): Promise<void> {
  const { error } = await supabase.from('clients').insert({
    id: client.id,
    name: client.name,
    color: client.color,
    hourly_rate: client.hourlyRate ?? null,
    notes: client.notes ?? null,
    created_at: client.createdAt,
  })
  if (error) throw error
}

export async function updateClient(client: Client): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .update({
      name: client.name,
      color: client.color,
      hourly_rate: client.hourlyRate ?? null,
      notes: client.notes ?? null,
    })
    .eq('id', client.id)
  if (error) throw error
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) throw error
}

// --- Work entries ---

export async function fetchEntries(): Promise<WorkEntry[]> {
  const { data, error } = await supabase
    .from('work_entries')
    .select('*')
    .order('date', { ascending: true })
  if (error) throw error
  return (data as DbEntry[]).map(toEntry)
}

export async function insertEntry(entry: WorkEntry): Promise<void> {
  const { error } = await supabase.from('work_entries').insert({
    id: entry.id,
    date: entry.date,
    client_id: entry.clientId,
    start_time: entry.startTime,
    end_time: entry.endTime,
    break_minutes: entry.breakMinutes,
    hourly_rate: entry.hourlyRate,
    notes: entry.notes ?? null,
    created_at: entry.createdAt,
  })
  if (error) throw error
}

export async function updateEntry(entry: WorkEntry): Promise<void> {
  const { error } = await supabase
    .from('work_entries')
    .update({
      date: entry.date,
      client_id: entry.clientId,
      start_time: entry.startTime,
      end_time: entry.endTime,
      break_minutes: entry.breakMinutes,
      hourly_rate: entry.hourlyRate,
      notes: entry.notes ?? null,
    })
    .eq('id', entry.id)
  if (error) throw error
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from('work_entries').delete().eq('id', id)
  if (error) throw error
}

// --- Settings ---

export async function fetchSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle()
  if (error) throw error
  if (!data) return { defaultHourlyRate: 35, currency: '€' }
  return toSettings(data as DbSettings)
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({
      id: 1,
      default_hourly_rate: settings.defaultHourlyRate,
      currency: settings.currency,
      user_name: settings.userName ?? null,
    })
    .eq('id', 1)
  if (error) throw error
}

// --- Bulk operations (import / reset) ---

export async function importAllData(data: {
  clients: Client[]
  entries: WorkEntry[]
  settings?: AppSettings
}): Promise<void> {
  if (data.clients.length > 0) {
    const { error } = await supabase.from('clients').upsert(
      data.clients.map((c) => ({
        id: c.id,
        name: c.name,
        color: c.color,
        hourly_rate: c.hourlyRate ?? null,
        notes: c.notes ?? null,
        created_at: c.createdAt,
      }))
    )
    if (error) throw error
  }
  if (data.entries.length > 0) {
    const { error } = await supabase.from('work_entries').upsert(
      data.entries.map((e) => ({
        id: e.id,
        date: e.date,
        client_id: e.clientId,
        start_time: e.startTime,
        end_time: e.endTime,
        break_minutes: e.breakMinutes,
        hourly_rate: e.hourlyRate,
        notes: e.notes ?? null,
        created_at: e.createdAt,
      }))
    )
    if (error) throw error
  }
  if (data.settings) {
    await saveSettings(data.settings)
  }
}

export async function resetAllData(): Promise<void> {
  await supabase.from('work_entries').delete().not('id', 'is', null)
  await supabase.from('clients').delete().not('id', 'is', null)
  await supabase.from('settings').upsert({
    id: 1,
    default_hourly_rate: 35,
    currency: '€',
    user_name: null,
  })
}
