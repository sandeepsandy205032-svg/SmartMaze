import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_THEMES } from '../../gameplay/mockMazeData';
import './hub-environment.css';

/**
 * HubEnvironment — SmartMaze Environmental Foundation
 * Displays the artwork of the player's global selectedTheme across the viewport.
 * Features smooth 900ms cross-fade transition when changing themes, subtle ambient drift,
 * and dark/sage vignetting overlays.
 *
 * @param {string} activeMode - Active mode for lighting hooks ('neutral' | 'play' | 'create' | 'lab' | 'settings')
 */
export default function HubEnvironment({ activeMode = 'neutral' }) {
  const { selectedTheme, isThemeTransitioning } = useApp();

  const themeObj = OFFICIAL_THEMES.find((t) => t.id === selectedTheme) || OFFICIAL_THEMES[0];
  const [displayImage, setDisplayImage] = useState(themeObj.image);
  const [fadeState, setFadeState] = useState(false);

  // Trigger subtle 900ms transition when theme changes
  useEffect(() => {
    setFadeState(true);

    const timer1 = setTimeout(() => {
      setDisplayImage(themeObj.image);
      setFadeState(false);
    }, 350);

    return () => clearTimeout(timer1);
  }, [themeObj.image]);

  return (
    <div
      className={`smartmaze-hub-env-root smartmaze-hub-env--${activeMode}`}
      aria-hidden="true"
    >
      {/* 1. Global Selected Theme Artwork Image */}
      <div
        className={`smartmaze-hub-env-image-wrapper ${
          fadeState || isThemeTransitioning ? 'smartmaze-env-transitioning' : ''
        }`}
      >
        <img
          src={displayImage}
          alt={themeObj.name}
          className="smartmaze-hub-env-image"
        />
      </div>

      {/* 2. Environmental Atmospheric Overlays */}
      <div className="smartmaze-hub-env-overlay" />
      <div className="smartmaze-hub-env-vignette" />
    </div>
  );
}
