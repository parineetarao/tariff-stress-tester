"""
LLM summary service for the Tariff Stress Tester.

Generates a plain-English risk summary using GPT-4o-mini.
Currently stubbed — full implementation added after API key setup.
"""


async def generate_summary(
    tickers: list[str],
    weights: list[float],
    metrics_by_scenario: dict,
    holdings_exposure: list[dict],
) -> str:
    """
    Generate a 3-sentence plain-English risk summary.
    Stub implementation — returns a formatted summary from metrics.
    """
    escalation = metrics_by_scenario.get("escalation", {})
    trade_war = metrics_by_scenario.get("trade_war", {})

    worst_scenario = "trade war"
    max_loss_pct = round(trade_war.get("prob_loss_20pct", 0) * 100, 1)
    most_exposed = max(
        holdings_exposure,
        key=lambda x: x["exposure_score"]
    )

    return (
        f"Under the {worst_scenario} scenario, this portfolio faces significant "
        f"tariff-driven headwinds with a {max_loss_pct}% probability of losing "
        f"more than 20% of its value over 6 months. "
        f"{most_exposed['ticker']} ({most_exposed['sector']}) represents the "
        f"highest tariff exposure in the portfolio with a score of "
        f"{most_exposed['exposure_score']}/5, directly in the path of "
        f"tech and pharma import tariffs. "
        f"Consider reducing concentration in high-exposure sectors and "
        f"increasing allocation to utilities or consumer staples as a hedge. "
        f"(This is not financial advice.)"
    )