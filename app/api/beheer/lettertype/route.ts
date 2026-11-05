import { isIngelogd } from '@/lib/beheerAuth';
import { herkenLettertype, LETTERTYPE_MAX_BYTES } from '@/lib/lettertypeBestand';
import { bewaarLettertype } from '@/lib/lettertypeOpslag';
import { GeenOpslagFout, opslagModus } from '@/lib/opslag';

export async function POST(req: Request) {
  if (!(await isIngelogd())) {
    return Response.json({ fout: 'Je bent niet ingelogd. Ververs de pagina en log opnieuw in.' }, { status: 401 });
  }
  if (opslagModus() === 'geen') {
    return Response.json({ fout: 'Uploaden werkt zodra je in Vercel een Blob-opslag hebt gekoppeld.' }, { status: 409 });
  }

  const form = await req.formData().catch(() => null);
  const bestand = form?.get('bestand');
  if (!(bestand instanceof File)) return Response.json({ fout: 'Er is geen bestand ontvangen.' }, { status: 400 });
  if (bestand.size > LETTERTYPE_MAX_BYTES) {
    return Response.json({ fout: 'Dit bestand is groter dan 2 MB. Zet het lettertype eerst om naar woff2, dat is veel kleiner.' }, { status: 400 });
  }

  const data = await bestand.arrayBuffer();
  // We kijken in het bestand zelf, want de naam of het type dat de browser opgeeft zegt niets zeker
  const ext = herkenLettertype(new Uint8Array(data));
  if (!ext) return Response.json({ fout: 'Dit lijkt geen lettertype. Kies een otf, ttf, woff of woff2.' }, { status: 400 });

  try {
    return Response.json({ id: await bewaarLettertype(data, ext) });
  } catch (fout) {
    if (fout instanceof GeenOpslagFout) {
      return Response.json({ fout: 'Uploaden werkt zodra je in Vercel een Blob-opslag hebt gekoppeld.' }, { status: 409 });
    }
    console.error('Lettertype uploaden mislukt:', fout);
    return Response.json({ fout: 'Uploaden is niet gelukt. Probeer het zo nog eens.' }, { status: 500 });
  }
}
