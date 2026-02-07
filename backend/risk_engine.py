"""Deterministic risk scoring with explainable signals."""
from typing import Any

from models import Signal

# Signal definitions: (name, weight, threshold description for explanation)
SIGNAL_SPECS = [
    ("velocity_withdrawals_20m", 25, "count of withdrawals in last 20 min"),
    ("amount_vs_user_avg", 20, "ratio current amount / avg last 30 days"),
    ("new_device", 15, "first time this device_id for user"),
    ("geo_change", 20, "country differs from last known"),
    ("young_account_high_amount", 25, "account_age_days < 30 and amount > 1000"),
    ("psp_anomaly", 10, "PSP not in user's usual set"),
]

# Decision bands (pre-LLM)
BLOCK_THRESHOLD = 80
REVIEW_MIN = 40  # Lowered from 50 to catch velocity attacks
REVIEW_MAX = 79


def _get_user_history(transaction: dict, user_txs: list[dict]) -> dict:
    """Build a small context for signal computation."""
    withdrawals_20m = [
        t
        for t in user_txs
        if t.get("type") == "withdrawal"
        and _minutes_ago(t.get("timestamp", ""), transaction.get("timestamp", "")) <= 20
    ]
    last_30d = [t for t in user_txs if _days_ago(t.get("timestamp", ""), transaction.get("timestamp", "")) <= 30]
    avg_30d = sum(t.get("amount", 0) for t in last_30d) / len(last_30d) if last_30d else 0
    known_devices = {t.get("device_id") for t in user_txs if t.get("device_id")}
    last_country = user_txs[-1].get("country") if user_txs else None
    known_psps = {t.get("psp") for t in user_txs if t.get("psp")}
    return {
        "withdrawals_20m_count": len(withdrawals_20m),
        "avg_amount_30d": avg_30d,
        "known_devices": known_devices,
        "last_country": last_country,
        "known_psps": known_psps,
    }


def _minutes_ago(ts1: str, ts2: str) -> float:
    try:
        from datetime import datetime, timezone
        t1 = datetime.fromisoformat(ts1.replace("Z", "+00:00"))
        t2 = datetime.fromisoformat(ts2.replace("Z", "+00:00"))
        return abs((t2 - t1).total_seconds()) / 60
    except Exception:
        return 999


def _days_ago(ts1: str, ts2: str) -> float:
    try:
        from datetime import datetime, timezone
        t1 = datetime.fromisoformat(ts1.replace("Z", "+00:00"))
        t2 = datetime.fromisoformat(ts2.replace("Z", "+00:00"))
        return abs((t2 - t1).total_seconds()) / 86400
    except Exception:
        return 999


def compute_signals(transaction: dict, user_history: list[dict]) -> list[dict]:
    """
    Compute explainable risk signals.
    user_history: list of past transactions for this user (same user_id), ordered by timestamp.
    Returns list of signal dicts: { name, value, threshold, weight, fired, explanation }.
    """
    tx_ts = transaction.get("timestamp", "")
    user_txs = [t for t in user_history if t.get("timestamp", "") < tx_ts]
    hist = _get_user_history(transaction, user_txs)

    amount = transaction.get("amount") or 0
    currency = transaction.get("currency", "USD")
    account_age = transaction.get("account_age_days") or 0
    device_id = transaction.get("device_id")
    country = transaction.get("country")
    psp = transaction.get("psp")

    signals: list[dict] = []

    # velocity_withdrawals_20m
    count_20m = hist["withdrawals_20m_count"]
    threshold_20m = 3
    fired_20m = count_20m >= threshold_20m
    signals.append({
        "name": "velocity_withdrawals_20m",
        "value": count_20m,
        "threshold": threshold_20m,
        "weight": 25,
        "fired": fired_20m,
        "explanation": f"Withdrawals in last 20 min: {count_20m} (threshold {threshold_20m})",
    })

    # amount_vs_user_avg
    avg_30d = hist["avg_amount_30d"] or 1
    ratio = amount / avg_30d if avg_30d else 0
    threshold_ratio = 3.0
    fired_ratio = ratio >= threshold_ratio
    signals.append({
        "name": "amount_vs_user_avg",
        "value": round(ratio, 2),
        "threshold": threshold_ratio,
        "weight": 20,
        "fired": fired_ratio,
        "explanation": f"Amount vs 30d avg ratio: {round(ratio, 2)} (threshold {threshold_ratio})",
    })

    # new_device
    known = hist["known_devices"]
    new_device = bool(device_id and device_id not in known)
    signals.append({
        "name": "new_device",
        "value": new_device,
        "threshold": True,
        "weight": 15,
        "fired": new_device,
        "explanation": "New device" if new_device else "Known device",
    })

    # geo_change
    last_country = hist["last_country"]
    geo_change = bool(country and last_country and country != last_country)
    signals.append({
        "name": "geo_change",
        "value": geo_change,
        "threshold": True,
        "weight": 20,
        "fired": geo_change,
        "explanation": f"Country changed from {last_country} to {country}" if geo_change else "No geo change",
    })

    # young_account_high_amount
    young_high = account_age < 30 and amount >= 1000
    signals.append({
        "name": "young_account_high_amount",
        "value": young_high,
        "threshold": True,
        "weight": 25,
        "fired": young_high,
        "explanation": f"Account age {account_age} days, amount {amount}" if young_high else "OK",
    })

    # psp_anomaly
    known_psps = hist["known_psps"]
    psp_anomaly = bool(psp and known_psps and psp not in known_psps)
    signals.append({
        "name": "psp_anomaly",
        "value": psp_anomaly,
        "threshold": True,
        "weight": 10,
        "fired": psp_anomaly,
        "explanation": "PSP not seen before for this user" if psp_anomaly else "Known PSP",
    })

    return signals


def risk_score_and_candidate(signals: list[dict]) -> tuple[int, str]:
    """
    risk_score_base = sum(weight for fired signals), clamped 0..100.
    Returns (risk_score, candidate) where candidate is 'block_candidate' | 'review_candidate' | 'approve_candidate'.
    """
    score = sum(s.get("weight", 0) for s in signals if s.get("fired"))
    score = max(0, min(100, score))
    if score >= BLOCK_THRESHOLD:
        return score, "block_candidate"
    if REVIEW_MIN <= score <= REVIEW_MAX:
        return score, "review_candidate"
    return score, "approve_candidate"
