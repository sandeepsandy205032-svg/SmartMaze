import React from 'react';

/**
 * ChallengeCompletionModal — Dedicated Challenge Completion Overlay (Milestone 7)
 * Displays time saved, efficiency breakdown, and calculated C++ Rank (S, A, B, C).
 * For Unknown Rule challenge, reveals the discovered rule after completion!
 */
export default function ChallengeCompletionModal({
  challengeType,
  time,
  timeLimit,
  moves,
  moveLimit,
  rank = 'S',
  onRetry,
  onNext,
  onArchive,
}) {
  const isTimeTrial = challengeType === 1 || challengeType === 5;
  const isMinimalMoves = challengeType === 2;
  const isUnknownRule = challengeType === 6;

  const timeSaved = timeLimit && timeLimit > time ? (timeLimit - time).toFixed(1) : 0;

  return (
    <div className="smartmaze-brief-backdrop">
      <div className="smartmaze-brief-card" style={{ maxWidth: '480px' }}>
        <span className="smartmaze-challenge-number" style={{ color: '#D4AF37' }}>
          CHALLENGE COMPLETE
        </span>
        <h2 className="smartmaze-brief-title" style={{ fontSize: '2rem', marginTop: '0.25rem' }}>
          TRIAL UNSEALED
        </h2>

        {/* Big Rank Badge */}
        <div style={{ margin: '1rem 0' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #D4AF37 0%, #7A5F14 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              fontWeight: '900',
              color: '#0F1713',
              boxShadow: '0 0 30px rgba(212, 175, 55, 0.4)',
              margin: '0 auto',
            }}
          >
            {rank}
          </div>
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: '#D4AF37', display: 'block', marginTop: '0.5rem' }}>
            RANK ATTAINED
          </span>
        </div>

        {/* Stats Grid */}
        <div className="smartmaze-brief-stats">
          <div className="smartmaze-stat-box">
            <span className="smartmaze-stat-label">TIME ELAPSED</span>
            <span className="smartmaze-stat-value">{time}s</span>
          </div>

          <div className="smartmaze-stat-box">
            <span className="smartmaze-stat-label">MOVES TAKEN</span>
            <span className="smartmaze-stat-value">{moves}</span>
          </div>

          {isTimeTrial && (
            <div className="smartmaze-stat-box" style={{ gridColumn: 'span 2' }}>
              <span className="smartmaze-stat-label">TIME SAVED</span>
              <span className="smartmaze-stat-value" style={{ color: '#6EE7B7' }}>
                +{timeSaved}s
              </span>
            </div>
          )}

          {isMinimalMoves && (
            <div className="smartmaze-stat-box" style={{ gridColumn: 'span 2' }}>
              <span className="smartmaze-stat-label">TARGET MOVES</span>
              <span className="smartmaze-stat-value">{moveLimit}</span>
            </div>
          )}
        </div>

        {/* Unknown Rule Reveal */}
        {isUnknownRule && (
          <div
            style={{
              background: 'rgba(212, 175, 55, 0.12)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '8px',
              padding: '0.85rem',
              marginBottom: '1.25rem',
              width: '100%',
            }}
          >
            <span style={{ fontSize: '0.7rem', color: '#D4AF37', letterSpacing: '0.15em', fontWeight: '700' }}>
              DISCOVERED MAZE RULE:
            </span>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#F4F1EA' }}>
              "SWEEPING MECHANISMS SEAL THE GOAL UNTIL ALL RUNES ARE STEPPED IN SEQUENCE."
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="smartmaze-brief-actions">
          <button type="button" className="smartmaze-begin-btn" onClick={onRetry}>
            RETRY
          </button>
          <button type="button" className="smartmaze-back-btn" onClick={onArchive}>
            ARCHIVE
          </button>
        </div>
      </div>
    </div>
  );
}
