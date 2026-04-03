import React from 'react'
import { motion } from 'framer-motion'

export default function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        backgroundColor: '#0e0e17',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '64px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
        width: '100%',
      }}
    >
      {/* Animated Bars - The visual centrepiece */}
      <div
        style={{
          height: '48px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
        }}
      >
        <div className="bar-1" style={{ width: '4px', height: '24px', backgroundColor: '#00d4aa', borderRadius: '2px' }} />
        <div className="bar-2" style={{ width: '4px', height: '40px', backgroundColor: '#00d4aa', borderRadius: '2px' }} />
        <div className="bar-3" style={{ width: '4px', height: '32px', backgroundColor: '#00d4aa', borderRadius: '2px' }} />
      </div>

      {/* Heading */}
      <div
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#ffffff',
          textAlign: 'center',
        }}
      >
        Running Monte Carlo Simulation
      </div>

      {/* Subheading */}
      <div
        style={{
          fontSize: '14px',
          color: '#8b8b9e',
          textAlign: 'center',
        }}
      >
        Simulating 10,000 portfolio paths across 3 tariff scenarios
      </div>

      {/* Status Strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#3d3d50',
          }}
        >
          10,000 paths
        </div>
        <div
          style={{
            width: '1px',
            height: '12px',
            backgroundColor: 'rgba(255,255,255,0.07)',
          }}
        />
        <div
          style={{
            fontSize: '12px',
            color: '#3d3d50',
          }}
        >
          3 scenarios
        </div>
        <div
          style={{
            width: '1px',
            height: '12px',
            backgroundColor: 'rgba(255,255,255,0.07)',
          }}
        />
        <div
          style={{
            fontSize: '12px',
            color: '#3d3d50',
          }}
        >
          180 days
        </div>
      </div>
    </motion.div>
  )
}
