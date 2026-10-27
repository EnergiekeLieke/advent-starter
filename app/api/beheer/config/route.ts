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
        fouten: ['Opslaan kan nog niet: er is geen Blob-opslag gekoppeld. Koppel er een in Vercel (Storage, Create, Blob, en koppel hem aan dit project) en deploy daarna opnieuw, want een bestaande deployment ziet een nieuwe koppeling pas na een nieuwe deploy. Verwacht Vercel de variabele BLOB_READ_WRITE_TOKEN of BLOB_STORE_ID? Die moet bij Settings, Environment Variables staan. Tot die tijd kun je de instellingen exporteren.'],
      }, { status: 409 });
    }
    console.error('Opslaan mislukt:', fout);
    // De melding gaat alleen naar de ingelogde beheerder en helpt bij het vinden van de oorzaak (bijvoorbeeld een opslag die op privé staat)
    const detail = fout instanceof Error ? (fout.message.split('\n')[0] ?? '').slice(0, 200) : '';
    return Response.json({ fouten: ['Opslaan is niet gelukt. Probeer het zo nog eens.', ...(detail ? [`Technische melding: ${detail}`] : [])] }, { status: 500 });
  }
  return Response.json({ ok: true, config: uitkomst.config });
}
