"""
Pydantic schemas for the Tariff Stress Tester API.

These models define the exact shape of every request and response.
All services import from here — this is the single source of truth
for data structures across the entire backend.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Dict


# ---------------------------------------------------------------------------
# Request models — what the frontend sends TO the backend
# ---------------------------------------------------------------------------

class HoldingInput(BaseModel):
    """
    Represents a single stock holding in a portfolio.

    Attributes:
        ticker: Stock symbol e.g. 'AAPL', 'NVDA', 'MSFT'
        weight: Portfolio weight as a decimal e.g. 0.4 means 40%
    """
    ticker: str = Field(..., min_length=1, max_length=10)
    weight: float = Field(..., gt=0, le=1)

    @field_validator("ticker")
    @classmethod
    def ticker_must_be_uppercase(cls, v: str) -> str:
        """Normalise ticker to uppercase so 'aapl' and 'AAPL' both work."""
        return v.upper().strip()


class PortfolioRequest(BaseModel):
    """
    The full request body sent by the frontend when the user
    clicks 'Run Analysis'.

    Attributes:
        holdings: List of stock tickers with their weights.
                  Weights must sum to approximately 1.0.
        initial_value: Portfolio value in USD. Defaults to 100,000.
    """
    holdings: List[HoldingInput] = Field(..., min_length=2, max_length=10)
    initial_value: float = Field(default=100_000, gt=0)

    @field_validator("holdings")
    @classmethod
    def weights_must_sum_to_one(cls, v: List[HoldingInput]) -> List[HoldingInput]:
        """
        Reject portfolios where weights don't sum to ~1.0.
        Allows a small tolerance of 0.01 for floating point rounding.
        """
        total = sum(h.weight for h in v)
        if abs(total - 1.0) > 0.01:
            raise ValueError(
                f"Portfolio weights must sum to 1.0, got {total:.4f}. "
                f"Check your weights add up correctly."
            )
        return v


# ---------------------------------------------------------------------------
# Response models — what the backend sends BACK to the frontend
# ---------------------------------------------------------------------------

class FanChartData(BaseModel):
    """
    Percentile bands for the scenario fan chart.
    Each field is a list of values at days [30, 90, 180].

    Example: p5 = [88000, 79000, 71000] means at day 30 the 5th
    percentile outcome is $88k, at day 90 it's $79k, etc.
    """
    p5:  List[float]
    p25: List[float]
    p50: List[float]
    p75: List[float]
    p95: List[float]
    days: List[int] = [30, 90, 180]


class RiskMetrics(BaseModel):
    """
    Scalar risk metrics computed from the Monte Carlo simulation
    for a single scenario.

    All monetary values are in USD.
    All percentages are decimals: 0.15 means 15%.
    """
    expected_value:     float = Field(..., description="Mean terminal portfolio value (USD)")
    var_95:             float = Field(..., description="Value at Risk at 95% confidence (USD loss)")
    cvar_95:            float = Field(..., description="Conditional VaR — avg loss in worst 5% (USD)")
    sharpe_ratio:       float = Field(..., description="Annualised Sharpe ratio")
    annualised_return:  float = Field(..., description="Expected annualised return as decimal")
    annualised_vol:     float = Field(..., description="Annualised volatility as decimal")
    prob_loss_10pct:    float = Field(..., description="Probability of losing more than 10%")
    prob_loss_20pct:    float = Field(..., description="Probability of losing more than 20%")


class ScenarioResult(BaseModel):
    """
    Complete result for one tariff scenario.

    Combines the fan chart data (for the chart) with the scalar
    risk metrics (for the table) under a single named scenario.
    """
    scenario_name:  str
    scenario_label: str
    fan_chart:      FanChartData
    metrics:        RiskMetrics


class HoldingExposure(BaseModel):
    """
    Tariff exposure rating for a single holding.
    Used to populate the heatmap in the frontend.
    """
    ticker:         str
    sector:         str
    exposure_score: float = Field(..., ge=1, le=5,
                                  description="1=minimal exposure, 5=maximum exposure")
    exposure_label: str
    weight:         float


class PortfolioResponse(BaseModel):
    """
    The complete API response returned after running the analysis.
    This is everything the frontend needs to render all four components:
    the fan chart, heatmap, metrics table, and LLM summary card.
    """
    scenarios:          List[ScenarioResult]
    holdings_exposure:  List[HoldingExposure]
    llm_summary:        str
    computation_time_s: float = Field(..., description="How long the analysis took in seconds")