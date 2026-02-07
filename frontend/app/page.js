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
    if (decision === 'approve') return '#2d7a4a'
    if (decision === 'review') return '#b87a3a'
    if (decision === 'block') return '#c24444'
    return '#7a4a3a'
  }

  const getDecisionBg = (decision) => {
    if (decision === 'approve') return '#e8f5ec'
    if (decision === 'review') return '#fff4e6'
    if (decision === 'block') return '#ffe8e8'
    return '#fffbf7'
  }

  return (
    <main style={{ height: 'calc(100svh - 64px)', padding: 24, boxSizing: 'border-box', overflow: 'auto' }}>
      <section
        style={{
          maxWidth: 980,
          margin: '0 auto',
          background: 'rgba(255, 252, 248, 0.7)',
          border: '1px solid rgba(226, 207, 196, 0.6)',
          borderRadius: 24,
          padding: 24,
          boxShadow: '0 22px 40px rgba(160, 110, 90, 0.12)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 28, color: '#7a4a3a' }}>VIVL — Real-Time Fraud Intelligence Layer</h1>
        <p style={{ margin: '10px 0 0', color: '#a1705a', fontSize: 14, lineHeight: 1.6 }}>
          VIVL integrates into transaction processing as a decision-support system that scores risk in real time,
          produces explainable decisions (APPROVE / REVIEW / BLOCK), and generates investigation case files when needed.
        </p>

        {/* Auto-Seeding Controls */}
        <div style={{ marginTop: 20, padding: 16, background: '#fffbf7', borderRadius: 12, border: '1px solid #e2cfc4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, color: '#7a4a3a' }}>🤖 Auto-Fraud Detection Test</h3>
            <button
              onClick={isRunning ? stopSeeding : startAutoSeeding}
              disabled={isRunning && results.length === 0}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: isRunning ? '#c24444' : '#5a8a6a',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: 14
              }}
            >
              {isRunning ? '⏸ Stop' : '▶ Start Auto-Seeding'}
            </button>
          </div>

          {/* Stats */}
          {stats.total > 0 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, padding: 8, background: '#f5f5f5', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#7a4a3a' }}>{stats.total}</div>
                <div style={{ fontSize: 11, color: '#a87a64' }}>Total</div>
              </div>
              <div style={{ flex: 1, padding: 8, background: '#e8f5ec', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#2d7a4a' }}>{stats.approve}</div>
                <div style={{ fontSize: 11, color: '#2d7a4a' }}>Approved</div>
              </div>
              <div style={{ flex: 1, padding: 8, background: '#fff4e6', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#b87a3a' }}>{stats.review}</div>
                <div style={{ fontSize: 11, color: '#b87a3a' }}>Review</div>
              </div>
              <div style={{ flex: 1, padding: 8, background: '#ffe8e8', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#c24444' }}>{stats.block}</div>
                <div style={{ fontSize: 11, color: '#c24444' }}>Blocked</div>
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {results.map((result, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 10,
                    marginBottom: 6,
                    background: getDecisionBg(result.decision),
                    border: `1px solid ${getDecisionColor(result.decision)}40`,
                    borderRadius: 8,
                    fontSize: 12
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: '#7a4a3a' }}>
                      {result.userId} • {result.type} {result.amount} {result.currency}
                    </span>
                    <span style={{ fontSize: 10, color: '#a87a64' }}>{result.timestamp}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#a87a64' }}>
                      Score: {(result.riskScore || 0).toFixed(1)} • {result.country || 'N/A'}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: getDecisionColor(result.decision),
                        color: 'white',
                        fontWeight: 700,
                        fontSize: 10,
                        textTransform: 'uppercase'
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
            marginTop: 18,
          }}
        >
          {[
            {
              title: 'Intelligence Layer',
              body: 'Adds AI-driven risk assessment without replacing core payment rails.',
            },
            {
              title: 'Explainable Decisions',
              body: 'Every decision is justified, traceable, and auditable.',
            },
            {
              title: 'Case Generation',
              body: 'REVIEW/BLOCK decisions create full investigation packs automatically.',
            },
            {
              title: 'Audit-Ready',
              body: 'Append-only logging supports compliance and internal governance.',
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                padding: '14px 16px',
                borderRadius: 18,
                border: '1px solid #e2cfc4',
                background: '#fffbf7',
                boxShadow: '0 14px 24px rgba(160, 110, 90, 0.12)',
              }}
            >
              <div style={{ fontWeight: 700, color: '#7a4a3a', marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: '#a87a64', lineHeight: 1.5 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
