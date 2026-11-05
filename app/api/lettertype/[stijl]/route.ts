import { laadConfig } from '@/lib/configLaden';
import { extensieVan, LETTERTYPE_MIME, ophalenToegestaan } from '@/lib/lettertypeBestand';
import { leesLettertype } from '@/lib/lettertypeOpslag';

// Levert het eigen lettertype van de kalender uit. Alleen de kalender zelf mag het ophalen (ook als die ingebed staat in een andere pagina),
// zodat anderen er niet naar kunnen linken. Het bestand zelf kan een bezoeker nog steeds downloaden: de browser heeft het nodig om het te tonen.
export async function GET(req: Request, { params }: { params: Promise<{ stijl: string }> }) {
  const { stijl } = await params;
  if (stijl !== 'normaal' && stijl !== 'vet') return new Response(null, { status: 404 });

  const toegestaan = ophalenToegestaan({
    secFetchSite: req.headers.get('sec-fetch-site'),
    referer: req.headers.get('referer'),
    host: req.headers.get('x-forwarded-host') ?? req.headers.get('host'),
  });
  if (!toegestaan) return new Response('Dit lettertype is alleen te gebruiken op de website waar het bij hoort.', { status: 403 });

  const id = (await laadConfig()).eigenLettertype[stijl];
  const ext = id ? extensieVan(id) : null;
  if (!id || !ext) return new Response(null, { status: 404 });

  const data = await leesLettertype(id);
  if (!data) return new Response(null, { status: 404 });

  return new Response(data, {
    headers: {
      'Content-Type': LETTERTYPE_MIME[ext],
      // De pagina vraagt het met ?v=<naam in de opslag> op: een ander bestand geeft dus een ander adres, en de browser mag het jaren bewaren.
      // 'private' houdt het uit gedeelde caches, anders zou een andere site het uit de cache kunnen krijgen zonder dat we de afzender controleren.
      'Cache-Control': 'private, max-age=31536000, immutable',
      Vary: 'Sec-Fetch-Site, Referer',
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Resource-Policy': 'same-origin',
    },
  });
}
