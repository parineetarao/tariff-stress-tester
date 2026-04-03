import React from 'react'
import { motion } from 'framer-motion'

export default function RiskSummaryCard({ summary, computationTime }) {
  const sentences = summary.split('. ').filter(s => s.trim())

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'linear-gradient(135deg, #0e0e17 0%, #0c1712 100%)',
        border: '1px solid rgba(0,212,170,0.15)',
        borderLeft: '3px solid #00d4aa',
        borderRadius: '16px',
        padding: '28px 32px',
        width: '100%',
      }}
    >
      {/* Header Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        {/* Left: AI icon and label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '14px', height: '14px', color: '#00d4aa' }}
          >
            <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
            <path d="M12 12v4M8 16h8" />
          </svg>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#00d4aa',
            }}
          >
            AI Risk Summary
          </span>
        </div>

        {/* Right: Computation time pill */}
        <div
          style={{
            height: '26px',
            padding: '0 10px',
            borderRadius: '6px',
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '12px', height: '12px', color: '#8b8b9e' }}
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span
            style={{
              fontSize: '12px',
              fontFamily: '"JetBrains Mono", "Courier New", monospace',
              color: '#8b8b9e',
            }}
          >
            Computed in {computationTime.toFixed(2)}s
          </span>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          marginBottom: '20px',
        }}
      />

      {/* Sentences */}
      <div>
        {sentences.map((sentence, i) => (
          <div
            key={i}
            style={{
              padding: '12px 0',
              borderBottom: i < sentences.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              fontSize: i === 0 ? '15px' : '14px',
              color: i === 0 ? '#c8c8d4' : '#8b8b9e',
              lineHeight: 1.8,
            }}
          >
            {sentence.trim()}.
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div
        style={{
          fontSize: '11px',
          color: '#3d3d50',
          marginTop: '20px',
        }}
      >
        Not financial advice. For educational purposes only.
      </div>
    </motion.div>
  )
}
