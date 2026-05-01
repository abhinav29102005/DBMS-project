-- ═══════════════════════════════════════════════════════════════
-- V009: PL/pgSQL Functions
-- ═══════════════════════════════════════════════════════════════
-- Purpose:   Complex business logic enforced at the database layer.
-- ═══════════════════════════════════════════════════════════════

-- Create admin schema (missed in V001)
CREATE SCHEMA IF NOT EXISTS admin;

-- ─── 1. Exam: Calculate GPA ──────────────────────────────────
CREATE OR REPLACE FUNCTION exam.calculate_gpa(p_student_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_total_quality NUMERIC := 0;
  v_total_credits NUMERIC := 0;
BEGIN
  SELECT
    COALESCE(SUM(fr.grade_points * c.credits), 0),
    COALESCE(SUM(c.credits), 0)
  INTO v_total_quality, v_total_credits
  FROM exam.final_results fr
  JOIN academic.enrollments e
    ON e.student_id = fr.student_id
   AND e.course_offering_id = fr.course_offering_id
  JOIN academic.course_offerings co ON co.id = fr.course_offering_id
  JOIN academic.courses c ON c.id = co.course_id
  WHERE fr.student_id = p_student_id
    AND fr.result_status IN ('pass', 'fail');

  IF v_total_credits = 0 THEN
    RETURN NULL;
  END IF;

  RETURN ROUND(v_total_quality / v_total_credits, 2);
END;
$$;

-- ─── 2. Hostel: Available Beds ────────────────────────────────
CREATE OR REPLACE FUNCTION hostel.available_beds(p_hostel_id UUID)
RETURNS TABLE (bed_id UUID, room_no TEXT, floor_no INTEGER, bed_label TEXT)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, r.room_no, r.floor_no, b.bed_label
  FROM hostel.beds b
  JOIN hostel.rooms r ON r.id = b.room_id
  JOIN hostel.blocks bl ON bl.id = r.block_id
  WHERE bl.hostel_id = p_hostel_id
    AND NOT EXISTS (
      SELECT 1 FROM hostel.allocations a
      WHERE a.bed_id = b.id AND a.status = 'active'
    )
  ORDER BY r.floor_no, r.room_no, b.bed_label;
END;
$$;

-- ─── 3. Hostel: Allocate Bed (Atomic) ─────────────────────────
CREATE OR REPLACE FUNCTION hostel.allocate_bed(
  p_student_id      UUID,
  p_bed_id          UUID,
  p_idempotency_key TEXT,
  p_allocated_by    UUID
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_allocation_id UUID;
  v_bed_status    TEXT;
BEGIN
  -- Lock the bed row to prevent concurrent allocation
  SELECT status INTO v_bed_status
  FROM hostel.beds WHERE id = p_bed_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'BED_NOT_FOUND: bed % does not exist', p_bed_id
      USING ERRCODE = 'P0001';
  END IF;

  -- Check bed availability via active allocation
  IF EXISTS (
    SELECT 1 FROM hostel.allocations
    WHERE bed_id = p_bed_id AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'BED_OCCUPIED: bed % already has active allocation', p_bed_id
      USING ERRCODE = 'P0002';
  END IF;

  -- Check if student already has an active allocation
  IF EXISTS (
    SELECT 1 FROM hostel.allocations
    WHERE student_id = p_student_id AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'ALREADY_ALLOCATED: student % already has active allocation', p_student_id
      USING ERRCODE = 'P0003';
  END IF;

  -- Insert allocation
  INSERT INTO hostel.allocations (
    id, student_id, bed_id, allocated_from, status, idempotency_key, allocated_by
  )
  VALUES (
    gen_random_uuid(), p_student_id, p_bed_id, now(), 'active', p_idempotency_key, p_allocated_by
  )
  ON CONFLICT (idempotency_key) DO UPDATE SET idempotency_key = EXCLUDED.idempotency_key
  RETURNING id INTO v_allocation_id;

  -- Update bed status
  UPDATE hostel.beds SET status = 'occupied', updated_at = now() WHERE id = p_bed_id;

  RETURN v_allocation_id;
END;
$$;

-- ─── 4. Library: Accrue Overdue Fines (Batch Procedure) ────────
CREATE OR REPLACE PROCEDURE library.accrue_overdue_fines(p_as_of DATE DEFAULT CURRENT_DATE)
LANGUAGE plpgsql
AS $$
DECLARE
  v_issue RECORD;
  v_days  INTEGER;
  v_fine  NUMERIC;
  v_rate  NUMERIC := 2.00; -- ₹2 per day per copy
BEGIN
  FOR v_issue IN
    SELECT i.id AS issue_id, i.member_user_id, i.due_at
    FROM library.issues i
    WHERE i.returned_at IS NULL
      AND i.due_at::date < p_as_of
    FOR UPDATE SKIP LOCKED
  LOOP
    v_days := p_as_of - v_issue.due_at::date;
    v_fine := v_days * v_rate;

    INSERT INTO library.fines (id, issue_id, member_user_id, amount, reason, assessed_at)
    VALUES (gen_random_uuid(), v_issue.issue_id, v_issue.member_user_id, v_fine, 'overdue', now())
    ON CONFLICT (issue_id) WHERE reason = 'overdue' DO UPDATE
      SET amount = EXCLUDED.amount, assessed_at = now();
  END LOOP;
END;
$$;

-- ─── 5. Exam: Publish Results (Batch Procedure) ──────────────
CREATE OR REPLACE PROCEDURE exam.publish_results(p_offering_id UUID, p_published_by UUID)
LANGUAGE plpgsql
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Verify all marks are graded for this offering
  SELECT COUNT(*) INTO v_count
  FROM academic.enrollments e
  WHERE e.course_offering_id = p_offering_id
    AND e.enrollment_status = 'enrolled'
    AND NOT EXISTS (
      -- Check if all exams for this offering have marks for this student
      SELECT 1 FROM exam.exams ex
      LEFT JOIN exam.marks m ON m.exam_id = ex.id AND m.student_id = e.student_id
      WHERE ex.course_offering_id = p_offering_id
        AND m.student_id IS NULL
    );

  IF v_count > 0 THEN
    RAISE EXCEPTION 'INCOMPLETE_MARKS: % students have incomplete marks', v_count
      USING ERRCODE = 'P0020';
  END IF;

  -- Compute and upsert final results
  INSERT INTO exam.final_results (
    id, course_offering_id, student_id,
    total_marks, grade_code, grade_points, result_status, published_at
  )
  SELECT
    gen_random_uuid(),
    p_offering_id,
    e.student_id,
    SUM(m.marks_obtained * ex.weightage_percent / 100.0) AS total_marks,
    gs.grade_code,
    gs.grade_points,
    CASE WHEN SUM(m.marks_obtained * ex.weightage_percent / 100.0) >= gs.min_marks THEN 'pass' ELSE 'fail' END,
    now()
  FROM academic.enrollments e
  JOIN exam.marks m ON m.student_id = e.student_id
  JOIN exam.exams ex ON ex.id = m.exam_id AND ex.course_offering_id = p_offering_id
  JOIN exam.grade_scale gs ON gs.effective_from <= now() AND (gs.effective_to IS NULL OR gs.effective_to >= now())
  WHERE e.course_offering_id = p_offering_id
    AND (SUM(m.marks_obtained * ex.weightage_percent / 100.0) BETWEEN gs.min_marks AND gs.max_marks)
  GROUP BY e.student_id, gs.grade_code, gs.grade_points, gs.min_marks
  ON CONFLICT (course_offering_id, student_id) DO UPDATE
    SET total_marks   = EXCLUDED.total_marks,
        grade_code    = EXCLUDED.grade_code,
        grade_points  = EXCLUDED.grade_points,
        result_status = EXCLUDED.result_status,
        published_at  = EXCLUDED.published_at;

  -- Emit outbox event
  INSERT INTO audit.outbox (id, aggregate_type, aggregate_id, event_type, payload)
  VALUES (
    gen_random_uuid(), 'course_offering', p_offering_id,
    'ResultPublished',
    jsonb_build_object('offering_id', p_offering_id, 'published_by', p_published_by, 'published_at', now())
  );
END;
$$;

-- ─── 6. Auth: Set Request Context for RLS ─────────────────────
CREATE OR REPLACE FUNCTION auth.set_request_context(
  p_user_id    UUID,
  p_role       TEXT,
  p_request_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.current_user_id', p_user_id::TEXT, true);
  PERFORM set_config('app.current_role',    p_role,           true);
  PERFORM set_config('app.request_id',      p_request_id,     true);
END;
$$;

-- ─── 7. Admin: Count Table Rows ───────────────────────────────
CREATE OR REPLACE FUNCTION admin.count_table_rows(p_schema TEXT, p_table TEXT)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count BIGINT;
  v_sql   TEXT;
BEGIN
  -- Validate inputs to prevent SQL injection in identifiers
  IF p_schema NOT IN ('academic','hostel','library','exam','auth','audit') THEN
    RAISE EXCEPTION 'INVALID_SCHEMA: %', p_schema USING ERRCODE = 'P0030';
  END IF;

  v_sql := format('SELECT COUNT(*) FROM %I.%I', p_schema, p_table);
  EXECUTE v_sql INTO v_count;
  RETURN v_count;
END;
$$;

-- ─── 8. Reporting: MV Refresh Control ──────────────────────────
CREATE TABLE IF NOT EXISTS reporting.mv_refresh_log (
  mv_name      TEXT PRIMARY KEY,
  last_refresh TIMESTAMPTZ,
  is_stale     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE OR REPLACE FUNCTION reporting.mark_stale(p_mv_name TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO reporting.mv_refresh_log (mv_name, last_refresh, is_stale)
  VALUES (p_mv_name, now(), TRUE)
  ON CONFLICT (mv_name) DO UPDATE SET is_stale = TRUE;
END;
$$;

CREATE OR REPLACE PROCEDURE reporting.refresh_if_stale(p_mv_name TEXT)
LANGUAGE plpgsql AS $$
DECLARE
  v_stale BOOLEAN;
BEGIN
  SELECT is_stale INTO v_stale FROM reporting.mv_refresh_log WHERE mv_name = p_mv_name;

  IF v_stale IS TRUE THEN
    EXECUTE format('REFRESH MATERIALIZED VIEW CONCURRENTLY reporting.%I', p_mv_name);
    UPDATE reporting.mv_refresh_log
    SET is_stale = FALSE, last_refresh = now()
    WHERE mv_name = p_mv_name;
  END IF;
END;
$$;
