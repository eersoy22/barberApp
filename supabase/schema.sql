-- Run in Supabase SQL Editor.

create table if not exists appointments (
  id text primary key,
  name text not null,
  phone text default '',
  service_id text,
  service text,
  barber_id text not null,
  barber text,
  date text not null,
  time text not null,
  note text default '',
  created_at timestamptz not null default now()
);

create unique index if not exists idx_appointment_slot
  on appointments (date, barber_id, time);

alter table appointments enable row level security;

create policy "appointments_select"
  on appointments for select
  using (true);

create policy "appointments_insert"
  on appointments for insert
  with check (true);

create policy "appointments_delete"
  on appointments for delete
  using (true);
