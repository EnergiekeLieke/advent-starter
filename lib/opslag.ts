import { promises as fs } from 'node:fs';
import path from 'node:path';
import { list, put } from '@vercel/blob';
import { revalidateTag, unstable_cache } from 'next/cache';
import type { AdventConfig } from '@/lib/config';

// Waar de instellingen van de kalender bewaard worden:
// - 'blob':    Vercel Blob (productie, zodra je in Vercel een Blob-opslag hebt gekoppeld)
// - 'bestand': een lokaal bestand, alleen tijdens `npm run dev`
// - 'geen':    nergens, dan geldt config/advent.json
export type OpslagModus = 'blob' | 'bestand' | 'geen';

export const CONFIG_TAG = 'advent-config';
const BLOB_PAD = 'advent/config.json';
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

async function leesBlob(): Promise<unknown | null> {
  const { blobs } = await list({ prefix: BLOB_PAD, limit: 5 });
  const blob = blobs.find((b) => b.pathname === BLOB_PAD);
  if (!blob) return null;
  // De uploadtijd in de url voorkomt dat de CDN een oudere versie blijft tonen
  const res = await fetch(`${blob.url}?v=${new Date(blob.uploadedAt).getTime()}`, { cache: 'no-store' });
  return res.ok ? res.json() : null;
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
    await put(BLOB_PAD, json, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } else {
    await fs.writeFile(LOKAAL_BESTAND, json, 'utf8');
  }
  revalidateTag(CONFIG_TAG, { expire: 0 });
}
