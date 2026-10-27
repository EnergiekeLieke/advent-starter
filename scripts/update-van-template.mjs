// Haalt de nieuwste versie van de adventkalender-starter op en zet die in deze repo.
//
// Je teksten, kleuren en logo staan in je Blob-opslag en niet in deze bestanden, dus die blijven bewaard.
// Alleen de code wordt vervangen. Wat dit script NOOIT aanraakt:
//   - config/advent.json (jouw eigen standaardinstellingen)
//   - .env-bestanden, .git, .github, node_modules, .next, .vercel en de map cursus
//   - bestanden die je zelf hebt toegevoegd en die niet in de template zitten
//
// Gebruik:
//   node scripts/update-van-template.mjs            de nieuwste versie
//   node scripts/update-van-template.mjs 1.2.0      een bepaalde versie
//   (op GitHub: Actions, Update van de template, Run workflow)
//
// Omgevingsvariabelen (alleen om te testen):
//   TEMPLATE_URL   waar de template staat (standaard de repo van Lieke)
//   VERSIE         de versie die je wilt (leeg is de nieuwste)

import { execFileSync } from 'node:child_process';
import {
  appendFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, rmdirSync, statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const TEMPLATE_URL = process.env.TEMPLATE_URL || 'https://github.com/EnergiekeLieke/advent-starter.git';
const GEWENST = (process.env.VERSIE || process.argv[2] || '').trim().replace(/^v/, '');
const WERKMAP = process.cwd();

// Mappen en bestanden die nooit worden overschreven of verwijderd
const UITGESLOTEN_MAPPEN = new Set(['.git', '.github', 'node_modules', '.next', '.vercel', 'cursus', 'out']);
const BEWAARD = new Set(['config/advent.json']);

function isUitgesloten(rel) {
  if (UITGESLOTEN_MAPPEN.has(rel.split('/')[0])) return true;
  const naam = rel.split('/').pop();
  if (naam.startsWith('.env') && naam !== '.env.example') return true;
  return naam === '.advent-config.local.json' || naam.endsWith('.tsbuildinfo');
}

// ─── Versies ──────────────────────────────────────────────────
const parseVersie = (tekst) => {
  const m = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(tekst);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
};
const vergelijk = (a, b) => {
  const [x, y] = [parseVersie(a), parseVersie(b)];
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};

function fout(bericht) {
  console.error(`\nDe update is niet gelukt: ${bericht}\n`);
  process.exit(1);
}

function git(args, opties = {}) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    ...opties,
  });
}

function beschikbareVersies() {
  let uitvoer;
  try {
    uitvoer = git(['ls-remote', '--tags', '--refs', TEMPLATE_URL]);
  } catch {
    fout(`ik kan de template niet bereiken (${TEMPLATE_URL}). Is de repo publiek, en heb je internet?`);
  }
  const lijst = [];
  for (const regel of uitvoer.split('\n')) {
    const ref = regel.split('\t')[1];
    const versie = ref?.replace('refs/tags/', '').replace(/^v/, '');
    if (versie && parseVersie(versie)) lijst.push({ versie, tag: ref.replace('refs/tags/', '') });
  }
  return lijst.sort((a, b) => vergelijk(a.versie, b.versie));
}

