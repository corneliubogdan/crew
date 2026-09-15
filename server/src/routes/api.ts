import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { listUpcoming } from '../providers/events';
import { query } from '../db';
import { canJoin, consumeJoin, findUserById, publicUser, requireUser } from '../auth';
import { badRequest, forbidden, notFound } from '../errors';

function eventJson(row: {
  id: string;
  title: string;
  venue: string;
  neighborhood: string;
  starts_at: Date;
  ends_at: Date | null;
  description: string;
  vibe_tags: string[];
  source: string;
  source_url: string;
  ticket_url: string;
  accent: string;
  city: string;
}) {
  return {
    id: row.id,
    title: row.title,
    venue: row.venue,
    neighborhood: row.neighborhood,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    description: row.description,
    vibeTags: row.vibe_tags,
    source: row.source,
    sourceUrl: row.source_url,
    ticketUrl: row.ticket_url,
    accent: row.accent,
    city: row.city,
  };
}

async function crewJson(crewId: string) {
  const { rows: crews } = await query<{
    id: string;
    event_id: string;
    name: string;
    prompt: string;
    meetup_spot: string;
    capacity: number;
    is_open: boolean;
  }>(`SELECT * FROM crews WHERE id = $1`, [crewId]);
  const crew = crews[0];
  if (!crew) return null;
  const { rows: members } = await query<{
    user_id: string;
    ticket_status: string;
    is_host: boolean;
    here: boolean;
    name: string;
    handle: string | null;
  }>(
    `SELECT m.user_id, m.ticket_status, m.is_host, m.here, u.name, u.handle
     FROM crew_members m JOIN users u ON u.id = m.user_id
     WHERE m.crew_id = $1
     ORDER BY m.is_host DESC, m.joined_at ASC`,
    [crewId],
  );
  return {
    id: crew.id,
    eventId: crew.event_id,
    name: crew.name,
    prompt: crew.prompt,
    meetupSpot: crew.meetup_spot,
    capacity: crew.capacity,
    isOpen: crew.is_open && members.length < crew.capacity,
    members: members.map((m) => ({
      userId: m.user_id,
      name: m.name,
      handle: m.handle,
      ticketStatus: m.ticket_status,
      isHost: m.is_host,
      here: m.here,
    })),
  };
}

export async function publicRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ ok: true, service: 'crew-api' }));

  app.get('/events', async (req) => {
    const city = typeof req.query === 'object' && req.query && 'city' in req.query
      ? String((req.query as { city?: string }).city ?? 'Bucharest')
      : 'Bucharest';
    const rows = await listUpcoming(city);
    return { events: rows.map(eventJson) };
  });

  app.get('/crews', async (req) => {
    const eventId =
      typeof req.query === 'object' && req.query && 'eventId' in req.query
        ? String((req.query as { eventId?: string }).eventId ?? '')
        : '';
    const { rows } = await query<{ id: string }>(
      eventId
        ? `SELECT id FROM crews WHERE event_id = $1 ORDER BY created_at ASC`
        : `SELECT id FROM crews ORDER BY created_at ASC`,
      eventId ? [eventId] : [],
    );
    const crews = [];
    for (const row of rows) {
      const c = await crewJson(row.id);
      if (c) crews.push(c);
    }
    return { crews };
  });
}

