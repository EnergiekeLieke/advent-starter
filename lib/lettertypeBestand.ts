// Eigen lettertypes: welke bestanden we accepteren en hoe we ze herkennen. Dit bestand importeert niets,
// zodat het ook los te testen is.

export const LETTERTYPE_EXTENSIES = ['otf', 'ttf', 'woff', 'woff2'] as const;
export type LettertypeExtensie = (typeof LETTERTYPE_EXTENSIES)[number];

export const LETTERTYPE_MAX_BYTES = 2_000_000;

// De naam waaronder een geüpload lettertype in de opslag staat. Het willekeurige stuk maakt hem niet te raden.
export const LETTERTYPE_VOORVOEGSEL = 'advent/lettertype';
export const LETTERTYPE_ID_PATROON = /^(advent\/)?lettertype-[A-Za-z0-9_-]+\.(otf|ttf|woff2?)$/;

export const LETTERTYPE_MIME: Record<LettertypeExtensie, string> = {
  otf: 'font/otf',
  ttf: 'font/ttf',
  woff: 'font/woff',
  woff2: 'font/woff2',
};

export const LETTERTYPE_FORMAAT: Record<LettertypeExtensie, string> = {
  otf: 'opentype',
  ttf: 'truetype',
  woff: 'woff',
  woff2: 'woff2',
};

/** Herkent een lettertype aan de eerste bytes, ongeacht hoe het bestand heet. Geeft null als het geen lettertype lijkt. */
export function herkenLettertype(bytes: Uint8Array): LettertypeExtensie | null {
  if (bytes.length < 4) return null;
  const kop = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
  if (kop === 'OTTO') return 'otf';
  if (kop === 'wOFF') return 'woff';
  if (kop === 'wOF2') return 'woff2';
  if (kop === 'true' || kop === 'ttcf' || (bytes[0] === 0 && bytes[1] === 1 && bytes[2] === 0 && bytes[3] === 0)) return 'ttf';
  return null;
}

export const extensieVan = (id: string): LettertypeExtensie | null => {
  const ext = id.split('.').pop() as LettertypeExtensie | undefined;
  return ext && (LETTERTYPE_EXTENSIES as readonly string[]).includes(ext) ? ext : null;
};

/**
 * Mag dit verzoek het lettertype ophalen? Alleen vanaf de eigen site (ook als die ingebed staat in een andere pagina:
 * het lettertype wordt dan opgevraagd door de kalender zelf). Weet de browser niet te zeggen waar het vandaan komt, dan laten we het door:
 * dan laadt het lettertype altijd, ook in een privacybrowser.
 */
export function ophalenToegestaan(kopjes: { secFetchSite: string | null; referer: string | null; host: string | null }): boolean {
  const { secFetchSite, referer, host } = kopjes;
  if (secFetchSite) return secFetchSite === 'same-origin' || secFetchSite === 'none';
  if (referer && host) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }
  return true;
}
