#ifndef SMARTMAZE_LEVELMANAGER_H
#define SMARTMAZE_LEVELMANAGER_H

#include "LevelDefinition.h"
#include <vector>

/**
 * LevelManager — Static Fixed Level Repository & Progression Provider
 * 
 * Manages the 20 official SmartMaze fixed levels (Acts I–IV) and local player progress.
 */
class LevelManager {
private:
    std::vector<LevelDefinition> levels;
    std::vector<bool> unlockedLevels;
    std::vector<bool> completedLevels;

    void initializeFixedLevels();

public:
    LevelManager();

    const LevelDefinition& getLevel(int levelId) const;
    const std::vector<LevelDefinition>& getAllLevels() const;
    int getLevelCount() const;
    bool isValidLevel(int levelId) const;

    // Local Progression API
    bool isLevelUnlocked(int levelId) const;
    bool isLevelCompleted(int levelId) const;
    bool completeLevel(int levelId);
    void resetProgression();
};

#endif // SMARTMAZE_LEVELMANAGER_H
