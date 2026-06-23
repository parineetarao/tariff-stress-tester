import React from 'react'
import { motion } from 'framer-motion'

const ENTRIES = [
  {
    year: '2018',
    headline: 'First trade war escalation begins',
    description:
      'Section 301 tariffs on Chinese imports mark the opening phase of sustained US–China trade confrontation.',
  },
  {
    year: '2019',
    headline: 'SOX semiconductor index falls 20%+ amid tariff rounds',
    description:
      'Repeated tariff rounds hit chip supply chains; the PHLX Semiconductor Index drops sharply as investors price in trade risk.',
  },
  {
    year: '2025',
    headline: 'New tariff measures across technology and pharma imports',
    description:
      'Expanded duties target semiconductors, consumer electronics, and pharmaceutical inputs — widening the sectors under pressure.',
  },
  {
    year: '2026',
    headline: 'Markets face renewed escalation risk',
    description:
      'Portfolio managers today must stress-test holdings against further tariff escalation — the scenario this tool models.',
    present: true,
  },
]

const easing = [0.16, 1, 0.3, 1]

function TimelineEntry({ entry, index }) {
  return (
    <motion.li
      className="timeline-entry"
      initial={{ opacity: 0, x: -12 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: easing }}
      viewport={{ once: true, margin: '-40px' }}
    >
      <div className="timeline-entry-marker">
        <motion.div
          className="timeline-dot"
          initial={{ scale: 0.6, opacity: 0.35 }}
          whileInView={{
            scale: 1,
            opacity: 1,
            boxShadow: entry.present
              ? '0 0 0 4px rgba(0,212,170,0.15), 0 0 16px rgba(0,212,170,0.45)'
              : '0 0 0 3px rgba(0,212,170,0.12), 0 0 12px rgba(0,212,170,0.35)',
          }}
          transition={{ duration: 0.45, delay: index * 0.12 + 0.15, ease: easing }}
          viewport={{ once: true, margin: '-60px' }}
        />
      </div>

      <div className="timeline-card">
        <div className="timeline-year">
          {entry.year}
          {entry.present && (
            <span className="timeline-present-badge">Today</span>
          )}
        </div>
        <h3 className="timeline-headline">{entry.headline}</h3>
        <p className="timeline-description">{entry.description}</p>
      </div>
    </motion.li>
  )
}

export default function TimelineNarrative() {
  return (
    <section className="timeline-section">
      <div className="timeline-inner">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easing }}
          viewport={{ once: true }}
          className="timeline-header"
        >
          <div className="timeline-label">Historical Context</div>
          <h2 className="timeline-title">How we got here</h2>
          <p className="timeline-subtitle">
            Four years of escalating trade policy set the stage for today&apos;s portfolio risk.
          </p>
        </motion.div>

        <div className="timeline-track">
          <div className="timeline-spine" aria-hidden="true">
            <div className="timeline-spine-bg" />
            <motion.div
              className="timeline-spine-fill"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              transition={{ duration: 1.4, ease: easing }}
              viewport={{ once: true, margin: '-80px' }}
            />
          </div>

          <ol className="timeline-list">
            {ENTRIES.map((entry, index) => (
              <TimelineEntry
                key={entry.year}
                entry={entry}
                index={index}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
