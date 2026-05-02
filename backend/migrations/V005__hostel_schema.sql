CREATE TABLE "hostel"."hostels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"code" text NOT NULL CONSTRAINT "uq_hostel_code" UNIQUE,
	"gender_type" text NOT NULL,
	"address" text,
	"warden_user_id" uuid,
	"total_capacity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "hostels_gender_type_check" CHECK ((gender_type = ANY (ARRAY['male'::text, 'female'::text, 'mixed'::text]))),
	CONSTRAINT "hostels_total_capacity_check" CHECK ((total_capacity >= 0))
);

CREATE TABLE "hostel"."blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"hostel_id" uuid NOT NULL,
	"name" text NOT NULL,
	"floor_count" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_block_hostel" UNIQUE("hostel_id","name"),
	CONSTRAINT "blocks_floor_count_check" CHECK ((floor_count > 0))
);

CREATE TABLE "hostel"."rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"block_id" uuid NOT NULL,
	"room_no" text NOT NULL,
	"floor_no" smallint NOT NULL,
	"capacity" smallint NOT NULL,
	"room_type" text DEFAULT 'regular' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"qr_code_id" uuid DEFAULT gen_random_uuid() CONSTRAINT "rooms_qr_code_id_key" UNIQUE,
	CONSTRAINT "uq_room_block" UNIQUE("block_id","room_no"),
	CONSTRAINT "rooms_capacity_check" CHECK ((capacity > 0)),
	CONSTRAINT "rooms_floor_no_check" CHECK ((floor_no >= 0)),
	CONSTRAINT "rooms_room_type_check" CHECK ((room_type = ANY (ARRAY['regular'::text, 'ac'::text, 'suite'::text, 'accessible'::text])))
);

CREATE TABLE "hostel"."beds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"room_id" uuid NOT NULL,
	"bed_label" text NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"qr_code_id" uuid DEFAULT gen_random_uuid() CONSTRAINT "beds_qr_code_id_key" UNIQUE,
	CONSTRAINT "uq_bed_room" UNIQUE("room_id","bed_label"),
	CONSTRAINT "beds_status_check" CHECK ((status = ANY (ARRAY['available'::text, 'occupied'::text, 'maintenance'::text, 'reserved'::text])))
);

CREATE TABLE "hostel"."allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"student_id" uuid NOT NULL,
	"bed_id" uuid NOT NULL,
	"allocated_from" timestamp with time zone DEFAULT now() NOT NULL,
	"allocated_to" timestamp with time zone,
	"status" text DEFAULT 'active' NOT NULL,
	"idempotency_key" text,
	"allocated_by" uuid,
	"vacated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "allocations_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'vacated'::text, 'transferred'::text, 'expired'::text]))),
	CONSTRAINT "chk_alloc_dates" CHECK (((allocated_to IS NULL) OR (allocated_to > allocated_from)))
);

CREATE TABLE "hostel"."waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"student_id" uuid NOT NULL,
	"hostel_id" uuid NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"preferences" jsonb,
	"status" text DEFAULT 'waiting' NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "waitlist_status_check" CHECK ((status = ANY (ARRAY['waiting'::text, 'offered'::text, 'accepted'::text, 'declined'::text, 'expired'::text, 'cancelled'::text])))
);