import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  let url = process.env.DATABASE_URL;
  if (!url) {
    const devVars = await readFile(join(__dirname, '..', '.dev.vars'), 'utf-8');
    for (const line of devVars.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DATABASE_URL=') && !trimmed.startsWith('#')) {
        url = trimmed.split('=').slice(1).join('=').replace(/^["']|["']$/g, '');
        break;
      }
    }
  }
  const sql = neon(url);
  const rows = await sql`SELECT * FROM auth.users WHERE email = 'asingh3_be24@thapar.edu'`;
  console.log(rows);
}
main().catch(console.error);
