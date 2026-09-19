import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import './gameplay.css';

/**
 * PlayerOrb — Luminous SmartMaze Player Visual Component
 * Renders a physical glowing orb aligned inside the 3D grid coordinate space with smooth rotation,
 * breathing illumination, motion trail ghosts, and surface light casting.
 *
 * @param {Object} pos - Grid cell coordinates { x, y }
 * @param {number} cellSize - Cell size in pixels (e.g. 56)
 * @param {boolean} isMoving - Active movement flag for enhanced glow
 */
export default function PlayerOrb({ pos, cellSize = 56, isMoving = false, blockedBump = null }) {
  const { reducedMotion } = useApp();
  const [trail, setTrail] = useState([]);
  const prevPosRef = useRef(pos);

  // Maintain motion trail history
  useEffect(() => {
    if (reducedMotion) return;

    if (prevPosRef.current.x !== pos.x || prevPosRef.current.y !== pos.y) {
      setTrail((prev) => [
        { x: prevPosRef.current.x, y: prevPosRef.current.y, id: Date.now() },
        ...prev.slice(0, 1), // Restrained 1-ghost trail
      ]);
      prevPosRef.current = pos;
    }
  }, [pos, reducedMotion]);

  // Center orb inside target grid cell in 3D grid space
  const bumpX = blockedBump ? blockedBump.dx : 0;
  const bumpY = blockedBump ? blockedBump.dy : 0;
  const pixelX = pos.x * cellSize + cellSize / 2 + bumpX;
  const pixelY = pos.y * cellSize + cellSize / 2 + bumpY;

  const orbStyle = {
    transform: `translate3d(${pixelX}px, ${pixelY}px, 32px) translate(-50%, -50%)`,
    transition: reducedMotion
      ? 'transform 0.05s ease-out'
      : blockedBump
      ? 'transform 0.08s ease-in-out'
      : 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
  };

  const lightMaskStyle = {
    transform: `translate3d(${pixelX}px, ${pixelY}px, 2px) translate(-50%, -50%)`,
    transition: reducedMotion
      ? 'transform 0.05s ease-out'
      : 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'transform',
    backfaceVisibility: 'hidden',
  };

  return (
    <>
      {/* 1. Local Maze Surface Illumination Mask */}
      <div className="smartmaze-orb-ambient-light" style={lightMaskStyle} />

      {/* 2. Restrained Motion Trail Ghost */}
      {!reducedMotion &&
        trail.map((ghost, idx) => {
          const ghostX = ghost.x * cellSize + cellSize / 2;
          const ghostY = ghost.y * cellSize + cellSize / 2;
          const opacity = (2 - idx) * 0.15;
          const scale = 0.92;

          return (
            <div
              key={ghost.id}
              className="smartmaze-orb-trail-ghost"
              style={{
                transform: `translate3d(${ghostX}px, ${ghostY}px, 16px) translate(-50%, -50%) scale(${scale})`,
                opacity: opacity,
              }}
            />
          );
        })}

      {/* 3. Luminous Player Orb */}
      <div
        className={`smartmaze-player-orb ${isMoving ? 'smartmaze-player-orb--moving' : ''} ${
          blockedBump ? 'smartmaze-player-orb--bump' : ''
        } ${reducedMotion ? 'smartmaze-player-orb--reduced-motion' : ''}`}
        style={orbStyle}
        aria-label="Player Position"
      >
        {/* Core Ivory/Sand Sphere */}
        <div className="smartmaze-orb-core" />
        
        {/* Antique Amber Illumination Halo */}
        <div className="smartmaze-orb-halo" />

        {/* Rotating Energy Ring */}
        {!reducedMotion && <div className="smartmaze-orb-ring" />}
      </div>
    </>
  );
}
