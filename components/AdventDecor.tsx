'use client';

import { useEffect, useRef } from 'react';
import type { LandschapStijl } from '@/lib/config';
import type { LandschapPalet } from '@/lib/kleur';

// Decoratie van de kalender: sneeuw, sterretjes, strik en het winterlandschap met de kerstboom.
// De accentkleur en de kleuren van de kerstballen komen van buiten (instellingen), de rest is vast.

export const STERREN = [
  { x: 6, y: 5, s: 14, d: 0 }, { x: 92, y: 4, s: 18, d: 0.8 }, { x: 18, y: 12, s: 10, d: 1.6 },
  { x: 80, y: 13, s: 12, d: 2.2 }, { x: 4, y: 38, s: 10, d: 1.1 }, { x: 96, y: 45, s: 12, d: 0.4 },
  { x: 3, y: 70, s: 14, d: 2.5 }, { x: 97, y: 74, s: 10, d: 1.4 },
];

// Posities van de bollen in de boom (viewBox 200 x 215). Tot en met 24 deurtjes gebruikt de boom 24 plekken,
// bij meer deurtjes (maximaal 31) een iets dichtere indeling met 31 plekken.
const maakPosities = (rijen: { y: number; n: number; b: number }[]) =>
  rijen.flatMap(({ y, n, b }) =>
    Array.from({ length: n }, (_, i) => ({ x: 100 + (i / (n - 1) - 0.5) * 2 * b, y: y + (i % 2 ? 3 : -3) })),
  );

const BOL_POSITIES = maakPosities([
  { y: 48, n: 2, b: 12 }, { y: 72, n: 3, b: 24 }, { y: 98, n: 4, b: 27 },
  { y: 122, n: 5, b: 38 }, { y: 148, n: 5, b: 42 }, { y: 173, n: 5, b: 58 },
]);

const BOL_POSITIES_VOL = maakPosities([
  { y: 48, n: 2, b: 12 }, { y: 70, n: 3, b: 22 }, { y: 92, n: 4, b: 28 }, { y: 114, n: 5, b: 38 },
  { y: 136, n: 5, b: 40 }, { y: 156, n: 6, b: 52 }, { y: 176, n: 6, b: 60 },
]);

