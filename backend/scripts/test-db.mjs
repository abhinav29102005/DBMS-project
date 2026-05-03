import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const paths = [
    join(__dirname, '..', '.dev.vars'),
    join(process.cwd(), '.dev.vars'),
    join(process.cwd(), 'backend', '.dev.vars')
  ];
  
  for (const path of paths) {
    try {
      const devVars = await readFile(path, 'utf-8');
      for (const line of devVars.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('DATABASE_URL=') && !trimmed.startsWith('#')) {
          return trimmed.split('=').slice(1).join('=').replace(/^["']|["']$/g, '');
        }
      }
    } catch {}
  }
  return null;
}

async function testConnection() {
  console.log('🧪 Testing Database Connection...');
  
  try {
    const url = await getDatabaseUrl();

    if (!url) {
      console.error('❌ DATABASE_URL not found. Ensure you are in the project root or backend folder.');
      return;
    }

    const maskedUrl = url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
    console.log(`🔗 Attempting connection to: ${maskedUrl}`);

    const sql = neon(url);
    const result = await sql`SELECT version()`;
    console.log('✅ Connection Successful!');
    console.log('📊 DB Version:', result[0].version);
  } catch (err) {
    console.error('\n❌ Connection Failed!');
    console.error('👉 Error Name:', err.name);
    console.error('👉 Error Message:', err.message);
    
    if (err.message.includes('authentication failed')) {
      console.error('\n🚨 AUTHENTICATION FAILED');
      console.error('The password in your .dev.vars is still incorrect.');
      console.error('Note: Neon passwords are long. The one you have looks truncated.');
    }
  }
}

testConnection();
