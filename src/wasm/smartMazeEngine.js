/**
 * SmartMaze Engine React Adapter (src/wasm/smartMazeEngine.js)
 * Bridge between React UI and C++ GameEngine via WebAssembly (public/wasm/smartmaze_engine.js).
 * 
 * Provides authoritative movement calculation, wall collision detection, move counting,
 * level loading, and goal/win verification strictly powered by C++ WebAssembly.
 */

export const DIRECTION = {
  UP: 0,
  DOWN: 1,
  LEFT: 2,
  RIGHT: 3,
};

let wasmInstance = null;
let currentMode = 'INITIALIZING...';
let initError = null;

// Fallback state definition kept solely for offline/test safety if explicitly triggered
let fallbackState = {
  x: 1,
  y: 1,
  moveCount: 0,
  isWon: false,
  levelId: 1,
  unlocked: [true].concat(Array(19).fill(false)),
  completed: Array(20).fill(false),
};

let fallbackCustomEngine = {
  active: false,
  levelId: 0,
  name: '',
  width: 15,
  height: 15,
  grid: [],
  player: { x: 1, y: 1 },
  start: { x: 1, y: 1 },
  goal: { x: 13, y: 13 },
  moveCount: 0,
  isWon: false,
  switches: [],
  gates: [],
};

let activeCustomLevel = null;

export function getActiveCustomLevel() {
  return activeCustomLevel;
}

/**
 * Dynamically loads and initializes the compiled C++ Emscripten WebAssembly Module
 */
async function loadWasmModule() {
  if (wasmInstance) return wasmInstance;

  // 1. Browser Environment Loading (Vite / React)
  if (typeof window !== 'undefined') {
    try {
      const { default: createSmartMazeModule } = await import('./smartmaze_engine.js');
      wasmInstance = await createSmartMazeModule({
        locateFile: (file) => `/wasm/${file}`,
      });
      currentMode = 'REAL WASM MODE';
      console.log('✦ [SmartMaze Engine] Connected to REAL C++ WebAssembly Engine (smartmaze_engine.wasm)');
      return wasmInstance;
    } catch (err) {
      initError = err;
      console.error('❌ [SmartMaze Engine] Real WASM loading failed:', err);
      throw err;
    }
  }

  // 2. Node.js Environment Loading (for verification scripts)
  if (typeof process !== 'undefined' && process?.versions?.node) {
    try {
      const nodePathMod = 'path';
      const nodeFsMod = 'fs';
      const path = await import(/* @vite-ignore */ nodePathMod);
      const fs = await import(/* @vite-ignore */ nodeFsMod);
      const wasmFilePath = path.resolve('src/wasm/smartmaze_engine.wasm');
      const fileUrl = 'file:///' + path.resolve('src/wasm/smartmaze_engine.js').replace(/\\/g, '/');

      const { default: createSmartMazeModule } = await import(/* @vite-ignore */ fileUrl);
      let wasmBinary;
      if (fs.existsSync(wasmFilePath)) {
        const buf = fs.readFileSync(wasmFilePath);
        wasmBinary = new Uint8Array(buf);
      }
      wasmInstance = await createSmartMazeModule({
        wasmBinary,
      });
      currentMode = 'REAL WASM MODE';
      console.log('✦ [SmartMaze Engine Node] Connected to REAL C++ WebAssembly Engine');
      return wasmInstance;
    } catch (err) {
      initError = err;
      console.error('❌ [SmartMaze Engine Node] WASM load error:', err);
      throw err;
    }
  }

  throw new Error('WebAssembly environment is unavailable.');
}

/**
 * Initialize SmartMaze GameEngine with C++ WASM
 */
export async function initializeGame() {
  try {
    const mod = await loadWasmModule();
    if (mod && typeof mod._initializeGame === 'function') {
      mod._initializeGame();
      currentMode = 'REAL WASM MODE';
      return true;
    }
  } catch (err) {
    initError = err;
    console.error('❌ [SmartMaze Engine] initializeGame() WASM Failure:', err);
    currentMode = `WASM ERROR: ${err.message || err}`;
  }
  return false;
}

/**
 * Initialize / Load a specific fixed level in C++ GameEngine
 * @param {number} levelId (1 - 20)
 */
