# Trainingslogik

So berechnet und passt Tempomacher den Plan an. Alles läuft im Browser, ohne Server und ohne KI-Dienst.

## 1. Leistungsniveau und Zonen

- **Leistungsindex (VDOT)** nach Jack Daniels, aus einer Referenzzeit auf beliebiger Distanz. Ohne Referenzzeit wird er aus Erfahrung, Wochenumfang, Geschlecht und Alter geschätzt.
- **Paces:** locker 62–70 % VO₂max, Marathontempo aus der Marathonprognose, Schwelle 88 %, Intervall 97.5 %.
- **Pulszonen:** in % des Maximalpulses (Schätzung 208 − 0.7 × Alter, wenn kein Wert eingetragen ist; das Alter wird aus dem Geburtsdatum laufend berechnet): Z1 60–70 %, Z2 68–79 %, Z3 79–86 %, Z4 86–91 %, Z5 91–97 %.
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
- Der lange Lauf wächst schrittweise: höchstens +12 % bzw. +2.5 km pro Woche (Entlastungswochen ausgenommen). Im Marathon-Tapering sinkt er auf etwa 70 % und 50 % des längsten Laufs statt in einem Schritt.
- Wer beim Start den **längsten Lauf der letzten 4 Wochen** angibt, beginnt dort (90 %, in Entlastungswochen 75 %) statt tiefer.

### Marathon- und Halbmarathon-spezifische lange Läufe

- **Marathon, Aufbau:** jeder zweite lange Lauf endet mit 3–5 km im Marathontempo.
- **Marathon, spezifische Phase:** jeder zweite lange Lauf enthält einen Block im Marathontempo, der von 8 auf 14 km (viel Erfahrung 18 km) wächst («Generalprobe» mit Schuhen, Frühstück und Verpflegung wie am Renntag; Pfitzinger/Daniels).
- **Halbmarathon:** in Aufbau (ab etwas Erfahrung) und spezifischer Phase lange Läufe mit Endbeschleunigung im Renntempo.
- **Verpflegung üben:** Marathon-Ziel und lange Läufe ab 75 min: ab 40 min alle 25–30 min ein Gel (ca. 25 g) mit Wasser, gleiches Produkt wie im Rennen. Halbmarathon ab 70 min: ein Gel nach 45–60 min. Der Darm lässt sich auf Kohlenhydrate trainieren (Jeukendrup 2017); was im Rennen funktionieren soll, muss vorher geübt sein.

### Trainingsvielfalt

Jede Qualitätseinheit wird aus einer Bibliothek von Formen mit gleicher Wirkung gewählt. Die Form wechselt Woche für Woche, der Umfang wächst mit der Phase.

| Art | Formen |
|---|---|
| Fahrtspiel | 1 min / 1 min, 2 min / 1 min, Pyramide 1-2-3-2-1 min, 30/30, Mona-Fartlek (90-60-30-15 s), Leiter 3-2-1 min |
| Hügel | 60 s, 30 s steil, 2 min lang, Pyramide 30-60-90-60-30 s |
| Tempolauf | am Stück, 2 × oder 3 × mit kurzer Trabpause, progressiv |
| Schwelle | 1000 m, 1.6 km, 2 km, 3 km, Pyramide, 6 min (Trabpause 60 s bis 2 min) |
| VO₂max | 800 m, 1000 m (400 m Trab), 1200 m, 3 min (2 min Trab), Pyramide 400–1200 m, 2–3 × 5 × 400 m |
| Renntempo | je nach Distanz kurze, mittlere oder lange Abschnitte |
| Marathontempo | am Stück, 2 × mit 1 km locker, Wechsel 2 km / 1 km, progressiv |

Jede Einheit nennt Pace (oder Gefühl), Trabpause und den Pulsbereich der Belastungen. Bei kurzen Intervallen gilt er gegen Ende der Wiederholung, weil der Puls nachhinkt. Renntempo hat überall denselben Bereich (Marathon 78–88 %, Halbmarathon 84–91 % der HFmax), auch in der Testauswertung und im Renntag-Plan. Schwellenarbeit pro Einheit höchstens rund 8 km (Daniels: etwa 10 % des Wochenumfangs).

### Verteilung der harten Einheiten

Die beiden Qualitätstage werden gemeinsam gewählt, damit zwischen ihnen und dem langen Lauf möglichst viel Abstand liegt; zwei harte Tage hintereinander gibt es nur, wenn die Trainingstage keine andere Wahl lassen. Beim Marathon gibt es höchstens eine Marathontempo-Einheit unter der Woche (bis 12 km, sehr viel Erfahrung 14 km); steckt das Marathontempo schon im langen Lauf oder steht ein Renntempo-Test an, ist es ein mittellanger lockerer Lauf (Pfitzinger).

### Renntempo-Tests

Durchgehende Läufe im Zieltempo in der spezifischen Phase, für Rennen von 9 bis 43 km:

| Ziel | Test 1 | Test 2 |
|---|---|---|
| Marathon | 9 Wochen vorher: 12 km (wenig Erfahrung 10 km) an einem Qualitätstag | 5 Wochen vorher: 18 km (14 km) am Tag des langen Laufs |
| Halbmarathon | 6 Wochen vorher: 6 km (5 km) | 3 Wochen vorher: 10 km (8 km) |
| 10 km | 5 Wochen vorher: 3 km | 3 Wochen vorher: 5 km |

Fällt die Woche auf eine Entlastungs- oder Taperwoche, rückt der Test eine Woche nach vorne. Ausgewertet wird der Testabschnitt (aus den Kilometer-Splits automatisch erkannt oder von Hand: Pace und Puls beider Hälften):
- **Pace** gegenüber dem Zieltempo (±2 %; deutlich schneller ist ebenfalls ein Hinweis),
- **Pulsniveau** im erwarteten Bereich (Marathon 78–88 %, Halbmarathon 84–91 %, 10 km 88–95 % der HFmax),
- **Decoupling** zwischen erster und zweiter Hälfte (≤ 3 % stabil, über 5 % noch nicht ökonomisch),
- **Anstrengung** (Marathon höchstens 6, Halbmarathon 7, 10 km 8 von 10).
Urteil: «Zieltempo sitzt» (Note 9), «knapp» (7) oder «sitzt noch nicht» (5) mit einer realistischen Zielzeit. Der Renntag-Plan übernimmt sie. Tests fliessen auch ins Decoupling-Diagramm ein.

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

### Renntag-Plan

