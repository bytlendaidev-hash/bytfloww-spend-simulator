import React, { useEffect, useState } from 'react';

export type SpatialEnvironmentType = 
  | 'titanium_prism'
  | 'bytlend_gold_obsidian' 
  | 'bytlend_champagne' 
  | 'living_room' 
  | 'twilight_penthouse' 
  | 'cosmic_mesh';

interface SpatialBackgroundProps {
  environment?: SpatialEnvironmentType;
  isDark?: boolean;
}

export const SpatialBackground: React.FC<SpatialBackgroundProps> = ({ 
  environment = 'titanium_prism',
  isDark,
}) => {
  const [currentEnv, setCurrentEnv] = useState<SpatialEnvironmentType>(() => {
    const saved = localStorage.getItem('bytfloww_spatial_env');
    if (saved === 'living_room' || saved === 'twilight_penthouse' || !saved) {
      const defaultEnv = isDark === false ? 'bytlend_champagne' : 'titanium_prism';
      localStorage.setItem('bytfloww_spatial_env', defaultEnv);
      return defaultEnv;
    }
    return (saved as SpatialEnvironmentType) || (isDark === false ? 'bytlend_champagne' : 'titanium_prism');
  });
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Sync when isDark prop changes
  useEffect(() => {
    if (isDark !== undefined) {
      const targetEnv = isDark ? 'titanium_prism' : 'bytlend_champagne';
      setCurrentEnv(targetEnv);
    }
  }, [isDark]);

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
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-abyss-canvas"
      aria-hidden="true"
    >
      {/* ── 1. SOLID DYNAMIC CANVAS ──────────────────────────────────────── */}
      <div className="absolute inset-0 bg-abyss-canvas transition-colors duration-300" />

      {/* ── 3. MICRO-GRAIN NOISE OVERLAY ─────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.015] mix-blend-overlay"
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
