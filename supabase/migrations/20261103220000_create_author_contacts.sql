-- Phase 1 of moving author emails out of the public `authors` table.
-- Safe to apply any time: nothing reads author_contacts yet, and
-- authors.email is left in place until phase 2.

create table public.author_contacts (
  author_id  uuid primary key references public.authors(id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

alter table public.author_contacts enable row level security;

-- Admins (any signed-in user) only. No policy for anon = no public access,
-- and we revoke the default grants too so it doesn't depend on RLS alone.
revoke all on public.author_contacts from anon;

create policy "Authenticated users can manage author contacts"
  on public.author_contacts
  for all
  to authenticated
  using (true)
  with check (true);

insert into public.author_contacts (author_id, email)
select id, email from public.authors
where email is not null;
