import React from 'react';
import GlassContainer from '../common/GlassContainer';
import './hub.css';

const SIDEBAR_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    sub: 'Your Central Hub',
    icon: '⌂',
  },
  {
    id: 'play',
    label: 'Play Maze',
    sub: 'Navigate a generated labyrinth',
    icon: '▷',
  },
  {
    id: 'create',
    label: 'Create Maze',
    sub: 'Design your own path',
    icon: '✎',
  },
  {
    id: 'challenges',
    label: 'Challenges',
    sub: 'Test your navigation mastery',
    icon: '⚙',
  },
  {
    id: 'profile',
    label: 'Profile',
    sub: 'Expedition Dossier & Stats',
    icon: '✦',
  },
  {
    id: 'settings',
    label: 'Settings',
    sub: 'Customize experience',
    icon: '⚙',
  },
];

/**
 * SidebarNav — Left Vertical Architectural Glass Sidebar Navigation Panel
 * Renders Home, Play Maze, Create Maze, Challenges, and Settings navigation options,
 * matching the visual architecture of the reference layout.
 *
 * @param {string} activeMode - Active mode ID ('play' | 'create' | 'challenges' | 'settings')
 * @param {Function} onSelectMode - Callback when a navigation item is clicked
 */
export default function SidebarNav({ activeMode = 'play', onSelectMode }) {
  return (
    <GlassContainer variant="primary" className="smartmaze-sidebar-nav-container">
      <nav className="smartmaze-sidebar-nav" aria-label="Main Navigation">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = (item.id === 'home' && activeMode === 'play') || activeMode === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectMode?.(item.id === 'home' ? 'play' : item.id)}
              className={`smartmaze-sidebar-item ${
                isActive ? 'smartmaze-sidebar-item--active' : ''
              }`}
            >
              <div className="smartmaze-sidebar-item-icon">{item.icon}</div>
              <div className="smartmaze-sidebar-item-meta">
                <span className="smartmaze-sidebar-item-label">{item.label}</span>
                <span className="smartmaze-sidebar-item-sub">{item.sub}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Emblem & Tagline */}
      <div className="smartmaze-sidebar-footer-emblem">
        <div className="smartmaze-emblem-icon">◇</div>
        <span className="smartmaze-emblem-text">A DEEPER MIND AWAITS</span>
      </div>
    </GlassContainer>
  );
}
