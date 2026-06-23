import React, { useMemo } from 'react'

// Deterministic pseudo-random number generator to avoid hydration issues
const pseudoRandom = (seed) => {
  let s = seed
  return () => {
    s = Math.sin(s) * 10000
    return s - Math.floor(s)
  }
}

const generateChartPath = (seed, startY, amplitude) => {
  const random = pseudoRandom(seed)
  const numPoints = 25
  const points = []
  let y = startY

  for (let i = 0; i < numPoints; i++) {
    const x = (i / (numPoints - 1)) * 100 // x from 0% to 100%
    const change = (random() - 0.5) * amplitude
    y = Math.max(5, Math.min(95, y + change))
    points.push({ x, y })
  }

  // Create smooth cubic bezier path
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpX = (prev.x + curr.x) / 2
    path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
  }

  return path
}

export default function AmbientChartBackground() {
  const charts = useMemo(() => [
    {
      id: 1,
      path: generateChartPath(123, 30, 8),
      color: 'rgba(0, 212, 170, 0.1)',
      duration: 70,
    },
    {
      id: 2,
      path: generateChartPath(456, 50, 10),
      color: 'rgba(139, 139, 158, 0.08)',
      duration: 80,
    },
    {
      id: 3,
      path: generateChartPath(789, 70, 6),
      color: 'rgba(0, 212, 170, 0.07)',
      duration: 90,
    },
    {
      id: 4,
      path: generateChartPath(101112, 40, 12),
      color: 'rgba(139, 139, 158, 0.06)',
      duration: 75,
    },
  ], [])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {charts.map((chart) => (
          <g key={chart.id}>
            <style>{`
              @keyframes drift-${chart.id} {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
            <g
              style={{
                animation: `drift-${chart.id} ${chart.duration}s linear infinite`,
                transformOrigin: '0 0',
              }}
            >
              <path
                d={chart.path}
                fill="none"
                stroke={chart.color}
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={chart.path}
                fill="none"
                stroke={chart.color}
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
                transform="translate(100, 0)"
              />
            </g>
          </g>
        ))}
      </svg>
    </div>
  )
}
