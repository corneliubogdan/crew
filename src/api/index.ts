import { SEED_EVENTS } from '../data/seed';
import { lumaProvider } from './providers/luma';
import { meetupProvider } from './providers/meetup';
import type { TechEvent } from '../types';

export async function loadCatalog(city: string): Promise<TechEvent[]> {
  const [luma, meetup] = await Promise.all([
    lumaProvider.listUpcoming(city),
    meetupProvider.listUpcoming(city),
  ]);
  const fromProviders = [...luma, ...meetup];
  const extras = SEED_EVENTS.filter((e) => e.source === 'manual' && e.city === city);
  const byId = new Map<string, TechEvent>();
  for (const e of [...fromProviders, ...extras]) byId.set(e.id, e);
  return [...byId.values()];
}
