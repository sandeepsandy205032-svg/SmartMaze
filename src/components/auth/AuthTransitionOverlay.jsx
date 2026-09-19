import React from 'react';
import './auth.css';

/**
 * AuthTransitionOverlay — Cinematic Authentication Entry Overlay (M12)
 * Plays a short, refined architectural reveal transition upon successful login / registration.
 */
export default function AuthTransitionOverlay({ username = 'PATHFINDER' }) {
  return (
    <div className="smartmaze-auth-transition-overlay" role="dialog" aria-live="polite">
      <div className="smartmaze-auth-transition-icon">◇</div>
      <h2 className="smartmaze-auth-transition-title">SMARTMAZE</h2>
      <span className="smartmaze-auth-transition-sub">
        AUTHENTICATION VERIFIED • WELCOME, {username.toUpperCase()}
      </span>
      <p style={{ fontSize: '0.85rem', color: '#a3b19b', marginTop: '0.5rem', letterSpacing: '0.08em' }} className="font-mono">
        ENTERING THE MAZE...
      </p>
    </div>
  );
}
