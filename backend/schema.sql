-- SMARTMAZE DATABASE SCHEMA (MySQL 8.0)

CREATE DATABASE IF NOT EXISTS smartmaze_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartmaze_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    title VARCHAR(50) DEFAULT 'Novice Navigator',
    level_rank VARCHAR(50) DEFAULT 'Realm 01',
    avatar VARCHAR(10) DEFAULT '✦',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Level Progress Table (M11 Progression Model)
CREATE TABLE IF NOT EXISTS level_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    level_id INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    unlocked BOOLEAN DEFAULT FALSE,
    best_time INT DEFAULT NULL,
    best_moves INT DEFAULT NULL,
    best_grade VARCHAR(5) DEFAULT NULL,
    attempts INT DEFAULT 0,
    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_level (user_id, level_id),
    INDEX idx_level_user (user_id),
    INDEX idx_user_level_id (user_id, level_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Challenge Progress Table
CREATE TABLE IF NOT EXISTS challenge_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    challenge_id VARCHAR(50) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    attempts INT DEFAULT 0,
    best_score VARCHAR(10) DEFAULT NULL,
    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_challenge (user_id, challenge_id),
    INDEX idx_challenge_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
