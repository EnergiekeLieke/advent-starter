'use client';

import { useState } from 'react';
import type { AdventConfig, AdventDag } from '@/lib/config';
import { INPUT, KNOP, KNOP_PRIMAIR, Veld, type Bericht } from '@/components/beheer/velden';

type Knop = AdventDag['knop'];

interface Props {
  config: AdventConfig;
  dagen: (AdventDag & { dag: number })[];
  zetInstelling: (deel: Partial<AdventConfig['knoppen']>) => void;
  wijzigKnoppen: (wijzigingen: { i: number; knop: Partial<Knop> }[]) => void;
}

const isHttps = (url: string) => /^https:\/\//i.test(url);

// Per deurtje: wat staat er mis met de link? (null = alles goed)
function linkFout(knop: Knop): string | null {
  if (knop.aan && !knop.url) return 'Vul de link in of zet de knop uit.';
  if (knop.url && !isHttps(knop.url)) return 'Begin de link met https://';
  return null;
}

export default function KnoppenTab({ config, dagen, zetInstelling, wijzigKnoppen }: Props) {
  const [geplakt, setGeplakt] = useState('');
  const [melding, setMelding] = useState<Bericht>(null);
  const aantal = dagen.length;
  const aantalKnoppen = dagen.filter((d) => d.knop.aan && d.knop.url).length;

  function verdeel() {
    const regels = geplakt.split(/\r?\n/).map((r) => r.trim());
    while (regels.length > 0 && regels[regels.length - 1] === '') regels.pop();
    if (regels.length === 0) {
      setMelding({ soort: 'fout', regels: ['Plak eerst je links in het vak.'] });
      return;
    }
    const gebruikt = regels.slice(0, aantal);
    const fouten = gebruikt.flatMap((r, i) => (r && !isHttps(r) ? [`Regel ${i + 1}: begin de link met https://`] : []));
    if (fouten.length > 0) {
      setMelding({ soort: 'fout', regels: [...fouten, 'Er is niets aangepast. Verbeter de regels en probeer het opnieuw.'] });
      return;
    }
    // Een lege regel zet de knop uit, een eventueel eerder ingevulde link blijft bewaard
    wijzigKnoppen(gebruikt.map((r, i) => (r ? { i, knop: { aan: true, url: r } } : { i, knop: { aan: false } })));
    const regelsOk = [`${gebruikt.filter(Boolean).length} links verdeeld over de deurtjes.`];
    if (regels.length > aantal) regelsOk.push(`Je plakte ${regels.length} regels, maar de kalender heeft ${aantal} deurtjes. De rest is genegeerd.`);
    setMelding({ soort: 'ok', regels: regelsOk });
    setGeplakt('');
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Dit tabblad is optioneel. Hier koppel je een deurtje aan een les in je Kennis Shop of aan een andere pagina. Kopieer de link uit de adresbalk
        van je browser, bijvoorbeeld <code className="font-mono text-xs">https://jouwshop.kennis.shop/watch/...</code>, en zet de knop aan bij het juiste deurtje.
      </p>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
        <h2 className="text-sm font-semibold">Voor alle knoppen</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Veld label="Standaard knoptekst" hint="Wordt gebruikt als je bij een deurtje geen eigen tekst invult.">
            <input
              className={INPUT}
              value={config.knoppen.standaardLabel}
              maxLength={40}
              onChange={(e) => zetInstelling({ standaardLabel: e.target.value })}
            />
          </Veld>
          <Veld label="Link opent in">
            <select
              className={INPUT}
              value={config.knoppen.openen}
              onChange={(e) => zetInstelling({ openen: e.target.value as AdventConfig['knoppen']['openen'] })}
            >
              <option value="nieuw">Een nieuw tabblad</option>
              <option value="zelfde">Hetzelfde venster</option>
            </select>
          </Veld>
        </div>
        {config.knoppen.openen === 'zelfde' && (
          <p className="text-xs text-slate-600">
            Bij &quot;hetzelfde venster&quot; opent de les op de plek van je hele Kennis Shop-pagina, niet alleen in het kalendervakje. Dat werkt alleen als Kennis Shop
            dit toestaat. Test het dus eerst in je eigen shop. Lukt het niet, kies dan een nieuw tabblad.
          </p>
        )}
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
        <h2 className="text-sm font-semibold">Veel links tegelijk invullen</h2>
        <Veld
          label="Plak je links, één per regel"
          hint={`De eerste regel hoort bij deurtje 1, de tweede bij deurtje 2, enzovoort (maximaal ${aantal}). Een lege regel betekent: geen knop bij dat deurtje.`}
        >
          <textarea
            className={`${INPUT} font-mono`}
            rows={6}
            value={geplakt}
            spellCheck={false}
            onChange={(e) => setGeplakt(e.target.value)}
            placeholder={'https://jouwshop.kennis.shop/watch/...\n\nhttps://jouwshop.kennis.shop/watch/...'}
          />
        </Veld>
        <button type="button" onClick={verdeel} disabled={!geplakt.trim()} className={KNOP_PRIMAIR}>
          Verdeel over de deurtjes
        </button>
        {melding && (
          <div
            role={melding.soort === 'fout' ? 'alert' : 'status'}
            className={`rounded-lg border p-3 text-sm ${melding.soort === 'ok' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-red-300 bg-red-50 text-red-900'}`}
          >
            {melding.regels.map((r) => <p key={r}>{r}</p>)}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Per deurtje</h2>
          <span className="text-sm text-slate-600">{aantalKnoppen} van de {aantal} deurtjes hebben een knop</span>
        </div>
        <ul className="space-y-2">
          {dagen.map((d, i) => {
            const fout = linkFout(d.knop);
            return (
              <li key={d.dag} className="rounded-lg border border-slate-200 bg-white p-3">
                <label className="flex items-center gap-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={d.knop.aan}
                    onChange={(e) => wijzigKnoppen([{ i, knop: { aan: e.target.checked } }])}
                    className="h-4 w-4"
                  />
                  <span>{d.dag}. {d.titel}</span>
                  {d.knop.aan && <span className="ml-auto text-xs font-normal text-slate-500">knop aan</span>}
                </label>
                {d.knop.aan && (
                  <div className="mt-3 space-y-2">
                    <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                      <Veld label="Link">
                        <input
                          className={INPUT}
                          value={d.knop.url}
                          placeholder="https://jouwshop.kennis.shop/..."
                          onChange={(e) => wijzigKnoppen([{ i, knop: { url: e.target.value.trim() } }])}
                        />
                      </Veld>
                      <Veld label="Knoptekst (optioneel)">
                        <input
                          className={INPUT}
                          value={d.knop.label}
                          maxLength={40}
                          placeholder={config.knoppen.standaardLabel}
                          onChange={(e) => wijzigKnoppen([{ i, knop: { label: e.target.value } }])}
                        />
                      </Veld>
                    </div>
                    {fout && <p className="text-xs text-red-700" role="alert">{fout}</p>}
                    {!fout && d.knop.url && !d.knop.url.includes('kennis.shop') && (
                      <p className="text-xs text-slate-500">Dit lijkt geen Kennis Shop-link. Dat mag, controleer alleen even of hij klopt.</p>
                    )}
                    {!fout && d.knop.url && (
                      <a href={d.knop.url} target="_blank" rel="noopener noreferrer" className={`${KNOP} inline-block`}>
                        Test de link
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
