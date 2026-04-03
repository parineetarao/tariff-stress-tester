"""
Data fetching service for the Tariff Stress Tester.

Responsible for one thing only: given a list of tickers,
fetch 2 years of daily adjusted close prices from Yahoo Finance
and return the log returns and covariance matrix.

No simulation logic lives here. No exposure logic lives here.
This module fetches and transforms raw price data — nothing else.
"""

import numpy as np
import pandas as pd
import yfinance as yf
from typing import Tuple
from functools import lru_cache


def fetch_price_data(tickers: list[str]) -> pd.DataFrame:
    """
    Fetch 2 years of daily adjusted close prices for a list of tickers.

    Args:
        tickers: List of uppercase stock ticker symbols e.g. ['AAPL', 'NVDA']

    Returns:
        DataFrame with dates as index, tickers as columns, adjusted
        close prices as values. Any missing values are forward-filled
        then backward-filled to handle market holidays.

    Raises:
        ValueError: If a ticker is invalid or has insufficient price history.
    """
    raw = yf.download(
        tickers=tickers,
        period="2y",
        auto_adjust=True,
        progress=False,
    )

    # yfinance returns multi-level columns when fetching multiple tickers.
    # We only need the 'Close' prices.
    if isinstance(raw.columns, pd.MultiIndex):
        prices = raw["Close"]
    else:
        # Single ticker — columns are flat, rename to ticker name
        prices = raw[["Close"]].rename(columns={"Close": tickers[0]})

    # Validate we got data for all requested tickers
    missing = [t for t in tickers if t not in prices.columns]
    if missing:
        # Remove invalid tickers instead of crashing
        valid_tickers = [t for t in tickers if t in prices.columns]
        if len(valid_tickers) < 2:
            raise ValueError(
                f"Could not fetch data for: {missing}. "
                f"Need at least 2 valid tickers."
        )
        prices = prices[valid_tickers]

    # Fill missing values caused by market holidays or data gaps
    prices = prices.ffill().bfill()

    # Drop any remaining rows where all values are NaN
    prices = prices.dropna(how="all")

    # Validate we have enough history for a meaningful simulation
    if len(prices) < 252:
        raise ValueError(
            f"Insufficient price history. Got {len(prices)} days, "
            f"need at least 252 (1 year). "
            f"Some tickers may be too new."
        )

    return prices


def compute_log_returns(prices: pd.DataFrame) -> pd.DataFrame:
    """
    Compute daily log returns from price data.

    We use log returns (not simple returns) because they are:
    1. Time-additive: log returns over multiple days sum correctly
    2. Normally distributed: better statistical properties for simulation
    3. Symmetric: a 50% loss and 100% gain are equal in magnitude

    Formula: r_t = ln(P_t / P_{t-1})

    Args:
        prices: DataFrame of adjusted close prices

    Returns:
        DataFrame of daily log returns, same shape minus the first row
    """
    log_returns = np.log(prices / prices.shift(1)).dropna()
    return log_returns


def compute_covariance_matrix(log_returns: pd.DataFrame) -> pd.DataFrame:
    """
    Compute the annualised covariance matrix of daily log returns.

    This is the critical methodological choice in the simulation.
    We do NOT assume independence between holdings. The covariance
    matrix captures how stocks move together — essential for accurate
    portfolio risk modelling.

    A portfolio of NVDA + AMD (both semiconductors, highly correlated)
    is far riskier than a portfolio of NVDA + JNJ (different sectors,
    low correlation). The covariance matrix encodes this difference.

    Annualised by multiplying daily covariance by 252 trading days.

    Args:
        log_returns: DataFrame of daily log returns

    Returns:
        Annualised covariance matrix as a DataFrame
    """
    daily_cov = log_returns.cov()
    annualised_cov = daily_cov * 252
    return annualised_cov


