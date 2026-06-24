"""ROA-TIS SQLite database schema and initialization."""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "roatis.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()

    # --- Territories (ROA regions) ---
    c.execute("""
        CREATE TABLE IF NOT EXISTS territories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            region TEXT,
            country TEXT DEFAULT 'Greece',
            latitude REAL,
            longitude REAL,
            area_ha REAL,
            population INTEGER,
            description TEXT
        )
    """)

    # --- Farms ---
    c.execute("""
        CREATE TABLE IF NOT EXISTS farms (
            id TEXT PRIMARY KEY,
            territory_id TEXT NOT NULL REFERENCES territories(id),
            name TEXT NOT NULL,
            location TEXT,
            latitude REAL,
            longitude REAL,
            area_ha REAL,
            tree_count INTEGER,
            organic_certified INTEGER DEFAULT 0,
            steward_name TEXT,
            steward_age INTEGER,
            succession_status TEXT DEFAULT 'Unknown'
        )
    """)

    # --- Historical trajectory data (60-year time series) ---
    c.execute("""
        CREATE TABLE IF NOT EXISTS trajectory_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            territory_id TEXT NOT NULL REFERENCES territories(id),
            year INTEGER NOT NULL,
            stewardship_capacity REAL,
            ecological_equilibrium REAL,
            wildlife_balance REAL,
            soil_organic_matter REAL,
            population_index REAL,
            UNIQUE(territory_id, year)
        )
    """)

    # --- Engine scores (computed KPIs per ROA) ---
    c.execute("""
        CREATE TABLE IF NOT EXISTS engine_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            territory_id TEXT NOT NULL REFERENCES territories(id),
            year INTEGER NOT NULL,
            -- RTI
            rti_score REAL,
            rti_stewardship_capacity REAL,
            rti_ecological_literacy REAL,
            rti_wildlife_balance REAL,
            rti_pollinator_index REAL,
            rti_soil_organic_matter REAL,
            rti_habitat_connectivity REAL,
            rti_confidence TEXT DEFAULT 'A',
            -- TARS
            tars_score REAL,
            tars_wildfire_events INTEGER,
            tars_flood_events INTEGER,
            tars_pest_disease INTEGER,
            tars_drought_days INTEGER,
            tars_heatwave_days INTEGER,
            tars_years_since_event INTEGER,
            tars_status TEXT DEFAULT 'MONITOR',
            -- REG / OPCI
            opci_score REAL,
            opci_productive_trees_pct REAL,
            opci_tree_vitality REAL,
            opci_avg_trunk_perimeter REAL,
            opci_yield_per_tree REAL,
            opci_regenerative_inputs INTEGER,
            -- Black Swan
            bsep_score REAL,
            bsep_category TEXT,
            bsep_escalation TEXT,
            bsep_recovery_target_years INTEGER,
            bsep_current_recovery_pct REAL,
            bsep_human_capital_risk TEXT,
            -- CAII
            caii_score REAL,
            caii_community_governance REAL,
            caii_human_capital REAL,
            caii_social_collaboration REAL,
            caii_territorial_intelligence REAL,
            caii_triggered_missions INTEGER,
            -- Budget
            budget_scientific_need REAL,
            budget_current REAL,
            budget_gap REAL,
            budget_discounting_ratio REAL,
            budget_scenario TEXT,
            budget_urgency INTEGER,
            UNIQUE(territory_id, year)
        )
    """)

    # --- Farm production data ---
    c.execute("""
        CREATE TABLE IF NOT EXISTS production_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farm_id TEXT NOT NULL REFERENCES farms(id),
            year INTEGER NOT NULL,
            olive_harvest_kg REAL,
            oil_extracted_l REAL,
            extraction_rate_pct REAL,
            evoo_quality_score REAL,
            acidity_pct REAL,
            carbon_stored_tco2 REAL,
            total_expenses_eur REAL,
            UNIQUE(farm_id, year)
        )
    """)

    # --- Observations (farmer field entries) ---
    c.execute("""
        CREATE TABLE IF NOT EXISTS observations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farm_id TEXT NOT NULL REFERENCES farms(id),
            date TEXT NOT NULL,
            observation_type TEXT,
            description TEXT,
            buffer_zone_clear INTEGER,
            access_paths_passable INTEGER,
            no_ignition_risk INTEGER,
            confidence_score REAL,
            created_at TEXT DEFAULT (datetime('now'))
        )
    """)

    # --- Daily workings calendar ---
    c.execute("""
        CREATE TABLE IF NOT EXISTS workings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            farm_id TEXT NOT NULL REFERENCES farms(id),
            date TEXT NOT NULL,
            task_type TEXT,
            task_description TEXT,
            completed INTEGER DEFAULT 0,
            UNIQUE(farm_id, date)
        )
    """)

    # --- Priority board items ---
    c.execute("""
        CREATE TABLE IF NOT EXISTS priorities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            territory_id TEXT NOT NULL REFERENCES territories(id),
            rank INTEGER NOT NULL,
            severity TEXT NOT NULL,
            domain TEXT NOT NULL,
            signal TEXT NOT NULL,
            score INTEGER,
            year INTEGER
        )
    """)

    # --- Command center questions ---
    c.execute("""
        CREATE TABLE IF NOT EXISTS command_center (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            territory_id TEXT NOT NULL REFERENCES territories(id),
            question TEXT NOT NULL,
            live_signal TEXT,
            status TEXT,
            action_label TEXT,
            year INTEGER
        )
    """)

    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_db()
    print(f"Database initialized at {DB_PATH}")
