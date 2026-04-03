import React, { useEffect } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'

export default function ScenarioFanChart({ results }) {
  // Log data to verify shape
  useEffect(() => {
    if (results && results.scenarios && results.scenarios.length > 0) {
      console.log('Scenario 1 fan chart:', results.scenarios[0].fan_chart)
      console.log('Scenario 2 fan chart:', results.scenarios[1].fan_chart)
      console.log('Scenario 3 fan chart:', results.scenarios[2].fan_chart)
    }
  }, [results])

  // Transform API data to recharts format
  const [baseline, escalation, tradeWar] = results.scenarios

  const chartData = [30, 90, 180].map((day, i) => {
    return {
      day,
      b_p5: baseline.fan_chart.p5[i],
      b_p25: baseline.fan_chart.p25[i],
      b_p50: baseline.fan_chart.p50[i],
      b_p75: baseline.fan_chart.p75[i],
      b_p95: baseline.fan_chart.p95[i],
      e_p5: escalation.fan_chart.p5[i],
      e_p25: escalation.fan_chart.p25[i],
      e_p50: escalation.fan_chart.p50[i],
      e_p75: escalation.fan_chart.p75[i],
      e_p95: escalation.fan_chart.p95[i],
      t_p5: tradeWar.fan_chart.p5[i],
      t_p25: tradeWar.fan_chart.p25[i],
      t_p50: tradeWar.fan_chart.p50[i],
      t_p75: tradeWar.fan_chart.p75[i],
      t_p95: tradeWar.fan_chart.p95[i],
    }
  })

  console.log('Chart data:', JSON.stringify(chartData, null, 2))

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null

    const getValue = (key) => {
      const item = payload.find((p) => p.dataKey === key)
      return item ? item.value : null
    }

    const b50 = getValue('b_p50')
    const e50 = getValue('e_p50')
    const t50 = getValue('t_p50')

    if (!b50) return null

    return (
      <div
        style={{
          background: '#13131f',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '10px',
          padding: '14px 18px',
          minWidth: '200px',
        }}
      >
        <p
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#3d3d50',
            marginBottom: '12px',
            fontFamily: 'JetBrains Mono',
            margin: 0,
          }}
        >
          Day {label} — Median outcomes
        </p>
        {[
          { label: 'Baseline', value: b50, color: '#00d4aa' },
          { label: 'Escalation', value: e50, color: '#f59e0b' },
          { label: 'Trade War', value: t50, color: '#ef4444' },
        ].map((row) => (
          <div
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px',
              gap: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: row.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: '12px', color: '#8b8b9e' }}>
                {row.label}
              </span>
            </div>
            <span
              style={{
                fontSize: '13px',
                fontFamily: 'JetBrains Mono',
                fontWeight: 500,
                color: row.color,
              }}
            >
              ${row.value ? (row.value / 1000).toFixed(1) : '—'}k
            </span>
          </div>
        ))}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            marginTop: '10px',
            paddingTop: '10px',
            fontSize: '10px',
            color: '#3d3d50',
            fontFamily: 'JetBrains Mono',
          }}
        >
          Bands show p25–p75 and p5–p95 ranges
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      style={{
        backgroundColor: '#0e0e17',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px',
        padding: '28px',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#ffffff',
            margin: 0,
            marginBottom: '4px',
          }}
        >
          Portfolio Value Projection
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: '#3d3d50',
            margin: 0,
          }}
        >
          180-day horizon · p5–p95 and p25–p75 confidence bands
        </p>
      </div>

      {/* Custom Legend */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
        {[
          { name: 'Baseline', color: '#00d4aa' },
          { name: 'Escalation', color: '#f59e0b' },
          { name: 'Trade War', color: '#ef4444' },
        ].map((item) => (
          <div
            key={item.name}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <div
              style={{
                position: 'relative',
                width: '24px',
                height: '12px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '2px',
                  background: item.color,
                  borderRadius: '1px',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%,-50%)',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: item.color,
                }}
              />
            </div>
            <span style={{ fontSize: '13px', color: '#8b8b9e' }}>
              {item.name}
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={420}>
        <ComposedChart
          data={chartData}
          margin={{ top: 8, right: 24, left: 0, bottom: 8 }}
        >
          <CartesianGrid
            strokeDasharray="2 6"
            stroke="rgba(255,255,255,0.04)"
            horizontal={true}
            vertical={false}
          />
          <XAxis
            dataKey="day"
            type="number"
            domain={[30, 180]}
            ticks={[30, 90, 180]}
            tickFormatter={(d) => `Day ${d}`}
            tick={{
              fill: '#52525b',
              fontSize: 12,
              fontFamily: 'JetBrains Mono',
            }}
            axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
            tickLine={false}
            padding={{ left: 20, right: 20 }}
          />
          <YAxis
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            tick={{
              fill: '#52525b',
              fontSize: 12,
              fontFamily: 'JetBrains Mono',
            }}
            axisLine={false}
            tickLine={false}
            width={56}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Baseline - Outer band (p5 to p95) */}
          <Area
            type="monotone"
            dataKey="b_p95"
            stroke="none"
            fill="#00d4aa"
            fillOpacity={0.06}
            legendType="none"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="b_p5"
            stroke="none"
            fill="#06060a"
            fillOpacity={1}
            legendType="none"
            isAnimationActive={false}
          />

          {/* Baseline - Inner band (p25 to p75) */}
          <Area
            type="monotone"
            dataKey="b_p75"
            stroke="none"
            fill="#00d4aa"
            fillOpacity={0.12}
            legendType="none"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="b_p25"
            stroke="none"
            fill="#06060a"
            fillOpacity={1}
            legendType="none"
            isAnimationActive={false}
          />

          {/* Escalation - Outer band (p5 to p95) */}
          <Area
            type="monotone"
            dataKey="e_p95"
            stroke="none"
            fill="#f59e0b"
            fillOpacity={0.06}
            legendType="none"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="e_p5"
            stroke="none"
            fill="#06060a"
            fillOpacity={1}
            legendType="none"
            isAnimationActive={false}
          />

          {/* Escalation - Inner band (p25 to p75) */}
          <Area
            type="monotone"
            dataKey="e_p75"
            stroke="none"
            fill="#f59e0b"
            fillOpacity={0.12}
            legendType="none"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="e_p25"
            stroke="none"
            fill="#06060a"
            fillOpacity={1}
            legendType="none"
            isAnimationActive={false}
          />

          {/* Trade War - Outer band (p5 to p95) */}
          <Area
            type="monotone"
            dataKey="t_p95"
            stroke="none"
            fill="#ef4444"
            fillOpacity={0.06}
            legendType="none"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="t_p5"
            stroke="none"
            fill="#06060a"
            fillOpacity={1}
            legendType="none"
            isAnimationActive={false}
          />

          {/* Trade War - Inner band (p25 to p75) */}
          <Area
            type="monotone"
            dataKey="t_p75"
            stroke="none"
            fill="#ef4444"
            fillOpacity={0.12}
            legendType="none"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="t_p25"
            stroke="none"
            fill="#06060a"
            fillOpacity={1}
            legendType="none"
            isAnimationActive={false}
          />

          {/* Baseline Median Line */}
          <Line
            type="monotone"
            dataKey="b_p50"
            stroke="#00d4aa"
            strokeWidth={2.5}
            dot={{ fill: '#00d4aa', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#00d4aa', strokeWidth: 0 }}
            isAnimationActive={true}
            animationDuration={800}
            legendType="none"
          />

          {/* Escalation Median Line */}
          <Line
            type="monotone"
            dataKey="e_p50"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={{ fill: '#f59e0b', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#f59e0b', strokeWidth: 0 }}
            isAnimationActive={true}
            animationDuration={1000}
            legendType="none"
          />

          {/* Trade War Median Line */}
          <Line
            type="monotone"
            dataKey="t_p50"
            stroke="#ef4444"
            strokeWidth={2.5}
            dot={{ fill: '#ef4444', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#ef4444', strokeWidth: 0 }}
            isAnimationActive={true}
            animationDuration={1200}
            legendType="none"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
