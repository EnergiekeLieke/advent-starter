'use client';

import { useEffect, useState } from 'react';
import type { AdventConfig } from '@/lib/config';
import { INPUT, KNOP, Veld, type Bericht } from '@/components/beheer/velden';
import { adviesIframeHoogte } from '@/lib/embed';

interface Props {
  config: AdventConfig;
  /** Zijn er wijzigingen die nog niet zijn opgeslagen? */
  gewijzigd: boolean;
  /** Is de testmodus opgeslagen en dus voor klanten zichtbaar? */
  opgeslagenTestmodus: boolean;
  /** Nummers van deurtjes die nog de voorbeeldtekst hebben */
  voorbeeldDagen: number[];
  /** Heet de kalender nog "Mijn adventkalender"? */
  voorbeeldTitel: boolean;
  naarTab: (tab: 'Deurtjes' | 'Opties' | 'Algemeen') => void;
}

export default function DelenTab({ config, gewijzigd, opgeslagenTestmodus, voorbeeldDagen, voorbeeldTitel, naarTab }: Props) {
  const [origin, setOrigin] = useState('');
  const [hoogteInvoer, setHoogteInvoer] = useState<number | null>(null);
  const [bericht, setBericht] = useState<Bericht>(null);
  useEffect(() => setOrigin(window.location.origin), []);

  // Meer deurtjes betekent meer rijen en dus meer hoogte nodig voor deurtjes van volle grootte
  const kolommen = config.opties.embedKolommen;
  const advies = adviesIframeHoogte(config.aantalDagen, kolommen);
  const hoogte = hoogteInvoer ?? advies;
  const link = `${origin}/`;
  const titel = config.titel.replace(/"/g, '&quot;');
  const embedcode = `<iframe src="${origin}/?embed=true" width="100%" height="${hoogte}" frameborder="0" title="${titel}"></iframe>`;

  async function kopieer(tekst: string, melding: string) {
    try {
      await navigator.clipboard.writeText(tekst);
      setBericht({ soort: 'ok', regels: [melding] });
    } catch {
      setBericht({ soort: 'fout', regels: ['Kopiëren lukt niet in deze browser. Selecteer de tekst en kopieer hem zelf.'] });
    }
  }

  const voorbeeldLijst = voorbeeldDagen.length > 6 ? `${voorbeeldDagen.slice(0, 6).join(', ')} en meer` : voorbeeldDagen.join(', ');
  const aandachtspunten: { tekst: string; actie?: { label: string; tab: 'Deurtjes' | 'Opties' | 'Algemeen' } }[] = [];
  if (gewijzigd) aandachtspunten.push({ tekst: 'Je hebt wijzigingen die nog niet zijn opgeslagen. Klik eerst op Opslaan, anders ziet je klant ze niet.' });
  if (config.testmodus || opgeslagenTestmodus) {
    aandachtspunten.push({
      tekst: config.testmodus
        ? 'De testmodus staat aan. Dan kan iedereen met de link alle deurtjes openen. Zet hem uit en sla op voordat je de kalender deelt.'
        : 'Je hebt de testmodus uitgezet, maar nog niet opgeslagen. Klik op Opslaan, anders blijft hij voor je klanten aan.',
      actie: { label: 'Naar de testmodus', tab: 'Opties' },
    });
  }
  if (voorbeeldDagen.length > 0) {
    aandachtspunten.push({
      tekst: `${voorbeeldDagen.length} ${voorbeeldDagen.length === 1 ? 'deurtje heeft' : 'deurtjes hebben'} nog de voorbeeldtekst (${voorbeeldLijst}).`,
      actie: { label: 'Naar de deurtjes', tab: 'Deurtjes' },
    });
  }
  if (voorbeeldTitel) {
    aandachtspunten.push({ tekst: 'De titel is nog "Mijn adventkalender".', actie: { label: 'Titel aanpassen', tab: 'Algemeen' } });
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold">Controleer dit eerst</h2>
        {aandachtspunten.length === 0 ? (
          <p className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
            Alles ziet er goed uit. Je kunt de kalender delen.
          </p>
        ) : (
          <ul className="space-y-2">
            {aandachtspunten.map((p) => (
              <li key={p.tekst} className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                <span className="flex-1">{p.tekst}</span>
                {p.actie && <button type="button" onClick={() => naarTab(p.actie!.tab)} className={KNOP}>{p.actie.label}</button>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
        <h2 className="text-sm font-semibold">Link naar je kalender</h2>
        <input className={`${INPUT} font-mono`} readOnly value={link} onFocus={(e) => e.currentTarget.select()} aria-label="Link naar je kalender" />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => kopieer(link, 'De link staat op je klembord.')} className={KNOP}>Kopieer link</button>
          <a href="/" target="_blank" rel="noopener noreferrer" className={`${KNOP} inline-block`}>Open de kalender</a>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-3">
        <h2 className="text-sm font-semibold">Embedcode voor Kennis Shop of je website</h2>
        <Veld
          label="Hoogte in pixels"
          hint={
            kolommen === 6
              ? `Advies voor jouw ${config.aantalDagen} deurtjes met 6 per rij: ${advies} px, bij een iframe van ongeveer 450 tot 600 px breed. Te laag maken geeft kleinere deurtjes, te hoog geeft lege ruimte. Is je iframe breder dan 700 px, kies dan iets hoger.`
              : `Advies voor jouw ${config.aantalDagen} deurtjes met 4 per rij: ${advies} px, bij een iframe van ongeveer 450 tot 500 px breed (telefoon). In een breder iframe worden de deurtjes groter, en dan mag het iframe ook hoger. Te laag maken geeft kleinere deurtjes, te hoog geeft lege ruimte.`
          }
        >
          <input
            type="number"
            min={400}
            max={1600}
            step={50}
            className={INPUT}
            value={hoogte}
            onChange={(e) => setHoogteInvoer(Math.max(400, Math.min(1600, Math.round(Number(e.target.value)) || advies)))}
          />
        </Veld>
        {hoogteInvoer !== null && hoogteInvoer !== advies && (
          <button type="button" onClick={() => setHoogteInvoer(null)} className={KNOP}>Terug naar het advies ({advies} px)</button>
        )}
        <textarea className={`${INPUT} font-mono`} readOnly rows={4} value={embedcode} onFocus={(e) => e.currentTarget.select()} aria-label="Embedcode" />
        <button type="button" onClick={() => kopieer(embedcode, 'De embedcode staat op je klembord. Plak hem in een HTML-blok in Kennis Shop.')} className={KNOP}>
          Kopieer embedcode
        </button>
        <p className="text-xs text-slate-500">
          De breedte en hoogte staan als losse onderdelen in de code, niet in een <code className="font-mono">style</code>. Kennis Shop haalt die laatste er namelijk vaak uit.
          Wil je eerst testen wat je klanten straks zien? Zet dan tijdelijk de testmodus aan bij Opties en zet hem daarna weer uit.
        </p>
      </section>

      {bericht && (
        <div
          role={bericht.soort === 'fout' ? 'alert' : 'status'}
          className={`rounded-lg border p-3 text-sm ${bericht.soort === 'ok' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-red-300 bg-red-50 text-red-900'}`}
        >
          {bericht.regels.map((r) => <p key={r}>{r}</p>)}
        </div>
      )}
    </div>
  );
}
