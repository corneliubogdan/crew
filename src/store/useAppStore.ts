import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { purchaseMock } from '../api/iap';
import { loadCatalog } from '../api';
import {
  DEFAULT_USER_VIBES,
  ME,
  PEOPLE,
  SEED_CREWS,
  SEED_MESSAGES,
  SEED_EVENTS,
} from '../data/seed';
import { monthKey } from '../lib/dates';
import { nid } from '../lib/ids';
import type { ChatMessage, Crew, TechEvent, TicketStatus, User, VibeId } from '../types';

const FREE_JOINS_PER_MONTH = 1;
const MIN_CREW = 3;
const MAX_CREW = 8;

export type JoinResult =
  | { ok: true; crewId: string }
  | { ok: false; needPaywall: boolean; reason: string };

type AppState = {
  hydrated: boolean;
  me: User;
  city: 'Bucharest';
  userVibes: VibeId[];
  vibeFilter: VibeId | null;
  events: TechEvent[];
  crews: Crew[];
  messages: ChatMessage[];
  crewPass: boolean;
  extraJoinCredits: number;
  joinsThisMonth: number;
  joinMonthKey: string;
  paywallOpen: boolean;
  paywallReason: string;
  afterglowVotes: Record<string, 'again' | 'nah'>;
  people: typeof PEOPLE;
  setHydrated: () => void;
  refreshCatalog: () => Promise<void>;
  setVibeFilter: (id: VibeId | null) => void;
  toggleUserVibe: (id: VibeId) => void;
  canJoin: () => boolean;
  joinsLeftLabel: () => string;
  joinCrew: (crewId: string) => JoinResult;
  createCrew: (input: {
    eventId: string;
    name: string;
    prompt: string;
    meetupSpot: string;
    capacity: number;
  }) => JoinResult;
  leaveCrew: (crewId: string) => void;
  sendMessage: (crewId: string, text: string) => void;
  setTicketStatus: (crewId: string, status: TicketStatus) => void;
  setMeetupSpot: (crewId: string, spot: string) => void;
  toggleHere: (crewId: string) => void;
  openPaywall: (reason: string) => void;
  closePaywall: () => void;
  unlockCrewPass: () => Promise<void>;
  buyExtraJoin: () => Promise<void>;
  addEventFromUrl: (url: string, title?: string) => string | null;
  voteAfterglow: (personId: string, vote: 'again' | 'nah') => void;
  myCrews: () => Crew[];
  isMember: (crewId: string) => boolean;
  resetDemo: () => void;
};

function rolloverJoins(state: Pick<AppState, 'joinMonthKey' | 'joinsThisMonth'>): {
  joinMonthKey: string;
  joinsThisMonth: number;
} {
  const key = monthKey();
  if (state.joinMonthKey !== key) return { joinMonthKey: key, joinsThisMonth: 0 };
  return { joinMonthKey: state.joinMonthKey, joinsThisMonth: state.joinsThisMonth };
}

export function labelJoins(s: {
  crewPass: boolean;
  extraJoinCredits: number;
  joinsThisMonth: number;
  joinMonthKey: string;
}): string {
  if (s.crewPass) return 'unlimited · crew pass';
  const { joinsThisMonth } = rolloverJoins(s);
  const freeLeft = Math.max(0, FREE_JOINS_PER_MONTH - joinsThisMonth);
  const extras = s.extraJoinCredits;
  if (freeLeft + extras <= 0) return '0 joins left this month';
  return `${freeLeft + extras} join${freeLeft + extras === 1 ? '' : 's'} left`;
}

function hasJoinBudget(s: AppState): boolean {
  if (s.crewPass) return true;
  if (s.extraJoinCredits > 0) return true;
  const { joinsThisMonth } = rolloverJoins(s);
  return joinsThisMonth < FREE_JOINS_PER_MONTH;
}

