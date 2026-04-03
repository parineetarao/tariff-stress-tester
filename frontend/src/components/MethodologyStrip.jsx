import React from 'react'
import { motion } from 'framer-motion'

export default function MethodologyStrip() {
  const items = [
    {
      number: '01',
      title: 'Monte Carlo Simulation',
      description:
        'Generates 10,000 probabilistic portfolio paths using multivariate normal distributions with empirical correlations between holdings.',
    },
    {
      number: '02',
      title: 'Real Market Data',
      description:
        'Uses live equity prices, volatility surfaces, and correlation matrices from Yahoo Finance to model realistic market dynamics.',
    },
    {
      number: '03',
      title: 'Tariff Modeling',
      description:
        'Applies sector-specific tariff shocks and supply chain disruptions based on historical precedent and current policy frameworks.',
    },
  ]

  return (
    <div
      style={{
        backgroundColor: '#09090f',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '80px clamp(16px, 4vw, 80px)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <h2
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#3d3d50',
            marginBottom: '56px',
            textAlign: 'center',
          }}
        >
          Methodology
        </h2>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
          }}
        >
          {items.map((item, idx) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              viewport={{ once: true }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Number */}
              <div
                style={{
                  fontSize: '52px',
                  fontWeight: 700,
                  fontFamily: '"JetBrains Mono", "Courier New", monospace',
                  color: 'rgba(0,212,170,0.18)',
                }}
              >
                {item.number}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#ffffff',
                  margin: 0,
                }}
              >
                {item.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: '13px',
                  color: '#8b8b9e',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
