import { Pencil, Trash2, Clock } from 'lucide-react';
import { WorkEntry } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculateHours, calculateRevenue, formatHours, formatCurrency } from '../../utils/calculations';

interface WorkEntryCardProps {
  entry: WorkEntry;
  onEdit: (entry: WorkEntry) => void;
}

export function WorkEntryCard({ entry, onEdit }: WorkEntryCardProps) {
  const { clients, settings, deleteEntry } = useApp();
  const client = clients.find((c) => c.id === entry.clientId);
  const hours = calculateHours(entry.startTime, entry.endTime, entry.breakMinutes);
  const revenue = calculateRevenue(hours, entry.hourlyRate);

  return (
    <div
      className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-card transition-shadow"
      style={{ borderLeftWidth: 4, borderLeftColor: client?.color ?? '#6366f1' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900 truncate">{client?.name ?? 'Client inconnu'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={13} />
          <span>
            {entry.startTime} – {entry.endTime}
            {entry.breakMinutes > 0 && ` (pause ${entry.breakMinutes}min)`}
          </span>
        </div>
        {entry.notes && (
          <p className="text-xs text-gray-400 mt-1 truncate">{entry.notes}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold text-gray-900 text-sm">{formatHours(hours)}</p>
        <p className="text-sm font-medium" style={{ color: client?.color ?? '#6366f1' }}>
          {formatCurrency(revenue, settings.currency)}
        </p>
        <p className="text-xs text-gray-400">{entry.hourlyRate} {settings.currency}/h</p>
      </div>
      <div className="flex flex-col gap-1 ml-1 shrink-0">
        <button
          onClick={() => onEdit(entry)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-500 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => {
            if (confirm('Supprimer cette entrée ?')) deleteEntry(entry.id);
          }}
          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
