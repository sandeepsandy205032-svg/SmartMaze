import React from 'react';
import './common.css';

/**
 * PrimaryButton — SmartMaze Primary Action Component
 * Tactile, premium, restrained, cinematic action button.
 *
 * @param {React.ReactNode} children - Button label text or content
 * @param {Function} onClick - Click event handler
 * @param {boolean} disabled - Disabled state
 * @param {string} type - HTML button type ('button' | 'submit' | 'reset')
 * @param {React.ReactNode} leadingIcon - Optional leading icon slot
 * @param {React.ReactNode} trailingIcon - Optional trailing icon/arrow slot
 * @param {string} className - Additional CSS classes
 * @param {string} ariaLabel - Accessible aria-label override
 */
export default function PrimaryButton({
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
      className={`smartmaze-primary-btn ${className}`.trim()}
      {...props}
    >
      {leadingIcon && (
        <span className="smartmaze-primary-btn__icon smartmaze-primary-btn__icon--leading">
          {leadingIcon}
        </span>
      )}
      <span>{children}</span>
      {trailingIcon && (
        <span className="smartmaze-primary-btn__icon smartmaze-primary-btn__icon--trailing">
          {trailingIcon}
        </span>
      )}
    </button>
  );
}
