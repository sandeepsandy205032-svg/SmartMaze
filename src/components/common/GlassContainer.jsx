import React from 'react';
import './common.css';

/**
 * GlassContainer — SmartMaze Architectural Glass Panel Component
 * Reusable glassmorphism surface featuring translucent dark glass,
 * backdrop blur, refined bevel borders, inner shadow, and corner accents.
 *
 * @param {React.ReactNode} children - Panel content
 * @param {string} className - Custom CSS classes
 * @param {Object} style - React inline styles
 * @param {string} variant - Visual variant ('primary' | 'secondary' | 'subdued')
 * @param {boolean} interactive - Adds subtle hover elevation
 */
export default function GlassContainer({
  children,
  className = '',
  style = {},
  variant = 'primary',
  interactive = false,
  ...props
}) {
  return (
    <div
      className={`smartmaze-glass-container smartmaze-glass--${variant} ${
        interactive ? 'smartmaze-glass--interactive' : ''
      } ${className}`.trim()}
      style={style}
      {...props}
    >
      <div className="smartmaze-glass-inner-shadow" />
      <div className="smartmaze-glass-content">{children}</div>
    </div>
  );
}
