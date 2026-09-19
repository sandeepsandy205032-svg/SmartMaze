#include "../include/GameEngine.h"
#include "../include/PuzzleValidator.h"
#include <vector>
#include <string>

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#else
#define EMSCRIPTEN_KEEPALIVE
#endif

// Official SmartMaze Level 01 Labyrinth Map (11x11)
static const std::vector<std::string> LEVEL_01_MAP = {
    "###########",
    "#S  #     #",
    "### # ### #",
    "#     #   #",
    "# ##### ###",
    "# #       #",
    "# # ##### #",
    "#   #   # #",
    "### # # # #",
    "#   # #  G#",
    "###########"
};

static GameEngine* g_engine = nullptr;

extern "C" {

EMSCRIPTEN_KEEPALIVE
void initializeGame() {
    if (g_engine != nullptr) {
        delete g_engine;
        g_engine = nullptr;
    }
    g_engine = new GameEngine();
    g_engine->loadLevel(1);
}

EMSCRIPTEN_KEEPALIVE
int initializeLevel(int levelId) {
    if (g_engine == nullptr) {
        g_engine = new GameEngine();
    }
    return g_engine->loadLevel(levelId) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int getCurrentLevelId() {
    if (!g_engine) return 1;
    return g_engine->getCurrentLevelId();
}

EMSCRIPTEN_KEEPALIVE
int getLevelCount() {
    if (!g_engine) {
        LevelManager mgr;
        return mgr.getLevelCount();
    }
    return g_engine->getLevelManager().getLevelCount();
}

EMSCRIPTEN_KEEPALIVE
int isLevelUnlocked(int levelId) {
    if (!g_engine) {
        LevelManager mgr;
        return mgr.isLevelUnlocked(levelId) ? 1 : 0;
    }
    return g_engine->getLevelManager().isLevelUnlocked(levelId) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int isLevelCompleted(int levelId) {
    if (!g_engine) {
        LevelManager mgr;
        return mgr.isLevelCompleted(levelId) ? 1 : 0;
    }
    return g_engine->getLevelManager().isLevelCompleted(levelId) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int completeLevel(int levelId) {
    if (!g_engine) return 0;
    return g_engine->getLevelManager().completeLevel(levelId) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int getLevelDifficulty(int levelId) {
    if (!g_engine) return 1;
    return g_engine->getLevelManager().getLevel(levelId).difficulty;
}

EMSCRIPTEN_KEEPALIVE
int getLevelPuzzleType(int levelId) {
    if (!g_engine) return 0;
    return static_cast<int>(g_engine->getLevelManager().getLevel(levelId).puzzleType);
}

EMSCRIPTEN_KEEPALIVE
int movePlayer(int direction) {
    if (!g_engine) return 0;
    Direction dir;
    switch (direction) {
        case 0: dir = Direction::UP; break;
        case 1: dir = Direction::DOWN; break;
        case 2: dir = Direction::LEFT; break;
        case 3: dir = Direction::RIGHT; break;
        default: return 0;
    }
    return g_engine->movePlayer(dir) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int getPlayerX() {
    if (!g_engine) return 0;
    return g_engine->getPlayer().getX();
}

EMSCRIPTEN_KEEPALIVE
int getPlayerY() {
    if (!g_engine) return 0;
    return g_engine->getPlayer().getY();
}

EMSCRIPTEN_KEEPALIVE
int getMoveCount() {
    if (!g_engine) return 0;
    return g_engine->getPlayer().getMoveCount();
}

EMSCRIPTEN_KEEPALIVE
int isWon() {
    if (!g_engine) return 0;
    return g_engine->isWon() ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int getMazeWidth() {
    if (!g_engine) return 7;
    return g_engine->getMaze().getWidth();
}

EMSCRIPTEN_KEEPALIVE
int getMazeHeight() {
    if (!g_engine) return 7;
    return g_engine->getMaze().getHeight();
}

EMSCRIPTEN_KEEPALIVE
int getMazeStartX() {
    if (!g_engine) return 1;
    return g_engine->getMaze().getStartPosition().x;
}

EMSCRIPTEN_KEEPALIVE
int getMazeStartY() {
    if (!g_engine) return 1;
    return g_engine->getMaze().getStartPosition().y;
}

EMSCRIPTEN_KEEPALIVE
int getMazeGoalX() {
    if (!g_engine) return 5;
    return g_engine->getMaze().getGoalPosition().x;
}

EMSCRIPTEN_KEEPALIVE
int getMazeGoalY() {
    if (!g_engine) return 5;
    return g_engine->getMaze().getGoalPosition().y;
}

EMSCRIPTEN_KEEPALIVE
int getMazeCell(int x, int y) {
    if (!g_engine) return 0;
    return g_engine->getMaze().getCell(x, y) == '#' ? 1 : 0;
}

// ============================================================================
// Milestone 6 — Switch & Gate WASM State API Functions
// ============================================================================

EMSCRIPTEN_KEEPALIVE
int getSwitchCount() {
    if (!g_engine) return 0;
    return static_cast<int>(g_engine->getSwitches().size());
}

EMSCRIPTEN_KEEPALIVE
int getSwitchX(int index) {
    if (!g_engine) return -1;
    const auto& switches = g_engine->getSwitches();
    if (index < 0 || index >= static_cast<int>(switches.size())) return -1;
    return switches[index].position.x;
}

EMSCRIPTEN_KEEPALIVE
int getSwitchY(int index) {
    if (!g_engine) return -1;
    const auto& switches = g_engine->getSwitches();
    if (index < 0 || index >= static_cast<int>(switches.size())) return -1;
    return switches[index].position.y;
}

EMSCRIPTEN_KEEPALIVE
int getSwitchState(int index) {
    if (!g_engine) return 0;
    const auto& switches = g_engine->getSwitches();
    if (index < 0 || index >= static_cast<int>(switches.size())) return 0;
    return switches[index].isActive ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int getSwitchTargetGateId(int index) {
    if (!g_engine) return -1;
    const auto& switches = g_engine->getSwitches();
    if (index < 0 || index >= static_cast<int>(switches.size())) return -1;
    return switches[index].targetGateId;
}

EMSCRIPTEN_KEEPALIVE
int getGateCount() {
    if (!g_engine) return 0;
    return static_cast<int>(g_engine->getGates().size());
}

EMSCRIPTEN_KEEPALIVE
int getGateX(int index) {
    if (!g_engine) return -1;
    const auto& gates = g_engine->getGates();
    if (index < 0 || index >= static_cast<int>(gates.size())) return -1;
    return gates[index].position.x;
}

EMSCRIPTEN_KEEPALIVE
int getGateY(int index) {
    if (!g_engine) return -1;
    const auto& gates = g_engine->getGates();
    if (index < 0 || index >= static_cast<int>(gates.size())) return -1;
    return gates[index].position.y;
}

EMSCRIPTEN_KEEPALIVE
int getGateState(int index) {
    if (!g_engine) return 0;
    const auto& gates = g_engine->getGates();
    if (index < 0 || index >= static_cast<int>(gates.size())) return 0;
    return gates[index].isOpen ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int getGateId(int index) {
    if (!g_engine) return -1;
    const auto& gates = g_engine->getGates();
    if (index < 0 || index >= static_cast<int>(gates.size())) return -1;
    return gates[index].id;
}

// Pressure Plates
EMSCRIPTEN_KEEPALIVE
int getPressurePlateCount() {
    if (!g_engine) return 0;
    return static_cast<int>(g_engine->getPressurePlates().size());
}

EMSCRIPTEN_KEEPALIVE
int getPressurePlateX(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getPressurePlates();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].position.x;
}

EMSCRIPTEN_KEEPALIVE
int getPressurePlateY(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getPressurePlates();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].position.y;
}

EMSCRIPTEN_KEEPALIVE
int getPressurePlateState(int index) {
    if (!g_engine) return 0;
    const auto& list = g_engine->getPressurePlates();
    if (index < 0 || index >= static_cast<int>(list.size())) return 0;
    return list[index].isPressed ? 1 : 0;
}

// One-Way Passages
EMSCRIPTEN_KEEPALIVE
int getOneWayCount() {
    if (!g_engine) return 0;
    return static_cast<int>(g_engine->getOneWayPaths().size());
}

EMSCRIPTEN_KEEPALIVE
int getOneWayX(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getOneWayPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].position.x;
}

EMSCRIPTEN_KEEPALIVE
int getOneWayY(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getOneWayPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].position.y;
}

EMSCRIPTEN_KEEPALIVE
int getOneWayDirection(int index) {
    if (!g_engine) return 0;
    const auto& list = g_engine->getOneWayPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return 0;
    return static_cast<int>(list[index].allowedDirection);
}

// Moving Walls
EMSCRIPTEN_KEEPALIVE
int getMovingWallCount() {
    if (!g_engine) return 0;
    return static_cast<int>(g_engine->getMovingWalls().size());
}

EMSCRIPTEN_KEEPALIVE
int getMovingWallX(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getMovingWalls();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].position.x;
}

EMSCRIPTEN_KEEPALIVE
int getMovingWallY(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getMovingWalls();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].position.y;
}

EMSCRIPTEN_KEEPALIVE
int getMovingWallState(int index) {
    if (!g_engine) return 0;
    const auto& list = g_engine->getMovingWalls();
    if (index < 0 || index >= static_cast<int>(list.size())) return 0;
    return list[index].isRetracted ? 1 : 0;
}

// Move Limit Constraints
EMSCRIPTEN_KEEPALIVE
int getMoveLimit() {
    if (!g_engine) return 0;
    return g_engine->getMoveLimit();
}

EMSCRIPTEN_KEEPALIVE
int getMovesRemaining() {
    if (!g_engine) return -1;
    return g_engine->getMovesRemaining();
}

// ============================================================================
// Advanced Puzzle Mechanics WASM Exports (Milestone 9)
// ============================================================================

// 1. State-Change Walls
EMSCRIPTEN_KEEPALIVE
int getStateChangeCount() {
    if (!g_engine) return 0;
    return static_cast<int>(g_engine->getStateChanges().size());
}

EMSCRIPTEN_KEEPALIVE
int getStateChangeX(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getStateChanges();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].triggerPosition.x;
}

EMSCRIPTEN_KEEPALIVE
int getStateChangeY(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getStateChanges();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].triggerPosition.y;
}

EMSCRIPTEN_KEEPALIVE
int getStateChangeState(int index) {
    if (!g_engine) return 0;
    const auto& list = g_engine->getStateChanges();
    if (index < 0 || index >= static_cast<int>(list.size())) return 0;
    return list[index].currentState;
}

EMSCRIPTEN_KEEPALIVE
int getStateChangeWallCount(int index, int statePhase) {
    if (!g_engine) return 0;
    const auto& list = g_engine->getStateChanges();
    if (index < 0 || index >= static_cast<int>(list.size())) return 0;
    const auto& walls = (statePhase == 0) ? list[index].state0Walls : list[index].state1Walls;
    return static_cast<int>(walls.size());
}

EMSCRIPTEN_KEEPALIVE
int getStateChangeWallX(int index, int statePhase, int wallIdx) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getStateChanges();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    const auto& walls = (statePhase == 0) ? list[index].state0Walls : list[index].state1Walls;
    if (wallIdx < 0 || wallIdx >= static_cast<int>(walls.size())) return -1;
    return walls[wallIdx].x;
}

