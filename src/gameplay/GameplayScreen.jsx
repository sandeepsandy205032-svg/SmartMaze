import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useCamera } from './useCamera';
import ThemeEnvironment from './ThemeEnvironment';
import HUD from './HUD';
import MazeRenderer from './MazeRenderer';
import LegendPanel from './LegendPanel';
import ControlsPanel from './ControlsPanel';
import Minimap from './Minimap';
import GoalCompletion from './GoalCompletion';
import ChallengeCompletionModal from './ChallengeCompletionModal';
import ChallengeFailureModal from './ChallengeFailureModal';
import PauseModal from './PauseModal';
import GlassContainer from '../components/common/GlassContainer';
import * as smartMazeEngine from '../wasm/smartMazeEngine';
import './gameplay.css';

export default function GameplayScreen() {
  const {
    currentScreen,
    setCurrentScreen,
    selectedLevelId,
    setJustCompletedLevelId,
    launchGameplay,
    recordLevelCompletion,
    recordChallengeCompletion,
  } = useApp();

  const returnToLevelSelect = () => {
    if (selectedLevelId === 0) {
      setCurrentScreen('create');
    } else if (smartMazeEngine.isChallengeActive()) {
      setCurrentScreen('challenges');
    } else {
      setCurrentScreen('levelSelect');
    }
  };

  const [mazeData, setMazeData] = useState(() => smartMazeEngine.getLoadedMazeData());
  const cellSize = Math.max(24, Math.min(44, Math.floor(620 / (mazeData.width || 15))));

  // Engine Mode Status
  const [engineMode, setEngineMode] = useState('MOCK FALLBACK MODE');

  // Opening Cinematic Sequence Phases: 'goal_focus' | 'start_focus' | 'falling_walls' | 'ready'
  const [introPhase, setIntroPhase] = useState('goal_focus');
  const [bannerText, setBannerText] = useState('🎯 REACH THE GOAL');

  // Live keypress state for visual keyboard feedback
  const [activeKey, setActiveKey] = useState(null);

  // Authoritative Gameplay State
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [moves, setMoves] = useState(0);
  const [movesRemaining, setMovesRemaining] = useState(-1);
  const [moveDir, setMoveDir] = useState({ dx: 0, dy: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [blockedBump, setBlockedBump] = useState(null);
  const [switches, setSwitches] = useState([]);
  const [gates, setGates] = useState([]);
  const [pressurePlates, setPressurePlates] = useState([]);
  const [oneWayPaths, setOneWayPaths] = useState([]);
  const [movingWalls, setMovingWalls] = useState([]);
  const [stateChanges, setStateChanges] = useState([]);
  const [temporaryPaths, setTemporaryPaths] = useState([]);
  const [hiddenPaths, setHiddenPaths] = useState([]);
  const [sequenceLocks, setSequenceLocks] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [levelElapsedTime, setLevelElapsedTime] = useState(0);
  const [completionRecord, setCompletionRecord] = useState(null);

  // Challenge Mode Live State
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [challengeType, setChallengeType] = useState(0);
  const [challengeTimeLimit, setChallengeTimeLimit] = useState(0);
  const [challengeElapsedTime, setChallengeElapsedTime] = useState(0);
  const [challengeMoveLimit, setChallengeMoveLimit] = useState(0);
  const [isChallengeFailed, setIsChallengeFailed] = useState(false);
  const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);
  const [challengeRank, setChallengeRank] = useState('S');

  // Initialize Game Engine with selected level on mount & screen transition
  useEffect(() => {
    const isCh = smartMazeEngine.isChallengeActive();
    if (!isCh && selectedLevelId !== 0) {
      smartMazeEngine.initializeLevel(selectedLevelId || 1);
    }

    const activeData = smartMazeEngine.getLoadedMazeData();
    setEngineMode(smartMazeEngine.getEngineMode());
    setMazeData(activeData);
    setPlayerPos({ x: smartMazeEngine.getPlayerX(), y: smartMazeEngine.getPlayerY() });
    setMoves(smartMazeEngine.getMoveCount());
    setMovesRemaining(smartMazeEngine.getMovesRemaining());
    setSwitches(smartMazeEngine.getSwitches());
    setGates(smartMazeEngine.getGates());
    setPressurePlates(smartMazeEngine.getPressurePlates());
    setOneWayPaths(smartMazeEngine.getOneWayPaths());
    setMovingWalls(smartMazeEngine.getMovingWalls());
    setStateChanges(smartMazeEngine.getStateChanges());
    setTemporaryPaths(smartMazeEngine.getTemporaryPaths());
    setHiddenPaths(smartMazeEngine.getHiddenPaths());
    setSequenceLocks(smartMazeEngine.getSequenceLocks());
    setIsCompleted(smartMazeEngine.isWon());
    setIsPaused(false);
    setLevelElapsedTime(0);
    setCompletionRecord(null);

    // Sync Challenge state
    setIsChallengeMode(isCh);
    if (isCh) {
      setChallengeType(smartMazeEngine.getChallengeType());
      setChallengeTimeLimit(smartMazeEngine.getChallengeTimeLimit());
      setChallengeElapsedTime(smartMazeEngine.getChallengeElapsedTime());
      setChallengeMoveLimit(smartMazeEngine.getChallengeMoveLimit());
      setIsChallengeFailed(smartMazeEngine.isChallengeFailed());
      setIsChallengeCompleted(smartMazeEngine.isChallengeCompleted());
    }
  }, [selectedLevelId, currentScreen]);

  // Standard Gameplay Elapsed Timer Ticker (100ms)
  useEffect(() => {
    if (isChallengeMode || isCompleted || isPaused || introPhase !== 'ready') return;

    const interval = setInterval(() => {
      setLevelElapsedTime((prev) => prev + 0.1);
    }, 100);

    return () => clearInterval(interval);
  }, [isChallengeMode, isCompleted, isPaused, introPhase]);

  // Challenge Timer Tick Loop (100ms interval)
  useEffect(() => {
    if (!isChallengeMode || isCompleted || isChallengeFailed || isChallengeCompleted || isPaused) return;

    const interval = setInterval(() => {
      smartMazeEngine.updateChallengeTime(0.1);
      const elapsed = smartMazeEngine.getChallengeElapsedTime();
      const failed = smartMazeEngine.isChallengeFailed();

      setChallengeElapsedTime(elapsed);
      if (failed) {
        setIsChallengeFailed(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isChallengeMode, isCompleted, isChallengeFailed, isChallengeCompleted, isPaused]);

  // Automated Opening Cinematic Sequence Timers
  useEffect(() => {
    if (smartMazeEngine.isChallengeActive()) {
      setIntroPhase('ready');
      setBannerText('');
      return;
    }

    setIntroPhase('goal_focus');
    setBannerText('🎯 TARGET GOAL — REACH THE ANCIENT EXIT');

    const timer1 = setTimeout(() => {
      setIntroPhase('start_focus');
      setBannerText('✦ START YOUR JOURNEY');
    }, 1500);

    const timer2 = setTimeout(() => {
      setIntroPhase('falling_walls');
      setBannerText('⚔ LABYRINTH WALLS DESCENDING...');
    }, 3000);

    const timer3 = setTimeout(() => {
      setIntroPhase('ready');
      setBannerText('');
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [selectedLevelId]);

  const handleNextRealm = () => {
    if (selectedLevelId > 0 && selectedLevelId <= 20) {
      setJustCompletedLevelId(selectedLevelId);
      returnToLevelSelect();
    } else {
      setCurrentScreen('create');
    }
  };

  // Determine active camera focus target position
  const getCameraFocusPos = () => {
    if (introPhase === 'goal_focus') return mazeData.goal;
    if (introPhase === 'start_focus') return mazeData.start;
    return playerPos;
  };

  const focusPos = getCameraFocusPos();

  // Presentation Camera transform hook
  const cameraStyle = useCamera({
    focusPos,
    moveDir,
    cellSize,
    gridWidth: mazeData.width,
    gridHeight: mazeData.height,
    zoomScale: mazeData.width > 17 ? 1.05 : mazeData.width > 15 ? 1.15 : 1.25,
  });

  // Handle Player Movement & Shortcuts
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (!isCompleted && !isChallengeFailed && !isChallengeCompleted && introPhase === 'ready') {
          e.preventDefault();
          setIsPaused((prev) => !prev);
          return;
        }
      }

      if (isPaused || isCompleted || isChallengeFailed || isChallengeCompleted || introPhase !== 'ready') return;

      let direction = null;
      let dx = 0;
      let dy = 0;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        direction = 'UP';
        dy = -1;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        direction = 'DOWN';
        dy = 1;
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        direction = 'LEFT';
        dx = -1;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        direction = 'RIGHT';
        dx = 1;
      } else {
        return;
      }

      e.preventDefault();
      setActiveKey(e.key);

      const moveSuccess = smartMazeEngine.movePlayer(direction);

      if (moveSuccess) {
        const newX = smartMazeEngine.getPlayerX();
        const newY = smartMazeEngine.getPlayerY();
        const newMoves = smartMazeEngine.getMoveCount();
        const newRemaining = smartMazeEngine.getMovesRemaining();
        const newSwitches = smartMazeEngine.getSwitches();
        const newGates = smartMazeEngine.getGates();
        const newPlates = smartMazeEngine.getPressurePlates();
        const newMovingWalls = smartMazeEngine.getMovingWalls();
        const won = smartMazeEngine.isWon();

        const justActivated = newSwitches.some((sw, i) => sw.isActive && !switches[i]?.isActive);
        if (justActivated) {
          setBannerText('✦ ANCIENT MECHANISM ACTIVATED — GATE UNSEALED');
          setTimeout(() => setBannerText(''), 2500);
        }

        setPlayerPos({ x: newX, y: newY });
        setMoves(newMoves);
        setMovesRemaining(newRemaining);
        setSwitches(newSwitches);
        setGates(newGates);
        setPressurePlates(newPlates);
        setMovingWalls(newMovingWalls);
        setStateChanges(smartMazeEngine.getStateChanges());
        setTemporaryPaths(smartMazeEngine.getTemporaryPaths());
        setHiddenPaths(smartMazeEngine.getHiddenPaths());
        setSequenceLocks(smartMazeEngine.getSequenceLocks());
        setMoveDir({ dx, dy });
        setIsMoving(true);

        setTimeout(() => setIsMoving(false), 180);

        if (smartMazeEngine.isChallengeActive()) {
          const chFailed = smartMazeEngine.isChallengeFailed();
          const chDone = smartMazeEngine.isChallengeCompleted();
          if (chFailed) setIsChallengeFailed(true);
          if (chDone) {
            setIsChallengeCompleted(true);
            const rank = smartMazeEngine.getChallengeRank();
            setChallengeRank(rank);
            recordChallengeCompletion(challengeType, challengeElapsedTime, newMoves, rank);
          }
        }

        if (won) {
          setTimeout(() => {
            setIsCompleted(true);

            if (!smartMazeEngine.isChallengeActive() && selectedLevelId > 0) {
              const finalTime = Math.max(1, Math.round(levelElapsedTime));
              const resultRecord = recordLevelCompletion(selectedLevelId, finalTime, newMoves);
              setCompletionRecord(resultRecord);
              smartMazeEngine.completeLevel(selectedLevelId);
            }
          }, 150);
        }
      } else {
        // Trigger subtle blocked bump feedback on invalid move attempt
        setBlockedBump({ dx: dx * 5, dy: dy * 5, key: Date.now() });
        setTimeout(() => setBlockedBump(null), 110);

        if (isChallengeMode && smartMazeEngine.isChallengeFailed()) {
          setIsChallengeFailed(true);
        }
      }
    },
    [isPaused, isCompleted, isChallengeFailed, isChallengeCompleted, introPhase, switches, isChallengeMode, selectedLevelId, levelElapsedTime, challengeType, challengeElapsedTime, recordLevelCompletion, recordChallengeCompletion]
  );

  const handleKeyUp = useCallback(() => {
    setActiveKey(null);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Reset / Restart level handler
  const handleResetLevel = () => {
    const syncState = () => {
      setPlayerPos({ x: smartMazeEngine.getPlayerX(), y: smartMazeEngine.getPlayerY() });
      setMoves(smartMazeEngine.getMoveCount());
      setMovesRemaining(smartMazeEngine.getMovesRemaining());
      setSwitches(smartMazeEngine.getSwitches());
      setGates(smartMazeEngine.getGates());
      setPressurePlates(smartMazeEngine.getPressurePlates());
      setOneWayPaths(smartMazeEngine.getOneWayPaths());
      setMovingWalls(smartMazeEngine.getMovingWalls());
      setStateChanges(smartMazeEngine.getStateChanges());
      setTemporaryPaths(smartMazeEngine.getTemporaryPaths());
      setHiddenPaths(smartMazeEngine.getHiddenPaths());
      setSequenceLocks(smartMazeEngine.getSequenceLocks());
      setIsCompleted(false);
      setIsPaused(false);
      setLevelElapsedTime(0);
      setCompletionRecord(null);
    };

    if (selectedLevelId === 0) {
      const activeCustom = smartMazeEngine.getActiveCustomLevel();
      if (activeCustom) {
        smartMazeEngine.loadCustomMaze(activeCustom).then(syncState);
      }
    } else if (isChallengeMode) {
      const levelToLoad = selectedLevelId || 1;
      smartMazeEngine.startChallenge(challengeType, levelToLoad).then(() => {
        setIsChallengeFailed(false);
        setIsChallengeCompleted(false);
        setChallengeElapsedTime(0);
        syncState();
      });
    } else {
      const levelToLoad = selectedLevelId || 1;
      smartMazeEngine.initializeLevel(levelToLoad).then(syncState);
    }

    setIntroPhase('start_focus');
    setBannerText('✦ RESTARTING REALM');
    setTimeout(() => {
      setIntroPhase('ready');
      setBannerText('');
    }, 1200);
  };

  const switchActive = switches.some((s) => s.isActive);
  const gateOpen = gates.some((g) => g.isOpen);

  // HUD Rule Text formatting
  let hudRule = mazeData.rule;
  if (isChallengeMode) {
    if (challengeType === 1 || challengeType === 5) {
      const rem = Math.max(0, challengeTimeLimit - challengeElapsedTime).toFixed(1);
      hudRule = `TIME REMAINING: 00:${rem.padStart(4, '0')}`;
    } else if (challengeType === 2) {
      hudRule = `MOVES: ${moves} / TARGET ${challengeMoveLimit}`;
    } else if (challengeType === 6) {
      hudRule = 'RULE: UNKNOWN — OBSERVE & DISCOVER';
    }
  }

  return (
    <ThemeEnvironment>
      {/* 1. Top Architectural HUD */}
      <HUD
        levelName={isChallengeMode ? `CHALLENGE 0${challengeType}` : mazeData.name}
        rule={hudRule}
        moves={moves}
        isCompleted={isCompleted || isChallengeCompleted}
        isPaused={isPaused}
        isChallengeMode={isChallengeMode}
        challengeType={challengeType}
        challengeTimeRemaining={Math.max(0, challengeTimeLimit - challengeElapsedTime)}
        challengeMoveLimit={challengeMoveLimit}
        onReturn={returnToLevelSelect}
        onPause={() => setIsPaused(true)}
      />

      {/* 2. Main Gameplay Composition Container */}
      <div className="smartmaze-gameplay-stage">
        {/* Left Secondary Panel: Legend */}
        <aside className="smartmaze-stage-left">
          <LegendPanel engineMode={engineMode} />
        </aside>

        {/* Center Primary Visual Hero */}
        <main className="smartmaze-stage-center">
          <GlassContainer variant="primary" className="smartmaze-maze-chamber">
            {bannerText && (
              <div className="smartmaze-cinematic-banner-overlay">
                <span className="smartmaze-cinematic-banner-text font-mono">{bannerText}</span>
              </div>
            )}

            <div className="smartmaze-camera-viewport">
              <div className="smartmaze-camera-world" style={cameraStyle}>
                <MazeRenderer
                  grid={mazeData.grid}
                  startPos={mazeData.start}
                  goalPos={mazeData.goal}
                  switchPos={mazeData.switchPos}
                  gatePos={mazeData.gatePos}
                  switches={switches}
                  gates={gates}
                  pressurePlates={pressurePlates}
                  oneWayPaths={oneWayPaths}
                  movingWalls={movingWalls}
                  stateChanges={stateChanges}
                  temporaryPaths={temporaryPaths}
                  hiddenPaths={hiddenPaths}
                  sequenceLocks={sequenceLocks}
                  playerPos={playerPos}
                  isMoving={isMoving}
                  blockedBump={blockedBump}
                  switchActive={switchActive}
                  gateOpen={gateOpen}
                  isFallingWalls={introPhase === 'falling_walls'}
                  cellSize={cellSize}
                  isBlind={isChallengeMode && challengeType === 3}
                />
              </div>
            </div>
          </GlassContainer>

          <div className="smartmaze-stage-bottom-quote">
            <span>“NOT ALL WHO WANDER ARE LOST.”</span>
          </div>
        </main>

        {/* Right Secondary Panels: Controls & Minimap (Omitted if No Map Challenge) */}
        <aside className="smartmaze-stage-right">
          <ControlsPanel activeKey={activeKey} />
          {!(isChallengeMode && challengeType === 4) && (
            <Minimap
              grid={mazeData.grid}
              playerPos={playerPos}
              goalPos={mazeData.goal}
              switchActive={switchActive}
              gateOpen={gateOpen}
            />
          )}
        </aside>
      </div>

      {/* 3. Challenge Completion Modal */}
      {isChallengeCompleted && (
        <ChallengeCompletionModal
          challengeType={challengeType}
          time={challengeElapsedTime.toFixed(1)}
          timeLimit={challengeTimeLimit}
          moves={moves}
          moveLimit={challengeMoveLimit}
          rank={challengeRank}
          onRetry={handleResetLevel}
          onArchive={returnToLevelSelect}
        />
      )}

      {/* 4. Challenge Failure Modal */}
      {isChallengeFailed && !isChallengeCompleted && (
        <ChallengeFailureModal
          reason={challengeTimeLimit > 0 && challengeElapsedTime >= challengeTimeLimit ? 'TIME EXPIRED' : 'MOVE LIMIT EXCEEDED'}
          onRetry={handleResetLevel}
          onChangeChallenge={returnToLevelSelect}
          onArchive={returnToLevelSelect}
        />
      )}

      {/* 5. Standard Level Victory End Card Overlay (Non-Challenge Mode) */}
      {isCompleted && !isChallengeMode && (
        <GoalCompletion
          levelName={mazeData.name}
          levelId={selectedLevelId}
          time={Math.max(1, Math.round(levelElapsedTime))}
          moves={moves}
          grade={completionRecord?.result?.bestGrade || 'A'}
          bestTime={completionRecord?.result?.bestTime}
          bestMoves={completionRecord?.result?.bestMoves}
          isNewBestTime={completionRecord?.isNewBestTime}
          isNewBestMoves={completionRecord?.isNewBestMoves}
          isNewBestGrade={completionRecord?.isNewBestGrade}
          unlockedNextLevel={completionRecord?.unlockedNext}
          isCustom={selectedLevelId === 0}
          onContinue={handleNextRealm}
          onReplay={handleResetLevel}
          onHub={returnToLevelSelect}
        />
      )}

      {/* 6. Gameplay Pause Modal Container */}
      {isPaused && (
        <PauseModal
          levelName={isChallengeMode ? `CHALLENGE 0${challengeType}` : mazeData.name}
          time={isChallengeMode ? challengeElapsedTime : levelElapsedTime}
          moves={moves}
          isChallengeMode={isChallengeMode}
          challengeType={challengeType}
          onResume={() => setIsPaused(false)}
          onRestart={() => {
            setIsPaused(false);
            handleResetLevel();
          }}
          onExit={() => {
            setIsPaused(false);
            returnToLevelSelect();
          }}
        />
      )}
    </ThemeEnvironment>
  );
}

