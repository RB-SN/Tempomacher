# Datenschutzhinweis

*Vorlage: Bitte Namen und Kontakt ergänzen und den Text vor der Veröffentlichung prüfen. Dieser Hinweis ist keine Rechtsberatung.*

**Verantwortlich:** [Name, Ort, E-Mail]

## Welche Daten verarbeitet werden

Tempomacher verarbeitet Angaben, die du selbst eingibst oder importierst:
- Profil: Name, Alter, Geschlecht, Lauferfahrung, Maximal- und Ruhepuls, Trainingstage.
- Training: Pace, Puls, Distanz, Dauer, Höhenmeter, Anstrengung, Befinden, Schmerzen, Krankheitstage.
- Rennen, Bestleistungen, Werte aus Leistungsdiagnostik.
- Importierte Aktivitätsdateien (FIT, GPX, TCX) und Screenshots von Aktivitäten.

Puls-, Befindens- und Krankheitsangaben sind Gesundheitsdaten und gelten als besonders schützenswert.

## Wo die Daten gespeichert werden

Alle Daten werden im Browser deines Geräts gespeichert (localStorage).

Nutzt du dasselbe Profil auf mehreren Geräten, werden die Daten zusätzlich im Online-Speicher **Supabase** abgelegt, aber **nur verschlüsselt**: Die App verschlüsselt sie auf deinem Gerät mit einem Schlüssel aus deinem Passwort (AES-256-GCM), bevor sie übertragen werden. Online gespeichert sind der Benutzername, ein Hash eines Prüfwerts, der verschlüsselte Datenblock und der Zeitpunkt der letzten Änderung. Das Passwort selbst wird nie übertragen. Weder Supabase noch der Betreiber können die Trainings- und Gesundheitsdaten lesen. Serverstandort: [Region eintragen, z. B. Zürich].

- Aus importierten Dateien speichert die App nur die ausgewerteten Werte. GPS-Koordinaten werden nicht gespeichert.
- Passwörter werden nur als Prüfwert (gesalzener SHA-256-Hash) auf dem Gerät abgelegt. Sie schützen das Profil vor anderen Personen am selben Gerät, sind aber kein Schutz gegen Zugriff auf das Gerät selbst.

## Externe Dienste

- **GitHub Pages** (GitHub Inc., USA) liefert die Webseite aus. Dabei werden technisch notwendige Zugriffsdaten wie die IP-Adresse verarbeitet; siehe [GitHub Privacy Statement](https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement).
- **jsDelivr** liefert beim Screenshot-Import die Texterkennung Tesseract.js und die Sprachdaten (Deutsch, Englisch). Dabei wird deine IP-Adresse an jsDelivr übermittelt. Die Bilder selbst werden nur im Browser ausgewertet und nicht hochgeladen oder gespeichert.
- **Supabase** (Supabase Inc.) speichert bei Profilen für mehrere Geräte den verschlüsselten Datenblock; siehe [Supabase Privacy Policy](https://supabase.com/privacy).
- **Google Fonts** (Google LLC) liefert die Schriften Unbounded und Manrope. Beim Laden wird deine IP-Adresse an Google übermittelt. Wer das vermeiden will, kann die Schriften lokal einbinden.

Es gibt keine Analyse-Tools, keine Werbung und keine Cookies.

## Löschen

- **Profil → Konto löschen:** entfernt das Konto und alle Daten dieses Kontos auf dem Gerät und, falls vorhanden, im Online-Speicher.
- Das Löschen der Website-Daten im Browser entfernt alle Konten der App auf diesem Gerät.

## Deine Rechte

Der Betreiber kann keine Trainings- oder Gesundheitsdaten einsehen: lokal gespeicherte Daten erhält er nicht, online gespeicherte sind verschlüsselt. Löschen kannst du alles selbst über «Konto löschen». Auf Anfrage kann der Betreiber einen Benutzernamen samt verschlüsseltem Datenblock löschen.

Stand: Oktober 2026
