CREATE TABLE "audit"."audit_logs" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2024_01" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2024_02" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2024_03" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2024_04" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2024_05" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2024_06" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2024_07" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2024_08" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2024_09" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2024_10" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2024_11" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2024_12" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2025_01" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2025_02" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2025_03" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2025_04" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2025_05" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2025_06" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2025_07" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2025_08" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2025_09" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2025_10" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2025_11" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2025_12" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2026_01" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2026_02" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2026_03" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2026_04" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2026_05" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2026_06" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2026_07" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2026_08" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2026_09" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2026_10" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2026_11" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."audit_logs_2026_12" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"table_name" text NOT NULL,
	"record_pk" text NOT NULL,
	"operation" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changed_by" uuid,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_id" text,
	"source_module" text,
	CONSTRAINT "audit_logs_operation_check" CHECK ((operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);

CREATE TABLE "audit"."outbox" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"aggregate_type" text NOT NULL,
	"aggregate_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);