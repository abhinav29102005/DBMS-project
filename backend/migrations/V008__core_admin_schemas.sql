CREATE TABLE "core"."system_settings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "setting_key" text NOT NULL UNIQUE,
    "setting_value" text NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "admin"."action_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "action" text NOT NULL,
    "user_id" uuid,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
