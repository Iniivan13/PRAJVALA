-- ============================================================================
-- PRAJVALA — Supabase schema
-- Jalankan seluruh file ini di Supabase Dashboard → SQL Editor → New query.
-- Aman dijalankan ulang (idempotent) untuk tabel, indeks, dan kebijakan dasar.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Profil warga
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 3 and 80),
  region_id text not null default 'all',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select, insert, update on public.profiles to authenticated;

-- Profil otomatis dibuat saat user mendaftar.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, region_id)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(coalesce(new.email, 'warga'), '@', 1)
    ),
    coalesce(nullif(new.raw_user_meta_data ->> 'region_id', ''), 'all')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Profil untuk user yang sudah ada sebelum skema ini dipasang.
insert into public.profiles (id, full_name, region_id)
select
  id,
  coalesce(
    nullif(raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(email, 'warga'), '@', 1)
  ),
  coalesce(nullif(raw_user_meta_data ->> 'region_id', ''), 'all')
from auth.users
on conflict (id) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. Laporan warga
-- Nama pelapor disimpan dalam bentuk tersamar ("Rina K.") dari aplikasi.
-- ----------------------------------------------------------------------------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  project_id text not null,
  author_id uuid references auth.users (id) on delete set null,
  author_name text not null check (char_length(author_name) between 3 and 80),
  suitability text not null check (
    suitability in ('Sesuai Target', 'Terlambat', 'Indikasi Kejanggalan')
  ),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 20 and 600),
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists reports_project_created_idx
  on public.reports (project_id, created_at desc);

create index if not exists reports_author_created_idx
  on public.reports (author_id, created_at desc);

alter table public.reports enable row level security;

drop policy if exists "reports_read_all" on public.reports;
create policy "reports_read_all"
  on public.reports for select
  to anon, authenticated
  using (true);

drop policy if exists "reports_insert_valid" on public.reports;
create policy "reports_insert_valid"
  on public.reports for insert
  to anon, authenticated
  with check (
    (author_id is null or author_id = (select auth.uid()))
    and rating between 1 and 5
    and char_length(comment) between 20 and 600
  );

drop policy if exists "reports_delete_own" on public.reports;
create policy "reports_delete_own"
  on public.reports for delete
  to authenticated
  using (author_id = (select auth.uid()));

grant select, insert on public.reports to anon, authenticated;
grant delete on public.reports to authenticated;

-- ----------------------------------------------------------------------------
-- 3. Dukungan / upvote laporan
-- Dukungan tamu tetap disimpan lokal di perangkat; user yang masuk tersinkron.
-- ----------------------------------------------------------------------------
create table if not exists public.report_votes (
  report_id text not null,
  voter_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (report_id, voter_id)
);

create index if not exists report_votes_report_idx
  on public.report_votes (report_id);

create index if not exists report_votes_voter_idx
  on public.report_votes (voter_id);

alter table public.report_votes enable row level security;

drop policy if exists "report_votes_read_all" on public.report_votes;
create policy "report_votes_read_all"
  on public.report_votes for select
  to anon, authenticated
  using (true);

drop policy if exists "report_votes_insert_own" on public.report_votes;
create policy "report_votes_insert_own"
  on public.report_votes for insert
  to authenticated
  with check (voter_id = (select auth.uid()));

drop policy if exists "report_votes_delete_own" on public.report_votes;
create policy "report_votes_delete_own"
  on public.report_votes for delete
  to authenticated
  using (voter_id = (select auth.uid()));

grant select on public.report_votes to anon, authenticated;
grant insert, delete on public.report_votes to authenticated;

create or replace view public.report_vote_counts
with (security_invoker = true)
as
select report_id, count(*)::int as votes
from public.report_votes
group by report_id;

grant select on public.report_vote_counts to anon, authenticated;

-- Bersihkan suara ketika laporan database dihapus.
create or replace function public.cleanup_report_votes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.report_votes where report_id = old.id::text;
  return old;
end;
$$;

drop trigger if exists reports_cleanup_votes on public.reports;
create trigger reports_cleanup_votes
  after delete on public.reports
  for each row execute function public.cleanup_report_votes();

revoke all on function public.cleanup_report_votes() from public, anon, authenticated;

-- ----------------------------------------------------------------------------
-- 4. Hapus akun mandiri
-- Pengguna terautentikasi dapat menghapus auth.users miliknya sendiri.
-- Laporan tetap tersimpan sebagai laporan anonim (author_id menjadi null).
-- ----------------------------------------------------------------------------
create or replace function public.delete_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Pengguna belum terautentikasi';
  end if;
  delete from auth.users where id = (select auth.uid());
end;
$$;

revoke all on function public.delete_user() from public;
revoke all on function public.delete_user() from anon;
grant execute on function public.delete_user() to authenticated;

-- Selesai. Verifikasi cepat:
--   select * from public.profiles limit 1;
--   select * from public.reports limit 1;
--   select * from public.report_vote_counts limit 1;
