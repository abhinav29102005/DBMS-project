import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getDatabaseUrl() {
  try {
    const devVars = await readFile(join(__dirname, '..', 'backend', '.dev.vars'), 'utf-8');
    for (const line of devVars.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DATABASE_URL=') && !trimmed.startsWith('#')) {
        return trimmed.split('=').slice(1).join('=');
      }
    }
  } catch {}
  return process.env.DATABASE_URL;
}

async function main() {
  const url = await getDatabaseUrl();
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query('SELECT email, first_name, last_name FROM auth.users');
  console.log('Users in DB:', res.rows);
  await client.end();
}

main().catch(console.error);
