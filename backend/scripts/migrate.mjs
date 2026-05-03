#!/usr/bin/env node
/**
 * UIMS — Database Migration Runner
 * 
 * Runs all V*.sql files in order against the Neon database.
 * Uses the DIRECT (non-pooled) connection URL.
 * 
 * Usage: node scripts/migrate.mjs
 */

import { readdir, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '..', 'migrations');

async function getDatabaseUrl() {
  // Check env vars first
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.DATABASE_DIRECT_URL) return process.env.DATABASE_DIRECT_URL;

  try {
    const devVars = await readFile(join(__dirname, '..', '.dev.vars'), 'utf-8');
    const vars = {};
    for (const line of devVars.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        vars[key] = rest.join('=').replace(/^["']|["']$/g, '');
      }
    }
    // Prioritize DATABASE_URL (pooled) since it's confirmed working
    return vars.DATABASE_URL || vars.DATABASE_DIRECT_URL;
  } catch {}
  throw new Error('No DATABASE_URL found in environment or .dev.vars');
}

async function main() {
  const url = await getDatabaseUrl();
  const maskedUrl = url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
  console.log(`🔌 Connecting to: ${maskedUrl}`);
  
  const client = new pg.Client({ 
    connectionString: url, 
    ssl: { rejectUnauthorized: false } 
  });

  try {
    await client.connect();
    console.log('✅ Connected\n');
  } catch (err) {
    console.error('\n❌ Connection Failed!');
    if (err.code === '28P01') {
      console.error('👉 Error: Password authentication failed.');
      console.error('👉 Tip: Check if the password in your .dev.vars is complete and correct.');
    } else {
      console.error(`👉 Error: ${err.message}`);
    }
    process.exit(1);
  }

  // Create migration tracking table
  await client.query(`
    CREATE TABLE IF NOT EXISTS public._migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  // Get already-applied migrations
  const { rows: applied } = await client.query('SELECT name FROM public._migrations ORDER BY name');
  const appliedSet = new Set(applied.map(r => r.name));

  // Read migration files
  const files = (await readdir(MIGRATIONS_DIR))
    .filter(f => f.endsWith('.sql'))
    .sort();

  let ran = 0;
  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`⏭️  ${file} (already applied)`);
      continue;
    }

    const migrationSql = await readFile(join(MIGRATIONS_DIR, file), 'utf-8');
    console.log(`▶️  Running ${file}...`);

    try {
      await client.query('BEGIN');
      await client.query(migrationSql);
      await client.query('INSERT INTO public._migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`✅ ${file} applied`);
      ran++;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`❌ ${file} FAILED:`, err.message);
      process.exit(1);
    }
  }

  if (ran === 0) {
    console.log('\n📋 All migrations already applied.');
  } else {
    console.log(`\n🎉 Applied ${ran} migration(s) successfully.`);
  }

  await client.end();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
