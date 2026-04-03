export function exportToCSV(results, tickers) {
  // Section 1: Risk Metrics per Scenario
  const metricsRows = [
    ['RISK METRICS', 'Baseline', 'Escalation', 'Trade War'],
    [
      'Expected Value ($)',
      ...results.scenarios.map((s) => s.metrics.expected_value.toFixed(0)),
    ],
    ['VaR 95% ($)', ...results.scenarios.map((s) => s.metrics.var_95.toFixed(0))],
    [
      'CVaR 95% ($)',
      ...results.scenarios.map((s) => s.metrics.cvar_95.toFixed(0)),
    ],
    [
      'Sharpe Ratio',
      ...results.scenarios.map((s) => s.metrics.sharpe_ratio.toFixed(3)),
    ],
    [
      'Annual Return (%)',
      ...results.scenarios.map((s) => (s.metrics.annualised_return * 100).toFixed(2)),
    ],
    [
      'Annual Volatility (%)',
      ...results.scenarios.map((s) => (s.metrics.annualised_vol * 100).toFixed(2)),
    ],
    [
      'P(Loss > 10%) (%)',
      ...results.scenarios.map((s) => (s.metrics.prob_loss_10pct * 100).toFixed(2)),
    ],
    [
      'P(Loss > 20%) (%)',
      ...results.scenarios.map((s) => (s.metrics.prob_loss_20pct * 100).toFixed(2)),
    ],
  ]

  // Section 2: Fan Chart Data
  const fanRows = [
    [],
    ['FAN CHART DATA', 'Day 30', 'Day 90', 'Day 180'],
  ]
  results.scenarios.forEach((scenario) => {
    fanRows.push([
      `${scenario.scenario_name} - P5 ($)`,
      ...scenario.fan_chart.p5.map((v) => v.toFixed(0)),
    ])
    fanRows.push([
      `${scenario.scenario_name} - P25 ($)`,
      ...scenario.fan_chart.p25.map((v) => v.toFixed(0)),
    ])
    fanRows.push([
      `${scenario.scenario_name} - P50 Median ($)`,
      ...scenario.fan_chart.p50.map((v) => v.toFixed(0)),
    ])
    fanRows.push([
      `${scenario.scenario_name} - P75 ($)`,
      ...scenario.fan_chart.p75.map((v) => v.toFixed(0)),
    ])
    fanRows.push([
      `${scenario.scenario_name} - P95 ($)`,
      ...scenario.fan_chart.p95.map((v) => v.toFixed(0)),
    ])
  })

  // Section 3: Exposure Data
  const exposureRows = [
    [],
    ['TARIFF EXPOSURE', 'Sector', 'Exposure Score', 'Exposure Label', 'Weight (%)'],
    ...results.holdings_exposure.map((h) => [
      h.ticker,
      h.sector,
      h.exposure_score,
      h.exposure_label,
      (h.weight * 100).toFixed(1),
    ]),
  ]

  // Section 4: AI Summary
  const summaryRows = [
    [],
    ['AI RISK SUMMARY'],
    [results.llm_summary.replace(/\n/g, ' ')],
    [],
    ['Generated', new Date().toISOString()],
    ['Computation time (s)', results.computation_time_s],
    ['Note', 'Not financial advice. For educational purposes only.'],
  ]

  // Combine all sections
  const allRows = [...metricsRows, ...fanRows, ...exposureRows, ...summaryRows]

  // Convert to CSV string
  const csvContent = allRows
    .map((row) =>
      row
        .map((cell) => {
          const str = String(cell)
          // Wrap in quotes if contains comma or newline
          return str.includes(',') || str.includes('\n')
            ? `"${str.replace(/"/g, '""')}"`
            : str
        })
        .join(',')
    )
    .join('\n')

  // Trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const date = new Date().toISOString().split('T')[0]
  link.download = `tariff-stress-test-${tickers.join('-')}-${date}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
