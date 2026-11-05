import type { LandschapPalet } from '@/lib/kleur';

// Het dorp: een rij huisjes met een kerkje, waar bij elk geopend deurtje een raam gaat branden.
// Het dorp heeft evenveel ramen als de kalender deurtjes heeft. Welk raam bij welke dag hoort, staat vast maar lijkt
// willekeurig, zodat de lichtjes over het hele dorp verspreid aangaan. Staat alles open, dan straalt de ster op de kerktoren.

interface Huis {
  x: number; b: number; h: number; r: number;
  kolommen: number; rijen: number;
  muur: 0 | 1 | 2;
  schoorsteen?: boolean;
}

const BASIS_Y = 178;
const RAAM_B = 7;
const RAAM_H = 8;

// Posities horen bij het smalle dorp (zichtbaar gebied x 280 t/m 800). Het brede dorp spreidt ze uit.
const HUIZEN: Huis[] = [
  { x: 314, b: 38, h: 34, r: 15, kolommen: 2, rijen: 2, muur: 0 },
  { x: 360, b: 34, h: 28, r: 13, kolommen: 2, rijen: 1, muur: 1 },
  { x: 402, b: 44, h: 40, r: 18, kolommen: 3, rijen: 2, muur: 2, schoorsteen: true },
  { x: 492, b: 38, h: 34, r: 15, kolommen: 2, rijen: 2, muur: 1 },
  { x: 538, b: 34, h: 28, r: 13, kolommen: 2, rijen: 1, muur: 0, schoorsteen: true },
  { x: 580, b: 44, h: 40, r: 18, kolommen: 3, rijen: 2, muur: 1 },
  { x: 632, b: 38, h: 34, r: 15, kolommen: 2, rijen: 2, muur: 2 },
  { x: 678, b: 34, h: 28, r: 13, kolommen: 2, rijen: 1, muur: 0 },
  { x: 720, b: 44, h: 38, r: 17, kolommen: 3, rijen: 2, muur: 2, schoorsteen: true },
];
const KERK = { x: 454, b: 26, h: 40, r: 26 };
const SPREIDING = 1.9;

const RAMEN_PER_HUIS = HUIZEN.map((h) => h.kolommen * h.rijen);
const AANTAL_RAMEN = RAMEN_PER_HUIS.reduce((a, b) => a + b, 0);
const EERSTE_RAAM = RAMEN_PER_HUIS.map((_, i) => RAMEN_PER_HUIS.slice(0, i).reduce((a, b) => a + b, 0));

const ggd = (a: number, b: number): number => (b === 0 ? a : ggd(b, a % b));
// Elke zevende (of eerste getal dat past) plek: zo gaan de lichtjes niet van links naar rechts aan
const STAP = [7, 5, 11, 13].find((s) => ggd(s, AANTAL_RAMEN) === 1) ?? 1;

/** Welke dag hoort bij welk raam. Ramen zonder dag worden niet getekend. */
function dagPerRaam(aantal: number): Map<number, number> {
  const kaart = new Map<number, number>();
  for (let i = 0; i < Math.min(aantal, AANTAL_RAMEN); i++) kaart.set((i * STAP) % AANTAL_RAMEN, i + 1);
  return kaart;
}

const KOLOM_PLEK: Record<number, number[]> = { 2: [0.3, 0.7], 3: [0.2, 0.5, 0.8] };
const RIJ_PLEK: Record<number, number[]> = { 1: [0.4], 2: [0.28, 0.62] };

const plaats = (x: number, compact: boolean) => (compact ? x : 600 + (x - 540) * SPREIDING);

/** Plekken voor dennen bij het dorp: aan de randen en (op het brede dorp) tussen de huisjes. */
export function dorpDennen(compact: boolean): { x: number; y: number; s: number }[] {
  if (compact) return [{ x: 298, y: 186, s: 1.2 }, { x: 784, y: 186, s: 1.2 }];
  const bomen = [
    { x: 40, y: 186, s: 1.4 }, { x: 96, y: 183, s: 1 }, { x: 140, y: 186, s: 0.8 },
    { x: 1060, y: 186, s: 0.8 }, { x: 1104, y: 183, s: 1 }, { x: 1160, y: 186, s: 1.4 },
  ];
  HUIZEN.forEach((h, i) => {
    const volgende = HUIZEN[i + 1];
    // Tussen het derde huis en het vierde staat het kerkje
    if (!volgende || (h.x < KERK.x && volgende.x > KERK.x)) return;
    const eind = plaats(h.x, false) + h.b;
    const begin = plaats(volgende.x, false);
    if (begin - eind > 45) bomen.push({ x: (eind + begin) / 2, y: 186, s: 0.6 });
  });
  return bomen;
}

