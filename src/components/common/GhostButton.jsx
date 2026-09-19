import React from 'react';
import './common.css';

/**
 * GhostButton — SmartMaze Minimal Secondary Action Component
 * Open space typography button with restrained hover feedback.
 *
 * @param {React.ReactNode} children - Button label text or content
 * @param {Function} onClick - Click event handler
 * @param {boolean} disabled - Disabled state
 * @param {string} type - HTML button type
 * @param {React.ReactNode} leadingIcon - Optional leading icon slot
 * @param {React.ReactNode} trailingIcon - Optional trailing icon slot
 * @param {string} className - Additional CSS classes
 * @param {string} ariaLabel - Accessible aria-label override
 */
export default function GhostButton({
  children,
  onClick,
  disabled = false,
  type = 'button',
  leadingIcon = null,
  trailingIcon = null,
  className = '',
  ariaLabel,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`smartmaze-ghost-btn ${className}`.trim()}
      {...props}
    >
      {leadingIcon && <span>{leadingIcon}</span>}
      <span>{children}</span>
      {trailingIcon && <span>{trailingIcon}</span>}
    </button>
  );
}
