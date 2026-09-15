/**
 * TODO: Real Luma adapter
 * - Public calendar / official API; Bucharest geo (44.43, 26.10)
 * - Map title, start/end, venue, url. Never sell tickets here.
 *
 * TODO: Real Meetup adapter
 * - OAuth 2 + Meetup GraphQL. Out of scope until we have keys.
 */
import { query } from '../db';

export type EventRow = {
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
};

export async function listUpcoming(city = 'Bucharest'): Promise<EventRow[]> {
  const { rows } = await query<EventRow>(
    `SELECT * FROM events
     WHERE city = $1 AND starts_at > now() - interval '3 hours'
     ORDER BY starts_at asc`,
    [city],
  );
  return rows;
}
