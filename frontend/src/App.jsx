import React, { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ScenarioCards from './components/ScenarioCards'
import PortfolioInput from './components/PortfolioInput'
import LoadingState from './components/LoadingState'
import RiskSummaryCard from './components/RiskSummaryCard'
import ScenarioFanChart from './components/ScenarioFanChart'
import RiskMetricsTable from './components/RiskMetricsTable'
import ExposureHeatmap from './components/ExposureHeatmap'
import WhatIfPanel from './components/WhatIfPanel'
import MethodologyStrip from './components/MethodologyStrip'
import Footer from './components/Footer'
import CompareView from './components/CompareView'
import { analyzePortfolio } from './api'
import { exportToCSV } from './utils/exportResults'

export default function App() {
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [comparing, setComparing] = useState(false)

  const handleAnalyze = async (holdings, initialValue) => {
    setLoading(true)
    setError(null)
    try {
      const data = await analyzePortfolio(holdings, initialValue)
      setResults(data)
      // Scroll to results
      setTimeout(() => {
        const element = document.getElementById('results')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    } catch (err) {
      setError(err.message || 'Failed to analyze portfolio')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative', overflow: 'x-hidden', backgroundColor: '#050509', color: '#ffffff' }}>
      {/* Left ambient glow */}
      <div
        style={{
          position: 'fixed',
          left: '-200px',
          top: '30%',
          width: '400px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(0,212,170,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          borderRadius: '50%',
        }}
      />

      {/* Right ambient glow */}
      <div
        style={{
          position: 'fixed',
          right: '-200px',
          top: '60%',
          width: '400px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(96,165,250,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
          borderRadius: '50%',
        }}
      />

      <Navbar />

      {comparing ? (
        <CompareView onBack={() => setComparing(false)} />
      ) : (
        <>
          <Hero />

          {/* Separator line */}
          <div
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            }}
          />

          <ScenarioCards />

          {/* Separator line */}
          <div
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            }}
          />

          {/* Analyze section */}
          <section
            id="analyze"
            style={{
              backgroundColor: '#05050b',
              padding: `80px clamp(16px, 4vw, 80px)`,
            }}
          >
            <div
              style={{
                maxWidth: '1400px',
                margin: '0 auto',
              }}
            >
              {/* Section header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                viewport={{ once: true }}
                style={{
                  textAlign: 'center',
                  marginBottom: '56px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#00d4aa',
                    marginBottom: '12px',
                  }}
                >
                  Analyze Your Portfolio
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(28px, 4vw, 48px)',
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: 0,
                    marginBottom: '16px',
                  }}
                >
                  Enter your holdings
                </h2>
                <p
                  style={{
                    fontSize: '15px',
                    color: '#8b8b9e',
                    margin: 0,
                  }}
                >
                  Results appear in under 5 seconds
                </p>
              </motion.div>

              {/* Input or Results */}
              {!results ? (
                <>
                  <PortfolioInput onSubmit={handleAnalyze} loading={loading} />
                  <AnimatePresence>
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{ marginTop: '32px' }}
                      >
                        <LoadingState />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        style={{
                          marginTop: '24px',
                          padding: '16px 20px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          color: '#ef4444',
                          fontSize: '14px',
                        }}
                      >
                        Error: {error}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <AnimatePresence>
                  <motion.div
                    key="results"
                    id="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '32px',
                    }}
                  >
                    {/* Action buttons */}
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <motion.button
                        onClick={() => setResults(null)}
                        whileHover={{
                          backgroundColor: 'rgba(255,255,255,0.08)',
                        }}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '8px',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#8b8b9e',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 200ms ease',
                        }}
                      >
                        Modify Portfolio
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          const tickers = results.holdings_exposure.map((h) => h.ticker)
                          exportToCSV(results, tickers)
                        }}
                        whileHover={{
                          backgroundColor: 'rgba(0,212,170,0.08)',
                        }}
                        style={{
                          height: '32px',
                          padding: '0 14px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(0,212,170,0.2)',
                          color: '#00d4aa',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 150ms ease',
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
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export CSV
                      </motion.button>

                      <motion.button
                        onClick={() => setComparing(true)}
                        whileHover={{
                          backgroundColor: 'rgba(0,212,170,0.1)',
                        }}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '8px',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(0,212,170,0.2)',
                          color: '#00d4aa',
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 200ms ease',
                        }}
                      >
                        Compare two portfolios →
                      </motion.button>
                    </div>

                    {/* Risk Summary */}
                    <RiskSummaryCard
                      summary={results.llm_summary}
                      computationTime={results.computation_time_s}
                    />

                    {/* Fan Chart */}
                    <ScenarioFanChart results={results} />

                    {/* Metrics and Exposure grid */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
                        gap: '32px',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <RiskMetricsTable results={results} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <ExposureHeatmap results={results} />
                      </div>
                    </div>

                    {/* What-If Analysis */}
                    <WhatIfPanel
                      scenarios={results.scenarios}
                      holdingsExposure={results.holdings_exposure}
                      initialWeights={results.holdings_exposure.map((h) => h.weight)}
                      tickers={results.holdings_exposure.map((h) => h.ticker)}
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </section>

          {/* Separator line */}
          <div
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
            }}
          />

          {/* Methodology strip */}
          <MethodologyStrip />

          {/* Footer */}
          <Footer />
        </>
      )}
    </div>
  )
}
