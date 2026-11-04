'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LoadingAnimation } from '@/components/LoadingAnimation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
      }

      // Store token in localStorage if rememberMe or for client API headers
      if (data.token) {
        localStorage.setItem('amore-admin-token', data.token);
      }

      // Successful login -> Redirect to dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-amore-soft-pink via-purple-100 to-amore-lavender/30 dark:from-amore-dark-bg dark:via-[#1c122c] dark:to-[#25153b] selection:bg-amore-pink/40 selection:text-amore-deep-purple">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amore-pink/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amore-lavender/25 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 sm:p-8 flex items-center justify-between z-10 max-w-7xl mx-auto w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-amore-deep-purple/70 dark:text-amore-lavender/70 hover:text-amore-deep-purple dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Centered Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card-strong p-8 sm:p-10 rounded-3xl shadow-pink-lg border border-white/60 dark:border-white/10 space-y-7">
            {/* Logo Motif & Header */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amore-pink to-amore-lavender flex items-center justify-center shadow-pink-sm text-amore-deep-purple">
                <Shield className="w-7 h-7" />
              </div>
              <h1 className="font-serif text-3xl font-bold text-amore-deep-purple dark:text-white pt-2">
                Welcome Back
              </h1>
              <p className="text-xs uppercase tracking-widest font-semibold text-amore-deep-purple/60 dark:text-amore-pink/70">
                Amore Admin Portal
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="adminEmail"
                  className="block text-xs font-semibold text-amore-deep-purple dark:text-white uppercase tracking-wider"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-amore-deep-purple/40 dark:text-amore-lavender/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="adminEmail"
                    type="email"
                    required
                    placeholder="admin@college.edu"
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="adminPassword"
                  className="block text-xs font-semibold text-amore-deep-purple dark:text-white uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-amore-deep-purple/40 dark:text-amore-lavender/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="adminPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    disabled={isLoading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amore-deep-purple/40 dark:text-amore-lavender/40 hover:text-amore-deep-purple dark:hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-amore-deep-purple/75 dark:text-amore-lavender/75">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-amore-pink/40 text-amore-pink focus:ring-amore-pink accent-amore-pink"
                  />
                  <span>Remember session</span>
                </label>

                <span className="text-[11px] text-amore-deep-purple/40 dark:text-amore-lavender/40">
                  Protected System
                </span>
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold disabled:opacity-50 group"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <LoadingAnimation size="sm" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <span>Sign In to Portal</span>
                  )}
                </button>
              </div>
            </form>

            <div className="text-center pt-2 border-t border-amore-pink/20 dark:border-amore-lavender/10">
              <p className="text-[11px] text-amore-deep-purple/50 dark:text-amore-lavender/50">
                Unauthorized access attempts are logged and strictly monitored.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-amore-deep-purple/40 dark:text-amore-lavender/40 z-10">
        Amore Platform Administration • Confidential
      </footer>
    </div>
  );
}

