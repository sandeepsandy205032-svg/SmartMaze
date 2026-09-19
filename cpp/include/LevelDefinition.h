#ifndef SMARTMAZE_LEVELDEFINITION_H
#define SMARTMAZE_LEVELDEFINITION_H

#include <string>
#include <vector>
#include "PuzzleObjects.h"

/**
 * PuzzleType — Functional Mechanics Classification
 */
enum class PuzzleType {
    Basic,
    Shifting,
    OneWay,
    Gate,
    Switch,
    Reversible,
    MultiState,
    Decoy,
    Memory,
    Constraint,
    Mastery
};

/**
 * LevelDefinition — Static Level Configuration Model
 * 
 * Stores fixed level metadata, ASCII maze data, and static puzzle object definitions.
 * Does NOT contain global theme preferences or runtime player progress.
 */
struct LevelDefinition {
    int id;                                       // Level ID (1 - 20)
    std::string name;                             // Level Title
    int difficulty;                               // Difficulty rating (1 - 5)
    std::string mazeData;                         // Fixed ASCII maze string grid
    PuzzleType puzzleType;                        // Puzzle classification
    std::vector<SwitchDefinition> switches;       // Static switch definitions
    std::vector<GateDefinition> gates;             // Static gate definitions
    std::vector<PressurePlateDefinition> pressurePlates; // Pressure plates
    std::vector<OneWayDefinition> oneWayPaths;    // One-way directional passages
    std::vector<MovingWallDefinition> movingWalls; // Retracting/extending walls
    std::vector<SequenceLockDefinition> sequenceLocks; // Multi-rune sequence locks
    std::vector<StateChangeDefinition> stateChanges;  // Phase/state shifts
    std::vector<TemporaryPathDefinition> temporaryPaths; // Timed/step-limited paths
    std::vector<HiddenPathDefinition> hiddenPaths; // Secret revealed paths
    int moveLimit = 0;                            // Optional step limit (0 = unlimited)
};

/**
 * ChallengeType — Milestone 7 Challenge Mode Classification
 */
enum class ChallengeType {
    None = 0,
    TimeTrial = 1,
    MinimalMoves = 2,
    BlindMaze = 3,
    NoMap = 4,
    PerfectRun = 5,
    UnknownRule = 6
};

/**
 * ChallengeDefinition — Static Challenge Metadata Model
 */
struct ChallengeDefinition {
    int id;                                       // Challenge ID (1 - 6)
    std::string name;                             // Challenge Title
    std::string tagline;                          // Challenge Tagline / Motto
    std::string description;                      // Objective Description
    ChallengeType type;                           // Challenge Type
    float timeLimitSeconds = 0.0f;               // Optional time limit (0 = unlimited)
    int moveLimit = 0;                            // Optional move limit (0 = unlimited)
    std::vector<int> eligibleLevelIds;            // Eligible fixed level IDs
};

/**
 * ChallengeState — Authoritative C++ Runtime Challenge Tracking
 */
struct ChallengeState {
    int challengeId = 0;
    ChallengeType type = ChallengeType::None;
    int levelId = 0;
    float timeLimitSeconds = 0.0f;
    float elapsedTimeSeconds = 0.0f;
    int moveLimit = 0;
    int movesTaken = 0;
    int invalidMoveAttempts = 0;
    bool isFailed = false;
    bool isCompleted = false;
    std::string rank = "";
};

/**
 * Convert PuzzleType enum to human-readable string representation.
 */
inline std::string getPuzzleTypeName(PuzzleType type) {
    switch (type) {
        case PuzzleType::Basic: return "Basic Pathfinding";
        case PuzzleType::Shifting: return "Shifting Passages";
        case PuzzleType::OneWay: return "One-Way Passages";
        case PuzzleType::Gate: return "Sealed Gates";
        case PuzzleType::Switch: return "Ancient Switches";
        case PuzzleType::Reversible: return "Reversible Runes";
        case PuzzleType::MultiState: return "Multi-State Mechanisms";
        case PuzzleType::Decoy: return "Decoy Routes";
        case PuzzleType::Memory: return "Memory Sequences";
        case PuzzleType::Constraint: return "Move Constraints";
        case PuzzleType::Mastery: return "Mastery Labyrinth";
        default: return "Labyrinth Mechanics";
    }
}

#endif // SMARTMAZE_LEVELDEFINITION_H
