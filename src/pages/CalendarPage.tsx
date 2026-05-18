import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCalendarDays, formatMonthYear, addMonths, subMonths } from '../utils/dateHelpers';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { DayModal } from '../components/calendar/DayModal';
import { formatHours, formatCurrency, getMonthSummary } from '../utils/calculations';
import { Card } from '../components/ui/Card';

export function CalendarPage() {
  const { entries, clients, settings } = useApp();
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getCalendarDays(year, month);

  const summary = getMonthSummary(entries, clients, year, month);

  function prev() { setCurrentDate((d) => subMonths(d, 1)); }
  function next() { setCurrentDate((d) => addMonths(d, 1)); }
  function goToday() { setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1)); }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendrier</h1>
        <button
          onClick={goToday}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-xl hover:bg-primary-50 transition-colors"
        >
          Aujourd'hui
        </button>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-card px-4 py-3">
        <button
          onClick={prev}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-base font-bold text-gray-900 capitalize">
          {formatMonthYear(year, month)}
        </h2>
        <button
          onClick={next}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Calendar grid */}
      <Card padding={false} className="p-4">
        <CalendarGrid
          days={days}
          currentMonth={month}
          currentYear={year}
          entries={entries}
          clients={clients}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </Card>

      {/* Month summary bar */}
      {summary.totalHours > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl shadow-card p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Heures</p>
            <p className="font-bold text-gray-900 text-sm">{formatHours(summary.totalHours)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-card p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">C.A.</p>
            <p className="font-bold text-primary-600 text-sm">{formatCurrency(summary.totalRevenue, settings.currency)}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-card p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Clients</p>
            <p className="font-bold text-gray-900 text-sm">{summary.byClient.length}</p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {entries.filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
      }).length === 0 && (
        <Card>
          <div className="text-center py-4">
            <CalendarDays size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              Cliquez sur un jour pour enregistrer vos heures
            </p>
          </div>
        </Card>
      )}

      {/* Day modal */}
      <DayModal date={selectedDate} onClose={() => setSelectedDate(null)} />
    </div>
  );
}
