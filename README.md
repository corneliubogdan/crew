# Crew

Mobile app for tech events where the product is going **with people** — teens and young adults, not LinkedIn Events. v1 is Bucharest (Europe) only.

Dark-first, late-2026 youth social aesthetic (IG + Discord energy). We don't sell tickets. We help you show up as a crew of 3–8.

## Run

No secrets. Works in Expo Go and on web.

```bash
npm install
npx expo start
```

Then:

- scan the QR with **Expo Go** (iOS/Android)
- press `w` for **web**
- `i` / `a` for simulators if you have them

Scripts: `npm start`, `npm run web`, `npm run ios`, `npm run android`.

## Product (v1)

- **Discover** — upcoming Bucharest tech nights, ranked by your vibes tags + how many crews are forming.
- **Event** — vibe tags, honest copy, tickets deep-link out (Luma / Meetup / pasted URL). Open or start a crew (3–8). Share draft exports caption text only (no IG bot).
- **Crew room** — mock chat, meetup pin, self-reported ticket status (`got it` / `need one` / `waitlist` / `idk`).
- **Go** — day-of roster + pin. Afterglow stub: “who'd you go with again”.
- **You** — vibe prefs, join budget, mock Crew Pass.
- **Soft paywall** — free browse + **1 crew join/open per month**. Crew Pass (~€7.99/mo) unlimited, or ~€2.49 per extra join. Copy is honest: *covers hosting + a bit to keep building.* Mock IAP (local flag), not Stripe.

Seed: 12 believable Bucharest events + open crews. Catalog comes from **stub Luma + Meetup adapters** (fake data) plus a paste-URL field.

## Out of scope (on purpose)

Real OAuth, ticket resale, full social graph, real payments, push at scale, Instagram marketing bot.

## Stack

Expo (React Native) + TypeScript. Zustand + AsyncStorage. Mock API module under `src/api`.

## Next phases

1. Real Luma / Meetup adapters — see TODOs in `src/api/providers/luma.ts` and `meetup.ts`.
2. Real IAP (StoreKit 2 / Play Billing) — `src/api/iap.ts`. Restore purchases.
3. Auth that isn't a fake Mira profile.
4. Push for “crew is at the pin”.
5. Afterglow → real “go with again” graph.
6. More cities once Bucharest feels obvious.
7. Optional share-to-IG as caption + sticker, still not a spam bot.

## Demo notes

- First join/open in a month is free. The second hits the paywall. Unlock Pass or buy one extra join (mock).
- Profile → **reset demo data** wipes local state.
- “Share draft” copies/shares caption text only.
