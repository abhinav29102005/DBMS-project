import fs from 'fs';
import path from 'path';

const sql = fs.readFileSync('migrations/prev_sql_schema.sql', 'utf8');

const migrationsDir = path.join('migrations', 'new');
if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
}

let v001 = sql.split('\n').filter(l => l.startsWith('CREATE SCHEMA')).join('\n');
v001 += `\nCREATE TABLE "_migrations" (\n\t"name" text PRIMARY KEY,\n\t"applied_at" timestamp with time zone DEFAULT now() NOT NULL\n);\n`;
fs.writeFileSync(path.join(migrationsDir, 'V001__init_schemas.sql'), v001);

const statements = [];
let currentStmt = [];
for (const line of sql.split('\n')) {
    currentStmt.push(line);
    if (line.trim().endsWith(';')) {
        statements.push(currentStmt.join('\n'));
        currentStmt = [];
    }
}

const tableDict = {};
const indexes = [];
const fks = [];
const views = [];
const rls = [];

for (const stmt of statements) {
    const stmtTrim = stmt.trim();
    if (stmtTrim.startsWith('CREATE TABLE') && stmtTrim.includes('(\n')) {
        const parts = stmtTrim.split('"');
        if (parts.length >= 4) {
            const schema = parts[1];
            if (!tableDict[schema]) tableDict[schema] = [];
            tableDict[schema].push(stmtTrim);
        }
    } else if (stmtTrim.startsWith('CREATE INDEX') || stmtTrim.startsWith('CREATE UNIQUE INDEX')) {
        if (!stmtTrim.includes('_pkey" ON') && !stmtTrim.includes('_qr_code_id_key" ON')) {
            indexes.push(stmtTrim);
        }
    } else if (stmtTrim.startsWith('ALTER TABLE') && stmtTrim.includes('ADD CONSTRAINT') && stmtTrim.includes('FOREIGN KEY')) {
        fks.push(stmtTrim);
    } else if (stmtTrim.startsWith('CREATE VIEW')) {
        if (stmtTrim.includes('"reporting"')) {
            if (!tableDict['reporting']) tableDict['reporting'] = [];
            tableDict['reporting'].push(stmtTrim);
        } else {
            views.push(stmtTrim);
        }
    } else if (stmtTrim.startsWith('ALTER TABLE') && stmtTrim.includes('ENABLE ROW LEVEL SECURITY')) {
        rls.push(stmtTrim);
    }
}

const mapping = {
    'auth': 'V002__auth_schema.sql',
    'academic': 'V003__academic_schema.sql',
    'exam': 'V004__exam_schema.sql',
    'hostel': 'V005__hostel_schema.sql',
    'library': 'V006__library_schema.sql',
    'audit': 'V007__audit_schema.sql',
};

for (const [schema, fileName] of Object.entries(mapping)) {
    fs.writeFileSync(path.join(migrationsDir, fileName), (tableDict[schema] || []).join('\n\n'));
}

fs.writeFileSync(path.join(migrationsDir, 'V008__core_admin_schemas.sql'), `CREATE TABLE "core"."system_settings" (
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
`);

fs.writeFileSync(path.join(migrationsDir, 'V009__foreign_keys_and_indexes.sql'), indexes.join('\n\n') + '\n\n' + fks.join('\n\n'));

fs.writeFileSync(path.join(migrationsDir, 'V010__views_and_reporting.sql'), (tableDict['reporting'] || []).join('\n\n') + '\n\n' + views.join('\n\n'));

fs.writeFileSync(path.join(migrationsDir, 'V011__rls.sql'), rls.join('\n\n'));

console.log('Successfully split schemas');
