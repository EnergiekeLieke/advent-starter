import { promises as fs } from 'node:fs';
import path from 'node:path';
import { del, list, put } from '@vercel/blob';
import { revalidateTag, unstable_cache } from 'next/cache';
import { CONFIG_BASISNAAM, CONFIG_VOORVOEGSEL, isConfigBlob, isVasteNaam, nieuwsteConfigBlob } from '@/lib/blobKeuze';
import type { AdventConfig } from '@/lib/config';

// Waar de instellingen van de kalender bewaard worden:
// - 'blob':    Vercel Blob (productie, zodra je in Vercel een Blob-opslag hebt gekoppeld)
// - 'bestand': een lokaal bestand, alleen tijdens `npm run dev`
// - 'geen':    nergens, dan geldt config/advent.json
export type OpslagModus = 'blob' | 'bestand' | 'geen';

export const CONFIG_TAG = 'advent-config';
const LOKAAL_BESTAND = path.join(process.cwd(), '.advent-config.local.json');

// Een gekoppelde Blob-opslag herken je aan een van twee omgevingsvariabelen. Oudere koppelingen en handmatig gemaakte opslag
// geven een BLOB_READ_WRITE_TOKEN. Nieuwe koppelingen werken standaard via OIDC en geven een BLOB_STORE_ID (het pakket
// @vercel/blob logt dan zelf in). Beide moeten werken, anders zie je 'geen opslag gekoppeld' terwijl hij er wel is.
export const BLOB_OMGEVINGSVARIABELEN = ['BLOB_READ_WRITE_TOKEN', 'BLOB_STORE_ID'] as const;
const blobGekoppeld = () => BLOB_OMGEVINGSVARIABELEN.some((naam) => Boolean(process.env[naam]));

export function opslagModus(): OpslagModus {
  if (blobGekoppeld()) return 'blob';
  if (process.env.NODE_ENV === 'development') return 'bestand';
  return 'geen';
}

const TIJDSLIMIET_MS = 5000;

// Het pakket probeert bij een storing zelf tot 10 keer opnieuw en luistert daarbij niet naar een abortSignal. Zonder deze limiet
// blijft een pagina dan minutenlang hangen. Het werk loopt op de achtergrond nog even door, maar de bezoeker krijgt snel een antwoord.
function metTijdslimiet<T>(werk: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const limiet = new Promise<never>((_, afwijzen) => {
    timer = setTimeout(() => afwijzen(new Error('De opslag antwoordt niet op tijd.')), ms);
  });
  return Promise.race([werk, limiet]).finally(() => clearTimeout(timer));
}

// Een kort haperende verbinding mag er niet voor zorgen dat de kalender zonder zijn teksten verschijnt
async function metHerhaling<T>(werk: () => Promise<T>, pogingen = 2): Promise<T> {
  let laatste: unknown;
  for (let i = 0; i < pogingen; i++) {
    try {
      return await werk();
    } catch (fout) {
      laatste = fout;
      if (i < pogingen - 1) await new Promise((klaar) => setTimeout(klaar, 300 * (i + 1)));
    }
  }
  throw laatste;
}

async function schrijfBlob(json: string): Promise<void> {
  // addRandomSuffix zet een willekeurig stuk in de naam, zodat het adres niet te raden is
  const nieuw = await metTijdslimiet(put(CONFIG_BASISNAAM, json, { access: 'public', contentType: 'application/json', addRandomSuffix: true }), 20_000);
  await ruimOudeOp(nieuw.pathname);
}

/** Verwijdert eerdere versies van de instellingen. Lukt dat niet, dan is dat niet erg: de nieuwste wint. */
async function ruimOudeOp(houd: string): Promise<void> {
  try {
    const { blobs } = await metTijdslimiet(list({ prefix: CONFIG_VOORVOEGSEL, limit: 100 }), TIJDSLIMIET_MS);
    const oud = blobs.filter((b) => isConfigBlob(b.pathname) && b.pathname !== houd).map((b) => b.url);
    if (oud.length > 0) await metTijdslimiet(del(oud), TIJDSLIMIET_MS);
  } catch (fout) {
    console.error('Oude instellingen opruimen mislukt:', fout);
  }
}

async function leesBlob(): Promise<unknown | null> {
  const { blobs } = await metTijdslimiet(list({ prefix: CONFIG_VOORVOEGSEL, limit: 100 }), TIJDSLIMIET_MS);
  const blob = nieuwsteConfigBlob(blobs);
  if (!blob) return null;
  // De uploadtijd in de url voorkomt dat de CDN een oudere versie blijft tonen.
  // Een mislukte lees geeft een fout en niet null: null betekent "er is nog niets opgeslagen", en dan zie je de voorbeeldtekst.
  const inhoud = await metHerhaling(async () => {
    const res = await fetch(`${blob.url}?v=${new Date(blob.uploadedAt).getTime()}`, { cache: 'no-store', signal: AbortSignal.timeout(TIJDSLIMIET_MS) });
    if (!res.ok) throw new Error(`Instellingen ophalen mislukt (${res.status})`);
    return res.json();
  });
  // Instellingen onder de oude, vaste naam verhuizen we naar een naam die niet te raden is
  if (isVasteNaam(blob.pathname)) {
    try {
      await schrijfBlob(JSON.stringify(inhoud, null, 2));
    } catch (fout) {
      console.error('Instellingen verhuizen naar een nieuwe naam mislukt:', fout);
    }
  }
  return inhoud;
}

// Hooguit eens per minuut naar Blob, en direct opnieuw na opslaan (zie bewaarConfig)
const leesBlobGecachet = unstable_cache(leesBlob, ['advent-config-blob'], { revalidate: 60, tags: [CONFIG_TAG] });

async function leesBestand(): Promise<unknown | null> {
  try {
    return JSON.parse(await fs.readFile(LOKAAL_BESTAND, 'utf8'));
  } catch {
    return null;
  }
}

/** Geeft de opgeslagen (nog niet gevalideerde) instellingen terug, of null als er niets is opgeslagen. */
export async function leesOpgeslagen(): Promise<unknown | null> {
  const modus = opslagModus();
  if (modus === 'blob') return leesBlobGecachet();
  if (modus === 'bestand') return leesBestand();
  return null;
}

export class GeenOpslagFout extends Error {
  constructor() {
    super('Er is nog geen opslag gekoppeld.');
  }
}

export async function bewaarConfig(config: AdventConfig): Promise<void> {
  const modus = opslagModus();
  if (modus === 'geen') throw new GeenOpslagFout();
  const json = JSON.stringify(config, null, 2);
  if (modus === 'blob') {
    await schrijfBlob(json);
  } else {
    await fs.writeFile(LOKAAL_BESTAND, json, 'utf8');
  }
  revalidateTag(CONFIG_TAG, { expire: 0 });
}
