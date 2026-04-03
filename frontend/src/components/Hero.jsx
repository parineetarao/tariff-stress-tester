import React from 'react'
import { motion } from 'framer-motion'

export default function Hero() {
  const scrollToAnalyze = () => {
    const element = document.getElementById('analyze')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const PathsIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ width: '14px', height: '14px' }}
    >
      <path d="M3 12c2-3 5-5 9-5s7 2 9 5" />
      <path d="M3 12c2 3 5 5 9 5s7-2 9-5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  )

  const ScenariosIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ width: '14px', height: '14px' }}
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="20" y2="12" />
      <line x1="3" y1="18" x2="18" y2="18" />
    </svg>
  )

  const GlobeIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: '14px', height: '14px' }}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )

  const easing = [0.16, 1, 0.3, 1]

  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(0,212,170,0.09) 0%, rgba(0,212,170,0.02) 40%, #06060a 70%)',
      }}
    >
      {/* Grid texture overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      {/* Content container */}
      <motion.div
        style={{
          position: 'relative',
          zIndex: 10,
          textAlign: 'center',
          maxWidth: '860px',
          paddingLeft: '32px',
          paddingRight: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '32px',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: easing }}
      >
        {/* Eyebrow badge */}
        <motion.div
          style={{
            height: '28px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            paddingLeft: '12px',
            paddingRight: '12px',
            borderRadius: '999px',
            border: '1px solid rgba(0,212,170,0.2)',
            backgroundColor: 'rgba(0,212,170,0.06)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: easing }}
        >
          <motion.div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#00d4aa',
            }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: '#00d4aa',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Powered by Monte Carlo
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          style={{
            fontSize: 'clamp(52px, 6vw, 78px)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: '#ffffff',
            margin: 0,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: easing }}
        >
          <span style={{ color: 'rgba(255,255,255,0.9)' }}>How exposed is your</span>
          <br />
          <span
            style={{
              backgroundImage: 'linear-gradient(135deg, #00d4aa 20%, #38bdf8 80%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            portfolio to tariffs?
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          style={{
            fontSize: '17px',
            fontWeight: 300,
            lineHeight: 1.8,
            color: '#8b8b9e',
            maxWidth: '500px',
            margin: 0,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: easing }}
        >
            Simulate 10,000 portfolio futures across three US tariff escalation scenarios.
            <br />
            Powered by real market data and Monte Carlo risk analytics.
        </motion.p>

        {/* Stat pills */}
        <motion.div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: easing }}
        >
          {[
            { icon: PathsIcon, label: '10,000 paths' },
            { icon: ScenariosIcon, label: '3 scenarios' },
            { icon: GlobeIcon, label: 'Live data' },
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                height: '32px',
                padding: '0 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
              }}
            >
              <div style={{ color: '#8b8b9e', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#ffffff', whiteSpace: 'nowrap' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          onClick={scrollToAnalyze}
          style={{
            height: '52px',
            paddingLeft: '32px',
            paddingRight: '32px',
            borderRadius: '10px',
            backgroundColor: '#00d4aa',
            color: '#06060a',
            fontSize: '15px',
            fontWeight: 600,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            boxShadow: '0 0 0 1px rgba(0,212,170,0.3), 0 4px 24px rgba(0,212,170,0.15)',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: easing }}
          whileHover={{
            backgroundColor: '#00efbe',
            boxShadow: '0 0 0 1px rgba(0,212,170,0.5), 0 8px 32px rgba(0,212,170,0.25)',
            transform: 'translateY(-1px)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          Run Analysis
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '16px', height: '16px' }}
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </motion.button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          style={{
            width: '1px',
            height: '32px',
            background: 'linear-gradient(180deg, rgba(0,212,170,0.5) 0%, transparent 100%)',
          }}
        />
        <div
          style={{
            fontSize: '11px',
            color: '#8b8b9e',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontWeight: 500,
          }}
        >
          scroll
        </div>
      </motion.div>
    </section>
  )
}
