import React from 'react';
import GlassContainer from '../components/common/GlassContainer';
import './gameplay.css';

/**
 * ControlsPanel — Lightweight Secondary Controls Overview Panel
 * Displays live WASD and Arrow Key control diagrams with real-time active key highlights.
 *
 * @param {string} activeKey - Currently pressed key string (e.g. 'w', 'a', 's', 'd', 'ArrowUp', etc.)
 */
export default function ControlsPanel({ activeKey = null }) {
  const k = activeKey ? activeKey.toLowerCase() : '';

  const isW = k === 'w';
  const isA = k === 'a';
  const isS = k === 's';
  const isD = k === 'd';

  const isUp = activeKey === 'ArrowUp';
  const isLeft = activeKey === 'ArrowLeft';
  const isDown = activeKey === 'ArrowDown';
  const isRight = activeKey === 'ArrowRight';

  return (
    <GlassContainer variant="subdued" className="smartmaze-side-panel smartmaze-controls-panel">
      <div className="smartmaze-panel-header">
        <span className="smartmaze-panel-icon">⌨</span>
        <span className="smartmaze-panel-title">CONTROLS</span>
      </div>

      <div className="smartmaze-controls-body">
        <div className="smartmaze-wasd-grid">
          <span className={`smartmaze-key-cap smartmaze-key--w ${isW ? 'smartmaze-key-cap--pressed' : ''}`}>
            W
          </span>
          <div className="smartmaze-key-row">
            <span className={`smartmaze-key-cap ${isA ? 'smartmaze-key-cap--pressed' : ''}`}>A</span>
            <span className={`smartmaze-key-cap ${isS ? 'smartmaze-key-cap--pressed' : ''}`}>S</span>
            <span className={`smartmaze-key-cap ${isD ? 'smartmaze-key-cap--pressed' : ''}`}>D</span>
          </div>
          <span className="smartmaze-key-label">WASD Movement</span>
        </div>

        <div className="smartmaze-controls-divider">or</div>

        <div className="smartmaze-arrows-group">
          <div className="smartmaze-arrow-row">
            <span className={`smartmaze-key-cap ${isUp ? 'smartmaze-key-cap--pressed' : ''}`}>↑</span>
          </div>
          <div className="smartmaze-arrow-row">
            <span className={`smartmaze-key-cap ${isLeft ? 'smartmaze-key-cap--pressed' : ''}`}>←</span>
            <span className={`smartmaze-key-cap ${isDown ? 'smartmaze-key-cap--pressed' : ''}`}>↓</span>
            <span className={`smartmaze-key-cap ${isRight ? 'smartmaze-key-cap--pressed' : ''}`}>→</span>
          </div>
          <span className="smartmaze-key-label">Arrow Keys</span>
        </div>
      </div>
    </GlassContainer>
  );
}
