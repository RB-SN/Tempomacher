# Versionsverlauf

## 4.2.4 – November 2026

- **Laufen statt Alternativtraining:** Steht Alternativtraining im Plan (geplant oder vom Plan angepasst, z. B. wegen hoher Belastung) und du warst trotzdem laufen, lässt sich der Lauf jetzt normal erfassen. Eine Lauf-Datei bleibt ein Lauf, auch wenn du über «Alternativtraining erfassen» importierst. Im Alternativ-Formular steht neu «Laufen» als erste Sportart und macht daraus ein Lauf-Formular, mit Distanz, Dauer und Puls übernommen. Der Lauf zählt als Einheit dieses Tages (mit Feedback und Hinweis, die nächsten Tage locker zu halten).
- **Training-Liste:** Ist die heutige Einheit angepasst (Belastung, Morgen-Check), zeigt die Liste die angepasste Einheit mit dem Etikett «angepasst», wie die Übersicht. Bisher stand dort noch die ursprüngliche.

## 4.2.3 – November 2026

- **Krafttraining abhaken:** Der Block «Plus: Kraft» hat ein Häkchen «Kraft erledigt?». Es wird zwischen den Geräten synchronisiert und in den Meilensteinen gezählt (5, 10, 25, 50, 100 Krafteinheiten).

## 4.2.2 – November 2026

- **Bergsprints:** Ein lockerer Lauf pro Woche bekommt neu 6–10 × 8–10 s maximal bergauf mit 2 min Gehpause (statt Steigerungen). Trainiert Kraft, Abdruck und Tempo-Reserve fast ohne Ermüdung. Gibt es nur einen Platz pro Woche, wechseln Steigerungen und Bergsprints ab.
- **Steigerungen:** 6–8 × 20 s statt 5 ×, mit Hinweis «flach, am besten auf Gras, bis etwa 95 %». Sie können neu auch am Tag vor dem langen Lauf stehen.
- Die bisherigen «Kurzen Bergsprints» (30 s) heissen neu «Kurze Bergintervalle», weil sie Kraftausdauer trainieren.

## 4.2.1 – November 2026

- **Testlauf mit Note und Feedback:** Bewertet werden die Einteilung (1. gegen 2. Hälfte des Testabschnitts), der Puls (typisch für eine volle Anstrengung über diese Distanz?), die Anstrengung und was der Test verändert hat («Leistungsindex steigt von 42.5 auf 45.3»). Lief der Test nicht voll, sagt die App, dass die Paces eher zu ruhig sind, und schlägt eine Wiederholung vor. Wird der Test nicht als Referenz übernommen (Laborwerte, neuere Referenz), steht der Grund dabei.
- **Testabschnitt aus Screenshots:** Auch aus Runden-Tabellen (z. B. Runden 2 km · 5 km · 1.1 km) und aus Kilometer-Splits, die über mehrere Screenshots verteilt sind. Ohne geplante Distanz zählt der längste klar schnellere Teil.

## 4.2.0 – November 2026 · Ein Lauf, mehrere Abschnitte

- **Gesamt und Kernteil:** Ein Lauf hat jetzt zwei Ebenen. Distanz und Dauer gesamt (mit Ein- und Auslaufen) zählen für Umfang und Belastung. Der Kernteil zählt dort, wo es um Leistung geht. Er wird aus dem Plan, den Runden der Uhr oder der Datei erkannt und lässt sich im Formular oder auf der Tempokurve korrigieren.
- **Testlauf:** Zum Beispiel 8.1 km gesamt mit dem 5-km-Testabschnitt in einem Eintrag. Der Testabschnitt setzt Leistungsindex, Bestzeit und Zonen; die 8.1 km zählen für den Wochenumfang. Ohne geplante Testdistanz sucht die App den längsten klar schnelleren Teil (der 30-Minuten-Test nimmt die schnellsten 30 Minuten).
- **Wettkampf:** Das Rennen wird im Lauf mit Ein- und Auslaufen gefunden (Renndistanz, bevorzugt aus den Runden der Uhr). Die Zeit wird zum Rennresultat mit 1. Hälfte für die Rennauswertung, sofern noch keines eingetragen ist. Wird das offizielle Resultat später eingetragen, bleiben Gesamtdistanz und Datei erhalten.
- **Langer Lauf mit Endbeschleunigung oder Marathontempo-Teil, progressiver Dauerlauf:** Der schnelle Teil wird am Zieltempo gemessen («Zieltempo getroffen» bzw. zu schnell / zu langsam). Decoupling, Effizienz und Pulsbewertung gelten nur für den lockeren Teil davor. So entsteht kein «2. Hälfte 9 % schneller, nicht bewertet» mehr.
- **Lauf-Geh-Training:** Laufen und Gehen werden getrennt erkannt (Anzahl Gehpausen, Pace und Puls der Laufabschnitte). Effizienz und Pace zählen nur auf den Laufabschnitten.
- **Mehrere Dateien für einen Lauf:** «+ Weitere Datei zu diesem Lauf hinzufügen», z. B. wenn die Uhr neu gestartet wurde. Mehrere Laufdateien gleichzeitig gewählt werden ebenfalls zu einem Lauf zusammengefügt. Die Lücke zwischen den Dateien zählt nicht.
- In den Einträgen zeigt ein Etikett den Kernteil (z. B. «Testabschnitt 5 km · 21:40»), die Gehpausen bzw. die Anzahl Dateien.

## 4.1.2 – November 2026

- **Strava-Zwischenzeiten werden erkannt** (Km · Tempo · Anstieg · HF): Pace, Puls und Höhendifferenz pro Kilometer, daraus Distanz, Dauer, Ø Puls, Höhenmeter (Näherung: halbe Summe der Höhendifferenzen) und das Decoupling.
- **Texterkennung:** Breite farbige Balken (Strava-Zwischenzeiten, Karten) werden vor dem Lesen ausgeblendet; vorher machten sie die Zahlen daneben unlesbar. «459» wird bei Kilometer-Zwischenzeiten als 4:59 gelesen.
- Höhendifferenz pro Kilometer: Die Texterkennung verliert oft das Minuszeichen. Steigungsbereinigt wird darum nur, wenn die Summe der Anstiege zu den Höhenmetern einer Übersicht passt (±8 %); sonst zählt nur, wie hügelig der Lauf ist.
- Auch ein einzelner Screenshot durchläuft jetzt die volle Auswertung (Summen, Decoupling).

## 4.1.1 – November 2026

- **Decoupling wird selbst ausgefüllt** – aus Dateien (jetzt ab 45 Minuten statt erst ab 15 km) und aus Garmin-Runden-Screenshots, auch wenn die Tabelle über mehrere Screenshots verteilt ist (die Rundennummer bestimmt die Reihenfolge; falsch gelesene Gesamtzeiten stören nicht mehr). Komplette Rundentabellen liefern zudem Distanz und Dauer.
- **Höhenprofil berücksichtigt:** Mit der steigungsangepassten Pace (Garmin «SAP», Strava «GAP») bzw. den Höhendaten der Datei wird das Decoupling steigungsbereinigt gerechnet. Ohne diese Angaben und bei mehr als 12 Höhenmetern pro km wird es nicht bewertet.
- **Steigerungsläufe:** Ist die 2. Hälfte mehr als 4 % schneller, wäre der Vergleich geschönt. Dann bewertet die App den längsten gleichmässigen Teil (mindestens 30 Minuten), z. B. «Decoupling 4.9 % (gleichmässiger Teil, km 9–16)».
- Reine Kilometer-Rundentabellen (Auto-Lap) werden nicht mehr fälschlich als Intervalle erkannt.
- Texterkennung: «Gesamtzeit» auch bei abgeschnittenem G, «1:23:021» und «58069 100» werden korrigiert.

## 4.1.0 – November 2026 · Neues Design «Sportgerät» (Teil 2, komplett)

- **Training:** Umschalter Erfassen / Trainingsplan / Einträge in schmalen Grossbuchstaben. Nebenaktionen (Alternativtraining, Verschieben, Nicht durchgeführt, Weiteres Training, Pause) als ruhige Knöpfe statt unterstrichener Links. Kein schwebender Knopf mehr, das Erfassen sitzt direkt unter dem Training.
- **Trainingsplan:** Phasen als neutrale Etiketten mit farbigem Punkt (Koralle bleibt für Aktionen), aktuelle Woche mit kräftigem Rahmen, Aufbau blau und Spezifisch rot im Phasenbalken.
- **Ziele:** Rennkarten mit Zielflaggen-Streifen in Schwarz, das Hauptziel mit kräftigem Rahmen statt Koralle. Auf dem Laptop zwei Rennkarten nebeneinander.
- Bewertungen in den Einträgen in der Sportschrift.

## 4.0.1 – November 2026

- **Fortschritt-Kacheln aufgeräumt, Farbe bleibt als Signatur:** neutrale Karte (hell weiss, dunkel anthrazit), ohne farbigen Hintergrund und Oberrand. Jede Kachel behält ihre Farbe im Titel mit Farbquadrat, in der Mini-Grafik und im Fortschrittsbalken. Neue, abgestimmte Palette (Blau, Orange, Türkis, Grün, Gold, Violett) mit helleren Tönen im Dunkelmodus.

## 4.0.0 – November 2026 · Neues Design «Sportgerät» (Teil 1)

- **Neue Schrift:** Barlow Condensed für Titel und Zahlen (schmal, sportlich, keine Worttrennungen mehr), Barlow für Text. Eingebettet, funktioniert offline.
- **Neue Farben:** Hell = warmes Off-White mit Schwarz, Dunkel = Nacht (fast schwarz). **Koralle nur noch für Aktionen** und «wo du bist». Neues App-Symbol (schwarz mit grauem und korallenfarbenem Pfeil).
- **Übersicht:** Das heutige Training ist der Held: dunkle Karte, grosse Zahl, Balken des Ablaufs (locker grau, harter Teil Koralle), Knopf «Los geht’s» direkt in der Karte. Der schwebende Knopf erscheint nur noch, wenn heute kein Training ansteht. Rennen als ruhige helle Karte, mehr Luft.
- **Laptop:** Ab 1024 px Breite Navigation links, Übersicht in zwei Spalten (Heute links gross, Rennen, Woche und Werte rechts). Andere Bereiche breiter.
- Navigation in schmalen Grossbuchstaben, aktiver Bereich in Koralle.
- Noch nicht umgestellt (folgt): Training, Fortschritt (Kacheln noch farbig), Ziele, Profil.

## 3.4.1 – November 2026

