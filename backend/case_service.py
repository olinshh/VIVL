"""Case generation (investigation pack) for review/block decisions."""
import json
import uuid
from datetime import datetime, timezone

from audit_service import append as audit_append
from db import get_cursor
from llm_client import generate_case_pack
from models import LLMCaseOutput


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _tx_to_dict(row) -> dict:
    if hasattr(row, "keys"):
        return dict(row)
    return row


def get_user_history(user_id: str, before_ts: str, limit: int = 100) -> list[dict]:
    """Fetch user transactions before given timestamp (chronological for case build)."""
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT id, timestamp, type, amount, currency, user_id, account_age_days,
                   country, ip_hash, device_id, psp, status
            FROM transactions
            WHERE user_id = ? AND timestamp < ?
            ORDER BY timestamp ASC
            LIMIT ?
            """,
            (user_id, before_ts, limit),
        )
        rows = cur.fetchall()
    return [_tx_to_dict(r) for r in rows]


def get_linked_context(transaction: dict, limit: int = 50) -> list[dict]:
    """Transactions from same ip_hash or device_id (excluding current user)."""
    ip_hash = transaction.get("ip_hash")
    device_id = transaction.get("device_id")
    user_id = transaction.get("user_id")
    if not ip_hash and not device_id:
        return []
    with get_cursor() as cur:
        conditions = []
        params = []
        if ip_hash:
            conditions.append("ip_hash = ?")
            params.append(ip_hash)
        if device_id:
            conditions.append("device_id = ?")
            params.append(device_id)
        where = " OR ".join(conditions)
        params.append(user_id)
        cur.execute(
            f"""
            SELECT id, timestamp, type, amount, currency, user_id, account_age_days,
                   country, ip_hash, device_id, psp, status
            FROM transactions
            WHERE ({where}) AND user_id != ?
            ORDER BY timestamp DESC
            LIMIT ?
            """,
            (*params, limit),
        )
        rows = cur.fetchall()
    return [_tx_to_dict(r) for r in rows]


def build_timeline_events(transaction: dict, user_txs: list[dict], linked: list[dict]) -> list[dict]:
    """Build timeline of important events (deposits, withdrawals, device/geo changes)."""
    events = []
    seen = set()
    tx_id = transaction.get("id")
    user_id = transaction.get("user_id")

    def add(ts: str, event: str, tid: str = ""):
        key = (ts, event, tid)
        if key not in seen:
            seen.add(key)
            events.append({"timestamp": ts, "event": event, "transaction_id": tid})

    # Current transaction
    add(transaction.get("timestamp", ""), f"Current: {transaction.get('type')} {transaction.get('amount')} {transaction.get('currency')}", tx_id)

    # User history: notable events
    for t in user_txs[-50:]:
        ts = t.get("timestamp", "")
        typ = t.get("type", "")
        amt = t.get("amount", 0)
        eid = t.get("id", "")
        if typ in ("deposit", "withdrawal"):
            add(ts, f"{typ} {amt}", eid)
        if t.get("device_id") and t.get("device_id") != (user_txs[-1].get("device_id") if user_txs else None):
            add(ts, "Device used", eid)
        if t.get("country"):
            add(ts, f"Country: {t.get('country')}", eid)

    # Sort by timestamp
    events.sort(key=lambda x: x["timestamp"])
    return [{"timestamp": e["timestamp"], "event": e["event"]} for e in events]


def create_case_for_decision(transaction: dict, decision, user_history: list[dict]) -> str:
    """
    Gather evidence, build timeline, call LLM for hypotheses/evidence/recommendations.
    Store case and audit. Returns case_id.
    """
    case_id = str(uuid.uuid4())
    tx_id = transaction.get("id", "")
    user_id = transaction.get("user_id", "")
    tx_ts = transaction.get("timestamp", "")

    user_txs = get_user_history(user_id, tx_ts, limit=50)
    user_txs = list(reversed(user_txs))
    linked = get_linked_context(transaction, limit=50)

    signals = []
    if decision.signals_json:
        try:
            signals = json.loads(decision.signals_json)
        except Exception:
            pass

    decision_summary = {
        "decision": decision.decision,
        "risk_score": decision.risk_score,
        "rationale": decision.llm_rationale,
    }

    llm_case = generate_case_pack(transaction, user_txs, linked, signals, decision_summary)

    if llm_case is None:
        # Fallback: minimal case without LLM
        timeline = build_timeline_events(transaction, user_txs, linked)
        confidence = "medium"
        hypotheses = [{"title": "Rule-based flags", "why": "Automated signals triggered review/block."}]
        evidence = [{"item": f"Transaction {tx_id}", "transaction_ids": [tx_id]}]
        recommendations = [{"action": "Manual review", "reason": "LLM case pack unavailable"}]
        investigation_suggestions = ["Check user history and linked accounts"]
    else:
        confidence = llm_case.confidence
        hypotheses = [h.model_dump() for h in llm_case.hypotheses]
        evidence = [e.model_dump() for e in llm_case.evidence]
        timeline = [t.model_dump() for t in llm_case.timeline]
        recommendations = [r.model_dump() for r in llm_case.recommendations]
        investigation_suggestions = llm_case.investigation_suggestions

    created_at = _now_iso()
    with get_cursor() as cur:
        cur.execute(
            """
            INSERT INTO cases (
                case_id, primary_transaction_id, status, confidence,
                hypothesis_json, evidence_json, timeline_json, recommendations_json, investigation_suggestions_json, created_at
            )
            VALUES (?, ?, 'open', ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                case_id,
                tx_id,
                confidence,
                json.dumps(hypotheses),
                json.dumps(evidence),
                json.dumps(timeline),
                json.dumps(recommendations),
                json.dumps(investigation_suggestions),
                created_at,
            ),
        )

    audit_append(
        "system",
        "CASE_CREATED",
        {
            "case_id": case_id,
            "transaction_id": tx_id,
            "confidence": confidence,
        },
    )
    return case_id


