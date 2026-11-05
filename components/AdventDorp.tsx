import type { LandschapPalet } from '@/lib/kleur';

// Het dorp: een rij huisjes met een kerkje, waar bij elk geopend deurtje een raam gaat branden.
// Het dorp heeft evenveel ramen als de kalender deurtjes heeft. Welk raam bij welke dag hoort, staat vast maar lijkt
// willekeurig, zodat de lichtjes over het hele dorp verspreid aangaan. Staat alles open, dan straalt de ster op de kerktoren.

interface Huis {
  b: number; h: number; r: number;
  kolommen: number; rijen: number;
  muur: 0 | 1 | 2;
  schoorsteen?: boolean;
}

type Onderdeel = ({ soort: 'huis' } & Huis) | { soort: 'kerk'; b: number; h: number; r: number };

const BASIS_Y = 174;
const RAAM_B = 8;
const RAAM_H = 9;
const KOLOM_PLEK: Record<number, number[]> = { 2: [0.3, 0.7], 3: [0.2, 0.5, 0.8] };
const RIJ_PLEK: Record<number, number[]> = { 2: [0.3, 0.66], 3: [0.2, 0.5, 0.8] };

// Van links naar rechts. Afmetingen gelden voor het smalle dorp, het brede dorp tekent alles iets groter.
const DORP: Onderdeel[] = [
  { soort: 'huis', b: 56, h: 54, r: 22, kolommen: 3, rijen: 3, muur: 0, schoorsteen: true },
  { soort: 'huis', b: 44, h: 40, r: 18, kolommen: 2, rijen: 2, muur: 1 },
  { soort: 'huis', b: 54, h: 44, r: 20, kolommen: 3, rijen: 2, muur: 2 },
  { soort: 'kerk', b: 30, h: 50, r: 26 },
  { soort: 'huis', b: 56, h: 54, r: 22, kolommen: 3, rijen: 3, muur: 1 },
  { soort: 'huis', b: 44, h: 40, r: 18, kolommen: 2, rijen: 2, muur: 0, schoorsteen: true },
  { soort: 'huis', b: 54, h: 44, r: 20, kolommen: 3, rijen: 2, muur: 2 },
  { soort: 'huis', b: 44, h: 40, r: 18, kolommen: 2, rijen: 2, muur: 1 },
];

const RAMEN_PER_ONDERDEEL = DORP.map((o) => (o.soort === 'huis' ? o.kolommen * o.rijen : 0));
const AANTAL_RAMEN = RAMEN_PER_ONDERDEEL.reduce((a, b) => a + b, 0);
const EERSTE_RAAM = RAMEN_PER_ONDERDEEL.map((_, i) => RAMEN_PER_ONDERDEEL.slice(0, i).reduce((a, b) => a + b, 0));

const ggd = (a: number, b: number): number => (b === 0 ? a : ggd(b, a % b));
// Elke vijfde (of eerste getal dat past) plek: zo gaan de lichtjes niet van links naar rechts aan
const STAP = [5, 7, 11, 13].find((s) => ggd(s, AANTAL_RAMEN) === 1) ?? 1;

/** Welke dag hoort bij welk raam. Ramen zonder dag worden niet getekend. */
function dagPerRaam(aantal: number): Map<number, number> {
  const kaart = new Map<number, number>();
  for (let i = 0; i < Math.min(aantal, AANTAL_RAMEN); i++) kaart.set((i * STAP) % AANTAL_RAMEN, i + 1);
  return kaart;
}

/** Waar elk onderdeel staat (linkerkant) en hoe groot het getekend wordt. Het dorp staat in het midden van het zichtbare gebied. */
function indeling(compact: boolean) {
  const schaal = compact ? 1 : 1.2;
  const tussen = compact ? 8 : 40;
  const midden = compact ? 540 : 600;
  const breedtes = DORP.map((o) => o.b * schaal);
  const totaal = breedtes.reduce((a, b) => a + b, 0) + tussen * (DORP.length - 1);
  let x = midden - totaal / 2;
  const plekken = DORP.map((_, i) => {
    const links = x;
    x += breedtes[i] + tussen;
    return links;
  });
  return { schaal, tussen, plekken, breedtes, begin: midden - totaal / 2, eind: midden + totaal / 2 };
}

