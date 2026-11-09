import { useState } from 'react';
import { ipZuZahl, zahlZuIp } from '../lib/rechner';
import { bits32, maskeAus } from '../lib/werkzeuge';
import { Kopf, Merke } from './teile';

/** Subnetting auf Bit-Ebene: Präfix-Schieberegler, Netz- und Hostteil farbig. */
export function SubnetzBits() {
  const [ip, setIp] = useState('192.168.10.77');
  const [praefix, setPraefix] = useState(26);
  const zahl = ipZuZahl(ip.trim());
  const maske = maskeAus(praefix);
  const netz = zahl === null ? 0 : (zahl & maske) >>> 0;
  const bc = (netz | (~maske >>> 0)) >>> 0;
  const hosts = praefix >= 31 ? (praefix === 31 ? 2 : 1) : 2 ** (32 - praefix) - 2;

  const zeilen: [string, number, string][] = [
    ['IP-Adresse', zahl ?? 0, ip],
    ['Subnetzmaske', maske, zahlZuIp(maske)],
    ['Netzadresse (IP UND Maske)', netz, zahlZuIp(netz)],
    ['Broadcast (Hostbits = 1)', bc, zahlZuIp(bc)],
  ];

  return (
    <div className="flex flex-col gap-5">
      <Kopf titel="Subnetting – Bits sehen" text="Schieb das Präfix und beobachte, wo die Grenze zwischen Netz- und Hostteil liegt." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">IP-Adresse</span>
          <input className="eingabe font-mono" value={ip} onChange={(e) => setIp(e.target.value)} aria-invalid={zahl === null} />
          {zahl === null && <span className="text-sm text-seg-rot-ink">Bitte eine gültige IPv4-Adresse eingeben.</span>}
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold">
            Präfix: <span className="font-mono">/{praefix}</span>
          </span>
          <input type="range" min={0} max={32} value={praefix} onChange={(e) => setPraefix(Number(e.target.value))} className="w-full accent-[var(--c-accent)]" />
        </label>
      </div>

      <div className="relative overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">Adressen bitweise, Netzteil hervorgehoben</caption>
          <tbody>
            {zeilen.map(([label, wert, text]) => (
              <tr key={label} className="border-t border-line first:border-t-0">
                <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                  {label}
                  <span className="block font-mono text-xs font-normal text-muted">{text}</span>
                </th>
                <td className="px-3 py-2">
                  <Bits wert={wert} praefix={praefix} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span>
          <span className="inline-block h-3 w-3 rounded-sm bg-accent align-middle" aria-hidden="true" /> Netzteil: {praefix} Bit
        </span>
        <span>
          <span className="inline-block h-3 w-3 rounded-sm border border-line bg-chip align-middle" aria-hidden="true" /> Hostteil: {32 - praefix} Bit
        </span>
        <span>
          Nutzbare Hosts: <strong>{praefix >= 31 ? hosts : `2^${32 - praefix} − 2 = ${hosts.toLocaleString('de-DE')}`}</strong>
        </span>
      </div>
      <Merke>
        Die Netzadresse entsteht durch ein bitweises UND von IP-Adresse und Maske – alle Hostbits werden 0. Beim Broadcast sind alle Hostbits 1. Liegt die
        Grenze mitten in einem Oktett, ist die Blockgröße dort 2 hoch Anzahl der Hostbits in diesem Oktett.
      </Merke>
    </div>
  );
}

function Bits({ wert, praefix }: { wert: number; praefix: number }) {
  const b = bits32(wert);
  return (
    <span className="flex gap-2 font-mono" aria-label={`${b.slice(0, praefix) || 'keine'} Netzbits, dann ${b.slice(praefix) || 'keine'} Hostbits`}>
      {[0, 1, 2, 3].map((o) => (
        <span key={o} className="flex" aria-hidden="true">
          {b
            .slice(o * 8, o * 8 + 8)
            .split('')
            .map((x, i) => {
              const pos = o * 8 + i;
              return (
                <span
                  key={i}
                  className={`flex h-7 w-[18px] items-center justify-center text-[13px] ${pos < praefix ? 'bg-accent font-semibold text-on-accent' : 'bg-chip text-ink'} ${
                    i === 0 ? 'rounded-l' : ''
                  } ${i === 7 ? 'rounded-r' : ''}`}
                >
                  {x}
                </span>
              );
            })}
        </span>
      ))}
    </span>
  );
}
