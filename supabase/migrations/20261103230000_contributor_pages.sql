-- Contributor pages: author slugs + many-to-many work credits.
-- Additive. Apply BEFORE deploying the code that reads work_authors.
-- works.author_id is kept for now (production code still reads it) and is
-- dropped in a later migration once everything reads work_authors.

begin;

-- 1. Remove work-less test authors ("G" x3, "Garrik"). The works check makes
--    this a no-op for anyone who has actually been published.
delete from public.authors a
where a.name in ('G', 'Garrik')
  and not exists (select 1 from public.works w where w.author_id = a.id);

-- 2. Slugs ------------------------------------------------------------------
create or replace function public.slugify(input text)
returns text language sql immutable as $$
  select coalesce(
    nullif(trim(both '-' from regexp_replace(lower(input), '[^a-z0-9]+', '-', 'g')), ''),
    'contributor'
  )
$$;

alter table public.authors add column slug text;

-- Backfill: duplicate names get -2, -3, ... in a stable order.
with ranked as (
  select id, public.slugify(name) as base,
         row_number() over (partition by public.slugify(name) order by id) as n
  from public.authors
)
update public.authors a
set slug = case when r.n = 1 then r.base else r.base || '-' || r.n end
from ranked r
where r.id = a.id;

alter table public.authors alter column slug set not null;
alter table public.authors add constraint authors_slug_key unique (slug);

-- New authors get a unique slug automatically (admin form, dashboard, anything).
-- Insert-only on purpose: renaming someone must not break their URL.
create or replace function public.set_author_slug()
returns trigger language plpgsql as $$
declare
  base text := public.slugify(new.name);
  candidate text := base;
  n int := 1;
begin
  if new.slug is not null and new.slug <> '' then
    return new;
  end if;
  while exists (select 1 from public.authors where slug = candidate) loop
    n := n + 1;
    candidate := base || '-' || n;
  end loop;
  new.slug := candidate;
  return new;
end
$$;

create trigger authors_set_slug
  before insert on public.authors
  for each row execute function public.set_author_slug();

-- 3. Credits (many-to-many) ---------------------------------------------------
create table public.work_authors (
  work_id   uuid not null references public.works(id)   on delete cascade,
  author_id uuid not null references public.authors(id) on delete cascade,
  position  int  not null default 0,   -- byline order, 0 first
  role      text,                      -- e.g. 'music', 'director'; null = plain author
  primary key (work_id, author_id)
);
create index work_authors_author_id_idx on public.work_authors(author_id);

alter table public.work_authors enable row level security;

create policy "Public can read work authors"
  on public.work_authors for select
  to public
  using (true);

create policy "Authenticated users can manage work authors"
  on public.work_authors for all
  to authenticated
  using (true) with check (true);

insert into public.work_authors (work_id, author_id, position)
select id, author_id, 0 from public.works
where author_id is not null;

-- 4. Atomic "replace this work's credits" for the admin forms -----------------
-- One transaction: delete old rows, insert new ones in order, keep the legacy
-- works.author_id pointing at the first author. If anything fails, nothing
-- changes — a work can't end up with zero authors halfway through a save.
-- security invoker = runs as the caller, so the RLS policies above still apply.
create or replace function public.set_work_credits(
  p_work_id uuid,
  p_author_ids uuid[],
  p_roles text[]
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if coalesce(array_length(p_author_ids, 1), 0) = 0 then
    raise exception 'A work needs at least one author';
  end if;

  delete from public.work_authors where work_id = p_work_id;

  insert into public.work_authors (work_id, author_id, position, role)
  select p_work_id, a.id, (a.ord - 1)::int, nullif(trim(p_roles[a.ord]), '')
  from unnest(p_author_ids) with ordinality as a(id, ord);

  update public.works set author_id = p_author_ids[1] where id = p_work_id;
end
$$;

revoke execute on function public.set_work_credits(uuid, uuid[], text[]) from public, anon;
grant execute on function public.set_work_credits(uuid, uuid[], text[]) to authenticated;

commit;
