-- UIMS Core Features: Support Tickets, Campus Events, and Facility Requests

-- 1. Support Tickets
CREATE TABLE "core"."support_tickets" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "student_id" uuid REFERENCES "academic"."students"("id"),
    "faculty_id" uuid REFERENCES "academic"."faculty"("id"),
    "title" text NOT NULL,
    "description" text NOT NULL,
    "category" text NOT NULL CHECK (category IN ('IT Support', 'Academic', 'Maintenance', 'Hostel', 'Other')),
    "status" text DEFAULT 'open' NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    "priority" text DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    "assigned_to" uuid REFERENCES "auth"."users"("id"),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Campus Events
CREATE TABLE "core"."campus_events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "description" text,
    "location" text,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "organizer" text,
    "category" text NOT NULL CHECK (category IN ('Academic', 'Social', 'Workshop', 'Sports', 'Other')),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Facility Requests
CREATE TABLE "core"."facility_requests" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "facility_name" text NOT NULL,
    "requester_id" uuid NOT NULL REFERENCES "auth"."users"("id"),
    "request_date" date NOT NULL DEFAULT CURRENT_DATE,
    "purpose" text,
    "status" text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Indexing
CREATE INDEX "idx_tickets_status" ON "core"."support_tickets" ("status");
CREATE INDEX "idx_events_time" ON "core"."campus_events" ("start_time");
CREATE INDEX "idx_facility_status" ON "core"."facility_requests" ("status");