EMSCRIPTEN_KEEPALIVE
int getStateChangeWallY(int index, int statePhase, int wallIdx) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getStateChanges();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    const auto& walls = (statePhase == 0) ? list[index].state0Walls : list[index].state1Walls;
    if (wallIdx < 0 || wallIdx >= static_cast<int>(walls.size())) return -1;
    return walls[wallIdx].y;
}

// 2. Temporary Paths
EMSCRIPTEN_KEEPALIVE
int getTemporaryPathCount() {
    if (!g_engine) return 0;
    return static_cast<int>(g_engine->getTemporaryPaths().size());
}

EMSCRIPTEN_KEEPALIVE
int getTemporaryPathX(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getTemporaryPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].position.x;
}

EMSCRIPTEN_KEEPALIVE
int getTemporaryPathY(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getTemporaryPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].position.y;
}

EMSCRIPTEN_KEEPALIVE
int getTemporaryPathTriggerX(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getTemporaryPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].triggerPosition.x;
}

EMSCRIPTEN_KEEPALIVE
int getTemporaryPathTriggerY(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getTemporaryPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].triggerPosition.y;
}

EMSCRIPTEN_KEEPALIVE
int getTemporaryPathState(int index) {
    if (!g_engine) return 0;
    const auto& list = g_engine->getTemporaryPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return 0;
    return list[index].isActive ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int getTemporaryPathMovesRemaining(int index) {
    if (!g_engine) return 0;
    const auto& list = g_engine->getTemporaryPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return 0;
    return list[index].movesRemaining;
}

EMSCRIPTEN_KEEPALIVE
int getTemporaryPathDuration(int index) {
    if (!g_engine) return 0;
    const auto& list = g_engine->getTemporaryPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return 0;
    return list[index].durationMoves;
}

// 3. Hidden Paths
EMSCRIPTEN_KEEPALIVE
int getHiddenPathCount() {
    if (!g_engine) return 0;
    return static_cast<int>(g_engine->getHiddenPaths().size());
}

EMSCRIPTEN_KEEPALIVE
int getHiddenPathX(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getHiddenPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].position.x;
}

