import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import HubEnvironment from './HubEnvironment';
import HubHeader from './HubHeader';
import ModeSelector from './ModeSelector';
import ModePreview from './ModePreview';
import SettingsModal from './SettingsModal';
import GlassContainer from '../common/GlassContainer';
import './hub.css';

/**
 * HubLayout — Primary Architectural SmartMaze Hub Container Component
 * Matches the composition, depth, and visual language of the reference layout:
 * - Top header bar with brand logo & userProfile badge
 * - Left vertical architectural glass sidebar panel
 * - Large central glass hero container with 4 horizontal portal entrance cards
 * - Bottom footer quote and version details
 *
 * @param {string} activeMode - Active mode ID ('play' | 'create' | 'challenges' | 'settings')
 * @param {Function} onSelectMode - Callback when a mode is selected
 * @param {Function} onReset - Callback to return to landing entrance
 */
export default function HubLayout({
  activeMode = 'play',
  onSelectMode,
  onReset,
}) {
  const { setCurrentScreen, openChallengesScreen, openCreateScreen, openProfileScreen, hubRevealKey } = useApp();
  const [hoveredMode, setHoveredMode] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const effectiveMode = hoveredMode || activeMode;

  const handleModeClick = (modeId) => {
    onSelectMode?.(modeId);
    if (modeId === 'play') {
      setCurrentScreen('levelSelect');
    } else if (modeId === 'create') {
      openCreateScreen();
    } else if (modeId === 'challenges') {
      openChallengesScreen();
    } else if (modeId === 'profile') {
      openProfileScreen();
    } else if (modeId === 'settings') {
      setShowSettings(true);
    }
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    onSelectMode?.('play');
  };

  return (
    <div className="smartmaze-hub-page-root">
      {/* 1. Full-Screen Global Selected Theme Backdrop Image */}
      <HubEnvironment activeMode={effectiveMode} />

      {/* 2. Top Header Bar */}
      <HubHeader onOpenSettings={() => setShowSettings(true)} />

      {/* 3. Centered Premium Glass Hero Stage with Revealing Animation */}
      <main className="smartmaze-hub-center-stage" key={hubRevealKey}>
        <GlassContainer
          variant="primary"
          className="smartmaze-hub-hero-container smartmaze-hub-reveal-active"
          interactive={true}
        >
          <div className="smartmaze-hero-content-box">
            {/* Central Welcome Header */}
            <div className="smartmaze-hero-header">
              <span className="smartmaze-welcome-tag">WELCOME TO</span>
              <h2 className="smartmaze-hero-title">SMARTMAZE</h2>
              <span className="smartmaze-hero-subtitle">DIFFERENT PATHS. A DEEPER YOU.</span>
            </div>

            {/* 4 Unique Architectural Portal Options */}
            <ModeSelector
              activeMode={activeMode}
              onSelectMode={handleModeClick}
              onHoverMode={setHoveredMode}
            />

            {/* Container Guidance & Footer Tags */}
            <ModePreview activeMode={effectiveMode} />
          </div>
        </GlassContainer>
      </main>

      {/* 4. Bottom Viewport Footer Row */}
      <footer className="smartmaze-hub-page-footer">
        <span className="smartmaze-page-quote">“Every maze hides a story.”</span>

        <button type="button" onClick={onReset} className="smartmaze-reset-entrance-btn">
          ↺ RETURN TO ENTRANCE
        </button>

        <span className="smartmaze-page-version">VERSION 1.0.0</span>
      </footer>

      {/* 5. Settings Modal (HUB -> SETTINGS -> THEME) */}
      {(showSettings || activeMode === 'settings') && (
        <SettingsModal onClose={handleCloseSettings} />
      )}
    </div>
  );
}
