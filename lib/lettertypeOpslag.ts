import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { del, list, put } from '@vercel/blob';
import { LETTERTYPE_MIME, LETTERTYPE_VOORVOEGSEL, type LettertypeExtensie } from '@/lib/lettertypeBestand';
import { GeenOpslagFout, opslagModus } from '@/lib/opslag';

// Waar geüploade lettertypes staan: in dezelfde Blob-opslag als de instellingen, of (tijdens `npm run dev`) in een lokale map.
// De instellingen bewaren alleen de naam in de opslag. Het adres van het bestand blijft verborgen, het lettertype komt via /api/lettertype.
const LOKALE_MAP = path.join(process.cwd(), '.advent-uploads');
const OUDER_DAN_MS = 60 * 60 * 1000;

export async function bewaarLettertype(data: ArrayBuffer, ext: LettertypeExtensie): Promise<string> {
  const modus = opslagModus();
  if (modus === 'blob') {
    const blob = await put(`${LETTERTYPE_VOORVOEGSEL}.${ext}`, Buffer.from(data), {
      access: 'public',
      contentType: LETTERTYPE_MIME[ext],
      addRandomSuffix: true,
    });
    return blob.pathname;
  }
  if (modus === 'bestand') {
    const id = `lettertype-${randomUUID().replace(/-/g, '')}.${ext}`;
    await fs.mkdir(LOKALE_MAP, { recursive: true });
    await fs.writeFile(path.join(LOKALE_MAP, id), Buffer.from(data));
    return id;
  }
  throw new GeenOpslagFout();
}

/** De inhoud van een geüpload lettertype, of null als het niet (meer) bestaat. */
export async function leesLettertype(id: string): Promise<ArrayBuffer | null> {
  const modus = opslagModus();
  if (modus === 'blob') {
    const { blobs } = await list({ prefix: id, limit: 5 });
    const blob = blobs.find((b) => b.pathname === id);
    if (!blob) return null;
    const res = await fetch(blob.url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    return res.ok ? res.arrayBuffer() : null;
  }
  if (modus === 'bestand') {
    try {
      const buf = await fs.readFile(path.join(LOKALE_MAP, path.basename(id)));
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    } catch {
      return null;
    }
  }
  return null;
}

/** Verwijdert geüploade lettertypes die nergens meer in de instellingen staan (en al minstens een uur oud zijn). Fouten zijn niet erg. */
export async function ruimLettertypesOp(gebruikt: string[]): Promise<void> {
  if (opslagModus() !== 'blob') return;
  try {
    const { blobs } = await list({ prefix: LETTERTYPE_VOORVOEGSEL, limit: 100 });
    const oud = blobs
      .filter((b) => !gebruikt.includes(b.pathname) && Date.now() - new Date(b.uploadedAt).getTime() > OUDER_DAN_MS)
      .map((b) => b.url);
    if (oud.length > 0) await del(oud);
  } catch (fout) {
    console.error('Oude lettertypes opruimen mislukt:', fout);
  }
}
