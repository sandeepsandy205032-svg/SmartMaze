import React from 'react';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_THEMES } from '../../gameplay/mockMazeData';
import GhostButton from '../common/GhostButton';
import './hub.css';

/**
 * SettingsModal — SmartMaze System Preferences & Theme Selection Component
 * Path: HUB -> SETTINGS -> THEME
 * Renders visual cards using the four official artwork images for global theme selection,
 * alongside centralized accessibility controls (Reduced Motion).
 *
 * @param {Function} onClose - Callback to close settings overlay
 */
export default function SettingsModal({ onClose }) {
  const {
    selectedTheme,
    changeTheme,
    isThemeTransitioning,
    reducedMotion,
    toggleReducedMotion,
    openProfileScreen,
    logoutUser,
  } = useApp();

  return (
    <div className="smartmaze-settings-overlay">
      <div className="smartmaze-settings-backdrop" onClick={onClose} />

      <div className="smartmaze-settings-modal">
        {/* Modal Header */}
        <div className="smartmaze-settings-header">
          <div>
            <h2 className="smartmaze-settings-title">SYSTEM PREFERENCES</h2>
            <span className="smartmaze-settings-subtitle">HUB → SETTINGS → GLOBAL THEME</span>
          </div>

          <GhostButton onClick={onClose}>✕ CLOSE</GhostButton>
        </div>

        {/* Section 1: Global Theme Selection Grid */}
        <section className="smartmaze-settings-section">
          <div className="smartmaze-section-header">
            <span className="smartmaze-section-num">01</span>
            <h3 className="smartmaze-section-title">GLOBAL ENVIRONMENT THEME</h3>
          </div>
          <p className="smartmaze-section-desc">
            Select the environmental atmosphere that defines SmartMaze across the Hub, Gameplay, Create, and Challenges views.
          </p>

          <div className="smartmaze-theme-cards-grid">
            {OFFICIAL_THEMES.map((theme) => {
              const isSelected = selectedTheme === theme.id;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => changeTheme(theme.id)}
                  disabled={isThemeTransitioning}
                  className={`smartmaze-theme-card ${
                    isSelected ? 'smartmaze-theme-card--selected' : ''
                  }`}
                >
                  {/* Theme Artwork Visual Preview */}
                  <div className="smartmaze-theme-card-art-container">
                    <img
                      src={theme.image}
                      alt={theme.name}
                      className="smartmaze-theme-card-art"
                    />
                    <div className="smartmaze-theme-card-art-overlay" />

                    {/* Active State Badge */}
                    {isSelected && (
                      <div className="smartmaze-active-theme-badge">
                        <span className="smartmaze-badge-icon">✓</span>
                        <span>ACTIVE THEME</span>
                      </div>
                    )}
                  </div>

                  {/* Theme Metadata */}
                  <div className="smartmaze-theme-card-info">
                    <span className="smartmaze-theme-card-name">{theme.name}</span>
                    <p className="smartmaze-theme-card-desc">{theme.description}</p>
                    <span className="smartmaze-theme-card-subtext">{theme.subtext}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 2: Centralized Accessibility Controls */}
        <section className="smartmaze-settings-section" style={{ marginTop: '2rem' }}>
          <div className="smartmaze-section-header">
            <span className="smartmaze-section-num">02</span>
            <h3 className="smartmaze-section-title">ACCESSIBILITY & PREFERENCES</h3>
          </div>

          <div className="smartmaze-access-row">
            <div>
              <span className="smartmaze-access-label">REDUCED MOTION</span>
              <p className="smartmaze-access-desc">
                Subdues orb rotation, breathing illumination glow, motion trail ghosts, and camera spring movement.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleReducedMotion}
              className={`smartmaze-access-toggle ${
                reducedMotion ? 'smartmaze-access-toggle--active' : ''
              }`}
            >
              {reducedMotion ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </section>

        {/* Section 3: Progression Reset */}
        <section className="smartmaze-settings-section" style={{ marginTop: '2rem' }}>
          <div className="smartmaze-section-header">
            <span className="smartmaze-section-num">03</span>
            <h3 className="smartmaze-section-title">PROGRESSION & LOCAL DATA</h3>
          </div>

          <div className="smartmaze-access-row">
            <div>
              <span className="smartmaze-access-label">SESSION MANAGEMENT</span>
              <p className="smartmaze-access-desc">
                Log out of your current frontend demo session. Saved level progression will remain stored on this device.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                logoutUser();
              }}
              className="smartmaze-access-toggle"
              style={{ borderColor: 'rgba(212, 175, 55, 0.4)', color: '#d4af37' }}
            >
              LOG OUT →
            </button>
          </div>

          <div className="smartmaze-access-row" style={{ marginTop: '1rem' }}>
            <div>
              <span className="smartmaze-access-label" style={{ color: '#fca5a5' }}>RESET PLAYER PROGRESS</span>
              <p className="smartmaze-access-desc">
                Clears level completions, best times, move counts, and challenge records. Level 01 remains unlocked.
              </p>
            </div>

            <button
              type="button"
              onClick={openProfileScreen}
              className="smartmaze-access-toggle"
              style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
            >
              MANAGE IN PROFILE →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
