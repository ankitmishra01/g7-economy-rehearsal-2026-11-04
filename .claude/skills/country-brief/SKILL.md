---
name: country-brief
description: Write a 150-word economic brief on one G7 country (Canada, France, Germany, Italy, Japan, UK, US) using only inflation and unemployment figures from this project's Supabase observations table, cited to the World Bank. Use when asked for a country brief, summary, or snapshot of a G7 economy.
---

# Country brief

Writes a ~150-word economic brief on one country from our database. Follow the data rules in the
project CLAUDE.md: every number must come from the database, cite the World Bank, never invent.

## 1. Get the data

Map the country to its ISO3 code: Canada CAN, France FRA, Germany DEU, Italy ITA, Japan JPN,
United Kingdom GBR, United States USA. Anything else: say it is not in the database and stop.

```bash
node --env-file=.env.local scripts/country-data.mjs <ISO3>
```

This JSON is the **only** source of numbers for the brief. Do not use figures from memory or the
web, even for context (no GDP, interest rates, policy rates, or events with numbers).

## 2. Write the brief

- **Length:** 140–160 words of body text, not counting the title and source line.
- **Title:** `<Country>: economic brief`
- **Cover:** the latest inflation and unemployment values and their years; the 2010-to-latest
  trend for each; the most notable peak or trough (e.g. the post-2021 inflation surge), with its
  year; one closing line on where the two indicators stand now relative to the 2010s.
- **Numbers:** one decimal, with `%`, and always with the year. Differences between years are
  allowed only if computed from two database values ("down 2.1 points from 2022"). Use
  "percentage points" for differences, "%" for levels.
- **Missing data:** if the latest year differs between indicators, or a year is missing, say so
  plainly. Never fill the gap.
- **Tone:** plain, factual, no forecasts, no causal claims that need outside data. Brief
  qualitative context without numbers ("energy prices", "the pandemic") is fine.
- **End with:** `Source: World Bank, World Development Indicators (FP.CPI.TOTL.ZG, SL.UEM.TOTL.ZS).`

## 3. Check before showing it

1. Every number in the brief appears in the JSON, or is a difference/average computed from
   values in it. Check each one; fix or remove any that fail.
2. Every year mentioned matches the year of the value in the JSON.
3. Word count of the body is 140–160 (`wc -w` on the body).
4. The World Bank source line is present.

Then show the brief and, under it, a short list of the database values used.
