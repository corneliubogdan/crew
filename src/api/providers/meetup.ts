import { SEED_EVENTS } from '../../data/seed';
import type { EventProvider } from './types';

/**
 * TODO: Real Meetup adapter
 * - OAuth 2.0 + Meetup GraphQL (https://api.meetup.com/gql) — out of scope for v1 (no real OAuth).
 * - Query upcoming events near Bucharest (lat 44.4268, lon 26.1025), groups: GDG, Python, ProductTank, etc.
 * - Map: title, time, venue name, group, event URL. RSVP count can inform "crews forming" later.
 * - Respect API rate limits; never store member PII we don't need.
 */
export const meetupProvider: EventProvider = {
  id: 'meetup',
  async listUpcoming(city: string) {
    // Fake data for v1. Swap this body when OAuth + GraphQL land.
    return SEED_EVENTS.filter((e) => e.source === 'meetup' && e.city === city);
  },
};
