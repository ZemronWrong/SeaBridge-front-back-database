import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    try:
        cur.execute("DROP TABLE IF EXISTS inventory_materialrequest;")
        print("Dropped inventory_materialrequest table.")
    except Exception as e:
        print("Error dropping table:", e)
    
    try:
        cur.execute("DELETE FROM django_migrations WHERE app='inventory' AND name='0002_materialrequest';")
        print("Removed migration record.")
    except Exception as e:
        print("Error removing migration:", e)
        
    conn.commit()
    conn.close()
    
# also delete the physical migration file
mig_file = os.path.join(os.path.dirname(__file__), 'inventory', 'migrations', '0002_materialrequest.py')
if os.path.exists(mig_file):
    os.remove(mig_file)
    print("Deleted migration file.")
