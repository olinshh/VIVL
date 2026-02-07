import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

async function getCases() {
  const res = await fetch(`${API_BASE}/cases`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load cases')
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

function sortCases(cases, sort, dir) {
  const direction = dir === 'asc' ? 1 : -1
  const key = sort || 'created_at'
  return [...cases].sort((a, b) => {
    const av = a?.[key] ?? ''
    const bv = b?.[key] ?? ''
    if (av === bv) return 0
    return av > bv ? direction : -direction
  })
}


export default async function DataPage({ searchParams }) {
  let cases = []
  let error = ''
  try {
    const data = await getCases()
    const params = await searchParams
    const sort = params?.sort || 'created_at'
    const dir = params?.dir || 'desc'
    cases = sortCases(data, sort, dir)
  } catch (err) {
    error = err?.message || 'Failed to load cases'
  }

  return (
    <main style={{ height: 'calc(100svh - 64px)', padding: 32, boxSizing: 'border-box', overflow: 'auto' }}>
      <section style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Link
          href="/"
          className="back-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            marginBottom: 20,
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
        <header style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 32 }}>🗃️</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>All Cases</h1>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14 }}>Complete investigation history</p>
            </div>
          </div>
        </header>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <Link href="/data?sort=created_at&dir=desc" className="sort-pill">🔽 Newest</Link>
          <Link href="/data?sort=created_at&dir=asc" className="sort-pill">🔼 Oldest</Link>
          <Link href="/data?sort=case_id&dir=asc" className="sort-pill">🎫 Case ID</Link>
          <Link href="/data?sort=status&dir=asc" className="sort-pill">🟢 Status</Link>
          <Link href="/data?sort=confidence&dir=desc" className="sort-pill">🎯 Confidence</Link>
        </div>

        <div
          style={{
            maxHeight: 600,
            overflowY: 'auto',
            borderRadius: 12,
            border: '1px solid rgba(71, 85, 105, 0.5)',
            background: 'rgba(15, 23, 42, 0.97)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {error && <div style={{ padding: 20, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', margin: 12, borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
          {!error && cases.length === 0 && <div style={{ padding: 20, color: '#94a3b8', textAlign: 'center' }}>No cases available.</div>}
          {cases.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#cbd5e1', background: 'rgba(30, 41, 59, 0.8)' }}>
                  <th style={{ padding: '16px 18px', borderBottom: '1px solid rgba(71, 85, 105, 0.5)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Case ID</th>
                  <th style={{ padding: '16px 18px', borderBottom: '1px solid rgba(71, 85, 105, 0.5)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                  <th style={{ padding: '16px 18px', borderBottom: '1px solid rgba(71, 85, 105, 0.5)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confidence</th>
                  <th style={{ padding: '16px 18px', borderBottom: '1px solid rgba(71, 85, 105, 0.5)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Primary Tx</th>
                  <th style={{ padding: '16px 18px', borderBottom: '1px solid rgba(71, 85, 105, 0.5)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((item) => (
                  <tr key={item.case_id} style={{ color: '#94a3b8' }}>
                    <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(51, 65, 85, 0.5)', fontFamily: 'monospace', color: '#f1f5f9', fontWeight: 600 }}>{item.case_id}</td>
                    <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(51, 65, 85, 0.5)' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: 6, 
                        background: item.status === 'open' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                        border: `1px solid ${item.status === 'open' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                        color: item.status === 'open' ? '#fde047' : '#86efac',
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {item.status || 'open'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(51, 65, 85, 0.5)', fontWeight: 600, color: '#cbd5e1' }}>
                      {item.confidence || '—'}
                    </td>
                    <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(51, 65, 85, 0.5)', fontFamily: 'monospace', fontSize: 12 }}>
                      {item.primary_transaction_id || '—'}
                    </td>
                    <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(51, 65, 85, 0.5)', color: '#64748b', fontSize: 12 }}>
                      {item.created_at || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <style>{`
          .back-link:hover {
            background: rgba(59, 130, 246, 0.2) !important;
            border-color: rgba(59, 130, 246, 0.5) !important;
            color: #60a5fa !important;
          }
          .sort-pill {
            padding: 8px 16px;
            border-radius: 8px;
            border: 1px solid rgba(71, 85, 105, 0.5);
            background: rgba(51, 65, 85, 0.5);
            color: #94a3b8;
            text-decoration: none;
            font-size: 13px;
            font-weight: 600;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          .sort-pill:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
            border-color: rgba(59, 130, 246, 0.5);
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
          }
          tbody tr {
            transition: background 0.2s ease;
          }
          tbody tr:hover {
            background: rgba(59, 130, 246, 0.1);
          }
        `}</style>
      </section>
    </main>
  )
}
