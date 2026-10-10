import { Pool, type QueryResultRow } from 'pg';

/**
 * A single lazily-created connection pool shared across API routes.
 * Next.js hot reloads modules in development, so we cache the pool on the
 * global object to avoid exhausting database connections.
 */
declare global {
  // eslint-disable-next-line no-var
  var __grcShieldPool: Pool | undefined;
}

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool(): Pool {
  if (!hasDatabaseUrl()) {
    throw new Error('DATABASE_URL is not set');
  }
  if (!global.__grcShieldPool) {
    const useSsl =
      process.env.PGSSLMODE === 'require' ||
      /sslmode=require/.test(process.env.DATABASE_URL ?? '');

    global.__grcShieldPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
      ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    });

    global.__grcShieldPool.on('error', (err) => {
      console.error('[db] idle client error', err.message);
    });
  }
  return global.__grcShieldPool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

/**
 * Checks whether the database is reachable so callers can fall back to the
 * in-memory store when Postgres is not provisioned yet.
 */
export async function databaseReachable(): Promise<boolean> {
  if (!hasDatabaseUrl()) return false;
  try {
    await getPool().query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
