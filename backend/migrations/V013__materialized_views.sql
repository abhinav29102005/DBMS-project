-- ═══════════════════════════════════════════════════════════════
-- V013: Materialized Views
-- ═══════════════════════════════════════════════════════════════
-- Purpose:   Pre-computed reporting projections for performance.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Reporting: Student GPA Summary ────────────────────────
CREATE MATERIALIZED VIEW reporting.mv_student_gpa_summary AS
SELECT
  s.id AS student_id,
  s.student_no,
  s.department_id,
  exam.calculate_gpa(s.id) AS cumulative_gpa,
  COALESCE(SUM(c.credits) FILTER (WHERE fr.result_status = 'pass'), 0) AS total_credits_earned,
  now() AS last_computed_at
FROM academic.students s
LEFT JOIN exam.final_results fr ON fr.student_id = s.id
LEFT JOIN academic.course_offerings co ON co.id = fr.course_offering_id
LEFT JOIN academic.courses c ON c.id = co.course_id
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.student_no, s.department_id;

CREATE UNIQUE INDEX idx_mv_student_gpa_student_id ON reporting.mv_student_gpa_summary (student_id);

-- ─── 2. Reporting: Hostel Occupancy Stats ─────────────────────
CREATE MATERIALIZED VIEW reporting.mv_hostel_occupancy_stats AS
SELECT
  h.id AS hostel_id,
  h.name AS hostel_name,
  COUNT(b.id) AS total_beds,
  COUNT(a.id) FILTER (WHERE a.status = 'active') AS occupied_beds,
  COUNT(b.id) - COUNT(a.id) FILTER (WHERE a.status = 'active') AS vacant_beds,
  ROUND(
    (COUNT(a.id) FILTER (WHERE a.status = 'active')::NUMERIC / NULLIF(COUNT(b.id), 0)) * 100,
    2
  ) AS occupancy_rate,
  now() AS last_computed_at
FROM hostel.hostels h
LEFT JOIN hostel.blocks bl ON bl.hostel_id = h.id
LEFT JOIN hostel.rooms r ON r.block_id = bl.id
LEFT JOIN hostel.beds b ON b.room_id = r.id
LEFT JOIN hostel.allocations a ON a.bed_id = b.id AND a.status = 'active'
GROUP BY h.id, h.name;

CREATE UNIQUE INDEX idx_mv_hostel_stats_hostel_id ON reporting.mv_hostel_occupancy_stats (hostel_id);

-- ─── 3. Reporting: Library Usage Analytics ────────────────────
CREATE MATERIALIZED VIEW reporting.mv_library_usage_analytics AS
SELECT
  b.id AS book_id,
  b.title,
  COUNT(i.id) AS total_issues,
  COUNT(DISTINCT i.member_user_id) AS unique_borrowers,
  AVG(CASE WHEN i.returned_at IS NOT NULL THEN (i.returned_at::date - i.issued_at::date) ELSE NULL END) AS avg_borrow_duration_days,
  now() AS last_computed_at
FROM library.books b
LEFT JOIN library.book_copies bc ON bc.book_id = b.id
LEFT JOIN library.issues i ON i.copy_id = bc.id
GROUP BY b.id, b.title;

CREATE UNIQUE INDEX idx_mv_library_stats_book_id ON reporting.mv_library_usage_analytics (book_id);

-- Initialize refresh log
INSERT INTO reporting.mv_refresh_log (mv_name, last_refresh, is_stale) VALUES
  ('mv_student_gpa_summary', now(), FALSE),
  ('mv_hostel_occupancy_stats', now(), FALSE),
  ('mv_library_usage_analytics', now(), FALSE);