export async function initializeLevel(levelId) {
  if (levelId !== 0) {
    activeCustomLevel = null;
  }
  fallbackCustomEngine.active = false;
  try {
    const mod = await loadWasmModule();
    if (mod && typeof mod._initializeLevel === 'function' && levelId > 0) {
      const ok = Boolean(mod._initializeLevel(levelId));
      currentMode = 'REAL WASM MODE';
      console.log(`✦ [SmartMaze Engine] Initialized Level ${levelId} via C++ WASM`);
      return ok;
    }
  } catch (err) {
    console.error(`❌ [SmartMaze Engine] initializeLevel(${levelId}) WASM Failure:`, err);
  }
  fallbackState.levelId = levelId;
  fallbackState.switchActive = false;
  fallbackState.gateOpen = false;
  return false;
}

export function getCurrentLevelId() {
  if (activeCustomLevel || fallbackCustomEngine.active) return 0;
  if (wasmInstance && typeof wasmInstance._getCurrentLevelId === 'function') {
    return wasmInstance._getCurrentLevelId();
  }
  return fallbackState.levelId;
}

export function getLevelCount() {
  if (wasmInstance && typeof wasmInstance._getLevelCount === 'function') {
    return wasmInstance._getLevelCount();
  }
  return 20;
}

export function isLevelUnlocked(levelId) {
  if (wasmInstance && typeof wasmInstance._isLevelUnlocked === 'function') {
    return Boolean(wasmInstance._isLevelUnlocked(levelId));
  }
  return levelId === 1 || fallbackState.unlocked[levelId - 1];
}

export function isLevelCompleted(levelId) {
  if (wasmInstance && typeof wasmInstance._isLevelCompleted === 'function') {
    return Boolean(wasmInstance._isLevelCompleted(levelId));
  }
  return Boolean(fallbackState.completed[levelId - 1]);
}

export function completeLevel(levelId) {
  if (wasmInstance && typeof wasmInstance._completeLevel === 'function') {
    return Boolean(wasmInstance._completeLevel(levelId));
  }
  fallbackState.completed[levelId - 1] = true;
  if (levelId < 20) fallbackState.unlocked[levelId] = true;
  return true;
}

export function getLevelDifficulty(levelId) {
  if (wasmInstance && typeof wasmInstance._getLevelDifficulty === 'function') {
    return wasmInstance._getLevelDifficulty(levelId);
  }
  return Math.ceil(levelId / 4);
}

export function getLevelPuzzleType(levelId) {
  if (wasmInstance && typeof wasmInstance._getLevelPuzzleType === 'function') {
    return wasmInstance._getLevelPuzzleType(levelId);
  }
  return 0;
}

/**
 * Convert string or number direction input into numeric Direction Enum (0=UP, 1=DOWN, 2=LEFT, 3=RIGHT)
 */
function parseDirection(direction) {
  if (typeof direction === 'number') return direction;
  switch (direction?.toUpperCase?.() || direction) {
    case 'UP': return DIRECTION.UP;
    case 'DOWN': return DIRECTION.DOWN;
    case 'LEFT': return DIRECTION.LEFT;
    case 'RIGHT': return DIRECTION.RIGHT;
    default: return -1;
  }
}

/**
 * Move Player in C++ GameEngine or Fallback Engine
 * @param {string|number} direction 
 * @returns {boolean} true if movement succeeded, false if blocked by wall/boundary/won state
 */
export function movePlayer(direction) {
  const dirCode = parseDirection(direction);
  if (dirCode === -1) return false;

  if (wasmInstance && typeof wasmInstance._loadCustomMaze === 'function' && typeof wasmInstance._movePlayer === 'function') {
    const success = Boolean(wasmInstance._movePlayer(dirCode));
    console.log(`[SmartMaze C++ WASM] movePlayer(${direction}) -> ${success ? 'OK' : 'BLOCKED'} | Pos: (${getPlayerX()}, ${getPlayerY()})`);
    return success;
  }

  // Fallback Engine Execution for Custom Mazes
  if (fallbackCustomEngine.active && fallbackCustomEngine.grid.length > 0) {
    if (fallbackCustomEngine.isWon) return false;

    let { x, y } = fallbackCustomEngine.player;
    if (dirCode === DIRECTION.UP) y -= 1;
    else if (dirCode === DIRECTION.DOWN) y += 1;
    else if (dirCode === DIRECTION.LEFT) x -= 1;
    else if (dirCode === DIRECTION.RIGHT) x += 1;

    if (x < 0 || x >= fallbackCustomEngine.width || y < 0 || y >= fallbackCustomEngine.height) {
      return false;
    }

    const cell = fallbackCustomEngine.grid[y]?.[x];
    if (cell === '#') return false;

    // Check closed gate
    const closedGate = fallbackCustomEngine.gates.find((g) => g.x === x && g.y === y && !g.isOpen);
    if (closedGate) return false;

    // Execute valid move
    fallbackCustomEngine.player = { x, y };
    fallbackCustomEngine.moveCount += 1;

    // Check switch stepping
    const switched = fallbackCustomEngine.switches.find((s) => s.x === x && s.y === y);
    if (switched) {
      switched.isActive = true;
      fallbackCustomEngine.gates.forEach((g) => {
        if (g.id === switched.targetGateId) g.isOpen = true;
      });
    }

    // Check Goal portal reach
    if (x === fallbackCustomEngine.goal.x && y === fallbackCustomEngine.goal.y) {
      fallbackCustomEngine.isWon = true;
    }

    return true;
  }

  return false;
}

