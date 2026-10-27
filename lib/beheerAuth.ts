import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

// Eenvoudige beveiliging van /beheer: één wachtwoord uit de omgevingsvariabele BEHEER_WACHTWOORD.
// Na inloggen krijgt de browser een cookie met een afgeleide code (nooit het wachtwoord zelf).
const COOKIE = 'advent-beheer';

const afgeleid = (tekst: string) => createHmac('sha256', 'advent-beheer-v1').update(tekst).digest();

export const wachtwoordIngesteld = () => Boolean(process.env.BEHEER_WACHTWOORD);

export function wachtwoordKlopt(invoer: string): boolean {
  const echt = process.env.BEHEER_WACHTWOORD;
  if (!echt) return false;
  return timingSafeEqual(afgeleid(invoer), afgeleid(echt));
}

export async function isIngelogd(): Promise<boolean> {
  const echt = process.env.BEHEER_WACHTWOORD;
  if (!echt) return false;
  const waarde = (await cookies()).get(COOKIE)?.value;
  if (!waarde) return false;
  const verwacht = afgeleid(echt).toString('hex');
  return waarde.length === verwacht.length && timingSafeEqual(Buffer.from(waarde), Buffer.from(verwacht));
}

export async function zetInlogCookie(): Promise<void> {
  const echt = process.env.BEHEER_WACHTWOORD;
  if (!echt) return;
  (await cookies()).set(COOKIE, afgeleid(echt).toString('hex'), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function wisInlogCookie(): Promise<void> {
  (await cookies()).delete(COOKIE);
}