- **config.js ist nicht mehr im Update-Paket.** Beim Hochladen des ganzen Ordners hat die leere Vorlage deine ausgefüllte config.js überschrieben, dadurch war die Synchronisierung aus. Die Vorlage heisst jetzt `config.example.js`.
- Online-Profil ohne Verbindung (config.js leer): «Konto & Geräte» sagt das jetzt klar, statt «Offline».

## 3.4.0 – November 2026

- **Schwelle deiner Pulsuhr eintragen** (Profil → «Schwelle der Pulsuhr»): Schwellenpuls (Pflicht), Schwellentempo (optional) und Datum, von Garmin, Polar, Coros, Suunto usw. Reihenfolge für die Schwelle: Laktattest → Pulsuhr → deine Einheiten. Der Puls der Uhr ist der Bezugspuls; das Tempo misst die App in deinen Einheiten bei diesem Puls selbst, weil Uhren das Schwellentempo oft zu vorsichtig schätzen. Ohne Einheit zeigt die Kachel den Wert der Uhr; mit Einheit einen Vergleich («Deine Uhr schätzt 4:10, du läufst bei diesem Puls 6 s/km schneller»). Älter als 4 Monate: Hinweis, einen neueren Wert einzutragen. Ein Laktattest, der älter als 4 Monate ist, tritt hinter einen neueren Uhrwert zurück.
- **Wie bei Pulsuhren:** Für die gemessene Schwelle zählen Belastungen ab 20 Minuten; kürzere (ab 8 Minuten) nur, solange es keine längeren gibt, mit Hinweis «Annäherung».
- Erklärung in der Kachel: «Schwelle ≈ das Tempo, das du etwa 60 Minuten halten kannst.»

## 3.3.1 – November 2026

- **Fehler behoben (Schwelle zu schnell):** Ohne Laktattest wurde jede Einheit auf einen geschätzten Schwellenpuls (89 % der Pulsreserve) hochgerechnet. Lag die Schätzung einige Schläge über deinem echten Block-Puls, ergab das ein viel zu schnelles Tempo (z. B. 3:42 statt 3:58). Jetzt gilt als Bezugspuls der Laktattest oder der mittlere Block-Puls deiner eigenen Schwelleneinheiten; ausgeglichen werden nur kleine Unterschiede (bis 6 Schläge, höchstens 3 %). Bei einer einzigen Einheit zeigt die Kachel genau deren Block-Pace und Puls.
- Der Leistungsindex lernt nur aus Einheiten, die wirklich hart waren (Block-Puls mindestens 80 % der Pulsreserve) und nahe am Bezugspuls liegen.

## 3.3.0 – November 2026

- **Neue Kacheln in «Fortschritt»** (zwei Spalten, je Zahl + Vergleich + Mini-Grafik): Zielkurs, Schwelle, Wochenumfang, Effizienz, Frische, Konstanz. Prognosen und Bestzeiten stehen in den Details von «Zielkurs», die Intensität 80/20 bei «Frische», Serie und Meilensteine bei «Konstanz».
- **Gemessene Schwelle:** aus Tempodauerläufen und Schwellenintervallen (Block-Pace und -Puls), umgerechnet auf deinen Schwellenpuls, Median der letzten 3, mit Trend und Vergleich zur Plan-Vorgabe. Vor der ersten Tempoeinheit zeigt die Kachel den längsten Lauf.
- **Laktattest hat Vorrang** für Schwelle, Schwellenpuls und Leistungsindex; ist er älter als 4 Monate, zählen die Trainingswerte mehr und die App schlägt einen neuen Test vor.
- **Leistungsindex lernt aus der Schwelle:** In der Zwei-Wochen-Auswertung höchstens +0.5 (also etwa 1 pro Monat), wenn mindestens 2 Einheiten nahe am Schwellenpuls schneller sind als die Vorgabe. Paces, Prognosen und Zielkurs passen sich an.
- Tempoblöcke zählen in der Zwei-Wochen-Auswertung mit der Block-Pace (nicht mehr mit dem Schnitt des ganzen Laufs).

## 3.2.2 – November 2026

- **Garmin-Screenshots mit Abschnitt-Filtern:** Die Ansichten «Warm up», «Laufen», «Erholung» und «Cool Down» der Garmin Connect App werden jetzt richtig zusammengesetzt, auch wenn die Texterkennung den gewählten Filter nicht lesen kann. Die Intervall-Zeile (z. B. «1 · 16:00.0 · 4.03 km») ersetzt ihre Kilometer-Runden; gescrollte Tabellen und ihre Summenzeile werden erkannt; «1711.7» wird als 17:11.7 gelesen; «8. 54 km» als 8.54 km.
- Ein Filter-Screenshot liefert nie mehr Distanz, Zeit oder Puls des ganzen Laufs (vorher konnte z. B. das Einlaufen als ganzer Lauf gelten).
- 1000-m-Intervalle werden auch erkannt, wenn sie wie Kilometer-Runden aussehen, sofern Erholungen dazwischen liegen.
- Dauer: Die genaue Gesamtzeit aus der Runden-Tabelle hat Vorrang vor der aus Distanz × Pace gerechneten.
- Kachel **«Meilensteine»** statt «Serie»: Anzahl erreichter Meilensteine und der nächste (z. B. «→ 25 Läufe»). Die Serie steht weiterhin in den Details.
- Kachel «Effizienz» sagt, was für den Trend noch fehlt («4 von 6 lockeren Läufen mit Puls» bzw. «noch 1 Wo. bis zum Trend»).
- Begriffe: «Dauerläufe» heisst bei der Effizienz jetzt «lockere und lange Läufe»; nach dem Import «Gleichmässiger Lauf, keine Intervalle erkannt».

## 3.2.1 – November 2026

- **Fehler behoben (Effizienz beim Tempodauerlauf):** Die Effizienz rechnete mit der Pace des ganzen Laufs, aber dem Puls des Tempoblocks, und floss in den Effizienz-Trend der lockeren Läufe ein.
- **Drei getrennte Effizienz-Werte:** *Effizienz* nur aus lockeren, langen und regenerativen Läufen (Trend in «Fortschritt»); *Schwellen-Effizienz* aus Tempodauerlauf und Schwellenintervallen, nur Block bzw. Belastungen; *Marathontempo-Effizienz* aus Marathontempo-Lauf und Renntempo-Test. VO₂max-, Renntempo- und Bergintervalle, Fahrtspiel und Wettkämpfe haben keine Effizienz mehr (Puls hinkt hinterher).
- Feedback bei Schwelle und Marathontempo nennt die Zahlen direkt: «Schwelle heute 3:57 /km bei Puls 171, am 12.11. 4:02 /km bei Puls 172».
- Effizienz-Diagramm: in der ausführlichen Ansicht zusätzlich eine Linie für Schwelle (und Marathontempo) mit eigenem Trend.
- Erfassen von Tempodauerlauf und Marathontempo-Lauf: Die Felder heissen jetzt «Ø Pace im Tempoblock», «Ø Puls im Tempoblock» und «Dauer Tempoblock». Beim Import wird nie mehr der Durchschnitt des ganzen Laufs als Block eingetragen; ohne erkannten Block weist die App auf «Belastung selbst markieren» hin.
- Ältere Tempodauerläufe, bei denen unklar ist, ob Pace und Puls vom Block oder vom ganzen Lauf stammen, werden nur noch untereinander verglichen.

## 3.2.0 – November 2026

- **Belastungen ohne Runden erkennen:** GPX-Dateien (z. B. aus Garmin Connect) enthalten keine Runden. Die App sucht jetzt nach der **geplanten Einheit**: «16 min am Stück», «6 × 1000 m», «2 × 8 min», «1-2-3-2-1 km», «2 × (5 × 400 m)», «6 km im Marathontempo» usw. Wurden weniger Wiederholungen gelaufen, zeigt sie z. B. «5 von 6 Belastungen gefunden». Die Runden der Uhr (FIT/TCX) haben weiterhin Vorrang.
- **Tempoblöcke auch ohne Plan:** 1–2 zusammenhängende schnelle Abschnitte ab 8 Minuten (Tempodauerlauf, 2 × 15 min) werden am Tempowechsel erkannt, bisher erst ab 3 Belastungen. Bergab-Abschnitte zählen nicht.
- **Belastung selbst markieren:** Beim Datei-Import zeigt «Belastung anpassen» die Tempokurve des Laufs; mit zwei Schiebern Start und Ende setzen. Bei Intervallen den ganzen Bereich markieren, die einzelnen Belastungen findet die App darin. «Kein Block» wertet den Lauf als Dauerlauf.
- Die Sekundenwerte der Datei bleiben nur während des Imports im Speicher und werden nicht gespeichert oder synchronisiert.

## 3.1.1 – November 2026

- **Ambitionsstufen auch für 5 und 10 km:** mehr Schwellenarbeit wie beim Halbmarathon und zusätzlich mehr VO₂max-Arbeit (Intervalltempo bis ~7 % bzw. 8 % der Woche pro Einheit, nach Daniels). Etwa ab 10 km unter 42 min (Stufe 1) bzw. unter 38:30 (Stufe 2).
- 5/10 km ambitioniert: in der spezifischen Phase jede Woche eine VO₂max-Einheit neben Renntempo (Schwelle jede dritte Woche); Renntempo-Tests ersetzen bei kurzen Rennen die Renntempo- oder Schwellen-Einheit, nicht die Intervalle.
- «Warum heute?» erklärt bei 5/10 km, dass Schwelle und VO₂max gleich viel zählen.

## 3.1.0 – November 2026

- **Ambitionsstufen:** Aus der Zielzeit (sonst der aktuellen Form) leitet der Plan eine Stufe ab: 0 = Einsteiger bis gutes Hobby-Niveau, 1 = ambitioniert (Leistungsindex ≥ 49,5, etwa HM 1:31 / Marathon 3:12), 2 = leistungsorientiert (≥ 54, etwa HM 1:25 / Marathon 2:58). Voraussetzung: etwas Lauferfahrung.
- **Mehr Schwellenarbeit für ambitionierte Halbmarathon- und Marathonziele:** Schwellenumfang als Anteil der Woche (Grundlage ~7,5 %, Aufbau 9–10 %, nach Daniels höchstens ~10 % pro Einheit); Dauerläufe an der Schwelle höchstens ~25 min am Stück, längere Blöcke geteilt.
- Ambitionierte haben im Aufbau und in der Spitze zwei harte Einheiten (Stufe 2 schon in der Grundlage); die Halbmarathon-Spitze behält Schwelle bzw. Intervalle neben dem Renntempo.
- Marathon ambitioniert: langer Lauf bis 35–37 % der Woche, damit 32–35 km möglich sind.
- Vor dem Block: ein zweiter kurzer Reiz (Hügel oder Schwelle), Stufe 2 jede Woche, sonst jede zweite.
- Für alle: Der Tag vor dem langen Lauf ist kurz und locker (höchstens 10 km).
- «Warum heute?» erklärt bei Schwelleneinheiten Ambitionierter, warum mehr Tempoarbeit drin ist.
- Fehler behoben: Der zweite Reiz vor dem Block für erfahrene Läufer wurde seit 3.0 nie gesetzt.

