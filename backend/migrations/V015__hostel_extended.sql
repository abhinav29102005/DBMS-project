-- UIMS Hostel Extended: Complaints and Outpasses

-- 1. Complaints
CREATE TABLE "hostel"."complaints" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" uuid NOT NULL REFERENCES "academic"."students"("id"),
    "room_id" uuid REFERENCES "hostel"."rooms"("id"),
    "category" text NOT NULL CHECK (category IN ('Cleaning', 'Electrical', 'Plumbing', 'Internet', 'Furniture', 'Other')),
    "description" text NOT NULL,
    "status" text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    "priority" text DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Outpass Requests
CREATE TABLE "hostel"."outpasses" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" uuid NOT NULL REFERENCES "academic"."students"("id"),
    "reason" text NOT NULL,
    "destination" text NOT NULL,
    "out_time" timestamp with time zone NOT NULL,
    "in_time" timestamp with time zone NOT NULL,
    "status" text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    "approved_by" uuid REFERENCES "auth"."users"("id"),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexing
CREATE INDEX "idx_complaints_student" ON "hostel"."complaints" ("student_id");
CREATE INDEX "idx_outpasses_student" ON "hostel"."outpasses" ("student_id");
CREATE INDEX "idx_outpasses_status" ON "hostel"."outpasses" ("status");
