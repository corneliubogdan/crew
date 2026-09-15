import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';
import { config } from './config';
import { SCHEMA_SQL } from './schema';
import { seed } from './seed';

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 10,
});

export async function query<T extends QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params);
}

export async function withClient<T>(fn: (c: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export async function waitForDb(attempts = 30): Promise<void> {
  let last: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      await pool.query('select 1');
      return;
    } catch (err) {
      last = err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw last;
}

export async function migrateAndSeed(): Promise<void> {
  await pool.query(SCHEMA_SQL);
  await seed();
}
