// Welke Blob-bestanden zijn instellingen van de kalender, en welke is de nieuwste? Dit bestand importeert niets,
// zodat het ook los te testen is.

// De instellingen staan onder een naam met een willekeurig stuk (advent/config-Ab3dE.json). Een vast, publiek adres
// zou te raden zijn voor wie het adres van de opslag kent (dat zit in de url van een geüploade afbeelding),
// en dan zijn de deurtjes die nog dicht horen te zijn alvast te lezen.
export const CONFIG_VOORVOEGSEL = 'advent/config';
export const CONFIG_BASISNAAM = 'advent/config.json';
const PATROON = /^advent\/config(-[A-Za-z0-9_-]+)?\.json$/;

export const isConfigBlob = (pathname: string) => PATROON.test(pathname);

/** De eerdere versies sloegen de instellingen op onder een vaste naam. Die naam is te raden. */
export const isVasteNaam = (pathname: string) => pathname === CONFIG_BASISNAAM;

interface Blobje {
  pathname: string;
  uploadedAt: Date | string;
}

/** De nieuwste instellingen uit een lijst blobs, of null als er geen is. */
export function nieuwsteConfigBlob<T extends Blobje>(blobs: readonly T[]): T | null {
  let beste: T | null = null;
  for (const blob of blobs) {
    if (!isConfigBlob(blob.pathname)) continue;
    if (!beste || new Date(blob.uploadedAt).getTime() > new Date(beste.uploadedAt).getTime()) beste = blob;
  }
  return beste;
}
