"""Orchestrates risk scoring (deterministic + LLM) and decision persistence."""
import json
import uuid
from datetime import datetime, timezone

from audit_service import append as audit_append
from case_service import create_case_for_decision
from db import get_cursor
from llm_client import adjudicate_decision
from models import RiskDecision
from risk_engine import compute_signals, risk_score_and_candidate


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _tx_to_dict(row) -> dict:
    if hasattr(row, "keys"):
        return dict(row)
    return row


def get_user_history(user_id: str, before_ts: str, limit: int = 100) -> list[dict]:
    """Fetch user transactions before given timestamp, ordered by timestamp desc (so recent first)."""
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT id, timestamp, type, amount, currency, user_id, account_age_days,
                   country, ip_hash, device_id, psp, status
            FROM transactions
            WHERE user_id = ? AND timestamp < ?
            ORDER BY timestamp DESC
            LIMIT ?
            """,
            (user_id, before_ts, limit),
        )
        rows = cur.fetchall()
    return [_tx_to_dict(r) for r in rows]


def run_decision(transaction: dict) -> tuple[RiskDecision, str | None]:
    """
    Run full pipeline: signals -> base score -> LLM adjudication -> persist decision.
    If decision is review or block, create case and return case_id.
    Returns (RiskDecision, case_id or None).
    """
    user_id = transaction.get("user_id")
    tx_ts = transaction.get("timestamp", "")
    user_history = get_user_history(user_id, tx_ts, limit=100)
    # For risk_engine we need chronological order (oldest first)
    user_history = list(reversed(user_history))

    signals = compute_signals(transaction, user_history)
    risk_score_base, candidate = risk_score_and_candidate(signals)

    # LLM adjudication with guardrails
    llm_out = adjudicate_decision(transaction, signals, risk_score_base, candidate)
    if llm_out is None:
        # Fallback: use deterministic decision, confidence medium
        if candidate == "block_candidate":
            decision_str = "block"
        elif candidate == "review_candidate":
            decision_str = "review"
        else:
            decision_str = "approve"
        risk_score_final = risk_score_base
        rationale = "LLM unavailable; using rule-based decision. " + "; ".join(
            s.get("explanation", "") for s in signals if s.get("fired")
        )
        top_signals = [s["name"] for s in signals if s.get("fired")]
        confidence = "medium"
    else:
        decision_str = llm_out.decision
        # Hard policy: cannot turn block_candidate into approve
        if candidate == "block_candidate" and llm_out.decision == "approve":
            decision_str = "block"
        risk_score_final = llm_out.risk_score
        rationale = llm_out.rationale
        top_signals = llm_out.top_signals
        confidence = llm_out.confidence

    decision_id = str(uuid.uuid4())
    tx_id = transaction.get("id", "")
    signals_json = json.dumps(signals)
    created_at = _now_iso()

    with get_cursor() as cur:
        cur.execute(
            """
            INSERT INTO risk_decisions (id, transaction_id, risk_score, decision, signals_json, llm_rationale, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (decision_id, tx_id, risk_score_final, decision_str, signals_json, rationale, created_at),
        )
        cur.execute(
            "UPDATE transactions SET status = ? WHERE id = ?",
            (decision_str, tx_id),
        )

    audit_append(
        "system",
        "DECISION_CREATED",
        {
            "decision_id": decision_id,
            "transaction_id": tx_id,
            "decision": decision_str,
            "risk_score": risk_score_final,
            "candidate": candidate,
        },
    )

    risk_decision = RiskDecision(
        id=decision_id,
        transaction_id=tx_id,
        risk_score=risk_score_final,
        decision=decision_str,
        signals_json=signals_json,
        llm_rationale=rationale,
        created_at=created_at,
    )

    case_id = None
    if decision_str in ("review", "block"):
        case_id = create_case_for_decision(transaction, risk_decision, user_history)

    return risk_decision, case_id
