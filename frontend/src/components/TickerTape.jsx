import React, { useState, useEffect } from 'react'

const TICKER_SYMBOLS = [
  'AAPL', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AMD', 'INTC', 'QCOM',
  'TSM', 'ASML', 'BABA', 'NKE', 'F', 'GM', 'XOM', 'JNJ', 'PFE', 'UNH',
]

function generateTickerData() {
  return TICKER_SYMBOLS.map((symbol) => {
    const change = (Math.random() * 6 - 3).toFixed(1)
    const sign = parseFloat(change) >= 0 ? '+' : ''
    return { symbol, change: `${sign}${change}%`, positive: parseFloat(change) >= 0 }
  })
}

export default function TickerTape() {
  const [tickers, setTickers] = useState([])

  useEffect(() => {
    setTickers(generateTickerData())
  }, [])

  if (tickers.length === 0) return null

  const renderChips = (prefix) =>
    tickers.map((ticker, idx) => (
      <React.Fragment key={`${prefix}-${ticker.symbol}-${idx}`}>
        <span className="ticker-chip">
          <span className="ticker-symbol">{ticker.symbol}</span>
          <span className={ticker.positive ? 'ticker-positive' : 'ticker-negative'}>
            {ticker.change}
          </span>
        </span>
        <span className="ticker-divider" aria-hidden="true" />
      </React.Fragment>
    ))

  return (
    <div className="ticker-tape" aria-hidden="true">
      <div className="ticker-track">
        <div className="ticker-content">
          {renderChips('a')}
        </div>
        <div className="ticker-content" aria-hidden="true">
          {renderChips('b')}
        </div>
      </div>
    </div>
  )
}
