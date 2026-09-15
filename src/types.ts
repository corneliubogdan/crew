export type VibeId =
  | 'hacky'
  | 'chill'
  | 'loud'
  | 'late-night'
  | 'beginner-ok'
  | 'ai'
  | 'design'
  | 'founders'
  | 'career-lite'
  | 'open-source'
  | 'hardware';

export type EventSource = 'luma' | 'meetup' | 'manual';

export type TicketStatus = 'got-it' | 'need-one' | 'waitlist' | 'idk';

export type User = {
  id: string;
  name: string;
  handle: string;
  city: 'Bucharest';
  bio: string;
};

export type TechEvent = {
  id: string;
  title: string;
  venue: string;
  neighborhood: string;
  startsAt: string;
  endsAt?: string;
  description: string;
  vibeTags: VibeId[];
  source: EventSource;
  sourceUrl: string;
  ticketUrl: string;
  accent: string;
  city: 'Bucharest';
};

export type Person = {
  id: string;
  name: string;
  handle: string;
};

export type CrewMember = {
  personId: string;
  ticketStatus: TicketStatus;
  isHost: boolean;
  here?: boolean;
};

export type Crew = {
  id: string;
  eventId: string;
  name: string;
  prompt: string;
  meetupSpot: string;
  capacity: number;
  isOpen: boolean;
  members: CrewMember[];
};

export type ChatMessage = {
  id: string;
  crewId: string;
  personId: string;
  text: string;
  at: string;
};

export type MemoryHang = {
  id: string;
  title: string;
  whenLabel: string;
  people: Person[];
};
