# Trainingslogik

So berechnet und passt Tempomacher den Plan an. Alles läuft im Browser, ohne Server und ohne KI-Dienst.

## 1. Leistungsniveau und Zonen

- **Leistungsindex (VDOT)** nach Jack Daniels, aus einer Referenzzeit auf beliebiger Distanz. Ohne Referenzzeit wird er aus Erfahrung, Wochenumfang, Geschlecht und Alter geschätzt.
- **Paces:** locker 62–70 % VO₂max, Marathontempo aus der Marathonprognose, Schwelle 88 %, Intervall 97.5 %.
- **Pulszonen:** in % des Maximalpulses (Schätzung 208 − 0.7 × Alter, wenn kein Wert eingetragen ist): Z1 60–70 %, Z2 68–79 %, Z3 79–86 %, Z4 86–91 %, Z5 91–97 %.
- **Leistungsdiagnostik:** Mit eingetragenen Schwellen (LT1/LT2) oder fünf Zonen aus einem Laktatstufentest bzw. einer Spiroergometrie ersetzen die gemessenen Werte die Schätzungen.
- **Prognosen** gibt es bis zur Marathondistanz.

## 2. Vorbereitungsdauer

| Distanz | Übliche Dauer |
|---|---|
| 5 km | 8–12 Wochen |
| 10 km | 10–16 Wochen |
| Halbmarathon | 12–20 Wochen |
| Marathon | 16–32 Wochen |
| 50 km | 20–34 Wochen |
| 100 km | 24–36 Wochen |

Für Zwischendistanzen wird interpoliert. Die Dauer innerhalb der Spanne hängt ab von der Erfahrung (45 %), der Differenz zwischen Prognose und Zielzeit (30 %) und dem Abstand des jetzigen Umfangs zum nötigen Spitzenumfang (25 %). Dazu kommt die Anzahl Trainings pro Woche im Vergleich zur Empfehlung (siehe Trainingshäufigkeit).

Wenig Erfahrung schiebt die Dauer klar nach oben: ohne Lauferfahrung mindestens 85 % der Spanne (Halbmarathon ca. 19–20 Wochen), mit wenig Erfahrung mindestens 60 %. Das Minimum (z. B. 12 Wochen Halbmarathon, 16 Wochen Marathon) gilt nur bei viel Erfahrung, strukturiertem Training mit passendem Umfang und realistischer Zielzeit.

Liegt das Rennen weiter weg, gibt es davor eine **allgemeine Phase**:
- **Fitnessaufbau:** Steigerung um rund 6 % pro Woche bis zum Einstiegsniveau.
- **Fitnesserhaltung:** reduzierter Umfang, langer Lauf nur jede zweite Woche (max. ca. 75 min), Spasstraining, freiwilliges Alternativtraining, lockere Läufe nach Gefühl.

In den 2 Wochen vor der Zielvorbereitung steigt der Umfang wieder an.

## 3. Trainingshäufigkeit

Für jedes Ziel berechnet die App eine Mindest- und eine empfohlene Anzahl Trainings pro Woche:

| Distanz | Minimum | Empfehlung (Basis) |
|---|---|---|
| 5 km | 2 | 3 |
| 10 km | 2 | 3 |
| Halbmarathon | 3 | 4 |
| Marathon | 3 | 4 |
| 50 km und mehr | 4 | 5 |

- **Ohne Lauferfahrung:** ab Halbmarathon mindestens 3, beim Marathon mindestens 4 Trainings.
- **Ambitionierte Zielzeit:** liegt das Ziel mehr als 4 % über der Prognose, +1 Training empfohlen, ab 10 % +2.
- **Viel Erfahrung und Zielzeit schneller als die Prognose** (ab Halbmarathon): +1 Training empfohlen, sofern die Empfehlung noch unter 5 liegt.
- **Unter dem Minimum** erstellt die App keinen Plan für das Ziel und erklärt, warum (z. B. Marathon mit 1 Training pro Woche). Das gilt beim Einrichten, beim Eintragen eines Rennens mit eigenem Plan und beim Ändern der Trainingstage.
- **Unter der Empfehlung** wird die Vorbereitung länger: pro fehlendem Training rückt die Dauer um 15 % der Spanne nach oben, höchstens um 45 %. Mehr Trainings als empfohlen verkürzen sie leicht, um höchstens 10 %.

