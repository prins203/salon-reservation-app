"""
Script to add slot_gap_minutes column to the services table
"""
import sqlite3
from app.models.database import SQLALCHEMY_DATABASE_URL

# Extract the SQLite database file path from the URL
db_path = SQLALCHEMY_DATABASE_URL.replace('sqlite:///', '')

print(f"Connecting to database at {db_path}")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if column already exists
    cursor.execute("PRAGMA table_info(services)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if "slot_gap_minutes" not in columns:
        print("Adding slot_gap_minutes column to services table...")
        cursor.execute("ALTER TABLE services ADD COLUMN slot_gap_minutes INTEGER DEFAULT 30")
        conn.commit()
        print("Column added successfully")
    else:
        print("Column already exists")
        
except Exception as e:
    print(f"Error: {e}")
    conn.rollback()
finally:
    conn.close()
    print("Migration completed")
