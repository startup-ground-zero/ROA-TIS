"""ROA-TIS Backend API — Flask server serving territorial intelligence data."""
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_db, init_db

app = Flask(__name__)
CORS(app)


# ── Dashboard KPIs ──
@app.route("/api/dashboard/<territory_id>/<int:year>")
def dashboard(territory_id, year):
    conn = get_db()
    scores = conn.execute(
        "SELECT * FROM engine_scores WHERE territory_id = ? AND year = ?",
        (territory_id, year),
    ).fetchone()
    commands = conn.execute(
        "SELECT * FROM command_center WHERE territory_id = ? AND year = ?",
        (territory_id, year),
    ).fetchall()
    priorities = conn.execute(
        "SELECT * FROM priorities WHERE territory_id = ? AND year = ? ORDER BY rank",
        (territory_id, year),
    ).fetchall()
    conn.close()

    if not scores:
        return jsonify({"error": "No data found"}), 404

    return jsonify({
        "kpis": {
            "rti": scores["rti_score"],
            "tars": scores["tars_score"],
            "bsep": scores["bsep_score"],
            "budget_gap": scores["budget_gap"],
        },
        "command_center": [
            {
                "question": c["question"],
                "live_signal": c["live_signal"],
                "status": c["status"],
                "action_label": c["action_label"],
            }
            for c in commands
        ],
        "priorities": [
            {
                "rank": p["rank"],
                "severity": p["severity"],
                "domain": p["domain"],
                "signal": p["signal"],
                "score": p["score"],
            }
            for p in priorities
        ],
    })


# ── 60-Year Trajectory ──
@app.route("/api/trajectory/<territory_id>")
def trajectory(territory_id):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM trajectory_data WHERE territory_id = ? ORDER BY year",
        (territory_id,),
    ).fetchall()
    conn.close()

    return jsonify({
        "labels": [str(r["year"]) for r in rows],
        "stewardship_capacity": [r["stewardship_capacity"] for r in rows],
        "ecological_equilibrium": [r["ecological_equilibrium"] for r in rows],
        "wildlife_balance": [r["wildlife_balance"] for r in rows],
        "soil_organic_matter": [r["soil_organic_matter"] for r in rows],
        "population_index": [r["population_index"] for r in rows],
    })


# ── Multi-ROA Comparison ──
@app.route("/api/comparison/<int:year>")
def comparison(year):
    conn = get_db()
    rows = conn.execute("""
        SELECT t.name, e.rti_score, e.tars_score, e.opci_score
        FROM engine_scores e
        JOIN territories t ON e.territory_id = t.id
        WHERE e.year = ?
        ORDER BY e.rti_score DESC
    """, (year,)).fetchall()
    conn.close()

    return jsonify({
        "labels": [r["name"] for r in rows],
        "rti": [r["rti_score"] for r in rows],
        "tars": [r["tars_score"] for r in rows],
        "opci": [r["opci_score"] for r in rows],
    })


