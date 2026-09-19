import os
import sys

# Add project root to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.db import init_db

def main():
    print("Initializing SmartMaze SQL Database...")
    try:
        init_db()
        print("Initialization complete!")
    except Exception as e:
        print(f"Database initialization error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
