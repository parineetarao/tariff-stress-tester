"""
Monte Carlo simulation engine for the Tariff Stress Tester.

This is the core of the project. It takes portfolio parameters,
applies tariff scenario adjustments, and simulates 10,000 portfolio
paths over 180 trading days using correlated multivariate normal
returns.

Critical methodological choice: we use numpy.random.multivariate_normal
to draw correlated daily returns for all holdings simultaneously. This
correctly models the fact that stocks in the same sector tend to move
together — especially under macro shocks like tariff escalation.
Assuming independence (drawing each stock separately) would
dramatically underestimate portfolio risk.
"""

import numpy as np
import pandas as pd
from typing import Tuple

from services.exposure import get_scenario_multiplier

# Simulation constants — these are architectural decisions
N_SIMULATIONS = 10_000          # number of Monte Carlo paths
HORIZON_DAYS = 180              # total simulation horizon
CHECKPOINTS = [30, 90, 180]     # days at which we snapshot portfolio value
TRADING_DAYS_PER_YEAR = 252
RISK_FREE_RATE = 0.045          # annualised, ~current US 10yr yield


def _apply_scenario_adjustments(
    mean_returns: pd.Series,
    cov_matrix: pd.DataFrame,
    tickers: list[str],
    scenario: str,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Apply tariff multipliers to mean returns and covariance matrix
    for a given scenario.

    Mean adjustment is additive: new_mean = historical_mean + adjustment
    Vol adjustment is multiplicative: new_vol = historical_vol * multiplier

    We adjust the covariance matrix by scaling each element by the
    product of the two stocks' volatility multipliers. This correctly
    propagates the vol shock through the full covariance structure.

    Args:
        mean_returns: annualised mean returns per ticker
        cov_matrix:   annualised covariance matrix
        tickers:      list of ticker symbols
        scenario:     'baseline', 'escalation', or 'trade_war'

    Returns:
        Tuple of (adjusted_daily_means, adjusted_daily_cov)
        Both converted to daily scale for the simulation.
    """
    n = len(tickers)
    adj_annual_means = np.zeros(n)
    vol_multipliers  = np.zeros(n)

    for i, ticker in enumerate(tickers):
        multiplier = get_scenario_multiplier(ticker, scenario)
        adj_annual_means[i] = (
            mean_returns[ticker] + multiplier.mean_adjustment
        )
        vol_multipliers[i] = multiplier.vol_multiplier

    # Convert annualised means to daily
    adj_daily_means = adj_annual_means / TRADING_DAYS_PER_YEAR

    # Scale covariance matrix by vol multipliers
    # cov_ij_new = cov_ij_old * vol_mult_i * vol_mult_j
    cov_array = cov_matrix.values.copy()
    for i in range(n):
        for j in range(n):
            cov_array[i, j] *= vol_multipliers[i] * vol_multipliers[j]

    # Convert annualised covariance to daily
    adj_daily_cov = cov_array / TRADING_DAYS_PER_YEAR

    return adj_daily_means, adj_daily_cov


def _run_simulation(
    daily_means: np.ndarray,
    daily_cov: np.ndarray,
    weights: np.ndarray,
    initial_value: float,
) -> dict:
    """
    Run the Monte Carlo simulation and return terminal values
    at each checkpoint day.

    Each path:
      - Starts at initial_value
      - Each day: draw correlated log returns for all stocks
      - Apply log returns: price *= exp(return)
      - Portfolio value = weighted sum of individual stock values
      - Snapshot at days 30, 90, 180

    Args:
        daily_means:   adjusted daily mean returns, shape (n_stocks,)
        daily_cov:     adjusted daily covariance matrix, shape (n, n)
        weights:       portfolio weights, shape (n_stocks,)
        initial_value: starting portfolio value in USD

    Returns:
        Dictionary mapping checkpoint day to array of
        terminal values, shape (N_SIMULATIONS,)
    """
    # snapshots[30] = array of 10,000 portfolio values at day 30
    snapshots = {day: np.zeros(N_SIMULATIONS) for day in CHECKPOINTS}

    # Current value of each stock position across all simulations
    # Shape: (N_SIMULATIONS, n_stocks)
    # Each stock starts at its weighted portion of initial_value
    stock_values = np.outer(
        np.ones(N_SIMULATIONS),
        weights * initial_value
    )

    for day in range(1, HORIZON_DAYS + 1):
        # Draw correlated daily log returns for all stocks simultaneously
        # Shape: (N_SIMULATIONS, n_stocks)
        # Each row is one simulation's daily return vector
        # Correlations from daily_cov ensure stocks move together
        log_returns = np.random.multivariate_normal(
            mean=daily_means,
            cov=daily_cov,
            size=N_SIMULATIONS,
        )

        # Apply log returns: multiply each stock value by exp(return)
        # This is the correct way to apply log returns
        # (NOT stock_values += stock_values * return)
        stock_values = stock_values * np.exp(log_returns)

        # Snapshot portfolio value at checkpoints
        if day in CHECKPOINTS:
            snapshots[day] = stock_values.sum(axis=1)

    return snapshots


def _compute_metrics(
    terminal_values: np.ndarray,
    initial_value: float,
    daily_means: np.ndarray,
    daily_cov: np.ndarray,
    weights: np.ndarray,
) -> dict:
    """
    Compute scalar risk metrics from the terminal value distribution.

    Args:
        terminal_values: array of 10,000 terminal portfolio values
        initial_value:   starting portfolio value
        daily_means:     adjusted daily mean returns
        daily_cov:       adjusted daily covariance matrix
        weights:         portfolio weights

    Returns:
        Dictionary of risk metrics matching the RiskMetrics schema
    """
    # VaR: the 5th percentile of terminal values
    # i.e. in 95% of simulations, portfolio ends above this value
    var_threshold = np.percentile(terminal_values, 5)
    var_95 = initial_value - var_threshold

    # CVaR: mean of all values below the VaR threshold
    # i.e. average outcome in the worst 5% of cases
    tail_values = terminal_values[terminal_values <= var_threshold]
    cvar_95 = initial_value - np.mean(tail_values)

    # Expected (mean) terminal value
    expected_value = np.mean(terminal_values)

    # Probability of loss > 10%
    threshold_10 = initial_value * 0.90
    prob_loss_10 = np.mean(terminal_values < threshold_10)

    # Probability of loss > 20%
    threshold_20 = initial_value * 0.80
    prob_loss_20 = np.mean(terminal_values < threshold_20)

    # Portfolio-level annualised return and volatility
    # Weighted combination of individual stock parameters
    ann_return = float(np.dot(weights, daily_means) * TRADING_DAYS_PER_YEAR)
    port_variance = float(
        weights @ (daily_cov * TRADING_DAYS_PER_YEAR) @ weights
    )
    ann_vol = float(np.sqrt(port_variance))

    # Sharpe ratio
    sharpe = (
        (ann_return - RISK_FREE_RATE) / ann_vol
        if ann_vol > 0 else 0.0
    )

    return {
        "expected_value":    float(expected_value),
        "var_95":            float(var_95),
        "cvar_95":           float(cvar_95),
        "sharpe_ratio":      float(sharpe),
        "annualised_return": float(ann_return),
        "annualised_vol":    float(ann_vol),
        "prob_loss_10pct":   float(prob_loss_10),
        "prob_loss_20pct":   float(prob_loss_20),
    }


def _compute_fan_chart(snapshots: dict) -> dict:
    """
    Compute percentile bands from simulation snapshots.
    These feed directly into the ScenarioFanChart component.

    Args:
        snapshots: dict mapping day -> array of 10,000 portfolio values

    Returns:
        Dictionary with p5, p25, p50, p75, p95 bands
        Each is a list of values at [day 30, day 90, day 180]
    """
    percentiles = [5, 25, 50, 75, 95]
    result = {f"p{p}": [] for p in percentiles}
    result["days"] = CHECKPOINTS

    for day in CHECKPOINTS:
        vals = snapshots[day]
        for p in percentiles:
            result[f"p{p}"].append(float(np.percentile(vals, p)))

    return result


def run_scenario(
    mean_returns: pd.Series,
    cov_matrix: pd.DataFrame,
    tickers: list[str],
    weights: list[float],
    initial_value: float,
    scenario: str,
) -> dict:
    """
    Master function: run the full Monte Carlo simulation for one scenario.

    This is the only function called by the portfolio router.
    It orchestrates all steps:
      1. Apply tariff adjustments to parameters
      2. Run 10,000 simulation paths
      3. Compute risk metrics from terminal values
      4. Compute fan chart percentile bands

    Args:
        mean_returns:  annualised mean returns from data_fetcher
        cov_matrix:    annualised covariance matrix from data_fetcher
        tickers:       list of ticker symbols
        weights:       portfolio weights as decimals (must sum to 1.0)
        initial_value: starting portfolio value in USD
        scenario:      'baseline', 'escalation', or 'trade_war'

    Returns:
        Dictionary with 'fan_chart' and 'metrics' keys,
        matching ScenarioResult schema structure.
    """
    weights_array = np.array(weights)

    # Step 1: apply scenario adjustments
    daily_means, daily_cov = _apply_scenario_adjustments(
        mean_returns, cov_matrix, tickers, scenario
    )

    # Step 2: run simulation
    snapshots = _run_simulation(
        daily_means, daily_cov, weights_array, initial_value
    )

    # Step 3: compute metrics from day-180 terminal values
    metrics = _compute_metrics(
        snapshots[180], initial_value,
        daily_means, daily_cov, weights_array
    )

    # Step 4: compute fan chart bands from all checkpoints
    fan_chart = _compute_fan_chart(snapshots)

    return {
        "fan_chart": fan_chart,
        "metrics":   metrics,
    }