## 3.0.2 – November 2026

- Zusammenführen robuster: Einträge ohne Zeitstempel zählen mit dem Stand ihres Geräts; ein absolvierter Lauf wird nicht von einem «nicht absolviert»-Eintrag verdrängt; Rennresultate bleiben erhalten, auch wenn die andere Seite das Rennen später bearbeitet hat.
- Neuer Knopf «Mit Konto zusammenführen» (Konto-Einstellungen): führt dieses Gerät und das Konto zusammen, ohne etwas als gelöscht zu werten, und lädt alles hoch. Rettungsweg, falls ein Eintrag nur auf einem Gerät zu sehen ist.

## 3.0.1 – November 2026

- **Fehler behoben (Datenverlust beim Abgleich):** Hatte ein Gerät seit dem letzten Abgleich selbst etwas gespeichert (z. B. die automatische Auswertung beim Öffnen), überschrieb es das Konto mit seinem Stand, und auf einem anderen Gerät erfasste Trainings gingen verloren. Jetzt wird immer dreiseitig zusammengeführt: Neues von beiden Seiten bleibt, Gelöschtes bleibt gelöscht.
- Wiederherstellung: Beim ersten Abgleich nach dem Update gilt nichts als gelöscht. Trainings, die noch auf einem Gerät liegen, aber im Konto fehlen, werden wieder hochgeladen.
- Ein offenes Fenster (z. B. am Laptop) prüft beim Zurückkehren und jede Minute, ob es Neues von anderen Geräten gibt.

## 3.0.0 – November 2026

**Plan-Logik**
- Ruhe- und Alternativtage nur noch als Reaktion auf hohe Belastung: Ermüdung deutlich über der Fitness, Wochenbelastung ≥ 1,5× Schnitt, zwei zu harte Einheiten in 7 Tagen, zwei tiefe Morgen-Checks in Folge oder Beschwerden. Dann wird der nächste lockere Lauf (bzw. bei starker Ermüdung die nächste Einheit) zu Alternativtraining oder Ruhetag; gibt es keinen lockeren Lauf, wird die nächste harte Einheit locker. Feste Alternativtage im Fitnessaufbau entfallen.
- Ramp-Guard: Keine normale Woche steigt mehr als 15 % (+2 km) über die höhere der zwei letzten normalen Wochen, optionale Läufe mitgezählt. Renntempo-Tests verdrängen lockere Kilometer statt zusätzliche aufzubauen.
- Lauf-Formen (Gelände, Progressionslauf) nur noch auf passend langen lockeren Läufen.
- Kraftprogramm in 4 Stufen (Stabilität → Kraftausdauer → Maximalkraft → Sprungkraft), alle 4 Wochen eine Stufe weiter, phasenabhängig, Einsteiger bleiben bei den ersten zwei.
- Feste Regeltests prüfen 189 Läuferprofile (Niveau × Distanz × Trainingstage × Coach-Stil).

**Morgen-Check**
- Beschwerden-Tagebuch: Stelle + Stärke 1–10. 1–3 Hinweis, 4–6 ohne Intensität bzw. Alternativtraining, ab 7 oder 3 Tage in Folge an derselben Stelle: Pause und Hinweis zur Abklärung (rote Warnung auf der Startseite).
- HRV (optional) fliesst gegen den eigenen 28-Tage-Schnitt in die Bereitschaft ein.
- Zyklus (optional, für Läuferinnen): Hinweise zu Periode und Tagen davor, ohne Planeingriff.

**Darstellung**
- Feedback: Note und Coach-Text oben, Plus/Minus, Tipps und Vergleich unter «Details».
- Fortschritt: immer 6 Kacheln (Prognose, Belastung Ø 4 Wochen, Effizienz, Intensität 80/20, Bestzeiten, Serie) mit deutlichem Pfeil; aktuelle Phase und Woche über den Kacheln; Blockbericht im Fenster «Belastung»; Hilfe, wie Bestzeiten in die App kommen.
- Wochenumfang als Mauer, die sich beim Öffnen aufbaut; Ziegel gefärbt nach locker, lang, hart; Woche antippen zeigt ihre Läufe.
- Design-System: einheitliche Kacheln und Karten, Silbentrennung statt Wortbruch.

**Technik**
- Quellcode in Teile gegliedert (`src/`), die App bleibt eine einzige statische Datei ohne Server.

## 2.31.0 – November 2026

- **Datei-Import auch fürs iPhone erklärt:** Beim ersten Tippen auf «Datei» zeigt die App eine kurze, gerätespezifische Anleitung. iPhone: Export über Safari (Garmin Connect, Strava, Polar) oder «In Dateien sichern» (Coros, Suunto), dann «Datei» → Downloads; ZIP-Dateien entpackt die App selbst. Android: «Teilen → Tempomacher» direkt aus der Uhren-App. Apple Watch: Screenshot oder Export über Drittanbieter-Apps.
- Danach öffnet «Datei» direkt die Auswahl; die Anleitung bleibt beim Erfassen über «Datei vom Handy laden: so geht’s» erreichbar.
- Kein Server, keine Verbindung zu Garmin oder Strava: Die Trainingsdaten bleiben Ende-zu-Ende-verschlüsselt.

## 2.30.0 – November 2026

- **Fortschritt als Kachel-Raster:** sechs schlichte Kacheln (Prognose, Belastung, Effizienz, Blockbericht, Bestzeiten, Serie) mit Titel, Wert und einer Zeile. Antippen öffnet die Details in einem Fenster statt in Klappzeilen.
- **Ruhigerer Vergleich im Feedback:** Pace und Puls werden mit dem Schnitt der letzten 3 gleichen Einheiten verglichen, nicht mehr mit einer einzelnen.
- **Einfacherer Upload:** Beim Erfassen steht direkt, welche Screenshots nötig sind (z. B. «1 Übersicht · 2 Runden»). Die Hilfe zeigt pro Einheit eine Checkliste mit schematischen Beispielbildern; rot markiert ist, was zu sehen sein muss (Übersicht, Runden, Runden mit Anstieg, Kilometer-Splits).

## 2.29.0 – November 2026

- **Feedback als Coach mit Kontext:** Nach jeder Einheit 2–4 Sätze: wozu sie diente und die wievielte ihrer Art in der Phase sie war, wie Pace und Puls gegenüber der letzten gleichen Einheit aussehen (Form oder Einsatz?), was das für das Ziel bedeutet (einmal pro Woche, bei der ersten harten Einheit) und was als Nächstes kommt. Formulierungen wechseln.
- Floskeln entfernt: «Umfang wie geplant», «Anstrengung passt zur Einheit», «So weitermachen…», doppelte Hinweise zu morgen und zur Woche.
- Mehr Runden als geplant gibt keinen Abzug mehr (Uhren zählen Einlaufen und Pausen als Runden).
- **Kurz–mittel–lang:** Lockere Läufe sind bewusst verschieden lang; der Lauf nach dem langen Lauf ist kurz, der nach einer harten Einheit normal.
- **Formen lockerer Läufe:** pro Woche ein lockerer Lauf mit eigener Form im Wechsel: Lauf-ABC, Gelände, progressiver Dauerlauf (ab etwas Erfahrung, nie nach einem harten Tag), Steigerungen.
- **Einfache Ansicht überall:** Startseite ohne Fitness-/Form-Leiste, Trainingszonen und Leistungsdiagnostik im Profil unter «Für Fortgeschrittene».

## 2.28.0 – November 2026

- **Gewohnter Umfang statt Profilwert:** Alle Phasen rechnen mit dem Schnitt deiner letzten bis zu 8 erfassten Wochen (ohne Entlastungs-, Tapering- und Erholungswochen). Mehr Umfang zählt nach einigen Wochen voll, weniger Umfang nur schrittweise und zu drei Vierteln, damit ein vergessener Eintrag den Plan nicht schrumpfen lässt. Ohne Einträge gilt weiter der Profilwert.
- **Neue Fitnesserhaltung:** etwa 60 % (vorsichtig), 70 % (ausgewogen) oder 75 % (fordernd) des gewohnten Umfangs; Marathon +5 %, 5 km −5 %, ab 50 Jahren −5 %. Kleine Umfänge unter 30 km bleiben fast ganz erhalten. Nie mehr, als deine Trainingstage erlauben.
- **Übergang nach dem Rennen:** Marathon 3, Halbmarathon 2, kürzere Rennen 1 leichte Woche (inkl. Erholung) mit rund 55 % und Tempo nur spielerisch, danach Erhaltung.
- In der Erhaltung: 4 Läufe + 1 optional bei 5 Tagen, langer Lauf bis 35 % der Woche (höchstens 90 min), ein Tempo-Reiz pro Woche im Wechsel (Fahrtspiel, Hügel, Schwelle), jede 4. Woche leichter. Kein Alternativtraining mehr anstelle eines Laufs bei weniger als 6 Tagen.
- Der Plan begründet Übergangs- und Erhaltungswochen im Plan-Kopf (Umfang, Anteil, Coach-Stil, Zieldistanz, was die Form hält).
- Fehler behoben: Ein optionaler Tag wurde gesetzt, auch wenn der Wochenumfang dann nicht mehr Platz hatte. Läufer mit hohem Umfang fielen in Grundlagenwochen deutlich unter ihr Niveau (z. B. 60 → 38 km). Optionale Tage bleiben nach einem Rennen optional.

## 2.27.1 – November 2026

- Fitness, Ermüdung und Form werden ab dem Beginn deiner lückenlosen Erfassung gerechnet (keine Lücke über 14 Tage). Ältere Einzeleinträge, etwa Rennen von vor der App, zählen nicht mehr und drücken die Fitness nicht mehr künstlich nach unten.
- Die Karte «Fitness & Form» zeigt, ab wann gerechnet wird und wie viele ältere Einträge nicht zählen. Liegt der Start weniger als 4 Wochen zurück, heisst die Veränderung «seit …» statt «in 4 Wochen».
- Der Ø-Umfang in der Kennzahl zählt nur Wochen ab Beginn der Erfassung.

## 2.27.0 – November 2026

