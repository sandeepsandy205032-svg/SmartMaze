import React, { useEffect } from 'react';
import PrimaryButton from '../components/common/PrimaryButton';
import GhostButton from '../components/common/GhostButton';
import './gameplay.css';

/**
 * PauseModal — Ultra-Premium Glass Pause Modal Container
 * Displays game pause state, current level info, stats breakdown,
 * and clear options to Resume, Restart, or Exit the game.
 */
export default function PauseModal({
  levelName = 'REALM 01 — THE THRESHOLD',
  time = 0,
  moves = 0,
  isChallengeMode = false,
  challengeType = 0,
  onResume,
  onRestart,
  onExit,
}) {
  // Listen for Escape or P key press to resume
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        onResume();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResume]);

  const formatTime = (secs) => {
    if (!secs || secs === 0) return '00:00';
    const safeSecs = Math.max(0, Math.floor(secs));
    const m = Math.floor(safeSecs / 60)
      .toString()
      .padStart(2, '0');
    const s = (safeSecs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="smartmaze-completion-overlay" role="dialog" aria-modal="true" aria-label="Pause Menu">
      <div className="smartmaze-completion-backdrop" onClick={onResume} />

      <div className="smartmaze-completion-modal" style={{ maxWidth: '480px' }}>
        {/* Top Luminous Light Flare */}
        <div className="smartmaze-comp-top-flare" />

        {/* 1. Pause Symbol Icon Crest */}
        <div className="smartmaze-completion-crest">
          <div className="smartmaze-rating-badge-outer" style={{ boxShadow: '0 0 25px rgba(245, 158, 11, 0.5)' }}>
            <div className="smartmaze-rating-badge-inner">
              <span className="smartmaze-rating-letter" style={{ fontSize: '1.6rem', color: '#f59e0b' }}>
                Ⅱ
              </span>
            </div>
          </div>
          <span className="smartmaze-rating-label font-mono">GAME SUSPENDED</span>
        </div>

        {/* 2. Header & Subtitle */}
        <div className="smartmaze-comp-header">
          <span className="smartmaze-comp-tag font-mono">
            {isChallengeMode ? `CHALLENGE 0${challengeType} PAUSED` : 'EXPLORATION PAUSED'}
          </span>
          <h2 className="smartmaze-completion-title" style={{ fontSize: '1.8rem' }}>
            PAUSED
          </h2>
          <p className="smartmaze-completion-subtitle font-mono">{levelName}</p>
        </div>

        {/* 3. Live Stats Container */}
        <div className="smartmaze-completion-stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="smartmaze-comp-stat-card">
            <span className="smartmaze-comp-stat-icon">⏱</span>
            <div className="smartmaze-comp-stat-info">
              <span className="smartmaze-comp-stat-label font-mono">ELAPSED TIME</span>
              <span className="smartmaze-comp-stat-val">{formatTime(time)}</span>
            </div>
          </div>

          <div className="smartmaze-comp-stat-card">
            <span className="smartmaze-comp-stat-icon">👣</span>
            <div className="smartmaze-comp-stat-info">
              <span className="smartmaze-comp-stat-label font-mono font-bold">MOVES TAKEN</span>
              <span className="smartmaze-comp-stat-val">{moves}</span>
            </div>
          </div>
        </div>

        {/* 4. Action Buttons Container */}
        <div className="smartmaze-completion-actions-row" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <PrimaryButton
            onClick={onResume}
            style={{ width: '100%', padding: '0.85rem 1.5rem', fontSize: '0.9rem', letterSpacing: '0.14em' }}
            leadingIcon={<span>▶</span>}
          >
            RESUME GAME
          </PrimaryButton>

          <div style={{ display: 'flex', width: '100%', gap: '0.75rem', justifyContent: 'center' }}>
            <GhostButton onClick={onRestart} leadingIcon={<span>↺</span>} style={{ flex: 1 }}>
              RESTART
            </GhostButton>

            <GhostButton onClick={onExit} leadingIcon={<span>⌂</span>} style={{ flex: 1 }}>
              EXIT
            </GhostButton>
          </div>
        </div>

        {/* Bottom Tip Tagline */}
        <span className="smartmaze-comp-quote font-mono" style={{ marginTop: '0.25rem' }}>
          PRESS ESC OR P TO RESUME
        </span>
      </div>
    </div>
  );
}
