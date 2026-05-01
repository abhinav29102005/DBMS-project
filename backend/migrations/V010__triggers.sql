-- ═══════════════════════════════════════════════════════════════
-- V010: Triggers
-- ═══════════════════════════════════════════════════════════════
-- Purpose:   Automate audit logging, status synchronization, and
--            lifecycle validation.
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. Audit Logging Trigger ─────────────────────────────────
CREATE OR REPLACE FUNCTION audit.log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_values JSONB;
  v_new_values JSONB;
  v_record_pk  TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_old_values := to_jsonb(OLD);
    -- Redact secrets
    v_old_values := v_old_values - 'password_hash' - 'password_algo';
    v_record_pk  := OLD.id::TEXT;
    v_new_values := NULL;
  ELSIF TG_OP = 'INSERT' THEN
    v_new_values := to_jsonb(NEW);
    v_new_values := v_new_values - 'password_hash' - 'password_algo';
    v_record_pk  := NEW.id::TEXT;
    v_old_values := NULL;
  ELSE -- UPDATE
    v_old_values := to_jsonb(OLD) - 'password_hash' - 'password_algo';
    v_new_values := to_jsonb(NEW) - 'password_hash' - 'password_algo';
    v_record_pk  := NEW.id::TEXT;
  END IF;

  INSERT INTO audit.audit_logs (
    table_name, record_pk, operation,
    old_values, new_values,
    changed_by, request_id, source_module
  ) VALUES (
    TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
    v_record_pk,
    TG_OP,
    v_old_values,
    v_new_values,
    NULLIF(current_setting('app.current_user_id', true), '')::uuid,
    current_setting('app.request_id', true),
    TG_TABLE_SCHEMA
  );

  RETURN NULL;
END;
$$;

-- Attach audit trigger to privileged tables
CREATE TRIGGER audit_auth_users AFTER INSERT OR UPDATE OR DELETE ON auth.users FOR EACH ROW EXECUTE FUNCTION audit.log_audit_event();
CREATE TRIGGER audit_auth_roles AFTER INSERT OR UPDATE OR DELETE ON auth.roles FOR EACH ROW EXECUTE FUNCTION audit.log_audit_event();
CREATE TRIGGER audit_hostel_allocations AFTER INSERT OR UPDATE OR DELETE ON hostel.allocations FOR EACH ROW EXECUTE FUNCTION audit.log_audit_event();
CREATE TRIGGER audit_exam_final_results AFTER INSERT OR UPDATE OR DELETE ON exam.final_results FOR EACH ROW EXECUTE FUNCTION audit.log_audit_event();
CREATE TRIGGER audit_academic_students AFTER INSERT OR UPDATE OR DELETE ON academic.students FOR EACH ROW EXECUTE FUNCTION audit.log_audit_event();
CREATE TRIGGER audit_academic_faculty AFTER INSERT OR UPDATE OR DELETE ON academic.faculty FOR EACH ROW EXECUTE FUNCTION audit.log_audit_event();

-- ─── 2. Library: Sync Copy Status ─────────────────────────────
CREATE OR REPLACE FUNCTION library.sync_copy_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New issue opened: mark copy as issued
    UPDATE library.book_copies
    SET status = 'issued', updated_at = now()
    WHERE id = NEW.copy_id;

  ELSIF TG_OP = 'UPDATE' AND OLD.returned_at IS NULL AND NEW.returned_at IS NOT NULL THEN
    -- Issue closed (returned): mark copy as available (or reserved if reservation exists)
    IF EXISTS (
      SELECT 1 FROM library.reservations
      WHERE book_id = (SELECT book_id FROM library.book_copies WHERE id = NEW.copy_id)
        AND status = 'active'
      ORDER BY created_at
      LIMIT 1
    ) THEN
      UPDATE library.book_copies SET status = 'reserved', updated_at = now() WHERE id = NEW.copy_id;
    ELSE
      UPDATE library.book_copies SET status = 'available', updated_at = now() WHERE id = NEW.copy_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

CREATE TRIGGER sync_copy_on_issue
  AFTER INSERT OR UPDATE ON library.issues
  FOR EACH ROW EXECUTE FUNCTION library.sync_copy_status();

-- ─── 3. Academic: Validate Lifecycle Transition ───────────────
CREATE OR REPLACE FUNCTION academic.validate_lifecycle_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.lifecycle_state = NEW.lifecycle_state THEN
    RETURN NEW; -- no change
  END IF;

  -- Define allowed transitions
  IF NOT (
    (OLD.lifecycle_state = 'active'    AND NEW.lifecycle_state IN ('suspended','graduated','withdrawn'))
    OR (OLD.lifecycle_state = 'suspended' AND NEW.lifecycle_state IN ('active','withdrawn'))
    OR (OLD.lifecycle_state = 'graduated' AND NEW.lifecycle_state = 'alumni')
  ) THEN
    RAISE EXCEPTION 'INVALID_TRANSITION: % → % not allowed',
      OLD.lifecycle_state, NEW.lifecycle_state
      USING ERRCODE = 'P0010';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER guard_student_lifecycle
  BEFORE UPDATE ON academic.students
  FOR EACH ROW
  WHEN (OLD.lifecycle_state IS DISTINCT FROM NEW.lifecycle_state)
  EXECUTE FUNCTION academic.validate_lifecycle_transition();

-- ─── 4. Full-Text Search Vector Update ────────────────────────
CREATE OR REPLACE FUNCTION library.update_books_search_vector()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    to_tsvector('english',
      coalesce(NEW.title, '') || ' ' ||
      coalesce(NEW.subtitle, '') || ' ' ||
      coalesce((SELECT name FROM library.publishers WHERE id = NEW.publisher_id), '')
    );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_books_search_vector_update
  BEFORE INSERT OR UPDATE ON library.books
  FOR EACH ROW EXECUTE FUNCTION library.update_books_search_vector();
