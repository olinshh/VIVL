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
    <main style={{ height: 'calc(100svh - 64px)', padding: 24, boxSizing: 'border-box' }}>
      <section style={{ maxWidth: 980, margin: '0 auto' }}>
        <Link
          href="/"
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
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 24, color: '#7a4a3a' }}>All Cases</h1>
          <p style={{ margin: '6px 0 0', color: '#a1705a' }}>Open, closed, and finished</p>
        </header>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          <Link href="/data?sort=created_at&dir=desc" className="sort-pill">Newest</Link>
          <Link href="/data?sort=created_at&dir=asc" className="sort-pill">Oldest</Link>
          <Link href="/data?sort=case_id&dir=asc" className="sort-pill">Case ID</Link>
          <Link href="/data?sort=status&dir=asc" className="sort-pill">Status</Link>
          <Link href="/data?sort=confidence&dir=desc" className="sort-pill">Confidence</Link>
        </div>

        <div
          style={{
            maxHeight: 520,
            overflowY: 'auto',
            borderRadius: 18,
            border: '1px solid rgba(226, 207, 196, 0.7)',
            background: 'rgba(255, 252, 248, 0.7)',
            boxShadow: '0 18px 32px rgba(160, 110, 90, 0.12)',
          }}
        >
          {error && <div style={{ padding: 14, color: '#b0412f' }}>{error}</div>}
          {!error && cases.length === 0 && <div style={{ padding: 14, color: '#a1705a' }}>No cases available.</div>}
          {cases.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#7a4a3a', background: '#fff6ef' }}>
                  <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2cfc4' }}>Case ID</th>
                  <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2cfc4' }}>Status</th>
                  <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2cfc4' }}>Confidence</th>
                  <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2cfc4' }}>Primary Tx</th>
                  <th style={{ padding: '12px 14px', borderBottom: '1px solid #e2cfc4' }}>Created</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((item) => (
                  <tr key={item.case_id} style={{ color: '#7a4a3a' }}>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0e3db' }}>{item.case_id}</td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0e3db' }}>
                      {item.status || 'open'}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0e3db' }}>
                      {item.confidence || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0e3db' }}>
                      {item.primary_transaction_id || '—'}
                    </td>
                    <td style={{ padding: '10px 14px', borderBottom: '1px solid #f0e3db' }}>
                      {item.created_at || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <style>{`
          .sort-pill {
            padding: 6px 12px;
            border-radius: 999px;
            border: 1px solid #ead8d0;
            background: #fffbf7;
            color: #7a4a3a;
            text-decoration: none;
            font-size: 12px;
            font-weight: 600;
            transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
          }
          .sort-pill:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 14px rgba(160, 110, 90, 0.18);
            border-color: #d86b2f;
          }
          tbody tr:hover {
            background: #fff3ea;
          }
        `}</style>
      </section>
    </main>
  )
}
