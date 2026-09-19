import React from 'react';
import './common.css';

/**
 * MazeLoadingSpinner — SmartMaze Custom Architectural Buffering Visual
 * A segmented SVG maze mechanism with rotating concentric arcs,
 * central focal point, and progressive path tracing.
 */
export default function MazeLoadingSpinner() {
  return (
    <div className="smartmaze-loading-scene" aria-live="polite" aria-label="Opening the maze world">
      {/* 1. Architectural SVG Maze Buffering Visual */}
      <div className="smartmaze-loading-mechanism">
        <svg
          viewBox="0 0 100 100"
          className="smartmaze-loading-svg"
          aria-hidden="true"
        >
          {/* Outer Segmented Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            className="smartmaze-loading-circle-outer"
          />
          
          {/* Rotating Arc Segment 1 */}
          <circle
            cx="50"
            cy="50"
            r="36"
            className="smartmaze-loading-arc-1"
          />

          {/* Rotating Arc Segment 2 */}
          <circle
            cx="50"
            cy="50"
            r="26"
            className="smartmaze-loading-arc-2"
          />

          {/* Inner Segmented Arc */}
          <circle
            cx="50"
            cy="50"
            r="16"
            className="smartmaze-loading-arc-3"
          />

          {/* Center Architectural Focal Point */}
          <circle
            cx="50"
            cy="50"
            r="4"
            className="smartmaze-loading-center"
          />
        </svg>
      </div>

      {/* 2. Restrained Environment Text */}
      <div className="smartmaze-loading-text-group">
        <span className="smartmaze-loading-title-text">ENTERING THE MAZE</span>
        <span className="smartmaze-loading-meta-text">● OPENING THE LABYRINTH</span>
      </div>
    </div>
  );
}
