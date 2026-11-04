import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Heart, ShieldCheck, Instagram, Sparkles, Send, Lock, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-between selection:bg-amore-pink/40 selection:text-amore-deep-purple">
      <Navbar />

      <div className="flex-1">
        <Hero />

        {/* How It Works Section */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase tracking-widest font-bold text-amore-deep-purple/60 dark:text-amore-pink/70">
              The Journey of a Confession
            </h2>
            <p className="font-serif text-3xl sm:text-4xl font-bold text-amore-deep-purple dark:text-white">
              How Amore Works
            </p>
            <p className="text-sm sm:text-base text-amore-deep-purple/70 dark:text-amore-lavender/70">
              Thoughtfully built for college students to express themselves with absolute peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="glass-card p-8 relative flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amore-pink/30 to-amore-lavender/30 flex items-center justify-center text-amore-deep-purple dark:text-amore-pink mb-6 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amore-pink mb-2">Step 1</span>
              <h3 className="font-serif text-xl font-bold text-amore-deep-purple dark:text-white mb-3">
                Pour Your Heart Out
              </h3>
              <p className="text-sm text-amore-deep-purple/70 dark:text-amore-lavender/70 leading-relaxed">
                Choose your department, enter your crush's name, and write your heartfelt message. No login or email required.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-8 relative flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amore-pink/30 to-amore-lavender/30 flex items-center justify-center text-amore-deep-purple dark:text-amore-pink mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amore-pink mb-2">Step 2</span>
              <h3 className="font-serif text-xl font-bold text-amore-deep-purple dark:text-white mb-3">
                Moderated with Care
              </h3>
              <p className="text-sm text-amore-deep-purple/70 dark:text-amore-lavender/70 leading-relaxed">
                The authorized administrator reviews every confession to keep the platform respectful, healthy, and safe for everyone.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-8 relative flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amore-pink/30 to-amore-lavender/30 flex items-center justify-center text-amore-deep-purple dark:text-amore-pink mb-6 group-hover:scale-110 transition-transform">
                <Instagram className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amore-pink mb-2">Step 3</span>
              <h3 className="font-serif text-xl font-bold text-amore-deep-purple dark:text-white mb-3">
                Featured on Instagram
              </h3>
              <p className="text-sm text-amore-deep-purple/70 dark:text-amore-lavender/70 leading-relaxed">
                With your explicit consent, approved confessions are styled into romantic story cards and shared on the college Instagram.
              </p>
            </div>
          </div>

          {/* Bottom Banner */}
          <div className="mt-16 glass-card-strong p-8 sm:p-12 text-center rounded-3xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-amore-deep-purple dark:text-white">
                Ready to speak your mind?
              </h3>
              <p className="text-sm sm:text-base text-amore-deep-purple/75 dark:text-amore-lavender/80">
                It only takes a minute, and your confession might just make someone's entire semester.
              </p>
              <div className="pt-2">
                <Link
                  href="/confess"
                  className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5"
                >
                  <span>Confess Your Feelings</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Romantic Footer */}
      <footer className="border-t border-amore-pink/20 dark:border-amore-lavender/10 bg-white/40 dark:bg-amore-dark-bg/40 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg text-amore-deep-purple dark:text-white">Amore</span>
            <span className="text-xs text-amore-deep-purple/50 dark:text-amore-lavender/50">
              • Anonymous College Confession Platform
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-amore-deep-purple/70 dark:text-amore-lavender/70">
            <Link href="/confess" className="hover:underline">
              Submit Confession
            </Link>
            <Link href="/admin/login" className="hover:underline">
              Admin Portal
            </Link>
          </div>

          <div className="text-xs text-amore-deep-purple/50 dark:text-amore-lavender/50">
            Built with care for college hearts.
          </div>
        </div>
      </footer>
    </main>
  );
}

