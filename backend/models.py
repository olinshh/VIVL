"""Pydantic models and types for FraudOps Copilot API."""
from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field


# --- Enums ---
class TransactionType(str, Enum):
    deposit = "deposit"
    withdrawal = "withdrawal"
    trade = "trade"
    transfer = "transfer"


class DecisionType(str, Enum):
    approve = "approve"
    review = "review"
    block = "block"


class CaseStatus(str, Enum):
    open = "open"
    closed = "closed"


class ConfidenceLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class CaseAction(str, Enum):
    approve = "approve"
    hold = "hold"
    request_kyc = "request_kyc"
    block = "block"


# --- Transaction ---
class TransactionCreate(BaseModel):
    id: str
    timestamp: str  # ISO
    type: str
    amount: float
    currency: str = "USD"
    user_id: str
    account_age_days: Optional[int] = None
    country: Optional[str] = None
    ip_hash: Optional[str] = None
    device_id: Optional[str] = None
    psp: Optional[str] = None
    status: str = "pending"


class Transaction(TransactionCreate):
    pass


# --- Risk / Decision ---
class Signal(BaseModel):
    name: str
    value: Any
    threshold: Any
    weight: int
    fired: bool
    explanation: str


class RiskDecision(BaseModel):
    id: str
    transaction_id: str
    risk_score: int
    decision: str
    signals_json: Optional[str] = None
    llm_rationale: Optional[str] = None
    created_at: str


class LLMDecisionOutput(BaseModel):
    decision: str  # approve | review | block
    risk_score: int
    rationale: str
    top_signals: list[str]
    confidence: str  # low | medium | high


# --- Case ---
class HypothesisItem(BaseModel):
    title: str
    why: str


class EvidenceItem(BaseModel):
    item: str
    transaction_ids: list[str] = []


class TimelineEvent(BaseModel):
    timestamp: str
    event: str


class RecommendationItem(BaseModel):
    action: str
    reason: str


class LLMCaseOutput(BaseModel):
    confidence: str
    hypotheses: list[HypothesisItem]
    evidence: list[EvidenceItem]
    timeline: list[TimelineEvent]
    recommendations: list[RecommendationItem]
    investigation_suggestions: list[str]


class CaseActionRequest(BaseModel):
    action: CaseAction
    note: Optional[str] = None


# --- Audit ---
class AuditEvent(BaseModel):
    event_id: str
    actor: str
    event_type: str
    payload_json: Optional[str] = None
    created_at: str


# --- API responses ---
class SeedResponse(BaseModel):
    transactions_created: int
    message: str


class IngestResponse(BaseModel):
    transaction: dict
    decision: RiskDecision
    case_id: Optional[str] = None


class ScoreResponse(BaseModel):
    decision: RiskDecision
    case_id: Optional[str] = None
