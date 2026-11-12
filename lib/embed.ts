const MAX_KAARTBREEDTE = 768; // de kaart is nooit breder dan max-w-3xl
const HOOGTE_ONDERKANT = 112; // wat het landschap onderaan aan hoogte toevoegt (pb-36 tegenover pb-8)

// Hoogte van de titel: het aantal regels (geschat uit de lengte, een letter is gemiddeld 0,55 keer zo breed als het lettertype hoog) maal de regelhoogte
function titelHoogte(titel: string, schaal: number, beschikbaar: number, breed: boolean): number {
  const lettergrootte = (breed ? 48 : 30) * schaal;
  const perRegel = Math.max(1, Math.floor(beschikbaar / (lettergrootte * 0.55)));
  const regels = Math.max(1, Math.ceil(titel.length / perRegel));
  return regels * lettergrootte * 1.25;
}

/**
 * Advies voor de hoogte van het iframe (in pixels), voor een iframe van ongeveer deze breedte.
 *
 * De ingebedde kalender is gewoon de kalender zelf: de deurtjes staan 4 naast elkaar en worden groter naarmate het iframe breder is.
 * Is het iframe te laag, dan scrolt de kalender in het iframe. Is het te hoog, dan blijft er lege ruimte onder de kaart.
 *
 * De getallen zijn gemeten in de echte kalender: 470 px voor titel, knoppen en voetregel (iets meer bij een heel smal of een breed scherm),
 * plus de rijen met deurtjes. Het advies houdt rekening met de langste fase (voor de start, want dan staat er extra tekst boven).
 */
export function adviesIframeHoogte(aantalDagen: number, breedte = 600, metOnderkant = true, titel = '', titelGrootte = 100, eigenOnderkant = false, metDelen = false): number {
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
  // Een eigen afbeelding staat onder de tekst en is zo hoog als de kaart breed is gedeeld door zijn verhouding (computerversie vanaf 768 px, anders de telefoonversie), plus 16 px ruimte
  // erboven. Daar gaat de normale ruimte onderaan (32 px) vanaf. Het landschap telt als vaste 112 px erbij.
  const afbeeldingHoogte = kaart * (w >= 768 ? 140 / 1200 : 140 / 520);
  const onderkantHoogte = eigenOnderkant ? Math.max(0, afbeeldingHoogte - 16) : 0;
  const hoogte = kopEnVoet - (metOnderkant ? 0 : HOOGTE_ONDERKANT) + onderkantHoogte + rijen * tegel + (rijen - 1) * gat;

  // Op een smal scherm staat de knop om te delen op een eigen regel onder de andere knoppen (gemeten: 42 px). Vanaf ongeveer 600 px past hij ernaast.
  const delenHoogte = metDelen && w < 560 ? 44 : 0;

  // Een grotere of kleinere titel past op meer of minder regels en is zelf hoger. We schatten het verschil met de standaardgrootte.
  const titelVerschil = titelGrootte === 100 ? 0 : titelHoogte(titel, titelGrootte / 100, kaart - marges, breed) - titelHoogte(titel, 1, kaart - marges, breed);

  // Een kleine marge voor verschillen in lettertype, afgerond op 50
  return Math.ceil((hoogte + delenHoogte + titelVerschil + 30) / 50) * 50;
}