EMSCRIPTEN_KEEPALIVE
int getHiddenPathY(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getHiddenPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].position.y;
}

EMSCRIPTEN_KEEPALIVE
int getHiddenPathTriggerX(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getHiddenPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].triggerPosition.x;
}

EMSCRIPTEN_KEEPALIVE
int getHiddenPathTriggerY(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getHiddenPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].triggerPosition.y;
}

EMSCRIPTEN_KEEPALIVE
int getHiddenPathState(int index) {
    if (!g_engine) return 0;
    const auto& list = g_engine->getHiddenPaths();
    if (index < 0 || index >= static_cast<int>(list.size())) return 0;
    return list[index].isRevealed ? 1 : 0;
}

// 4. Sequence Locks
EMSCRIPTEN_KEEPALIVE
int getSequenceLockCount() {
    if (!g_engine) return 0;
    return static_cast<int>(g_engine->getSequenceLocks().size());
}

EMSCRIPTEN_KEEPALIVE
int getSequenceLockTargetGateId(int index) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getSequenceLocks();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    return list[index].targetGateId;
}

EMSCRIPTEN_KEEPALIVE
int getSequenceLockStep(int index) {
    if (!g_engine) return 0;
    const auto& list = g_engine->getSequenceLocks();
    if (index < 0 || index >= static_cast<int>(list.size())) return 0;
    return static_cast<int>(list[index].currentStep);
}

