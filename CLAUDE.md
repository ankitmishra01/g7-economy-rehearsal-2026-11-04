@AGENTS.md

# g7-economy

> Rehearsal archive (4 Nov 2026). The Supabase project and Vercel deployment were deleted; a copy
> of the data is in `data/snapshot.csv`.

G7 inflation and unemployment since 2010. Next.js app on Vercel,
data in Supabase table `public.observations (country, indicator, year, value)`, loaded from the
World Bank by `scripts/seed.mjs`.

## Data rules (non-negotiable)

- **Only use numbers from our database.** Every figure in code, UI copy, briefs, commit messages or
  chat answers must come from the `observations` table. Read it with
  `node --env-file=.env.local scripts/country-data.mjs <ISO3>` or the Supabase client — not from
  memory, the web, or other sources.
- **Never invent a figure.** No estimates, forecasts, rounding into new claims, or "about X%" that
  isn't in the data. If a year or indicator is missing (e.g. US inflation 2025), say it is not
  available. Do not fill the gap.
- Derived numbers (a change between two years, a peak, an average) are allowed only when computed
  directly from database values; state which years they come from.
- **Always cite the World Bank** wherever numbers appear: "Source: World Bank". Use the indicator
  codes (FP.CPI.TOTL.ZG inflation, SL.UEM.TOTL.ZS unemployment) when space allows.
- Values are annual %, rounded to one decimal place in anything people read.

## Keys

- `.env.local` holds the Supabase URL, publishable key, secret key and DB password. Never print,
  log, commit or paste the secret key or DB password.
- The browser and Vercel use only the publishable key (read-only by RLS). The secret key is for
  `scripts/seed.mjs` only.

## Commands

- `npm run dev -- -p 3007` — local dev
- `node --env-file=.env.local scripts/seed.mjs` — refresh data from the World Bank (upsert)
- `vercel deploy --prod` — deploy (not connected to Git auto-deploys)
- `/country-brief <country>` — 150-word brief for one country from our data