## 4. Einsteiger

- **Lauf-Geh-Stufen:** Ohne Lauferfahrung oder mit weniger als 10 km pro Woche beginnt der Plan im Lauf-Geh-Wechsel:

  | Stufe | Laufen | Gehen |
  |---|---|---|
  | 1 | 1 min | 1.5 min |
  | 2 | 2 min | 1 min |
  | 3 | 3 min | 1 min |
  | 4 | 5 min | 1 min |
  | 5 | 8 min | 1 min |
  | 6 | 12 min | 1 min |
  | 7 | 20 min | 1 min |

  Danach läufst du am Stück. Eine Stufe weiter geht es nur, wenn die Woche gut lief: mindestens 2 Läufe, durchschnittliche Anstrengung höchstens 5/10, keine Schmerzen, keine Rücknahme des Plans. Sonst bleibt die Stufe eine weitere Woche. Solange Lauf-Geh-Training läuft, gibt es keine harten Einheiten.
- **Nach Gefühl statt nach Pace:** Ohne Referenzzeit zeigt die App bei lockeren Läufen «Nach Gefühl: Plaudertempo». Die geschätzte Pace steht nur als grober Richtwert («ca.») daneben.
- **Testlauf:** Ohne Referenzzeit plant die App in Woche 5 (Einsteiger Woche 6) einen Testlauf über 3 km (Einsteiger) bzw. 5 km ein. Die eingetragene Zeit wird automatisch zur Referenz für Pace und Zonen und als Bestleistung gespeichert. Wird der Test ausgelassen, rückt er in die nächste passende Woche.
- **Gesundheitshinweis:** Vor dem ersten Training weist die App auf eine ärztliche Abklärung bei Vorbelastungen hin.

## 5. Zielvorbereitung

- **Phasen:** Grundlage → Aufbau → Spezifisch → Tapering (1–3 Wochen je nach Distanz und Erfahrung).
- **Entlastungswochen:** jede 4. Woche, bei Einsteigern und ab 50 Jahren jede 3. Woche (ca. −25 % Umfang).
- **Steigerung:** 7 % (wenig Erfahrung) bzw. 9 % pro Woche bis zum Spitzenumfang.
- **Harte Einheiten:** 0–2 pro Woche je nach Phase, Erfahrung und Anzahl Trainingstage. Sie liegen möglichst weit weg vom langen Lauf und voneinander.
- **Rennwoche:** Vorbelastung am Vortag, Ruhetag zwei Tage vorher, kurze Renntempo-Schärfung.

### Spitzenumfang nach Zielzeit

Der höchste Wochenumfang richtet sich nach der Zielzeit (ohne Zielzeit nach der Prognose), wie in gängigen Trainingsplänen. Die Werte sind Richtwerte in km pro Woche.

| 5 km | Spitzenumfang |
|---|---|
| unter 18:00 | 55–70 |
| 18:00–20:00 | 45–60 |
| 20:00–22:00 | 38–50 |
| 22:00–25:00 | 30–40 |
| 25:00–28:00 | 25–32 |
| über 28:00 | 18–25 |

| 10 km | Spitzenumfang |
|---|---|
| unter 37:00 | 65–80 |
| 37–41 min | 55–70 |
| 41–45 min | 45–58 |
| 45–50 min | 38–48 |
| 50–55 min | 30–40 |
| über 55 min | 25–32 |

| Halbmarathon | Spitzenumfang |
|---|---|
| unter 1:22 | 75–95 |
| 1:22–1:30 | 65–80 |
| 1:30–1:40 | 55–70 |
| 1:40–1:50 | 45–58 |
| 1:50–2:05 | 38–48 |
| über 2:05 | 30–40 |

