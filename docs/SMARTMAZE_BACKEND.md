# SMARTMAZE BACKEND ARCHITECTURE & SPECIFICATION (M13)

## 1. System Overview
SmartMaze Milestone 13 implements a production-ready Flask REST API backend integrated with a MySQL database. It transitions the application from a client-only demo state to a multi-user, server-authenticated, database-backed platform.

```
                    SMARTMAZE
                        │
              ┌─────────┴─────────┐
              │                   │
           React                C++
              │                  │
              ↓                 WASM
           Flask API             │
              │                  │
              ↓                  │
          MySQL / SQL ◄──────────┘
```

The C++/WASM engine remains 100% authoritative for maze generation, BFS pathfinding, movement collisions, gate/switch triggers, and puzzle validation. Flask and MySQL handle identity, session authentication, profile statistics, and persistent progression synchronization.

---

## 2. Environment Configuration
Configuration is managed via environment variables defined in `.env` (derived from `.env.example`):

```ini
# FLASK API
FLASK_SECRET_KEY=smartmaze_dev_secret_key_987654321
FLASK_ENV=development
PORT=5000

# MYSQL DATABASE
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=smartmaze_db
MYSQL_USER=root
MYSQL_PASSWORD=root

# FRONTEND
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 3. Database Initialization & Schema
To initialize or reset the SmartMaze SQL database schema, run:

```bash
python backend/init_db.py
```

### Relational Schema (`backend/schema.sql`)

1. **`users` Table**:
   - `id`: Primary Key (AUTO_INCREMENT)
   - `username`: VARCHAR(50) UNIQUE NOT NULL
   - `email`: VARCHAR(100) UNIQUE NOT NULL
   - `password_hash`: VARCHAR(255) NOT NULL (pbkdf2:sha256)
   - `title`: VARCHAR(50) DEFAULT 'Novice Navigator'
   - `level_rank`: VARCHAR(50) DEFAULT 'Realm 01'
   - `avatar`: VARCHAR(10) DEFAULT '✦'
   - `created_at`: TIMESTAMP DEFAULT CURRENT_TIMESTAMP

2. **`level_progress` Table**:
   - `id`: Primary Key (AUTO_INCREMENT)
   - `user_id`: Foreign Key → `users.id` (CASCADE)
   - `level_id`: INT (1 to 20)
   - `completed`: BOOLEAN
   - `unlocked`: BOOLEAN
   - `best_time`: INT (Seconds, lower is better)
   - `best_moves`: INT (Steps, lower is better)
   - `best_grade`: VARCHAR(5) (S / A / B / C)
   - `attempts`: INT
   - `UNIQUE(user_id, level_id)`

3. **`challenge_progress` Table**:
   - `id`: Primary Key (AUTO_INCREMENT)
   - `user_id`: Foreign Key → `users.id` (CASCADE)
   - `challenge_id`: VARCHAR(50)
   - `completed`: BOOLEAN
   - `attempts`: INT
   - `best_score`: VARCHAR(10)
   - `UNIQUE(user_id, challenge_id)`

---

## 4. REST API Endpoint Specification

### Authentication (`/api/auth`)
- `POST /api/auth/register`: Creates a new user account with hashed password (`pbkdf2:sha256`) and sets session cookie.
- `POST /api/auth/login`: Authenticates user against `password_hash` and sets session cookie.
- `POST /api/auth/logout`: Clears active server session.
- `GET /api/auth/session`: Validates session cookie on application startup and returns current user profile.

### Profile Dossier (`/api/profile`)
- `GET /api/profile`: Returns authenticated user details and aggregated performance statistics.
- `PUT /api/profile`: Updates user title or avatar icon.

### Progression Sync (`/api/progress`)
- `GET /api/progress`: Fetches complete level map (all 20 realms) and challenge map.
- `POST /api/progress/level`: Records fixed level completion, enforces Best Time and Best Moves rules, and auto-unlocks Level $N+1$.
- `POST /api/progress/challenge`: Records challenge mode trial attempts and grade.
- `POST /api/progress/reset`: Resets player progression (retains Level 01 unlocked).
- `POST /api/progress/sync`: Performs one-time migration merge of client `localStorage` records into server database.

---

## 5. Development Startup Instructions

### Terminal 1 — Backend Flask API
```bash
python backend/app.py
```
*(Runs Flask REST API server on http://localhost:5000)*

### Terminal 2 — Frontend React App
```bash
npm run dev
```
*(Runs Vite development server on http://localhost:5173)*

### Running Test Suites
```bash
# C++ Engine Tests (70/70)
.\cpp\build\test_engine.exe

# Flask Backend API Test Suite
python backend/tests/test_backend.py
```
