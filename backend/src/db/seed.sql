-- Seed data voor Overdeheg.
-- Zes zones in een 3x2 raster en een paar bestaande bewoners met berichten,
-- zodat de applicatie direct data heeft om te tonen.

INSERT INTO zones (name, grid_x, grid_y) VALUES
  ('Noordhaag', 0, 0),
  ('Hegkwartier', 1, 0),
  ('Oosterheg', 2, 0),
  ('Westerheg', 0, 1),
  ('Zuidhaag', 1, 1),
  ('Hegveld', 2, 1);

INSERT INTO residents (uid, zone_id) VALUES
  ('a1000000-0000-4000-8000-000000000001', 1),
  ('a1000000-0000-4000-8000-000000000002', 2),
  ('a1000000-0000-4000-8000-000000000003', 5);

INSERT INTO messages (uid, zone_id, content, latitude, longitude, hesitation_ms, edit_count) VALUES
  ('a1000000-0000-4000-8000-000000000001', 1, 'Heeft iemand die witte bus op de hoek zien staan?', 52.0011, 5.1003, 4200, 1),
  ('a1000000-0000-4000-8000-000000000002', 2, 'De lantaarnpaal bij het speeltuintje doet het weer niet.', 52.0014, 5.1041, 1800, 0),
  ('a1000000-0000-4000-8000-000000000003', 5, 'Wie laat er steeds vuilniszakken naast de container staan?', 51.9989, 5.1038, 6700, 3);

INSERT INTO location_pings (uid, latitude, longitude, zone_id) VALUES
  ('a1000000-0000-4000-8000-000000000001', 52.0011, 5.1003, 1),
  ('a1000000-0000-4000-8000-000000000002', 52.0014, 5.1041, 2),
  ('a1000000-0000-4000-8000-000000000003', 51.9989, 5.1038, 5);

INSERT INTO system_log (level, message) VALUES
  ('info', 'Systeem geinitialiseerd. Observatie van wijk Overdeheg gestart.');
