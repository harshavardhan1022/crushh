'use client';

import React, { useEffect, useRef, useCallback } from 'react';

// 8x8 pixel heart pattern (1 = filled, 0 = empty)
const HEART_PATTERN = [
  [0, 1, 1, 0, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const PIXEL_SIZE = 2;
const HEART_SIZE = HEART_PATTERN.length * PIXEL_SIZE;

function createHeartSVG(color: string = '#F7B6D2', size: number = HEART_SIZE): string {
  let rects = '';
  for (let y = 0; y < HEART_PATTERN.length; y++) {
    for (let x = 0; x < HEART_PATTERN[y].length; x++) {
      if (HEART_PATTERN[y][x]) {
        rects += `<rect x="${x * PIXEL_SIZE}" y="${y * PIXEL_SIZE}" width="${PIXEL_SIZE}" height="${PIXEL_SIZE}" fill="${color}"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${rects}</svg>`;
}

interface TrailHeart {
  x: number;
  y: number;
  opacity: number;
  scale: number;
  element: HTMLDivElement;
}

interface TouchHeart {
  element: HTMLDivElement;
  startTime: number;
}

export function HeartCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const trailsRef = useRef<TrailHeart[]>([]);
  const touchHeartsRef = useRef<TouchHeart[]>([]);
  const mousePos = useRef({ x: -100, y: -100 });
  const cursorPos = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const lastTrailTime = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isTouchDevice = useRef(false);
  const reducedMotion = useRef(false);

  const createTrailElement = useCallback((): HTMLDivElement => {
    const el = document.createElement('div');
    el.innerHTML = createHeartSVG('#F7B6D2', HEART_SIZE);
    el.style.cssText =
      'position:fixed;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:none;will-change:transform,opacity;';
    return el;
  }, []);

  const createTouchHeartElement = useCallback((x: number, y: number): HTMLDivElement => {
    const el = document.createElement('div');
    el.innerHTML = createHeartSVG('#F7B6D2', 24);
    el.style.cssText = `position:fixed;pointer-events:none;z-index:9998;left:${x}px;top:${y}px;transform:translate(-50%,-50%) scale(0);opacity:1;transition:transform 0.6s cubic-bezier(0.175,0.885,0.32,1.275),opacity 0.6s ease-out;will-change:transform,opacity;`;
    return el;
  }, []);

  // Desktop: animate cursor & trails
  const animate = useCallback(() => {
    if (reducedMotion.current || isTouchDevice.current) return;

    // Lerp cursor position for smoothness
    const lerp = 0.15;
    cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * lerp;
    cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * lerp;

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${cursorPos.current.x - HEART_SIZE / 2}px, ${cursorPos.current.y - HEART_SIZE / 2}px)`;
    }

    // Fade out trails
    const now = performance.now();
    for (let i = trailsRef.current.length - 1; i >= 0; i--) {
      const trail = trailsRef.current[i];
      trail.opacity -= 0.03;
      trail.scale -= 0.015;

      if (trail.opacity <= 0) {
        trail.element.remove();
        trailsRef.current.splice(i, 1);
      } else {
        trail.element.style.opacity = String(trail.opacity);
        trail.element.style.transform = `translate(${trail.x - HEART_SIZE / 2}px, ${trail.y - HEART_SIZE / 2}px) scale(${Math.max(0, trail.scale)})`;
      }
    }

    // Spawn trail hearts every ~80ms if cursor moved enough
    const dx = mousePos.current.x - cursorPos.current.x;
    const dy = mousePos.current.y - cursorPos.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 2 && now - lastTrailTime.current > 80 && trailsRef.current.length < 8) {
      const trailEl = createTrailElement();
      document.body.appendChild(trailEl);
      const trail: TrailHeart = {
        x: cursorPos.current.x,
        y: cursorPos.current.y,
        opacity: 0.6,
        scale: 0.8,
        element: trailEl,
      };
      trailsRef.current.push(trail);
      lastTrailTime.current = now;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [createTrailElement]);

  useEffect(() => {
    // Check reduced motion preference
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion.current) return;

    // Detect touch device
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice.current) {
      // --- DESKTOP: custom cursor ---
      document.documentElement.classList.add('custom-cursor');

      const cursor = document.createElement('div');
      cursor.innerHTML = createHeartSVG('#F7B6D2', HEART_SIZE);
      cursor.style.cssText =
        'position:fixed;top:0;left:0;pointer-events:none;z-index:9999;will-change:transform;';
      document.body.appendChild(cursor);
      cursorRef.current = cursor;

      const onMouseMove = (e: MouseEvent) => {
        mousePos.current.x = e.clientX;
        mousePos.current.y = e.clientY;
      };

      const onMouseLeave = () => {
        mousePos.current.x = -100;
        mousePos.current.y = -100;
        cursorPos.current.x = -100;
        cursorPos.current.y = -100;
      };

      document.addEventListener('mousemove', onMouseMove, { passive: true });
      document.addEventListener('mouseleave', onMouseLeave);

      rafRef.current = requestAnimationFrame(animate);

      return () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseleave', onMouseLeave);
        document.documentElement.classList.remove('custom-cursor');
        cancelAnimationFrame(rafRef.current);
        cursor.remove();
        trailsRef.current.forEach((t) => t.element.remove());
        trailsRef.current = [];
      };
    } else {
      // --- MOBILE: touch heart bursts ---
      const onTouchStart = (e: TouchEvent) => {
        if (reducedMotion.current) return;

        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          const el = document.createElement('div');
          el.innerHTML = createHeartSVG('#F7B6D2', 24);
          el.style.cssText = `position:fixed;pointer-events:none;z-index:9998;left:${touch.clientX}px;top:${touch.clientY}px;transform:translate(-50%,-50%) scale(0);opacity:1;will-change:transform,opacity;`;
          document.body.appendChild(el);

          // Force reflow then animate
          el.getBoundingClientRect();
          el.style.transition =
            'transform 0.6s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.6s ease-out';
          el.style.transform = 'translate(-50%,-50%) scale(1.5)';
          el.style.opacity = '0';

          const heart: TouchHeart = { element: el, startTime: performance.now() };
          touchHeartsRef.current.push(heart);

          setTimeout(() => {
            el.remove();
            touchHeartsRef.current = touchHeartsRef.current.filter((h) => h !== heart);
          }, 700);
        }
      };

      document.addEventListener('touchstart', onTouchStart, { passive: true });

      return () => {
        document.removeEventListener('touchstart', onTouchStart);
        touchHeartsRef.current.forEach((h) => h.element.remove());
        touchHeartsRef.current = [];
      };
    }
  }, [animate, createTouchHeartElement]);

  // This component renders nothing into the React tree
  return null;
}
