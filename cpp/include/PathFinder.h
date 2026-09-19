#ifndef SMARTMAZE_PATHFINDER_H
#define SMARTMAZE_PATHFINDER_H

#include "Maze.h"
#include <vector>

/**
 * PathFinder — Breadth-First Search (BFS) Labyrinth Pathfinding Component
 * 
 * Computes the guaranteed shortest walkable path between Start and Goal on a 2D Maze grid.
 * 
 * ALGORITHMIC COMPLEXITY:
 * - Time Complexity: O(R * C) where R is rows (height) and C is columns (width).
 *   Each grid cell is added to the BFS queue at most once and examined in O(1) time.
 * - Space Complexity: O(R * C) to store the 2D visited grid and parent reference matrix
 *   for path reconstruction.
 */
class PathFinder {
public:
    PathFinder() = default;

    /**
     * Find the shortest walkable path from maze.getStartPosition() to maze.getGoalPosition().
     * @param maze Reference to the 2D Maze grid.
     * @param path Output vector populated with ordered grid coordinates from Start to Goal.
     * @return true if a valid path exists; false if unreachable.
     */
    static bool findPath(const Maze& maze, std::vector<Position>& path);

    /**
     * Overloaded findPath specifying custom start and goal coordinates.
     * @param maze Reference to the 2D Maze grid.
     * @param start Custom start position.
     * @param goal Custom target position.
     * @param path Output vector populated with ordered grid coordinates.
     * @return true if a valid path exists; false if unreachable.
     */
    static bool findPath(const Maze& maze, const Position& start, const Position& goal, std::vector<Position>& path);
};

#endif // SMARTMAZE_PATHFINDER_H
