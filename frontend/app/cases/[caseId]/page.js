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
    <main style={{ height: 'calc(100svh - 64px)', padding: 24, boxSizing: 'border-box' }}>
      <section
        style={{
          maxWidth: 980,
          margin: '0 auto',
          height: '100%',
          display: 'grid',
          gridTemplateRows: 'auto auto auto 1fr',
          gap: 12,
        }}
      >
        <Link
          href="/cases"
          style={{
            display: 'inline-block',
            marginBottom: 12,
            padding: '6px 12px',
            borderRadius: 999,
            border: '1px solid #ead8d0',
            background: '#fffbf7',
            color: '#7a4a3a',
            textDecoration: 'none',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Back
        </Link>
        {error && <div style={{ padding: 14, color: '#b0412f' }}>{error}</div>}
        {!error && !caseData && <div style={{ padding: 14, color: '#a1705a' }}>Loading case…</div>}
        {caseData && (
          <>
            <header style={{ marginBottom: 0 }}>
              <h1 style={{ margin: 0, fontSize: 24, color: '#7a4a3a' }}>
                Case {caseData.case_id}
              </h1>
              <p style={{ margin: '6px 0 0', color: '#a1705a' }}>
                Status: {caseData.status || 'open'} · Confidence: {caseData.confidence || '—'}
              </p>
            </header>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleAction('approve')}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: '1px solid #c8e1d5',
                  background: '#e9f7f1',
                  color: '#1f6f4a',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Mark Not Fraudulent
              </button>
              <button
                type="button"
                onClick={() => handleAction('block')}
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  border: '1px solid #f1c0b2',
                  background: '#fdebe7',
                  color: '#9a3412',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Mark Fraudulent
              </button>
              {actionStatus && <span style={{ color: '#a1705a' }}>{actionStatus}</span>}
            </div>

            <div
              style={{
                display: 'grid',
                gap: 12,
                overflowY: 'auto',
                paddingRight: 6,
                scrollbarWidth: 'thin',
                scrollbarColor: '#e2cfc4 transparent',
              }}
            >
              <div
                style={{
                  padding: 18,
                  borderRadius: 18,
                  border: '1px solid rgba(226, 207, 196, 0.7)',
                  background: 'rgba(255, 252, 248, 0.7)',
                  boxShadow: '0 18px 32px rgba(160, 110, 90, 0.12)',
                  color: '#7a4a3a',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <div><strong>Case ID:</strong> {caseData.case_id}</div>
                <div><strong>Primary Transaction:</strong> {caseData.primary_transaction_id || '—'}</div>
                <div><strong>Created:</strong> {caseData.created_at || '—'}</div>
              </div>

              <div
                style={{
                  padding: 18,
                  borderRadius: 18,
                  border: '1px solid rgba(226, 207, 196, 0.7)',
                  background: 'rgba(255, 252, 248, 0.7)',
                  color: '#7a4a3a',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <strong>Hypotheses</strong>
                <ul style={{ margin: '8px 0 0 18px' }}>
                  {asList(caseData.hypotheses || caseData.hypothesis).map((h, i) => (
                    <li key={i}>{h.title ? `${h.title}: ${h.why}` : JSON.stringify(h)}</li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  padding: 18,
                  borderRadius: 18,
                  border: '1px solid rgba(226, 207, 196, 0.7)',
                  background: 'rgba(255, 252, 248, 0.7)',
                  color: '#7a4a3a',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <strong>Evidence</strong>
                <ul style={{ margin: '8px 0 0 18px' }}>
                  {asList(caseData.evidence).map((e, i) => (
                    <li key={i}>{e.item || JSON.stringify(e)}</li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  padding: 18,
                  borderRadius: 18,
                  border: '1px solid rgba(226, 207, 196, 0.7)',
                  background: 'rgba(255, 252, 248, 0.7)',
                  color: '#7a4a3a',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <strong>Timeline</strong>
                <ul style={{ margin: '8px 0 0 18px' }}>
                  {asList(caseData.timeline).map((t, i) => (
                    <li key={i}>{t.timestamp ? `${t.timestamp} — ${t.event}` : JSON.stringify(t)}</li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  padding: 18,
                  borderRadius: 18,
                  border: '1px solid rgba(226, 207, 196, 0.7)',
                  background: 'rgba(255, 252, 248, 0.7)',
                  color: '#7a4a3a',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <strong>Recommendations</strong>
                <ul style={{ margin: '8px 0 0 18px' }}>
                  {asList(caseData.recommendations).map((r, i) => (
                    <li key={i}>{r.action ? `${r.action}: ${r.reason}` : JSON.stringify(r)}</li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  padding: 18,
                  borderRadius: 18,
                  border: '1px solid rgba(226, 207, 196, 0.7)',
                  background: 'rgba(255, 252, 248, 0.7)',
                  color: '#7a4a3a',
                  fontSize: 13,
                  lineHeight: 1.6,
                }}
              >
                <strong>Suggestions</strong>
                <ul style={{ margin: '8px 0 0 18px' }}>
                  {asList(caseData.investigation_suggestions).map((s, i) => (
                    <li key={i}>{s}</li>
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
