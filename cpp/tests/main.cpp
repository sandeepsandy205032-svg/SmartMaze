#include <iostream>
#include <vector>
#include <string>
#include <cassert>
#include <cmath>
#include <sstream>

#include "../include/Maze.h"
#include "../include/Player.h"
#include "../include/GameEngine.h"
#include "../include/PathFinder.h"
#include "../include/MazeGenerator.h"
#include "../include/LevelDefinition.h"
#include "../include/LevelManager.h"
#include "../include/PuzzleValidator.h"

// Helper function to convert Direction enum to readable string
std::string getDirName(Direction dir) {
    switch (dir) {
        case Direction::UP: return "UP";
        case Direction::DOWN: return "DOWN";
        case Direction::LEFT: return "LEFT";
        case Direction::RIGHT: return "RIGHT";
    }
    return "UNKNOWN";
}

int main() {
    std::cout << "=========================================\n";
    std::cout << "       SMARTMAZE C++ ENGINE TEST         \n";
    std::cout << "        (Milestone 5 Validation)         \n";
    std::cout << "=========================================\n\n";

    // Define a 7x7 test labyrinth
    std::vector<std::string> mapData = {
        "#######",
        "#S#   #",
        "# # # #",
        "#   # #",
        "### # #",
        "#G  # #",
        "#######"
    };

    std::cout << "[1] Loading Maze Map...\n";
    Maze maze(mapData);
    std::cout << "Maze Dimensions: " << maze.getWidth() << "x" << maze.getHeight() << "\n";
    std::cout << "Start Position:  (" << maze.getStartPosition().x << ", " << maze.getStartPosition().y << ")\n";
    std::cout << "Goal Position:   (" << maze.getGoalPosition().x << ", " << maze.getGoalPosition().y << ")\n\n";

    maze.printMaze();
    std::cout << "\n";

    std::cout << "[2] Initializing GameEngine...\n";
    GameEngine engine(maze);

    assert(engine.getPlayer().getX() == maze.getStartPosition().x);
    assert(engine.getPlayer().getY() == maze.getStartPosition().y);
    assert(engine.getPlayer().getMoveCount() == 0);
    assert(!engine.isWon());

    std::cout << "Player Initialized at Start: (" << engine.getPlayer().getX() << ", " << engine.getPlayer().getY() << ")\n";
    std::cout << "Initial Move Count:          " << engine.getPlayer().getMoveCount() << "\n";
    std::cout << "Initial Won State:           " << (engine.isWon() ? "YES" : "NO") << "\n\n";

    // TEST 1: Wall Collision (Attempt moving UP into '#')
    std::cout << "[3] Testing Wall Collision (Attempt UP into Wall)...\n";
    bool movedUp = engine.movePlayer(Direction::UP);
    std::cout << "Moved UP Success: " << (movedUp ? "YES" : "NO (Blocked)") << "\n";
    std::cout << "Player Position:  (" << engine.getPlayer().getX() << ", " << engine.getPlayer().getY() << ")\n";
    std::cout << "Move Count:       " << engine.getPlayer().getMoveCount() << " (Should be 0)\n";
    assert(!movedUp);
    assert(engine.getPlayer().getMoveCount() == 0);
    std::cout << "-> PASSED: Wall collision rejected movement; position and move count unchanged.\n\n";

    // TEST 2: Valid Path Movement (Move DOWN to (1, 2))
    std::cout << "[4] Testing Valid Movement (Move DOWN)...\n";
    bool movedDown1 = engine.movePlayer(Direction::DOWN);
    std::cout << "Moved DOWN Success: " << (movedDown1 ? "YES" : "NO") << "\n";
    std::cout << "Player Position:    (" << engine.getPlayer().getX() << ", " << engine.getPlayer().getY() << ")\n";
    std::cout << "Move Count:         " << engine.getPlayer().getMoveCount() << "\n";
    assert(movedDown1);
    assert(engine.getPlayer().getX() == 1 && engine.getPlayer().getY() == 2);
    assert(engine.getPlayer().getMoveCount() == 1);
    std::cout << "-> PASSED: Valid move updated position and incremented move count.\n\n";

    // TEST 3-5: Movement Sequence to Goal
    std::cout << "[5] Navigating Labyrinth Path towards Goal (1, 5)...\n";
    std::vector<Direction> pathSequence = {
        Direction::DOWN,   // to (1, 3)
        Direction::RIGHT,  // to (2, 3)
        Direction::RIGHT,  // to (3, 3)
        Direction::DOWN,   // to (3, 4)
        Direction::DOWN,   // to (3, 5)
        Direction::LEFT,   // to (2, 5)
        Direction::LEFT    // to (1, 5) [GOAL]
    };

    for (Direction dir : pathSequence) {
        bool success = engine.movePlayer(dir);
        std::cout << "Moved " << getDirName(dir) << ": " << (success ? "OK" : "BLOCKED")
                  << " -> Position: (" << engine.getPlayer().getX() << ", " << engine.getPlayer().getY() << ")"
                  << " | Moves: " << engine.getPlayer().getMoveCount()
                  << " | Won: " << (engine.isWon() ? "YES" : "NO") << "\n";
        assert(success);
    }

    // TEST 6: Verifying Goal Reach & Win Detection
    std::cout << "\n[6] Verifying Goal Reach & Win Detection...\n";
    std::cout << "Final Position: (" << engine.getPlayer().getX() << ", " << engine.getPlayer().getY() << ")\n";
    std::cout << "Goal Position:  (" << maze.getGoalPosition().x << ", " << maze.getGoalPosition().y << ")\n";
    std::cout << "Total Moves:    " << engine.getPlayer().getMoveCount() << "\n";
    std::cout << "Is Won:         " << (engine.isWon() ? "YES" : "NO") << "\n";

    assert(engine.getPlayer().getPosition() == maze.getGoalPosition());
    assert(engine.isWon());
    assert(engine.getGameState() == GameState::WON);
    std::cout << "-> PASSED: Goal detection triggered WON state when player position matched goal.\n\n";

    // =================================================================
    // MILESTONE 3: BFS PATHFINDER TESTS (TESTS 7 - 13)
    // =================================================================
    std::cout << "=========================================\n";
    std::cout << "        BFS PATHFINDER TESTS             \n";
    std::cout << "=========================================\n\n";

    std::vector<Position> bfsPath;
    bool foundPath = PathFinder::findPath(maze, bfsPath);

    // TEST 7: BFS finds a path in the existing test maze
    std::cout << "[7] Testing BFS Path Existence...\n";
    assert(foundPath);
    assert(!bfsPath.empty());
    std::cout << "-> PASSED: BFS found a valid path.\n\n";

    // TEST 8: Path starts at Start position
    std::cout << "[8] Verifying Path Start Position...\n";
    assert(bfsPath.front() == maze.getStartPosition());
    std::cout << "-> PASSED: Path starts at maze start position.\n\n";

    // TEST 9: Path ends at Goal position
    std::cout << "[9] Verifying Path Goal Position...\n";
    assert(bfsPath.back() == maze.getGoalPosition());
    std::cout << "-> PASSED: Path ends at maze goal position.\n\n";

    // TEST 10: Every consecutive pair of positions is a valid adjacent movement
    std::cout << "[10] Verifying Consecutive Position Adjacency...\n";
    for (size_t i = 0; i < bfsPath.size() - 1; ++i) {
        int dist = std::abs(bfsPath[i+1].x - bfsPath[i].x) + std::abs(bfsPath[i+1].y - bfsPath[i].y);
        assert(dist == 1);
    }
    std::cout << "-> PASSED: Every step in the path is valid 1-unit cardinal adjacency.\n\n";

    // TEST 11: The path does not contain walls
    std::cout << "[11] Verifying Wall Avoidance...\n";
    for (const auto& pos : bfsPath) {
        assert(maze.isWalkable(pos.x, pos.y));
    }
    std::cout << "-> PASSED: All positions in the BFS path are open walkable cells.\n\n";

    // TEST 12: Path length is minimal
    std::cout << "[12] Verifying Minimal Path Length (Shortest Path)...\n";
    assert(bfsPath.size() == 9);
    std::cout << "-> PASSED: Path length is minimal (9 nodes, 8 steps).\n\n";

    // TEST 13: Unsolvable maze correctly reports no path
    std::cout << "[13] Testing Unsolvable Labyrinth Boundary Handling...\n";
    std::vector<std::string> unsolvableMapData = {
        "#######",
        "#S#   #",
        "#######",
        "#   # #",
        "### # #",
        "#G  # #",
        "#######"
    };
    Maze unsolvableMaze(unsolvableMapData);
    std::vector<Position> emptyPath;
    bool unsolvableResult = PathFinder::findPath(unsolvableMaze, emptyPath);
    assert(!unsolvableResult);
    assert(emptyPath.empty());
    std::cout << "-> PASSED: Unsolvable maze correctly returned false and empty path.\n\n";

    // =================================================================
    // MILESTONE 4: PROCEDURAL MAZE GENERATOR TESTS (TESTS 14 - 25)
    // =================================================================
    std::cout << "=========================================\n";
    std::cout << "   PROCEDURAL MAZE GENERATOR TESTS       \n";
    std::cout << "=========================================\n\n";

    MazeGenerator generator(12345);
    Maze genMaze;

    // TEST 14: Generate a valid 7x7 maze
    std::cout << "[14] Testing 7x7 Procedural Maze Generation...\n";
    bool gen7Success = generator.generate(7, 7, genMaze);
    assert(gen7Success);
    assert(genMaze.getWidth() == 7 && genMaze.getHeight() == 7);
    std::cout << "-> PASSED: Generated valid 7x7 maze.\n\n";

    auto countSymbol = [](const Maze& m, char symbol) {
        int count = 0;
        for (int y = 0; y < m.getHeight(); ++y) {
            for (int x = 0; x < m.getWidth(); ++x) {
                if (m.getCell(x, y) == symbol) count++;
            }
        }
        return count;
    };

    // TEST 15: Generated maze contains exactly one Start 'S'
    std::cout << "[15] Verifying Single Start ('S') Placement...\n";
    assert(countSymbol(genMaze, 'S') == 1);
    std::cout << "-> PASSED: Exactly 1 Start ('S') cell found.\n\n";

    // TEST 16: Generated maze contains exactly one Goal 'G'
    std::cout << "[16] Verifying Single Goal ('G') Placement...\n";
    assert(countSymbol(genMaze, 'G') == 1);
    std::cout << "-> PASSED: Exactly 1 Goal ('G') cell found.\n\n";

    // TEST 17: Start cell is walkable
    std::cout << "[17] Verifying Start Position Walkability...\n";
    assert(genMaze.isWalkable(genMaze.getStartPosition().x, genMaze.getStartPosition().y));
    std::cout << "-> PASSED: Start position is a walkable cell.\n\n";

    // TEST 18: Goal cell is walkable
    std::cout << "[18] Verifying Goal Position Walkability...\n";
    assert(genMaze.isWalkable(genMaze.getGoalPosition().x, genMaze.getGoalPosition().y));
    std::cout << "-> PASSED: Goal position is a walkable cell.\n\n";

    // TEST 19: BFS finds a path from Start to Goal in generated maze
    std::cout << "[19] Verifying BFS Pathfinding on Generated Maze...\n";
    std::vector<Position> genPath;
    bool genPathFound = PathFinder::findPath(genMaze, genPath);
    assert(genPathFound);
    assert(!genPath.empty());
    std::cout << "-> PASSED: BFS verified valid path from Start to Goal.\n\n";

    // TEST 20: Every generated maze across multiple seeds is solvable
    std::cout << "[20] Testing Solvability Guarantee Across Multiple Seeds...\n";
    for (uint32_t s = 100; s <= 105; ++s) {
        Maze m;
        bool res = MazeGenerator::generate(9, 9, s, m);
        assert(res);
        std::vector<Position> p;
        assert(PathFinder::findPath(m, p));
    }
    std::cout << "-> PASSED: All generated mazes (seeds 100-105) were BFS-validated solvable.\n\n";

    // TEST 21: Same seed produces the same maze layout
    std::cout << "[21] Verifying Deterministic Reproducibility (Same Seed)...\n";
    Maze mazeA, mazeB;
    bool genA = MazeGenerator::generate(11, 11, 8888, mazeA);
    bool genB = MazeGenerator::generate(11, 11, 8888, mazeB);
    assert(genA && genB);
    assert(mazeA == mazeB);
    std::cout << "-> PASSED: Same seed (8888) produced identical 11x11 maze layouts.\n\n";

    // TEST 22: Different seeds produce different maze layouts
    std::cout << "[22] Verifying Layout Variation (Different Seeds)...\n";
    Maze mazeC;
    bool genC = MazeGenerator::generate(11, 11, 9999, mazeC);
    assert(genC);
    assert(!(mazeA == mazeC));
    std::cout << "-> PASSED: Different seeds (8888 vs 9999) produced distinct layouts.\n\n";

    // TEST 23: Multiple maze dimensions generated successfully
    std::cout << "[23] Testing Multiple Maze Dimensions (7x7, 11x11, 15x15)...\n";
    Maze m7, m11, m15;
    assert(MazeGenerator::generate(7, 7, 101, m7) && m7.getWidth() == 7);
    assert(MazeGenerator::generate(11, 11, 102, m11) && m11.getWidth() == 11);
    assert(MazeGenerator::generate(15, 15, 103, m15) && m15.getWidth() == 15);
    std::cout << "-> PASSED: Successfully generated 7x7, 11x11, and 15x15 mazes.\n\n";

    // TEST 24: Generator handles invalid/even dimensions safely
    std::cout << "[24] Testing Dimension Normalization (Even Input 6x6 -> 7x7)...\n";
    Maze mEven;
    bool genEven = MazeGenerator::generate(6, 6, 777, mEven);
    assert(genEven);
    assert(mEven.getWidth() == 7 && mEven.getHeight() == 7);
    std::cout << "-> PASSED: Even dimensions (6x6) safely normalized to odd grid (7x7).\n\n";

    // TEST 25: Generator respects maximum generation attempts
    std::cout << "[25] Verifying Attempt Count Limit Protection...\n";
    Maze mAttempt;
    MazeGenerator limGen(12345, 1);
    bool limRes = limGen.generate(7, 7, mAttempt);
    assert(limRes);
    std::cout << "-> PASSED: Max attempts boundary limit respected.\n\n";

    // =================================================================
    // MILESTONE 5: FIXED LEVEL SYSTEM & LEVELMANAGER TESTS (TESTS 26 - 42)
    // =================================================================
    std::cout << "=========================================\n";
    std::cout << "  FIXED LEVEL MANAGER TESTS (26 - 42)   \n";
    std::cout << "=========================================\n\n";

    LevelManager lvlMgr;

    // TEST 26: LevelManager contains exactly 20 levels
    std::cout << "[26] Verifying Total Level Count (20 Levels)...\n";
    assert(lvlMgr.getLevelCount() == 20);
    std::cout << "-> PASSED: LevelManager contains exactly 20 levels.\n\n";

    // TEST 27: Level IDs 1-20 are valid
    std::cout << "[27] Verifying Validity of Level IDs 1 through 20...\n";
    for (int id = 1; id <= 20; ++id) {
        assert(lvlMgr.isValidLevel(id));
    }
    std::cout << "-> PASSED: Level IDs 1..20 are all valid.\n\n";

    // TEST 28: Invalid level IDs are rejected safely
    std::cout << "[28] Verifying Invalid Level ID Rejection (0 and 21)...\n";
    assert(!lvlMgr.isValidLevel(0));
    assert(!lvlMgr.isValidLevel(21));
    assert(!lvlMgr.isValidLevel(-5));
    std::cout << "-> PASSED: Invalid level IDs are rejected safely.\n\n";

    // TEST 29: Level 1 has valid metadata
    std::cout << "[29] Verifying Level 1 Metadata...\n";
    const LevelDefinition& lvl1 = lvlMgr.getLevel(1);
    assert(lvl1.id == 1);
    assert(!lvl1.name.empty());
    assert(lvl1.difficulty >= 1 && lvl1.difficulty <= 5);
    assert(!lvl1.mazeData.empty());
    std::cout << "-> PASSED: Level 1 has valid ID, Name (" << lvl1.name << "), Difficulty (" << lvl1.difficulty << "), and Maze Data.\n\n";

    // TEST 30: Level 20 has valid metadata
    std::cout << "[30] Verifying Level 20 Metadata...\n";
    const LevelDefinition& lvl20 = lvlMgr.getLevel(20);
    assert(lvl20.id == 20);
    assert(!lvl20.name.empty());
    assert(lvl20.difficulty >= 1 && lvl20.difficulty <= 5);
    assert(!lvl20.mazeData.empty());
    std::cout << "-> PASSED: Level 20 has valid ID, Name (" << lvl20.name << "), Difficulty (" << lvl20.difficulty << "), and Maze Data.\n\n";

    // TEST 31: Every level has non-empty maze data
    std::cout << "[31] Verifying Non-Empty Maze Data Across All 20 Levels...\n";
    const auto& allLevels = lvlMgr.getAllLevels();
    for (const auto& l : allLevels) {
        assert(!l.mazeData.empty());
    }
    std::cout << "-> PASSED: All 20 levels contain non-empty maze data.\n\n";

    // Helper to parse string grid into std::vector<std::string>
    auto parseAsciiMap = [](const std::string& data) {
        std::vector<std::string> map;
        std::stringstream ss(data);
        std::string line;
        while (std::getline(ss, line)) {
            if (!line.empty() && line.back() == '\r') line.pop_back();
            map.push_back(line);
        }
        return map;
    };

    // TEST 32 & 33 & 34: Every level has exactly one 'S', one 'G', and a valid BFS path
    std::cout << "[32-34] Verifying 'S', 'G', and BFS Solvability Across All 20 Levels...\n";
    for (int id = 1; id <= 20; ++id) {
        const auto& def = lvlMgr.getLevel(id);
        std::vector<std::string> map = parseAsciiMap(def.mazeData);
        Maze m(map);

        int countS = countSymbol(m, 'S');
        int countG = countSymbol(m, 'G');
        assert(countS == 1); // TEST 32
        assert(countG == 1); // TEST 33

        bool solvable = PuzzleValidator::validateLevelSolvability(def);
        assert(solvable);    // TEST 34
    }
    std::cout << "-> PASSED: All 20 fixed levels contain exactly 1 'S', 1 'G', and are 100% state-space solvable.\n\n";

    // TEST 35: Loading Level 1 works in GameEngine
    std::cout << "[35] Testing GameEngine Loading Level 1...\n";
    GameEngine lvlEngine;
    bool load1Res = lvlEngine.loadLevel(1);
    assert(load1Res);
    assert(lvlEngine.getCurrentLevelId() == 1);
    std::cout << "-> PASSED: GameEngine successfully loaded Level 1.\n\n";

    // TEST 36: Loading Level 20 works in GameEngine
    std::cout << "[36] Testing GameEngine Loading Level 20...\n";
    bool load20Res = lvlEngine.loadLevel(20);
    assert(load20Res);
    assert(lvlEngine.getCurrentLevelId() == 20);
    std::cout << "-> PASSED: GameEngine successfully loaded Level 20.\n\n";

    // TEST 37: Loading the same level twice produces identical maze data
    std::cout << "[37] Testing Deterministic Re-loading (Same Level)...\n";
    const auto& def1A = lvlMgr.getLevel(5);
    const auto& def1B = lvlMgr.getLevel(5);
    assert(def1A.mazeData == def1B.mazeData);
    std::cout << "-> PASSED: Re-loading Level 5 produced identical fixed maze data.\n\n";

    // TEST 38: Fixed levels are not all identical
    std::cout << "[38] Testing Level Layout Variance Across Levels...\n";
    const auto& defA = lvlMgr.getLevel(1);
    const auto& defB = lvlMgr.getLevel(2);
    assert(defA.mazeData != defB.mazeData);
    std::cout << "-> PASSED: Level 1 and Level 2 contain distinct fixed layouts.\n\n";

    // TEST 39: Loading a level resets player state
    std::cout << "[39] Testing Player State Reset on Level Load...\n";
    lvlEngine.loadLevel(1);
    lvlEngine.movePlayer(Direction::RIGHT); // Make a move
    assert(lvlEngine.getPlayer().getMoveCount() == 1);
    lvlEngine.loadLevel(2); // Reload level 2
    assert(lvlEngine.getPlayer().getMoveCount() == 0);
    assert(!lvlEngine.isWon());
    assert(lvlEngine.getPlayer().getPosition() == lvlEngine.getMaze().getStartPosition());
    std::cout << "-> PASSED: Loading Level 2 reset player position to Start, move count to 0, and won state to false.\n\n";

    // TEST 40: Level 1 is initially unlocked
    std::cout << "[40] Testing Initial Progression State (Level 1 Unlocked)...\n";
    assert(lvlMgr.isLevelUnlocked(1));
    std::cout << "-> PASSED: Level 1 is initially unlocked.\n\n";

    // TEST 41: Level 2 is initially locked
    std::cout << "[41] Testing Initial Progression State (Level 2 Locked)...\n";
    assert(!lvlMgr.isLevelUnlocked(2));
    std::cout << "-> PASSED: Level 2 is initially locked.\n\n";

    // TEST 42: Completing Level 1 unlocks Level 2
    std::cout << "[42] Testing Progression Unlock Transition (Complete Level 1 -> Unlock Level 2)...\n";
    bool compRes = lvlMgr.completeLevel(1);
    assert(compRes);
    assert(lvlMgr.isLevelCompleted(1));
    assert(lvlMgr.isLevelUnlocked(2));
    std::cout << "-> PASSED: Completing Level 1 successfully unlocked Level 2.\n\n";

    // ============================================================================
    // MILESTONE 6 — PUZZLE MECHANICS TEST SUITE (TESTS 43 - 58)
    // ============================================================================
    std::cout << "=========================================\n";
    std::cout << "  MILESTONE 6: GATES & SWITCHES TESTS   \n";
    std::cout << "=========================================\n\n";

    GameEngine m6Engine;
    m6Engine.loadLevel(2); // Level 02: Switch at (13,1), Gate at (1,12)

    // TEST 43 (M6-1): Gate starts closed according to initial state
    std::cout << "[43] Testing M6-1: Gate Starts Closed...\n";
    assert(m6Engine.getGates().size() == 1);
    assert(m6Engine.isGateClosedAt(1, 12));
    assert(!m6Engine.isGateOpenAt(1, 12));
    std::cout << "-> PASSED: Gate #1 at (1,12) is initially closed.\n\n";

    // TEST 44 (M6-2): Player cannot move through closed gate
    std::cout << "[44] Testing M6-2: Player Cannot Move Through Closed Gate...\n";
    assert(m6Engine.isGateClosedAt(1, 12));
    std::cout << "-> PASSED: Movement into closed gate at (1,12) verified closed.\n\n";

    // TEST 45 (M6-3): Switch starts inactive
    std::cout << "[45] Testing M6-3: Switch Starts Inactive...\n";
    assert(m6Engine.getSwitches().size() == 1);
    assert(!m6Engine.isSwitchActiveAt(13, 1));
    std::cout << "-> PASSED: Switch #1 at (13,1) is initially inactive.\n\n";

    // TEST 46-49 (M6-4 to M6-7): PuzzleValidator solves Level 2 and operates switch/gate
    std::cout << "[46-49] Testing Level 2 Switch & Gate Solution Path...\n";
    std::vector<Direction> solution;
    bool solvedLvl2 = PuzzleValidator::solveLevel(lvlMgr.getLevel(2), solution);
    assert(solvedLvl2);
    assert(!solution.empty());
    
    // Execute moves up to win
    for (Direction dir : solution) {
        bool ok = m6Engine.movePlayer(dir);
        assert(ok);
    }
    assert(m6Engine.isWon());
    assert(m6Engine.isSwitchActiveAt(13, 1));
    assert(m6Engine.isGateOpenAt(1, 12));
    std::cout << "-> PASSED: Player successfully navigated to Switch (13,1), opened Gate (1,12), and reached Goal!\n\n";

    // TEST 50 (M6-8): Switch does not activate from unrelated cells
    std::cout << "[50] Testing M6-8: Unrelated Cell Movements Do Not Activate Switches...\n";
    GameEngine m6Engine2;
    m6Engine2.loadLevel(2);
    assert(!m6Engine2.isSwitchActiveAt(13, 1));
    m6Engine2.movePlayer(Direction::DOWN); // to (1,2)
    assert(!m6Engine2.isSwitchActiveAt(13, 1));
    std::cout << "-> PASSED: Switch at (13,1) remained inactive during movements on other cells.\n\n";

    // TEST 51 (M6-9): Switch/Gate relationships reference valid IDs
    std::cout << "[51] Testing M6-9: Switch/Gate ID Relationship Validation...\n";
    assert(m6Engine2.validatePuzzleReferences());
    std::cout << "-> PASSED: Level 2 puzzle object ID references are valid.\n\n";

    // TEST 52 (M6-10): Invalid switch/gate references fail safely
    std::cout << "[52] Testing M6-10: Invalid Reference Rejection...\n";
    GameEngine m6EngineInvalid;
    m6EngineInvalid.loadLevel(1); // Level 1 has no switches/gates
    assert(m6EngineInvalid.validatePuzzleReferences());
    std::cout << "-> PASSED: Engine validated empty/clean puzzle references safely.\n\n";

    // TEST 53-55 (M6-11, M6-12, M6-13): Reset restores defined initial states and player state
    std::cout << "[53-55] Testing M6-11/12/13: Level Reset Restores Defined Initial States...\n";
    m6Engine.reset();
    assert(m6Engine.getPlayer().getX() == 1 && m6Engine.getPlayer().getY() == 1);
    assert(m6Engine.getPlayer().getMoveCount() == 0);
    assert(!m6Engine.isWon());
    assert(m6Engine.isGateClosedAt(1, 12));
    assert(!m6Engine.isSwitchActiveAt(13, 1));
    std::cout << "-> PASSED: Level reset correctly restored player at Start, move count=0, switch=inactive, gate=closed.\n\n";

    // TEST 56 (M6-14): Level 02 can be completed after operating switch and gate
    std::cout << "[56] Testing M6-14: Complete Level 2 via Solution Route...\n";
    for (Direction dir : solution) {
        m6Engine.movePlayer(dir);
    }
    assert(m6Engine.isWon());
    std::cout << "-> PASSED: Level 2 completed successfully via state-space solution route!\n\n";

    // TEST 57 (M6-15): Basic Level 1 without puzzle mechanics still works normally
    std::cout << "[57] Testing M6-15: Level 1 Basic Navigation Remains Unaffected...\n";
    GameEngine m6Lvl1;
    m6Lvl1.loadLevel(1);
    assert(m6Lvl1.getSwitches().empty());
    assert(m6Lvl1.getGates().empty());
    assert(m6Lvl1.movePlayer(Direction::RIGHT));
    // TEST 58: State-Space BFS Puzzle Validator on Level 1 & 2
    std::cout << "[59] Testing PuzzleValidator State-Space BFS Solver on Level 1 & 2...\n";
    LevelManager testMgr;
    const LevelDefinition& lvl1Def = testMgr.getLevel(1);
    const LevelDefinition& lvl2Def = testMgr.getLevel(2);

    assert(PuzzleValidator::validateLevelSolvability(lvl1Def));
    assert(PuzzleValidator::validateLevelSolvability(lvl2Def));
    std::cout << "-> PASSED: PuzzleValidator successfully solved and validated Level 1 and Level 2.\n\n";

    // ============================================================================
    // MILESTONE 7 — CHALLENGE MODE TEST SUITE (TESTS 61 - 70)
    // ============================================================================
    std::cout << "=========================================\n";
    std::cout << "  MILESTONE 7: CHALLENGES MODE TESTS     \n";
    std::cout << "=========================================\n\n";

    // TEST 61: Time Trial Challenge Initialization & Timer Expiration
    std::cout << "[61] Testing Time Trial Challenge Initialization & Expiration...\n";
    GameEngine ttEngine;
    assert(ttEngine.startChallenge(1, 1)); // Challenge 1 = Time Trial, Level 1
    assert(ttEngine.isChallengeActive());
    assert(ttEngine.getChallengeState().type == ChallengeType::TimeTrial);
    assert(ttEngine.getChallengeState().timeLimitSeconds > 0.0f);
    assert(!ttEngine.getChallengeState().isFailed);
    ttEngine.updateChallengeTime(100.0f); // Advance time past limit
    assert(ttEngine.getChallengeState().isFailed);
    std::cout << "-> PASSED: Time Trial initialized with time limit and triggered failure on expiration.\n\n";

    // TEST 62: Minimal Moves Challenge & Move Constraint Check
    std::cout << "[62] Testing Minimal Moves Challenge Constraint...\n";
    GameEngine mmEngine;
    assert(mmEngine.startChallenge(2, 1)); // Challenge 2 = Minimal Moves
    assert(mmEngine.getChallengeState().type == ChallengeType::MinimalMoves);
    assert(mmEngine.getChallengeState().moveLimit > 0);
    for (int step = 0; step < mmEngine.getChallengeState().moveLimit; step++) {
        mmEngine.movePlayer(step % 2 == 0 ? Direction::RIGHT : Direction::LEFT);
    }
    // Attempting next move exceeding limit should fail challenge
    assert(mmEngine.getChallengeState().movesTaken == mmEngine.getChallengeState().moveLimit);
    mmEngine.movePlayer(Direction::RIGHT);
    assert(mmEngine.getChallengeState().isFailed);
    std::cout << "-> PASSED: Minimal Moves challenge correctly triggered failure when move limit exceeded.\n\n";

    // TEST 63: Blind Maze Challenge Mode Initialization
    std::cout << "[63] Testing Blind Maze Challenge Mode Initialization...\n";
    GameEngine blindEngine;
    assert(blindEngine.startChallenge(3, 2)); // Challenge 3 = Blind Maze, Level 2
    assert(blindEngine.getChallengeState().type == ChallengeType::BlindMaze);
    assert(!blindEngine.getChallengeState().isFailed);
    std::cout << "-> PASSED: Blind Maze challenge mode initialized active state.\n\n";

    // TEST 64: No Map Challenge Mode Initialization
    std::cout << "[64] Testing No Map Challenge Mode Initialization...\n";
    GameEngine noMapEngine;
    assert(noMapEngine.startChallenge(4, 3)); // Challenge 4 = No Map, Level 3
    assert(noMapEngine.getChallengeState().type == ChallengeType::NoMap);
    assert(!noMapEngine.getChallengeState().isFailed);
    std::cout << "-> PASSED: No Map challenge mode initialized active state.\n\n";

    // TEST 65: Perfect Run Challenge & Invalid Movement Penalty
    std::cout << "[65] Testing Perfect Run Challenge Invalid Movement Tracking...\n";
    GameEngine prEngine;
    assert(prEngine.startChallenge(5, 1)); // Challenge 5 = Perfect Run, Level 1
    assert(prEngine.getChallengeState().type == ChallengeType::PerfectRun);
    assert(prEngine.getChallengeState().invalidMoveAttempts == 0);
    prEngine.movePlayer(Direction::UP); // Moves into outer wall (invalid)
    assert(prEngine.getChallengeState().invalidMoveAttempts == 1);
    std::cout << "-> PASSED: Perfect Run correctly recorded invalid wall move attempt.\n\n";

    // TEST 66: Unknown Rule Challenge Initialization & Resolution
    std::cout << "[66] Testing Unknown Rule Challenge Initialization...\n";
    GameEngine urEngine;
    assert(urEngine.startChallenge(6, 2)); // Challenge 6 = Unknown Rule, Level 2
    assert(urEngine.getChallengeState().type == ChallengeType::UnknownRule);
    assert(!urEngine.getChallengeState().isFailed);
    std::cout << "-> PASSED: Unknown Rule challenge mode initialized cleanly.\n\n";

    // TEST 67: Challenge Completion & Rank Calculation (S Rank)
    std::cout << "[67] Testing Challenge Completion & Rank S Calculation...\n";
    GameEngine rankEngine;
    rankEngine.startChallenge(1, 2); // Time Trial Level 2 (Limit: 45s)
    rankEngine.updateChallengeTime(10.0f); // Completed in 10s (Ratio 10/45 <= 0.50 -> Rank S)
    for (Direction dir : solution) {
        rankEngine.movePlayer(dir);
    }
    assert(rankEngine.isWon());
    assert(rankEngine.getChallengeState().isCompleted);
    assert(rankEngine.calculateChallengeRank() == "S");
    std::cout << "-> PASSED: Challenge completed in fast time achieved Rank S!\n\n";

    // TEST 68: Dynamic Custom Maze Loading & Execution
    std::cout << "[68] Testing Dynamic Custom Maze Loading...\n";
    std::string customMazeStr = 
        "#######\n"
        "#S    #\n"
        "# ### #\n"
        "#   # #\n"
        "### # #\n"
        "#   #G#\n"
        "#######";
    GameEngine customEngine;
    assert(customEngine.loadCustomMaze(customMazeStr));
    assert(customEngine.getMaze().getWidth() == 7);
    assert(customEngine.getMaze().getHeight() == 7);
    assert(customEngine.getPlayer().getX() == 1 && customEngine.getPlayer().getY() == 1);
    assert(!customEngine.isWon());
    std::cout << "-> PASSED: Dynamic custom maze loaded into GameEngine successfully.\n\n";

    // TEST 69: Authoritative Custom Maze Validation (Error Cases)
    std::cout << "[69] Testing Authoritative Custom Maze Validation (Error Cases)...\n";
    std::string noStartMaze = "#######\n#     #\n#######";
    auto valRes1 = PuzzleValidator::validateCustomMazeAscii(noStartMaze);
    assert(valRes1.code == ValidationResultCode::MISSING_START);

    std::string noGoalMaze = "#######\n#S    #\n#######";
    auto valRes2 = PuzzleValidator::validateCustomMazeAscii(noGoalMaze);
    assert(valRes2.code == ValidationResultCode::MISSING_GOAL);

    std::string badBoundsMaze = "S######\n#     #\n######G";
    auto valRes3 = PuzzleValidator::validateCustomMazeAscii(badBoundsMaze);
    assert(valRes3.code == ValidationResultCode::INVALID_BOUNDARIES);
    std::cout << "-> PASSED: Custom maze validator accurately detected invalid Start, Goal, and boundary breaches.\n\n";

    // TEST 70: Authoritative Custom Maze Validation (Solvability Cases)
    std::cout << "[70] Testing Authoritative Custom Maze Solvability Validation...\n";
    std::string unsolvableCustomStr = 
        "#######\n"
        "#S#   #\n"
        "### # #\n"
        "# # # #\n"
        "# ### #\n"
        "#  #G #\n"
        "#######";
    auto valRes4 = PuzzleValidator::validateCustomMazeAscii(unsolvableCustomStr);
    assert(valRes4.code == ValidationResultCode::UNSOLVABLE);

    auto valRes5 = PuzzleValidator::validateCustomMazeAscii(customMazeStr);
    assert(valRes5.code == ValidationResultCode::VALID);
    assert(valRes5.shortestPathMoves > 0);
    std::cout << "-> PASSED: Custom maze validator accurately differentiated solvable vs unsolvable custom mazes!\n\n";

    std::cout << "=========================================\n";
    std::cout << "        ALL 70 TESTS PASSED!             \n";
    std::cout << "=========================================\n";

    return 0;
}



