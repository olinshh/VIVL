'use client'

import Link from 'next/link'
import { Inter } from 'next/font/google'
import { useState } from 'react'

const logoFont = Inter({ subsets: ['latin'], weight: ['600', '700'] })

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
          padding: '0 24px',
          borderBottom: '1px solid rgba(71, 85, 105, 0.5)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.98) 100%)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
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
            border: '1px solid rgba(71, 85, 105, 0.5)',
            borderRadius: 8,
            background: 'rgba(51, 65, 85, 0.5)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseDown={(event) => {
            event.currentTarget.style.transform = 'scale(0.95)'
            event.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.4)'
          }}
          onMouseUp={(event) => {
            event.currentTarget.style.transform = 'scale(1)'
            event.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform = 'scale(1)'
            event.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          <span style={{ display: 'grid', gap: 4 }}>
            <span style={{ display: 'block', width: 18, height: 2, background: '#f1f5f9', borderRadius: 4 }} />
            <span style={{ display: 'block', width: 18, height: 2, background: '#f1f5f9', borderRadius: 4 }} />
            <span style={{ display: 'block', width: 18, height: 2, background: '#f1f5f9', borderRadius: 4 }} />
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
              background: 'rgba(15, 23, 42, 0.97)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: 12,
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(20px)',
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
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  background: 'rgba(51, 65, 85, 0.5)',
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                  event.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                  event.currentTarget.style.color = '#60a5fa'
                  event.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                  event.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)'
                  event.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)'
                  event.currentTarget.style.color = '#94a3b8'
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
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  background: 'rgba(51, 65, 85, 0.5)',
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                  event.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                  event.currentTarget.style.color = '#60a5fa'
                  event.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                  event.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)'
                  event.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)'
                  event.currentTarget.style.color = '#94a3b8'
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
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: '1px solid rgba(71, 85, 105, 0.5)',
                  background: 'rgba(51, 65, 85, 0.5)',
                  color: '#94a3b8',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'
                  event.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)'
                  event.currentTarget.style.color = '#60a5fa'
                  event.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                  event.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = 'rgba(51, 65, 85, 0.5)'
                  event.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.5)'
                  event.currentTarget.style.color = '#94a3b8'
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
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textDecoration: 'none',
          }}
        >
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: 10, 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 20,
            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
          }}>🛡️</div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              textTransform: 'uppercase',
            }}
            className={logoFont.className}
          >
            VIVL
          </span>
        </Link>
      </header>

      <div
        style={{
          height: '100svh',
          paddingTop: 64,
          background: 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.95) 100%)',
          overflow: 'hidden',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          {children}
        </div>
      </div>
    </>
  )
}
