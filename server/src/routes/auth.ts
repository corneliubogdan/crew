import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { config, isDev } from '../config';
import { query } from '../db';
import { hashToken, newToken, publicUser, findUserById } from '../auth';
import { badRequest, unauthorized } from '../errors';

const emailSchema = z.object({
  email: z.string().email().max(200).transform((e) => e.trim().toLowerCase()),
});

export async function authRoutes(app: FastifyInstance) {
  app.post(
    '/auth/magic-link',
    {
      config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    },
    async (req) => {
      const parsed = emailSchema.safeParse(req.body);
      if (!parsed.success) throw badRequest('need a valid email');
      const { email } = parsed.data;
      const token = newToken();
      const tokenHash = hashToken(token);
      const expires = new Date(Date.now() + config.magicLinkTtlMinutes * 60 * 1000);

      await query(
        `INSERT INTO users (email, name, handle, city)
         VALUES ($1, $2, $3, 'Bucharest')
         ON CONFLICT (email) DO NOTHING`,
        [email, email.split('@')[0], email.split('@')[0]],
      );

      await query(`DELETE FROM magic_links WHERE email = $1 AND used_at IS NULL`, [email]);
      await query(`INSERT INTO magic_links (email, token_hash, expires_at) VALUES ($1,$2,$3)`, [
        email,
        tokenHash,
        expires,
      ]);

      const verifyUrl = `${config.siteUrl}/auth/verify?token=${token}`;
      // TODO: send email in production. v1 logs/returns the link in development only.
      if (isDev) {
        req.log.info({ email, verifyUrl }, 'magic link (dev)');
        return { ok: true, token, verifyUrl };
      }
      return { ok: true };
    },
  );

  app.post(
    '/auth/verify',
    {
      config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    },
    async (req) => {
      const parsed = z.object({ token: z.string().min(16) }).safeParse(req.body);
      if (!parsed.success) throw badRequest('need token');
      const tokenHash = hashToken(parsed.data.token);
      const { rows } = await query<{ id: string; email: string }>(
        `SELECT id, email FROM magic_links
         WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now()
         LIMIT 1`,
        [tokenHash],
      );
      const link = rows[0];
      if (!link) throw unauthorized('invalid or expired link');

      await query(`UPDATE magic_links SET used_at = now() WHERE id = $1`, [link.id]);
      const userRow = await query<{ id: string }>(`SELECT id FROM users WHERE email = $1`, [link.email]);
      const userId = userRow.rows[0]?.id;
      if (!userId) throw unauthorized('user missing');

      const token = await app.jwt.sign({ sub: userId, email: link.email });
      const user = await findUserById(userId);
      return { token, user: user ? publicUser(user) : null };
    },
  );
}
