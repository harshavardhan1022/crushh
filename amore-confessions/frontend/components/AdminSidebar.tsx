'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  Instagram,
  GraduationCap,
  Settings,
  LogOut,
  Heart,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export type DashboardView =
  | 'overview'
  | 'all'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'departments'
  | 'settings';

interface AdminSidebarProps {
  currentView: DashboardView;
  onSelectView: (view: DashboardView) => void;
  pendingCount?: number;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function AdminSidebar({
  currentView,
  onSelectView,
  pendingCount = 0,
  onLogout,
  isLoggingOut = false,
}: AdminSidebarProps) {
  const navItems: { id: DashboardView; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'all', label: 'All Confessions', icon: <Inbox className="w-4 h-4" /> },
    {
      id: 'pending',
      label: 'Pending Review',
      icon: <Clock className="w-4 h-4" />,
      badge: pendingCount,
    },
    { id: 'approved', label: 'Approved', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'rejected', label: 'Rejected', icon: <XCircle className="w-4 h-4" /> },
    { id: 'published', label: 'Instagram Stories', icon: <Instagram className="w-4 h-4" /> },
    { id: 'departments', label: 'Departments', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-64 flex flex-col justify-between h-full bg-white/70 dark:bg-amore-dark-card/80 backdrop-blur-2xl border-r border-amore-pink/20 dark:border-amore-lavender/10 p-5 transition-colors">
      {/* Top Branding */}
      <div className="space-y-6">
        <Link href="/" className="flex items-center gap-3 px-2 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amore-pink to-amore-lavender flex items-center justify-center text-amore-deep-purple shadow-pink-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-amore-deep-purple dark:text-white leading-none">
              Amore Admin
            </h2>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-amore-deep-purple/50 dark:text-amore-pink/60">
              Moderation Panel
            </span>
          </div>
        </Link>

        {/* Navigation list */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  active
                    ? 'bg-amore-pink text-amore-deep-purple shadow-pink-sm font-bold'
                    : 'text-amore-deep-purple/70 dark:text-amore-lavender/70 hover:bg-amore-pink/15 dark:hover:bg-amore-lavender/10 hover:text-amore-deep-purple dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      active
                        ? 'bg-amore-deep-purple text-white'
                        : 'bg-amore-pink/30 text-amore-deep-purple dark:text-amore-pink'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Controls */}
      <div className="pt-4 border-t border-amore-pink/20 dark:border-amore-lavender/10 space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-amore-deep-purple/60 dark:text-amore-lavender/60 font-medium">
            Theme
          </span>
          <ThemeToggle />
        </div>

        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>{isLoggingOut ? 'Logging out...' : 'Sign Out'}</span>
        </button>
      </div>
    </aside>
  );
}