- Reiter «Form» heisst neu **«Fortschritt»** (die Kennzahl «Form» bleibt, verwechselt sich aber nicht mehr mit dem Reiter).
- Neuer Aufbau als Geschichte: «Dein Stand» → drei Kennzahlen mit Mini-Verlauf (Fitness, Prognose fürs Ziel, Umfang) → Monatsübersicht → Prognosen → Bereiche.
- Aus zehn gleichwertigen Klappzeilen werden fünf: **Belastung** (Wochenumfang, Fitness & Form, Trainingsbelastung), **Ausdauer & Effizienz** (Effizienz, Decoupling, Analysen), Blockbericht, Bestzeiten, Meilensteine.
- Der Verlauf des Leistungsindex steht neu in der Prognose-Karte.
- **Einfache und ausführliche Ansicht:** automatisch nach Lauferfahrung und Leistungsklasse, umstellbar unter Profil → Ansicht. Die einfache Ansicht verzichtet auf Fachbegriffe und Spezialgrafiken.
- Fehler behoben: «Form −0» wird jetzt als «0» angezeigt.

## 2.26.4 – November 2026

- Monatsübersicht: optionale Tage als kleiner gestrichelter Kreis mit «+» (statt «opt.»), in der Legende erklärt.

## 2.26.3 – November 2026

- **Erhaltungsphasen mit weniger Läufen:** In «Fitness erhalten» und in den lockeren Wochen vor einer weit entfernten Zielvorbereitung plant der Coach höchstens deine Tage minus zwei (mindestens 3 Läufe): Qualitätseinheit, langer Lauf, lockere Läufe. Ein weiterer Tag ist optional, der Rest frei. Intensität und langer Lauf bleiben, damit die Form hält.
- «Die nächsten 4 Wochen»: Hinweis, dass Woche 3 und 4 eine Vorschau sind und sich noch ändern können.

## 2.26.2 – November 2026

- **Monatsübersicht fürs Handy überarbeitet:** Datum über dem Kreis statt darin, heutiger Tag als Markierung am Datum, kleinere Kreise, schmalere Spalten (KW als eigene Spalte), keine Punkte mehr an Ruhetagen.
- **Nur 2 Wochen im Voraus:** Geplante Einheiten erscheinen in der Monatsübersicht nur für diese und die nächste Woche; weiter in die Zukunft blättern geht nicht. Auch im Trainingsplan zeigen spätere Wochen keine Einheiten-Vorschau mehr. Der Plan passt sich bis dahin laufend an.

## 2.26.1 – November 2026

- Marathon: Macht der lange Lauf in Aufbau oder Spitze mehr als 40 % der Woche aus, erklärt die Planübersicht warum (sichere Steigerung ab dem heutigen Umfang) und was hilft (Bonusläufe, Ruhetag danach, Schlaf). Der lange Lauf bleibt bei 26 km.

## 2.26.0 – November 2026

### Coach
- **Coach-Stil** (Profil): Vorsichtig · Ausgewogen (Standard) · Fordernd. Ausgewogen = fordernd mit Bremse; Fordernd = zwei Qualitätseinheiten ab 4 Lauftagen, ca. 15 % längere Tempoabschnitte.
- **Leistungsklassen** (Einsteiger, Fortgeschritten, Ambitioniert, Leistung) aus Leistungsindex und Wochenumfang. Der Plan richtet sich danach (Ausgewogen: höchstens eine Stufe über deiner Erfahrung), sichtbar im Profil.
- **Formtests alle 6–8 Wochen** in Entlastungswochen: abwechselnd 5 km auf Zeit und 30-Minuten-Test. Aus dem 30-Minuten-Test (Ø Puls der letzten 20 min) entstehen persönliche Pulszonen nach Schwellenpuls. Ein Testergebnis wird neue Referenz, wenn die alte ein Test oder älter als 8 Wochen ist.
- **«Warum heute?»** bei jeder Einheit: wozu sie dient und warum sie an diesem Tag liegt.
- **Marathon:** Ziel-Wochenumfang so, dass der lange Lauf höchstens etwa 38 % ausmacht (begrenzt durch eine sichere Steigerung ab deinem aktuellen Umfang).
- **Halbmarathon-Spitze:** Bleibt die spezifische Renntempo-Einheit, weicht bei langem Lauf mit Endbeschleunigung die Schwelle (vorher umgekehrt).

### Trainingstage und Abwechslung
- **Anzahl Läufe nach Phase:** Deine Trainingstage sind das Maximum. In Allgemein-, Grundlagen-, Entlastungs- und Tapering-Wochen wird ein lockerer Tag zum **optionalen Bonuslauf** (locker oder Alternativtraining); er zählt, wenn du ihn machst, und kostet nichts, wenn nicht. Aufbau und Spitze nutzen alle Tage.
- **Kurz–mittel–lang:** Nach harten Tagen ein kurzer Regenerationslauf, unter der Woche ein **mittellanger Lauf**, die übrigen lockeren Läufe variieren von Woche zu Woche. Steigerungen an höchstens zwei Tagen.

## 2.25.1 – November 2026

- **Monatsübersicht** ist umgezogen: Sie steht jetzt im Form-Tab gleich unter «Deine Form auf einen Blick». Auf der Übersicht öffnet «Diese Woche · Monat ›» sie direkt. Der Training-Tab hat wieder drei Ansichten (Erfassen, Trainingsplan, Einträge).

## 2.25.0 – November 2026

- **Neue Übersicht: Heute zuerst.**
  1. Die Einheit von heute ist die oberste Karte; der Morgen-Check sitzt unten in derselben Karte («Wie bereit bist du heute?»), danach steht dort die Bereitschaft mit Ampel.
  2. Das Ziel ist eine schmale Leiste: Tage bis zum Rennen, Woche der Vorbereitung, Prognose mit Ampel und ein Fortschrittsring. Renntag-Plan und Hinweise darunter.
  3. Eine Zeile Form: Fitness (mit Veränderung in 4 Wochen), Form, Effizienz-Trend der letzten 8 Wochen.
  4. Diese Woche mit Kilometern (erledigt / geplant) und Fortschrittsbalken.
  5. Kacheln: Trainings in Folge, Ø Note, Jahreskilometer mit Vergleich zum Vorjahr.
  6. Die nächsten 4 Wochen.
- Hinweis-Leiste «Plan bleibt auf Kurs»: Linie überdeckt den Text nicht mehr.

## 2.24.0 – November 2026

- **Monatsübersicht** (Training → Monat): eine Woche pro Zeile, pro Tag ein Kreis mit den gerundeten Kilometern. Grösse nach Distanz, Farbe nach Art (locker grün, lang blau, hart orange, Rennen dunkel), geplante Tage gestrichelt, verpasste grau. Rechts die Wochensumme plus noch Geplantes, oben Monatskilometer, Läufe, längster Lauf und Vergleich zum Vormonat bis zum gleichen Tag. Wischen oder Pfeile wechseln den Monat, Tippen öffnet den Tag.
- **Trainingsplan:** Wochen weiter in der Zukunft zeigen ihre Schlüsseleinheiten als Vorschau.
- **Werkzeuge** (Menü oder Form-Tab): Pace/Zeit/Distanz mit Zwischenzeiten, Zeit auf andere Distanzen umrechnen samt Trainings-Paces, Steigung → Pace, Wetter → Pace (Temperatur, Luftfeuchtigkeit, Wind).
- **Wissen:** 15 kurze Erklärungen für Einsteiger (locker laufen, Zonen, Schwelle, VO₂max, Steigerungen, langer Lauf, Entlastung, Tapering, Verpflegung, Schlaf, Effizienz, VDOT, Form, Hitze, Schmerzen).
- **Analysen** (Form-Tab): Intensitätsverteilung pro Woche (locker/mittel/hart) mit Bewertung, Monotonie nach Foster, Pace bei gleichem Puls (letzte 6 Wochen gegenüber den 6 davor).
- **Wetter heute:** Ist ein Wohnort hinterlegt, zeigt die heutige Einheit Temperatur und Wind der nächsten Stunden und, wenn nötig, wie viel langsamer gleich hart ist (Open-Meteo).
- **Strecke im Renntag-Plan:** GPX laden → Höhenprofil, Höhenmeter, grösste Anstiege; die Zwischenzeiten werden an Steigung und Gefälle angepasst.
- HM und kürzer: Hat der lange Lauf eine schnelle Endphase und gibt es schon zwei harte Einheiten, wird das Renntempo-Intervall dieser Woche ein lockerer Lauf mit Steigerungen.
- Feinschliff: ruhigere Animationen beim Aufklappen, Druck-Feedback auf Karten und Knöpfen, Tastatur-Fokus sichtbar, Zahlen in gleicher Breite, Hinweis-Leiste korrigiert; respektiert «Bewegung reduzieren».

## 2.23.0 – November 2026

### Trainingslogik (sportwissenschaftlich überarbeitet)
- **Renntempo wächst mit der Form:** Renntempo- und Marathontempo-Einheiten starten bei der aktuellen Form und erreichen das Zieltempo etwa 5 Wochen vor dem Rennen (letzter Renntempo-Test). Jede Zwei-Wochen-Auswertung mit besserem VDOT zieht mit. Marathontempo bleibt mindestens 3 % langsamer als die Schwelle, Halbmarathontempo nicht schneller als die Schwelle.
- **Obergrenzen pro Einheit** in Prozent des Wochenumfangs (nach Daniels): Schwelle 10 %, VO₂max 8 %, Schnelligkeit 5 %, Marathontempo 20 %, Renntempo 12–20 % je nach Distanz (mit Mindestwerten bei kleinem Umfang).
- **Renntempo-Test am Tag des langen Laufs:** Die zweite harte Einheit dieser Woche wird ein lockerer Lauf mit Steigerungen.
- **Langer Lauf** höchstens 40 % (4 Lauftage), 34 % (5) bzw. 30 % (6) der Woche; Marathon in Aufbau und Spitze mindestens 26 km. Ist er dadurch begrenzt, sagt der Plan, wie längere Läufe möglich werden.
- **Start beim echten Umfang:** Erfahrene starten mit ihrem angegebenen Wochenumfang statt 10 % darunter.
- **Mehr Reiz in der Grundlage:** Steigerungsläufe 2× pro Woche (Einsteiger 1× ab Woche 3), auch in der Allgemeinphase; Erfahrene mit 5+ Lauftagen behalten eine kurze Schwelle, in der Grundlagenphase 2 Qualitätseinheiten.
- **Schnelligkeit für 5 und 10 km:** neue Einheiten 200 / 300 / 400 m im Wiederholungstempo (R-Pace) mit voller Erholung.
- **Einsteiger:** ein Renntempo-Test statt zwei, kürzere Renntempo-Abschnitte bei kleinem Umfang.

