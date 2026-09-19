#ifndef SMARTMAZE_PLAYER_H
#define SMARTMAZE_PLAYER_H

#include "Maze.h"

/**
 * Player — Independent Game Character Entity
 * Stores player coordinates (x, y) and step move count.
 */
class Player {
private:
    int x;
    int y;
    int moveCount;

public:
    Player();
    Player(int startX, int startY);

    int getX() const;
    int getY() const;
    Position getPosition() const;
    int getMoveCount() const;

    void setPosition(int newX, int newY);
    void setPosition(const Position& pos);
    void incrementMoveCount();
    void resetMoveCount();
};

#endif // SMARTMAZE_PLAYER_H
