import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function analyzePortfolio(holdings, initialValue) {
  const { data } = await axios.post(`${BASE}/portfolio/analyze`, {
    holdings,
    initial_value: initialValue,
  })
  return data
}

export async function fetchScenarios() {
  const { data } = await axios.get(`${BASE}/scenarios`)
  return data
}

export async function comparePortfolios(portfolioA, portfolioB) {
  const { data } = await axios.post(`${BASE}/portfolio/compare`, {
    portfolio_a: portfolioA,
    portfolio_b: portfolioB,
  })
  return data
}