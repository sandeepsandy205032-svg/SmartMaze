import React from 'react';
import { useApp } from '../../context/AppContext';
import './hub.css';

/**
 * HubHeader — Premium Architectural SmartMaze Top Navigation Header Component
 * Renders brand display logo, top inspirational quote, and right authenticated profile badge.
 *
 * @param {Function} onOpenSettings - Callback to trigger settings modal
 */
export default function HubHeader({ onOpenSettings }) {
  const { userProfile, openProfileScreen } = useApp();

  return (
    <header className="smartmaze-hub-header-bar">
      {/* 1. Left Brand Logo & Subtitle */}
      <div className="smartmaze-hub-brand-group">
        <div className="smartmaze-brand-compass-icon">◇</div>
        <div className="smartmaze-brand-titles">
          <h1 className="smartmaze-brand-main">SMARTMAZE</h1>
          <span className="smartmaze-brand-sub">EXPLORE • UNCOVER • SOLVE</span>
        </div>
      </div>

      {/* 2. Center Quote Callout */}
      <div className="smartmaze-hub-quote-callout">
        <span className="smartmaze-quote-text">“Not all who wander are lost, some are solving.”</span>
      </div>

      {/* 3. Right Authenticated User Profile Control Widget */}
      <div className="smartmaze-hub-profile-area">
        <div
          className="smartmaze-profile-badge"
          onClick={openProfileScreen}
          style={{ cursor: 'pointer' }}
          title="Open Player Dossier / Profile"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openProfileScreen()}
        >
          <div className="smartmaze-profile-avatar">{userProfile?.avatar || '✦'}</div>
          <div className="smartmaze-profile-info">
            <span className="smartmaze-profile-name">{userProfile?.name || 'PATHFINDER'}</span>
            <span className="smartmaze-profile-title">
              {userProfile?.title || 'NOVICE NAVIGATOR'} • {userProfile?.completionPercentage || 0}%
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="smartmaze-header-settings-btn"
          aria-label="Open Settings"
          title="System Preferences"
        >
          ⚙
        </button>
      </div>
    </header>
  );
}
