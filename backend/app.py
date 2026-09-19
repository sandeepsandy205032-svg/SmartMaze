import os
import sys

# Ensure root directory is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask, jsonify
from flask_cors import CORS
from backend.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for Vite frontend with credential support (cookies)
    CORS(
        app,
        supports_credentials=True,
        origins=[Config.CORS_ORIGIN, "http://127.0.0.1:5173", "http://localhost:5173"]
    )

    # Ensure database schema is initialized
    from backend.db import init_db
    try:
        init_db()
    except Exception as err:
        print(f"Warning: automatic database initialization error: {err}")

    # Import and register REST API Blueprints
    from backend.routes.auth import auth_bp
    from backend.routes.profile import profile_bp
    from backend.routes.progress import progress_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')
    app.register_blueprint(progress_bp, url_prefix='/api/progress')

    @app.route('/', methods=['GET'])
    def index():
        return jsonify({
            'success': True,
            'message': 'SmartMaze Flask REST API backend server is operational',
            'endpoints': {
                'health': '/api/health',
                'auth': '/api/auth',
                'profile': '/api/profile',
                'progress': '/api/progress'
            }
        }), 200

    @app.route('/favicon.ico', methods=['GET'])
    def favicon():
        return '', 204

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'success': True,
            'message': 'SmartMaze Flask REST API is operational',
            'environment': Config.SECRET_KEY[:8] + '...'
        })

    # Global Error Handlers
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'success': False, 'message': str(e.description or 'Bad Request')}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'success': False, 'message': 'Unauthorized session. Please log in.'}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'success': False, 'message': 'Resource not found.'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'success': False, 'message': 'Internal server error.'}), 500

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"Starting SmartMaze Flask Server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=True)
