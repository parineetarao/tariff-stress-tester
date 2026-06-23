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
          width: '100%',
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Logo and company name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Stock Arrow + Candlesticks Logo Badge */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0,212,170,0.12)',
              border: '1px solid rgba(0,212,170,0.25)',
              color: '#00d4aa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '22px', height: '22px' }}>
              {/* Zigzag Arrow */}
              <path d="M3 18 L8 12 L12 15 L16 9 L21 14 L21 4 L17 4" fill="none" stroke="currentColor" strokeWidth="2.2" />
              {/* Small Candlesticks */}
              <rect x="7" y="10" width="2" height="4" rx="0.5" fill="currentColor" opacity="0.7" />
              <line x1="8" y1="9" x2="8" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <rect x="11" y="11" width="2" height="3" rx="0.5" fill="currentColor" opacity="0.7" />
              <line x1="12" y1="10" x2="12" y2="15" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <rect x="15" y="7" width="2" height="5" rx="0.5" fill="currentColor" opacity="0.7" />
              <line x1="16" y1="6" x2="16" y2="13" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            </svg>
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
            href="https://github.com/parineetarao/tariff-stress-tester"
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
