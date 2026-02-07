"""Synthetic transaction data: 50% normal + 50% fraudulent."""
import json
import random
import uuid
from datetime import datetime, timedelta, timezone

from db import get_cursor, init_db

CURRENCIES = ["USD", "EUR", "GBP"]
COUNTRIES = ["US", "GB", "DE", "FR", "NL", "ES", "IT", "PL", "BR", "IN", "NG"]
PSPS = ["stripe", "adyen", "braintree", "checkout", "worldpay", "square"]


def _ts(dt: datetime) -> str:
    return dt.isoformat()


def _rand_id() -> str:
    return str(uuid.uuid4())


def seed_normal_users(cursor, start_dt: datetime) -> list[dict]:
    """25 normal users with 2-3 transactions each = ~65 transactions."""
    txs = []
    for u in range(25):
        user_id = f"user_norm_{u:03d}"
        country = random.choice(COUNTRIES[:5])  # Stick to US, GB, DE, FR, NL
        device_id = f"dev_{user_id}"
        ip_hash = f"ip_{user_id}"
        psp = random.choice(PSPS[:3])  # stripe, adyen, braintree
        account_age = random.randint(60, 500)
        # 2-3 transactions per user
        n_txs = random.randint(2, 3)
        base_amt = random.uniform(100, 400)
        for i in range(n_txs):
            dt = start_dt - timedelta(hours=random.uniform(1, 72))
            t_type = random.choices(["deposit", "withdrawal"], weights=[6, 4])[0]
            amount = max(10, random.gauss(base_amt, base_amt * 0.3))
            txs.append({
                "id": _rand_id(),
                "timestamp": _ts(dt),
                "type": t_type,
                "amount": round(amount, 2),
                "currency": random.choice(CURRENCIES),
                "user_id": user_id,
                "account_age_days": account_age,
                "country": country,
                "ip_hash": ip_hash,
                "device_id": device_id,
                "psp": psp,
                "status": "pending",
            })
    return txs


def seed_fraudulent_transactions(cursor, start_dt: datetime) -> list[dict]:
    """Generate ~60 fraudulent transactions that will score 40+ and trigger review."""
    txs = []
    
    # Pattern 1: Velocity attacks (20 transactions)
    for user_num in range(5):
        user_id = f"user_fraud_vel_{user_num:02d}"
        # 1 normal deposit
        dt_dep = start_dt - timedelta(hours=random.uniform(24, 48))
        txs.append({
            "id": _rand_id(),
            "timestamp": _ts(dt_dep),
            "type": "deposit",
            "amount": round(random.uniform(200, 400), 2),
            "currency": "USD",
            "user_id": user_id,
            "account_age_days": 60,
            "country": "US",
            "ip_hash": f"ip_{user_id}_old",
            "device_id": f"dev_{user_id}_old",
            "psp": "stripe",
            "status": "pending",
        })
        
        # 3 rapid withdrawals in 15 minutes (triggers velocity signal)
        base = start_dt - timedelta(minutes=random.uniform(5, 60))
        for i in range(3):
            dt = base + timedelta(minutes=i * 5)
            txs.append({
                "id": _rand_id(),
                "timestamp": _ts(dt),
                "type": "withdrawal",
                "amount": round(random.uniform(300, 700), 2),
                "currency": "USD",
                "user_id": user_id,
                "account_age_days": 60,
                "country": random.choice(["NG", "BR", "IN"]),  # geo change
                "ip_hash": f"ip_{user_id}_new",
                "device_id": f"dev_{user_id}_new",  # new device
                "psp": "stripe",
                "status": "pending",
            })
    
    # Pattern 2: Large amount from young account (20 transactions)
    for user_num in range(10):
        user_id = f"user_fraud_young_{user_num:02d}"
        # 1 historical transaction
        dt_old = start_dt - timedelta(hours=random.uniform(72, 120))
        txs.append({
            "id": _rand_id(),
            "timestamp": _ts(dt_old),
            "type": "deposit",
            "amount": round(random.uniform(50, 200), 2),
            "currency": "USD",
            "user_id": user_id,
            "account_age_days": random.randint(1, 10),
            "country": random.choice(COUNTRIES[:3]),
            "ip_hash": f"ip_{user_id}",
            "device_id": f"dev_{user_id}",
            "psp": random.choice(PSPS[:2]),
            "status": "pending",
        })
        
        # Large suspicious transaction
        dt = start_dt - timedelta(hours=random.uniform(1, 48))
        txs.append({
            "id": _rand_id(),
            "timestamp": _ts(dt),
            "type": random.choice(["deposit", "withdrawal"]),
            "amount": round(random.uniform(1200, 5000), 2),  # large amount
            "currency": "USD",
            "user_id": user_id,
            "account_age_days": random.randint(5, 25),  # young account (<30 days)
            "country": random.choice(COUNTRIES),
            "ip_hash": f"ip_{user_id}",
            "device_id": f"dev_{user_id}",
            "psp": random.choice(PSPS),
            "status": "pending",
        })
    
    return txs


def insert_transactions(cursor, txs: list[dict]) -> None:
    for t in txs:
        cursor.execute(
            """
            INSERT OR IGNORE INTO transactions
            (id, timestamp, type, amount, currency, user_id, account_age_days, country, ip_hash, device_id, psp, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                t["id"],
                t["timestamp"],
                t["type"],
                t["amount"],
                t["currency"],
                t["user_id"],
                t.get("account_age_days"),
                t.get("country"),
                t.get("ip_hash"),
                t.get("device_id"),
                t.get("psp"),
                t.get("status", "pending"),
            ),
        )


def run_seed() -> dict:
    """Generate and insert 50% normal + 50% fraudulent transactions. Returns counts."""
    print("Initializing database...")
    init_db()
    
    # Clear all existing data before seeding
    print("Clearing existing data...")
    with get_cursor() as cur:
        cur.execute("DELETE FROM audit_log")
        cur.execute("DELETE FROM cases")
        cur.execute("DELETE FROM risk_decisions")
        cur.execute("DELETE FROM transactions")
    
    print("Generating synthetic transactions...")
    start_dt = datetime.now(timezone.utc)
    all_txs = []
    
    # Generate normal transactions (~65)
    print("  - Normal users...")
    all_txs.extend(seed_normal_users(None, start_dt))
    
    # Generate fraudulent transactions (~60)
    print("  - Fraudulent patterns...")
    all_txs.extend(seed_fraudulent_transactions(None, start_dt))
    
    # Sort by timestamp
    all_txs.sort(key=lambda t: t["timestamp"])

    print(f"\nInserting {len(all_txs)} transactions (50% normal, 50% fraudulent)...")
    with get_cursor() as cur:
        insert_transactions(cur, all_txs)
    
    print(f"✅ Seed completed: {len(all_txs)} transactions created")
    print(f"  ~50% should be approved, ~50% should trigger review/block")
    return {"transactions_created": len(all_txs), "message": "Seed completed."}


def get_seed_queue() -> list[dict]:
    """Return transactions for simulation queue."""
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT id, timestamp, type, amount, currency, user_id, account_age_days, country, ip_hash, device_id, psp, status
            FROM transactions
            ORDER BY RANDOM()
            LIMIT 100
            """
        )
        rows = cur.fetchall()
    return [dict(r) for r in rows]


if __name__ == "__main__":
    result = run_seed()
    print(f"\n{result['message']}")

