# Tariff Stress Tester

**Live demo:** https://tariff-stress-tester.vercel.app  
**API docs:** https://tariff-stress-tester-production.up.railway.app/docs

A Monte Carlo portfolio stress testing tool that simulates 10,000 
correlated future paths under three US tariff escalation scenarios. 
Built as a flagship portfolio project for Data Science and ML 
Engineering internship applications.

---

## What it does

Users input a stock portfolio (tickers + weights). The app fetches 
2 years of live market data, runs a full Monte Carlo simulation, and 
returns risk metrics, a scenario fan chart, and an AI-generated 
plain-English risk summary — all in under 5 seconds.

**Three scenarios modelled:**
- **Baseline** — current tariff levels hold, no adjustment
- **Escalation** — additional 30% tariffs on tech and pharma imports
- **Trade War** — blanket retaliatory tariffs, full risk-off event

**Output per scenario:**
- Expected portfolio value at Day 30, 90, 180
- VaR at 95% confidence
- CVaR (expected shortfall)
- Sharpe ratio
- Probability of loss exceeding 10% and 20%
- Fan chart with p5/p25/p50/p75/p95 percentile bands

---

## Why this project exists

As of early 2026, the US has imposed significant tariffs across 
multiple sectors. This tool exists because this situation exists 
right now — it is not a hypothetical. The scenario parameters are 
grounded in actual USTR policy announcements and analyst consensus 
estimates, not made-up numbers.

---

## Technical methodology

### Monte Carlo simulation
- 10,000 simulation paths per scenario over 180 trading days
- Uses `numpy.random.multivariate_normal` to draw **correlated** 
  daily returns for all holdings simultaneously
- Correlation structure captured via the full covariance matrix 
  of historical log returns
- This is the methodologically correct approach — simulating 
  each stock independently would underestimate portfolio risk 
  by ignoring inter-stock correlation

### Why log returns
Log returns are used instead of simple returns because they are:
- Time-additive: multi-day returns sum correctly
- Approximately normally distributed
- Symmetric: a 50% loss and 100% gain are equal in magnitude

### Tariff exposure model
Each stock's GICS sector maps to a `TariffMultiplier` containing:
- `mean_factor`: relative reduction in expected annual return
  Applied as `new_mean = historical_mean × (1 + mean_factor)`
- `vol_multiplier`: multiplicative increase in volatility

Relative (not absolute) mean adjustment ensures shocks scale 
proportionally — a -25% factor on a 5% return stock gives 3.75%, 
not -20%.

**Sector multipliers (escalation scenario):**

| Sector | Mean factor | Vol multiplier | Exposure |
|--------|-------------|----------------|----------|
| Technology | -0.25 | 1.35 | Critical (5/5) |
| Health Care | -0.20 | 1.25 | High (4.5/5) |
| Consumer Discretionary | -0.15 | 1.20 | High (4/5) |
| Industrials | -0.10 | 1.15 | Medium (3/5) |
| Financials | -0.08 | 1.12 | Low-medium (2.5/5) |
| Energy | -0.03 | 1.08 | Low (2/5) |
| Utilities | -0.02 | 1.05 | Minimal (1/5) |

Sources: USTR Section 301 tariff schedules, Goldman Sachs sector 
impact estimates (March 2026), CBO drug supply chain report (2023), 
SOX index behaviour during 2018-2019 tariff escalation.

### Risk metrics
- **VaR (95%)**: 5th percentile of terminal value distribution
- **CVaR**: mean of all values below the VaR threshold
- **Sharpe ratio**: `(annualised_return - 0.045) / annualised_vol`
- Risk-free rate: 4.5% (approximate US 10-year yield, early 2026)

---

## Architecture
tariff-stress-tester/
├── backend/                    # FastAPI — deployed on Railway
│   ├── main.py                 # App entry point, CORS, router registration
│   ├── routers/
│   │   ├── portfolio.py        # POST /portfolio/analyze
│   │   └── scenarios.py        # GET /scenarios
│   ├── services/
│   │   ├── data_fetcher.py     # yfinance, log returns, covariance matrix
│   │   ├── risk_engine.py      # Monte Carlo simulation, VaR, CVaR
│   │   ├── exposure.py         # Tariff sector multipliers, Scenario enum
│   │   └── llm_summary.py      # GPT-4o-mini risk summary generation
│   └── models/
│       └── schemas.py          # Pydantic request/response models
└── frontend/                   # React + Vite — deployed on Vercel
└── src/
├── components/
│   ├── ScenarioFanChart.jsx
│   ├── RiskMetricsTable.jsx
│   ├── ExposureHeatmap.jsx
│   ├── RiskSummaryCard.jsx
│   ├── WhatIfPanel.jsx
│   └── CompareView.jsx
├── App.jsx
└── api.js

**Key architectural decisions:**
- No analysis logic in `main.py` — purely wiring
- `exposure.py` contains only logic, zero network calls
- `data_fetcher.py` owns all external data fetching
- `lru_cache` on sector lookups eliminates redundant API calls
- Pydantic schemas defined before services — single source of truth

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend framework | FastAPI 0.115 |
| Simulation | NumPy, Pandas, SciPy |
| Market data | yfinance |
| LLM | OpenAI GPT-4o-mini |
| Frontend | React 18, Vite |
| Charts | Recharts |
| Animations | Framer Motion |
| Styling | Tailwind CSS |
| Backend deploy | Railway |
| Frontend deploy | Vercel |

---

## Running locally

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Create .env file with your OpenAI key
echo "OPENAI_API_KEY=your-key-here" > .env

uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

**API documentation:** `http://localhost:8000/docs`

---

## Features

- Monte Carlo simulation with correlated returns (10,000 paths)
- Three tariff scenario comparison with fan chart
- Sector-specific tariff exposure heatmap
- VaR, CVaR, Sharpe ratio per scenario
- AI-generated plain-English risk summary (GPT-4o-mini)
- Portfolio comparison — compare two portfolios side by side
- What-if weight slider — adjust allocations and see exposure impact
- Export results to CSV

---

## Disclaimer

This tool is built for educational and portfolio demonstration 
purposes only. It is not financial advice. Past market behaviour 
does not guarantee future results. Tariff scenario parameters are 
modelling assumptions, not predictions.