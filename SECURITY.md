# Sicherheit

## Wichtig: Die App hat kein Login

Der FISI-Lernkompass ist für **eine Person auf dem eigenen Rechner oder im eigenen Netz** gebaut. Es gibt keine Anmeldung und keine Benutzerverwaltung: Wer die Adresse erreicht, kann Lernstand, Berichtsheft und Unterschriften lesen, ändern, exportieren und löschen.

Deshalb:

- **Nie ungeschützt ins Internet stellen** – keine Portfreigabe im Router, kein offener Reverse Proxy.
- Standard ist `127.0.0.1:3000` (nur der eigene Rechner). Eigene Ports oder Freigaben nur über eine lokale `docker-compose.override.yml` (Vorlage `docker-compose.override.example.yml`).
- Zugriff von unterwegs nur über ein VPN (z. B. NetBird, Tailscale, WireGuard). Wer trotzdem einen Reverse Proxy davor setzt, braucht dort eine eigene Anmeldung (z. B. `basic_auth`).
- Der Ordner `data/` (Datenbank, Sicherungen) gehört nie in Git oder in ein Container-Image.

## Sicherheitslücke melden

Bitte **kein öffentliches Issue** anlegen, sondern über GitHub privat melden: im Repository unter **Security → Report a vulnerability**. Beschreibe, was passiert und wie es sich nachstellen lässt.
