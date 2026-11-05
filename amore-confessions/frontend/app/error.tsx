'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-amore-soft-pink/40 dark:bg-amore-dark-bg">
      <div className="glass-card-strong max-w-md w-full p-8 rounded-3xl shadow-pink-lg border border-white/60 dark:border-white/10 text-center space-y-6">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-amore-deep-purple dark:text-white">
            Something went wrong
          </h2>
          <p className="text-xs text-amore-deep-purple/70 dark:text-amore-lavender/70">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amore-pink text-amore-deep-purple font-bold text-xs shadow-pink-sm hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/50 dark:bg-amore-dark-card/50 border border-amore-pink/30 text-amore-deep-purple dark:text-white font-semibold text-xs hover:bg-white dark:hover:bg-amore-dark-card transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
