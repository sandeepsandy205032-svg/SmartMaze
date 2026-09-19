import * as smartMazeEngine from '../wasm/smartMazeEngine.js';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
const STORAGE_KEY = 'smartmaze_progress_v1';

// Default Level Optimal Moves reference for Grade calculation
const LEVEL_OPTIMAL_MOVES = {
  1: 8, 2: 12, 3: 14, 4: 16, 5: 18,
  6: 20, 7: 22, 8: 24, 9: 26, 10: 28,
  11: 30, 12: 32, 13: 34, 14: 36, 15: 38,
  16: 40, 17: 42, 18: 44, 19: 46, 20: 50,
};

const GRADE_HIERARCHY = { S: 4, A: 3, B: 2, C: 1 };

function createDefaultProgression() {
  const levels = {};
  for (let id = 1; id <= 20; id++) {
    levels[id] = {
      levelId: id,
      unlocked: id === 1,
      completed: false,
      bestTime: null,
      bestMoves: null,
      bestGrade: null,
      attempts: 0,
      lastPlayed: null,
    };
  }

  return {
    version: 1,
    levels,
    challenges: {},
    statistics: {
      totalAttempts: 0,
      totalMoves: 0,
      totalPlayTime: 0,
    },
  };
}

class ProgressionService {
  constructor() {
    this.state = this.loadFromStorage();
    this.syncWasmEngine();
  }