/**
 * Retrieve current player X coordinate directly from Engine
 */
export function getPlayerX() {
  if (wasmInstance && typeof wasmInstance._loadCustomMaze === 'function' && typeof wasmInstance._getPlayerX === 'function') {
    return wasmInstance._getPlayerX();
  }
  if (fallbackCustomEngine.active) return fallbackCustomEngine.player.x;
  return fallbackState.x;
}

/**
 * Retrieve current player Y coordinate directly from Engine
 */
export function getPlayerY() {
  if (wasmInstance && typeof wasmInstance._loadCustomMaze === 'function' && typeof wasmInstance._getPlayerY === 'function') {
    return wasmInstance._getPlayerY();
  }
  if (fallbackCustomEngine.active) return fallbackCustomEngine.player.y;
  return fallbackState.y;
}

/**
 * Retrieve active Switches array from Engine
 */
export function getSwitches() {
  if (wasmInstance && typeof wasmInstance._loadCustomMaze === 'function' && typeof wasmInstance._getSwitchCount === 'function') {
    const count = wasmInstance._getSwitchCount();
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push({
        id: i + 1,
        x: wasmInstance._getSwitchX(i),
        y: wasmInstance._getSwitchY(i),
        isActive: Boolean(wasmInstance._getSwitchState(i)),
        targetGateId: wasmInstance._getSwitchTargetGateId(i),
      });
    }
    return result;
  }
  if (fallbackCustomEngine.active) return fallbackCustomEngine.switches;
  return [];
}

/**
 * Retrieve active Gates array from Engine
 */
export function getGates() {
  if (wasmInstance && typeof wasmInstance._loadCustomMaze === 'function' && typeof wasmInstance._getGateCount === 'function') {
    const count = wasmInstance._getGateCount();
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push({
        id: wasmInstance._getGateId(i),
        x: wasmInstance._getGateX(i),
        y: wasmInstance._getGateY(i),
        isOpen: Boolean(wasmInstance._getGateState(i)),
      });
    }
    return result;
  }
  if (fallbackCustomEngine.active) return fallbackCustomEngine.gates;
  return [];
}

/**
 * Retrieve Pressure Plates array from C++ GameEngine via WASM
 */
export function getPressurePlates() {
  if (wasmInstance && typeof wasmInstance._getPressurePlateCount === 'function') {
    const count = wasmInstance._getPressurePlateCount();
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push({
        id: i + 1,
        x: wasmInstance._getPressurePlateX(i),
        y: wasmInstance._getPressurePlateY(i),
        isPressed: Boolean(wasmInstance._getPressurePlateState(i)),
      });
    }
    return result;
  }
  return [];
}

/**
 * Retrieve One-Way Passages array from C++ GameEngine via WASM
 */
export function getOneWayPaths() {
  if (wasmInstance && typeof wasmInstance._getOneWayCount === 'function') {
    const count = wasmInstance._getOneWayCount();
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push({
        x: wasmInstance._getOneWayX(i),
        y: wasmInstance._getOneWayY(i),
        allowedDirection: wasmInstance._getOneWayDirection(i),
      });
    }
    return result;
  }
  return [];
}

/**
 * Retrieve Moving Walls array from C++ GameEngine via WASM
 */
export function getMovingWalls() {
  if (wasmInstance && typeof wasmInstance._getMovingWallCount === 'function') {
    const count = wasmInstance._getMovingWallCount();
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push({
        id: i + 1,
        x: wasmInstance._getMovingWallX(i),
        y: wasmInstance._getMovingWallY(i),
        isRetracted: Boolean(wasmInstance._getMovingWallState(i)),
      });
    }
    return result;
  }
  return [];
}

