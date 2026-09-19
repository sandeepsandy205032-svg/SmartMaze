import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import HubEnvironment from '../hub/HubEnvironment';
import ChallengeBriefModal from './ChallengeBriefModal';
import * as smartMazeEngine from '../../wasm/smartMazeEngine';
import './challenges.css';

export const CHALLENGE_DEFINITIONS = [
  {
    id: 1,
    name: '01 — TIME TRIAL',
    tagline: 'ESCAPE BEFORE TIME CLAIMS THE MAZE',
    description: 'Complete the selected maze before the challenge countdown timer expires. Speed and precision are paramount.',
    icon: '⏱',
    timeLimit: 45,
    targetMoves: null,
    eligibleLevels: [1, 3, 6, 10, 16, 20],
  },
  {
    id: 2,
    name: '02 — MINIMAL MOVES',
    tagline: 'FIND THE MOST EFFICIENT ROUTE',
    description: 'Navigate the labyrinth with zero wasted movements. Exceeding the strict move threshold results in immediate failure.',
    icon: '🎯',
    timeLimit: null,
    targetMoves: 35,
    eligibleLevels: [1, 2, 5, 8, 12, 18],
  },
  {
    id: 3,
    name: '03 — BLIND MAZE',
    tagline: 'TEST SPATIAL MEMORY UNDER FOG',
    description: 'Navigate with severely restricted visibility. The maze progressively reveals only immediate surroundings as you step.',
    icon: '👁',
    timeLimit: null,
    targetMoves: null,
    eligibleLevels: [2, 4, 7, 11, 15, 19],
  },
  {
    id: 4,
    name: '04 — NO MAP',
    tagline: 'REMOVE NAVIGATION ASSISTANCE',
    description: 'Complete the maze with the minimap panel completely uninstalled. Rely strictly on spatial memory and environmental clues.',
    icon: '🗺',
    timeLimit: null,
    targetMoves: null,
    eligibleLevels: [1, 3, 6, 9, 14, 18],
  },
  {
    id: 5,
    name: '05 — PERFECT RUN',
    tagline: 'SPEED AND PRECISION COMBINED',
    description: 'Complete the maze under both strict time and move constraints. Bumping into solid walls penalizes your final rank.',
    icon: '⚡',
    timeLimit: 50,
    targetMoves: 40,
    eligibleLevels: [1, 2, 5, 10, 16, 20],
  },
  {
    id: 6,
    name: '06 — UNKNOWN RULE',
    tagline: 'RULES UNKNOWN — OBSERVE & DISCOVER',
    description: 'The maze rules are intentionally withheld. Observe the environmental response, discover the hidden mechanic, and escape.',
    icon: '❓',
    timeLimit: null,
    targetMoves: null,
    eligibleLevels: [2, 5, 9, 13, 17, 20],
  },
];

/**
 * ChallengesScreen — Cinematic "THE CHALLENGE ARCHIVE" Screen (Milestone 7)
 * Features 2x3 composition, atmospheric Sage + Sand environment, minimal top bar, and NO side dashboard.
 */
export default function ChallengesScreen() {
  const { launchChallenge, returnToHub, userProfile, progression } = useApp();
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const handleBeginChallenge = (challengeId, levelId) => {
    setSelectedChallenge(null);
    launchChallenge(challengeId, levelId);
  };

  return (
    <div className="smartmaze-challenges-root">
      {/* 1. Environmental Backdrop */}
      <HubEnvironment activeMode="challenges" />

      {/* 2. Minimal Top Bar (No Sidebar) */}
      <header className="smartmaze-challenges-topbar">
        <div className="smartmaze-brand-logo">
          <span>✦</span> SMARTMAZE
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="smartmaze-profile-badge">
            <div className="smartmaze-profile-avatar">{userProfile?.avatar || userProfile?.name?.[0] || 'E'}</div>
            <span>{userProfile?.name || 'Explorer'}</span>
          </div>

          <button
            type="button"
            className="smartmaze-back-btn"
            style={{ padding: '0.45rem 1rem' }}
            onClick={returnToHub}
          >
            ← HUB
          </button>
        </div>
      </header>

      {/* 3. Main Cinematic Stage */}
      <main className="smartmaze-challenges-stage">
        {/* Title Header */}
        <div className="smartmaze-challenges-header">
          <h1 className="smartmaze-challenges-title">THE CHALLENGE ARCHIVE</h1>
          <span className="smartmaze-challenges-subtitle">
            SAME MAZES. DIFFERENT RULES. A HIGHER TEST.
          </span>
        </div>

        {/* 2 x 3 Grid of 6 Challenge Cards */}
        <div className="smartmaze-challenges-grid">
          {CHALLENGE_DEFINITIONS.map((c) => {
            const chRecord = progression?.challenges?.[c.id] || { completed: false, bestScore: null, attempts: 0 };
            const isCompleted = chRecord.completed;

            return (
              <div
                key={c.id}
                className="smartmaze-challenge-card"
                onClick={() => setSelectedChallenge(c)}
              >
                <div>
                  <div className="smartmaze-card-top-row">
                    <span className="smartmaze-challenge-number">0{c.id}</span>
                    <div className="smartmaze-challenge-icon">{c.icon}</div>
                  </div>

                  <h3 className="smartmaze-challenge-name">{c.name}</h3>
                  <p className="smartmaze-challenge-desc">{c.description}</p>
                </div>

                <div className="smartmaze-card-bottom-row">
                  <div className="smartmaze-best-result">
                    <span>{isCompleted ? 'BEST RANK:' : 'STATUS:'}</span>
                    <span className="smartmaze-best-rank">
                      {chRecord.bestScore || (isCompleted ? 'S' : 'UNTOUCHED')}
                    </span>
                  </div>

                  <button type="button" className="smartmaze-enter-btn">
                    {isCompleted ? 'REPLAY →' : 'ENTER →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Quote */}
        <footer className="smartmaze-challenges-footer">
          “THE BEST CHALLENGES CHANGE HOW YOU THINK.”
        </footer>
      </main>

      {/* 4. Challenge Brief Modal */}
      {selectedChallenge && (
        <ChallengeBriefModal
          challenge={selectedChallenge}
          onBegin={handleBeginChallenge}
          onClose={() => setSelectedChallenge(null)}
        />
      )}
    </div>
  );
}
