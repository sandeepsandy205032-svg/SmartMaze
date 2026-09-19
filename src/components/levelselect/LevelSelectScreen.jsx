import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import GlassContainer from '../common/GlassContainer';
import GhostButton from '../common/GhostButton';
import PrimaryButton from '../common/PrimaryButton';
import ThemeEnvironment from '../../gameplay/ThemeEnvironment';
import * as smartMazeEngine from '../../wasm/smartMazeEngine';
import './levelselect.css';

// Act Definitions
const ACTS = [
  {
    id: 1,
    title: 'ACT I',
    subtitle: 'DISCOVERY',
    description: 'Ancient pathways reclaim the surface.',
    range: [1, 5],
  },
  {
    id: 2,
    title: 'ACT II',
    subtitle: 'MECHANISMS',
    description: 'Chambers locked behind ancient switches.',
    range: [6, 10],
  },
  {
    id: 3,
    title: 'ACT III',
    subtitle: 'CONVERGENCE',
    description: 'Shifting corridors and multi-state runes.',
    range: [11, 15],
  },
  {
    id: 4,
    title: 'ACT IV',
    subtitle: 'MASTERY',
    description: 'The ultimate labyrinth trials.',
    range: [16, 20],
  },
];

// Official 20 Fixed Level Metadata
export const LEVEL_METADATA = [
  { id: 1, name: 'The Threshold', act: 1, diff: 1, flavor: 'Every expedition begins with a single step into the unknown.', mechanics: 'Basic Pathfinding' },
  { id: 2, name: 'Verdant Passages', act: 1, diff: 1, flavor: 'Overgrown roots weave through ancient stone corridors.', mechanics: 'Basic Pathfinding' },
  { id: 3, name: 'Monolith of Shifts', act: 1, diff: 1, flavor: 'The maze does not remain as you found it.', mechanics: 'Shifting Passages' },
  { id: 4, name: 'Abyssal Echoes', act: 1, diff: 2, flavor: 'Deep echoes guide the observant navigator.', mechanics: 'One-Way Passages' },
  { id: 5, name: 'The Sunken Sanctuary', act: 1, diff: 2, flavor: 'Ancient waters protect forgotten sanctuary halls.', mechanics: 'Sealed Gates' },

  { id: 6, name: 'Silent Switches', act: 2, diff: 2, flavor: 'Step lightly upon the pressure runes.', mechanics: 'Ancient Switches' },
  { id: 7, name: 'The Rotating Halls', act: 2, diff: 3, flavor: 'Chambers turn when mechanisms awaken.', mechanics: 'Reversible Runes' },
  { id: 8, name: 'Hidden Routes', act: 2, diff: 3, flavor: 'What seems like a dead end holds hidden truths.', mechanics: 'Decoy Routes' },
  { id: 9, name: 'Fractured Paths', act: 2, diff: 3, flavor: 'Broken arches require careful spatial navigation.', mechanics: 'Multi-State Mechanisms' },
  { id: 10, name: 'The Twin Gates', act: 2, diff: 3, flavor: 'Dual stone barriers require synchronized activation.', mechanics: 'Sealed Gates' },

  { id: 11, name: 'Shifting Sanctuary', act: 3, diff: 4, flavor: 'Chambers shift beneath your feet as you traverse.', mechanics: 'Shifting Passages' },
  { id: 12, name: 'The Broken Passage', act: 3, diff: 4, flavor: 'Fragile stone bridges demand precise planning.', mechanics: 'One-Way Passages' },
  { id: 13, name: 'Echo Chamber', act: 3, diff: 4, flavor: 'Remember the sequence or wander forever.', mechanics: 'Memory Sequences' },
  { id: 14, name: 'The Veiled Route', act: 3, diff: 4, flavor: 'Shadows obscure the shortest path forward.', mechanics: 'Move Constraints' },
  { id: 15, name: 'Convergence', act: 3, diff: 4, flavor: 'All ancient mechanisms converge in central harmony.', mechanics: 'Multi-State Mechanisms' },

  { id: 16, name: 'The Forgotten Trial', act: 4, diff: 5, flavor: 'Only master architects solve this ancient puzzle.', mechanics: 'Move Constraints' },
  { id: 17, name: 'The Endless Corridor', act: 4, diff: 5, flavor: 'Illusionary corridors test your true resolve.', mechanics: 'Decoy Routes' },
  { id: 18, name: 'The Last Mechanism', act: 4, diff: 5, flavor: 'The final gear turns. Align the stone keys.', mechanics: 'Reversible Runes' },
  { id: 19, name: "The Architect's Maze", act: 4, diff: 5, flavor: 'Designed by ancient masters to challenge all who enter.', mechanics: 'Multi-State Mechanisms' },
  { id: 20, name: 'The Final Passage', act: 4, diff: 5, flavor: 'Beyond this threshold lies complete labyrinth mastery.', mechanics: 'Mastery Labyrinth' },
];

