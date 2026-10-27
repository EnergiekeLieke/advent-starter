'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DelenTab from '@/components/beheer/DelenTab';
import KnoppenTab from '@/components/beheer/KnoppenTab';
import { INPUT, KNOP, KNOP_PRIMAIR, Veld, type Bericht } from '@/components/beheer/velden';
import { BERICHT_CONFIG, BERICHT_KLAAR } from '@/components/KalenderPagina';
import { dagenVoor, LETTERTYPES, leesConfig, MAX_DAGEN, THEMAS, themaVan, type AdventConfig, type AdventDag, type AdventKleuren, type Lettertype, type Onderkant, type ThemaNaam } from '@/lib/config';
import standaardConfig from '@/config/advent.json';
import { labelKort, parseIso, plusDagen } from '@/lib/datum';
import { adviesIframeHoogte } from '@/lib/embed';
import { contrast, landschapPalet } from '@/lib/kleur';
import type { OpslagModus } from '@/lib/opslag';
import { PROMPT_TEKSTEN } from '@/lib/promptTeksten';
import type { VersieInfo } from '@/lib/versie';

const TABS = ['Algemeen', 'Kleuren en logo', 'Deurtjes', 'Kennis Shop-links', 'Opties', 'Delen', 'Importeren en exporteren'] as const;
type Tab = (typeof TABS)[number];

function KleurVeld({ label, waarde, onChange }: { label: string; waarde: string; onChange: (hex: string) => void }) {
  const [tekst, setTekst] = useState(waarde);
  useEffect(() => setTekst(waarde), [waarde]);
  return (
    <div>
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={waarde}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="h-9 w-12 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
        />
        <input
          type="text"
          value={tekst}
          onChange={(e) => {
            setTekst(e.target.value);
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) onChange(e.target.value.toLowerCase());
          }}
          maxLength={7}
          spellCheck={false}
          aria-label={`${label} als kleurcode`}
          className={`${INPUT} font-mono`}
        />
      </div>
    </div>
  );
}

function UploadKnop({ onUrl, label = 'Afbeelding uploaden' }: { onUrl: (url: string) => void; label?: string }) {
  const invoer = useRef<HTMLInputElement>(null);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState('');

  async function kies(e: React.ChangeEvent<HTMLInputElement>) {
    const bestand = e.target.files?.[0];
    e.target.value = '';
    if (!bestand) return;
    setBezig(true);
    setFout('');
    const form = new FormData();
    form.append('bestand', bestand);
    const res = await fetch('/api/beheer/upload', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) onUrl(data.url);
    else setFout(data.fout ?? 'Uploaden is niet gelukt.');
    setBezig(false);
  }

  return (
    <div>
      <input ref={invoer} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={kies} className="hidden" />
      <button type="button" onClick={() => invoer.current?.click()} disabled={bezig} className={KNOP}>
        {bezig ? 'Uploaden...' : label}
      </button>
      {fout && <p className="mt-1 text-xs text-red-700" role="alert">{fout}</p>}
    </div>
  );
}

const ONDERKANT_KEUZES: { waarde: Onderkant; naam: string; uitleg: string }[] = [
  { waarde: 'winter', naam: 'Winterlandschap', uitleg: 'Sneeuw, huisje en kerstboom. Mooi op een donkere achtergrond.' },
  { waarde: 'heuvels', naam: 'Zachte heuvels', uitleg: 'Huisje en kerstboom in de kleuren van je thema, zonder sneeuw. Past bij lichte kleuren.' },
  { waarde: 'golven', naam: 'Golvende heuvels', uitleg: 'Alleen heuvels in de kleuren van je thema, zonder kerstboom. Ook mooi buiten de feestdagen.' },
  { waarde: 'geen', naam: 'Geen onderkant', uitleg: 'Alleen de deurtjes, zonder landschap.' },
];

