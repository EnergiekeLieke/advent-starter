import { LETTERTYPES, lettertypeVoor, type AdventConfig, type AdventKleuren, type LandschapStijl } from '@/lib/config';

function hexNaarRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function luminantie(hex: string): number {
  const [r, g, b] = hexNaarRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const la = luminantie(a);
  const lb = luminantie(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Kiest uit de kandidaten de kleur die het best leesbaar is op de achtergrond. */
export function leesbaar(achtergrond: string, kandidaten: string[]): string {
  return kandidaten.reduce((beste, k) => (contrast(achtergrond, k) > contrast(achtergrond, beste) ? k : beste));
}

/** Tekstkleur per tegel: automatisch leesbaar, dus ook als iemand een eigen tegelkleur kiest. */
export function tegelKleuren(k: AdventKleuren): { bg: string; tekst: string }[] {
  return k.tegels.map((bg) => ({ bg, tekst: leesbaar(bg, [k.licht, k.tekst, k.accent]) }));
}

export function confettiKleuren(k: AdventKleuren): string[] {
  return [k.accent, '#f3dc8f', k.secundair, k.tegels[2], k.licht];
}

const rgb = (hex: string) => hexNaarRgb(hex).join(' ');

/** Mengt twee kleuren (aandeel 0 tot 1 van de tweede) en geeft een kant-en-klare CSS-kleur terug. */
export function meng(a: string, b: string, aandeel: number): string {
  const [ar, ag, ab] = hexNaarRgb(a);
  const [br, bg, bb] = hexNaarRgb(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * aandeel);
  return `rgb(${m(ar, br)} ${m(ag, bg)} ${m(ab, bb)})`;
}

/** Zoals `meng`, maar geeft een hex-kleur terug, zodat het resultaat opnieuw gemengd kan worden. */
function mengHex(a: string, b: string, aandeel: number): string {
  const [ar, ag, ab] = hexNaarRgb(a);
  const [br, bg, bb] = hexNaarRgb(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * aandeel).toString(16).padStart(2, '0');
  return `#${m(ar, br)}${m(ag, bg)}${m(ab, bb)}`;
}

// Een adres in een CSS-url(): aanhalingstekens en schuine strepen achterstevoren kunnen de url niet uit zijn vak laten breken
function cssUrl(adres: string): string {
  return `url("${adres.replace(/["\\\n\r]/g, (c) => encodeURIComponent(c))}")`;
}

// Een link telt pas als hij geldig is: tijdens het typen van een link (bijvoorbeeld 'h' of 'http:/') gebruiken we hem nog niet
export const isGeldigeAfbeeldingUrl = (v: string): boolean => /^https:\/\//i.test(v) || v.startsWith('/');

/** Heeft de kalender een eigen achtergrondafbeelding? Dan vervangt die de achtergrondkleur en de onderkant. */
export function heeftAchtergrondAfbeelding(opties: AdventConfig['opties']): boolean {
  return isGeldigeAfbeeldingUrl(opties.achtergrondAfbeelding) || isGeldigeAfbeeldingUrl(opties.achtergrondAfbeeldingMobiel);
}

/** Heeft elk geopend deurtje een eigen achtergrondafbeelding? */
export function heeftPopupAchtergrond(opties: AdventConfig['opties']): boolean {
  return isGeldigeAfbeeldingUrl(opties.popupAchtergrond);
}

function achtergrondVariabelen(config: AdventConfig): Record<string, string> {
  const { achtergrondAfbeelding: pc, achtergrondAfbeeldingMobiel: mob, achtergrondTekst, achtergrondLaag } = config.opties;
  if (!heeftAchtergrondAfbeelding(config.opties)) return {};
  return {
    ...(isGeldigeAfbeeldingUrl(pc) ? { '--adv-bg-pc': cssUrl(pc) } : {}),
    ...(isGeldigeAfbeeldingUrl(mob) ? { '--adv-bg-mob': cssUrl(mob) } : {}),
    '--adv-laag-kleur': achtergrondTekst === 'donker' ? '255 255 255' : '0 0 0',
    '--adv-laag': String(achtergrondLaag / 100),
  };
}

// Een eigen afbeelding achter de tekst in elk geopend deurtje. Bij lichte tekst ligt er een donkere laag over, bij donkere tekst een lichte.
function popupVariabelen(config: AdventConfig): Record<string, string> {
  const { popupAchtergrond, popupAchtergrondTekst, popupAchtergrondLaag } = config.opties;
  if (!heeftPopupAchtergrond(config.opties)) return {};
  return {
    '--adv-popup-bg': cssUrl(popupAchtergrond),
    // Terwijl de afbeelding laadt (of niet laadt) staat de tekst op een kleur die erbij past: lichte tekst op donker, donkere tekst op licht
    '--adv-popup-reserve': rgb(popupAchtergrondTekst === 'licht' ? config.kleuren.achtergrond : config.kleuren.licht),
    '--adv-popup-laag-kleur': popupAchtergrondTekst === 'licht' ? '0 0 0' : '255 255 255',
    '--adv-popup-laag': String(popupAchtergrondLaag / 100),
    '--adv-popup-tekst': rgb(config.kleuren.licht),
  };
}

/** CSS-variabelen die de kalender gebruikt (zie tailwind.config.ts en globals.css). */
export function cssVariabelen(config: AdventConfig): Record<string, string> {
  const k = config.kleuren;
  const metAfbeelding = heeftAchtergrondAfbeelding(config.opties);
  // Met een eigen achtergrondafbeelding bepaalt de keuze licht of donker de tekstkleuren, want de kleur van de kaart zie je dan niet meer
  const lichteAchtergrond = metAfbeelding ? config.opties.achtergrondTekst === 'donker' : luminantie(k.achtergrond) > 0.5;
  return {
    ...achtergrondVariabelen(config),
    ...popupVariabelen(config),
    // Met een afbeelding is dit de kleur terwijl de afbeelding laadt (of niet laadt): passend bij de gekozen tekstkleur, anders is de tekst niet te lezen
    '--adv-nacht': rgb(metAfbeelding && config.opties.achtergrondTekst === 'donker' ? k.licht : k.achtergrond),
    '--adv-goud': rgb(k.accent),
    '--adv-goud-donker': meng(k.accent, '#000000', lichteAchtergrond ? 0.4 : 0.25),
    '--adv-goud-licht': lichteAchtergrond ? meng(k.accent, '#000000', 0.12) : meng(k.accent, '#ffffff', 0.45),
    // Binnenkant van een geopend deurtje: van licht in het midden naar de accentkleur aan de rand (zachter bij een lichte achtergrond)
    '--adv-binnen-1': meng(k.accent, '#ffffff', lichteAchtergrond ? 0.88 : 0.75),
    '--adv-binnen-2': meng(k.accent, '#ffffff', lichteAchtergrond ? 0.62 : 0.38),
    '--adv-binnen-3': meng(k.accent, '#ffffff', lichteAchtergrond ? 0.35 : 0),
    '--adv-licht': rgb(k.licht),
    '--adv-primair': rgb(k.primair),
    '--adv-secundair': rgb(k.secundair),
    '--adv-inkt': rgb(k.tekst),
    '--adv-opach': metAfbeelding ? rgb(config.opties.achtergrondTekst === 'donker' ? k.tekst : k.licht) : rgb(leesbaar(k.achtergrond, [k.licht, k.tekst])),
    '--adv-oppri': rgb(leesbaar(k.primair, [k.licht, k.tekst])),
    '--adv-opsec': rgb(leesbaar(k.secundair, [k.licht, k.tekst])),
    '--adv-titel-schaal': String(config.titelGrootte / 100),
    '--adv-font-titel': LETTERTYPES[lettertypeVoor(config, 'titel')].stack,
    '--adv-font-onder': LETTERTYPES[lettertypeVoor(config, 'ondertitel')].stack,
    '--adv-font-deur': LETTERTYPES[lettertypeVoor(config, 'deurtjes')].stack,
    '--adv-font-popkop': LETTERTYPES[lettertypeVoor(config, 'popupKop')].stack,
    '--adv-font-poptekst': LETTERTYPES[lettertypeVoor(config, 'popupTekst')].stack,
  };
}

// ─── Onderkant van de kalender ────────────────────────────────
/** Kleuren van de huisjes in het dorp. `sleutel` zegt welke huisstijlkleur erin zit (voor het oplichten in de editor). */
export interface DorpKleuren {
  muren: { kleur: string; sleutel: string }[];
  dak: string; dakSleutel: string;
  deur: string;
  raam: string;
}

export interface LandschapPalet {
  heuvelVer: string; heuvelVerOpac: number;
  bosVer: string; bosVerOpac: number;
  heuvelMidden: string; heuvelMiddenOpac: number;
  heuvelVoor1: string; heuvelVoor1Opac: number;
  heuvelVoor2: string; heuvelVoor2Opac: number;
  huisMuur: string; huisSchoorsteen: string; huisDak: string; huisSneeuw: string; huisDeur: string;
  rook: string; rookOpac: number;
  den: [string, string, string]; denStam: string; denSneeuw: string; denSneeuwOpac: number;
  dorp: DorpKleuren;
}

// Het winterlandschap met sneeuw (voor donkere achtergronden)
const WINTER_PALET: LandschapPalet = {
  heuvelVer: '#9bb0a5', heuvelVerOpac: 0.22,
  bosVer: '#17301e', bosVerOpac: 0.8,
  heuvelMidden: '#cfdad3', heuvelMiddenOpac: 0.5,
  heuvelVoor1: '#eef3ee', heuvelVoor1Opac: 0.92,
  heuvelVoor2: '#d7e3e6', heuvelVoor2Opac: 0.8,
  huisMuur: '#8f3b22', huisSchoorsteen: '#5a2a1a', huisDak: '#2a3a3c', huisSneeuw: '#f4f7f1', huisDeur: '#4a2a1a',
  rook: '#f4f7f1', rookOpac: 0.5,
  den: ['#2a4d33', '#2e5638', '#336040'], denStam: '#4a3322', denSneeuw: '#f0f5f0', denSneeuwOpac: 0.85,
  // Het dorp bestaat niet in het winterlandschap, dit is alleen om het type compleet te houden
  dorp: { muren: [{ kleur: '#8f3b22', sleutel: 'vast' }, { kleur: '#5a2a1a', sleutel: 'vast' }, { kleur: '#4a2a1a', sleutel: 'vast' }], dak: '#2a3a3c', dakSleutel: 'vast', deur: '#4a2a1a', raam: '#ffd877' },
};

/** Maakt een kleur lichter (op een donkere achtergrond) of donkerder (op een lichte) tot hij er genoeg tegen afsteekt. */
function metContrast(kleur: string, achtergrond: string, minimaal: number): string {
  const richting = luminantie(achtergrond) < 0.3 ? '#ffffff' : '#000000';
  for (let t = 0; t <= 1; t += 0.05) {
    const kandidaat = mengHex(kleur, richting, t);
    if (contrast(kandidaat, achtergrond) >= minimaal) return kandidaat;
  }
  return richting;
}

/**
 * Kleuren van de huisjes uit de huisstijl, met voldoende contrast tegen de achtergrond.
 * Op een donkere achtergrond krijgen de huisjes lichtere muren en een licht (besneeuwd) dak, zodat de lichtjes in de ramen opvallen.
 * Op een lichte achtergrond krijgen ze donkere muren en een donker dak.
 */
function dorpKleuren(k: AdventKleuren): DorpKleuren {
  const bg = k.achtergrond;
  const donker = luminantie(bg) < 0.3;
  const raam = '#ffd877';
  if (donker) {
    const muren = [
      { kleur: metContrast(k.secundair, bg, 3.4), sleutel: 'secundair' },
      { kleur: metContrast(mengHex(k.primair, k.licht, 0.2), bg, 3.4), sleutel: 'primair licht' },
      { kleur: metContrast(mengHex(k.accent, k.secundair, 0.4), bg, 3.4), sleutel: 'accent secundair' },
    ];
    return { muren, dak: mengHex(k.licht, bg, 0.12), dakSleutel: 'licht achtergrond', deur: mengHex(muren[0].kleur, '#000000', 0.45), raam };
  }
  const muren = [
    { kleur: metContrast(k.secundair, bg, 3.4), sleutel: 'secundair' },
    { kleur: metContrast(k.primair, bg, 3.4), sleutel: 'primair' },
    { kleur: metContrast(mengHex(k.secundair, k.primair, 0.5), bg, 3.4), sleutel: 'secundair primair' },
  ];
  return { muren, dak: mengHex(k.primair, '#000000', 0.5), dakSleutel: 'primair', deur: mengHex(muren[0].kleur, '#000000', 0.45), raam };
}

/** Kleuren van de onderkant. 'heuvels' en 'golven' gebruiken de kleuren van het thema in plaats van sneeuw. */
export function landschapPalet(stijl: LandschapStijl, k: AdventKleuren): LandschapPalet {
  if (stijl === 'winter') return WINTER_PALET;
  const bg = k.achtergrond;
  const groen = k.primair;
  // De heuvels volgen het thema, niet de kleur die iemand aan één deurtje geeft: een roze deurtje mag geen roze gras maken.
  // Deze mix komt bij de standaardthema's dicht in de buurt van de derde tegelkleur.
  const zacht = mengHex(k.primair, k.licht, 0.35);
  return {
    heuvelVer: meng(bg, groen, 0.14), heuvelVerOpac: 1,
    bosVer: meng(bg, groen, 0.42), bosVerOpac: 1,
    heuvelMidden: meng(bg, zacht, 0.4), heuvelMiddenOpac: 1,
    heuvelVoor1: meng(bg, zacht, 0.7), heuvelVoor1Opac: 1,
    heuvelVoor2: meng(bg, groen, 0.55), heuvelVoor2Opac: 1,
    huisMuur: k.secundair,
    huisSchoorsteen: meng(k.secundair, '#000000', 0.35),
    huisDak: meng(groen, '#000000', 0.3),
    huisSneeuw: k.licht,
    huisDeur: meng(k.secundair, '#000000', 0.5),
    rook: meng(bg, '#000000', 0.18), rookOpac: 0.55,
    den: [meng(groen, '#000000', 0.2), groen, meng(groen, '#ffffff', 0.14)],
    denStam: meng(groen, '#000000', 0.5), denSneeuw: k.licht, denSneeuwOpac: 0,
    dorp: dorpKleuren(k),
  };
}
