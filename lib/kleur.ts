import { LETTERTYPES, type AdventConfig, type AdventKleuren, type LandschapStijl } from '@/lib/config';

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

/** CSS-variabelen die de kalender gebruikt (zie tailwind.config.ts en globals.css). */
export function cssVariabelen(config: AdventConfig): Record<string, string> {
  const k = config.kleuren;
  const lichteAchtergrond = luminantie(k.achtergrond) > 0.5;
  return {
    '--adv-nacht': rgb(k.achtergrond),
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
    '--adv-opach': rgb(leesbaar(k.achtergrond, [k.licht, k.tekst])),
    '--adv-oppri': rgb(leesbaar(k.primair, [k.licht, k.tekst])),
    '--adv-opsec': rgb(leesbaar(k.secundair, [k.licht, k.tekst])),
    '--adv-font-kop': LETTERTYPES[config.lettertype].stack,
  };
}

// ─── Onderkant van de kalender ────────────────────────────────
export interface LandschapPalet {
  heuvelVer: string; heuvelVerOpac: number;
  bosVer: string; bosVerOpac: number;
  heuvelMidden: string; heuvelMiddenOpac: number;
  heuvelVoor1: string; heuvelVoor1Opac: number;
  heuvelVoor2: string; heuvelVoor2Opac: number;
  huisMuur: string; huisSchoorsteen: string; huisDak: string; huisSneeuw: string; huisDeur: string;
  rook: string; rookOpac: number;
  den: [string, string, string]; denStam: string; denSneeuw: string; denSneeuwOpac: number;
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
};

/** Kleuren van de onderkant. 'heuvels' en 'golven' gebruiken de kleuren van het thema in plaats van sneeuw. */
export function landschapPalet(stijl: LandschapStijl, k: AdventKleuren): LandschapPalet {
  if (stijl === 'winter') return WINTER_PALET;
  const bg = k.achtergrond;
  const groen = k.primair;
  const zacht = k.tegels[2];
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
  };
}
