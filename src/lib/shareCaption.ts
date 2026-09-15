import { formatWhen } from './dates';
import type { TechEvent } from '../types';

export function eventShareCaption(event: TechEvent): string {
  const when = formatWhen(event.startsAt);
  return [
    `going to ${event.title} in buc 🖤`,
    `looking for a small crew (3–8) — not a networking mixer`,
    `${when.label}`,
    `${event.venue} · ${event.neighborhood}`,
    event.ticketUrl,
    ``,
    `who's in?`,
    `via crew`,
  ].join('\n');
}