- **Tempo:** Zielzeit, wenn sie bis zum Renntag realistisch ist (Prognose minus erwartete Verbesserung von 0.25 % pro Woche, höchstens 6 %); sonst dieser realistische Wert. Zeigt der letzte Renntempo-Test eine langsamere Zeit, gilt diese. Die ersten 5 km (Marathon) bzw. 3 km (Halbmarathon) 5 bzw. 3 s/km langsamer, der Rest gleichmässig.
- **Verpflegung** (Jeukendrup 2014; ACSM-Konsens): unter 75 min nichts nötig; Halbmarathon 30–45 g Kohlenhydrate pro Stunde, Marathon 60 g/h (bis 90 g/h, wenn geübt), 400–800 ml pro Stunde trinken. Gels ab 35–40 min.
- **Kohlenhydrate laden:** bei über 90 min 8–10 g pro kg Körpergewicht und Tag in den letzten 36–48 h; 60–90 min: am Vortag rund 7 g/kg. Frühstück 2–4 h vorher mit 1–4 g/kg.

## 7. Tägliche Anpassung (Check-in)

| Check-in | Anpassung |
|---|---|
| Starke Schmerzen | Pause, Hinweis auf ärztliche Abklärung |
| Leichte Schmerzen | Ohne Intensität, ca. 75 % Umfang |
| Gefühl «ok» | Eine Wiederholung weniger |
| Gefühl «naja» | Locker statt hart, ca. 80 % Umfang |
| Gefühl «schlecht» | Höchstens kurzer Regenerationslauf |

Zusätzlich wird eine harte Einheit locker, wenn der Vortag deutlich anstrengender war als geplant.

**Belastungsbremse:** Ist die Belastung der letzten Woche (Dauer × Anstrengung) mehr als 1.5-mal so hoch wie der Schnitt der vier Wochen davor, wird eine harte Einheit von Montag bis Mittwoch durch einen lockeren Lauf (80 % der Distanz) ersetzt. Renntempo-Tests, Testläufe und Rennen bleiben. Formübersicht, Wochenrückblick und Tagesansicht sagen dasselbe.

## 8. Anpassung alle zwei Wochen

Alle zwei Wochen (gezählt ab Planstart) wertet der Coach aus. Grundsätze: **keine Schlüsse aus zu wenig Daten**, und **wenn alles passt, ändert sich nichts**. Die Steigerung ist im Plan schon eingebaut; die Auswertung korrigiert nur, wenn die Daten es klar zeigen.

- **Umfang:** wird nie automatisch erhöht. Er sinkt um 12 % (höchstens auf 70 % des Grundplans) nur bei Warnzeichen, die du selbst meldest: starke Schmerzen (Check-in oder «nicht durchgeführt» wegen Schmerzen), mindestens 2 Krankheitstage, mindestens 2 Ausfälle wegen Müdigkeit, oder bei mindestens 4 erfassten Läufen eine deutlich höhere Anstrengung als vorgesehen zusammen mit schlechtem Gefühl beim Check-in. Nicht erfasste Einheiten gelten nicht als Müdigkeit. Ohne Warnzeichen nähert sich ein vorher reduzierter Umfang wieder dem Plan (+4 % pro Auswertung).
- **Paces (Leistungsindex):** Grundlage sind nur Qualitätseinheiten mit Pace-Vorgabe (Schwelle, Tempodauerlauf, Marathontempo, VO₂max, Renntempo), bei denen **Pace, Puls und Anstrengung** erfasst sind und die Laufart dem Plan entspricht, aus den **letzten 4 Wochen**. Nötig sind **mindestens 3** solche Einheiten.
  - **Schneller:** Mindestens zwei Drittel der Einheiten waren schneller als die Vorgabe (entsprechen einem um mindestens 0.5 höheren Leistungsindex), mit Puls höchstens 3 Schläge über dem Zielbereich und Anstrengung im erwarteten Bereich, und der Schnitt liegt mindestens 0.8 höher → +0.5 (etwa 2 s/km schnellere Paces). Schneller, aber mit zu hohem Puls oder zu hoher Anstrengung → keine Änderung.
  - **Langsamer:** Mindestens zwei Drittel der Einheiten waren zu hart (Anstrengung über dem erwarteten Bereich, Puls mehr als 5 Schläge über dem Zielbereich oder langsamer als die Vorgabe) und der Schnitt liegt mindestens 1 tiefer → −0.5.
  - Insgesamt höchstens −4 bis +6 gegenüber dem Ausgangswert; mit Leistungsdiagnostik bleiben die Paces fix.
- **Schwerpunkt (dynamisch statt mehr Umfang):** Die zweite Qualitätseinheit der Aufbau- und Spitzenwochen richtet sich nach den Daten der letzten 4 Wochen:
  - *Grundlage:* Decoupling der langen Läufe (ab 15 km) im Schnitt über 5 % → ruhigerer Tempodauerlauf statt harter Intervalle.
  - *Schwelle:* mindestens 2 Schwellen-Einheiten zu hart (mehr als Intervalle) → zusätzlich Schwellenintervalle.
  - *Tempohärte:* mindestens 2 Intervall-Einheiten zu hart (mehr als Schwelle) → zusätzlich VO₂max-Intervalle.
  - Sonst bleibt die übliche Abfolge.
- **Zwischen-Check:** In der Woche dazwischen wird nur bei klaren Warnzeichen eingegriffen (starke Schmerzen, mehrere Krankheitstage): Der Umfang sinkt sofort, erhöht wird nie.
- **Täglich** bleibt die Anpassung an den Check-in bestehen, die Lauf-Geh-Stufen gehen weiterhin wöchentlich weiter.

## 9. Import und Intervall-Erkennung

Unterstützte Formate sind FIT, GPX, TCX und ZIP aus Garmin Connect. Die Intervall-Erkennung prüft in dieser Reihenfolge:

1. Runden, die die Uhr als Belastung oder Pause markiert hat.
2. Manuelle Runden, die schnell und langsam abwechseln (Tempounterschied mindestens 18 %).
3. Tempowechsel im Verlauf: Zwei Tempo-Gruppen mit mindestens 20 % Unterschied, mindestens 3 Abschnitte von 40 s oder länger, die zusammen mindestens 4 Minuten ergeben.
4. Lange Tempoblöcke: 1–2 zusammenhängende schnelle Abschnitte von mindestens 8 Minuten (Pausen bis 40 s werden überbrückt), mindestens 10 % schneller als der Rest des Laufs, nicht deutlich bergab (Gefälle höchstens 2 %), mit mindestens 3 Minuten Ein- oder Auslaufen.