interface DorpProps {
  compact: boolean;
  palet: LandschapPalet;
  hangt: (dag: number) => boolean;
  sterAan: boolean;
  aantal: number;
  accent: string;
  raamId: string;
}

export function Dorp({ compact, palet, hangt, sterAan, aantal, accent, raamId }: DorpProps) {
  const muren = [palet.huisMuur, palet.huisSchoorsteen, palet.huisDeur];
  const dagen = dagPerRaam(aantal);
  const kerkX = plaats(KERK.x, compact);
  const kerkTop = BASIS_Y - KERK.h;

  return (
    <g>
      {HUIZEN.map((huis, i) => {
        const x = plaats(huis.x, compact);
        const top = BASIS_Y - huis.h;
        const kolommen = KOLOM_PLEK[huis.kolommen];
        const rijen = RIJ_PLEK[huis.rijen];
        return (
          <g key={i}>
            {huis.schoorsteen && (
              <rect x={x + huis.b * 0.7} y={top - huis.r * 0.9} width="6" height="12" fill={palet.huisSchoorsteen} className="adv-deel" data-kleur="secundair" />
            )}
            <rect x={x} y={top} width={huis.b} height={huis.h} fill={muren[huis.muur]} className="adv-deel" data-kleur="secundair" />
            <path d={`M${x - 3} ${top}L${x + huis.b / 2} ${top - huis.r}L${x + huis.b + 3} ${top}Z`} fill={palet.huisDak} className="adv-deel" data-kleur="primair" />
            {huis.rijen === 1 && <rect x={x + huis.b / 2 - 3} y={BASIS_Y - 11} width="6" height="11" rx="1" fill={palet.huisDeur} />}
            {rijen.flatMap((ry, r) =>
              kolommen.map((kx, k) => {
                const slot = EERSTE_RAAM[i] + r * huis.kolommen + k;
                const dag = dagen.get(slot);
                if (dag === undefined) return null;
                const cx = x + huis.b * kx;
                const cy = top + huis.h * ry;
                const aan = hangt(dag);
                const vertraging = aan ? `${dag * 45}ms` : '0ms';
                return (
                  <g key={slot}>
                    <circle cx={cx} cy={cy} r="12" fill={`url(#${raamId})`} className={`adv-venster ${aan ? 'is-aan' : ''}`} style={{ transitionDelay: vertraging }} />
                    <rect x={cx - RAAM_B / 2} y={cy - RAAM_H / 2} width={RAAM_B} height={RAAM_H} rx="1" fill="rgba(0,0,0,0.38)" />
                    <rect
                      x={cx - RAAM_B / 2} y={cy - RAAM_H / 2} width={RAAM_B} height={RAAM_H} rx="1" fill="#ffd877"
                      className={`adv-venster ${aan ? 'is-aan' : ''}`} style={{ transitionDelay: vertraging }}
                    />
                  </g>
                );
              }),
            )}
          </g>
        );
      })}

      {/* Het kerkje met de ster: die gaat branden zodra alle deurtjes open zijn */}
      <rect x={kerkX} y={kerkTop} width={KERK.b} height={KERK.h} fill={palet.huisDeur} className="adv-deel" data-kleur="secundair" />
      <path d={`M${kerkX - 2} ${kerkTop}L${kerkX + KERK.b / 2} ${kerkTop - KERK.r}L${kerkX + KERK.b + 2} ${kerkTop}Z`} fill={palet.huisDak} className="adv-deel" data-kleur="primair" />
      <rect x={kerkX + KERK.b / 2 - 2.5} y={BASIS_Y - 12} width="5" height="12" rx="2.5" fill={palet.huisDak} />
      <circle cx={kerkX + KERK.b / 2} cy={kerkTop + 10} r="4" fill="rgba(0,0,0,0.38)" />
      <polygon
        transform={`translate(${kerkX + KERK.b / 2} ${kerkTop - KERK.r - 8})`}
        points="0,-7 2,-2.200 7,-2.200 3,0.800 4.600,5.600 0,2.800 -4.600,5.600 -3,0.800 -7,-2.200 -2,-2.200"
        fill={sterAan ? '#f3dc8f' : 'none'}
        stroke={accent}
        strokeWidth="1.200"
        strokeOpacity={sterAan ? 1 : 0.5}
        className={sterAan ? 'adv-ster-aan' : ''}
      />
    </g>
  );
}
