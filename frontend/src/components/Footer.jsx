import React from 'react'

export default function Footer() {
  return (
    <footer className="py-8 px-8 bg-bg border-t border-border-default">
      <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
        <div className="text-text-secondary">
          <span className="font-medium text-text-primary">Tariff Stress Tester</span> —{' '}
          Built for portfolio demonstration purposes
        </div>
        <div className="text-text-muted">
          Not financial advice · Educational use only
        </div>
      </div>
    </footer>
  )
}
