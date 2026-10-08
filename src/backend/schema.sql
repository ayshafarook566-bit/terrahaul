-- =========================================================================
-- TERRAHAUL DATABASE SCHEMA (SQLite / PostgreSQL Compatible)
-- Smart Dump Truck Fleet & Haulage Operations Telematics Engine
-- =========================================================================

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK(role IN (
    'Fleet Operations Manager',
    'Pit Dispatch Controller',
    'Haul Truck Operator',
    'Mine Safety Officer',
    'Equipment Superintendent'
  )),
  site_id TEXT NOT NULL DEFAULT 'Apex Pit Alpha',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Dumper Trucks Fleet Master
CREATE TABLE IF NOT EXISTS dumper_trucks (
  id TEXT PRIMARY KEY, -- e.g., 'DT-101'
  model TEXT NOT NULL, -- e.g., 'Caterpillar 797F', 'Komatsu 930E-5'
  operator_name TEXT NOT NULL,
  nominal_capacity_tons REAL NOT NULL,
  current_payload_tons REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK(status IN (
    'Hauling', 'Loading', 'Dumping', 'Queued', 'Empty Return', 'Maintenance', 'Standby'
  )),
  current_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  fuel_level_pct REAL NOT NULL DEFAULT 100,
  fuel_burn_lph REAL NOT NULL DEFAULT 160,
  speed_kmh REAL NOT NULL DEFAULT 0,
  road_grade_incline_pct REAL NOT NULL DEFAULT 0,
  hydraulic_bed_angle_deg REAL NOT NULL DEFAULT 0,
  brake_temp_celsius REAL NOT NULL DEFAULT 80,
  engine_hours REAL NOT NULL DEFAULT 0,
  front_axle_load_pct REAL NOT NULL DEFAULT 35,
  rear_axle_load_pct REAL NOT NULL DEFAULT 65,
  overload_warning BOOLEAN NOT NULL DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tire Pressure & Telemetry (TPMS)
CREATE TABLE IF NOT EXISTS truck_tires (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  truck_id TEXT NOT NULL,
  position TEXT NOT NULL CHECK(position IN ('FL', 'FR', 'RL_Out', 'RL_In', 'RR_In', 'RR_Out')),
  pressure_psi REAL NOT NULL,
  temp_celsius REAL NOT NULL,
  tread_wear_pct REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'nominal',
  FOREIGN KEY (truck_id) REFERENCES dumper_trucks(id) ON DELETE CASCADE
);

-- 4. Dispatch Runs & Haul Cycle Logs
CREATE TABLE IF NOT EXISTS dispatch_runs (
  id TEXT PRIMARY KEY,
  truck_id TEXT NOT NULL,
  operator_name TEXT NOT NULL,
  shovel_id TEXT NOT NULL,
  dump_location TEXT NOT NULL,
  material_type TEXT NOT NULL,
  target_tonnage REAL NOT NULL,
  actual_tonnage REAL NOT NULL,
  cycle_time_minutes REAL NOT NULL,
  loading_minutes REAL NOT NULL,
  hauling_minutes REAL NOT NULL,
  dumping_minutes REAL NOT NULL,
  return_minutes REAL NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL CHECK(status IN ('In Progress', 'Completed', 'Delayed')),
  FOREIGN KEY (truck_id) REFERENCES dumper_trucks(id)
);

-- 5. Safety & Telematics Alerts
CREATE TABLE IF NOT EXISTS safety_alerts (
  id TEXT PRIMARY KEY,
  truck_id TEXT NOT NULL,
  severity TEXT NOT NULL CHECK(severity IN ('CRITICAL', 'WARNING', 'INFO')),
  category TEXT NOT NULL CHECK(category IN ('OVERLOAD', 'TPMS', 'GRADE_SPEED', 'FATIGUE', 'BRAKE_HEAT')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved BOOLEAN NOT NULL DEFAULT 0,
  FOREIGN KEY (truck_id) REFERENCES dumper_trucks(id)
);

-- Initial seed data
INSERT OR IGNORE INTO users (id, name, email, role, site_id, password_hash)
VALUES 
  ('USR-001', 'Chief Dispatcher Vance', 'admin@terrahaul.com', 'Fleet Operations Manager', 'Apex Pit Alpha', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'),
  ('USR-002', 'Sarah Jenkins', 'dispatch@terrahaul.com', 'Pit Dispatch Controller', 'Apex Pit Alpha', 'fc821814b7454c5e7b41e97de6ff90b201d1d4d84fcf8be098e9a2632b21c4ff');
