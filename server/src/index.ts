import { buildApp } from './app';
import { config } from './config';
import { migrateAndSeed, pool, waitForDb } from './db';

async function main() {
  await waitForDb();
  await migrateAndSeed();
  const app = await buildApp();
  await app.listen({ port: config.port, host: '0.0.0.0' });
}

main().catch(async (err) => {
  console.error(err);
  await pool.end().catch(() => undefined);
  process.exit(1);
});
