'use client'

import Link from 'next/link'
import { Cormorant_Garamond } from 'next/font/google'
import { useState } from 'react'

const logoFont = Cormorant_Garamond({ subsets: ['latin'], weight: ['600', '700'] })

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
          borderBottom: '1px solid #ead8d0',
          background: 'linear-gradient(180deg, #fdf8f5 0%, #f6ede7 100%)',
          boxShadow: '0 10px 24px rgba(160, 110, 90, 0.14)',
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
            border: '1px solid #ead8d0',
            borderRadius: 12,
            background: 'linear-gradient(180deg, #fffaf6 0%, #f1e6de 100%)',
            boxShadow: '0 8px 16px rgba(160, 110, 90, 0.16)',
            cursor: 'pointer',
            transition: 'transform 120ms ease, box-shadow 120ms ease',
          }}
          onMouseDown={(event) => {
            event.currentTarget.style.transform = 'scale(0.98)'
            event.currentTarget.style.boxShadow = '0 4px 10px rgba(160, 110, 90, 0.2)'
          }}
          onMouseUp={(event) => {
            event.currentTarget.style.transform = 'scale(1)'
            event.currentTarget.style.boxShadow = '0 8px 16px rgba(160, 110, 90, 0.16)'
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform = 'scale(1)'
            event.currentTarget.style.boxShadow = '0 8px 16px rgba(160, 110, 90, 0.16)'
          }}
        >
          <span style={{ display: 'grid', gap: 5 }}>
            <span style={{ display: 'block', width: 20, height: 2, background: '#7a4a3a', borderRadius: 999 }} />
            <span style={{ display: 'block', width: 20, height: 2, background: '#7a4a3a', borderRadius: 999 }} />
            <span style={{ display: 'block', width: 20, height: 2, background: '#7a4a3a', borderRadius: 999 }} />
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
              border: '1px solid #ead8d0',
              borderRadius: 18,
              boxShadow: '0 12px 22px rgba(160, 110, 90, 0.16)',
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
                  border: '1px solid #ead8d0',
                  background: '#fffbf7',
                  color: '#7a4a3a',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'transform 140ms ease, box-shadow 140ms ease, background 140ms ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = '#f3e7de'
                  event.currentTarget.style.boxShadow = '0 6px 12px rgba(160, 110, 90, 0.18)'
                  event.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = '#fffbf7'
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
                  border: '1px solid #ead8d0',
                  background: '#fffbf7',
                  color: '#7a4a3a',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'transform 140ms ease, box-shadow 140ms ease, background 140ms ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = '#f3e7de'
                  event.currentTarget.style.boxShadow = '0 6px 12px rgba(160, 110, 90, 0.18)'
                  event.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = '#fffbf7'
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
                  border: '1px solid #ead8d0',
                  background: '#fffbf7',
                  color: '#7a4a3a',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'transform 140ms ease, box-shadow 140ms ease, background 140ms ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = '#f3e7de'
                  event.currentTarget.style.boxShadow = '0 6px 12px rgba(160, 110, 90, 0.18)'
                  event.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = '#fffbf7'
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
            background: 'linear-gradient(120deg, #fff2ea 0%, #f3c8a4 45%, #d86b2f 100%)',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            textShadow: 'none',
            WebkitTextStroke: '0.6px rgba(122, 74, 58, 0.85)',
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
          height: '100svh',
          paddingTop: 64,
          background:
            'radial-gradient(circle at top, #fdf8f5 0%, #f1e6de 45%, #ffffff 100%)',
          overflow: 'hidden',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(40% 40% at 10% 20%, rgba(255, 233, 210, 0.95) 0%, rgba(255, 233, 210, 0) 70%),' +
              'radial-gradient(45% 45% at 90% 80%, rgba(255, 210, 170, 0.9) 0%, rgba(255, 210, 170, 0) 75%)',
            backgroundSize: '200% 200%',
            backgroundPosition: '0% 0%',
            opacity: 0.9,
            animation: 'shine-sweep 14s linear infinite',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          {children}
        </div>
        <style>{`
          @keyframes shine-sweep {
            0% { background-position: 0% 0%; }
            50% { background-position: 100% 80%; }
            100% { background-position: 0% 0%; }
          }
        `}</style>
      </div>
    </>
  )
}
