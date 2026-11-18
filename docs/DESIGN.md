# Designsystem Tempomacher

Tempomacher soll wie eine moderne Lauf-App wirken: ruhig und aufgeräumt, damit Zahlen und Einheiten im Vordergrund stehen, mit wenigen, klar erkennbaren Laufmotiven.

## Leitlinien

1. **Zahlen zuerst.** Kilometer, Tage bis zum Rennen und Zeiten stehen gross in der Display-Schrift.
2. **Eine Akzentfarbe für Aktionen.** Koralle steht für «jetzt etwas tun» (Training erfassen, Speichern) und für Gelaufenes (Ziegel, Fussspur).
3. **Petrol trägt die Marke.** Countdown, Tageseinheit und Logo stehen auf dem dunklen Petrol.
4. **Laufmotive sparsam.** Fussabdrücke, Laufbahn, Zielflagge, Schuh und Schnürsenkel kommen jeweils nur an einer Stelle mit klarer Bedeutung vor.
5. **Hell und Dunkel gleichwertig.** Jede Farbe ist ein Token mit Wert für beide Modi.

## Farben

### Grundfarben

| Token | Hell | Dunkel | Verwendung |
|---|---|---|---|
| `--bg` | `#F2F5F4` | `#0B1212` | Seitenhintergrund |
| `--surface` | `#FFFFFF` | `#141E1E` | Karten, Formulare |
| `--sunk` | `#E8EEEC` | `#1D2928` | Chips, sekundäre Buttons |
| `--soft` | `#E3F1F0` | `#173130` | Hinweise, Infoboxen, markierte Woche |
| `--ink` | `#11201F` | `#E6EFEE` | Text |
| `--muted` | `#5B6C6A` | `#93A7A5` | Nebentext, Achsen |
| `--line` | `#DCE4E2` | `#263433` | Rahmen, Trennlinien |

### Marke und Aktionen

| Token | Hell | Dunkel | Verwendung |
|---|---|---|---|
| `--band` | `#0E4F54` | `#0F3B3E` | Petrol: Countdown, Tageseinheit, Logo |
| `--band-muted` | `#A8D1CF` | `#8EC3C0` | Text und Linien auf Petrol |
| `--blue` | `#0E6A70` | `#3BB5AC` | Auswahl, Links, sekundäre Aktionen |
| `--hot` | `#FF5A5F` | `#FF6B70` | Koralle: Hauptaktionen, Gelaufenes, Fussspur |

### Trainingszonen

| Zone | Hell | Dunkel | Bedeutung |
|---|---|---|---|
| Z1 `--z1` | `#7D93A8` | `#9AB0C4` | Regeneration |
| Z2 `--z2` | `#2E9E6A` | `#46C08A` | Grundlage |
| Z3 `--z3` | `#D9A21B` | `#F0BE3C` | Marathontempo |
| Z4 `--z4` | `#F07A2A` | `#FF9550` | Schwelle |
| Z5 `--z5` | `#E0405A` | `#FF6680` | VO₂max |

Die Zonenfarben laufen von kühl nach warm. Sie werden nur für Zonen verwendet, nie als Dekoration.

### Status und Spezialfarben

| Token | Hell | Dunkel | Verwendung |
|---|---|---|---|
| `--good` | `#2E9E6A` | `#46C08A` | Verbesserung, «erledigt», Decoupling unter 5 % |
| `--warn` | `#C98A0B` | `#F0BE3C` | Plan zurückgenommen |
| `--bad` | `#D93A4A` | `#FF6680` | Löschen, Verschlechterung |
| `--brick` | `#C2503A` | `#D2684D` | Ziegel der Wochenmauer |
| `--mortar` | `#E3DCD3` | `#2B3433` | Mörtelfugen der Wochenmauer |

### Distanzfarben (Bestzeiten)

`--c1` bis `--c8`, Reihenfolge nach Distanz aufsteigend: Petrol `#0E7C82`, Koralle `#FF5A5F`, Gold `#D99A00`, Violett `#6E59D9`, Grün `#2E9E6A`, Blau `#3B6FB6`, Beere `#C2185B`, Braun `#8A6E57` (im Dunkelmodus jeweils aufgehellt).

## Typografie

| Rolle | Schrift | Gewicht | Einsatz |
|---|---|---|---|
| Display | **Unbounded** (Google Fonts) | 600–700 | Logo, Überschriften, grosse Zahlen (Countdown, Kilometer) |
| Text | **Manrope** (Google Fonts) | 400–800 | Fliesstext, Formulare, Labels, Tabellen |

- Zahlen in Tabellen und Kennzahlen mit `font-variant-numeric: tabular-nums`.
- Labels: 12 px, 700, Grossbuchstaben, Laufweite +0.08em, Farbe `--muted`.
- Grössen: Countdown 68 px, Tageskilometer 58 px, Abschnittstitel 21 px, Kartentitel 17 px, Text 15.5 px, Hinweise 13.5 px.
- Ersatzschriften: `"Arial Black", system-ui` (Display), `system-ui, -apple-system, "Segoe UI"` (Text).

## Form und Abstände

