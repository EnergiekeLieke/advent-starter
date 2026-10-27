import { isIngelogd } from '@/lib/beheerAuth';
import { leesConfig } from '@/lib/config';
import { bewaarConfig, GeenOpslagFout } from '@/lib/opslag';

export async function PUT(req: Request) {
  if (!(await isIngelogd())) {
    return Response.json({ fouten: ['Je bent niet ingelogd. Ververs de pagina en log opnieuw in.'] }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ fouten: ['De gegevens zijn onleesbaar.'] }, { status: 400 });

  const uitkomst = leesConfig(body);
  if (!uitkomst.ok) return Response.json({ fouten: uitkomst.fouten }, { status: 400 });

  try {
    await bewaarConfig(uitkomst.config);
  } catch (fout) {
    if (fout instanceof GeenOpslagFout) {
      return Response.json({
        fouten: ['Opslaan kan nog niet: er is geen Blob-opslag gekoppeld. Koppel er een in Vercel (Storage, Create, Blob) en deploy opnieuw. Tot die tijd kun je de instellingen exporteren.'],
      }, { status: 409 });
    }
    console.error('Opslaan mislukt:', fout);
    return Response.json({ fouten: ['Opslaan is niet gelukt. Probeer het zo nog eens.'] }, { status: 500 });
  }
  return Response.json({ ok: true, config: uitkomst.config });
}
