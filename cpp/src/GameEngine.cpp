#include "../include/GameEngine.h"
#include <sstream>

GameEngine::GameEngine() : state(GameState::PLAYING), currentLevelId(1), moveLimit(0) {
    loadLevel(1);
}

GameEngine::GameEngine(const Maze& mazeMap) : maze(mazeMap), state(GameState::PLAYING), currentLevelId(0), moveLimit(0) {
    Position start = maze.getStartPosition();
    player = Player(start.x, start.y);
}

void GameEngine::loadMaze(const Maze& mazeMap) {
    maze = mazeMap;
    Position start = maze.getStartPosition();
    player = Player(start.x, start.y);
    state = GameState::PLAYING;
    currentLevelId = 0;
    moveLimit = 0;
    runtimeSwitches.clear();
    runtimeGates.clear();
    runtimePressurePlates.clear();
    runtimeOneWayPaths.clear();
    runtimeMovingWalls.clear();
    runtimeSequenceLocks.clear();
    runtimeStateChanges.clear();
    runtimeTemporaryPaths.clear();
    runtimeHiddenPaths.clear();
}

bool GameEngine::loadLevel(int levelId) {
    if (!levelManager.isValidLevel(levelId)) {
        return false;
    }
    return loadCustomLevel(levelManager.getLevel(levelId));
}

bool GameEngine::loadCustomLevel(const LevelDefinition& def) {
    // Convert multi-line ASCII string into std::vector<std::string>
    std::vector<std::string> asciiMap;
    std::stringstream ss(def.mazeData);
    std::string line;
    while (std::getline(ss, line)) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        if (!line.empty()) asciiMap.push_back(line);
    }

    if (asciiMap.empty()) return false;

    maze = Maze(asciiMap);
    Position start = maze.getStartPosition();
    player = Player(start.x, start.y);
    state = GameState::PLAYING;
    currentLevelId = def.id;
    moveLimit = def.moveLimit;

    // 1. Switches
    runtimeSwitches.clear();
    for (const auto& swDef : def.switches) {
        runtimeSwitches.push_back({swDef.id, swDef.position, swDef.targetGateId, swDef.initialStateActive});
    }

    // 2. Gates
    runtimeGates.clear();
    for (const auto& gDef : def.gates) {
        runtimeGates.push_back({gDef.id, gDef.position, gDef.initialStateOpen});
    }

    // 3. Pressure Plates
    runtimePressurePlates.clear();
    for (const auto& ppDef : def.pressurePlates) {
        runtimePressurePlates.push_back({ppDef.id, ppDef.position, ppDef.targetGateId, ppDef.isSticky, ppDef.initialStatePressed});
    }

    // 4. One-Way Passages
    runtimeOneWayPaths.clear();
    for (const auto& owDef : def.oneWayPaths) {
        runtimeOneWayPaths.push_back({owDef.position, owDef.allowedDirection});
    }

    // 5. Moving Walls
    runtimeMovingWalls.clear();
    for (const auto& mwDef : def.movingWalls) {
        runtimeMovingWalls.push_back({mwDef.id, mwDef.position, mwDef.triggerSwitchId, mwDef.initialStateRetracted});
    }

    // 6. Sequence Locks
    runtimeSequenceLocks.clear();
    for (const auto& seqDef : def.sequenceLocks) {
        runtimeSequenceLocks.push_back({seqDef.id, seqDef.runePositions, 0, seqDef.targetGateId, false});
    }

    // 7. State Changes
    runtimeStateChanges.clear();
    for (const auto& scDef : def.stateChanges) {
        runtimeStateChanges.push_back({scDef.id, scDef.triggerPosition, scDef.state0Walls, scDef.state1Walls, scDef.initialState});
    }

    // 8. Temporary Paths
    runtimeTemporaryPaths.clear();
    for (const auto& tpDef : def.temporaryPaths) {
        runtimeTemporaryPaths.push_back({tpDef.id, tpDef.position, tpDef.triggerPosition, tpDef.durationMoves, 0, tpDef.initialStateActive});
    }

    // 9. Hidden Paths
    runtimeHiddenPaths.clear();
    for (const auto& hpDef : def.hiddenPaths) {
        runtimeHiddenPaths.push_back({hpDef.id, hpDef.position, hpDef.triggerPosition, hpDef.initialStateRevealed});
    }

    validatePuzzleReferences();

    return true;
}

bool GameEngine::loadCustomMaze(const std::string& asciiData, int width, int height) {
    LevelDefinition customDef;
    customDef.id = 0;
    customDef.name = "Custom Labyrinth";
    customDef.difficulty = 1;
    customDef.mazeData = asciiData;
    customDef.puzzleType = PuzzleType::Basic;
    return loadCustomLevel(customDef);
}

