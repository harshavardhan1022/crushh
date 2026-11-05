'use client';

import React, { useState } from 'react';
import { Lock, Check, AlertCircle, Key, ShieldCheck } from 'lucide-react';

export function AdminSettings() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long.' });
      return;
    }

    setIsLoading(true);

    try {
      const token =
        localStorage.getItem('admin-token') || localStorage.getItem('amore-admin-token');
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setMessage({ type: 'success', text: 'Password successfully updated!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An error occurred.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="glass-card-strong p-6 sm:p-8 rounded-3xl space-y-6 border border-white/60 dark:border-white/10 shadow-pink-md">
        <div className="flex items-center gap-3 pb-4 border-b border-amore-pink/20 dark:border-amore-lavender/15">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amore-pink to-amore-lavender flex items-center justify-center text-amore-deep-purple">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-amore-deep-purple dark:text-white">
              Administrator Security Settings
            </h3>
            <p className="text-xs text-amore-deep-purple/60 dark:text-amore-lavender/60">
              Manage your administrator credentials and password
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
              message.type === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300'
                : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="newPassword"
              className="block text-xs font-semibold text-amore-deep-purple dark:text-white uppercase tracking-wider"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              placeholder="••••••••••••"
              disabled={isLoading}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
            />
            <p className="text-[11px] text-amore-deep-purple/50 dark:text-amore-lavender/50">
              Must be at least 8 characters with at least one letter and one number.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold text-amore-deep-purple dark:text-white uppercase tracking-wider"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              placeholder="••••••••••••"
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center justify-center gap-2 py-3 px-6 text-xs font-bold disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Updating...' : 'Update Admin Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

