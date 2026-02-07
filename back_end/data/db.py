# template for the database

"""SQLite database"""
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DATABASE_PATH = os.getenv("DATABASE_PATH", "./fraudops.db")
#gets database path from env, if not specified, creates fraudops.db

def get_connection():
    """Return connection to SQLite database."""
    Path(DATABASE_PATH).parent.mkdir(parents=True, exist_ok=True)
    return sqlite3.connect(DATABASE_PATH, check_same_thread=False)


def init_db():
    """Create all tables if they do not exist."""
    conn = get_connection()
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                transaction_id TEXT UNIQUE NOT NULL,
                timestamp TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT NOT NULL,
                user_id TEXT NOT NULL,
                user_email TEXT,
                user_name TEXT,
                device_id TEXT,
                device_type TEXT,
                ip_address TEXT,
                status TEXT DEFAULT 'pending',
                merchant_id TEXT,
                merchant_name TEXT,
                location TEXT,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS risk_decisions (
                id TEXT PRIMARY KEY,
                transaction_id TEXT NOT NULL,
                risk_score REAL NOT NULL,
                risk_level TEXT NOT NULL,
                decision TEXT NOT NULL,
                reason TEXT,
                signals_json TEXT,
                model_version TEXT,
                llm_rationale TEXT,
                timestamp TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
            );

            CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY,
                case_id TEXT UNIQUE NOT NULL,
                transaction_id TEXT,
                status TEXT NOT NULL DEFAULT 'open',
                priority TEXT NOT NULL DEFAULT 'medium',
                confidence TEXT,
                hypothesis TEXT,
                hypothesis_json TEXT,
                evidence TEXT,
                evidence_json TEXT,
                timeline_json TEXT,
                recommendations_json TEXT,
                investigation_suggestions_json TEXT,
                assigned_to TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                resolution TEXT,
                FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
            );

            CREATE TABLE IF NOT EXISTS audit_log (
                id TEXT PRIMARY KEY,
                event_id TEXT UNIQUE NOT NULL,
                event_type TEXT NOT NULL,
                actor TEXT NOT NULL,
                action TEXT NOT NULL,
                resource_type TEXT,
                resource_id TEXT,
                details TEXT,
                payload_json TEXT,
                timestamp TEXT NOT NULL,
                created_at TEXT NOT NULL,
                ip_address TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
            CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
            CREATE INDEX IF NOT EXISTS idx_risk_decisions_transaction_id ON risk_decisions(transaction_id);
            CREATE INDEX IF NOT EXISTS idx_risk_decisions_risk_level ON risk_decisions(risk_level);
            CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
            CREATE INDEX IF NOT EXISTS idx_cases_transaction_id ON cases(transaction_id);
            CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
            CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
            CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor);
        """)
        conn.commit()
    finally:
        conn.close()


@contextmanager
def get_cursor():
    """Context manager for database cursor with row factory."""
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    try:
        yield conn.cursor()
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