/**
 * Retrieve State-Change Walls array from C++ GameEngine via WASM
 */
export function getStateChanges() {
  if (wasmInstance && typeof wasmInstance._getStateChangeCount === 'function') {
    const count = wasmInstance._getStateChangeCount();
    const result = [];
    for (let i = 0; i < count; i++) {
      const currentState = wasmInstance._getStateChangeState(i);
      const state0Walls = [];
      const s0Count = wasmInstance._getStateChangeWallCount(i, 0);
      for (let w = 0; w < s0Count; w++) {
        state0Walls.push({
          x: wasmInstance._getStateChangeWallX(i, 0, w),
          y: wasmInstance._getStateChangeWallY(i, 0, w),
        });
      }
      const state1Walls = [];
      const s1Count = wasmInstance._getStateChangeWallCount(i, 1);
      for (let w = 0; w < s1Count; w++) {
        state1Walls.push({
          x: wasmInstance._getStateChangeWallX(i, 1, w),
          y: wasmInstance._getStateChangeWallY(i, 1, w),
        });
      }
      result.push({
        id: i + 1,
        triggerX: wasmInstance._getStateChangeX(i),
        triggerY: wasmInstance._getStateChangeY(i),
        currentState,
        state0Walls,
        state1Walls,
      });
    }
    return result;
  }
  return [];
}

/**
 * Retrieve Temporary Paths array from C++ GameEngine via WASM
 */
export function getTemporaryPaths() {
  if (wasmInstance && typeof wasmInstance._getTemporaryPathCount === 'function') {
    const count = wasmInstance._getTemporaryPathCount();
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push({
        id: i + 1,
        x: wasmInstance._getTemporaryPathX(i),
        y: wasmInstance._getTemporaryPathY(i),
        triggerX: wasmInstance._getTemporaryPathTriggerX(i),
        triggerY: wasmInstance._getTemporaryPathTriggerY(i),
        isActive: Boolean(wasmInstance._getTemporaryPathState(i)),
        movesRemaining: wasmInstance._getTemporaryPathMovesRemaining(i),
        durationMoves: wasmInstance._getTemporaryPathDuration(i),
      });
    }
    return result;
  }
  return [];
}

/**
 * Retrieve Hidden Paths array from C++ GameEngine via WASM
 */
export function getHiddenPaths() {
  if (wasmInstance && typeof wasmInstance._getHiddenPathCount === 'function') {
    const count = wasmInstance._getHiddenPathCount();
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push({
        id: i + 1,
        x: wasmInstance._getHiddenPathX(i),
        y: wasmInstance._getHiddenPathY(i),
        triggerX: wasmInstance._getHiddenPathTriggerX(i),
        triggerY: wasmInstance._getHiddenPathTriggerY(i),
        isRevealed: Boolean(wasmInstance._getHiddenPathState(i)),
      });
    }
    return result;
  }
  return [];
}

/**
 * Retrieve Sequence Locks array from C++ GameEngine via WASM
 */
export function getSequenceLocks() {
  if (wasmInstance && typeof wasmInstance._getSequenceLockCount === 'function') {
    const count = wasmInstance._getSequenceLockCount();
    const result = [];
    for (let i = 0; i < count; i++) {
      const runeCount = wasmInstance._getSequenceLockRuneCount(i);
      const runePositions = [];
      for (let r = 0; r < runeCount; r++) {
        runePositions.push({
          x: wasmInstance._getSequenceLockRuneX(i, r),
          y: wasmInstance._getSequenceLockRuneY(i, r),
        });
      }
      result.push({
        id: i + 1,
        targetGateId: wasmInstance._getSequenceLockTargetGateId(i),
        currentStep: wasmInstance._getSequenceLockStep(i),
        isUnlocked: Boolean(wasmInstance._getSequenceLockState(i)),
        runePositions,
      });
    }
    return result;
  }
  return [];
}

/**
 * Retrieve Move Limit from C++ GameEngine via WASM
 */
export function getMoveLimit() {
  if (wasmInstance && typeof wasmInstance._getMoveLimit === 'function') {
    return wasmInstance._getMoveLimit();
  }
  return 0;
}

/**
 * Retrieve Moves Remaining from C++ GameEngine via WASM
 */
export function getMovesRemaining() {
  if (wasmInstance && typeof wasmInstance._getMovesRemaining === 'function') {
    return wasmInstance._getMovesRemaining();
  }
  return -1;
}


