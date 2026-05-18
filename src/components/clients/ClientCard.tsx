import { Pencil, Trash2 } from 'lucide-react';
import { Client } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculateHours, formatHours, formatCurrency } from '../../utils/calculations';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
}

export function ClientCard({ client, onEdit }: ClientCardProps) {
  const { entries, settings, deleteClient } = useApp();

  const clientEntries = entries.filter((e) => e.clientId === client.id);
  const totalHours = clientEntries.reduce(
    (s, e) => s + calculateHours(e.startTime, e.endTime, e.breakMinutes),
    0
  );
  const totalRevenue = clientEntries.reduce(
    (s, e) => s + calculateHours(e.startTime, e.endTime, e.breakMinutes) * e.hourlyRate,
    0
  );

  function handleDelete() {
    if (clientEntries.length > 0) {
      if (!confirm(`Ce client a ${clientEntries.length} entrée(s). Supprimer quand même ?`)) return;
    }
    deleteClient(client.id);
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow">
      {/* Color bar */}
      <div className="h-1.5" style={{ backgroundColor: client.color }} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: client.color }}
            >
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
              {client.notes && (
                <p className="text-xs text-gray-400 truncate mt-0.5">{client.notes}</p>
              )}
            </div>
          </div>

          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onEdit(client)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-primary-500 transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-400">Taux</p>
            <p className="text-sm font-semibold text-gray-700">
              {client.hourlyRate ?? settings.defaultHourlyRate} {settings.currency}/h
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">Heures</p>
            <p className="text-sm font-semibold text-gray-700">
              {totalHours > 0 ? formatHours(totalHours) : '—'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400">C.A.</p>
            <p className="text-sm font-semibold" style={{ color: client.color }}>
              {totalRevenue > 0 ? formatCurrency(totalRevenue, settings.currency) : '—'}
            </p>
          </div>
        </div>

        {clientEntries.length === 0 && (
          <p className="mt-3 text-xs text-center text-gray-400">Aucune journée enregistrée</p>
        )}
      </div>
    </div>
  );
}
