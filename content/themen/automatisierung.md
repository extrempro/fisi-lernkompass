---
titel: Automatisierung & Skripting
---

Wiederkehrende Admin-Aufgaben mit PowerShell und Bash automatisieren, Abläufe als Pseudocode planen und Skripte zeitgesteuert ausführen.

## PowerShell {#powershell}

### Kernbegriffe
- **Cmdlet:** Befehl im Schema Verb-Nomen, z. B. Get-Service oder New-ADUser.
- **Pipeline:** Gibt Objekte (nicht nur Text) an den nächsten Befehl weiter.
- **Variable:** Beginnt mit $, z. B. $name = "Max".
- **ExecutionPolicy:** Legt fest, ob und welche Skripte ausgeführt werden dürfen.
- **Skriptdatei:** Endung .ps1.

### Befehle
- `Get-Help Get-Service -Examples` – Hilfe mit Beispielen
- `Get-Command -Noun *User*` – passende Befehle finden
- `Get-Service | Where-Object Status -eq 'Running'` – laufende Dienste filtern
- `Get-ChildItem C:\Logs -Filter *.log | Remove-Item` – alle Logdateien im Ordner löschen
- `Import-Csv .\neu.csv | ForEach-Object { New-ADUser -Name $_.Name -SamAccountName $_.Login }` – Benutzer aus CSV (Comma-Separated Values) anlegen
- `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` – lokale Skripte erlauben

### Tabelle: Vergleichsoperatoren
| Operator | Bedeutung |
| --- | --- |
| -eq | gleich |
| -ne | ungleich |
| -gt / -lt | größer / kleiner |
| -ge / -le | größer gleich / kleiner gleich |
| -like | Muster mit * |
| -match | regulärer Ausdruck |

### Merksatz
PowerShell reicht Objekte weiter, Bash reicht Text weiter.

## Bash {#bash}

### Kernbegriffe
- **Shebang:** Erste Zeile #!/bin/bash legt fest, welcher Interpreter das Skript ausführt.
- **Variable:** NAME=wert ohne Leerzeichen um das =; Zugriff mit $NAME.
- **Parameter:** $1, $2 … sind Aufrufargumente, $# ihre Anzahl, $? der Rückgabewert des letzten Befehls (0 = Erfolg).
- **Umleitung:** > überschreibt eine Datei, >> hängt an, 2> leitet Fehlermeldungen um.
- **Befehlsersetzung:** $(befehl) setzt die Ausgabe eines Befehls ein.

### Befehle
- `chmod +x backup.sh` – Skript ausführbar machen
- `./backup.sh /etc` – Skript mit Argument starten
- `tar -czf backup-$(date +%F).tar.gz /etc` – Ordner mit Datum im Namen packen
- `grep -c "Failed password" /var/log/auth.log` – fehlgeschlagene Anmeldungen zählen
- `df -h | grep /dev/sda1` – Belegung einer Partition anzeigen

### Merksatz
Erst ausführbar machen (chmod +x), dann mit ./ starten.

### Prüfungsfrage
Was macht diese Zeile: [ -f /etc/passwd ] && echo "vorhanden" || echo "fehlt"?

1. [ -f … ] prüft, ob die Datei existiert und eine normale Datei ist.
2. && führt den nächsten Befehl nur bei Erfolg aus → Ausgabe „vorhanden“.
3. || greift nur bei Misserfolg → Ausgabe „fehlt“.

## Programmiersprachen und Paradigmen {#programmiersprachen}

