#include "../include/PathFinder.h"
#include <queue>
#include <vector>
#include <algorithm>

bool PathFinder::findPath(const Maze& maze, std::vector<Position>& path) {
    return findPath(maze, maze.getStartPosition(), maze.getGoalPosition(), path);
}

bool PathFinder::findPath(const Maze& maze, const Position& start, const Position& goal, std::vector<Position>& path) {
    path.clear();

    int width = maze.getWidth();
    int height = maze.getHeight();

    // Edge case check: empty maze or out-of-bounds start/goal
    if (width <= 0 || height <= 0) return false;
    if (!maze.isInsideBounds(start.x, start.y) || !maze.isInsideBounds(goal.x, goal.y)) return false;

    // Edge case check: start or goal is on a solid wall
    if (!maze.isWalkable(start.x, start.y) || !maze.isWalkable(goal.x, goal.y)) return false;

    // Special case: start equals goal
    if (start == goal) {
        path.push_back(start);
        return true;
    }

    // 2D Visited Grid (height rows x width cols)
    std::vector<std::vector<bool>> visited(height, std::vector<bool>(width, false));

    // 2D Parent Matrix for path reconstruction
    std::vector<std::vector<Position>> parent(height, std::vector<Position>(width, {-1, -1}));

    // Standard BFS Queue
    std::queue<Position> q;

    // Initialize BFS from start position
    q.push(start);
    visited[start.y][start.x] = true;

    // 4-Cardinal Directions (UP, DOWN, LEFT, RIGHT)
    const int dx[4] = {0, 0, -1, 1};
    const int dy[4] = {-1, 1, 0, 0};

    bool foundGoal = false;

    while (!q.empty()) {
        Position curr = q.front();
        q.pop();

        if (curr == goal) {
            foundGoal = true;
            break;
        }

        // Explore 4-Cardinal Neighbors
        for (int i = 0; i < 4; ++i) {
            int nx = curr.x + dx[i];
            int ny = curr.y + dy[i];

            // Validate neighbor: inside bounds, walkable, and not visited
            if (maze.isWalkable(nx, ny) && !visited[ny][nx]) {
                visited[ny][nx] = true;
                parent[ny][nx] = curr;
                q.push({nx, ny});
            }
        }
    }

    // If goal is unreachable, return false
    if (!foundGoal) {
        return false;
    }

    // Reconstruct shortest path by walking backward from Goal to Start
    Position curr = goal;
    while (!(curr == start)) {
        path.push_back(curr);
        curr = parent[curr.y][curr.x];
    }
    path.push_back(start);

    // Reverse path so it is ordered from Start -> Goal
    std::reverse(path.begin(), path.end());

    return true;
}
