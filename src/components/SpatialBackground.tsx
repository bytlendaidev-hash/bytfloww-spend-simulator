import React, { useEffect, useState } from 'react';

export type SpatialEnvironmentType = 'living_room' | 'twilight_penthouse' | 'cosmic_mesh';

interface SpatialBackgroundProps {
  environment?: SpatialEnvironmentType;
}

export const SpatialBackground: React.FC<SpatialBackgroundProps> = ({ 
  environment = 'living_room' 
}) => {
  const [currentEnv, setCurrentEnv] = useState<SpatialEnvironmentType>(() => {
    return (localStorage.getItem('bytfloww_spatial_env') as SpatialEnvironmentType) || environment;
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
      style={{ backgroundColor: '#070B0E' }}
    >
      {/* ── 1. APPLE VISION PRO PASS-THROUGH ENVIRONMENT IMAGE ───────────── */}
      {currentEnv === 'living_room' && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] scale-[1.06]"
          style={{
            backgroundImage: `url('/environments/living_room.jpg')`,
            transform: `scale(1.06) translate(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px)`,
          }}
        />
      )}

      {currentEnv === 'twilight_penthouse' && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] scale-[1.06]"
          style={{
            backgroundImage: `url('/environments/twilight_penthouse.jpg')`,
            transform: `scale(1.06) translate(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px)`,
          }}
        />
      )}

      {/* ── 2. DEEP COSMIC MESH GRADIENT (FOR COSMIC MODE OR BACKUP) ─────── */}
      {currentEnv === 'cosmic_mesh' && (
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
      )}

      {/* ── 3. ATMOSPHERIC SPATIAL DARKENING & DEPTH VIGNETTE OVERLAY ───── */}
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/35 to-black/50"
      />
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)',
        }}
      />

      {/* ── 4. SUBTLE AMBIENT RADIAL LIGHT ORBS (SPATIAL ILLUMINATION) ──── */}
      <div
        className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] rounded-full blur-[140px] opacity-30 animate-spatial-atmosphere pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(10, 132, 255, 0.25) 0%, rgba(48, 209, 88, 0.15) 40%, transparent 70%)',
          transform: `translate(${mouseOffset.x * 0.7}px, ${mouseOffset.y * 0.7}px)`,
        }}
      />

      <div
        className="absolute top-[30%] -right-[15%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full blur-[160px] opacity-25 animate-spatial-atmosphere pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(175, 82, 222, 0.22) 0%, rgba(99, 102, 241, 0.15) 45%, transparent 75%)',
          transform: `translate(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px)`,
        }}
      />

      {/* ── 5. MICRO-GRAIN TACTILE NOISE OVERLAY ─────────────────────────── */}
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