### Kernbegriffe
- **Maschinensprache und Hochsprache:** Der Prozessor versteht nur Maschinencode. Hochsprachen wie Python oder C# sind für Menschen lesbar und werden übersetzt.
- **Compiler:** Übersetzt das ganze Programm vorab in Maschinencode. Ergebnis ist eine ausführbare Datei – schnell, aber nur für eine Plattform. Beispiele: C, C++, Go, Rust.
- **Interpreter:** Liest den Quellcode bei jeder Ausführung und führt ihn Schritt für Schritt aus – flexibel, ohne Übersetzen, aber langsamer. Beispiele: Python, PowerShell, Bash, JavaScript.
- **Bytecode:** Mischform: Java und C# werden in Zwischencode übersetzt, den eine Laufzeitumgebung (JVM, .NET) ausführt – dadurch auf vielen Plattformen lauffähig.
- **Prozedural (imperativ):** Das Programm ist eine Folge von Anweisungen und Funktionen, die Daten verändern. Beispiele: C, Bash, einfache Python- und PowerShell-Skripte.
- **Objektorientiert (OOP):** Daten und Funktionen werden in Objekten gebündelt. Eine Klasse ist der Bauplan, ein Objekt ein konkretes Exemplar davon. Beispiele: Java, C#, Python.
- **Funktional:** Programme bestehen aus Funktionen ohne Seiteneffekte; Daten werden nicht verändert, sondern neu erzeugt. Beispiele: Haskell, Teile von JavaScript und Python.
- **Deklarativ:** Man beschreibt, was man will, nicht wie. Beispiel: SQL („gib mir alle Kunden aus Hamburg“).
- **Kapselung:** Ein Objekt verbirgt seine inneren Daten und bietet nur festgelegte Methoden an.
- **Vererbung:** Eine Klasse übernimmt Eigenschaften und Methoden einer anderen, z. B. „Laserdrucker“ erbt von „Drucker“.
- **Polymorphie:** Gleicher Methodenaufruf, unterschiedliches Verhalten je nach Objekt – drucken() funktioniert beim Laser- wie beim Tintendrucker, aber intern anders.
- **Statische und dynamische Typisierung:** Statisch (Java, C#) prüft Datentypen beim Übersetzen und findet Fehler früh; dynamisch (Python, PowerShell) prüft erst zur Laufzeit und ist flexibler.

### Abbildung: Übersetzen und Objekte
![Compiler übersetzt einmal in eine ausführbare Datei, Interpreter führt Quellcode Zeile für Zeile aus](compiler-interpreter.svg)
![Klasse Drucker als Bauplan mit Attributen und Methoden, daraus zwei Objekte mit eigenen Werten](oop-klasse-objekt.svg)

### Tabelle: Datentypen
| Datentyp | Inhalt | Beispiel |
| --- | --- | --- |
| Integer | ganze Zahl | 42 |
| Float / Double | Kommazahl | 3.14 |
| Boolean | wahr oder falsch | true |
| String | Zeichenkette | "Server01" |
| Array / Liste | mehrere Werte in Reihenfolge | ["PC1", "PC2"] |
| Dictionary / Hashtable | Schlüssel-Wert-Paare | { name: "PC1", ram: 16 } |

### Tabelle: Sprachen und typischer Einsatz
| Sprache | Ausführung | Paradigma | Typischer Einsatz |
| --- | --- | --- | --- |
| PowerShell | interpretiert | prozedural, objektbasiert | Windows-Administration, Microsoft 365 |
| Bash | interpretiert | prozedural | Linux-Administration |
| Python | interpretiert | prozedural, objektorientiert | Automatisierung, Datenanalyse, KI |
| C# | Bytecode (.NET) | objektorientiert | Windows-Anwendungen, Webdienste |
| Java | Bytecode (JVM) | objektorientiert | Unternehmensanwendungen, Android |
| JavaScript | interpretiert (im Browser) | mehrere | Webseiten, Webanwendungen |
| C / C++ | kompiliert | prozedural / objektorientiert | Treiber, Betriebssysteme, Spiele |
| SQL (Structured Query Language) | deklarativ | deklarativ | Datenbankabfragen |

### Merksatz
Compiler übersetzt vorher, Interpreter während der Ausführung. Die Klasse ist der Bauplan, das Objekt das gebaute Haus.

### Prüfungsfrage
Erkläre den Unterschied zwischen Klasse und Objekt und nenne zwei Vorteile der objektorientierten Programmierung.

1. Eine Klasse beschreibt Attribute und Methoden, z. B. Klasse „Drucker“ mit Name, Standort und drucken().
2. Ein Objekt ist ein konkretes Exemplar mit eigenen Werten, z. B. „drucker1“ am Empfang.
3. Vorteil Wiederverwendung: Klassen lassen sich mehrfach nutzen und durch Vererbung erweitern.
4. Vorteil Wartbarkeit: Kapselung verbirgt Details, Änderungen betreffen nur die Klasse, nicht das ganze Programm.

## Pseudocode {#pseudocode}

### Kernbegriffe
- **Pseudocode:** Programmablauf in strukturierter Umgangssprache, unabhängig von einer Programmiersprache.
- **Struktogramm:** Grafische Darstellung nach Nassi-Shneiderman mit Blöcken für Sequenz, Verzweigung und Schleife.
- **Programmablaufplan (PAP):** Flussdiagramm nach DIN 66001 (Norm des Deutschen Instituts für Normung) mit Symbolen für Start, Aktion, Entscheidung.
- **Einrückung:** Zeigt, welche Anweisungen zu einer Verzweigung oder Schleife gehören.

### Abbildung: Struktogramm, PAP, Pseudocode und Code
![Dieselbe Aufgabe, die Summe der Zahlen 1 bis n, viermal dargestellt: als Struktogramm nach Nassi-Shneiderman mit einer Solange-Schleife, als Programmablaufplan nach DIN 66001 mit Start, Eingabe, Zuweisung, Entscheidung i ≤ n, Schleifenrücksprung, Ausgabe und Ende, als Pseudocode mit FÜR-Schleife und als PowerShell-Skript mit for-Schleife.](struktogramm-pap.svg)

### Tabelle: Schlüsselwörter
| Pseudocode | Bedeutung |
| --- | --- |
| WENN … DANN … SONST … ENDE WENN | Verzweigung |
| SOLANGE … TUE … ENDE SOLANGE | kopfgesteuerte Schleife |
| WIEDERHOLE … BIS … | fußgesteuerte Schleife |
| FÜR i VON 1 BIS n … ENDE FÜR | Zählschleife |
| FÜR JEDES x IN liste … | Schleife über eine Liste |
| AUSGABE / EINGABE | Ausgabe und Eingabe |

### Merksatz
Pseudocode muss nicht laufen, aber jeder muss ihn ohne Rückfrage verstehen.

### Prüfungsfrage
Schreibe Pseudocode: Für jeden Server soll geprüft werden, ob weniger als 10 % Speicher frei sind; dann wird eine Warnung ausgegeben.

1. FÜR JEDES server IN serverliste
2. frei ← freierSpeicher(server) ÷ gesamtSpeicher(server) · 100
3. WENN frei < 10 DANN AUSGABE "Warnung: " + server
4. ENDE WENN
5. ENDE FÜR

## Kontrollstrukturen {#kontrollstrukturen}

### Kernbegriffe
- **Sequenz:** Anweisungen laufen nacheinander ab.
- **Verzweigung:** Ablauf hängt von einer Bedingung ab (if/else, switch/case).
- **Kopfgesteuerte Schleife:** Prüft die Bedingung vor dem Durchlauf – kann null Mal laufen (while).
- **Fußgesteuerte Schleife:** Prüft nach dem Durchlauf – läuft mindestens einmal (do-while).
- **Zählschleife:** Läuft eine feste Anzahl von Durchläufen (for).

### Tabelle: Syntax im Vergleich
| Struktur | PowerShell | Bash |
| --- | --- | --- |
| Verzweigung | `if ($x -gt 5) { … } else { … }` | `if [ $x -gt 5 ]; then … else … fi` |
| Zählschleife | `for ($i = 1; $i -le 5; $i++) { … }` | `for i in {1..5}; do … done` |
| Liste | `foreach ($s in $liste) { … }` | `for s in $liste; do … done` |
| Kopfgesteuert | `while ($x -lt 10) { … }` | `while [ $x -lt 10 ]; do … done` |
| Fußgesteuert | `do { … } while ($x -lt 10)` | keine eigene Form |

### Merksatz
Kopfgesteuert: vielleicht nie. Fußgesteuert: mindestens einmal.

## Arrays und einfache Algorithmen {#arrays}

### Kernbegriffe
- **Array (Feld):** Speichert mehrere Werte desselben Datentyps unter einem Namen; jeder Wert wird über seinen Index angesprochen.
- **Index:** Position im Array, beginnt in fast allen Sprachen bei 0 – ein Array mit 24 Werten hat die Indizes 0 bis 23.
- **Länge:** Anzahl der Elemente, z. B. werte.Length in C#, $werte.Count in PowerShell, ${#werte[@]} in Bash; der letzte Index ist Länge − 1.
- **Deklaration und Initialisierung:** int[] werte = new int[24]; legt 24 Plätze an, int[] werte = {17, 20, 18}; legt das Array gleich mit Werten an.
- **Schleife über ein Array:** Mit for (Zählschleife über den Index) oder foreach (jedes Element nacheinander) – die häufigste Aufgabe in Prüfungen.
- **Summe und Mittelwert:** Summe in einer Variablen aufaddieren, danach durch die Anzahl teilen.
- **Ganzzahldivision:** Teilt man zwei int-Werte, schneidet C# die Nachkommastellen ab (7 / 2 = 3). Für einen genauen Mittelwert vorher in double umwandeln: (double)summe / anzahl.
- **Maximum und Minimum:** Mit dem ersten Element starten und jedes weitere vergleichen; ist es größer bzw. kleiner, merken.
- **Zählen mit Bedingung:** Zähler auf 0 setzen und in der Schleife erhöhen, wenn die Bedingung zutrifft, z. B. alle Werte über 80.
- **Mehrdimensionales Array:** Tabelle mit Zeilen und Spalten, z. B. int[,] messung = new int[7, 24]; für 7 Tage mit je 24 Stunden.
- **Index außerhalb des Bereichs:** Zugriff auf werte[24] bei 24 Elementen löst einen Fehler aus (IndexOutOfRangeException) – typischer Fehler bei <= statt < in der Schleife.

### Tabelle: Mittelwert berechnen und warnen (C#-ähnlich)
| Zeile | Code | Bedeutung |
| --- | --- | --- |
| 1 | int[] cpuLast = {35, 42, 88, 91, 77, 64, 95}; | Messwerte in Prozent |
| 2 | int summe = 0; | Summe vorbereiten |
| 3 | for (int i = 0; i < cpuLast.Length; i++) | Schleifenkopf: Index 0 bis Länge − 1 |
| 4 | { summe = summe + cpuLast[i]; } | Schleifenrumpf: jeden Wert addieren |
| 5 | double mittel = (double)summe / cpuLast.Length; | Mittelwert ohne Ganzzahldivision: 492 / 7 ≈ 70,3 |
| 6 | if (mittel > 70) | Grenzwert prüfen |
| 7 | { MessageBox.Show("Hohe CPU-Last", "Warnung"); } | Meldung mit Text und Titel ausgeben |

### Tabelle: Typische Algorithmen in Pseudocode
| Aufgabe | Kern des Algorithmus |
| --- | --- |
| Summe | summe ← 0; FÜR JEDES w IN werte: summe ← summe + w |
| Mittelwert | summe ÷ Anzahl der Werte |
| Maximum | max ← werte[0]; FÜR JEDES w: WENN w > max DANN max ← w |
| Zählen | zaehler ← 0; FÜR JEDES w: WENN w > grenze DANN zaehler ← zaehler + 1 |
| Suchen | FÜR i VON 0 BIS Länge − 1: WENN werte[i] = gesucht DANN Position i ausgeben |

### Befehle
- `$werte = 17, 20, 18; ($werte | Measure-Object -Average).Average` – Mittelwert in PowerShell
- `$werte | Measure-Object -Maximum -Minimum -Sum` – Maximum, Minimum und Summe (PowerShell)
- `werte=(17 20 18); echo ${werte[0]} ${#werte[@]}` – erstes Element und Anzahl in Bash

### Merksatz
Der Index beginnt bei 0 und endet bei Länge − 1 – also i < Länge, nicht i <= Länge. Erst summieren, dann teilen, und dabei an die Ganzzahldivision denken.

### Prüfungsfrage
Ein Array freiGB enthält für 24 Stunden die freie Festplattenkapazität eines Servers in GB. Beschreibe, wie ein Programm zählt, in wie vielen Stunden weniger als 50 GB frei waren, und den kleinsten Wert ermittelt.

1. Zähler anzahl = 0 und min = freiGB[0] festlegen.
2. Schleife for (int i = 0; i < freiGB.Length; i++) über alle 24 Werte.
3. Im Schleifenrumpf: wenn freiGB[i] < 50, dann anzahl = anzahl + 1.
4. Ebenfalls im Rumpf: wenn freiGB[i] < min, dann min = freiGB[i].
5. Nach der Schleife anzahl und min ausgeben, z. B. per Console.WriteLine oder in einer Meldung.

## Skripte planen, testen und sicher ausführen {#skript-vorgehen}

### Kernbegriffe
- **Anforderung aufschreiben:** Bevor du tippst, schreibst du in zwei, drei Sätzen auf: Was soll das Skript tun? Womit startet es (Eingaben)? Was kommt heraus (Ausgabe, Protokoll)? Was darf auf keinen Fall passieren? Welche Sonderfälle gibt es (leere Liste, Datei fehlt, keine Rechte)?
- **Planen:** Den Ablauf als Pseudocode oder Programmablaufplan skizzieren. Fehler im Plan kosten Minuten, Fehler im laufenden Skript Stunden.
- **Probelauf (Dry Run):** Das Skript zeigt nur an, was es tun würde, ohne etwas zu verändern. In PowerShell mit `-WhatIf`, bei robocopy mit `/L`, bei rsync mit `--dry-run`.
- **-WhatIf und -Confirm:** Fast alle verändernden Cmdlets (Remove-, Set-, Disable-, Stop-) kennen beide Schalter: -WhatIf zeigt nur an, -Confirm fragt vor jeder Aktion nach. Eigene Skripte bekommen das mit `[CmdletBinding(SupportsShouldProcess)]`.
- **Testumgebung:** Erst auf einem Testsystem oder mit einer kleinen Testgruppe ausprobieren (z. B. eine Test-OU im Active Directory; OU = Organizational Unit, Organisationseinheit), dann auf alle anwenden.
- **Parameter statt fester Werte:** Pfade, Namen und Grenzwerte als Parameter übergeben, nicht im Code verstecken. So lässt sich dasselbe Skript für Test und Echtbetrieb nutzen.
- **Fehlerbehandlung:** Fehler bewusst abfangen statt ignorieren. PowerShell: `try/catch` mit `-ErrorAction Stop`. Bash: `set -euo pipefail` bricht beim ersten Fehler ab.
- **Protokollierung:** Jede Änderung mit Zeitstempel festhalten, z. B. mit `Start-Transcript` oder in eine eigene Logdatei. Wer später fragt „Was hat das Skript gemacht?“, braucht eine Antwort.
- **Keine Passwörter im Skript:** Zugangsdaten nie im Klartext speichern – stattdessen `Get-Credential`, einen Passwort-Tresor oder ein Dienstkonto mit minimalen Rechten verwenden.
- **Idempotenz:** Das Skript lässt sich gefahrlos mehrfach ausführen, ohne doppelten Schaden: Es prüft erst, ob ein Benutzer schon existiert, bevor es ihn anlegt.
- **Versionierung und Dokumentation:** Skripte in Git ablegen, oben einen Kommentarblock mit Zweck, Autor, Datum und Beispiel. PowerShell liest diesen Block als Hilfe (`Get-Help .\skript.ps1`).

### Abbildung: Vom Auftrag zum fertigen Skript
![Sechs Schritte: aufschreiben, planen, schreiben, Probelauf, ausführen, ablegen – mit Rücksprung vom Probelauf zum Schreiben](skript-ablauf.svg)

### Tabelle: Probelauf je Werkzeug
| Werkzeug | Probelauf | Hinweis |
| --- | --- | --- |
| PowerShell-Cmdlets | `-WhatIf` | `-Confirm` fragt vor jeder einzelnen Aktion |
| Eigene PowerShell-Skripte | `-WhatIf` über `SupportsShouldProcess` | im Code `$PSCmdlet.ShouldProcess()` abfragen |
| robocopy | `/L` | nur auflisten – wichtig vor `/MIR`, das im Ziel löscht |
| rsync | `--dry-run` bzw. `-n` | besonders vor `--delete` |
| Bash allgemein | gefährlichen Befehl erst mit `echo` davor ausgeben | `bash -n skript.sh` prüft nur die Syntax |
| Active Directory | erst mit `Get-ADUser` ausgeben und zählen, dann ändern | Ergebnis vorher als CSV (Comma-Separated Values) sichern |

### Tabelle: Das solltest du vermeiden
| Vermeiden | Besser |
| --- | --- |
| direkt im Echtbetrieb ausprobieren | Testsystem, Testgruppe, -WhatIf |
| Passwörter im Klartext im Skript | Get-Credential, Tresor, Dienstkonto |
| feste Pfade und Namen im Code | Parameter mit sinnvollen Standardwerten |
| Fehler stillschweigend ignorieren (`-ErrorAction SilentlyContinue` überall) | gezielt abfangen, protokollieren, sauber abbrechen |
| Aliase wie `ls`, `%`, `?` in Skripten | vollständige Cmdlet-Namen – lesbar für andere |
| Skripte aus dem Internet ungeprüft ausführen | Code lesen, verstehen, erst im Test laufen lassen |
| mit Admin-Rechten testen, obwohl sie nicht nötig sind | nur die Rechte nutzen, die das Skript braucht |

### Befehle
- `Remove-Item C:\Temp\*.log -WhatIf` – zeigt, welche Dateien gelöscht würden, ohne zu löschen
- `Get-ADUser -Filter 'Enabled -eq $true' -SearchBase 'OU=Test,DC=ad,DC=firma,DC=de' | Disable-ADAccount -WhatIf` – erst an der Test-OU und nur als Probelauf
- `robocopy D:\Daten E:\Backup /MIR /L` – Spiegelung nur auflisten (Windows)
- `rsync -av --delete --dry-run /daten/ /backup/` – Synchronisation nur simulieren (Linux)
- `Invoke-ScriptAnalyzer -Path .\skript.ps1` – PowerShell-Skript auf typische Fehler prüfen (Modul PSScriptAnalyzer)
- `shellcheck skript.sh` – Bash-Skript auf Fehler prüfen (Linux)

### Merksatz
Erst aufschreiben, dann planen, dann schreiben – und alles, was löscht oder ändert, zuerst mit -WhatIf an einer Testgruppe.

### Prüfungsfrage
Du sollst ein Skript schreiben, das alle Benutzerkonten deaktiviert, die sich seit 90 Tagen nicht angemeldet haben. Wie gehst du vor?

1. Anforderung klären und aufschreiben: Welche OU? Ausnahmen (Dienstkonten, Admin-Konten, Elternzeit)? Was passiert mit den Konten danach? Wer muss informiert werden?
2. Ablauf als Pseudocode planen: Konten suchen → Ausnahmen herausfiltern → Liste speichern → deaktivieren → protokollieren.
3. Skript mit Parametern schreiben (OU, Anzahl Tage), mit Fehlerbehandlung und Protokoll.
4. Probelauf: erst nur die gefundenen Konten als CSV ausgeben und prüfen lassen, dann mit -WhatIf an einer Test-OU.
5. Ausführen, Protokoll und Ergebnis kontrollieren; Skript in Git ablegen und dokumentieren.

## Cronjobs/Aufgabenplanung {#zeitsteuerung}

### Kernbegriffe
- **cron:** Linux-Dienst, der Befehle zeitgesteuert ausführt; Einträge stehen in der crontab.
- **crontab-Zeile:** Fünf Zeitfelder, dann der Befehl.
- **systemd-Timer:** Moderne Alternative zu cron unter Linux.
- **Aufgabenplanung:** Windows-Werkzeug für zeitgesteuerte Aufgaben (taskschd.msc).

### Tabelle: Felder einer crontab-Zeile
| Feld | Bereich | Beispiel |
| --- | --- | --- |
| Minute | 0–59 | 30 |
| Stunde | 0–23 | 6 |
| Tag des Monats | 1–31 | * |
| Monat | 1–12 | * |
| Wochentag | 0–7 (0 und 7 = Sonntag) | 1-5 |

### Befehle
- `crontab -e` – eigene crontab bearbeiten
- `crontab -l` – eigene Einträge anzeigen
- `0 2 * * * /usr/local/bin/backup.sh` – täglich um 2:00 Uhr
- `*/15 * * * * /usr/local/bin/check.sh` – alle 15 Minuten
- `schtasks /query /fo table` – geplante Aufgaben anzeigen (Windows)

### Merksatz
Minute, Stunde, Tag, Monat – von klein nach groß, der Wochentag kommt zum Schluss.

### Prüfungsfrage
Wann läuft 30 6 * * 1-5 /opt/report.sh?

1. Minute 30, Stunde 6 → um 6:30 Uhr.
2. Tag und Monat * → jeden Tag, jeden Monat.
3. Wochentag 1-5 → Montag bis Freitag.

## Häufige Fehler
- In der Schleife i <= Länge statt i < Länge schreiben – der letzte Zugriff geht über das Array hinaus.
- Den Mittelwert mit zwei Ganzzahlen berechnen und sich über das abgeschnittene Ergebnis wundern.
- In Bash Leerzeichen um das = bei Variablen setzen.
- Skript ohne Ausführungsrecht oder ohne ./ starten.
- In PowerShell -eq mit = verwechseln (= weist zu, -eq vergleicht).
- Kopf- und fußgesteuerte Schleife verwechseln.
- Cronjobs ohne vollständige Pfade schreiben – cron kennt die eigene PATH-Variable nicht.
- Skripte, die löschen oder ändern, ohne Probelauf (-WhatIf, /L, --dry-run) direkt im Echtbetrieb starten.
- Bei robocopy /MIR Quelle und Ziel vertauschen – dann wird der alte Stand auf die Quelle gespiegelt und neuere Dateien dort gelöscht.

## Links
- [Microsoft Learn – PowerShell](https://learn.microsoft.com/de-de/powershell/) – Einstieg und Befehlsreferenz
- [ubuntuusers Wiki](https://wiki.ubuntuusers.de) – Bash und cron auf Deutsch

## Zusatz: Effizient scripten – Werkzeuge und Kniffe {#scripting-werkzeuge}
typ: text
zu: powershell, bash, skript-vorgehen

Mit dem richtigen Editor, Autovervollständigung und ein paar Tastenkürzeln schreibst du Skripte schneller und mit weniger Fehlern.

Die meisten Fehler in Skripten sind Tippfehler, falsche Parameternamen oder vergessene Anführungszeichen. Gute Werkzeuge finden genau diese Fehler, bevor das Skript überhaupt läuft.

### Der richtige Editor
| Editor | Stärken | Einsatz |
| --- | --- | --- |
| Visual Studio Code | kostenlos, für Windows, Linux und macOS; Erweiterungen für PowerShell, Python und Bash; IntelliSense, Debugger, Git eingebaut | Standard für Skripte aller Art |
| PowerShell ISE | auf älteren Windows-Systemen vorhanden | nur noch für Windows PowerShell 5.1; wird nicht weiterentwickelt |
| Notepad++ | schnell, Syntaxhervorhebung | kleine Änderungen, Logdateien ansehen |
| nano / vim | direkt auf jedem Linux-Server | Änderungen per SSH (Secure Shell); vim lohnt sich für Vielnutzer |

- In VS Code die Erweiterungen „PowerShell“ (Microsoft), „Python“ und „ShellCheck“ installieren – sie markieren Fehler schon beim Tippen.
- Mit F8 führt VS Code nur die markierten Zeilen aus: ideal, um ein Skript Stück für Stück zu testen.
- Haltepunkte (F9) und Debugger (F5) zeigen, welchen Inhalt Variablen gerade haben.

### Autovervollständigung in der Konsole
Niemand muss lange Cmdlet- oder Pfadnamen tippen. Tab vervollständigt Befehle, Parameter, Pfade und oft sogar Werte.

| Aktion | PowerShell | Bash |
| --- | --- | --- |
| Vervollständigen | Tab (mehrfach: nächster Vorschlag) | Tab, zweimal Tab zeigt alle Möglichkeiten |
| Alle Vorschläge als Menü | Strg + Leertaste | zweimal Tab |
| Befehlsverlauf durchsuchen | Strg + R | Strg + R |
| Vorschläge aus dem Verlauf | PSReadLine-Vorhersage, F2 schaltet auf Listenansicht | – |
| Letzten Befehl wiederholen | Pfeil nach oben | Pfeil nach oben oder `!!` |
| Letztes Argument wieder einsetzen | – | Alt + . |
| Zeile löschen | Esc | Strg + U |

- Vorhersagen in PowerShell einschalten: `Set-PSReadLineOption -PredictionSource History -PredictionViewStyle ListView`.
- Unter Linux ergänzt das Paket bash-completion die Vervollständigung für viele Programme, z. B. Optionen von systemctl oder apt.

### Hilfe finden statt suchen
- **PowerShell:** `Get-Command *dns*` findet Befehle, `Get-Help Befehl -Examples` zeigt Beispiele, `Get-Member` zeigt, welche Eigenschaften ein Objekt hat. Einmalig `Update-Help` als Admin ausführen.
- **Show-Command:** Öffnet für ein Cmdlet ein Formular mit allen Parametern – praktisch, um den Befehl zusammenzuklicken und dann zu kopieren.
- **Linux:** `man befehl` oder `befehl --help`; `apropos stichwort` sucht passende Befehle; `tldr befehl` zeigt kurze Praxisbeispiele.

### Wiederverwendbar arbeiten
- **Funktionen und Module:** Was du zweimal brauchst, wird eine Funktion; was mehrere Skripte brauchen, ein Modul.
- **Profil:** Eigene Funktionen und Einstellungen laden automatisch beim Start – PowerShell: Datei aus `$PROFILE`, Bash: `~/.bashrc`.
- **Snippets:** Vorlagen im Editor, z. B. für einen Skriptkopf mit Hilfeblock, Parametern und try/catch.
- **Splatting:** Viele Parameter übersichtlich als Hashtable übergeben: `$p = @{ Path = 'C:\Logs'; Filter = '*.log' }; Get-ChildItem @p`.
- **Aliase nur interaktiv:** In der Konsole spart `ls` Zeit, in Skripten gehört der volle Name `Get-ChildItem` hin.

### Qualität automatisch prüfen
- **PSScriptAnalyzer** (PowerShell) und **ShellCheck** (Bash) finden typische Fehler und unsichere Muster; beide laufen auch im Editor mit.
- **Strenger Modus:** PowerShell `Set-StrictMode -Version Latest` meldet z. B. Tippfehler in Variablennamen; Bash `set -u` meldet unbekannte Variablen.
- **Tests:** Mit Pester lassen sich PowerShell-Funktionen automatisch testen.
- **Git:** Jede Änderung als Commit mit kurzer Beschreibung – so lässt sich jede Version wiederherstellen und nachvollziehen.

### KI-Assistenten sinnvoll nutzen
- Gut für Gerüste, Erklärungen und Fehlermeldungen – aber jede Zeile lesen und verstehen, bevor sie läuft.
- Erzeugte Befehle erst mit -WhatIf oder im Testsystem ausführen; KI erfindet manchmal Parameter, die es nicht gibt.
- Keine Passwörter, Kundendaten oder internen Servernamen in den Chat kopieren.

### Checkliste: Ist mein Skript fertig?
- Kommentarblock mit Zweck, Parametern und Beispiel vorhanden
- Keine Passwörter oder festen Pfade im Code
- Fehler werden abgefangen und protokolliert, Exit-Code stimmt
- Probelauf mit -WhatIf oder Testsystem erfolgreich
- PSScriptAnalyzer bzw. ShellCheck ohne Warnungen
- In Git abgelegt und für Kollegen verständlich
