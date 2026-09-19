#include <iostream>
#include <sstream>
#include <vector>
#include <string>
#include "../include/LevelManager.h"

int main() {
    LevelManager mgr;
    for (int id = 1; id <= 20; ++id) {
        const auto& def = mgr.getLevel(id);
        std::stringstream ss(def.mazeData);
        std::string line;
        int row = 0;
        int expectedLen = -1;
        bool ok = true;
        while (std::getline(ss, line)) {
            if (!line.empty() && line.back() == '\r') line.pop_back();
            if (expectedLen == -1) expectedLen = line.length();
            else if ((int)line.length() != expectedLen) {
                std::cout << "Level " << id << " row " << row << " len=" << line.length() << " expected=" << expectedLen << "\n";
                std::cout << "Row content: '" << line << "'\n";
                ok = false;
            }
            row++;
        }
        if (ok) {
            std::cout << "Level " << id << " OK (" << expectedLen << "x" << row << ")\n";
        }
    }
    return 0;
}
