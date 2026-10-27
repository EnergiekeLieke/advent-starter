// Het aantal deurtjes per rij in de ingebedde kalender (instelling bij Opties)
export type EmbedKolommen = 4 | 6;

// Gemeten: de hoogte waarbij de deurtjes hun volle grootte hebben is ongeveer een basishoogte plus een bedrag per rij.
// - 6 per rij: basis 350 px en 100 px per rij, bij iframes van 470 tot 580 px breed (de maat in Kennis Shop).
// - 4 per rij: basis 300 px en 120 px per rij, bij een iframe van ongeveer 470 px breed. De deurtjes zijn dan groter
//   en worden nog groter in een breder iframe (bij 580 px breed is ongeveer 20 procent meer hoogte nodig voor de volle grootte).
const MAAT: Record<EmbedKolommen, { basis: number; perRij: number }> = {
  6: { basis: 350, perRij: 100 },
  4: { basis: 300, perRij: 120 },
};

/**
 * Advies voor de hoogte van het iframe (in pixels).
 *
 * De ingebedde kalender vult de hoogte van het iframe: te laag geeft kleinere deurtjes, te hoog geeft alleen lege ruimte.
 * Met 6 per rij is dat bijvoorbeeld 550 px voor 12, 750 px voor 24 en 950 px voor 31 deurtjes. Met 4 per rij 650, 1000 en 1250 px.
 */
export function adviesIframeHoogte(aantalDagen: number, kolommen: EmbedKolommen = 6): number {
  const rijen = Math.ceil(Math.max(1, Math.min(31, aantalDagen)) / kolommen);
  const { basis, perRij } = MAAT[kolommen];
  return Math.max(450, Math.round((basis + rijen * perRij) / 50) * 50);
}
