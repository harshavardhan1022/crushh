'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Lock, ShieldCheck, Sparkles, Send, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amore-pink/25 via-amore-lavender/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-amore-pink/15 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hero Text & CTA */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-8">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 dark:bg-amore-dark-card/80 border border-amore-pink/40 dark:border-amore-lavender/20 backdrop-blur-md shadow-pink-sm"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amore-pink opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amore-pink" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amore-deep-purple dark:text-amore-pink">
                Safe • Anonymous • Student Voices
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-amore-deep-purple dark:text-white leading-[1.15]"
            >
              Some feelings{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amore-pink via-purple-400 to-amore-lavender underline decoration-amore-pink/40 decoration-wavy decoration-2">
                deserve to be heard.
              </span>
            </motion.h1>

            {/* Supporting Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-amore-deep-purple/75 dark:text-amore-lavender/80 max-w-2xl leading-relaxed mx-auto lg:mx-0 font-light"
            >
              A little secret, a hidden feeling, or a story waiting to be told. Confess your feelings for your campus crush completely anonymously without ever creating an account.
            </motion.p>

            {/* Action CTA & Privacy Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link
                href="/confess"
                className="btn-primary w-full sm:w-auto text-center flex items-center justify-center gap-2.5 text-base py-4 px-8 group font-bold tracking-wide"
              >
                <span>Confess Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center gap-2 text-xs font-medium text-amore-deep-purple/60 dark:text-amore-lavender/60 py-2">
                <Lock className="w-3.5 h-3.5 text-amore-pink" />
                <span>100% Anonymous. No account needed.</span>
              </div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-4 grid grid-cols-3 gap-3 max-w-md mx-auto lg:mx-0 border-t border-amore-pink/20 dark:border-amore-lavender/10"
            >
              <div className="text-center lg:text-left">
                <div className="text-xl font-bold text-amore-deep-purple dark:text-white">Zero</div>
                <div className="text-xs text-amore-deep-purple/60 dark:text-amore-lavender/60">Logins or Tracking</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl font-bold text-amore-deep-purple dark:text-white">Admin</div>
                <div className="text-xs text-amore-deep-purple/60 dark:text-amore-lavender/60">Moderated with Care</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-xl font-bold text-amore-deep-purple dark:text-white">Stories</div>
                <div className="text-xs text-amore-deep-purple/60 dark:text-amore-lavender/60">Instagram Ready</div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Romantic Envelope / Letter Card Graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Outer floating decorative hearts */}
              <div className="absolute -top-6 -right-6 p-3 rounded-2xl bg-white/80 dark:bg-amore-dark-card/80 border border-amore-pink/30 shadow-pink-md backdrop-blur-xl animate-bounce">
                <span className="text-2xl">💌</span>
              </div>
              <div className="absolute -bottom-4 -left-4 p-3 rounded-2xl bg-white/80 dark:bg-amore-dark-card/80 border border-amore-lavender/30 shadow-pink-sm backdrop-blur-xl">
                <span className="text-xl">✨</span>
              </div>

              {/* Main Romantic Letter Glass Card */}
              <div className="glass-card-strong p-6 sm:p-8 relative overflow-hidden shadow-pink-lg border-2 border-white/60 dark:border-white/10">
                {/* Stamp */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-amore-pink/20 dark:border-amore-lavender/15">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-widest text-amore-deep-purple/50 dark:text-amore-pink/60 font-semibold">
                      Confession Envelope
                    </span>
                    <h3 className="font-serif text-xl font-bold text-amore-deep-purple dark:text-white">
                      Dear Someone Special,
                    </h3>
                  </div>
                  <div className="w-12 h-14 rounded-lg border-2 border-dashed border-amore-pink/60 bg-amore-pink/20 flex flex-col items-center justify-center text-center p-1">
                    <Heart className="w-5 h-5 text-amore-pink fill-amore-pink/60" />
                    <span className="text-[8px] font-bold tracking-tighter text-amore-deep-purple dark:text-amore-pink mt-0.5">AMORE</span>
                  </div>
                </div>

                {/* Sample snippet */}
                <div className="space-y-3 font-serif italic text-base sm:text-lg text-amore-deep-purple/85 dark:text-white/90 leading-relaxed bg-white/40 dark:bg-amore-dark-bg/40 p-4 rounded-xl border border-amore-pink/15">
                  <p>
                    &ldquo;Every time you walk into the library or smile during lectures, you make the whole room brighter. I might never say this out loud, but you are truly unforgettable.&rdquo;
                  </p>
                </div>

                {/* Sender tag */}
                <div className="mt-6 flex items-center justify-between pt-2">
                  <div className="text-xs text-amore-deep-purple/60 dark:text-amore-lavender/60">
                    <span className="font-semibold text-amore-deep-purple dark:text-amore-pink">— From Anonymous</span>
                    <span className="block text-[10px]">B.Tech • 3rd Year</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amore-pink/20 text-amore-deep-purple dark:text-amore-pink text-[11px] font-semibold">
                    <Sparkles className="w-3 h-3 text-amore-pink" />
                    <span>Sealed with love</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

