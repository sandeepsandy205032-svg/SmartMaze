import React, { useState } from 'react';

/**
 * ChallengeBriefModal — Cinematic Pre-Game Challenge Overview & Level Selector
 */
export default function ChallengeBriefModal({ challenge, onBegin, onClose }) {
  const [selectedLevelId, setSelectedLevelId] = useState(challenge.eligibleLevels[0] || 1);

  if (!challenge) return null;

  return (
    <div className="smartmaze-brief-backdrop">
      <div className="smartmaze-brief-card">
        <span className="smartmaze-challenge-number">CHALLENGE 0{challenge.id}</span>
        <h2 className="smartmaze-brief-title">{challenge.name}</h2>
        <span className="smartmaze-brief-tagline">{challenge.tagline}</span>

        <p className="smartmaze-challenge-desc" style={{ marginBottom: '1.5rem' }}>
          {challenge.description}
        </p>

        {/* Stats Grid */}
        <div className="smartmaze-brief-stats">
          <div className="smartmaze-stat-box">
            <span className="smartmaze-stat-label">TIME LIMIT</span>
            <span className="smartmaze-stat-value">
              {challenge.timeLimit ? `${challenge.timeLimit}s` : 'UNLIMITED'}
            </span>
          </div>
          <div className="smartmaze-stat-box">
            <span className="smartmaze-stat-label">TARGET MOVES</span>
            <span className="smartmaze-stat-value">
              {challenge.targetMoves ? `${challenge.targetMoves}` : 'OPTIMAL'}
            </span>
          </div>
        </div>

        {/* Level Selector */}
        <div className="smartmaze-level-select-row">
          <span className="smartmaze-level-select-label">SELECT ELIGIBLE LABYRINTH:</span>
          <div className="smartmaze-level-chips">
            {challenge.eligibleLevels.map((lvlId) => (
              <button
                key={lvlId}
                type="button"
                className={`smartmaze-level-chip ${
                  selectedLevelId === lvlId ? 'smartmaze-level-chip--active' : ''
                }`}
                onClick={() => setSelectedLevelId(lvlId)}
              >
                REALM {lvlId.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="smartmaze-brief-actions">
          <button
            type="button"
            className="smartmaze-begin-btn"
            onClick={() => onBegin(challenge.id, selectedLevelId)}
          >
            BEGIN CHALLENGE →
          </button>
          <button type="button" className="smartmaze-back-btn" onClick={onClose}>
            BACK
          </button>
        </div>
      </div>
    </div>
  );
}
