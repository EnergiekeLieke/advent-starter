'use client';

import { useEffect, useState } from 'react';
import type { AdventConfig } from '@/lib/config';
import { INPUT, KNOP, Veld, type Bericht } from '@/components/beheer/velden';
import { adviesIframeHoogte } from '@/lib/embed';
import { heeftAchtergrondAfbeelding } from '@/lib/kleur';

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
  // In Kennis Shop is het iframe meestal 450 tot 600 px breed (op een telefoon smaller)
  const [breedte, setBreedte] = useState(600);
  const [bericht, setBericht] = useState<Bericht>(null);
  // De pagina waarop je de kalender hebt ingebed (voor QR-codes die naar een deurtje wijzen)
  const [paginaAdres, setPaginaAdres] = useState('');
  useEffect(() => setOrigin(window.location.origin), []);

  // De kalender is hoger naarmate er meer deurtjes zijn en naarmate het iframe breder is (de deurtjes worden dan groter)
  const achtergrondAfb = heeftAchtergrondAfbeelding(config.opties);
  const advies = adviesIframeHoogte(config.aantalDagen, breedte, !achtergrondAfb && config.opties.landschap !== 'geen' && config.opties.landschap !== 'eigen', config.titel, config.titelGrootte, !achtergrondAfb && config.opties.landschap === 'eigen' && Boolean(config.opties.onderkantAfbeelding || config.opties.onderkantAfbeeldingMobiel), config.opties.delen);
  const hoogte = hoogteInvoer ?? advies;
  const link = `${origin}/`;
  const titel = config.titel.replace(/"/g, '&quot;');
  const embedcode = `<iframe src="${origin}/?embed=true" width="100%" height="${hoogte}" frameborder="0" allow="web-share; clipboard-write" title="${titel}"></iframe>`;

  // Links naar één deurtje, bijvoorbeeld voor een QR-code op drukwerk. Leeg adres: de kalender zelf.
  const paginaGeldig = /^https:\/\/\S+$/i.test(paginaAdres.trim());
  const deurtjeBasis = (paginaGeldig ? paginaAdres.trim() : `${origin}/`).replace(/#.*$/, '');
  const deurtjeLink = (dag: number) => `${deurtjeBasis}${deurtjeBasis.includes('?') ? '&' : '?'}deurtje=${dag}`;
  const deurtjeLinks = Array.from({ length: config.aantalDagen }, (_, i) => deurtjeLink(i + 1));
  // Voor een eigen pagina: de embedcode die ook ?deurtje= uit de link van de pagina doorgeeft aan het iframe
  const embedMetDeurtje = `<iframe id="adventkalender" src="${origin}/?embed=true" width="100%" height="${hoogte}" frameborder="0" allow="web-share; clipboard-write" title="${titel}"></iframe>
<script>
  (function () {
    var d = new URLSearchParams(location.search).get('deurtje');
    if (/^\\d{1,2}$/.test(d || '')) document.getElementById('adventkalender').src += '&deurtje=' + d;
  })();
</script>`;

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
        <p className="text-xs text-slate-600">
          Je kalender staat in het iframe zoals hij op je eigen pagina staat: de deurtjes staan 4 naast elkaar. Is het iframe te laag, dan moet je klant in het iframe scrollen.
          Is het te hoog, dan blijft er lege ruimte onder de kalender. Vul hieronder in hoe breed je iframe ongeveer is, dan reken ik de hoogte uit.
        </p>
        <Veld label="Breedte van je iframe in pixels" hint="Meestal 450 tot 600. Is de kolom waarin je kalender staat breder, vul dan die breedte in. Op een smallere telefoon blijft er onderaan wat ruimte over.">
          <input
            type="number"
            min={300}
            max={1400}
            step={10}
            className={INPUT}
            value={breedte}
            onChange={(e) => setBreedte(Math.max(300, Math.min(1400, Math.round(Number(e.target.value)) || 600)))}
          />
        </Veld>
        <Veld
          label="Hoogte in pixels"
          hint={`Advies voor jouw ${config.aantalDagen} deurtjes bij een iframe van ${breedte} px breed: ${advies} px.`}
        >
          <input
            type="number"
            min={400}
            max={2400}
            step={50}
            className={INPUT}
            value={hoogte}
            onChange={(e) => setHoogteInvoer(Math.max(400, Math.min(2400, Math.round(Number(e.target.value)) || advies)))}
          />
        </Veld>
        {hoogteInvoer !== null && hoogteInvoer !== advies && (
          <button type="button" onClick={() => setHoogteInvoer(null)} className={KNOP}>Terug naar het advies ({advies} px)</button>
        )}
        <textarea className={`${INPUT} font-mono`} readOnly rows={4} value={embedcode} onFocus={(e) => e.currentTarget.select()} aria-label="Embedcode" />
        <button type="button" onClick={() => kopieer(embedcode, 'De embedcode staat op je klembord. Plak hem in een embed-blok in Kennis Shop.')} className={KNOP}>
          Kopieer embedcode
        </button>
        <p className="text-xs text-slate-500">
          De breedte en hoogte staan als losse onderdelen in de code, niet in een <code className="font-mono">style</code>. Kennis Shop haalt die laatste er namelijk vaak uit.
          Wil je eerst testen wat je klanten straks zien? Zet dan tijdelijk de testmodus aan bij Opties en zet hem daarna weer uit.
        </p>
      </section>

      <details className="rounded-lg border border-slate-200 bg-white p-3">
        <summary className="cursor-pointer text-sm font-semibold">Links per deurtje (voor QR-codes op drukwerk)</summary>
        <div className="mt-3 space-y-3">
          <p className="text-xs text-slate-600">
            Wie zo'n link opent, ziet de kalender met het deurtje van die dag al open. Is die dag nog niet aangebroken, dan blijft het deurtje dicht en staat er wanneer het opengaat.
            De links blijven na december ook gewoon werken. Gebruik voor drukwerk een adres dat blijft bestaan, bij voorkeur je eigen domein.
          </p>
          <Veld label="Pagina waarop je de kalender hebt ingebed (optioneel)" hint="Bijvoorbeeld https://jouwwebsite.nl/advent. Laat je dit leeg, dan wijzen de links naar de kalender zelf.">
            <input className={INPUT} value={paginaAdres} onChange={(e) => setPaginaAdres(e.target.value)} placeholder="https://jouwwebsite.nl/advent" inputMode="url" />
          </Veld>
          {paginaAdres.trim() && !paginaGeldig && <p className="text-xs text-red-700">Het adres moet met https:// beginnen en geen spaties hebben. Tot die tijd staan hieronder de links naar de kalender zelf.</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => kopieer(deurtjeLinks.map((l, i) => `${i + 1}\t${l}`).join('\n'), `Alle ${deurtjeLinks.length} links staan op je klembord, met het nummer ervoor.`)} className={KNOP}>
              Kopieer alle links
            </button>
          </div>
          <ul className="max-h-64 space-y-1 overflow-auto rounded-lg border border-slate-200 p-2 text-sm">
            {deurtjeLinks.map((l, i) => (
              <li key={l} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-xs text-slate-500">Deurtje {i + 1}</span>
                <input className={`${INPUT} font-mono text-xs`} readOnly value={l} onFocus={(e) => e.currentTarget.select()} aria-label={`Link naar deurtje ${i + 1}`} />
                <button type="button" onClick={() => kopieer(l, `De link naar deurtje ${i + 1} staat op je klembord.`)} className={KNOP}>Kopieer</button>
              </li>
            ))}
          </ul>
          {paginaGeldig && (
            <div className="space-y-2">
              <p className="text-xs text-slate-600">
                Staat je kalender op een eigen pagina in een iframe? Dan weet het iframe niet welk deurtje er in de link van die pagina staat. Gebruik op die pagina deze embedcode, die geeft het deurtje door:
              </p>
              <textarea className={`${INPUT} font-mono`} readOnly rows={8} value={embedMetDeurtje} onFocus={(e) => e.currentTarget.select()} aria-label="Embedcode die het deurtje doorgeeft" />
              <button type="button" onClick={() => kopieer(embedMetDeurtje, 'De embedcode staat op je klembord.')} className={KNOP}>Kopieer deze embedcode</button>
              <p className="text-xs text-slate-500">Dit werkt alleen als je websitebouwer scripts in een embed-blok toestaat. Lukt dat niet, laat de QR-codes dan naar de kalender zelf wijzen.</p>
            </div>
          )}
        </div>
      </details>

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
