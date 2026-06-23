import React, { useMemo } from 'react'

// Deterministic pseudo-random
const pseudoRandom = (seed) => {
  let s = seed
  return () => {
    s = Math.sin(s) * 10000
    return s - Math.floor(s)
  }
}

const generateCandles = (seed, numCandles) => {
  const random = pseudoRandom(seed)
  const candles = []
  let currentPrice = 100 + random() * 50
  
  for (let i = 0; i < numCandles; i++) {
    const open = currentPrice
    const changePercent = (random() - 0.5) * 0.05 // ±2.5%
    const close = open * (1 + changePercent)
    const wickHigh = (random() * 0.02) * Math.max(open, close)
    const wickLow = (random() * 0.02) * Math.max(open, close)
    const high = Math.max(open, close) + wickHigh
    const low = Math.min(open, close) - wickLow
    
    candles.push({
      open,
      high,
      low,
      close,
    })
    
    currentPrice = close
  }
  
  return candles
}

const ChartPanel = ({ candles, x, y, width, height, duration, opacity }) => {
  // Normalize prices to fit height
  const prices = candles.flatMap(c => [c.open, c.high, c.low, c.close])
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice || 1
  
  const candleWidth = width / candles.length
  const bodyWidth = candleWidth * 0.65

  return (
    <svg
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        opacity,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <filter id={`candle-glow-${x}-${y}`}>
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <g style={{ animation: `scroll-${x}-${y} ${duration}s linear infinite` }}>
        {/* Duplicate for seamless loop */}
        {[0, 1].map((offset, idx) => (
          <g key={idx} style={{ transform: `translateX(${offset * width}px)` }}>
            {candles.map((c, i) => {
              const isBullish = c.close > c.open
              const color = isBullish ? 'var(--accent-primary)' : 'var(--negative)'
              const bodyTop = Math.min(c.open, c.close)
              const bodyBottom = Math.max(c.open, c.close)
              const xPos = i * candleWidth + (candleWidth - bodyWidth) / 2
              
              const yHigh = height - ((c.high - minPrice) / priceRange) * height
              const yLow = height - ((c.low - minPrice) / priceRange) * height
              const yBodyTop = height - ((bodyTop - minPrice) / priceRange) * height
              const yBodyBottom = height - ((bodyBottom - minPrice) / priceRange) * height
              
              return (
                <g key={i}>
                  {/* Wick */}
                  <line
                    x1={xPos + bodyWidth / 2}
                    y1={yHigh}
                    x2={xPos + bodyWidth / 2}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1.2"
                    opacity="0.4"
                  />
                  {/* Body */}
                  <rect
                    x={xPos}
                    y={yBodyTop}
                    width={bodyWidth}
                    height={Math.max(1.5, yBodyBottom - yBodyTop)}
                    fill={color}
                    fillOpacity="0.3"
                    stroke={color}
                    strokeWidth="1.2"
                    strokeOpacity="0.5"
                    filter={`url(#candle-glow-${x}-${y})`}
                  />
                </g>
              )
            })}
          </g>
        ))}
      </g>
      
      <style>{`
        @keyframes scroll-${x}-${y} {
          from { transform: translateX(0); }
          to { transform: translateX(-${width}px); }
        }
      `}</style>
    </svg>
  )
}

export default function CandlestickBackground() {
  const charts = useMemo(() => [
    { id: 1, seed: 123, candles: 45, x: 0, y: '5%', width: 1200, height: 220, duration: 85, opacity: 0.35 },
    { id: 2, seed: 456, candles: 50, x: -200, y: '65%', width: 1400, height: 200, duration: 95, opacity: 0.3 },
  ], [])

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden' }}>
      {/* Central vertical mask to keep text legible */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `linear-gradient(to bottom,
            rgba(5, 5, 9, 0) 0%,
            rgba(5, 5, 9, 0) 25%,
            rgba(5, 5, 9, 0.6) 35%,
            rgba(5, 5, 9, 0.8) 50%,
            rgba(5, 5, 9, 0.6) 65%,
            rgba(5, 5, 9, 0) 75%,
            rgba(5, 5, 9, 0) 100%)`,
          zIndex: 1,
        }}
      />
      
      {charts.map((chart) => (
        <ChartPanel
          key={chart.id}
          candles={generateCandles(chart.seed, chart.candles)}
          x={chart.x}
          y={chart.y}
          width={chart.width}
          height={chart.height}
          duration={chart.duration}
          opacity={chart.opacity}
        />
      ))}
      
      {/* Hide on small screens */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="absolute"] svg {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
