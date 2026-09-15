import { query } from './db';

function daysFromNow(days: number, hours = 19, minutes = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function hoursFromNow(hours: number): Date {
  const d = new Date();
  d.setTime(d.getTime() + hours * 3600 * 1000);
  d.setSeconds(0, 0);
  return d;
}

const USERS = [
  { id: '00000000-0000-4000-8000-000000000001', email: 'mira@crew.local', name: 'Mira', handle: 'mira.codes', bio: '19 · poli-adjacent · I will leave if it becomes a pitch night' },
  { id: '00000000-0000-4000-8000-000000000002', email: 'andrei@crew.local', name: 'Andrei', handle: 'andrei.tsx', bio: '' },
  { id: '00000000-0000-4000-8000-000000000003', email: 'sofi@crew.local', name: 'Sofi', handle: 'sofi.wav', bio: '' },
  { id: '00000000-0000-4000-8000-000000000004', email: 'nora@crew.local', name: 'Nora', handle: 'nora.ai', bio: '' },
  { id: '00000000-0000-4000-8000-000000000005', email: 'teo@crew.local', name: 'Teo', handle: 'teo.gql', bio: '' },
  { id: '00000000-0000-4000-8000-000000000006', email: 'ioana@crew.local', name: 'Ioana', handle: 'ioana.fig', bio: '' },
  { id: '00000000-0000-4000-8000-000000000007', email: 'luca@crew.local', name: 'Luca', handle: 'luca.git', bio: '' },
  { id: '00000000-0000-4000-8000-000000000008', email: 'daria@crew.local', name: 'Daria', handle: 'daria.py', bio: '' },
  { id: '00000000-0000-4000-8000-000000000009', email: 'radu@crew.local', name: 'Radu', handle: 'radu.hw', bio: '' },
  { id: '00000000-0000-4000-8000-00000000000a', email: 'vlad@crew.local', name: 'Vlad', handle: 'vlad.run', bio: '' },
  { id: '00000000-0000-4000-8000-00000000000b', email: 'alex@crew.local', name: 'Alex', handle: 'alex.oss', bio: '' },
  { id: '00000000-0000-4000-8000-00000000000c', email: 'bianca@crew.local', name: 'Bianca', handle: 'bianca.ux', bio: '' },
  { id: '00000000-0000-4000-8000-00000000000d', email: 'mara@crew.local', name: 'Mara', handle: 'mara.night', bio: '' },
  { id: '00000000-0000-4000-8000-00000000000e', email: 'matei@crew.local', name: 'Matei', handle: 'matei.k8s', bio: '' },
] as const;

/**
 * TODO: Real Luma / Meetup adapters — this seed is the v1 catalog.
 * Swap listUpcoming() in providers/events.ts when those clients exist.
 */
const EVENTS = [
  {
    id: 'ev_office_hours',
    title: 'office hours: shipping in public',
    venue: 'Steam Cowork',
    neighborhood: 'Universitate',
    startsAt: hoursFromNow(3),
    endsAt: null as Date | null,
    description:
      'Tiny desk-night. Bring a half-broken project, not a deck. We rotate 12-min shares then sit together and actually ship. Max 20. No recruiters hovering.',
    vibeTags: ['chill', 'beginner-ok', 'hacky'],
    source: 'luma',
    sourceUrl: 'https://luma.com/buc-office-hours',
    ticketUrl: 'https://luma.com/buc-office-hours',
    accent: '#C8FF3D',
  },
  {
    id: 'ev_ai_night',
    title: 'AI night but make it social',
    venue: 'NOD Makerspace',
    neighborhood: 'Floreasca',
    startsAt: daysFromNow(2, 19, 0),
    endsAt: null,
    description:
      'Demos, then the hallway is the actual event. If you only want keynotes this is the wrong room. BYO curiosity, not a pitch.',
    vibeTags: ['ai', 'hacky', 'late-night', 'beginner-ok'],
    source: 'luma',
    sourceUrl: 'https://luma.com/buc-ai-night',
    ticketUrl: 'https://luma.com/buc-ai-night',
    accent: '#5CFFE7',
  },
  {
    id: 'ev_react_espresso',
    title: 'react & cheap espresso',
    venue: 'Mindspace Victoriei',
    neighborhood: 'Victoriei',
    startsAt: daysFromNow(4, 18, 30),
    endsAt: null,
    description: 'Lightning talks under 8 minutes, then we migrate to the cafe downstairs. Beginners sit in the front on purpose.',
    vibeTags: ['chill', 'beginner-ok', 'hacky'],
    source: 'meetup',
    sourceUrl: 'https://meetup.com/react-bucharest',
    ticketUrl: 'https://meetup.com/react-bucharest',
    accent: '#FF8A4C',
  },
  {
    id: 'ev_design_dark',
    title: 'design systems after dark',
    venue: 'The Institute',
    neighborhood: 'Timpuri Noi',
    startsAt: daysFromNow(3, 20, 0),
    endsAt: null,
    description: 'Tokens, messy Figma files, and why your button has 14 variants. Headphones-off hang after.',
    vibeTags: ['design', 'late-night', 'chill'],
    source: 'luma',
    sourceUrl: 'https://luma.com/ds-after-dark',
    ticketUrl: 'https://luma.com/ds-after-dark',
    accent: '#FF3D8A',
  },
  {
    id: 'ev_hack_grid',
    title: 'hack the grid · 24h',
    venue: 'Palatul Universul',
    neighborhood: 'Eminescu',
    startsAt: daysFromNow(9, 10, 0),
    endsAt: daysFromNow(10, 12, 0),
    description: 'Energy / climate / city-infra prompts. Sleep is optional, crews are not.',
    vibeTags: ['hacky', 'late-night', 'loud', 'beginner-ok'],
    source: 'luma',
    sourceUrl: 'https://luma.com/hack-the-grid',
    ticketUrl: 'https://luma.com/hack-the-grid',
    accent: '#C8FF3D',
  },
  {
    id: 'ev_cyber',
    title: 'cyber night @ poli',
    venue: 'PRECIS, Politehnica',
    neighborhood: 'Grozăvești',
    startsAt: daysFromNow(7, 19, 30),
    endsAt: null,
    description: 'CTF-lite, then we spill into the campus steps. Hardware table in the back.',
    vibeTags: ['hacky', 'hardware', 'late-night', 'loud'],
    source: 'meetup',
    sourceUrl: 'https://meetup.com/cyber-bucharest',
    ticketUrl: 'https://meetup.com/cyber-bucharest',
    accent: '#FF5C7A',
  },
  {
    id: 'ev_python',
    title: 'python pirates',
    venue: 'Cărturești Verona (upstairs)',
    neighborhood: 'Amzei',
    startsAt: daysFromNow(6, 18, 0),
    endsAt: null,
    description: 'Scripts, scrapers, and a little chaos. Notebooks welcome.',
    vibeTags: ['hacky', 'beginner-ok', 'open-source'],
    source: 'meetup',
    sourceUrl: 'https://meetup.com/python-romania',
    ticketUrl: 'https://meetup.com/python-romania',
    accent: '#5B8CFF',
  },
  {
    id: 'ev_gdg',
    title: 'GDG cloud & chill',
    venue: 'Google Romania',
    neighborhood: 'Floreasca',
    startsAt: daysFromNow(12, 18, 30),
    endsAt: null,
    description: 'One real talk, one silly talk. The hang in the lobby is the point.',
    vibeTags: ['chill', 'career-lite', 'beginner-ok'],
    source: 'luma',
    sourceUrl: 'https://gdg.community.dev/gdg-bucharest',
    ticketUrl: 'https://gdg.community.dev/gdg-bucharest',
    accent: '#5B8CFF',
  },
];

const CREWS = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    eventId: 'ev_office_hours',
    name: 'quiet table',
    prompt: 'we actually open laptops',
    meetupSpot: 'Steam, back room by the plants',
    capacity: 5,
    host: '00000000-0000-4000-8000-000000000002',
    members: ['00000000-0000-4000-8000-000000000008'],
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    eventId: 'ev_ai_night',
    name: 'no small talk',
    prompt: 'hallway crew, skip the keynote if it slaps less than the snacks',
    meetupSpot: 'NOD lobby, under the neon stairs',
    capacity: 6,
    host: '00000000-0000-4000-8000-000000000004',
    members: ['00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000003'],
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    eventId: 'ev_ai_night',
    name: 'first-timers + tea',
    prompt: 'if this is your first tech night, sit with us',
    meetupSpot: 'cafe counter inside NOD, 18:40',
    capacity: 8,
    host: '00000000-0000-4000-8000-000000000006',
    members: ['00000000-0000-4000-8000-000000000007'],
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    eventId: 'ev_hack_grid',
    name: 'sleep is cancelled',
    prompt: '24h pod. we force a 4am walk.',
    meetupSpot: 'Universul main stairs, 09:40 Saturday',
    capacity: 8,
    host: '00000000-0000-4000-8000-000000000009',
    members: [
      '00000000-0000-4000-8000-00000000000a',
      '00000000-0000-4000-8000-000000000008',
      '00000000-0000-4000-8000-000000000007',
      '00000000-0000-4000-8000-00000000000d',
    ],
  },
];

