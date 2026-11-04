'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  XCircle,
  Instagram,
  RefreshCw,
  Eye,
  Trash2,
  Menu,
  X,
  Heart,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { AdminSidebar, type DashboardView } from '@/components/AdminSidebar';
import { ConfessionDetailsModal } from '@/components/ConfessionDetailsModal';
import { InstagramStoryModal } from '@/components/InstagramStoryModal';
import { AdminSettings } from '@/components/AdminSettings';
import { LoadingAnimation } from '@/components/LoadingAnimation';
import type { Confession, DashboardStats } from '@/types';
import { DEPARTMENTS, DEPARTMENT_YEARS, type Department } from '@backend/config';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Navigation & View
  const [currentView, setCurrentView] = useState<DashboardView>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Data & Stats
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    published: 0,
  });
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected confession for modals
  const [activeConfession, setActiveConfession] = useState<Confession | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);

  // Helper: Get token
  const getAuthHeader = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('amore-admin-token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: getAuthHeader(),
      });
      if (res.status === 401 || res.status === 403) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [router]);

  // Fetch Confessions
  const fetchConfessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      // View-based status filter
      if (currentView === 'pending') params.set('status', 'pending');
      else if (currentView === 'approved') params.set('status', 'approved');
      else if (currentView === 'rejected') params.set('status', 'rejected');

      if (selectedDepartment) params.set('department', selectedDepartment);
      if (selectedYear) params.set('year', selectedYear);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      params.set('sortOrder', sortOrder);
      params.set('page', String(currentPage));
      params.set('limit', String(pageSize));

      const res = await fetch(`/api/admin/confessions?${params.toString()}`, {
        headers: getAuthHeader(),
      });

      if (res.status === 401 || res.status === 403) {
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      if (data.success) {
        setConfessions(data.data || []);
        setTotalCount(data.count || 0);
      }
    } catch (err) {
      console.error('Failed to load confessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentView, selectedDepartment, selectedYear, searchQuery, sortOrder, currentPage, router]);

  // Initial load & view change
  useEffect(() => {
    fetchStats();
    fetchConfessions();
  }, [fetchStats, fetchConfessions]);

  // Handle Moderation Status Change
  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/confessions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update status');
      }

      // Refresh list & stats
      fetchStats();
      fetchConfessions();
    } catch (err: any) {
      alert(err.message || 'Error updating confession');
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/confessions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete confession');
      }

      fetchStats();
      fetchConfessions();
    } catch (err: any) {
      alert(err.message || 'Error deleting confession');
    }
  };

  // Handle Mark as Published
  const handleMarkPublished = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/confessions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ action: 'publish' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to mark as published');
      }

      fetchStats();
      fetchConfessions();
    } catch (err: any) {
      alert(err.message || 'Error updating publish status');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      localStorage.removeItem('amore-admin-token');
      router.push('/admin/login');
    } catch {
      router.push('/admin/login');
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen flex bg-amore-soft-pink/40 dark:bg-amore-dark-bg selection:bg-amore-pink/40 selection:text-amore-deep-purple">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-screen sticky top-0">
        <AdminSidebar
          currentView={currentView}
          onSelectView={(v) => {
            setCurrentView(v);
            setCurrentPage(1);
          }}
          pendingCount={stats.pending}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-64 h-full z-10">
            <AdminSidebar
              currentView={currentView}
              onSelectView={(v) => {
                setCurrentView(v);
                setCurrentPage(1);
                setMobileSidebarOpen(false);
              }}
              pendingCount={stats.pending}
              onLogout={handleLogout}
              isLoggingOut={isLoggingOut}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 h-16 sm:h-20 bg-white/60 dark:bg-amore-dark-bg/60 backdrop-blur-xl border-b border-amore-pink/20 dark:border-amore-lavender/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/50 dark:bg-amore-dark-card/50 border border-amore-pink/30 text-amore-deep-purple dark:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-serif text-lg sm:text-2xl font-bold text-amore-deep-purple dark:text-white capitalize">
                {currentView === 'overview' ? 'Dashboard Overview' : currentView.replace('-', ' ')}
              </h1>
              <span className="hidden sm:inline-block text-xs text-amore-deep-purple/50 dark:text-amore-lavender/50">
                Amore Anonymous College Confessions
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchStats();
                fetchConfessions();
              }}
              className="p-2.5 rounded-xl bg-white/50 dark:bg-amore-dark-card/50 border border-amore-pink/20 hover:bg-white/80 dark:hover:bg-amore-dark-card text-amore-deep-purple dark:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-amore-pink/20 dark:border-amore-lavender/10">
              <div className="w-8 h-8 rounded-full bg-amore-pink/40 flex items-center justify-center font-bold text-xs text-amore-deep-purple">
                AD
              </div>
              <span className="text-xs font-semibold text-amore-deep-purple dark:text-white">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Settings Tab */}
          {currentView === 'settings' ? (
            <AdminSettings />
          ) : (
            <>
              {/* Statistics Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                {/* Total */}
                <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-1">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amore-deep-purple/50 dark:text-amore-pink/60">
                    Total
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-amore-deep-purple dark:text-white">
                    {stats.total}
                  </div>
                </div>

                {/* Pending */}
                <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-1 border-amber-500/20">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Pending
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {stats.pending}
                  </div>
                </div>

                {/* Approved */}
                <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-1 border-green-500/20">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
                    Approved
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.approved}
                  </div>
                </div>

                {/* Rejected */}
                <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-1 border-red-500/20">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-red-500">
                    Rejected
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-red-500">
                    {stats.rejected}
                  </div>
                </div>

                {/* Instagram Published */}
                <div className="glass-card p-4 sm:p-5 rounded-2xl space-y-1 col-span-2 sm:col-span-1 border-purple-500/20">
                  <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    On Instagram
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.published}
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-amore-deep-purple/40 dark:text-amore-lavender/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by crush name, sender, or ID..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="input-field pl-10 text-xs py-2.5"
                  />
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Department filter */}
                  <select
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedDepartment(e.target.value);
                      setSelectedYear('');
                      setCurrentPage(1);
                    }}
                    className="input-field text-xs py-2.5 px-3 w-auto cursor-pointer"
                  >
                    <option value="">All Departments</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>

                  {/* Year filter (if department selected) */}
                  {selectedDepartment && (
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        setSelectedYear(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="input-field text-xs py-2.5 px-3 w-auto cursor-pointer"
                    >
                      <option value="">All Years</option>
                      {DEPARTMENT_YEARS[selectedDepartment as Department]?.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr} Year
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Date Sort Toggle */}
                  <button
                    onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    className="btn-secondary text-xs py-2.5 px-3.5 flex items-center gap-1.5"
                    title={sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
                  </button>
                </div>
              </div>

              {/* Confessions Listing */}
              <div className="glass-card-strong rounded-3xl p-4 sm:p-6 shadow-pink-md border border-white/60 dark:border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-amore-pink/20 dark:border-amore-lavender/10">
                  <h3 className="font-serif text-lg font-bold text-amore-deep-purple dark:text-white">
                    Confessions ({totalCount})
                  </h3>
                  <span className="text-xs text-amore-deep-purple/50 dark:text-amore-lavender/50">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                </div>

                {isLoading ? (
                  <div className="py-16">
                    <LoadingAnimation text="Loading submissions..." />
                  </div>
                ) : confessions.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <Heart className="w-10 h-10 mx-auto text-amore-pink/40" />
                    <p className="text-sm font-semibold text-amore-deep-purple/70 dark:text-amore-lavender/70">
                      No confessions found matching your filter criteria.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {confessions.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 sm:p-5 rounded-2xl bg-white/50 dark:bg-amore-dark-bg/50 border border-amore-pink/15 hover:border-amore-pink/40 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                      >
                        {/* Confession info */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-serif font-bold text-base text-amore-deep-purple dark:text-white truncate">
                              To: {item.crush_name}
                            </span>
                            <span className="text-xs text-amore-deep-purple/50 dark:text-amore-lavender/50">
                              from {item.sender_name?.trim() || 'Anonymous'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amore-pink/20 text-amore-deep-purple dark:text-amore-pink">
                              {item.department} • {item.academic_year}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                item.status === 'approved'
                                  ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                                  : item.status === 'rejected'
                                  ? 'bg-red-500/20 text-red-600 dark:text-red-300'
                                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              {item.status}
                            </span>
                            {item.instagram_published && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300">
                                Instagram Posted
                              </span>
                            )}
                          </div>

                          <p className="text-xs sm:text-sm text-amore-deep-purple/75 dark:text-amore-lavender/80 line-clamp-2 font-light">
                            {item.confession_message}
                          </p>

                          <div className="text-[11px] text-amore-deep-purple/40 dark:text-amore-lavender/40 flex items-center gap-3">
                            <span>{new Date(item.created_at).toLocaleDateString()}</span>
                            <span>
                              Consent:{' '}
                              <strong className={item.publication_consent ? 'text-green-500' : 'text-red-500'}>
                                {item.publication_consent ? 'Yes' : 'No'}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                          {/* Details / Report */}
                          <button
                            onClick={() => {
                              setActiveConfession(item);
                              setIsDetailsOpen(true);
                            }}
                            className="p-2 rounded-xl bg-amore-pink/20 hover:bg-amore-pink/30 text-amore-deep-purple dark:text-amore-pink transition-colors"
                            title="View Full Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Instagram Story (if consent provided) */}
                          {item.publication_consent && (
                            <button
                              onClick={() => {
                                setActiveConfession(item);
                                setIsInstagramModalOpen(true);
                              }}
                              className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-600 dark:text-purple-300 transition-colors"
                              title="Generate Instagram Story"
                            >
                              <Instagram className="w-4 h-4" />
                            </button>
                          )}

                          {/* Approve */}
                          {item.status !== 'approved' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'approved')}
                              className="p-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-700 dark:text-green-300 transition-colors"
                              title="Approve"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reject */}
                          {item.status !== 'rejected' && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'rejected')}
                              className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-700 dark:text-amber-300 transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm('Delete this confession?')) {
                                handleDelete(item.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pt-4 flex items-center justify-between border-t border-amore-pink/20 dark:border-amore-lavender/10">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <span className="text-xs text-amore-deep-purple/60 dark:text-amore-lavender/60">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="btn-secondary text-xs py-2 px-3 flex items-center gap-1 disabled:opacity-40"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Confession Report Modal */}
      <ConfessionDetailsModal
        confession={activeConfession}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setActiveConfession(null);
        }}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onOpenInstagramModal={(c) => {
          setActiveConfession(c);
          setIsInstagramModalOpen(true);
        }}
      />

      {/* Instagram Story Generator Modal */}
      <InstagramStoryModal
        confession={activeConfession}
        isOpen={isInstagramModalOpen}
        onClose={() => {
          setIsInstagramModalOpen(false);
          setActiveConfession(null);
        }}
        onMarkPublished={handleMarkPublished}
      />
    </div>
  );
}

