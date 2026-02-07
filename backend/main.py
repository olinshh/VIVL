"""FraudOps Copilot API - FastAPI backend."""
from dotenv import load_dotenv

# Load .env file before other imports (so llm_client.py can read GEMINI_API_KEY)
load_dotenv()

import uuid
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from audit_service import append as audit_append, get_recent as audit_get_recent
from case_service import apply_action, get_case, list_cases
from db import get_cursor, init_db
from decision_service import run_decision
from models import (
    CaseActionRequest,
    IngestResponse,
    RiskDecision,
    SeedResponse,
    TransactionCreate,
)
from seed import get_seed_queue, run_seed

app = FastAPI(title="FraudOps Copilot API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Server-side simulation queue: list of transaction dicts to emit
_simulation_queue: list[dict] = []


def _refill_simulation_queue():
    global _simulation_queue
    if not _simulation_queue:
        _simulation_queue[:] = get_seed_queue()


@app.on_event("startup")
def startup():
    init_db()


# --- Seed ---
@app.post("/transactions/seed", response_model=SeedResponse)
def post_seed():
    """Generate synthetic dataset (normal + suspicious)."""
    result = run_seed()
    return SeedResponse(
        transactions_created=result["transactions_created"],
        message=result["message"],
    )


# --- Ingest + score + case + audit ---
@app.post("/transactions/ingest", response_model=IngestResponse)
def post_ingest(transaction: TransactionCreate):
    """Store transaction, run scoring, create case if review/block, audit."""
    with get_cursor() as cur:
        cur.execute(
            """
            INSERT OR REPLACE INTO transactions
            (id, timestamp, type, amount, currency, user_id, account_age_days, country, ip_hash, device_id, psp, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                transaction.id,
                transaction.timestamp,
                transaction.type,
                transaction.amount,
                transaction.currency,
                transaction.user_id,
                transaction.account_age_days,
                transaction.country,
                transaction.ip_hash,
                transaction.device_id,
                transaction.psp,
                transaction.status,
            ),
        )
    audit_append("system", "TRANSACTION_INGESTED", {"transaction_id": transaction.id})

    tx_dict = transaction.model_dump()
    decision, case_id = run_decision(tx_dict)

    return IngestResponse(
        transaction=tx_dict,
        decision=decision,
        case_id=case_id,
    )


# --- Next (simulation: pop from queue, new id) ---
@app.get("/transactions/next")
def get_next_transaction():
    """Return next transaction for simulation (new id). Call ingest with result to process."""
    _refill_simulation_queue()
    if not _simulation_queue:
        return None
    # Pop one and assign new id so ingest can store as new event
    tx = _simulation_queue.pop(0)
    tx = dict(tx)
    tx["id"] = str(uuid.uuid4())
    return tx


# --- Recent transactions + decision ---
@app.get("/transactions/recent")
def get_recent_transactions(limit: int = 50):
    """Most recent transactions with joined decision."""
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT t.id, t.timestamp, t.type, t.amount, t.currency, t.user_id, t.account_age_days,
                   t.country, t.ip_hash, t.device_id, t.psp, t.status,
                   r.id as decision_id, r.risk_score, r.decision as risk_decision_text,
                   r.llm_rationale, r.created_at as decision_at,
                   c.case_id
            FROM transactions t
            LEFT JOIN risk_decisions r ON r.transaction_id = t.id
            LEFT JOIN cases c ON c.primary_transaction_id = t.id
            ORDER BY t.timestamp DESC, r.created_at DESC
            LIMIT ?
            """,
            (limit * 10,),
        )
        rows = cur.fetchall()
    # Dedupe by t.id (keep latest decision), then take up to limit
    seen = set()
    deduped = []
    for r in rows:
        tid = r["id"]
        if tid not in seen:
            seen.add(tid)
            deduped.append(r)
        if len(deduped) >= limit:
            break
    rows = deduped[:limit]
    out = []
    for r in rows:
        row = dict(r)
        case_id = row.pop("case_id", None)
        dec_id = row.pop("decision_id", None)
        risk_decision = {
            "id": dec_id,
            "risk_score": row.pop("risk_score", None),
            "decision": row.pop("risk_decision_text", None),
            "llm_rationale": row.pop("llm_rationale", None),
            "created_at": row.pop("decision_at", None),
        } if dec_id else None
        row["risk_decision"] = risk_decision
        row["case_id"] = case_id
        out.append(row)
    return out


# --- Re-score ---
@app.post("/transactions/{transaction_id}/score", response_model=dict)
def post_score(transaction_id: str):
    """Re-score existing transaction; update decision; audit; return decision + case_id if new case."""
    with get_cursor() as cur:
        cur.execute("SELECT * FROM transactions WHERE id = ?", (transaction_id,))
        row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Transaction not found")
    tx_dict = dict(row)
    decision, case_id = run_decision(tx_dict)
    return {"decision": decision, "case_id": case_id}


# --- Cases ---
@app.get("/cases")
def get_cases_list():
    """List cases (case_id, primary_transaction_id, status, confidence, created_at)."""
    return list_cases()


@app.get("/cases/{case_id}")
def get_case_detail(case_id: str):
    """Full case pack + transaction + decision + audit entries."""
    case = get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    # Add relevant audit entries
    audit_events = audit_get_recent(limit=200)
    case_audit = [e for e in audit_events if e.get("payload_json") and case_id in (e.get("payload_json") or "")]
    case["audit_entries"] = case_audit[:20]
    return case


@app.post("/cases/{case_id}/action")
def post_case_action(case_id: str, body: CaseActionRequest):
    """Analyst action: approve | hold | request_kyc | block."""
    updated = apply_action(case_id, body.action.value, body.note, actor="analyst")
    if not updated:
        raise HTTPException(status_code=404, detail="Case not found")
    return updated


# --- Audit ---
@app.get("/audit")
def get_audit(limit: int = 200):
    """Latest audit events."""
    return audit_get_recent(limit=limit)