### Fortschritt sichtbar
- **Die nächsten 4 Wochen** auf der Übersicht: Umfang, Phase, Entlastung und Schlüsseleinheiten pro Woche (z. B. «Schwelle 3 × 6 min», «Lang 24 km»), dazu wozu die Phase dient und wie der lange Lauf wächst.
- **Fitness & Form** (Form-Tab): Fitness (6 Wochen), Ermüdung (7 Tage) und Form aus Dauer × Anstrengung, mit Hochrechnung nach Plan bis zum Renntag («Am Renntag: Form +6, frisch») und Warnung bei zu schnellem Anstieg.
- **Blockbericht** nach jedem Trainingsblock: Kilometer, erledigte Einheiten, Effizienz und Decoupling gegenüber dem Block davor, längster Lauf, Ø Note, Prognose vorher/nachher und was der nächste Block bringt. Hinweis auf der Übersicht, sobald ein Block abgeschlossen ist.

### Bereitschaft, Status, Schuhe
- **Morgen-Check** auf der Übersicht: Schlaf, Beine, Schmerzen, optional Ruhepuls. Daraus entsteht eine **Bereitschaft 0–100** (Ruhepuls gegenüber deinem eigenen Schnitt, Ermüdung der letzten Tage) mit Ampel: ab 75 wie geplant, 60–74 leicht reduziert, 40–59 locker statt intensiv, darunter Erholung. Der Grund wird genannt.
- **Status:** Krank, verletzt oder Ferien direkt aus dem Morgen-Check als Pause eintragen.
- **Schuhe** (Profil): Kilometer pro Paar, Standardschuh, Grenze (Standard 700 km), Hinweis bei Erreichen; beim Erfassen wählbar.

## 2.22.0 – November 2026

- **Note in drei Teilen:** Umsetzung (40 %), Qualität (25 %), Fortschritt (35 %), jeweils 1–10, darunter die Einzelwerte.
  - **Umsetzung:** Ø Puls im Zielbereich der Einheit, Max. Puls unter dem Pulsdeckel, Pace in der Vorgabe (bei lockeren Läufen entscheidet der Puls), Anzahl Wiederholungen, Umfang.
  - **Qualität:** Decoupling, Gleichmässigkeit der Wiederholungen, Höhenmeter bei Bergintervallen, Anstrengung.
  - **Fortschritt:** Effizienz (Pace im Verhältnis zum Puls) gegenüber deinen letzten vergleichbaren Trainings, Niveau gegenüber den Bestzeiten.
- **Pulsdeckel = Maximalpuls:** Der Deckel gilt neu für den höchsten Puls der Einheit (Obergrenze des Zielbereichs + 3 % HFmax), der Zielbereich für den Ø Puls. Anzeige in der Einheit: «♥ Ø ≤ 149 · max 155» bzw. «♥ Ø 162–171 · max 177». Kein Deckel bei VO₂max, Bergintervallen und Fahrtspiel.
- **Max. Puls wird erkannt:** aus Screenshots («Max. Herzfrequenz», «Max HR», Runden-Tabellen mit Max-Spalte), aus FIT/GPX/TCX (höchster 5-Sekunden-Schnitt, damit einzelne Ausreisser nicht zählen) und als optionales Feld beim Erfassen.
- **Umfang weniger gewichtet und tolerant:** ±1 km bzw. ±10 % zählt als «wie geplant» und gibt keinen Kritikpunkt mehr.
- **Anstrengung frei wählen:** Die erwarteten Werte werden beim Erfassen nicht mehr markiert.

## 2.21.0 – November 2026

- **Neue Trainingsnote (ersetzt 2.20.0):** Die Note 1–10 ist ein gewichteter Mittelwert aus Faktoren, jeder selbst 1–10:
  - **Ausführung** (×3): Pace und Puls in den Zonen der Einheit (Plan, eigene Puls- und Tempozonen, Pulsdeckel).
  - **Fortschritt** (×3): Effizienz (Tempo pro Pulsreserve, Bergintervalle mit angepasster Pace) gegenüber deinen letzten vergleichbaren Trainings; ohne Puls die Pace bei gleicher Anstrengung.
  - **Niveau** (×1.5): Leistungsniveau dieses Laufs aus Pace und Puls im Vergleich zum VDOT aus Bestzeiten und Tests (nur bei Tempoläufen, langen Läufen und längeren Intervallen, wo das zuverlässig ist).
  - **Umfang** (×1.5) gegenüber dem Plan, **Anstrengung** (×1) gegenüber der Einheit.
  - **Spezifisch** (×2): Decoupling bei langen Läufen, Gleichmässigkeit und Anzahl der Wiederholungen bei Intervallen, **Höhenmeter bzw. Steigung bei Bergintervallen**.
  - Faktoren ohne Daten fallen weg; mit wenig Daten bleibt die Note näher bei der Mitte.
- Bei jeder Art von Lauf ist von 1 bis 10 alles möglich. Eine 10 braucht eine sauber umgesetzte Einheit und Fortschritt bzw. ein Niveau über den Bestzeiten; mit einem Kritikpunkt ist bei 9 Schluss.
- Unter der Note stehen die einzelnen Faktoren, das Urteil nennt den schwächsten Punkt («Schwacher Tag: Puls zu hoch und härter als vorgesehen»).
- **Bergintervalle:** Höhenmeter zählen jetzt. Aus der Spalte «Anstieg» (Höhenmeter pro Belastungs-km), sonst aus der an Steigung angepassten Pace (≈ Steigung in %), sonst aus den Höhenmetern des ganzen Laufs. Zu flach (unter ~2–3 %) gibt Abzug mit dem Hinweis, 5–8 % Steigung zu suchen.

## 2.20.0 – November 2026

- **Note 1–10 neu skaliert:** Bisher war die 10 praktisch nicht erreichbar (Intervalle max. 8–9, lockere Läufe max. 8, Bergintervalle max. 7), weil sich die Punkte von 5 aus aufsummierten. Neu:
  - 5 = Training erfasst. Die Kriterien, die für diese Einheit gelten und mit den vorhandenen Daten prüfbar sind, füllen bis 10 auf: Umfang, Pace bzw. Pulsdeckel, Puls im Zielbereich, Anzahl Wiederholungen, gleichmässige oder schneller werdende Wiederholungen, Anstrengung, Decoupling.
  - Abzüge (zu schnell, zu kurz, Puls zu hoch …) gehen davon ab.
  - Fortschritt (bessere Effizienz als bei vergleichbaren Läufen, viele Höhenmeter bei Bergintervallen) gibt Bonus und kann kleine Abzüge ausgleichen.
  - Eine 10 gibt es nur ohne Kritikpunkt, mit Pace, Puls und Anstrengung und wenn mindestens zwei Kriterien geprüft werden konnten.
- Neu bewertet: Puls im Zielbereich bei Qualitätseinheiten (+), alle geplanten Wiederholungen (+), Gleichmässigkeit der Wiederholungen aus den Runden (+/−).
- Frühere Einträge werden beim Öffnen mit der neuen Skala angezeigt.

## 2.19.2 – November 2026

- **Geplante Einheit als Referenz:** Pace-Vorgabe und Anzahl Wiederholungen kommen weiterhin aus der geplanten Einheit. Zeigen die Daten eine andere Art (z. B. VO₂max statt Schwelle), sagt das Feedback das neutral («Geplant war …, gelaufen hast du laut Daten …») und das Urteil lautet nicht mehr «wie geplant».

## 2.19.1 – November 2026

- **Art des Intervalltrainings aus den Daten:** Ein strukturiertes Training ist nicht automatisch ein Bergintervall. Die App bestimmt die Art so:
  - Name der Aktivität im Screenshot (z. B. «Hill sprints», «Schwelle», «Tempodauerlauf», «VO2max», «Fahrtspiel», «Renntempo»).
  - Steigung: an Steigung angepasste Pace deutlich schneller als die echte Pace oder viele Höhenmeter pro Belastungs-km → Bergintervalle; flach → nie Bergintervalle.
  - Pace der Belastungen im Vergleich zu deinen Zonen: VO₂max-, Schwellen-, Renntempo-Intervalle oder Fahrtspiel.
  - Die geplante Einheit gilt nur, wenn die Daten dazu passen.
- **Tempodauerlauf mit Einlaufen/Auslaufen:** Ein einzelner Belastungsblock (ab 8 min) wird als Tempoabschnitt erkannt; Pace und Puls kommen aus diesem Abschnitt, nicht aus dem ganzen Lauf.
- Beim Prüfen stehen nach erkannten Intervallen die Intervallarten zur Auswahl (VO₂max, Schwelle, Tempo, Berg, Fahrtspiel), damit Korrigieren ein Tipp ist.

## 2.19.0 – November 2026

- **Intervalle aus Screenshots:** Die Runden- bzw. Intervalltabellen von Garmin Connect, Polar Flow, Suunto und Apple Fitness werden mit ihrer Struktur gelesen: Einlaufen, Belastung («Laufen», «Run», «Work», «Intervall»), Erholung («Erholung», «Recovery», «Trabpause») und Auslaufen. Erkannt werden Anzahl × Dauer bzw. Distanz, Ø Pace, an Steigung angepasste Pace (SAP/GAP), Ø und max. Puls der Belastungen sowie Dauer und Puls der Erholungen.
- **Garmin-Filter:** Die Ansichten «Warm up», «Laufen», «Erholung», «Cool Down» können einzeln fotografiert werden; über die Gesamtzeit setzt die App sie wieder zum ganzen Training zusammen (auch ohne Übersicht). Die Ansicht «Alle» genügt allein.
- **Ohne Beschriftung:** Fehlen die Typen, erkennt die App wiederholte gleich lange, schnellere Runden als Belastungen.
- **Bergintervalle:** Höhenmeter pro Runde (Spalte «Anstieg») werden für die Belastungen summiert; das Feedback zeigt die an Steigung angepasste Pace.
- **Feedback zu Wiederholungen:** schneller werdend, gleichmässig oder abfallend; zu hoher Puls in den Trabpausen wird angesprochen.
- Achsenbeschriftungen von Diagrammen (Puls, Höhe) werden nicht mehr als Höhenmeter gelesen.
- Ist nur die Belastungstabelle ohne Gesamtlauf vorhanden, sagt die App genau, welcher Screenshot noch fehlt.

## 2.18.0 – November 2026

