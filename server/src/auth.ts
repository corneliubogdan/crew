import { createHash, randomBytes } from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import { unauthorized } from './errors';
import { config } from './config';
import { query } from './db';

export type AuthedUser = {
  id: string;
  email: string;
  name: string;
  handle: string | null;
  city: string;
  bio: string;
  vibe_tags: string[];
  crew_pass: boolean;
  extra_join_credits: number;
};

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function newToken(): string {
  return randomBytes(32).toString('hex');
}

export async function findUserById(id: string): Promise<AuthedUser | null> {
  const { rows } = await query<AuthedUser>(
    `SELECT id, email, name, handle, city, bio, vibe_tags, crew_pass, extra_join_credits
     FROM users WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function requireUser(req: FastifyRequest): Promise<AuthedUser> {
  try {
    await req.jwtVerify();
  } catch {
    throw unauthorized('no session');
  }
  const payload = req.user as { sub?: string };
  if (!payload?.sub) throw unauthorized('no session');
  const user = await findUserById(payload.sub);
  if (!user) throw unauthorized('unknown user');
  return user;
}

export function monthKey(d = new Date()): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}`;
}

export async function canJoin(user: AuthedUser): Promise<boolean> {
  if (user.crew_pass) return true;
  if (user.extra_join_credits > 0) return true;
  const { rows } = await query<{ n: string }>(
    `SELECT COUNT(*)::text AS n FROM join_ledger WHERE user_id = $1 AND month_key = $2`,
    [user.id, monthKey()],
  );
  return Number(rows[0]?.n ?? 0) < config.freeJoinsPerMonth;
}

export async function consumeJoin(user: AuthedUser, crewId: string): Promise<void> {
  if (!user.crew_pass && user.extra_join_credits > 0) {
    await query(`UPDATE users SET extra_join_credits = extra_join_credits - 1 WHERE id = $1`, [user.id]);
  }
  await query(`INSERT INTO join_ledger (user_id, crew_id, month_key) VALUES ($1,$2,$3)`, [
    user.id,
    crewId,
    monthKey(),
  ]);
}

export function publicUser(u: AuthedUser) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    handle: u.handle,
    city: u.city,
    bio: u.bio,
    vibeTags: u.vibe_tags,
    crewPass: u.crew_pass,
    extraJoinCredits: u.extra_join_credits,
  };
}
