import type { Tabelle } from '../types';
import { Inline } from './ui';

export function TabelleAnsicht({ t }: { t: Tabelle }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-chip">
            {t.kopf.map((k) => (
              <th key={k} scope="col" className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.zeilen.map((z, i) => (
            <tr key={i} className="border-t border-line">
              {z.map((zelle, j) => (
                <td key={j} className="px-3 py-2 align-top">
                  <Inline text={zelle} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
