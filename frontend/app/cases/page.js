export default function CasesPage() {
  return (
    <main style={{ minHeight: '100vh', padding: 24 }}>
      <section
        style={{
          maxWidth: 720,
          margin: '0 auto',
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid #f2c4c4',
          borderRadius: 20,
          padding: 20,
          boxShadow: '0 18px 30px rgba(164, 47, 47, 0.08)',
        }}
      >
        <header style={{ marginBottom: 16 }}>
          <h1 style={{ margin: 0, fontSize: 22, color: '#7f1d1d' }}>Pending Cases</h1>
          <p style={{ margin: '6px 0 0', color: '#9f4c4c' }}>To Resolve Pile</p>
        </header>

        <div
          style={{
            maxHeight: 320,
            overflowY: 'auto',
            paddingRight: 6,
            display: 'grid',
            gap: 12,
          }}
        >
          {[
            'Case #1024',
            'Case #1023',
            'Case #1022',
            'Case #1021',
            'Case #1020',
            'Case #1019',
            'Case #1018',
            'Case #1017',
            'Case #1016',
          ].map((label, index) => (
            <div
              key={label}
              style={{
                padding: '14px 16px',
                borderRadius: 16,
                background: '#fffafa',
                border: '1px solid #f2c4c4',
                boxShadow: `0 ${10 + index * 2}px ${18 + index * 2}px rgba(164, 47, 47, 0.1)`,
                transform: `translateY(${index * 3}px)`,
              }}
            >
              <div style={{ fontWeight: 600, color: '#7f1d1d' }}>{label}</div>
              <div style={{ fontSize: 12, color: '#b35a5a', marginTop: 4 }}>Pending review</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
