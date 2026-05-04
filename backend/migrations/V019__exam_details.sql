-- Add venue details to exams
ALTER TABLE "exam"."exams" ADD COLUMN "venue" text;
ALTER TABLE "exam"."exams" ADD COLUMN "room_no" text;

-- Create table for student seat assignments
CREATE TABLE "exam"."student_exam_details" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"exam_id" uuid NOT NULL REFERENCES "exam"."exams"("id"),
	"student_id" uuid NOT NULL REFERENCES "academic"."students"("id"),
	"seat_no" text NOT NULL,
	"attendance_status" text DEFAULT 'absent' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_student_exam" UNIQUE("exam_id", "student_id")
);
