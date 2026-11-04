import { getObservations } from "@/lib/observations";
import Dashboard from "./dashboard";

export default async function Home() {
  const observations = await getObservations();

  return (
    <main className="mx-auto w-full min-w-0 max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">G7 economy</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Inflation and unemployment since 2010, annual %.
      </p>
      <Dashboard observations={observations} />
    </main>
  );
}
