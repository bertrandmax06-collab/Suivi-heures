import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getMonthSummary, formatHours, formatCurrency } from '../utils/calculations';
import { formatMonthYear, addMonths, subMonths } from '../utils/dateHelpers';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function SynthesePage() {
  const { entries, clients, settings } = useApp();
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const summary = useMemo(
    () => getMonthSummary(entries, clients, year, month),
    [entries, clients, year, month]
  );

  // Entries for this month, grouped by day
  const monthEntries = entries
    .filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const byDay: Record<string, typeof monthEntries> = {};
  for (const e of monthEntries) {
    if (!byDay[e.date]) byDay[e.date] = [];
    byDay[e.date].push(e);
  }

  function prev() { setCurrentDate((d) => subMonths(d, 1)); }
  function next() { setCurrentDate((d) => addMonths(d, 1)); }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Synthèse mensuelle</h1>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-card px-4 py-3">
        <button onClick={prev} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-bold text-gray-900 capitalize">
          {formatMonthYear(year, month)}
        </h2>
        <button onClick={next} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {summary.totalHours === 0 ? (
        <Card>
          <div className="text-center py-8">
            <BarChart3 size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aucune entrée pour ce mois</p>
          </div>
        </Card>
      ) : (
        <>
          {/* Monthly totals */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Totaux du mois
            </h2>
            <div className="space-y-3">
              {summary.byClient
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .map((c) => (
                  <div key={c.clientId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <Badge color={c.color} label={c.clientName} />
                    <div className="text-sm text-right">
                      <span className="font-semibold text-gray-900">{formatHours(c.totalHours)}</span>
                      <span className="text-gray-300 mx-2">—</span>
                      <span className="font-bold" style={{ color: c.color }}>
                        {formatCurrency(c.totalRevenue, settings.currency)}
                      </span>
                    </div>
                  </div>
                ))}

              {/* Grand total */}
              <div className="flex items-center justify-between pt-3 mt-1">
                <span className="font-bold text-gray-900 text-sm">Total mois</span>
                <div className="text-sm">
                  <span className="font-bold text-gray-900">{formatHours(summary.totalHours)}</span>
                  <span className="text-gray-300 mx-2">—</span>
                  <span className="font-bold text-primary-600 text-base">
                    {formatCurrency(summary.totalRevenue, settings.currency)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Day-by-day detail */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Détail par journée
            </h2>
            <div className="space-y-4">
              {Object.entries(byDay).map(([date, dayEntries]) => {
                const d = new Date(date);
                const dayLabel = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
                const dayHours = dayEntries.reduce((s, e) => {
                  const h = (parseTime(e.endTime) - parseTime(e.startTime)) / 60 - e.breakMinutes / 60;
                  return s + Math.max(0, h);
                }, 0);
                const dayRevenue = dayEntries.reduce((s, e) => {
                  const h = (parseTime(e.endTime) - parseTime(e.startTime)) / 60 - e.breakMinutes / 60;
                  return s + Math.max(0, h) * e.hourlyRate;
                }, 0);

                return (
                  <div key={date} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 capitalize">{dayLabel}</span>
                      <div className="text-xs text-gray-500">
                        {formatHours(dayHours)} · {formatCurrency(dayRevenue, settings.currency)}
                      </div>
                    </div>
                    <div className="space-y-2 pl-2">
                      {dayEntries.map((entry) => {
                        const client = clients.find((c) => c.id === entry.clientId);
                        const h = Math.max(0, (parseTime(entry.endTime) - parseTime(entry.startTime)) / 60 - entry.breakMinutes / 60);
                        return (
                          <div key={entry.id} className="flex items-center gap-3 text-xs text-gray-600">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: client?.color ?? '#6366f1' }}
                            />
                            <span className="flex-1">{client?.name ?? '—'}</span>
                            <span>{entry.startTime}–{entry.endTime}</span>
                            <span className="font-medium">{formatHours(h)}</span>
                            <span className="font-semibold" style={{ color: client?.color }}>
                              {formatCurrency(h * entry.hourlyRate, settings.currency)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
