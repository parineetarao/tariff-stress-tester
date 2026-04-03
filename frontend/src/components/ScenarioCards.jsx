import React from 'react'
import { motion } from 'framer-motion'

function ScenarioCard({ title, subtitle, description, riskLevel, accentColor, icon: Icon, delay }) {
  const easing = [0.16, 1, 0.3, 1]

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: easing }}
      viewport={{ once: true }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 0,
        backgroundColor: '#0e0e17',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '28px',
        overflow: 'hidden',
        cursor: 'default',
        transition: 'all 200ms ease',
        minHeight: '260px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
        e.currentTarget.style.backgroundColor = '#11111c'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
        e.currentTarget.style.backgroundColor = '#0e0e17'
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          borderRadius: '2px 2px 0 0',
          backgroundColor: accentColor,
        }}
      />

      {/* Icon container */}
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: `${accentColor}19`,
          border: `1px solid ${accentColor}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          marginTop: '4px',
          color: accentColor,
        }}
      >
        <Icon />
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: '17px',
          fontWeight: 600,
          color: '#ffffff',
          marginBottom: '4px',
          margin: 0,
        }}
      >
        {title}
      </h3>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '13px',
          color: accentColor,
          marginBottom: '16px',
          margin: 0,
        }}
      >
        {subtitle}
      </p>

      {/* Body text */}
      <p
        style={{
          fontSize: '14px',
          color: '#8b8b9e',
          lineHeight: 1.75,
          marginBottom: '24px',
          margin: 0,
          flexGrow: 1,
        }}
      >
        {description}
      </p>

      {/* Risk badge pill */}
      <div
        style={{
          alignSelf: 'flex-start',
          height: '22px',
          padding: '0 10px',
          borderRadius: '6px',
          backgroundColor: `${accentColor}1a`,
          border: `1px solid ${accentColor}33`,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: accentColor,
          }}
        />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: accentColor,
          }}
        >
          {riskLevel}
        </span>
      </div>
    </motion.div>
  )
}

export default function ScenarioCards() {
  const easing = [0.16, 1, 0.3, 1]

  // Shield icon for Baseline
  const ShieldIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: '20px', height: '20px' }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )

  // Trending up icon for Escalation
  const TrendingUpIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: '20px', height: '20px' }}
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )

  // Alert triangle icon for Trade War
  const AlertTriangleIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: '20px', height: '20px' }}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )

  const scenarios = [
    {
      title: 'Baseline',
      subtitle: 'Current tariffs hold',
      description: "Your portfolio under today's trade conditions. Historical volatility and returns without adjustment.",
      riskLevel: 'Low risk',
      accentColor: '#00d4aa',
      icon: ShieldIcon,
      delay: 0,
    },
    {
      title: 'Escalation',
      subtitle: '+30% tech & pharma tariffs',
      description: 'Additional 30% tariffs on semiconductor and pharmaceutical imports. Based on 2018-2019 precedent.',
      riskLevel: 'Elevated risk',
      accentColor: '#f59e0b',
      icon: TrendingUpIcon,
      delay: 0.12,
    },
    {
      title: 'Trade War',
      subtitle: 'Full retaliatory escalation',
      description: 'Blanket retaliatory tariffs trigger risk-off event. Modelled as volatility regime shift plus return compression.',
      riskLevel: 'High risk',
      accentColor: '#ef4444',
      icon: AlertTriangleIcon,
      delay: 0.24,
    },
  ]

  return (
    <section
      style={{
        backgroundColor: '#09090f',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '96px clamp(16px, 4vw, 80px)',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easing }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            marginBottom: '56px',
          }}
        >
          {/* Small label */}
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#3d3d50',
              marginBottom: '16px',
            }}
          >
            THE FRAMEWORK
          </div>

          {/* Main heading */}
          <h2
            style={{
              fontSize: 'clamp(28px, 3vw, 40px)',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              marginBottom: '12px',
              margin: 0,
            }}
          >
            Three scenarios. One portfolio.
          </h2>

          {/* Subtext */}
          <p
            style={{
              fontSize: '15px',
              color: '#8b8b9e',
              marginBottom: '0px',
              margin: 0,
            }}
          >
            We model your exact holdings under each tariff regime
          </p>
        </motion.div>

        {/* Cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {scenarios.map((scenario, i) => (
            <ScenarioCard
              key={i}
              title={scenario.title}
              subtitle={scenario.subtitle}
              description={scenario.description}
              riskLevel={scenario.riskLevel}
              accentColor={scenario.accentColor}
              icon={scenario.icon}
              delay={scenario.delay}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
