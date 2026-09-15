import type { Crew, TechEvent, VibeId } from '../types';

export function crewCountForEvent(eventId: string, crews: Crew[]): number {
  return crews.filter((c) => c.eventId === eventId && c.isOpen).length;
}

export function rankEvents(
  events: TechEvent[],
  crews: Crew[],
  userVibes: VibeId[],
  vibeFilter: VibeId | null,
  now = Date.now(),
): { event: TechEvent; score: number; forming: number }[] {
  return events
    .filter((e) => new Date(e.startsAt).getTime() > now - 3 * 3600 * 1000)
    .filter((e) => (vibeFilter ? e.vibeTags.includes(vibeFilter) : true))
    .map((event) => {
      const overlap = event.vibeTags.filter((t) => userVibes.includes(t)).length;
      const forming = crewCountForEvent(event.id, crews);
      const hoursUntil = (new Date(event.startsAt).getTime() - now) / 3600000;
      const soonBoost = hoursUntil < 24 ? 10 : hoursUntil < 72 ? 6 : hoursUntil < 168 ? 3 : 0;
      const score = overlap * 12 + forming * 7 + soonBoost;
      return { event, score, forming };
    })
    .sort((a, b) => b.score - a.score || new Date(a.event.startsAt).getTime() - new Date(b.event.startsAt).getTime());
}
