#include "../include/Player.h"

Player::Player() : x(0), y(0), moveCount(0) {}

Player::Player(int startX, int startY) : x(startX), y(startY), moveCount(0) {}

int Player::getX() const {
    return x;
}

int Player::getY() const {
    return y;
}

Position Player::getPosition() const {
    return Position{x, y};
}

int Player::getMoveCount() const {
    return moveCount;
}

void Player::setPosition(int newX, int newY) {
    x = newX;
    y = newY;
}

void Player::setPosition(const Position& pos) {
    x = pos.x;
    y = pos.y;
}

void Player::incrementMoveCount() {
    moveCount++;
}

void Player::resetMoveCount() {
    moveCount = 0;
}
