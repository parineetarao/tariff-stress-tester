"""
Tariff exposure model for the Tariff Stress Tester.

Responsibilities:
  - Define the Scenario enum (single source of truth for scenario names)
  - Map GICS sectors to tariff sensitivity profiles
  - Apply scenario multipliers to simulation parameters

This module contains ONLY logic — no network calls, no data fetching.
Sector lookup lives in data_fetcher.get_sector_for_ticker().

Multiplier methodology:
  mean_factor:   relative reduction applied as new_mean = mean * (1 + factor)
                 -0.12 means a 12% proportional reduction in expected return.
                 Relative adjustment ensures shocks scale with each stock's
                 own return level rather than applying uniform absolute cuts.
  vol_multiplier: multiplicative scaling of volatility.
                 1.25 means 25% increase in annualised volatility.

Sources: USTR Section 301 tariff schedules, CBO drug supply chain report
(2023), Goldman Sachs sector impact estimates (March 2026),
SOX index behaviour during 2018-2019 tariff escalation.
"""

from dataclasses import dataclass
from enum import Enum

from services.data_fetcher import get_sector_for_ticker


# ---------------------------------------------------------------------------
# Scenario enum — single source of truth for valid scenario identifiers.
# Using str Enum means it serialises to a plain string in JSON responses
# and FastAPI/Pydantic accept it anywhere a str is expected.
# ---------------------------------------------------------------------------

class Scenario(str, Enum):
    baseline   = "baseline"
    escalation = "escalation"
    trade_war  = "trade_war"


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class TariffMultiplier:
    """
    Scenario-specific parameter adjustments for one stock.

    mean_factor:    relative adjustment to annualised mean return.
                    Applied as: new_mean = historical_mean * (1 + mean_factor)
                    -0.12 = 12% proportional reduction in expected return.
                    Relative (not additive) so shocks scale with each
                    stock's own return level.

    vol_multiplier: multiplicative scaling of annualised volatility.
                    1.25 = 25% increase in volatility.
    """
    mean_factor:    float
    vol_multiplier: float


@dataclass
class SectorExposure:
    """
    Complete tariff exposure profile for a GICS sector.

    exposure_score: 1.0–5.0 scale for the heatmap.
                    Half-steps (e.g. 4.5) used for colour granularity.
                    1 = minimal exposure, 5 = critical exposure.
    """
    sector_name:    str
    exposure_score: float
    exposure_label: str
    baseline:       TariffMultiplier
    escalation:     TariffMultiplier
    trade_war:      TariffMultiplier


# ---------------------------------------------------------------------------
# Sector exposure lookup table
# ---------------------------------------------------------------------------

