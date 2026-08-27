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

  const currentTemplate = THEME_TEMPLATES[activeTheme] || THEME_TEMPLATES.aurora_cyber;
  const t = isDark ? currentTemplate.dark : currentTemplate.light;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-500"
      style={{ 
        background: isDark 
          ? 'radial-gradient(circle at 50% 25%, #0e2430 0%, #06131a 55%, #03080d 100%)' 
          : '#FFFFFF' 
      }}
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

      {/* ── 2. CELESTIAL ORBITAL GLOWS (Aurora Cyan & Violet/Magenta) ────── */}
      {isDark ? (
        <>
          {/* Vibrant Cyan Aura (Top-Left) */}
          <div 
            className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-[120px] pointer-events-none opacity-40 animate-pulse"
            style={{ 
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, rgba(56, 189, 248, 0.12) 40%, transparent 70%)',
              animationDuration: '8s'
            }}
          />

          {/* Electric Violet/Purple Radiance (Center Depth) */}
          <div 
            className="absolute top-1/4 -right-32 w-[700px] h-[700px] rounded-full blur-[130px] pointer-events-none opacity-30 animate-pulse"
            style={{ 
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.30) 0%, rgba(217, 70, 239, 0.10) 45%, transparent 75%)',
              animationDuration: '10s'
            }}
          />

          {/* Soft Amber / Champagne Depth Glow (Bottom-Left) */}
          <div 
            className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full blur-[110px] pointer-events-none opacity-20"
            style={{ 
              background: 'radial-gradient(circle, rgba(237, 193, 132, 0.20) 0%, transparent 70%)'
            }}
          />
        </>
      ) : (
        <>
          {/* Light Mode Champagne & Royal Indigo Glows */}
          <div 
            className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none opacity-25"
            style={{ 
              background: 'radial-gradient(circle, rgba(200, 138, 69, 0.18) 0%, transparent 70%)'
            }}
          />
          <div 
            className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none opacity-15"
            style={{ 
              background: 'radial-gradient(circle, rgba(61, 90, 254, 0.15) 0%, transparent 70%)'
            }}
          />
        </>
      )}

      {/* ── 3. CYBER PRECISION GRID TEXTURE ──────────────────────────────── */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: isDark
            ? 'radial-gradient(circle, rgba(6, 182, 212, 0.10) 1px, transparent 1px), linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)'
            : 'radial-gradient(circle, rgba(30, 41, 59, 0.08) 1.5px, transparent 1.5px), linear-gradient(to right, rgba(200, 138, 69, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(200, 138, 69, 0.05) 1px, transparent 1px)',
          backgroundSize: isDark ? '24px 24px, 48px 48px, 48px 48px' : '28px 28px, 56px 56px, 56px 56px',
          opacity: isDark ? 0.75 : 0.90,
        }}
      />

      {/* ── 4. TOP EDGE SPECULAR HIGHLIGHT ───────────────────────────────── */}
      <div 
        className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent 0%, rgba(6, 182, 212, 0.35) 30%, rgba(255, 255, 255, 0.6) 50%, rgba(139, 92, 246, 0.35) 70%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(200, 138, 69, 0.25) 30%, rgba(255, 255, 255, 0.95) 50%, rgba(200, 138, 69, 0.25) 70%, transparent 100%)',
        }}
      />
    </div>
  );
};