**Nach Plan (vor 2–4, wenn die Uhr keine Runden markiert hat):** Gehört der Lauf zu einer geplanten Qualitätseinheit, liest die App deren Belastungen aus dem Text (Dauer oder Distanz und Anzahl) und legt sie so in die Sekundenwerte, dass sie in der richtigen Reihenfolge zusammen am schnellsten sind, mit mindestens 20 s Pause dazwischen. Das Ergebnis gilt nur, wenn die Belastungen mindestens 8 % schneller sind als der Rest, keine mehr als 15 % langsamer ist als der Median und die Pausen langsamer sind (höchstens 15 % Ausnahmen). Sonst sucht die App mit weniger Wiederholungen (bis 60 % des Plans), z. B. «5 von 6». Bergintervalle sind ausgenommen.

**Von Hand:** Auf der Tempokurve Start und Ende markieren. Wechselt der Bereich deutlich zwischen schnell und langsam (mindestens 15 %), zählen die schnellen Abschnitte als Wiederholungen, sonst der ganze Bereich als ein Block.

Gelten die Abschnitte als Intervalle, zählen nur die Belastungsphasen. Beim Puls werden die ersten bis zu 30 s jeder Wiederholung ausgelassen, weil der Puls verzögert ansteigt.

## 10. Formwerte

- **Effizienz-Index** = Geschwindigkeit (km/h) ÷ genutzte Herzfrequenzreserve, also (HF − Ruhepuls) ÷ (HFmax − Ruhepuls). Es gibt drei getrennte Werte, die nur untereinander verglichen werden:
  - **Effizienz** (Grundlage): lockere, lange und regenerative Läufe, ganzer Lauf, höhenbereinigt. Nur sie bildet den Effizienz-Trend in «Fortschritt», weil der Puls bei ruhigem, gleichmässigem Laufen stabil ist.
  - **Schwellen-Effizienz:** Tempodauerlauf und Schwellenintervalle, nur Pace und Puls des Blocks bzw. der Belastungen. Zeigt, ob das Schwellentempo bei gleichem Puls schneller wird.
  - **Marathontempo-Effizienz:** Marathontempo-Lauf und Renntempo-Test, nur Block bzw. Testabschnitt.
  - Keine Effizienz bei VO₂max-Intervallen, Renntempo-Intervallen, Fahrtspiel, Bergintervallen und Wettkämpfen: Bei kurzen, harten Wiederholungen hinkt der Puls hinterher. Bewertet werden Tempo, Gleichmässigkeit und Anstrengung.
  - Ein Mittel über den ganzen Tempolauf (mit Ein- und Auslaufen) wird nie verwendet: Es hängt vor allem davon ab, wie lange ein- und ausgelaufen wurde.
- **Decoupling** (Long Runs über 15 km): Verhältnis Tempo/Puls in der 1. gegen die 2. Hälfte, nach 10 Minuten Einlaufen. Unter 5 % gilt als gute aerobe Grundlage.
- **Trainingsbelastung:** Dauer × Anstrengung (Session-RPE nach Foster), verglichen mit dem Schnitt der 4 Wochen davor. Ein Verhältnis von 0.8–1.3 gilt als sicher.
- **Wochenumfang:** Ziegelmauer der letzten 4 Wochen.

## 11. Grenzen

- Die Logik ersetzt keinen Trainer und keine medizinische Abklärung.
- Ohne Pulsdaten fehlen Effizienz und Decoupling.
- Höhenmeter werden beim Decoupling nicht herausgerechnet; hügelige Long Runs können den Wert verfälschen.


## Trainingsfeedback und Note

Nach jedem erfassten Lauf bewertet Tempomacher die Einheit mit einer Note von 1 bis 10. Ausgangswert ist 5; eine sauber ausgeführte Einheit landet bei etwa 7–8, 9–10 gibt es nur mit messbarem Fortschritt.

| Kriterium | Grundlage | Wirkung |
|---|---|---|
| Umfang | geplante Distanz | ±: wie geplant +0.5; deutlich kürzer −0.5 bis −1.5; lockere Läufe deutlich länger −0.5 |
| Tempo | Zielbereich aus dem Plan (Daniels/VDOT); bei Zusatzläufen die Pace-Zonen | Easy/Long/Recovery im Bereich +1, zu schnell −1.5 (ausser der Puls war locker, z. B. am Berg); Qualitätseinheiten im Zieltempo +1.5, zu langsam −1, **zu schnell −0.5** (bei sehr hoher Anstrengung −1): Schwelle und Intervalle sind kontrolliert gemeint; wer wiederholt schneller kann, bekommt bei der nächsten Auswertung höhere Vorgaben |
| Wiederholungen | Anzahl im Plan (z. B. 4 × 1.6 km) gegenüber erkannten Belastungen | weniger −1; mehr wird erwähnt, aber nicht abgezogen (die Uhr zählt manchmal das Einlaufen als Runde) |
| Puls | Zielbereich bzw. % HFmax (Easy bis 79 %, Long bis 80 %, Recovery bis 72 %) | im Bereich +0.5, darüber −1 |
| Anstrengung | erwartete RPE je Laufart (Foster) | passend +0.5, deutlich höher −1 |
| Decoupling (Long Runs) | unter 5 % gilt als gute aerobe Grundlage (Friel) | unter 5 % +1, über 8 % −1 |
| Vergleich | Effizienz-Index der passenden Gruppe (siehe oben) gegenüber den letzten bis zu 6 gleichartigen Einheiten (180 Tage), nur bei ähnlichem Puls (±8) | +3 % oder mehr +1, −4 % oder weniger −1; ohne Puls: Pace bei gleicher Anstrengung ±0.5 |

Paces von Dauerläufen werden nur bei hügeligen Läufen höhenbereinigt: gezählt wird der Anstieg über 1 % der Distanz (z. B. über 56 m auf 5.6 km), davon die Hälfte mit 8 m Zusatzstrecke pro Höhenmeter, weil man abwärts einen Teil wieder aufholt. Genaue Höhenmeter aus Screenshot oder Datei haben Vorrang vor der Höhenmeter-Klasse. Gleichartig heisst gleiche Laufart; gibt es davon weniger als zwei, werden verwandte Arten herangezogen (z. B. Easy und Recovery, Tempodauerlauf und Schwellenintervalle, VO₂max- und Renntempo-Intervalle).

**Urteil:** Ganz oben steht ein Satz aus Note und den wichtigsten Minuspunkten, z. B. «Solide, aber zu schnell» oder «Starke Einheit, genau so war sie gedacht».

