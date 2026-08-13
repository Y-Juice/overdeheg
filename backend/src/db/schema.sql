-- Schema voor Overdeheg.
-- Wordt automatisch uitgevoerd door de postgres container bij een lege database.

CREATE TABLE zones (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  grid_x INT NOT NULL,
  grid_y INT NOT NULL
);

CREATE TABLE residents (
  uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id INT NOT NULL REFERENCES zones(id),
  risk_score REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  uid UUID NOT NULL REFERENCES residents(uid),
  zone_id INT NOT NULL REFERENCES zones(id),
  content TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  hesitation_ms INT NOT NULL DEFAULT 0,
  edit_count INT NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE location_pings (
  id SERIAL PRIMARY KEY,
  uid UUID NOT NULL REFERENCES residents(uid),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  zone_id INT REFERENCES zones(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE correlations (
  id SERIAL PRIMARY KEY,
  uid UUID NOT NULL REFERENCES residents(uid),
  match_type TEXT NOT NULL,
  weight REAL NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE flags (
  id SERIAL PRIMARY KEY,
  uid UUID NOT NULL REFERENCES residents(uid),
  level TEXT NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE system_log (
  id SERIAL PRIMARY KEY,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_uid ON messages(uid);
CREATE INDEX idx_messages_zone ON messages(zone_id);
CREATE INDEX idx_pings_uid ON location_pings(uid);
CREATE INDEX idx_correlations_uid ON correlations(uid);
CREATE INDEX idx_flags_uid ON flags(uid);
