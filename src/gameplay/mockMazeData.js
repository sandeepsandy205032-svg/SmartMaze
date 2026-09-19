/**
 * SmartMaze — Phase 2A Official Theme Definitions & Lightweight Mock Level Data
 * Theme selection is global and completely decoupled from level data.
 */

export const OFFICIAL_THEMES = [
  {
    id: 'outer-maze',
    name: 'THE OUTER MAZE',
    description: 'Ancient ruins reclaimed by nature.',
    subtext: 'Ancient paths. New possibilities.',
    image: '/assets/themes/outer-maze.jpg',
  },
  {
    id: 'inner-gardens',
    name: 'THE INNER GARDENS',
    description: 'Hidden courtyards, living paths and quiet mystery.',
    subtext: 'Beauty hides deeper truths.',
    image: '/assets/themes/inner-gardens.jpg',
  },
  {
    id: 'forgotten-structure',
    name: 'THE FORGOTTEN STRUCTURE',
    description: 'Ancient monumental ruins, broken halls and forgotten mechanisms.',
    subtext: 'Echoes of a greater past.',
    image: '/assets/themes/forgotten-structure.jpg',
  },
  {
    id: 'deep-maze',
    name: 'THE DEEP MAZE',
    description: 'A vast underground labyrinth lost beneath the world.',
    subtext: 'Go deeper. Discover more.',
    image: '/assets/themes/deep-maze.jpg',
  },
];

/**
 * Mock Level Data (Phase 2A Prototype ONLY)
 * NOTE: Level data does NOT contain theme or themeId.
 * Theme comes exclusively from the player's global selectedTheme preference.
 */
export const MOCK_MAZE_LEVEL_01 = {
  levelId: 'level-01',
  name: 'LEVEL 01 — THE THRESHOLD',
  puzzleType: 'switch-and-gate',
  rule: 'Step on the Ancient Switch to unseal the Stone Gate.',
  difficulty: 'EASY',
  gridSize: 11,
  moveLimit: 40,
  timeLimit: 120,
  width: 11,
  height: 11,
  start: { x: 1, y: 1 },
  goal: { x: 9, y: 9 },
  switchPos: { x: 1, y: 9 },
  gatePos: { x: 5, y: 9 },
  grid: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
};