**Formverlauf:** lineare Entwicklung des Effizienz-Index der gleichartigen Läufe (sonst aller lockeren und langen Läufe; bei Schwelle und Marathontempo der Schwellen- bzw. Marathontempo-Effizienz) in den letzten 8 Wochen; ab ±2 % steigend bzw. fallend.

**Rennen** werden an der Zielzeit gemessen, sonst an der Prognose (bis 2 % schneller = 10, im Ziel = 9, 2 % langsamer = 8 …). **Testläufe** erhalten keine Note.


## Ohne Rennen: persönliches Ziel und «fit werden & bleiben»

**Persönliches Ziel.** Distanz plus «am Stück schaffen», Zielzeit oder Zielpace (Pace × Distanz = Zielzeit). Ohne Datum setzt Tempomacher den Zieltest ans Ende der empfohlenen Vorbereitungszeit (wie bei Rennen, am Tag des langen Laufs). Geplant wird genau wie für ein Rennen derselben Distanz; der Renntag ist ein **Zieltest**. Danach: neues Ziel oder Erhalt.

**Fit werden & bleiben.** Ziel ist eine wöchentliche Laufzeit, orientiert an den WHO-Empfehlungen (150–300 Minuten moderate Bewegung pro Woche) und am gewählten Zeitbudget:

| Zeitbudget | Beispiel |
|---|---|
| ca. 1.5 h | 3 × 30 min |
| ca. 2.5 h | 3 × 50 min |
| ca. 3.5 h | 4 × 50 min |
| ca. 5 h | 5 × 60 min |

Begrenzt wird es durch die Trainingstage (pro Tag 40–75 min je nach Erfahrung). Daraus ergibt sich mit der lockeren Pace der Ziel-Umfang in km.

- **Aufbau:** Start beim aktuellen Umfang, höchstens +8 % pro Woche (+6 % ohne Erfahrung oder ab 50), jede 4. bzw. 3. Woche −20 %. Rund 80 % locker, eine spielerische Tempoeinheit (Fahrtspiel, Hügel). Ohne Referenzzeit nach 4–6 Wochen ein Testlauf.
- **Erhalt:** Die Ausdauer bleibt erhalten, wenn Häufigkeit und Intensität bleiben, auch wenn der Umfang etwas sinkt (Hickson et al.; Bosquet et al. 2013). Darum 3-Wochen-Zyklen (2 normale Wochen, 1 Woche −25 %), jede Woche eine intensive Einheit im Wechsel Fahrtspiel, Hügel und kurzer Tempodauerlauf, alle 8 Wochen ein Formcheck (Testlauf), der die Zonen aktualisiert.
- Der Plan reicht rollend etwa 12 Wochen in die Zukunft und wird alle zwei Wochen ausgewertet wie jeder andere Plan.

**Ø Pace der normalen Läufe.** Ohne Referenzzeit schätzt Tempomacher den Leistungsindex so, dass diese Pace etwa 72 % der VO₂max entspricht (übliches Tempo von Freizeitläufen). Der erste Test- oder Formcheck-Lauf ersetzt die Schätzung.


## Intervalle: was wofür zählt

- **Distanz, Dauer und Trainingsbelastung** zählen für das ganze Training, inkl. Ein- und Auslaufen und Trabpausen.
- **Effizienz, Tempobewertung und Formverlauf** beruhen nur auf den **Belastungsphasen** (Pace und Ø Puls der schnellen Runden). In den Trabpausen ist das Tempo tief, während der Puls nachhängt; zu Beginn jeder Wiederholung ist er dagegen noch tief. Ein Durchschnitt über das ganze Training wäre darum verzerrt.
- Fehlen die Rundendaten (kein Runden-Screenshot, keine Runden in der Datei), lässt Tempomacher die Felder für die Belastungen leer und bewertet Effizienz und Tempo dieser Einheit nicht. Das Feedback weist darauf hin.

## Decoupling aus Kilometer-Splits

Bei Screenshots von Kilometer-Splits mit Puls (mind. 8 Splits, Dauerlauf) werden die ersten 10 Minuten ausgelassen, der Rest nach Zeit in zwei Hälften geteilt und jeweils Tempo pro Pulsschlag verglichen.


## Pulsdeckel

Der Pulsdeckel ist die Obergrenze der Zielzone der Einheit (berechnet aus % HFmax, aus der Leistungsdiagnostik oder von dir angepasst). Er wird gezeigt bei Easy, Long, Recovery, Shakeout, Spassläufen, Marathontempo, Tempodauerlauf, Schwellen- und Renntempo-Intervallen. Bei kurzen VO₂max-Intervallen, Hügelsprints und Fahrtspiel nicht: Dort erreicht der Puls während einer Wiederholung keinen stabilen Wert, Pace bzw. Anstrengung sind die besseren Vorgaben.

## Manuelle Zonen

Von dir angepasste Werte ersetzen pro Zone die berechneten Puls- bzw. Pacebereiche und bleiben fix. Angepasste Paces der Zonen Z2–Z5 steuern auch die Trainingspaces (locker, Marathontempo, Schwelle, Intervall). Zonen ohne eigene Werte folgen weiter der automatischen Anpassung.


## Kraft & Mobilität

Zweimal pro Woche (nicht in Tapering-, Erholungs- und Rennwochen) bekommt ein lockerer Lauf einen Zusatzblock von 15–20 Minuten mit zwei abwechselnden Übungsfolgen (Kniebeugen, Ausfallschritte, einbeiniges Wadenheben, Seitstütz bzw. einbeiniges Kreuzheben, Beckenheben, Step-ups, Unterarmstütz, Mobilisation). Krafttraining senkt das Verletzungsrisiko im Sport deutlich (Lauersen et al. 2014) und verbessert die Laufökonomie.

## Hitze

Bei Hitze steigt der Puls bei gleichem Tempo. Mit «Heiss» im Check-in setzt die App lockere Läufe rund 5 % langsamer an, kürzt Qualitätseinheiten leicht und empfiehlt, nach Puls statt Pace zu laufen, zu trinken und die kühlste Tageszeit zu wählen. Der Pulsdeckel bleibt gleich und sorgt dafür, dass die Intensität stimmt.

## Schwelle (gemessen) und Lernen des Leistungsindex

**Schwellenpuls:** aus dem Laktattest (Mitte der Zone 4), sonst Ruhepuls + 89 % der Pulsreserve.

