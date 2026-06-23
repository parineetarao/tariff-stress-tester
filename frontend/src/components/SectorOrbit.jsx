import React, { useState } from 'react'
import { motion } from 'framer-motion'

function getExposureColor(score) {
  if (score >= 4) return '#ef4444'
  if (score >= 3) return '#f59e0b'
  return '#00d4aa'
}

const CX = 200
const CY = 200
// Higher exposure_score = farther from center (risk radiates outward from portfolio core)
const BASE_RADIUS = 55
const RADIUS_SPREAD = 95
const MIN_CIRCLE_R = 14
const MAX_WEIGHT_RADIUS = 22

export default function SectorOrbit({ results }) {
  const holdingsExposure = results.holdings_exposure
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const maxWeight = Math.max(...holdingsExposure.map((h) => h.weight), 0.01)

  const positions = holdingsExposure.map((holding, idx) => {
    const angle = (idx / holdingsExposure.length) * Math.PI * 2 - Math.PI / 2
    const radius = BASE_RADIUS + (holding.exposure_score / 5) * RADIUS_SPREAD
    const x = CX + radius * Math.cos(angle)
    const y = CY + radius * Math.sin(angle)
    const circleR = MIN_CIRCLE_R + (holding.weight / maxWeight) * MAX_WEIGHT_RADIUS
    return { holding, x, y, circleR, angle, radius }
  })

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
        <p style={{ fontSize: '12px', color: '#3d3d50', margin: 0 }}>
          Sector sensitivity to import tariffs — orbit view
        </p>
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          maxHeight: '420px',
          margin: '0 auto',
        }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <svg
          viewBox="0 0 400 400"
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        >
          {[1, 2, 3, 4].map((ring) => (
            <circle
              key={ring}
              cx={CX}
              cy={CY}
              r={BASE_RADIUS + (ring / 4) * RADIUS_SPREAD}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={1}
              strokeDasharray="4 6"
            />
          ))}

          {positions.map(({ holding, x, y, circleR }, idx) => {
            const color = getExposureColor(holding.exposure_score)
            const lineOpacity = 0.08 + (holding.exposure_score / 5) * 0.45
            const isHovered = hoveredIdx === idx

            return (
              <g key={idx}>
                <line
                  x1={CX}
                  y1={CY}
                  x2={x}
                  y2={y}
                  stroke={color}
                  strokeWidth={isHovered ? 1.5 : 1}
                  strokeOpacity={isHovered ? lineOpacity + 0.2 : lineOpacity}
                  style={{ transition: 'stroke-opacity 200ms ease' }}
                />
                <g
                  onMouseEnter={(e) => {
                    setHoveredIdx(idx)
                    const container = e.currentTarget.closest('div').getBoundingClientRect()
                    setTooltipPos({
                      x: e.clientX - container.left,
                      y: e.clientY - container.top - 12,
                    })
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? circleR + 4 : circleR}
                    fill={`${color}20`}
                    stroke={color}
                    strokeWidth={isHovered ? 2 : 1.5}
                    style={{
                      transition: 'r 200ms ease, stroke-width 200ms ease',
                      filter: isHovered ? `drop-shadow(0 0 8px ${color}60)` : 'none',
                    }}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill={color}
                    fontSize={circleR > 20 ? 11 : 9}
                    fontWeight={600}
                    fontFamily='"JetBrains Mono", "Courier New", monospace'
                    style={{ pointerEvents: 'none' }}
                  >
                    {holding.ticker}
                  </text>
                </g>
              </g>
            )
          })}

          <circle
            cx={CX}
            cy={CY}
            r={28}
            fill="rgba(0,212,170,0.08)"
            stroke="rgba(0,212,170,0.3)"
            strokeWidth={1.5}
          />
          <text
            x={CX}
            y={CY + 4}
            textAnchor="middle"
            fill="#00d4aa"
            fontSize={9}
            fontWeight={600}
            letterSpacing="0.08em"
          >
            PORTFOLIO
          </text>
        </svg>

        {hoveredIdx !== null && positions[hoveredIdx] && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'absolute',
              left: Math.min(Math.max(tooltipPos.x, 80), 280),
              top: Math.max(tooltipPos.y - 80, 8),
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(10,14,20,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '10px 14px',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: '140px',
            }}
          >
            {(() => {
              const h = positions[hoveredIdx].holding
              const color = getExposureColor(h.exposure_score)
              return (
                <>
                  <div
                    style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '16px',
                      fontWeight: 700,
                      color,
                      marginBottom: '4px',
                    }}
                  >
                    {h.ticker}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8b8b9e', marginBottom: '6px' }}>
                    {h.sector}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color, marginBottom: '2px' }}>
                    {h.exposure_label}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: '"JetBrains Mono", monospace',
                      color: '#3d3d50',
                    }}
                  >
                    Weight: {(h.weight * 100).toFixed(0)}%
                  </div>
                </>
              )
            })()}
          </motion.div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          marginTop: '16px',
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'Low', color: '#00d4aa' },
          { label: 'Moderate', color: '#f59e0b' },
          { label: 'High', color: '#ef4444' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: item.color,
              }}
            />
            <span style={{ fontSize: '11px', color: '#3d3d50' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
