'use client'

import Link from 'next/link'
import { Playfair_Display } from 'next/font/google'
import { useState } from 'react'

const logoFont = Playfair_Display({ subsets: ['latin'], weight: ['700', '800', '900'] })

export default function MenuShell({ children }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid #f2c4c4',
          background: 'linear-gradient(180deg, #fff5f5 0%, #ffe9e9 100%)',
          boxShadow: '0 10px 24px rgba(164, 47, 47, 0.12)',
          zIndex: 30,
        }}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsOpen((prev) => !prev)}
            style={{
              width: 44,
              height: 44,
              display: 'grid',
              placeItems: 'center',
              border: '1px solid #f2c4c4',
              borderRadius: 12,
              background: 'linear-gradient(180deg, #fffafa 0%, #ffe7e7 100%)',
              boxShadow: '0 8px 16px rgba(164, 47, 47, 0.14)',
              cursor: 'pointer',
              transition: 'transform 120ms ease, box-shadow 120ms ease',
            }}
            onMouseDown={(event) => {
              event.currentTarget.style.transform = 'scale(0.98)'
              event.currentTarget.style.boxShadow = '0 4px 10px rgba(164, 47, 47, 0.18)'
            }}
            onMouseUp={(event) => {
              event.currentTarget.style.transform = 'scale(1)'
              event.currentTarget.style.boxShadow = '0 8px 16px rgba(164, 47, 47, 0.14)'
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.transform = 'scale(1)'
              event.currentTarget.style.boxShadow = '0 8px 16px rgba(164, 47, 47, 0.14)'
            }}
          >
            <span style={{ display: 'grid', gap: 5 }}>
              <span style={{ display: 'block', width: 20, height: 2, background: '#7f1d1d', borderRadius: 999 }} />
              <span style={{ display: 'block', width: 20, height: 2, background: '#7f1d1d', borderRadius: 999 }} />
              <span style={{ display: 'block', width: 20, height: 2, background: '#7f1d1d', borderRadius: 999 }} />
            </span>
          </button>

          <div
            style={{
              position: 'absolute',
              left: 52,
              top: '50%',
              transform: isOpen
                ? 'translate(-0px, -50%) scale(1)'
                : 'translate(-6px, -50%) scale(0.98)',
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? 'auto' : 'none',
              transition: 'transform 180ms ease, opacity 180ms ease',
              background: '#fff6f6',
              border: '1px solid #f2c4c4',
              borderRadius: 18,
              boxShadow: '0 12px 22px rgba(164, 47, 47, 0.12)',
              padding: '8px 10px',
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: '1px solid #f2c4c4',
                  background: '#fffafa',
                  color: '#7f1d1d',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'transform 140ms ease, box-shadow 140ms ease, background 140ms ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = '#ffecec'
                  event.currentTarget.style.boxShadow = '0 6px 12px rgba(164, 47, 47, 0.15)'
                  event.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = '#fffafa'
                  event.currentTarget.style.boxShadow = 'none'
                  event.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Home
              </Link>
              <Link
                href="/cases"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: '1px solid #f2c4c4',
                  background: '#fffafa',
                  color: '#7f1d1d',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'transform 140ms ease, box-shadow 140ms ease, background 140ms ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = '#ffecec'
                  event.currentTarget.style.boxShadow = '0 6px 12px rgba(164, 47, 47, 0.15)'
                  event.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = '#fffafa'
                  event.currentTarget.style.boxShadow = 'none'
                  event.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Cases
              </Link>
              <Link
                href="/data"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: '1px solid #f2c4c4',
                  background: '#fffafa',
                  color: '#7f1d1d',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'transform 140ms ease, box-shadow 140ms ease, background 140ms ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = '#ffecec'
                  event.currentTarget.style.boxShadow = '0 6px 12px rgba(164, 47, 47, 0.15)'
                  event.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = '#fffafa'
                  event.currentTarget.style.boxShadow = 'none'
                  event.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Data
              </Link>
            </nav>
          </div>
        </div>

        <Link
          href="/"
          style={{
            fontWeight: 800,
            fontSize: 26,
            letterSpacing: 2.5,
            background: 'linear-gradient(120deg, #fff1f1 0%, #ffb992 45%, #ea580c 100%)',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            textShadow: '0 8px 20px rgba(234, 88, 12, 0.22)',
            WebkitTextStroke: '0.6px rgba(127, 29, 29, 0.9)',
            textDecoration: 'none',
            textTransform: 'uppercase',
          }}
          className={logoFont.className}
        >
          VIVL
        </Link>
      </header>

      <div
        style={{
          minHeight: '100vh',
          paddingTop: 64,
          background: 'radial-gradient(circle at top, #fff5f5 0%, #ffe9e9 45%, #ffffff 100%)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </>
  )
}
