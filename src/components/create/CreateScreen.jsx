import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { validateCustomMaze, VALIDATION_CODE } from '../../wasm/smartMazeEngine';
import { saveCustomLevel, getSavedCustomLevels, deleteCustomLevel, convertGridToAscii, parseAsciiToGrid } from '../../utils/customMazeStorage';
import HubEnvironment from '../hub/HubEnvironment';
import GlassContainer from '../common/GlassContainer';
import PrimaryButton from '../common/PrimaryButton';
import GhostButton from '../common/GhostButton';
import './create.css';

const DEFAULT_DIMENSION = 15;

const TOOLS = [
  { id: 'WALL', label: 'Wall (#)', char: '#', icon: '🧱', type: 'cell' },
  { id: 'PATH', label: 'Passage ( )', char: ' ', icon: '▫️', type: 'cell' },
  { id: 'START', label: 'Start (S)', char: 'S', icon: '🌀', type: 'cell' },
  { id: 'GOAL', label: 'Goal (G)', char: 'G', icon: '✨', type: 'cell' },
  { id: 'SWITCH', label: 'Switch (?)', char: '?', icon: '🔘', type: 'puzzle' },
  { id: 'GATE', label: 'Gate (|)', char: '|', icon: '🚪', type: 'puzzle' },
  { id: 'PRESSURE', label: 'Pressure (_)', char: '_', icon: '🟪', type: 'puzzle' },
  { id: 'ONEWAY', label: 'One-Way (^)', char: '^', icon: '⬆️', type: 'puzzle' },
  { id: 'MOVING', label: 'Moving Wall (~)', char: '~', icon: '⏹️', type: 'puzzle' },
];

function createDefaultGrid(dim) {
  const grid = [];
  for (let y = 0; y < dim; y++) {
    const row = [];
    for (let x = 0; x < dim; x++) {
      if (y === 0 || y === dim - 1 || x === 0 || x === dim - 1) {
        row.push('#');
      } else if (x === 1 && y === 1) {
        row.push('S');
      } else if (x === dim - 2 && y === dim - 2) {
        row.push('G');
      } else {
        row.push(' ');
      }
    }
    grid.push(row);
  }
  return grid;
}

