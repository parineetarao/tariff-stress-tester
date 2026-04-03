import React from 'react'
import { motion } from 'framer-motion'

function getMetricColor(value, metric) {
  // Color coding based on metric type and value
  if (metric === 'var_95' || metric === 'cvar_95') {
    return '#ef4444'
  }
  if (metric === 'sharpe_ratio') {
    return value >= 1 ? '#00d4aa' : value >= 0.5 ? '#f59e0b' : '#ef4444'
  }
  if (metric === 'annualised_return') {
    return value > 0 ? '#00d4aa' : '#ef4444'
  }
  if (metric === 'annualised_vol') {
    return value > 0.3 ? '#f59e0b' : '#8b8b9e'
  }
  if (metric === 'prob_loss_10pct') {
    return value > 0.2 ? '#ef4444' : value > 0.1 ? '#f59e0b' : '#8b8b9e'
  }
  if (metric === 'prob_loss_20pct') {
    return value > 0.1 ? '#ef4444' : value > 0.05 ? '#f59e0b' : '#8b8b9e'
  }
  return '#8b8b9e'
}

export default function RiskMetricsTable({ results }) {
  const scenarios = results.scenarios
  const colors = ['#00d4aa', '#f59e0b', '#ef4444']
  const names = ['Baseline', 'Escalation', 'Trade War']

  const metrics = [
    {
      label: 'Expected Value',
      key: 'expected_value',
      format: (v) => `$${(v / 1000).toFixed(0)}k`,
    },
    {
      label: 'VaR 95%',
      key: 'var_95',
      format: (v) => `$${(v / 1000).toFixed(0)}k`,
    },
    {
      label: 'CVaR 95%',
      key: 'cvar_95',
      format: (v) => `$${(v / 1000).toFixed(0)}k`,
    },
    {
      label: 'Sharpe Ratio',
      key: 'sharpe_ratio',
      format: (v) => v.toFixed(3),
    },
    {
      label: 'Annual Return',
      key: 'annualised_return',
      format: (v) => (v * 100).toFixed(1) + '%',
    },
    {
      label: 'Volatility',
      key: 'annualised_vol',
      format: (v) => (v * 100).toFixed(1) + '%',
    },
    {
      label: 'P(Loss>10%)',
      key: 'prob_loss_10pct',
      format: (v) => (v * 100).toFixed(1) + '%',
    },
    {
      label: 'P(Loss>20%)',
      key: 'prob_loss_20pct',
      format: (v) => (v * 100).toFixed(1) + '%',
    },
  ]

  return (
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
      {/* Header */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#3d3d50',
          marginBottom: '20px',
        }}
      >
        Risk Metrics
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '12px',
                  color: '#3d3d50',
                  paddingBottom: '12px',
                  borderBottom: 'none',
                }}
              >
                Metric
              </th>
              {names.map((name, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: 'right',
                    fontWeight: 600,
                    fontSize: '12px',
                    color: colors[i],
                    borderBottom: `2px solid ${colors[i]}`,
                    paddingBottom: '12px',
                    paddingRight: '16px',
                  }}
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, rowIdx) => (
              <tr
                key={metric.key}
                style={{
                  backgroundColor: rowIdx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}
              >
                <td
                  style={{
                    fontSize: '13px',
                    color: '#8b8b9e',
                    padding: '10px 0',
                    width: '44%',
                  }}
                >
                  {metric.label}
                </td>
                {scenarios.map((scenario, i) => {
                  const value = scenario.metrics[metric.key]
                  const formatted = metric.format(value)
                  const color = getMetricColor(value, metric.key)

                  return (
                    <td
                      key={i}
                      style={{
                        textAlign: 'right',
                        fontSize: '12px',
                        fontFamily: '"JetBrains Mono", "Courier New", monospace',
                        color: color,
                        padding: '10px 16px 10px 0',
                      }}
                    >
                      {formatted}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
