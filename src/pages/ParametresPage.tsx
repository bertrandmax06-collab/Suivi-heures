import React, { useState } from 'react';
import { Trash2, Download, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function ParametresPage() {
  const { settings, updateSettings, entries, clients } = useApp();
  const [form, setForm] = useState({
    defaultHourlyRate: String(settings.defaultHourlyRate),
    currency: settings.currency,
    userName: settings.userName ?? '',
  });
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateSettings({
      defaultHourlyRate: Number(form.defaultHourlyRate) || 35,
      currency: form.currency || '€',
      userName: form.userName || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleExport() {
    const data = { clients, entries, settings, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `suivi-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.clients && Array.isArray(data.clients)) {
          localStorage.setItem('suivi_clients', JSON.stringify(data.clients));
        }
        if (data.entries && Array.isArray(data.entries)) {
          localStorage.setItem('suivi_entries', JSON.stringify(data.entries));
        }
        if (data.settings) {
          localStorage.setItem('suivi_settings', JSON.stringify(data.settings));
        }
        window.location.reload();
      } catch {
        alert('Fichier invalide');
      }
    };
    reader.readAsText(file);
  }

  function handleReset() {
    if (!confirm('Supprimer toutes les données ? Cette action est irréversible.')) return;
    localStorage.removeItem('suivi_clients');
    localStorage.removeItem('suivi_entries');
    localStorage.removeItem('suivi_settings');
    window.location.reload();
  }

  const totalRevenue = entries.reduce((s, e) => {
    const h = Math.max(0, (parseTime(e.endTime) - parseTime(e.startTime)) / 60 - e.breakMinutes / 60);
    return s + h * e.hourlyRate;
  }, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
      </div>

      {/* Preferences */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Préférences</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Votre nom (optionnel)"
            value={form.userName}
            onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
            placeholder="ex. Jean Martin"
          />
          <Input
            label="Taux horaire par défaut (€/h)"
            type="number"
            min="1"
            step="0.5"
            value={form.defaultHourlyRate}
            onChange={(e) => setForm((f) => ({ ...f, defaultHourlyRate: e.target.value }))}
            hint="Utilisé pour les nouvelles entrées sans taux spécifique"
          />
          <Input
            label="Symbole monnaie"
            value={form.currency}
            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            placeholder="€"
            className="max-w-24"
          />
          <Button type="submit" fullWidth>
            {saved ? '✓ Enregistré !' : 'Enregistrer'}
          </Button>
        </form>
      </Card>

      {/* Data stats */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Statistiques</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Clients</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Entrées</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-600">
              {totalRevenue.toFixed(0)}{settings.currency}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">C.A. total</p>
          </div>
        </div>
      </Card>

      {/* Data management */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Données</h2>
        <div className="space-y-3">
          <Button
            variant="secondary"
            fullWidth
            icon={<Download size={16} />}
            onClick={handleExport}
          >
            Exporter les données (JSON)
          </Button>

          <label className="w-full">
            <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer font-medium transition-all">
              <Upload size={16} />
              Importer des données
            </div>
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </Card>

      {/* Danger zone */}
      <Card>
        <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-4">Zone de danger</h2>
        <Button
          variant="danger"
          fullWidth
          icon={<Trash2 size={16} />}
          onClick={handleReset}
        >
          Supprimer toutes les données
        </Button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Cette action supprime définitivement tous vos clients, entrées et paramètres.
        </p>
      </Card>

      {/* App info */}
      <div className="text-center text-xs text-gray-400 pb-2">
        <p className="font-medium text-gray-500">Mon Suivi Auto-Entrepreneur</p>
        <p>Version 1.0 · Données stockées localement</p>
      </div>
    </div>
  );
}

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
