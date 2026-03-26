"""
Scenarios router for the Tariff Stress Tester API.

Exposes GET /scenarios — returns the metadata for all three
tariff scenarios. The frontend calls this on load to display
scenario names, labels and descriptions dynamically.

This means scenario descriptions are defined in one place (here),
not hardcoded in the React components. If the scenario parameters
change, only the backend needs updating.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/scenarios", tags=["scenarios"])


class ScenarioMeta(BaseModel):
    """
    Metadata for a single tariff scenario.
    Does not include simulation parameters — those live in exposure.py.
    This is purely display information for the frontend.
    """
    id:            str
    name:          str
    label:         str
    description:   str
    severity:      str
    color:         str
    last_updated:  str


class ScenariosResponse(BaseModel):
    scenarios:      list[ScenarioMeta]
    methodology_note: str


SCENARIOS: list[ScenarioMeta] = [
    ScenarioMeta(
        id="baseline",
        name="Baseline",
        label="Current tariffs hold",
        description=(
            "Current US tariff levels remain in place with no further "
            "escalation. Portfolio returns and volatility are modelled "
            "using historical parameters without adjustment. This "
            "represents the status quo as of March 2026."
        ),
        severity="low",
        color="teal",
        last_updated="2026-03-26",
    ),
    ScenarioMeta(
        id="escalation",
        name="Escalation",
        label="+30% tariffs on tech and pharma imports",
        description=(
            "An additional 30% tariff is imposed on technology hardware "
            "and pharmaceutical imports. Based on USTR Section 301 "
            "escalation precedents from 2018-2019. Analyst consensus "
            "estimates 8-15% earnings cuts for exposed sectors. "
            "Technology and Health Care holdings are most affected."
        ),
        severity="medium",
        color="amber",
        last_updated="2026-03-26",
    ),
    ScenarioMeta(
        id="trade_war",
        name="Trade War",
        label="Full retaliatory tariff escalation",
        description=(
            "Blanket retaliatory tariffs trigger a risk-off event across "
            "all sectors. Modelled as a simultaneous volatility regime "
            "shift and mean return compression. VIX historically doubles "
            "during full trade war escalations. All sectors are affected "
            "with Technology and Health Care experiencing the largest shocks."
        ),
        severity="high",
        color="red",
        last_updated="2026-03-26",
    ),
]


@router.get("", response_model=ScenariosResponse)
def get_scenarios():
    """
    Return metadata for all three tariff scenarios.

    Called by the frontend on initial load to populate scenario
    labels, descriptions, and color coding. Keeping this in the
    backend means scenario copy never needs a frontend redeploy.

    Returns:
        ScenariosResponse containing all scenario metadata and
        a methodology note explaining the modelling approach.
    """
    return ScenariosResponse(
        scenarios=SCENARIOS,
        methodology_note=(
            "Scenario parameters (mean return adjustments and volatility "
            "multipliers) are research-backed estimates documented in "
            "exposure.py. Sources include USTR tariff announcements, "
            "CBO supply chain reports, and analyst consensus estimates. "
            "Parameters were last reviewed March 2026. To update: edit "
            "the multipliers in services/exposure.py and update the "
            "last_updated field in routers/scenarios.py."
        ),
    )