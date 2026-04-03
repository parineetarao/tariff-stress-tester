import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

function getExposureColor(score) {
  if (score >= 4) return '#ef4444'
  if (score >= 3) return '#f59e0b'
  return '#00d4aa'
}

export default function WhatIfPanel({ scenarios, holdingsExposure, initialWeights, tickers }) {
  const [weights, setWeights] = useState(initialWeights)

  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  const weightColor =
    Math.abs(totalWeight - 1.0) < 0.01
      ? '#00d4aa'
      : totalWeight > 1.0
      ? '#ef4444'
      : '#f59e0b'

  // Compute weighted average exposure score
  const weightedExposure = useMemo(() => {
    return tickers.reduce((sum, ticker, i) => {
      const exp = holdingsExposure.find((h) => h.ticker === ticker)
      return sum + (exp?.exposure_score || 3) * weights[i]
    }, 0)
  }, [weights, tickers, holdingsExposure])

  // Find highest risk holding (weight * exposure_score)
  const highestRiskHolding = useMemo(() => {
    let maxRisk = 0
    let riskTicker = tickers[0]
    tickers.forEach((ticker, i) => {
      const exp = holdingsExposure.find((h) => h.ticker === ticker)
      const risk = weights[i] * (exp?.exposure_score || 3)
      if (risk > maxRisk) {
        maxRisk = risk
        riskTicker = ticker
      }
    })
    return { ticker: riskTicker, risk: maxRisk }
  }, [weights, tickers, holdingsExposure])

  // Calculate weight shifts from original
  const weightShifts = useMemo(() => {
    const shifts = tickers.map((ticker, i) => ({
      ticker,
      shift: (weights[i] - initialWeights[i]) * 100,
    }))
    // Sort by absolute shift and return top 1
    const sorted = shifts.sort((a, b) => Math.abs(b.shift) - Math.abs(a.shift))
    return sorted[0]
  }, [weights, tickers, initialWeights])

  // Available weight percentage for each slider
  const getMaxWeight = (index) => {
    const othersMin = 0.01 * (tickers.length - 1)
    const availablePercentage = 1.0 - othersMin
    return Math.min(99, Math.round(availablePercentage * 100))
  }

  const handleWeightChange = (index, newPercentage) => {
    const newWeight = newPercentage / 100
    const newWeights = [...weights]
    newWeights[index] = newWeight
    setWeights(newWeights)
  }

  const handleReset = () => {
    setWeights(initialWeights)
  }

  // Normalize weights for bar chart display (sum to 100%)
  const barChartData = useMemo(() => {
    return tickers.map((ticker, i) => {
      const exp = holdingsExposure.find((h) => h.ticker === ticker)
      const exposureScore = exp?.exposure_score || 3
      const riskContribution = weights[i] * exposureScore
      return {
        ticker,
        weight: weights[i],
        exposureScore,
        riskContribution,
        color: getExposureColor(exposureScore),
      }
    })
  }, [weights, tickers, holdingsExposure])

  const maxRiskContribution = Math.max(...barChartData.map((d) => d.riskContribution))
  const totalRiskContribution = barChartData.reduce((sum, d) => sum + d.riskContribution, 0)

  return (
    <>
      <style>{`
        .whatif-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.08);
          outline: none;
          cursor: pointer;
        }

        .whatif-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #00d4aa;
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.2);
        }

        .whatif-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #00d4aa;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 0 3px rgba(0, 212, 170, 0.2);
        }

        .whatif-slider::-webkit-slider-runnable-track {
          background: rgba(255, 255, 255, 0.08);
          height: 4px;
          border-radius: 2px;
        }

        .whatif-slider::-moz-range-track {
          background: rgba(255, 255, 255, 0.08);
          height: 4px;
          border-radius: 2px;
          border: none;
        }

        .whatif-slider:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .whatif-slider:hover::-webkit-slider-thumb {
          box-shadow: 0 0 0 5px rgba(0, 212, 170, 0.3);
        }

        .whatif-slider:hover::-moz-range-thumb {
          box-shadow: 0 0 0 5px rgba(0, 212, 170, 0.3);
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          backgroundColor: '#0e0e17',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '28px',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#3d3d50',
              marginBottom: '8px',
            }}
          >
            What-If Analysis
          </div>
          <p
            style={{
              fontSize: '12px',
              color: '#3d3d50',
              margin: 0,
            }}
          >
            Adjust weights to see exposure impact
          </p>
        </div>

        {/* Weight Sliders */}
        <div style={{ marginBottom: '24px' }}>
          {tickers.map((ticker, index) => {
            const currentWeight = weights[index]
            const currentPercentage = Math.round(currentWeight * 100)
            const exp = holdingsExposure.find((h) => h.ticker === ticker)
            const exposureScore = exp?.exposure_score || 3
            const tickerColor = getExposureColor(exposureScore)

            return (
              <div
                key={ticker}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 40px',
                  gap: '16px',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                {/* Ticker */}
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    fontFamily: '"JetBrains Mono", "Courier New", monospace',
                    color: tickerColor,
                  }}
                >
                  {ticker}
                </div>

                {/* Slider */}
                <input
                  type="range"
                  className="whatif-slider"
                  min="1"
                  max={getMaxWeight(index)}
                  step="1"
                  value={currentPercentage}
                  onChange={(e) => handleWeightChange(index, parseInt(e.target.value))}
                />

                {/* Weight percentage */}
                <div
                  style={{
                    fontSize: '13px',
                    fontFamily: '"JetBrains Mono", "Courier New", monospace',
                    color: '#8b8b9e',
                    textAlign: 'right',
                  }}
                >
                  {currentPercentage}%
                </div>
              </div>
            )
          })}
        </div>

        {/* Weight Validation Bar */}
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <div style={{ fontSize: '12px', color: '#3d3d50' }}>Total Weight</div>
            <div
              style={{
                fontSize: '12px',
                fontFamily: '"JetBrains Mono", "Courier New", monospace',
                color: weightColor,
              }}
            >
              {(totalWeight * 100).toFixed(1)}% / 100%
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
              animate={{ width: `${Math.min(totalWeight, 1.0) * 100}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {/* Weighted Exposure */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '10px',
              padding: '16px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#3d3d50',
                marginBottom: '8px',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}
            >
              Weighted Exposure
            </div>
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: getExposureColor(weightedExposure),
                fontFamily: '"JetBrains Mono", "Courier New", monospace',
              }}
            >
              {weightedExposure.toFixed(1)}/5
            </div>
          </motion.div>

          {/* Highest Risk Holding */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '10px',
              padding: '16px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#3d3d50',
                marginBottom: '8px',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}
            >
              Highest Risk
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: '#ef4444',
                fontFamily: '"JetBrains Mono", "Courier New", monospace',
              }}
            >
              {highestRiskHolding.ticker}
            </div>
          </motion.div>

          {/* Weight Shift */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '10px',
              padding: '16px',
            }}
          >
            <div
              style={{
                fontSize: '11px',
                color: '#3d3d50',
                marginBottom: '8px',
                textTransform: 'uppercase',
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}
            >
              Biggest Shift
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#f59e0b',
                fontFamily: '"JetBrains Mono", "Courier New", monospace',
              }}
            >
              {weightShifts.shift > 0 ? '+' : ''}
              {weightShifts.shift.toFixed(0)}% {weightShifts.ticker}
            </div>
          </motion.div>
        </div>

        {/* Exposure Distribution Bar Chart */}
        <div style={{ marginBottom: '28px' }}>
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
            Risk Contribution
          </div>

          {barChartData.map((data, idx) => (
            <motion.div
              key={data.ticker}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + idx * 0.05 }}
              style={{
                marginBottom: '12px',
              }}
            >
              {/* Row: Ticker - Bar - Percentage */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                {/* Ticker */}
                <div
                  style={{
                    width: '40px',
                    fontSize: '12px',
                    fontWeight: 600,
                    fontFamily: '"JetBrains Mono", "Courier New", monospace',
                    color: data.color,
                    flexShrink: 0,
                  }}
                >
                  {data.ticker}
                </div>

                {/* Bar */}
                <div
                  style={{
                    flex: 1,
                    height: '20px',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: '4px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    style={{
                      height: '100%',
                      backgroundColor: data.color,
                      borderRadius: '4px',
                    }}
                    animate={{
                      width: `${(data.riskContribution / maxRiskContribution) * 100}%`,
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>

                {/* Weight percentage */}
                <div
                  style={{
                    width: '45px',
                    fontSize: '11px',
                    fontFamily: '"JetBrains Mono", "Courier New", monospace',
                    color: '#8b8b9e',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  {(data.weight * 100).toFixed(0)}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reset Button */}
        <motion.button
          onClick={handleReset}
          whileHover={{
            borderColor: 'rgba(255,255,255,0.2)',
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
          style={{
            width: '100%',
            height: '36px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundColor: 'transparent',
            color: '#8b8b9e',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          ↻ Reset to original
        </motion.button>
      </motion.div>
    </>
  )
}
