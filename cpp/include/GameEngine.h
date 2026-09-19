#ifndef SMARTMAZE_GAMEENGINE_H
#define SMARTMAZE_GAMEENGINE_H

#include "Maze.h"
#include "Player.h"
#include "LevelManager.h"

/**
 * Direction Enum — Cardinal Movement Input
 */
enum class Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
};

/**
 * GameState Enum — Current Game Execution Status
 */
enum class GameState {
    PLAYING,
    WON
};

/**
 * GameEngine — SmartMaze Primary Game Orchestrator
 * Coordinates Maze, Player, Wall Collision, Win Detection, and Level Loading logic.
 */
class GameEngine {
private:
    Maze maze;
    Player player;
    GameState state;
    int currentLevelId;
    LevelManager levelManager;

    // Runtime Puzzle State Vectors
    std::vector<RuntimeSwitchState> runtimeSwitches;
    std::vector<RuntimeGateState> runtimeGates;
    std::vector<RuntimePressurePlateState> runtimePressurePlates;
    std::vector<RuntimeOneWayState> runtimeOneWayPaths;
    std::vector<RuntimeMovingWallState> runtimeMovingWalls;
    std::vector<RuntimeSequenceLockState> runtimeSequenceLocks;
    std::vector<RuntimeStateChangeState> runtimeStateChanges;
    std::vector<RuntimeTemporaryPathState> runtimeTemporaryPaths;
    std::vector<RuntimeHiddenPathState> runtimeHiddenPaths;
    int moveLimit;
    // Challenge Mode State
    ChallengeState challengeState;

public:
    GameEngine();
    GameEngine(const Maze& mazeMap);

    void loadMaze(const Maze& mazeMap);
    bool loadLevel(int levelId);
    bool loadCustomLevel(const LevelDefinition& customDef);
    bool loadCustomMaze(const std::string& asciiData, int width = 0, int height = 0);

    // Milestone 7 — Challenge Engine Management
    bool startChallenge(int challengeId, int levelId);
    void updateChallengeTime(float deltaSeconds);
    const ChallengeState& getChallengeState() const;
    bool isChallengeActive() const;
    std::string calculateChallengeRank() const;

    bool movePlayer(Direction dir);
    
    const Maze& getMaze() const;
    const Player& getPlayer() const;
    GameState getGameState() const;
    bool isWon() const;
    int getCurrentLevelId() const;
    LevelManager& getLevelManager();
    const LevelManager& getLevelManager() const;

    // Puzzle Mechanics Accessors & Queries
    const std::vector<RuntimeSwitchState>& getSwitches() const;
    const std::vector<RuntimeGateState>& getGates() const;
    const std::vector<RuntimePressurePlateState>& getPressurePlates() const;
    const std::vector<RuntimeOneWayState>& getOneWayPaths() const;
    const std::vector<RuntimeMovingWallState>& getMovingWalls() const;
    const std::vector<RuntimeSequenceLockState>& getSequenceLocks() const;
    const std::vector<RuntimeStateChangeState>& getStateChanges() const;
    const std::vector<RuntimeTemporaryPathState>& getTemporaryPaths() const;
    const std::vector<RuntimeHiddenPathState>& getHiddenPaths() const;
    int getMoveLimit() const;
    int getMovesRemaining() const;

    // Specific Collision & State Inspectors
    bool isGateClosedAt(int x, int y) const;
    bool isGateOpenAt(int x, int y) const;
    bool isSwitchActiveAt(int x, int y) const;
    bool isPressurePlatePressedAt(int x, int y) const;
    bool isMovingWallSolidAt(int x, int y) const;
    bool isStateWallSolidAt(int x, int y) const;
    bool isHiddenPathRevealedAt(int x, int y) const;
    bool validatePuzzleReferences() const;

    void reset();
};

#endif // SMARTMAZE_GAMEENGINE_H
