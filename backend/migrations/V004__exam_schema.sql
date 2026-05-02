CREATE TABLE "exam"."exam_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" text NOT NULL CONSTRAINT "uq_exam_type_code" UNIQUE,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "exam"."exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_offering_id" uuid NOT NULL,
	"exam_type_id" uuid NOT NULL,
	"name" text NOT NULL,
	"max_marks" numeric(6, 2) NOT NULL,
	"weightage_percent" numeric(5, 2) NOT NULL,
	"scheduled_at" timestamp with time zone,
	"duration_minutes" integer,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "exams_max_marks_check" CHECK ((max_marks > (0)::numeric)),
	CONSTRAINT "exams_status_check" CHECK ((status = ANY (ARRAY['scheduled'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text, 'graded'::text]))),
	CONSTRAINT "exams_weightage_percent_check" CHECK (((weightage_percent >= (0)::numeric) AND (weightage_percent <= (100)::numeric)))
);

CREATE TABLE "exam"."final_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_offering_id" uuid NOT NULL UNIQUE,
	"student_id" uuid NOT NULL UNIQUE,
	"total_marks" numeric(6, 2),
	"grade_code" text,
	"grade_points" numeric(4, 2),
	"result_status" text DEFAULT 'pending' NOT NULL,
	"published_at" timestamp with time zone,
	"withheld_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_result" UNIQUE("course_offering_id","student_id"),
	CONSTRAINT "final_results_result_status_check" CHECK ((result_status = ANY (ARRAY['pending'::text, 'pass'::text, 'fail'::text, 'withheld'::text, 'absent'::text])))
);

CREATE TABLE "exam"."grade_scale" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"grade_code" text NOT NULL UNIQUE,
	"grade_name" text,
	"min_marks" numeric(5, 2) NOT NULL,
	"max_marks" numeric(5, 2) NOT NULL,
	"grade_points" numeric(4, 2) NOT NULL,
	"effective_from" date NOT NULL UNIQUE,
	"effective_to" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_grade_code_effective" UNIQUE("grade_code","effective_from"),
	CONSTRAINT "chk_grade_marks" CHECK ((max_marks >= min_marks))
);

CREATE TABLE "exam"."marks" (
	"exam_id" uuid,
	"student_id" uuid,
	"marks_obtained" numeric(6, 2) NOT NULL,
	"graded_by" uuid,
	"graded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"moderated_by" uuid,
	"moderated_at" timestamp with time zone,
	"remarks" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "marks_pkey" PRIMARY KEY("exam_id","student_id"),
	CONSTRAINT "marks_marks_obtained_check" CHECK ((marks_obtained >= (0)::numeric))
);