def get_case(case_id: str) -> dict | None:
    """Return full case pack + primary transaction + decision + relevant audit entries."""
    with get_cursor() as cur:
        cur.execute("SELECT * FROM cases WHERE case_id = ?", (case_id,))
        row = cur.fetchone()
    if not row:
        return None
    case = dict(row)
    tx_id = case["primary_transaction_id"]
    with get_cursor() as cur:
        cur.execute("SELECT * FROM transactions WHERE id = ?", (tx_id,))
        tx_row = cur.fetchone()
        cur.execute(
            "SELECT * FROM risk_decisions WHERE transaction_id = ? ORDER BY created_at DESC LIMIT 1",
            (tx_id,),
        )
        dec_row = cur.fetchone()
    case["transaction"] = dict(tx_row) if tx_row else None
    case["decision"] = dict(dec_row) if dec_row else None
    # Parse JSON fields
    for key in ("hypothesis_json", "evidence_json", "timeline_json", "recommendations_json", "investigation_suggestions_json"):
        if case.get(key):
            try:
                case[key.replace("_json", "")] = json.loads(case[key])
            except Exception:
                case[key.replace("_json", "")] = []
        else:
            case[key.replace("_json", "")] = [] if "json" in key else None
    return case


def list_cases() -> list[dict]:
    """List cases: case_id, primary_transaction_id, status, confidence, created_at."""
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT case_id, primary_transaction_id, status, confidence, created_at
            FROM cases
            ORDER BY created_at DESC
            """
        )
        rows = cur.fetchall()
    return [dict(r) for r in rows]


def apply_action(case_id: str, action: str, note: str | None, actor: str = "analyst") -> dict | None:
    """
    Update case status and/or transaction status; write audit.
    action: approve | hold | request_kyc | block
    """
    case = get_case(case_id)
    if not case:
        return None
    tx_id = case["primary_transaction_id"]

    new_tx_status = None
    new_case_status = case.get("status", "open")
    if action == "approve":
        new_tx_status = "approved"
        new_case_status = "closed"
    elif action == "hold":
        new_tx_status = "review"
        # case stays open
    elif action == "request_kyc":
        new_tx_status = "review"
        # case stays open
    elif action == "block":
        new_tx_status = "blocked"
        new_case_status = "closed"

    with get_cursor() as cur:
        if new_tx_status:
            cur.execute("UPDATE transactions SET status = ? WHERE id = ?", (new_tx_status, tx_id))
        cur.execute("UPDATE cases SET status = ? WHERE case_id = ?", (new_case_status, case_id))

    audit_append(
        actor,
        "CASE_ACTION",
        {"case_id": case_id, "action": action, "note": note, "transaction_id": tx_id},
    )
    return get_case(case_id)
