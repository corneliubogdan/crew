import { SEED_EVENTS } from '../../data/seed';
import type { EventProvider } from './types';

/**
 * TODO: Real Luma adapter
 * - Prefer Luma's official/public calendar API once we have a key; do not scrape login walls.
 * - Bucharest v1: query public events by geo (44.43, 26.10) or a curated calendar id.
 * - Map: title, start/end, venue, hosts, cover, luma.com/event url, ticket/RSVP link.
 * - Keep deep-link-out only — Crew never sells tickets.
 * - Cache + etag; fail open to seed if the network is sad.
 */
export const lumaProvider: EventProvider = {
  id: 'luma',
  async listUpcoming(city: string) {
    // Fake data for v1. Swap this body when the real client exists.
    return SEED_EVENTS.filter((e) => e.source === 'luma' && e.city === city);
  },
};
