import React, { useEffect, useState } from 'react';

export type SpatialEnvironmentType = 
  | 'bytlend_gold_obsidian' 
  | 'bytlend_champagne' 
  | 'living_room' 
  | 'twilight_penthouse' 
  | 'cosmic_mesh';

interface SpatialBackgroundProps {
  environment?: SpatialEnvironmentType;
}

export const SpatialBackground: React.FC<SpatialBackgroundProps> = ({ 
  environment = 'bytlend_gold_obsidian' 
}) => {
  const [currentEnv, setCurrentEnv] = useState<SpatialEnvironmentType>(() => {
    const saved = localStorage.getItem('bytfloww_spatial_env');
    if (saved === 'living_room' || saved === 'twilight_penthouse' || !saved) {
      localStorage.setItem('bytfloww_spatial_env', 'bytlend_gold_obsidian');
      return 'bytlend_gold_obsidian';
    }
    return (saved as SpatialEnvironmentType) || 'bytlend_gold_obsidian';
  });
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Listen for custom environment change events across the app
  useEffect(() => {
    const handleEnvChange = (e: CustomEvent<SpatialEnvironmentType>) => {
      if (e.detail) {
        setCurrentEnv(e.detail);
        localStorage.setItem('bytfloww_spatial_env', e.detail);
      }
    };
    window.addEventListener('spatial-env-change' as any, handleEnvChange);
    return () => window.removeEventListener('spatial-env-change' as any, handleEnvChange);
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (prefersReducedMotion || isTouch) return;

    let timeoutId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (timeoutId) return;
      timeoutId = window.requestAnimationFrame(() => {
        const normX = (e.clientX / window.innerWidth - 0.5) * 24;
        const normY = (e.clientY / window.innerHeight - 0.5) * 24;
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
      style={{ backgroundColor: currentEnv === 'bytlend_champagne' ? '#F8F6F0' : '#080C0E' }}
    >
      {/* ── 1. BYTLEND 3D GOLD & OBSIDIAN LUXURY FINTECH ENVIRONMENT ─────── */}
      {(currentEnv === 'bytlend_gold_obsidian' || !currentEnv) && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] scale-[1.06]"
          style={{
            backgroundImage: `url('/environments/bytlend_gold_obsidian.jpg')`,
            transform: `scale(1.06) translate(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px)`,
          }}
        />
      )}

      {/* ── 2. BYTLEND WARM CHAMPAGNE LUXURY ENVIRONMENT ─────────────────── */}
      {currentEnv === 'bytlend_champagne' && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] scale-[1.06]"
          style={{
            backgroundImage: `url('/environments/bytlend_champagne_luxury.jpg')`,
            transform: `scale(1.06) translate(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px)`,
          }}
        />
      )}

      {/* ── 3. VISION PRO LIVING ROOM ENVIRONMENT ────────────────────────── */}
      {currentEnv === 'living_room' && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] scale-[1.06]"
          style={{
            backgroundImage: `url('/environments/living_room.jpg')`,
            transform: `scale(1.06) translate(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px)`,
          }}
        />
      )}

      {/* ── 4. TWILIGHT PENTHOUSE ENVIRONMENT ────────────────────────────── */}
      {currentEnv === 'twilight_penthouse' && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] scale-[1.06]"
          style={{
            backgroundImage: `url('/environments/twilight_penthouse.jpg')`,
            transform: `scale(1.06) translate(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px)`,
          }}
        />
      )}

      {/* ── 5. DEEP COSMIC MESH GRADIENT ─────────────────────────────────── */}
      {currentEnv === 'cosmic_mesh' && (
        <div 
          className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            background: `
              radial-gradient(circle at 20% 15%, rgba(212, 175, 55, 0.25) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(30, 20, 50, 0.45) 0%, transparent 45%),
              radial-gradient(circle at 50% 85%, rgba(197, 160, 89, 0.2) 0%, transparent 60%),
              radial-gradient(circle at 50% 50%, rgba(8, 12, 14, 1) 0%, rgba(4, 8, 10, 1) 100%)
            `,
            transform: `scale(1.05) translate(${mouseOffset.x * -0.4}px, ${mouseOffset.y * -0.4}px)`,
          }}
        />
      )}

      {/* ── 6. ATMOSPHERIC LUXURY VIGNETTE & GOLD AMBIENT GLOW ──────────── */}
      {currentEnv !== 'bytlend_champagne' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-black/55" />
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.70) 100%)',
            }}
          />

          {/* Golden Warm Light Orbit Orb */}
          <div
            className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full blur-[140px] opacity-35 animate-spatial-atmosphere pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(212, 175, 55, 0.35) 0%, rgba(243, 230, 177, 0.15) 40%, transparent 70%)',
              transform: `translate(${mouseOffset.x * 0.7}px, ${mouseOffset.y * 0.7}px)`,
            }}
          />

          <div
            className="absolute top-[30%] -right-[15%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full blur-[160px] opacity-25 animate-spatial-atmosphere pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(197, 160, 89, 0.30) 0%, rgba(14, 20, 26, 0.2) 45%, transparent 75%)',
              transform: `translate(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px)`,
            }}
          />
        </>
      )}

      {/* ── 7. MICRO-GRAIN NOISE OVERLAY ─────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.02] mix-blend-overlay"
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
