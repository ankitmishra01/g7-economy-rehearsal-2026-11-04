create table public.observations (
  id bigint generated always as identity primary key,
  country text not null,
  indicator text not null,
  year integer not null,
  value double precision,
  unique (country, indicator, year)
);

alter table public.observations enable row level security;

-- Public read-only: anyone may select, nobody but the service role may write.
create policy "Public can read observations"
  on public.observations for select
  to anon, authenticated
  using (true);

revoke insert, update, delete, truncate on public.observations from anon, authenticated;
grant select on public.observations to anon, authenticated;
