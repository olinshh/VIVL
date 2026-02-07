import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

async function getCases() {
  const res = await fetch(`${API_BASE}/cases`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load cases')
  const data = await res.json()
  const all = Array.isArray(data) ? data : []
  return all.filter((item) => (item.status || 'open') === 'open')
}


export default async function CasesPage() {
  let cases = []
  let error = ''
  try {
    cases = await getCases()
  } catch (err) {
    error = err?.message || 'Failed to load cases'
  }

  return (
    <main style={{ height: 'calc(100svh - 64px)', padding: 32, boxSizing: 'border-box', overflow: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 32 }}>📋</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pending Cases</h1>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14 }}>Investigations requiring review</p>
            </div>
          </div>
          <Link
            href="/"
            className="back-link"
            style={{
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
            ← Back
          </Link>
        </div>

        <div
          style={{
            maxHeight: 'calc(100vh - 220px)',
            overflowY: 'auto',
            paddingRight: 8,
            display: 'grid',
            gap: 12,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(71, 85, 105, 0.5) transparent',
            background: 'rgba(15, 23, 42, 0.97)',
            border: '1px solid rgba(71, 85, 105, 0.5)',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {error && <div style={{ padding: 16, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
          {!error && cases.length === 0 && <div style={{ padding: 20, color: '#94a3b8', textAlign: 'center', fontSize: 14 }}>No pending cases yet. All clear! 🎉</div>}
          {cases.map((item, index) => (
            <Link
              key={item.case_id || index}
              href={`/cases/${item.case_id}`}
              className="case-card"
              style={{
                display: 'block',
                padding: '20px 24px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🔍</span>
                  <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 16 }}>{item.case_id}</div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    color: '#fde047',
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    padding: '6px 12px',
                    borderRadius: 6,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {item.status || 'open'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', display: 'grid', gap: 6 }}>
                <div><span style={{ color: '#64748b' }}>Transaction:</span> <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{item.primary_transaction_id || '—'}</span></div>
                <div><span style={{ color: '#64748b' }}>Confidence:</span> <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{item.confidence || '—'}</span></div>
                <div><span style={{ color: '#64748b' }}>Created:</span> {item.created_at || '—'}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        .back-link:hover {
          background: rgba(59, 130, 246, 0.2) !important;
          border-color: rgba(59, 130, 246, 0.5) !important;
          color: #60a5fa !important;
        }
        .case-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(59, 130, 246, 0.3);
          border-color: rgba(59, 130, 246, 0.5);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(30, 41, 59, 0.95) 100%);
        }
      `}</style>
    </main>
  )
}