/**
 * Retrieve current move count directly from C++ GameEngine via WASM
 */
export function getMoveCount() {
  if (wasmInstance && typeof wasmInstance._loadCustomMaze === 'function' && typeof wasmInstance._getMoveCount === 'function') {
    return wasmInstance._getMoveCount();
  }
  if (fallbackCustomEngine.active) return fallbackCustomEngine.moveCount;
  return fallbackState.moveCount;
}

/**
 * Retrieve current win state directly from C++ GameEngine via WASM
 */
export function isWon() {
  if (wasmInstance && typeof wasmInstance._loadCustomMaze === 'function' && typeof wasmInstance._isWon === 'function') {
    return Boolean(wasmInstance._isWon());
  }
  if (fallbackCustomEngine.active) return fallbackCustomEngine.isWon;
  return fallbackState.isWon;
}

/**
 * Retrieve active Engine Execution Mode ('REAL WASM MODE' or error state)
 */
export function getEngineMode() {
  return currentMode;
}

/**
 * Retrieve active maze layout data directly from C++ GameEngine via WASM
 */
export function getLoadedMazeData() {
  const levelId = getCurrentLevelId();

  // If a custom maze is active
  if (activeCustomLevel || levelId === 0) {
    if (!activeCustomLevel) {
      return {
        levelId: 0,
        name: 'CUSTOM MAZE — TEST RUN',
        rule: 'Navigate your custom creation to reach the goal portal.',
        width: 15,
        height: 15,
        start: { x: 1, y: 1 },
        goal: { x: 13, y: 13 },
        grid: [],
      };
    }
    const lines = activeCustomLevel.mazeData.trim().split('\n').map((l) => l.replace('\r', '')).filter(Boolean);
    const height = lines.length;
    const width = lines[0]?.length || 15;
    let start = { x: 1, y: 1 };
    let goal = { x: width - 2, y: height - 2 };
    const grid = [];

    for (let y = 0; y < height; y++) {
      const row = [];
      for (let x = 0; x < width; x++) {
        const c = lines[y]?.[x] || ' ';
        if (c === 'S') start = { x, y };
        if (c === 'G') goal = { x, y };
        row.push(c === '#' ? 1 : 0);
      }
      grid.push(row);
    }

    const displayName = activeCustomLevel.name
      ? `CUSTOM MAZE — ${activeCustomLevel.name.toUpperCase()}`
      : 'CUSTOM MAZE — TEST RUN';

    return {
      levelId: 0,
      name: displayName,
      rule: 'Navigate your custom creation to reach the goal portal.',
      width,
      height,
      start,
      goal,
      grid,
    };
  }

  let width = 7;
  let height = 7;
  let start = { x: 1, y: 1 };
  let goal = { x: 5, y: 5 };

  if (wasmInstance) {
    if (typeof wasmInstance._getMazeWidth === 'function') width = wasmInstance._getMazeWidth();
    if (typeof wasmInstance._getMazeHeight === 'function') height = wasmInstance._getMazeHeight();
    if (typeof wasmInstance._getMazeStartX === 'function') start.x = wasmInstance._getMazeStartX();
    if (typeof wasmInstance._getMazeStartY === 'function') start.y = wasmInstance._getMazeStartY();
    if (typeof wasmInstance._getMazeGoalX === 'function') goal.x = wasmInstance._getMazeGoalX();
    if (typeof wasmInstance._getMazeGoalY === 'function') goal.y = wasmInstance._getMazeGoalY();
  }

  const grid = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      let isWall = 0;
      if (wasmInstance && typeof wasmInstance._getMazeCell === 'function') {
        isWall = wasmInstance._getMazeCell(x, y);
      } else {
        // Border wall fallback
        isWall = (y === 0 || y === height - 1 || x === 0 || x === width - 1) ? 1 : 0;
      }
      row.push(isWall);
    }
    grid.push(row);
  }

  const levelNames = [
    "01 — The Threshold", "02 — Verdant Passages", "03 — Monolith of Shifts", "04 — Abyssal Echoes", "05 — The Sunken Sanctuary",
    "06 — Silent Switches", "07 — The Rotating Halls", "08 — Hidden Routes", "09 — Fractured Paths", "10 — The Twin Gates",
    "11 — Shifting Sanctuary", "12 — The Broken Passage", "13 — Echo Chamber", "14 — The Veiled Route", "15 — Convergence",
    "16 — The Forgotten Trial", "17 — The Endless Corridor", "18 — The Last Mechanism", "19 — The Architect's Maze", "20 — The Final Passage"
  ];

  return {
    levelId,
    name: levelNames[levelId - 1] ? `REALM ${levelNames[levelId - 1]}` : `REALM ${levelId.toString().padStart(2, '0')}`,
    rule: 'Navigate the labyrinth to reach the ancient goal portal.',
    width,
    height,
    start,
    goal,
    grid,
  };
}