/** Plekken voor dennen bij het dorp: aan de randen en (op het brede dorp) tussen de huisjes. */
export function dorpDennen(compact: boolean): { x: number; y: number; s: number }[] {
  const { plekken, breedtes, tussen, begin, eind } = indeling(compact);
  if (compact) return [{ x: begin - 22, y: 186, s: 1.2 }, { x: eind + 22, y: 186, s: 1.2 }];
  const bomen = [
    { x: begin - 40, y: 186, s: 1.4 }, { x: begin - 100, y: 183, s: 1 }, { x: begin - 150, y: 186, s: 0.8 }, { x: begin - 215, y: 184, s: 1.2 },
    { x: eind + 40, y: 186, s: 1.4 }, { x: eind + 100, y: 183, s: 1 }, { x: eind + 150, y: 186, s: 0.8 }, { x: eind + 215, y: 184, s: 1.2 },
    { x: begin - 290, y: 186, s: 0.9 }, { x: eind + 290, y: 186, s: 0.9 },
  ];
  for (let i = 0; i < DORP.length - 1; i++) bomen.push({ x: plekken[i] + breedtes[i] + tussen / 2, y: 187, s: 0.55 });
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
  const { muren, dak, dakSleutel, deur, raam } = palet.dorp;
  const dagen = dagPerRaam(aantal);
  const { schaal, plekken } = indeling(compact);

  return (
    <g>
      {DORP.map((o, i) => {
        const wissel = `translate(${plekken[i]} ${BASIS_Y}) scale(${schaal})`;

        if (o.soort === 'kerk') {
          // Het kerkje met de ster: die gaat branden zodra alle deurtjes open zijn
          return (
            <g key={i} transform={wissel}>
              <rect x="0" y={-o.h} width={o.b} height={o.h} fill={muren[1].kleur} className="adv-deel" data-kleur={muren[1].sleutel} />
              <path d={`M-3 ${-o.h}L${o.b / 2} ${-o.h - o.r}L${o.b + 3} ${-o.h}Z`} fill={dak} className="adv-deel" data-kleur={dakSleutel} />
              <rect x={o.b / 2 - 3} y="-14" width="6" height="14" rx="3" fill={deur} />
              <circle cx={o.b / 2} cy={-o.h + 12} r="4.500" fill="rgba(0,0,0,0.38)" />
              <polygon
                transform={`translate(${o.b / 2} ${-o.h - o.r - 9})`}
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

        const kolommen = KOLOM_PLEK[o.kolommen];
        const rijen = RIJ_PLEK[o.rijen];
        return (
          <g key={i} transform={wissel}>
            {o.schoorsteen && (
              <rect x={o.b * 0.72} y={-o.h - o.r * 0.85} width="7" height="14" fill={muren[o.muur].kleur} className="adv-deel" data-kleur={muren[o.muur].sleutel} />
            )}
            <rect x="0" y={-o.h} width={o.b} height={o.h} fill={muren[o.muur].kleur} className="adv-deel" data-kleur={muren[o.muur].sleutel} />
            <path d={`M-4 ${-o.h}L${o.b / 2} ${-o.h - o.r}L${o.b + 4} ${-o.h}Z`} fill={dak} className="adv-deel" data-kleur={dakSleutel} />
            {rijen.flatMap((ry, r) =>
              kolommen.map((kx, k) => {
                const slot = EERSTE_RAAM[i] + r * o.kolommen + k;
                const dag = dagen.get(slot);
                if (dag === undefined) return null;
                const cx = o.b * kx;
                const cy = -o.h + o.h * ry;
                const aan = hangt(dag);
                const vertraging = aan ? `${dag * 45}ms` : '0ms';
                return (
                  <g key={slot}>
                    <circle cx={cx} cy={cy} r="14" fill={`url(#${raamId})`} className={`adv-venster ${aan ? 'is-aan' : ''}`} style={{ transitionDelay: vertraging }} />
                    <rect x={cx - RAAM_B / 2} y={cy - RAAM_H / 2} width={RAAM_B} height={RAAM_H} rx="1" fill="rgba(0,0,0,0.38)" />
                    <rect
                      x={cx - RAAM_B / 2} y={cy - RAAM_H / 2} width={RAAM_B} height={RAAM_H} rx="1" fill={raam} stroke="rgba(50,25,0,0.55)" strokeWidth="0.9"
                      className={`adv-venster ${aan ? 'is-aan' : ''}`} style={{ transitionDelay: vertraging }}
                    />
                  </g>
                );
              }),
            )}
          </g>
        );
      })}
    </g>
  );
}
