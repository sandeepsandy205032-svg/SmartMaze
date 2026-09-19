import React from 'react';
import './common.css';

/**
 * SecondarySurface — SmartMaze Restrained Surface Container
 * Provides a secondary translucent panel with restrained glassmorphism.
 *
 * @param {React.ReactNode} children - Inner content
 * @param {string} className - Additional CSS classes
 * @param {React.ElementType} as - Polymorphic HTML tag ('div' | 'article' | 'section' | 'aside')
 * @param {boolean} interactive - Enable subtle hover border elevation
 * @param {object} style - Inline style overrides
 */
export default function SecondarySurface({
  children,
  className = '',
  as: Component = 'div',
  interactive = false,
  style = {},
  ...props
}) {
  const surfaceClass = `smartmaze-secondary-surface ${
    interactive ? 'smartmaze-secondary-surface--interactive' : ''
  } ${className}`.trim();

  return (
    <Component className={surfaceClass} style={style} {...props}>
      {children}
    </Component>
  );
}