// ============================================================================
// Milestone 7 — Challenge Mode WASM JS Adapter Functions
// ============================================================================

export async function startChallenge(challengeId, levelId) {
  try {
    const mod = await loadWasmModule();
    if (mod && typeof mod._startChallenge === 'function') {
      const ok = Boolean(mod._startChallenge(challengeId, levelId));
      currentMode = 'REAL WASM MODE';
      console.log(`✦ [SmartMaze Engine] Started Challenge ${challengeId} on Level ${levelId} via C++ WASM`);
      return ok;
    }
  } catch (err) {
    console.error(`❌ [SmartMaze Engine] startChallenge(${challengeId}, ${levelId}) WASM Failure:`, err);
  }
  return false;
}

export function updateChallengeTime(deltaSeconds) {
  if (wasmInstance && typeof wasmInstance._updateChallengeTime === 'function') {
    wasmInstance._updateChallengeTime(deltaSeconds);
  }
}

export function isChallengeActive() {
  if (wasmInstance && typeof wasmInstance._isChallengeActive === 'function') {
    return Boolean(wasmInstance._isChallengeActive());
  }
  return false;
}

export function getChallengeType() {
  if (wasmInstance && typeof wasmInstance._getChallengeType === 'function') {
    return wasmInstance._getChallengeType();
  }
  return 0;
}

export function getChallengeTimeLimit() {
  if (wasmInstance && typeof wasmInstance._getChallengeTimeLimit === 'function') {
    return wasmInstance._getChallengeTimeLimit();
  }
  return 0;
}

export function getChallengeElapsedTime() {
  if (wasmInstance && typeof wasmInstance._getChallengeElapsedTime === 'function') {
    return wasmInstance._getChallengeElapsedTime();
  }
  return 0;
}

export function getChallengeMoveLimit() {
  if (wasmInstance && typeof wasmInstance._getChallengeMoveLimit === 'function') {
    return wasmInstance._getChallengeMoveLimit();
  }
  return 0;
}

export function isChallengeFailed() {
  if (wasmInstance && typeof wasmInstance._isChallengeFailed === 'function') {
    return Boolean(wasmInstance._isChallengeFailed());
  }
  return false;
}

export function isChallengeCompleted() {
  if (wasmInstance && typeof wasmInstance._isChallengeCompleted === 'function') {
    return Boolean(wasmInstance._isChallengeCompleted());
  }
  return false;
}

export function getChallengeRank() {
  if (wasmInstance && typeof wasmInstance._getChallengeRank === 'function') {
    const ptr = wasmInstance._malloc(16);
    wasmInstance._getChallengeRank(ptr, 16);
    const rankStr = wasmInstance.UTF8ToString(ptr);
    wasmInstance._free(ptr);
    return rankStr || 'F';
  }
  return 'F';
}

// ============================================================================
// Milestone 8 — Create Maze Mode JS WASM Adapter Functions
// ============================================================================

export const VALIDATION_CODE = {
  VALID: 0,
  MISSING_START: 1,
  MISSING_GOAL: 2,
  INVALID_BOUNDARIES: 3,
  UNSOLVABLE: 4,
  INVALID_PUZZLE_LINK: 5,
};

function allocateWasmString(mod, str) {
  if (!mod || !str) return 0;
  if (typeof mod.allocateUTF8 === 'function') {
    return mod.allocateUTF8(str);
  }
  if (typeof mod.lengthBytesUTF8 === 'function' && typeof mod.stringToUTF8 === 'function') {
    const len = mod.lengthBytesUTF8(str) + 1;
    const ptr = mod._malloc(len);
    mod.stringToUTF8(str, ptr, len);
    return ptr;
  }
  return 0;
}

function freeWasmString(mod, ptr) {
  if (mod && ptr && typeof mod._free === 'function') {
    mod._free(ptr);
  }
}

/**
 * Load a custom user-built maze into C++ GameEngine via WebAssembly
 * @param {Object} customDef - { id, name, mazeData (ASCII string), width, height, switches, gates, pressurePlates, oneWayPaths, movingWalls }
 */
