import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendrier', icon: CalendarDays, label: 'Calendrier' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/synthese', icon: BarChart3, label: 'Synthèse' },
  { to: '/parametres', icon: Settings, label: 'Réglages' },
];

export function Layout({ children }: LayoutProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Status bar safe area (iPhone notch / Dynamic Island) */}
      <div
        className="shrink-0 bg-white"
        style={{ height: 'env(safe-area-inset-top)' }}
      />

      {/* Page content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5 pb-28">
          {children}
        </div>
      </main>

      {/* Bottom nav with safe area */}
      <nav
        className="shrink-0 bg-white border-t border-gray-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 transition-colors
                ${isActive ? 'text-primary-600' : 'text-gray-400'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary-50' : ''}`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-[10px] font-medium leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
