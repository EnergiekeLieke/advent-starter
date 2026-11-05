import { isIngelogd } from '@/lib/beheerAuth';
import { versieInfo } from '@/lib/versie';

// De knop Zoek naar updates: haalt de nieuwste versie meteen op, zonder te wachten op de bewaartijd van de pagina.
export async function GET() {
  if (!(await isIngelogd())) {
    return Response.json({ fout: 'Je bent niet ingelogd. Ververs de pagina en log opnieuw in.' }, { status: 401 });
  }
  return Response.json(await versieInfo(true));
}
