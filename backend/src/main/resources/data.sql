-- Idempotent seed data for yspace_db
-- Uses fixed IDs and NOT EXISTS checks so the script can run multiple times.

INSERT INTO users (id, role, first_name, last_name, email, password, created_at, updated_at)
SELECT 1, 'ADMIN', 'Nova', 'Commander', 'admin@yspace.com', '$2a$10$seededAdminPasswordHash', '2026-01-01 10:00:00', '2026-01-01 10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1);

INSERT INTO users (id, role, first_name, last_name, email, password, created_at, updated_at)
SELECT 2, 'SPACE_TOURIST', 'Luna', 'Park', 'luna.park@yspace.com', '$2a$10$seededTouristPasswordHash1', '2026-01-02 11:00:00', '2026-01-02 11:00:00'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 2);

INSERT INTO users (id, role, first_name, last_name, email, password, created_at, updated_at)
SELECT 3, 'SPACE_TOURIST', 'Orion', 'Vale', 'orion.vale@yspace.com', '$2a$10$seededTouristPasswordHash2', '2026-01-03 12:00:00', '2026-01-03 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 3);

INSERT INTO addresses (id, user_id, street, city, state, postal_code, country, created_at, updated_at)
SELECT 1, 2, '127 Orbit Lane', 'Solna', 'Stockholm', '17145', 'Sweden', '2026-01-05 09:00:00', '2026-01-05 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM addresses WHERE id = 1);

INSERT INTO addresses (id, user_id, street, city, state, postal_code, country, created_at, updated_at)
SELECT 2, 3, '88 Eclipse Road', 'Gothenburg', 'Vastra Gotaland', '41103', 'Sweden', '2026-01-05 09:10:00', '2026-01-05 09:10:00'
WHERE NOT EXISTS (SELECT 1 FROM addresses WHERE id = 2);

INSERT INTO phones (id, user_id, country_code, number, created_at, updated_at)
SELECT 1, 2, '+46', '701112233', '2026-01-05 09:20:00', '2026-01-05 09:20:00'
WHERE NOT EXISTS (SELECT 1 FROM phones WHERE id = 1);

INSERT INTO phones (id, user_id, country_code, number, created_at, updated_at)
SELECT 2, 3, '+46', '702223344', '2026-01-05 09:25:00', '2026-01-05 09:25:00'
WHERE NOT EXISTS (SELECT 1 FROM phones WHERE id = 2);

INSERT INTO spaceports (id, name, code, type, description, image_url)
SELECT 1, 'Earth Orbital Hub', 'EOH', 'STATION', 'Primary departure station in low Earth orbit.', 'https://images.yspace.local/spaceports/eoh.png'
WHERE NOT EXISTS (SELECT 1 FROM spaceports WHERE id = 1);

INSERT INTO spaceports (id, name, code, type, description, image_url)
SELECT 2, 'Luna Base One', 'LBO', 'MOON', 'Main lunar tourist arrival complex.', 'https://images.yspace.local/spaceports/lbo.png'
WHERE NOT EXISTS (SELECT 1 FROM spaceports WHERE id = 2);

INSERT INTO spaceports (id, name, code, type, description, image_url)
SELECT 3, 'Mars Gateway', 'MGW', 'PLANET', 'Mars orbit transfer and customs station.', 'https://images.yspace.local/spaceports/mgw.png'
WHERE NOT EXISTS (SELECT 1 FROM spaceports WHERE id = 3);

INSERT INTO routes (id, name, origin_spaceport_id, departure_spaceport_id, distance, description, created_at, updated_at)
SELECT 1, 'Earth to Luna Express', 1, 2, 384400.0, 'Fast transfer route between Earth orbit and the Moon.', '2026-01-06 08:00:00', '2026-01-06 08:00:00'
WHERE NOT EXISTS (SELECT 1 FROM routes WHERE id = 1);

