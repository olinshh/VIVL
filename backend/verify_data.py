import sqlite3

conn = sqlite3.connect('fraudops.db')
cur = conn.cursor()

cur.execute('SELECT COUNT(*) FROM transactions')
print(f'✅ Total transactions: {cur.fetchone()[0]}')

cur.execute('SELECT user_id, type, amount FROM transactions LIMIT 5')
print('\nSample transactions:')
for row in cur.fetchall():
    print(f'  {row[0]}: {row[1]} ${row[2]}')

# Check for suspicious patterns
cur.execute("SELECT COUNT(DISTINCT user_id) FROM transactions WHERE user_id LIKE 'user_vel_%'")
print(f'\nSuspicious velocity users: {cur.fetchone()[0]}')

cur.execute("SELECT COUNT(DISTINCT user_id) FROM transactions WHERE user_id LIKE 'user_linked_%'")
print(f'Linked account users: {cur.fetchone()[0]}')

cur.execute("SELECT COUNT(DISTINCT user_id) FROM transactions WHERE user_id LIKE 'user_bonus_%'")
print(f'Bonus abuse users: {cur.fetchone()[0]}')

conn.close()
