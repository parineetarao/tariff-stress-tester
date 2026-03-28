"""
Portfolio analysis router for the Tariff Stress Tester API.

Exposes POST /analyze — the single endpoint the frontend calls
when the user clicks 'Run Analysis'.

This router does no computation itself. It validates the request
(via Pydantic), calls the services in the correct order, assembles
the response, and returns it. All logic lives in services/.
"""

import time
from fastapi import APIRouter, HTTPException

from models.schemas import (
    PortfolioRequest,
    PortfolioResponse,
    ScenarioResult,
    FanChartData,
    RiskMetrics,
    HoldingExposure,
)
from services.data_fetcher import get_portfolio_data
from services.risk_engine import run_scenario
from services.exposure import build_exposure_report, Scenario
from services.llm_summary import generate_summary

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

# Scenario definitions — id, display name, display label
# The full metadata lives in routers/scenarios.py
# Here we only need the ids to iterate over
SCENARIO_CONFIGS = [
    {
        "id":    Scenario.baseline,
        "name":  "Baseline",
        "label": "Current tariffs hold",
    },
    {
        "id":    Scenario.escalation,
        "name":  "Escalation",
        "label": "+30% tariffs on tech and pharma imports",
    },
    {
        "id":    Scenario.trade_war,
        "name":  "Trade War",
        "label": "Full retaliatory tariff escalation",
    },
]


@router.post("/analyze", response_model=PortfolioResponse)
async def analyze_portfolio(request: PortfolioRequest):
    """
    Run Monte Carlo stress test on a portfolio under three tariff scenarios.

    Accepts a list of holdings with weights, fetches 2 years of price
    history, runs 10,000 simulation paths per scenario, and returns
    fan chart data, risk metrics, exposure heatmap, and LLM summary.

    Args:
        request: PortfolioRequest with holdings and initial_value

    Returns:
        PortfolioResponse with all three scenarios and summary

    Raises:
        HTTPException 400: invalid tickers or insufficient data
        HTTPException 500: unexpected computation error
    """
    start_time = time.time()

    tickers = [h.ticker for h in request.holdings]
    weights = [h.weight for h in request.holdings]

    # --- Step 1: Fetch price data and compute statistics ---
    try:
        market_data = get_portfolio_data(tickers)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch market data: {str(e)}"
        )

    # --- Step 2: Run simulation for each scenario ---
    scenario_results = []
    all_metrics = {}

    for config in SCENARIO_CONFIGS:
        try:
            result = run_scenario(
                mean_returns=market_data["mean_returns"],
                cov_matrix=market_data["cov_matrix"],
                tickers=tickers,
                weights=weights,
                initial_value=request.initial_value,
                scenario=config["id"],
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Simulation failed for scenario {config['id']}: {str(e)}"
            )

        # Store metrics for LLM summary
        all_metrics[config["id"]] = result["metrics"]

        # Build ScenarioResult matching the schema exactly
        scenario_results.append(
            ScenarioResult(
                scenario_name=config["name"],
                scenario_label=config["label"],
                fan_chart=FanChartData(**result["fan_chart"]),
                metrics=RiskMetrics(**result["metrics"]),
            )
        )

    # --- Step 3: Build exposure heatmap data ---
    exposure_data = build_exposure_report(tickers)
    holdings_exposure = [
        HoldingExposure(
            ticker=tickers[i],
            sector=exposure_data[i]["sector"],
            exposure_score=exposure_data[i]["exposure_score"],
            exposure_label=exposure_data[i]["exposure_label"],
            weight=weights[i],
        )
        for i in range(len(tickers))
    ]

    # --- Step 4: Generate LLM summary ---
    try:
        llm_summary = await generate_summary(
            tickers=tickers,
            weights=weights,
            metrics_by_scenario=all_metrics,
            holdings_exposure=exposure_data,
        )
    except Exception:
        # LLM failure should never crash the whole response
        llm_summary = (
            "Risk summary unavailable. Please review the metrics table "
            "and fan chart for portfolio risk details."
        )

    computation_time = time.time() - start_time

    return PortfolioResponse(
        scenarios=scenario_results,
        holdings_exposure=holdings_exposure,
        llm_summary=llm_summary,
        computation_time_s=round(computation_time, 2),
    )