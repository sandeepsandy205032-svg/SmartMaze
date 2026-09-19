#include <iostream>
#include <vector>
#include <string>
#include "../include/Maze.h"
#include "../include/PathFinder.h"
#include "../include/MazeGenerator.h"

int main() {
    struct LevelInfo {
        int id;
        std::string name;
        int diff;
        int dim;
        std::string puzzle;
    };

    std::vector<LevelInfo> info = {
        {1, "01 — The Threshold", 1, 7, "Basic"},
        {2, "02 — Verdant Passages", 1, 7, "Basic"},
        {3, "03 — Monolith of Shifts", 1, 9, "Shifting"},
        {4, "04 — Abyssal Echoes", 2, 9, "OneWay"},
        {5, "05 — The Sunken Sanctuary", 2, 9, "Gate"},

        {6, "06 — Silent Switches", 2, 11, "Switch"},
        {7, "07 — The Rotating Halls", 3, 11, "Reversible"},
        {8, "08 — Hidden Routes", 3, 11, "Decoy"},
        {9, "09 — Fractured Paths", 3, 11, "MultiState"},
        {10, "10 — The Twin Gates", 3, 11, "Gate"},

        {11, "11 — Shifting Sanctuary", 4, 13, "Shifting"},
        {12, "12 — The Broken Passage", 4, 13, "OneWay"},
        {13, "13 — Echo Chamber", 4, 13, "Memory"},
        {14, "14 — The Veiled Route", 4, 13, "Constraint"},
        {15, "15 — Convergence", 4, 13, "MultiState"},

        {16, "16 — The Forgotten Trial", 5, 15, "Constraint"},
        {17, "17 — The Endless Corridor", 5, 15, "Decoy"},
        {18, "18 — The Last Mechanism", 5, 15, "Reversible"},
        {19, "19 — The Architect's Maze", 5, 15, "MultiState"},
        {20, "20 — The Final Passage", 5, 15, "Mastery"}
    };

    for (const auto& item : info) {
        Maze m;
        uint32_t seed = 2000 + item.id * 37;
        bool ok = MazeGenerator::generate(item.dim, item.dim, seed, m);
        std::vector<Position> path;
        PathFinder::findPath(m, path);

        std::cout << "    // Level " << item.id << "\n";
        std::cout << "    {\n";
        std::cout << "        " << item.id << ",\n";
        std::cout << "        \"" << item.name << "\",\n";
        std::cout << "        " << item.diff << ",\n";
        std::cout << "        \"";
        for (int y = 0; y < m.getHeight(); ++y) {
            for (int x = 0; x < m.getWidth(); ++x) {
                std::cout << m.getCell(x, y);
            }
            if (y + 1 < m.getHeight()) std::cout << "\\n";
        }
        std::cout << "\",\n";
        std::cout << "        PuzzleType::" << item.puzzle << "\n";
        std::cout << "    },\n\n";
    }

    return 0;
}
