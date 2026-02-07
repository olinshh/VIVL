# this file puts some made up data in the data base

"""Seed the database with sample data."""
from datetime import datetime, timedelta
import uuid
from VIVL.backend.db import init_db, get_cursor

def seed_database():
    """Create tables and insert sample data."""
    print("Initializing database...")
    init_db()
    
    print("Inserting sample data...")
    
    with get_cursor() as cursor:
        # Sample transactions
        transactions = [
            {
                'id': str(uuid.uuid4()),
                'transaction_id': 'TXN-001',
                'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
                'amount': 1500.00,
                'currency': 'USD',
                'user_id': 'user_123',
                'user_email': 'john.doe@example.com',
                'user_name': 'John Doe',
                'device_id': 'device_abc123',
                'device_type': 'mobile',
                'ip_address': '192.168.1.100',
                'status': 'completed',
                'merchant_id': 'merch_001',
                'merchant_name': 'Online Store XYZ',
                'location': 'New York, US',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'transaction_id': 'TXN-002',
                'timestamp': (datetime.now() - timedelta(hours=1)).isoformat(),
                'amount': 5000.00,
                'currency': 'EUR',
                'user_id': 'user_456',
                'user_email': 'jane.smith@example.com',
                'user_name': 'Jane Smith',
                'device_id': 'device_xyz789',
                'device_type': 'desktop',
                'ip_address': '10.0.0.50',
                'status': 'pending',
                'merchant_id': 'merch_002',
                'merchant_name': 'Tech Gadgets Inc',
                'location': 'London, UK',
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'transaction_id': 'TXN-003',
                'timestamp': (datetime.now() - timedelta(minutes=30)).isoformat(),
                'amount': 250.50,
                'currency': 'USD',
                'user_id': 'user_789',
                'user_email': 'bob.johnson@example.com',
                'user_name': 'Bob Johnson',
                'device_id': 'device_def456',
                'device_type': 'mobile',
                'ip_address': '172.16.0.10',
                'status': 'flagged',
                'merchant_id': 'merch_003',
                'merchant_name': 'Gaming Store',
                'location': 'Los Angeles, US',
                'created_at': datetime.now().isoformat()
            }
        ]
        
        for txn in transactions:
            cursor.execute('''
                INSERT INTO transactions 
                (id, transaction_id, timestamp, amount, currency, user_id, user_email, 
                user_name, device_id, device_type, ip_address, status, merchant_id, 
                merchant_name, location, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (txn['id'], txn['transaction_id'], txn['timestamp'], txn['amount'],
                  txn['currency'], txn['user_id'], txn['user_email'], txn['user_name'],
                  txn['device_id'], txn['device_type'], txn['ip_address'], txn['status'],
                  txn['merchant_id'], txn['merchant_name'], txn['location'], txn['created_at']))
        
        # Sample risk decisions
        risk_decisions = [
            {
                'id': str(uuid.uuid4()),
                'transaction_id': 'TXN-001',
                'risk_score': 15.5,
                'risk_level': 'low',
                'decision': 'approve',
                'reason': 'Normal transaction pattern',
                'signals_json': '{"velocity": "normal", "location_match": true}',
                'model_version': 'v1.2.3',
                'llm_rationale': 'Transaction amount and pattern consistent with user history',
                'timestamp': datetime.now().isoformat(),
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'transaction_id': 'TXN-002',
                'risk_score': 75.2,
                'risk_level': 'high',
                'decision': 'review',
                'reason': 'Unusual amount for this user',
                'signals_json': '{"velocity": "high", "location_match": false, "amount_anomaly": true}',
                'model_version': 'v1.2.3',
                'llm_rationale': 'Large transaction from new location requires manual review',
                'timestamp': datetime.now().isoformat(),
                'created_at': datetime.now().isoformat()
            },
            {
                'id': str(uuid.uuid4()),
                'transaction_id': 'TXN-003',
                'risk_score': 92.8,
                'risk_level': 'critical',
                'decision': 'block',
                'reason': 'Multiple fraud indicators detected',
                'signals_json': '{"velocity": "very_high", "device_mismatch": true, "vpn_detected": true}',
                'model_version': 'v1.2.3',
                'llm_rationale': 'Device fingerprint mismatch and VPN usage from high-risk location',
                'timestamp': datetime.now().isoformat(),
                'created_at': datetime.now().isoformat()
            }
        ]
        
        for risk in risk_decisions:
            cursor.execute('''
                INSERT INTO risk_decisions 
                (id, transaction_id, risk_score, risk_level, decision, reason, 
                signals_json, model_version, llm_rationale, timestamp, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (risk['id'], risk['transaction_id'], risk['risk_score'], risk['risk_level'],
                  risk['decision'], risk['reason'], risk['signals_json'], risk['model_version'],
                  risk['llm_rationale'], risk['timestamp'], risk['created_at']))
        
        # Sample cases
        cases = [
            {
                'id': str(uuid.uuid4()),
                'case_id': 'CASE-2026-001',
                'transaction_id': 'TXN-003',
                'status': 'investigating',
                'priority': 'high',
                'confidence': 'medium',
                'hypothesis': 'Possible account takeover',
                'hypothesis_json': '{"type": "account_takeover", "indicators": ["device_change", "location_change"]}',
                'evidence': 'Device mismatch, VPN usage, unusual location',
                'evidence_json': '{"device_match": false, "vpn": true, "location_risk": "high"}',
                'timeline_json': '{"events": [{"time": "2026-02-07T10:00:00", "event": "suspicious_login"}]}',
                'recommendations_json': '{"actions": ["contact_user", "freeze_account"]}',
                'investigation_suggestions_json': '{"next_steps": ["verify_user_identity", "check_recent_activity"]}',
                'assigned_to': 'fraud_analyst_1',
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat(),
                'resolution': None
            }
        ]
        
        for case in cases:
            cursor.execute('''
                INSERT INTO cases 
                (id, case_id, transaction_id, status, priority, confidence, hypothesis, 
                hypothesis_json, evidence, evidence_json, timeline_json, recommendations_json,
                investigation_suggestions_json, assigned_to, created_at, updated_at, resolution)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (case['id'], case['case_id'], case['transaction_id'], case['status'],
                  case['priority'], case['confidence'], case['hypothesis'], case['hypothesis_json'],
                  case['evidence'], case['evidence_json'], case['timeline_json'],
                  case['recommendations_json'], case['investigation_suggestions_json'],
                  case['assigned_to'], case['created_at'], case['updated_at'], case['resolution']))
        
        # Sample audit log
        audit_logs = [
            {
                'id': str(uuid.uuid4()),
                'event_id': 'EVT-001',
                'event_type': 'TRANSACTION_CREATED',
                'actor': 'system',
                'action': 'create',
                'resource_type': 'transaction',
                'resource_id': 'TXN-001',
                'details': 'Transaction created successfully',
                'payload_json': '{"amount": 1500.00, "currency": "USD"}',
                'timestamp': datetime.now().isoformat(),
                'created_at': datetime.now().isoformat(),
                'ip_address': '192.168.1.100'
            },
            {
                'id': str(uuid.uuid4()),
                'event_id': 'EVT-002',
                'event_type': 'RISK_ASSESSMENT',
                'actor': 'fraud_engine',
                'action': 'assess',
                'resource_type': 'risk_decision',
                'resource_id': 'TXN-002',
                'details': 'Risk assessment completed',
                'payload_json': '{"risk_score": 75.2, "decision": "review"}',
                'timestamp': datetime.now().isoformat(),
                'created_at': datetime.now().isoformat(),
                'ip_address': '10.0.0.1'
            },
            {
                'id': str(uuid.uuid4()),
                'event_id': 'EVT-003',
                'event_type': 'CASE_OPENED',
                'actor': 'fraud_analyst_1',
                'action': 'create',
                'resource_type': 'case',
                'resource_id': 'CASE-2026-001',
                'details': 'Investigation case opened',
                'payload_json': '{"priority": "high", "hypothesis": "account_takeover"}',
                'timestamp': datetime.now().isoformat(),
                'created_at': datetime.now().isoformat(),
                'ip_address': '10.0.0.50'
            }
        ]
        
        for log in audit_logs:
            cursor.execute('''
                INSERT INTO audit_log 
                (id, event_id, event_type, actor, action, resource_type, resource_id,
                details, payload_json, timestamp, created_at, ip_address)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (log['id'], log['event_id'], log['event_type'], log['actor'], log['action'],
                  log['resource_type'], log['resource_id'], log['details'], log['payload_json'],
                  log['timestamp'], log['created_at'], log['ip_address']))
    
    print("✅ Database seeded successfully!")
    print(f"   - 3 transactions")
    print(f"   - 3 risk decisions")
    print(f"   - 1 case")
    print(f"   - 3 audit log entries")
    print(f"\n📂 Database location: ./fraudops.db")
    print(f"   You can now open this file in SQLite Viewer!")

if __name__ == '__main__':
    seed_database()