INSERT INTO routes (id, name, origin_spaceport_id, departure_spaceport_id, distance, description, created_at, updated_at)
SELECT 2, 'Earth to Mars Window', 1, 3, 54600000.0, 'Long-range route opened during transfer windows.', '2026-01-06 08:10:00', '2026-01-06 08:10:00'
WHERE NOT EXISTS (SELECT 1 FROM routes WHERE id = 2);

INSERT INTO spacecraft_models (id, name, manufacturer, description, max_range, velocity, lifespan)
SELECT 1, 'Astra VX', 'YSpace Industries', 'Mid-range inter-orbital passenger craft.', 1000000.0, 28500.0, 18
WHERE NOT EXISTS (SELECT 1 FROM spacecraft_models WHERE id = 1);

INSERT INTO spacecraft_models (id, name, manufacturer, description, max_range, velocity, lifespan)
SELECT 2, 'Helios XR', 'YSpace Industries', 'Deep-space passenger vessel for Mars windows.', 90000000.0, 56000.0, 22
WHERE NOT EXISTS (SELECT 1 FROM spacecraft_models WHERE id = 2);

INSERT INTO spacecrafts (id, name, model_id, status, is_operational, created_at, updated_at)
SELECT 1, 'YS-101 Aurora', 1, 'PARKED', 1, '2026-01-07 07:00:00', '2026-01-07 07:00:00'
WHERE NOT EXISTS (SELECT 1 FROM spacecrafts WHERE id = 1);

INSERT INTO spacecrafts (id, name, model_id, status, is_operational, created_at, updated_at)
SELECT 2, 'YS-204 Horizon', 2, 'BOARDING', 1, '2026-01-07 07:15:00', '2026-01-07 07:15:00'
WHERE NOT EXISTS (SELECT 1 FROM spacecrafts WHERE id = 2);

INSERT INTO spacecrafts (id, name, model_id, status, is_operational, created_at, updated_at)
SELECT 3, 'YS-301 Odyssey', 2, 'CRUISING', 1, '2026-01-07 07:30:00', '2026-01-07 07:30:00'
WHERE NOT EXISTS (SELECT 1 FROM spacecrafts WHERE id = 3);

INSERT INTO flights (id, number, route_id, spacecraft_id, base_price, departure_time, arrival_time, status, is_delayed, created_at, updated_at)
SELECT 1, 'YS1001', 1, 2, 1499.00, '2026-06-10 09:00:00', '2026-06-10 13:30:00', 'BOARDING', 0, '2026-01-10 10:00:00', '2026-01-10 10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM flights WHERE id = 1);

INSERT INTO flights (id, number, route_id, spacecraft_id, base_price, departure_time, arrival_time, status, is_delayed, created_at, updated_at)
SELECT 2, 'YS1002', 1, 1, 1399.00, '2026-06-11 15:00:00', '2026-06-11 19:20:00', 'SCHEDULED', 0, '2026-01-10 10:10:00', '2026-01-10 10:10:00'
WHERE NOT EXISTS (SELECT 1 FROM flights WHERE id = 2);

INSERT INTO flights (id, number, route_id, spacecraft_id, base_price, departure_time, arrival_time, status, is_delayed, created_at, updated_at)
SELECT 3, 'YS2201', 2, 3, 8999.00, '2026-07-01 06:00:00', '2026-07-16 18:00:00', 'SCHEDULED', 0, '2026-01-10 10:20:00', '2026-01-10 10:20:00'
WHERE NOT EXISTS (SELECT 1 FROM flights WHERE id = 3);

INSERT INTO bookings (id, user_id, total_price, status, created_at, updated_at)
SELECT 1, 2, 1499.00, 'OPEN', '2026-05-01 12:00:00', '2026-05-01 12:00:00'
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE id = 1);

INSERT INTO bookings (id, user_id, total_price, status, created_at, updated_at)
SELECT 2, 3, 10398.00, 'CLOSED', '2026-05-02 13:00:00', '2026-05-03 13:00:00'
WHERE NOT EXISTS (SELECT 1 FROM bookings WHERE id = 2);

