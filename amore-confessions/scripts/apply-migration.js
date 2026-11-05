// ============================================================================
// Automated Migration Runner for Supabase PostgreSQL
// ============================================================================

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function run() {
  const arg = process.argv[2];
  let connectionString = process.env.DATABASE_URL;

  if (arg) {
    if (arg.startsWith('postgres://') || arg.startsWith('postgresql://')) {
      connectionString = arg;
    } else {
      // Argument is the database password
      const encodedPassword = encodeURIComponent(arg);
      connectionString = `postgresql://postgres:${encodedPassword}@db.pngpxlzvkndmwgwjpirr.supabase.co:5432/postgres`;
    }
  }

  if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
    console.error('\n[Error] Please provide your Supabase database password:');
    console.error('Usage: node scripts/apply-migration.js <your-supabase-db-password>');
    console.error('Or set DATABASE_URL in your .env.local file.\n');
    process.exit(1);
  }

  console.log('[Migration] Connecting to Supabase PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('[Migration] Connected successfully!');

    const sqlPath = path.join(__dirname, '../backend/database/production_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('[Migration] Applying production schema, constraints, and RLS policies...');
    await client.query(sql);

    console.log('\n============================================================');
    console.log(' SUCCESS: Database tables and RLS policies created!');
    console.log(' - confessions table with branch column & constraints');
    console.log(' - admin_profiles table');
    console.log(' - moderation_logs table');
    console.log(' - Row Level Security (RLS) policies configured');
    console.log(' - PostgREST schema cache reloaded');
    console.log('============================================================\n');
  } catch (err) {
    console.error('[Migration Error]:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