bool GameEngine::startChallenge(int challengeId, int levelId) {
    if (!loadLevel(levelId)) return false;

    challengeState = ChallengeState();
    challengeState.challengeId = challengeId;
    challengeState.levelId = levelId;

    switch (challengeId) {
        case 1: // TIME TRIAL
            challengeState.type = ChallengeType::TimeTrial;
            challengeState.timeLimitSeconds = (levelId <= 3) ? 45.0f : (levelId <= 10) ? 60.0f : (levelId <= 17) ? 80.0f : 110.0f;
            break;
        case 2: // MINIMAL MOVES
            challengeState.type = ChallengeType::MinimalMoves;
            challengeState.moveLimit = (levelId <= 3) ? 35 : (levelId <= 10) ? 55 : (levelId <= 17) ? 75 : 100;
            break;
        case 3: // BLIND MAZE
            challengeState.type = ChallengeType::BlindMaze;
            break;
        case 4: // NO MAP
            challengeState.type = ChallengeType::NoMap;
            break;
        case 5: // PERFECT RUN
            challengeState.type = ChallengeType::PerfectRun;
            challengeState.timeLimitSeconds = (levelId <= 3) ? 50.0f : (levelId <= 10) ? 70.0f : 95.0f;
            challengeState.moveLimit = (levelId <= 3) ? 40 : (levelId <= 10) ? 60 : 85;
            break;
        case 6: // UNKNOWN RULE
            challengeState.type = ChallengeType::UnknownRule;
            break;
        default:
            challengeState.type = ChallengeType::None;
            return false;
    }
    return true;
}

void GameEngine::updateChallengeTime(float deltaSeconds) {
    if (!isChallengeActive() || challengeState.isCompleted || challengeState.isFailed) return;

    challengeState.elapsedTimeSeconds += deltaSeconds;

    if (challengeState.timeLimitSeconds > 0.0f && challengeState.elapsedTimeSeconds >= challengeState.timeLimitSeconds) {
        challengeState.isFailed = true;
    }
}

const ChallengeState& GameEngine::getChallengeState() const {
    return challengeState;
}

bool GameEngine::isChallengeActive() const {
    return challengeState.challengeId > 0 && challengeState.type != ChallengeType::None;
}

std::string GameEngine::calculateChallengeRank() const {
    if (!challengeState.isCompleted) return "F";

    if (challengeState.type == ChallengeType::TimeTrial) {
        float ratio = challengeState.elapsedTimeSeconds / (challengeState.timeLimitSeconds > 0 ? challengeState.timeLimitSeconds : 60.0f);
        if (ratio <= 0.50f) return "S";
        if (ratio <= 0.75f) return "A";
        if (ratio <= 0.95f) return "B";
        return "C";
    }

    if (challengeState.type == ChallengeType::MinimalMoves) {
        int extra = challengeState.movesTaken - (challengeState.moveLimit > 0 ? challengeState.moveLimit : 30);
        if (extra <= 0) return "S";
        if (extra <= 3) return "A";
        if (extra <= 7) return "B";
        return "C";
    }

    if (challengeState.type == ChallengeType::PerfectRun) {
        if (challengeState.invalidMoveAttempts == 0 && challengeState.elapsedTimeSeconds <= challengeState.timeLimitSeconds * 0.7f) return "S";
        if (challengeState.invalidMoveAttempts <= 1) return "A";
        if (challengeState.invalidMoveAttempts <= 3) return "B";
        return "C";
    }

    // Default for Blind, NoMap, UnknownRule
    if (player.getMoveCount() <= 40) return "S";
    if (player.getMoveCount() <= 65) return "A";
    if (player.getMoveCount() <= 90) return "B";
    return "C";
}

