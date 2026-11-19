# Quellcode

Die App ist eine einzige, statische Datei (`index.html`). Der Quellcode ist zur Übersicht in Teile gegliedert:

- `style.css`: die ganze Gestaltung (Design-Tokens oben, am Ende das Design-System 3.0)
- `shell-*.html`: der Seitenrahmen
- `js/NN-name.js`: die Logik, in der Reihenfolge der Dateinamen zusammengesetzt
  - `00-core-plan-engine.js`: Trainingsplan (Phasen, Umfang, Wochen, Einheiten, Ramp-Guard)
  - `03-morning-check-readiness-0-10.js`: Morgen-Check, Bereitschaft, Beschwerden, Belastungssteuerung
  - `06-training-feedback-score-1-10.js`: Note und Coach-Feedback
  - `10-…`: Kraftprogramm in 4 Stufen
  - `24-charts.js`: Grafiken, u. a. die Ziegel-Mauer
  - `28e-progress-view.js`: Reiter «Fortschritt»
- `assemble.py`: fügt die Teile zur Einzeldatei zusammen
- `rules_test.py`: Regeltests für die Plan-Logik (189 Läuferprofile; Steigerung, langer Lauf, harte Einheiten, Ruhetag, Tapering)
