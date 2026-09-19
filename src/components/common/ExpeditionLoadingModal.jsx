import React from 'react';
import { useApp } from '../../context/AppContext';
import './common.css';

/**
 * ExpeditionLoadingModal — Unified Game Loading & Theme Transition Screen Component
 * Sleek linear progress beam, glowing rune emblem badge, and game-vibe status titles.
 */
export default function ExpeditionLoadingModal() {
  const { isGameplayLoading, isThemeTransitioning, loadingMessage, loadingSubtext, loadingProgress } = useApp();

  if (!isGameplayLoading && !isThemeTransitioning) return null;

  return (
    <div className="smartmaze-expedition-loading-root" role="dialog" aria-live="polite">
      <div className="smartmaze-loading-backdrop" />

      <div className="smartmaze-loading-card">
        {/* Luminous Emblem Badge */}
        <div className="smartmaze-loading-rune-emblem font-display">◇</div>

        {/* Dynamic Game-Vibe Titles & Messaging */}
        <div className="smartmaze-loading-header">
          <span className="smartmaze-loading-tag font-mono">SYSTEM SYNCHRONIZING</span>
          <h2 className="smartmaze-loading-title">{loadingMessage}</h2>
          <span className="smartmaze-loading-sub font-mono">{loadingSubtext}</span>
        </div>

        {/* Luminous Progress Beam Indicator */}
        {isGameplayLoading && (
          <div className="smartmaze-progress-wrapper">
            <div className="smartmaze-progress-track">
              <div
                className="smartmaze-progress-fill"
                style={{ width: `${Math.min(100, Math.max(5, loadingProgress))}%` }}
              />
            </div>
            <span className="smartmaze-progress-percent font-mono">
              {Math.min(100, Math.max(5, loadingProgress))}%
            </span>
          </div>
        )}

        {/* Game Quote Tagline */}
        <div className="smartmaze-loading-footer font-mono">
          <span>“EVERY MAZE HIDES A STORY.”</span>
        </div>
      </div>
    </div>
  );
}
