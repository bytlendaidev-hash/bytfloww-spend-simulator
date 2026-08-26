import React, { useEffect, useState } from 'react';

interface SpatialBackgroundProps {
  isDark: boolean;
}

export const SpatialBackground: React.FC<SpatialBackgroundProps> = ({ isDark }) => {
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Check if user prefers reduced motion or is on touch device
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (prefersReducedMotion || isTouch) return;

    let timeoutId: number;
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle mousemove for buttery smooth 60fps rendering
      if (timeoutId) return;
      timeoutId = window.requestAnimationFrame(() => {
        const normX = (e.clientX / window.innerWidth - 0.5) * 12;
        const normY = (e.clientY / window.innerHeight - 0.5) * 12;
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
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500"
      aria-hidden="true"
      style={{
        backgroundColor: isDark ? '#080D11' : '#F8FAFC',
      }}
    >
      {/* ── 1. LAYER 1: AMBIENT DIFFUSE ORB (TOP-LEFT CYAN / VIRIDIAN) ── */}
      <div
        className="absolute -top-[15%] -left-[10%] w-[65vw] h-[65vw] max-w-[900px] max-h-[900px] rounded-full blur-[110px] sm:blur-[140px] opacity-70 animate-spatial-drift-slow transition-transform duration-700 ease-out"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(0, 242, 254, 0.12) 0%, rgba(0, 200, 150, 0.08) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.09) 0%, rgba(6, 182, 212, 0.06) 50%, transparent 75%)',
          transform: `translate(${mouseOffset.x * 0.8}px, ${mouseOffset.y * 0.8}px)`,
        }}
      />

      {/* ── 2. LAYER 2: AMBIENT DIFFUSE ORB (TOP-RIGHT VIOLET / SELVEX) ── */}
      <div
        className="absolute -top-[10%] -right-[15%] w-[60vw] h-[60vw] max-w-[850px] max-h-[850px] rounded-full blur-[120px] sm:blur-[150px] opacity-65 animate-spatial-drift-reverse transition-transform duration-700 ease-out"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(139, 92, 246, 0.08) 50%, transparent 75%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.07) 0%, rgba(139, 92, 246, 0.04) 50%, transparent 75%)',
          transform: `translate(${mouseOffset.x * -0.6}px, ${mouseOffset.y * -0.6}px)`,
        }}
      />

      {/* ── 3. LAYER 3: AMBIENT DIFFUSE ORB (BOTTOM-CENTER WARM / TEAL) ── */}
      <div
        className="absolute -bottom-[20%] left-[20%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full blur-[130px] sm:blur-[160px] opacity-60 animate-spatial-drift-slow transition-transform duration-700 ease-out"
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(0, 200, 150, 0.08) 0%, rgba(245, 158, 11, 0.04) 55%, transparent 75%)'
            : 'radial-gradient(circle, rgba(245, 158, 11, 0.04) 0%, rgba(16, 185, 129, 0.05) 55%, transparent 75%)',
          transform: `translate(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px)`,
        }}
      />

      {/* ── 4. LAYER 4: MICRO-GRAIN TACTILE NOISE OVERLAY ─────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.018] mix-blend-overlay"
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