// Map node positions for organic sweeping curve geometry (5 nodes per Act)
const MAP_NODE_POSITIONS = [
  { x: 14, y: 60 },
  { x: 33, y: 30 },
  { x: 55, y: 64 },
  { x: 75, y: 26 },
  { x: 91, y: 52 },
];

// SVG Path Segments between consecutive nodes (4 segments for 5 nodes)
const PATH_SEGMENTS = [
  "M 14 60 C 23 35, 27 30, 33 30", // Segment 0: Node 1 -> Node 2
  "M 33 30 C 43 30, 47 64, 55 64", // Segment 1: Node 2 -> Node 3
  "M 55 64 C 64 64, 69 26, 75 26", // Segment 2: Node 3 -> Node 4
  "M 75 26 C 83 26, 87 52, 91 52", // Segment 3: Node 4 -> Node 5
];

const CompassRose = () => (
  <svg className="smartmaze-compass-icon" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1.5" strokeDasharray="3 3" />
    <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(245, 158, 11, 0.6)" strokeWidth="1" />
    <path d="M 50 10 L 55 45 L 90 50 L 55 55 L 50 90 L 45 55 L 10 50 L 45 45 Z" fill="rgba(245, 158, 11, 0.25)" stroke="#f59e0b" strokeWidth="1.5" />
    <path d="M 50 20 L 53 47 L 80 50 L 53 53 L 50 80 L 47 53 L 20 50 L 47 47 Z" fill="#f59e0b" opacity="0.6" />
    <circle cx="50" cy="50" r="4" fill="#ffffff" />
  </svg>
);

