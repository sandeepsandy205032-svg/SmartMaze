import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { OFFICIAL_THEMES } from './mockMazeData';
import './gameplay-themes.css';
import './gameplay.css';

/**
 * ThemeEnvironment — Full-Screen Gameplay Environment Backdrop
 * Renders the player's global selectedTheme artwork image as full viewport backdrop
 * behind the large translucent architectural gameplay container.
 *
 * @param {React.ReactNode} children - Gameplay container & HUD components
 */
export default function ThemeEnvironment({ children }) {
  const { selectedTheme, isThemeTransitioning, reducedMotion } = useApp();

  const themeObj = OFFICIAL_THEMES.find((t) => t.id === selectedTheme) || OFFICIAL_THEMES[0];
  const [displayImage, setDisplayImage] = useState(themeObj.image);
  const [fadeState, setFadeState] = useState(false);

  // Transition theme artwork image smoothly (700-1200ms)
  useEffect(() => {
    setFadeState(true);

    const timer = setTimeout(() => {
      setDisplayImage(themeObj.image);
      setFadeState(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [themeObj.image]);

  const themeClass = `theme-${selectedTheme}`;

  return (
    <div className={`smartmaze-gameplay-environment ${themeClass}`}>
      {/* 1. Official Theme Artwork Image Backdrop Layer */}
      <div
        className={`smartmaze-gameplay-art-wrapper ${
          fadeState || isThemeTransitioning ? 'smartmaze-art-transitioning' : ''
        }`}
      >
        <img
          src={displayImage}
          alt={themeObj.name}
          className={`smartmaze-gameplay-art-img ${
            reducedMotion ? 'smartmaze-gameplay-art-img--static' : ''
          }`}
        />
        <div className="smartmaze-gameplay-art-overlay" />
      </div>

      {/* 2. Atmospheric Depth Fog Overlay */}
      <div
        className={`smartmaze-env-fog-layer ${
          reducedMotion ? 'smartmaze-env-fog-layer--static' : ''
        }`}
      />

      {/* 3. Foreground Content Container (HUD + Translucent Container) */}
      <div className="smartmaze-gameplay-content-wrapper">{children}</div>
    </div>
  );
}
