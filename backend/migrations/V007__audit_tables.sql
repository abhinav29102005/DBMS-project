-- ═══════════════════════════════════════════════════════════════
-- V007: Audit Tables
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE audit.audit_logs (
  id            UUID        NOT NULL DEFAULT gen_random_uuid(),
  table_name    TEXT        NOT NULL,
  record_pk     TEXT        NOT NULL,
  operation     TEXT        NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values    JSONB,
  new_values    JSONB,
  changed_by    UUID,
  changed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_id    TEXT,
  source_module TEXT
) PARTITION BY RANGE (changed_at);

CREATE INDEX idx_audit_logs_changed_at ON audit.audit_logs USING BRIN (changed_at);
CREATE INDEX idx_audit_logs_table_pk ON audit.audit_logs (table_name, record_pk);

-- Monthly partitions 2024-2026
CREATE TABLE audit.audit_logs_2024_01 PARTITION OF audit.audit_logs FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE audit.audit_logs_2024_02 PARTITION OF audit.audit_logs FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE audit.audit_logs_2024_03 PARTITION OF audit.audit_logs FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE audit.audit_logs_2024_04 PARTITION OF audit.audit_logs FOR VALUES FROM ('2024-04-01') TO ('2024-05-01');
CREATE TABLE audit.audit_logs_2024_05 PARTITION OF audit.audit_logs FOR VALUES FROM ('2024-05-01') TO ('2024-06-01');
CREATE TABLE audit.audit_logs_2024_06 PARTITION OF audit.audit_logs FOR VALUES FROM ('2024-06-01') TO ('2024-07-01');
CREATE TABLE audit.audit_logs_2024_07 PARTITION OF audit.audit_logs FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');
CREATE TABLE audit.audit_logs_2024_08 PARTITION OF audit.audit_logs FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');
CREATE TABLE audit.audit_logs_2024_09 PARTITION OF audit.audit_logs FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');
CREATE TABLE audit.audit_logs_2024_10 PARTITION OF audit.audit_logs FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');
CREATE TABLE audit.audit_logs_2024_11 PARTITION OF audit.audit_logs FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');
CREATE TABLE audit.audit_logs_2024_12 PARTITION OF audit.audit_logs FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
CREATE TABLE audit.audit_logs_2025_01 PARTITION OF audit.audit_logs FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE audit.audit_logs_2025_02 PARTITION OF audit.audit_logs FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE audit.audit_logs_2025_03 PARTITION OF audit.audit_logs FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE audit.audit_logs_2025_04 PARTITION OF audit.audit_logs FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE audit.audit_logs_2025_05 PARTITION OF audit.audit_logs FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE audit.audit_logs_2025_06 PARTITION OF audit.audit_logs FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE audit.audit_logs_2025_07 PARTITION OF audit.audit_logs FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE audit.audit_logs_2025_08 PARTITION OF audit.audit_logs FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE audit.audit_logs_2025_09 PARTITION OF audit.audit_logs FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE audit.audit_logs_2025_10 PARTITION OF audit.audit_logs FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE audit.audit_logs_2025_11 PARTITION OF audit.audit_logs FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE audit.audit_logs_2025_12 PARTITION OF audit.audit_logs FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
CREATE TABLE audit.audit_logs_2026_01 PARTITION OF audit.audit_logs FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE audit.audit_logs_2026_02 PARTITION OF audit.audit_logs FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE audit.audit_logs_2026_03 PARTITION OF audit.audit_logs FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE audit.audit_logs_2026_04 PARTITION OF audit.audit_logs FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE audit.audit_logs_2026_05 PARTITION OF audit.audit_logs FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE audit.audit_logs_2026_06 PARTITION OF audit.audit_logs FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE audit.audit_logs_2026_07 PARTITION OF audit.audit_logs FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE audit.audit_logs_2026_08 PARTITION OF audit.audit_logs FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE audit.audit_logs_2026_09 PARTITION OF audit.audit_logs FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE audit.audit_logs_2026_10 PARTITION OF audit.audit_logs FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE audit.audit_logs_2026_11 PARTITION OF audit.audit_logs FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE audit.audit_logs_2026_12 PARTITION OF audit.audit_logs FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- Transactional outbox for reliable event publishing
CREATE TABLE audit.outbox (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type TEXT        NOT NULL,
  aggregate_id   UUID        NOT NULL,
  event_type     TEXT        NOT NULL,
  payload        JSONB       NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at   TIMESTAMPTZ
);

CREATE INDEX idx_outbox_unpublished ON audit.outbox (created_at) WHERE published_at IS NULL;
