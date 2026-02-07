export default function Home() {
  return (
    <main style={{ height: 'calc(100svh - 64px)', padding: 24, boxSizing: 'border-box' }}>
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
