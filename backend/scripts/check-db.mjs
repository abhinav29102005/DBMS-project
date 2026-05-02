import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const devVars = await readFile(join(__dirname, '..', '.dev.vars'), 'utf-8');
    for (const line of devVars.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DATABASE_URL=') && !trimmed.startsWith('#')) {
        return trimmed.split('=').slice(1).join('=');
      }
    }
  } catch {}
  return null;
}

async function check() {
  const url = await getDatabaseUrl();
  if (!url) {
    console.error('❌ No DATABASE_URL found');
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('🔍 Checking Database State...\n');

  // 1. Check Schemas
  const schemasRes = await client.query(`
    SELECT schema_name FROM information_schema.schemata 
    WHERE schema_name IN ('auth', 'academic', 'hostel', 'library', 'exam', 'audit', 'core', 'reporting')
  `);
  console.log('📂 Schemas Found:', schemasRes.rows.map(r => r.schema_name).join(', '));

  // 2. Check Students (The three specific ones)
  const studentsRes = await client.query(`
    SELECT s.student_no, u.first_name, u.last_name 
    FROM academic.students s 
    JOIN auth.users u ON s.user_id = u.id
    WHERE s.student_no IN ('1024030439', '1024030467', '1024030440')
  `);
  console.log('\n🧑‍🎓 Verified Students in DB:');
  studentsRes.rows.forEach(s => console.log(` - ${s.first_name} ${s.last_name} (${s.student_no})`));

  // 3. Check Table Counts to ensure no empty modules
  const counts = [
    ['auth.users', 'Users'],
    ['academic.departments', 'Departments'],
    ['academic.courses', 'Courses'],
    ['hostel.hostels', 'Hostels'],
    ['library.books', 'Books'],
    ['exam.exams', 'Exams'],
    ['core.system_settings', 'Core Settings']
  ];

  console.log('\n📊 Module Connectivity Check (Row Counts):');
  for (const [table, label] of counts) {
    try {
      const res = await client.query(`SELECT count(*) FROM ${table}`);
      console.log(` - ${label}: ${res.rows[0].count}`);
    } catch (e) {
      console.log(` - ${label}: ❌ ERROR (${e.message})`);
    }
  }

  await client.end();
}

check().catch(console.error);
