import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import HubEnvironment from '../hub/HubEnvironment';
import GlassContainer from '../common/GlassContainer';
import GhostButton from '../common/GhostButton';
import PrimaryButton from '../common/PrimaryButton';
import { LEVEL_METADATA } from '../levelselect/LevelSelectScreen';
import { CHALLENGE_DEFINITIONS } from '../challenges/ChallengesScreen';
import './profile.css';

/**
 * ProfileScreen — SmartMaze Player Dossier & Progression Management System (M11)
 * Displays detailed player metrics, level completion matrix, challenge records,
 * aggregate performance stats, and safe local progress reset.
 */
export default function ProfileScreen() {
  const {
    userProfile,
    progression,
    derivedStats,
    returnToHub,
    launchGameplay,
    resetPlayerProgress,
    logoutUser,
  } = useApp();

  const [showResetModal, setShowResetModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const formatTime = (secs) => {
    if (!secs || secs === 0) return '--:--';
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleConfirmReset = () => {
    resetPlayerProgress();
    setShowResetModal(false);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    logoutUser();
  };

  return (
    <div className="smartmaze-profile-root">
      {/* 1. Environmental Atmosphere Backdrop */}
      <HubEnvironment activeMode="play" />

      {/* 2. Top Header Navigation */}
      <header className="smartmaze-profile-topbar">
        <div className="smartmaze-profile-brand">
          <span className="smartmaze-profile-brand-icon">✦</span>
          <span>SMARTMAZE • DOSSIER</span>
        </div>

        <div className="smartmaze-profile-top-actions">
          <GhostButton onClick={() => setShowLogoutModal(true)}>
            🚪 LOG OUT
          </GhostButton>

          <GhostButton onClick={returnToHub} leadingIcon={<span>‹</span>}>
            HUB
          </GhostButton>
        </div>
      </header>

      {/* 3. Main Dossier Content Stage */}
      <main className="smartmaze-profile-main-stage">
        <GlassContainer className="smartmaze-profile-glass-workspace" variant="primary">
          {/* Header Hero Card */}
        <div className="smartmaze-dossier-header-card">
          <div className="smartmaze-dossier-user-info">
            <div className="smartmaze-dossier-avatar-ring">
              {userProfile?.avatar || '✦'}
            </div>
            <div className="smartmaze-dossier-name-block">
              <span className="smartmaze-dossier-tag">EXPEDITION DOSSIER</span>
              <h1 className="smartmaze-dossier-title">{userProfile?.name || 'EXPLORER'}</h1>
              <span className="smartmaze-dossier-subtitle">{userProfile?.title || 'PATHFINDER'} • {userProfile?.level || 'Realm 01'}</span>
            </div>
          </div>

          <div className="smartmaze-dossier-progress-ring-box">
            <div className="smartmaze-completion-stat-large">
              <span className="smartmaze-completion-percent-large">
                {derivedStats?.completionPercentage ?? derivedStats?.overallCompletionPct ?? 0}%
              </span>
              <span className="smartmaze-completion-percent-label">OVERALL COMPLETION</span>
            </div>
          </div>
        </div>

        {/* Aggregate Performance Statistics */}
        <section className="smartmaze-profile-section">
          <h2 className="smartmaze-profile-section-title">EXPEDITION STATISTICS</h2>
          
          <div className="smartmaze-stats-grid-4">
            <div className="smartmaze-stat-card-dossier">
              <span className="smartmaze-stat-card-icon">🏛</span>
              <span className="smartmaze-stat-card-label">LEVELS COMPLETED</span>
              <span className="smartmaze-stat-card-val">{derivedStats?.levelsCompleted || 0} / 20</span>
            </div>

            <div className="smartmaze-stat-card-dossier">
              <span className="smartmaze-stat-card-icon">⚔</span>
              <span className="smartmaze-stat-card-label">CHALLENGES CLEARED</span>
              <span className="smartmaze-stat-card-val">{derivedStats?.challengesCompleted || 0} / 6</span>
            </div>

            <div className="smartmaze-stat-card-dossier">
              <span className="smartmaze-stat-card-icon">↻</span>
              <span className="smartmaze-stat-card-label">TOTAL ATTEMPTS</span>
              <span className="smartmaze-stat-card-val">{derivedStats?.totalAttempts || 0}</span>
            </div>

            <div className="smartmaze-stat-card-dossier">
              <span className="smartmaze-stat-card-icon">👣</span>
              <span className="smartmaze-stat-card-label">TOTAL STEPS MOVED</span>
              <span className="smartmaze-stat-card-val">{derivedStats?.totalMoves || 0}</span>
            </div>

            <div className="smartmaze-stat-card-dossier">
              <span className="smartmaze-stat-card-icon">⏱</span>
              <span className="smartmaze-stat-card-label">TOTAL TIME SPENT</span>
              <span className="smartmaze-stat-card-val">{formatTime(derivedStats?.totalPlayTime || 0)}</span>
            </div>

            <div className="smartmaze-stat-card-dossier">
              <span className="smartmaze-stat-card-icon">⚡</span>
              <span className="smartmaze-stat-card-label">FASTEST REALM</span>
              <span className="smartmaze-stat-card-val">
                {derivedStats?.fastestLevel && (derivedStats.fastestLevel.levelId || derivedStats.fastestLevel.id)
                  ? `Realm ${(derivedStats.fastestLevel.levelId || derivedStats.fastestLevel.id).toString().padStart(2, '0')} (${formatTime(derivedStats.fastestLevel.bestTime || derivedStats.fastestLevel.time)})`
                  : '--:--'}
              </span>
            </div>

            <div className="smartmaze-stat-card-dossier">
              <span className="smartmaze-stat-card-icon">🎯</span>
              <span className="smartmaze-stat-card-label">FEWEST MOVES</span>
              <span className="smartmaze-stat-card-val">
                {derivedStats?.fewestMovesLevel && (derivedStats.fewestMovesLevel.levelId || derivedStats.fewestMovesLevel.id)
                  ? `Realm ${(derivedStats.fewestMovesLevel.levelId || derivedStats.fewestMovesLevel.id).toString().padStart(2, '0')} (${derivedStats.fewestMovesLevel.bestMoves || derivedStats.fewestMovesLevel.moves} steps)`
                  : '---'}
              </span>
            </div>

            <div className="smartmaze-stat-card-dossier">
              <span className="smartmaze-stat-card-icon">🏆</span>
              <span className="smartmaze-stat-card-label">TOP PERFORMANCE</span>
              <span className="smartmaze-stat-card-val">{derivedStats?.highestGrade || (derivedStats?.sGradeCount ? `${derivedStats.sGradeCount} S-Ranks` : 'A')}</span>
            </div>
          </div>
        </section>

        {/* 20 Level Progression Matrix */}
        <section className="smartmaze-profile-section">
          <h2 className="smartmaze-profile-section-title">20 REALMS PROGRESSION MATRIX</h2>

          <div className="smartmaze-level-matrix-grid">
            {(LEVEL_METADATA || []).map((lvl) => {
              const res = progression?.levels?.[lvl.id] || { unlocked: lvl.id === 1, completed: false };
              const isUnlocked = res.unlocked;
              const isCompleted = res.completed;

              let cardClass = 'smartmaze-matrix-node-card--locked';
              if (isCompleted) cardClass = 'smartmaze-matrix-node-card--completed';
              else if (isUnlocked) cardClass = 'smartmaze-matrix-node-card--unlocked';

              return (
                <div
                  key={lvl.id}
                  className={`smartmaze-matrix-node-card ${cardClass}`}
                  onClick={() => {
                    if (isUnlocked) launchGameplay(lvl.id);
                  }}
                  style={{ cursor: isUnlocked ? 'pointer' : 'default' }}
                >
                  <div className="smartmaze-matrix-card-top">
                    <span className="smartmaze-matrix-level-num">REALM {lvl.id.toString().padStart(2, '0')}</span>
                    {isCompleted ? (
                      <div className="smartmaze-matrix-grade-badge">{res.bestGrade || '✓'}</div>
                    ) : isUnlocked ? (
                      <span style={{ fontSize: '0.75rem', color: '#d4af37' }}>UNLOCKED</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>🔒</span>
                    )}
                  </div>

                  <span className="smartmaze-matrix-level-name">{lvl.name}</span>

                  <div className="smartmaze-matrix-stats-row">
                    <span>⏱ {formatTime(res.bestTime)}</span>
                    <span>👣 {res.bestMoves ? `${res.bestMoves} m` : '---'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Challenge Progression Matrix */}
        <section className="smartmaze-profile-section">
          <h2 className="smartmaze-profile-section-title">CHALLENGES MATRIX</h2>

          <div className="smartmaze-challenge-matrix-grid">
            {(CHALLENGE_DEFINITIONS || []).map((ch) => {
              const res = progression?.challenges?.[ch.id] || { completed: false, attempts: 0, bestScore: null, bestRank: null };
              
              return (
                <div key={ch.id} className="smartmaze-challenge-matrix-card">
                  <div className="smartmaze-ch-matrix-left">
                    <span className="smartmaze-ch-matrix-icon">{ch.icon}</span>
                    <div>
                      <span className="smartmaze-ch-matrix-name">{ch.name}</span>
                      <div className="smartmaze-ch-matrix-sub">
                        <span>ATTEMPTS: {res.attempts || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="smartmaze-matrix-grade-badge">
                    {res.bestRank || res.bestScore || (res.completed ? 'S' : '—')}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Danger Zone / Reset Progress */}
        <section className="smartmaze-profile-section">
          <div className="smartmaze-profile-danger-panel">
            <div>
              <h3 className="smartmaze-danger-title">RESET PLAYER PROGRESSION</h3>
              <p className="smartmaze-danger-desc">
                Permanently delete saved level completions, best times, move counts, and challenge records.
              </p>
            </div>

            <button
              type="button"
              className="smartmaze-danger-reset-btn"
              onClick={() => setShowResetModal(true)}
            >
              ↺ RESET ALL PROGRESS
            </button>
          </div>
        </section>
        </GlassContainer>
      </main>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="smartmaze-reset-modal-overlay">
          <div className="smartmaze-reset-modal-card">
            <h2 className="smartmaze-reset-modal-title">RESET PROGRESSION?</h2>
            <p className="smartmaze-reset-modal-desc">
              Are you sure you want to reset all saved progression? This will permanently delete your completed level records, best times, move counts, and challenge achievements.
              <br /><br />
              <strong>Level 01 will remain unlocked.</strong>
            </p>

            <div className="smartmaze-reset-modal-actions">
              <GhostButton onClick={() => setShowResetModal(false)}>
                CANCEL
              </GhostButton>

              <PrimaryButton
                onClick={handleConfirmReset}
                style={{ backgroundColor: '#ef4444', borderColor: '#f87171' }}
              >
                CONFIRM RESET
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="smartmaze-reset-modal-overlay">
          <div className="smartmaze-reset-modal-card" style={{ borderColor: 'rgba(212, 175, 55, 0.4)' }}>
            <h2 className="smartmaze-reset-modal-title" style={{ color: '#f4f1ea' }}>LOG OUT OF SMARTMAZE?</h2>
            <p className="smartmaze-reset-modal-desc">
              Your frontend session will be closed. Your level progression, best records, and challenge achievements will remain safely stored on this device.
            </p>

            <div className="smartmaze-reset-modal-actions">
              <GhostButton onClick={() => setShowLogoutModal(false)}>
                CANCEL
              </GhostButton>

              <PrimaryButton
                onClick={handleConfirmLogout}
              >
                LOG OUT →
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
