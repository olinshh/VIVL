'use client'

import { useState, useRef } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export default function Home() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState([])
  const [stats, setStats] = useState({ total: 0, approve: 0, review: 0, block: 0 })
  const stopRef = useRef(false)

  const processNextTransaction = async () => {
    try {
      console.log('Fetching next transaction...')
      // Get next transaction from queue
      const nextRes = await fetch(`${API_BASE}/transactions/next`)
      if (!nextRes.ok) {
        console.error('Failed to fetch next transaction:', nextRes.status)
        return false
      }
      
      const transaction = await nextRes.json()
      if (!transaction) {
        console.log('No more transactions available')
        return false
      }
      console.log('Got transaction:', transaction.id)

      // Ingest and score the transaction
      console.log('Ingesting transaction...')
      const ingestRes = await fetch(`${API_BASE}/transactions/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      })
      
      if (!ingestRes.ok) {
        console.error('Failed to ingest transaction:', ingestRes.status, await ingestRes.text())
        return false
      }
      
      const result = await ingestRes.json()
      console.log('Transaction processed:', result)
      console.log('Decision:', result.decision?.decision, 'Score:', result.decision?.risk_score)
      
      // Update results (keep last 10)
      setResults(prev => {
        const newResults = [{
          id: result.transaction?.id || transaction.id,
          userId: transaction.user_id || 'unknown',
          type: transaction.type || 'unknown',
          amount: transaction.amount || 0,
          currency: transaction.currency || 'USD',
          country: transaction.country || 'N/A',
          riskScore: result.decision?.risk_score ?? 0,
          decision: result.decision?.decision || 'pending',
          timestamp: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 10)
        return newResults
      })

      // Update stats
      setStats(prev => ({
        total: prev.total + 1,
        approve: prev.approve + (result.decision?.decision === 'approve' ? 1 : 0),
        review: prev.review + (result.decision?.decision === 'review' ? 1 : 0),
        block: prev.block + (result.decision?.decision === 'block' ? 1 : 0)
      }))

      return true
    } catch (error) {
      console.error('Error processing transaction:', error)
      return false
    }
  }

  const startAutoSeeding = async () => {
    console.log('Starting auto-seeding...')
    setIsRunning(true)
    stopRef.current = false
    setResults([])
    setStats({ total: 0, approve: 0, review: 0, block: 0 })

    let count = 0
    const maxTransactions = 50 // Process 50 transactions
    
    while (count < maxTransactions && !stopRef.current) {
      console.log(`Processing transaction ${count + 1}...`)
      const success = await processNextTransaction()
      if (!success) {
        console.log('Failed to process transaction, stopping...')
        break
      }
      count++
      await new Promise(resolve => setTimeout(resolve, 500)) // 500ms delay between transactions
    }
    
    console.log('Auto-seeding completed')
    setIsRunning(false)
  }

  const stopSeeding = () => {
    console.log('Stopping auto-seeding...')
    stopRef.current = true
    setIsRunning(false)
  }

  const getDecisionColor = (decision) => {
    if (decision === 'approve') return '#22c55e'
    if (decision === 'review') return '#eab308'
    if (decision === 'block') return '#ef4444'
    return '#64748b'
  }

  const getDecisionBg = (decision) => {
    if (decision === 'approve') return 'rgba(22, 163, 74, 0.15)'
    if (decision === 'review') return 'rgba(234, 179, 8, 0.15)'
    if (decision === 'block') return 'rgba(239, 68, 68, 0.15)'
    return 'rgba(51, 65, 85, 0.3)'
  }

  return (
    <main style={{ height: 'calc(100svh - 64px)', padding: 32, boxSizing: 'border-box', overflow: 'auto' }}>
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          background: 'rgba(15, 23, 42, 0.97)',
          border: '1px solid rgba(71, 85, 105, 0.5)',
          borderRadius: 16,
          padding: 32,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(59, 130, 246, 0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 12, 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
          }}>🛡️</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>VIVL — Real-Time Fraud Intelligence</h1>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14, lineHeight: 1.4 }}>
              AI-powered transaction monitoring • Explainable decisions • Automated case generation
            </p>
          </div>
        </div>

        {/* Auto-Seeding Controls */}
        <div style={{ marginTop: 24, padding: 24, background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)', borderRadius: 16, border: '1px solid rgba(71, 85, 105, 0.4)', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isRunning ? '#22c55e' : '#64748b', boxShadow: isRunning ? '0 0 12px #22c55e' : 'none', animation: isRunning ? 'pulse 2s infinite' : 'none' }} />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>Live Transaction Monitor</h3>
            </div>
            <button
              onClick={isRunning ? stopSeeding : startAutoSeeding}
              disabled={isRunning && results.length === 0}
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: isRunning ? 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14,
                boxShadow: isRunning ? '0 4px 16px rgba(220, 38, 38, 0.4)' : '0 4px 16px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {isRunning ? '⏹' : '▶'} {isRunning ? 'Stop Analysis' : 'Start Analysis'}
            </button>
          </div>

          {/* Stats */}
          {stats.total > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
              <div style={{ padding: 16, background: 'rgba(51, 65, 85, 0.4)', borderRadius: 12, textAlign: 'center', border: '1px solid rgba(71, 85, 105, 0.3)' }}>
                <div style={{ fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stats.total}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Total Processed</div>
              </div>
              <div style={{ padding: 16, background: 'rgba(22, 163, 74, 0.1)', borderRadius: 12, textAlign: 'center', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{stats.approve}</div>
                <div style={{ fontSize: 11, color: '#86efac', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Approved</div>
              </div>
              <div style={{ padding: 16, background: 'rgba(234, 179, 8, 0.1)', borderRadius: 12, textAlign: 'center', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#eab308' }}>{stats.review}</div>
                <div style={{ fontSize: 11, color: '#fde047', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Under Review</div>
              </div>
              <div style={{ padding: 16, background: 'rgba(220, 38, 38, 0.1)', borderRadius: 12, textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{stats.block}</div>
                <div style={{ fontSize: 11, color: '#fca5a5', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 4 }}>Blocked</div>
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 8 }}>
              {results.map((result, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 14,
                    marginBottom: 10,
                    background: getDecisionBg(result.decision),
                    border: `1px solid ${getDecisionColor(result.decision)}`,
                    borderLeft: `4px solid ${getDecisionColor(result.decision)}`,
                    borderRadius: 8,
                    fontSize: 13,
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>💳</span>
                      <span style={{ fontWeight: 600, color: '#f1f5f9', fontFamily: 'monospace' }}>
                        {result.userId}
                      </span>
                      <span style={{ color: '#64748b' }}>•</span>
                      <span style={{ color: '#94a3b8' }}>{result.type}</span>
                      <span style={{ fontWeight: 600, color: '#f1f5f9' }}>${result.amount} {result.currency}</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'monospace' }}>{result.timestamp}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>
                        🎯 Risk: <span style={{ fontWeight: 700, color: '#f1f5f9' }}>{(result.riskScore || 0).toFixed(0)}</span>
                      </span>
                      <span style={{ color: '#64748b' }}>•</span>
                      <span style={{ color: '#94a3b8', fontSize: 12 }}>
                        🌍 {result.country || 'N/A'}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: 6,
                        background: getDecisionColor(result.decision),
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        boxShadow: `0 2px 8px ${getDecisionColor(result.decision)}80`
                      }}
                    >
                      {result.decision}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            marginTop: 32,
          }}
        >
          {[
            {
              icon: '🧠',
              title: 'AI-Powered Intelligence',
              body: 'Machine learning models analyze transaction patterns in real-time, detecting anomalies human analysts might miss.',
            },
            {
              icon: '📊',
              title: 'Explainable Decisions',
              body: 'Every risk score backed by transparent reasoning. Full audit trail for compliance and regulatory requirements.',
            },
            {
              icon: '⚡',
              title: 'Instant Case Generation',
              body: 'Automated investigation workflows. High-risk transactions trigger detailed case files with evidence and recommendations.',
            },
            {
              icon: '🔒',
              title: 'Enterprise Security',
              body: 'Bank-grade encryption, append-only audit logs, and compliance with global financial security standards.',
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                padding: '20px',
                borderRadius: 12,
                border: '1px solid rgba(71, 85, 105, 0.5)',
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 48px rgba(59, 130, 246, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)'
                e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)'
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 8, fontSize: 16 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{item.body}</div>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </section>
    </main>
  )
}
