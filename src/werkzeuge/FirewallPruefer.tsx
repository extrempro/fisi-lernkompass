import { useState } from 'react';
import { ArrowDown, ArrowUp, Check, Minus, X } from 'lucide-react';
import { firewallPruefen, type FwPaket, type FwRegel } from '../lib/werkzeuge';
import { Ergebnis, Kopf, Merke } from './teile';

const START: FwRegel[] = [
  { name: 'Webserver in der DMZ', aktion: 'erlauben', proto: 'tcp', quelle: 'any', ziel: '172.16.0.10/32', port: '80,443' },
  { name: 'Admins per SSH in die DMZ', aktion: 'erlauben', proto: 'tcp', quelle: '192.168.1.0/24', ziel: '172.16.0.0/24', port: '22' },
  { name: 'DNS für das LAN', aktion: 'erlauben', proto: 'udp', quelle: '192.168.1.0/24', ziel: '192.168.1.2/32', port: '53' },
  { name: 'SSH von überall sperren', aktion: 'verwerfen', proto: 'tcp', quelle: 'any', ziel: 'any', port: '22' },
  { name: 'LAN darf ins Internet (Web)', aktion: 'erlauben', proto: 'tcp', quelle: '192.168.1.0/24', ziel: 'any', port: '80,443' },
];

const PAKETE: [string, FwPaket][] = [
  ['Kunde ruft Webshop auf', { proto: 'tcp', quelle: '198.51.100.7', ziel: '172.16.0.10', port: '443' }],
  ['Admin per SSH auf Webserver', { proto: 'tcp', quelle: '192.168.1.20', ziel: '172.16.0.10', port: '22' }],
  ['Angreifer per SSH', { proto: 'tcp', quelle: '203.0.113.66', ziel: '172.16.0.10', port: '22' }],
  ['Client fragt DNS', { proto: 'udp', quelle: '192.168.1.50', ziel: '192.168.1.2', port: '53' }],
  ['Client per RDP auf Server', { proto: 'tcp', quelle: '192.168.1.50', ziel: '172.16.0.10', port: '3389' }],
];

