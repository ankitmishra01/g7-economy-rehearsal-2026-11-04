// Prints every observation for one country from the observations table, as JSON.
// Run: node --env-file=.env.local scripts/country-data.mjs FRA
import { createClient } from "@supabase/supabase-js";

const country = process.argv[2]?.toUpperCase();
if (!country) {
  console.error("Usage: node --env-file=.env.local scripts/country-data.mjs <ISO3 code>");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

const { data, error } = await supabase
  .from("observations")
  .select("indicator,year,value")
  .eq("country", country)
  .order("indicator")
  .order("year");
if (error) throw error;
if (!data.length) {
  console.error(`No observations for ${country}.`);
  process.exit(1);
}

const series = {};
for (const { indicator, year, value } of data) {
  (series[indicator] ??= {})[year] = Math.round(value * 10) / 10;
}

console.log(
  JSON.stringify(
    {
      country,
      unit: "% (annual)",
      source: "World Bank, World Development Indicators (FP.CPI.TOTL.ZG, SL.UEM.TOTL.ZS)",
      series,
    },
    null,
    2,
  ),
);
