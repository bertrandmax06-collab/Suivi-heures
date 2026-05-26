-- Tables pour Mon Suivi Auto-Entrepreneur
-- À exécuter dans : Supabase → SQL Editor → New query

CREATE TABLE IF NOT EXISTS clients (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  color      TEXT NOT NULL DEFAULT '#6366f1',
  hourly_rate NUMERIC,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_entries (
  id            TEXT PRIMARY KEY,
  date          TEXT NOT NULL,
  client_id     TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  start_time    TEXT NOT NULL,
  end_time      TEXT NOT NULL,
  break_minutes INTEGER NOT NULL DEFAULT 0,
  hourly_rate   NUMERIC NOT NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
  id                  INTEGER PRIMARY KEY DEFAULT 1,
  default_hourly_rate NUMERIC NOT NULL DEFAULT 35,
  currency            TEXT NOT NULL DEFAULT '€',
  user_name           TEXT,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ligne de paramètres par défaut
INSERT INTO settings (id, default_hourly_rate, currency)
VALUES (1, 35, '€')
ON CONFLICT (id) DO NOTHING;

-- Désactiver RLS (app personnelle, un seul utilisateur)
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE work_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
