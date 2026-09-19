#include "../include/MazeGenerator.h"
#include <algorithm>
#include <random>
#include <stack>
#include <stdexcept>

MazeGenerator::MazeGenerator() : seed(12345), maxAttempts(100) {}

MazeGenerator::MazeGenerator(uint32_t randomSeed, int attemptsLimit) 
    : seed(randomSeed), maxAttempts(attemptsLimit) {}

uint32_t MazeGenerator::getSeed() const {
    return seed;
}

void MazeGenerator::setSeed(uint32_t newSeed) {
    seed = newSeed;
}

int MazeGenerator::getMaxAttempts() const {
    return maxAttempts;
}

bool MazeGenerator::generate(int reqWidth, int reqHeight, Maze& outMaze) {
    return generate(reqWidth, reqHeight, seed, outMaze, maxAttempts);
}

bool MazeGenerator::generate(int reqWidth, int reqHeight, uint32_t currentSeed, Maze& outMaze, int maxAttempts) {
    // 1. Normalize dimensions safely (must be odd integers >= 5)
    int width = std::max(5, reqWidth);
    int height = std::max(5, reqHeight);

    if (width % 2 == 0) width++;
    if (height % 2 == 0) height++;

    for (int attempt = 0; attempt < maxAttempts; ++attempt) {
        // Deterministic PRNG seeded per attempt
        std::mt19937 rng(currentSeed + attempt);

        // Initialize grid filled with solid walls ('#')
        std::vector<std::vector<char>> grid(height, std::vector<char>(width, '#'));

        // 2. DFS Passage Carving (Iterative Stack-based Recursive Backtracking)
        struct Cell { int x; int y; };
        std::stack<Cell> st;

        Cell startCell = {1, 1};
        grid[startCell.y][startCell.x] = ' ';
        st.push(startCell);

        const int dx[4] = {0, 0, -2, 2};
        const int dy[4] = {-2, 2, 0, 0};

        while (!st.empty()) {
            Cell curr = st.top();

            // Find unvisited neighbors 2 steps away
            std::vector<int> validDirs;
            for (int i = 0; i < 4; ++i) {
                int nx = curr.x + dx[i];
                int ny = curr.y + dy[i];

                if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1) {
                    if (grid[ny][nx] == '#') {
                        validDirs.push_back(i);
                    }
                }
            }

            if (!validDirs.empty()) {
                // Pick random direction
                std::uniform_int_distribution<size_t> dist(0, validDirs.size() - 1);
                int chosenDir = validDirs[dist(rng)];

                int nx = curr.x + dx[chosenDir];
                int ny = curr.y + dy[chosenDir];
                int mx = curr.x + dx[chosenDir] / 2;
                int my = curr.y + dy[chosenDir] / 2;

                // Carve wall and target cell
                grid[my][mx] = ' ';
                grid[ny][nx] = ' ';

                st.push({nx, ny});
            } else {
                st.pop();
            }
        }

        // 3. Place Start 'S' at (1, 1) and Goal 'G' at (width - 2, height - 2)
        Position startPos = {1, 1};
        Position goalPos = {width - 2, height - 2};

        grid[startPos.y][startPos.x] = 'S';
        grid[goalPos.y][goalPos.x] = 'G';

        // Convert grid to ASCII map
        std::vector<std::string> asciiMap;
        asciiMap.reserve(height);
        for (int y = 0; y < height; ++y) {
            asciiMap.emplace_back(grid[y].begin(), grid[y].end());
        }

        // 4. Construct Maze & Validate with BFS PathFinder
        try {
            Maze candidateMaze(asciiMap);
            std::vector<Position> path;
            if (PathFinder::findPath(candidateMaze, path) && !path.empty()) {
                outMaze = candidateMaze;
                return true; // Successfully generated and validated solvable maze!
            }
        } catch (...) {
            // Ignore candidate evaluation errors during retry attempts
        }
    }

    return false; // Failed to generate valid maze within maxAttempts limit
}
