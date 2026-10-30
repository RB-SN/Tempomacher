-- Tempomacher: Online-Speicher für Benutzername + Passwort (Daten Ende-zu-Ende verschlüsselt)
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.tm_users (
  username   text primary key,
  verifier   text not null,                 -- bcrypt-Hash eines Prüfwerts, der auf dem Gerät aus dem Passwort abgeleitet wird
  data       jsonb,                         -- auf dem Gerät verschlüsselte Daten {v, iv, ct}; ohne Passwort unlesbar
  updated_at bigint not null default 0,
  created_at timestamptz not null default now(),
  constraint tm_users_username_ok check (username = lower(username) and char_length(username) between 3 and 30 and username !~ '\s'),
  constraint tm_users_size_ok check (data is null or octet_length(data::text) < 3000000)
);

-- kein direkter Zugriff auf die Tabelle, nur über die Funktionen unten
alter table public.tm_users enable row level security;
revoke all on table public.tm_users from anon, authenticated;

create or replace function public.tm_available(p_user text)
returns boolean language sql stable security definer set search_path = public, extensions as $$
  select not exists (select 1 from public.tm_users where username = lower(trim(p_user)));
$$;

create or replace function public.tm_register(p_user text, p_verifier text, p_data jsonb, p_updated bigint)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  if p_verifier is null or length(p_verifier) <> 64 then return false; end if;
  insert into public.tm_users (username, verifier, data, updated_at)
  values (lower(trim(p_user)), crypt(p_verifier, gen_salt('bf', 8)), p_data, coalesce(p_updated, 0));
  return true;
exception when unique_violation then
  return false;
end $$;

create or replace function public.tm_load(p_user text, p_verifier text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare r public.tm_users%rowtype;
begin
  select * into r from public.tm_users where username = lower(trim(p_user));
  if not found or r.verifier <> crypt(coalesce(p_verifier, ''), r.verifier) then return null; end if;
  return jsonb_build_object('data', r.data, 'updated', r.updated_at);
end $$;

create or replace function public.tm_save(p_user text, p_verifier text, p_data jsonb, p_updated bigint)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  update public.tm_users set data = p_data, updated_at = p_updated
   where username = lower(trim(p_user)) and verifier = crypt(coalesce(p_verifier, ''), verifier);
  return found;
end $$;

create or replace function public.tm_delete(p_user text, p_verifier text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  delete from public.tm_users
   where username = lower(trim(p_user)) and verifier = crypt(coalesce(p_verifier, ''), verifier);
  return found;
end $$;

revoke all on function public.tm_available(text), public.tm_register(text, text, jsonb, bigint),
  public.tm_load(text, text), public.tm_save(text, text, jsonb, bigint), public.tm_delete(text, text) from public;
grant execute on function public.tm_available(text), public.tm_register(text, text, jsonb, bigint),
  public.tm_load(text, text), public.tm_save(text, text, jsonb, bigint), public.tm_delete(text, text) to anon, authenticated;
