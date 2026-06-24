"""ROA-TIS Core Engines — live calculation of all territorial indices."""
from database import get_db


# ═══════════════════════════════════════════════════════════════════════════════
# ENGINE 1: RTI — Resilience Territorial Index
# Weighted composite of 6 sub-indicators (0–100 each)
# ═══════════════════════════════════════════════════════════════════════════════

RTI_WEIGHTS = {
    "stewardship_capacity": 0.25,
    "ecological_literacy": 0.20,
    "wildlife_balance": 0.15,
    "pollinator_index": 0.15,
    "soil_organic_matter": 0.15,  # scaled: raw SOM% × 26.3 to get 0–100
    "habitat_connectivity": 0.10,
}

SOM_SCALE_FACTOR = 26.3  # converts SOM% (0–3.8) to 0–100 range


def calculate_rti(territory_id, year):
    """Calculate RTI from trajectory data and observations."""
    conn = get_db()

    # Get latest trajectory data for this territory/year
    traj = conn.execute(
        "SELECT * FROM trajectory_data WHERE territory_id = ? AND year <= ? ORDER BY year DESC LIMIT 1",
        (territory_id, year),
    ).fetchone()

    if not traj:
        conn.close()
        return None

    # Base values from trajectory
    stewardship = traj["stewardship_capacity"]
    ecology = traj["ecological_equilibrium"]
    wildlife = traj["wildlife_balance"]
    soil_raw = traj["soil_organic_matter"]

    # Derived indicators (pollinator correlates with wildlife, habitat with ecology)
    pollinator = wildlife * 1.05 if wildlife * 1.05 <= 100 else 100
    habitat = ecology * 0.98 if ecology * 0.98 <= 100 else 100
    soil_scaled = min(soil_raw * SOM_SCALE_FACTOR, 100)

    # Observation boost: recent farmer observations increase confidence & score
    obs_count = conn.execute(
        """SELECT COUNT(*) as cnt FROM observations o
           JOIN farms f ON o.farm_id = f.id
           WHERE f.territory_id = ? AND o.date >= ? || '-01-01'""",
        (territory_id, str(year)),
    ).fetchone()["cnt"]

    # Each observation adds a small boost (max +5 points from observations)
    obs_boost = min(obs_count * 0.5, 5.0)

    conn.close()

    # Weighted sum
    raw_rti = (
        stewardship * RTI_WEIGHTS["stewardship_capacity"]
        + ecology * RTI_WEIGHTS["ecological_literacy"]
        + wildlife * RTI_WEIGHTS["wildlife_balance"]
        + pollinator * RTI_WEIGHTS["pollinator_index"]
        + soil_scaled * RTI_WEIGHTS["soil_organic_matter"]
        + habitat * RTI_WEIGHTS["habitat_connectivity"]
    ) + obs_boost

    rti_score = round(min(raw_rti, 100), 1)

    # Confidence grade based on data freshness
    confidence = "A" if obs_count >= 3 else ("B" if obs_count >= 1 else "C")

    return {
        "rti_score": rti_score,
        "rti_stewardship_capacity": stewardship,
        "rti_ecological_literacy": round(ecology, 1),
        "rti_wildlife_balance": wildlife,
        "rti_pollinator_index": round(pollinator, 1),
        "rti_soil_organic_matter": round(soil_raw, 1),
        "rti_habitat_connectivity": round(habitat, 1),
        "rti_confidence": confidence,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ENGINE 2: TARS — Territorial Adaptive Resilience Score
# Counts hazard events and severity; lower = more resilient territory
# ═══════════════════════════════════════════════════════════════════════════════

# Thresholds for TARS status
TARS_ALERT_THRESHOLD = 8.0
TARS_EMERGENCY_THRESHOLD = 15.0


def calculate_tars(territory_id, year):
    """Calculate TARS from hazard event data stored in engine_scores."""
    conn = get_db()

    # Get existing hazard input data
    row = conn.execute(
        """SELECT tars_wildfire_events, tars_flood_events, tars_pest_disease,
                  tars_drought_days, tars_heatwave_days, tars_years_since_event
           FROM engine_scores WHERE territory_id = ? AND year = ?""",
        (territory_id, year),
    ).fetchone()

    conn.close()

    if not row:
        return None

    fire = row["tars_wildfire_events"] or 0
    flood = row["tars_flood_events"] or 0
    pest = row["tars_pest_disease"] or 0
    drought = row["tars_drought_days"] or 0
    heat = row["tars_heatwave_days"] or 0
    yrs_since = row["tars_years_since_event"] or 0

    # TARS formula: weighted sum of event counts + climate stress
    # Events have high weight; climate days normalized to 0–10 scale
    tars_score = round(
        (fire * 2.0)
        + (flood * 1.5)
        + (pest * 1.0)
        + (drought / 10.0)  # 30 days → 3.0
        + (heat / 10.0)     # 20 days → 2.0
        - (yrs_since * 0.5),  # recovery discount
        1
    )
    tars_score = max(tars_score, 0)

    # Status determination
    if tars_score >= TARS_EMERGENCY_THRESHOLD:
        status = "EMERGENCY"
    elif tars_score >= TARS_ALERT_THRESHOLD:
        status = "ALERT"
    else:
        status = "MONITOR"

    return {
        "tars_score": tars_score,
        "tars_wildfire_events": fire,
        "tars_flood_events": flood,
        "tars_pest_disease": pest,
        "tars_drought_days": drought,
        "tars_heatwave_days": heat,
        "tars_years_since_event": yrs_since,
        "tars_status": status,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ENGINE 3: BSEP — Black Swan Exposure Protocol
# Measures vulnerability to catastrophic, low-probability events
# ═══════════════════════════════════════════════════════════════════════════════

BSEP_CATEGORIES = {
    "CS": "Climate Shock",
    "RTC": "Rural-to-City migration",
    "II": "Infrastructure Isolation",
}


def calculate_bsep(territory_id, year):
    """Calculate BSEP from TARS severity, population loss, and recovery data."""
    conn = get_db()

    # Get TARS data for severity assessment
    scores = conn.execute(
        """SELECT tars_score, tars_wildfire_events, tars_drought_days,
                  bsep_recovery_target_years, bsep_current_recovery_pct
           FROM engine_scores WHERE territory_id = ? AND year = ?""",
        (territory_id, year),
    ).fetchone()

    # Get population trajectory
    traj = conn.execute(
        "SELECT population_index FROM trajectory_data WHERE territory_id = ? AND year <= ? ORDER BY year DESC LIMIT 1",
        (territory_id, year),
    ).fetchone()

    conn.close()

    if not scores:
        return None

    tars = scores["tars_score"] or 0
    fire = scores["tars_wildfire_events"] or 0
    drought = scores["tars_drought_days"] or 0
    recovery_yrs = scores["bsep_recovery_target_years"] or 0
    recovery_pct = scores["bsep_current_recovery_pct"] or 0
    pop_index = traj["population_index"] if traj else 100

    # Identify active black swan categories
    categories = []
    if fire >= 1 or drought >= 30:
        categories.append("CS")
    if pop_index < 70:
        categories.append("RTC")
    if tars >= 5:
        categories.append("II")

    category_str = " / ".join(categories) if categories else None

    # BSEP score: higher = worse exposure
    # Based on: TARS severity + population decline + lack of recovery
    pop_decline_factor = max(0, (100 - pop_index)) * 0.5  # 0–25 points
    recovery_deficit = max(0, 100 - recovery_pct) * 0.2    # 0–20 points
    tars_factor = tars * 3.0                                # 0–45 points

    bsep_score = round(min(tars_factor + pop_decline_factor + recovery_deficit, 100), 1)

    # Escalation level
    if bsep_score >= 70:
        escalation = "Emergency"
    elif bsep_score >= 40:
        escalation = "Alert"
    else:
        escalation = "Monitor"

    # Human capital risk
    if pop_index < 60:
        hc_risk = "CRITICAL"
    elif pop_index < 75:
        hc_risk = "HIGH"
    elif pop_index < 90:
        hc_risk = "MEDIUM"
    else:
        hc_risk = "LOW"

    return {
        "bsep_score": bsep_score,
        "bsep_category": category_str,
        "bsep_escalation": escalation,
        "bsep_recovery_target_years": recovery_yrs,
        "bsep_current_recovery_pct": recovery_pct,
        "bsep_human_capital_risk": hc_risk,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ENGINE 4: CAII — Community Adaptive Intelligence Index
# Measures collective capacity of the territory to self-organize
# ═══════════════════════════════════════════════════════════════════════════════

CAII_WEIGHTS = {
    "governance": 0.30,
    "human_capital": 0.25,
    "social_collaboration": 0.25,
    "territorial_intelligence": 0.20,
}


def calculate_caii(territory_id, year):
    """Calculate CAII from community indicators."""
    conn = get_db()

    row = conn.execute(
        """SELECT caii_community_governance, caii_human_capital,
                  caii_social_collaboration, caii_territorial_intelligence,
                  caii_triggered_missions
           FROM engine_scores WHERE territory_id = ? AND year = ?""",
        (territory_id, year),
    ).fetchone()

    # Observation activity boosts territorial intelligence sub-score
    obs_count = conn.execute(
        """SELECT COUNT(*) as cnt FROM observations o
           JOIN farms f ON o.farm_id = f.id
           WHERE f.territory_id = ? AND o.date >= ? || '-01-01'""",
        (territory_id, str(year)),
    ).fetchone()["cnt"]

    conn.close()

    if not row:
        return None

    gov = row["caii_community_governance"] or 0
    hc = row["caii_human_capital"] or 0
    soc = row["caii_social_collaboration"] or 0
    ti = row["caii_territorial_intelligence"] or 0
    missions = row["caii_triggered_missions"] or 0

    # Observations boost the territorial intelligence sub-indicator
    ti_boosted = min(ti + obs_count * 1.0, 100)

    # Weighted composite
    caii_score = round(
        gov * CAII_WEIGHTS["governance"]
        + hc * CAII_WEIGHTS["human_capital"]
        + soc * CAII_WEIGHTS["social_collaboration"]
        + ti_boosted * CAII_WEIGHTS["territorial_intelligence"],
        1,
    )

    return {
        "caii_score": caii_score,
        "caii_community_governance": gov,
        "caii_human_capital": hc,
        "caii_social_collaboration": soc,
        "caii_territorial_intelligence": round(ti_boosted, 1),
        "caii_triggered_missions": missions,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ENGINE 5: FSD — Future Sustainability Discounting (Budget Engine)
# Calculates the gap between scientific need and available funding
# ═══════════════════════════════════════════════════════════════════════════════

# Scientific need multiplier based on BSEP escalation level
SCENARIO_MULTIPLIERS = {
    "Ecological Recovery": 1.3,
    "Stewardship Push": 1.1,
    "Baseline": 1.0,
}


def calculate_fsd(territory_id, year, bsep_result=None):
    """Calculate Future Sustainability Discounting from budget data and BSEP."""
    conn = get_db()

    row = conn.execute(
        """SELECT budget_scientific_need, budget_current, budget_scenario, budget_urgency
           FROM engine_scores WHERE territory_id = ? AND year = ?""",
        (territory_id, year),
    ).fetchone()

    conn.close()

    if not row:
        return None

    base_need = row["budget_scientific_need"] or 0
    current = row["budget_current"] or 0
    scenario = row["budget_scenario"] or "Baseline"
    urgency = row["budget_urgency"] or 3

    # Adjust need based on BSEP escalation (if emergency, need increases)
    # NOTE: We compute adjusted_need for gap/ratio but do NOT overwrite
    # budget_scientific_need in the DB to avoid compounding on repeat runs.
    if bsep_result and bsep_result.get("bsep_escalation") == "Emergency":
        multiplier = 1.3
        scenario = "Ecological Recovery"
        urgency = 5
    elif bsep_result and bsep_result.get("bsep_escalation") == "Alert":
        multiplier = 1.1
        scenario = "Stewardship Push"
        urgency = 4
    else:
        multiplier = SCENARIO_MULTIPLIERS.get(scenario, 1.0)

    adjusted_need = round(base_need * multiplier, 1)
    gap = round(adjusted_need - current, 1)
    discounting_ratio = round(current / adjusted_need, 3) if adjusted_need > 0 else 1.0

    return {
        "budget_gap": gap,
        "budget_discounting_ratio": discounting_ratio,
        "budget_scenario": scenario,
        "budget_urgency": urgency,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# MASTER RECALCULATION — runs all engines and updates the database
# ═══════════════════════════════════════════════════════════════════════════════

def recalculate_all(territory_id, year):
    """Run all engines for a territory/year and update engine_scores table."""
    results = {}

    # Run engines in dependency order
    rti = calculate_rti(territory_id, year)
    tars = calculate_tars(territory_id, year)
    bsep = calculate_bsep(territory_id, year)
    caii = calculate_caii(territory_id, year)
    fsd = calculate_fsd(territory_id, year, bsep_result=bsep)

    if rti:
        results.update(rti)
    if tars:
        results.update(tars)
    if bsep:
        results.update(bsep)
    if caii:
        results.update(caii)
    if fsd:
        results.update(fsd)

    if not results:
        return None

    # Update database — use COALESCE to preserve existing values when engine returns None
    conn = get_db()

    # Build dynamic SET clause: only update fields that were computed
    set_parts = []
    values = []
    field_list = [
        "rti_score", "rti_stewardship_capacity", "rti_ecological_literacy",
        "rti_wildlife_balance", "rti_pollinator_index", "rti_soil_organic_matter",
        "rti_habitat_connectivity", "rti_confidence",
        "tars_score", "tars_status",
        "bsep_score", "bsep_category", "bsep_escalation",
        "bsep_recovery_target_years", "bsep_current_recovery_pct", "bsep_human_capital_risk",
        "caii_score", "caii_community_governance", "caii_human_capital",
        "caii_social_collaboration", "caii_territorial_intelligence", "caii_triggered_missions",
        "budget_scientific_need", "budget_current", "budget_gap",
        "budget_discounting_ratio", "budget_scenario", "budget_urgency",
    ]

    for field in field_list:
        if field in results:
            set_parts.append(f"{field} = ?")
            values.append(results[field])

    if not set_parts:
        conn.close()
        return results

    values.extend([territory_id, year])
    sql = f"UPDATE engine_scores SET {', '.join(set_parts)} WHERE territory_id = ? AND year = ?"
    conn.execute(sql, values)
    conn.commit()
    conn.close()

    return results
