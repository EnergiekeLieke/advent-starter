'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Confetti from '@/components/Confetti';
import AdventIcoon from '@/components/AdventIcoon';
import { Landschap, Sneeuw, STERREN, Strik } from '@/components/AdventDecor';
import { dagenVoor, type AdventConfig } from '@/lib/config';
import { confettiKleuren, cssVariabelen, landschapPalet, tegelKleuren } from '@/lib/kleur';
import { isoVan, labelKort, labelLang, parseIso, plusDagen, verschilInDagen, type Datum } from '@/lib/datum';

type Fase = 'voor' | 'bezig' | 'na';

const SPATTERS = [
  { x: 22, y: 30, s: 14, d: 0 }, { x: 74, y: 22, s: 18, d: 0.15 }, { x: 14, y: 62, s: 10, d: 0.3 },
  { x: 84, y: 58, s: 12, d: 0.1 }, { x: 40, y: 8, s: 12, d: 0.4 }, { x: 62, y: 70, s: 10, d: 0.25 },
];

// Agenda-herinnering: elke ochtend om 8:00 een afspraak met de link naar de kalender
function downloadHerinnering(titel: string, start: Datum, aantal: number, vanafDag: number) {
  const link = `${window.location.origin}${window.location.pathname}`;
  const stempel = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const events: string[] = [];
  for (let dag = vanafDag; dag <= aantal; dag++) {
    const iso = isoVan(plusDagen(start, dag - 1));
    events.push([
      'BEGIN:VEVENT',
      `UID:advent-${start.jaar}-${dag}@advent-starter`,
      `DTSTAMP:${stempel}`,
      `DTSTART:${iso}T080000`,
      `DTEND:${iso}T081500`,
      `SUMMARY:${titel}: open vandaag deurtje ${dag}`,
      `DESCRIPTION:Tijd voor je deurtje van vandaag! ${link}`,
      `URL:${link}`,
      'END:VEVENT',
    ].join('\r\n'));
  }
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AdventStarter//Adventkalender//NL', ...events, 'END:VCALENDAR'].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'adventkalender-herinnering.ics';
  a.click();
  URL.revokeObjectURL(url);
}

function Slot() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z" />
    </svg>
  );
}

const KNOP_PILL = 'rounded-full border border-goud/70 text-opach text-xs sm:text-sm px-4 py-2 hover:bg-goud/20 transition-colors focus-visible:outline-goud';

// Het deel van de pagina dat de bezoeker op dit moment ziet, in pixels vanaf de bovenkant van de pagina
interface Zicht { top: number; hoogte: number }

interface Props {
  config: AdventConfig;
  /** De datum waarop de kalender wordt bekeken, bepaald door de server */
  datum: Datum;
  /** Ingebed in een iframe (bijvoorbeeld in Kennis Shop): dezelfde kalender, maar met een doorzichtige achtergrond en weinig marge eromheen */
  embed?: boolean;
  /** Voorbeeld in de editor: geen automatische popup en confetti bij het openen */
  preview?: boolean;
}

