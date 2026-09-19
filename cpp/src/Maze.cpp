#include "../include/Maze.h"
#include <iostream>
#include <stdexcept>

Maze::Maze() : width(0), height(0), startPos{0, 0}, goalPos{0, 0} {}

Maze::Maze(const std::vector<std::string>& asciiMap) {
    if (asciiMap.empty()) {
        throw std::invalid_argument("Maze ASCII map cannot be empty.");
    }

    height = static_cast<int>(asciiMap.size());
    width = static_cast<int>(asciiMap[0].size());

    grid.resize(height, std::vector<char>(width, '#'));

    bool startFound = false;
    bool goalFound = false;

    for (int y = 0; y < height; ++y) {
        if (static_cast<int>(asciiMap[y].size()) != width) {
            throw std::invalid_argument("Inconsistent row widths in Maze ASCII map at row " + std::to_string(y) + " (expected " + std::to_string(width) + ", got " + std::to_string(asciiMap[y].size()) + ")");
        }
        for (int x = 0; x < width; ++x) {
            char ch = asciiMap[y][x];
            grid[y][x] = ch;

            if (ch == 'S') {
                startPos = {x, y};
                startFound = true;
            } else if (ch == 'G') {
                goalPos = {x, y};
                goalFound = true;
            }
        }
    }

    if (!startFound) {
        throw std::invalid_argument("Maze map must contain exactly one Start position ('S').");
    }
    if (!goalFound) {
        throw std::invalid_argument("Maze map must contain exactly one Goal position ('G').");
    }
}

int Maze::getWidth() const {
    return width;
}

int Maze::getHeight() const {
    return height;
}

bool Maze::isInsideBounds(int x, int y) const {
    return x >= 0 && x < width && y >= 0 && y < height;
}

bool Maze::isWalkable(int x, int y) const {
    if (!isInsideBounds(x, y)) {
        return false;
    }
    char cell = grid[y][x];
    return cell != '#';
}

char Maze::getCell(int x, int y) const {
    if (!isInsideBounds(x, y)) {
        return '#';
    }
    return grid[y][x];
}

Position Maze::getStartPosition() const {
    return startPos;
}

Position Maze::getGoalPosition() const {
    return goalPos;
}

bool Maze::operator==(const Maze& other) const {
    if (width != other.width || height != other.height) return false;
    if (!(startPos == other.startPos) || !(goalPos == other.goalPos)) return false;
    return grid == other.grid;
}

void Maze::printMaze() const {
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            std::cout << grid[y][x];
        }
        std::cout << "\n";
    }
}
