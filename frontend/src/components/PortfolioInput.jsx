import React, { useState } from 'react'
import { motion } from 'framer-motion'

export default function PortfolioInput({ onSubmit, onAnalyze, loading, showLabel = true, buttonText = 'Run Analysis — 10,000 simulations' }) {
  const [initialValue, setInitialValue] = useState(100000)
  const [holdings, setHoldings] = useState([
    { ticker: 'AAPL', weight: 40 },
    { ticker: 'NVDA', weight: 35 },
    { ticker: 'JNJ', weight: 25 },
  ])

  const totalWeight = holdings.reduce((sum, h) => sum + (parseFloat(h.weight) || 0), 0)
  const isValid = Math.abs(totalWeight - 100) < 0.01 && holdings.length > 0

  const addHolding = () => {
    setHoldings([...holdings, { ticker: '', weight: '' }])
  }

  const updateHolding = (index, field, value) => {
    const newHoldings = [...holdings]
    newHoldings[index][field] = value
    setHoldings(newHoldings)
  }

  const removeHolding = (index) => {
    if (holdings.length > 1) {
      setHoldings(holdings.filter((_, i) => i !== index))
    }
  }

  const equalWeight = () => {
    const w = (100 / holdings.length).toFixed(2)
    setHoldings(holdings.map(h => ({ ...h, weight: parseFloat(w) })))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValid) return

    const formattedHoldings = holdings.map(h => ({
      ticker: h.ticker.toUpperCase(),
      weight: parseFloat(h.weight) / 100,
    }))

    // Use onAnalyze if provided (comparison mode), otherwise use onSubmit (normal mode)
    const callback = onAnalyze || onSubmit
    callback?.(formattedHoldings, initialValue)
  }

  const weightPercentage = Math.min(totalWeight, 100)
  const weightColor =
    totalWeight === 100 ? '#00d4aa' : totalWeight > 100 ? '#ef4444' : '#f59e0b'

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      style={{
        backgroundColor: '#0e0e17',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '32px',
        width: '100%',
        maxWidth: '1400px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      {/* Card Header */}
      <div style={{ marginBottom: '28px' }}>
        {showLabel && (
          <>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#ffffff',
                margin: 0,
                marginBottom: '8px',
                letterSpacing: '-0.01em',
              }}
            >
              Portfolio
            </h3>
            <p
              style={{
                fontSize: '13px',
                color: '#8b8b9e',
                margin: 0,
              }}
            >
              Configure your holdings and run the simulation
            </p>
          </>
        )}
      </div>

      {/* Portfolio Value Input */}
      <div style={{ marginBottom: '24px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#3d3d50',
            marginBottom: '8px',
          }}
        >
          Portfolio Value (USD)
        </label>
        <input
          type="number"
          value={initialValue}
          onChange={(e) => setInitialValue(parseFloat(e.target.value) || 0)}
          style={{
            width: '100%',
            height: '40px',
            padding: '0 14px',
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: '#ffffff',
            fontFamily: '"JetBrains Mono", "Courier New", monospace',
            fontSize: '14px',
            transition: 'all 150ms ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(0,212,170,0.35)'
            e.target.style.boxShadow = '0 0 0 3px rgba(0,212,170,0.08)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.08)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* Holdings Section */}
      <div style={{ marginBottom: '16px' }}>
        {/* Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 36px',
            gap: '8px',
            marginBottom: '8px',
            paddingRight: '8px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#3d3d50',
            }}
          >
            Ticker
          </div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#3d3d50',
              textAlign: 'right',
              paddingRight: '8px',
            }}
          >
            Weight %
          </div>
          <div />
        </div>

        {/* Holdings rows */}
        {holdings.map((holding, index) => (
          <div
            key={index}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 100px 36px',
              gap: '8px',
              marginBottom: '8px',
            }}
          >
            <input
              type="text"
              placeholder="Ticker"
              value={holding.ticker}
              onChange={(e) => updateHolding(index, 'ticker', e.target.value)}
              style={{
                height: '40px',
                padding: '0 14px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#ffffff',
                fontFamily: '"JetBrains Mono", "Courier New", monospace',
                fontSize: '14px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'all 150ms ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(0,212,170,0.35)'
                e.target.style.boxShadow = '0 0 0 3px rgba(0,212,170,0.08)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                e.target.style.boxShadow = 'none'
              }}
            />
            <input
              type="number"
              placeholder="Weight %"
              value={holding.weight}
              onChange={(e) => updateHolding(index, 'weight', e.target.value)}
              min="0"
              max="100"
              style={{
                height: '40px',
                padding: '0 14px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#ffffff',
                fontFamily: '"JetBrains Mono", "Courier New", monospace',
                fontSize: '14px',
                textAlign: 'right',
                transition: 'all 150ms ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(0,212,170,0.35)'
                e.target.style.boxShadow = '0 0 0 3px rgba(0,212,170,0.08)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                e.target.style.boxShadow = 'none'
              }}
            />
            <button
              type="button"
              onClick={() => removeHolding(index)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.07)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b8b9e',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'
                e.currentTarget.style.color = '#ef4444'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.color = '#8b8b9e'
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: '16px', height: '16px' }}
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          marginTop: '16px',
          marginBottom: '20px',
        }}
      >
        {/* Add Holding */}
        <button
          type="button"
          onClick={addHolding}
          style={{
            height: '34px',
            padding: '0 14px',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#8b8b9e',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'
            e.currentTarget.style.color = '#c8c8d4'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
            e.currentTarget.style.color = '#8b8b9e'
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '14px', height: '14px' }}
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Holding
        </button>

        {/* Equal Weight */}
        <button
          type="button"
          onClick={equalWeight}
          style={{
            height: '34px',
            padding: '0 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(0,212,170,0.08)',
            border: '1px solid rgba(0,212,170,0.2)',
            color: '#00d4aa',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,212,170,0.14)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,212,170,0.08)'
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: '14px', height: '14px' }}
          >
            <line x1="12" y1="2" x2="12" y2="22" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Equal Weight
        </button>
      </div>

      {/* Weight Meter */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: '#3d3d50',
            }}
          >
            Total Weight
          </div>
          <div
            style={{
              fontSize: '12px',
              fontFamily: '"JetBrains Mono", "Courier New", monospace',
              color: weightColor,
            }}
          >
            {totalWeight.toFixed(1)}% / 100%
          </div>
        </div>
        <div
          style={{
            height: '3px',
            borderRadius: '99px',
            backgroundColor: 'rgba(255,255,255,0.07)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            style={{
              height: '100%',
              borderRadius: '99px',
              backgroundColor: weightColor,
            }}
            animate={{ width: `${Math.min(totalWeight, 100)}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={!isValid || loading}
        style={{
          width: '100%',
          height: '52px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 600,
          border: 'none',
          cursor: !isValid || loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 180ms ease',
          backgroundColor: loading
            ? 'rgba(0,212,170,0.12)'
            : !isValid
            ? 'rgba(255,255,255,0.05)'
            : '#00d4aa',
          color: loading ? '#00d4aa' : !isValid ? '#3d3d50' : '#06060a',
          boxShadow: !loading && isValid
            ? '0 0 0 1px rgba(0,212,170,0.3), 0 4px 24px rgba(0,212,170,0.15)'
            : 'none',
        }}
        whileHover={
          !loading && isValid
            ? { backgroundColor: '#00efbe', boxShadow: '0 0 0 1px rgba(0,212,170,0.5), 0 8px 32px rgba(0,212,170,0.25)', y: -1 }
            : {}
        }
        whileTap={!loading && isValid ? { scale: 0.98 } : {}}
      >
        {loading ? (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: '16px', height: '16px' }}
              className="spin"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Simulating 10,000 paths...
          </>
        ) : !isValid ? (
          'Weights must sum to 100%'
        ) : (
          buttonText
        )}
      </motion.button>
    </motion.form>
  )
}
