#ifndef SMARTMAZE_PUZZLEOBJECTS_H
#define SMARTMAZE_PUZZLEOBJECTS_H

#include "Maze.h"
#include <vector>

/**
 * SwitchDefinition — Static Switch Configuration Model
 */
struct SwitchDefinition {
    int id;
    Position position;
    int targetGateId;
    bool initialStateActive;
};

/**
 * GateDefinition — Static Gate Configuration Model
 */
struct GateDefinition {
    int id;
    Position position;
    bool initialStateOpen;
};

/**
 * PressurePlateDefinition — Step-on / Pressure Mechanism Model
 */
struct PressurePlateDefinition {
    int id;
    Position position;
    int targetGateId;
    bool isSticky; // If true, remains pressed after step-on. If false, active only while standing.
    bool initialStatePressed;
};

/**
 * OneWayDirection Enum
 */
enum class OneWayDirection {
    UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3
};

/**
 * OneWayDefinition — Directional Passage Restriction
 */
struct OneWayDefinition {
    Position position;
    OneWayDirection allowedDirection;
};

/**
 * MovingWallDefinition — Retracting / Extending Wall Block
 */
struct MovingWallDefinition {
    int id;
    Position position;
    int triggerSwitchId;
    bool initialStateRetracted; // true = walkable initially, false = solid wall initially
};

/**
 * SequenceLockDefinition — Multi-Rune Sequential Activation Model
 */
struct SequenceLockDefinition {
    int id;
    std::vector<Position> runePositions; // Step sequence order [0, 1, 2...]
    int targetGateId;
};

/**
 * StateChangeDefinition — Multi-State Environmental Phase Toggles
 */
struct StateChangeDefinition {
    int id;
    Position triggerPosition;
    std::vector<Position> state0Walls;
    std::vector<Position> state1Walls;
    int initialState; // 0 or 1
};

/**
 * TemporaryPathDefinition — Step-limited or Timed Passages
 */
struct TemporaryPathDefinition {
    int id;
    Position position;
    Position triggerPosition;
    int durationMoves;
    bool initialStateActive;
};

/**
 * HiddenPathDefinition — Revealed Secret Passage
 */
struct HiddenPathDefinition {
    int id;
    Position position;
    Position triggerPosition;
    bool initialStateRevealed;
};

// ============================================================================
// Transient Runtime State Structs
// ============================================================================

struct RuntimeSwitchState {
    int id;
    Position position;
    int targetGateId;
    bool isActive;
};

struct RuntimeGateState {
    int id;
    Position position;
    bool isOpen;
};

struct RuntimePressurePlateState {
    int id;
    Position position;
    int targetGateId;
    bool isSticky;
    bool isPressed;
};

struct RuntimeOneWayState {
    Position position;
    OneWayDirection allowedDirection;
};

struct RuntimeMovingWallState {
    int id;
    Position position;
    int triggerSwitchId;
    bool isRetracted;
};

struct RuntimeSequenceLockState {
    int id;
    std::vector<Position> runePositions;
    size_t currentStep;
    int targetGateId;
    bool isUnlocked;
};

struct RuntimeStateChangeState {
    int id;
    Position triggerPosition;
    std::vector<Position> state0Walls;
    std::vector<Position> state1Walls;
    int currentState;
};

struct RuntimeTemporaryPathState {
    int id;
    Position position;
    Position triggerPosition;
    int durationMoves;
    int movesRemaining;
    bool isActive;
};

struct RuntimeHiddenPathState {
    int id;
    Position position;
    Position triggerPosition;
    bool isRevealed;
};

#endif // SMARTMAZE_PUZZLEOBJECTS_H

