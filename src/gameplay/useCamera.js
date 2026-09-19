import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

/**
 * useCamera — Cinematic Tracking Presentation Camera Hook
 * Calculates exact 1:1 camera translation and zoom scale to center on target grid position
 * (player, goal, or start pedestal), enabling smooth tracking and framing.
 *
 * @param {Object} focusPos - Grid cell coordinates to focus on { x, y }
 * @param {Object} moveDir - Current movement direction vector { dx, dy }
 * @param {number} cellSize - Grid cell size in pixels (e.g. 56)
 * @param {number} gridWidth - Total grid width in cells
 * @param {number} gridHeight - Total grid height in cells
 * @param {number} zoomScale - Camera zoom scale (default 1.3)
 */
export function useCamera({
  focusPos = { x: 0, y: 0 },
  moveDir = { dx: 0, dy: 0 },
  cellSize = 56,
  gridWidth = 11,
  gridHeight = 11,
  zoomScale = 1.3,
}) {
  const { reducedMotion } = useApp();

  const cameraStyle = useMemo(() => {
    // Center point of full grid in pixels
    const centerPxX = (gridWidth * cellSize) / 2;
    const centerPxY = (gridHeight * cellSize) / 2;

    // Target focus cell position in pixels (center of target cell)
    const targetPxX = (focusPos.x + 0.5) * cellSize;
    const targetPxY = (focusPos.y + 0.5) * cellSize;

    // Directional look-ahead offset (subtle displacement ahead of player velocity)
    const lookAheadDistance = Math.min(10, cellSize * 0.25);
    const lookAheadX = reducedMotion ? 0 : (moveDir.dx || 0) * lookAheadDistance;
    const lookAheadY = reducedMotion ? 0 : (moveDir.dy || 0) * lookAheadDistance;

    // 1:1 Camera shift to center target cell in viewport
    const rawOffsetX = (centerPxX - targetPxX) - lookAheadX;
    const rawOffsetY = (centerPxY - targetPxY) - lookAheadY;

    // Boundary safety clamping to keep the maze readable without extreme edge cropping
    const maxShiftX = (gridWidth * cellSize * 0.45);
    const maxShiftY = (gridHeight * cellSize * 0.45);
    const offsetX = Math.max(-maxShiftX, Math.min(maxShiftX, rawOffsetX));
    const offsetY = Math.max(-maxShiftY, Math.min(maxShiftY, rawOffsetY));

    const transitionTime = reducedMotion ? '0.05s ease-out' : '0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    const scaleFactor = reducedMotion ? 1.05 : zoomScale;

    return {
      transform: `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0px) scale(${scaleFactor})`,
      transition: `transform ${transitionTime}`,
    };
  }, [focusPos, moveDir, cellSize, gridWidth, gridHeight, zoomScale, reducedMotion]);

  return cameraStyle;
}
