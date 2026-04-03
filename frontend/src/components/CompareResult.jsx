import React from 'react'
import { motion } from 'framer-motion'

function getMetricColor(value, metric) {
  // Color coding based on metric type and value
  if (metric === 'var_95') {
    return '#ef4444'
  }
  if (metric === 'sharpe_ratio') {
    return value >= 1 ? '#00d4aa' : value >= 0.5 ? '#f59e0b' : '#ef4444'
  }
  if (metric === 'annualised_vol') {
    return value > 0.3 ? '#f59e0b' : '#8b8b9e'
  }
  if (metric === 'prob_loss_20pct') {
    return value > 0.1 ? '#ef4444' : value > 0.05 ? '#f59e0b' : '#8b8b9e'
  }
  return '#8b8b9e'
}

function safePct(val) {
  if (val === null || val === undefined || isNaN(val)) return 'N/A'
  return (val * 100).toFixed(1) + '%'
}

function safeDollar(val) {
  if (val === null || val === undefined || isNaN(val)) return 'N/A'
  return '$' + Math.round(val / 1000) + 'k'
}

function safeRatio(val) {
  if (val === null || val === undefined || isNaN(val)) return 'N/A'
  return val.toFixed(3)
}

export default function CompareResult({ result, onBack }) {
  const color_a = '#00d4aa'
  const color_b = '#f59e0b'
  const winner_color = result.winner === 'A' ? color_a : color_b

  // Get Trade War scenario (index 2) for detailed comparison
  const trade_war_a = result.portfolio_a[2]
  const trade_war_b = result.portfolio_b[2]

  const metrics = [
    {
      label: 'Expected Value',
      key: 'expected_value',
      format: (v) => safeDollar(v),
      is_higher_better: true,
    },
    {
      label: 'VaR 95%',
      key: 'var_95',
      format: (v) => safeDollar(v),
      is_higher_better: false,
    },
    {
      label: 'P(Loss>20%)',
      key: 'prob_loss_20pct',
      format: (v) => safePct(v),
      is_higher_better: false,
    },
    {
      label: 'Sharpe Ratio',
      key: 'sharpe_ratio',
      format: (v) => safeRatio(v),
      is_higher_better: true,
    },
    {
      label: 'Annual Return',
      key: 'annualised_return',
      format: (v) => safePct(v),
      is_higher_better: true,
    },
    {
      label: 'Volatility',
      key: 'annualised_vol',
      format: (v) => safePct(v),
      is_higher_better: false,
    },
  ]

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
      {/* Back Button */}
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
          marginBottom: '40px',
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
        ← Back to Comparison
      </button>

      {/* Winner Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          backgroundColor: `${winner_color}15`,
          border: `2px solid ${winner_color}40`,
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: winner_color,
            marginBottom: '12px',
          }}
        >
          Winner
        </div>
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
            marginBottom: '12px',
          }}
        >
          Portfolio {result.winner} is Safer
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: '#8b8b9e',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {result.winner_reason}
        </p>
      </motion.div>

      {/* Trade War Metrics Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          backgroundColor: '#0e0e17',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '32px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#3d3d50',
            marginBottom: '24px',
          }}
        >
          Trade War Scenario Metrics
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {metrics.map((metric) => {
            const val_a = trade_war_a[metric.key]
            const val_b = trade_war_b[metric.key]
            const formatted_a = metric.format(val_a)
            const formatted_b = metric.format(val_b)

            // Determine which is better
            const a_is_better = metric.is_higher_better ? val_a > val_b : val_a < val_b
            const b_is_better = metric.is_higher_better ? val_b > val_a : val_b < val_a

            return (
              <motion.div
                key={metric.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: '#3d3d50',
                    marginBottom: '16px',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                  }}
                >
                  {metric.label}
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    gap: '16px',
                  }}
                >
                  {/* Portfolio A */}
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: a_is_better
                        ? 'rgba(0, 212, 170, 0.08)'
                        : 'transparent',
                      border: a_is_better
                        ? '1px solid rgba(0, 212, 170, 0.2)'
                        : 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#8b8b9e',
                        marginBottom: '8px',
                      }}
                    >
                      Portfolio A
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        fontFamily: '"JetBrains Mono", "Courier New", monospace',
                        color: getMetricColor(val_a, metric.key),
                      }}
                    >
                      {formatted_a}
                    </div>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      width: '1px',
                      height: '40px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }}
                  />

                  {/* Portfolio B */}
                  <div
                    style={{
                      flex: 1,
                      backgroundColor: b_is_better
                        ? 'rgba(245, 158, 11, 0.08)'
                        : 'transparent',
                      border: b_is_better
                        ? '1px solid rgba(245, 158, 11, 0.2)'
                        : 'none',
                      borderRadius: '8px',
                      padding: '12px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#8b8b9e',
                        marginBottom: '8px',
                      }}
                    >
                      Portfolio B
                    </div>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        fontFamily: '"JetBrains Mono", "Courier New", monospace',
                        color: getMetricColor(val_b, metric.key),
                      }}
                    >
                      {formatted_b}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Portfolio Compositions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginTop: '32px',
        }}
      >
        {/* Portfolio A Composition */}
        <div
          style={{
            backgroundColor: '#0e0e17',
            border: '1px solid rgba(0, 212, 170, 0.2)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#00d4aa',
              marginBottom: '16px',
            }}
          >
            Portfolio A Holdings
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trade_war_a.tickers.map((ticker) => (
              <div
                key={ticker}
                style={{
                  fontSize: '13px',
                  color: '#8b8b9e',
                  fontFamily: '"JetBrains Mono", "Courier New", monospace',
                }}
              >
                {ticker}
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio B Composition */}
        <div
          style={{
            backgroundColor: '#0e0e17',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            borderRadius: '16px',
            padding: '24px',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#f59e0b',
              marginBottom: '16px',
            }}
          >
            Portfolio B Holdings
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {trade_war_b.tickers.map((ticker) => (
              <div
                key={ticker}
                style={{
                  fontSize: '13px',
                  color: '#8b8b9e',
                  fontFamily: '"JetBrains Mono", "Courier New", monospace',
                }}
              >
                {ticker}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
