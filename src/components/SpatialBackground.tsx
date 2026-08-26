import React, { useEffect, useState } from 'react';

interface SpatialBackgroundProps {
  isDark: boolean;
}

export const SpatialBackground: React.FC<SpatialBackgroundProps> = ({ isDark }) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (prefersReducedMotion || isTouch) return;

    let timeoutId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (timeoutId) return;
      timeoutId = window.requestAnimationFrame(() => {
        const normX = (e.clientX / window.innerWidth - 0.5) * 16;
        const normY = (e.clientY / window.innerHeight - 0.5) * 16;
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
    >
      {/* ── 1. REAL VISION PRO PASSTHROUGH LIVING ROOM ENVIRONMENT IMAGE ── */}
      <div 
        className="absolute inset-[-20px] bg-cover bg-center transition-transform duration-700 ease-out"
        style={{
          backgroundImage: `url('/visionos_living_room_bg.jpg')`,
          transform: `scale(1.04) translate(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px)`,
          filter: isDark 
            ? 'brightness(0.65) contrast(1.1) saturate(1.15)' 
            : 'brightness(0.92) contrast(1.05) saturate(1.1)',
        }}
      />

      {/* ── 2. ATMOSPHERIC SPATIAL COLOR OVERLAY ──────────────────────────── */}
      <div 
        className={`absolute inset-0 transition-colors duration-500 ${
          isDark 
            ? 'bg-gradient-to-b from-black/40 via-[#061214]/60 to-black/80 backdrop-blur-[2px]' 
            : 'bg-gradient-to-b from-white/30 via-slate-900/10 to-slate-950/40 backdrop-blur-[1px]'
        }`}
      />

      {/* ── 3. AMBIENT DIFFUSE ORB (TOP-LEFT DAYLIGHT WINDOW GLOW) ───────── */}
      <div
        className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] opacity-60 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, rgba(16, 185, 129, 0.10) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255, 255, 255, 0.6) 0%, rgba(16, 185, 129, 0.15) 50%, transparent 70%)',
          transform: `translate(${mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px)`,
        }}
      />

      {/* ── 4. AMBIENT DIFFUSE ORB (RIGHT EMERALD / GOLD LAMP ACCENT) ────── */}
      <div
        className="absolute top-[20%] -right-[10%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full blur-[120px] opacity-50 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, rgba(99, 102, 241, 0.10) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.08) 50%, transparent 75%)',
          transform: `translate(${mouseOffset.x * -0.6}px, ${mouseOffset.y * -0.6}px)`,
        }}
      />

      {/* ── 5. MICRO-GRAIN TACTILE NOISE OVERLAY ─────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.025] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="spatialNoise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
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

