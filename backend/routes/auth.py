from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from backend.db import query_db, execute_db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not username or len(username) < 3:
        return jsonify({'success': False, 'message': 'Username must be at least 3 characters long.'}), 400
    if not email or '@' not in email:
        return jsonify({'success': False, 'message': 'Please provide a valid email address.'}), 400
    if not password or len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long.'}), 400

    # Check for existing user by username or email
    existing_user = query_db(
        "SELECT id, username, email FROM users WHERE username = %s OR email = %s",
        (username, email),
        one=True
    )
    if existing_user:
        if existing_user['username'].lower() == username.lower():
            return jsonify({'success': False, 'message': 'An account with this username already exists.'}), 400
        return jsonify({'success': False, 'message': 'An account with this email address already exists.'}), 400

    # Hash password securely
    password_hash = generate_password_hash(password, method='pbkdf2:sha256')

    # Insert user into database
    user_id = execute_db(
        "INSERT INTO users (username, email, password_hash, title, level_rank, avatar) VALUES (%s, %s, %s, %s, %s, %s)",
        (username, email, password_hash, 'Novice Navigator', 'Realm 01', '✦')
    )

    # Initialize Level 01 as unlocked
    execute_db(
        "INSERT INTO level_progress (user_id, level_id, unlocked, completed) VALUES (%s, 1, TRUE, FALSE)",
        (user_id,)
    )

    # Store user in Flask session
    session['user_id'] = user_id

    user_data = {
        'id': user_id,
        'name': username,
        'email': email,
        'title': 'Novice Navigator',
        'level': 'Realm 01',
        'avatar': '✦'
    }

    return jsonify({
        'success': True,
        'message': 'Account created successfully!',
        'data': {'user': user_data}
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = (data.get('identifier') or data.get('username') or data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not identifier or not password:
        return jsonify({'success': False, 'message': 'Please provide both username/email and password.'}), 400

    # Query user by username or email
    user = query_db(
        "SELECT * FROM users WHERE LOWER(username) = %s OR LOWER(email) = %s",
        (identifier, identifier),
        one=True
    )

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'success': False, 'message': 'Invalid username/email or password.'}), 401

    # Store authenticated user in session
    session['user_id'] = user['id']

    user_data = {
        'id': user['id'],
        'name': user['username'],
        'email': user['email'],
        'title': user.get('title', 'Novice Navigator'),
        'level': user.get('level_rank', 'Realm 01'),
        'avatar': user.get('avatar', '✦')
    }

    return jsonify({
        'success': True,
        'message': 'Logged in successfully!',
        'data': {'user': user_data}
    })


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({
        'success': True,
        'message': 'Logged out successfully.'
    })


@auth_bp.route('/session', methods=['GET'])
def get_session():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({
            'success': False,
            'message': 'No active session found.'
        }), 401

    user = query_db(
        "SELECT id, username, email, title, level_rank, avatar FROM users WHERE id = %s",
        (user_id,),
        one=True
    )

    if not user:
        session.clear()
        return jsonify({
            'success': False,
            'message': 'User record no longer exists.'
        }), 401

    user_data = {
        'id': user['id'],
        'name': user['username'],
        'email': user['email'],
        'title': user.get('title', 'Novice Navigator'),
        'level': user.get('level_rank', 'Realm 01'),
        'avatar': user.get('avatar', '✦')
    }

    return jsonify({
        'success': True,
        'data': {'user': user_data}
    })
