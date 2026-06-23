import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { geoNaturalEarth1, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import countriesData from 'world-atlas/countries-110m.json'

const VIEW_W = 1000
const VIEW_H = 520

const HIGHLIGHTED_COUNTRIES = {
  'United States of America': { color: 'var(--text-primary)', key: 'us' },
  'China': { color: 'var(--warning)', key: 'china' },
  'Taiwan': { color: 'var(--negative)', key: 'taiwan' },
  'Germany': { color: 'var(--warning)', key: 'eu' },
  'Mexico': { color: 'var(--accent-primary)', key: 'mexico' },
  'Korea': { color: 'var(--negative)', key: 'southkorea' },
}

const LOCATIONS = [
  { id: 'us', name: 'United States', color: 'var(--text-primary)', coords: [-77.0, 38.9] },
  { id: 'china', name: 'China', color: 'var(--warning)', coords: [116.4, 39.9] },
  { id: 'taiwan', name: 'Taiwan', color: 'var(--negative)', coords: [121.5, 25.0] },
  { id: 'eu', name: 'European Union', color: 'var(--warning)', coords: [10.4, 51.2] },
  { id: 'mexico', name: 'Mexico', color: 'var(--accent-primary)', coords: [-99.1, 19.4] },
  { id: 'southkorea', name: 'South Korea', color: 'var(--negative)', coords: [126.9, 37.5] },
]

const FLOWS = [
  {
    id: 'taiwan',
    source: 'Taiwan',
    destination: 'United States',
    category: 'Semiconductors',
    color: 'var(--negative)',
    tooltipLabel: 'Taiwan -> United States',
    stat: 'Taiwan supplies an estimated 60%+ of advanced semiconductor imports to the US.',
    statNote: 'Illustrative context — not live data',
  },
  {
    id: 'china',
    source: 'China',
    destination: 'United States',
    category: 'Consumer Electronics',
    color: 'var(--warning)',
    tooltipLabel: 'China -> United States',
    stat: '$150B+ in annual US consumer electronics imports originate from China.',
    statNote: 'Illustrative context — not live data',
  },
  {
    id: 'eu',
    source: 'European Union',
    destination: 'United States',
    category: 'Pharmaceuticals',
    color: 'var(--warning)',
    tooltipLabel: 'EU -> United States',
    stat: 'The EU provides roughly 45% of US active pharmaceutical ingredient imports.',
    statNote: 'Illustrative context — not live data',
  },
  {
    id: 'mexico',
    source: 'Mexico',
    destination: 'United States',
    category: 'Automotive',
    color: 'var(--accent-primary)',
    tooltipLabel: 'Mexico -> United States',
    stat: 'Mexico accounts for ~38% of US automotive parts imports under USMCA corridors.',
    statNote: 'Illustrative context — not live data',
  },
  {
    id: 'southkorea',
    source: 'South Korea',
    destination: 'United States',
    category: 'Memory Chips & Electronics',
    color: 'var(--negative)',
    tooltipLabel: 'South Korea -> United States',
    stat: 'South Korea is a leading exporter of memory chips and consumer electronics to the US.',
    statNote: 'Illustrative context — not live data',
  },
]

const easing = [0.16, 1, 0.3, 1]

function createAngularArcPath(source, dest) {
  const midX = (source[0] + dest[0]) / 2
  const midY = (source[1] + dest[1]) / 2
  const dx = dest[0] - source[0]
  const dy = dest[1] - source[1]
  const dist = Math.sqrt(dx * dx + dy * dy)
  const offset = dist * 0.12
  const kinkX = midX - (dy / dist) * offset
  const kinkY = midY + (dx / dist) * offset
  return `M ${source[0]} ${source[1]} L ${kinkX} ${kinkY} L ${dest[0]} ${dest[1]}`
}

export default function WorldExposureMap() {
  const [activeId, setActiveId] = useState(null)
  const [tooltip, setTooltip] = useState(null)
  const containerRef = useRef(null)

  const { countries, pathGenerator, projection } = useMemo(() => {
    const proj = geoNaturalEarth1()
      .fitSize([VIEW_W, VIEW_H], feature(countriesData, countriesData.objects.countries))
    
    const pathGen = geoPath().projection(proj)
    
    return {
      countries: feature(countriesData, countriesData.objects.countries).features,
      pathGenerator: pathGen,
      projection: proj,
    }
  }, [])

  const locationPositions = useMemo(() => {
    return LOCATIONS.map(loc => ({
      ...loc,
      position: projection(loc.coords),
    }))
  }, [projection])

  const locationTooltips = useMemo(() => ({
    'us': {
      title: '5 Trade Corridors',
      subtitle: 'United States Imports',
      description: 'Primary destination for tariff-sensitive goods in this model',
      note: 'Illustrative context — not live data',
    },
    'taiwan': {
      title: 'Taiwan -> United States',
      subtitle: 'Semiconductors',
      description: 'Taiwan supplies an estimated 60%+ of advanced semiconductor imports to the US.',
      note: 'Illustrative context — not live data',
    },
    'china': {
      title: 'China -> United States',
      subtitle: 'Consumer Electronics',
      description: '$150B+ in annual US consumer electronics imports originate from China.',
      note: 'Illustrative context — not live data',
    },
    'eu': {
      title: 'EU -> United States',
      subtitle: 'Pharmaceuticals',
      description: 'The EU provides roughly 45% of US active pharmaceutical ingredient imports.',
      note: 'Illustrative context — not live data',
    },
    'mexico': {
      title: 'Mexico -> United States',
      subtitle: 'Automotive',
      description: 'Mexico accounts for ~38% of US automotive parts imports under USMCA corridors.',
      note: 'Illustrative context — not live data',
    },
    'southkorea': {
      title: 'South Korea -> United States',
      subtitle: 'Memory Chips & Electronics',
      description: 'South Korea is a leading exporter of memory chips and consumer electronics to the US.',
      note: 'Illustrative context — not live data',
    },
  }), [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveId(null)
        setTooltip(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleEnter = useCallback((flowId, clientX, clientY) => {
    setActiveId(flowId)
    setTooltip({ flowId, x: clientX, y: clientY })
  }, [])

  const handleMove = useCallback(
    (e, flowId) => {
      if (activeId === flowId && tooltip?.flowId === flowId) {
        setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))
      }
    },
    [activeId, tooltip]
  )

  const handleLeave = useCallback(() => {
    setActiveId(null)
    setTooltip(null)
  }, [])

  const handleClick = useCallback((flowId, clientX, clientY) => {
    if (activeId === flowId) {
      setActiveId(null)
      setTooltip(null)
    } else {
      setActiveId(flowId)
      setTooltip({ flowId, x: clientX, y: clientY })
    }
  }, [activeId])

  const arcOpacity = (flow) => {
    if (!activeId) return 0.5
    return activeId === flow ? 1 : 0.25
  }

  const arcWidth = (flow) => {
    if (!activeId) return 1.5
    return activeId === flow ? 2.5 : 1.5
  }

  const usPosition = locationPositions.find(l => l.id === 'us')?.position

  return (
    <section
      ref={containerRef}
      style={{
        position: 'relative',
        background: 'var(--bg-base)',
        padding: '80px clamp(16px, 4vw, 80px)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <div className="label-text" style={{ color: '#00d4aa', marginBottom: '12px' }}>
            Why This Matters
          </div>
          <h2 className="section-heading" style={{ color: '#ffffff', margin: '0 0 16px' }}>
            Where tariff pressure concentrates
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-tertiary)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            Under the Trade War scenario, import corridors into the US carry uneven tariff
            severity — semiconductors face the sharpest pressure in this model.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.99 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: easing }}
          viewport={{ once: true }}
          className="tariff-diagram-shell"
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            width="100%"
            height="auto"
            className="tariff-diagram-svg"
            role="img"
            aria-label="Flat 2D world map of US import trade flows and tariff exposure"
          >
            <defs>
              <pattern id="coord-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(139,139,158,0.08)" strokeWidth="0.5" />
              </pattern>
              <linearGradient id="scanlines" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(139,139,158,0.03)" />
                <stop offset="50%" stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(139,139,158,0.03)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#coord-grid)" />
            <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#scanlines)" />

            {/* Render countries */}
            {countries.map((country) => {
              const highlight = HIGHLIGHTED_COUNTRIES[country.properties.name]
              const isHighlighted = !!highlight
              return (
                <path
                  key={country.id}
                  d={pathGenerator(country)}
                  fill={isHighlighted ? highlight.color : 'var(--bg-surface)'}
                  fillOpacity={isHighlighted ? 0.15 : 0.2}
                  stroke={isHighlighted ? highlight.color : 'var(--border-subtle)'}
                  strokeWidth={isHighlighted ? 1.5 : 1}
                  strokeOpacity={isHighlighted ? 1 : 0.3}
                />
              )
            })}

            {/* Render arcs */}
            {FLOWS.map((flow, idx) => {
              const sourceLoc = locationPositions.find(l => l.id === flow.id)
              if (!sourceLoc || !usPosition) return null
              
              const path = createAngularArcPath(sourceLoc.position, usPosition)
              const isActive = activeId === flow.id

              return (
                <g key={flow.id}>
                  <style>{`
                    @keyframes tariff-flow-dash-${flow.id} {
                      to { stroke-dashoffset: -20; }
                    }
                  `}</style>
                  <motion.path
                    d={path}
                    fill="none"
                    stroke={flow.color}
                    strokeWidth={arcWidth(flow.id)}
                    opacity={arcOpacity(flow.id)}
                    strokeDasharray="4 6"
                    style={{
                      transition: 'opacity 200ms ease, stroke-width 200ms ease',
                      animation: `tariff-flow-dash-${flow.id} 8s linear infinite`,
                    }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: arcOpacity(flow.id) }}
                    transition={{ duration: 0.6, delay: idx * 0.15, ease: easing }}
                    viewport={{ once: true }}
                    onMouseEnter={(e) => handleEnter(flow.id, e.clientX, e.clientY)}
                    onMouseMove={(e) => handleMove(e, flow.id)}
                    onMouseLeave={handleLeave}
                    onClick={(e) => handleClick(flow.id, e.clientX, e.clientY)}
                    cursor="pointer"
                  />
                </g>
              )
            })}

            {/* Render markers */}
            {locationPositions.map((loc, idx) => (
              <g key={loc.id}>
                <motion.circle
                  cx={loc.position[0]}
                  cy={loc.position[1]}
                  r={6}
                  fill={loc.color}
                  filter="url(#glow)"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.6 + idx * 0.1,
                  }}
                  viewport={{ once: true }}
                  onMouseEnter={(e) => handleEnter(loc.id, e.clientX, e.clientY)}
                  onMouseMove={(e) => handleMove(e, loc.id)}
                  onMouseLeave={handleLeave}
                  onClick={(e) => handleClick(loc.id, e.clientX, e.clientY)}
                  style={{ cursor: 'pointer' }}
                />
                <circle cx={loc.position[0]} cy={loc.position[1]} r={3} fill="var(--bg-surface)" />

                <text
                  x={loc.position[0]}
                  y={loc.position[1] + 18}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--text-tertiary)"
                  fontFamily="Inter, sans-serif"
                >
                  {loc.name}
                </text>
              </g>
            ))}
          </svg>

          <AnimatePresence>
            {tooltip?.flowId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="tariff-diagram-tooltip"
                style={
                  tooltip.x != null
                    ? {
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, calc(-100% - 14px))',
                      }
                    : {
                        left: '50%',
                        bottom: '72px',
                        transform: 'translateX(-50%)',
                      }
                }
              >
                <div className="tariff-tooltip-label">{locationTooltips[tooltip.flowId].title}</div>
                {locationTooltips[tooltip.flowId].subtitle && (
                  <div style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
                    {locationTooltips[tooltip.flowId].subtitle}
                  </div>
                )}
                <div className="tariff-tooltip-stat">{locationTooltips[tooltip.flowId].description}</div>
                <div className="tariff-tooltip-note">{locationTooltips[tooltip.flowId].note}</div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="tariff-severity-legend">
            {[
              { color: 'var(--negative)', label: 'High exposure' },
              { color: 'var(--warning)', label: 'Elevated exposure' },
              { color: 'var(--accent-primary)', label: 'Lower exposure' },
            ].map((item) => (
              <div key={item.label} className="tariff-legend-item">
                <span className="tariff-legend-swatch" style={{ backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
