import type { Anlass } from './logik';

/**
 * Sprüche des Hoodies, je Anlass drei bis sieben. Platzhalter: {name}, {n} (Serie), {p} (Prozent).
 * Leetspeak nur in einzelnen Wörtern – jedes Leet-Wort braucht einen Eintrag in LEET_KLAR,
 * damit Screenreader das Klartextwort vorlesen (geprüft in server/test/companion.test.ts).
 */
export const SAETZE: Record<Anlass, string[]> = {
  start: ['hallo, {name}. system online.', 'w1llk0mm3n zurück, {name}. bereit?', 'verbindung steht. was lernen wir heute?', 'ping {name} … pong. l3ts g0.'],
  'start-nacht': ['{name}, es ist spät. schlaf ist auch ein patch.', 'nachtschicht? ok. aber nicht zu lange.', 'uptime ist wichtig. deine auch.'],
  'start-freitag': ['fr1day. berichtsheft schon g3l0ggt?', 'freitag. kurz die woche ins berichtsheft?', 'wochenende in sicht. vorher noch das berichtsheft?'],
  richtig: ['korrekt.', 'n1c3.', 'sauber. weiter.', 'access granted.', '+1 xp.'],
  serie: ['combo x{n}.', '{n} in folge. du bist on f1r3.', '{n} richtige. l33t.', 'streak {n}. nicht aufhören.'],
  falsch: ['nope. passiert.', 'kein ding. retry.', 'fehler gefunden. besser jetzt als in der prüfung.', 'access denied. diesmal.'],
  'falsch-serie': ['3 daneben. kurz ins cheatsheet schauen?', 'hmm. lies das thema nochmal, dann sitzt es.', 'debug-tipp: langsamer lesen, dann antworten.'],
  'runde-gut': ['{p} %. 0wn3d.', 'runde beendet: {p} %. stark.', '{p} %. die prüfung kann kommen.'],
  'runde-mittel': ['{p} %. solide, da geht noch was.', '{p} %. die falschen nochmal, dann sitzt es.', 'runde durch: {p} %. weiter so.'],
  'runde-schlecht': ['{p} %. kein drama. lücken gefunden ist gut.', '{p} %. erst cheatsheet, dann nochmal.', '{p} %. jeder hacker fängt bei 0 an.'],
  'sim-gut': ['simulation: {p} %. prüfungsreif.', '{p} %. system g3hackt.', '{p} %. r3sp3kt.'],
  'sim-knapp': ['{p} %. bestanden, aber knapp. die lücken schließen wir.', '{p} %. drüber. jetzt noch stabil machen.'],
  'sim-schlecht': ['{p} %. noch nicht. aber jetzt weißt du, wo.', '{p} %. kein fail, nur ein log. auswerten und nochmal.'],
  'ampel-gruen': ['grün. gesichert.', 'thema g3pwnt.', 'status: grün. n1c3.'],
  'ampel-gelb': ['gelb. ehrlich ist gut.', 'halb drin. bleib dran.'],
  'ampel-rot': ['rot ist kein urteil, nur ein todo.', 'ehrliche ampel. das hilft beim lernen.'],
  zusatz: ['bonuswissen geladen.', 'extra-modul installiert.', 'mehr als nötig. l33t.'],
  bericht: ['log geschrieben.', 'berichtsheft aktualisiert.', 'eintrag gespeichert. sauber dokumentiert.'],
  abgezeichnet: ['abgezeichnet. signed & verified.', 'unterschrift drauf. check.'],
  pause: ['45 min am stück. kurz pause?', 'augen weg vom monitor. 5 min.', 'pause ist cache leeren. dann weiter.'],
  klick: [
    'sudo mach mir einen kaffee.',
    'es gibt 10 arten von menschen: die binär verstehen und die anderen.',
    "there's no place like 127.0.0.1",
    'schon mal aus- und wieder eingeschaltet?',
    'mein passwort? ********',
    'dns. es ist immer dns.',
    'ich bin nur ein hoodie. aber ein motivierter.',
  ],
};

/** Klartext für Screenreader */
export const LEET_KLAR: Record<string, string> = {
  w1llk0mm3n: 'willkommen',
  l3ts: 'lets',
  g0: 'go',
  fr1day: 'friday',
  g3l0ggt: 'geloggt',
  n1c3: 'nice',
  f1r3: 'fire',
  l33t: 'leet',
  '0wn3d': 'owned',
  g3hackt: 'gehackt',
  r3sp3kt: 'respekt',
  g3pwnt: 'gepwnt',
};

export function klartext(s: string): string {
  return s.replace(/[\p{L}\d]+/gu, (w) => LEET_KLAR[w] ?? w);
}
