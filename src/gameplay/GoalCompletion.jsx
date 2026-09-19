import React from 'react';
import PrimaryButton from '../components/common/PrimaryButton';
import GhostButton from '../components/common/GhostButton';
import './gameplay.css';

/**
 * GoalCompletion — Ultra-Premium Glass Victory End Card Component
 * Displays level victory presentation, rating crest (S/A/B/C), performance stats grid,
 * best records, new record callouts, and intelligent continue / replay buttons.
 */
export default function GoalCompletion({
  levelName = 'LEVEL 01 — THE THRESHOLD',
  levelId = 1,
  time = 42,
  moves = 22,
  grade = 'A',
  bestTime = null,
  bestMoves = null,
  isNewBestTime = false,
  isNewBestMoves = false,
  isNewBestGrade = false,
  unlockedNextLevel = false,
  isCustom = false,
  onContinue,
  onReplay,
  onHub,
}) {
  const formatTime = (secs) => {
    if (!secs || secs === 0) return '--:--';
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const continueLabel = isCustom
    ? 'RETURN TO EDITOR'
    : levelId >= 20
    ? 'MAZE ARCHIVE →'
    : `NEXT REALM (REALM ${(levelId + 1).toString().padStart(2, '0')}) →`;

  return (
    <div className="smartmaze-completion-overlay" role="dialog" aria-live="polite">
      <div className="smartmaze-completion-backdrop" />

      <div className="smartmaze-completion-modal">
        {/* Top Radial Light Flare */}
        <div className="smartmaze-comp-top-flare" />

        {/* 1. Luminous Victory Rating Crest */}
        <div className="smartmaze-completion-crest">
          <div className="smartmaze-rating-badge-outer">
            <div className="smartmaze-rating-badge-inner">
              <span className="smartmaze-rating-letter">{grade}</span>
            </div>
          </div>
          <span className="smartmaze-rating-label font-mono">RANK PERFORMANCE</span>
        </div>

        {/* 2. Victory Header & Subtitle */}
        <div className="smartmaze-comp-header">
          <span className="smartmaze-comp-tag font-mono">
            {isCustom ? 'TEST RUN SUCCESSFUL' : 'VICTORY ACHIEVED'}
          </span>
          <h2 className="smartmaze-completion-title">
            {isCustom ? 'CUSTOM MAZE SOLVED' : 'REALM CLEARED'}
          </h2>
          <p className="smartmaze-completion-subtitle font-mono">{levelName}</p>

          {/* New Level Unlocked Notification Badge */}
          {unlockedNextLevel && (
            <div style={{ marginTop: '0.75rem', background: 'rgba(110, 231, 183, 0.15)', border: '1px solid #6EE7B7', color: '#6EE7B7', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.75rem', letterSpacing: '0.15em', fontWeight: 'bold' }} className="font-mono">
              ✦ NEW LEVEL UNLOCKED — REALM {(levelId + 1).toString().padStart(2, '0')}
            </div>
          )}
        </div>

        {/* 3. Performance Summary Grid */}
        <div className="smartmaze-completion-stats-grid">
          <div className="smartmaze-comp-stat-card">
            <span className="smartmaze-comp-stat-icon">⏱</span>
            <div className="smartmaze-comp-stat-info">
              <span className="smartmaze-comp-stat-label font-mono">TIME {isNewBestTime && '★ BEST'}</span>
              <span className="smartmaze-comp-stat-val">{formatTime(time)}</span>
              {bestTime && !isCustom && (
                <span style={{ fontSize: '0.65rem', color: '#a3b19b' }} className="font-mono">BEST: {formatTime(bestTime)}</span>
              )}
            </div>
          </div>

          <div className="smartmaze-comp-stat-card">
            <span className="smartmaze-comp-stat-icon">👣</span>
            <div className="smartmaze-comp-stat-info">
              <span className="smartmaze-comp-stat-label font-mono">STEPS {isNewBestMoves && '★ BEST'}</span>
              <span className="smartmaze-comp-stat-val">{moves}</span>
              {bestMoves && !isCustom && (
                <span style={{ fontSize: '0.65rem', color: '#a3b19b' }} className="font-mono">BEST: {bestMoves} steps</span>
              )}
            </div>
          </div>

          <div className="smartmaze-comp-stat-card">
            <span className="smartmaze-comp-stat-icon">🏆</span>
            <div className="smartmaze-comp-stat-info">
              <span className="smartmaze-comp-stat-label font-mono">GRADE</span>
              <span className="smartmaze-comp-stat-val">{grade}</span>
              {isNewBestGrade && !isCustom && (
                <span style={{ fontSize: '0.65rem', color: '#6EE7B7' }} className="font-mono">★ NEW GRADE!</span>
              )}
            </div>
          </div>
        </div>

        {/* 4. Action Buttons Row */}
        <div className="smartmaze-completion-actions-row">
          <PrimaryButton
            onClick={onContinue}
            style={{ padding: '0.85rem 2rem', fontSize: '0.85rem', letterSpacing: '0.12em' }}
          >
            {continueLabel}
          </PrimaryButton>

          <GhostButton onClick={onReplay} leadingIcon={<span>↺</span>}>
            {isCustom ? 'REPLAY MAZE' : 'REPLAY REALM'}
          </GhostButton>

          <GhostButton onClick={onHub} leadingIcon={<span>⌂</span>}>
            ARCHIVE
          </GhostButton>
        </div>

        {/* Bottom Tagline */}
        <span className="smartmaze-comp-quote font-mono">“PATHFINDING MASTERY UNLOCKED”</span>
      </div>
    </div>
  );
}
