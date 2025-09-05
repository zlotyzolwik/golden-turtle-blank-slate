
-- 1) Pozwól zalogowanym użytkownikom wstawiać własny profil (bez tworzenia triggera w schemacie auth)
alter table public.profiles enable row level security;

drop policy if exists "Users can insert own profile" on public.profiles;

create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- 2) Backfill: utwórz brakujące rekordy w public.profiles na podstawie auth.users
insert into public.profiles (id, email, first_name, last_name)
select u.id, u.email, null, null
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 3) Bootstrap admin: ustaw 'admin' dla pierwszego zarejestrowanego użytkownika
update public.profiles p
set role = 'admin'
where p.id = (
  select u.id
  from auth.users u
  order by u.created_at asc
  limit 1
)
and p.role <> 'admin';