bool GameEngine::movePlayer(Direction dir) {
    if (state == GameState::WON) {
        return false;
    }

    if (isChallengeActive() && challengeState.isFailed) {
        return false;
    }

    if (moveLimit > 0 && player.getMoveCount() >= moveLimit) {
        return false;
    }

    if (isChallengeActive() && challengeState.moveLimit > 0 && player.getMoveCount() >= challengeState.moveLimit) {
        challengeState.isFailed = true;
        return false;
    }

    int currentX = player.getX();
    int currentY = player.getY();

    int targetX = currentX;
    int targetY = currentY;

    switch (dir) {
        case Direction::UP: targetY--; break;
        case Direction::DOWN: targetY++; break;
        case Direction::LEFT: targetX--; break;
        case Direction::RIGHT: targetX++; break;
    }

    // Auxiliary lambda to record invalid move attempts for Perfect Run
    auto handleInvalidMove = [this]() {
        if (isChallengeActive()) {
            challengeState.invalidMoveAttempts++;
        }
        return false;
    };

    // 1. Boundary Check
    if (!maze.isInsideBounds(targetX, targetY)) {
        return handleInvalidMove();
    }

    // 2. Closed Gate Check -> rejects movement
    if (isGateClosedAt(targetX, targetY)) {
        return handleInvalidMove();
    }

    // 3. One-Way Passage Direction Check
    for (const auto& ow : runtimeOneWayPaths) {
        if ((ow.position.x == currentX && ow.position.y == currentY) ||
            (ow.position.x == targetX && ow.position.y == targetY)) {
            bool dirOk = false;
            if (ow.allowedDirection == OneWayDirection::UP && dir == Direction::UP) dirOk = true;
            if (ow.allowedDirection == OneWayDirection::DOWN && dir == Direction::DOWN) dirOk = true;
            if (ow.allowedDirection == OneWayDirection::LEFT && dir == Direction::LEFT) dirOk = true;
            if (ow.allowedDirection == OneWayDirection::RIGHT && dir == Direction::RIGHT) dirOk = true;
            if (!dirOk) return handleInvalidMove();
        }
    }

    // 4. Solid Moving Wall Check -> rejects movement if not retracted
    if (isMovingWallSolidAt(targetX, targetY)) {
        return handleInvalidMove();
    }

    // 5. Solid State Wall Check -> rejects movement if solid in current global state phase
    if (isStateWallSolidAt(targetX, targetY)) {
        return handleInvalidMove();
    }

    // 6. Temporary Path Expiration Check
    for (const auto& tp : runtimeTemporaryPaths) {
        if (tp.position.x == targetX && tp.position.y == targetY && !tp.isActive) {
            return handleInvalidMove();
        }
    }

    // 7. Base Wall Collision Check (unless overridden by open gate or revealed hidden path)
    if (!isGateOpenAt(targetX, targetY) && !isHiddenPathRevealedAt(targetX, targetY)) {
        if (!maze.isWalkable(targetX, targetY)) {
            return handleInvalidMove();
        }
    }

    // 8. Execute Movement
    player.setPosition(targetX, targetY);
    player.incrementMoveCount();

    if (isChallengeActive()) {
        challengeState.movesTaken = player.getMoveCount();
    }

    // 9. Step-On Mechanisms Processing
    // A. Switches
    for (auto& sw : runtimeSwitches) {
        if (sw.position.x == targetX && sw.position.y == targetY) {
            if (!sw.isActive) {
                sw.isActive = true;
                for (auto& gate : runtimeGates) {
                    if (gate.id == sw.targetGateId) gate.isOpen = true;
                }
                for (auto& mw : runtimeMovingWalls) {
                    if (mw.triggerSwitchId == sw.id) mw.isRetracted = !mw.isRetracted;
                }
            }
        }
    }

    // B. Pressure Plates
    for (auto& pp : runtimePressurePlates) {
        if (pp.position.x == targetX && pp.position.y == targetY) {
            pp.isPressed = true;
            for (auto& gate : runtimeGates) {
                if (gate.id == pp.targetGateId) gate.isOpen = true;
            }
        } else if (!pp.isSticky) {
            if (pp.isPressed) {
                pp.isPressed = false;
                for (auto& gate : runtimeGates) {
                    if (gate.id == pp.targetGateId) gate.isOpen = false;
                }
            }
        }
    }

    // C. Sequence Locks
    for (auto& seq : runtimeSequenceLocks) {
        if (!seq.isUnlocked && seq.currentStep < seq.runePositions.size()) {
            if (seq.runePositions[seq.currentStep].x == targetX && seq.runePositions[seq.currentStep].y == targetY) {
                seq.currentStep++;
                if (seq.currentStep >= seq.runePositions.size()) {
                    seq.isUnlocked = true;
                    for (auto& gate : runtimeGates) {
                        if (gate.id == seq.targetGateId) gate.isOpen = true;
                    }
                }
            }
        }
    }

    // D. State Change Triggers
    for (auto& sc : runtimeStateChanges) {
        if (sc.triggerPosition.x == targetX && sc.triggerPosition.y == targetY) {
            sc.currentState = (sc.currentState == 0) ? 1 : 0;
        }
    }

    // E. Temporary Path Triggers & Timers
    for (auto& tp : runtimeTemporaryPaths) {
        if (tp.triggerPosition.x == targetX && tp.triggerPosition.y == targetY) {
            tp.isActive = true;
            tp.movesRemaining = tp.durationMoves;
        } else if (tp.isActive && tp.movesRemaining > 0) {
            tp.movesRemaining--;
            if (tp.movesRemaining <= 0) {
                tp.isActive = false;
            }
        }
    }

    // F. Hidden Path Triggers
    for (auto& hp : runtimeHiddenPaths) {
        if (hp.triggerPosition.x == targetX && hp.triggerPosition.y == targetY) {
            hp.isRevealed = true;
        }
    }

    // 10. Goal Detection Check
    if (player.getPosition() == maze.getGoalPosition()) {
        state = GameState::WON;
        if (currentLevelId > 0) {
            levelManager.completeLevel(currentLevelId);
        }
        if (isChallengeActive()) {
            challengeState.isCompleted = true;
            challengeState.rank = calculateChallengeRank();
        }
    }

    return true;
}

