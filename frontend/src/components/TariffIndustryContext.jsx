import React from 'react'
import { motion } from 'framer-motion'

const easing = [0.16, 1, 0.3, 1]

const INDUSTRY_CARDS = [
  {
    name: 'Semiconductors',
    severity: 'High exposure',
    color: 'var(--negative)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <rect x="4" y="8" width="16" height="8" rx="1" />
        <path d="M8 12v0M12 12v0M16 12v0" />
        <path d="M8 8V6M12 8V5M16 8V6" />
        <path d="M8 16v2M12 16v3M16 16v2" />
      </svg>
    ),
    description: 'Heavily reliant on Taiwan and South Korea manufacturing — among the most tariff-sensitive categories in this model.',
  },
  {
    name: 'Consumer Electronics',
    severity: 'Elevated exposure',
    color: 'var(--warning)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <rect x="8" y="4" width="8" height="4" rx="1" />
        <path d="M9 20h6" />
      </svg>
    ),
    description: 'Significant exposure from China-based manufacturing and supply chains under trade war conditions.',
  },
  {
    name: 'Pharmaceuticals',
    severity: 'Elevated exposure',
    color: 'var(--warning)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <path d="M8 21h8a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
        <path d="M12 7V3" />
        <path d="M9 5h6" />
      </svg>
    ),
    description: 'EU and Indian API supply chains face elevated import cost pressure under escalation scenarios.',
  },
  {
    name: 'Automotive',
    severity: 'Medium exposure',
    color: 'var(--accent-primary)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.6-1.5C18.4 11.1 16 11 16 11s-1.3-1.5-2.7-2.1c-.7-.3-1.6-.3-2.3 0C9.7 9.5 8 11 8 11s-2.4.1-4.4.5C2.7 11.7 2 12.5 2 13.4v3c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
    description: 'Mexico-based assembly faces cross-border tariff exposure under trade war conditions.',
  },
  {
    name: 'Industrial Machinery',
    severity: 'Medium exposure',
    color: 'var(--accent-primary)',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
        <path d="M12 2a10 10 0 1 0 10 10" />
        <path d="M12 12v8" />
        <path d="M8 16h8" />
        <path d="M7 8h.01M17 8h.01" />
      </svg>
    ),
    description: 'Industrial equipment and machinery imports carry moderate tariff risk in escalation scenarios.',
  },
]

export default function TariffIndustryContext() {
  return (
    <section
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
            Industry Context
          </div>
          <h2 className="section-heading" style={{ color: '#ffffff', margin: '0 0 16px' }}>
            Sectors under the most pressure
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-tertiary)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            These industries face the greatest tariff exposure in the modeled scenarios — illustrative context to ground your portfolio analysis.
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
          }}
        >
          {INDUSTRY_CARDS.map((card, idx) => (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: easing }}
              viewport={{ once: true }}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {card.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {card.name}
                </h3>
              </div>

              <span
                style={{
                  display: 'inline-flex',
                  alignSelf: 'flex-start',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: `1px solid ${card.color}`,
                  color: card.color,
                  background: `${card.color}15`,
                }}
              >
                {card.severity}
              </span>

              <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.6 }}>
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
