'use client';

import React, { useState } from 'react';
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
  ChevronDown,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BTECH_BRANCHES, type BTechBranch } from '@backend/config';

export type DashboardView =
  | 'overview'
  | 'all'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'category'
  | 'settings';

export interface CategorySelection {
  department?: string;
  branch?: string;
}

interface AdminSidebarProps {
  currentView: DashboardView;
  selectedCategory: CategorySelection | null;
  onSelectView: (view: DashboardView) => void;
  onSelectCategory: (category: CategorySelection) => void;
  pendingCount?: number;
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function AdminSidebar({
  currentView,
  selectedCategory,
  onSelectView,
  onSelectCategory,
  pendingCount = 0,
  onLogout,
  isLoggingOut = false,
}: AdminSidebarProps) {
  const [btechExpanded, setBtechExpanded] = useState(true);

  const mainNavItems: { id: DashboardView; label: string; icon: React.ReactNode; badge?: number }[] = [
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
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const otherDepartments = ['MBA', 'MCA', 'Pharm B', 'Pharm D'];

  return (
    <aside className="w-64 flex flex-col justify-between h-full bg-white/70 dark:bg-amore-dark-card/80 backdrop-blur-2xl border-r border-amore-pink/20 dark:border-amore-lavender/10 p-5 transition-colors overflow-y-auto">
      {/* Top Header - Professional & Minimal */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amore-pink to-amore-lavender flex items-center justify-center text-amore-deep-purple shadow-pink-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-amore-deep-purple dark:text-white leading-none">
              Admin Portal
            </h2>
            <span className="text-[10px] uppercase tracking-widest font-semibold text-amore-deep-purple/50 dark:text-amore-pink/60">
              Moderation Panel
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {mainNavItems.slice(0, 6).map((item) => {
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

          {/* Departments & Branches Section */}
          <div className="pt-3 pb-1 px-3">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amore-deep-purple/40 dark:text-amore-lavender/40">
              Department Categories
            </span>
          </div>

          {/* B.Tech Category with Expandable Subcategories */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between rounded-xl hover:bg-amore-pink/15 dark:hover:bg-amore-lavender/10">
              <button
                onClick={() => onSelectCategory({ department: 'B.Tech', branch: undefined })}
                className={`flex-1 text-left px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  currentView === 'category' &&
                  selectedCategory?.department === 'B.Tech' &&
                  !selectedCategory?.branch
                    ? 'bg-amore-pink text-amore-deep-purple shadow-pink-sm font-bold'
                    : 'text-amore-deep-purple/70 dark:text-amore-lavender/70 hover:text-amore-deep-purple dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>B.Tech (All)</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setBtechExpanded(!btechExpanded)}
                className="p-2 text-amore-deep-purple/50 dark:text-amore-lavender/50 hover:text-amore-deep-purple dark:hover:text-white"
                title={btechExpanded ? 'Collapse Branches' : 'Expand Branches'}
              >
                {btechExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* B.Tech 5 Subcategories: CSE, CSD, ECE, Civil, Mech */}
            {btechExpanded && (
              <div className="pl-6 pr-1 space-y-0.5 border-l-2 border-amore-pink/20 dark:border-amore-lavender/15 ml-4 my-1">
                {BTECH_BRANCHES.map((branch) => {
                  const active =
                    currentView === 'category' &&
                    selectedCategory?.department === 'B.Tech' &&
                    selectedCategory?.branch === branch;
                  return (
                    <button
                      key={branch}
                      onClick={() => onSelectCategory({ department: 'B.Tech', branch })}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        active
                          ? 'bg-amore-pink/40 text-amore-deep-purple dark:text-white font-bold'
                          : 'text-amore-deep-purple/65 dark:text-amore-lavender/65 hover:bg-amore-pink/10 hover:text-amore-deep-purple dark:hover:text-white'
                      }`}
                    >
                      <span>{branch}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Other Categories: MBA, MCA, Pharm B, Pharm D */}
          {otherDepartments.map((dept) => {
            const active =
              currentView === 'category' &&
              selectedCategory?.department === dept &&
              !selectedCategory?.branch;
            return (
              <button
                key={dept}
                onClick={() => onSelectCategory({ department: dept, branch: undefined })}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  active
                    ? 'bg-amore-pink text-amore-deep-purple shadow-pink-sm font-bold'
                    : 'text-amore-deep-purple/70 dark:text-amore-lavender/70 hover:bg-amore-pink/15 dark:hover:bg-amore-lavender/10 hover:text-amore-deep-purple dark:hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{dept}</span>
              </button>
            );
          })}

          {/* Settings */}
          <div className="pt-2">
            <button
              onClick={() => onSelectView('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                currentView === 'settings'
                  ? 'bg-amore-pink text-amore-deep-purple shadow-pink-sm font-bold'
                  : 'text-amore-deep-purple/70 dark:text-amore-lavender/70 hover:bg-amore-pink/15 dark:hover:bg-amore-lavender/10 hover:text-amore-deep-purple dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
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
