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
    CompareRequest,
    PortfolioSummary,
    CompareResponse,
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


def _build_portfolio_summaries(
    tickers: list,
    weights: list,
    scenario_results: list,
    exposure_data: list,
    label: str
) -> list:
    """
    Helper to build PortfolioSummary objects from analysis results.

    Args:
        tickers: List of stock tickers
        weights: Portfolio weights
        scenario_results: List of ScenarioResult objects from analysis
        exposure_data: Exposure report from build_exposure_report
        label: Portfolio label ('A' or 'B')

    Returns:
        List of PortfolioSummary objects, one per scenario
    """
    summaries = []

    # Find the holding with highest exposure score
    top_exposure_idx = max(
        range(len(exposure_data)),
        key=lambda i: exposure_data[i]["exposure_score"]
    )
    top_exposure_ticker = tickers[top_exposure_idx]
    top_exposure_score = exposure_data[top_exposure_idx]["exposure_score"]

    for scenario in scenario_results:
        summary = PortfolioSummary(
            label=label,
            tickers=tickers,
            scenario_name=scenario.scenario_name.lower(),
            expected_value=scenario.metrics.expected_value,
            var_95=scenario.metrics.var_95,
            prob_loss_20pct=scenario.metrics.prob_loss_20pct,
            sharpe_ratio=scenario.metrics.sharpe_ratio,
            annualised_return=float(getattr(scenario.metrics, 'annualised_return', 0) or 0),
            annualised_vol=scenario.metrics.annualised_vol,
            top_exposure=top_exposure_ticker,
            top_exposure_score=top_exposure_score,
        )
        summaries.append(summary)

    return summaries


@router.post("/compare", response_model=CompareResponse)
async def compare_portfolios(request: CompareRequest):
    """
    Compare two portfolios side-by-side under tariff stress scenarios.

    Runs full analysis on both portfolios and determines which is safer
    (lower overall probability of significant loss). Returns detailed metrics
    for each portfolio under each scenario.

    Args:
        request: CompareRequest with portfolio_a and portfolio_b

    Returns:
        CompareResponse with summaries for both portfolios and winner

    Raises:
        HTTPException 400: invalid tickers or insufficient data
        HTTPException 500: unexpected computation error
    """
    start_time = time.time()

    # --- Analyze Portfolio A ---
    try:
        tickers_a = [h.ticker for h in request.portfolio_a.holdings]
        weights_a = [h.weight for h in request.portfolio_a.holdings]
        market_data_a = get_portfolio_data(tickers_a)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Portfolio A: {str(e)}")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch data for Portfolio A: {str(e)}"
        )

    scenario_results_a = []
    for config in SCENARIO_CONFIGS:
        try:
            result = run_scenario(
                mean_returns=market_data_a["mean_returns"],
                cov_matrix=market_data_a["cov_matrix"],
                tickers=tickers_a,
                weights=weights_a,
                initial_value=request.portfolio_a.initial_value,
                scenario=config["id"],
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Simulation failed for Portfolio A scenario {config['id']}: {str(e)}"
            )

        scenario_results_a.append(
            ScenarioResult(
                scenario_name=config["name"],
                scenario_label=config["label"],
                fan_chart=FanChartData(**result["fan_chart"]),
                metrics=RiskMetrics(**result["metrics"]),
            )
        )

    exposure_data_a = build_exposure_report(tickers_a)
    summaries_a = _build_portfolio_summaries(
        tickers_a, weights_a, scenario_results_a, exposure_data_a, "A"
    )

    # --- Analyze Portfolio B ---
    try:
        tickers_b = [h.ticker for h in request.portfolio_b.holdings]
        weights_b = [h.weight for h in request.portfolio_b.holdings]
        market_data_b = get_portfolio_data(tickers_b)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Portfolio B: {str(e)}")
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch data for Portfolio B: {str(e)}"
        )

    scenario_results_b = []
    for config in SCENARIO_CONFIGS:
        try:
            result = run_scenario(
                mean_returns=market_data_b["mean_returns"],
                cov_matrix=market_data_b["cov_matrix"],
                tickers=tickers_b,
                weights=weights_b,
                initial_value=request.portfolio_b.initial_value,
                scenario=config["id"],
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Simulation failed for Portfolio B scenario {config['id']}: {str(e)}"
            )

        scenario_results_b.append(
            ScenarioResult(
                scenario_name=config["name"],
                scenario_label=config["label"],
                fan_chart=FanChartData(**result["fan_chart"]),
                metrics=RiskMetrics(**result["metrics"]),
            )
        )

    exposure_data_b = build_exposure_report(tickers_b)
    summaries_b = _build_portfolio_summaries(
        tickers_b, weights_b, scenario_results_b, exposure_data_b, "B"
    )

    # --- Determine winner based on average prob_loss_20pct across all scenarios ---
    avg_loss_a = sum(s.prob_loss_20pct for s in summaries_a) / len(summaries_a)
    avg_loss_b = sum(s.prob_loss_20pct for s in summaries_b) / len(summaries_b)

    diff = abs(avg_loss_a - avg_loss_b)

    if diff < 0.005:  # less than 0.5 percentage points difference
        winner = "TIE"
        winner_reason = (
            f"Both portfolios show essentially identical tariff risk "
            f"({avg_loss_a*100:.1f}% vs {avg_loss_b*100:.1f}% probability "
            f"of 20%+ loss under trade war). The difference is within "
            f"Monte Carlo simulation noise and is not meaningful."
        )
    elif avg_loss_a < avg_loss_b:
        winner = "A"
        winner_reason = (
            f"Portfolio A shows {diff*100:.1f}% lower probability of "
            f"significant loss under trade war conditions "
            f"({avg_loss_a*100:.1f}% vs {avg_loss_b*100:.1f}%), "
            f"indicating better diversification against tariff shocks."
        )
    else:
        winner = "B"
        winner_reason = (
            f"Portfolio B shows {diff*100:.1f}% lower probability of "
            f"significant loss under trade war conditions "
            f"({avg_loss_b*100:.1f}% vs {avg_loss_a*100:.1f}%), "
            f"indicating better diversification against tariff shocks."
        )

    return CompareResponse(
        portfolio_a=summaries_a,
        portfolio_b=summaries_b,
        winner=winner,
        winner_reason=winner_reason,
    )