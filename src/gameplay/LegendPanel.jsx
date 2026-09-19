import React from 'react';
import GlassContainer from '../components/common/GlassContainer';
import './gameplay.css';

/**
 * LegendPanel — Lightweight Secondary Gameplay Panel
 * Displays symbol legend (Player, Switch, Gate, Goal) and contextual quote.
 */
export default function LegendPanel({ engineMode = 'MOCK FALLBACK MODE' }) {
  return (
    <GlassContainer variant="subdued" className="smartmaze-side-panel smartmaze-legend-panel">
      <div className="smartmaze-panel-header">
        <span className="smartmaze-panel-icon">◈</span>
        <span className="smartmaze-panel-title">LEGEND</span>
      </div>

      <div className="smartmaze-legend-items">
        <div className="smartmaze-legend-row">
          <div className="smartmaze-legend-symbol smartmaze-sym--orb" />
          <div className="smartmaze-legend-meta">
            <span className="smartmaze-sym-name">Player</span>
            <span className="smartmaze-sym-desc">You</span>
          </div>
        </div>

        <div className="smartmaze-legend-row">
          <div className="smartmaze-legend-symbol smartmaze-sym--switch">◇</div>
          <div className="smartmaze-legend-meta">
            <span className="smartmaze-sym-name">Switch</span>
            <span className="smartmaze-sym-desc">Activate rune</span>
          </div>
        </div>

        <div className="smartmaze-legend-row">
          <div className="smartmaze-legend-symbol smartmaze-sym--gate">||</div>
          <div className="smartmaze-legend-meta">
            <span className="smartmaze-sym-name">Gate</span>
            <span className="smartmaze-sym-desc">Opens when activated</span>
          </div>
        </div>

        <div className="smartmaze-legend-row">
          <div className="smartmaze-legend-symbol" style={{ color: '#f59e0b', fontSize: '0.85rem' }}>☯</div>
          <div className="smartmaze-legend-meta">
            <span className="smartmaze-sym-name">State Shift</span>
            <span className="smartmaze-sym-desc">Toggles maze phase</span>
          </div>
        </div>

        <div className="smartmaze-legend-row">
          <div className="smartmaze-legend-symbol" style={{ color: '#38bdf8', fontSize: '0.85rem' }}>⏳</div>
          <div className="smartmaze-legend-meta">
            <span className="smartmaze-sym-name">Timed Path</span>
            <span className="smartmaze-sym-desc">Step-limited passage</span>
          </div>
        </div>

        <div className="smartmaze-legend-row">
          <div className="smartmaze-legend-symbol" style={{ color: '#34d399', fontSize: '0.85rem' }}>✦</div>
          <div className="smartmaze-legend-meta">
            <span className="smartmaze-sym-name">Secret Passage</span>
            <span className="smartmaze-sym-desc">Reveals hidden route</span>
          </div>
        </div>

        <div className="smartmaze-legend-row">
          <div className="smartmaze-legend-symbol" style={{ color: '#fbbf24', fontSize: '0.75rem', fontWeight: '800' }}>[1]</div>
          <div className="smartmaze-legend-meta">
            <span className="smartmaze-sym-name">Sequence Rune</span>
            <span className="smartmaze-sym-desc">Step in sequence order</span>
          </div>
        </div>

        <div className="smartmaze-legend-row">
          <div className="smartmaze-legend-symbol smartmaze-sym--goal">◯</div>
          <div className="smartmaze-legend-meta">
            <span className="smartmaze-sym-name">Goal</span>
            <span className="smartmaze-sym-desc">Reach to complete</span>
          </div>
        </div>
      </div>

      <div className="smartmaze-panel-footer">
        <span className="smartmaze-panel-quote" style={{ marginBottom: '0.25rem' }}>
          “Every path reveals a story.”
        </span>
        <div className="smartmaze-engine-status" style={{ fontSize: '0.7rem', color: '#60a5fa', letterSpacing: '0.05em' }}>
          ⚙ {engineMode}
        </div>
      </div>
    </GlassContainer>
  );
}
