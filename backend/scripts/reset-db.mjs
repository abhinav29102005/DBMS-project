import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getDatabaseUrl() {
  if (process.env.DATABASE_DIRECT_URL) return process.env.DATABASE_DIRECT_URL;
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
  throw new Error('No DATABASE_URL found');
}

async function main() {
  const url = await getDatabaseUrl();
  console.log('🔌 Connecting to Neon for DB reset...');
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('🗑️ Dropping schemas (CASCADE)...');
  await client.query(`
    DROP SCHEMA IF EXISTS auth CASCADE;
    DROP SCHEMA IF EXISTS academic CASCADE;
    DROP SCHEMA IF EXISTS hostel CASCADE;
    DROP SCHEMA IF EXISTS library CASCADE;
    DROP SCHEMA IF EXISTS exam CASCADE;
    DROP SCHEMA IF EXISTS audit CASCADE;
    DROP SCHEMA IF EXISTS admin CASCADE;
    DROP SCHEMA IF EXISTS core CASCADE;
    DROP SCHEMA IF EXISTS reporting CASCADE;
    DROP TABLE IF EXISTS public._migrations;
  `);

  console.log('✅ Database wiped clean.');
  await client.end();
}

main().catch(console.error);
