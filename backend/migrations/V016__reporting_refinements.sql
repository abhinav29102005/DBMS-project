-- Refined Hostel Occupancy View with Block-level granularity
DROP VIEW IF EXISTS "reporting"."mv_hostel_occupancy_stats";
CREATE VIEW "reporting"."mv_hostel_occupancy_stats" AS (
  SELECT 
    h.id AS hostel_id, 
    h.name AS hostel_name, 
    bl.id AS block_id,
    bl.name AS block_name,
    count(b.id) AS total_beds, 
    count(a.id) FILTER (WHERE a.status = 'active') AS occupied_beds, 
    count(b.id) - count(a.id) FILTER (WHERE a.status = 'active') AS vacant_beds, 
    round(count(a.id) FILTER (WHERE a.status = 'active')::numeric / NULLIF(count(b.id), 0)::numeric * 100, 2) AS occupancy_rate, 
    now() AS last_computed_at 
  FROM hostel.hostels h 
  JOIN hostel.blocks bl ON bl.hostel_id = h.id 
  LEFT JOIN hostel.rooms r ON r.block_id = bl.id 
  LEFT JOIN hostel.beds b ON b.room_id = r.id 
  LEFT JOIN hostel.allocations a ON a.bed_id = b.id AND a.status = 'active'
  GROUP BY h.id, h.name, bl.id, bl.name
);

-- Library Stats View for Admin Dashboard
DROP VIEW IF EXISTS "reporting"."mv_library_stats";
CREATE VIEW "reporting"."mv_library_stats" AS (
  SELECT
    (SELECT COUNT(*) FROM library.books) as total_books,
    (SELECT COUNT(*) FROM library.book_copies) as total_copies,
    (SELECT COUNT(*) FROM library.issues WHERE returned_at IS NULL) as active_issues,
    (SELECT COUNT(*) FROM library.issues WHERE returned_at IS NULL AND due_at < NOW()) as overdue_books,
    now() as last_computed_at
);