// Kleine tekening van het raster met 6 of 4 deurtjes per rij, in de kleuren van het gekozen thema
function KolommenMini({ kolommen, kleuren }: { kolommen: 4 | 6; kleuren: AdventKleuren }) {
  return (
    <span
      aria-hidden
      className="grid h-12 gap-1 rounded-lg p-1.5"
      style={{ background: kleuren.achtergrond, gridTemplateColumns: `repeat(${kolommen}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${12 / kolommen}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: 12 }, (_, i) => <span key={i} className="rounded-sm" style={{ background: kleuren.tegels[i % 4] }} />)}
    </span>
  );
}

// Kleine tekening van een onderkant, in de kleuren van het gekozen thema
function OnderkantMini({ waarde, kleuren }: { waarde: Onderkant; kleuren: AdventKleuren }) {
  if (waarde === 'geen') {
    return (
      <span aria-hidden className="flex h-12 items-center justify-center rounded-lg border border-dashed border-slate-400 text-xs text-slate-400" style={{ background: kleuren.achtergrond }}>
        geen
      </span>
    );
  }
  const p = landschapPalet(waarde, kleuren);
  return (
    <svg viewBox="0 0 120 40" aria-hidden className="h-12 w-full rounded-lg" style={{ background: kleuren.achtergrond }} preserveAspectRatio="xMidYMax slice">
      <path d="M0 24Q30 12 60 22T120 18V40H0Z" fill={p.heuvelMidden} opacity={p.heuvelMiddenOpac} />
      {waarde !== 'golven' && (
        <>
          <path d="M70 30l5-12 5 12z" fill={p.den[1]} />
          <path d="M84 30l6-16 6 16z" fill={p.den[0]} />
          <rect x="22" y="22" width="12" height="9" fill={p.huisMuur} />
          <path d="M20 22l8-7 8 7z" fill={p.huisDak} />
        </>
      )}
      <path d="M0 32Q30 26 60 31T120 29V40H0Z" fill={p.heuvelVoor1} opacity={p.heuvelVoor1Opac} />
      <path d="M0 37Q40 33 80 36T120 35V40H0Z" fill={p.heuvelVoor2} opacity={p.heuvelVoor2Opac} />
    </svg>
  );
}

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

// Geplakte JSON (bijvoorbeeld van Claude) mag onvolledig zijn: wat ontbreekt blijft zoals het nu is.
function voegSamen(huidig: AdventConfig, ingevoerd: Record<string, unknown>): unknown {
  const dagen = Array.isArray(ingevoerd.dagen) ? ingevoerd.dagen : undefined;
  return {
    ...huidig,
    ...ingevoerd,
    kleuren: { ...huidig.kleuren, ...(isObject(ingevoerd.kleuren) ? ingevoerd.kleuren : {}) },
    opties: { ...huidig.opties, ...(isObject(ingevoerd.opties) ? ingevoerd.opties : {}) },
    ...(ingevoerd.aantalDagen === undefined && dagen ? { aantalDagen: Math.min(MAX_DAGEN, Math.max(1, dagen.length)) } : {}),
  };
}

const PREVIEW_DATA = [
  { sleutel: 'vandaag', label: 'Vandaag' },
  { sleutel: 'voor', label: 'Voor de start' },
  { sleutel: 'halverwege', label: 'Halverwege' },
  { sleutel: 'laatste', label: 'Laatste dag' },
  { sleutel: 'na', label: 'Na afloop' },
] as const;

export default function Editor({ beginConfig, modus, versie }: { beginConfig: AdventConfig; modus: OpslagModus; versie: VersieInfo }) {
  const router = useRouter();
  const [config, setConfig] = useState(beginConfig);
  const [opgeslagen, setOpgeslagen] = useState(() => JSON.stringify(beginConfig));
  const [tab, setTab] = useState<Tab>('Algemeen');
  const [bezig, setBezig] = useState(false);
  const [bericht, setBericht] = useState<Bericht>(null);
  const [previewDatum, setPreviewDatum] = useState<(typeof PREVIEW_DATA)[number]['sleutel']>('halverwege');
  const [previewEmbed, setPreviewEmbed] = useState(false);
  const [jsonTekst, setJsonTekst] = useState('');
  const [importBericht, setImportBericht] = useState<Bericht>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  const controle = useMemo(() => leesConfig(config), [config]);
  const gewijzigd = JSON.stringify(config) !== opgeslagen;
  const dagen = useMemo(() => dagenVoor(config), [config]);
  const actiefThema = useMemo(() => themaVan(config.kleuren), [config.kleuren]);
  const opgeslagenTestmodus = useMemo(() => Boolean(JSON.parse(opgeslagen).testmodus), [opgeslagen]);
  const startDatum = parseIso(config.startDatum);
  const dagDatum = (i: number) => (startDatum ? labelKort(plusDagen(startDatum, i)) : '');
  // Deurtjes die nog de voorbeeldtekst uit config/advent.json hebben
  const voorbeeldDagen = useMemo(
    () => dagen.filter((d, i) => standaardConfig.dagen[i] && d.titel === standaardConfig.dagen[i].titel && d.tekst === standaardConfig.dagen[i].tekst).map((d) => d.dag),
    [dagen],
  );
  const voorbeeldTitel = config.titel === standaardConfig.titel;

  const waarschuwingen = useMemo(() => {
    const k = config.kleuren;
    const w: string[] = [];
    if (contrast(k.achtergrond, k.accent) < 3) w.push('De accentkleur valt weg tegen de achtergrond, dus de titel is slecht leesbaar.');
    if (contrast(k.licht, k.primair) < 4.5) w.push('De primaire kleur is slecht leesbaar op de lichte kleur (titels in de popup).');
    if (contrast(k.licht, k.tekst) < 4.5) w.push('De tekstkleur is slecht leesbaar op de lichte kleur (tekst in de popup).');
    return w;
  }, [config.kleuren]);

  // Voorbeeld: de iframe laadt /?preview=1 en krijgt de instellingen live via postMessage
  const previewSrc = useMemo(() => {
    const start = parseIso(config.startDatum);
    let datumParam = '';
    if (start && previewDatum !== 'vandaag') {
      const n = config.aantalDagen;
      const verschuiving = { voor: -3, halverwege: Math.min(Math.floor(n / 2), n - 1), laatste: n - 1, na: n + 1 }[previewDatum];
      const d = plusDagen(start, verschuiving);
      datumParam = `&datum=${d.jaar}-${String(d.maand).padStart(2, '0')}-${String(d.dag).padStart(2, '0')}`;
    }
    return `/?preview=1${datumParam}${previewEmbed ? '&embed=true' : ''}`;
    // De startdatum en het aantal dagen bepalen de testdatum, de rest van de instellingen niet
  }, [config.startDatum, config.aantalDagen, previewDatum, previewEmbed]);

  useEffect(() => {
    const stuur = () => frame.current?.contentWindow?.postMessage({ type: BERICHT_CONFIG, config }, window.location.origin);
    const timer = setTimeout(stuur, 120);
    const opKlaar = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === BERICHT_KLAAR) stuur();
    };
    window.addEventListener('message', opKlaar);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('message', opKlaar);
    };
  }, [config, previewSrc]);

  useEffect(() => {
    if (!gewijzigd) return;
    const waarschuw = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', waarschuw);
    return () => window.removeEventListener('beforeunload', waarschuw);
  }, [gewijzigd]);

  function zet<K extends keyof AdventConfig>(sleutel: K, waarde: AdventConfig[K]) {
    setConfig((c) => ({ ...c, [sleutel]: waarde }));
  }

  function zetKleur(naam: Exclude<keyof AdventConfig['kleuren'], 'tegels'>, hex: string) {
    setConfig((c) => ({ ...c, kleuren: { ...c.kleuren, [naam]: hex } }));
  }

  function zetTegel(i: number, hex: string) {
    setConfig((c) => ({ ...c, kleuren: { ...c.kleuren, tegels: c.kleuren.tegels.map((t, j) => (j === i ? hex : t)) } }));
  }

  function kiesThema(naam: ThemaNaam) {
    const k = THEMAS[naam].kleuren;
    setConfig((c) => ({ ...c, kleuren: { ...k, tegels: [...k.tegels] }, opties: { ...c.opties, landschap: THEMAS[naam].landschap } }));
  }

  function zetOptie<K extends keyof AdventConfig['opties']>(naam: K, waarde: AdventConfig['opties'][K]) {
    setConfig((c) => ({ ...c, opties: { ...c.opties, [naam]: waarde } }));
  }

  function wijzigDag(i: number, deel: Partial<AdventDag>) {
    setConfig((c) => {
      const lijst = dagenVoor(c).map(({ dag: _dag, ...rest }) => rest as AdventDag);
      lijst[i] = { ...lijst[i], ...deel };
      return { ...c, dagen: lijst };
    });
  }

  function zetTestmodus(aan: boolean) {
    setConfig((c) => ({ ...c, testmodus: aan }));
  }

  function zetKnoppenInstelling(deel: Partial<AdventConfig['knoppen']>) {
    setConfig((c) => ({ ...c, knoppen: { ...c.knoppen, ...deel } }));
  }

  // Past van meerdere deurtjes tegelijk de knop aan (bijvoorbeeld bij het plakken van een lijst links)
  function wijzigKnoppen(wijzigingen: { i: number; knop: Partial<AdventDag['knop']> }[]) {
    setConfig((c) => {
      const lijst = dagenVoor(c).map(({ dag: _dag, ...rest }) => rest as AdventDag);
      for (const { i, knop } of wijzigingen) lijst[i] = { ...lijst[i], knop: { ...lijst[i].knop, ...knop } };
      return { ...c, dagen: lijst };
    });
  }

  // Pijltjestoetsen, Home en End wisselen van tabblad
  function opTabToets(e: React.KeyboardEvent, i: number) {
    const n = TABS.length;
    const volgende = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : null;
    if (volgende === null) return;
    e.preventDefault();
    setTab(TABS[volgende]);
    document.getElementById(`tab-${volgende}`)?.focus();
  }

  async function bewaar() {
    setBezig(true);
    setBericht(null);
    const res = await fetch('/api/beheer/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setConfig(data.config);
      setOpgeslagen(JSON.stringify(data.config));
      const regels = ['Opgeslagen. De kalender is bijgewerkt.'];
      if (data.config.testmodus) regels.push('Let op: de testmodus staat aan. Iedereen met de link kan nu alle deurtjes openen. Zet hem weer uit als je klaar bent met testen.');
      setBericht({ soort: 'ok', regels });
    } else {
      setBericht({ soort: 'fout', regels: data.fouten ?? ['Opslaan is niet gelukt.'] });
    }
    setBezig(false);
  }

  async function uitloggen() {
    await fetch('/api/beheer/logout', { method: 'POST' });
    router.refresh();
  }

  function importeer() {
    // Claude zet de JSON vaak in een codeblok of met een zin ervoor en erna: we pakken alles van de eerste { tot de laatste }
    const van = jsonTekst.indexOf('{');
    const tot = jsonTekst.lastIndexOf('}');
    const kandidaat = van >= 0 && tot > van ? jsonTekst.slice(van, tot + 1) : jsonTekst;
    let ruw: unknown;
    try {
      ruw = JSON.parse(kandidaat);
    } catch {
      setImportBericht({ soort: 'fout', regels: ['Ik kan hier geen geldige JSON in vinden. Kopieer het hele blok van Claude, van { tot en met }.'] });
      return;
    }
    if (!isObject(ruw)) {
      setImportBericht({ soort: 'fout', regels: ['De JSON moet beginnen met { en eindigen met }.'] });
      return;
    }
    const uitkomst = leesConfig(voegSamen(config, ruw));
    if (uitkomst.ok) {
      setConfig(uitkomst.config);
      setImportBericht({ soort: 'ok', regels: ['Geïmporteerd. Controleer het voorbeeld en klik daarna op Opslaan.'] });
    } else {
      setImportBericht({ soort: 'fout', regels: uitkomst.fouten });
    }
  }

  async function kopieer(tekst: string, melding: string) {
    try {
      await navigator.clipboard.writeText(tekst);
      setImportBericht({ soort: 'ok', regels: [melding] });
    } catch {
      setImportBericht({ soort: 'fout', regels: ['Kopiëren lukt niet in deze browser. Selecteer de tekst en kopieer hem zelf.'] });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-2xl font-bold">Beheer van je adventkalender</h1>
        {config.testmodus && <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-bold text-amber-950">TESTMODUS AAN</span>}
        <a href="/" target="_blank" rel="noopener noreferrer" className={KNOP}>Bekijk de kalender</a>
        <button type="button" onClick={uitloggen} className={KNOP}>Uitloggen</button>
        <button type="button" onClick={bewaar} disabled={bezig || !gewijzigd || !controle.ok} className={KNOP_PRIMAIR}>
          {bezig ? 'Opslaan...' : gewijzigd ? 'Opslaan' : 'Opgeslagen'}
        </button>
      </header>

      {versie.nieuwste && (
        <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-sky-300 bg-sky-50 p-3 text-sm text-sky-900">
          <p className="flex-1">
            <strong>Er is een nieuwe versie van de adventkalender: {versie.nieuwste}.</strong> Jij hebt versie {versie.huidig}.
            Je teksten, kleuren en logo blijven bewaard. Klik op <strong>Run workflow</strong> op de pagina waar de knop je naartoe brengt.
          </p>
          {versie.updateUrl ? (
            <a href={versie.updateUrl} target="_blank" rel="noopener noreferrer" className={KNOP}>Naar de update-knop</a>
          ) : (
            <span className="text-xs">Open je repo op GitHub, ga naar Actions en kies &quot;Update van de template&quot;.</span>
          )}
        </div>
      )}

      {(config.testmodus || opgeslagenTestmodus) && (
        <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border-2 border-amber-400 bg-amber-100 p-3 text-sm text-amber-950">
          <div className="flex-1">
            {config.testmodus ? (
              <>
                <p><strong>Testmodus staat aan.</strong> Alle deurtjes zijn nu te openen, ook die van latere datums, en iedereen met de link kan de teksten lezen. Zet dit zelf weer uit voordat je de kalender met klanten deelt.</p>
                {!opgeslagenTestmodus && <p className="mt-1">Klik op Opslaan om het ook te zien in Kennis Shop of op de kalenderpagina zelf.</p>}
              </>
            ) : (
              <p><strong>Je hebt de testmodus uitgezet, maar nog niet opgeslagen.</strong> Klik op Opslaan, anders blijft hij voor je klanten aan.</p>
            )}
          </div>
          {config.testmodus && <button type="button" onClick={() => zetTestmodus(false)} className={KNOP}>Zet testmodus uit</button>}
        </div>
      )}

      {modus === 'geen' && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          Opslaan werkt nog niet, want er is geen Blob-opslag gekoppeld. Ga in Vercel naar Storage, kies Create en dan Blob, en deploy opnieuw.
          Je kunt nu wel alles invullen en via &quot;Importeren en exporteren&quot; bewaren.
        </div>
      )}
      {modus === 'bestand' && (
        <div className="mb-4 rounded-lg border border-sky-300 bg-sky-50 p-3 text-sm text-sky-900">
          Lokale testmodus: je instellingen worden opgeslagen in <code className="font-mono">.advent-config.local.json</code> op je eigen computer.
        </div>
      )}

      {bericht && (
        <div
          role={bericht.soort === 'fout' ? 'alert' : 'status'}
          className={`mb-4 rounded-lg border p-3 text-sm ${bericht.soort === 'ok' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-red-300 bg-red-50 text-red-900'}`}
        >
          {bericht.regels.map((r) => <p key={r}>{r}</p>)}
        </div>
      )}
      {!controle.ok && (
        <div role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          <p className="font-semibold">Dit moet nog even aangepast worden voordat je kunt opslaan:</p>
          <ul className="ml-5 list-disc">{controle.fouten.slice(0, 6).map((f) => <li key={f}>{f}</li>)}</ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section>
          <div role="tablist" aria-label="Onderdelen" className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
            {TABS.map((t, i) => (
              <button
                key={t}
                id={`tab-${i}`}
                role="tab"
                type="button"
                aria-selected={tab === t}
                aria-controls="tabpaneel"
                tabIndex={tab === t ? 0 : -1}
                onKeyDown={(e) => opTabToets(e, i)}
                onClick={() => setTab(t)}
                className={`-mb-px rounded-t-lg border px-3 py-2 text-sm font-medium ${tab === t ? 'border-slate-200 border-b-slate-50 bg-slate-50 text-emerald-800' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div role="tabpanel" id="tabpaneel" aria-labelledby={`tab-${TABS.indexOf(tab)}`}>
          {tab === 'Algemeen' && (
            <div className="space-y-4">
              <Veld label="Titel van de kalender"><input className={INPUT} value={config.titel} maxLength={80} onChange={(e) => zet('titel', e.target.value)} /></Veld>
              <Veld label="Ondertitel"><input className={INPUT} value={config.ondertitel} maxLength={120} onChange={(e) => zet('ondertitel', e.target.value)} /></Veld>
              <Veld label="Tekst onder de deurtjes"><input className={INPUT} value={config.footer} maxLength={200} onChange={(e) => zet('footer', e.target.value)} /></Veld>
              <Veld label="Afsluiting" hint="Staat in het laatste deurtje en onder de kalender zodra alles open is.">
                <input className={INPUT} value={config.afsluiting} maxLength={200} onChange={(e) => zet('afsluiting', e.target.value)} />
              </Veld>
              <div className="grid gap-4 sm:grid-cols-2">
                <Veld label="Eerste dag" hint="Op deze datum gaat deurtje 1 open.">
                  <input type="date" className={INPUT} value={config.startDatum} onChange={(e) => zet('startDatum', e.target.value)} />
                </Veld>
                <Veld label="Aantal deurtjes" hint={`Tussen 1 en ${MAX_DAGEN}. Standaard 24.`}>
                  <input
                    type="number"
                    min={1}
                    max={MAX_DAGEN}
                    className={INPUT}
                    value={config.aantalDagen}
                    onChange={(e) => zet('aantalDagen', Math.round(Number(e.target.value)))}
                  />
                </Veld>
              </div>
              <Veld label="Lettertype voor de titels">
                <select className={INPUT} value={config.lettertype} onChange={(e) => zet('lettertype', e.target.value as Lettertype)}>
                  {(Object.keys(LETTERTYPES) as Lettertype[]).map((l) => <option key={l} value={l}>{LETTERTYPES[l].naam}</option>)}
                </select>
              </Veld>
            </div>
          )}

          {tab === 'Kleuren en logo' && (
            <div className="space-y-6">
              <div>
                <p className="mb-1 text-sm font-medium">Kies een thema</p>
                <p className="mb-3 text-xs text-slate-500">
                  {actiefThema
                    ? `Je gebruikt het thema ${THEMAS[actiefThema].naam}. Pas hieronder gerust losse kleuren aan. De onderkant van de kalender wordt mee gekozen en staat bij Opties.`
                    : 'Je gebruikt eigen kleuren. Kies een thema om opnieuw te beginnen.'}
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="group" aria-label="Thema's">
                  {(Object.keys(THEMAS) as ThemaNaam[]).map((n) => {
                    const t = THEMAS[n];
                    const actief = n === actiefThema;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => kiesThema(n)}
                        aria-pressed={actief}
                        className={`rounded-xl border-2 bg-white p-2 text-left transition-colors ${actief ? 'border-emerald-700 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-slate-400'}`}
                      >
                        <span className="block rounded-lg p-2" style={{ background: t.kleuren.achtergrond }}>
                          <span className="mb-1.5 block h-1.5 w-12 rounded-full" style={{ background: t.kleuren.accent }} />
                          <span className="flex gap-1">
                            {t.kleuren.tegels.map((c, i) => (
                              <span key={i} className="block h-6 flex-1 rounded" style={{ background: c, border: `1px solid ${t.kleuren.accent}` }} />
                            ))}
                          </span>
                        </span>
                        <span className="mt-2 block text-sm font-semibold">{t.naam}{actief ? ' ✓' : ''}</span>
                        <span className="block text-xs text-slate-500">{t.omschrijving}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <KleurVeld label="Achtergrond van de kaart" waarde={config.kleuren.achtergrond} onChange={(h) => zetKleur('achtergrond', h)} />
                <KleurVeld label="Accentkleur (titel, randjes en sterretjes)" waarde={config.kleuren.accent} onChange={(h) => zetKleur('accent', h)} />
                <KleurVeld label="Lichte kleur (popup en pagina)" waarde={config.kleuren.licht} onChange={(h) => zetKleur('licht', h)} />
                <KleurVeld label="Primaire kleur (knoppen en titels)" waarde={config.kleuren.primair} onChange={(h) => zetKleur('primair', h)} />
                <KleurVeld label="Secundaire kleur (Dag-balk en knop)" waarde={config.kleuren.secundair} onChange={(h) => zetKleur('secundair', h)} />
                <KleurVeld label="Tekstkleur in de popup" waarde={config.kleuren.tekst} onChange={(h) => zetKleur('tekst', h)} />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Kleuren van de deurtjes (ze wisselen elkaar af)</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {config.kleuren.tegels.map((t, i) => (
                    <KleurVeld key={i} label={`Deurtjeskleur ${i + 1}`} waarde={t} onChange={(h) => zetTegel(i, h)} />
                  ))}
                </div>
              </div>

              {waarschuwingen.length > 0 && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  {waarschuwingen.map((w) => <p key={w}>{w}</p>)}
                </div>
              )}

              <div className="space-y-3 border-t border-slate-200 pt-4">
                <p className="text-sm font-medium">Logo</p>
                {config.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={config.logoUrl} alt="Je logo" className="max-h-16 max-w-full rounded border border-slate-200 bg-slate-200 p-2" />
                )}
                <Veld label="Link naar je logo" hint="Plak een link die met https:// begint, of upload hieronder een bestand (png, jpg, webp of gif, max 2 MB).">
                  <input className={INPUT} value={config.logoUrl} onChange={(e) => zet('logoUrl', e.target.value.trim())} placeholder="https://" />
                </Veld>
                <div className="flex flex-wrap gap-2">
                  <UploadKnop label="Logo uploaden" onUrl={(url) => zet('logoUrl', url)} />
                  {config.logoUrl && <button type="button" onClick={() => zet('logoUrl', '')} className={KNOP}>Logo weghalen</button>}
                </div>
              </div>
            </div>
          )}

          {tab === 'Deurtjes' && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                Klik een deurtje open om de tekst aan te passen. Wil je alle teksten door Claude laten schrijven? Kijk dan bij &quot;Importeren en exporteren&quot;.
              </p>
              {voorbeeldDagen.length > 0 && (
                <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
                  {voorbeeldDagen.length === dagen.length ? 'Alle deurtjes hebben nog de voorbeeldtekst.' : `${voorbeeldDagen.length} ${voorbeeldDagen.length === 1 ? 'deurtje heeft' : 'deurtjes hebben'} nog de voorbeeldtekst.`}{' '}
                  Pas ze aan voordat je de kalender deelt.
                </p>
              )}
              {dagen.map((d, i) => (
                <details key={d.dag} className="rounded-lg border border-slate-200 bg-white">
                  <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
                    {d.dag}. {d.titel}
                    {dagDatum(i) && <span className="ml-2 text-xs font-normal text-slate-500">{dagDatum(i)}</span>}
                    {voorbeeldDagen.includes(d.dag) && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">voorbeeldtekst</span>}
                    {d.soort === 'opdracht' && <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">opdracht</span>}
                    {d.knop.aan && d.knop.url && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">knop</span>}
                  </summary>
                  <div className="space-y-3 border-t border-slate-200 p-3">
                    <Veld label="Titel"><input className={INPUT} value={d.titel} maxLength={80} onChange={(e) => wijzigDag(i, { titel: e.target.value })} /></Veld>
                    <Veld label="Soort">
                      <select className={INPUT} value={d.soort} onChange={(e) => wijzigDag(i, { soort: e.target.value as AdventDag['soort'] })}>
                        <option value="tekst">Tekst (inspiratie of weetje)</option>
                        <option value="opdracht">Opdracht (iets om te doen)</option>
                      </select>
                    </Veld>
                    <Veld label="Tekst" hint={`${d.tekst.length} van 1500 tekens`}>
                      <textarea className={INPUT} rows={4} value={d.tekst} maxLength={1500} onChange={(e) => wijzigDag(i, { tekst: e.target.value })} />
                    </Veld>
                    <Veld label="Afbeelding (optioneel)" hint="Een link die met https:// begint, of upload een bestand.">
                      <input className={INPUT} value={d.afbeelding} placeholder="https://" onChange={(e) => wijzigDag(i, { afbeelding: e.target.value.trim() })} />
                    </Veld>
                    <div className="flex flex-wrap gap-2">
                      <UploadKnop onUrl={(url) => wijzigDag(i, { afbeelding: url })} />
                      {d.afbeelding && <button type="button" onClick={() => wijzigDag(i, { afbeelding: '' })} className={KNOP}>Afbeelding weghalen</button>}
                    </div>
                    <p className="border-t border-slate-100 pt-3 text-xs text-slate-600">
                      {d.knop.aan && d.knop.url ? 'Dit deurtje heeft een knop met een link. ' : 'Een knop naar een les of pagina toevoegen? '}
                      <button type="button" onClick={() => setTab('Kennis Shop-links')} className="font-medium text-emerald-800 underline">
                        Ga naar Kennis Shop-links
                      </button>
                    </p>
                  </div>
                </details>
              ))}
            </div>
          )}

          {tab === 'Kennis Shop-links' && (
            <KnoppenTab config={config} dagen={dagen} zetInstelling={zetKnoppenInstelling} wijzigKnoppen={wijzigKnoppen} />
          )}

          {tab === 'Opties' && (
            <div className="space-y-6">
              <section className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
                <h2 className="text-sm font-bold text-amber-950">Testmodus (tijdelijk)</h2>
                <label className="mt-2 flex items-start gap-3 text-sm text-amber-950">
                  <input type="checkbox" checked={config.testmodus} onChange={(e) => zetTestmodus(e.target.checked)} className="mt-0.5 h-4 w-4" />
                  <span><strong>Testmodus aan:</strong> alle deurtjes zijn nu al te openen, ook die van latere datums.</span>
                </label>
                <p className="mt-2 text-xs text-amber-900">
                  Handig om zelf te zien wat je klanten krijgen, bijvoorbeeld in Kennis Shop of op de kalenderpagina zelf. Zolang dit aanstaat kan iedereen met de link alle deurtjes openen en alle teksten lezen.
                  Zet dit dus weer uit voordat je de kalender deelt. Standaard staat het uit. Het werkt pas nadat je op Opslaan hebt geklikt.
                </p>
              </section>

              <div className="space-y-3">
                {([
                  ['sneeuw', 'Vallende sneeuw op de achtergrond'],
                  ['sterren', 'Twinkelende sterretjes'],
                  ['confetti', 'Confetti bij het openen van het deurtje van vandaag'],
                  ['herinnering', 'Knop voor een dagelijkse herinnering in de agenda (alleen op de volledige pagina)'],
                ] as const).map(([naam, uitleg]) => (
                  <label key={naam} className="flex items-start gap-3 text-sm">
                    <input type="checkbox" checked={config.opties[naam]} onChange={(e) => zetOptie(naam, e.target.checked)} className="mt-0.5 h-4 w-4" />
                    <span>{uitleg}</span>
                  </label>
                ))}
              </div>

              <fieldset>
                <legend className="mb-1 text-sm font-medium">Deurtjes per rij in de ingebedde kalender</legend>
                <p className="mb-3 text-xs text-slate-500">
                  Dit geldt voor de kalender in Kennis Shop of op je website (de embedcode). De volledige pagina heeft altijd 4 deurtjes per rij.
                  Kies je grotere deurtjes, dan moet het iframe hoger zijn. Het tabblad Delen rekent de hoogte voor je uit.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {([6, 4] as const).map((k) => (
                    <label
                      key={k}
                      className="flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-slate-200 bg-white p-2 hover:border-slate-400 has-[:checked]:border-emerald-700 has-[:checked]:ring-2 has-[:checked]:ring-emerald-200"
                    >
                      <KolommenMini kolommen={k} kleuren={config.kleuren} />
                      <span className="flex items-start gap-2 text-sm">
                        <input
                          type="radio"
                          name="embedKolommen"
                          value={k}
                          checked={config.opties.embedKolommen === k}
                          onChange={() => zetOptie('embedKolommen', k)}
                          className="mt-1 h-4 w-4"
                        />
                        <span>
                          <span className="block font-semibold">{k === 6 ? '6 naast elkaar (compact)' : '4 naast elkaar (groter)'}</span>
                          <span className="block text-xs text-slate-500">
                            {k === 6 ? 'Past in een lager iframe, de deurtjes zijn kleiner.' : 'Grotere deurtjes, makkelijker te tikken op een telefoon.'}{' '}
                            Advies voor jouw {config.aantalDagen} deurtjes: {adviesIframeHoogte(config.aantalDagen, k)} px hoog.
                          </span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-1 text-sm font-medium">Onderkant van de kalender</legend>
                <p className="mb-3 text-xs text-slate-500">
                  Een thema kiest hier zelf een passende standaard: sneeuw valt weg op een lichte achtergrond, dus daar komen zachte heuvels. Je kunt dit altijd aanpassen.
                  Bij het winterlandschap en de zachte heuvels krijgt de kerstboom elke dag een kerstbal erbij.
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {ONDERKANT_KEUZES.map((o) => (
                    <label
                      key={o.waarde}
                      className="flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-slate-200 bg-white p-2 hover:border-slate-400 has-[:checked]:border-emerald-700 has-[:checked]:ring-2 has-[:checked]:ring-emerald-200"
                    >
                      <OnderkantMini waarde={o.waarde} kleuren={config.kleuren} />
                      <span className="flex items-start gap-2 text-sm">
                        <input
                          type="radio"
                          name="onderkant"
                          value={o.waarde}
                          checked={config.opties.landschap === o.waarde}
                          onChange={() => zetOptie('landschap', o.waarde)}
                          className="mt-1 h-4 w-4"
                        />
                        <span>
                          <span className="block font-semibold">{o.naam}</span>
                          <span className="block text-xs text-slate-500">{o.uitleg}</span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {tab === 'Delen' && (
            <DelenTab
              config={config}
              gewijzigd={gewijzigd}
              opgeslagenTestmodus={opgeslagenTestmodus}
              voorbeeldDagen={voorbeeldDagen}
              voorbeeldTitel={voorbeeldTitel}
              naarTab={setTab}
            />
          )}

          {tab === 'Importeren en exporteren' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
                <p className="font-semibold">Teksten laten schrijven door Claude</p>
                <ol className="ml-5 mt-1 list-decimal space-y-1 text-slate-700">
                  <li>Klik op &quot;Kopieer prompt&quot; en plak hem in claude.ai.</li>
                  <li>Vul de stukjes tussen [haakjes] in en laat Claude schrijven.</li>
                  <li>Kopieer het JSON-blok dat Claude teruggeeft en plak het hieronder.</li>
                  <li>Klik op &quot;Importeren&quot;, kijk in het voorbeeld en klik daarna op Opslaan.</li>
                </ol>
                <button type="button" onClick={() => kopieer(PROMPT_TEKSTEN, 'De prompt staat op je klembord. Plak hem nu in claude.ai.')} className={`${KNOP} mt-3`}>
                  Kopieer prompt
                </button>
              </div>

              <Veld label="JSON plakken of exporteren">
                <textarea
                  className={`${INPUT} font-mono`}
                  rows={12}
                  value={jsonTekst}
                  spellCheck={false}
                  onChange={(e) => setJsonTekst(e.target.value)}
                  placeholder='{ "titel": "...", "dagen": [ ... ] }'
                />
              </Veld>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={importeer} disabled={!jsonTekst.trim()} className={KNOP_PRIMAIR}>Importeren</button>
                <button type="button" onClick={() => { setJsonTekst(JSON.stringify(config, null, 2)); setImportBericht(null); }} className={KNOP}>Toon huidige instellingen</button>
                <button type="button" onClick={() => kopieer(JSON.stringify(config, null, 2), 'De instellingen staan op je klembord.')} className={KNOP}>Kopieer huidige instellingen</button>
              </div>
              {importBericht && (
                <div
                  role={importBericht.soort === 'fout' ? 'alert' : 'status'}
                  className={`rounded-lg border p-3 text-sm ${importBericht.soort === 'ok' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-red-300 bg-red-50 text-red-900'}`}
                >
                  {importBericht.regels.slice(0, 8).map((r) => <p key={r}>{r}</p>)}
                </div>
              )}
              <details className="text-sm">
                <summary className="cursor-pointer font-medium">Bekijk de prompt</summary>
                <pre className="mt-2 whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-3 text-xs">{PROMPT_TEKSTEN}</pre>
              </details>
            </div>
          )}
          </div>
        </section>

        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">Voorbeeld:</span>
            <select
              aria-label="Datum in het voorbeeld"
              className="rounded-lg border border-slate-300 bg-white px-2 py-1"
              value={previewDatum}
              onChange={(e) => setPreviewDatum(e.target.value as typeof previewDatum)}
            >
              {PREVIEW_DATA.map((p) => <option key={p.sleutel} value={p.sleutel}>{p.label}</option>)}
            </select>
            <label className="flex items-center gap-1.5">
              <input type="checkbox" checked={previewEmbed} onChange={(e) => setPreviewEmbed(e.target.checked)} />
              Zoals ingebed (Kennis Shop)
            </label>
          </div>
          <iframe
            ref={frame}
            key={previewSrc}
            src={previewSrc}
            title="Voorbeeld van je adventkalender"
            className="h-[75vh] min-h-[480px] w-full rounded-xl border border-slate-300 bg-white"
          />
        </aside>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">Adventkalender-starter, versie {versie.huidig}</p>
    </div>
  );
}
