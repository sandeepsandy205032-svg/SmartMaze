import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import PlayerOrb from './PlayerOrb';
import './gameplay-themes.css';
import './gameplay.css';

/**
 * MazeRenderer — Top-Down 3D Architectural Labyrinth Renderer
 * Renders an 11x11 grid with standing 3D extruded stone walls, top & side faces, bevels,
 * contact shadows, start pedestal, goal structure, stone switches/gates, and aligned player orb.
 *
 * @param {Array} grid - 2D matrix representing cell types (1 = Wall, 0 = Path)
 * @param {Object} startPos - Coordinates of starting point { x, y }
 * @param {Object} goalPos - Coordinates of goal location { x, y }
 * @param {Object} switchPos - Coordinates of ancient stone switch { x, y }
 * @param {Object} gatePos - Coordinates of stone gate { x, y }
 * @param {Object} playerPos - Coordinates of player orb { x, y }
 * @param {boolean} isMoving - Flag for player movement
 * @param {boolean} switchActive - Flag indicating if switch has been triggered
 * @param {boolean} gateOpen - Flag indicating if stone gate is unsealed
 * @param {boolean} isFallingWalls - Flag indicating if walls are animating drop-in
 * @param {number} cellSize - Cell size in pixels (e.g. 56)
 */
export default function MazeRenderer({
  grid,
  startPos,
  goalPos,
  switchPos,
  gatePos,
  switches = [],
  gates = [],
  pressurePlates = [],
  oneWayPaths = [],
  movingWalls = [],
  stateChanges = [],
  temporaryPaths = [],
  hiddenPaths = [],
  sequenceLocks = [],
  playerPos,
  isMoving = false,
  blockedBump = null,
  switchActive = false,
  gateOpen = false,
  isFallingWalls = false,
  cellSize = 38,
  isBlind = false,
  visibilityRadius = 2.5,
}) {
  const { selectedTheme } = useApp();

  // Fast O(1) mechanism lookup maps pre-computed per render state change
  const {
    switchMap,
    gateMap,
    plateMap,
    oneWayMap,
    movingWallMap,
    stateChangeTriggerMap,
    stateSolidSet,
    stateGhostSet,
    tempPathMap,
    tempTriggerMap,
    hiddenPathMap,
    hiddenTriggerMap,
    sequenceRuneMap,
  } = useMemo(() => {
    const sMap = {};
    if (switches) {
      switches.forEach((s) => { sMap[`${s.x}-${s.y}`] = s; });
    }
    if (switchPos) {
      const key = `${switchPos.x}-${switchPos.y}`;
      if (!sMap[key]) sMap[key] = { isActive: switchActive };
    }

    const gMap = {};
    if (gates) {
      gates.forEach((g) => { gMap[`${g.x}-${g.y}`] = g; });
    }
    if (gatePos) {
      const key = `${gatePos.x}-${gatePos.y}`;
      if (!gMap[key]) gMap[key] = { isOpen: gateOpen };
    }

    const pMap = {};
    if (pressurePlates) {
      pressurePlates.forEach((p) => { pMap[`${p.x}-${p.y}`] = p; });
    }

    const oMap = {};
    if (oneWayPaths) {
      oneWayPaths.forEach((o) => { oMap[`${o.x}-${o.y}`] = o; });
    }

    const mwMap = {};
    if (movingWalls) {
      movingWalls.forEach((m) => { mwMap[`${m.x}-${m.y}`] = m; });
    }

    const scTriggerMap = {};
    const solidSet = new Set();
    const ghostSet = new Set();
    if (stateChanges) {
      stateChanges.forEach((sc) => {
        scTriggerMap[`${sc.triggerX}-${sc.triggerY}`] = sc;
        const activeList = sc.currentState === 0 ? sc.state0Walls : sc.state1Walls;
        const inactiveList = sc.currentState === 0 ? sc.state1Walls : sc.state0Walls;
        activeList?.forEach((w) => solidSet.add(`${w.x}-${w.y}`));
        inactiveList?.forEach((w) => ghostSet.add(`${w.x}-${w.y}`));
      });
    }

    const tpMap = {};
    const tpTrigMap = {};
    if (temporaryPaths) {
      temporaryPaths.forEach((tp) => {
        tpMap[`${tp.x}-${tp.y}`] = tp;
        tpTrigMap[`${tp.triggerX}-${tp.triggerY}`] = tp;
      });
    }

    const hpMap = {};
    const hpTrigMap = {};
    if (hiddenPaths) {
      hiddenPaths.forEach((hp) => {
        hpMap[`${hp.x}-${hp.y}`] = hp;
        hpTrigMap[`${hp.triggerX}-${hp.triggerY}`] = hp;
      });
    }

    const seqMap = {};
    if (sequenceLocks) {
      sequenceLocks.forEach((seq) => {
        seq.runePositions?.forEach((r, rIndex) => {
          seqMap[`${r.x}-${r.y}`] = {
            lockId: seq.id,
            stepNumber: rIndex + 1,
            totalRunes: seq.runePositions.length,
            isActivated: rIndex < seq.currentStep || seq.isUnlocked,
            isNextTarget: rIndex === seq.currentStep && !seq.isUnlocked,
            isUnlocked: seq.isUnlocked,
          };
        });
      });
    }

    return {
      switchMap: sMap,
      gateMap: gMap,
      plateMap: pMap,
      oneWayMap: oMap,
      movingWallMap: mwMap,
      stateChangeTriggerMap: scTriggerMap,
      stateSolidSet: solidSet,
      stateGhostSet: ghostSet,
      tempPathMap: tpMap,
      tempTriggerMap: tpTrigMap,
      hiddenPathMap: hpMap,
      hiddenTriggerMap: hpTrigMap,
      sequenceRuneMap: seqMap,
    };
  }, [
    switches,
    switchPos,
    switchActive,
    gates,
    gatePos,
    gateOpen,
    pressurePlates,
    oneWayPaths,
    movingWalls,
    stateChanges,
    temporaryPaths,
    hiddenPaths,
    sequenceLocks,
  ]);

  if (!grid || !grid.length || !grid[0]) return null;

  const width = grid[0].length;
  const height = grid.length;

  const themeMaterialClass = `material-${selectedTheme}`;

  let wallCount = 0;

  return (
    <div
      className={`smartmaze-grid-container ${themeMaterialClass}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
        width: `${width * cellSize}px`,
        height: `${height * cellSize}px`,
      }}
    >
      {grid.map((row, y) =>
        row.map((cellType, x) => {
          const cellKey = `${x}-${y}`;
          const isStart = startPos?.x === x && startPos?.y === y;
          const isGoal = goalPos?.x === x && goalPos?.y === y;

          // Blind Maze Fog-of-War Calculation
          const distToPlayer = playerPos ? Math.hypot(x - playerPos.x, y - playerPos.y) : 0;
          const isFogged = isBlind && distToPlayer > visibilityRadius;
          const fogOpacity = isBlind ? Math.min(0.92, Math.max(0, (distToPlayer - 1.8) * 0.45)) : 0;

          // Fast O(1) mechanism lookups
          const currentSwitch = switchMap[cellKey];
          const isSwitch = Boolean(currentSwitch);
          const currentSwitchActive = currentSwitch?.isActive ?? false;

          const currentGate = gateMap[cellKey];
          const isGate = Boolean(currentGate);
          const currentGateOpen = currentGate?.isOpen ?? false;

          const currentPlate = plateMap[cellKey];
          const isPressurePlate = Boolean(currentPlate);
          const currentPlatePressed = currentPlate?.isPressed ?? false;

          const currentOneWay = oneWayMap[cellKey];
          const isOneWay = Boolean(currentOneWay);

          const currentMovingWall = movingWallMap[cellKey];
          const isMovingWall = Boolean(currentMovingWall);
          const movingWallRetracted = currentMovingWall?.isRetracted ?? false;

          // 1. Check State-Change Walls
          const currentStateChangeTrigger = stateChangeTriggerMap[cellKey];
          const isStateChangeTrigger = Boolean(currentStateChangeTrigger);
          const isStateWallSolid = stateSolidSet.has(cellKey);
          const isStateWallGhost = stateGhostSet.has(cellKey);

          // 2. Check Temporary Paths
          const currentTempPath = tempPathMap[cellKey];
          const isTempPath = Boolean(currentTempPath);
          const currentTempTrigger = tempTriggerMap[cellKey];
          const isTempTrigger = Boolean(currentTempTrigger);

          // 3. Check Hidden Paths
          const currentHiddenPath = hiddenPathMap[cellKey];
          const isHiddenPath = Boolean(currentHiddenPath);
          const currentHiddenTrigger = hiddenTriggerMap[cellKey];
          const isHiddenTrigger = Boolean(currentHiddenTrigger);
          const isHiddenRevealed = currentHiddenPath?.isRevealed ?? false;

          // 4. Check Sequence Locks
          const currentSequenceRune = sequenceRuneMap[cellKey];
          const isSequenceRune = Boolean(currentSequenceRune);

          // Authoritative Wall determination
          const isWall =
            (cellType === 1 || (isMovingWall && !movingWallRetracted) || isStateWallSolid) &&
            !isGate &&
            !(isHiddenPath && isHiddenRevealed);

          if (isWall) wallCount += 1;
          const wallStaggerDelay = isWall ? (wallCount % 8) * 0.08 : 0;

          return (
            <div
              key={`${x}-${y}`}
              className={`smartmaze-cell ${
                isWall ? 'smartmaze-cell--wall-3d' : 'smartmaze-cell--path-3d'
              }`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                position: 'relative',
              }}
            >
              {/* Blind Maze Atmospheric Fog Veil Overlay */}
              {isBlind && fogOpacity > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: '#0A0F0C',
                    opacity: fogOpacity,
                    pointerEvents: 'none',
                    zIndex: 20,
                    transition: 'opacity 0.2s ease',
                  }}
                />
              )}

              {/* 1. Standing 3D Extruded Wall Block */}
              {isWall && (
                <div
                  className={`smartmaze-wall-block-3d ${
                    isFallingWalls ? 'smartmaze-wall-block-3d--falling' : ''
                  } ${isStateWallSolid ? 'smartmaze-wall-block-3d--statechange' : ''}`}
                  style={{ animationDelay: `${wallStaggerDelay}s` }}
                >
                  <div className="smartmaze-wall-top-face" />
                  <div className="smartmaze-wall-front-face" />
                  <div className="smartmaze-wall-side-face" />
                  <div className="smartmaze-wall-contact-shadow" />
                </div>
              )}

              {/* 2. Floor Tile Texture & Ghost State Markings */}
              {!isWall && <div className="smartmaze-floor-tile" />}
              {isStateWallGhost && <div className="smartmaze-statechange-floor-ghost" />}

              {/* 3. Start Pedestal Indicator */}
              {isStart && (
                <div className="smartmaze-marker-3d smartmaze-marker--start-3d">
                  <div className="smartmaze-pedestal-ring" />
                  <span className="smartmaze-marker-rune">START</span>
                </div>
              )}

              {/* 4. Goal Architectural Structure & Radiant Amber Light */}
              {isGoal && (
                <div className="smartmaze-marker-3d smartmaze-marker--goal-3d">
                  <div className="smartmaze-goal-light-ring-outer" />
                  <div className="smartmaze-goal-light-ring-inner" />
                  <div className="smartmaze-goal-crystal-core" />
                  <span className="smartmaze-marker-rune">GOAL</span>
                </div>
              )}

              {/* 5. Interactive Ancient Stone Switch Pedestal */}
              {isSwitch && (
                <div
                  className={`smartmaze-mechanism-3d smartmaze-mechanism--switch-3d ${
                    currentSwitchActive ? 'smartmaze-mechanism--switch-active-3d' : ''
                  }`}
                >
                  <div className="smartmaze-switch-plate">
                    <span className="smartmaze-switch-rune">{currentSwitchActive ? '◆' : '◇'}</span>
                  </div>
                  <span className="smartmaze-mechanism-label-3d">
                    {currentSwitchActive ? 'ACTIVE' : 'SWITCH'}
                  </span>
                </div>
              )}

              {/* 6. Realistic Dimensional Stone Gate */}
              {isGate && (
                <div
                  className={`smartmaze-mechanism-3d smartmaze-mechanism--gate-3d ${
                    currentGateOpen ? 'smartmaze-mechanism--gate-open-3d' : 'smartmaze-mechanism--gate-sealed-3d'
                  }`}
                >
                  <div className="smartmaze-gate-structure">
                    <div className="smartmaze-gate-pillar-left" />
                    <div className="smartmaze-gate-bars-mesh">
                      <div className="smartmaze-gate-bar-v" />
                      <div className="smartmaze-gate-bar-v" />
                    </div>
                    <div className="smartmaze-gate-pillar-right" />
                  </div>
                  <span className="smartmaze-mechanism-label-3d">
                    {currentGateOpen ? 'UNSEALED' : 'SEALED'}
                  </span>
                </div>
              )}

              {/* 7. Pressure Plate Pedestal */}
              {isPressurePlate && (
                <div
                  className={`smartmaze-mechanism-3d smartmaze-mechanism--plate-3d ${
                    currentPlatePressed ? 'smartmaze-mechanism--plate-pressed-3d' : ''
                  }`}
                >
                  <div className="smartmaze-plate-disc">
                    <span className="smartmaze-switch-rune">◎</span>
                  </div>
                  <span className="smartmaze-mechanism-label-3d">
                    {currentPlatePressed ? 'PRESSED' : 'PLATE'}
                  </span>
                </div>
              )}

              {/* 8. One-Way Directional Indicator */}
              {isOneWay && (
                <div className="smartmaze-mechanism-3d smartmaze-mechanism--oneway-3d">
                  <span className="smartmaze-oneway-arrow">
                    {currentOneWay.allowedDirection === 0 ? '▲' :
                     currentOneWay.allowedDirection === 1 ? '▼' :
                     currentOneWay.allowedDirection === 2 ? '◄' : '►'}
                  </span>
                </div>
              )}

              {/* 9. State-Change Trigger Pedestal */}
              {isStateChangeTrigger && (
                <div
                  className={`smartmaze-mechanism-3d smartmaze-mechanism--statechange-3d ${
                    currentStateChangeTrigger.currentState === 1 ? 'smartmaze-statechange-active' : ''
                  }`}
                >
                  <div className="smartmaze-switch-plate">
                    <span className="smartmaze-switch-rune">☯</span>
                  </div>
                  <span className="smartmaze-mechanism-label-3d">
                    SHIFT {currentStateChangeTrigger.currentState}
                  </span>
                </div>
              )}

              {/* 10. Temporary Path Tile & Step Countdown */}
              {isTempPath && (
                <div
                  className={`smartmaze-mechanism-3d smartmaze-mechanism--temp-path-3d ${
                    currentTempPath.isActive ? 'smartmaze-temp-path--active' : 'smartmaze-temp-path--inactive'
                  }`}
                >
                  {currentTempPath.isActive ? (
                    <span className="smartmaze-temp-countdown font-mono">
                      ⏳ {currentTempPath.movesRemaining}
                    </span>
                  ) : (
                    <span className="smartmaze-temp-expired font-mono">EXPIRED</span>
                  )}
                </div>
              )}

              {/* 11. Temporary Path Trigger */}
              {isTempTrigger && (
                <div className="smartmaze-mechanism-3d smartmaze-mechanism--temp-trigger-3d">
                  <div className="smartmaze-switch-plate">
                    <span className="smartmaze-switch-rune">⌛</span>
                  </div>
                  <span className="smartmaze-mechanism-label-3d">TIMER</span>
                </div>
              )}

              {/* 12. Hidden Path Trigger & Revealed Secret Archway */}
              {isHiddenTrigger && (
                <div className="smartmaze-mechanism-3d smartmaze-mechanism--hidden-trigger-3d">
                  <div className="smartmaze-switch-plate">
                    <span className="smartmaze-switch-rune">✦</span>
                  </div>
                  <span className="smartmaze-mechanism-label-3d">SECRET</span>
                </div>
              )}

              {isHiddenPath && isHiddenRevealed && (
                <div className="smartmaze-mechanism-3d smartmaze-mechanism--hidden-revealed-3d">
                  <span className="smartmaze-switch-rune">✦</span>
                  <span className="smartmaze-mechanism-label-3d">PASSAGE</span>
                </div>
              )}

              {/* 13. Sequence Lock Rune Pedestal */}
              {isSequenceRune && (
                <div
                  className={`smartmaze-mechanism-3d smartmaze-mechanism--sequence-3d ${
                    currentSequenceRune.isActivated ? 'smartmaze-sequence--active' : ''
                  } ${currentSequenceRune.isNextTarget ? 'smartmaze-sequence--target' : ''}`}
                >
                  <div className="smartmaze-sequence-rune-badge font-mono">
                    {currentSequenceRune.isActivated ? '✓' : currentSequenceRune.stepNumber}
                  </div>
                  <span className="smartmaze-mechanism-label-3d">
                    RUNE {currentSequenceRune.stepNumber}
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* 9. Luminous Player Orb (Rendered inside 3D grid space for exact alignment) */}
      {playerPos && (
        <PlayerOrb pos={playerPos} cellSize={cellSize} isMoving={isMoving} blockedBump={blockedBump} />
      )}
    </div>
  );
}