/** Firewall-Regelprüfer: Regeln von oben nach unten, die erste passende entscheidet. */
export function FirewallPruefer() {
  const [regeln, setRegeln] = useState(START);
  const [paket, setPaket] = useState<FwPaket>(PAKETE[0][1]);
  const p = firewallPruefen(regeln, paket);

  const tausche = (i: number, j: number) =>
    setRegeln((r) => {
      if (j < 0 || j >= r.length) return r;
      const neu = [...r];
      [neu[i], neu[j]] = [neu[j], neu[i]];
      return neu;
    });
  const setze = <K extends keyof FwPaket>(k: K, v: FwPaket[K]) => setPaket((x) => ({ ...x, [k]: v }));

  return (
    <div className="flex flex-col gap-5">
      <Kopf titel="Firewall – Regeln prüfen" text="Wähl ein Paket oder trag eins ein. Verschieb Regeln, um zu sehen, wie die Reihenfolge das Ergebnis ändert." />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold">Beispielpakete</span>
        <div className="flex flex-wrap gap-2">
          {PAKETE.map(([t, x]) => (
            <button key={t} type="button" className="btn-sekundaer" onClick={() => setPaket(x)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <legend className="sr-only">Paket</legend>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Protokoll</span>
          <select className="eingabe" value={paket.proto} onChange={(e) => setze('proto', e.target.value as FwPaket['proto'])}>
            <option value="tcp">TCP</option>
            <option value="udp">UDP</option>
            <option value="icmp">ICMP</option>
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Quell-IP</span>
          <input className="eingabe font-mono" value={paket.quelle} onChange={(e) => setze('quelle', e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Ziel-IP</span>
          <input className="eingabe font-mono" value={paket.ziel} onChange={(e) => setze('ziel', e.target.value)} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Zielport</span>
          <input className="eingabe font-mono" value={paket.proto === 'icmp' ? '' : paket.port} disabled={paket.proto === 'icmp'} onChange={(e) => setze('port', e.target.value)} />
        </label>
      </fieldset>

      <div className="relative overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="px-3 pt-2 text-left text-xs font-semibold uppercase tracking-wide text-muted">Regelwerk – geprüft von oben nach unten</caption>
          <thead>
            <tr className="text-left">
              <th scope="col" className="px-3 py-2">
                Nr.
              </th>
              <th scope="col" className="px-3 py-2">
                Aktion
              </th>
              <th scope="col" className="px-3 py-2">
                Proto
              </th>
              <th scope="col" className="px-3 py-2">
                Quelle
              </th>
              <th scope="col" className="px-3 py-2">
                Ziel
              </th>
              <th scope="col" className="px-3 py-2">
                Port
              </th>
              <th scope="col" className="px-3 py-2">
                <span className="sr-only">Reihenfolge</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {regeln.map((r, i) => {
              const e = p.regeln[i];
              const treffer = p.treffer === i;
              return (
                <tr key={r.name} className={`border-t border-line ${treffer ? (r.aktion === 'erlauben' ? 'bg-seg-gruen' : 'bg-seg-rot') : e ? '' : 'opacity-50'}`}>
                  <td className="px-3 py-2">
                    <span className="font-semibold">{i + 1}</span>
                    <span className="block text-xs text-muted">{r.name}</span>
                    {treffer && <span className="block text-xs font-semibold">trifft zu – Entscheidung</span>}
                    {!e && <span className="block text-xs">nicht mehr geprüft</span>}
                  </td>
                  <td className={`px-3 py-2 font-semibold ${r.aktion === 'erlauben' ? 'text-seg-gruen-ink' : 'text-seg-rot-ink'}`}>{r.aktion === 'erlauben' ? 'ALLOW' : 'DROP'}</td>
                  <Zelle text={r.proto.toUpperCase().replace('ALLE', 'alle')} ok={e?.proto} />
                  <Zelle text={r.quelle} ok={e?.quelle} />
                  <Zelle text={r.ziel} ok={e?.ziel} />
                  <Zelle text={r.port} ok={e?.port} />
                  <td className="px-2 py-2">
                    <div className="flex gap-1">
                      <button type="button" className="rounded-md p-1.5 hover:bg-chip disabled:opacity-30" disabled={i === 0} onClick={() => tausche(i, i - 1)} aria-label={`Regel ${i + 1} nach oben`}>
                        <ArrowUp size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-1.5 hover:bg-chip disabled:opacity-30"
                        disabled={i === regeln.length - 1}
                        onClick={() => tausche(i, i + 1)}
                        aria-label={`Regel ${i + 1} nach unten`}
                      >
                        <ArrowDown size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            <tr className={`border-t border-line ${p.treffer === null && !p.fehler ? 'bg-seg-rot' : ''}`}>
              <td className="px-3 py-2" colSpan={7}>
                <span className="font-semibold">Standardregel (Default Deny):</span> alles andere verwerfen
                {p.treffer === null && !p.fehler && <span className="ml-2 text-xs font-semibold">greift</span>}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {p.fehler ? (
        <Ergebnis ton="warn" titel="Eingabe prüfen">
          <p>{p.fehler}</p>
        </Ergebnis>
      ) : (
        <Ergebnis ton={p.aktion === 'erlauben' ? 'gut' : 'schlecht'} titel={p.aktion === 'erlauben' ? 'Paket wird durchgelassen' : 'Paket wird verworfen'}>
          <p>{p.treffer === null ? 'Keine Regel passt – die Standardregel verwirft das Paket.' : `Regel ${p.treffer + 1} „${regeln[p.treffer].name}“ passt als erste. Alle Regeln darunter spielen keine Rolle mehr.`}</p>
        </Ergebnis>
      )}
      <Merke>
        First Match: spezielle Regeln nach oben, allgemeine nach unten, am Ende alles verbieten. Probier es aus: Schieb „SSH von überall sperren“ ganz nach oben – dann
        kommen auch die Admins nicht mehr per SSH auf den Server. Antworten auf erlaubte Verbindungen lässt eine Stateful Firewall über ihre Statustabelle automatisch durch.
      </Merke>
    </div>
  );
}

function Zelle({ text, ok }: { text: string; ok: boolean | undefined }) {
  return (
    <td className="px-3 py-2 font-mono">
      <span className="inline-flex items-center gap-1.5">
        {ok === undefined ? (
          <Minus size={14} className="text-muted" aria-hidden="true" />
        ) : ok ? (
          <Check size={14} className="text-seg-gruen-ink" aria-hidden="true" />
        ) : (
          <X size={14} className="text-seg-rot-ink" aria-hidden="true" />
        )}
        {text}
        {ok !== undefined && <span className="sr-only">{ok ? '(passt)' : '(passt nicht)'}</span>}
      </span>
    </td>
  );
}
