import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const VIEW_W = 1000
const VIEW_H = 520

const FLOWS = [
  {
    id: 'taiwan',
    source: 'Taiwan',
    category: 'Semiconductors',
    color: 'var(--negative)',
    fillOpacity: 0.22,
    halfWidth: 24,
    sourceY: 96,
    destY: 210,
    tooltipLabel: 'Taiwan → US · Semiconductors',
    stat: 'Taiwan supplies an estimated 60%+ of advanced semiconductor imports to the US.',
    statNote: 'Illustrative context — not live data',
  },
  {
    id: 'china',
    source: 'China',
    category: 'Consumer Electronics',
    color: 'var(--warning)',
    fillOpacity: 0.2,
    halfWidth: 20,
    sourceY: 191,
    destY: 235,
    tooltipLabel: 'China → US · Consumer Electronics',
    stat: '$150B+ in annual US consumer electronics imports originate from China.',
    statNote: 'Illustrative context — not live data',
  },
  {
    id: 'eu',
    source: 'European Union',
    category: 'Pharmaceuticals',
    color: 'var(--warning)',
    fillOpacity: 0.18,
    halfWidth: 17,
    sourceY: 286,
    destY: 260,
    tooltipLabel: 'EU → US · Pharmaceuticals',
    stat: 'The EU provides roughly 45% of US active pharmaceutical ingredient imports.',
    statNote: 'Illustrative context — not live data',
  },
  {
    id: 'mexico',
    source: 'Mexico',
    category: 'Automotive',
    color: 'var(--accent-primary)',
    fillOpacity: 0.16,
    halfWidth: 14,
    sourceY: 381,
    destY: 285,
    tooltipLabel: 'Mexico → US · Automotive',
    stat: 'Mexico accounts for ~38% of US automotive parts imports under USMCA corridors.',
    statNote: 'Illustrative context — not live data',
  },
]

const SOURCE_X = 192
const DEST_X = 768
const easing = [0.16, 1, 0.3, 1]

function flowControlPoints(sourceY, destY) {
  const dx = DEST_X - SOURCE_X
  return {
    p0: { x: SOURCE_X, y: sourceY },
    p1: { x: SOURCE_X + dx * 0.38, y: sourceY },
    p2: { x: SOURCE_X + dx * 0.62, y: destY },
    p3: { x: DEST_X, y: destY },
  }
}

function ribbonPath(p0, p1, p2, p3, halfWidth) {
  const hw = halfWidth
  const endScale = 0.55
  const topStart = { x: p0.x, y: p0.y - hw }
  const topEnd = { x: p3.x, y: p3.y - hw * endScale }
  const botEnd = { x: p3.x, y: p3.y + hw * endScale }
  const botStart = { x: p0.x, y: p0.y + hw }

  return [
    `M ${topStart.x} ${topStart.y}`,
    `C ${p1.x} ${p1.y - hw} ${p2.x} ${p2.y - hw * endScale} ${topEnd.x} ${topEnd.y}`,
    `L ${botEnd.x} ${botEnd.y}`,
    `C ${p2.x} ${p2.y + hw * endScale} ${p1.x} ${p1.y + hw} ${botStart.x} ${botStart.y}`,
    'Z',
  ].join(' ')
}

function centerLinePath(p0, p1, p2, p3) {
  return `M ${p0.x} ${p0.y} C ${p1.x} ${p1.y} ${p2.x} ${p2.y} ${p3.x} ${p3.y}`
}

function SourceNode({ flow, index, active, dimmed, onEnter, onLeave }) {
  const tops = [60, 155, 250, 345]

  return (
    <foreignObject
      x={24}
      y={tops[index]}
      width={168}
      height={72}
      style={{ overflow: 'visible' }}
    >
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        className={`tariff-node tariff-source-node${active ? ' tariff-node-active' : ''}${dimmed ? ' tariff-node-dimmed' : ''}`}
        style={{ borderColor: flow.color }}
        onMouseEnter={() => onEnter(flow.id)}
        onMouseLeave={onLeave}
        role="presentation"
      >
        <div className="tariff-node-marker" style={{ backgroundColor: flow.color }} />
        <div>
          <div className="tariff-node-label">{flow.source}</div>
          <div className="tariff-node-subtitle">{flow.category}</div>
        </div>
      </div>
    </foreignObject>
  )
}

