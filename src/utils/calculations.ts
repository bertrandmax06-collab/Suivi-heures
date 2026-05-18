import { WorkEntry, MonthSummary, ClientSummary, Client } from '../types';

export function calculateHours(
  startTime: string,
  endTime: string,
  breakMinutes: number
): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  const worked = endTotal - startTotal - breakMinutes;
  return Math.max(0, worked / 60);
}

export function calculateRevenue(hours: number, hourlyRate: number): number {
  return Math.round(hours * hourlyRate * 100) / 100;
}

export function getMonthSummary(
  entries: WorkEntry[],
  clients: Client[],
  year: number,
  month: number
): MonthSummary {
  const monthEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const byClientMap = new Map<string, ClientSummary>();

  for (const entry of monthEntries) {
    const hours = calculateHours(entry.startTime, entry.endTime, entry.breakMinutes);
    const revenue = calculateRevenue(hours, entry.hourlyRate);
    const client = clients.find((c) => c.id === entry.clientId);
    const clientName = client?.name ?? 'Client inconnu';
    const color = client?.color ?? '#6366f1';

    const existing = byClientMap.get(entry.clientId);
    if (existing) {
      existing.totalHours += hours;
      existing.totalRevenue += revenue;
    } else {
      byClientMap.set(entry.clientId, {
        clientId: entry.clientId,
        clientName,
        color,
        totalHours: hours,
        totalRevenue: revenue,
      });
    }
  }

  const byClient = Array.from(byClientMap.values()).map((c) => ({
    ...c,
    totalHours: Math.round(c.totalHours * 100) / 100,
    totalRevenue: Math.round(c.totalRevenue * 100) / 100,
  }));

  const totalHours = byClient.reduce((s, c) => s + c.totalHours, 0);
  const totalRevenue = byClient.reduce((s, c) => s + c.totalRevenue, 0);

  return {
    year,
    month,
    totalHours: Math.round(totalHours * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    byClient,
  };
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, '0')}`;
}

export function formatCurrency(amount: number, currency = '€'): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ' ' + currency;
}

export function getEntriesForDate(entries: WorkEntry[], date: string): WorkEntry[] {
  return entries.filter((e) => e.date === date);
}
