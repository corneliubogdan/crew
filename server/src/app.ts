import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';
import { config } from './config';
import { authRoutes } from './routes/auth';
import { protectedRoutes, publicRoutes } from './routes/api';

export async function buildApp() {
  const app = Fastify({
    logger: true,
    trustProxy: true,
  });

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true);
        return;
      }
      if (config.corsOrigins.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error('CORS origin not allowed'), false);
    },
    credentials: true,
  });

  await app.register(jwt, {
    secret: config.jwtSecret,
    sign: { expiresIn: '7d' },
  });

  await app.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: '1 minute',
  });

  // Register as functions on this instance so setErrorHandler applies (no encapsulated context).
  await authRoutes(app);
  await publicRoutes(app);
  await protectedRoutes(app);

  app.setErrorHandler((err: unknown, req, reply) => {
    const e = err as {
      statusCode?: number;
      message?: string;
      extra?: Record<string, unknown>;
      needPaywall?: boolean;
    };
    const status = typeof e.statusCode === 'number' ? e.statusCode : 500;
    const payload: Record<string, unknown> = { error: e.message ?? 'error' };
    if (e.extra) Object.assign(payload, e.extra);
    if (e.needPaywall) payload.needPaywall = true;
    if (status >= 500) req.log.error(err);
    return reply.status(status).send(payload);
  });

  return app;
}
