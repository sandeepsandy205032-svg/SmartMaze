#ifndef SMARTMAZE_PUZZLEVALIDATOR_H
#define SMARTMAZE_PUZZLEVALIDATOR_H

#include "LevelDefinition.h"
#include "GameEngine.h"
#include <vector>

/**
 * PuzzleValidator — State-Space BFS Labyrinth & Puzzle Solver Validator
 * 
 * Validates level solvability across full dynamic state space (Player Position + Puzzle Mechanism States)
 * and verifies that intended puzzle mechanics are mandatory for reaching the Goal (preventing trivial bypasses).
 */
enum class ValidationResultCode {
    VALID = 0,
    MISSING_START = 1,
    MISSING_GOAL = 2,
    INVALID_BOUNDARIES = 3,
    UNSOLVABLE = 4,
    INVALID_PUZZLE_LINK = 5
};

struct ValidationResult {
    ValidationResultCode code;
    std::string message;
    int shortestPathMoves = 0;
};

/**
 * PuzzleValidator — State-Space BFS Labyrinth & Puzzle Solver Validator
 * 
 * Validates level solvability across full dynamic state space (Player Position + Puzzle Mechanism States)
 * and verifies that intended puzzle mechanics are mandatory for reaching the Goal (preventing trivial bypasses).
 */
class PuzzleValidator {
public:
    PuzzleValidator() = default;

    /**
     * Solves the given level definition using state-space BFS.
     * @param level Static level configuration definition
     * @param solutionMoves Output vector of directions forming shortest valid solution path
     * @return true if solvable within puzzle rules; false if unsolvable
     */
    static bool solveLevel(const LevelDefinition& level, std::vector<Direction>& solutionMoves);

    /**
     * Verifies that a level is solvable AND that the intended puzzle mechanics are mandatory.
     * @param level Static level configuration definition
     * @return true if level is valid, solvable, and requires intended mechanics
     */
    static bool validateLevelSolvability(const LevelDefinition& level);

    /**
     * Validates custom user-created maze layout for Start/Goal presence, outer boundary wall integrity,
     * puzzle reference sanity, and state-space solvability.
     */
    static ValidationResult validateCustomMaze(const LevelDefinition& level);
    static ValidationResult validateCustomMazeAscii(const std::string& asciiData, int width = 0, int height = 0);
};

#endif // SMARTMAZE_PUZZLEVALIDATOR_H
