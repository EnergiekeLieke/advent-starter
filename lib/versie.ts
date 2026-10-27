import pakket from '@/package.json';

// Welke versie draait er, en is er een nieuwere? De nieuwste versie lezen we uit het package.json van de template op GitHub.
// Dat bestand krijgt pas een nieuw versienummer bij een release (zie scripts/release.mjs). Lukt dat niet, dan vragen we de tags
// op via de GitHub-API. Gaat er helemaal iets mis (geen internet, limiet bereikt), dan zwijgen we: een melding over updates is
// nooit belangrijk genoeg om te storen.

export const HUIDIGE_VERSIE: string = pakket.version;

const TEMPLATE_REPO = process.env.TEMPLATE_REPO || 'EnergiekeLieke/advent-starter';
const RAW = process.env.TEMPLATE_RAW_BASE || 'https://raw.githubusercontent.com';
const API = process.env.TEMPLATE_API_BASE || 'https://api.github.com';
// Een half uur is kort genoeg om een nieuwe versie snel te melden, en lang genoeg om GitHub niet te belasten
const BEWAARTIJD_SECONDEN = 30 * 60;

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

async function viaPackageJson(haal: typeof fetch): Promise<string | null> {
  try {
    const res = await haal(`${RAW}/${TEMPLATE_REPO}/main/package.json`, {
      next: { revalidate: BEWAARTIJD_SECONDEN },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const versie = ((await res.json()) as { version?: unknown }).version;
    return typeof versie === 'string' && parse(versie) ? versie.replace(/^v/, '') : null;
  } catch {
    return null;
  }
}

async function viaTags(haal: typeof fetch): Promise<string | null> {
  try {
    const res = await haal(`${API}/repos/${TEMPLATE_REPO}/tags?per_page=50`, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: BEWAARTIJD_SECONDEN },
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

export async function haalNieuwsteVersie(haal: typeof fetch = fetch): Promise<string | null> {
  return (await viaPackageJson(haal)) ?? (await viaTags(haal));
}

/** Eigenaar en naam van de repo van deze kalender. Vercel geeft die mee, lokaal niet. */
export function eigenRepo(): { eigenaar: string; naam: string } | null {
  const eigenaar = process.env.VERCEL_GIT_REPO_OWNER;
  const naam = process.env.VERCEL_GIT_REPO_SLUG;
  return eigenaar && naam ? { eigenaar, naam } : null;
}

export interface VersieInfo {
  huidig: string;
  nieuwste: string | null;
  /** De repo van deze kalender op GitHub, als we die weten */
  repo: { eigenaar: string; naam: string } | null;
  /** De template waar updates vandaan komen, zoals owner/naam */
  template: string;
  /** De plek waar de workflow-tekst van de update-knop te vinden is */
  workflowUrl: string;
}

export async function versieInfo(): Promise<VersieInfo> {
  const nieuwste = await haalNieuwsteVersie();
  return {
    huidig: HUIDIGE_VERSIE,
    nieuwste: nieuwste && vergelijkVersies(nieuwste, HUIDIGE_VERSIE) > 0 ? nieuwste : null,
    repo: eigenRepo(),
    template: TEMPLATE_REPO,
    workflowUrl: `${RAW}/${TEMPLATE_REPO}/main/.github/workflows/update-van-template.yml`,
  };
}
