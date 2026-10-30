# Dasselbe Profil auf Handy und Laptop

Ohne diese Einrichtung bleibt jedes Profil auf dem Gerät, auf dem es erstellt wurde. Mit ihr meldest du dich überall mit **Benutzername und Passwort** an und hast denselben Plan und dieselben Einträge.

## So sind die Daten geschützt

- **Nur Benutzername und Passwort**, keine E-Mail-Adresse. Jeder Benutzername ist nur einmal möglich; ist er vergeben, schlägt die App Vorname + zweistellige Zahl vor (z. B. «Ramon27»).
- **Verschlüsselung auf dem Gerät:** Bevor etwas das Gerät verlässt, verschlüsselt die App alle Daten (AES-256-GCM) mit einem Schlüssel, der aus deinem Passwort abgeleitet wird (PBKDF2, 310 000 Runden). Online liegt nur ein unlesbarer Datenblock. Weder Supabase noch der Betreiber der Seite können Puls-, Befindens- oder Trainingsdaten lesen.
- **Das Passwort verlässt das Gerät nie.** Zur Anmeldung schickt die App nur einen daraus abgeleiteten Prüfwert; gespeichert wird davon nur ein bcrypt-Hash.
- **Kein direkter Tabellenzugriff:** Die Tabelle ist gesperrt; lesen und schreiben geht nur über Funktionen, die Benutzername und Prüfwert verlangen.
- **Folge davon:** Ein vergessenes Passwort lässt sich nicht zurücksetzen. Die Daten auf einem Gerät, auf dem du noch angemeldet bist, bleiben aber erhalten.

Online gespeichert werden: Benutzername, Prüfwert-Hash, der verschlüsselte Datenblock, Zeitpunkt der letzten Änderung.

## Einrichtung (einmalig, ca. 10 Minuten)

### 1. Supabase-Projekt erstellen

1. Auf [supabase.com](https://supabase.com) ein Konto erstellen und **New project** wählen.
2. Name z. B. `tempomacher`, ein Datenbank-Passwort festlegen (wird später nicht gebraucht, gut aufbewahren).
3. **Region:** in Europa, z. B. *Central EU (Zurich)* oder *Central EU (Frankfurt)*.
4. **Create new project** und warten, bis das Projekt bereit ist.

### 2. Tabelle und Funktionen anlegen

**SQL Editor → New query**, den ganzen Text aus [`sql/supabase-setup.sql`](sql/supabase-setup.sql) einfügen und **Run** drücken. Er steht auch hier:

```sql
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
```

Das Skript kann bei Bedarf nochmals ausgeführt werden; bestehende Daten bleiben erhalten.

### 3. Zugangsdaten in `config.js` eintragen

1. In Supabase oben auf **Connect** klicken (oder **Project Settings → API Keys**).
2. Die **Project URL** kopieren, z. B. `https://abcdefgh.supabase.co`.
3. Den **Publishable key** kopieren (beginnt mit `sb_publishable_`). Bei älteren Projekten heisst er «anon public».
4. Auf GitHub im Repository die Datei `config.js` öffnen → Stift-Symbol → die beiden Werte eintragen:
   ```js
   window.TM_CLOUD = {
     url: "https://abcdefgh.supabase.co",
     key: "sb_publishable_..."
   };
   ```
5. **Commit changes**. Nach 1–2 Minuten ist die Änderung online.

Der Publishable- bzw. anon-Key ist dafür gemacht, öffentlich in einer Webseite zu stehen. Den **secret**- bzw. **service_role**-Key niemals eintragen.

## Nutzen

- **Neues Profil:** Benutzername (3–30 Zeichen, ohne Leerzeichen) und Passwort (mind. 8 Zeichen) wählen.
- **Bestehendes Profil mitnehmen:** Auf dem Gerät mit dem Profil anmelden → **Profil → Konto & Geräte → Auf allen Geräten nutzen** → Benutzername und Passwort festlegen. Plan und Einträge werden verschlüsselt hochgeladen.
- **Auf dem zweiten Gerät:** Seite öffnen → **Anmelden** → Benutzername und Passwort. «Angemeldet bleiben» ankreuzen, dann bleibst du angemeldet.

Der Abgleich läuft automatisch: kurz nach dem Speichern, beim Öffnen der App und beim Zurückwechseln in die App. Oben neben dem Namen steht «synchronisiert ✓». Ohne Internet speichert die App lokal und gleicht später ab; ein Profil, das schon auf dem Gerät ist, lässt sich auch offline öffnen. Wurde auf zwei Geräten gleichzeitig etwas erfasst, werden die Einträge zusammengeführt.

## Gut zu wissen

- **Kostenloser Plan:** Supabase pausiert kostenlose Projekte nach etwa einer Woche ohne Zugriff. Bei regelmässiger Nutzung passiert das nicht; ein pausiertes Projekt startest du im Supabase-Dashboard mit einem Klick wieder.
- **Konto löschen:** **Profil → Konto löschen** entfernt die Daten auf dem Gerät und im Online-Speicher.
- **Einzelne HTML-Datei:** `tempomacher.html` enthält oben im Code denselben Block `window.TM_CLOUD = {...}`. Einfacher ist aber die GitHub-Seite, weil sie auf allen Geräten dieselbe Adresse hat.
