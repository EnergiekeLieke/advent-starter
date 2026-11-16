import { createElement, type ReactNode } from 'react';

// Opmaak in de tekst van een cadeautje of deurtje: **vet**, *cursief* en ++onderstreept++.
// De beheerder gebruikt de knoppen B, I en U in de editor, de bezoeker ziet nooit de tekens zelf.
// De tekst wordt nooit als HTML getoond: we maken er React-elementen van (<strong>, <em>, <u>).
// Dit bestand is in de cadeautje-starter en de advent-starter hetzelfde. Verander je het in de een, doe het dan ook in de ander.

export type Opmaak = 'vet' | 'cursief' | 'onderstreept';
export type Knoop = string | { opmaak: Opmaak; kinderen: Knoop[] };

const TEKENS: Record<Opmaak, string> = { vet: '**', cursief: '*', onderstreept: '++' };

const isSpatie = (c: string | undefined) => c === undefined || /\s/.test(c);
// Een opmaak mag niet over een lege regel heen (een nieuwe alinea)
const heeftLegeRegel = (tekst: string) => /\n[ \t]*\n/.test(tekst);

/**
 * Zoekt het sluitteken dat bij een openingsteken hoort. We beginnen bij `vanaf` (direct na het openingsteken).
 * Een ingesloten opmaak (bijvoorbeeld **vet** binnen *cursief*) wordt overgeslagen, zodat het juiste sluitteken wordt gevonden.
 * Geeft de plek van het sluitteken terug, of -1 als er geen is.
 */
function zoekSluiting(tekst: string, vanaf: number, teken: string): number {
  let j = vanaf;
  while (j < tekst.length) {
    if (teken === '*' && tekst.startsWith('**', j)) {
      // Een geneste vette tekst overslaan. Is die niet gesloten, dan zijn het gewoon twee sterretjes.
      const dicht = tekst.indexOf('**', j + 2);
      j = dicht === -1 ? j + 2 : dicht + 2;
      continue;
    }
    if (tekst.startsWith(teken, j) && j > vanaf && !isSpatie(tekst[j - 1])) {
      // Bij een enkel sterretje mag het niet het begin van een dubbel sterretje zijn
      if (teken === '*' && tekst[j + 1] === '*') {
        j += 1;
        continue;
      }
      return j;
    }
    j += 1;
  }
  return -1;
}

/** Zet een tekst met opmaaktekens om in stukjes. Tekens zonder sluitteken blijven gewoon staan. */
export function parseOpmaak(tekst: string): Knoop[] {
  const uit: Knoop[] = [];
  let los = '';
  const leegmaken = () => {
    if (los) uit.push(los);
    los = '';
  };

  let i = 0;
  while (i < tekst.length) {
    // ***vet en cursief***
    if (tekst.startsWith('***', i) && !isSpatie(tekst[i + 3])) {
      const j = zoekSluiting(tekst, i + 3, '***');
      if (j !== -1 && !heeftLegeRegel(tekst.slice(i, j))) {
        leegmaken();
        uit.push({ opmaak: 'cursief', kinderen: [{ opmaak: 'vet', kinderen: parseOpmaak(tekst.slice(i + 3, j)) }] });
        i = j + 3;
        continue;
      }
    }

    const soort: Opmaak | null = tekst.startsWith('**', i) ? 'vet' : tekst.startsWith('++', i) ? 'onderstreept' : tekst[i] === '*' ? 'cursief' : null;
    if (soort) {
      const teken = TEKENS[soort];
      const begin = i + teken.length;
      if (!isSpatie(tekst[begin])) {
        const j = zoekSluiting(tekst, begin, teken);
        if (j !== -1 && !heeftLegeRegel(tekst.slice(i, j))) {
          leegmaken();
          uit.push({ opmaak: soort, kinderen: parseOpmaak(tekst.slice(begin, j)) });
          i = j + teken.length;
          continue;
        }
      }
      // Geen geldig paar: de tekens blijven gewoon staan
      los += teken;
      i += teken.length;
      continue;
    }

    los += tekst[i];
    i += 1;
  }
  leegmaken();
  return uit;
}