export default function LevelSelectScreen() {
  const {
    returnToHub,
    setCurrentScreen,
    launchGameplay,
    justCompletedLevelId,
    setJustCompletedLevelId,
    progression: globalProgression,
  } = useApp();

  const [activeActId, setActiveActId] = useState(1);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [progression, setProgression] = useState({ unlocked: {}, completed: {}, details: {} });
  const [displayUnlocked, setDisplayUnlocked] = useState({});
  const [animatingNodeId, setAnimatingNodeId] = useState(null);
  const [animatingSegmentIdx, setAnimatingSegmentIdx] = useState(null);

  // Load level progression state from AppContext & C++ GameEngine WASM
  useEffect(() => {
    const unlocked = {};
    const completed = {};
    const details = {};
    for (let id = 1; id <= 20; id++) {
      const levelRec = globalProgression.levels[id] || { unlocked: id === 1, completed: false };
      unlocked[id] = Boolean(levelRec.unlocked);
      completed[id] = Boolean(levelRec.completed);
      details[id] = levelRec;
    }
    setProgression({ unlocked, completed, details });

    if (justCompletedLevelId) {
      const completedId = justCompletedLevelId;
      const nextId = Math.min(20, completedId + 1);
      const completedAct = Math.ceil(completedId / 5);
      const nextAct = Math.ceil(nextId / 5);
      const segIdx = (completedId - 1) % 5;

      // Phase 1: Keep next level locked visually until line reaches it
      const initDisplayUnlocked = { ...unlocked, [nextId]: false };
      setDisplayUnlocked(initDisplayUnlocked);

      setActiveActId(completedAct);
      setSelectedLevelId(completedId);
      setAnimatingNodeId(completedId);

      // Phase 2 (at 450ms): Energy beam travels along line segment from Level N to Level N+1
      const lineTimer = setTimeout(() => {
        if (segIdx < 4) {
          setAnimatingSegmentIdx(segIdx);
        }
      }, 450);

      // Phase 3 (at 1250ms): Beam reaches Level N+1, unlocking it with colors & selecting it
      const unlockTimer = setTimeout(() => {
        setDisplayUnlocked(unlocked);
        setActiveActId(nextAct);
        setSelectedLevelId(nextId);
        setAnimatingNodeId(null);
        setAnimatingSegmentIdx(null);
        setJustCompletedLevelId(null);
      }, 1250);

      return () => {
        clearTimeout(lineTimer);
        clearTimeout(unlockTimer);
      };
    } else {
      setDisplayUnlocked(unlocked);
    }
  }, [justCompletedLevelId, setJustCompletedLevelId, globalProgression]);

  const activeAct = ACTS.find((a) => a.id === activeActId) || ACTS[0];
  const actLevels = LEVEL_METADATA.filter(
    (l) => l.id >= activeAct.range[0] && l.id <= activeAct.range[1]
  );

  const selectedLevel = selectedLevelId
    ? LEVEL_METADATA.find((l) => l.id === selectedLevelId) || LEVEL_METADATA[0]
    : LEVEL_METADATA[0];

  const handleNodeClick = (level) => {
    // Allow clicking ANY level node to inspect its details
    if (selectedLevelId === level.id) {
      setSelectedLevelId(null); // Deselect/unselect level if clicked again
    } else {
      setSelectedLevelId(level.id);
    }
  };

  const handleClosePanel = () => {
    setSelectedLevelId(null);
  };

  const handleActChange = (actId) => {
    setActiveActId(actId);
    setSelectedLevelId(null); // Recenter map on act switch
  };

  const handleEnterLevel = () => {
    if (!selectedLevelId || !progression.unlocked[selectedLevelId]) return;
    smartMazeEngine.initializeLevel(selectedLevelId);
    launchGameplay(selectedLevelId);
  };

  const renderDifficultyDiamonds = (diff) => {
    const diamonds = [];
    for (let i = 1; i <= 5; i++) {
      diamonds.push(
        <span
          key={i}
          className={`smartmaze-diff-diamond ${i <= diff ? 'smartmaze-diff--active' : ''}`}
        >
          ◈
        </span>
      );
    }
    return diamonds;
  };

  const formatTime = (secs) => {
    if (!secs || secs === 0) return '--:--';
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const hasSelection = selectedLevelId !== null;
  const isSelectedLevelUnlocked = Boolean(selectedLevelId && progression.unlocked[selectedLevelId]);
  const selectedLevelDetails = selectedLevelId ? progression.details[selectedLevelId] : null;

  return (
    <ThemeEnvironment>
      <div className="smartmaze-archive-stage">
        {/* 1. Header Navigation Bar */}
        <header className="smartmaze-archive-header">
          <GhostButton onClick={returnToHub} leadingIcon={<span>‹</span>}>
            HUB
          </GhostButton>

          <div className="smartmaze-archive-brand">
            <span className="smartmaze-archive-brand-title">SMARTMAZE</span>
            <span className="smartmaze-archive-brand-sub">THE MAZE ARCHIVE</span>
          </div>

          <div className="smartmaze-archive-header-right">
            <span className="smartmaze-mode-badge font-mono">
              ⚙ {smartMazeEngine.getEngineMode()}
            </span>
          </div>
        </header>

        {/* 2. Main Title & Act Tabs */}
        <div className="smartmaze-archive-hero-title-box">
          <h1 className="smartmaze-archive-hero-title">THE MAZE ARCHIVE</h1>
          <p className="smartmaze-archive-hero-sub">Choose your next passage across ancient realms.</p>

          <div className="smartmaze-act-tabs">
            {ACTS.map((act) => (
              <button
                key={act.id}
                type="button"
                className={`smartmaze-act-tab ${activeActId === act.id ? 'smartmaze-act--active' : ''}`}
                onClick={() => handleActChange(act.id)}
              >
                <span className="smartmaze-act-tab-title">{act.title}</span>
                <span className="smartmaze-act-tab-sub">{act.subtitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Main Stage: Map Container & Sliding Right Info Panel */}
        <main className={`smartmaze-archive-main-stage ${hasSelection ? 'smartmaze-stage--has-selection' : 'smartmaze-stage--centered'}`}>
          {/* MAP HERO CONTAINER */}
          <GlassContainer variant="primary" className="smartmaze-archive-map-container">
            <div className="smartmaze-map-viewport">
              {/* Map Dark Overlay & Color Grading */}
              <div className="smartmaze-map-color-grade-overlay" />

              {/* Top-Left Compass Ornament */}
              <div className="smartmaze-map-ornament-topleft">
                <div className="smartmaze-compass-box">
                  <CompassRose />
                </div>
                <div className="smartmaze-ornament-meta">
                  <span className="smartmaze-ornament-title">THE ANCIENT REALMS</span>
                  <span className="smartmaze-ornament-sub">MANY PATHS · ONE DESTINATION</span>
                </div>
              </div>

              {/* Bottom-Left Quote Box */}
              <div className="smartmaze-map-quote-bottomleft">
                <span className="smartmaze-map-quote-text">“Every step reveals a new possibility.”</span>
              </div>

              {/* Bottom-Right Footer Ornament */}
              <div className="smartmaze-map-ornament-bottomright">
                <div className="smartmaze-compass-box" style={{ width: '32px', height: '32px' }}>
                  <CompassRose />
                </div>
                <span className="smartmaze-ornament-footer-text">EXPLORE · SOLVE · EVOLVE</span>
              </div>

              {/* Connecting Sweeping S-Curve SVG Segments */}
              <svg className="smartmaze-map-svg-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
                {PATH_SEGMENTS.map((pathD, idx) => {
                  const targetLevel = actLevels[idx + 1];
                  const isTargetUnlocked = targetLevel && (displayUnlocked[targetLevel.id] || progression.completed[targetLevel.id]);
                  const isAnimating = animatingSegmentIdx === idx;

                  return (
                    <g key={idx}>
                      {/* Black outline stroke for contrast */}
                      <path d={pathD} className="smartmaze-map-svg-path-shadow" />

                      {/* Path Segment rendering based on state */}
                      {isAnimating ? (
                        <path d={pathD} pathLength="1" className="smartmaze-map-svg-path-animating" />
                      ) : isTargetUnlocked ? (
                        <path d={pathD} className="smartmaze-map-svg-path-active" />
                      ) : (
                        <path d={pathD} className="smartmaze-map-svg-path-locked" />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* 5 Connected Level Map Nodes */}
              {actLevels.map((level, idx) => {
                const pos = MAP_NODE_POSITIONS[idx];
                const isUnlocked = Boolean(displayUnlocked[level.id]);
                const isCompleted = Boolean(progression.completed[level.id]);
                const isSelected = selectedLevelId === level.id;

                let nodeStatusClass = 'smartmaze-node--locked';
                if (isCompleted) nodeStatusClass = 'smartmaze-node--completed';
                else if (isUnlocked) nodeStatusClass = 'smartmaze-node--unlocked';

                if (isSelected) nodeStatusClass += ' smartmaze-node--selected';
                if (animatingNodeId === level.id) nodeStatusClass += ' smartmaze-node--just-completed';

                return (
                  <div
                    key={level.id}
                    className={`smartmaze-map-node-wrapper ${nodeStatusClass}`}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    onClick={() => handleNodeClick(level)}
                  >
                    <div className="smartmaze-map-node-pin">
                      {isCompleted ? (
                        <span className="smartmaze-node-icon">✓</span>
                      ) : isUnlocked ? (
                        <span className="smartmaze-node-num">{level.id.toString().padStart(2, '0')}</span>
                      ) : (
                        <span className="smartmaze-node-icon">🔒</span>
                      )}
                    </div>
                    <div className="smartmaze-node-label">
                      <span className="smartmaze-node-name">{level.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassContainer>

          {/* RIGHT SECONDARY LEVEL INFORMATION PANEL (SLIDES IN/OUT) */}
          <aside className={`smartmaze-archive-info-side ${hasSelection ? 'smartmaze-info-panel--open' : 'smartmaze-info-panel--closed'}`}>
            <GlassContainer variant="subdued" className="smartmaze-info-panel-box">
              {/* Header with Close / Unselect Button */}
              <div className="smartmaze-info-top-row">
                <span className="smartmaze-info-level-tag">
                  {isSelectedLevelUnlocked ? `REALM ${selectedLevel.id.toString().padStart(2, '0')}` : `🔒 REALM SEALED`}
                </span>
                <button
                  type="button"
                  className="smartmaze-info-close-btn"
                  onClick={handleClosePanel}
                  title="Close Realm Details"
                >
                  ✕
                </button>
              </div>

              <div className="smartmaze-info-header">
                <h2 className="smartmaze-info-level-title">{selectedLevel.name.toUpperCase()}</h2>
                <p className="smartmaze-info-flavor">“{selectedLevel.flavor}”</p>
              </div>

              <div className="smartmaze-info-divider" />

              <div className="smartmaze-info-section">
                <span className="smartmaze-info-label">DIFFICULTY</span>
                <div className="smartmaze-info-diff-row">
                  {renderDifficultyDiamonds(selectedLevel.diff)}
                  <span className="smartmaze-diff-text font-mono">
                    {selectedLevel.diff} / 5
                  </span>
                </div>
              </div>

              <div className="smartmaze-info-section">
                <span className="smartmaze-info-label">MECHANICS</span>
                <div className="smartmaze-mechanics-pill">
                  <span className="smartmaze-mech-icon">◈</span>
                  <span>{selectedLevel.mechanics}</span>
                </div>
              </div>

              {/* Status & Records */}
              {selectedLevelDetails?.completed && (
                <div className="smartmaze-info-section" style={{ background: 'rgba(212, 175, 55, 0.08)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="smartmaze-info-label" style={{ margin: 0, color: '#6EE7B7' }}>STATUS: CLEARED</span>
                    <span className="font-mono" style={{ background: '#d4af37', color: '#0f1713', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>
                      GRADE {selectedLevelDetails.bestGrade || 'A'}
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem' }} className="font-mono">
                    <div>BEST TIME: <strong>{formatTime(selectedLevelDetails.bestTime)}</strong></div>
                    <div>BEST MOVES: <strong>{selectedLevelDetails.bestMoves} steps</strong></div>
                  </div>
                </div>
              )}

              {!selectedLevelDetails?.completed && isSelectedLevelUnlocked && (
                <div className="smartmaze-info-section">
                  <span className="smartmaze-info-label" style={{ color: '#d4af37' }}>STATUS: UNCOMPLETED</span>
                </div>
              )}

              <div className="smartmaze-info-section">
                <span className="smartmaze-info-label">OBJECTIVE</span>
                <div className="smartmaze-objective-desc">
                  <span>Reach the ancient exit without getting lost.</span>
                </div>
              </div>

              <div className="smartmaze-info-footer">
                {isSelectedLevelUnlocked ? (
                  Boolean(progression.completed[selectedLevel.id]) ? (
                    <PrimaryButton
                      onClick={handleEnterLevel}
                      className="smartmaze-enter-level-btn"
                    >
                      RE-ENTER REALM ↻
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton
                      onClick={handleEnterLevel}
                      className="smartmaze-enter-level-btn"
                    >
                      ENTER REALM →
                    </PrimaryButton>
                  )
                ) : (
                  <button
                    type="button"
                    disabled
                    className="smartmaze-sealed-level-btn"
                  >
                    <span>🔒</span> PASSAGE SEALED · SOLVE REALM {selectedLevel.id - 1}
                  </button>
                )}
              </div>
            </GlassContainer>
          </aside>
        </main>
      </div>
    </ThemeEnvironment>
  );
}