| Marathon | Spitzenumfang |
|---|---|
| unter 3:00 | 90–110 |
| 3:00–3:15 | 80–95 |
| 3:15–3:30 | 70–85 |
| 3:30–3:45 | 60–75 |
| 3:45–4:15 | 50–65 |
| über 4:15 | 45–55 |

| 50 km | Spitzenumfang |
|---|---|
| unter 3:45 | 95–115 |
| 3:45–4:30 | 80–100 |
| 4:30–5:30 | 70–90 |
| 5:30–6:30 | 60–80 |
| über 6:30 | 55–70 |

| 100 km | Spitzenumfang |
|---|---|
| unter 8 h | 120–150 |
| 8–10 h | 100–130 |
| 10–12 h | 85–110 |
| 12–14 h | 75–95 |
| über 14 h | 65–85 |

- **Andere Distanzen** (z. B. 15 km, 25 km, 30 km): Die App rechnet die Zielzeit auf das gleiche Leistungsniveau der benachbarten Distanzen um und interpoliert die Spannweiten dazwischen.
- **Position in der Spanne nach Erfahrung:** keine = unteres Ende, wenig = 30 %, viel = 65 %, sehr viel = oberes Ende.
- **Grenze durch die Trainingstage:** höchstens langer Lauf + 14 km pro weiteres Training (Ultra: 16 km).
- **Grenze durch den aktuellen Umfang:** höchstens das 1.5-Fache des heutigen Wochenumfangs. Wer heute schon mehr läuft als die Spanne, bleibt bis zur Obergrenze auf seinem Niveau.
- **Anpassungen** (+5 % nach guten Wochen) dürfen die Obergrenze der Spanne und die Grenze durch die Trainingstage nicht überschreiten.
- Unter «Training → Trainingsplan» zeigt die App den geplanten Spitzenumfang, den Richtwert und, falls zutreffend, was ihn begrenzt.

### Langer Lauf

| Distanz | Maximum (keine / wenig / viel / sehr viel Erfahrung) |
|---|---|
| 5 km | 10 / 12 / 15 / 16 km |
| 10 km | 12 / 15 / 18 / 20 km |
| Halbmarathon | 15 / 19 / 22 / 24 km |
| Marathon | 28 / 30 / 32 / 35 km |
| 50 km | 28 / 32 / 36 / 40 km |
| 100 km | 30 / 36 / 42 / 48 km |

- Zeitliche Grenze: höchstens 3 Stunden (Ultra 4 Stunden, Einsteiger bis Halbmarathon 2.5 Stunden) im lockeren Tempo. Bei langsameren Läufern kann der lange Lauf beim Marathon deshalb unter 28 km bleiben.
- Ab Marathon erreicht der lange Lauf das Maximum in der spezifischen Phase. In der Aufbauphase steigt er von etwa 72 % auf 90 % davon, unabhängig vom Anteil am Wochenumfang.

## 6. Rennen

Für jedes Rennen wird angegeben, wie wichtig es ist (Saisonhöhepunkt, Wichtig, Nebensache) und ob es einen eigenen Plan bekommt, in den laufenden Plan eingebaut wird (2–3 Tage Tapering) oder aus dem Training heraus gelaufen wird.

**Nach jedem Rennen** folgt eine Pause, unabhängig von dieser Wahl:

| Distanz | Tage ohne Laufen | Tage ohne Intensität | Umfang danach startet bei |
|---|---|---|---|
| bis 6 km | 1 | 3 | 75 % |
| bis 11 km | 2 | 4 | 75 % |
| bis 22 km | 3 | 8 | 60 % |
| bis 43 km | 7 | 15 | 45 % |
| bis 60 km | 9 | 17–20 | 35 % |
| darüber | 14 | 34 | 35 % |

Grundlage ist die Faustregel von Daniels: ein Tag ohne Intensität pro 3 km Renndistanz. An den Tagen ohne Laufen sind nur leichte Gymnastik, Mobilisation und Spazieren vorgesehen.

