import { isSameMonth, isToday } from '../../utils/dateHelpers';
import { getEntriesForDate, calculateHours } from '../../utils/calculations';
import { WorkEntry, Client } from '../../types';
import { toISODate } from '../../utils/dateHelpers';

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

interface CalendarGridProps {
  days: Date[];
  currentMonth: number;
  currentYear: number;
  entries: WorkEntry[];
  clients: Client[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function CalendarGrid({
  days,
  currentMonth,
  currentYear,
  entries,
  clients,
  selectedDate,
  onSelectDate,
}: CalendarGridProps) {
  const monthDate = new Date(currentYear, currentMonth);

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-2xl overflow-hidden">
        {days.map((day) => {
          const iso = toISODate(day);
          const isCurrentMonth = isSameMonth(day, monthDate);
          const isSelected = selectedDate === iso;
          const isDayToday = isToday(day);
          const dayEntries = getEntriesForDate(entries, iso);
          const hasEntries = dayEntries.length > 0;
          const totalHours = hasEntries
            ? dayEntries.reduce((s, e) => s + calculateHours(e.startTime, e.endTime, e.breakMinutes), 0)
            : 0;

          // Get unique client colors for dots
          const clientColors = [...new Set(dayEntries.map((e) => e.clientId))]
            .slice(0, 3)
            .map((id) => clients.find((c) => c.id === id)?.color ?? '#6366f1');

          return (
            <button
              key={iso}
              onClick={() => onSelectDate(iso)}
              className={`
                relative bg-white flex flex-col items-center pt-2 pb-1.5 min-h-[60px] sm:min-h-[80px]
                transition-all duration-150 hover:bg-primary-50 active:bg-primary-100
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${isSelected ? 'bg-primary-50 ring-2 ring-inset ring-primary-400' : ''}
              `}
            >
              {/* Day number */}
              <span
                className={`
                  flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium transition-colors
                  ${isDayToday ? 'bg-primary-500 text-white font-bold' : isSelected ? 'text-primary-700' : 'text-gray-700'}
                `}
              >
                {day.getDate()}
              </span>

              {/* Client color dots */}
              {hasEntries && (
                <div className="flex gap-0.5 mt-1">
                  {clientColors.map((color, i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                  ))}
                </div>
              )}

              {/* Hours label on larger screens */}
              {hasEntries && totalHours > 0 && (
                <span className="hidden sm:block text-xs text-gray-500 mt-0.5">
                  {Math.floor(totalHours)}h{Math.round((totalHours % 1) * 60).toString().padStart(2, '0') !== '00'
                    ? Math.round((totalHours % 1) * 60)
                    : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
