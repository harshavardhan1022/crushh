'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Shield, Menu, X, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-amore-soft-pink/70 dark:bg-amore-dark-bg/75 border-b border-amore-pink/20 dark:border-amore-lavender/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-amore-pink rounded-xl p-1"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amore-pink to-amore-lavender flex items-center justify-center shadow-pink-sm group-hover:scale-105 transition-transform duration-200">
              {/* Pixel Heart Icon */}
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="text-amore-deep-purple">
                <rect x="2" y="4" width="2" height="2" fill="currentColor" />
                <rect x="4" y="2" width="2" height="2" fill="currentColor" />
                <rect x="6" y="2" width="2" height="2" fill="currentColor" />
                <rect x="8" y="4" width="2" height="2" fill="currentColor" />
                <rect x="10" y="2" width="2" height="2" fill="currentColor" />
                <rect x="12" y="2" width="2" height="2" fill="currentColor" />
                <rect x="14" y="4" width="2" height="2" fill="currentColor" />
                <rect x="2" y="6" width="14" height="2" fill="currentColor" />
                <rect x="4" y="8" width="10" height="2" fill="currentColor" />
                <rect x="6" y="10" width="6" height="2" fill="currentColor" />
                <rect x="8" y="12" width="2" height="2" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-amore-deep-purple dark:text-white">
                Amore
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-amore-deep-purple/60 dark:text-amore-pink/70 -mt-1">
                College Confessions
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive('/')
                  ? 'text-amore-deep-purple dark:text-white font-semibold'
                  : 'text-amore-deep-purple/70 dark:text-amore-lavender/70 hover:text-amore-deep-purple dark:hover:text-white'
              }`}
            >
              Home
            </Link>

            <Link
              href="/confess"
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive('/confess')
                  ? 'text-amore-deep-purple dark:text-white font-semibold'
                  : 'text-amore-deep-purple/70 dark:text-amore-lavender/70 hover:text-amore-deep-purple dark:hover:text-white'
              }`}
            >
              Confess
            </Link>

            <div className="h-4 w-[1px] bg-amore-pink/30 dark:bg-amore-lavender/20" />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Admin Link */}
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl bg-white/50 dark:bg-amore-dark-card/60 hover:bg-white/80 dark:hover:bg-amore-dark-card border border-amore-pink/30 dark:border-amore-lavender/20 text-amore-deep-purple dark:text-amore-pink transition-all duration-200 shadow-sm"
              title="Admin Portal"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />

            <Link
              href="/admin/login"
              className="p-2 rounded-xl bg-white/50 dark:bg-amore-dark-card/60 border border-amore-pink/30 text-amore-deep-purple dark:text-amore-pink"
              aria-label="Admin Login"
            >
              <Shield className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-white/50 dark:bg-amore-dark-card/60 border border-amore-pink/30 text-amore-deep-purple dark:text-white"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amore-pink/20 dark:border-amore-lavender/10 bg-amore-soft-pink/95 dark:bg-amore-dark-bg/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-base font-medium ${
              isActive('/') ? 'text-amore-deep-purple dark:text-white font-bold' : 'text-amore-deep-purple/70 dark:text-amore-lavender/70'
            }`}
          >
            Home
          </Link>
          <Link
            href="/confess"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-base font-medium ${
              isActive('/confess') ? 'text-amore-deep-purple dark:text-white font-bold' : 'text-amore-deep-purple/70 dark:text-amore-lavender/70'
            }`}
          >
            Confess Now
          </Link>
          <Link
            href="/admin/login"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-base font-medium text-amore-deep-purple/80 dark:text-amore-pink"
          >
            <Shield className="w-4 h-4" />
            Admin Portal
          </Link>
        </div>
      )}
    </nav>
  );
}

