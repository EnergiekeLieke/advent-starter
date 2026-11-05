// Eigen achtergrondafbeelding: welke maat past bij jouw kalender? Dit bestand importeert niets, zodat het ook los te testen is.
//
// De kaart is 768 px breed op een computer (schermen vanaf 768 px) en ongeveer 370 px op een telefoon. De hoogte hangt af van het aantal rijen met deurtjes.
// De getallen zijn gemeten in de echte kalender: computer 330 px plus 175 px per rij, telefoon 360 px plus 89 px per rij. De afbeelding wordt bijgesneden
// zodat hij de kaart helemaal vult (de verhouding hoeft dus niet precies te kloppen). We rekenen twee keer zo groot, zodat hij ook op een scherm
// met veel pixels scherp blijft.

const afronden = (n: number) => Math.round(n / 10) * 10;

export interface Maat {
  breedte: number;
  hoogte: number;
}

// Het geopende deurtje (de popup) is 448 px breed op een computer en een telefoon ongeveer 330 tot 360 px. De hoogte volgt de inhoud: ongeveer 330 px bij een kort
// tekstje, tot 600 px of meer met een afbeelding of audio erbij. Een afbeelding van 896 × 1000 px (twee keer 448 × 500) past daar in het midden van dat bereik.
// De afbeelding vult het hele deurtje en wordt zo nodig bijgesneden.
export const POPUP_ACHTERGROND_MAAT: Maat = { breedte: 896, hoogte: 1000 };

export function achtergrondMaten(aantalDagen: number): { computer: Maat; telefoon: Maat } {
  const n = Math.max(1, Math.min(31, Math.round(Number.isFinite(aantalDagen) ? aantalDagen : 24)));
  const rijen = Math.ceil(n / Math.min(4, n));
  return {
    computer: { breedte: 1536, hoogte: afronden(2 * (330 + 175 * rijen)) },
    telefoon: { breedte: 780, hoogte: afronden(2 * (360 + 89 * rijen)) },
  };
}
