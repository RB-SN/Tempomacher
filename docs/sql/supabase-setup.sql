-- Tempomacher: Online-Speicher für Benutzername + Passwort (Daten Ende-zu-Ende verschlüsselt)
-- Kann mehrmals ausgeführt werden; bestehende Daten bleiben erhalten.
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
-- Schutz gegen Passwort-Raten: Fehlversuche zählen, danach Sperre
alter table public.tm_users add column if not exists failed int not null default 0;
alter table public.tm_users add column if not exists locked_until timestamptz;

-- kein direkter Zugriff auf die Tabelle, nur über die Funktionen unten
alter table public.tm_users enable row level security;
revoke all on table public.tm_users from anon, authenticated;

-- interne Prüfung: 1 = richtig, 0 = falsch oder unbekannt, negativ = gesperrt (Minuten)
-- nach 10 Fehlversuchen 15 Minuten Sperre, ab 20 Fehlversuchen 60 Minuten; Erfolg setzt den Zähler zurück
create or replace function public.tm_check(p_user text, p_verifier text)
returns int language plpgsql security definer set search_path = public, extensions as $$
declare r public.tm_users%rowtype;
begin
  select * into r from public.tm_users where username = lower(trim(p_user)) for update;
  if not found then return 0; end if;
  if r.locked_until is not null and r.locked_until > now() then
    return -greatest(1, ceil(extract(epoch from (r.locked_until - now())) / 60)::int);
  end if;
  if r.verifier = crypt(coalesce(p_verifier, ''), r.verifier) then
    if r.failed > 0 or r.locked_until is not null then
      update public.tm_users set failed = 0, locked_until = null where username = r.username;
    end if;
    return 1;
  end if;
  update public.tm_users
     set failed = r.failed + 1,
         locked_until = case when r.failed + 1 >= 20 then now() + interval '60 minutes'
                             when r.failed + 1 >= 10 then now() + interval '15 minutes'
                             else null end
   where username = r.username;
  return 0;
end $$;

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
declare c int; r public.tm_users%rowtype;
begin
  c := public.tm_check(p_user, p_verifier);
  if c < 0 then return jsonb_build_object('locked', true, 'minutes', -c); end if;
  if c = 0 then return null; end if;
  select * into r from public.tm_users where username = lower(trim(p_user));
  return jsonb_build_object('data', r.data, 'updated', r.updated_at);
end $$;

-- Rückgabe: true = gespeichert, false = falsches Passwort, null = gesperrt
create or replace function public.tm_save(p_user text, p_verifier text, p_data jsonb, p_updated bigint)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare c int;
begin
  c := public.tm_check(p_user, p_verifier);
  if c < 0 then return null; end if;
  if c = 0 then return false; end if;
  update public.tm_users set data = p_data, updated_at = p_updated where username = lower(trim(p_user));
  return true;
end $$;

create or replace function public.tm_delete(p_user text, p_verifier text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare c int;
begin
  c := public.tm_check(p_user, p_verifier);
  if c < 0 then return null; end if;
  if c = 0 then return false; end if;
  delete from public.tm_users where username = lower(trim(p_user));
  return true;
end $$;

-- Passwort ändern: altes Passwort prüfen, neuen Prüfwert und neu verschlüsselte Daten speichern
-- Rückgabe: true = geändert, false = altes Passwort falsch, null = gesperrt
create or replace function public.tm_change(p_user text, p_verifier text, p_new_verifier text, p_data jsonb, p_updated bigint)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare c int;
begin
  if p_new_verifier is null or length(p_new_verifier) <> 64 then return false; end if;
  c := public.tm_check(p_user, p_verifier);
  if c < 0 then return null; end if;
  if c = 0 then return false; end if;
  update public.tm_users
     set verifier = crypt(p_new_verifier, gen_salt('bf', 8)), data = p_data, updated_at = coalesce(p_updated, 0)
   where username = lower(trim(p_user));
  return true;
end $$;

revoke all on function public.tm_check(text, text) from public, anon, authenticated;
revoke all on function public.tm_available(text), public.tm_register(text, text, jsonb, bigint),
  public.tm_load(text, text), public.tm_save(text, text, jsonb, bigint), public.tm_delete(text, text),
  public.tm_change(text, text, text, jsonb, bigint) from public;
grant execute on function public.tm_available(text), public.tm_register(text, text, jsonb, bigint),
  public.tm_load(text, text), public.tm_save(text, text, jsonb, bigint), public.tm_delete(text, text),
  public.tm_change(text, text, text, jsonb, bigint) to anon, authenticated;