EMSCRIPTEN_KEEPALIVE
int getSequenceLockState(int index) {
    if (!g_engine) return 0;
    const auto& list = g_engine->getSequenceLocks();
    if (index < 0 || index >= static_cast<int>(list.size())) return 0;
    return list[index].isUnlocked ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int getSequenceLockRuneCount(int index) {
    if (!g_engine) return 0;
    const auto& list = g_engine->getSequenceLocks();
    if (index < 0 || index >= static_cast<int>(list.size())) return 0;
    return static_cast<int>(list[index].runePositions.size());
}

EMSCRIPTEN_KEEPALIVE
int getSequenceLockRuneX(int index, int runeIdx) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getSequenceLocks();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    if (runeIdx < 0 || runeIdx >= static_cast<int>(list[index].runePositions.size())) return -1;
    return list[index].runePositions[runeIdx].x;
}

EMSCRIPTEN_KEEPALIVE
int getSequenceLockRuneY(int index, int runeIdx) {
    if (!g_engine) return -1;
    const auto& list = g_engine->getSequenceLocks();
    if (index < 0 || index >= static_cast<int>(list.size())) return -1;
    if (runeIdx < 0 || runeIdx >= static_cast<int>(list[index].runePositions.size())) return -1;
    return list[index].runePositions[runeIdx].y;
}

// ============================================================================
// Milestone 7 — Challenge Mode WASM API Functions
// ============================================================================