function naarTekst(knopen: Knoop[]): string {
  return knopen.map((k) => (typeof k === 'string' ? k : naarTekst(k.kinderen))).join('');
}

/** De tekst zonder de opmaaktekens, bijvoorbeeld om de lengte te meten. */
export function zonderOpmaak(tekst: string): string {
  return naarTekst(parseOpmaak(tekst));
}

const ELEMENT: Record<Opmaak, string> = { vet: 'strong', cursief: 'em', onderstreept: 'u' };

function naarReact(knopen: Knoop[], voorvoegsel: string): ReactNode[] {
  return knopen.map((k, i) => {
    const sleutel = `${voorvoegsel}${i}`;
    return typeof k === 'string' ? k : createElement(ELEMENT[k.opmaak], { key: sleutel }, ...naarReact(k.kinderen, `${sleutel}.`));
  });
}

/** De tekst als React-elementen met <strong>, <em> en <u>. Nooit als HTML. */
export function maakOpmaak(tekst: string): ReactNode {
  return naarReact(parseOpmaak(tekst), '');
}

// ─── Voor de knoppen in de editor ─────────────────────────────

export interface Selectie {
  tekst: string;
  van: number;
  tot: number;
}

const loop = (tekst: string, vanaf: number, richting: 1 | -1, teken: string) => {
  let n = 0;
  for (let p = richting === 1 ? vanaf : vanaf - 1; p >= 0 && p < tekst.length && tekst[p] === teken; p += richting) n += 1;
  return n;
};

/**
 * Zet opmaak om een selectie, of haalt hem weg als hij er al staat. Zonder selectie komen de tekens naast elkaar
 * met de cursor ertussen. Geeft de nieuwe tekst en selectie terug, of null als het niet past binnen `max` tekens.
 */
export function wisselOpmaak(invoer: Selectie, opmaak: Opmaak, max: number): Selectie | null {
  const teken = TEKENS[opmaak];
  const n = teken.length;
  const { tekst } = invoer;
  let { van, tot } = invoer;
  const begin = van;

  // Spaties aan de rand horen er niet bij: een opmaakteken tegen een spatie werkt niet
  while (van < tot && /\s/.test(tekst[van])) van += 1;
  while (tot > van && /\s/.test(tekst[tot - 1])) tot -= 1;
  // Bestond de selectie alleen uit spaties, dan behandelen we haar als een cursor op de plek waar ze begon
  if (van >= tot) van = tot = begin;

  if (van === tot) {
    const nieuw = tekst.slice(0, van) + teken + teken + tekst.slice(van);
    return nieuw.length > max ? null : { tekst: nieuw, van: van + n, tot: van + n };
  }

  // Staat de opmaak er al omheen? Dan halen we hem weg.
  const links = loop(tekst, van, -1, '*');
  const rechts = loop(tekst, tot, 1, '*');
  let omheen: boolean;
  if (opmaak === 'cursief') omheen = links % 2 === 1 && rechts % 2 === 1;
  else if (opmaak === 'vet') omheen = links >= 2 && rechts >= 2;
  else omheen = tekst.slice(van - n, van) === teken && tekst.slice(tot, tot + n) === teken;
  if (omheen) {
    return { tekst: tekst.slice(0, van - n) + tekst.slice(van, tot) + tekst.slice(tot + n), van: van - n, tot: tot - n };
  }

  // Heeft de selectie de tekens zelf in zich (je selecteerde bijvoorbeeld "**woord**")? Dan halen we die weg.
  const binnen = tekst.slice(van, tot);
  if (binnen.length > 2 * n && binnen.startsWith(teken) && binnen.endsWith(teken) && (opmaak !== 'cursief' || (!binnen.startsWith('**') && !binnen.endsWith('**')))) {
    const kaal = binnen.slice(n, binnen.length - n);
    return { tekst: tekst.slice(0, van) + kaal + tekst.slice(tot), van, tot: van + kaal.length };
  }

  const nieuw = tekst.slice(0, van) + teken + binnen + teken + tekst.slice(tot);
  return nieuw.length > max ? null : { tekst: nieuw, van: van + n, tot: tot + n };
}
