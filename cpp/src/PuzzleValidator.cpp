#include "../include/PuzzleValidator.h"
#include <iostream>
#include <queue>
#include <set>
#include <string>
#include <sstream>

struct StateKey {
    int x;
    int y;
    std::string puzzleState;

    bool operator<(const StateKey& other) const {
        if (x != other.x) return x < other.x;
        if (y != other.y) return y < other.y;
        return puzzleState < other.puzzleState;
    }
};

static std::string serializeEngineState(const GameEngine& engine) {
    std::string s;
    for (const auto& sw : engine.getSwitches()) {
        s += sw.isActive ? '1' : '0';
    }
    for (const auto& g : engine.getGates()) {
        s += g.isOpen ? '1' : '0';
    }
    for (const auto& pp : engine.getPressurePlates()) {
        s += pp.isPressed ? '1' : '0';
    }
    for (const auto& seq : engine.getSequenceLocks()) {
        s += std::to_string(seq.currentStep) + (seq.isUnlocked ? "U" : "L");
    }
    for (const auto& sc : engine.getStateChanges()) {
        s += std::to_string(sc.currentState);
    }
    for (const auto& tp : engine.getTemporaryPaths()) {
        s += (tp.isActive ? "1:" : "0:") + std::to_string(tp.movesRemaining);
    }
    for (const auto& mw : engine.getMovingWalls()) {
        s += mw.isRetracted ? '1' : '0';
    }
    for (const auto& hp : engine.getHiddenPaths()) {
        s += hp.isRevealed ? '1' : '0';
    }
    return s;
}

bool PuzzleValidator::solveLevel(const LevelDefinition& level, std::vector<Direction>& solutionMoves) {
    solutionMoves.clear();

    GameEngine startEngine;
    if (!startEngine.loadCustomLevel(level)) return false;

    struct QueueNode {
        GameEngine engine;
        std::vector<Direction> moves;
    };

    std::queue<QueueNode> q;
    std::set<StateKey> visited;

    q.push({startEngine, {}});
    visited.insert({startEngine.getPlayer().getX(), startEngine.getPlayer().getY(), serializeEngineState(startEngine)});

    const Direction directions[4] = { Direction::UP, Direction::DOWN, Direction::LEFT, Direction::RIGHT };

    while (!q.empty()) {
        QueueNode current = q.front();
        q.pop();

        if (current.engine.isWon()) {
            solutionMoves = current.moves;
            return true;
        }

        // Limit search depth / moves to avoid overflow
        if (current.moves.size() > 300) continue;

        for (Direction dir : directions) {
            QueueNode next = current;
            if (next.engine.movePlayer(dir)) {
                if (next.engine.isWon()) {
                    next.moves.push_back(dir);
                    solutionMoves = next.moves;
                    return true;
                }
                StateKey key = { next.engine.getPlayer().getX(), next.engine.getPlayer().getY(), serializeEngineState(next.engine) };
                if (visited.find(key) == visited.end()) {
                    visited.insert(key);
                    next.moves.push_back(dir);
                    q.push(next);
                }
            }
        }
    }

    return false;
}

bool PuzzleValidator::validateLevelSolvability(const LevelDefinition& level) {
    std::vector<Direction> moves;
    bool solvable = solveLevel(level, moves);
    if (!solvable) return false;

    // Check minimum move threshold (solution should be non-trivial)
    if (moves.empty()) return false;

    return true;
}

ValidationResult PuzzleValidator::validateCustomMaze(const LevelDefinition& level) {
    // 1. Parse ASCII lines
    std::vector<std::string> lines;
    std::stringstream ss(level.mazeData);
    std::string line;
    while (std::getline(ss, line)) {
        if (!line.empty() && line.back() == '\r') line.pop_back();
        if (!line.empty()) lines.push_back(line);
    }

    if (lines.empty()) {
        return { ValidationResultCode::MISSING_START, "Maze grid is empty.", 0 };
    }

    int height = static_cast<int>(lines.size());
    int width = static_cast<int>(lines[0].size());

    bool hasStart = false;
    bool hasGoal = false;

    for (int y = 0; y < height; y++) {
        for (int x = 0; x < static_cast<int>(lines[y].size()); x++) {
            char c = lines[y][x];
            if (c == 'S') hasStart = true;
            if (c == 'G') hasGoal = true;
        }
    }

    if (!hasStart) {
        return { ValidationResultCode::MISSING_START, "Maze must contain a Start position ('S').", 0 };
    }
    if (!hasGoal) {
        return { ValidationResultCode::MISSING_GOAL, "Maze must contain a Goal portal ('G').", 0 };
    }

    // 2. Validate outer boundary walls
    for (int x = 0; x < width; x++) {
        if (lines[0][x] != '#' || lines[height - 1][x] != '#') {
            return { ValidationResultCode::INVALID_BOUNDARIES, "Outer maze boundaries must be enclosed by solid walls.", 0 };
        }
    }
    for (int y = 0; y < height; y++) {
        if (lines[y][0] != '#' || lines[y][width - 1] != '#') {
            return { ValidationResultCode::INVALID_BOUNDARIES, "Outer maze boundaries must be enclosed by solid walls.", 0 };
        }
    }

    // 3. Solve using state-space BFS
    std::vector<Direction> solutionMoves;
    bool solvable = solveLevel(level, solutionMoves);
    if (!solvable) {
        return { ValidationResultCode::UNSOLVABLE, "Maze is unsolvable. No valid path exists from Start to Goal.", 0 };
    }

    return { ValidationResultCode::VALID, "Labyrinth is valid and solvable!", static_cast<int>(solutionMoves.size()) };
}

ValidationResult PuzzleValidator::validateCustomMazeAscii(const std::string& asciiData, int width, int height) {
    LevelDefinition customDef;
    customDef.id = 0;
    customDef.name = "Custom Level";
    customDef.mazeData = asciiData;
    return validateCustomMaze(customDef);
}
