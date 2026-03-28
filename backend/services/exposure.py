"""
Tariff exposure model for the Tariff Stress Tester.

This module maps each stock's GICS sector to a tariff sensitivity
profile — a set of multipliers that adjust mean return and volatility
under each scenario.

This is the differentiating layer of the project. Rather than applying
uniform shocks to all holdings, we model each sector's real-world
exposure to US tariff escalation based on:

- Supply chain dependence on imported goods (semiconductors, pharma APIs)
- Revenue exposure to retaliatory tariffs (exporters vs domestic)
- Historical sector behaviour during prior tariff episodes (2018-2019)

Sources documented in README.md.
"""

from dataclasses import dataclass
from functools import lru_cache


# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------

@dataclass
class TariffMultiplier:
    """
    Scenario-specific adjustments to a holding's return distribution.

    mean_adjustment: additive change to annualised mean return.
                     -0.12 means reduce expected return by 12 percentage points.
    vol_multiplier:  multiplicative change to annualised volatility.
                     1.25 means increase volatility by 25%.
    """
    mean_adjustment: float
    vol_multiplier: float


@dataclass
class SectorExposure:
    """
    Complete tariff exposure profile for a GICS sector.

    Attributes:
        sector_name:  Human-readable sector name
        exposure_score: 1-5 scale for the heatmap (1=minimal, 5=maximum)
        exposure_label: Text label for the heatmap
        baseline:     Multipliers under scenario 1 (current tariffs hold)
        escalation:   Multipliers under scenario 2 (30% tech/pharma tariffs)
        trade_war:    Multipliers under scenario 3 (blanket retaliation)
    """
    sector_name: str
    exposure_score: float
    exposure_label: str
    baseline: TariffMultiplier
    escalation: TariffMultiplier
    trade_war: TariffMultiplier


# ---------------------------------------------------------------------------
# Sector exposure lookup table
#
# Methodology:
#
# ESCALATION scenario (+30% tariff on tech/pharma imports):
# - Semiconductors/hardware: -12% mean, +25% vol
#   Basis: TSMC, ASML supply chains entirely offshore. Intel/AMD fab costs
#   rise directly. Historical: SOX index fell 20%+ during 2018 tariff rounds.
#
# - Pharmaceuticals: -10% mean, +20% vol
#   Basis: ~80% of US drug APIs sourced from China/India. FDA import
#   dependencies documented in CBO report on drug supply chains (2023).
#
# - Consumer discretionary: -7% mean, +15% vol
#   Basis: Retail (apparel, electronics) heavily import-dependent.
#   Auto sector faces both import costs and retaliatory export tariffs.
#
# - Industrials: -4% mean, +10% vol
#   Basis: Mixed. Import-heavy manufacturers hurt. Domestic infrastructure
#   players (Caterpillar US ops) partially insulated or benefit from
#   reshoring incentives.
#
# - Financials: -2% mean, +8% vol
#   Basis: No direct tariff exposure but correlated with macro slowdown.
#   Credit risk rises if corporate earnings compress sector-wide.
#
# - Communication services: -3% mean, +8% vol
#   Basis: Hardware-dependent (network equipment, devices) but software
#   revenues largely domestic. Mixed exposure.
#
# - Energy: -1% mean, +5% vol
#   Basis: Oil/gas priced globally, limited tariff sensitivity. Some
#   equipment costs rise. Domestic producers partially benefit from
#   protectionist sentiment.
#
# - Consumer staples: -2% mean, +6% vol
#   Basis: Some agricultural input exposure. Brand pricing power
#   partially offsets cost increases.
#
# - Healthcare services: -2% mean, +6% vol
#   Basis: Services revenue domestic. Drug cost exposure via pharma
#   supply chain but buffered by insurance pass-through.
#
# - Utilities: -1% mean, +4% vol
#   Basis: Entirely domestic revenue. Equipment imports (transformers,
#   turbines) are a cost pressure but regulated rate recovery offsets.
#
# - Real estate: -1% mean, +5% vol
#   Basis: Construction material costs rise (steel, aluminium tariffs).
#   Otherwise domestic revenue, low direct exposure.
#
# TRADE WAR scenario (blanket retaliation, risk-off event):
# All sectors receive an additional shock on top of escalation.
# Modelled as a volatility regime shift (VIX historically doubles
# during trade war escalations) plus uniform mean compression.
# ---------------------------------------------------------------------------