INSERT INTO booking_rows (id, booking_id, flight_id, price)
SELECT 1, 1, 1, 1499.00
WHERE NOT EXISTS (SELECT 1 FROM booking_rows WHERE id = 1);

INSERT INTO booking_rows (id, booking_id, flight_id, price)
SELECT 2, 2, 2, 1399.00
WHERE NOT EXISTS (SELECT 1 FROM booking_rows WHERE id = 2);

INSERT INTO booking_rows (id, booking_id, flight_id, price)
SELECT 3, 2, 3, 8999.00
WHERE NOT EXISTS (SELECT 1 FROM booking_rows WHERE id = 3);

-- -------------------------------------------------------------------
-- Bulk expansion (~10x data)
-- -------------------------------------------------------------------

INSERT INTO users (id, role, first_name, last_name, email, password, created_at, updated_at)
WITH RECURSIVE seq AS (
    SELECT 4 AS n
    UNION ALL
    SELECT n + 1 FROM seq WHERE n < 30
)
SELECT
    s.n,
    'SPACE_TOURIST',
    CONCAT('Tourist', s.n),
    'Seed',
    CONCAT('tourist', s.n, '@yspace.com'),
    CONCAT('$2a$10$seededTouristHash', LPAD(s.n, 2, '0')),
    DATE_ADD('2026-01-04 10:00:00', INTERVAL s.n DAY),
    DATE_ADD('2026-01-04 10:00:00', INTERVAL s.n DAY)
FROM seq s
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = s.n);

INSERT INTO addresses (id, user_id, street, city, state, postal_code, country, created_at, updated_at)
WITH RECURSIVE seq AS (
    SELECT 3 AS id, 4 AS user_id
    UNION ALL
    SELECT id + 1, user_id + 1 FROM seq WHERE id < 29
)
SELECT
    s.id,
    s.user_id,
    CONCAT(s.user_id, ' Launch Street'),
    CONCAT('City', s.user_id),
    'Stockholm',
    CONCAT('17', LPAD(s.user_id, 3, '0')),
    'Sweden',
    DATE_ADD('2026-01-05 10:00:00', INTERVAL s.id DAY),
    DATE_ADD('2026-01-05 10:00:00', INTERVAL s.id DAY)
FROM seq s
WHERE NOT EXISTS (SELECT 1 FROM addresses a WHERE a.id = s.id);

INSERT INTO phones (id, user_id, country_code, number, created_at, updated_at)
WITH RECURSIVE seq AS (
    SELECT 3 AS id, 4 AS user_id
    UNION ALL
    SELECT id + 1, user_id + 1 FROM seq WHERE id < 29
)
SELECT
    s.id,
    s.user_id,
    '+46',
    CONCAT('70', LPAD(s.user_id * 37, 7, '0')),
    DATE_ADD('2026-01-05 12:00:00', INTERVAL s.id DAY),
    DATE_ADD('2026-01-05 12:00:00', INTERVAL s.id DAY)
FROM seq s
WHERE NOT EXISTS (SELECT 1 FROM phones p WHERE p.id = s.id);

INSERT INTO spaceports (id, name, code, type, description, image_url)
WITH RECURSIVE seq AS (
    SELECT 4 AS id
    UNION ALL
    SELECT id + 1 FROM seq WHERE id < 10
)
SELECT
    s.id,
    CONCAT('Outpost ', s.id),
    CONCAT('SP', LPAD(s.id, 2, '0')),
    CASE MOD(s.id, 3)
        WHEN 0 THEN 'PLANET'
        WHEN 1 THEN 'MOON'
        ELSE 'STATION'
    END,
    CONCAT('Seeded spaceport ', s.id),
    CONCAT('https://images.yspace.local/spaceports/sp', LPAD(s.id, 2, '0'), '.png')
FROM seq s
WHERE NOT EXISTS (SELECT 1 FROM spaceports sp WHERE sp.id = s.id);

