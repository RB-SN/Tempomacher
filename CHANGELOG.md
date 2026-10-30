# Versionsverlauf

## 1.7.0 – Oktober 2026

- Dasselbe Profil auf Handy und Laptop: Anmeldung mit Benutzername und Passwort, ohne E-Mail. Jeder Benutzername ist nur einmal möglich; ist er vergeben, schlägt die App Vorname + zweistellige Zahl vor
- Die Daten werden auf dem Gerät verschlüsselt (AES-256-GCM, Schlüssel aus dem Passwort), bevor sie online gespeichert werden; Einrichtung in docs/CLOUD.md, Zugangsdaten in config.js
- Bestehende Profile lassen sich unter Profil → Konto & Geräte mitnehmen
- Automatischer Abgleich mit Offline-Unterstützung; gleichzeitige Einträge werden zusammengeführt
- Ohne Einrichtung bleibt alles wie bisher nur auf dem Gerät

## 1.6.0 – Oktober 2026

- Eigener Knopf «Screenshot hochladen»: nimmt nur Bilder an und öffnet auf dem Handy direkt die Fotos bzw. die Galerie
- «Datei importieren» bleibt für FIT, GPX, TCX und Garmin-ZIP

## 1.5.0 – Oktober 2026

- Screenshots importieren: Bildschirmfotos einer Aktivität (Garmin Connect, Strava, Apple Fitness, Coros, Polar usw.) werden per Texterkennung gelesen. Erkannt werden Datum, Distanz, Zeit, Pace, Puls und Anstieg, aus Runden- bzw. Splits-Tabellen auch Intervalle
- Mehrere Screenshots auf einmal möglich, z. B. Übersicht und Splits
- Dunkle Screenshots werden für die Erkennung automatisch umgekehrt; Lesefehler in Splits-Zeilen werden über Pace × Distanz abgefangen
- Die erkannten Werte landen im Formular und lassen sich vor dem Speichern prüfen

## 1.4.0 – Oktober 2026

- Englische Version: Umschalter DE | EN oben auf der Anmeldeseite und im Profil. Auf Englisch heisst die App «Pacemaker» (auch als Name auf dem Startbildschirm)
- Beim Sprachwechsel wird der Plan ab der laufenden Woche in der neuen Sprache erstellt; bereits erfasste Einträge bleiben unverändert
- Ohne gewählte Sprache richtet sich die App nach der Sprache des Browsers (Deutsch → Deutsch, sonst Englisch)
- Grössere Navigation unten (grössere Symbole, Schrift und Tippfläche)
- App-Icon mit dem Pfeil-Logo auch in der einzelnen HTML-Datei eingebettet; zusätzliches 180-px-Icon im Manifest

## 1.3.0 – Oktober 2026

- Spitzenumfang nach Zielzeit für alle Distanzen (5 km bis 100 km, Zwischendistanzen interpoliert); Erfahrung bestimmt die Position in der Spanne
- Grenzen durch Trainingstage und aktuellen Umfang; Anpassungen bleiben innerhalb der Spanne
- Langer Lauf beim Marathon mind. 28 km (sofern in ca. 3 Stunden machbar), bis 35 km je nach Erfahrung
- Trainingsplan zeigt Spitzenumfang, Richtwert und begrenzenden Faktor

## 1.2.0 – Oktober 2026

- Plananpassung alle zwei Wochen statt wöchentlich, mit Zwischen-Check bei starken Schmerzen oder Krankheit
- Individuelle Empfehlung, wie viele Trainings pro Woche es für das Ziel braucht
- Ziele, die mit zu wenigen Trainings nicht seriös machbar sind, werden nicht geplant (mit Erklärung)
- Vorbereitungsdauer hängt zusätzlich von der Anzahl Trainings pro Woche ab
- Einrichten: Zielrennen kommt vor den Trainingstagen, damit die Empfehlung direkt sichtbar ist

## 1.1.0 – Oktober 2026

- Vorbereitungsdauer neu: Halbmarathon 12–20 Wochen, Marathon 16–32 Wochen; wenig Erfahrung schiebt klar an die obere Grenze, die Differenz zwischen Prognose und Zielzeit zählt stärker
- Einsteiger: Lauf-Geh-Stufen, die nur bei guter Woche weitergehen
- Ohne Referenzzeit: Vorgaben nach Gefühl, Pace nur als Richtwert
- Automatischer Testlauf nach ca. 5 Wochen; die Zeit wird zur Referenz für Zonen
- Gesundheitshinweis vor dem ersten Training

## 1.0.0 – Oktober 2026

Erste Veröffentlichung auf GitHub Pages.

- Konto pro Gerät mit Passwort; mehrere Personen pro Gerät
- Einrichten in 6 Schritten inkl. Trainingstage und Tag für den langen Lauf
- Adaptiver Trainingsplan bis 100 km mit distanzabhängiger Vorbereitungsdauer und allgemeiner Phase davor
- Täglicher Check-in und wöchentliche Anpassung
- Rennen mit Wichtigkeit und Planwahl; Pause nach jedem Rennen
- Training erfassen nach Laufart oder als Datei importieren (FIT, GPX, TCX, Garmin-ZIP) mit automatischer Intervall-Erkennung
- Bearbeiten und Löschen erfasster Trainings
- Form: Wochenumfang als Ziegelmauer, Effizienz-Index, Decoupling, Bestzeiten-Verlauf, Trainingsbelastung, Leistungsindex
- Profil mit Zonen, Leistungsdiagnostik und Bestleistungen
- Erinnerung am Vorabend über Kalenderdatei
- Installierbar als App (Manifest, Icons, Offline-Unterstützung)
