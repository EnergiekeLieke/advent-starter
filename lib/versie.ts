import pakket from '@/package.json';

// Welke versie draait er, en is er een nieuwere? De nieuwste versie komt uit de tags van de template-repo op GitHub.
// Gaat er iets mis (geen internet, limiet bereikt), dan zwijgen we: een melding over updates is nooit belangrijk genoeg om te storen.

export const HUIDIGE_VERSIE: string = pakket.version;

const TEMPLATE_REPO = process.env.TEMPLATE_REPO || 'EnergiekeLieke/advent-starter';
const API = process.env.TEMPLATE_API_BASE || 'https://api.github.com';

const parse = (tekst: string) => {
  const m = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(tekst);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
};

/** Positief als a nieuwer is dan b, negatief als ouder, 0 als gelijk. */
export function vergelijkVersies(a: string, b: string): number {
  const x = parse(a);
  const y = parse(b);
  if (!x || !y) return 0;
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

export async function haalNieuwsteVersie(haal: typeof fetch = fetch): Promise<string | null> {
  try {
    const res = await haal(`${API}/repos/${TEMPLATE_REPO}/tags?per_page=50`, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 6 * 60 * 60 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const tags = (await res.json()) as { name?: string }[];
    const versies = tags.map((t) => t.name?.replace(/^v/, '') ?? '').filter((v) => parse(v));
    if (versies.length === 0) return null;
    return versies.reduce((nieuwste, v) => (vergelijkVersies(v, nieuwste) > 0 ? v : nieuwste));
  } catch {
    return null;
  }
}

/** De pagina op GitHub waar je de update start. Vercel geeft de eigenaar en naam van je repo mee, lokaal niet. */
export function updateLink(): string | null {
  const eigenaar = process.env.VERCEL_GIT_REPO_OWNER;
  const naam = process.env.VERCEL_GIT_REPO_SLUG;
  return eigenaar && naam ? `https://github.com/${eigenaar}/${naam}/actions/workflows/update-van-template.yml` : null;
}

export interface VersieInfo {
  huidig: string;
  nieuwste: string | null;
  updateUrl: string | null;
}

export async function versieInfo(): Promise<VersieInfo> {
  const nieuwste = await haalNieuwsteVersie();
  return { huidig: HUIDIGE_VERSIE, nieuwste: nieuwste && vergelijkVersies(nieuwste, HUIDIGE_VERSIE) > 0 ? nieuwste : null, updateUrl: updateLink() };
}
