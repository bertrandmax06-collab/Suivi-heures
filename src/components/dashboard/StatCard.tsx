import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  color: string;
  trend?: { value: string; positive: boolean };
}

export function StatCard({ label, value, sub, icon: Icon, color, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: color + '20' }}
        >
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
        {sub && <p className="text-sm text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {trend && (
        <p className={`text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value} vs mois précédent
        </p>
      )}
    </div>
  );
}
