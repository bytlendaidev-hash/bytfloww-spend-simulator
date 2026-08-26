import React, { useEffect, useState } from 'react';

export const SpatialBackground: React.FC = () => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (prefersReducedMotion || isTouch) return;

    let timeoutId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (timeoutId) return;
      timeoutId = window.requestAnimationFrame(() => {
        const normX = (e.clientX / window.innerWidth - 0.5) * 20;
        const normY = (e.clientY / window.innerHeight - 0.5) * 20;
        setMouseOffset({ x: normX, y: normY });
        timeoutId = 0;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutId) window.cancelAnimationFrame(timeoutId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
      style={{ backgroundColor: '#070B0E' }}
    >
      {/* ── 1. DEEP COSMIC MESH GRADIENT CANVAS ──────────────────────────── */}
      <div 
        className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          background: `
            radial-gradient(circle at 20% 15%, rgba(14, 38, 48, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(30, 20, 50, 0.45) 0%, transparent 45%),
            radial-gradient(circle at 50% 85%, rgba(10, 28, 38, 0.5) 0%, transparent 60%),
            radial-gradient(circle at 50% 50%, rgba(6, 12, 16, 1) 0%, rgba(4, 8, 11, 1) 100%)
          `,
          transform: `scale(1.05) translate(${mouseOffset.x * -0.4}px, ${mouseOffset.y * -0.4}px)`,
        }}
      />

      {/* ── 2. SUBTLE RADIAL LIGHT ORBS (MUTED COSMIC TONES) ─────────────── */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[65vw] h-[65vw] max-w-[900px] max-h-[900px] rounded-full blur-[140px] opacity-40 animate-spatial-atmosphere pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(10, 132, 255, 0.22) 0%, rgba(0, 242, 254, 0.12) 40%, transparent 70%)',
          transform: `translate(${mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px)`,
        }}
      />

      <div
        className="absolute top-[25%] -right-[15%] w-[60vw] h-[60vw] max-w-[850px] max-h-[850px] rounded-full blur-[160px] opacity-35 animate-spatial-atmosphere pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(175, 82, 222, 0.20) 0%, rgba(99, 102, 241, 0.12) 45%, transparent 75%)',
          transform: `translate(${mouseOffset.x * -0.6}px, ${mouseOffset.y * -0.6}px)`,
        }}
      />

      {/* ── 3. MICRO-GRAIN TACTILE NOISE OVERLAY ─────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.025] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="spatialNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#spatialNoise)" />
      </svg>
    </div>
  );
};