**Gemessene Schwelle:** Tempodauerläufe und Schwellenintervalle der letzten 6 Wochen mit Block-Pace (bzw. Belastungen), mindestens 8 Minuten Belastung, Anstrengung höchstens 8/10. Jede Einheit wird über die Schwellen-Effizienz auf den Schwellenpuls umgerechnet (nur wenn der Block-Puls höchstens 12 Schläge davon abweicht). Angezeigt wird der Median der letzten 3; Trend ab 3 Einheiten über mindestens 3 Wochen (Median der ersten gegenüber den letzten).

**Laktattest:** hat Vorrang (Schwelle = Pace der Zone 4, Leistungsindex aus dem Test, kein Lernen aus Training). Älter als 120 Tage: Die Trainingswerte gelten als Schwelle, der Index lernt wieder mit; der Test erscheint als Vergleich.

**Lernen des Leistungsindex (Zwei-Wochen-Auswertung):** Mindestens 2 Einheiten mit Block-Puls höchstens 6 Schläge neben dem Schwellenpuls. Der daraus folgende Index (Schwellentempo ≈ 88 % der VO₂max-Pace, wie bei Laborwerten) liegt mehr als 0.6 über dem aktuellen → +½ der Differenz, höchstens +0.5 pro Auswertung (also höchstens etwa 1 pro Monat); mehr als 1.2 darunter (bei 3 Einheiten) → −0.5. Bei Warnzeichen keine Erhöhung. Zusammen mit der bisherigen Regel aus allen Qualitätseinheiten zählt der grössere Schritt. Gesamtkorrektur aus Training weiterhin −4 bis +6.

## Kacheln «Fortschritt»

| Kachel | Wert | Vergleich / Mini-Grafik |
|---|---|---|
| Zielkurs | Prognose Zieldistanz | Zielzeit, Veränderung gegenüber 4 Wochen; Balken = Zielzeit ÷ Prognose (90–100 %). Ohne Zielzeit: Leistungsindex und Verlauf |
| Schwelle | gemessene Schwelle (oder Laktattest) | Puls, Veränderung in 6 Wochen, Verlauf. Ohne Tempoeinheit: längster Lauf (8 Wochen) |
| Wochenumfang | Ø 4 volle Wochen | Phase, Mini-Mauer 8 Wochen, diese Woche geplant |
| Effizienz | Trend lockere/lange Läufe | Wochenmittel 8 Wochen |
| Frische | Form-Zustand (TSB/CTL) | Fitness und Richtung, Ampel: stark ermüdet < −30 %, im Training bis −10 %, danach ausgeglichen/frisch |
| Konstanz | erledigte geplante Einheiten (4 Wochen, ohne Ruhetage; heute erst wenn erledigt) | ein Punkt pro Einheit |

## Serie und Meilensteine

**Trainings in Folge:** Ab Planstart zählt jede geplante Einheit, die durchgeführt und erfasst wurde. Eine ausgelassene oder (vor heute) nicht erfasste Einheit setzt die Serie auf 0; die heutige, noch offene Einheit unterbricht sie nicht. Freiwilliges Alternativtraining zählt, wenn es gemacht wurde, und unterbricht sonst nicht. Ruhetage zählen nicht. Die Regel ist für alle Leistungsstufen gleich.

**Meilensteine** (Form): längster Lauf am Stück 5/10/15/21.1/30/42.2 km, Anzahl Läufe 10/25/50/100/250/500, Kilometer gesamt 50/100/250/500/1'000/2'500/5'000.

**Wochenumfang:** Die Mauern zeigen die Wochen seit Planstart bzw. erstem erfasstem Lauf, höchstens die letzten 4.


## Zielrealismus

Beim Eingeben einer Zielzeit (Start und Rennen) vergleicht die App mit der heutigen Prognose und dem, was bis zum Renntag realistisch ist (0.25 % Verbesserung pro Woche, höchstens 6 %): «Realistisch», «Ambitioniert, aber machbar», «Sehr ambitioniert» oder «Kaum erreichbar», mit einem realistischen Wert zum Übernehmen. Dieselbe Rechnung nutzen «Auf Kurs?», die Rennkarte und der Renntag-Plan.

## Lockere Läufe: Puls vor Pace

Ist ein Puls erfasst, entscheidet er bei lockeren und langen Läufen: über dem Deckel (+3) gibt es Abzug, je nach Überschreitung 1 oder 2 Punkte; eine zügige Pace mit Puls unter dem Deckel ist in Ordnung. Ohne Puls zählt die (höhenbereinigte) Pace. Zusätzliche, ungeplante Läufe heissen im Urteil «Zusatztraining» statt «Nicht wie geplant».

## Auf Kurs?

Bei einem Rennen oder persönlichen Ziel mit Zielzeit vergleicht die App die Prognose aus der aktuellen Form (VDOT) mit dem Ziel. **Auf Kurs:** Prognose gleich schnell oder schneller. **In Reichweite:** langsamer, aber innerhalb des Spielraums, der bis zum Renntag realistisch ist (1 % plus 0.25 % pro verbleibende Woche, höchstens 6 %). **Ambitioniert:** darüber.

## Verschieben und Pause

**Verschieben:** Eine Einheit lässt sich auf einen Tag in den nächsten 7 Tagen legen; liegt dort eine Einheit, werden beide getauscht. Gesperrt sind Tage, an denen danach zwei harte Einheiten (Qualität, langer Lauf, Rennen, Test) direkt aufeinanderfolgen würden. Tausche bleiben auch nach einer Plananpassung erhalten.

**Pause:** Während der Pause sind alle Einheiten Ruhetage. Wiedereinstieg je nach Länge: bis 3 Tage normal weiter; 4–7 Tage danach 4 Tage locker mit 85 % Umfang; 8–14 Tage eine Woche locker mit 70 %; länger eine Woche locker mit 60 %, dann eine Woche mit 80 % ohne VO₂max-Einheiten. Die Auswertungen passen den Plan danach weiter an.

## Wochenrückblick

Sonntag (sobald die heutige Einheit erfasst ist) bis Dienstag zeigt die Übersicht die Woche: Kilometer und Einheiten gegenüber Plan, Ø Note, ein Satz zur Woche (inkl. Hinweis, wenn mehrfach zu schnell gelaufen oder deutlich mehr Umfang als geplant) und Umfang, Phase und Schwerpunkte der nächsten Woche.

## Form auf einen Blick

