'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Pixel heart SVG for the loading animation (larger version)
const HEART_PATTERN = [
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

function PixelHeartSVG({ size = 60 }: { size?: number }) {
  const cols = HEART_PATTERN[0].length;
  const rows = HEART_PATTERN.length;
  const px = size / cols;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {HEART_PATTERN.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect
              key={`${x}-${y}`}
              x={x * px}
              y={y * px}
              width={px}
              height={px}
              fill="#F7B6D2"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

interface LoadingAnimationProps {
  text?: string;
  overlay?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 32,
  md: 60,
  lg: 96,
};

export function LoadingAnimation({
  text,
  overlay = false,
  size = 'md',
}: LoadingAnimationProps) {
  const heartSize = sizeMap[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Heartbeat animation */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1, 1.15, 1],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative"
      >
        {/* Glow effect behind heart */}
        <motion.div
          className="absolute inset-0 blur-xl rounded-full"
          animate={{
            opacity: [0.3, 0.6, 0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: 'radial-gradient(circle, rgba(247,182,210,0.6) 0%, transparent 70%)',
            width: heartSize * 1.8,
            height: heartSize * 1.8,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <PixelHeartSVG size={heartSize} />
      </motion.div>

      {/* Loading text */}
      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="text-sm font-medium text-amore-deep-purple/60 dark:text-amore-pink/60"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-amore-soft-pink/60 dark:bg-amore-dark-bg/80 backdrop-blur-sm"
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full py-12">
      {content}
    </div>
  );
}