EMSCRIPTEN_KEEPALIVE
int startChallenge(int challengeId, int levelId) {
    if (g_engine == nullptr) {
        g_engine = new GameEngine();
    }
    return g_engine->startChallenge(challengeId, levelId) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
void updateChallengeTime(float deltaSeconds) {
    if (!g_engine) return;
    g_engine->updateChallengeTime(deltaSeconds);
}

EMSCRIPTEN_KEEPALIVE
int isChallengeActive() {
    if (!g_engine) return 0;
    return g_engine->isChallengeActive() ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int getChallengeType() {
    if (!g_engine) return 0;
    return static_cast<int>(g_engine->getChallengeState().type);
}

EMSCRIPTEN_KEEPALIVE
float getChallengeTimeLimit() {
    if (!g_engine) return 0.0f;
    return g_engine->getChallengeState().timeLimitSeconds;
}

EMSCRIPTEN_KEEPALIVE
float getChallengeElapsedTime() {
    if (!g_engine) return 0.0f;
    return g_engine->getChallengeState().elapsedTimeSeconds;
}

EMSCRIPTEN_KEEPALIVE
int getChallengeMoveLimit() {
    if (!g_engine) return 0;
    return g_engine->getChallengeState().moveLimit;
}

EMSCRIPTEN_KEEPALIVE
int isChallengeFailed() {
    if (!g_engine) return 0;
    return g_engine->getChallengeState().isFailed ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int isChallengeCompleted() {
    if (!g_engine) return 0;
    return g_engine->getChallengeState().isCompleted ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
int getChallengeRank(char* outBuffer, int maxLen) {
    if (!g_engine || !outBuffer || maxLen <= 0) return 0;
    std::string rank = g_engine->getChallengeState().rank;
    if (rank.empty()) rank = "F";
    int copyLen = static_cast<int>(rank.length());
    if (copyLen >= maxLen) copyLen = maxLen - 1;
    for (int i = 0; i < copyLen; i++) {
        outBuffer[i] = rank[i];
    }
    outBuffer[copyLen] = '\0';
    return copyLen;
}

// ============================================================================
// Milestone 8 — Create Maze & Custom Level WASM API Functions
// ============================================================================

static LevelDefinition g_customBuildDef;

EMSCRIPTEN_KEEPALIVE
void resetCustomBuildDef() {
    g_customBuildDef = LevelDefinition();
    g_customBuildDef.id = 0;
    g_customBuildDef.name = "Custom Labyrinth";
    g_customBuildDef.difficulty = 1;
    g_customBuildDef.puzzleType = PuzzleType::Basic;
}

EMSCRIPTEN_KEEPALIVE
int loadCustomMaze(const char* asciiData, int width, int height) {
    if (!asciiData) return 0;
    if (g_engine == nullptr) {
        g_engine = new GameEngine();
    }
    g_customBuildDef.mazeData = std::string(asciiData);
    return g_engine->loadCustomLevel(g_customBuildDef) ? 1 : 0;
}

EMSCRIPTEN_KEEPALIVE
void addCustomSwitch(int x, int y, int targetGateId) {
    int id = static_cast<int>(g_customBuildDef.switches.size()) + 1;
    g_customBuildDef.switches.push_back({id, {x, y}, targetGateId, false});
}

EMSCRIPTEN_KEEPALIVE
void addCustomGate(int gateId, int x, int y, int startOpen) {
    g_customBuildDef.gates.push_back({gateId, {x, y}, startOpen != 0});
}

EMSCRIPTEN_KEEPALIVE
void addCustomPressurePlate(int x, int y, int targetGateId) {
    int id = static_cast<int>(g_customBuildDef.pressurePlates.size()) + 1;
    g_customBuildDef.pressurePlates.push_back({id, {x, y}, targetGateId, false, false});
}

EMSCRIPTEN_KEEPALIVE
void addCustomOneWay(int x, int y, int direction) {
    OneWayDirection dir = OneWayDirection::RIGHT;
    if (direction == 0) dir = OneWayDirection::UP;
    else if (direction == 1) dir = OneWayDirection::DOWN;
    else if (direction == 2) dir = OneWayDirection::LEFT;
    else if (direction == 3) dir = OneWayDirection::RIGHT;
    g_customBuildDef.oneWayPaths.push_back({Position{x, y}, dir});
}

EMSCRIPTEN_KEEPALIVE
void addCustomMovingWall(int x, int y, int triggerSwitchId) {
    int id = static_cast<int>(g_customBuildDef.movingWalls.size()) + 1;
    g_customBuildDef.movingWalls.push_back({id, {x, y}, triggerSwitchId, false});
}

EMSCRIPTEN_KEEPALIVE
int validateCustomMaze(const char* asciiData, int width, int height) {
    if (!asciiData) return static_cast<int>(ValidationResultCode::MISSING_START);
    LevelDefinition testDef = g_customBuildDef;
    testDef.mazeData = std::string(asciiData);
    ValidationResult res = PuzzleValidator::validateCustomMaze(testDef);
    return static_cast<int>(res.code);
}

EMSCRIPTEN_KEEPALIVE
int getCustomMazeSolutionMoves(const char* asciiData) {
    if (!asciiData) return 0;
    LevelDefinition testDef = g_customBuildDef;
    testDef.mazeData = std::string(asciiData);
    ValidationResult res = PuzzleValidator::validateCustomMaze(testDef);
    return res.shortestPathMoves;
}

}


