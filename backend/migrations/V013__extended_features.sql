-- UIMS Extended Features: Attendance, Notifications, and Schedules

-- 1. Attendance Tracking
CREATE TABLE "academic"."attendance" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" uuid NOT NULL REFERENCES "academic"."students"("id"),
    "course_offering_id" uuid NOT NULL REFERENCES "academic"."course_offerings"("id"),
    "date" date NOT NULL DEFAULT CURRENT_DATE,
    "status" text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    "remarks" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE("student_id", "course_offering_id", "date")
);

-- 2. System Notifications
CREATE TABLE "core"."notifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "auth"."users"("id"),
    "title" text NOT NULL,
    "message" text NOT NULL,
    "type" text DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    "is_read" boolean DEFAULT false NOT NULL,
    "link" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Weekly Schedules (Simplified slots)
CREATE TABLE "academic"."schedules" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "course_offering_id" uuid NOT NULL REFERENCES "academic"."course_offerings"("id"),
    "day_of_week" smallint NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    "start_time" time NOT NULL,
    "end_time" time NOT NULL,
    "room" text,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE("course_offering_id", "day_of_week", "start_time")
);

-- Indexing for performance
CREATE INDEX "idx_attendance_student" ON "academic"."attendance" ("student_id", "date");
CREATE INDEX "idx_notifications_user" ON "core"."notifications" ("user_id", "is_read");
CREATE INDEX "idx_schedules_offering" ON "academic"."schedules" ("course_offering_id");
