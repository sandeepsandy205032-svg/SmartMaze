from flask import Blueprint, request, jsonify, session
from backend.db import query_db, execute_db

profile_bp = Blueprint('profile', __name__)

def get_authenticated_user_id():
    return session.get('user_id')

@profile_bp.route('', methods=['GET'])
def get_profile():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized session.'}), 401

    user = query_db(
        "SELECT id, username, email, title, level_rank, avatar, created_at FROM users WHERE id = %s",
        (user_id,),
        one=True
    )
    if not user:
        return jsonify({'success': False, 'message': 'User not found.'}), 404

    # Fetch level progress rows
    level_rows = query_db(
        "SELECT * FROM level_progress WHERE user_id = %s",
        (user_id,)
    )

    # Fetch challenge progress rows
    challenge_rows = query_db(
        "SELECT * FROM challenge_progress WHERE user_id = %s",
        (user_id,)
    )

    # Calculate derived stats
    completed_levels = [r for r in level_rows if r.get('completed')]
    completed_challenges = [r for r in challenge_rows if r.get('completed')]
    
    levels_completed_count = len(completed_levels)
    challenges_completed_count = len(completed_challenges)
    
    # 20 Levels + 6 Challenges = 26 items
    completion_percentage = round(((levels_completed_count + challenges_completed_count) / 26.0) * 100)
    
    total_moves = sum(r.get('best_moves') or 0 for r in completed_levels)
    total_time = sum(r.get('best_time') or 0 for r in completed_levels)
    total_attempts = sum(r.get('attempts') or 0 for r in level_rows) + sum(r.get('attempts') or 0 for r in challenge_rows)

    fastest_level = None
    if completed_levels:
        valid_times = [r for r in completed_levels if r.get('best_time') is not None]
        if valid_times:
            fastest_row = min(valid_times, key=lambda x: x['best_time'])
            fastest_level = {'id': fastest_row['level_id'], 'time': fastest_row['best_time']}

    fewest_moves_level = None
    if completed_levels:
        valid_moves = [r for r in completed_levels if r.get('best_moves') is not None]
        if valid_moves:
            fewest_row = min(valid_moves, key=lambda x: x['best_moves'])
            fewest_moves_level = {'id': fewest_row['level_id'], 'moves': fewest_row['best_moves']}

    user_profile = {
        'name': user['username'],
        'email': user['email'],
        'title': user.get('title', 'Novice Navigator'),
        'level': user.get('level_rank', 'Realm 01'),
        'avatar': user.get('avatar', '✦'),
        'createdAt': str(user.get('created_at', ''))
    }

    derived_stats = {
        'levelsCompleted': levels_completed_count,
        'challengesCompleted': challenges_completed_count,
        'completionPercentage': completion_percentage,
        'totalMoves': total_moves,
        'totalPlayTime': total_time,
        'totalAttempts': total_attempts,
        'fastestLevel': fastest_level,
        'fewestMovesLevel': fewest_moves_level,
        'highestGrade': 'S' if levels_completed_count >= 15 else ('A' if levels_completed_count >= 5 else 'B')
    }

    return jsonify({
        'success': True,
        'data': {
            'userProfile': user_profile,
            'derivedStats': derived_stats
        }
    })

@profile_bp.route('', methods=['PUT'])
def update_profile():
    user_id = get_authenticated_user_id()
    if not user_id:
        return jsonify({'success': False, 'message': 'Unauthorized session.'}), 401

    data = request.get_json() or {}
    title = data.get('title')
    avatar = data.get('avatar')

    if title:
        execute_db("UPDATE users SET title = %s WHERE id = %s", (title, user_id))
    if avatar:
        execute_db("UPDATE users SET avatar = %s WHERE id = %s", (avatar, user_id))

    user = query_db(
        "SELECT id, username, email, title, level_rank, avatar FROM users WHERE id = %s",
        (user_id,),
        one=True
    )

    user_profile = {
        'name': user['username'],
        'email': user['email'],
        'title': user.get('title', 'Novice Navigator'),
        'level': user.get('level_rank', 'Realm 01'),
        'avatar': user.get('avatar', '✦')
    }

    return jsonify({
        'success': True,
        'message': 'Profile updated successfully.',
        'data': {'userProfile': user_profile}
    })
