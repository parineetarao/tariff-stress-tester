"""
LLM summary service for the Tariff Stress Tester.

Generates a plain-English 3-sentence risk summary specific to
the actual portfolio composition and scenario results.
Currently uses a template-based approach that reads real metrics.
Replace generate_summary with a real GPT-4o-mini call when
OPENAI_API_KEY is available.
"""


def _get_risk_level(prob_loss_20: float) -> str:
    if prob_loss_20 > 0.20:
        return "severe"
    if prob_loss_20 > 0.10:
        return "elevated"
    if prob_loss_20 > 0.05:
        return "moderate"
    return "low"


def _get_worst_scenario(metrics_by_scenario: dict) -> tuple:
    """Return the name and metrics of the worst scenario."""
    worst_name = max(
        metrics_by_scenario,
        key=lambda k: metrics_by_scenario[k].get("prob_loss_20pct", 0)
    )
    return worst_name, metrics_by_scenario[worst_name]


def _get_most_exposed(holdings_exposure: list) -> dict:
    """Return the holding with the highest exposure score."""
    return max(holdings_exposure, key=lambda h: h["exposure_score"])


def _get_portfolio_concentration(holdings_exposure: list) -> str:
    """Describe the portfolio's sector concentration."""
    sectors = {}
    for h in holdings_exposure:
        sector = h["sector"]
        weight = h.get("weight", 0)
        sectors[sector] = sectors.get(sector, 0) + weight

    dominant = max(sectors, key=sectors.get)
    dominant_weight = sectors[dominant]

    if dominant_weight > 0.6:
        return f"heavily concentrated in {dominant} ({dominant_weight*100:.0f}%)"
    if dominant_weight > 0.4:
        return f"moderately concentrated in {dominant} ({dominant_weight*100:.0f}%)"
    return "diversified across multiple sectors"


def _describe_sharpe_change(baseline_sharpe: float, worst_sharpe: float) -> str:
    drop = baseline_sharpe - worst_sharpe
    if drop > 0.5:
        return f"with risk-adjusted returns deteriorating sharply (Sharpe drops from {baseline_sharpe:.2f} to {worst_sharpe:.2f})"
    if drop > 0.2:
        return f"with risk-adjusted returns declining (Sharpe drops from {baseline_sharpe:.2f} to {worst_sharpe:.2f})"
    return f"with moderate impact on risk-adjusted returns (Sharpe: {baseline_sharpe:.2f} → {worst_sharpe:.2f})"


def _high_exposure_holdings(holdings_exposure: list) -> list:
    """Return tickers with exposure score >= 4."""
    return [h for h in holdings_exposure if h["exposure_score"] >= 4]


def _low_exposure_holdings(holdings_exposure: list) -> list:
    """Return tickers with exposure score <= 2."""
    return [h for h in holdings_exposure if h["exposure_score"] <= 2]


# ---------------------------------------------------------------------------
# Three clean layers:
#   1. generate_template_summary — pure deterministic, no external calls
#   2. generate_llm_summary      — OpenAI call only, raises on failure
#   3. generate_summary          — routes between the two, public interface
# ---------------------------------------------------------------------------

def generate_template_summary(
    tickers: list[str],
    weights: list[float],
    metrics_by_scenario: dict,
    holdings_exposure: list[dict],
) -> str:
    """
    Generate a deterministic risk summary from portfolio metrics.

    No external calls. Always succeeds. Used when no API key is
    present or as fallback when the LLM call fails.

    Returns a three-sentence plain-English summary specific to
    the actual portfolio composition and scenario results.
    """
    worst_name, worst_metrics = _get_worst_scenario(metrics_by_scenario)
    baseline_metrics = metrics_by_scenario.get("baseline", worst_metrics)

    prob_20 = worst_metrics.get("prob_loss_20pct", 0)
    prob_10 = worst_metrics.get("prob_loss_10pct", 0)
    risk_level = _get_risk_level(prob_20)

    worst_label = {
        "baseline":   "baseline",
        "escalation": "escalation",
        "trade_war":  "trade war",
    }.get(worst_name, worst_name)

    baseline_sharpe = baseline_metrics.get("sharpe_ratio", 0)
    worst_sharpe = worst_metrics.get("sharpe_ratio", 0)
    sharpe_desc = _describe_sharpe_change(baseline_sharpe, worst_sharpe)

    concentration = _get_portfolio_concentration(holdings_exposure)
    high_exp = _high_exposure_holdings(holdings_exposure)
    low_exp = _low_exposure_holdings(holdings_exposure)

    sentence1 = (
        f"Under the {worst_label} scenario, this {len(tickers)}-stock "
        f"portfolio faces {risk_level} tariff risk — there is a "
        f"{prob_20*100:.1f}% probability of losing more than 20% of "
        f"value over 6 months, {sharpe_desc}."
    )

    if high_exp:
        high_tickers = ", ".join(h["ticker"] for h in high_exp)
        high_sectors = list(set(h["sector"] for h in high_exp))
        sector_str = " and ".join(high_sectors[:2])
        sentence2 = (
            f"The portfolio is {concentration}, with {high_tickers} "
            f"carrying critical tariff exposure through {sector_str} — "
            f"sectors directly targeted by current import restrictions."
        )
    else:
        most_exp = _get_most_exposed(holdings_exposure)
        sentence2 = (
            f"The portfolio is {concentration} — while no single holding "
            f"carries critical tariff exposure, {most_exp['ticker']} "
            f"({most_exp['sector']}) represents the highest sensitivity "
            f"at {most_exp['exposure_score']}/5."
        )

    if low_exp and high_exp:
        low_tickers = ", ".join(h["ticker"] for h in low_exp[:2])
        sentence3 = (
            f"The holdings with minimal tariff exposure ({low_tickers}) "
            f"act as a partial hedge — increasing their allocation or "
            f"reducing high-exposure positions would materially improve "
            f"the trade war scenario outcome."
        )
    elif high_exp and not low_exp:
        sentence3 = (
            f"With no low-exposure holdings acting as a buffer, consider "
            f"adding Utilities or Consumer Staples positions to reduce "
            f"the {prob_10*100:.1f}% probability of a 10%+ loss under "
            f"escalation."
        )
    else:
        sentence3 = (
            f"The diversified sector exposure limits concentrated tariff "
            f"risk, but the {prob_10*100:.1f}% probability of a 10%+ loss "
            f"under the {worst_label} scenario warrants monitoring sector "
            f"rotation as trade policy evolves."
        )

    return f"{sentence1}\n\n{sentence2}\n\n{sentence3}\n\n(Not financial advice.)"


