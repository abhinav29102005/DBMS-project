CREATE TABLE "library"."authors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"bio" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "library"."book_authors" (
	"book_id" uuid,
	"author_id" uuid,
	"ordinal" smallint DEFAULT 1 NOT NULL,
	CONSTRAINT "book_authors_pkey" PRIMARY KEY("book_id","author_id")
);

CREATE TABLE "library"."book_copies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"book_id" uuid NOT NULL,
	"barcode" text NOT NULL CONSTRAINT "uq_barcode" UNIQUE,
	"acquisition_date" date,
	"price" numeric(10, 2),
	"status" text DEFAULT 'available' NOT NULL,
	"shelf_location" text,
	"condition_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"qr_code_id" uuid DEFAULT gen_random_uuid() CONSTRAINT "book_copies_qr_code_id_key" UNIQUE,
	CONSTRAINT "book_copies_status_check" CHECK ((status = ANY (ARRAY['available'::text, 'issued'::text, 'reserved'::text, 'lost'::text, 'damaged'::text, 'withdrawn'::text])))
);

CREATE TABLE "library"."books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"isbn" text NOT NULL CONSTRAINT "uq_isbn" UNIQUE,
	"title" text NOT NULL,
	"subtitle" text,
	"author" text,
	"publisher" text,
	"edition" smallint DEFAULT 1,
	"publisher_id" uuid,
	"publication_year" smallint,
	"language_code" text DEFAULT 'en' NOT NULL,
	"subject_id" uuid,
	"page_count" integer,
	"search_vector" tsvector,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);

CREATE TABLE "library"."fines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"issue_id" uuid NOT NULL,
	"member_user_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"reason" text DEFAULT 'overdue' NOT NULL,
	"assessed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"settled_at" timestamp with time zone,
	"settled_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fines_amount_check" CHECK ((amount > (0)::numeric)),
	CONSTRAINT "fines_reason_check" CHECK ((reason = ANY (ARRAY['overdue'::text, 'lost'::text, 'damaged'::text, 'other'::text])))
);

CREATE TABLE "library"."issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"copy_id" uuid NOT NULL,
	"member_user_id" uuid NOT NULL,
	"issued_by" uuid NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"returned_at" timestamp with time zone,
	"return_received_by" uuid,
	"renewal_count" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_due_after_issue" CHECK ((due_at > issued_at))
);

CREATE TABLE "library"."publishers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "library"."reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"book_id" uuid NOT NULL,
	"member_user_id" uuid NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"fulfilled_at" timestamp with time zone,
	"expired_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'fulfilled'::text, 'expired'::text, 'cancelled'::text])))
);

CREATE TABLE "library"."subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"code" text NOT NULL CONSTRAINT "uq_subject_code" UNIQUE,
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);