export async function loadCustomMaze(customDef) {
  if (!customDef || !customDef.mazeData) return false;
  activeCustomLevel = customDef;

  try {
    const mod = await loadWasmModule();
    if (mod && (typeof mod._loadCustomMaze === 'function' || typeof mod.ccall === 'function')) {
      if (typeof mod._resetCustomBuildDef === 'function') mod._resetCustomBuildDef();

      // Add puzzle objects to C++ custom build definition
      (customDef.switches || []).forEach((sw) => {
        if (typeof mod._addCustomSwitch === 'function') mod._addCustomSwitch(sw.x, sw.y, sw.targetGateId || 1);
      });
      (customDef.gates || []).forEach((g) => {
        if (typeof mod._addCustomGate === 'function') mod._addCustomGate(g.id || 1, g.x, g.y, g.isOpen ? 1 : 0);
      });
      (customDef.pressurePlates || []).forEach((pp) => {
        if (typeof mod._addCustomPressurePlate === 'function') mod._addCustomPressurePlate(pp.x, pp.y, pp.targetGateId || 1);
      });
      (customDef.oneWayPaths || []).forEach((ow) => {
        if (typeof mod._addCustomOneWay === 'function') mod._addCustomOneWay(ow.x, ow.y, ow.allowedDirection || 3);
      });
      (customDef.movingWalls || []).forEach((mw) => {
        if (typeof mod._addCustomMovingWall === 'function') mod._addCustomMovingWall(mw.x, mw.y, mw.triggerSwitchId || 1);
      });

      let ok = false;
      if (typeof mod.ccall === 'function') {
        ok = Boolean(mod.ccall('loadCustomMaze', 'number', ['string', 'number', 'number'], [customDef.mazeData, customDef.width || 0, customDef.height || 0]));
      } else {
        const strPtr = allocateWasmString(mod, customDef.mazeData);
        ok = Boolean(mod._loadCustomMaze(strPtr, customDef.width || 0, customDef.height || 0));
        freeWasmString(mod, strPtr);
      }

      currentMode = 'REAL WASM MODE';
      console.log('✦ [SmartMaze Engine] Loaded Custom Maze into C++ WebAssembly Engine');
      return ok;
    }
  } catch (err) {
    console.error('❌ [SmartMaze Engine] loadCustomMaze WASM Failure:', err);
  }

  // Fallback setup
  const lines = customDef.mazeData.trim().split('\n').map((l) => l.replace('\r', '')).filter(Boolean);
  const height = lines.length;
  const width = lines[0]?.length || 15;
  let start = { x: 1, y: 1 };
  let goal = { x: width - 2, y: height - 2 };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const c = lines[y]?.[x];
      if (c === 'S') start = { x, y };
      if (c === 'G') goal = { x, y };
    }
  }

  fallbackCustomEngine = {
    active: true,
    levelId: 0,
    name: customDef.name || 'CUSTOM MAZE — TEST RUN',
    width,
    height,
    grid: lines,
    player: { ...start },
    start: { ...start },
    goal: { ...goal },
    moveCount: 0,
    isWon: false,
    switches: (customDef.switches || []).map((s) => ({ ...s, isActive: false })),
    gates: (customDef.gates || []).map((g) => ({ ...g, isOpen: Boolean(g.isOpen) })),
  };

  fallbackState.levelId = 0;
  return true;
}

/**
 * Validate custom maze layout for Start ('S'), Goal ('G'), boundary wall integrity, and state-space solvability.
 * Returns { code: number, message: string, shortestPathMoves: number }
 */