  loadFromStorage() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return createDefaultProgression();
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultProgression();

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || parsed.version !== 1) {
        return createDefaultProgression();
      }

      const defaults = createDefaultProgression();
      const sanitizedLevels = { ...defaults.levels };

      if (parsed.levels && typeof parsed.levels === 'object') {
        for (let id = 1; id <= 20; id++) {
          if (parsed.levels[id]) {
            sanitizedLevels[id] = {
              ...defaults.levels[id],
              ...parsed.levels[id],
              levelId: id,
            };
          }
        }
      }

      return {
        version: 1,
        levels: sanitizedLevels,
        challenges: parsed.challenges && typeof parsed.challenges === 'object' ? parsed.challenges : {},
        statistics: {
          totalAttempts: parsed.statistics?.totalAttempts || 0,
          totalMoves: parsed.statistics?.totalMoves || 0,
          totalPlayTime: parsed.statistics?.totalPlayTime || 0,
        },
      };
    } catch (err) {
      console.error('Failed to load progression state from localStorage:', err);
      return createDefaultProgression();
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (err) {
      console.error('Failed to save progression to localStorage:', err);
    }
  }

  syncWasmEngine() {
    try {
      for (let id = 1; id <= 20; id++) {
        const lvl = this.state.levels[id];
        if (lvl && lvl.completed) {
          smartMazeEngine.completeLevel(id);
        }
      }
    } catch (err) {
      // Non-blocking sync catch
    }
  }

  syncWithWasm() {
    return this.syncWasmEngine();
  }

  /**
   * Synchronize progression state with Flask REST API
   */
  async fetchServerProgress() {
    try {
      const res = await fetch(`${API_BASE_URL}/progress`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const { levels, challenges } = json.data;

          // Merge levels from server
          if (levels) {
            for (let id = 1; id <= 20; id++) {
              const serverLvl = levels[String(id)];
              if (serverLvl) {
                this.state.levels[id] = {
                  levelId: id,
                  unlocked: serverLvl.unlocked || id === 1,
                  completed: serverLvl.completed || false,
                  bestTime: serverLvl.bestTime,
                  bestMoves: serverLvl.bestMoves,
                  bestGrade: serverLvl.bestGrade,
                  attempts: serverLvl.attempts || 0,
                  lastPlayed: serverLvl.lastPlayed,
                };
              }
            }
          }

          // Merge challenges from server
          if (challenges) {
            this.state.challenges = challenges;
          }

          this.syncWasmEngine();
          this.saveToStorage();
          return true;
        }
      }
    } catch (err) {
      console.warn('Backend progress fetch unavailable. Using cached local state:', err);
    }
    return false;
  }

  /**
   * Migrate and sync local localStorage progress to Flask server
   */
  async syncLocalWithBackend() {
    try {
      const res = await fetch(`${API_BASE_URL}/progress/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          levels: this.state.levels,
          challenges: this.state.challenges,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          await this.fetchServerProgress();
          return true;
        }
      }
    } catch (err) {
      console.warn('Local-to-server migration sync skipped:', err);
    }
    return false;
  }

  getProgression() {
    return this.state;
  }

  calculateGrade(levelId, moves) {
    const optimal = LEVEL_OPTIMAL_MOVES[levelId] || 20;
    const efficiency = (optimal / Math.max(1, moves)) * 100;

    if (efficiency >= 90) return 'S';
    if (efficiency >= 80) return 'A';
    if (efficiency >= 60) return 'B';
    return 'C';
  }

  recordLevelAttempt(levelId) {
    if (!levelId || levelId < 1 || levelId > 20) return;

    const lvl = this.state.levels[levelId] || {
      levelId,
      unlocked: levelId === 1,
      completed: false,
      bestTime: null,
      bestMoves: null,
      bestGrade: null,
      attempts: 0,
      lastPlayed: null,
    };

    lvl.attempts += 1;
    lvl.lastPlayed = new Date().toISOString();
    this.state.statistics.totalAttempts += 1;

    this.saveToStorage();
  }

  /**
   * Record genuine Level completion and sync to Flask API
   */
  recordLevelCompletion(levelId, time, moves) {
    if (!levelId || levelId < 1 || levelId > 20) {
      return { isFirstCompletion: false, isNewBestTime: false, isNewBestMoves: false, isNewBestGrade: false, nextLevelUnlocked: null };
    }

    const lvl = this.state.levels[levelId];
    const isFirstCompletion = !lvl.completed;
    let isNewBestTime = false;
    let isNewBestMoves = false;
    let isNewBestGrade = false;

    // 1. Completion status
    lvl.completed = true;
    lvl.lastPlayed = new Date().toISOString();

    // 2. Best Time check
    if (lvl.bestTime === null || time < lvl.bestTime) {
      lvl.bestTime = time;
      isNewBestTime = true;
    }

    // 3. Best Moves check
    if (lvl.bestMoves === null || moves < lvl.bestMoves) {
      lvl.bestMoves = moves;
      isNewBestMoves = true;
    }

    // 4. Grade check
    const grade = this.calculateGrade(levelId, moves);
    if (lvl.bestGrade === null || (GRADE_HIERARCHY[grade] || 0) > (GRADE_HIERARCHY[lvl.bestGrade] || 0)) {
      lvl.bestGrade = grade;
      isNewBestGrade = true;
    }

    // 5. Unlock Next Level
    let nextLevelUnlocked = null;
    if (levelId < 20) {
      const nextId = levelId + 1;
      if (!this.state.levels[nextId].unlocked) {
        this.state.levels[nextId].unlocked = true;
        nextLevelUnlocked = nextId;
      }
    }

    // 6. Aggregate Stats
    this.state.statistics.totalMoves += moves;
    this.state.statistics.totalPlayTime += time;

    // 7. Sync C++ Engine & Save locally
    smartMazeEngine.completeLevel(levelId);
    this.saveToStorage();

    // 8. Fire-and-forget sync to Flask backend REST API
    fetch(`${API_BASE_URL}/progress/level`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ levelId, completed: true, time, moves, grade }),
    }).catch((err) => {
      console.warn('Level progress server sync error:', err);
    });

    return {
      isFirstCompletion,
      isNewBestTime,
      isNewBestMoves,
      isNewBestGrade,
      nextLevelUnlocked,
      grade,
    };
  }

  recordChallengeAttempt(challengeId) {
    if (!challengeId) return;

    const ch = this.state.challenges[challengeId] || {
      challengeId,
      completed: false,
      bestTime: null,
      bestMoves: null,
      bestRank: null,
      attempts: 0,
      lastPlayed: null,
    };

    ch.attempts += 1;
    ch.lastPlayed = new Date().toISOString();
    this.state.challenges[challengeId] = ch;
    this.state.statistics.totalAttempts += 1;
    this.saveToStorage();
  }

  recordChallengeCompletion(challengeId, time, moves, rank = 'S') {
    if (!challengeId) return;

    const ch = this.state.challenges[challengeId] || {
      challengeId,
      completed: false,
      bestTime: null,
      bestMoves: null,
      bestRank: null,
      attempts: 0,
      lastPlayed: null,
    };

    ch.completed = true;
    ch.attempts += 1;
    ch.lastPlayed = new Date().toISOString();

    if (ch.bestTime === null || time < ch.bestTime) {
      ch.bestTime = time;
    }
    if (ch.bestMoves === null || moves < ch.bestMoves) {
      ch.bestMoves = moves;
    }
    if (ch.bestRank === null || (GRADE_HIERARCHY[rank] || 0) > (GRADE_HIERARCHY[ch.bestRank] || 0)) {
      ch.bestRank = rank;
    }

    this.state.challenges[challengeId] = ch;
    this.saveToStorage();

    // Sync challenge to Flask backend
    fetch(`${API_BASE_URL}/progress/challenge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ challengeId, completed: true, score: rank }),
    }).catch((err) => {
      console.warn('Challenge progress server sync error:', err);
    });
  }

  resetProgress() {
    this.state = createDefaultProgression();
    this.saveToStorage();
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_KEY);
    }

    // Sync reset to Flask backend
    fetch(`${API_BASE_URL}/progress/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    }).catch((err) => {
      console.warn('Progression reset server sync error:', err);
    });

    return this.state;
  }

  resetProgression() {
    return this.resetProgress();
  }

  getDerivedStatistics() {
    let levelsCompleted = 0;
    let levelsUnlocked = 0;
    let fastestLevel = null;
    let fewestMovesLevel = null;
    let sGradeCount = 0;

    for (let id = 1; id <= 20; id++) {
      const lvl = this.state.levels[id];
      if (lvl?.unlocked) levelsUnlocked += 1;
      if (lvl?.completed) {
        levelsCompleted += 1;
        if (lvl.bestGrade === 'S') sGradeCount += 1;

        if (fastestLevel === null || (lvl.bestTime !== null && lvl.bestTime < (fastestLevel.bestTime ?? Infinity))) {
          fastestLevel = { levelId: id, id, time: lvl.bestTime, bestTime: lvl.bestTime };
        }
        if (fewestMovesLevel === null || (lvl.bestMoves !== null && lvl.bestMoves < (fewestMovesLevel.bestMoves ?? Infinity))) {
          fewestMovesLevel = { levelId: id, id, moves: lvl.bestMoves, bestMoves: lvl.bestMoves };
        }
      }
    }

    let challengesCompleted = 0;
    if (this.state.challenges && typeof this.state.challenges === 'object') {
      Object.values(this.state.challenges).forEach((ch) => {
        if (ch?.completed) challengesCompleted += 1;
      });
    }

    const overallCompletionPct = Math.round((levelsCompleted / 20) * 100);

    return {
      levelsCompleted,
      levelsUnlocked,
      overallCompletionPct,
      completionPercentage: overallCompletionPct,
      challengesCompleted,
      totalAttempts: this.state.statistics?.totalAttempts || 0,
      totalMoves: this.state.statistics?.totalMoves || 0,
      totalPlayTime: this.state.statistics?.totalPlayTime || 0,
      fastestLevel,
      fewestMovesLevel,
      sGradeCount,
    };
  }
}

export const progressionService = new ProgressionService();
export default progressionService;
