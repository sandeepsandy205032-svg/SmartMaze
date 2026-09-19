import React, { createContext, useContext, useState, useEffect } from 'react';
import { OFFICIAL_THEMES } from '../gameplay/mockMazeData';
import progressionService from '../services/progressionService';
import authService from '../services/authService';

const AppContext = createContext();

/**
 * AppProvider — SmartMaze Global State & Transitions Orchestrator
 * Manages view transition ('landing' -> 'auth' -> 'entering' -> 'entered'),
 * screen navigation ('hub' | 'levelSelect' | 'challenges' | 'create' | 'gameplay' | 'profile'),
 * frontend demo authentication state ('login' | 'register' | 'forgot_password'),
 * gameplay loading sequences with game-vibe messaging & progress,
 * global selectedTheme preference ('outer-maze' | 'inner-gardens' | 'forgotten-structure' | 'deep-maze'),
 * player progression persistence & statistics,
 * userProfile state,
 * and centralized accessibility preferences (reducedMotion).
 */
export function AppProvider({ children }) {
  // View states: 'landing' | 'auth' | 'entering' | 'entered'
  const [viewState, setViewState] = useState('landing');
  const [activeMode, setActiveMode] = useState('play');
  
  // Screen state when entered: 'hub' | 'levelSelect' | 'challenges' | 'create' | 'gameplay' | 'profile'
  const [currentScreen, setCurrentScreen] = useState('hub');

  // Frontend Authentication State (M12)
  const [authSession, setAuthSession] = useState(() => authService.getSession());
  const [authScreen, setAuthScreen] = useState('login'); // 'login' | 'register' | 'forgot_password'
  const [isAuthTransitioning, setIsAuthTransitioning] = useState(false);

  // Player Progression state
  const [progression, setProgression] = useState(() => progressionService.getProgression());
  const [derivedStats, setDerivedStats] = useState(() => progressionService.getDerivedStatistics());

  // Loading Screen state for Game Entrance & Theme Selection
  const [isGameplayLoading, setIsGameplayLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('GENERATING SPATIAL LABYRINTH...');
  const [loadingSubtext, setLoadingSubtext] = useState('ANALYZING C++ PATHFINDING & LIGHTING NODES');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Hub Reveal Animation key (increments to re-trigger reveal animations)
  const [hubRevealKey, setHubRevealKey] = useState(0);

  // Synchronize session restoration with Flask REST API & WASM engine on mount
  useEffect(() => {
    async function initSession() {
      const sessionResult = await authService.checkSession();
      setAuthSession(sessionResult);
      if (sessionResult.isAuthenticated) {
        await progressionService.fetchServerProgress();
        refreshProgressionState();
      } else {
        progressionService.syncWithWasm();
      }
    }
    initSession();
  }, []);

  // Update helper for progression state
  const refreshProgressionState = () => {
    const updated = progressionService.getProgression();
    const stats = progressionService.getDerivedStatistics();
    setProgression(updated);
    setDerivedStats(stats);
  };

  // User Profile derived from auth identity & progression statistics
  const userProfile = {
    name: authSession.user?.name || authSession.user?.username || 'PATHFINDER',
    email: authSession.user?.email || 'pathfinder@smartmaze.io',
    title: authSession.user?.title || (
      derivedStats.completionPercentage >= 100
        ? 'GRAND ARCHITECT'
        : derivedStats.completionPercentage >= 50
        ? 'MASTER NAVIGATOR'
        : derivedStats.levelsCompleted >= 1
        ? 'LABYRINTH EXPLORER'
        : 'NOVICE NAVIGATOR'
    ),
    level: authSession.user?.level || `Realm 01`,
    avatar: authSession.user?.avatar || (authSession.user?.name ? authSession.user.name[0].toUpperCase() : '✦'),
    completionPercentage: derivedStats.completionPercentage,
    levelsCompleted: derivedStats.levelsCompleted,
  };

  // Global Theme preference: 'outer-maze' | 'inner-gardens' | 'forgotten-structure' | 'deep-maze'
  const [selectedTheme, setSelectedThemeState] = useState('outer-maze');
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);

  // Accessibility state
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const triggerHubReveal = () => {
    setHubRevealKey((prev) => prev + 1);
  };

  // Landing CTA Entry Action: Checks authentication status
  const handleLandingEnter = () => {
    if (viewState !== 'landing') return;

    if (authSession.isAuthenticated) {
      // Direct authenticated entrance
      startEntryTransition();
    } else {
      // Require frontend authentication
      setViewState('auth');
      setAuthScreen('login');
    }
  };

  const startEntryTransition = () => {
    setViewState('entering');

    // 1400ms cinematic loading / entry sequence
    setTimeout(() => {
      setViewState('entered');
      triggerHubReveal();
    }, 1400);
  };

  const returnToLanding = () => {
    setViewState('landing');
    setCurrentScreen('hub');
  };

  // Login Handler (Async Backend Authentication)
  const loginUser = async (usernameOrEmail, password) => {
    const result = await authService.login(usernameOrEmail, password);
    if (result.success) {
      setAuthSession(authService.getSession());
      setIsAuthTransitioning(true);

      // Synchronize local progression with Flask MySQL backend
      await progressionService.syncLocalWithBackend();
      await progressionService.fetchServerProgress();
      refreshProgressionState();

      setTimeout(() => {
        setIsAuthTransitioning(false);
        setViewState('entered');
        setCurrentScreen('hub');
        triggerHubReveal();
      }, 1000);
    }
    return result;
  };

  // Register Handler (Async Backend Registration)
  const registerUser = async (username, email, password, confirmPassword) => {
    const result = await authService.register(username, email, password, confirmPassword);
    if (result.success) {
      setAuthSession(authService.getSession());
      setIsAuthTransitioning(true);

      // Synchronize local progression with Flask MySQL backend
      await progressionService.syncLocalWithBackend();
      await progressionService.fetchServerProgress();
      refreshProgressionState();

      setTimeout(() => {
        setIsAuthTransitioning(false);
        setViewState('entered');
        setCurrentScreen('hub');
        triggerHubReveal();
      }, 1000);
    }
    return result;
  };

  // Logout Handler (Clears backend session & returns to landing)
  const logoutUser = async () => {
    await authService.logout();
    setAuthSession({ isAuthenticated: false, user: null });
    setViewState('landing');
    setCurrentScreen('hub');
  };

  // Active selected level ID (1-20)
  const [selectedLevelId, setSelectedLevelId] = useState(1);
  const [justCompletedLevelId, setJustCompletedLevelId] = useState(null);

  // Launch Gameplay with a game-vibe loading sequence & progress bar
  const launchGameplay = (levelId = 1) => {
    if (typeof window !== 'undefined') window.smartMazeLaunchGameplay = launchGameplay;
    const numLevelId = typeof levelId === 'number' ? levelId : parseInt(levelId, 10) || 1;
    setSelectedLevelId(numLevelId);

    setIsGameplayLoading(true);
    setLoadingProgress(10);
    setLoadingMessage(`INITIALIZING REALM ${numLevelId.toString().padStart(2, '0')}...`);
    setLoadingSubtext('ANALYZING C++ PATHFINDING & LIGHTING NODES');

    // Record attempt for fixed level
    if (numLevelId > 0) {
      progressionService.recordLevelAttempt(numLevelId);
      refreshProgressionState();
    }

    // Pre-initialize WASM level state
    import('../wasm/smartMazeEngine').then((engine) => {
      engine.initializeLevel(numLevelId);
    });

    const step1 = setTimeout(() => {
      setLoadingProgress(45);
      setLoadingMessage('GENERATING 2.5D LABYRINTH CHAMBER...');
      setLoadingSubtext('CONSTRUCTING WALL GEOMETRY & ANCIENT SWITCHES');
    }, 400);

    const step2 = setTimeout(() => {
      setLoadingProgress(85);
      setLoadingMessage('PREPARING LUMINOUS PLAYER ORB...');
      setLoadingSubtext('SYNCHRONIZING CAMERA & ATMOSPHERIC FOG');
    }, 850);

    const step3 = setTimeout(() => {
      setLoadingProgress(100);
      setCurrentScreen('gameplay');
      setIsGameplayLoading(false);
    }, 1250);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.smartMazeLaunchGameplay = (lid) => {
        setViewState('entered');
        launchGameplay(lid);
      };
    }
  }, []);

  // Launch Challenge mode with C++ WASM challenge initialization
  const launchChallenge = (challengeId = 1, levelId = 1) => {
    const numChallengeId = typeof challengeId === 'number' ? challengeId : parseInt(challengeId, 10) || 1;
    const numLevelId = typeof levelId === 'number' ? levelId : parseInt(levelId, 10) || 1;
    setSelectedLevelId(numLevelId);

    progressionService.recordChallengeAttempt(numChallengeId);
    refreshProgressionState();

    setIsGameplayLoading(true);
    setLoadingProgress(15);
    setLoadingMessage(`INITIALIZING CHALLENGE 0${numChallengeId}...`);
    setLoadingSubtext(`LOADING LABYRINTH REALM ${numLevelId.toString().padStart(2, '0')}`);

    import('../wasm/smartMazeEngine').then(async (engine) => {
      await engine.startChallenge(numChallengeId, numLevelId);
    });

    const step1 = setTimeout(() => {
      setLoadingProgress(60);
      setLoadingMessage('ACTIVATING AUTHORITATIVE C++ CHALLENGE RULES...');
      setLoadingSubtext('SYNCHRONIZING TIMERS & SPATIAL CONSTRAINTS');
    }, 300);

    const step2 = setTimeout(() => {
      setLoadingProgress(100);
      setCurrentScreen('gameplay');
      setIsGameplayLoading(false);
    }, 650);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
    };
  };

  const returnToHub = () => {
    setCurrentScreen('hub');
    triggerHubReveal();
  };

  // Open Profile Screen navigation callback
  const openProfileScreen = () => {
    setIsThemeTransitioning(true);
    setLoadingMessage('OPENING PLAYER DOSSIER...');
    setLoadingSubtext('ANALYZING EXPEDITION RECORDS & ACHIEVEMENTS');

    const timer1 = setTimeout(() => {
      setCurrentScreen('profile');
    }, 400);

    const timer2 = setTimeout(() => {
      setIsThemeTransitioning(false);
    }, 850);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  // Change Theme with atmospheric transition overlay and Hub reveal animation
  const changeTheme = (newThemeId) => {
    if (newThemeId === selectedTheme || isThemeTransitioning) return;

    const targetThemeObj = OFFICIAL_THEMES.find((t) => t.id === newThemeId) || OFFICIAL_THEMES[0];

    setIsThemeTransitioning(true);
    setLoadingMessage(`SYNCHRONIZING REALM: ${targetThemeObj.name.toUpperCase()}`);
    setLoadingSubtext('RECONFIGURING SPATIAL MATERIALS & AMBIENT LIGHTING');

    const timer1 = setTimeout(() => {
      setSelectedThemeState(newThemeId);
    }, 450);

    const timer2 = setTimeout(() => {
      setIsThemeTransitioning(false);
      triggerHubReveal();
    }, 1300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  const launchCustomMazeTestPlay = (customDef) => {
    setSelectedLevelId(0);

    setIsGameplayLoading(true);
    setLoadingProgress(20);
    setLoadingMessage('INITIALIZING CUSTOM ARCHITECTURAL LABYRINTH...');
    setLoadingSubtext('LOADING C++ AUTHORITATIVE ENGINE STATE');

    import('../wasm/smartMazeEngine').then(async (engine) => {
      await engine.loadCustomMaze(customDef);
    });

    const step1 = setTimeout(() => {
      setLoadingProgress(70);
      setLoadingMessage('SYNCHRONIZING PUZZLE OBJECTS & PLAYER ORB...');
      setLoadingSubtext('PREPARING REAL-TIME MOVEMENT & WIN CONDITIONS');
    }, 300);

    const step2 = setTimeout(() => {
      setLoadingProgress(100);
      setCurrentScreen('gameplay');
      setIsGameplayLoading(false);
    }, 650);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
    };
  };

  const openCreateScreen = () => {
    setIsThemeTransitioning(true);
    setLoadingMessage('OPENING ARCHITECTURAL EDITOR...');
    setLoadingSubtext('PREPARING LABYRINTH CANVAS & C++ VALIDATOR');

    const timer1 = setTimeout(() => {
      setCurrentScreen('create');
    }, 400);

    const timer2 = setTimeout(() => {
      setIsThemeTransitioning(false);
    }, 850);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  const openChallengesScreen = () => {
    setIsThemeTransitioning(true);
    setLoadingMessage('OPENING THE CHALLENGE ARCHIVE...');
    setLoadingSubtext('UNLOCKING SPECIAL RULES & SPATIAL TRIALS');

    const timer1 = setTimeout(() => {
      setCurrentScreen('challenges');
    }, 450);

    const timer2 = setTimeout(() => {
      setIsThemeTransitioning(false);
    }, 900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  const recordLevelCompletion = (levelId, timeSeconds, moves) => {
    const record = progressionService.recordLevelCompletion(levelId, timeSeconds, moves);
    refreshProgressionState();
    return record;
  };

  const recordChallengeCompletion = (challengeId, timeSeconds, moves, score) => {
    const record = progressionService.recordChallengeCompletion(challengeId, timeSeconds, moves, score);
    refreshProgressionState();
    return record;
  };

  const resetPlayerProgress = () => {
    const newProg = progressionService.resetProgression();
    refreshProgressionState();
    return newProg;
  };

  const toggleReducedMotion = () => {
    setReducedMotion((prev) => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        viewState,
        setViewState,
        authSession,
        authScreen,
        setAuthScreen,
        isAuthTransitioning,
        handleLandingEnter,
        loginUser,
        registerUser,
        logoutUser,
        returnToLanding,
        activeMode,
        setActiveMode,
        currentScreen,
        setCurrentScreen,
        selectedLevelId,
        setSelectedLevelId,
        justCompletedLevelId,
        setJustCompletedLevelId,
        isGameplayLoading,
        loadingMessage,
        loadingSubtext,
        loadingProgress,
        hubRevealKey,
        triggerHubReveal,
        launchGameplay,
        launchChallenge,
        launchCustomMazeTestPlay,
        openCreateScreen,
        openChallengesScreen,
        openProfileScreen,
        returnToHub,
        userProfile,
        progression,
        derivedStats,
        recordLevelCompletion,
        recordChallengeCompletion,
        resetPlayerProgress,
        refreshProgressionState,
        selectedTheme,
        changeTheme,
        isThemeTransitioning,
        reducedMotion,
        setReducedMotion,
        toggleReducedMotion,
        startEntryTransition,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

