import React from 'react';

/**
 * ChallengeFailureModal — Challenge Failure Overlay (Milestone 7)
 * Displayed when time expires or move limit is exceeded.
 */
export default function ChallengeFailureModal({ reason = 'TIME EXPIRED', onRetry, onChangeChallenge, onArchive }) {
  return (
    <div className="smartmaze-brief-backdrop">
      <div className="smartmaze-brief-card" style={{ maxWidth: '440px', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
        <span className="smartmaze-challenge-number" style={{ color: '#EF4444' }}>
          CHALLENGE FAILED
        </span>

        <h2 className="smartmaze-brief-title" style={{ color: '#FCA5A5', marginTop: '0.25rem' }}>
          {reason}
        </h2>

        <p className="smartmaze-challenge-desc" style={{ margin: '1rem 0 1.5rem 0' }}>
          The labyrinth claims this attempt. Re-assess your approach and try again.
        </p>

        <div className="smartmaze-brief-actions" style={{ flexDirection: 'column', gap: '0.75rem' }}>
          <button
            type="button"
            className="smartmaze-begin-btn"
            style={{ background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', color: '#FFF' }}
            onClick={onRetry}
          >
            ↺ RETRY TRIAL
          </button>

          <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
            <button type="button" className="smartmaze-back-btn" style={{ flex: 1 }} onClick={onChangeChallenge}>
              CHANGE CHALLENGE
            </button>
            <button type="button" className="smartmaze-back-btn" style={{ flex: 1 }} onClick={onArchive}>
              ARCHIVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
