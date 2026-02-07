"""Gemini LLM client for decision adjudication and case generation."""
import json
import os
from typing import Any, Optional

# Load .env file to read GEMINI_API_KEY
from dotenv import load_dotenv
load_dotenv()

# Optional: use google-generativeai if available
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

from models import (
    EvidenceItem,
    HypothesisItem,
    LLMCaseOutput,
    LLMDecisionOutput,
    RecommendationItem,
    TimelineEvent,
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

def _get_model():
    if not GEMINI_AVAILABLE or not GEMINI_API_KEY:
        return None
    genai.configure(api_key=GEMINI_API_KEY)
    return genai.GenerativeModel(GEMINI_MODEL)


def adjudicate_decision(
    transaction: dict,
    signals: list[dict],
    risk_score_base: int,
    candidate: str,
) -> Optional[LLMDecisionOutput]:
    """
    Call LLM to produce final decision with rationale.
    Hard policy: LLM cannot turn a block_candidate into approve.
    Returns None if LLM unavailable or parse fails (caller should use fallback).
    """
    model = _get_model()
    if not model:
        print("⚠️  LLM not available (API key missing or library not installed)")
        return None

    # Build prompt with hard rules
    block_rule = (
        "CRITICAL: This transaction is a block_candidate (risk_score_base >= 80). "
        "You MUST return decision: \"block\". Do not approve or review."
    )
    prompt = f"""You are a fraud risk adjudicator. Given a transaction and risk signals, output ONLY valid JSON.

Transaction: {json.dumps(transaction, default=str)}
Risk signals (fired): {json.dumps([s for s in signals if s.get("fired")], default=str)}
Base risk score (0-100): {risk_score_base}
Pre-LLM candidate: {candidate}

Rules:
- If candidate is block_candidate, you MUST set "decision": "block". Never approve a block_candidate.
- If candidate is review_candidate, you may output "review" or "block", never "approve".
- If candidate is approve_candidate, you may output "approve", "review", or "block".
- risk_score must be 0-100.
- rationale: short, factual explanation.
- top_signals: list of 2-4 signal names that most influenced the decision.
- confidence: "low" | "medium" | "high"

Output ONLY this JSON, no markdown or extra text:
{{"decision": "approve"|"review"|"block", "risk_score": 0-100, "rationale": "...", "top_signals": ["...", "..."], "confidence": "low"|"medium"|"high"}}
"""
    if candidate == "block_candidate":
        prompt += "\n" + block_rule + "\n"

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        # Strip markdown code block if present
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1]) if lines[0].strip() == "```json" else "\n".join(lines[1:-1])
        data = json.loads(text)
        print(f"✅ LLM adjudication successful for tx {transaction.get('transaction_id', 'unknown')}")
        return LLMDecisionOutput(
            decision=data.get("decision", "review"),
            risk_score=max(0, min(100, int(data.get("risk_score", risk_score_base)))),
            rationale=data.get("rationale", ""),
            top_signals=data.get("top_signals", []),
            confidence=data.get("confidence", "medium"),
        )
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "quota" in error_msg.lower():
            print(f"⚠️  LLM quota exceeded - using deterministic fallback (tx: {transaction.get('transaction_id', 'unknown')})")
        elif "401" in error_msg or "403" in error_msg:
            print(f"⚠️  LLM authentication error - check API key (tx: {transaction.get('transaction_id', 'unknown')})")
        else:
            print(f"⚠️  LLM error: {e} - using deterministic fallback")
        return None


def generate_case_pack(
    transaction: dict,
    user_transactions: list[dict],
    linked_context: list[dict],
    signals: list[dict],
    decision: dict,
) -> Optional[LLMCaseOutput]:
    """
    Ask LLM to generate hypotheses, evidence, timeline, recommendations.
    linked_context: transactions from linked accounts (same ip_hash or device_id).
    """
    model = _get_model()
    if not model:
        return None

    prompt = f"""You are a fraud investigator. Generate an investigation case pack as JSON.

Primary transaction: {json.dumps(transaction, default=str)}
User's last transactions (up to 50): {json.dumps(user_transactions[-50:], default=str)}
Linked accounts context (same IP/device): {json.dumps(linked_context[:30], default=str)}
Risk signals: {json.dumps(signals, default=str)}
Decision summary: {json.dumps(decision, default=str)}

Output ONLY valid JSON with this exact structure (no markdown):
{{
  "confidence": "low"|"medium"|"high",
  "hypotheses": [{{"title": "...", "why": "..."}}, ...],
  "evidence": [{{"item": "...", "transaction_ids": ["id1", "id2"]}}, ...],
  "timeline": [{{"timestamp": "...", "event": "..."}}, ...],
  "recommendations": [{{"action": "...", "reason": "..."}}, ...],
  "investigation_suggestions": ["...", "..."]
}}

- hypotheses: 3-5 bullets (title + why).
- evidence: bullet list referencing transaction ids and relationships.
- timeline: key events ordered by timestamp (deposits, withdrawals, device/geo changes).
- recommendations: concrete actions (e.g. hold funds, request KYC, block).
- investigation_suggestions: e.g. check shared IP/device, payment methods.
"""
    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1])
        data = json.loads(text)
        print(f"✅ LLM case generation successful for tx {transaction.get('transaction_id', 'unknown')}")
        return LLMCaseOutput(
            confidence=data.get("confidence", "medium"),
            hypotheses=[HypothesisItem(**h) for h in data.get("hypotheses", []) if isinstance(h, dict)],
            evidence=[EvidenceItem(**e) for e in data.get("evidence", []) if isinstance(e, dict)],
            timeline=[TimelineEvent(**t) for t in data.get("timeline", []) if isinstance(t, dict)],
            recommendations=[RecommendationItem(**r) for r in data.get("recommendations", []) if isinstance(r, dict)],
            investigation_suggestions=data.get("investigation_suggestions", []),
        )
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "quota" in error_msg.lower():
            print(f"⚠️  LLM quota exceeded for case generation - using fallback")
        else:
            print(f"⚠️  LLM case generation error: {e}")
        return None