- Eckenradius: Karten `18px` (`--r`), Eingabefelder und kleine Flächen `12px` (`--rs`), Buttons, Chips und Pillen vollständig rund.
- Schatten nur im hellen Modus, sehr dezent: `0 1px 2px` und `0 4px 16px` mit 5–6 % Deckkraft.
- Inhaltsbreite max. 720 px, seitlicher Rand mindestens 16 px (inkl. Safe-Area auf dem Handy).
- Abstände zwischen Karten 16 px, innerhalb von Karten 10–14 px.

## Komponenten

| Komponente | Beschreibung |
|---|---|
| **Kopfzeile** | Logo-Quadrat mit zwei Pfeilen, Name in Unbounded, rechts Konto und «Abmelden». Bleibt beim Scrollen oben. |
| **Countdown (Hero)** | Petrol-Fläche mit Stadion-Laufbahn im Hintergrund, Tage bis zum Rennen, Fussspur als Fortschritt und Zielflagge. Unten ein aufklappbarer Hinweis zur Phase. |
| **Tageseinheit** | Dunkler Kopf mit Kilometern, Titel und dezenter Fussspur; darunter Zone, Pace, Puls und Ablauf als Liste mit Koralle-Punkten. |
| **Karte** | Weiss, Rahmen `--line`, Radius 18 px. |
| **Hinweis / Banner** | Weisse Karte mit farbigem Balken links (grün = ambitionierter, gelb = zurückgenommen, grau = unverändert). |
| **Buttons** | Primär Koralle, sekundär Petrol (`--blue`), neutral `--sunk`, Gefahr `--bad`. Immer rund. |
| **Auswahl-Chips** | Rund mit Rahmen; ausgewählt Petrol gefüllt. Grosse Varianten mit Titel und Erklärung. |
| **Segment-Umschalter** | Graue Kapsel mit weissem aktivem Segment (Training: Erfassen / Trainingsplan / Einträge). |
| **Wochenleiste** | 7 Tageskacheln; der heutige Tag in Petrol, unten ein Farbstreifen in der Zonenfarbe. |
| **Navigation** | 5 Bereiche unten: Übersicht, Training, Form, Rennen, Profil. Der aktive Bereich ist Petrol mit heller Kapsel hinter dem Symbol. |
| **Bottom Sheet** | Von unten einfahrendes Fenster (Radius 24 px) für Erfassen, Import, Tag ansehen. |
| **Icon-Buttons** | Runde 34-px-Buttons für Stift (Bearbeiten) und Papierkorb (Löschen mit Bestätigung in der Karte). |

## Laufmotive

| Motiv | Ort | Bedeutung |
|---|---|---|
| **Fussspur** | Countdown, Tageseinheit, Anmeldung | Fortschritt: farbige Abdrücke = geschafft, blasse = noch vor dir |
| **Stadion-Laufbahn** | Hintergrund des Countdowns | Ovale Bahnen, 5 Linien mit abnehmender Deckkraft |
| **Zielflagge** | Ende der Fussspur im Countdown | Renntag |
| **Zielbanner** | Oberkante der Renn- und Anlass-Karten | Kariert; beim Hauptziel in Koralle |
| **Laufschuh** | Anmeldung, Ruhetag, Navigation «Training» | Eigene Zeichnung (keine Marke), mit Schnürsenkel und Tempolinien |
| **Schnürsenkel** | Schritt-Anzeige beim Einrichten | Ösenpaare; der Schnürsenkel kreuzt die erledigten Schritte |
| **Ziegelmauer** | Wochenumfang (Übersicht, Form) | 1 Ziegel = 1 km, 10 pro Reihe, bündig übereinander; offene Kilometer gestrichelt |
| **Fussabdruck-Paar** | Vor jedem Abschnittstitel | Kennzeichnet Abschnitte |

Motive werden als Inline-SVG mit Farb-Tokens gezeichnet, damit sie im Dunkelmodus automatisch passen.

## Logo und Icons

- Logo: zwei Pfeile nach vorne (hinten Mint `#A8D1CF`, vorne Koralle `#FF5A5F`) auf Petrol `#0E4F54`, Eckenradius ca. 22 %. Bedeutung: der Tempomacher, der vorausläuft.
- App-Icons: `icons/icon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` (mit Schutzzone für Android), `apple-touch-icon.png` (180 px), `favicon-32.png`.
- Symbole in der Navigation: Linien-Icons, 1.9 px Strichstärke, runde Enden.

## Diagramme

- Achsen und Beschriftungen in `--muted`, Gitterlinien `--line`, keine Rahmen.
- Linien 2 px, Punkte klein (Radius 2–3 px); hervorgehobene Punkte (Bestzeit, letzter Wert) etwas grösser.
- Dauerläufe Petrol, Intervalle Koralle, Referenzbereiche (z. B. Decoupling unter 5 %) als leicht grüne Fläche.
- Jede Karte erklärt in einem Satz, was das Diagramm zeigt und was «gut» bedeutet.

## Sprache und Ton

- Deutsch in Schweizer Rechtschreibung (ss statt ß), per Du.
- Kurz und konkret: Knöpfe sagen, was passiert («Training erfassen», «Nicht durchgeführt»).
- Fachbegriffe aus dem Laufsport sind willkommen (Easy Run, Long Run, Schwelle, Decoupling) und werden beim ersten Auftreten erklärt.
- Fehlermeldungen sagen, was falsch ist und wie man es behebt.