INSERT INTO routes (id, name, origin_spaceport_id, departure_spaceport_id, distance, description, created_at, updated_at)
SELECT
    r.id,
    r.name,
    r.origin_spaceport_id,
    r.departure_spaceport_id,
    r.distance,
    r.description,
    r.created_at,
    r.updated_at
FROM (
    SELECT 3 AS id, 'Luna Return' AS name, 2 AS origin_spaceport_id, 1 AS departure_spaceport_id, 384400.0 AS distance, 'Moon to Earth return route.' AS description, '2026-01-06 09:00:00' AS created_at, '2026-01-06 09:00:00' AS updated_at
    UNION ALL SELECT 4, 'Mars Return', 3, 1, 54600000.0, 'Mars transfer return route.', '2026-01-06 09:05:00', '2026-01-06 09:05:00'
    UNION ALL SELECT 5, 'Luna to Mars', 2, 3, 54215600.0, 'Lunar launch towards Mars gateway.', '2026-01-06 09:10:00', '2026-01-06 09:10:00'
    UNION ALL SELECT 6, 'Mars to Luna', 3, 2, 54215600.0, 'Mars gateway transfer to lunar base.', '2026-01-06 09:15:00', '2026-01-06 09:15:00'
    UNION ALL SELECT 7, 'Earth to Outpost 4', 1, 4, 950000.0, 'Orbital connector route.', '2026-01-06 09:20:00', '2026-01-06 09:20:00'
    UNION ALL SELECT 8, 'Outpost 4 to Earth', 4, 1, 950000.0, 'Return orbital connector route.', '2026-01-06 09:25:00', '2026-01-06 09:25:00'
    UNION ALL SELECT 9, 'Luna to Outpost 5', 2, 5, 1200000.0, 'Lunar shuttle connector.', '2026-01-06 09:30:00', '2026-01-06 09:30:00'
    UNION ALL SELECT 10, 'Outpost 5 to Luna', 5, 2, 1200000.0, 'Lunar shuttle return.', '2026-01-06 09:35:00', '2026-01-06 09:35:00'
    UNION ALL SELECT 11, 'Mars to Outpost 6', 3, 6, 2300000.0, 'Mars gateway branch route.', '2026-01-06 09:40:00', '2026-01-06 09:40:00'
    UNION ALL SELECT 12, 'Outpost 6 to Mars', 6, 3, 2300000.0, 'Mars gateway branch return.', '2026-01-06 09:45:00', '2026-01-06 09:45:00'
    UNION ALL SELECT 13, 'Earth to Outpost 7', 1, 7, 1800000.0, 'Extended orbital route.', '2026-01-06 09:50:00', '2026-01-06 09:50:00'
    UNION ALL SELECT 14, 'Outpost 7 to Earth', 7, 1, 1800000.0, 'Extended orbital return route.', '2026-01-06 09:55:00', '2026-01-06 09:55:00'
) r
WHERE NOT EXISTS (SELECT 1 FROM routes existing WHERE existing.id = r.id);

INSERT INTO spacecraft_models (id, name, manufacturer, description, max_range, velocity, lifespan)
WITH RECURSIVE seq AS (
    SELECT 3 AS id
    UNION ALL
    SELECT id + 1 FROM seq WHERE id < 10
)
SELECT
    s.id,
    CONCAT('Model-', s.id),
    'YSpace Industries',
    CONCAT('Seeded spacecraft model ', s.id),
    5000000.0 + (s.id * 2500000.0),
    22000.0 + (s.id * 1800.0),
    15 + MOD(s.id, 12)
FROM seq s
WHERE NOT EXISTS (SELECT 1 FROM spacecraft_models sm WHERE sm.id = s.id);

