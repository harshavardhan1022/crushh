import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { ConfessionForm } from '@/components/ConfessionForm';
import { ArrowLeft, Lock, Heart } from 'lucide-react';

export const metadata = {
  title: 'Confess Your Feelings | Amore',
  description: 'Submit your anonymous college confession safely without creating an account.',
};

export default function ConfessPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-amore-pink/40 selection:text-amore-deep-purple">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Navigation back */}
        <div className="max-w-2xl mx-auto mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amore-deep-purple/70 dark:text-amore-lavender/70 hover:text-amore-deep-purple dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Confession Form Card */}
        <ConfessionForm />

        {/* Small Privacy Footer Notice */}
        <div className="max-w-md mx-auto text-center mt-8 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-amore-deep-purple/60 dark:text-amore-lavender/60">
            <Lock className="w-3 h-3 text-amore-pink" />
            <span>Submissions are strictly confidential and encrypted in transit.</span>
          </div>
          <p className="text-[11px] text-amore-deep-purple/40 dark:text-amore-lavender/40">
            Amore never stores IP addresses with submitted confessions. Your anonymity is fully protected.
          </p>
        </div>
      </main>

      <footer className="border-t border-amore-pink/20 dark:border-amore-lavender/10 bg-white/40 dark:bg-amore-dark-bg/40 backdrop-blur-md py-6 text-center text-xs text-amore-deep-purple/50 dark:text-amore-lavender/50">
        Amore • Anonymous College Confessions
      </footer>
    </div>
  );
}