export default function Adventkalender({ config, datum, embed = false, preview = false }: Props) {
  const [beweging, setBeweging] = useState(true);
  const [verledenOpen, setVerledenOpen] = useState(false);
  const [vandaagOpen, setVandaagOpen] = useState(false);
  const [confettiKeys, setConfettiKeys] = useState<number[]>([]);
  const [actief, setActief] = useState<number | null>(null);
  const [wiebelDag, setWiebelDag] = useState<number | null>(null);
  const [melding, setMelding] = useState('');
  const [zicht, setZicht] = useState<Zicht | null>(null);
  const zichtRef = useRef<HTMLDivElement>(null);
  const sluitRef = useRef<HTMLButtonElement>(null);
  const dialoogRef = useRef<HTMLDivElement>(null);
  const vorigeActief = useRef<number | null>(null);
  const meldingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gepusht = useRef(false);
  const swipeStart = useRef<number | null>(null);
  const confettiTeller = useRef(0);

  const { opties } = config;
  const aantal = config.aantalDagen;
  const dagen = useMemo(() => dagenVoor(config), [config]);
  const start = useMemo(() => parseIso(config.startDatum) ?? datum, [config.startDatum, datum]);
  const tegels = useMemo(() => tegelKleuren(config.kleuren), [config.kleuren]);
  const confettiSet = useMemo(() => confettiKleuren(config.kleuren), [config.kleuren]);
  const onderkant = opties.landschap;
  const heeftOnderkant = onderkant !== 'geen';
  // Alleen het winterlandschap en de zachte heuvels hebben de kerstboom waar elke dag een bal bij komt
  const heeftBoom = onderkant === 'winter' || onderkant === 'heuvels';
  const palet = useMemo(() => landschapPalet(onderkant === 'geen' ? 'winter' : onderkant, config.kleuren), [onderkant, config.kleuren]);
  const ballen = useMemo(() => [config.kleuren.accent, '#b8421f', config.kleuren.licht, config.kleuren.tegels[2]], [config.kleuren]);
  const variabelen = useMemo(() => cssVariabelen(config) as React.CSSProperties, [config]);

  // In een iframe moet de pagina doorzichtig zijn, zodat de kaart op elke achtergrond past
  useEffect(() => {
    if (!embed) return;
    const delen = [document.documentElement, document.body];
    const vorige = delen.map((el) => el.style.background);
    delen.forEach((el) => { el.style.background = 'transparent'; });
    return () => delen.forEach((el, i) => { el.style.background = vorige[i]; });
  }, [embed]);

  useEffect(() => {
    setBeweging(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    return () => { if (meldingTimer.current) clearTimeout(meldingTimer.current); };
  }, []);

  const verschil = verschilInDagen(start, datum);
  const echteFase: Fase = verschil < 0 ? 'voor' : verschil >= aantal ? 'na' : 'bezig';
  const testmodus = config.testmodus;
  // In testmodus gedraagt de kalender zich alsof alle dagen al voorbij zijn: alle deurtjes zijn open
  const fase: Fase = testmodus ? 'na' : echteFase;
  const vandaag = fase === 'bezig' ? verschil + 1 : 0;

  const toegankelijk = useCallback(
    (dag: number) => fase === 'na' || (fase === 'bezig' && dag <= vandaag),
    [fase, vandaag],
  );

  const isOpen = useCallback(
    (dag: number) => toegankelijk(dag) && (dag === vandaag ? vandaagOpen : verledenOpen),
    [toegankelijk, vandaag, vandaagOpen, verledenOpen],
  );

  const confetti = useCallback(() => {
    if (!opties.confetti) return;
    confettiTeller.current += 1;
    setConfettiKeys((k) => [...k, confettiTeller.current]);
  }, [opties.confetti]);

  // Ingebed in een hoog iframe: welk stuk van het iframe ziet de bezoeker nu? De browser vertelt dat via een
  // IntersectionObserver, ook als de kalender op een ander domein staat dan de pagina eromheen. Dan zetten we de popup
  // in dat zichtbare stuk, in plaats van in het midden van het hele (hoge) iframe waar hij buiten beeld kan vallen.
  const meetZichtbaar = useCallback(
    () => new Promise<Zicht | null>((klaar) => {
      const doel = zichtRef.current;
      if (!doel || typeof IntersectionObserver === 'undefined') return klaar(null);
      const timer = setTimeout(() => { waarnemer.disconnect(); klaar(null); }, 400);
      const waarnemer = new IntersectionObserver((metingen) => {
        clearTimeout(timer);
        waarnemer.disconnect();
        const r = metingen[0]?.intersectionRect;
        klaar(r && r.height > 120 ? { top: r.top + window.scrollY, hoogte: r.height } : null);
      });
      waarnemer.observe(doel);
    }),
    [],
  );

  // Popup openen en sluiten via de terugknop van de telefoon.
  // Vanzelf openen (het deurtje van vandaag) doen we ingebed alleen als de bezoeker het iframe ook echt ziet.
  const openDag = useCallback(async (dag: number, automatisch = false) => {
    if (embed) {
      const zichtbaar = await meetZichtbaar();
      if (automatisch && !zichtbaar) return;
      setZicht(zichtbaar);
    }
    if (!gepusht.current) {
      window.history.pushState({ adv: true }, '');
      gepusht.current = true;
    }
    setActief(dag);
  }, [embed, meetZichtbaar]);

  const sluit = useCallback(() => {
    if (gepusht.current) {
      gepusht.current = false;
      window.history.back();
    } else {
      setActief(null);
    }
  }, []);

  useEffect(() => {
    const opTerug = () => { gepusht.current = false; setActief(null); };
    window.addEventListener('popstate', opTerug);
    return () => window.removeEventListener('popstate', opTerug);
  }, []);

  // Na het sluiten van de popup keert de focus terug naar het deurtje dat je het laatst bekeek
  useEffect(() => {
    if (actief === null && vorigeActief.current !== null) {
      document.querySelector<HTMLButtonElement>(`#adv-dag-${vorigeActief.current} button`)?.focus({ preventScroll: true });
    }
    vorigeActief.current = actief;
  }, [actief]);

  useEffect(() => {
    if (!fase || fase === 'voor') return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setVerledenOpen(true), 150));
    if (fase === 'bezig') {
      const wacht = beweging ? 900 : 0;
      timers.push(setTimeout(() => {
        setVandaagOpen(true);
        if (beweging && !preview) confetti();
      }, wacht));
      if (!preview) timers.push(setTimeout(() => openDag(vandaag, true), wacht + (beweging ? 800 : 200)));
    }
    return () => timers.forEach(clearTimeout);
  }, [fase, vandaag, beweging, preview, confetti, openDag]);

  // Popup: scrollen vergrendelen, toetsen, finale op de laatste dag
  useEffect(() => {
    if (actief === null) return;
    sluitRef.current?.focus();
    const vorige = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const opToets = (e: KeyboardEvent) => {
      if (e.key === 'Escape') sluit();
      // Tab blijft binnen de popup, zodat je niet per ongeluk achter de popup terechtkomt
      if (e.key === 'Tab') {
        const knoppen = dialoogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
        if (!knoppen || knoppen.length === 0) return;
        const eerste = knoppen[0];
        const laatste = knoppen[knoppen.length - 1];
        const binnen = dialoogRef.current?.contains(document.activeElement);
        if (!binnen || (e.shiftKey && document.activeElement === eerste)) {
          e.preventDefault();
          (binnen ? laatste : eerste).focus();
        } else if (!e.shiftKey && document.activeElement === laatste) {
          e.preventDefault();
          eerste.focus();
        }
      }
      if (e.key === 'ArrowLeft' && actief > 1 && toegankelijk(actief - 1)) setActief(actief - 1);
      if (e.key === 'ArrowRight' && actief < aantal && toegankelijk(actief + 1)) setActief(actief + 1);
    };
    window.addEventListener('keydown', opToets);

    const timers: ReturnType<typeof setTimeout>[] = [];
    if (actief === aantal && beweging) {
      confetti();
      timers.push(setTimeout(confetti, 1100), setTimeout(confetti, 2200));
    }

    return () => {
      document.body.style.overflow = vorige;
      window.removeEventListener('keydown', opToets);
      timers.forEach(clearTimeout);
    };
  }, [actief, aantal, sluit, toegankelijk, beweging, confetti]);

  function klik(dag: number) {
    if (toegankelijk(dag)) {
      openDag(dag);
      return;
    }
    setWiebelDag(dag);
    setMelding(
      fase === 'bezig' && dag === vandaag + 1
        ? 'Psst, morgen gaat dit deurtje open.'
        : `Nog even geduld, dit deurtje gaat open op ${labelLang(plusDagen(start, dag - 1))}.`,
    );
    if (meldingTimer.current) clearTimeout(meldingTimer.current);
    meldingTimer.current = setTimeout(() => { setWiebelDag(null); setMelding(''); }, 3000);
  }

  function naarVandaag() {
    document.getElementById(`adv-dag-${vandaag}`)?.scrollIntoView({ behavior: beweging ? 'smooth' : 'auto', block: 'center' });
  }

  function opSwipeEinde(x: number) {
    if (swipeStart.current === null || actief === null) return;
    const verschilX = x - swipeStart.current;
    swipeStart.current = null;
    if (verschilX > 60 && actief > 1 && toegankelijk(actief - 1)) setActief(actief - 1);
    if (verschilX < -60 && actief < aantal && toegankelijk(actief + 1)) setActief(actief + 1);
  }

  const inhoud = actief !== null ? dagen[actief - 1] : null;
  const aantalOpen = dagen.filter(({ dag }) => isOpen(dag)).length;
  const sterAan = fase === 'na' || (vandaag === aantal && vandaagOpen);
  const opdracht = inhoud?.soort === 'opdracht';
  const dagenTotStart = -verschil;

  // Het raster heeft 4 kolommen (minder bij een kleine kalender)
  const kolommen = Math.min(4, aantal);
  const heeftKnop = Boolean(inhoud?.knop.aan && inhoud.knop.url);
  // Zelfde venster: in een iframe (Kennis Shop) navigeert dan de hele pagina naar de les
  const knopDoel = config.knoppen.openen === 'zelfde' ? '_top' : '_blank';

  return (
    // Ingebed krijgt de kalender geen paginakleur en geen vaste minimale hoogte, zodat alleen de kaart zichtbaar is
    <div style={variabelen} className={embed ? 'relative p-2' : 'min-h-screen bg-licht px-3 sm:px-4 py-6'}>
      {embed && <div ref={zichtRef} aria-hidden className="pointer-events-none absolute inset-0" />}
      {confettiKeys.map((k) => <Confetti key={k} kleuren={confettiSet} />)}

      <div className="max-w-3xl mx-auto">
      <div
        className={`relative overflow-hidden bg-nacht border-2 border-goud/60 shadow-xl rounded-3xl px-3 sm:px-10 pt-8 ${heeftOnderkant ? 'pb-36' : 'pb-8'}`}
      >
        {opties.sneeuw && <Sneeuw />}
        {opties.sterren && STERREN.map((s, i) => (
          <span
            key={i}
            aria-hidden
            className="adv-twinkel absolute text-goud pointer-events-none"
            style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.s, animationDelay: `${s.d}s` }}
          >
            ✦
          </span>
        ))}

        <header className="relative text-center mb-6">
          {testmodus && (
            <div className="mb-3">
              <span className="inline-block rounded-full bg-amber-300 px-3 py-1 text-xs font-semibold text-amber-950">
                Testmodus: alle deurtjes staan open
              </span>
            </div>
          )}
          {config.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.logoUrl}
              alt=""
              className="mx-auto mb-3 w-auto max-w-full object-contain max-h-16 sm:max-h-20"
            />
          )}
          <h1 className="adv-goudtekst font-kop font-bold leading-tight text-3xl sm:text-5xl">
            {config.titel}
          </h1>
          {config.ondertitel && (
            <p className="mt-2 text-xs sm:text-sm tracking-[0.25em] uppercase text-opach/80">
              {config.ondertitel}
            </p>
          )}
          {fase === 'voor' && (
            <p className="mt-4 text-opach text-sm sm:text-base">
              Nog {dagenTotStart} {dagenTotStart === 1 ? 'dag' : 'dagen'} tot het eerste deurtje opengaat.
            </p>
          )}
          {fase !== 'na' && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {fase === 'bezig' && (
                <button type="button" onClick={naarVandaag} className={KNOP_PILL}>Spring naar vandaag</button>
              )}
              {opties.herinnering && (
                <button type="button" onClick={() => downloadHerinnering(config.titel, start, aantal, fase === 'bezig' ? vandaag : 1)} className={KNOP_PILL}>
                  Dagelijkse herinnering in je agenda
                </button>
              )}
            </div>
          )}
        </header>

        <ol
          className="relative grid list-none p-0 m-0 gap-2 sm:gap-4"
          style={{ gridTemplateColumns: `repeat(${kolommen}, minmax(0, 1fr))` }}
        >
          {dagen.map(({ dag }) => {
            // Kleurpatroon per rasterbreedte: geen twee gelijke kleuren naast of onder elkaar
            const t = tegels[(dag - 1 + Math.floor((dag - 1) / kolommen)) % tegels.length];
            const isVandaag = dag === vandaag;
            const open = isOpen(dag);
            const dicht = !toegankelijk(dag);
            const datumLabel = labelKort(plusDagen(start, dag - 1));
            return (
              <li key={dag} id={`adv-dag-${dag}`}>
                <div className={`adv-scene relative aspect-square ${wiebelDag === dag ? 'adv-wiebel' : ''}`}>
                  <button
                    type="button"
                    onClick={() => klik(dag)}
                    aria-label={`Dag ${dag}, ${dicht ? 'nog dicht' : 'open'}`}
                    aria-disabled={dicht}
                    className={`absolute inset-0 block w-full rounded-xl focus-visible:outline-goud ${isVandaag ? 'adv-puls' : ''} ${dicht ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {/* Binnenkant: warm goudglanzend, zodat open nooit op een dichte deur lijkt */}
                    <span className="adv-binnen absolute inset-0 rounded-xl border-2 border-goud flex flex-col items-center justify-center text-primair">
                      <AdventIcoon nr={dag - 1} className={`${dicht ? 'invisible ' : ''}w-9 h-9 sm:w-12 sm:h-12`} />
                      <span className={`${dicht ? 'invisible ' : ''}mt-0.5 sm:mt-1 font-kop font-bold text-[9px] sm:text-xs ${isVandaag ? 'text-secundair' : ''}`}>
                        {isVandaag ? 'Vandaag' : datumLabel}
                      </span>
                    </span>
                    <span
                      className={`adv-deur ${open ? 'is-open' : ''} ${isVandaag && !open ? 'adv-glans' : ''} absolute inset-0 block rounded-xl border border-goud/80 shadow-md`}
                      style={{
                        backgroundColor: t.bg,
                        color: t.tekst,
                        transitionDelay: beweging && !isVandaag && open ? `${dag * 40}ms` : '0ms',
                      }}
                    >
                      <span className="absolute inset-1 sm:inset-1.5 rounded-lg border border-goud/40 pointer-events-none" />
                      <span className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-kop font-bold leading-none text-2xl sm:text-4xl">{dag}</span>
                        <AdventIcoon nr={dag - 1} className="mt-1 w-5 h-5 sm:w-6 sm:h-6" />
                      </span>
                      {isVandaag && <Strik accent={config.kleuren.accent} />}
                      {dicht && (
                        <span className="absolute bottom-1 right-1.5 sm:bottom-1.5 sm:right-2 opacity-70 scale-75 sm:scale-100 origin-bottom-right"><Slot /></span>
                      )}
                    </span>
                  </button>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="relative text-center mt-6 min-h-[3.5rem]" aria-live="polite">
          {melding ? (
            <p className="text-goud text-sm sm:text-base">{melding}</p>
          ) : fase === 'na' && config.afsluiting ? (
            <p className="text-opach text-sm sm:text-base">Alle deurtjes zijn open. {config.afsluiting}</p>
          ) : config.footer ? (
            <p className="text-opach/80 text-sm sm:text-base font-kop italic">
              {config.footer}
              <span className="block text-goud text-lg mt-1" aria-hidden>♥</span>
            </p>
          ) : null}
        </div>

        <p className="relative mt-3 text-center text-xs sm:text-sm text-opach/80" aria-live="polite">
          {!heeftBoom
            ? `${aantalOpen} van de ${aantal} deurtjes zijn open.`
            : aantalOpen === 0
              ? 'De boom is nog kaal. Elke dag komt er een kerstbal bij.'
              : aantalOpen === aantal
                ? `Alle ${aantal} kerstballen hangen in de boom, de ster straalt!`
                : `${aantalOpen} van de ${aantal} kerstballen hangen al in de boom.`}
        </p>

        {onderkant !== 'geen' && (
          <>
            <Landschap compact stijl={onderkant} palet={palet} hangt={isOpen} sterAan={sterAan} aantal={aantal} accent={config.kleuren.accent} ballen={ballen} />
            <Landschap compact={false} stijl={onderkant} palet={palet} hangt={isOpen} sterAan={sterAan} aantal={aantal} accent={config.kleuren.accent} ballen={ballen} />
          </>
        )}
      </div>
      </div>

      {inhoud && (
        <div
          className={embed && zicht ? 'absolute inset-0 z-40 bg-black/60' : 'fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4'}
          onClick={sluit}
        >
          {/* Ingebed staat de popup in het stuk van het iframe dat de bezoeker ziet */}
          <div
            className={embed && zicht ? 'absolute inset-x-0 flex items-center justify-center p-4' : 'contents'}
            style={embed && zicht ? { top: zicht.top, height: zicht.hoogte } : undefined}
          >
          <div
            ref={dialoogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Dag ${inhoud.dag}`}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => { swipeStart.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => opSwipeEinde(e.changedTouches[0].clientX)}
            style={embed && zicht ? { maxHeight: Math.max(240, zicht.hoogte - 32) } : undefined}
            className={`adv-popup relative w-full max-w-md ${embed && zicht ? '' : 'max-h-[85vh]'} overflow-y-auto rounded-3xl bg-licht border-4 shadow-2xl text-center ${opdracht ? 'border-primair' : 'border-goud'}`}
          >
            <div className={`border-b-2 border-goud py-2 text-xs tracking-[0.25em] uppercase ${opdracht ? 'bg-primair text-oppri' : 'bg-secundair text-opsec'}`}>
              ✦ {opdracht ? 'Opdracht' : 'Dag'} {inhoud.dag} van {aantal} ✦
            </div>
            <button
              ref={sluitRef}
              type="button"
              onClick={sluit}
              aria-label="Sluiten"
              className={`absolute right-0 top-0 flex h-11 w-11 items-start justify-center pt-1 text-2xl leading-none opacity-90 hover:text-goud ${opdracht ? 'text-oppri' : 'text-opsec'}`}
            >
              ×
            </button>

            <div key={inhoud.dag} className="relative px-6 sm:px-8 pt-6 pb-4">
              {SPATTERS.map((s, i) => (
                <span
                  key={i}
                  aria-hidden
                  className="adv-spat absolute text-goud pointer-events-none"
                  style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.s, animationDelay: `${s.d}s` }}
                >
                  ✦
                </span>
              ))}
              <div className="adv-tekst">
                <div className="adv-medaillon mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-goud text-secundair">
                  <AdventIcoon nr={inhoud.dag - 1} className="h-11 w-11" />
                </div>
                <h2 className="font-kop text-2xl font-bold text-primair mt-4">{inhoud.titel}</h2>
                {inhoud.tekst && <p className="mt-3 text-inkt leading-relaxed whitespace-pre-line">{inhoud.tekst}</p>}
                {inhoud.afbeelding && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={inhoud.afbeelding} alt="" className="mt-4 mx-auto max-h-56 w-auto max-w-full rounded-xl object-cover" />
                )}
                {heeftKnop && (
                  <a
                    href={inhoud.knop.url}
                    target={knopDoel}
                    rel={knopDoel === '_blank' ? 'noopener noreferrer' : 'noopener'}
                    className="mt-5 inline-block rounded-full bg-secundair text-opsec px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    {inhoud.knop.label || config.knoppen.standaardLabel}
                  </a>
                )}
                {inhoud.dag === aantal && config.afsluiting && (
                  <p className="mt-5 font-kop italic text-secundair text-lg">
                    ✦ {config.afsluiting} ✦
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-4 pb-5">
              <button
                type="button"
                onClick={() => setActief(inhoud.dag - 1)}
                disabled={inhoud.dag <= 1 || !toegankelijk(inhoud.dag - 1)}
                aria-label="Vorige dag"
                className="rounded-full border border-goud px-4 py-2 text-sm text-primair disabled:opacity-30 hover:bg-goud/20"
              >
                ‹ {inhoud.dag - 1 >= 1 ? inhoud.dag - 1 : ''}
              </button>
              <button
                type="button"
                onClick={sluit}
                className="rounded-full bg-primair text-oppri px-6 py-2 text-sm font-semibold hover:bg-secundair hover:text-opsec transition-colors"
              >
                Sluiten
              </button>
              <button
                type="button"
                onClick={() => setActief(inhoud.dag + 1)}
                disabled={inhoud.dag >= aantal || !toegankelijk(inhoud.dag + 1)}
                aria-label="Volgende dag"
                className="rounded-full border border-goud px-4 py-2 text-sm text-primair disabled:opacity-30 hover:bg-goud/20"
              >
                {inhoud.dag + 1 <= aantal ? inhoud.dag + 1 : ''} ›
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