function consumeJoin(s: AppState): Partial<AppState> {
  const rolled = rolloverJoins(s);
  if (s.crewPass) {
    return { ...rolled, joinsThisMonth: rolled.joinsThisMonth + 1 };
  }
  if (s.extraJoinCredits > 0) {
    return { ...rolled, extraJoinCredits: s.extraJoinCredits - 1, joinsThisMonth: rolled.joinsThisMonth + 1 };
  }
  return { ...rolled, joinsThisMonth: rolled.joinsThisMonth + 1 };
}

function initialSlice() {
  return {
    me: ME,
    city: 'Bucharest' as const,
    userVibes: [...DEFAULT_USER_VIBES] as VibeId[],
    vibeFilter: null as VibeId | null,
    events: SEED_EVENTS,
    crews: SEED_CREWS,
    messages: SEED_MESSAGES,
    crewPass: false,
    extraJoinCredits: 0,
    joinsThisMonth: 0,
    joinMonthKey: monthKey(),
    paywallOpen: false,
    paywallReason: '',
    afterglowVotes: {} as Record<string, 'again' | 'nah'>,
    people: PEOPLE,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      ...initialSlice(),
      setHydrated: () => set({ hydrated: true }),
      refreshCatalog: async () => {
        const catalog = await loadCatalog(get().city);
        const extras = get().events.filter(
          (e) => !catalog.some((c) => c.id === e.id) && !SEED_EVENTS.some((s) => s.id === e.id),
        );
        set({ events: [...catalog, ...extras] });
      },
      setVibeFilter: (id) => set({ vibeFilter: get().vibeFilter === id ? null : id }),
      toggleUserVibe: (id) =>
        set((s) => ({
          userVibes: s.userVibes.includes(id) ? s.userVibes.filter((v) => v !== id) : [...s.userVibes, id],
        })),
      canJoin: () => hasJoinBudget(get()),
      joinsLeftLabel: () => labelJoins(get()),
      joinCrew: (crewId) => {
        const s = get();
        const crew = s.crews.find((c) => c.id === crewId);
        if (!crew) return { ok: false, needPaywall: false, reason: 'crew vanished' };
        if (crew.members.some((m) => m.personId === s.me.id)) return { ok: true, crewId };
        if (crew.members.length >= crew.capacity || !crew.isOpen) {
          return { ok: false, needPaywall: false, reason: 'that crew is full' };
        }
        if (!hasJoinBudget(s)) {
          return { ok: false, needPaywall: true, reason: 'free join is used up this month' };
        }
        set({
          ...consumeJoin(s),
          crews: s.crews.map((c) =>
            c.id === crewId
              ? {
                  ...c,
                  members: [...c.members, { personId: s.me.id, ticketStatus: 'idk' as TicketStatus, isHost: false }],
                  isOpen: c.members.length + 1 < c.capacity,
                }
              : c,
          ),
        });
        return { ok: true, crewId };
      },
      createCrew: ({ eventId, name, prompt, meetupSpot, capacity }) => {
        const s = get();
        const alreadyHost = s.crews.some((c) => c.eventId === eventId && c.members.some((m) => m.personId === s.me.id));
        if (alreadyHost) {
          const existing = s.crews.find((c) => c.eventId === eventId && c.members.some((m) => m.personId === s.me.id));
          return { ok: true, crewId: existing!.id };
        }
        if (!hasJoinBudget(s)) {
          return { ok: false, needPaywall: true, reason: 'opening a crew counts as your join' };
        }
        const size = Math.min(MAX_CREW, Math.max(MIN_CREW, capacity));
        const crew: Crew = {
          id: nid('cr'),
          eventId,
          name: name.trim() || `${s.me.name.toLowerCase()}'s crew`,
          prompt: prompt.trim() || 'small group, no mixer energy',
          meetupSpot: meetupSpot.trim() || 'lobby, 15 min early',
          capacity: size,
          isOpen: true,
          members: [{ personId: s.me.id, ticketStatus: 'idk', isHost: true }],
        };
        set({
          ...consumeJoin(s),
          crews: [crew, ...s.crews],
        });
        return { ok: true, crewId: crew.id };
      },
      leaveCrew: (crewId) =>
        set((s) => ({
          crews: s.crews
            .map((c) => {
              if (c.id !== crewId) return c;
              const members = c.members.filter((m) => m.personId !== s.me.id);
              if (members.length === 0) return null;
              if (c.members.some((m) => m.personId === s.me.id && m.isHost)) {
                members[0] = { ...members[0], isHost: true };
              }
              return { ...c, members, isOpen: members.length < c.capacity };
            })
            .filter((c): c is Crew => c !== null),
        })),
      sendMessage: (crewId, text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const msg: ChatMessage = {
          id: nid('m'),
          crewId,
          personId: get().me.id,
          text: trimmed,
          at: new Date().toISOString(),
        };
        set((s) => ({ messages: [...s.messages, msg] }));
      },
      setTicketStatus: (crewId, status) =>
        set((s) => ({
          crews: s.crews.map((c) =>
            c.id === crewId
              ? {
                  ...c,
                  members: c.members.map((m) => (m.personId === s.me.id ? { ...m, ticketStatus: status } : m)),
                }
              : c,
          ),
        })),
      setMeetupSpot: (crewId, spot) =>
        set((s) => ({
          crews: s.crews.map((c) => (c.id === crewId ? { ...c, meetupSpot: spot } : c)),
        })),
      toggleHere: (crewId) =>
        set((s) => ({
          crews: s.crews.map((c) =>
            c.id === crewId
              ? {
                  ...c,
                  members: c.members.map((m) => (m.personId === s.me.id ? { ...m, here: !m.here } : m)),
                }
              : c,
          ),
        })),
      openPaywall: (reason) => set({ paywallOpen: true, paywallReason: reason }),
      closePaywall: () => set({ paywallOpen: false }),
      unlockCrewPass: async () => {
        await purchaseMock('crew_pass_monthly');
        set({ crewPass: true, paywallOpen: false });
      },
      buyExtraJoin: async () => {
        await purchaseMock('extra_join');
        set((s) => ({ extraJoinCredits: s.extraJoinCredits + 1, paywallOpen: false }));
      },
      addEventFromUrl: (url, title) => {
        let parsed: URL;
        try {
          parsed = new URL(url.trim());
        } catch {
          return null;
        }
        const source: TechEvent['source'] = parsed.hostname.includes('luma')
          ? 'luma'
          : parsed.hostname.includes('meetup')
            ? 'meetup'
            : 'manual';
        const event: TechEvent = {
          id: nid('ev'),
          title: (title || '').trim() || `pasted · ${parsed.hostname}`,
          venue: 'TBD — pasted link',
          neighborhood: 'Bucharest',
          startsAt: daysFromNowSafe(7),
          description:
            'Dropped in from a URL. Times and venue are a guess until real Luma/Meetup adapters land. Tickets still live on the host page.',
          vibeTags: ['chill', 'beginner-ok'],
          source,
          sourceUrl: parsed.toString(),
          ticketUrl: parsed.toString(),
          accent: '#5CFFE7',
          city: 'Bucharest',
        };
        set((s) => ({ events: [event, ...s.events] }));
        return event.id;
      },
      voteAfterglow: (personId, vote) =>
        set((s) => ({ afterglowVotes: { ...s.afterglowVotes, [personId]: vote } })),
      myCrews: () => get().crews.filter((c) => c.members.some((m) => m.personId === get().me.id)),
      isMember: (crewId) => get().crews.some((c) => c.id === crewId && c.members.some((m) => m.personId === get().me.id)),
      resetDemo: () => set({ ...initialSlice(), paywallOpen: false }),
    }),
    {
      name: 'crew-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        me: s.me,
        userVibes: s.userVibes,
        events: s.events,
        crews: s.crews,
        messages: s.messages,
        crewPass: s.crewPass,
        extraJoinCredits: s.extraJoinCredits,
        joinsThisMonth: s.joinsThisMonth,
        joinMonthKey: s.joinMonthKey,
        afterglowVotes: s.afterglowVotes,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

function daysFromNowSafe(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(19, 0, 0, 0);
  return d.toISOString();
}

export { FREE_JOINS_PER_MONTH, MIN_CREW, MAX_CREW };
