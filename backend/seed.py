"""Seed the database with sample data aligned to case_service.py."""
from datetime import datetime, timedelta
import uuid

from db import init_db, get_cursor


def seed_database():
    """Create tables and insert sample data."""
    print("Initializing database...")
    init_db()

    print("Inserting sample data...")

    with get_cursor() as cursor:
        # Sample transactions (schema aligned with db.py + case_service.py)
        transactions = [
            {
                "id": str(uuid.uuid4()),
                "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
                "type": "deposit",
                "amount": 1500.00,
                "currency": "USD",
                "user_id": "user_123",
                "account_age_days": 240,
                "country": "US",
                "ip_hash": "ip_abc123",
                "device_id": "device_abc123",
                "psp": "stripe",
                "status": "pending",
            },
            {
                "id": str(uuid.uuid4()),
                "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
                "type": "withdrawal",
                "amount": 5000.00,
                "currency": "EUR",
                "user_id": "user_456",
                "account_age_days": 30,
                "country": "UK",
                "ip_hash": "ip_xyz789",
                "device_id": "device_xyz789",
                "psp": "adyen",
                "status": "pending",
            },
            {
                "id": str(uuid.uuid4()),
                "timestamp": (datetime.now() - timedelta(minutes=30)).isoformat(),
                "type": "transfer",
                "amount": 250.50,
                "currency": "USD",
                "user_id": "user_789",
                "account_age_days": 5,
                "country": "US",
                "ip_hash": "ip_def456",
                "device_id": "device_def456",
                "psp": "paypal",
                "status": "pending",
            },
        ]

        for txn in transactions:
            cursor.execute(
                """
                INSERT INTO transactions
                (id, timestamp, type, amount, currency, user_id, account_age_days,
                 country, ip_hash, device_id, psp, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    txn["id"],
                    txn["timestamp"],
                    txn["type"],
                    txn["amount"],
                    txn["currency"],
                    txn["user_id"],
                    txn["account_age_days"],
                    txn["country"],
                    txn["ip_hash"],
                    txn["device_id"],
                    txn["psp"],
                    txn["status"],
                ),
            )

        # Sample risk decisions
        created_at = datetime.now().isoformat()
        risk_decisions = [
            {
                "id": str(uuid.uuid4()),
                "transaction_id": transactions[0]["id"],
                "risk_score": 15,
                "decision": "approve",
                "signals_json": '{"velocity": "normal", "location_match": true}',
                "llm_rationale": "Transaction amount and pattern consistent with user history",
                "created_at": created_at,
            },
            {
                "id": str(uuid.uuid4()),
                "transaction_id": transactions[1]["id"],
                "risk_score": 75,
                "decision": "review",
                "signals_json": '{"velocity": "high", "location_match": false, "amount_anomaly": true}',
                "llm_rationale": "Large transaction from new location requires manual review",
                "created_at": created_at,
            },
            {
                "id": str(uuid.uuid4()),
                "transaction_id": transactions[2]["id"],
                "risk_score": 93,
                "decision": "block",
                "signals_json": '{"velocity": "very_high", "device_mismatch": true, "vpn_detected": true}',
                "llm_rationale": "Device fingerprint mismatch and VPN usage from high-risk location",
                "created_at": created_at,
            },
        ]

        for risk in risk_decisions:
            cursor.execute(
                """
                INSERT INTO risk_decisions
                (id, transaction_id, risk_score, decision, signals_json, llm_rationale, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    risk["id"],
                    risk["transaction_id"],
                    risk["risk_score"],
                    risk["decision"],
                    risk["signals_json"],
                    risk["llm_rationale"],
                    risk["created_at"],
                ),
            )

        # Sample cases
        cases = []
        for i in range(6):
            cases.append(
                {
                    "case_id": f"CASE-2026-00{i + 1}",
                    "primary_transaction_id": transactions[i % len(transactions)]["id"],
                    "status": "open",
                    "confidence": "medium" if i % 2 == 0 else "high",
                    "hypothesis_json": '[{"title": "Potential fraud pattern", "why": "Unusual behavior detected"}]',
                    "evidence_json": '[{"item": "Signal anomalies", "transaction_ids": []}]',
                    "timeline_json": '[{"timestamp": "2026-02-07T10:00:00", "event": "Flagged activity"}]',
                    "recommendations_json": '[{"action": "Manual review", "reason": "Validate identity and intent"}]',
                    "investigation_suggestions_json": '["Check linked accounts", "Review IP/device history"]',
                    "created_at": datetime.now().isoformat(),
                }
            )

        for case in cases:
            cursor.execute(
                """
                INSERT INTO cases
                (case_id, primary_transaction_id, status, confidence, hypothesis_json,
                 evidence_json, timeline_json, recommendations_json, investigation_suggestions_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    case["case_id"],
                    case["primary_transaction_id"],
                    case["status"],
                    case["confidence"],
                    case["hypothesis_json"],
                    case["evidence_json"],
                    case["timeline_json"],
                    case["recommendations_json"],
                    case["investigation_suggestions_json"],
                    case["created_at"],
                ),
            )

        # Sample audit log
        audit_logs = [
            {
                "event_id": "EVT-001",
                "event_type": "TRANSACTION_CREATED",
                "actor": "system",
                "payload_json": '{"amount": 1500.00, "currency": "USD"}',
                "created_at": datetime.now().isoformat(),
            },
            {
                "event_id": "EVT-002",
                "event_type": "RISK_ASSESSMENT",
                "actor": "fraud_engine",
                "payload_json": '{"risk_score": 75, "decision": "review"}',
                "created_at": datetime.now().isoformat(),
            },
            {
                "event_id": "EVT-003",
                "event_type": "CASE_OPENED",
                "actor": "fraud_analyst_1",
                "payload_json": '{"confidence": "medium", "hypothesis": "account_takeover"}',
                "created_at": datetime.now().isoformat(),
            },
        ]

        for log in audit_logs:
            cursor.execute(
                """
                INSERT INTO audit_log
                (event_id, actor, event_type, payload_json, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (log["event_id"], log["actor"], log["event_type"], log["payload_json"], log["created_at"]),
            )

    print("Database seeded successfully.")
    print("   - 3 transactions")
    print("   - 3 risk decisions")
    print(f"   - {len(cases)} cases")
    print("   - 3 audit log entries")
    print("\nDatabase location: ./fraudops.db")


def run_seed():
    """Run the seed function and return result for API."""
    seed_database()
    return {
        "transactions_created": 3,
        "message": f"Database seeded successfully with {len(cases)} cases",
    }


def get_seed_queue():
    """Return a list of sample transactions for simulation queue."""
    return [
        {
            "timestamp": (datetime.now() - timedelta(minutes=i * 5)).isoformat(),
            "type": "deposit" if i % 2 == 0 else "withdrawal",
            "amount": 100.0 * (i + 1),
            "currency": "USD",
            "user_id": f"user_sim_{i}",
            "account_age_days": 7 + i,
            "country": "US",
            "ip_hash": f"ip_sim_{i}",
            "device_id": f"device_sim_{i}",
            "psp": "stripe",
            "status": "pending",
        }
        for i in range(5)
    ]


if __name__ == "__main__":
    seed_database()