- **Jahreskilometer:** Auf der Übersicht eine Zeile mit den Laufkilometern des laufenden Jahres, dem Vergleich zum gleichen Datum im Vorjahr und dem Städtevergleich («≈ Zug → München · nächstes Ziel: Dijon»).
- **Jahresübersicht** (Tippen auf die Zeile): Jahre wählbar, Kilometer, Läufe, Zeit, Höhenmeter, Vergleich zum Vorjahr, Satz «so weit wie von … bis …» (Luftlinie) mit nächstem Ziel, Monatstabelle mit km, Läufen, Ø Effizienz und Ø Decoupling.
- **Jahreswechsel:** Ab dem 1. Januar zeigt die Übersicht das neue Jahr mit dem Vergleich zum Vorjahr am gleichen Datum; abgeschlossene Jahre werden als Zusammenfassung archiviert.
- **Wohnort:** beim Start (optional), im Profil oder direkt in der Jahresübersicht; rund 230 Orte (grössere Schweizer Orte, Städte weltweit) sind hinterlegt, sonst «Standort verwenden». Gezählt werden nur Laufkilometer.

## 2.17.0 – November 2026

- **Effizienz:** Die grosse Zahl ist jetzt der Trend über alle Dauerläufe (wie die gestrichelte Linie) statt des Vergleichs erstes gegen letztes Drittel. Sie erscheint ab 6 Dauerläufen über mindestens 3 Wochen; vorher steht «noch zu wenig Daten».
- **Alternativtraining mit passenden Feldern je Sportart:**
  - Rennrad, Mountainbike, Langlauf (mit Skating/Klassisch): Dauer, Distanz oder Ø km/h, Höhenmeter, Puls.
  - Skitour/Schneeschuh und Wandern: Dauer, Distanz, Höhenmeter, Puls.
  - Indoor-Velo: Dauer, Puls, Ø Watt, Distanz optional.
  - Rudern: Dauer, Distanz in Metern oder Ø /500 m, Puls.
  - Schwimmen: Schwimmbad (25/50 m) oder Freiwasser, Dauer, Distanz in Metern oder Ø /100 m, Puls optional.
  - Aqua-Jogging, Crosstrainer, Hyrox, Andere: nur was dort Sinn ergibt.
  - Was fehlt, rechnet die App live aus (km/h, /500 m, /100 m oder die Distanz).
  - Listen und Feedback zeigen die sportartspezifischen Werte (z. B. «1'800 m · 2:13 /100 m · Becken 50 m»).
  - Ist die Sportart schon gewählt, steht nur sie da, mit «Andere Sportart …».
- Behoben: Beim Bearbeiten eines Alternativtrainings ging die Sportart verloren.

## 2.16.1 – November 2026

- 5 und 10 km: In der spezifischen Phase wechseln sich VO₂max-Intervalle und Schwelle ab, dazu Renntempo-Intervalle; Halbmarathon: jede dritte Woche VO₂max statt Schwelle.
- VO₂max-Zeitintervalle höchstens 6 × 3 min (wenig Erfahrung 5 ×).

## 2.16.0 – November 2026

- **Mehr Abwechslung:** Jede Trainingsart hat mehrere Formen mit gleicher Wirkung, die Woche für Woche wechseln.
  - Fahrtspiel: 1 min, 2 min, Pyramide, 30/30, Mona-Fartlek, Leiter.
  - Hügel: 60 s, kurze steile Sprints, lange Hügel, Hügel-Pyramide.
  - Tempolauf: am Stück, 2- oder 3-teilig, progressiv.
  - Schwelle: 1000 m, 1.6 km, 2 km, 3 km, Pyramide, 6-min-Zeitintervalle.
  - VO₂max: 800 m, 1000 m, 1200 m, 3 min, Pyramide, 400er-Serien.
  - Renntempo: je nach Distanz verschiedene Längen.
  - Marathontempo: am Stück, 2-teilig, Wechsel 2 km/1 km, progressiv.
- **Immer angegeben:** Pace bzw. Zeit oder Distanz, die Trabpause und der Pulsbereich der Belastungen (bei kurzen Intervallen «gegen Ende», weil der Puls nachhinkt). Lockere und lange Läufe zeigen den Pulsdeckel.
- **Renntempo** (Marathontempo-Läufe, -Blöcke im langen Lauf, Renntempo-Tests und -Intervalle) hat überall denselben Pulsbereich wie die Testauswertung und der Renntag-Plan (Marathon 78–88 %, Halbmarathon 84–91 % der HFmax).
- **Schwellenumfang** pro Einheit höchstens rund 8 km (wenig Erfahrung 6.5 km).
- **Wiederholungen** werden im Feedback mit der geplanten Anzahl verglichen, auch bei Pyramiden und Serien.

## 2.15.2 – November 2026

- Harte Einheiten liegen nie mehr an zwei Tagen hintereinander: Die beiden Qualitätstage werden gemeinsam so gewählt, dass zwischen ihnen und dem langen Lauf möglichst viel Abstand liegt (z. B. Di/Do/So statt Di/Mi/So).
- Marathon: Enthält der lange Lauf schon Marathontempo (Endbeschleunigung, Marathontempo-Block) oder steht ein Renntempo-Test an, wird der Marathontempo-Lauf unter der Woche zu einem mittellangen lockeren Lauf. Marathontempo-Läufe unter der Woche höchstens 12 km (sehr viel Erfahrung 14 km).
- Marathon-Rennwoche: eine kurze Renntempo-Schärfung 4–5 Tage vor dem Rennen.
- Halbmarathon: Renntempo-Intervalle höchstens 3 × 4 km.
- Rennen: Die Verpflegung in der Einheit entspricht dem Renntag-Plan.

## 2.15.1 – November 2026

- Zeit- und Pace-Felder (Dauer, Pace, Hälften, Zonen, Onboarding) öffnen auf dem Handy die Zahlentastatur mit Punkt bzw. Komma. «5.20», «5,20» oder «520» wird beim Verlassen des Felds automatisch zu «5:20», «1.15» bei der Dauer zu «1:15».

## 2.15.0 – November 2026

**Marathon und Halbmarathon**
- Lange Läufe mit Marathontempo-Block (wächst von 8 auf 14–18 km) und mit Renntempo-Finish; Verpflegung üben ist bei allen langen Läufen ab 75 min konkret vorgegeben.
- Renntempo-Tests (Marathon 12 und 18 km, Halbmarathon 6 und 10 km, 10 km 3 und 5 km) mit Auswertung von Pace, Pulsniveau, Decoupling und Anstrengung: «Zieltempo sitzt», «knapp» oder «sitzt noch nicht» mit realistischer Zielzeit. Der Testabschnitt wird aus den Kilometer-Splits automatisch erkannt.
- **Renntag-Plan** für jedes Rennen: Pacing mit Zwischenzeiten, Pulsgrenze, Gels pro Kilometer, Kohlenhydrate laden, Frühstück, Ablauf am Morgen, Checkliste der letzten Woche, Vertrauen aus den Tests, druckbar.
- Langer Lauf wächst schrittweise (höchstens +12 % bzw. +2.5 km pro Woche), sinkt im Marathon-Tapering gestaffelt; der längste Lauf der letzten 4 Wochen kann beim Start angegeben werden.

**Erfassen mit weniger Klicks**
- Screenshot, Datei und von Hand direkt bei der Einheit; die Hilfeseite erscheint nur noch auf Wunsch. Knopf «+ Training» unten rechts.
- Mehrere Aktivitäten von verschiedenen Tagen auf einmal hochladen und gemeinsam speichern.
- Screenshot einfügen (Ctrl/Cmd+V) oder ins Fenster ziehen; auf Android «Teilen → Tempomacher» aus Garmin Connect oder Strava.
- «Prüfen & speichern» mit Vorschaubild, Rückfrage bei abweichendem Datum, Warnung, wenn Runden und Übersicht nicht zum gleichen Lauf gehören (die Runden werden dann ignoriert).
- Anstrengung wird mit 1–10 angetippt und ist nicht mehr vorausgefüllt. Weniger Laufarten auf einen Blick, keine Platzhalter mehr, die wie Werte aussehen; Höhenmeter-Bereiche nur noch ohne genauen Wert.

**Keine Widersprüche mehr**
- Belastungsbremse: Nach einer Woche mit stark gestiegener Belastung wird die harte Einheit bis Mittwoch durch einen lockeren Lauf ersetzt; Form, Wochenrückblick, Wochenleiste und Tagesansicht sagen dasselbe.
- Lockere Läufe werden nach Puls bewertet, wenn er vorhanden ist; höhenbereinigte Pace ist beschriftet; zusätzliche Läufe heissen «Zusatztraining».
- Zielrealismus schon beim Start, mit realistischem Wert zum Übernehmen; dieselbe Rechnung für «Auf Kurs?», Rennkarte und Renntag-Plan.
- Bestzeit schneller als die Prognose: Hinweis mit «Als Referenz übernehmen».

**Design**
- Übersicht deutlich kürzer: Countdown, Heute, Woche, nächste Woche in einer Zeile; Wochenumfang nur noch unter Form, Rennen im Countdown.
- Einchecken zum Aufklappen, klare Hierarchie im Training-Tab, Fenster mit ✕ und zum Herunterwischen.
- Effizienz zuerst als Prozent in Worten, Belastung als «×-facher Schnitt», Erklärungen hinter ⓘ; Laufarten auf Deutsch; Warnfarbe deutlich vom Hauptknopf unterschieden.

## 2.14.2 – November 2026

- Hügelfaktor (Effizienz-Diagramm), persönliche Hügel-Anpassung und Umrechnungsfaktor beim Alternativtraining mit zwei Nachkommastellen (vorher z. B. «×1» statt «×1.03»).
- Effizienz wird überall mit zwei Nachkommastellen berechnet und angezeigt (Tooltip, Ø-Wert, Analyse).
- Effizienz rechnet mit der exakten Distanz und Zeit (z. B. 6.11 km in 34:44) statt mit der gerundeten Pace; Tooltip zeigt Distanz auf zwei Stellen plus Zeit.

## 2.14.1 – November 2026

- «Vergangene Rennen» ist ausklappbar; zugeklappt zeigt die Zeile Anzahl, letztes Resultat und Rennen ohne Resultat.
- Bei erreichtem Ziel steht, um wie viel es unterboten wurde (z. B. «✓ 3:30 unter Ziel»), sonst «+6:40 über Ziel».

## 2.14.0 – November 2026

- **Vergangene Rennen** stehen unter Ziele in einem eigenen Abschnitt, mit Resultat, Abweichung vom Ziel und Note.
- **Resultat eintragen:** Endzeit, optional Ø Puls, Zeit der 1. Hälfte, Höhenmeter, Bedingungen (heiss, kalt, Wind, Regen) und Anstrengung. Das Rennen zählt auch als Training (Belastung, Einträge, Meilensteine).
- **Rennauswertung:** Vergleich mit Zielzeit, Prognose aus dem Training, bisheriger Bestzeit, Einteilung (Split), rennüblichem Puls für die Distanz und Bedingungen; dazu «Schlüsse für dein Training» (Einteilung, Ermüdungsresistenz und Verpflegung, realistisches nächstes Ziel, Erholung).
- **Als Bestzeit & Referenz übernehmen:** Mit einem Tipp wird das Resultat zur Bestzeit und Referenz; Leistungsindex, Paces und Prognosen richten sich danach.


## 2.13.0 – November 2026

- **Alternativtraining direkt aus der Tagesansicht:** neben «Training erfassen» ein eigener Knopf «Alternativtraining». Zuerst Sportart wählen und «Statt «…»» oder «Zusätzlich», dann Screenshot, Datei oder von Hand. Die gewählte Sportart gilt auch, wenn der Screenshot keinen Hinweis auf die Sportart enthält. Gleicher Knopf im Bereich Training › Erfassen.
- **Effizienz-Diagramm:** Ein Punkt zeigt beim Überfahren mit der Maus bzw. beim Antippen Datum, Training, Distanz, Pace, Puls, Höhenmeter (mit Hügelfaktor) und die berechnete Effizienz.


## 2.12.2 – November 2026

- **Höhenmeter nachtragen:** Unter Form › Effizienz listet die App Läufe der letzten 180 Tage, bei denen nur die Höhenmeter-Spanne bekannt ist. Genaue Zahl eintippen, OK: Die Effizienz wird sofort korrekt bereinigt.

## 2.12.1 – November 2026

- **Trendlinien** im Effizienz- und im Decoupling-Diagramm (gestrichelt, lineare Regression über alle Punkte) mit Angabe der Veränderung, z. B. «Trend Dauerläufe: +1.9 % in 6 Wochen» bzw. «−4 Prozentpunkte (besser)».
- **Fehler behoben:** In 2.12.0 konnte der Bereich «Form» mit hügeligen Läufen nicht angezeigt werden.

## 2.12.0 – November 2026

- **Effizienz bei Hügeln neu:** Faktor aus Energiekosten (Minetti, quadratisch) und Puls-Anteil, stufenlos; unter 5 m/km keine Korrektur, über 80 m/km keine Effizienz. Persönliche Anpassung aus eigenen flachen und hügeligen Läufen. Vergleiche bevorzugt mit Läufen ähnlicher Hügeligkeit; hügelige Läufe im Diagramm als Ringe.
- **Höhenmeter in Screenshots besser erkannt:** auch ohne Umlaut («Hohenmeter»), mit Wert über oder unter der Beschriftung, «Gesamtanstieg», «Elevation Gain», «Aufstieg», Angaben mit «hm» oder Pfeil (↗).
- **Formular:** Erkannte Höhenmeter stehen im Feld, und die passende Spanne ist gewählt; beim Eintippen springt die Spanne mit.


## 2.11.1 – November 2026

- **Effizienz höhenbereinigt:** Für den Effizienz-Index zählt jetzt jeder Höhenmeter (bis 30 m/km: 1 Höhenmeter ≈ 2 m zusätzliche flache Strecke, bei steileren Läufen bis 4 m bei 80 m/km), weil der Puls auf jeden Anstieg reagiert. Die Bewertung der Pace bleibt wie gehabt (erst ab 1 % Anstieg).

## 2.11.0 – November 2026

- **Darstellung:** Profil → Einstellungen → Darstellung: Automatisch (wie das Handy), immer hell oder immer dunkel. Gilt pro Gerät und wirkt schon beim Start, auch auf der Anmeldeseite.

## 2.10.0 – November 2026

- **Alternativtraining voll gewertet:** Rennrad, Mountainbike, Indoor-Velo, Langlauf, Skitour/Schneeschuh, Schwimmen, Aqua-Jogging, Crosstrainer, Rudern, Wandern, Hyrox und Andere.
- **Lauf-Äquivalent:** Umrechnung nach Sportart (Spezifität) und Puls mit sportartbereinigter HFmax, z. B. «entspricht etwa 69 min Laufen in Z2, rund 11.5 km».
- **Note und Feedback** für Alternativtraining; «Statt geplantem Lauf» vergleicht mit der geplanten Einheit und zählt nicht als verpasst.
- **Screenshots und Dateien:** Sportart wird erkannt (Text, FIT/GPX/TCX), dazu Dauer, Distanz, Ø Puls, Höhenmeter und Ø Geschwindigkeit. Werte ab 1000 (z. B. 1120 hm) werden jetzt vollständig gelesen.


## 2.9.1 – November 2026

- Versionsnummer unten auf jeder Seite, damit sich prüfen lässt, ob die neue Version geladen ist.
- Die Seite wird beim Öffnen immer frisch vom Server geladen (am Browser-Zwischenspeicher vorbei); neue Uploads erscheinen damit beim nächsten Öffnen.

## 2.9.0 – November 2026

Auswertung alle zwei Wochen nach klaren Grundsätzen:
- **Keine Schlüsse aus zu wenig Daten:** Paces ändern sich nur mit mindestens 3 Qualitätseinheiten mit Pace, Puls und Anstrengung aus den letzten 4 Wochen. Schneller nur, wenn auch Puls und Anstrengung passen; pro Auswertung höchstens ±0.5 Leistungsindex.
- **Alles im Lot = keine Änderung:** Der Umfang wird nicht mehr automatisch erhöht (die Steigerung steckt schon im Plan).
- **Umfang sinkt nur bei gemeldeten Warnzeichen** (starke Schmerzen, Krankheit, Müdigkeit, deutlich zu hart bei schlechtem Gefühl). Nicht erfasste Einheiten zählen nicht als Müdigkeit.
- **Dynamisch über die Trainingsart:** Die zweite Qualitätseinheit richtet sich nach den Daten (Grundlage, Schwelle oder Tempohärte).
- Die Auswertung erklärt jeweils, warum sich etwas ändert oder nicht («Paces bleiben: bisher 2 von 3 nötigen Einheiten», «Alles im Lot»).


## 2.8.1 – November 2026

- **Fehler behoben:** Beim Eintragen oder Wechseln eines Ziels wurde der bisherige Wochenumfang durch den Schnitt der erfassten Läufe der letzten 3 Wochen ersetzt, auch wenn die App erst wenige Tage genutzt wurde (z. B. 60 km → 4 km). Jetzt nur noch, wenn seit mindestens 3 Wochen erfasst wird und mindestens 4 Läufe vorliegen, und nie unter 70 % des bisherigen Werts.
- **Wochenumfang im Profil bearbeitbar** (Profil → Bearbeiten: aktueller Wochenumfang und Läufe pro Woche).
- **Grundlagenphase vor der Zielvorbereitung weniger konservativ:** rund 90 % des bisherigen Umfangs (höchstens der Spitzenumfang) statt 60 %. Erfahrene Läufer behalten alle Lauftage, eine strukturierte Einheit pro Woche (Fahrtspiel, Hügel, kurzes Tempo) und einen langen Lauf bis 90 min; jede 4. Woche Entlastung mit 80 %.
- **Fit werden & bleiben:** Wer schon mehr läuft als das gewählte Zeitbudget, behält mindestens 80 % seines bisherigen Umfangs.


## 2.8.0 – November 2026

- **Konkretes Verbesserungspotenzial auch nach guten Einheiten:** Recovery zu zügig, Pace am schnellen Rand des Zielbereichs, Puls nahe am oder knapp über dem Deckel, Hinweis auf die nächste harte Einheit (morgen/übermorgen), Stand des Wochenumfangs, bei langen Läufen Splits und Verpflegung. Der allgemeine Satz erscheint nur noch, wenn nichts Konkretes zutrifft.
- **Zusätzliche Trainings in «Diese Woche»:** Tage mit einem zusätzlichen Training zeigen ✓ und sind farbig hinterlegt; ein Tipp darauf zeigt das Training. «Trainings in Folge» zählt weiterhin nur geplante Einheiten.


## 2.7.3 – November 2026

- «Weitere Hinweise» bei zu schnellen Qualitätseinheiten an das Feedback angeglichen (kein Lob mehr für zu schnelles Laufen).

## 2.7.2 – November 2026

- **Genaue Höhenmeter:** Im Erfassen-Formular gibt es neben der Auswahl ein Feld für die genauen Höhenmeter. Es wird aus Screenshot oder Datei vorausgefüllt und lässt sich korrigieren. Ohne genaue Zahl gilt die gewählte Spanne. Wählt man eine Spanne, die nicht zur Zahl passt, wird die Zahl verworfen.
- Screenshot-Erkennung: Höhenmeter, Puls und Distanz werden in mehrspaltigen Layouts (z. B. Strava «Höhenmeter · Kalorien · Ø Herzfrequenz») jetzt über die Einheit (m, bpm, km) zugeordnet.
- Strava- und Garmin-Screenshots zusammen: Übersicht (Distanz, Zeit, Puls, Höhenmeter) aus dem Übersichtsbild, Runden mit Puls aus dem Garmin-Bild, in beliebiger Reihenfolge.


## 2.7.1 – November 2026

- Note in der Liste «Einträge», im Ø der Übersicht und im Wochenrückblick ist jetzt dieselbe wie im Feedback (vorher fehlte in der Liste der Vergleich mit früheren Läufen).
- Höhenbereinigung nur noch bei hügeligen Läufen: gezählt wird nur der Anstieg über 1 % der Distanz, und davon die Hälfte (Abwärts holt man einen Teil wieder auf). Genaue Höhenmeter aus Screenshot oder Datei haben Vorrang; die Klasse «0–50 hm» gilt als flach.
- Kacheln auf der Übersicht: km diese Woche → Form › Wochenumfang, Trainings in Folge → Trainingsplan (aktuelle Woche), Ø Note → Einträge.


## 2.7.0 – November 2026

- **Feedback kritischer und klarer:** Zuerst ein Satz als Urteil («Gute Einheit, aber zu schnell»). Zu schnell bei Schwelle und Intervallen gibt jetzt Abzug statt Lob; die Anzahl Wiederholungen wird mit dem Plan verglichen. Vergleich und Formverlauf zum Aufklappen.
- **Training erfassen mit einem Knopf:** danach Screenshot, Datei oder von Hand wählen. «Nicht durchgeführt» als Link.
- **Auf Kurs?** Countdown und Ziele zeigen Ziel, Prognose und Ampel (auf Kurs / in Reichweite / ambitioniert).
- **Verschieben:** Einheit auf einen anderen Tag legen oder tauschen; zwei harte Tage hintereinander sind gesperrt.
- **Pause:** krank, verletzt, Ferien. Plan leer, nichts gilt als verpasst, danach sanfter Wiedereinstieg.
- **Wochenrückblick** auf der Übersicht (Sonntag bis Dienstag) mit Schwerpunkten der nächsten Woche.
- **Trainingsplan:** Phasenbalken mit «du bist hier», Erklärung zum Aufklappen, vergangene Wochen ausgeblendet.
- **Form:** «Deine Form auf einen Blick» in Klartext mit Ampel; Diagramme zum Aufklappen; Trainingsbelastung verständlich erklärt.
- **Profil** in Gruppen mit aufklappbaren Kacheln; Leistungsindex jetzt bei Form, Plananpassung beim Trainingsplan.
- **Schutz vor Datenverlust:** Profile nur auf dem Gerät erhalten alle 2 Wochen eine Erinnerung zur Sicherung.


## 2.6.0 – November 2026

- **Konto-Menü oben rechts:** Ein Tipp auf den Kreis mit der Initiale öffnet «Profil» und «Abmelden». Unten bleiben vier Reiter: Übersicht, Training, Form, Ziele.
- **Geburtsdatum statt Alter:** Das Alter zählt jetzt automatisch mit und hält den geschätzten Maximalpuls (und damit Zonen und Pulsdeckel) aktuell. Bestehende Profile behalten ihr Alter, bis das Geburtsdatum ergänzt wird (Hinweis im Profil).


## 2.5.1 – November 2026

- Meilensteine: Zahlen richtig formatiert (2'500 und 5'000 km statt 2.5'000)
- Neuer Meilenstein: 15 km am Stück

## 2.5.0 – November 2026

- **Wochenumfang wächst mit:** In der ersten Woche nur die aktuelle Woche, danach jede Woche eine mehr, ab der vierten Woche die letzten 4 Wochen. Gezählt wird ab Planstart bzw. erstem erfassten Lauf.
- **Trainings in Folge statt Flamme:** Die Kachel auf der Übersicht zählt geplante Einheiten, die am Stück durchgeführt und erfasst wurden. Gleich für alle Leistungsstufen.
- **Meilensteine unter Form:** aktuelle Serie und Rekord, längster Lauf (5, 10, 15, 21.1, 30, 42.2 km), Anzahl Läufe (10–500) und Kilometer gesamt (50 bis 5'000). Alle Stufen sind sichtbar, erreichte sind markiert.
- Die Kachel «Dranbleiben» auf der Übersicht entfällt.


## 2.4.0 – November 2026

- **Passwort ändern** (Profil → Passwort): altes Passwort bestätigen, neues festlegen. Online-Profile werden dabei mit dem neuen Passwort neu verschlüsselt; auf anderen Geräten meldet man sich einmal neu an. Braucht die neue Funktion `tm_change` in Supabase (docs/sql/supabase-setup.sql nochmals ausführen).
- **Übersicht neu, kompakter und lebendiger:** Countdown, darunter die heutige Einheit in der Farbe ihrer Zone mit der nächsten Einheit, drei Kacheln (km diese Woche, Wochen in Folge, Ø Note), die aktuelle Woche und ausklappbare Kacheln für «Nächste 2 Wochen», «Dranbleiben», «Wochenumfang», «Anlässe» und «Frag den Coach». Ob eine Kachel offen ist, merkt sich die App.
- Plananpassung als kurze Zeile mit «Warum?» zum Aufklappen
- Hinweis «Bitte neu anmelden» direkt auf der Übersicht, wenn das Passwort auf einem anderen Gerät geändert wurde
- Englisch: «Days until» im Countdown


## 2.3.0 – November 2026

Einfacher und übersichtlicher, je nach Ziel:

- Einrichtung: kein vorausgewähltes Ziel mehr; der Gesundheitshinweis ist ein kurzer Haken im letzten Schritt statt eines grossen Banners
- Übersicht für Neue: Karte «So startest du» (Einchecken, Laufen, Erfassen); Wochenmauer und Anlässe erscheinen erst, wenn es Läufe bzw. Rennen gibt
- Neue Karte «Dranbleiben»: Wochen in Folge, Wochenziel, Meilensteine (z. B. erster 10er, 100 km gesamt)
- Tab «Rennen» heisst «Ziele» und zeigt dein Ziel (Rennen, persönliches Ziel oder fit bleiben)
- Kopfzeile schlanker: Profil-Kreis mit Initiale statt Name, Status und Abmelden
- ⓘ-Erklärungen zu Leistungsindex, Effizienz, Decoupling, Trainingsbelastung, Zonen, Prognosen, Plananpassung und Note
- Form: nur Diagramme mit Daten, dazu «Kommt noch» mit dem, was wann erscheint; geschätzte Prognosen sind als grobe Schätzung markiert
- Einträge als übersichtliche Liste mit Note statt breiter Tabelle
- Datensicherung: Plan, Einträge und Bestzeiten als Datei sichern und wiederherstellen (Profil → Datensicherung)
- Kraft & Mobilität: 2 × pro Woche ein 15–20-Minuten-Block nach einem lockeren Lauf (abschaltbar im Profil)
- Check-in mit Option «Heiss (über 25 °C)»: nach Puls statt Pace, lockere Läufe langsamer, Qualitätseinheiten etwas kürzer


## 2.2.1 – Oktober 2026

- Übersicht: Ein Tipp auf die heutige Einheit öffnet die Beschreibung mit «Training erfassen», «Screenshot hochladen», «Datei importieren» und «Nicht durchgeführt»; ohne Check-in ein Hinweis zum Einchecken

## 2.2.0 – Oktober 2026

- Trainingszonen im Profil manuell anpassen (Puls von–bis und Pace pro Zone), vorausgefüllt mit den berechneten Werten; jederzeit auf berechnete Werte zurücksetzbar. Angepasste Paces steuern auch die Trainingspaces
- Pulsdeckel («♥ max …») bei Einheiten, bei denen er hilft, in der Zielzone zu bleiben: Easy, Long, Recovery, Spass- und Lockerläufe, Marathontempo, Tempodauerlauf, Schwellen- und Renntempo-Intervalle (dort für die Belastungen). Kein Deckel bei VO₂max-Intervallen, Hügeln und Fahrtspiel, weil der Puls dort zu träge reagiert


## 2.1.0 – Oktober 2026

- Vor dem Screenshot-Upload: Liste, welche Screenshots es braucht (Übersicht; bei Intervallen die Runden mit Pace und Puls; bei langen Läufen die Kilometer-Splits mit Puls). Was für die geplante Einheit nötig ist, ist hervorgehoben; abschaltbar und im Import-Formular wieder aufrufbar
- Intervalle: Distanz und Dauer zählen für das ganze Training, Effizienz und Form nur aus den Belastungen. Fehlen Rundendaten, bleiben die Felder für die Belastungen leer statt mit dem Durchschnitt des ganzen Trainings gefüllt, und das Feedback sagt, was fehlt
- Decoupling bei langen Läufen auch aus Kilometer-Splits auf Screenshots


## 2.0.1 – Oktober 2026

- Übersicht: Ein heute erfasstes Training ersetzt die geplante Einheit in der Heute-Karte (Distanz, Zeit, Pace, Puls, Note), auch bei zusätzlichen Trainings
- Mehrere Screenshots: Jedes Bild wird einzeln gelesen und danach zusammengeführt; Kopfzeilen von Runden-/Splits-Tabellen und Pulszonen werden nicht mehr als Gesamtwerte übernommen, unmögliche Kombinationen verworfen

## 2.0.0 – Oktober 2026

- Drei Wege beim Einrichten und im Profil: **Rennen**, **persönliches Ziel** (Distanz am Stück, Zielzeit oder Zielpace, Datum optional) oder **fit werden & bleiben**
- Persönliches Ziel: Vorbereitung wie für ein Rennen, am Ende ein Zieltest; danach neues Ziel setzen oder Form halten
- Fit werden & bleiben: Zeitbudget pro Woche (orientiert an den WHO-Empfehlungen von 150–300 min), Aufbau um höchstens 6–8 % pro Woche mit Entlastungswochen, danach Erhalt in 3-Wochen-Zyklen mit einer intensiven Einheit pro Woche und einem Formcheck alle 8 Wochen
- Ø Pace der normalen Läufe als Angabe beim Einrichten (Pflicht ohne Referenzzeit); daraus werden die Trainingsbereiche geschätzt
- Nach dem letzten Rennen oder Zieltest geht der Plan automatisch in den Erhalt über, statt zu enden


## 1.9.2 – Oktober 2026

- Texterkennung findet ihre Dateien auch, wenn sie beim Hochladen im Hauptordner statt in `vendor/` gelandet sind

## 1.9.1 – Oktober 2026

- Texterkennung startet ohne Blob-Worker (robuster mit der Sicherheitsrichtlinie, v. a. auf dem iPhone) und bricht nach 2 Minuten mit einer Meldung ab statt zu hängen
- Klare Meldung, wenn die Dateien im Ordner `vendor/` auf der Webseite fehlen, inkl. Liste der fehlenden Dateien


## 1.9.0 – Oktober 2026

- Schutz gegen Passwort-Raten: Nach 10 Fehlversuchen 15 Minuten Sperre, ab 20 Fehlversuchen 60 Minuten (SQL-Skript erneut ausführen)
- Keine fremden Server mehr auf der GitHub-Seite: Schriften in die Seite eingebettet (statt Google Fonts), Texterkennung und Sprachdaten im Ordner `vendor/` (statt jsDelivr)
- Content Security Policy: Die Seite führt nur ihren eigenen, per Prüfsumme festgelegten Code aus und verbindet sich nur mit sich selbst und Supabase
- Referrer wird nicht mehr an andere Seiten weitergegeben


## 1.8.0 – Oktober 2026

- Trainingsfeedback nach jedem erfassten Lauf: Note 1–10, Plus- und Minuspunkte, Verbesserungspotenzial
- Vergleich mit den letzten bis zu 6 gleichartigen Einheiten (Easy Run mit Easy Run, Schwellenintervalle mit Schwellenintervallen usw.) als Tabelle: Pace höhenbereinigt, Puls, Distanz, Höhenmeter, Anstrengung
- Formverlauf: Entwicklung des Effizienz-Index der letzten 8 Wochen
- Feedback auch in jedem Eintrag sichtbar; die bisherigen Hinweise unter «Weitere Hinweise»
- Bestzeiten-Verlauf neu als Balken pro Distanz, passt auf jede Handybreite


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
