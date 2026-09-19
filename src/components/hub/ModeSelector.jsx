import React, { useRef } from 'react';
import './hub.css';

const MODES = [
  {
    id: 'play',
    number: '01',
    label: 'PLAY MAZE',
    icon: '◇',
    actionText: 'REALMS',
    description: 'Navigate an atmospheric generated labyrinth.',
    accentColor: '#e8ba7a', // Antique Amber
  },
  {
    id: 'create',
    number: '02',
    label: 'CREATE MAZE',
    icon: '✎',
    actionText: 'CONSTRUCT',
    description: 'Design and build your custom spatial path.',
    accentColor: '#9cb3a0', // Muted Sage
  },
  {
    id: 'challenges',
    number: '03',
    label: 'CHALLENGES',
    icon: '✦',
    actionText: 'SOLVE',
    description: 'Master spatial puzzles and path obstacles.',
    accentColor: '#d4af37', // Radiant Gold
  },
  {
    id: 'settings',
    number: '04',
    label: 'SETTINGS',
    icon: '⚙',
    actionText: 'THEME',
    description: 'Select themes and configure environment.',
    accentColor: '#b5a48b', // Warm Sand
  },
];

/**
 * ModeSelector — Unique Architectural Option Monolith Tiles Component
 * Ultra-sleek, image-free crystal glass tiles featuring luminous rune emblems,
 * interactive glowing borders, tactile hover elevation, and direct action triggers.
 */
export default function ModeSelector({
  activeMode = 'play',
  onSelectMode,
  onHoverMode,
}) {
  const itemRefs = useRef([]);

  const handleKeyDown = (e, index) => {
    let nextIndex = index;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = Math.min(MODES.length - 1, index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = Math.max(0, index - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectMode?.(MODES[index].id);
      return;
    }

    if (nextIndex !== index && itemRefs.current[nextIndex]) {
      itemRefs.current[nextIndex].focus();
    }
  };

  return (
    <div className="smartmaze-option-monoliths-grid" role="tablist" aria-label="SmartMaze Entrances">
      {MODES.map((mode, index) => {
        const isActive = activeMode === mode.id;

        return (
          <button
            key={mode.id}
            ref={(el) => (itemRefs.current[index] = el)}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            onClick={() => onSelectMode?.(mode.id)}
            onMouseEnter={() => onHoverMode?.(mode.id)}
            onMouseLeave={() => onHoverMode?.(null)}
            onFocus={() => onHoverMode?.(mode.id)}
            onBlur={() => onHoverMode?.(null)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`smartmaze-option-tile ${
              isActive ? 'smartmaze-option-tile--active' : ''
            }`}
            style={{ '--tile-accent': mode.accentColor }}
          >
            {/* Top Bar: Monolith Index & Glowing Emblem Rune */}
            <div className="smartmaze-tile-top-bar">
              <span className="smartmaze-tile-number">{mode.number}</span>
              <div className="smartmaze-tile-rune-badge">{mode.icon}</div>
            </div>

            {/* Middle Section: Title & Description */}
            <div className="smartmaze-tile-content">
              <h3 className="smartmaze-tile-title">{mode.label}</h3>
              <p className="smartmaze-tile-desc">{mode.description}</p>
            </div>

            {/* Bottom Section: Action Pill Button with Animated Arrow */}
            <div className="smartmaze-tile-action-bar">
              <span className="smartmaze-tile-action-label">{mode.actionText}</span>
              <span className="smartmaze-tile-action-arrow">→</span>
            </div>

            {/* Radiant Corner Shimmer Accent */}
            <div className="smartmaze-tile-corner-accent" />
          </button>
        );
      })}
    </div>
  );
}