async def generate_llm_summary(
    tickers: list[str],
    weights: list[float],
    metrics_by_scenario: dict,
    holdings_exposure: list[dict],
    api_key: str,
) -> str:
    """
    Generate a risk summary using GPT-4o-mini.

    Only called when api_key is confirmed present.
    Raises on failure — caller decides what to do with the error.

    Args:
        tickers:             list of ticker symbols
        weights:             portfolio weights as decimals
        metrics_by_scenario: simulation results per scenario
        holdings_exposure:   sector exposure data per holding
        api_key:             confirmed non-empty OpenAI API key

    Returns:
        Three-sentence risk summary string from GPT-4o-mini.

    Raises:
        Exception: any OpenAI API or network error, uncaught,
                   so the caller can decide to fall back cleanly.
    """
    from openai import AsyncOpenAI

    worst_name, _ = _get_worst_scenario(metrics_by_scenario)

    portfolio_str = ", ".join(
        f"{tickers[i]} ({weights[i]*100:.0f}%)"
        for i in range(len(tickers))
    )

    exposure_str = ", ".join(
        f"{h['ticker']}={h['sector']} (score {h['exposure_score']}/5)"
        for h in holdings_exposure
    )

    metrics_str = "\n".join(
        f"{scenario}: VaR=${m['var_95']:,.0f}, "
        f"CVaR=${m['cvar_95']:,.0f}, "
        f"Sharpe={m['sharpe_ratio']:.2f}, "
        f"P(loss>20%)={m['prob_loss_20pct']*100:.1f}%"
        for scenario, m in metrics_by_scenario.items()
    )

    client = AsyncOpenAI(api_key=api_key)

    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=200,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a portfolio risk analyst giving a brief "
                    "to a client. Write exactly 3 sentences. "
                    "Sentence 1: state the overall risk level and "
                    "worst scenario with the specific probability. "
                    "Sentence 2: identify the most exposed holding "
                    "by name and explain why it is exposed. "
                    "Sentence 3: give one specific actionable "
                    "implication based on the actual portfolio "
                    "composition. "
                    "Be specific — use actual ticker names and numbers. "
                    "Do not give financial advice. "
                    "End with exactly one sentence: "
                    "(Not financial advice.) "
                    "Do not exceed 3 sentences plus the disclaimer."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Portfolio: {portfolio_str}\n"
                    f"Sector exposures: {exposure_str}\n"
                    f"Scenario metrics:\n{metrics_str}\n"
                    f"Worst scenario: {worst_name}"
                ),
            },
        ],
    )

    return response.choices[0].message.content.strip()


async def generate_summary(
    tickers: list[str],
    weights: list[float],
    metrics_by_scenario: dict,
    holdings_exposure: list[dict],
) -> str:
    """
    Public interface — routes between LLM and template summary.

    Decision is made once at the top based on whether
    OPENAI_API_KEY is set. Never attempts an API call without
    a confirmed key. Falls back to template if the LLM call
    fails for any reason.

    Args:
        tickers:             list of ticker symbols
        weights:             portfolio weights as decimals
        metrics_by_scenario: simulation results per scenario
        holdings_exposure:   sector exposure data per holding

    Returns:
        Three-sentence plain-English risk summary string.
        Always succeeds — template fallback guarantees a result.
    """
    import os
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    use_llm = bool(api_key)

    if not use_llm:
        return generate_template_summary(
            tickers, weights, metrics_by_scenario, holdings_exposure
        )

    try:
        return await generate_llm_summary(
            tickers, weights, metrics_by_scenario,
            holdings_exposure, api_key
        )
    except Exception as e:
        # LLM call failed — fall back to template silently
        # Log the error so it's visible in server logs without
        # crashing the request
        print(f"[llm_summary] OpenAI call failed, using template: {e}")
        return generate_template_summary(
            tickers, weights, metrics_by_scenario, holdings_exposure
        )