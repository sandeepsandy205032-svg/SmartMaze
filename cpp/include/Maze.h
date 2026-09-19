#ifndef SMARTMAZE_MAZE_H
#define SMARTMAZE_MAZE_H

#include <vector>
#include <string>

/**
 * Position — 2D Grid Coordinates (X, Y)
 */
struct Position {
    int x;
    int y;

    bool operator==(const Position& other) const {
        return x == other.x && y == other.y;
    }
};

/**
 * Maze — 2D Grid Labyrinth Representation Class
 * Stores walls ('#'), paths (' '), start ('S'), and goal ('G').
 */
class Maze {
private:
    int width;
    int height;
    std::vector<std::vector<char>> grid;
    Position startPos;
    Position goalPos;

public:
    Maze();
    Maze(const std::vector<std::string>& asciiMap);

    int getWidth() const;
    int getHeight() const;
    bool isWalkable(int x, int y) const;
    bool isInsideBounds(int x, int y) const;
    char getCell(int x, int y) const;
    
    Position getStartPosition() const;
    Position getGoalPosition() const;

    bool operator==(const Maze& other) const;

    void printMaze() const;
};

#endif // SMARTMAZE_MAZE_H