Ampel-Zusammenfassung oben im Bereich Form: Auf-Kurs-Status, Effizienz (Ø der letzten 3 gegenüber den 5 davor, ab ±2 % bzw. −3 %), Belastung der letzten Woche gegenüber dem Schnitt der 4 Wochen davor (0.8–1.3 sicher, bis 1.5 erhöht, darüber hoch), Decoupling des letzten langen Laufs (unter 4 Wochen alt) und Veränderung des Leistungsindex.


## Verbesserungspotenzial

Höchstens zwei Tipps pro Einheit. Zuerst kommen Tipps zu dem, was nicht gepasst hat (zu kurz, zu schnell, zu langsam, zu hart, weniger Wiederholungen, Decoupling über 8 %, fehlende Daten). Ist noch Platz, folgen konkrete Hinweise auch nach guten Einheiten: Recovery schneller als vorgesehen; Pace im schnellsten Viertel des Zielbereichs; Puls bis 4 Schläge unter bzw. bis 3 über dem Deckel; harte Einheit (Qualität, langer Lauf, Rennen, Test) morgen oder übermorgen; Stand des Wochenumfangs (laufende Woche); bei langen Läufen ab 75 min Splits für das Decoupling, ab rund 85 min Verpflegung. Der allgemeine Satz («Regelmässigkeit …») erscheint nur, wenn nichts davon zutrifft.


## Grundlagenphase vor der Zielvorbereitung

Liegt das Rennen weiter weg als die nötige Vorbereitung, beginnt der Plan mit einer allgemeinen Phase. Liegt der bisherige Umfang unter dem Einstiegsumfang (halber Spitzenumfang), wird er um 6 % pro Woche aufgebaut. Sonst wird er gehalten: rund 90 % des bisherigen Umfangs, höchstens der Spitzenumfang. Wer viel oder sehr viel Erfahrung hat, behält alle Lauftage, eine strukturierte Einheit pro Woche und einen langen Lauf bis 90 min; jede 4. Woche ist eine Entlastungswoche mit 80 %. Bei weniger Erfahrung bleibt die Phase spielerischer (Fahrtspiel nach Lust, Volkslauf, Alternativtraining).

Grundlage: Ausdauer bleibt erhalten, wenn der Umfang höchstens um etwa ein Drittel sinkt und Intensität und Häufigkeit bleiben (Hickson et al. 1985; Bosquet et al. 2013). Stärkere Reduktionen über Monate kosten Grundlage.

**Bisheriger Umfang:** Er stammt aus der Einrichtung und lässt sich im Profil ändern. Erfasste Läufe ersetzen ihn bei einem Zielwechsel nur, wenn seit mindestens 3 Wochen erfasst wird (mindestens 4 Läufe), und nie unter 70 % des bisherigen Werts.


## Alternativtraining

Alternativtraining wird bewertet und in ein vergleichbares Lauftraining umgerechnet.

**Umrechnung (Lauf-Äquivalent):** Dauer × Faktor der Sportart = Minuten Laufen mit vergleichbarem Ausdauerreiz. Der Faktor folgt dem Spezifitätsprinzip: Je ähnlicher die Bewegung dem Laufen ist (Körpergewicht tragen, ähnliche Muskulatur), desto mehr überträgt sich.

| Sportart | Faktor | HFmax gegenüber Laufen |
|---|---|---|
| Langlauf | 0.85 | −2 |
| Aqua-Jogging, Crosstrainer, Hyrox | 0.8 | −10 / −4 / 0 |
| Skitour / Schneeschuh | 0.7 (+ bis 0.15 bei viel Anstieg) | −3 |
| Mountainbike, Rudern | 0.6 | −6 / −3 |
| Rennrad, Indoor-Velo | 0.55 | −7 |
| Andere | 0.5 | −3 |
| Schwimmen | 0.4 | −12 |
| Wandern | 0.35 (+ bis 0.35 bei steilem Anstieg) | 0 |

**Intensität:** Die Pulszone wird mit einer sportartbereinigten maximalen Herzfrequenz bestimmt, weil die HFmax beim Velofahren rund 5–10 und beim Schwimmen rund 10–15 Schläge tiefer liegt als beim Laufen. Ohne Puls zählt die Anstrengung (RPE). Aus Minuten und Zone ergeben sich die Lauf-Kilometer in der Pace dieser Zone.

**Belastung:** In die Trainingsbelastung (Dauer × Anstrengung, Foster) geht Alternativtraining voll ein; die Lauf-Kilometer bleiben getrennt, weil laufspezifische Reize (Sehnen, Knochen, Laufökonomie) fehlen.

**Bewertung (1–10):**
- *Statt eines geplanten Laufs:* Vergleich der Lauf-Entsprechung mit der geplanten Laufzeit (ab 85 % vergleichbar, unter 60 % deutlich weniger) und der Intensität mit der geplanten Einheit (locker bzw. Qualität). Der geplante Lauf gilt als «durch Alternativtraining ersetzt»: Er bricht die Serie nicht, zählt aber auch nicht als Lauf.
- *Zusätzlich oder geplantes Alternativtraining:* Dauer ab 30 min, Intensität im Grundlagenbereich ideal; hart am Tag vor einer Qualitätseinheit oder einem langen Lauf gibt Abzug.
- Hinweise zu Höhenmetern, fehlendem Puls, Schwimmen (wenig Übertrag) und Hyrox (Folgetag locker).

**Erfassen:** von Hand, per Screenshot (Strava, Garmin usw.; die Sportart wird aus dem Text erkannt, z. B. «Radfahrt», «Ride», «Langlauf», «Schwimmen», «Wandern», «Hyrox»; bei über 24 km/h ohne Hinweis wird Velo angenommen) oder als FIT-, GPX- oder TCX-Datei (Sportart aus der Datei).


## Effizienz und Höhenmeter

Der Effizienz-Index (km/h geteilt durch den genutzten Anteil der Herzfrequenzreserve) wird bei hügeligen Läufen mit einem Faktor korrigiert. Massgebend ist die Hügeligkeit g = Höhenmeter pro km. Genaue Höhenmeter aus Screenshot oder Datei haben Vorrang vor der Höhenmeter-Klasse.

**Faktor = 1 + Energiekosten + Puls-Anteil**
- **Energiekosten:** 0.00005 × g². Grundlage sind die Energiekosten beim Laufen bergauf und bergab (Minetti et al. 2002) auf einer Runde mit gleich viel Auf und Ab: Leichte Hügel kosten kaum mehr, steile deutlich, weil man bergab weniger zurückgewinnt.
- **Puls-Anteil:** 0.12 % pro m/km über 5 m/km, höchstens 4 %, mal persönlicher Faktor. Der Puls steigt am Anstieg schnell und sinkt danach langsam; bei wechselndem Gelände liegt der Durchschnittspuls deshalb höher, als die Energiekosten allein erklären.
- **Unter 5 m/km** keine Korrektur (Messrauschen von GPS und Barometer). **Über 80 m/km** (Trail, Berglauf) kein Effizienzwert, weil Gehpassagen und Gelände jeden Vergleich verzerren.