SECTOR_EXPOSURE_MAP: dict[str, SectorExposure] = {

    "Technology": SectorExposure(
        sector_name="Technology",
        exposure_score=5.0,
        exposure_label="Critical exposure",
        baseline=TariffMultiplier(mean_factor=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_factor=-0.12, vol_multiplier=1.25),
        trade_war=TariffMultiplier(mean_factor=-0.22,  vol_multiplier=1.60),
    ),

    "Health Care": SectorExposure(
        sector_name="Health Care",
        exposure_score=4.5,
        exposure_label="High exposure",
        baseline=TariffMultiplier(mean_factor=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_factor=-0.10, vol_multiplier=1.20),
        trade_war=TariffMultiplier(mean_factor=-0.18,  vol_multiplier=1.50),
    ),

    "Consumer Discretionary": SectorExposure(
        sector_name="Consumer Discretionary",
        exposure_score=4.0,
        exposure_label="High exposure",
        baseline=TariffMultiplier(mean_factor=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_factor=-0.07, vol_multiplier=1.15),
        trade_war=TariffMultiplier(mean_factor=-0.15,  vol_multiplier=1.45),
    ),

    "Industrials": SectorExposure(
        sector_name="Industrials",
        exposure_score=3.0,
        exposure_label="Medium exposure",
        baseline=TariffMultiplier(mean_factor=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_factor=-0.04, vol_multiplier=1.10),
        trade_war=TariffMultiplier(mean_factor=-0.12,  vol_multiplier=1.40),
    ),

    "Communication Services": SectorExposure(
        sector_name="Communication Services",
        exposure_score=3.0,
        exposure_label="Medium exposure",
        baseline=TariffMultiplier(mean_factor=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_factor=-0.03, vol_multiplier=1.08),
        trade_war=TariffMultiplier(mean_factor=-0.10,  vol_multiplier=1.35),
    ),

    "Financials": SectorExposure(
        sector_name="Financials",
        exposure_score=2.5,
        exposure_label="Low-medium exposure",
        baseline=TariffMultiplier(mean_factor=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_factor=-0.02, vol_multiplier=1.08),
        trade_war=TariffMultiplier(mean_factor=-0.10,  vol_multiplier=1.38),
    ),

    "Consumer Staples": SectorExposure(
        sector_name="Consumer Staples",
        exposure_score=2.0,
        exposure_label="Low exposure",
        baseline=TariffMultiplier(mean_factor=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_factor=-0.02, vol_multiplier=1.06),
        trade_war=TariffMultiplier(mean_factor=-0.08,  vol_multiplier=1.28),
    ),

    "Energy": SectorExposure(
        sector_name="Energy",
        exposure_score=2.0,
        exposure_label="Low exposure",
        baseline=TariffMultiplier(mean_factor=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_factor=-0.01, vol_multiplier=1.05),
        trade_war=TariffMultiplier(mean_factor=-0.08,  vol_multiplier=1.30),
    ),

    "Real Estate": SectorExposure(
        sector_name="Real Estate",
        exposure_score=1.5,
        exposure_label="Minimal exposure",
        baseline=TariffMultiplier(mean_factor=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_factor=-0.01, vol_multiplier=1.05),
        trade_war=TariffMultiplier(mean_factor=-0.07,  vol_multiplier=1.25),
    ),

    "Utilities": SectorExposure(
        sector_name="Utilities",
        exposure_score=1.0,
        exposure_label="Minimal exposure",
        baseline=TariffMultiplier(mean_factor=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_factor=-0.01, vol_multiplier=1.04),
        trade_war=TariffMultiplier(mean_factor=-0.06,  vol_multiplier=1.22),
    ),

    "Unknown": SectorExposure(
        sector_name="Unknown",
        exposure_score=3.0,
        exposure_label="Medium exposure (unclassified)",
        baseline=TariffMultiplier(mean_factor=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_factor=-0.05, vol_multiplier=1.12),
        trade_war=TariffMultiplier(mean_factor=-0.12,  vol_multiplier=1.40),
    ),
}


# ---------------------------------------------------------------------------
# Public functions — all logic, zero network calls
# ---------------------------------------------------------------------------

def get_exposure_for_ticker(ticker: str) -> SectorExposure:
    """
    Return the full SectorExposure profile for a given ticker.

    Calls get_sector_for_ticker (in data_fetcher.py) which handles
    the network call and caching. This function contains only lookup
    logic — no network calls.

    Args:
        ticker: Uppercase stock ticker symbol

    Returns:
        SectorExposure dataclass with all scenario multipliers
    """
    sector = get_sector_for_ticker(ticker)
    return SECTOR_EXPOSURE_MAP.get(sector, SECTOR_EXPOSURE_MAP["Unknown"])


def get_scenario_multiplier(
    ticker: str,
    scenario: Scenario,
) -> TariffMultiplier:
    """
    Return the tariff multiplier for a ticker under a specific scenario.

    Args:
        ticker:   Uppercase stock ticker symbol
        scenario: Scenario enum value

    Returns:
        TariffMultiplier with mean_factor and vol_multiplier
    """
    exposure = get_exposure_for_ticker(ticker)
    return {
        Scenario.baseline:   exposure.baseline,
        Scenario.escalation: exposure.escalation,
        Scenario.trade_war:  exposure.trade_war,
    }[scenario]


def build_exposure_report(tickers: list[str]) -> list[dict]:
    """
    Build the exposure data for all holdings in the portfolio.
    Feeds directly into HoldingExposure schema and frontend heatmap.

    Uses get_exposure_for_ticker exclusively — no direct sector
    lookups or duplicate logic.

    Args:
        tickers: List of uppercase ticker symbols

    Returns:
        List of dicts with ticker, sector, exposure_score, exposure_label
    """
    report = []
    for ticker in tickers:
        exposure = get_exposure_for_ticker(ticker)
        report.append({
            "ticker":         ticker,
            "sector":         exposure.sector_name,
            "exposure_score": exposure.exposure_score,
            "exposure_label": exposure.exposure_label,
        })
    return report