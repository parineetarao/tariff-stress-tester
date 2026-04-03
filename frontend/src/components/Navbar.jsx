import React from 'react'
import { motion } from 'framer-motion'

export default function Navbar() {
  const scrollToAnalyze = () => {
    const element = document.getElementById('analyze')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // External link icon SVG
  const ExternalLinkIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: '14px', height: '14px', marginLeft: '4px', display: 'inline' }}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )

  // Right arrow icon SVG
  const ArrowRightIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: '14px', height: '14px', marginLeft: '6px', display: 'inline' }}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )

  return (
    <motion.nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '56px',
        backgroundColor: 'rgba(6,6,10,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
      initial={{ y: -56 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div
        style={{
          height: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Logo and company name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* TST Monogram Badge */}
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0,212,170,0.12)',
              border: '1px solid rgba(0,212,170,0.25)',
              color: '#00d4aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"JetBrains Mono", "Courier New", monospace',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            TST
          </div>

          {/* Company name */}
          <span
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#c8c8d4',
            }}
          >
            Tariff Stress Tester
          </span>
        </div>

        {/* Right: GitHub link and CTA button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* GitHub link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '13px',
              color: '#8b8b9e',
              textDecoration: 'none',
              transition: 'color 150ms ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#c8c8d4'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#8b8b9e'
            }}
          >
            GitHub
            <ExternalLinkIcon />
          </a>

          {/* Run Analysis button */}
          <motion.button
            onClick={scrollToAnalyze}
            style={{
              height: '32px',
              paddingLeft: '16px',
              paddingRight: '16px',
              borderRadius: '6px',
              backgroundColor: '#00d4aa',
              color: '#06060a',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'background-color 150ms ease',
            }}
            whileHover={{ backgroundColor: '#00efbe' }}
            whileTap={{ scale: 0.98 }}
          >
            Run Analysis
            <ArrowRightIcon />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  )
}