def compute_mean_returns(log_returns: pd.DataFrame) -> pd.Series:
    """
    Compute annualised mean daily log returns for each ticker.

    These represent the historical expected return for each holding,
    before any scenario adjustments are applied.

    Annualised by multiplying daily mean by 252 trading days.

    Args:
        log_returns: DataFrame of daily log returns

    Returns:
        Series of annualised mean returns, indexed by ticker
    """
    annualised_means = log_returns.mean() * 252
    return annualised_means


def get_portfolio_data(tickers: list[str]) -> dict:
    """
    Master function: fetch prices and compute all statistical inputs
    needed by the risk engine.

    This is the only function the router calls. It orchestrates the
    four steps above and returns everything in one dictionary.

    Args:
        tickers: List of uppercase stock ticker symbols

    Returns:
        Dictionary containing:
            - prices: raw price DataFrame
            - log_returns: daily log returns DataFrame
            - mean_returns: annualised mean returns Series
            - cov_matrix: annualised covariance matrix DataFrame
            - n_days: number of trading days in the dataset
    """
    prices = fetch_price_data(tickers)
    log_returns = compute_log_returns(prices)
    mean_returns = compute_mean_returns(log_returns)
    cov_matrix = compute_covariance_matrix(log_returns)

    return {
        "prices": prices,
        "log_returns": log_returns,
        "mean_returns": mean_returns,
        "cov_matrix": cov_matrix,
        "n_days": len(log_returns),
    }


SECTOR_NAME_MAP = {
    "Technology":             "Technology",
    "Information Technology": "Technology",
    "Healthcare":             "Health Care",
    "Health Care":            "Health Care",
    "Pharmaceuticals":        "Health Care",
    "Biotechnology":          "Health Care",
    "Drug Manufacturers":     "Health Care",
    "Medical Devices":        "Health Care",
    "Financial Services":     "Financials",
    "Financials":             "Financials",
    "Banks":                  "Financials",
    "Insurance":              "Financials",
    "Asset Management":       "Financials",
    "Consumer Cyclical":      "Consumer Discretionary",
    "Consumer Discretionary": "Consumer Discretionary",
    "Automotive":             "Consumer Discretionary",
    "Retail":                 "Consumer Discretionary",
    "Consumer Defensive":     "Consumer Staples",
    "Consumer Staples":       "Consumer Staples",
    "Grocery Stores":         "Consumer Staples",
    "Beverages":              "Consumer Staples",
    "Industrials":            "Industrials",
    "Aerospace & Defense":    "Industrials",
    "Basic Materials":        "Industrials",
    "Chemicals":              "Industrials",
    "Energy":                 "Energy",
    "Oil & Gas":              "Energy",
    "Real Estate":            "Real Estate",
    "Utilities":              "Utilities",
    "Communication Services": "Communication Services",
    "Telecommunications":     "Communication Services",
    "Media":                  "Communication Services",
}


@lru_cache(maxsize=128)
def get_sector_for_ticker(ticker: str) -> str:
    """
    Look up the GICS sector for a given ticker using yfinance.

    Normalises yfinance sector names to match SECTOR_EXPOSURE_MAP keys.
    yfinance returns names like 'Healthcare' and 'Financial Services'
    which differ from standard GICS names like 'Health Care' and
    'Financials'. Without this mapping every non-Tech ticker falls
    through to Unknown and gets generic medium exposure.

    Cached after first call — subsequent calls return instantly
    without a network request. Cache persists for server lifetime.

    Args:
        ticker: Uppercase stock ticker symbol

    Returns:
        Normalised sector string matching a key in SECTOR_EXPOSURE_MAP.
        Falls back to 'Unknown' if lookup fails or sector unrecognised.
    """
    try:
        info = yf.Ticker(ticker).info
        raw_sector = info.get("sector", "Unknown")
        return SECTOR_NAME_MAP.get(raw_sector, "Unknown")
    except Exception:
        return "Unknown"