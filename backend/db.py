"""SQLite database."""
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path

DATABASE_PATH = os.getenv("DATABASE_PATH", "./fraudops.db")


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
                timestamp TEXT NOT NULL,
                type TEXT NOT NULL,
                amount REAL NOT NULL,
                currency TEXT NOT NULL,
                user_id TEXT NOT NULL,
                account_age_days INTEGER,
                country TEXT,
                ip_hash TEXT,
                device_id TEXT,
                psp TEXT,
                status TEXT DEFAULT 'pending'
            );

            CREATE TABLE IF NOT EXISTS risk_decisions (
                id TEXT PRIMARY KEY,
                transaction_id TEXT NOT NULL,
                risk_score REAL NOT NULL,
                decision TEXT NOT NULL,
                signals_json TEXT,
                llm_rationale TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (transaction_id) REFERENCES transactions(id)
            );

            CREATE TABLE IF NOT EXISTS cases (
                case_id TEXT PRIMARY KEY,
                primary_transaction_id TEXT,
                status TEXT NOT NULL DEFAULT 'open',
                confidence TEXT,
                hypothesis_json TEXT,
                evidence_json TEXT,
                timeline_json TEXT,
                recommendations_json TEXT,
                investigation_suggestions_json TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (primary_transaction_id) REFERENCES transactions(id)
            );

            CREATE TABLE IF NOT EXISTS audit_log (
                event_id TEXT PRIMARY KEY,
                actor TEXT NOT NULL,
                event_type TEXT NOT NULL,
                payload_json TEXT,
                created_at TEXT NOT NULL
            );

            CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
            CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
            CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
            CREATE INDEX IF NOT EXISTS idx_risk_decisions_transaction_id ON risk_decisions(transaction_id);
            CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
            CREATE INDEX IF NOT EXISTS idx_cases_primary_transaction_id ON cases(primary_transaction_id);
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
