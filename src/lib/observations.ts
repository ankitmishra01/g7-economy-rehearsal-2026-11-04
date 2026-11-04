import { cacheLife } from "next/cache";
import { supabase } from "@/lib/supabase";

export type Observation = {
  country: string;
  indicator: "inflation" | "unemployment";
  year: number;
  value: number;
};

export async function getObservations(): Promise<Observation[]> {
  "use cache";
  cacheLife("hours");

  const { data, error } = await supabase
    .from("observations")
    .select("country,indicator,year,value")
    .gte("year", 2010)
    .order("year");
  if (error) throw error;
  return data as Observation[];
}