# ── Engine Detail ──
@app.route("/api/engines/<territory_id>/<int:year>")
def engines(territory_id, year):
    conn = get_db()
    s = conn.execute(
        "SELECT * FROM engine_scores WHERE territory_id = ? AND year = ?",
        (territory_id, year),
    ).fetchone()
    conn.close()

    if not s:
        return jsonify({"error": "No data found"}), 404

    return jsonify({
        "rti": {
            "score": s["rti_score"],
            "confidence": s["rti_confidence"],
            "params": {
                "stewardship_capacity": s["rti_stewardship_capacity"],
                "ecological_literacy": s["rti_ecological_literacy"],
                "wildlife_balance": s["rti_wildlife_balance"],
                "pollinator_index": s["rti_pollinator_index"],
                "soil_organic_matter": s["rti_soil_organic_matter"],
                "habitat_connectivity": s["rti_habitat_connectivity"],
            },
        },
        "tars": {
            "score": s["tars_score"],
            "status": s["tars_status"],
            "params": {
                "wildfire_events": s["tars_wildfire_events"],
                "flood_events": s["tars_flood_events"],
                "pest_disease": s["tars_pest_disease"],
                "drought_days": s["tars_drought_days"],
                "heatwave_days": s["tars_heatwave_days"],
                "years_since_event": s["tars_years_since_event"],
            },
        },
        "opci": {
            "score": s["opci_score"],
            "params": {
                "productive_trees_pct": s["opci_productive_trees_pct"],
                "tree_vitality": s["opci_tree_vitality"],
                "avg_trunk_perimeter": s["opci_avg_trunk_perimeter"],
                "yield_per_tree": s["opci_yield_per_tree"],
                "regenerative_inputs": s["opci_regenerative_inputs"],
            },
        },
        "bsep": {
            "score": s["bsep_score"],
            "category": s["bsep_category"],
            "escalation": s["bsep_escalation"],
            "recovery_target_years": s["bsep_recovery_target_years"],
            "current_recovery_pct": s["bsep_current_recovery_pct"],
            "human_capital_risk": s["bsep_human_capital_risk"],
        },
        "caii": {
            "score": s["caii_score"],
            "params": {
                "community_governance": s["caii_community_governance"],
                "human_capital": s["caii_human_capital"],
                "social_collaboration": s["caii_social_collaboration"],
                "territorial_intelligence": s["caii_territorial_intelligence"],
            },
            "triggered_missions": s["caii_triggered_missions"],
        },
        "budget": {
            "scientific_need": s["budget_scientific_need"],
            "current": s["budget_current"],
            "gap": s["budget_gap"],
            "discounting_ratio": s["budget_discounting_ratio"],
            "scenario": s["budget_scenario"],
            "urgency": s["budget_urgency"],
        },
    })


# ── Territories List ──
@app.route("/api/territories")
def territories():
    conn = get_db()
    rows = conn.execute("SELECT * FROM territories ORDER BY name").fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


# ── Farmer Portal ──
@app.route("/api/farm/<farm_id>")
def farm_detail(farm_id):
    conn = get_db()
    farm = conn.execute("SELECT * FROM farms WHERE id = ?", (farm_id,)).fetchone()
    production = conn.execute(
        "SELECT * FROM production_data WHERE farm_id = ? ORDER BY year DESC LIMIT 1",
        (farm_id,),
    ).fetchone()
    conn.close()

    if not farm:
        return jsonify({"error": "Farm not found"}), 404

    return jsonify({
        "farm": dict(farm),
        "latest_production": dict(production) if production else None,
    })


@app.route("/api/farm/<farm_id>/workings")
def farm_workings(farm_id):
    month = request.args.get("month", "2025-06")
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM workings WHERE farm_id = ? AND date LIKE ? ORDER BY date",
        (farm_id, f"{month}%"),
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


@app.route("/api/farm/<farm_id>/observations", methods=["POST"])
def submit_observation(farm_id):
    data = request.get_json()
    if not data or "date" not in data:
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db()
    # Verify farm exists
    farm = conn.execute("SELECT id FROM farms WHERE id = ?", (farm_id,)).fetchone()
    if not farm:
        conn.close()
        return jsonify({"error": "Farm not found"}), 404

    conn.execute(
        """INSERT INTO observations
           (farm_id, date, observation_type, description,
            buffer_zone_clear, access_paths_passable, no_ignition_risk)
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (
            farm_id,
            data["date"],
            data.get("observation_type", "general"),
            data.get("description", ""),
            1 if data.get("buffer_zone_clear") else 0,
            1 if data.get("access_paths_passable") else 0,
            1 if data.get("no_ignition_risk") else 0,
        ),
    )
    conn.commit()
    conn.close()
    return jsonify({"status": "ok", "message": "Observation recorded"}), 201


@app.route("/api/farm/<farm_id>/observations")
def list_observations(farm_id):
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM observations WHERE farm_id = ? ORDER BY date DESC LIMIT 50",
        (farm_id,),
    ).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])


# ── Health check ──
@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "version": "0.1.0", "stage": 1})


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
