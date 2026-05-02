CREATE TABLE "academic"."course_offerings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_id" uuid NOT NULL,
	"semester_id" uuid NOT NULL,
	"section_code" text DEFAULT 'A' NOT NULL,
	"primary_faculty_id" uuid,
	"capacity" integer NOT NULL,
	"enrollment_count" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_offering" UNIQUE("course_id","semester_id","section_code"),
	CONSTRAINT "course_offerings_capacity_check" CHECK ((capacity > 0)),
	CONSTRAINT "course_offerings_enrollment_count_check" CHECK ((enrollment_count >= 0)),
	CONSTRAINT "course_offerings_status_check" CHECK ((status = ANY (ARRAY['scheduled'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text])))
);

CREATE TABLE "academic"."courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"course_code" text NOT NULL CONSTRAINT "uq_course_code" UNIQUE,
	"title" text NOT NULL,
	"description" text,
	"credits" smallint NOT NULL,
	"department_id" uuid NOT NULL,
	"course_type" text DEFAULT 'core' NOT NULL,
	"prerequisite_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "courses_course_type_check" CHECK ((course_type = ANY (ARRAY['core'::text, 'elective'::text, 'lab'::text, 'project'::text, 'seminar'::text]))),
	CONSTRAINT "courses_credits_check" CHECK (((credits >= 1) AND (credits <= 12)))
);

CREATE TABLE "academic"."departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" text NOT NULL CONSTRAINT "uq_dept_code" UNIQUE,
	"name" text NOT NULL,
	"established_year" smallint,
	"head_faculty_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);

CREATE TABLE "academic"."enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"student_id" uuid NOT NULL,
	"course_offering_id" uuid NOT NULL,
	"enrollment_status" text DEFAULT 'enrolled' NOT NULL,
	"registered_at" timestamp with time zone DEFAULT now() NOT NULL,
	"withdrawn_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_enrollment" UNIQUE("student_id","course_offering_id"),
	CONSTRAINT "enrollments_enrollment_status_check" CHECK ((enrollment_status = ANY (ARRAY['enrolled'::text, 'withdrawn'::text, 'completed'::text, 'failed'::text])))
);

CREATE TABLE "academic"."faculty" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"employee_no" text NOT NULL CONSTRAINT "uq_employee_no" UNIQUE,
	"department_id" uuid NOT NULL,
	"designation" text NOT NULL,
	"specialization" text,
	"employment_state" text DEFAULT 'active' NOT NULL,
	"joined_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "faculty_designation_check" CHECK ((designation = ANY (ARRAY['Professor'::text, 'Associate Professor'::text, 'Assistant Professor'::text, 'Lecturer'::text, 'Visiting Faculty'::text, 'Adjunct Faculty'::text]))),
	CONSTRAINT "faculty_employment_state_check" CHECK ((employment_state = ANY (ARRAY['active'::text, 'on_leave'::text, 'retired'::text, 'terminated'::text])))
);

CREATE TABLE "academic"."programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"department_id" uuid NOT NULL,
	"code" text NOT NULL CONSTRAINT "uq_program_code" UNIQUE,
	"name" text NOT NULL,
	"degree_type" text NOT NULL,
	"duration_semesters" smallint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "programs_degree_type_check" CHECK ((degree_type = ANY (ARRAY['BTech'::text, 'MTech'::text, 'PhD'::text, 'BSc'::text, 'MSc'::text, 'MBA'::text, 'BBA'::text]))),
	CONSTRAINT "programs_duration_semesters_check" CHECK (((duration_semesters >= 1) AND (duration_semesters <= 16)))
);

CREATE TABLE "academic"."semesters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"code" text NOT NULL CONSTRAINT "uq_semester_code" UNIQUE,
	"name" text NOT NULL,
	"academic_year" smallint NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_semester_dates" CHECK ((end_date > start_date))
);

CREATE TABLE "academic"."students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"student_no" text NOT NULL CONSTRAINT "uq_student_no" UNIQUE,
	"department_id" uuid NOT NULL,
	"program_id" uuid NOT NULL,
	"admission_year" smallint NOT NULL,
	"current_semester" smallint NOT NULL,
	"lifecycle_state" text DEFAULT 'active' NOT NULL,
	"advisor_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"version" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "students_admission_year_check" CHECK (((admission_year >= 2000) AND (admission_year <= 2100))),
	CONSTRAINT "students_current_semester_check" CHECK (((current_semester >= 1) AND (current_semester <= 12))),
	CONSTRAINT "students_lifecycle_state_check" CHECK ((lifecycle_state = ANY (ARRAY['active'::text, 'graduated'::text, 'suspended'::text, 'withdrawn'::text, 'alumni'::text])))
);