export async function seed(): Promise<void> {
  for (const u of USERS) {
    await query(
      `INSERT INTO users (id, email, name, handle, bio, city, vibe_tags)
       VALUES ($1,$2,$3,$4,$5,'Bucharest',$6)
       ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name`,
      [u.id, u.email, u.name, u.handle, u.bio, ['hacky', 'late-night', 'ai']],
    );
  }

  for (const e of EVENTS) {
    await query(
      `INSERT INTO events (id, title, venue, neighborhood, starts_at, ends_at, description, vibe_tags, source, source_url, ticket_url, accent, city)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'Bucharest')
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         starts_at = EXCLUDED.starts_at,
         ends_at = EXCLUDED.ends_at,
         description = EXCLUDED.description`,
      [
        e.id,
        e.title,
        e.venue,
        e.neighborhood,
        e.startsAt,
        e.endsAt,
        e.description,
        e.vibeTags,
        e.source,
        e.sourceUrl,
        e.ticketUrl,
        e.accent,
      ],
    );
  }

  for (const c of CREWS) {
    await query(
      `INSERT INTO crews (id, event_id, name, prompt, meetup_spot, capacity, is_open, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,TRUE,$7)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, meetup_spot = EXCLUDED.meetup_spot`,
      [c.id, c.eventId, c.name, c.prompt, c.meetupSpot, c.capacity, c.host],
    );
    await query(
      `INSERT INTO crew_members (crew_id, user_id, ticket_status, is_host)
       VALUES ($1,$2,'got-it',TRUE)
       ON CONFLICT (crew_id, user_id) DO NOTHING`,
      [c.id, c.host],
    );
    for (const member of c.members) {
      await query(
        `INSERT INTO crew_members (crew_id, user_id, ticket_status, is_host)
         VALUES ($1,$2,'idk',FALSE)
         ON CONFLICT (crew_id, user_id) DO NOTHING`,
        [c.id, member],
      );
    }
  }

  const existing = await query(`SELECT 1 FROM messages LIMIT 1`);
  if (existing.rowCount === 0) {
    await query(
      `INSERT INTO messages (crew_id, user_id, text) VALUES
       ($1,$2,'meetup at the neon stairs 18:50. if the talk is mid we bounce to the courtyard.'),
       ($1,$3,'still on waitlist — hold a seat?')`,
      [
        '10000000-0000-4000-8000-000000000002',
        '00000000-0000-4000-8000-000000000004',
        '00000000-0000-4000-8000-000000000005',
      ],
    );
  }
}
