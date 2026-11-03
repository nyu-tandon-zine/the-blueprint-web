-- Phase 2. Apply ONLY after the admin form that writes to author_contacts
-- is deployed to production — the old form still inserts authors.email.

-- Catch any emails added through the old form since phase 1.
insert into public.author_contacts (author_id, email)
select id, email from public.authors
where email is not null
on conflict (author_id) do nothing;

alter table public.authors drop column email;
