# Crew

Mobile app for tech events where the product is going **with people** — teens and young adults, not LinkedIn Events. v1 is Bucharest (Europe) only.

Dark-first, late-2026 youth social aesthetic (IG + Discord energy). We don't sell tickets. We help you show up as a crew of 3–8.

The Expo app is **not** wired to the API yet. Mobile still uses the in-app mock store.

## Mobile

No secrets. Works in Expo Go and on web.

```bash
npm install
npx expo start
```

Then:

- scan the QR with **Expo Go** (iOS/Android)
- press `w` for **web**, or `npx expo start --web`
- `i` / `a` for simulators if you have them

Scripts: `npm start`, `npm run web`, `npm run ios`, `npm run android`.

## API + Hetzner box

Fastify + Postgres 16 + Caddy. Single Docker Compose stack.

```bash
cp .env.example .env
chmod 600 .env
docker compose up --build
curl http://127.0.0.1:3000/health
```

Magic link (dev returns the token):

```bash
curl -sS -X POST http://127.0.0.1:3000/auth/magic-link \
  -H 'content-type: application/json' \
  -d '{"email":"mira@crew.local"}'
```

Verify, then `Authorization: Bearer <jwt>` for `POST /crews`, `POST /crews/:id/join`, messages, `/me`.

Local dump: `./scripts/pg_dump_local.sh`  
Hetzner runbook: [`deploy/hetzner.md`](deploy/hetzner.md)

## Product (v1)

- **Discover** — upcoming Bucharest tech nights, ranked by your vibes tags + how many crews are forming.
- **Event** — vibe tags, honest copy, tickets deep-link out (Luma / Meetup / pasted URL). Open or start a crew (3–8). Share draft exports caption text only (no IG bot).
- **Crew room** — mock chat, meetup pin, self-reported ticket status (`got it` / `need one` / `waitlist` / `idk`).
- **Go** — day-of roster + pin. Afterglow stub: “who'd you go with again”.
- **You** — vibe prefs, join budget, mock Crew Pass.
- **Soft paywall** — free browse + **1 crew join/open per month**. Crew Pass (~€7.99/mo) unlimited, or ~€2.49 per extra join. Copy is honest: *covers hosting + a bit to keep building.* Mock IAP (local flag), not Stripe.

Seed: 12 believable Bucharest events + open crews (mobile mock) / 8 events + crews in Postgres.

## Out of scope (on purpose)

Real OAuth, ticket resale, full social graph, real payments, push at scale, Instagram marketing bot, wiring Expo to this API, HA, offsite backups.

## Stack

Expo (React Native) + TypeScript. Zustand + AsyncStorage. Mock API module under `src/api`.
Server: Fastify + Postgres (`server/`). Deploy: Docker Compose + Caddy.

## Next phases

1. Point the Expo app at this API.
2. Real Luma / Meetup adapters — TODOs in `src/api/providers/` and `server/src/providers/events.ts`.
3. Real IAP (StoreKit 2 / Play Billing) — `src/api/iap.ts`. Restore purchases.
4. Email the magic link in production.
5. Push for “crew is at the pin”.
6. Afterglow → real “go with again” graph.
7. More cities once Bucharest feels obvious.

## Demo notes (mobile mock)

- First join/open in a month is free. The second hits the paywall. Unlock Pass or buy one extra join (mock).
- Profile → **reset demo data** wipes local state.
- “Share draft” copies/shares caption text only.
