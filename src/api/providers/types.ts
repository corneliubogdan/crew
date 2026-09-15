import type { TechEvent } from '../../types';

export type EventProviderId = 'luma' | 'meetup' | 'manual';

export type EventProvider = {
  id: EventProviderId;
  listUpcoming(city: string): Promise<TechEvent[]>;
};