SECTOR_EXPOSURE_MAP: dict[str, SectorExposure] = {

    "Technology": SectorExposure(
        sector_name="Technology",
        exposure_score=5.0,
        exposure_label="Critical exposure",
        baseline=TariffMultiplier(mean_adjustment=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_adjustment=-0.12, vol_multiplier=1.25),
        trade_war=TariffMultiplier(mean_adjustment=-0.22, vol_multiplier=1.60),
    ),

    "Health Care": SectorExposure(
        sector_name="Health Care",
        exposure_score=4.5,
        exposure_label="High exposure",
        baseline=TariffMultiplier(mean_adjustment=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_adjustment=-0.10, vol_multiplier=1.20),
        trade_war=TariffMultiplier(mean_adjustment=-0.18, vol_multiplier=1.50),
    ),

    "Consumer Discretionary": SectorExposure(
        sector_name="Consumer Discretionary",
        exposure_score=4.0,
        exposure_label="High exposure",
        baseline=TariffMultiplier(mean_adjustment=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_adjustment=-0.07, vol_multiplier=1.15),
        trade_war=TariffMultiplier(mean_adjustment=-0.15, vol_multiplier=1.45),
    ),

    "Industrials": SectorExposure(
        sector_name="Industrials",
        exposure_score=3.0,
        exposure_label="Medium exposure",
        baseline=TariffMultiplier(mean_adjustment=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_adjustment=-0.04, vol_multiplier=1.10),
        trade_war=TariffMultiplier(mean_adjustment=-0.12, vol_multiplier=1.40),
    ),

    "Communication Services": SectorExposure(
        sector_name="Communication Services",
        exposure_score=3.0,
        exposure_label="Medium exposure",
        baseline=TariffMultiplier(mean_adjustment=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_adjustment=-0.03, vol_multiplier=1.08),
        trade_war=TariffMultiplier(mean_adjustment=-0.10, vol_multiplier=1.35),
    ),

    "Financials": SectorExposure(
        sector_name="Financials",
        exposure_score=2.5,
        exposure_label="Low-medium exposure",
        baseline=TariffMultiplier(mean_adjustment=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_adjustment=-0.02, vol_multiplier=1.08),
        trade_war=TariffMultiplier(mean_adjustment=-0.10, vol_multiplier=1.38),
    ),

    "Consumer Staples": SectorExposure(
        sector_name="Consumer Staples",
        exposure_score=2.0,
        exposure_label="Low exposure",
        baseline=TariffMultiplier(mean_adjustment=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_adjustment=-0.02, vol_multiplier=1.06),
        trade_war=TariffMultiplier(mean_adjustment=-0.08, vol_multiplier=1.28),
    ),

    "Energy": SectorExposure(
        sector_name="Energy",
        exposure_score=2.0,
        exposure_label="Low exposure",
        baseline=TariffMultiplier(mean_adjustment=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_adjustment=-0.01, vol_multiplier=1.05),
        trade_war=TariffMultiplier(mean_adjustment=-0.08, vol_multiplier=1.30),
    ),

    "Health Care Services": SectorExposure(
        sector_name="Health Care Services",
        exposure_score=2.0,
        exposure_label="Low exposure",
        baseline=TariffMultiplier(mean_adjustment=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_adjustment=-0.02, vol_multiplier=1.06),
        trade_war=TariffMultiplier(mean_adjustment=-0.09, vol_multiplier=1.30),
    ),

    "Real Estate": SectorExposure(
        sector_name="Real Estate",
        exposure_score=1.5,
        exposure_label="Minimal exposure",
        baseline=TariffMultiplier(mean_adjustment=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_adjustment=-0.01, vol_multiplier=1.05),
        trade_war=TariffMultiplier(mean_adjustment=-0.07, vol_multiplier=1.25),
    ),

    "Utilities": SectorExposure(
        sector_name="Utilities",
        exposure_score=1.0,
        exposure_label="Minimal exposure",
        baseline=TariffMultiplier(mean_adjustment=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_adjustment=-0.01, vol_multiplier=1.04),
        trade_war=TariffMultiplier(mean_adjustment=-0.06, vol_multiplier=1.22),
    ),

    "Unknown": SectorExposure(
        sector_name="Unknown",
        exposure_score=3.0,
        exposure_label="Medium exposure (unclassified)",
        baseline=TariffMultiplier(mean_adjustment=0.0,   vol_multiplier=1.0),
        escalation=TariffMultiplier(mean_adjustment=-0.05, vol_multiplier=1.12),
        trade_war=TariffMultiplier(mean_adjustment=-0.12, vol_multiplier=1.40),
    ),
}


