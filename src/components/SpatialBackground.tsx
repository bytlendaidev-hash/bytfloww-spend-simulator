import React, { useEffect, useState } from 'react';
import { THEME_TEMPLATES, ThemeTemplateId, getActiveThemeId } from '../theme/themes';

interface SpatialBackgroundProps {
  isDark?: boolean;
}

export const SpatialBackground: React.FC<SpatialBackgroundProps> = ({ 
  isDark = true,
}) => {
  const [activeTheme, setActiveTheme] = useState<ThemeTemplateId>(getActiveThemeId());
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Listen for custom theme template change events across the app
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<ThemeTemplateId>) => {
      if (e.detail && e.detail in THEME_TEMPLATES) {
        setActiveTheme(e.detail);
      }
    };
    window.addEventListener('theme-template-change' as any, handleThemeChange);
    return () => window.removeEventListener('theme-template-change' as any, handleThemeChange);
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

  const currentTemplate = THEME_TEMPLATES[activeTheme] || THEME_TEMPLATES.apex_obsidian;
  const t = isDark ? currentTemplate.dark : currentTemplate.light;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500"
      style={{ backgroundColor: t.canvas }}
      aria-hidden="true"
    >
      {/* ── 1. DYNAMIC AMBIENT MESH GLOW ─────────────────────────────────── */}
      <div 
        className="absolute inset-0 transition-opacity duration-700 opacity-100"
        style={{
          background: t.ambientGlow,
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0)`,
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* ── 2. SUBTLE RADIAL HIGHLIGHT (CYBER / SPATIAL AESTHETIC) ───────── */}
      <div 
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{ backgroundColor: currentTemplate.swatches.ai }}
      />
      <div 
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{ backgroundColor: currentTemplate.swatches.primary }}
      />

      {/* ── 3. SUBTLE CYBER GRID TEXTURE ─────────────────────────────────── */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${isDark ? '#FFFFFF' : '#000000'} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── 4. MICRO-GRAIN NOISE OVERLAY ─────────────────────────────────── */}
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
