import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import GhostButton from '../components/common/GhostButton';
import './gameplay.css';

/**
 * HUD — Architectural SmartMaze Gameplay Header Component
 * Displays brand logo, level pill, live timer, step counter, pause button, and exit action.
 *
 * @param {string} levelName - Current level name
 * @param {string} rule - Active puzzle rule description
 * @param {number} moves - Total player step count
 * @param {boolean} isCompleted - Level completion flag to pause timer
 * @param {Function} onReturn - Callback to exit to Hub
 * @param {Function} onPause - Callback to trigger pause
 */
export default function HUD({
  levelName = 'REALM 01 — THE THRESHOLD',
  rule = 'Step on the Ancient Switch to unseal the Stone Gate.',
  moves = 0,
  isCompleted = false,
  isPaused = false,
  isChallengeMode = false,
  challengeType = 0,
  challengeTimeRemaining = 0,
  challengeMoveLimit = 0,
  onReturn,
  onPause,
}) {
  const { reducedMotion, toggleReducedMotion } = useApp();
  const [seconds, setSeconds] = useState(0);

  // Live Gameplay Timer for normal mode
  useEffect(() => {
    if (isCompleted || isChallengeMode || isPaused) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted, isChallengeMode, isPaused]);

  // Format seconds as mm:ss
  const formatTime = (secs) => {
    const safeSecs = Math.max(0, Math.floor(secs));
    const m = Math.floor(safeSecs / 60)
      .toString()
      .padStart(2, '0');
    const s = (safeSecs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isTimeTrialMode = isChallengeMode && (challengeType === 1 || challengeType === 5);
  const isMinimalMovesMode = isChallengeMode && (challengeType === 2 || challengeType === 5);

  return (
    <header className="smartmaze-hud-bar">
      {/* 1. Brand Wordmark & Exit Action */}
      <div className="smartmaze-hud-brand-group">
        <GhostButton onClick={onReturn} leadingIcon={<span>‹</span>}>
          HUB
        </GhostButton>
        <div className="smartmaze-hud-brand-titles">
          <span className="smartmaze-hud-title">SMARTMAZE</span>
          <span className="smartmaze-hud-subtitle">EXPLORE • UNCOVER • SOLVE</span>
        </div>
      </div>

      {/* 2. Center Level Pill & Rule Indicator */}
      <div className="smartmaze-hud-center-pill">
        <div className="smartmaze-hud-level-tag">{levelName}</div>
        <div className="smartmaze-hud-rule-desc">
          <span className="smartmaze-rule-icon">◈</span>
          <span>{rule}</span>
        </div>
      </div>

      {/* 3. Right Gameplay Stats (Time, Moves, Pause) */}
      <div className="smartmaze-hud-stats-group">
        <div className="smartmaze-hud-stat-box">
          <span className="smartmaze-stat-icon">⏳</span>
          <div className="smartmaze-stat-meta">
            <span className="smartmaze-stat-label">
              {isTimeTrialMode ? 'TIME REMAINING' : 'TIME'}
            </span>
            <span className="smartmaze-stat-value">
              {isTimeTrialMode ? formatTime(challengeTimeRemaining) : formatTime(seconds)}
            </span>
          </div>
        </div>

        <div className="smartmaze-hud-stat-box">
          <span className="smartmaze-stat-icon">👣</span>
          <div className="smartmaze-stat-meta">
            <span className="smartmaze-stat-label">
              {isMinimalMovesMode ? 'MOVES / TARGET' : 'MOVES'}
            </span>
            <span className="smartmaze-stat-value">
              {isMinimalMovesMode
                ? `${moves} / ${challengeMoveLimit}`
                : moves.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onPause || onReturn}
          className="smartmaze-hud-pause-btn"
          title="Pause Game (ESC)"
        >
          <span className="smartmaze-pause-icon">Ⅱ</span>
          <span className="smartmaze-pause-text">PAUSE</span>
        </button>

        {/* Accessibility Toggle */}
        <button
          type="button"
          onClick={toggleReducedMotion}
          className={`smartmaze-hud-motion-toggle ${reducedMotion ? 'smartmaze-motion--active' : ''}`}
          title="Toggle Reduced Motion"
        >
          {reducedMotion ? 'MOTION: OFF' : 'MOTION: ON'}
        </button>
      </div>
    </header>
  );
}
