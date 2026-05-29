import React, { useState } from 'react';
import { Client } from '../../types';
import { useApp } from '../../context/AppContext';
import { Input, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#64748b', '#78716c',
];

interface ClientFormProps {
  client?: Client;
  onSave: () => void;
  onCancel: () => void;
}

export function ClientForm({ client, onSave, onCancel }: ClientFormProps) {
  const { settings, addClient, updateClient } = useApp();
  const [form, setForm] = useState({
    name: client?.name ?? '',
    color: client?.color ?? PRESET_COLORS[0],
    hourlyRate: client?.hourlyRate != null ? String(client.hourlyRate) : '',
    notes: client?.notes ?? '',
  });
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function validate() {
    const e: { name?: string } = {};
    if (!form.name.trim()) e.name = 'Le nom est requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    const data = {
      name: form.name.trim(),
      color: form.color,
      hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined,
      notes: form.notes || undefined,
    };
    try {
      if (client) {
        await updateClient({ ...client, ...data });
      } else {
        await addClient(data);
      }
      onSave();
    } catch (err) {
      console.error(err);
      setSaveError(`Erreur: ${err instanceof Error ? err.message : JSON.stringify(err)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Nom du client / chantier"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        error={errors.name}
        placeholder="ex. Domaine Savas"
        autoFocus
      />

      {/* Color picker */}
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">Couleur</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setForm((f) => ({ ...f, color }))}
              className={`w-8 h-8 rounded-full transition-transform active:scale-90 ${
                form.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <Input
        label={`Taux horaire spécifique (${settings.currency}/h) — optionnel`}
        type="number"
        min="1"
        step="0.5"
        value={form.hourlyRate}
        onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
        placeholder={`Par défaut : ${settings.defaultHourlyRate} ${settings.currency}/h`}
        hint="Laissez vide pour utiliser le taux par défaut"
      />

      <Textarea
        label="Notes (optionnel)"
        value={form.notes}
        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        placeholder="Adresse, contact, remarques..."
      />

      {saveError && (
        <p className="text-sm text-red-500 text-center">{saveError}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" fullWidth onClick={onCancel} disabled={saving}>
          Annuler
        </Button>
        <Button type="submit" fullWidth disabled={saving}>
          {saving ? 'Sauvegarde…' : client ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
}
