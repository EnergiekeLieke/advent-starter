const MAX_KAARTBREEDTE = 768; // de kaart is nooit breder dan max-w-3xl
const HOOGTE_ONDERKANT = 112; // wat het landschap onderaan aan hoogte toevoegt (pb-36 tegenover pb-8)

/**
 * Advies voor de hoogte van het iframe (in pixels), voor een iframe van ongeveer deze breedte.
 *
 * De ingebedde kalender is gewoon de kalender zelf: de deurtjes staan 4 naast elkaar en worden groter naarmate het iframe breder is.
 * Is het iframe te laag, dan scrolt de kalender in het iframe. Is het te hoog, dan blijft er lege ruimte onder de kaart.
 *
 * De getallen zijn gemeten in de echte kalender: 470 px voor titel, knoppen en voetregel (iets meer bij een heel smal of een breed scherm),
 * plus de rijen met deurtjes. Het advies houdt rekening met de langste fase (voor de start, want dan staat er extra tekst boven).
 */
export function adviesIframeHoogte(aantalDagen: number, breedte = 600, metOnderkant = true): number {
  const n = Math.max(1, Math.min(31, Math.round(Number.isFinite(aantalDagen) ? aantalDagen : 24)));
  const w = Math.max(280, Math.min(1400, Math.round(Number.isFinite(breedte) ? breedte : 600)));

  const kolommen = Math.min(4, n);
  const rijen = Math.ceil(n / kolommen);
  const breed = w >= 640; // vanaf 640 px krijgt de kalender grotere marges en tussenruimtes (de sm-stand van Tailwind)
  const kaart = Math.min(w - 16, MAX_KAARTBREEDTE);
  const marges = breed ? 80 : 24;
  const gat = breed ? 16 : 8;
  const tegel = (kaart - marges - (kolommen - 1) * gat) / kolommen;

  const kopEnVoet = w < 400 ? 515 : breed ? 496 : 470;
  const hoogte = kopEnVoet - (metOnderkant ? 0 : HOOGTE_ONDERKANT) + rijen * tegel + (rijen - 1) * gat;

  // Een kleine marge voor verschillen in lettertype, afgerond op 50
  return Math.ceil((hoogte + 30) / 50) * 50;
}