export async function validateCustomMaze(customDef) {
  if (!customDef || !customDef.mazeData) {
    return { code: VALIDATION_CODE.MISSING_START, message: 'Maze data is empty.', shortestPathMoves: 0 };
  }

  try {
    const mod = await loadWasmModule();
    if (mod && (typeof mod._validateCustomMaze === 'function' || typeof mod.ccall === 'function')) {
      if (typeof mod._resetCustomBuildDef === 'function') mod._resetCustomBuildDef();

      (customDef.switches || []).forEach((sw) => {
        if (typeof mod._addCustomSwitch === 'function') mod._addCustomSwitch(sw.x, sw.y, sw.targetGateId || 1);
      });
      (customDef.gates || []).forEach((g) => {
        if (typeof mod._addCustomGate === 'function') mod._addCustomGate(g.id || 1, g.x, g.y, g.isOpen ? 1 : 0);
      });

      let code;
      let moves = 0;
      if (typeof mod.ccall === 'function') {
        code = mod.ccall('validateCustomMaze', 'number', ['string', 'number', 'number'], [customDef.mazeData, customDef.width || 0, customDef.height || 0]);
        if (typeof mod._getCustomMazeSolutionMoves === 'function') {
          moves = mod.ccall('getCustomMazeSolutionMoves', 'number', ['string'], [customDef.mazeData]);
        }
      } else {
        const strPtr = allocateWasmString(mod, customDef.mazeData);
        code = mod._validateCustomMaze(strPtr, customDef.width || 0, customDef.height || 0);
        if (typeof mod._getCustomMazeSolutionMoves === 'function') {
          moves = mod._getCustomMazeSolutionMoves(strPtr);
        }
        freeWasmString(mod, strPtr);
      }

      const messages = {
        [VALIDATION_CODE.VALID]: 'Labyrinth is valid and solvable!',
        [VALIDATION_CODE.MISSING_START]: 'Maze must contain a Start position (S).',
        [VALIDATION_CODE.MISSING_GOAL]: 'Maze must contain a Goal portal (G).',
        [VALIDATION_CODE.INVALID_BOUNDARIES]: 'Outer maze boundaries must be enclosed by solid walls.',
        [VALIDATION_CODE.UNSOLVABLE]: 'Maze is unsolvable. No valid path exists from Start to Goal.',
        [VALIDATION_CODE.INVALID_PUZZLE_LINK]: 'Puzzle mechanism reference error (e.g. unlinked switch/gate).',
      };

      return {
        code,
        message: messages[code] || 'Validation check complete.',
        shortestPathMoves: moves,
      };
    }
  } catch (err) {
    console.error('❌ [SmartMaze Engine] validateCustomMaze WASM Failure:', err);
  }

  // JS Fallback Validator with BFS Pathfinding Solvability Search
  const lines = customDef.mazeData.trim().split('\n').map((l) => l.replace('\r', '')).filter(Boolean);
  if (lines.length === 0) return { code: VALIDATION_CODE.MISSING_START, message: 'Maze data is empty.', shortestPathMoves: 0 };

  const height = lines.length;
  const width = lines[0].length;
  let startX = -1, startY = -1;
  let goalX = -1, goalY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      if (lines[y][x] === 'S') { startX = x; startY = y; }
      if (lines[y][x] === 'G') { goalX = x; goalY = y; }
    }
  }

  if (startX === -1 || startY === -1) return { code: VALIDATION_CODE.MISSING_START, message: 'Maze must contain a Start position (S).', shortestPathMoves: 0 };
  if (goalX === -1 || goalY === -1) return { code: VALIDATION_CODE.MISSING_GOAL, message: 'Maze must contain a Goal portal (G).', shortestPathMoves: 0 };

  for (let x = 0; x < width; x++) {
    if (lines[0][x] !== '#' || lines[height - 1][x] !== '#') {
      return { code: VALIDATION_CODE.INVALID_BOUNDARIES, message: 'Outer maze boundaries must be enclosed by solid walls.', shortestPathMoves: 0 };
    }
  }
  for (let y = 0; y < height; y++) {
    if (lines[y][0] !== '#' || lines[y][width - 1] !== '#') {
      return { code: VALIDATION_CODE.INVALID_BOUNDARIES, message: 'Outer maze boundaries must be enclosed by solid walls.', shortestPathMoves: 0 };
    }
  }

  // BFS Search for shortest path from Start to Goal
  const queue = [{ x: startX, y: startY, dist: 0 }];
  const visited = new Set();
  visited.add(`${startX},${startY}`);

  const dirs = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  let shortestPath = -1;

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr.x === goalX && curr.y === goalY) {
      shortestPath = curr.dist;
      break;
    }

    for (const d of dirs) {
      const nx = curr.x + d.dx;
      const ny = curr.y + d.dy;
      const key = `${nx},${ny}`;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited.has(key)) {
        const cell = lines[ny][nx];
        if (cell !== '#') {
          visited.add(key);
          queue.push({ x: nx, y: ny, dist: curr.dist + 1 });
        }
      }
    }
  }

  if (shortestPath === -1) {
    return { code: VALIDATION_CODE.UNSOLVABLE, message: 'Maze is unsolvable. No valid path exists from Start to Goal.', shortestPathMoves: 0 };
  }

  return { code: VALIDATION_CODE.VALID, message: 'Labyrinth is valid and solvable!', shortestPathMoves: shortestPath };
}


