import { useMemo } from 'react';
import { Euro, Clock, TrendingUp, Users, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { getMonthSummary, formatHours, formatCurrency } from '../utils/calculations';
import { StatCard } from '../components/dashboard/StatCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { formatMonthYear } from '../utils/dateHelpers';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Dashboard() {
  const { entries, clients, settings } = useApp();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentSummary = useMemo(
    () => getMonthSummary(entries, clients, currentYear, currentMonth),
    [entries, clients, currentYear, currentMonth]
  );

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevSummary = useMemo(
    () => getMonthSummary(entries, clients, prevYear, prevMonth),
    [entries, clients, prevYear, prevMonth]
  );

  // Daily average (working days only)
  const workedDaysThisMonth = new Set(
    entries
      .filter((e) => {
        const d = new Date(e.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      })
      .map((e) => e.date)
  ).size;

  const avgHoursPerDay = workedDaysThisMonth > 0 ? currentSummary.totalHours / workedDaysThisMonth : 0;

  // Last 6 months for bar chart
  const last6Months = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(currentYear, currentMonth - (5 - i));
      const summary = getMonthSummary(entries, clients, d.getFullYear(), d.getMonth());
      return {
        month: format(d, 'MMM', { locale: fr }),
        heures: summary.totalHours,
        ca: summary.totalRevenue,
      };
    });
  }, [entries, clients, currentYear, currentMonth]);

  const navigate = useNavigate();

  const revTrend = prevSummary.totalRevenue > 0
    ? {
        value: `${Math.abs(Math.round(((currentSummary.totalRevenue - prevSummary.totalRevenue) / prevSummary.totalRevenue) * 100))}%`,
        positive: currentSummary.totalRevenue >= prevSummary.totalRevenue,
      }
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-0.5 capitalize">
          {formatMonthYear(currentYear, currentMonth)}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="C.A. du mois"
          value={formatCurrency(currentSummary.totalRevenue, settings.currency)}
          icon={Euro}
          color="#6366f1"
          trend={revTrend}
        />
        <StatCard
          label="Heures travaillées"
          value={formatHours(currentSummary.totalHours)}
          sub={workedDaysThisMonth > 0 ? `${workedDaysThisMonth} jour${workedDaysThisMonth > 1 ? 's' : ''}` : 'Aucune journée'}
          icon={Clock}
          color="#8b5cf6"
        />
        <StatCard
          label="Moy. journalière"
          value={avgHoursPerDay > 0 ? formatHours(avgHoursPerDay) : '—'}
          sub="par jour travaillé"
          icon={TrendingUp}
          color="#22c55e"
        />
        <StatCard
          label="Clients actifs"
          value={String(currentSummary.byClient.length)}
          sub="ce mois-ci"
          icon={Users}
          color="#f97316"
        />
      </div>

      {/* Bar chart */}
      {last6Months.some((m) => m.heures > 0) && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Heures — 6 derniers mois</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={last6Months} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                formatter={(v: number) => [formatHours(v), 'Heures']}
              />
              <Bar dataKey="heures" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Client breakdown */}
      {currentSummary.byClient.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Répartition par client</h2>
          <div className="space-y-3">
            {currentSummary.byClient
              .sort((a, b) => b.totalRevenue - a.totalRevenue)
              .map((c) => {
                const pct = currentSummary.totalRevenue > 0
                  ? Math.round((c.totalRevenue / currentSummary.totalRevenue) * 100)
                  : 0;
                return (
                  <div key={c.clientId}>
                    <div className="flex items-center justify-between mb-1">
                      <Badge color={c.color} label={c.clientName} size="sm" />
                      <div className="text-sm text-right">
                        <span className="font-semibold text-gray-900">{formatHours(c.totalHours)}</span>
                        <span className="text-gray-400 mx-1">·</span>
                        <span className="font-semibold" style={{ color: c.color }}>
                          {formatCurrency(c.totalRevenue, settings.currency)}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* Quick actions */}
      {entries.length === 0 && (
        <Card>
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CalendarDays size={24} className="text-primary-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Commencez à suivre vos heures</h3>
            <p className="text-sm text-gray-500 mb-4">
              Allez dans le Calendrier pour enregistrer votre première journée de travail.
            </p>
            <button
              onClick={() => navigate('/calendrier')}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Ouvrir le calendrier →
            </button>
          </div>
        </Card>
      )}

      {/* Recent months history */}
      {last6Months.some((m) => m.ca > 0) && (
        <Card>
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Historique mensuel</h2>
          <div className="space-y-2">
            {[...last6Months].reverse().map((m, i) => (
              m.heures > 0 && (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600 capitalize font-medium">{m.month}</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">{formatHours(m.heures)}</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(m.ca, settings.currency)}
                    </span>
                  </div>
                </div>
              )
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