const Maze& GameEngine::getMaze() const { return maze; }
const Player& GameEngine::getPlayer() const { return player; }
GameState GameEngine::getGameState() const { return state; }
bool GameEngine::isWon() const { return state == GameState::WON; }
int GameEngine::getCurrentLevelId() const { return currentLevelId; }
LevelManager& GameEngine::getLevelManager() { return levelManager; }
const LevelManager& GameEngine::getLevelManager() const { return levelManager; }

const std::vector<RuntimeSwitchState>& GameEngine::getSwitches() const { return runtimeSwitches; }
const std::vector<RuntimeGateState>& GameEngine::getGates() const { return runtimeGates; }
const std::vector<RuntimePressurePlateState>& GameEngine::getPressurePlates() const { return runtimePressurePlates; }
const std::vector<RuntimeOneWayState>& GameEngine::getOneWayPaths() const { return runtimeOneWayPaths; }
const std::vector<RuntimeMovingWallState>& GameEngine::getMovingWalls() const { return runtimeMovingWalls; }
const std::vector<RuntimeSequenceLockState>& GameEngine::getSequenceLocks() const { return runtimeSequenceLocks; }
const std::vector<RuntimeStateChangeState>& GameEngine::getStateChanges() const { return runtimeStateChanges; }
const std::vector<RuntimeTemporaryPathState>& GameEngine::getTemporaryPaths() const { return runtimeTemporaryPaths; }
const std::vector<RuntimeHiddenPathState>& GameEngine::getHiddenPaths() const { return runtimeHiddenPaths; }

int GameEngine::getMoveLimit() const { return moveLimit; }
int GameEngine::getMovesRemaining() const {
    if (moveLimit <= 0) return -1;
    return moveLimit - player.getMoveCount();
}

bool GameEngine::isGateClosedAt(int x, int y) const {
    for (const auto& g : runtimeGates) {
        if (g.position.x == x && g.position.y == y && !g.isOpen) return true;
    }
    return false;
}

bool GameEngine::isGateOpenAt(int x, int y) const {
    for (const auto& g : runtimeGates) {
        if (g.position.x == x && g.position.y == y && g.isOpen) return true;
    }
    return false;
}

bool GameEngine::isSwitchActiveAt(int x, int y) const {
    for (const auto& sw : runtimeSwitches) {
        if (sw.position.x == x && sw.position.y == y && sw.isActive) return true;
    }
    return false;
}

bool GameEngine::isPressurePlatePressedAt(int x, int y) const {
    for (const auto& pp : runtimePressurePlates) {
        if (pp.position.x == x && pp.position.y == y && pp.isPressed) return true;
    }
    return false;
}

bool GameEngine::isMovingWallSolidAt(int x, int y) const {
    for (const auto& mw : runtimeMovingWalls) {
        if (mw.position.x == x && mw.position.y == y && !mw.isRetracted) return true;
    }
    return false;
}

bool GameEngine::isStateWallSolidAt(int x, int y) const {
    for (const auto& sc : runtimeStateChanges) {
        const auto& activeWalls = (sc.currentState == 0) ? sc.state0Walls : sc.state1Walls;
        for (const auto& pos : activeWalls) {
            if (pos.x == x && pos.y == y) return true;
        }
    }
    return false;
}

bool GameEngine::isHiddenPathRevealedAt(int x, int y) const {
    for (const auto& hp : runtimeHiddenPaths) {
        if (hp.position.x == x && hp.position.y == y && hp.isRevealed) return true;
    }
    return false;
}

bool GameEngine::validatePuzzleReferences() const {
    for (const auto& sw : runtimeSwitches) {
        if (!maze.isInsideBounds(sw.position.x, sw.position.y)) return false;
    }
    for (const auto& g : runtimeGates) {
        if (!maze.isInsideBounds(g.position.x, g.position.y)) return false;
    }
    return true;
}

void GameEngine::reset() {
    Position start = maze.getStartPosition();
    player = Player(start.x, start.y);
    state = GameState::PLAYING;

    if (currentLevelId > 0 && levelManager.isValidLevel(currentLevelId)) {
        loadLevel(currentLevelId);
    }
}


