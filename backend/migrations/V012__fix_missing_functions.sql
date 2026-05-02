-- Fix missing database functions and schema inconsistencies

-- 1. Missing auth.set_request_context function
-- This is critical for session handling in authenticated requests.
CREATE OR REPLACE FUNCTION auth.set_request_context(
    user_id uuid,
    role text,
    request_id text
) RETURNS void AS $$
BEGIN
    PERFORM set_config('request.user_id', user_id::text, false);
    PERFORM set_config('request.role', role, false);
    PERFORM set_config('request.correlation_id', request_id, false);
END;
$$ LANGUAGE plpgsql;

-- 2. Redundant UNIQUE constraint on auth.user_roles.scope_id
-- The scope_id should be unique PER user/role, not globally.
ALTER TABLE "auth"."user_roles" DROP CONSTRAINT IF EXISTS "user_roles_scope_id_key";

-- 3. Missing hostel.allocate_bed function
-- Required for hostel room allocation.
CREATE OR REPLACE FUNCTION hostel.allocate_bed(
    p_student_id uuid,
    p_bed_id uuid,
    p_idempotency_key text,
    p_allocated_by uuid
) RETURNS uuid AS $$
DECLARE
    v_allocation_id uuid;
BEGIN
    -- Check for idempotency
    SELECT id INTO v_allocation_id FROM hostel.allocations WHERE idempotency_key = p_idempotency_key;
    IF v_allocation_id IS NOT NULL THEN
        RETURN v_allocation_id;
    END IF;

    -- Check if bed is available
    IF NOT EXISTS (SELECT 1 FROM hostel.beds WHERE id = p_bed_id AND status = 'available') THEN
        RAISE EXCEPTION 'BED_OCCUPIED';
    END IF;

    -- Check if student already has an active allocation
    IF EXISTS (SELECT 1 FROM hostel.allocations WHERE student_id = p_student_id AND status = 'active') THEN
        RAISE EXCEPTION 'ALREADY_ALLOCATED';
    END IF;

    -- Create allocation
    INSERT INTO hostel.allocations (student_id, bed_id, idempotency_key, allocated_by)
    VALUES (p_student_id, p_bed_id, p_idempotency_key, p_allocated_by)
    RETURNING id INTO v_allocation_id;

    -- Update bed status
    UPDATE hostel.beds SET status = 'occupied' WHERE id = p_bed_id;

    RETURN v_allocation_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Missing exam.publish_results procedure
-- Required for result publication.
CREATE OR REPLACE PROCEDURE exam.publish_results(
    p_offering_id uuid,
    p_published_by uuid
) AS $$
BEGIN
    -- Copy marks to final_results
    -- This is a simplified version
    INSERT INTO exam.final_results (student_id, course_offering_id, total_marks, result_status, published_at)
    SELECT 
        m.student_id, 
        e.course_offering_id, 
        m.marks_obtained, 
        CASE WHEN m.marks_obtained >= 40 THEN 'pass' ELSE 'fail' END,
        now()
    FROM exam.marks m
    JOIN exam.exams e ON m.exam_id = e.id
    WHERE e.course_offering_id = p_offering_id
    ON CONFLICT (student_id, course_offering_id) DO UPDATE SET
        total_marks = EXCLUDED.total_marks,
        result_status = EXCLUDED.result_status,
        published_at = EXCLUDED.published_at,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;