| m/km | 10 | 15 | 20 | 30 | 40 | 50 | 60 |
|---|---|---|---|---|---|---|---|
| Faktor | 1.011 | 1.023 | 1.038 | 1.075 | 1.12 | 1.165 | 1.22 |

**Persönliche Anpassung:** Mit mindestens 5 eher flachen (unter 10 m/km) und 5 hügeligen (20–80 m/km) lockeren Läufen mit Puls aus den letzten 180 Tagen schätzt die App, wie stark dein Puls auf Hügel reagiert, und passt den Puls-Anteil an (× 0.5 bis × 1.5). Der Wert steht unter dem Effizienz-Diagramm.

**Faire Vergleiche:** Im Feedback werden bevorzugt Läufe mit ähnlicher Hügeligkeit (± 10 m/km) verglichen. Im Diagramm sind hügelige Läufe (ab 20 m/km) als Ringe markiert.

Die Pace-Bewertung im Feedback bleibt bewusst zurückhaltender (erst ab 1 % Anstieg).


## Rennauswertung

Nach einem Rennen trägst du unter Ziele › Vergangene Rennen das Resultat ein. Die Auswertung vergleicht:
- **Zielzeit:** erreicht, knapp verpasst (bis 2 %) oder verpasst.
- **Prognose aus dem Training** zum Zeitpunkt der Eingabe (VDOT): 2 % schneller heisst, die Form war besser als die Trainingsdaten zeigten; über 4 % langsamer weist auf Einteilung, Bedingungen, Ermüdung oder ein zu ambitioniertes Ziel hin. Über 10 % schneller: Distanz und Zeit prüfen.
- **Bisherige Bestzeit** auf der Distanz (± 1 %).
- **Einteilung** (wenn die Zeit der 1. Hälfte bekannt ist): 2. Hälfte schneller = negativer Split (ideal), bis 2.5 % langsamer = gleichmässig, bis 5 % = leicht positiv, darüber = zu schnell gestartet.
- **Puls** gegenüber dem rennüblichen Bereich in % HFmax: 5 km 93–98 %, 10 km 90–96 %, Halbmarathon 86–92 %, Marathon 80–88 %, Ultra 70–82 %.
- **Bedingungen:** Hitze (1–3 %), Wind (1–2 %), hügelige Strecke (ab 10 m/km).

Daraus folgen höchstens vier Schlüsse, z. B. Einteilung üben, Ermüdungsresistenz und Verpflegung bei Einbruch auf langen Distanzen, ein realistischeres nächstes Ziel, das Resultat als Referenz übernehmen, und die Erholung nach der Distanz.

## Renntempo auf dem Weg zum Ziel (ab 2.23)

Das Renntempo im Plan startet bei der aktuellen Prognose und nähert sich linear dem Zieltempo; erreicht wird es etwa 5 Wochen vor dem Rennen. Untergrenzen: Marathontempo ≥ Schwelle + 3 %, Halbmarathontempo ≥ Schwelle, 10 km ≥ Schwelle − 3 %. Steigt der VDOT bei einer Auswertung, verschiebt sich die ganze Kurve.

## Umfang pro Einheit und langer Lauf (ab 2.23)

Arbeitsanteil einer Einheit höchstens: Schwelle 10 %, Intervalltempo 8 %, Wiederholungstempo 5 %, Marathontempo 20 % (langer Lauf mit Marathontempo 24 %), Renntempo 5/10 km 12–14 %, Halbmarathon 16 %, Marathon 20 % des Wochenumfangs, mit Mindestwerten (Schwelle 4 km, Intervalle 3 km, Wiederholungen 2 km, Marathontempo 8 km). Langer Lauf höchstens 40/34/30/28 % der Woche bei 4/5/6/7 Lauftagen, Marathon in Aufbau und Spitze mindestens 26 km.

## Fitness, Ermüdung, Form (ab 2.23)

Belastungspunkte pro Einheit = Stunden × (25 + 10 × Anstrengung), also etwa 55 für eine lockere und 105 für eine harte Stunde (ähnlich TSS). Fitness = exponentiell gewichteter 42-Tage-Schnitt, Ermüdung = 7-Tage-Schnitt, Form = Fitness − Ermüdung. Startwert aus dem angegebenen Wochenumfang. Zukunft aus geplanten Einheiten. Form/Fitness: unter −30 % stark ermüdet, −30 bis −10 % im Training, bis +5 % ausgeglichen, darüber frisch.

## Bereitschaft (ab 2.23)

Schlaf (gut 100 / mittel 70 / schlecht 35, Gewicht 0.3), Beine (frisch 100 / normal 75 / schwer 35, 0.3), Ruhepuls gegenüber dem Median der letzten 28 Tage (+3 → 75, +5 → 55, +8 → 25; 0.2), Form vom Vortag (0.2). Leichte Schmerzen begrenzen auf 55, starke auf 20.

## Coach-Stil, Leistungsklasse, Formtests (ab 2.26)

Leistungsklasse: Leistung ab VDOT 50 und 50 km/Woche, Ambitioniert ab 44/35, Fortgeschritten ab 38/20, sonst Einsteiger. Ausgewogen: Plan-Klasse = max(Erfahrung, min(Klasse, Erfahrung + 1)); Vorsichtig: Erfahrung, Umfangsgrenzen × 0.85, unter 5 Lauftagen eine Qualitätseinheit; Fordernd: volle Klasse, Grenzen × 1.15, ab 4 Lauftagen zwei Qualitätseinheiten. Formtests in Entlastungswochen mit mindestens 6 Wochen Abstand, nicht in den letzten 10 (Marathon), 7 (Halbmarathon) bzw. 6 Wochen vor dem Rennen. Pulszonen aus dem Schwellenpuls (Friel): Z1 72–84 %, Z2 85–89 %, Z3 90–94 %, Z4 95–100 %, Z5 101–106 %.

## Läufe pro Woche und Distanzen (ab 2.26)

