import os

with open('migrations/prev_sql_schema.sql', 'r') as f:
    sql = f.read()

# Create V001
os.makedirs('migrations/new', exist_ok=True)

with open('migrations/new/V001__init_schemas.sql', 'w') as f:
    f.write("\n".join([line for line in sql.split("\n") if line.startswith("CREATE SCHEMA")]))
    f.write("\nCREATE TABLE \"_migrations\" (\n\t\"name\" text PRIMARY KEY,\n\t\"applied_at\" timestamp with time zone DEFAULT now() NOT NULL\n);\n")

# Process the file by statements
# pg_dump statements end with ; and typically are separated by empty lines, or we can just split by ;\n
statements = []
current_stmt = []
for line in sql.split('\n'):
    current_stmt.append(line)
    if line.endswith(';'):
        statements.append('\n'.join(current_stmt))
        current_stmt = []

table_dict = {}
indexes = []
fks = []
views = []
rls = []

for stmt in statements:
    stmt_trim = stmt.strip()
    if stmt_trim.startswith("CREATE TABLE") and "(\n" in stmt_trim:
        # It's a table creation
        # Extract schema: CREATE TABLE "schema"."table"
        parts = stmt_trim.split('"')
        if len(parts) >= 4:
            schema = parts[3]
            if schema not in table_dict:
                table_dict[schema] = []
            table_dict[schema].append(stmt_trim)
    elif stmt_trim.startswith("CREATE INDEX") or stmt_trim.startswith("CREATE UNIQUE INDEX"):
        if "_pkey\" ON" not in stmt_trim and "_qr_code_id_key\" ON" not in stmt_trim:
            indexes.append(stmt_trim)
    elif stmt_trim.startswith("ALTER TABLE") and "ADD CONSTRAINT" in stmt_trim and "FOREIGN KEY" in stmt_trim:
        fks.append(stmt_trim)
    elif stmt_trim.startswith("CREATE VIEW"):
        # Put views in a dict by schema too, or just a list
        if '"reporting"' in stmt_trim:
            if 'reporting' not in table_dict:
                table_dict['reporting'] = []
            table_dict['reporting'].append(stmt_trim)
        else:
            views.append(stmt_trim)
    elif stmt_trim.startswith("ALTER TABLE") and "ENABLE ROW LEVEL SECURITY" in stmt_trim:
        rls.append(stmt_trim)


mapping = {
    'auth': 'V002__auth_schema.sql',
    'academic': 'V003__academic_schema.sql',
    'exam': 'V004__exam_schema.sql',
    'hostel': 'V005__hostel_schema.sql',
    'library': 'V006__library_schema.sql',
    'audit': 'V007__audit_schema.sql',
}

for schema, file_name in mapping.items():
    with open(f'migrations/new/{file_name}', 'w') as f:
        f.write("\n\n".join(table_dict.get(schema, [])))

with open('migrations/new/V008__core_admin_schemas.sql', 'w') as f:
    f.write("""CREATE TABLE "core"."system_settings" (
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
""")

with open('migrations/new/V009__foreign_keys_and_indexes.sql', 'w') as f:
    f.write("\n\n".join(indexes))
    f.write("\n\n")
    f.write("\n\n".join(fks))

with open('migrations/new/V010__views_and_reporting.sql', 'w') as f:
    f.write("\n\n".join(table_dict.get('reporting', [])))
    f.write("\n\n")
    f.write("\n\n".join(views))

with open('migrations/new/V011__rls.sql', 'w') as f:
    f.write("\n\n".join(rls))