export function Sneeuw() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let breedte = 0;
    let hoogte = 0;
    const meet = () => {
      breedte = canvas.clientWidth;
      hoogte = canvas.clientHeight;
      canvas.width = breedte;
      canvas.height = hoogte;
    };
    meet();
    window.addEventListener('resize', meet);

    const vlokken = Array.from({ length: 45 }, () => ({
      x: Math.random() * breedte,
      y: Math.random() * hoogte,
      r: 1 + Math.random() * 2.2,
      v: 0.3 + Math.random() * 0.7,
      f: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    const teken = () => {
      ctx.clearRect(0, 0, breedte, hoogte);
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      for (const v of vlokken) {
        v.y += v.v;
        v.f += 0.015;
        v.x += Math.sin(v.f) * 0.4;
        if (v.y > hoogte + 4) { v.y = -4; v.x = Math.random() * breedte; }
        ctx.beginPath();
        ctx.arc(v.x, v.y, v.r, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(teken);
    };
    frame = requestAnimationFrame(teken);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', meet);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export function Strik({ accent, className = 'w-6 sm:w-8' }: { accent: string; className?: string }) {
  return (
    <svg viewBox="0 0 32 18" aria-hidden className={`absolute top-0.5 left-1/2 -translate-x-1/2 pointer-events-none ${className}`}>
      <path d="M16 9C10 0 2 2 4 9s10 3 12 0z" fill="#e0603a" stroke={accent} strokeWidth="1" />
      <path d="M16 9c6-9 14-7 12 0s-10 3-12 0z" fill="#e0603a" stroke={accent} strokeWidth="1" />
      <circle cx="16" cy="9" r="2.6" fill={accent} />
    </svg>
  );
}

interface BoomProps {
  hangt: (dag: number) => boolean;
  sterAan: boolean;
  aantal: number;
  accent: string;
  ballen: string[];
}

// De boom zelf (viewBox 200 x 215), los van de svg-wrapper zodat hij ook in het landschap past
export function BoomTekening({ hangt, sterAan, aantal, accent, ballen }: BoomProps) {
  return (
    <>
      <rect x="92" y="184" width="16" height="22" rx="2" fill="#6b4a2a" />
      <path d="M100 85L22 185H178Z" fill="#3b6a3f" stroke={accent} strokeOpacity="0.35" />
      <path d="M100 50L40 135H160Z" fill="#478049" stroke={accent} strokeOpacity="0.35" />
      <path d="M100 18L58 85H142Z" fill="#549657" stroke={accent} strokeOpacity="0.35" />
      <path
        d="M100 2l4 8.4 9.200 1.200-6.700 6.400 1.600 9.100L100 22.600l-8.100 4.500 1.600-9.100-6.700-6.400 9.200-1.200z"
        fill={sterAan ? '#f3dc8f' : 'none'}
        stroke={accent}
        strokeWidth="1.5"
        strokeOpacity={sterAan ? 1 : 0.5}
        className={sterAan ? 'adv-ster-aan' : ''}
      />
      {Array.from({ length: aantal }, (_, i) => i + 1).map((dag) => {
        const p = aantal > BOL_POSITIES.length ? BOL_POSITIES_VOL[(dag * 11) % BOL_POSITIES_VOL.length] : BOL_POSITIES[(dag * 7) % BOL_POSITIES.length];
        const kleur = ballen[dag % ballen.length];
        const aan = hangt(dag);
        return (
          <g key={dag}>
            <circle cx={p.x} cy={p.y} r="2" fill={accent} opacity="0.25" />
            <g
              className={`adv-bol ${aan ? 'is-aan' : ''}`}
              style={{ transitionDelay: aan ? `${dag * 45}ms` : '0ms' }}
            >
              <rect x={p.x - 1.800} y={p.y - 9} width="3.600" height="3" rx="0.8" fill={accent} />
              <circle cx={p.x} cy={p.y} r="6.500" fill={kleur} stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
              <circle cx={p.x - 2} cy={p.y - 2} r="1.800" fill="#fff" opacity="0.55" />
            </g>
          </g>
        );
      })}
    </>
  );
}

// Dennenboom met sneeuw, voet op (0, 0), ongeveer 66 hoog
export function Den({ x, y, s, palet }: { x: number; y: number; s: number; palet: LandschapPalet }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-2" y="-6" width="4" height="6" fill={palet.denStam} />
      <path d="M-18 -6H18L0 -34Z" fill={palet.den[0]} />
      <path d="M-14 -24H14L0 -50Z" fill={palet.den[1]} />
      <path d="M-10 -42H10L0 -66Z" fill={palet.den[2]} />
      <path d="M-9.500 -20H9.500L0 -34L-4 -28Z" fill={palet.denSneeuw} opacity={palet.denSneeuwOpac} />
      <path d="M-7 -38H7L0 -50L-3 -45Z" fill={palet.denSneeuw} opacity={palet.denSneeuwOpac} />
      <path d="M-5 -54H5L0 -66L-2 -62Z" fill={palet.denSneeuw} opacity={palet.denSneeuwOpac} />
    </g>
  );
}

const VERRE_BOMEN = Array.from({ length: 44 }, (_, i) => ({
  x: i * 28 + (i % 3) * 5,
  h: 24 + ((i * 7) % 5) * 4,
  basis: 132 + Math.sin(i / 3) * 6,
}));

const DENNEN = [
  { x: 60, y: 186, s: 1.4 }, { x: 112, y: 184, s: 1 }, { x: 24, y: 180, s: 1 },
  { x: 282, y: 176, s: 0.9 }, { x: 312, y: 180, s: 0.7 }, { x: 490, y: 178, s: 0.8 }, { x: 520, y: 182, s: 1 },
  { x: 610, y: 176, s: 0.8 }, { x: 650, y: 180, s: 0.6 }, { x: 716, y: 178, s: 0.9 }, { x: 752, y: 183, s: 0.7 },
  { x: 940, y: 180, s: 0.9 }, { x: 1020, y: 178, s: 1 }, { x: 1056, y: 183, s: 0.75 },
  { x: 1110, y: 186, s: 1.4 }, { x: 1162, y: 183, s: 1 },
];

// Dennen voor het compacte dorpje (zichtbaar gebied x 280 t/m 800)
const DENNEN_COMPACT = [
  { x: 300, y: 186, s: 1.4 }, { x: 338, y: 183, s: 0.9 },
  { x: 474, y: 180, s: 0.8 }, { x: 500, y: 184, s: 1 },
  { x: 668, y: 178, s: 0.9 }, { x: 702, y: 183, s: 0.7 },
  { x: 756, y: 186, s: 1.4 }, { x: 792, y: 182, s: 1 },
];

// Onderkant van de kaart: heuvels, bos, huisje met brandend raam en de boom met de bollen.
// stijl 'winter' heeft sneeuw, 'heuvels' is dezelfde opzet in de kleuren van het thema (past bij lichte achtergronden)
// en 'golven' bestaat alleen uit heuvels, zonder huisje, bos en kerstboom.
// Alles staat tussen y=60 en y=200. De hoogte volgt de breedte (aspect-ratio), zodat er onderin nooit
// iets afgesneden wordt; op smal formaat wordt alleen links en rechts bijgesneden.
// compact: eigen dorpje voor smalle schermen, met huisje en boom dicht bij elkaar in het midden.
export function Landschap({ compact, stijl, palet, ...boom }: BoomProps & { compact: boolean; stijl: LandschapStijl; palet: LandschapPalet }) {
  const metDorp = stijl !== 'golven';
  const huisX = compact ? 370 : 360;
  const boomX = compact ? 540 : 800;
  const dennen = compact ? DENNEN_COMPACT : DENNEN;
  const raamId = compact ? 'adv-raam-compact' : 'adv-raam';
  return (
    <svg
      viewBox={compact ? '280 60 520 140' : '0 60 1200 140'}
      preserveAspectRatio="xMidYMax slice"
      className={`absolute bottom-0 left-0 w-full pointer-events-none ${compact ? 'md:hidden' : 'hidden md:block'}`}
      style={compact ? { aspectRatio: '520 / 140' } : { aspectRatio: '1200 / 140', minHeight: '7rem' }}
      role="img"
      aria-label={metDorp ? 'Landschap met een huisje en een kerstboom waar elke dag een kerstbal bij komt' : 'Golvende heuvels'}
    >
      <defs>
        <radialGradient id={raamId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd877" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffd877" stopOpacity="0" />
        </radialGradient>
      </defs>

      <path d="M0 140Q150 100 320 130T640 120T960 125T1200 110V200H0Z" fill={palet.heuvelVer} opacity={palet.heuvelVerOpac} />
      {metDorp && VERRE_BOMEN.map((b, i) => (
        <path key={i} d={`M${b.x} ${b.basis}l14 0l-7 -${b.h}z`} fill={palet.bosVer} opacity={palet.bosVerOpac} />
      ))}
      <path d="M0 160Q200 130 420 152T800 150T1200 140V200H0Z" fill={palet.heuvelMidden} opacity={palet.heuvelMiddenOpac} />

      {metDorp && (
        <g transform={`translate(${huisX} 118)`}>
          <circle cx="17" cy="44" r="26" fill={`url(#${raamId})`} className="adv-raamlicht" />
          <rect x="0" y="28" width="60" height="34" fill={palet.huisMuur} />
          <rect x="44" y="6" width="8" height="16" fill={palet.huisSchoorsteen} />
          <rect x="42" y="3" width="12" height="4" rx="1.500" fill={palet.huisSneeuw} />
          <path d="M-6 30L30 2L66 30Z" fill={palet.huisDak} />
          <path d="M-2 28L30 3L62 28L56 27L30 10L4 27Z" fill={palet.huisSneeuw} />
          <rect x="10" y="37" width="14" height="12" rx="1" fill="#ffd877" className="adv-raamlicht" />
          <path d="M17 37v12M10 43h14" stroke={palet.huisMuur} strokeWidth="1.200" />
          <rect x="38" y="41" width="12" height="21" rx="1" fill={palet.huisDeur} />
          <circle cx="47" cy="52" r="1" fill={boom.accent} />
          <g fill={palet.rook} opacity={palet.rookOpac}>
            <circle cx="48" cy="-4" r="3" />
            <circle cx="52" cy="-12" r="4" />
            <circle cx="58" cy="-21" r="5" />
          </g>
        </g>
      )}

      {metDorp && dennen.map((d, i) => <Den key={i} {...d} palet={palet} />)}

      <path d="M0 178Q150 160 330 172T700 170T1000 165T1200 172V200H0Z" fill={palet.heuvelVoor1} opacity={palet.heuvelVoor1Opac} />
      <path d="M0 190Q200 178 420 186T860 184T1200 188V200H0Z" fill={palet.heuvelVoor2} opacity={palet.heuvelVoor2Opac} />

      {/* de boom met de bollen, op de heuvel */}
      {metDorp && (
        <>
          <ellipse cx={boomX + 50} cy="187" rx="44" ry="5" fill="rgba(0,0,0,0.15)" />
          <g transform={`translate(${boomX} 82) scale(0.5)`}>
            <BoomTekening {...boom} />
          </g>
        </>
      )}
    </svg>
  );
}
