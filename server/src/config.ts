function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`missing env ${name}`);
  return v;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:8081')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean),
  siteUrl: process.env.SITE_URL ?? 'http://localhost:3000',
  magicLinkTtlMinutes: Number(process.env.MAGIC_LINK_TTL_MINUTES ?? 15),
  freeJoinsPerMonth: 1,
};

export const isDev = config.nodeEnv !== 'production';
