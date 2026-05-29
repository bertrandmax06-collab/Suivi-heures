import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { WorkEntry, Client } from '../../types';
import { useApp } from '../../context/AppContext';
import { calculateHours, formatHours } from '../../utils/calculations';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

interface WorkEntryFormProps {
  date: string;
  entry?: WorkEntry;
  onSave: () => void;
  onCancel: () => void;
}

interface FormState {
  clientId: string;
  startTime: string;
  endTime: string;
  breakMinutes: string;
  hourlyRate: string;
  notes: string;
}

export function WorkEntryForm({ date, entry, onSave, onCancel }: WorkEntryFormProps) {
  const { clients, settings, addEntry, updateEntry } = useApp();
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    clientId: entry?.clientId ?? '',
    startTime: entry?.startTime ?? '08:00',
    endTime: entry?.endTime ?? '17:00',
    breakMinutes: String(entry?.breakMinutes ?? 60),
    hourlyRate: String(entry?.hourlyRate ?? settings.defaultHourlyRate),
    notes: entry?.notes ?? '',
  });

  const selectedClient = clients.find((c) => c.id === form.clientId);

  useEffect(() => {
    if (selectedClient) {
      setClientSearch(selectedClient.name);
      if (selectedClient.hourlyRate && !entry) {
        setForm((f) => ({ ...f, hourlyRate: String(selectedClient.hourlyRate) }));
      }
    }
  }, [form.clientId]);

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const hours = calculateHours(form.startTime, form.endTime, Number(form.breakMinutes) || 0);
  const revenue = hours * Number(form.hourlyRate || 0);

  function validate(): boolean {
    const newErrors: Partial<FormState> = {};
    if (!form.clientId) newErrors.clientId = 'Sélectionnez un client';
    if (!form.startTime) newErrors.startTime = 'Requis';
    if (!form.endTime) newErrors.endTime = 'Requis';
    if (hours <= 0) newErrors.endTime = "L'heure de fin doit être après le début";
    if (!form.hourlyRate || Number(form.hourlyRate) <= 0)
      newErrors.hourlyRate = 'Taux horaire invalide';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);

    const data = {
      date,
      clientId: form.clientId,
      startTime: form.startTime,
      endTime: form.endTime,
      breakMinutes: Number(form.breakMinutes) || 0,
      hourlyRate: Number(form.hourlyRate),
      notes: form.notes || undefined,
    };

    try {
      if (entry) {
        await updateEntry({ ...entry, ...data });
      } else {
        await addEntry(data);
      }
      onSave();
    } catch (err) {
      console.error(err);
      setSaveError(`Erreur: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    } finally {
      setSaving(false);
    }
  }

  function selectClient(client: Client) {
    setForm((f) => ({
      ...f,
      clientId: client.id,
      hourlyRate: client.hourlyRate ? String(client.hourlyRate) : f.hourlyRate,
    }));
    setClientSearch(client.name);
    setShowClientDropdown(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Client selector */}
      <div className="relative">
        <label className="text-sm font-medium text-gray-700 block mb-1.5">
          Client / Chantier
        </label>
        <div className="relative">
          <input
            type="text"
            value={clientSearch}
            onChange={(e) => {
              setClientSearch(e.target.value);
              setShowClientDropdown(true);
              if (!e.target.value) setForm((f) => ({ ...f, clientId: '' }));
            }}
            onFocus={() => setShowClientDropdown(true)}
            onBlur={() => setTimeout(() => setShowClientDropdown(false), 150)}
            placeholder="Rechercher un client..."
            className={`w-full px-4 py-3 rounded-xl border text-gray-900 text-sm bg-gray-50
              placeholder:text-gray-400 transition-all outline-none
              ${errors.clientId ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:bg-white'}`}
          />
          {selectedClient && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedClient.color }}
            />
          )}
        </div>
        {errors.clientId && <p className="text-xs text-red-500 mt-1">{errors.clientId}</p>}

        {showClientDropdown && filteredClients.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-ios border border-gray-100 z-20 overflow-hidden max-h-48 overflow-y-auto">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                onMouseDown={() => selectClient(client)}
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: client.color }} />
                <span className="text-sm text-gray-800">{client.name}</span>
                {client.hourlyRate && (
                  <span className="ml-auto text-xs text-gray-400">{client.hourlyRate} €/h</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Time fields */}
      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Début"
          type="time"
          value={form.startTime}
          onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
          error={errors.startTime}
        />
        <Input
          label="Fin"
          type="time"
          value={form.endTime}
          onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
          error={errors.endTime}
        />
        <Input
          label="Pause (min)"
          type="number"
          min="0"
          max="480"
          value={form.breakMinutes}
          onChange={(e) => setForm((f) => ({ ...f, breakMinutes: e.target.value }))}
        />
      </div>

      {/* Hours computed display */}
      {hours > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-primary-50 rounded-xl">
          <Clock size={16} className="text-primary-500 shrink-0" />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-primary-700">{formatHours(hours)}</span>
            <span className="text-primary-500"> travaillées</span>
          </div>
          <div className="text-sm">
            <span className="font-semibold text-primary-700">
              {revenue.toFixed(2)} {settings.currency}
            </span>
          </div>
        </div>
      )}

      {/* Hourly rate */}
      <Input
        label={`Taux horaire (${settings.currency}/h)`}
        type="number"
        min="1"
        step="0.5"
        value={form.hourlyRate}
        onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
        error={errors.hourlyRate}
        hint={`Taux par défaut : ${settings.defaultHourlyRate} ${settings.currency}/h`}
      />

      {/* Notes */}
      <Textarea
        label="Note (facultative)"
        value={form.notes}
        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        placeholder="Travaux effectués, remarques..."
      />

      {saveError && (
        <p className="text-sm text-red-500 text-center px-2">{saveError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel} disabled={saving}>
          Annuler
        </Button>
        <Button type="submit" fullWidth disabled={saving}>
          {saving ? 'Sauvegarde…' : entry ? 'Modifier' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}
