import React from 'react'
import { motion } from 'framer-motion'

function getExposureColor(score) {
  if (score >= 4) return '#ef4444'
  if (score >= 3) return '#f59e0b'
  return '#00d4aa'
}

export default function ExposureHeatmap({ results }) {
  const holdingsExposure = results.holdings_exposure
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{
        backgroundColor: '#0e0e17',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '32px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#3d3d50',
            marginBottom: '4px',
          }}
        >
          Tariff Exposure
        </div>
        <p
          style={{
            fontSize: '12px',
            color: '#3d3d50',
            margin: 0,
          }}
        >
          Sector sensitivity to import tariffs
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px',
        }}
      >
        {holdingsExposure.map((holding, idx) => {
          const scoreColor = getExposureColor(holding.exposure_score)
          const filledDots = holding.exposure_score

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: `1px solid ${scoreColor}30`,
                borderRadius: '10px',
                padding: '16px',
                transition: 'border-color 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${scoreColor}50`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${scoreColor}30`
              }}
            >
              {/* Top row: ticker and weight */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    fontFamily: '"JetBrains Mono", "Courier New", monospace',
                    color: scoreColor,
                  }}
                >
                  {holding.ticker}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontFamily: '"JetBrains Mono", "Courier New", monospace',
                    color: '#3d3d50',
                  }}
                >
                  {(holding.weight * 100).toFixed(0)}%
                </div>
              </div>

              {/* Sector name */}
              <div
                style={{
                  fontSize: '12px',
                  color: '#3d3d50',
                  marginBottom: '14px',
                }}
              >
                {holding.sector}
              </div>

              {/* Exposure bar */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '10px',
                }}
              >
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div
                    key={dot}
                    style={{
                      flex: 1,
                      height: '3px',
                      borderRadius: '2px',
                      backgroundColor: dot <= filledDots ? scoreColor : 'rgba(255,255,255,0.08)',
                    }}
                  />
                ))}
              </div>

              {/* Exposure label */}
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: scoreColor,
                }}
              >
                {holding.exposure_label}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
