#ifndef SMARTMAZE_MAZEGENERATOR_H
#define SMARTMAZE_MAZEGENERATOR_H

#include "Maze.h"
#include "PathFinder.h"
#include <random>
#include <vector>
#include <string>
#include <cstdint>

/**
 * MazeGenerator — Procedural Labyrinth Generation Component
 * 
 * Uses Depth-First Search (Recursive Backtracking) to carve connected passages
 * into a 2D grid, places Start ('S') and Goal ('G'), and validates solvability
 * using BFS PathFinder.
 * 
 * ALGORITHMIC COMPLEXITY:
 * - Generation Time Complexity: O(R * C) where R is rows and C is columns.
 * - BFS Validation Time Complexity: O(R * C).
 * - Memory Complexity: O(R * C) to store the grid and recursion stack.
 */
class MazeGenerator {
private:
    uint32_t seed;
    int maxAttempts;

public:
    MazeGenerator();
    explicit MazeGenerator(uint32_t randomSeed, int attemptsLimit = 100);

    /**
     * Generate a solvable Maze of specified width and height.
     * Dimensions are automatically normalized to odd integers >= 5.
     * 
     * @param width Requested maze width (columns).
     * @param height Requested maze height (rows).
     * @param outMaze Reference to output Maze object.
     * @return true if a valid, BFS-validated solvable maze was generated; false on failure.
     */
    bool generate(int width, int height, Maze& outMaze);

    /**
     * Overloaded static convenience function to generate a maze with specified seed.
     */
    static bool generate(int width, int height, uint32_t seed, Maze& outMaze, int maxAttempts = 100);

    uint32_t getSeed() const;
    void setSeed(uint32_t newSeed);
    int getMaxAttempts() const;
};

#endif // SMARTMAZE_MAZEGENERATOR_H
