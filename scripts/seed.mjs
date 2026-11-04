// Seeds G7 inflation and unemployment from the World Bank API into observations.
// Run: node --env-file=.env.local scripts/seed.mjs
import { createClient } from "@supabase/supabase-js";

const COUNTRIES = ["CAN", "FRA", "DEU", "ITA", "JPN", "GBR", "USA"];
const INDICATORS = {
  "FP.CPI.TOTL.ZG": "inflation",
  "SL.UEM.TOTL.ZS": "unemployment",
};
const START_YEAR = 2010;
const END_YEAR = new Date().getFullYear();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } },
);

async function fetchIndicator(code) {
  const url =
    `https://api.worldbank.org/v2/country/${COUNTRIES.join(";")}/indicator/${code}` +
    `?format=json&date=${START_YEAR}:${END_YEAR}&per_page=1000`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`World Bank ${code}: HTTP ${res.status}`);
  const [meta, data] = await res.json();
  if (!data) throw new Error(`World Bank ${code}: ${JSON.stringify(meta)}`);
  return data
    .filter((d) => d.value !== null)
    .map((d) => ({
      country: d.countryiso3code,
      indicator: INDICATORS[code],
      year: Number(d.date),
      value: d.value,
    }));
}

const rows = (await Promise.all(Object.keys(INDICATORS).map(fetchIndicator))).flat();

const { error } = await supabase
  .from("observations")
  .upsert(rows, { onConflict: "country,indicator,year" });
if (error) throw error;

console.log(`Upserted ${rows.length} rows.`);