function huidigeVersie() {
  try {
    return JSON.parse(readFileSync(path.join(WERKMAP, 'package.json'), 'utf8')).version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

// ─── Bestanden ────────────────────────────────────────────────
function loop(map, voorvoegsel = '') {
  const bestanden = [];
  for (const naam of readdirSync(map)) {
    const rel = voorvoegsel ? `${voorvoegsel}/${naam}` : naam;
    if (isUitgesloten(rel)) continue;
    const volledig = path.join(map, naam);
    if (statSync(volledig).isDirectory()) bestanden.push(...loop(volledig, rel));
    else bestanden.push(rel);
  }
  return bestanden;
}

const gelijk = (a, b) => existsSync(a) && existsSync(b) && readFileSync(a).equals(readFileSync(b));

function ruimLegeMappenOp(rel) {
  let map = path.dirname(path.join(WERKMAP, rel));
  while (map !== WERKMAP && existsSync(map) && readdirSync(map).length === 0) {
    rmdirSync(map);
    map = path.dirname(map);
  }
}

function kloon(tag, doel) {
  git(['clone', '--quiet', '--depth', '1', '--branch', tag, TEMPLATE_URL, doel]);
}

// Wat er nieuw is: de stukken uit CHANGELOG.md tussen jouw versie (niet inbegrepen) en de nieuwe versie (wel)
function nieuwInChangelog(nieuweMap, van, tot) {
  const bestand = path.join(nieuweMap, 'CHANGELOG.md');
  if (!existsSync(bestand)) return '';
  const delen = readFileSync(bestand, 'utf8').split(/^(?=## v?\d+\.\d+\.\d+)/m).slice(1);
  return delen
    .filter((deel) => {
      const versie = /^## v?(\d+\.\d+\.\d+)/.exec(deel)[1];
      return vergelijk(versie, van) > 0 && vergelijk(versie, tot) <= 0;
    })
    .map((deel) => deel.trim())
    .join('\n\n');
}

function schrijfUitvoer(sleutel, waarde) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${sleutel}=${waarde}\n`);
}

function schrijfSamenvatting(tekst) {
  console.log(tekst);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${tekst}\n`);
}

// ─── Hoofdprogramma ───────────────────────────────────────────
const huidig = huidigeVersie();
const versies = beschikbareVersies();
if (versies.length === 0) fout('er is nog geen release van de template gevonden.');

const nieuwste = versies[versies.length - 1];
let doel = nieuwste;
if (GEWENST) {
  doel = versies.find((v) => v.versie === GEWENST);
  if (!doel) fout(`versie ${GEWENST} bestaat niet. Beschikbaar: ${versies.map((v) => v.versie).join(', ')}.`);
}

if (!GEWENST && vergelijk(doel.versie, huidig) <= 0) {
  schrijfSamenvatting(`## Je bent al bij\n\nJe gebruikt versie **${huidig}**${vergelijk(doel.versie, huidig) === 0 ? ', de nieuwste' : ` en dat is nieuwer dan de nieuwste release (${doel.versie})`}. Er is niets te updaten.`);
  schrijfUitvoer('gewijzigd', 'false');
  process.exit(0);
}

const werk = mkdtempSync(path.join(tmpdir(), 'advent-update-'));
try {
  const nieuweMap = path.join(werk, 'nieuw');
  kloon(doel.tag, nieuweMap);

  // De oude versie, om te zien welke bestanden de template niet meer heeft en welke jij hebt aangepast
  const oudeMap = path.join(werk, 'oud');
  const oudeTag = versies.find((v) => v.versie === huidig)?.tag;
  let oudeBestanden = [];
  if (oudeTag) {
    try {
      kloon(oudeTag, oudeMap);
      oudeBestanden = loop(oudeMap);
    } catch {
      oudeBestanden = [];
    }
  }

  const nieuweBestanden = loop(nieuweMap);
  const nieuweSet = new Set(nieuweBestanden);
  const nieuw = [];
  const bijgewerkt = [];
  const overschreven = [];
  const verwijderd = [];

  for (const rel of nieuweBestanden) {
    if (BEWAARD.has(rel)) continue;
    const bron = path.join(nieuweMap, rel);
    const doelPad = path.join(WERKMAP, rel);
    if (gelijk(bron, doelPad)) continue;
    if (existsSync(doelPad)) {
      bijgewerkt.push(rel);
      // Je hebt dit bestand zelf aangepast: dat gaat nu verloren (via de geschiedenis van GitHub is het terug te halen)
      if (oudeBestanden.includes(rel) && !gelijk(path.join(oudeMap, rel), doelPad)) overschreven.push(rel);
    } else {
      nieuw.push(rel);
    }
    mkdirSync(path.dirname(doelPad), { recursive: true });
    cpSync(bron, doelPad);
  }

  for (const rel of oudeBestanden) {
    if (nieuweSet.has(rel) || BEWAARD.has(rel)) continue;
    const doelPad = path.join(WERKMAP, rel);
    if (existsSync(doelPad)) {
      rmSync(doelPad);
      verwijderd.push(rel);
      ruimLegeMappenOp(rel);
    }
  }

  const gewijzigd = nieuw.length + bijgewerkt.length + verwijderd.length > 0;
  const lijst = (titel, items) => (items.length ? `\n**${titel}**\n\n${items.map((i) => `- \`${i}\``).join('\n')}\n` : '');
  const changelog = nieuwInChangelog(nieuweMap, huidig, doel.versie);

  schrijfSamenvatting([
    `## Update van versie ${huidig} naar ${doel.versie}`,
    '',
    gewijzigd
      ? `Gelukt: ${bijgewerkt.length} bestanden bijgewerkt, ${nieuw.length} nieuw, ${verwijderd.length} verwijderd.`
      : 'De bestanden waren al gelijk aan die versie. Er is niets gewijzigd.',
    'Je teksten, kleuren en logo staan in je opslag en zijn niet aangeraakt. Ook `config/advent.json` en je `.env`-bestanden zijn bewaard.',
    overschreven.length
      ? `\n**Let op: dit zijn bestanden die je zelf had aangepast. De update heeft ze vervangen.**\n\n${overschreven.map((i) => `- \`${i}\``).join('\n')}\n\nWil je je aanpassing terug? Open het bestand op GitHub, kies History en haal de oude versie op.`
      : '',
    changelog ? `\n### Wat is er nieuw?\n\n${changelog.replace(/^## /gm, '#### ')}` : '',
    lijst('Nieuwe bestanden', nieuw),
    lijst('Verwijderde bestanden', verwijderd),
  ].filter((deel) => deel !== '').join('\n'));

  schrijfUitvoer('gewijzigd', String(gewijzigd));
  schrijfUitvoer('doel', doel.versie);
} finally {
  rmSync(werk, { recursive: true, force: true });
}
