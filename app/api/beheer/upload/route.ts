import { put } from '@vercel/blob';
import { isIngelogd } from '@/lib/beheerAuth';
import { opslagModus } from '@/lib/opslag';

const TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const MAX_BYTES = 2_000_000;

export async function POST(req: Request) {
  if (!(await isIngelogd())) {
    return Response.json({ fout: 'Je bent niet ingelogd. Ververs de pagina en log opnieuw in.' }, { status: 401 });
  }
  if (opslagModus() !== 'blob') {
    return Response.json({
      fout: 'Uploaden werkt zodra je in Vercel een Blob-opslag hebt gekoppeld. Plak ondertussen een link naar je afbeelding.',
    }, { status: 409 });
  }

  const form = await req.formData().catch(() => null);
  const bestand = form?.get('bestand');
  if (!(bestand instanceof File)) return Response.json({ fout: 'Er is geen bestand ontvangen.' }, { status: 400 });

  const ext = TYPES[bestand.type];
  if (!ext) return Response.json({ fout: 'Kies een png, jpg, webp of gif.' }, { status: 400 });
  if (bestand.size > MAX_BYTES) return Response.json({ fout: 'Dit bestand is groter dan 2 MB. Verklein het eerst.' }, { status: 400 });

  try {
    const blob = await put(`advent/upload-${Date.now()}.${ext}`, bestand, {
      access: 'public',
      contentType: bestand.type,
      addRandomSuffix: true,
    });
    return Response.json({ url: blob.url });
  } catch (fout) {
    console.error('Uploaden mislukt:', fout);
    return Response.json({ fout: 'Uploaden is niet gelukt. Probeer het zo nog eens.' }, { status: 500 });
  }
}
