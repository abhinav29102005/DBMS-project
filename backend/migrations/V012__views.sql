-- ═══════════════════════════════════════════════════════════════
-- V012: Regular Views
-- ═══════════════════════════════════════════════════════════════
-- Purpose:   Simplify access to joined data for portal surfaces.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Academic: Student Profile View ────────────────────────
CREATE OR REPLACE VIEW academic.v_student_profile AS
SELECT
  s.id AS student_id,
  u.id AS user_id,
  s.student_no,
  u.first_name,
  u.last_name,
  u.email,
  d.name AS department_name,
  p.name AS program_name,
  p.degree_type,
  s.admission_year,
  s.current_semester,
  s.lifecycle_state
FROM academic.students s
JOIN auth.users u ON u.id = s.user_id
JOIN academic.departments d ON d.id = s.department_id
JOIN academic.programs p ON p.id = s.program_id
WHERE s.deleted_at IS NULL;

-- ─── 2. Hostel: Room Occupancy View ───────────────────────────
CREATE OR REPLACE VIEW hostel.v_room_occupancy AS
SELECT
  r.id AS room_id,
  h.name AS hostel_name,
  b.name AS block_name,
  r.room_no,
  r.floor_no,
  r.capacity,
  COUNT(bd.id) AS total_beds,
  COUNT(bd.id) FILTER (WHERE bd.status = 'occupied') AS occupied_beds,
  r.capacity - COUNT(bd.id) FILTER (WHERE bd.status = 'occupied') AS vacant_beds
FROM hostel.rooms r
JOIN hostel.blocks b ON b.id = r.block_id
JOIN hostel.hostels h ON h.id = b.hostel_id
LEFT JOIN hostel.beds bd ON bd.room_id = r.id
GROUP BY r.id, h.name, b.name, r.room_no, r.floor_no, r.capacity;

-- ─── 3. Library: Book Availability View ───────────────────────
CREATE OR REPLACE VIEW library.v_book_availability AS
SELECT
  b.id AS book_id,
  b.isbn,
  b.title,
  pub.name AS publisher_name,
  COUNT(bc.id) AS total_copies,
  COUNT(bc.id) FILTER (WHERE bc.status = 'available') AS available_copies
FROM library.books b
LEFT JOIN library.publishers pub ON pub.id = b.publisher_id
LEFT JOIN library.book_copies bc ON bc.book_id = b.id
WHERE b.deleted_at IS NULL
GROUP BY b.id, b.isbn, b.title, pub.name;

-- ─── 4. Exam: Student Results View ────────────────────────────
CREATE OR REPLACE VIEW exam.v_student_results AS
SELECT
  fr.student_id,
  s.student_no,
  c.course_code,
  c.title AS course_title,
  sem.name AS semester_name,
  fr.total_marks,
  fr.grade_code,
  fr.grade_points,
  fr.result_status,
  fr.published_at
FROM exam.final_results fr
JOIN academic.students s ON s.id = fr.student_id
JOIN academic.course_offerings co ON co.id = fr.course_offering_id
JOIN academic.courses c ON c.id = co.course_id
JOIN academic.semesters sem ON sem.id = co.semester_id;