Ab 4 Lauftagen wird in Allgemein-, Grundlagen-, Entlastungs- und Tapering-Wochen ein lockerer Tag optional (bevorzugt der Tag vor oder nach dem langen Lauf). Lockere Läufe: nach einem harten Tag Regenerationslauf (Gewicht 0.7), ein mittellanger Lauf (bis 78 % des langen Laufs, höchstens 40 % der lockeren Kilometer), der Rest mit wöchentlich wechselnder Gewichtung (±10 %).


## Ab wann Fitness gerechnet wird

Fitness (42 Tage), Ermüdung (7 Tage) und Form starten am ersten Tag der aktuellen lückenlosen Erfassung: Zurück ab dem letzten Eintrag, solange zwischen zwei Einträgen höchstens 14 Tage liegen. Ältere Einträge (zum Beispiel nachgetragene Rennen aus der Zeit vor der App) bleiben in Bestzeiten und Prognosen, zählen aber nicht zur Fitness: Die leeren Wochen danach würden sonst wie Trainingspause aussehen. Startwert ist der Wochenumfang aus dem Profil.

## Gewohnter Umfang

Grundlage aller Phasen ist der gewohnte Wochenumfang: der Schnitt der letzten bis zu 8 erfassten Wochen ab Beginn der lückenlosen Erfassung, ohne Entlastungs-, Tapering- und Erholungswochen (also nie die Spitzenwoche allein). Ab 3 Wochen ersetzt er den Profilwert: mehr Umfang zählt nach 6 Wochen voll, weniger Umfang erst nach 8 Wochen und nur zu drei Vierteln (Schutz vor unvollständig erfassten Wochen).

## Fitnesserhaltung (Off-Season)

Mit gehaltener Intensität bleibt die Form auch bei deutlich weniger Umfang erhalten (Mujika & Padilla; Hickson). Über Monate braucht die Grundlage aber etwa 60–75 % des gewohnten Umfangs.

- Anteil: vorsichtig 60 %, ausgewogen 70 %, fordernd 75 %; Marathon +5 %, 5 km −5 %, ab 50 Jahren −5 %. Unter 30 km steigt der Anteil gegen 100 % (bei kleinem Umfang ist jeder Lauf Erhaltung).
- Grenze: Trainingstage × 40/50/60/75 min je nach Erfahrung.
- Übergang nach dem Rennen (inklusive Erholungswochen): Marathon 3, Halbmarathon 2, kürzere Rennen 1 Woche mit rund 55 %, Tempo nur spielerisch.
- Inhalt: langer Lauf (bis 35 % der Woche, höchstens 90 min), ein Tempo-Reiz pro Woche im Wechsel (Fahrtspiel, Hügel, Schwelle), Steigerungen, Kraft & Mobilität. Läufe: Trainingstage − 1, ein Tag optional. Jede 4. Woche 25 % leichter, alle 8 Wochen ein Formtest.

## Belastungssteuerung (ab 3.0)

Ruhe- und Alternativtage stehen nicht fest im Plan. Sie entstehen, wenn die Belastung zu hoch wird:

| Signal | Stufe |
|---|---|
| Form unter −28 % der Fitness | 1 |
| Form unter −40 % der Fitness | 2 |
| Wochenbelastung ≥ 1,5× Schnitt der 4 Wochen davor | 1 |
| Zwei Einheiten in 7 Tagen deutlich härter als geplant | 1 |
| Zwei Morgen-Checks in Folge unter 60 | 1 |
| Beschwerden 4–6/10 | 1 |
| Beschwerden ≥ 7/10 oder 3 Tage ≥ 4 an derselben Stelle | 2 |

Stufe 1: Der nächste lockere Lauf in den nächsten 2 Tagen wird zu lockerem Alternativtraining (wer Alternativtraining erfasst) oder Ruhetag; gibt es keinen, wird die nächste harte Einheit locker. Stufe 2: Die nächste Einheit, gleich welcher Art. Tests und Rennen bleiben.

## Ramp-Guard (ab 3.0)

Eine normale Woche darf höchstens 15 % (+2 km) über der höheren der beiden letzten normalen Wochen liegen (optionale Läufe zählen mit). Sonst wird zuerst die zweite harte Einheit locker, dann werden lockere Läufe gekürzt, zuletzt der lange Lauf (nicht unter +10 % zum vorherigen).

## Beschwerden-Tagebuch (ab 3.0)

1–3/10: normal trainieren, beobachten. 4–6/10: ohne Intensität, Alternativtraining oder flach und weich. Ab 7/10 oder 3 Tage ≥ 4 an derselben Stelle: Pause und ärztliche bzw. physiotherapeutische Abklärung.

## Kraft in 4 Stufen (ab 3.0)

Stabilität → Kraftausdauer → Maximalkraft → Sprungkraft, alle 4 Wochen eine Stufe. Grundlage höchstens Stufe 2 (ausser viel Erfahrung), Spitzenphase einmal pro Woche Sprungkraft, Tapering und Rennwochen ohne. Einsteiger bleiben bei Stufe 1–2.

## Ambitionsstufen (ab 3.1)

| Stufe | Kriterium | Halbmarathon / Marathon | Was sich ändert |
|---|---|---|---|
| 0 | Leistungsindex des Ziels < 49,5 oder keine Erfahrung | langsamer als ~1:31 / ~3:12 | Standardlogik: 1–2 harte Einheiten, Schwelle 12–35 min |
| 1 | ≥ 49,5 | ~1:31 bis ~1:25 / ~3:12 bis ~2:58 | Schwelle als Anteil der Woche (Grundlage ~7,5 %, Aufbau ~9 %), 2 harte Einheiten in Aufbau und Spitze, Marathon-Langer bis 35 % |
| 2 | ≥ 54 | schneller als ~1:25 / ~2:58 | wie 1, Aufbau ~10 %, 2 harte Einheiten schon in der Grundlage, zweiter Reiz vor dem Block jede Woche |

Begründung: Ab diesem Niveau entscheidet die Tempohärte an der Schwelle über die zweite Rennhälfte, nicht die Grundausdauer. Hobbyläufer profitieren dagegen am meisten von Regelmässigkeit und lockerem Umfang, dort bleibt die Intensität bewusst tiefer.

**5 und 10 km (ab 3.1.1):** Die Stufen gelten auch hier (Stufe 1 etwa ab 10 km unter 42 min, Stufe 2 unter 38:30). Zusätzlich zur Schwelle wird das Intervalltempo dosiert (bis ~7–8 % der Woche pro Einheit). In der spezifischen Phase steht jede Woche eine VO₂max-Einheit neben dem Renntempo, weil das 10-km-Renntempo knapp unter der VO₂max liegt.
