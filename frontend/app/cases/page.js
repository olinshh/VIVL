'use client'

import { useEffect, useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export default function CasesPage() {
  const [cases, setCases] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    fetch(`${API_BASE}/cases`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load cases')
        return res.json()
      })
      .then((data) => {
        if (isMounted) setCases(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load cases')
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main style={{ minHeight: '100vh', padding: 24 }}>
      <div
        style={{
          position: 'relative',
          height: 'calc(100vh - 112px)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 24,
            top: 12,
            textAlign: 'left',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 26, color: '#7a4a3a' }}>Pending Cases</h1>
          <p style={{ margin: '8px 0 0', color: '#a1705a' }}>To Resolve Pile</p>
        </div>

        <div
          style={{
            width: 720,
            maxHeight: 520,
            overflowY: 'auto',
            paddingRight: 2,
            display: 'grid',
            gap: 12,
            scrollbarWidth: 'thin',
            scrollbarColor: '#e2cfc4 transparent',
            background: 'rgba(255, 252, 248, 0.7)',
            border: '1px solid rgba(226, 207, 196, 0.6)',
            borderRadius: 24,
            padding: 18,
            boxShadow: '0 22px 40px rgba(160, 110, 90, 0.12)',
          }}
        >
          {error && (
            <div style={{ padding: 12, color: '#b0412f' }}>
              {error}
            </div>
          )}
          {!error && cases.length === 0 && (
            <div style={{ padding: 12, color: '#a1705a' }}>
              No pending cases yet.
            </div>
          )}
          {cases.map((item, index) => (
            <div
              key={item.case_id || index}
              style={{
                padding: '18px 20px',
                borderRadius: 18,
                background: '#fffbf7',
                border: '1px solid #e2cfc4',
                boxShadow: `0 ${10 + index * 2}px ${18 + index * 2}px rgba(160, 110, 90, 0.14)`,
                transform: `translateY(${index * 3}px)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, color: '#7a4a3a' }}>{item.case_id}</div>
                <span
                  style={{
                    fontSize: 11,
                    color: '#a1705a',
                    background: '#f6ece5',
                    border: '1px solid #e2cfc4',
                    padding: '4px 8px',
                    borderRadius: 999,
                  }}
                >
                  {item.status || 'open'}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#a87a64', marginTop: 8 }}>
                Primary Tx: {item.primary_transaction_id || '—'}
              </div>
              <div style={{ fontSize: 12, color: '#a1705a', marginTop: 2 }}>
                Confidence: {item.confidence || '—'}
              </div>
              <div style={{ fontSize: 12, color: '#a1705a', marginTop: 2 }}>
                Created: {item.created_at || '—'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
