import { wisInlogCookie } from '@/lib/beheerAuth';

export async function POST() {
  await wisInlogCookie();
  return Response.json({ ok: true });
}
