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
    <main style={{ height: 'calc(100svh - 64px)', padding: 24, boxSizing: 'border-box' }}>
      <div
        style={{
          position: 'relative',
          height: 'calc(100vh - 112px)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Link
          href="/"
          style={{
            position: 'absolute',
            right: 24,
            top: 16,
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
        <div
          style={{
            position: 'absolute',
            left: 24,
            top: 16,
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
          {error && <div style={{ padding: 12, color: '#b0412f' }}>{error}</div>}
          {!error && cases.length === 0 && <div style={{ padding: 12, color: '#a1705a' }}>No pending cases yet.</div>}
          {cases.map((item, index) => (
            <Link
              key={item.case_id || index}
              href={`/cases/${item.case_id}`}
              className="case-card"
              style={{
                display: 'block',
                padding: '18px 20px',
                borderRadius: 18,
                background: '#fffbf7',
                border: '2px solid #e2cfc4',
                boxShadow: `0 ${10 + index * 2}px ${18 + index * 2}px rgba(160, 110, 90, 0.14)`,
                transform: `translateY(${index * 3}px)`,
                textDecoration: 'none',
                transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background 160ms ease',
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
            </Link>
          ))}
        </div>
      </div>
      <style>{`
        .case-card:hover {
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 18px 28px rgba(160, 110, 90, 0.22);
          border-color: #d86b2f;
          background: #fff1e6;
        }
      `}</style>
    </main>
  )
}