INSERT INTO spacecrafts (id, name, model_id, status, is_operational, created_at, updated_at)
WITH RECURSIVE seq AS (
    SELECT 4 AS id
    UNION ALL
    SELECT id + 1 FROM seq WHERE id < 30
)
SELECT
    s.id,
    CONCAT('YS-', LPAD(s.id, 3, '0'), ' Vector'),
    1 + MOD(s.id, 10),
    CASE MOD(s.id, 11)
        WHEN 0 THEN 'UNDER_MAINTENANCE'
        WHEN 1 THEN 'RETIRED'
        WHEN 2 THEN 'LAUNCHING'
        WHEN 3 THEN 'EXITING'
        WHEN 4 THEN 'ORBITING'
        WHEN 5 THEN 'CRUISING'
        WHEN 6 THEN 'ENTERING'
        WHEN 7 THEN 'LANDING'
        WHEN 8 THEN 'PARKING'
        WHEN 9 THEN 'PARKED'
        ELSE 'BOARDING'
    END,
    CASE WHEN MOD(s.id, 10) = 0 THEN 0 ELSE 1 END,
    DATE_ADD('2026-01-08 08:00:00', INTERVAL s.id DAY),
    DATE_ADD('2026-01-08 08:00:00', INTERVAL s.id DAY)
FROM seq s
WHERE NOT EXISTS (SELECT 1 FROM spacecrafts sc WHERE sc.id = s.id);

INSERT INTO flights (id, number, route_id, spacecraft_id, base_price, departure_time, arrival_time, status, is_delayed, created_at, updated_at)
WITH RECURSIVE seq AS (
    SELECT 4 AS id
    UNION ALL
    SELECT id + 1 FROM seq WHERE id < 30
)
SELECT
    s.id,
    CONCAT('YS', LPAD(3000 + s.id, 4, '0')),
    1 + MOD(s.id, 14),
    1 + MOD(s.id, 30),
    1200.00 + (s.id * 57.00),
    DATE_ADD('2026-08-01 06:00:00', INTERVAL s.id DAY),
    DATE_ADD(DATE_ADD('2026-08-01 06:00:00', INTERVAL s.id DAY), INTERVAL (4 + MOD(s.id, 7)) HOUR),
    CASE MOD(s.id, 6)
        WHEN 0 THEN 'SCHEDULED'
        WHEN 1 THEN 'BOARDING'
        WHEN 2 THEN 'DEPARTED'
        WHEN 3 THEN 'ARRIVED'
        WHEN 4 THEN 'IN_FLIGHT'
        ELSE 'CANCELLED'
    END,
    CASE WHEN MOD(s.id, 9) = 0 THEN 1 ELSE 0 END,
    DATE_ADD('2026-01-10 11:00:00', INTERVAL s.id DAY),
    DATE_ADD('2026-01-10 11:00:00', INTERVAL s.id DAY)
FROM seq s
WHERE NOT EXISTS (SELECT 1 FROM flights f WHERE f.id = s.id);

INSERT INTO bookings (id, user_id, total_price, status, created_at, updated_at)
WITH RECURSIVE seq AS (
    SELECT 3 AS id
    UNION ALL
    SELECT id + 1 FROM seq WHERE id < 30
)
SELECT
    s.id,
    2 + MOD(s.id, 29),
    1100.00 + (s.id * 133.00),
    CASE MOD(s.id, 3)
        WHEN 0 THEN 'OPEN'
        WHEN 1 THEN 'CLOSED'
        ELSE 'CANCELLED'
    END,
    DATE_ADD('2026-05-04 09:00:00', INTERVAL s.id DAY),
    DATE_ADD('2026-05-04 09:00:00', INTERVAL s.id DAY)
FROM seq s
WHERE NOT EXISTS (SELECT 1 FROM bookings b WHERE b.id = s.id);

INSERT INTO booking_rows (id, booking_id, flight_id, price)
WITH RECURSIVE seq AS (
    SELECT 4 AS id
    UNION ALL
    SELECT id + 1 FROM seq WHERE id < 120
)
SELECT
    s.id,
    1 + MOD(s.id, 30),
    1 + MOD(s.id, 30),
    950.00 + (s.id * 21.00)
FROM seq s
WHERE NOT EXISTS (SELECT 1 FROM booking_rows br WHERE br.id = s.id);