export default function CreateScreen() {
  const { returnToHub, launchCustomMazeTestPlay } = useApp();

  const [dimension, setDimension] = useState(DEFAULT_DIMENSION);
  const [grid, setGrid] = useState(() => createDefaultGrid(DEFAULT_DIMENSION));
  const [activeTool, setActiveTool] = useState('WALL');
  const [switches, setSwitches] = useState([{ id: 1, x: 3, y: 3, targetGateId: 1 }]);
  const [gates, setGates] = useState([{ id: 1, x: 5, y: 5, isOpen: false }]);

  // History stack for Undo / Redo
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Validation State
  const [valResult, setValResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Save / Load Modal State
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  const [mazeName, setMazeName] = useState('MY CUSTOM LABYRINTH');
  const [savedLevels, setSavedLevels] = useState([]);

  // Mouse interaction state for dragging
  const isMouseDownRef = useRef(false);

  useEffect(() => {
    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const pushStateToHistory = (newGrid) => {
    setHistory((prev) => [...prev.slice(-20), grid]); // Limit history to 20 states
    setRedoStack([]);
    setGrid(newGrid);
    setValResult(null); // Reset validation HUD on edit
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [grid, ...prev]);
    setGrid(previous);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setValResult(null);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, grid]);
    setGrid(next);
    setRedoStack((prev) => prev.slice(1));
    setValResult(null);
  };

  const handleDimensionChange = (newDim) => {
    setDimension(newDim);
    const newGrid = createDefaultGrid(newDim);
    pushStateToHistory(newGrid);
  };

  const handleCellClick = (x, y) => {
    // Outer boundary rim wall protection (keep rim solid)
    if (x === 0 || x === dimension - 1 || y === 0 || y === dimension - 1) {
      if (activeTool !== 'WALL') return;
    }

    const toolObj = TOOLS.find((t) => t.id === activeTool) || TOOLS[0];
    const newGrid = grid.map((row) => [...row]);

    // Remove any existing switches/gates at this cell location
    setSwitches((prev) => prev.filter((sw) => !(sw.x === x && sw.y === y)));
    setGates((prev) => prev.filter((g) => !(g.x === x && g.y === y)));

    if (toolObj.id === 'START') {
      // Clear previous Start location
      for (let r = 0; r < dimension; r++) {
        for (let c = 0; c < dimension; c++) {
          if (newGrid[r][c] === 'S') newGrid[r][c] = ' ';
        }
      }
      newGrid[y][x] = 'S';
    } else if (toolObj.id === 'GOAL') {
      // Clear previous Goal location
      for (let r = 0; r < dimension; r++) {
        for (let c = 0; c < dimension; c++) {
          if (newGrid[r][c] === 'G') newGrid[r][c] = ' ';
        }
      }
      newGrid[y][x] = 'G';
    } else if (toolObj.id === 'SWITCH') {
      newGrid[y][x] = ' ';
      setSwitches((prev) => [...prev.filter((sw) => !(sw.x === x && sw.y === y)), { id: 1, x, y, targetGateId: 1 }]);
    } else if (toolObj.id === 'GATE') {
      newGrid[y][x] = ' ';
      setGates((prev) => [...prev.filter((g) => !(g.x === x && g.y === y)), { id: 1, x, y, isOpen: false }]);
    } else {
      newGrid[y][x] = toolObj.char;
    }

    pushStateToHistory(newGrid);
  };

  const handleMouseEnterCell = (x, y) => {
    if (isMouseDownRef.current && (activeTool === 'WALL' || activeTool === 'PATH')) {
      handleCellClick(x, y);
    }
  };

  const handleClearGrid = () => {
    pushStateToHistory(createDefaultGrid(dimension));
  };

  const getCustomLevelDef = () => {
    const asciiData = convertGridToAscii(grid);
    return {
      id: 0,
      name: mazeName,
      mazeData: asciiData,
      width: dimension,
      height: dimension,
      switches,
      gates,
      pressurePlates: [],
      oneWayPaths: [],
      movingWalls: [],
    };
  };

  const handleValidate = async () => {
    setIsValidating(true);
    const def = getCustomLevelDef();
    const result = await validateCustomMaze(def);
    setValResult(result);
    setIsValidating(false);
  };

  const handleTestPlay = async () => {
    const def = getCustomLevelDef();
    const result = await validateCustomMaze(def);
    setValResult(result);

    if (result.code !== VALIDATION_CODE.VALID) {
      alert(`Cannot test maze! ${result.message}`);
      return;
    }

    launchCustomMazeTestPlay(def);
  };

  const handleOpenSaveModal = () => {
    setSavedLevels(getSavedCustomLevels());
    setShowSaveLoadModal(true);
  };

  const handleSaveCurrentLevel = () => {
    const def = getCustomLevelDef();
    saveCustomLevel(def);
    setSavedLevels(getSavedCustomLevels());
    alert(`Successfully saved "${mazeName}" to local storage!`);
  };

  const handleLoadLevel = (savedObj) => {
    if (!savedObj || !savedObj.mazeData) return;
    const parsedGrid = parseAsciiToGrid(savedObj.mazeData);
    if (parsedGrid.length > 0) {
      setDimension(parsedGrid.length);
      setGrid(parsedGrid);
      setMazeName(savedObj.name || 'MY CUSTOM LABYRINTH');
      if (savedObj.switches) setSwitches(savedObj.switches);
      if (savedObj.gates) setGates(savedObj.gates);
      setHistory([]);
      setRedoStack([]);
      setValResult(null);
      setShowSaveLoadModal(false);
    }
  };

  const handleDeleteLevel = (id, e) => {
    e.stopPropagation();
    if (confirm('Delete this custom level creation?')) {
      deleteCustomLevel(id);
      setSavedLevels(getSavedCustomLevels());
    }
  };

  const renderCellContent = (cellChar, x, y) => {
    if (cellChar === 'S') return <span className="smartmaze-cell-icon">S</span>;
    if (cellChar === 'G') return <span className="smartmaze-cell-icon">G</span>;
    const isSw = switches.some((s) => s.x === x && s.y === y);
    const isGt = gates.some((g) => g.x === x && g.y === y);

    if (isSw) return <span className="smartmaze-cell-icon">🔘</span>;
    if (isGt) return <span className="smartmaze-cell-icon">🚪</span>;
    return null;
  };

  const getCellClassName = (cellChar, x, y) => {
    if (cellChar === 'S') return 'smartmaze-grid-cell cell-start';
    if (cellChar === 'G') return 'smartmaze-grid-cell cell-goal';
    const isSw = switches.some((s) => s.x === x && s.y === y);
    const isGt = gates.some((g) => g.x === x && g.y === y);

    if (isSw) return 'smartmaze-grid-cell cell-switch';
    if (isGt) return 'smartmaze-grid-cell cell-gate';
    if (cellChar === '#') return 'smartmaze-grid-cell cell-wall';
    return 'smartmaze-grid-cell cell-path';
  };

  return (
    <div className="smartmaze-create-page-root">
      {/* Full-Screen Dynamic Theme Environment Backdrop */}
      <HubEnvironment activeMode="create" />

      {/* Top Header Navigation Bar */}
      <header className="smartmaze-create-header">
        <div className="smartmaze-create-header-left">
          <button type="button" onClick={returnToHub} className="smartmaze-create-back-btn">
            ← RETURN TO HUB
          </button>

          <div className="smartmaze-create-title-box">
            <h1 className="smartmaze-create-title">ARCHITECT'S CHAMBER</h1>
            <span className="smartmaze-create-subtitle">SMARTMAZE M8 — CREATE MODE</span>
          </div>
        </div>

        <div className="smartmaze-create-header-right">
          <select
            value={dimension}
            onChange={(e) => handleDimensionChange(parseInt(e.target.value, 10))}
            className="smartmaze-grid-size-select"
          >
            <option value={15}>15 × 15 Grid</option>
            <option value={17}>17 × 17 Grid</option>
            <option value={19}>19 × 19 Grid</option>
            <option value={21}>21 × 21 Grid</option>
          </select>

          <GhostButton onClick={handleUndo} disabled={history.length === 0} style={{ padding: '0.45rem 0.8rem' }}>
            ↶ UNDO
          </GhostButton>

          <GhostButton onClick={handleRedo} disabled={redoStack.length === 0} style={{ padding: '0.45rem 0.8rem' }}>
            ↷ REDO
          </GhostButton>

          <GhostButton onClick={handleClearGrid} style={{ padding: '0.45rem 0.8rem' }}>
            ↺ CLEAR
          </GhostButton>

          <GhostButton onClick={handleOpenSaveModal} style={{ padding: '0.45rem 0.8rem' }}>
            💾 SAVE / LOAD
          </GhostButton>

          <PrimaryButton onClick={handleValidate} disabled={isValidating} style={{ padding: '0.45rem 1rem' }}>
            {isValidating ? 'VALIDATING...' : '✔ VALIDATE'}
          </PrimaryButton>

          <PrimaryButton onClick={handleTestPlay} style={{ padding: '0.45rem 1.25rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            ▶ TEST MAZE
          </PrimaryButton>
        </div>
      </header>

      {/* Editor Main Workspace */}
      <main className="smartmaze-create-workspace">
        {/* Left Tool Palette Sidebar */}
        <aside className="smartmaze-create-palette">
          <GlassContainer variant="primary" className="smartmaze-palette-glass-card">
            <div>
              <span className="smartmaze-palette-section-header">✦ CELL ARCHITECTURE</span>
              <div className="smartmaze-palette-grid">
                {TOOLS.filter((t) => t.type === 'cell').map((tool) => (
                  <div
                    key={tool.id}
                    className={`smartmaze-tool-card ${activeTool === tool.id ? 'active' : ''}`}
                    onClick={() => setActiveTool(tool.id)}
                  >
                    <span className="smartmaze-tool-icon-box">{tool.icon}</span>
                    <span className="smartmaze-tool-label">{tool.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="smartmaze-palette-section-header">⚡ PUZZLE MECHANISMS</span>
              <div className="smartmaze-palette-grid">
                {TOOLS.filter((t) => t.type === 'puzzle').map((tool) => (
                  <div
                    key={tool.id}
                    className={`smartmaze-tool-card ${activeTool === tool.id ? 'active' : ''}`}
                    onClick={() => setActiveTool(tool.id)}
                  >
                    <span className="smartmaze-tool-icon-box">{tool.icon}</span>
                    <span className="smartmaze-tool-label">{tool.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '10px', fontSize: '0.75rem', color: '#64748b' }}>
              <strong style={{ color: '#38bdf8' }}>Editor Tip:</strong> Click or hold mouse button & drag over grid cells to continuously draw walls or passages.
            </div>
          </GlassContainer>
        </aside>

        {/* Central Canvas Stage */}
        <section className="smartmaze-create-canvas-container">
          <GlassContainer variant="hero" className="smartmaze-grid-editor-hero-card">
            <div
              className="smartmaze-grid-board"
              style={{
                gridTemplateColumns: `repeat(${dimension}, 28px)`,
                gridTemplateRows: `repeat(${dimension}, 28px)`,
              }}
              onMouseDown={() => (isMouseDownRef.current = true)}
            >
              {grid.map((row, y) =>
                row.map((cellChar, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={getCellClassName(cellChar, x, y)}
                    onClick={() => handleCellClick(x, y)}
                    onMouseEnter={() => handleMouseEnterCell(x, y)}
                  >
                    {renderCellContent(cellChar, x, y)}
                  </div>
                ))
              )}
            </div>
          </GlassContainer>

          {/* Validation Feedback HUD Bar */}
          {valResult && (
            <div
              className={`smartmaze-create-val-bar ${
                valResult.code === VALIDATION_CODE.VALID
                  ? 'val-bar-valid'
                  : valResult.code === VALIDATION_CODE.MISSING_START || valResult.code === VALIDATION_CODE.MISSING_GOAL
                  ? 'val-bar-warning'
                  : 'val-bar-invalid'
              }`}
            >
              <span>
                {valResult.code === VALIDATION_CODE.VALID ? '✦' : '⚠️'} {valResult.message}
              </span>
              {valResult.code === VALIDATION_CODE.VALID && (
                <span style={{ color: '#38bdf8', fontWeight: '800' }}>
                  BFS SHORTEST PATH: {valResult.shortestPathMoves} MOVES
                </span>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Save / Load Modal Overlay */}
      {showSaveLoadModal && (
        <div className="smartmaze-modal-backdrop" onClick={() => setShowSaveLoadModal(false)}>
          <GlassContainer variant="modal" className="smartmaze-modal-glass-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="smartmaze-modal-title">💾 SAVE & LOAD CUSTOM LABYRINTHS</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>MAZE TITLE</label>
              <input
                type="text"
                value={mazeName}
                onChange={(e) => setMazeName(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#fff',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <PrimaryButton onClick={handleSaveCurrentLevel} style={{ marginTop: '0.5rem' }}>
                SAVE CURRENT MAZE
              </PrimaryButton>
            </div>

            <div>
              <h4 style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: '800' }}>
                SAVED CREATIONS ({savedLevels.length})
              </h4>
              <div className="smartmaze-custom-level-list">
                {savedLevels.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                    No saved custom levels found in local storage.
                  </span>
                ) : (
                  savedLevels.map((lvl) => (
                    <div key={lvl.id} className="smartmaze-custom-level-item">
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#f1f5f9' }}>{lvl.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {lvl.width}×{lvl.height} Grid | Created: {new Date(lvl.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <PrimaryButton onClick={() => handleLoadLevel(lvl)} style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                          LOAD
                        </PrimaryButton>
                        <GhostButton onClick={(e) => handleDeleteLevel(lvl.id, e)} style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#ef4444' }}>
                          DELETE
                        </GhostButton>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <GhostButton onClick={() => setShowSaveLoadModal(false)} style={{ marginTop: '0.5rem' }}>
              CLOSE
            </GhostButton>
          </GlassContainer>
        </div>
      )}
    </div>
  );
}
