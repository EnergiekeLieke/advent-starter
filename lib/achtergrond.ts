import { MAX_DAGEN } from '@/lib/config';

// Eigen achtergrondafbeelding: welke maat past bij jouw kalender?
//
// De kaart is 768 px breed op een computer (schermen vanaf 768 px) en ongeveer 374 px op een telefoon (iframe van 390 px). De hoogte is een vast stuk voor de titel,
// de knoppen en de voetregel, plus de rijen met deurtjes. De deurtjes zijn vierkant: hun grootte volgt uit de breedte van de kaart en het aantal kolommen
// (maximaal 4, bij 1 tot 3 deurtjes staan ze allemaal op een rij en zijn ze dus groter). De vaste stukken en de tussenruimtes zijn gemeten in de echte kalender
// bij 24 deurtjes: computer 324 px en telefoon 356 px. De afbeelding wordt bijgesneden zodat hij de kaart helemaal vult (de verhouding hoeft dus niet
// precies te kloppen), en een lange titel of logo maken de kaart iets hoger. We rekenen twee keer zo groot, zodat hij ook op een scherm met veel pixels scherp blijft.

const afronden = (n: number) => Math.round(n / 10) * 10;

export interface Maat {
  breedte: number;
  hoogte: number;
}

function kaartHoogte(kolommen: number, rijen: number, kaartBreedte: number, marges: number, gat: number, vast: number): number {
  const tegel = (kaartBreedte - marges - (kolommen - 1) * gat) / kolommen;
  return vast + rijen * (tegel + gat);
}

export function achtergrondMaten(aantalDagen: number): { computer: Maat; telefoon: Maat } {
  const n = Math.max(1, Math.min(MAX_DAGEN, Math.round(Number.isFinite(aantalDagen) ? aantalDagen : 24)));
  const kolommen = Math.min(4, n);
  const rijen = Math.ceil(n / kolommen);
  return {
    computer: { breedte: 1536, hoogte: afronden(2 * kaartHoogte(kolommen, rijen, 768, 80, 16, 324)) },
    telefoon: { breedte: 780, hoogte: afronden(2 * kaartHoogte(kolommen, rijen, 374, 24, 8, 356)) },
  };
}

// Het geopende deurtje (de popup) is 448 px breed op een computer en een telefoon ongeveer 330 tot 360 px. De hoogte volgt de inhoud: ongeveer 330 px bij een kort
// tekstje, tot 600 px of meer met een afbeelding of audio erbij. Een afbeelding van 896 × 1000 px (twee keer 448 × 500) past daar in het midden van dat bereik.
// De afbeelding vult het hele deurtje en wordt zo nodig bijgesneden.
export const POPUP_ACHTERGROND_MAAT: Maat = { breedte: 896, hoogte: 1000 };