# ---------------------------------------------------------------------------
# Public functions
# ---------------------------------------------------------------------------

@lru_cache(maxsize=128)
def get_sector_for_ticker(ticker: str) -> str:
    """
    Look up the GICS sector for a given ticker using yfinance.
    
    Result is cached after first call — subsequent calls for the
    same ticker return instantly without a network request.
    lru_cache persists for the lifetime of the server process.

    Falls back to 'Unknown' if the sector cannot be determined,
    rather than crashing — unknown tickers get medium exposure.

    Args:
        ticker: Uppercase stock ticker symbol

    Returns:
        GICS sector string matching a key in SECTOR_EXPOSURE_MAP
    """
    try:
        import yfinance as yf
        info = yf.Ticker(ticker).info
        sector = info.get("sector", "Unknown")
        if sector not in SECTOR_EXPOSURE_MAP:
            return "Unknown"
        return sector
    except Exception:
        return "Unknown"


def get_exposure_for_ticker(ticker: str) -> SectorExposure:
    """
    Return the full SectorExposure profile for a given ticker.

    Args:
        ticker: Uppercase stock ticker symbol

    Returns:
        SectorExposure dataclass with all scenario multipliers
    """
    sector = get_sector_for_ticker(ticker)
    return SECTOR_EXPOSURE_MAP[sector]


def get_scenario_multiplier(
    ticker: str,
    scenario: str
) -> TariffMultiplier:
    """
    Return the tariff multiplier for a ticker under a specific scenario.

    Args:
        ticker:   Uppercase stock ticker symbol
        scenario: One of 'baseline', 'escalation', 'trade_war'

    Returns:
        TariffMultiplier with mean_adjustment and vol_multiplier

    Raises:
        ValueError: If scenario name is not recognised
    """
    exposure = get_exposure_for_ticker(ticker)
    scenario_map = {
        "baseline":   exposure.baseline,
        "escalation": exposure.escalation,
        "trade_war":  exposure.trade_war,
    }
    if scenario not in scenario_map:
        raise ValueError(
            f"Unknown scenario '{scenario}'. "
            f"Must be one of: {list(scenario_map.keys())}"
        )
    return scenario_map[scenario]


def build_exposure_report(tickers: list[str]) -> list[dict]:
    """
    Build the exposure data for all holdings in the portfolio.
    This feeds directly into the HoldingExposure schema and
    the frontend heatmap component.

    Args:
        tickers: List of uppercase ticker symbols

    Returns:
        List of dicts with ticker, sector, exposure_score, exposure_label
    """
    report = []
    for ticker in tickers:
        sector = get_sector_for_ticker(ticker)
        exposure = SECTOR_EXPOSURE_MAP[sector]
        report.append({
            "ticker": ticker,
            "sector": exposure.sector_name,
            "exposure_score": exposure.exposure_score,
            "exposure_label": exposure.exposure_label,
        })
    return report