#!/usr/bin/env node
// Applies db/schema.sql to the database in DATABASE_URL. Idempotent.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Copy .env.example to .env or export it first.');
  process.exit(1);
}

const sql = await readFile(schemaPath, 'utf8');
const client = new pg.Client({
  connectionString,
  ...(/sslmode=require/.test(connectionString) ? { ssl: { rejectUnauthorized: false } } : {}),
});

try {
  await client.connect();
  await client.query(sql);
  console.log('Schema applied successfully.');
} catch (err) {
  console.error('Migration failed:', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