export default function TariffFlowDiagram() {
  const [activeId, setActiveId] = useState(null)
  const [tooltip, setTooltip] = useState(null)

  const handleEnter = useCallback((flowId, clientX, clientY) => {
    setActiveId(flowId)
    const flow = FLOWS.find((f) => f.id === flowId)
    if (flow && clientX != null) {
      setTooltip({ flow, x: clientX, y: clientY })
    } else if (flow) {
      setTooltip({ flow, x: null, y: null })
    }
  }, [])

  const handleMove = useCallback(
    (e, flowId) => {
      if (activeId === flowId) {
        setTooltip((prev) =>
          prev ? { ...prev, x: e.clientX, y: e.clientY } : null,
        )
      }
    },
    [activeId],
  )

  const handleLeave = useCallback(() => {
    setActiveId(null)
    setTooltip(null)
  }, [])

  const flowOpacity = (flow) => {
    if (!activeId) return flow.fillOpacity
    return activeId === flow.id ? flow.fillOpacity + 0.12 : flow.fillOpacity * 0.4
  }

  const strokeOpacity = (flow) => {
    if (!activeId) return 1
    return activeId === flow.id ? 1 : 0.35
  }

  return (
    <section
      style={{
        position: 'relative',
        background: 'var(--bg-base)',
        padding: '80px clamp(16px, 4vw, 80px)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 55% 45% at 55% 50%, rgba(0,212,170,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

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
            aria-label="Schematic diagram of US import trade flows and tariff exposure severity"
          >
            <defs>
              <pattern id="tariff-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="url(#tariff-grid)" />

            {FLOWS.map((flow, idx) => {
              const { p0, p1, p2, p3 } = flowControlPoints(flow.sourceY, flow.destY)
              const ribbon = ribbonPath(p0, p1, p2, p3, flow.halfWidth)
              const center = centerLinePath(p0, p1, p2, p3)
              const isActive = activeId === flow.id

              return (
                <motion.g
                  key={flow.id}
                  className="tariff-flow-group"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: idx * 0.15, ease: easing }}
                  viewport={{ once: true }}
                  onMouseEnter={(e) => handleEnter(flow.id, e.clientX, e.clientY)}
                  onMouseMove={(e) => handleMove(e, flow.id)}
                  onMouseLeave={handleLeave}
                  style={{ cursor: 'pointer' }}
                >
                  <path
                    d={ribbon}
                    fill={flow.color}
                    opacity={flowOpacity(flow)}
                    style={{ transition: 'opacity 200ms ease' }}
                  />
                  <path
                    d={center}
                    fill="none"
                    stroke={flow.color}
                    strokeWidth={isActive ? 2 : 1.5}
                    strokeOpacity={strokeOpacity(flow)}
                    className="tariff-flow-centerline"
                    style={{ transition: 'stroke-opacity 200ms ease, stroke-width 200ms ease' }}
                  />
                </motion.g>
              )
            })}

            {FLOWS.map((flow, index) => (
              <SourceNode
                key={flow.id}
                flow={flow}
                index={index}
                active={activeId === flow.id}
                dimmed={activeId != null && activeId !== flow.id}
                onEnter={(id) => {
                  setActiveId(id)
                  const f = FLOWS.find((item) => item.id === id)
                  setTooltip({ flow: f, x: null, y: null })
                }}
                onLeave={handleLeave}
              />
            ))}

            <foreignObject x={768} y={175} width={210} height={130} style={{ overflow: 'visible' }}>
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                className="tariff-node tariff-dest-node"
                style={{ borderColor: 'var(--accent-primary)' }}
              >
                <div className="tariff-dest-badge">4 trade corridors</div>
                <div className="tariff-node-label">United States Imports</div>
                <div className="tariff-node-subtitle tariff-dest-subtitle">
                  Primary destination for tariff-sensitive goods in this model
                </div>
              </div>
            </foreignObject>
          </svg>

          {tooltip?.flow && (
            <div
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
              <div className="tariff-tooltip-label">{tooltip.flow.tooltipLabel}</div>
              <div className="tariff-tooltip-stat">{tooltip.flow.stat}</div>
              <div className="tariff-tooltip-note">{tooltip.flow.statNote}</div>
            </div>
          )}

          <div className="tariff-severity-legend">
            {[
              { color: 'var(--negative)', label: 'High tariff exposure' },
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
