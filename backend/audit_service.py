"""Append-only audit log service. No deletes/updates to audit rows."""
import json
import uuid
from datetime import datetime, timezone

from db import get_cursor


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def append(actor: str, event_type: str, payload: dict) -> str:
    """Append an audit event. Returns event_id."""
    event_id = str(uuid.uuid4())
    payload_json = json.dumps(payload) if payload else None
    with get_cursor() as cur:
        cur.execute(
            """
            INSERT INTO audit_log (event_id, actor, event_type, payload_json, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (event_id, actor, event_type, payload_json, _now_iso()),
        )
    return event_id


def get_recent(limit: int = 200) -> list[dict]:
    """Return latest audit events (newest first)."""
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT event_id, actor, event_type, payload_json, created_at
            FROM audit_log
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cur.fetchall()
    return [
        {
            "event_id": r["event_id"],
            "actor": r["actor"],
            "event_type": r["event_type"],
            "payload_json": r["payload_json"],
            "created_at": r["created_at"],
        }
        for r in rows
    ]
