'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

function asList(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

export default function CaseDetailPage({ params }) {
  const { caseId } = use(params)
  const router = useRouter()
  const [caseData, setCaseData] = useState(null)
  const [error, setError] = useState('')
  const [actionStatus, setActionStatus] = useState('')

  useEffect(() => {
    let isMounted = true
    fetch(`${API_BASE}/cases/${caseId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load case')
        return res.json()
      })
      .then((data) => {
        if (isMounted) setCaseData(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load case')
      })
    return () => {
      isMounted = false
    }
  }, [caseId])

  const handleAction = (action) => {
    setActionStatus('Updating...')
    fetch(`${API_BASE}/cases/${caseId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update case')
        return res.json()
      })
      .then((data) => {
        setCaseData(data)
        setActionStatus('Saved')
        setTimeout(() => {
          setActionStatus('')
          router.push('/cases')
        }, 300)
      })
      .catch((err) => {
        setActionStatus(err.message || 'Update failed')
      })
  }

  return (
    <main style={{ height: 'calc(100svh - 64px)', padding: 32, boxSizing: 'border-box', overflow: 'auto' }}>
      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          height: '100%',
          display: 'grid',
          gridTemplateRows: 'auto auto auto 1fr',
          gap: 16,
        }}
      >
        <Link
          href="/cases"
          className="back-link"
          style={{
            display: 'inline-block',
            marginBottom: 12,
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid rgba(71, 85, 105, 0.5)',
            background: 'rgba(51, 65, 85, 0.5)',
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          ← Back to Cases
        </Link>
        {error && <div style={{ padding: 20, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
        {!error && !caseData && <div style={{ padding: 20, color: '#94a3b8', background: 'rgba(51, 65, 85, 0.3)', borderRadius: 12 }}>Loading case…</div>}
        {caseData && (
          <>
            <header style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ fontSize: 32 }}>🔍</div>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Case {caseData.case_id}
                </h1>
              </div>
              <p style={{ margin: '4px 0 0 60px', color: '#94a3b8', fontSize: 14 }}>
                Status: <span style={{ color: '#fde047', fontWeight: 600 }}>{caseData.status || 'open'}</span> · Confidence: <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{caseData.confidence || '—'}</span>
              </p>
            </header>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => handleAction('approve')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  background: 'rgba(22, 163, 74, 0.15)',
                  color: '#22c55e',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 13,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(34, 197, 94, 0.25)'
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.5)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(34, 197, 94, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(22, 163, 74, 0.15)'
                  e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.3)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                ✅ Mark Not Fraudulent
              </button>
              <button
                type="button"
                onClick={() => handleAction('block')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  background: 'rgba(220, 38, 38, 0.15)',
                  color: '#ef4444',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 13,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)'
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.15)'
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                🚫 Mark Fraudulent
              </button>
              {actionStatus && <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: 14 }}>{actionStatus}</span>}
            </div>

            <div
              style={{
                display: 'grid',
                gap: 16,
                overflowY: 'auto',
                paddingRight: 8,
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(71, 85, 105, 0.5) transparent',
              }}
            >
              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  background: 'rgba(15, 23, 42, 0.97)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(20px)',
                  color: '#cbd5e1',
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                <div style={{ marginBottom: 10 }}><strong style={{ color: '#94a3b8' }}>Case ID:</strong> <span style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>{caseData.case_id}</span></div>
                <div style={{ marginBottom: 10 }}><strong style={{ color: '#94a3b8' }}>Primary Transaction:</strong> <span style={{ color: '#f1f5f9', fontFamily: 'monospace' }}>{caseData.primary_transaction_id || '—'}</span></div>
                <div><strong style={{ color: '#94a3b8' }}>Created:</strong> <span style={{ color: '#cbd5e1' }}>{caseData.created_at || '—'}</span></div>
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  background: 'rgba(15, 23, 42, 0.97)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(20px)',
                  color: '#cbd5e1',
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>💡</span>
                  <strong style={{ color: '#60a5fa', fontSize: 16 }}>Hypotheses</strong>
                </div>
                <ul style={{ margin: '8px 0 0 18px', color: '#94a3b8' }}>
                  {asList(caseData.hypotheses || caseData.hypothesis).map((h, i) => (
                    <li key={i} style={{ marginBottom: 6 }}><span style={{ color: '#cbd5e1' }}>{h.title ? `${h.title}: ${h.why}` : JSON.stringify(h)}</span></li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  background: 'rgba(15, 23, 42, 0.97)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(20px)',
                  color: '#cbd5e1',
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>📋</span>
                  <strong style={{ color: '#60a5fa', fontSize: 16 }}>Evidence</strong>
                </div>
                <ul style={{ margin: '8px 0 0 18px', color: '#94a3b8' }}>
                  {asList(caseData.evidence).map((e, i) => (
                    <li key={i} style={{ marginBottom: 6 }}><span style={{ color: '#cbd5e1' }}>{e.item || JSON.stringify(e)}</span></li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  background: 'rgba(15, 23, 42, 0.97)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(20px)',
                  color: '#cbd5e1',
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>⏱️</span>
                  <strong style={{ color: '#60a5fa', fontSize: 16 }}>Timeline</strong>
                </div>
                <ul style={{ margin: '8px 0 0 18px', color: '#94a3b8' }}>
                  {asList(caseData.timeline).map((t, i) => (
                    <li key={i} style={{ marginBottom: 6 }}><span style={{ color: '#cbd5e1' }}>{t.timestamp ? `${t.timestamp} — ${t.event}` : JSON.stringify(t)}</span></li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  background: 'rgba(15, 23, 42, 0.97)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(20px)',
                  color: '#cbd5e1',
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>🎯</span>
                  <strong style={{ color: '#60a5fa', fontSize: 16 }}>Recommendations</strong>
                </div>
                <ul style={{ margin: '8px 0 0 18px', color: '#94a3b8' }}>
                  {asList(caseData.recommendations).map((r, i) => (
                    <li key={i} style={{ marginBottom: 6 }}><span style={{ color: '#cbd5e1' }}>{r.action ? `${r.action}: ${r.reason}` : JSON.stringify(r)}</span></li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  padding: 24,
                  borderRadius: 12,
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  background: 'rgba(15, 23, 42, 0.97)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                  backdropFilter: 'blur(20px)',
                  color: '#cbd5e1',
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 20 }}>🔬</span>
                  <strong style={{ color: '#60a5fa', fontSize: 16 }}>Investigation Suggestions</strong>
                </div>
                <ul style={{ margin: '8px 0 0 18px', color: '#94a3b8' }}>
                  {asList(caseData.investigation_suggestions).map((s, i) => (
                    <li key={i} style={{ marginBottom: 6 }}><span style={{ color: '#cbd5e1' }}>{s}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
