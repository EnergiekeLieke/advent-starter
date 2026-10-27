export interface Datum { jaar: number; maand: number; dag: number }

const MAANDEN = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
];
const MAANDEN_KORT = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

export function parseIso(iso: string): Datum | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? { jaar: Number(m[1]), maand: Number(m[2]), dag: Number(m[3]) } : null;
}

const dagNummer = (d: Datum) => Math.round(Date.UTC(d.jaar, d.maand - 1, d.dag) / 86_400_000);

export function verschilInDagen(van: Datum, tot: Datum): number {
  return dagNummer(tot) - dagNummer(van);
}

export function plusDagen(d: Datum, n: number): Datum {
  const t = new Date(Date.UTC(d.jaar, d.maand - 1, d.dag + n));
  return { jaar: t.getUTCFullYear(), maand: t.getUTCMonth() + 1, dag: t.getUTCDate() };
}

export const labelKort = (d: Datum) => `${d.dag} ${MAANDEN_KORT[d.maand - 1]}`;
export const labelLang = (d: Datum) => `${d.dag} ${MAANDEN[d.maand - 1]}`;
export const isoVan = (d: Datum) => `${d.jaar}${String(d.maand).padStart(2, '0')}${String(d.dag).padStart(2, '0')}`;

export function bepaalNu(): Datum {
  const [jaar, maand, dag] = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' })
    .format(new Date()).split('-').map(Number);
  return { jaar, maand, dag };
}

// Testhulp voor de beheerder: ?datum=2026-12-10 simuleert een volledige datum, ?day=5 de 5e dag van de kalender.
// Geeft null als er geen (geldige) simulatie is opgegeven.
export function datumUitParams(params: { datum?: string; day?: string }, start: Datum): Datum | null {
  const dag = Number(params.day);
  if (params.day !== undefined && Number.isInteger(dag) && dag >= 1 && dag <= 31) return plusDagen(start, dag - 1);
  return params.datum ? parseIso(params.datum) : null;
}
