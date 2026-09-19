from flask import Blueprint, request, jsonify, session
from backend.db import query_db, execute_db

progress_bp = Blueprint('progress', __name__)

def get_authenticated_user_id():
    return session.get('user_id')

GRADE_ORDER = {'S': 4, 'A': 3, 'B': 2, 'C': 1, '✓': 1}

def get_better_grade(g1, g2):
    if not g1: return g2
    if not g2: return g1
    v1 = GRADE_ORDER.get(g1, 0)
    v2 = GRADE_ORDER.get(g2, 0)
    return g1 if v1 >= v2 else g2

@progress_bp.route('', methods=['GET'])
def get_progress():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized session.'}), 401

    level_rows = query_db("SELECT * FROM level_progress WHERE user_id = %s", (user_id,))
    challenge_rows = query_db("SELECT * FROM challenge_progress WHERE user_id = %s", (user_id,))

    # Format level progress dictionary for frontend (keyed by level ID 1..20)
    levels = {}
    for r in level_rows:
        levels[str(r['level_id'])] = {
            'unlocked': bool(r['unlocked']),
            'completed': bool(r['completed']),
            'bestTime': r['best_time'],
            'bestMoves': r['best_moves'],
            'bestGrade': r['best_grade'],
            'attempts': r['attempts'],
            'lastPlayed': str(r['last_played']) if r.get('last_played') else None
        }

    # Ensure Level 01 is always unlocked
    if '1' not in levels:
        levels['1'] = {
            'unlocked': True,
            'completed': False,
            'bestTime': None,
            'bestMoves': None,
            'bestGrade': None,
            'attempts': 0,
            'lastPlayed': None
        }
    else:
        levels['1']['unlocked'] = True

    # Format challenge progress dictionary
    challenges = {}
    for r in challenge_rows:
        challenges[str(r['challenge_id'])] = {
            'completed': bool(r['completed']),
            'attempts': r['attempts'],
            'bestScore': r['best_score'],
            'lastPlayed': str(r['last_played']) if r.get('last_played') else None
        }

    return jsonify({
        'success': True,
        'data': {
            'levels': levels,
            'challenges': challenges
        }
    })

