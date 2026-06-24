"""Seed the ROA-TIS database with Elysian EVOO and comparison data."""
from database import get_db, init_db


def seed():
    init_db()
    conn = get_db()
    c = conn.cursor()

    # ── Territories ──
    territories = [
        ("elysian", "Elysian EVOO", "Sella, Achaea", "Greece", 38.1547, 21.7683, 7.5, 50, "60-year historical sandbox — anchor pilot"),
        ("sella", "Sella", "Achaea", "Greece", 38.15, 21.77, 120.0, 320, "Village-scale ROA"),
        ("kastritsi", "Kastritsi", "Achaea", "Greece", 38.22, 21.73, 95.0, 280, "Village-scale ROA"),
        ("wgreece", "Western Greece", "Western Greece", "Greece", 38.25, 21.74, 11350.0, 680000, "Regional-scale ROA"),
        ("chalandritsa", "Chalandritsa", "Achaea", "Greece", 38.14, 21.78, 85.0, 420, "Village meridian ROA"),
        ("messinia", "Messinia", "Peloponnese", "Greece", 37.05, 21.95, 2991.0, 160000, "Comparison region"),
        ("crete", "Crete", "Crete", "Greece", 35.24, 24.90, 8336.0, 623000, "Comparison region"),
        ("andalusia", "Andalusia", "Andalusia", "Spain", 37.88, -4.78, 87268.0, 8500000, "International comparison"),
        ("tuscany", "Tuscany", "Tuscany", "Italy", 43.77, 11.25, 22987.0, 3730000, "International comparison"),
        ("alentejo", "Alentejo", "Alentejo", "Portugal", 38.57, -7.91, 31551.0, 715000, "International comparison"),
    ]
    c.executemany(
        "INSERT OR REPLACE INTO territories (id, name, region, country, latitude, longitude, area_ha, population, description) VALUES (?,?,?,?,?,?,?,?,?)",
        territories,
    )

    # ── Farms ──
    farms = [
        ("farm-elysian", "elysian", "Elysian EVOO", "Sella, Achaea", 38.1547, 21.7683, 7.5, 1230, 1, "Alexandros Liakopoulos", None, "Unknown"),
        ("farm-sella", "sella", "Sella Grove", "Sella, Achaea", 38.16, 21.77, 4.2, 680, 1, "Nikos Papadopoulos", None, "Active"),
        ("farm-kastritsi", "kastritsi", "Kastritsi Estate", "Kastritsi, Achaea", 38.22, 21.73, 5.0, 820, 0, "Maria Kosta", None, "Active"),
        ("farm-wgreece", "wgreece", "Western Greece Coop", "Patras, Achaea", 38.25, 21.74, 12.0, 2100, 1, "Cooperative", None, "Active"),
        ("farm-chalandritsa", "chalandritsa", "Chalandritsa Farm", "Chalandritsa, Achaea", 38.18, 21.72, 6.0, 950, 0, "Giorgos Andrikos", None, "Unknown"),
        ("farm-messinia", "messinia", "Messinia Groves", "Kalamata, Messinia", 37.04, 22.11, 9.0, 1500, 1, "Eleni Messini", None, "Active"),
        ("farm-crete", "crete", "Cretan Heritage", "Chania, Crete", 35.51, 24.02, 8.5, 1400, 1, "Manolis Kretikos", None, "Active"),
        ("farm-andalusia", "andalusia", "Andalusia Estate", "Jaén, Spain", 37.77, -3.79, 15.0, 3200, 0, "Carlos Olivar", None, "Active"),
        ("farm-tuscany", "tuscany", "Tuscan Hills", "Siena, Italy", 43.32, 11.33, 6.5, 1050, 1, "Marco Toscani", None, "Active"),
        ("farm-alentejo", "alentejo", "Alentejo Grove", "Beja, Portugal", 38.02, -7.87, 11.0, 1800, 0, "João Oliveira", None, "Active"),
    ]
    c.executemany(
        "INSERT OR REPLACE INTO farms (id, territory_id, name, location, latitude, longitude, area_ha, tree_count, organic_certified, steward_name, steward_age, succession_status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
        farms,
    )

    # ── 60-Year Trajectory (All Territories) ──
    trajectory = [
        # Elysian — strong recovery trajectory
        ("elysian", 1965, 78, 74.3, 68, 64, 100),
        ("elysian", 1975, 72, 70.7, 64, 60, 87.5),
        ("elysian", 1985, 65, 63.6, 56, 54, 75),
        ("elysian", 1995, 58, 57.1, 50, 48, 62.5),
        ("elysian", 2005, 60, 60.6, 55, 46, 62.5),
        ("elysian", 2015, 70, 72.1, 66, 56, 50),
        ("elysian", 2025, 88, 85.2, 82, 76, 50),
        # Sella — declining, limited stewardship
        ("sella", 1965, 72, 68.0, 62, 58, 95),
        ("sella", 1975, 68, 65.0, 58, 55, 82),
        ("sella", 1985, 60, 58.0, 50, 48, 70),
        ("sella", 1995, 52, 50.0, 44, 40, 58),
        ("sella", 2005, 48, 46.0, 40, 36, 50),
        ("sella", 2015, 50, 48.0, 42, 38, 45),
        ("sella", 2025, 55, 52.1, 48, 42, 42),
        # Kastritsi — stable but stagnant
        ("kastritsi", 1965, 70, 66.0, 60, 56, 92),
        ("kastritsi", 1975, 66, 63.0, 56, 52, 80),
        ("kastritsi", 1985, 58, 56.0, 48, 46, 68),
        ("kastritsi", 1995, 52, 50.0, 44, 40, 58),
        ("kastritsi", 2005, 50, 48.0, 42, 38, 52),
        ("kastritsi", 2015, 52, 50.0, 44, 40, 48),
        ("kastritsi", 2025, 54, 52.1, 47, 40, 45),
        # Western Greece — large scale, moderate health
        ("wgreece", 1965, 75, 72.0, 65, 60, 98),
        ("wgreece", 1975, 70, 67.0, 60, 56, 85),
        ("wgreece", 1985, 62, 60.0, 52, 48, 72),
        ("wgreece", 1995, 56, 54.0, 46, 42, 60),
        ("wgreece", 2005, 58, 56.0, 50, 44, 55),
        ("wgreece", 2015, 63, 62.0, 56, 50, 50),
        ("wgreece", 2025, 65, 62.0, 60, 56, 48),
        # Chalandritsa — slow recovery
        ("chalandritsa", 1965, 74, 70.0, 64, 58, 96),
        ("chalandritsa", 1975, 68, 64.0, 58, 54, 82),
        ("chalandritsa", 1985, 60, 56.0, 50, 46, 68),
        ("chalandritsa", 1995, 54, 50.0, 44, 40, 56),
        ("chalandritsa", 2005, 52, 50.0, 44, 38, 50),
        ("chalandritsa", 2015, 56, 54.0, 48, 44, 46),
        ("chalandritsa", 2025, 62, 58.0, 55, 48, 44),
        # Messinia — strong ecological base
        ("messinia", 1965, 80, 76.0, 70, 66, 100),
        ("messinia", 1975, 74, 70.0, 64, 60, 88),
        ("messinia", 1985, 66, 62.0, 56, 52, 74),
        ("messinia", 1995, 58, 54.0, 48, 44, 62),
        ("messinia", 2005, 55, 52.0, 46, 42, 55),
        ("messinia", 2015, 58, 56.0, 50, 48, 50),
        ("messinia", 2025, 60, 56.0, 53, 50, 48),
        # Crete — fire risk, resilient ecology
        ("crete", 1965, 76, 72.0, 66, 62, 98),
        ("crete", 1975, 70, 66.0, 60, 56, 85),
        ("crete", 1985, 62, 58.0, 52, 48, 72),
        ("crete", 1995, 54, 50.0, 44, 40, 60),
        ("crete", 2005, 52, 50.0, 44, 38, 54),
        ("crete", 2015, 56, 54.0, 48, 44, 48),
        ("crete", 2025, 60, 57.0, 54, 46, 45),
        # Andalusia — industrial scale, stressed
        ("andalusia", 1965, 70, 66.0, 60, 56, 96),
        ("andalusia", 1975, 64, 60.0, 54, 50, 82),
        ("andalusia", 1985, 56, 52.0, 46, 42, 68),
        ("andalusia", 1995, 48, 44.0, 38, 34, 56),
        ("andalusia", 2005, 44, 42.0, 36, 32, 50),
        ("andalusia", 2015, 48, 46.0, 40, 36, 46),
        ("andalusia", 2025, 54, 50.0, 48, 40, 44),
        # Tuscany — premium, well-maintained
        ("tuscany", 1965, 82, 78.0, 72, 68, 100),
        ("tuscany", 1975, 76, 72.0, 66, 62, 90),
        ("tuscany", 1985, 68, 64.0, 58, 54, 78),
        ("tuscany", 1995, 60, 58.0, 52, 48, 66),
        ("tuscany", 2005, 58, 56.0, 52, 48, 60),
        ("tuscany", 2015, 62, 60.0, 56, 52, 55),
        ("tuscany", 2025, 66, 64.0, 62, 58, 52),
        # Alentejo — large, low density, stressed soils
        ("alentejo", 1965, 68, 64.0, 58, 54, 94),
        ("alentejo", 1975, 62, 58.0, 52, 48, 80),
        ("alentejo", 1985, 54, 50.0, 44, 40, 66),
        ("alentejo", 1995, 46, 42.0, 36, 32, 54),
        ("alentejo", 2005, 44, 42.0, 36, 30, 48),
        ("alentejo", 2015, 48, 46.0, 40, 36, 44),
        ("alentejo", 2025, 56, 52.0, 50, 42, 42),
    ]
    c.executemany(
        "INSERT OR REPLACE INTO trajectory_data (territory_id, year, stewardship_capacity, ecological_equilibrium, wildlife_balance, soil_organic_matter, population_index) VALUES (?,?,?,?,?,?,?)",
        trajectory,
    )

    # ── Engine Scores (all ROAs, 2025) ──
    engine_scores = [
        # (territory_id, year, rti, stew, ecolit, wildlife, pollinator, soil, habitat, rti_conf,
        #  tars, fire, flood, pest, drought, heat, yrs_since, tars_status,
        #  opci, prod_trees, vitality, trunk, yield, regen_inputs,
        #  bsep, bsep_cat, bsep_esc, bsep_rec_yrs, bsep_rec_pct, bsep_hc,
        #  caii, caii_gov, caii_hc, caii_soc, caii_ti, caii_missions,
        #  budget_need, budget_cur, budget_gap, budget_disc, budget_scen, budget_urg)
        ("elysian", 2025,
         85.2, 88, 92, 82, 90, 3.8, 86, "A",
         6.4, 1, 1, 1, 38, 22, 0, "MONITOR",
         78.6, 68, 92, 298, 4.2, 31,
         81.8, "CS / RTC / II", "Emergency", 15, 100, "HIGH",
         61.3, 49.3, 50.1, 50.4, 43.1, 7,
         259.9, 60, 199.9, 0.625, "Ecological Recovery", 5),
        ("sella", 2025,
         52.1, 55, 50, 48, 45, 2.1, 52, "B",
         6.4, 1, 1, 1, 40, 24, 0, "MONITOR",
         56.9, 52, 75, 250, 3.1, 12,
         40.0, None, "Monitor", 0, 0, "MEDIUM",
         45.0, 40.0, 42.0, 44.0, 38.0, 3,
         180.0, 40, 140.0, 0.55, "Baseline", 4),
        ("kastritsi", 2025,
         52.1, 54, 51, 47, 44, 2.0, 50, "B",
         6.4, 1, 1, 1, 42, 25, 0, "MONITOR",
         56.9, 50, 73, 245, 3.0, 10,
         38.0, None, "Monitor", 0, 0, "MEDIUM",
         44.0, 39.0, 41.0, 43.0, 37.0, 3,
         175.0, 38, 137.0, 0.54, "Baseline", 4),
        ("wgreece", 2025,
         69.0, 65, 62, 60, 58, 2.8, 68, "B",
         10.0, 3, 2, 2, 45, 28, 1, "ALERT",
         62.0, 58, 80, 270, 3.5, 18,
         55.0, None, "Alert", 10, 50, "MEDIUM",
         52.0, 48.0, 49.0, 50.0, 42.0, 5,
         220.0, 55, 165.0, 0.58, "Stewardship Push", 4),
        ("chalandritsa", 2025,
         60.0, 62, 58, 55, 52, 2.4, 60, "B",
         5.0, 1, 1, 1, 35, 20, 2, "MONITOR",
         68.4, 60, 82, 280, 3.8, 15,
         45.0, None, "Monitor", 0, 0, "LOW",
         48.0, 44.0, 46.0, 47.0, 40.0, 4,
         190.0, 45, 145.0, 0.56, "Baseline", 3),
        ("messinia", 2025,
         60.0, 58, 56, 53, 50, 2.5, 58, "C",
         5.0, 1, 1, 2, 40, 26, 1, "MONITOR",
         76.2, 65, 85, 290, 4.0, 20,
         42.0, None, "Monitor", 0, 0, "LOW",
         50.0, 46.0, 47.0, 48.0, 41.0, 4,
         200.0, 50, 150.0, 0.57, "Baseline", 3),
        ("crete", 2025,
         60.0, 57, 54, 51, 48, 2.3, 56, "C",
         9.0, 2, 1, 2, 48, 30, 0, "ALERT",
         70.0, 62, 83, 275, 3.7, 17,
         50.0, None, "Alert", 5, 30, "MEDIUM",
         49.0, 45.0, 46.0, 47.0, 40.0, 4,
         210.0, 52, 158.0, 0.57, "Ecological Recovery", 4),
        ("andalusia", 2025,
         54.0, 50, 48, 46, 42, 2.0, 52, "C",
         12.0, 3, 2, 3, 55, 35, 0, "ALERT",
         85.3, 78, 88, 310, 5.2, 8,
         60.0, None, "Alert", 8, 25, "HIGH",
         46.0, 42.0, 44.0, 45.0, 38.0, 5,
         300.0, 80, 220.0, 0.62, "Stewardship Push", 5),
        ("tuscany", 2025,
         66.0, 64, 62, 60, 58, 2.9, 65, "B",
         8.0, 2, 1, 1, 32, 20, 2, "MONITOR",
         79.0, 70, 86, 300, 4.5, 22,
         35.0, None, "Monitor", 0, 0, "LOW",
         55.0, 50.0, 52.0, 53.0, 44.0, 4,
         180.0, 60, 120.0, 0.50, "Baseline", 3),
        ("alentejo", 2025,
         56.0, 52, 50, 48, 44, 2.1, 54, "C",
         11.0, 2, 2, 2, 50, 32, 1, "ALERT",
         88.1, 80, 90, 320, 5.5, 6,
         55.0, None, "Alert", 6, 20, "MEDIUM",
         47.0, 43.0, 44.0, 46.0, 39.0, 4,
         250.0, 65, 185.0, 0.60, "Stewardship Push", 4),
        # ── Historical data 2020-2024 (showing progression) ──
        # Elysian 2020-2024
        ("elysian", 2024, 82.0, 85, 89, 79, 87, 3.5, 83, "A", 7.0, 1, 1, 1, 40, 24, 1, "MONITOR", 75.0, 65, 89, 290, 3.9, 28, 78.0, "CS / RTC / II", "Monitor", 12, 85, "MEDIUM", 58.0, 46.0, 47.0, 48.0, 40.0, 6, 240.0, 55, 185.0, 0.62, "Ecological Recovery", 5),
        ("elysian", 2023, 78.5, 80, 85, 75, 82, 3.2, 79, "B", 7.5, 1, 2, 1, 42, 26, 2, "MONITOR", 72.0, 62, 86, 282, 3.6, 25, 72.0, None, "Monitor", 10, 70, "MEDIUM", 54.0, 43.0, 44.0, 45.0, 37.0, 5, 230.0, 50, 180.0, 0.65, "Stewardship Push", 4),
        ("elysian", 2022, 74.0, 76, 80, 70, 78, 2.9, 74, "B", 8.0, 2, 2, 1, 45, 28, 3, "ALERT", 68.0, 58, 82, 275, 3.3, 22, 65.0, None, "Alert", 8, 55, "MEDIUM", 50.0, 40.0, 41.0, 42.0, 35.0, 5, 220.0, 45, 175.0, 0.68, "Stewardship Push", 4),
        ("elysian", 2021, 70.0, 72, 76, 66, 74, 2.7, 70, "B", 8.5, 2, 2, 2, 48, 30, 4, "ALERT", 64.0, 55, 78, 268, 3.0, 18, 58.0, None, "Alert", 6, 40, "MEDIUM", 46.0, 37.0, 38.0, 39.0, 32.0, 4, 210.0, 40, 170.0, 0.70, "Stewardship Push", 4),
        ("elysian", 2020, 66.0, 68, 72, 62, 70, 2.5, 66, "C", 9.0, 2, 3, 2, 50, 32, 5, "ALERT", 60.0, 52, 74, 260, 2.8, 15, 52.0, None, "Alert", 5, 30, "HIGH", 42.0, 34.0, 35.0, 36.0, 30.0, 4, 200.0, 35, 165.0, 0.72, "Baseline", 3),
        # Sella 2020-2024
        ("sella", 2024, 50.0, 53, 48, 46, 43, 2.0, 50, "B", 6.8, 1, 1, 1, 42, 25, 1, "MONITOR", 54.0, 50, 73, 248, 3.0, 11, 38.0, None, "Monitor", 0, 0, "MEDIUM", 43.0, 38.0, 40.0, 42.0, 36.0, 3, 175.0, 38, 137.0, 0.56, "Baseline", 4),
        ("sella", 2023, 47.5, 50, 45, 43, 40, 1.9, 47, "C", 7.2, 1, 2, 1, 44, 27, 2, "MONITOR", 51.0, 47, 70, 244, 2.8, 9, 35.0, None, "Monitor", 0, 0, "MEDIUM", 40.0, 36.0, 37.0, 39.0, 34.0, 3, 168.0, 35, 133.0, 0.58, "Baseline", 3),
        ("sella", 2022, 45.0, 47, 42, 40, 37, 1.8, 44, "C", 7.5, 2, 2, 2, 46, 29, 3, "ALERT", 48.0, 44, 67, 240, 2.6, 7, 32.0, None, "Monitor", 0, 0, "MEDIUM", 37.0, 33.0, 34.0, 36.0, 31.0, 2, 160.0, 32, 128.0, 0.60, "Baseline", 3),
        ("sella", 2021, 42.0, 44, 39, 37, 34, 1.7, 41, "C", 8.0, 2, 2, 2, 48, 31, 4, "ALERT", 45.0, 41, 64, 236, 2.4, 5, 29.0, None, "Alert", 3, 10, "MEDIUM", 34.0, 30.0, 31.0, 33.0, 28.0, 2, 152.0, 30, 122.0, 0.62, "Baseline", 3),
        ("sella", 2020, 39.0, 41, 36, 34, 31, 1.6, 38, "C", 8.5, 3, 3, 2, 50, 33, 5, "ALERT", 42.0, 38, 61, 232, 2.2, 3, 26.0, None, "Alert", 2, 5, "HIGH", 31.0, 27.0, 28.0, 30.0, 25.0, 2, 145.0, 28, 117.0, 0.64, "Baseline", 3),
        # Kastritsi 2020-2024
        ("kastritsi", 2024, 50.0, 52, 49, 45, 42, 1.9, 48, "B", 6.8, 1, 1, 1, 44, 26, 1, "MONITOR", 54.0, 48, 71, 243, 2.9, 9, 36.0, None, "Monitor", 0, 0, "MEDIUM", 42.0, 37.0, 39.0, 41.0, 35.0, 3, 170.0, 36, 134.0, 0.55, "Baseline", 4),
        ("kastritsi", 2023, 47.0, 49, 46, 42, 39, 1.8, 45, "C", 7.2, 1, 2, 1, 46, 28, 2, "MONITOR", 50.0, 45, 68, 239, 2.7, 7, 33.0, None, "Monitor", 0, 0, "MEDIUM", 39.0, 34.0, 36.0, 38.0, 32.0, 2, 163.0, 34, 129.0, 0.57, "Baseline", 3),
        ("kastritsi", 2022, 44.0, 46, 43, 39, 36, 1.7, 42, "C", 7.6, 2, 2, 2, 48, 30, 3, "ALERT", 47.0, 42, 65, 235, 2.5, 5, 30.0, None, "Monitor", 0, 0, "MEDIUM", 36.0, 31.0, 33.0, 35.0, 29.0, 2, 155.0, 31, 124.0, 0.59, "Baseline", 3),
        ("kastritsi", 2021, 41.0, 43, 40, 36, 33, 1.6, 39, "C", 8.0, 2, 2, 2, 50, 32, 4, "ALERT", 44.0, 39, 62, 231, 2.3, 3, 27.0, None, "Alert", 2, 5, "MEDIUM", 33.0, 28.0, 30.0, 32.0, 26.0, 2, 148.0, 29, 119.0, 0.61, "Baseline", 3),
        ("kastritsi", 2020, 38.0, 40, 37, 33, 30, 1.5, 36, "C", 8.5, 3, 3, 2, 52, 34, 5, "ALERT", 41.0, 36, 59, 227, 2.1, 2, 24.0, None, "Alert", 2, 3, "HIGH", 30.0, 25.0, 27.0, 29.0, 23.0, 2, 140.0, 26, 114.0, 0.63, "Baseline", 3),
        # Western Greece 2020-2024
        ("wgreece", 2024, 66.0, 62, 59, 57, 55, 2.6, 65, "B", 10.5, 3, 2, 2, 47, 29, 0, "ALERT", 59.0, 55, 77, 265, 3.3, 16, 52.0, None, "Alert", 8, 45, "MEDIUM", 50.0, 46.0, 47.0, 48.0, 40.0, 5, 215.0, 52, 163.0, 0.59, "Stewardship Push", 4),
        ("wgreece", 2023, 62.0, 58, 55, 53, 51, 2.4, 61, "B", 11.0, 4, 3, 2, 49, 31, 1, "ALERT", 55.0, 51, 74, 260, 3.1, 14, 48.0, None, "Alert", 7, 35, "MEDIUM", 47.0, 43.0, 44.0, 45.0, 37.0, 4, 208.0, 48, 160.0, 0.61, "Stewardship Push", 4),
        ("wgreece", 2022, 58.0, 54, 51, 49, 47, 2.2, 57, "C", 11.5, 4, 3, 3, 51, 33, 2, "ALERT", 51.0, 47, 71, 255, 2.9, 12, 44.0, None, "Alert", 6, 25, "HIGH", 44.0, 40.0, 41.0, 42.0, 34.0, 4, 200.0, 44, 156.0, 0.63, "Baseline", 4),
        ("wgreece", 2021, 54.0, 50, 47, 45, 43, 2.0, 53, "C", 12.0, 5, 4, 3, 53, 35, 3, "ALERT", 47.0, 43, 68, 250, 2.7, 10, 40.0, None, "Alert", 5, 15, "HIGH", 41.0, 37.0, 38.0, 39.0, 31.0, 3, 192.0, 40, 152.0, 0.65, "Baseline", 3),
        ("wgreece", 2020, 50.0, 46, 43, 41, 39, 1.8, 49, "C", 12.5, 5, 4, 3, 55, 37, 4, "ALERT", 43.0, 39, 65, 245, 2.5, 8, 36.0, None, "Alert", 4, 10, "HIGH", 38.0, 34.0, 35.0, 36.0, 28.0, 3, 185.0, 36, 149.0, 0.67, "Baseline", 3),
        # Chalandritsa 2020-2024
        ("chalandritsa", 2024, 57.5, 60, 56, 53, 50, 2.3, 58, "B", 5.5, 1, 1, 1, 37, 21, 1, "MONITOR", 65.0, 57, 80, 276, 3.6, 14, 43.0, None, "Monitor", 0, 0, "LOW", 46.0, 42.0, 44.0, 45.0, 38.0, 4, 185.0, 43, 142.0, 0.57, "Baseline", 3),
        ("chalandritsa", 2023, 55.0, 57, 53, 50, 47, 2.1, 55, "B", 6.0, 1, 1, 1, 39, 23, 2, "MONITOR", 62.0, 54, 77, 272, 3.4, 12, 40.0, None, "Monitor", 0, 0, "LOW", 43.0, 39.0, 41.0, 42.0, 35.0, 3, 180.0, 40, 140.0, 0.59, "Baseline", 3),
        ("chalandritsa", 2022, 52.0, 54, 50, 47, 44, 1.9, 52, "C", 6.5, 2, 1, 1, 41, 25, 3, "MONITOR", 58.0, 51, 74, 268, 3.2, 10, 37.0, None, "Monitor", 0, 0, "LOW", 40.0, 36.0, 38.0, 39.0, 32.0, 3, 174.0, 37, 137.0, 0.61, "Baseline", 3),
        ("chalandritsa", 2021, 49.0, 51, 47, 44, 41, 1.8, 49, "C", 7.0, 2, 2, 2, 43, 27, 4, "ALERT", 54.0, 48, 71, 264, 3.0, 8, 34.0, None, "Monitor", 0, 0, "LOW", 37.0, 33.0, 35.0, 36.0, 29.0, 3, 167.0, 34, 133.0, 0.63, "Baseline", 3),
        ("chalandritsa", 2020, 46.0, 48, 44, 41, 38, 1.7, 46, "C", 7.5, 2, 2, 2, 45, 29, 5, "ALERT", 50.0, 45, 68, 260, 2.8, 6, 31.0, None, "Alert", 2, 5, "MEDIUM", 34.0, 30.0, 32.0, 33.0, 26.0, 2, 160.0, 31, 129.0, 0.65, "Baseline", 3),
        # Messinia 2020-2024
        ("messinia", 2024, 57.5, 56, 54, 51, 48, 2.3, 56, "C", 5.5, 1, 1, 2, 42, 27, 0, "MONITOR", 73.0, 62, 83, 286, 3.8, 18, 40.0, None, "Monitor", 0, 0, "LOW", 48.0, 44.0, 45.0, 46.0, 39.0, 4, 195.0, 48, 147.0, 0.58, "Baseline", 3),
        ("messinia", 2023, 55.0, 53, 51, 48, 45, 2.1, 53, "C", 6.0, 2, 1, 2, 44, 29, 1, "MONITOR", 70.0, 59, 80, 282, 3.6, 16, 37.0, None, "Monitor", 0, 0, "LOW", 45.0, 41.0, 42.0, 43.0, 36.0, 3, 188.0, 45, 143.0, 0.60, "Baseline", 3),
        ("messinia", 2022, 52.0, 50, 48, 45, 42, 1.9, 50, "C", 6.5, 2, 2, 2, 46, 31, 2, "ALERT", 66.0, 56, 77, 278, 3.4, 14, 34.0, None, "Monitor", 0, 0, "LOW", 42.0, 38.0, 39.0, 40.0, 33.0, 3, 180.0, 42, 138.0, 0.62, "Baseline", 3),
        ("messinia", 2021, 49.0, 47, 45, 42, 39, 1.7, 47, "C", 7.0, 2, 2, 3, 48, 33, 3, "ALERT", 62.0, 53, 74, 274, 3.2, 12, 31.0, None, "Alert", 2, 5, "MEDIUM", 39.0, 35.0, 36.0, 37.0, 30.0, 3, 172.0, 39, 133.0, 0.64, "Baseline", 3),
        ("messinia", 2020, 46.0, 44, 42, 39, 36, 1.5, 44, "C", 7.5, 3, 2, 3, 50, 35, 4, "ALERT", 58.0, 50, 71, 270, 3.0, 10, 28.0, None, "Alert", 2, 3, "HIGH", 36.0, 32.0, 33.0, 34.0, 27.0, 2, 165.0, 36, 129.0, 0.66, "Baseline", 3),
        # Crete 2020-2024
        ("crete", 2024, 57.5, 55, 52, 49, 46, 2.1, 54, "C", 9.5, 2, 1, 2, 50, 31, 1, "ALERT", 67.0, 60, 81, 272, 3.5, 15, 47.0, None, "Alert", 4, 25, "MEDIUM", 47.0, 43.0, 44.0, 45.0, 38.0, 4, 205.0, 50, 155.0, 0.58, "Ecological Recovery", 4),
        ("crete", 2023, 54.0, 52, 49, 46, 43, 1.9, 51, "C", 10.0, 3, 2, 2, 52, 33, 2, "ALERT", 63.0, 57, 78, 268, 3.3, 13, 43.0, None, "Alert", 3, 18, "MEDIUM", 44.0, 40.0, 41.0, 42.0, 35.0, 3, 198.0, 47, 151.0, 0.60, "Stewardship Push", 4),
        ("crete", 2022, 50.0, 49, 46, 43, 40, 1.7, 48, "C", 10.5, 3, 2, 3, 54, 35, 3, "ALERT", 59.0, 54, 75, 264, 3.1, 11, 39.0, None, "Alert", 3, 12, "MEDIUM", 41.0, 37.0, 38.0, 39.0, 32.0, 3, 190.0, 44, 146.0, 0.62, "Baseline", 3),
        ("crete", 2021, 47.0, 46, 43, 40, 37, 1.5, 45, "C", 11.0, 4, 3, 3, 56, 37, 4, "ALERT", 55.0, 51, 72, 260, 2.9, 9, 35.0, None, "Alert", 2, 8, "HIGH", 38.0, 34.0, 35.0, 36.0, 29.0, 3, 183.0, 41, 142.0, 0.64, "Baseline", 3),
        ("crete", 2020, 44.0, 43, 40, 37, 34, 1.3, 42, "C", 11.5, 4, 3, 3, 58, 39, 5, "ALERT", 51.0, 48, 69, 256, 2.7, 7, 31.0, None, "Alert", 2, 5, "HIGH", 35.0, 31.0, 32.0, 33.0, 26.0, 2, 175.0, 38, 137.0, 0.66, "Baseline", 3),
        # Andalusia 2020-2024
        ("andalusia", 2024, 52.0, 48, 46, 44, 40, 1.9, 50, "C", 12.5, 3, 2, 3, 57, 36, 1, "ALERT", 82.0, 75, 86, 305, 5.0, 7, 57.0, None, "Alert", 7, 22, "HIGH", 44.0, 40.0, 42.0, 43.0, 36.0, 5, 290.0, 75, 215.0, 0.63, "Stewardship Push", 5),
        ("andalusia", 2023, 49.0, 45, 43, 41, 37, 1.7, 47, "C", 13.0, 4, 3, 3, 59, 38, 2, "ALERT", 78.0, 72, 83, 300, 4.8, 6, 53.0, None, "Alert", 6, 18, "HIGH", 41.0, 37.0, 39.0, 40.0, 33.0, 4, 280.0, 70, 210.0, 0.65, "Baseline", 5),
        ("andalusia", 2022, 46.0, 42, 40, 38, 34, 1.5, 44, "C", 13.5, 4, 3, 4, 61, 40, 3, "ALERT", 74.0, 69, 80, 295, 4.6, 5, 49.0, None, "Alert", 5, 14, "HIGH", 38.0, 34.0, 36.0, 37.0, 30.0, 4, 270.0, 65, 205.0, 0.67, "Baseline", 4),
        ("andalusia", 2021, 43.0, 39, 37, 35, 31, 1.3, 41, "C", 14.0, 5, 4, 4, 63, 42, 4, "ALERT", 70.0, 66, 77, 290, 4.4, 4, 45.0, None, "Alert", 4, 10, "HIGH", 35.0, 31.0, 33.0, 34.0, 27.0, 3, 260.0, 60, 200.0, 0.69, "Baseline", 4),
        ("andalusia", 2020, 40.0, 36, 34, 32, 28, 1.1, 38, "C", 14.5, 5, 4, 4, 65, 44, 5, "ALERT", 66.0, 63, 74, 285, 4.2, 3, 41.0, None, "Alert", 3, 6, "HIGH", 32.0, 28.0, 30.0, 31.0, 24.0, 3, 250.0, 55, 195.0, 0.71, "Baseline", 4),
        # Tuscany 2020-2024
        ("tuscany", 2024, 64.0, 62, 60, 58, 56, 2.7, 63, "B", 8.5, 2, 1, 1, 34, 21, 1, "MONITOR", 76.0, 68, 84, 296, 4.3, 20, 33.0, None, "Monitor", 0, 0, "LOW", 53.0, 48.0, 50.0, 51.0, 42.0, 4, 175.0, 58, 117.0, 0.51, "Baseline", 3),
        ("tuscany", 2023, 61.0, 59, 57, 55, 53, 2.5, 60, "B", 9.0, 2, 2, 1, 36, 23, 2, "MONITOR", 72.0, 65, 81, 292, 4.1, 18, 30.0, None, "Monitor", 0, 0, "LOW", 50.0, 45.0, 47.0, 48.0, 39.0, 3, 168.0, 55, 113.0, 0.53, "Baseline", 3),
        ("tuscany", 2022, 58.0, 56, 54, 52, 50, 2.3, 57, "C", 9.5, 3, 2, 2, 38, 25, 3, "MONITOR", 68.0, 62, 78, 288, 3.9, 16, 27.0, None, "Monitor", 0, 0, "LOW", 47.0, 42.0, 44.0, 45.0, 36.0, 3, 160.0, 52, 108.0, 0.55, "Baseline", 3),
        ("tuscany", 2021, 55.0, 53, 51, 49, 47, 2.1, 54, "C", 10.0, 3, 2, 2, 40, 27, 4, "ALERT", 64.0, 59, 75, 284, 3.7, 14, 24.0, None, "Monitor", 0, 0, "LOW", 44.0, 39.0, 41.0, 42.0, 33.0, 3, 153.0, 49, 104.0, 0.57, "Baseline", 3),
        ("tuscany", 2020, 52.0, 50, 48, 46, 44, 1.9, 51, "C", 10.5, 3, 3, 2, 42, 29, 5, "ALERT", 60.0, 56, 72, 280, 3.5, 12, 21.0, None, "Alert", 2, 5, "MEDIUM", 41.0, 36.0, 38.0, 39.0, 30.0, 2, 145.0, 46, 99.0, 0.59, "Baseline", 3),
        # Alentejo 2020-2024
        ("alentejo", 2024, 54.0, 50, 48, 46, 42, 2.0, 52, "C", 11.5, 2, 2, 2, 52, 33, 0, "ALERT", 85.0, 77, 88, 316, 5.3, 5, 52.0, None, "Alert", 5, 17, "MEDIUM", 45.0, 41.0, 42.0, 44.0, 37.0, 4, 245.0, 62, 183.0, 0.61, "Stewardship Push", 4),
        ("alentejo", 2023, 51.0, 47, 45, 43, 39, 1.8, 49, "C", 12.0, 3, 2, 3, 54, 35, 1, "ALERT", 81.0, 74, 85, 312, 5.1, 4, 48.0, None, "Alert", 4, 13, "MEDIUM", 42.0, 38.0, 39.0, 41.0, 34.0, 3, 238.0, 59, 179.0, 0.63, "Baseline", 4),
        ("alentejo", 2022, 48.0, 44, 42, 40, 36, 1.6, 46, "C", 12.5, 3, 3, 3, 56, 37, 2, "ALERT", 77.0, 71, 82, 308, 4.9, 3, 44.0, None, "Alert", 3, 9, "MEDIUM", 39.0, 35.0, 36.0, 38.0, 31.0, 3, 230.0, 56, 174.0, 0.65, "Baseline", 4),
        ("alentejo", 2021, 45.0, 41, 39, 37, 33, 1.4, 43, "C", 13.0, 4, 3, 3, 58, 39, 3, "ALERT", 73.0, 68, 79, 304, 4.7, 2, 40.0, None, "Alert", 3, 6, "HIGH", 36.0, 32.0, 33.0, 35.0, 28.0, 3, 222.0, 53, 169.0, 0.67, "Baseline", 3),
        ("alentejo", 2020, 42.0, 38, 36, 34, 30, 1.2, 40, "C", 13.5, 4, 4, 4, 60, 41, 4, "ALERT", 69.0, 65, 76, 300, 4.5, 1, 36.0, None, "Alert", 2, 3, "HIGH", 33.0, 29.0, 30.0, 32.0, 25.0, 2, 215.0, 50, 165.0, 0.69, "Baseline", 3),
    ]
    for es in engine_scores:
        c.execute("""
            INSERT OR REPLACE INTO engine_scores (
                territory_id, year,
                rti_score, rti_stewardship_capacity, rti_ecological_literacy,
                rti_wildlife_balance, rti_pollinator_index, rti_soil_organic_matter,
                rti_habitat_connectivity, rti_confidence,
                tars_score, tars_wildfire_events, tars_flood_events, tars_pest_disease,
                tars_drought_days, tars_heatwave_days, tars_years_since_event, tars_status,
                opci_score, opci_productive_trees_pct, opci_tree_vitality,
                opci_avg_trunk_perimeter, opci_yield_per_tree, opci_regenerative_inputs,
                bsep_score, bsep_category, bsep_escalation, bsep_recovery_target_years,
                bsep_current_recovery_pct, bsep_human_capital_risk,
                caii_score, caii_community_governance, caii_human_capital,
                caii_social_collaboration, caii_territorial_intelligence, caii_triggered_missions,
                budget_scientific_need, budget_current, budget_gap,
                budget_discounting_ratio, budget_scenario, budget_urgency
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, es)

    # ── Production Data (Elysian EVOO) ──
    production = [
        ("farm-elysian", 2025, 6500, 1632, 23.0, 80.9, 0.18, 238, 12800),
        ("farm-elysian", 2024, 5800, 1392, 24.0, 82.1, 0.20, 232, 11500),
        ("farm-elysian", 2023, 6200, 1488, 24.0, 79.5, 0.22, 225, 11200),
        ("farm-elysian", 2022, 5500, 1265, 23.0, 78.0, 0.25, 218, 10800),
        ("farm-elysian", 2021, 5000, 1150, 23.0, 76.5, 0.28, 210, 10200),
        ("farm-elysian", 2020, 4800, 1104, 23.0, 75.0, 0.30, 205, 9800),
    ]
    # Also add 2025 production for all other farms
    production += [
        ("farm-sella", 2025, 3200, 736, 23.0, 76.0, 0.25, 142, 7200),
        ("farm-kastritsi", 2025, 4100, 943, 23.0, 77.5, 0.22, 168, 8900),
        ("farm-wgreece", 2025, 9500, 2185, 23.0, 74.0, 0.30, 410, 21000),
        ("farm-chalandritsa", 2025, 4800, 1104, 23.0, 75.0, 0.28, 195, 10500),
        ("farm-messinia", 2025, 7200, 1656, 23.0, 82.5, 0.16, 290, 15800),
        ("farm-crete", 2025, 6800, 1564, 23.0, 81.0, 0.18, 275, 14500),
        ("farm-andalusia", 2025, 12000, 2760, 23.0, 72.0, 0.35, 520, 28000),
        ("farm-tuscany", 2025, 5200, 1196, 23.0, 84.0, 0.14, 215, 11800),
        ("farm-alentejo", 2025, 8800, 2024, 23.0, 73.5, 0.32, 360, 19200),
    ]
    c.executemany(
        "INSERT OR REPLACE INTO production_data (farm_id, year, olive_harvest_kg, oil_extracted_l, extraction_rate_pct, evoo_quality_score, acidity_pct, carbon_stored_tco2, total_expenses_eur) VALUES (?,?,?,?,?,?,?,?,?)",
        production,
    )

    # ── Command Center (Elysian 2025) ──
    commands = [
        ("elysian", "Where are we?", "59.19 — RTI Composite", "Transitional", "Open Command →", 2025),
        ("elysian", "What is deteriorating?", "Control Center bottleneck", "Insufficient Data", "Review Actions →", 2025),
        ("elysian", "What is improving?", "Fire buffer & early warning", "PASS", "Open Investment →", 2025),
        ("elysian", "What should we do next?", "Review Control Center bottleneck", "Insufficient Data", "Prioritize →", 2025),
        ("elysian", "What must be escalated now?", "BSEP Score: 81.8", "Emergency Escalation", "Escalate →", 2025),
    ]
    c.executemany(
        "INSERT OR REPLACE INTO command_center (territory_id, question, live_signal, status, action_label, year) VALUES (?,?,?,?,?,?)",
        commands,
    )

    # ── Priority Board (Elysian 2025) ──
    prios = [
        ("elysian", 1, "critical", "Budget", "Severe discounting — €199.9M gap", 100, 2025),
        ("elysian", 2, "critical", "Command", "Review Control Center bottleneck", 100, 2025),
        ("elysian", 3, "high", "Investment", "Fire buffer and early warning network", 80, 2025),
        ("elysian", 4, "high", "Scientific Audit", "Strengthen external validation", 80, 2025),
        ("elysian", 5, "medium", "Control", "Stabilize lever propagation", 60, 2025),
        ("elysian", 6, "medium", "Futures", "Compare temporal burden — Forward Heavy", 60, 2025),
    ]
    c.executemany(
        "INSERT OR REPLACE INTO priorities (territory_id, rank, severity, domain, signal, score, year) VALUES (?,?,?,?,?,?,?)",
        prios,
    )

    # ── Workings Calendar (Elysian, June 2025) ──
    june_tasks = [
        ("farm-elysian", "2025-06-01", "irrigation", "Irrigation check"),
        ("farm-elysian", "2025-06-02", "pruning", "Summer pruning"),
        ("farm-elysian", "2025-06-03", "pruning", "Summer pruning"),
        ("farm-elysian", "2025-06-04", "monitoring", "Pest monitoring"),
        ("farm-elysian", "2025-06-05", "soil", "Soil moisture check"),
        ("farm-elysian", "2025-06-08", "irrigation", "Irrigation cycle"),
        ("farm-elysian", "2025-06-09", "monitoring", "Olive fly trap check"),
        ("farm-elysian", "2025-06-10", "soil", "Weed management"),
        ("farm-elysian", "2025-06-11", "soil", "Weed management"),
        ("farm-elysian", "2025-06-12", "monitoring", "Canopy inspection"),
        ("farm-elysian", "2025-06-15", "irrigation", "Irrigation cycle"),
        ("farm-elysian", "2025-06-16", "fire", "Fire risk patrol"),
        ("farm-elysian", "2025-06-17", "monitoring", "Growth monitoring"),
        ("farm-elysian", "2025-06-18", "soil", "Cover crop mgmt"),
        ("farm-elysian", "2025-06-19", "monitoring", "Pest monitoring"),
        ("farm-elysian", "2025-06-22", "irrigation", "Irrigation cycle"),
        ("farm-elysian", "2025-06-23", "monitoring", "Fruit set check"),
        ("farm-elysian", "2025-06-24", "fire", "Fire buffer maint."),
        ("farm-elysian", "2025-06-25", "soil", "Compost application"),
        ("farm-elysian", "2025-06-26", "monitoring", "Biodiversity obs."),
        ("farm-elysian", "2025-06-29", "irrigation", "Irrigation cycle"),
        ("farm-elysian", "2025-06-30", "monitoring", "Monthly report"),
    ]
    c.executemany(
        "INSERT OR REPLACE INTO workings (farm_id, date, task_type, task_description) VALUES (?,?,?,?)",
        june_tasks,
    )

    # ── Workings Calendar (Other farms, June 2025) ──
    other_farm_tasks = [
        # Sella Grove
        ("farm-sella", "2025-06-02", "irrigation", "Drip system check"),
        ("farm-sella", "2025-06-05", "pruning", "Light pruning"),
        ("farm-sella", "2025-06-09", "monitoring", "Pest check"),
        ("farm-sella", "2025-06-12", "soil", "Fertilizer application"),
        ("farm-sella", "2025-06-16", "irrigation", "Irrigation cycle"),
        ("farm-sella", "2025-06-19", "monitoring", "Canopy health check"),
        ("farm-sella", "2025-06-23", "irrigation", "Irrigation cycle"),
        ("farm-sella", "2025-06-26", "fire", "Firebreak clearing"),
        ("farm-sella", "2025-06-30", "monitoring", "Monthly review"),
        # Kastritsi Estate
        ("farm-kastritsi", "2025-06-01", "monitoring", "Drone survey"),
        ("farm-kastritsi", "2025-06-04", "soil", "Soil analysis"),
        ("farm-kastritsi", "2025-06-08", "irrigation", "System maintenance"),
        ("farm-kastritsi", "2025-06-11", "pruning", "Crown thinning"),
        ("farm-kastritsi", "2025-06-15", "monitoring", "Pest trapping"),
        ("farm-kastritsi", "2025-06-18", "soil", "Mulching"),
        ("farm-kastritsi", "2025-06-22", "irrigation", "Irrigation cycle"),
        ("farm-kastritsi", "2025-06-25", "fire", "Fire risk assessment"),
        ("farm-kastritsi", "2025-06-29", "monitoring", "Growth measurement"),
        # Western Greece Coop
        ("farm-wgreece", "2025-06-02", "monitoring", "Regional pest survey"),
        ("farm-wgreece", "2025-06-05", "irrigation", "Canal maintenance"),
        ("farm-wgreece", "2025-06-09", "soil", "Soil sampling"),
        ("farm-wgreece", "2025-06-12", "monitoring", "Weather station check"),
        ("farm-wgreece", "2025-06-16", "irrigation", "Irrigation scheduling"),
        ("farm-wgreece", "2025-06-19", "pruning", "Cooperative pruning day"),
        ("farm-wgreece", "2025-06-23", "fire", "Fire drill"),
        ("farm-wgreece", "2025-06-26", "monitoring", "Yield estimation"),
        ("farm-wgreece", "2025-06-30", "monitoring", "Coop monthly meeting"),
        # Chalandritsa Farm
        ("farm-chalandritsa", "2025-06-03", "irrigation", "Reservoir check"),
        ("farm-chalandritsa", "2025-06-06", "soil", "Compost turning"),
        ("farm-chalandritsa", "2025-06-10", "monitoring", "Olive moth traps"),
        ("farm-chalandritsa", "2025-06-13", "pruning", "Suckers removal"),
        ("farm-chalandritsa", "2025-06-17", "irrigation", "Drip check"),
        ("farm-chalandritsa", "2025-06-20", "fire", "Grass clearing"),
        ("farm-chalandritsa", "2025-06-24", "monitoring", "Fruit development"),
        ("farm-chalandritsa", "2025-06-27", "soil", "Green manure"),
        # Messinia Groves
        ("farm-messinia", "2025-06-01", "irrigation", "Pump station check"),
        ("farm-messinia", "2025-06-04", "monitoring", "Kalamata variety check"),
        ("farm-messinia", "2025-06-08", "soil", "Organic matter test"),
        ("farm-messinia", "2025-06-11", "pruning", "Thinning cuts"),
        ("farm-messinia", "2025-06-15", "irrigation", "Irrigation cycle"),
        ("farm-messinia", "2025-06-18", "fire", "Perimeter clearing"),
        ("farm-messinia", "2025-06-22", "monitoring", "Pest assessment"),
        ("farm-messinia", "2025-06-25", "soil", "Biochar application"),
        ("farm-messinia", "2025-06-29", "monitoring", "End-month survey"),
        # Cretan Heritage
        ("farm-crete", "2025-06-02", "irrigation", "Ancient grove watering"),
        ("farm-crete", "2025-06-05", "monitoring", "Heritage tree check"),
        ("farm-crete", "2025-06-09", "soil", "Terracing maintenance"),
        ("farm-crete", "2025-06-12", "pruning", "Traditional pruning"),
        ("farm-crete", "2025-06-16", "fire", "Stone wall firebreak"),
        ("farm-crete", "2025-06-19", "irrigation", "Channel clearing"),
        ("farm-crete", "2025-06-23", "monitoring", "Tourism impact audit"),
        ("farm-crete", "2025-06-26", "soil", "Erosion monitoring"),
        ("farm-crete", "2025-06-30", "monitoring", "Monthly biodiversity"),
        # Andalusia Estate
        ("farm-andalusia", "2025-06-01", "irrigation", "Pivot system check"),
        ("farm-andalusia", "2025-06-04", "monitoring", "Drone thermal scan"),
        ("farm-andalusia", "2025-06-08", "soil", "pH testing"),
        ("farm-andalusia", "2025-06-11", "pruning", "Machine pruning"),
        ("farm-andalusia", "2025-06-15", "fire", "Controlled burn prep"),
        ("farm-andalusia", "2025-06-18", "irrigation", "Deficit irrigation"),
        ("farm-andalusia", "2025-06-22", "monitoring", "Verticillium check"),
        ("farm-andalusia", "2025-06-25", "soil", "Cover crop seeding"),
        ("farm-andalusia", "2025-06-29", "monitoring", "Harvest planning"),
        # Tuscan Hills
        ("farm-tuscany", "2025-06-02", "monitoring", "DOP compliance check"),
        ("farm-tuscany", "2025-06-05", "irrigation", "Rain harvesting"),
        ("farm-tuscany", "2025-06-09", "soil", "Terrace repair"),
        ("farm-tuscany", "2025-06-12", "pruning", "Artistic pruning"),
        ("farm-tuscany", "2025-06-16", "monitoring", "Peacock spot check"),
        ("farm-tuscany", "2025-06-19", "fire", "Grass management"),
        ("farm-tuscany", "2025-06-23", "irrigation", "Irrigation review"),
        ("farm-tuscany", "2025-06-26", "soil", "Biodynamic prep"),
        ("farm-tuscany", "2025-06-30", "monitoring", "Quality assessment"),
        # Alentejo Grove
        ("farm-alentejo", "2025-06-01", "irrigation", "Dam level check"),
        ("farm-alentejo", "2025-06-04", "monitoring", "Superintensive check"),
        ("farm-alentejo", "2025-06-08", "soil", "Gypsum application"),
        ("farm-alentejo", "2025-06-11", "pruning", "Hedgerow trim"),
        ("farm-alentejo", "2025-06-15", "fire", "Heat wave protocol"),
        ("farm-alentejo", "2025-06-18", "irrigation", "Efficiency audit"),
        ("farm-alentejo", "2025-06-22", "monitoring", "Xylella screening"),
        ("farm-alentejo", "2025-06-25", "soil", "Mycorrhiza inoculation"),
        ("farm-alentejo", "2025-06-29", "monitoring", "Harvest forecast"),
    ]
    c.executemany(
        "INSERT OR REPLACE INTO workings (farm_id, date, task_type, task_description) VALUES (?,?,?,?)",
        other_farm_tasks,
    )

    # ── Users (demo accounts) ──
    import hashlib
    def hash_pw(pw):
        return hashlib.sha256(pw.encode()).hexdigest()

    users = [
        ("admin", hash_pw("admin123"), "authority", None, "System Administrator"),
        ("authority", hash_pw("authority123"), "authority", "elysian", "Authority Officer"),
        ("farmer", hash_pw("farmer123"), "farmer", "elysian", "Alexandros Liakopoulos"),
        ("investor", hash_pw("investor123"), "investor", None, "Investor Demo"),
    ]
    c.executemany(
        "INSERT OR REPLACE INTO users (username, password_hash, role, territory_id, display_name) VALUES (?,?,?,?,?)",
        users,
    )

    conn.commit()
    conn.close()
    print("Database seeded successfully.")


if __name__ == "__main__":
    seed()
