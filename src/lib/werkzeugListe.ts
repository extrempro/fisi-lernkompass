/** Die interaktiven Werkzeuge (Üben → Werkzeuge) und zu welchen Unterthemen sie passen. */
export const WERKZEUGE = [
  { id: 'subnetz', titel: 'Subnetting-Bits', zu: ['netzwerkgrundlagen.subnetting', 'netzwerkgrundlagen.ipv4-ipv6'] },
  { id: 'raid', titel: 'RAID-Ausfall', zu: ['server.raid'] },
  { id: 'backup', titel: 'Backup-Planer', zu: ['server.backup'] },
  { id: 'firewall', titel: 'Firewall-Regeln', zu: ['sicherheit.firewall'] },
  { id: 'netzplan', titel: 'Netzplan', zu: ['projekt.gantt-netzplan'] },
  { id: 'join', titel: 'SQL-JOINs', zu: ['datenbanken.sql', 'datenbanken.relationales-modell'] },
  { id: 'rechte', titel: 'Linux-Rechte', zu: ['betriebssysteme.benutzer-rechte', 'betriebssysteme.linux-grundlagen'] },
  { id: 'cron', titel: 'Cron', zu: ['automatisierung.zeitsteuerung'] },
  { id: 'nutzwert', titel: 'Nutzwertanalyse', zu: ['projekt.nutzwertanalyse', 'projekt.angebotsvergleich'] },
] as const;

export type WerkzeugId = (typeof WERKZEUGE)[number]['id'];

/** Werkzeuge, die zu einem Unterthema („feld.unterthema“) passen. */
export function werkzeugeFuer(feld: string, unterthema: string) {
  const key = `${feld}.${unterthema}`;
  return WERKZEUGE.filter((w) => (w.zu as readonly string[]).includes(key));
}
