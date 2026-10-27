import { wachtwoordIngesteld, wachtwoordKlopt, zetInlogCookie } from '@/lib/beheerAuth';

export async function POST(req: Request) {
  if (!wachtwoordIngesteld()) {
    return Response.json({ fout: 'Er is nog geen wachtwoord ingesteld. Zet BEHEER_WACHTWOORD in Vercel (Settings, Environment Variables) en deploy opnieuw.' }, { status: 400 });
  }
  const body = await req.json().catch(() => null);
  const wachtwoord = typeof body?.wachtwoord === 'string' ? body.wachtwoord : '';
  if (!wachtwoordKlopt(wachtwoord)) {
    // Kleine vertraging maakt gokken lastiger
    await new Promise((klaar) => setTimeout(klaar, 600));
    return Response.json({ fout: 'Dat wachtwoord klopt niet.' }, { status: 401 });
  }
  await zetInlogCookie();
  return Response.json({ ok: true });
}