## 7. Tägliche Anpassung (Check-in)

| Check-in | Anpassung |
|---|---|
| Starke Schmerzen | Pause, Hinweis auf ärztliche Abklärung |
| Leichte Schmerzen | Ohne Intensität, ca. 75 % Umfang |
| Gefühl «ok» | Eine Wiederholung weniger |
| Gefühl «naja» | Locker statt hart, ca. 80 % Umfang |
| Gefühl «schlecht» | Höchstens kurzer Regenerationslauf |

Zusätzlich wird eine harte Einheit locker, wenn der Vortag deutlich anstrengender war als geplant.

## 8. Anpassung alle zwei Wochen

Alle zwei Wochen (gezählt ab Planstart) werden die letzten 14 Tage ausgewertet: absolvierte Einheiten, Anstrengung im Vergleich zur Erwartung, Puls, Check-ins, Schmerzen und Krankheit. Zwei Wochen ergeben eine breitere, stabilere Grundlage als eine einzelne Woche.

- **Ambitionierter:** Umfang +5 % (max. +12 % gegenüber dem Grundplan).
- **Zurückgenommen:** Umfang −12 % (min. −30 %).
- **Unverändert:** Ein vorher reduzierter Umfang nähert sich wieder dem Plan.
- **Paces:** Sind Tempoeinheiten bei passender Anstrengung schneller als vorgegeben, steigt der Leistungsindex, und alle Paces werden schneller. Bei gemessenen Zonen aus der Leistungsdiagnostik bleiben die Zonen fix.
- **Zwischen-Check:** In der Woche dazwischen wird nur bei klaren Warnzeichen eingegriffen (starke Schmerzen, mehrere Krankheitstage): Der Umfang sinkt sofort, erhöht wird nie.
- **Täglich** bleibt die Anpassung an den Check-in bestehen, die Lauf-Geh-Stufen gehen weiterhin wöchentlich weiter.

## 9. Import und Intervall-Erkennung

Unterstützte Formate sind FIT, GPX, TCX und ZIP aus Garmin Connect. Die Intervall-Erkennung prüft in dieser Reihenfolge:

1. Runden, die die Uhr als Belastung oder Pause markiert hat.
2. Manuelle Runden, die schnell und langsam abwechseln (Tempounterschied mindestens 18 %).
3. Tempowechsel im Verlauf: Zwei Tempo-Gruppen mit mindestens 20 % Unterschied, mindestens 3 Abschnitte von 40 s oder länger, die zusammen mindestens 4 Minuten ergeben.

Gelten die Abschnitte als Intervalle, zählen nur die Belastungsphasen. Beim Puls werden die ersten bis zu 30 s jeder Wiederholung ausgelassen, weil der Puls verzögert ansteigt.

## 10. Formwerte

- **Effizienz-Index** = Geschwindigkeit (km/h) ÷ genutzte Herzfrequenzreserve, also (HF − Ruhepuls) ÷ (HFmax − Ruhepuls). Dauerläufe werden höhenbereinigt, bei Intervallen zählen nur die Belastungsphasen. Bergintervalle und Wettkämpfe fliessen nicht ein.
- **Decoupling** (Long Runs über 15 km): Verhältnis Tempo/Puls in der 1. gegen die 2. Hälfte, nach 10 Minuten Einlaufen. Unter 5 % gilt als gute aerobe Grundlage.
- **Trainingsbelastung:** Dauer × Anstrengung (Session-RPE nach Foster), verglichen mit dem Schnitt der 4 Wochen davor. Ein Verhältnis von 0.8–1.3 gilt als sicher.
- **Wochenumfang:** Ziegelmauer der letzten 4 Wochen.

## 11. Grenzen

- Die Logik ersetzt keinen Trainer und keine medizinische Abklärung.
- Ohne Pulsdaten fehlen Effizienz und Decoupling.
- Höhenmeter werden beim Decoupling nicht herausgerechnet; hügelige Long Runs können den Wert verfälschen.
