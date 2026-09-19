import React from 'react';
import GlassContainer from '../components/common/GlassContainer';
import './gameplay.css';

/**
 * Minimap — Lightweight 2D Mini-Map Overview Component
 * Renders small overview frame tracking player orb position, goal, and switch state.
 *
 * @param {Array} grid - 2D matrix
 * @param {Object} playerPos - Player coordinates { x, y }
 * @param {Object} goalPos - Goal coordinates { x, y }
 * @param {boolean} switchActive - Switch state
 * @param {boolean} gateOpen - Gate state
 */
export default function Minimap({ grid, playerPos, goalPos, switchActive = false, gateOpen = false }) {
  if (!grid || !grid.length) return null;

  const width = grid[0].length;
  const height = grid.length;

  return (
    <GlassContainer variant="subdued" className="smartmaze-minimap-container">
      <div className="smartmaze-minimap-grid" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
        {grid.map((row, y) =>
          row.map((cell, x) => {
            const isWall = cell === 1;
            const isPlayer = playerPos?.x === x && playerPos?.y === y;
            const isGoal = goalPos?.x === x && goalPos?.y === y;

            let cellClass = isWall ? 'smartmaze-mini-wall' : 'smartmaze-mini-path';
            if (isGoal) cellClass += ' smartmaze-mini-goal';
            if (isPlayer) cellClass += ' smartmaze-mini-player';

            return <div key={`mini-${x}-${y}`} className={cellClass} />;
          })
        )}
      </div>
      <div className="smartmaze-minimap-label">MINIMAP</div>
    </GlassContainer>
  );
}
