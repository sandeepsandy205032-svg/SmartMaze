/**
 * SmartMaze Local Persistence Storage Helper (src/utils/customMazeStorage.js)
 * Manages custom user-created mazes strictly in browser localStorage.
 */

const STORAGE_KEY = 'SMARTMAZE_CUSTOM_LEVELS';

/**
 * Retrieve all saved custom levels from localStorage
 * @returns {Array<Object>} List of custom maze level objects
 */
export function getSavedCustomLevels() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch (err) {
    console.error('Failed to read custom levels from localStorage:', err);
    return [];
  }
}

/**
 * Save or update a custom maze level object
 * @param {Object} levelObj - { id, name, grid, width, height, switches, gates, ... }
 * @returns {Object} Saved level object with generated ID and timestamp
 */
export function saveCustomLevel(levelObj) {
  if (typeof window === 'undefined') return null;

  const levels = getSavedCustomLevels();
  const timestamp = Date.now();
  const id = levelObj.id || `custom_${timestamp}`;

  const levelToSave = {
    ...levelObj,
    id,
    name: levelObj.name?.trim() || `ARCHITECTURAL MAZE ${levels.length + 1}`,
    updatedAt: timestamp,
    createdAt: levelObj.createdAt || timestamp,
  };

  const existingIndex = levels.findIndex((l) => l.id === id);
  if (existingIndex >= 0) {
    levels[existingIndex] = levelToSave;
  } else {
    levels.push(levelToSave);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
    console.log(`✦ [SmartMaze Storage] Saved custom level: "${levelToSave.name}" (${id})`);
    return levelToSave;
  } catch (err) {
    console.error('Failed to save custom level to localStorage:', err);
    throw err;
  }
}

/**
 * Delete a custom level by ID
 * @param {string} id
 */
export function deleteCustomLevel(id) {
  if (typeof window === 'undefined') return false;
  try {
    const levels = getSavedCustomLevels().filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(levels));
    return true;
  } catch (err) {
    console.error(`Failed to delete custom level ${id}:`, err);
    return false;
  }
}

/**
 * Generate ASCII string representation from a 2D grid array
 * @param {Array<Array<string>>} grid 
 * @returns {string}
 */
export function convertGridToAscii(grid) {
  if (!grid || !Array.isArray(grid)) return '';
  return grid.map((row) => row.join('')).join('\n');
}

/**
 * Parse ASCII string into a 2D grid array
 * @param {string} ascii 
 * @returns {Array<Array<string>>}
 */
export function parseAsciiToGrid(ascii) {
  if (!ascii) return [];
  return ascii
    .trim()
    .split('\n')
    .map((line) => line.replace('\r', '').split(''));
}
