// Voor de maker van de template: zet een nieuwe versie klaar.
//
//   npm run release -- 1.1.0           controleert, bouwt, verhoogt het versienummer, commit en tagt
//   npm run release -- 1.1.0 --droog   alleen controleren en bouwen, zonder iets te wijzigen
//
// Het script pusht niets. Dat doe je zelf als alles klopt: git push && git push --tags
// Zet eerst een stuk "## v1.1.0" met wat er nieuw is in CHANGELOG.md.

import { execFileSync, execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const nieuw = (process.argv[2] || '').replace(/^v/, '');
const droog = process.argv.includes('--droog');

const stop = (bericht) => {
  console.error(`\n${bericht}\n`);
  process.exit(1);
};
const uitvoer = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const git = (args) => execFileSync('git', args, { stdio: 'inherit' });
// npm en npx zijn op Windows .cmd-bestanden en moeten als losse opdracht via de shell draaien
const npm = (opdracht) => execSync(opdracht, { stdio: 'inherit' });

const semver = (t) => /^(\d+)\.(\d+)\.(\d+)$/.exec(t)?.slice(1).map(Number);
const huidig = JSON.parse(readFileSync('package.json', 'utf8')).version;

if (!semver(nieuw)) stop('Geef een versie op, bijvoorbeeld: npm run release -- 1.1.0');
const [n, h] = [semver(nieuw), semver(huidig)];
const nieuwer = n[0] !== h[0] ? n[0] > h[0] : n[1] !== h[1] ? n[1] > h[1] : n[2] > h[2];
if (!nieuwer) stop(`Versie ${nieuw} is niet nieuwer dan de huidige versie (${huidig}).`);

if (uitvoer(['status', '--porcelain'])) stop('Er zijn nog wijzigingen die niet zijn gecommit. Commit of bewaar die eerst.');
if (!readFileSync('CHANGELOG.md', 'utf8').includes(`## v${nieuw}`)) stop(`Zet eerst een stuk "## v${nieuw}" in CHANGELOG.md met wat er nieuw is.`);
if (uitvoer(['tag', '--list', `v${nieuw}`])) stop(`De tag v${nieuw} bestaat al.`);

console.log('Controleren en bouwen...');
npm('npx tsc --noEmit');
npm('npm run build');

if (droog) {
  console.log(`\nDroog gedraaid: alles klopt voor versie ${nieuw}. Er is niets gewijzigd.`);
  process.exit(0);
}

// De versie is hierboven gecontroleerd op alleen cijfers en punten, dus veilig om in de opdracht te zetten
npm(`npm version ${nieuw} --no-git-tag-version`);
git(['add', 'package.json', 'package-lock.json']);
git(['commit', '-m', `Versie ${nieuw}`]);
git(['tag', '-a', `v${nieuw}`, '-m', `Versie ${nieuw}`]);

console.log(`\nKlaar: versie ${nieuw} is gecommit en getagd. Controleer het resultaat en publiceer met:\n  git push && git push --tags\n`);