export async function protectedRoutes(app: FastifyInstance) {
  app.get('/crews/:id', async (req) => {
    const { id } = req.params as { id: string };
    const crew = await crewJson(id);
    if (!crew) throw notFound('crew vanished');
    return { crew };
  });

  app.post(
    '/crews',
    { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } },
    async (req) => {
      const user = await requireUser(req);
      const parsed = z
        .object({
          eventId: z.string().min(1),
          name: z.string().min(1).max(80),
          prompt: z.string().max(280).optional(),
          meetupSpot: z.string().max(200).optional(),
          capacity: z.number().int().min(3).max(8).optional(),
        })
        .safeParse(req.body);
      if (!parsed.success) throw badRequest('invalid crew');

      const event = await query(`SELECT id FROM events WHERE id = $1`, [parsed.data.eventId]);
      if (!event.rowCount) throw notFound('event gone');

      const existing = await query<{ crew_id: string }>(
        `SELECT m.crew_id FROM crew_members m JOIN crews c ON c.id = m.crew_id
         WHERE m.user_id = $1 AND c.event_id = $2`,
        [user.id, parsed.data.eventId],
      );
      if (existing.rows[0]) {
        return { crew: await crewJson(existing.rows[0].crew_id) };
      }

      if (!(await canJoin(user))) {
        throw forbidden('free join is used up this month', { needPaywall: true });
      }

      const capacity = parsed.data.capacity ?? 5;
      const { rows } = await query<{ id: string }>(
        `INSERT INTO crews (event_id, name, prompt, meetup_spot, capacity, created_by)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
        [
          parsed.data.eventId,
          parsed.data.name.trim(),
          parsed.data.prompt?.trim() ?? 'small group, no mixer energy',
          parsed.data.meetupSpot?.trim() ?? 'lobby, 15 min early',
          capacity,
          user.id,
        ],
      );
      const crewId = rows[0].id;
      await query(
        `INSERT INTO crew_members (crew_id, user_id, ticket_status, is_host) VALUES ($1,$2,'idk',TRUE)`,
        [crewId, user.id],
      );
      await consumeJoin(user, crewId);
      return { crew: await crewJson(crewId) };
    },
  );

  app.post(
    '/crews/:id/join',
    { config: { rateLimit: { max: 20, timeWindow: '1 minute' } } },
    async (req) => {
      const user = await requireUser(req);
      const { id } = req.params as { id: string };
      const crew = await crewJson(id);
      if (!crew) throw notFound('crew vanished');
      if (crew.members.some((m) => m.userId === user.id)) return { crew };

      if (crew.members.length >= crew.capacity || !crew.isOpen) {
        throw forbidden('that crew is full');
      }
      if (!(await canJoin(user))) {
        throw forbidden('free join is used up this month', { needPaywall: true });
      }

      await query(
        `INSERT INTO crew_members (crew_id, user_id, ticket_status, is_host) VALUES ($1,$2,'idk',FALSE)`,
        [id, user.id],
      );
      await consumeJoin(user, id);
      const next = await crewJson(id);
      if (next && next.members.length >= next.capacity) {
        await query(`UPDATE crews SET is_open = FALSE WHERE id = $1`, [id]);
      }
      return { crew: await crewJson(id) };
    },
  );

  app.get('/crews/:id/messages', async (req) => {
    await requireUser(req);
    const { id } = req.params as { id: string };
    const { rows } = await query<{
      id: string;
      user_id: string;
      text: string;
      created_at: Date;
      name: string;
    }>(
      `SELECT msg.id, msg.user_id, msg.text, msg.created_at, u.name
       FROM messages msg JOIN users u ON u.id = msg.user_id
       WHERE msg.crew_id = $1
       ORDER BY msg.created_at ASC
       LIMIT 200`,
      [id],
    );
    return {
      messages: rows.map((m) => ({
        id: m.id,
        crewId: id,
        userId: m.user_id,
        name: m.name,
        text: m.text,
        at: m.created_at,
      })),
    };
  });

  app.post('/crews/:id/messages', async (req) => {
    const user = await requireUser(req);
    const { id } = req.params as { id: string };
    const parsed = z.object({ text: z.string().min(1).max(1000) }).safeParse(req.body);
    if (!parsed.success) throw badRequest('need text');

    const member = await query(`SELECT 1 FROM crew_members WHERE crew_id = $1 AND user_id = $2`, [id, user.id]);
    if (!member.rowCount) throw forbidden('join the crew first');

    const { rows } = await query<{ id: string; created_at: Date }>(
      `INSERT INTO messages (crew_id, user_id, text) VALUES ($1,$2,$3) RETURNING id, created_at`,
      [id, user.id, parsed.data.text.trim()],
    );
    return {
      message: {
        id: rows[0].id,
        crewId: id,
        userId: user.id,
        name: user.name,
        text: parsed.data.text.trim(),
        at: rows[0].created_at,
      },
    };
  });

  app.get('/me', async (req) => {
    const user = await requireUser(req);
    return { user: publicUser(user) };
  });

  app.patch('/me', async (req) => {
    const user = await requireUser(req);
    const parsed = z
      .object({
        name: z.string().min(1).max(80).optional(),
        handle: z.string().min(1).max(40).optional(),
        bio: z.string().max(280).optional(),
        vibeTags: z.array(z.string().max(32)).max(20).optional(),
      })
      .safeParse(req.body);
    if (!parsed.success) throw badRequest('invalid profile');
    const next = parsed.data;
    await query(
      `UPDATE users SET
         name = COALESCE($2, name),
         handle = COALESCE($3, handle),
         bio = COALESCE($4, bio),
         vibe_tags = COALESCE($5, vibe_tags)
       WHERE id = $1`,
      [user.id, next.name ?? null, next.handle ?? null, next.bio ?? null, next.vibeTags ?? null],
    );
    const updated = await findUserById(user.id);
    return { user: updated ? publicUser(updated) : publicUser(user) };
  });
}
