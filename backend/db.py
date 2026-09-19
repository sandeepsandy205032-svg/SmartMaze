import os
import sqlite3
import pymysql
import pymysql.cursors
from backend.config import Config

SQLITE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'smartmaze_db.sqlite'))

def is_mysql_available():
    try:
        conn = pymysql.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            connect_timeout=1
        )
        conn.close()
        return True
    except Exception:
        return False

def get_db_connection():
    if is_mysql_available():
        # Connect to MySQL Server
        return ('mysql', pymysql.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            database=Config.MYSQL_DATABASE,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True,
            connect_timeout=2
        ))
    else:
        # Fallback to local SQLite database
        conn = sqlite3.connect(SQLITE_PATH)
        conn.row_factory = sqlite3.Row
        return ('sqlite', conn)

def init_db():
    if is_mysql_available():
        schema_path = os.path.join(os.path.dirname(__file__), 'schema.sql')
        with open(schema_path, 'r', encoding='utf-8') as f:
            sql_content = f.read()

        conn = pymysql.connect(
            host=Config.MYSQL_HOST,
            port=Config.MYSQL_PORT,
            user=Config.MYSQL_USER,
            password=Config.MYSQL_PASSWORD,
            autocommit=True
        )
        try:
            with conn.cursor() as cursor:
                statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
                for stmt in statements:
                    cursor.execute(stmt)
            print("MySQL database 'smartmaze_db' schema initialized.")
        finally:
            conn.close()
    else:
        # Initialize SQLite database schema
        conn = sqlite3.connect(SQLITE_PATH)
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;")

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            title TEXT DEFAULT 'Novice Navigator',
            level_rank TEXT DEFAULT 'Realm 01',
            avatar TEXT DEFAULT '✦',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS level_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            level_id INTEGER NOT NULL,
            completed BOOLEAN DEFAULT 0,
            unlocked BOOLEAN DEFAULT 0,
            best_time INTEGER DEFAULT NULL,
            best_moves INTEGER DEFAULT NULL,
            best_grade TEXT DEFAULT NULL,
            attempts INTEGER DEFAULT 0,
            last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, level_id)
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS challenge_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            challenge_id TEXT NOT NULL,
            completed BOOLEAN DEFAULT 0,
            attempts INTEGER DEFAULT 0,
            best_score TEXT DEFAULT NULL,
            last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE(user_id, challenge_id)
        );
        """)

        conn.commit()
        conn.close()
        print("SQLite database 'smartmaze_db.sqlite' schema initialized.")

def query_db(sql, args=(), one=False):
    db_type, conn = get_db_connection()
    try:
        if db_type == 'mysql':
            with conn.cursor() as cursor:
                cursor.execute(sql, args)
                rv = cursor.fetchall()
                return (rv[0] if rv else None) if one else rv
        else:
            # SQLite query execution (convert %s to ?)
            sql_sqlite = sql.replace('%s', '?')
            cursor = conn.cursor()
            cursor.execute(sql_sqlite, args)
            rows = cursor.fetchall()
            dict_rows = [dict(row) for row in rows]
            return (dict_rows[0] if dict_rows else None) if one else dict_rows
    finally:
        conn.close()

def execute_db(sql, args=()):
    db_type, conn = get_db_connection()
    try:
        if db_type == 'mysql':
            with conn.cursor() as cursor:
                cursor.execute(sql, args)
                return cursor.lastrowid
        else:
            # SQLite command execution
            sql_sqlite = sql.replace('%s', '?')
            cursor = conn.cursor()
            cursor.execute(sql_sqlite, args)
            conn.commit()
            return cursor.lastrowid
    finally:
        conn.close()
