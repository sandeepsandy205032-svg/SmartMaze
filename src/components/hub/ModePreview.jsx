import React from 'react';
import PrimaryButton from '../common/PrimaryButton';
import './hub.css';

/**
 * ModePreview — Central Container Guidance & Subtitle Component
 * Displays guidance metadata, primary mode entry CTA button, and version details.
 *
 * @param {string} activeMode - Currently active or hovered mode id
 * @param {Function} onEnterMode - Callback to trigger entry into active mode
 */
export default function ModePreview({ activeMode = 'play', onEnterMode }) {
  const guidance = {
    play: '01 / SYSTEM READY — NAVIGATE GENERATED PATHS',
    create: '02 / SYSTEM READY — CONSTRUCT CUSTOM LABYRINTH',
    challenges: '03 / SYSTEM READY — TEST NAVIGATION MASTERY',
    settings: '04 / SYSTEM READY — CONFIGURE PREFERENCES & ENVIRONMENT',
  };

  const ctaLabels = {
    play: 'ENTER MAZE REALMS ◇',
    create: 'CONSTRUCT CUSTOM LABYRINTH ✎',
    challenges: 'ENTER CHALLENGE ARCHIVE ✦',
    settings: 'OPEN PREFERENCES ⚙',
  };

  return (
    <div className="smartmaze-container-footer-guidance">
      <div className="smartmaze-guidance-pill">
        <span>{guidance[activeMode] || '01 / SYSTEM READY — NAVIGATE GENERATED PATHS'}</span>
      </div>

      <div className="smartmaze-preview-cta-wrap" style={{ marginTop: '0.65rem', marginBottom: '0.35rem' }}>
        <PrimaryButton
          onClick={() => onEnterMode?.(activeMode)}
          className="smartmaze-mode-entrance-cta"
          style={{ padding: '0.55rem 1.6rem', fontSize: '0.85rem' }}
        >
          {ctaLabels[activeMode] || 'ENTER PORTAL →'}
        </PrimaryButton>
      </div>

      <div className="smartmaze-container-footer-sub">
        <span>EXPLORE • LEARN • CREATE • SOLVE</span>
      </div>
    </div>
  );
}

