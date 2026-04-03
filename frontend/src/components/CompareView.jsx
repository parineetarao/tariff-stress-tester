import React, { useState } from 'react'
import { motion } from 'framer-motion'
import PortfolioInput from './PortfolioInput'
import CompareResult from './CompareResult'
import { comparePortfolios } from '../api'

export default function CompareView({ onBack }) {
  const [portfolioA, setPortfolioA] = useState(null)
  const [portfolioB, setPortfolioB] = useState(null)
  const [compareResult, setCompareResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSetPortfolioA = (holdings, initialValue) => {
    setPortfolioA({ holdings, initial_value: initialValue })
  }

  const handleSetPortfolioB = (holdings, initialValue) => {
    setPortfolioB({ holdings, initial_value: initialValue })
  }

  const handleCompare = async () => {
    if (!portfolioA || !portfolioB) {
      setError('Please fill in both portfolios')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await comparePortfolios(portfolioA, portfolioB)
      setCompareResult(result)
    } catch (err) {
      setError(err.response?.data?.detail || 'Comparison failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (compareResult) {
    return (
      <CompareResult
        result={compareResult}
        onBack={() => setCompareResult(null)}
      />
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: 'clamp(16px, 4vw, 80px)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '56px' }}>
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            marginBottom: '12px',
          }}
        >
          Compare Portfolios
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: '#8b8b9e',
            margin: 0,
          }}
        >
          Enter two portfolios to see which is more resilient under tariff stress
        </p>
      </div>

      {/* Two-Column Input Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '24px',
          alignItems: 'flex-start',
          marginBottom: '32px',
        }}
      >
        {/* Portfolio A */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            backgroundColor: '#0e0e17',
            border: '1px solid rgba(0, 212, 170, 0.2)',
            borderRadius: '16px',
            padding: '32px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#00d4aa',
              marginBottom: '20px',
            }}
          >
            Portfolio A
          </div>
          <PortfolioInput
            onAnalyze={handleSetPortfolioA}
            showLabel={false}
            buttonText="Set Portfolio A"
          />
        </motion.div>

        {/* VS Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '60px',
            minHeight: '200px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#3d3d50',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            vs
          </div>
        </motion.div>

        {/* Portfolio B */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            backgroundColor: '#0e0e17',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '16px',
            padding: '32px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#f59e0b',
              marginBottom: '20px',
            }}
          >
            Portfolio B
          </div>
          <PortfolioInput
            onAnalyze={handleSetPortfolioB}
            showLabel={false}
            buttonText="Set Portfolio B"
          />
        </motion.div>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#ef4444',
          }}
        >
          {error}
        </motion.div>
      )}

      {/* Compare Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          marginBottom: '32px',
        }}
      >
        <button
          onClick={onBack}
          style={{
            height: '36px',
            paddingLeft: '16px',
            paddingRight: '16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'transparent',
            color: '#8b8b9e',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.2)'
            e.target.style.color = '#ffffff'
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,0.1)'
            e.target.style.color = '#8b8b9e'
          }}
        >
          ← Back
        </button>
        <button
          onClick={handleCompare}
          disabled={loading || !portfolioA || !portfolioB}
          style={{
            height: '36px',
            paddingLeft: '16px',
            paddingRight: '16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: loading ? '#3d3d50' : '#00d4aa',
            color: loading ? '#8b8b9e' : '#09090f',
            fontSize: '13px',
            fontWeight: 600,
            cursor: loading || !portfolioA || !portfolioB ? 'not-allowed' : 'pointer',
            transition: 'all 150ms ease',
            opacity: !portfolioA || !portfolioB ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading && portfolioA && portfolioB) {
              e.target.style.backgroundColor = '#00b895'
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && portfolioA && portfolioB) {
              e.target.style.backgroundColor = '#00d4aa'
            }
          }}
        >
          {loading ? 'Comparing...' : 'Compare Portfolios'}
        </button>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          fontSize: '12px',
          color: '#8b8b9e',
          lineHeight: 1.6,
        }}
      >
        <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
          How it works
        </div>
        The comparison analyzes both portfolios under three tariff scenarios and determines which
        is safer based on the probability of significant losses. The winner is determined by lower
        average risk across all scenarios.
      </motion.div>
    </motion.div>
  )
}
