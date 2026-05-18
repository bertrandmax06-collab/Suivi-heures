import { useState } from 'react';
import { Plus } from 'lucide-react';
import { WorkEntry } from '../../types';
import { useApp } from '../../context/AppContext';
import { getEntriesForDate, calculateHours, formatHours, calculateRevenue, formatCurrency } from '../../utils/calculations';
import { formatDayLabel, fromISODate } from '../../utils/dateHelpers';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { WorkEntryForm } from './WorkEntryForm';
import { WorkEntryCard } from './WorkEntryCard';

interface DayModalProps {
  date: string | null;
  onClose: () => void;
}

export function DayModal({ date, onClose }: DayModalProps) {
  const { entries, settings } = useApp();
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);

  if (!date) return null;

  const dayEntries = getEntriesForDate(entries, date);
  const totalHours = dayEntries.reduce(
    (s, e) => s + calculateHours(e.startTime, e.endTime, e.breakMinutes),
    0
  );
  const totalRevenue = dayEntries.reduce(
    (s, e) => s + calculateRevenue(calculateHours(e.startTime, e.endTime, e.breakMinutes), e.hourlyRate),
    0
  );

  const dayLabel = formatDayLabel(fromISODate(date));

  function handleEdit(entry: WorkEntry) {
    setEditingEntry(entry);
    setMode('edit');
  }

  function handleFormSave() {
    setMode('list');
    setEditingEntry(null);
  }

  function handleFormCancel() {
    setMode('list');
    setEditingEntry(null);
  }

  const title =
    mode === 'add' ? 'Nouvelle entrée' :
    mode === 'edit' ? 'Modifier l\'entrée' :
    dayLabel.charAt(0).toUpperCase() + dayLabel.slice(1);

  return (
    <Modal isOpen={!!date} onClose={onClose} title={title} size="md">
      {(mode === 'add' || mode === 'edit') ? (
        <WorkEntryForm
          date={date}
          entry={editingEntry ?? undefined}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      ) : (
        <div className="space-y-4">
          {/* Summary bar */}
          {dayEntries.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-2xl">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total du jour</p>
                <p className="font-bold text-gray-900">{formatHours(totalHours)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Main-d'œuvre</p>
                <p className="font-bold text-primary-600">{formatCurrency(totalRevenue, settings.currency)}</p>
              </div>
            </div>
          )}

          {/* Entry list */}
          {dayEntries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm mb-4">Aucune entrée pour ce jour</p>
              <Button icon={<Plus size={16} />} onClick={() => setMode('add')}>
                Ajouter une entrée
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {dayEntries.map((entry) => (
                  <WorkEntryCard key={entry.id} entry={entry} onEdit={handleEdit} />
                ))}
              </div>
              <Button
                icon={<Plus size={16} />}
                variant="ghost"
                fullWidth
                onClick={() => setMode('add')}
              >
                Ajouter une entrée
              </Button>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
