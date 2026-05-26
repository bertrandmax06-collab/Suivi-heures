import { useState } from 'react'
import { Trash2, Download, Upload } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import * as db from '../lib/db'

export function ParametresPage() {
  const { settings, updateSettings, entries, clients } = useApp()
  const [form, setForm] = useState({
    defaultHourlyRate: String(settings.defaultHourlyRate),
    currency: settings.currency,
    userName: settings.userName ?? '',
  })
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await updateSettings({
      defaultHourlyRate: Number(form.defaultHourlyRate) || 35,
      currency: form.currency || '€',
      userName: form.userName || undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleExport() {
    const data = { clients, entries, settings, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `suivi-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        await db.importAllData({
          clients: data.clients ?? [],
          entries: data.entries ?? [],
          settings: data.settings,
        })
        window.location.reload()
      } catch {
        alert('Fichier invalide ou erreur lors de l\'import')
        setBusy(false)
      }
    }
    reader.readAsText(file)
  }

  async function handleReset() {
    if (!confirm('Supprimer toutes les données ? Cette action est irréversible.')) return
    setBusy(true)
    await db.resetAllData()
    window.location.reload()
  }

  const totalRevenue = entries.reduce((s, e) => {
    const [sh, sm] = e.startTime.split(':').map(Number)
    const [eh, em] = e.endTime.split(':').map(Number)
    const h = Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60 - e.breakMinutes / 60)
    return s + h * e.hourlyRate
  }, 0)

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
          <Button type="submit" fullWidth disabled={busy}>
            {saved ? '✓ Enregistré !' : 'Enregistrer'}
          </Button>
        </form>
      </Card>

      {/* Stats */}
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

      {/* Data */}
      <Card>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Données</h2>
        <div className="space-y-3">
          <Button variant="secondary" fullWidth icon={<Download size={16} />} onClick={handleExport} disabled={busy}>
            Exporter (JSON)
          </Button>
          <label className="w-full">
            <div className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-xl font-medium transition-all
              ${busy ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'}`}>
              <Upload size={16} />
              Importer des données
            </div>
            <input type="file" accept=".json" className="hidden" onChange={handleImport} disabled={busy} />
          </label>
        </div>
      </Card>

      {/* Danger */}
      <Card>
        <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wide mb-4">Zone de danger</h2>
        <Button variant="danger" fullWidth icon={<Trash2 size={16} />} onClick={handleReset} disabled={busy}>
          Supprimer toutes les données
        </Button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Supprime définitivement tous vos clients, entrées et paramètres.
        </p>
      </Card>

      <div className="text-center text-xs text-gray-400 pb-2">
        <p className="font-medium text-gray-500">Mon Suivi Auto-Entrepreneur</p>
        <p>Données stockées sur Supabase ☁️</p>
      </div>
    </div>
  )
}