@progress_bp.route('/level', methods=['POST'])
def record_level_progress():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized session.'}), 401

    data = request.get_json() or {}
    try:
        level_id = int(data.get('levelId'))
    except (TypeError, ValueError):
        return jsonify({'success': False, 'message': 'Invalid levelId.'}), 400

    if level_id < 1 or level_id > 20:
        return jsonify({'success': False, 'message': 'levelId out of range (1..20).'}), 400

    completed = bool(data.get('completed', False))
    time_spent = data.get('time')
    moves = data.get('moves')
    grade = data.get('grade') or ('S' if completed else None)

    existing = query_db(
        "SELECT * FROM level_progress WHERE user_id = %s AND level_id = %s",
        (user_id, level_id),
        one=True
    )

    if not existing:
        best_time = time_spent if completed else None
        best_moves = moves if completed else None
        best_grade = grade if completed else None
        attempts = 1
        is_completed = completed
        is_unlocked = True

        execute_db(
            """INSERT INTO level_progress 
               (user_id, level_id, unlocked, completed, best_time, best_moves, best_grade, attempts) 
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (user_id, level_id, is_unlocked, is_completed, best_time, best_moves, best_grade, attempts)
        )
    else:
        attempts = (existing['attempts'] or 0) + 1
        is_completed = existing['completed'] or completed
        is_unlocked = existing['unlocked'] or True

        # Best Time Rule: LOWER is better
        old_time = existing.get('best_time')
        if completed:
            if old_time is None or (time_spent is not None and time_spent < old_time):
                best_time = time_spent
            else:
                best_time = old_time
        else:
            best_time = old_time

        # Best Moves Rule: LOWER is better
        old_moves = existing.get('best_moves')
        if completed:
            if old_moves is None or (moves is not None and moves < old_moves):
                best_moves = moves
            else:
                best_moves = old_moves
        else:
            best_moves = old_moves

        # Best Grade Rule
        best_grade = get_better_grade(existing.get('best_grade'), grade) if completed else existing.get('best_grade')

        execute_db(
            """UPDATE level_progress 
               SET completed = %s, unlocked = %s, best_time = %s, best_moves = %s, best_grade = %s, attempts = %s 
               WHERE user_id = %s AND level_id = %s""",
            (is_completed, is_unlocked, best_time, best_moves, best_grade, attempts, user_id, level_id)
        )

    # Auto Level Unlock: Completing Level N unlocks Level N+1
    next_unlocked = False
    if completed and level_id < 20:
        next_level_id = level_id + 1
        next_existing = query_db(
            "SELECT * FROM level_progress WHERE user_id = %s AND level_id = %s",
            (user_id, next_level_id),
            one=True
        )
        if not next_existing:
            execute_db(
                "INSERT INTO level_progress (user_id, level_id, unlocked, completed) VALUES (%s, %s, TRUE, FALSE)",
                (user_id, next_level_id)
            )
        else:
            execute_db(
                "UPDATE level_progress SET unlocked = TRUE WHERE user_id = %s AND level_id = %s",
                (user_id, next_level_id)
            )
        next_unlocked = True

        # Update User level_rank title
        rank_name = f"Realm {str(next_level_id).zfill(2)}"
        execute_db("UPDATE users SET level_rank = %s WHERE id = %s", (rank_name, user_id))

    return jsonify({
        'success': True,
        'message': f'Level {level_id} progress recorded successfully.',
        'data': {
            'levelId': level_id,
            'completed': completed,
            'nextLevelUnlocked': next_unlocked
        }
    })

@progress_bp.route('/challenge', methods=['POST'])
def record_challenge_progress():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized session.'}), 401

    data = request.get_json() or {}
    challenge_id = data.get('challengeId')
    if not challenge_id:
        return jsonify({'success': False, 'message': 'challengeId is required.'}), 400

    completed = bool(data.get('completed', False))
    score = data.get('score') or ('S' if completed else None)

    existing = query_db(
        "SELECT * FROM challenge_progress WHERE user_id = %s AND challenge_id = %s",
        (user_id, str(challenge_id)),
        one=True
    )

    if not existing:
        attempts = 1
        best_score = score if completed else None
        execute_db(
            """INSERT INTO challenge_progress (user_id, challenge_id, completed, attempts, best_score) 
               VALUES (%s, %s, %s, %s, %s)""",
            (user_id, str(challenge_id), completed, attempts, best_score)
        )
    else:
        attempts = (existing['attempts'] or 0) + 1
        is_completed = existing['completed'] or completed
        best_score = get_better_grade(existing.get('best_score'), score) if completed else existing.get('best_score')
        execute_db(
            """UPDATE challenge_progress 
               SET completed = %s, attempts = %s, best_score = %s 
               WHERE user_id = %s AND challenge_id = %s""",
            (is_completed, attempts, best_score, user_id, str(challenge_id))
        )

    return jsonify({
        'success': True,
        'message': f'Challenge {challenge_id} progress recorded successfully.'
    })

@progress_bp.route('/reset', methods=['POST'])
def reset_progress():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized session.'}), 401

    # Delete all progress records for current user
    execute_db("DELETE FROM level_progress WHERE user_id = %s", (user_id,))
    execute_db("DELETE FROM challenge_progress WHERE user_id = %s", (user_id,))

    # Re-insert Level 01 as unlocked
    execute_db(
        "INSERT INTO level_progress (user_id, level_id, unlocked, completed) VALUES (%s, 1, TRUE, FALSE)",
        (user_id,)
    )

    # Reset user title and level rank
    execute_db("UPDATE users SET title = 'Novice Navigator', level_rank = 'Realm 01' WHERE id = %s", (user_id,))

    return jsonify({
        'success': True,
        'message': 'Player progression reset successfully.'
    })

@progress_bp.route('/sync', methods=['POST'])
def sync_local_progress():
    """Migrates and merges local localStorage progression into MySQL on initial login."""
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized session.'}), 401

    data = request.get_json() or {}
    local_levels = data.get('levels') or {}
    local_challenges = data.get('challenges') or {}

    # Merge local levels
    for lvl_str, val in local_levels.items():
        try:
            lvl_id = int(lvl_str)
        except ValueError:
            continue

        if lvl_id < 1 or lvl_id > 20:
            continue

        if not isinstance(val, dict):
            continue

        is_unlocked = bool(val.get('unlocked', lvl_id == 1))
        is_completed = bool(val.get('completed', False))
        t_time = val.get('bestTime')
        t_moves = val.get('bestMoves')
        t_grade = val.get('bestGrade')
        t_attempts = val.get('attempts', 0)

        existing = query_db(
            "SELECT * FROM level_progress WHERE user_id = %s AND level_id = %s",
            (user_id, lvl_id),
            one=True
        )

        if not existing:
            execute_db(
                """INSERT INTO level_progress 
                   (user_id, level_id, unlocked, completed, best_time, best_moves, best_grade, attempts) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (user_id, lvl_id, is_unlocked, is_completed, t_time, t_moves, t_grade, t_attempts)
            )
        else:
            merged_unlocked = existing['unlocked'] or is_unlocked
            merged_completed = existing['completed'] or is_completed
            merged_attempts = max(existing['attempts'] or 0, t_attempts)

            # Best time merge
            e_time = existing.get('best_time')
            if e_time is None:
                merged_time = t_time
            elif t_time is None:
                merged_time = e_time
            else:
                merged_time = min(e_time, t_time)

            # Best moves merge
            e_moves = existing.get('best_moves')
            if e_moves is None:
                merged_moves = t_moves
            elif t_moves is None:
                merged_moves = e_moves
            else:
                merged_moves = min(e_moves, t_moves)

            merged_grade = get_better_grade(existing.get('best_grade'), t_grade)

            execute_db(
                """UPDATE level_progress 
                   SET unlocked = %s, completed = %s, best_time = %s, best_moves = %s, best_grade = %s, attempts = %s 
                   WHERE user_id = %s AND level_id = %s""",
                (merged_unlocked, merged_completed, merged_time, merged_moves, merged_grade, merged_attempts, user_id, lvl_id)
            )

    # Merge local challenges
    for ch_id, val in local_challenges.items():
        if not isinstance(val, dict):
            continue

        is_completed = bool(val.get('completed', False))
        t_attempts = val.get('attempts', 0)
        t_score = val.get('bestScore')

        existing = query_db(
            "SELECT * FROM challenge_progress WHERE user_id = %s AND challenge_id = %s",
            (user_id, str(ch_id)),
            one=True
        )

        if not existing:
            execute_db(
                """INSERT INTO challenge_progress (user_id, challenge_id, completed, attempts, best_score) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (user_id, str(ch_id), is_completed, t_attempts, t_score)
            )
        else:
            merged_completed = existing['completed'] or is_completed
            merged_attempts = max(existing['attempts'] or 0, t_attempts)
            merged_score = get_better_grade(existing.get('best_score'), t_score)
            execute_db(
                """UPDATE challenge_progress SET completed = %s, attempts = %s, best_score = %s WHERE user_id = %s AND challenge_id = %s""",
                (merged_completed, merged_attempts, merged_score, user_id, str(ch_id))
            )

    return jsonify({
        'success': True,
        'message': 'Local progression merged successfully with backend database.'
    })
