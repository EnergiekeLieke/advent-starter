'use client';

import { useEffect, useState } from 'react';
import { KNOP, KNOP_PRIMAIR, type Bericht } from '@/components/beheer/velden';
import type { VersieInfo } from '@/lib/versie';

const WORKFLOW_PAD = '.github/workflows/update-van-template.yml';

export default function UpdatesTab({ versie }: { versie: VersieInfo }) {
  const [workflow, setWorkflow] = useState<string | null>(null);
  const [laden, setLaden] = useState(true);
  const [bericht, setBericht] = useState<Bericht>(null);

  // De tekst van de update-knop halen we bij de template zelf op, zodat hij altijd de nieuwste is
  useEffect(() => {
    let weg = false;
    fetch(versie.workflowUrl)
      .then((res) => (res.ok ? res.text() : null))
      .then((tekst) => { if (!weg) setWorkflow(tekst); })
      .catch(() => { if (!weg) setWorkflow(null); })
      .finally(() => { if (!weg) setLaden(false); });
    return () => { weg = true; };
  }, [versie.workflowUrl]);

  const repo = versie.repo;
  const repoUrl = repo ? `https://github.com/${repo.eigenaar}/${repo.naam}` : null;
  // GitHub opent met deze link een nieuw bestand waarin de naam en de inhoud al zijn ingevuld
  const installeerUrl = repoUrl && workflow ? `${repoUrl}/new/main?filename=${WORKFLOW_PAD}&value=${encodeURIComponent(workflow)}` : null;
  const startUrl = repoUrl ? `${repoUrl}/actions/workflows/update-van-template.yml` : null;

  async function kopieer() {
    if (!workflow) return;
    try {
      await navigator.clipboard.writeText(workflow);
      setBericht({ soort: 'ok', regels: ['De tekst staat op je klembord. Plak hem in het nieuwe bestand op GitHub.'] });
    } catch {
      setBericht({ soort: 'fout', regels: ['Kopiëren lukt niet in deze browser. Open de tekst via de link hieronder en kopieer hem zelf.'] });
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
        <p>
          Je gebruikt versie <strong>{versie.huidig}</strong>.{' '}
          {versie.nieuwste ? (
            <>Er is een nieuwe versie: <strong>{versie.nieuwste}</strong>.</>
          ) : (
            'Er is geen nieuwere versie gevonden.'
          )}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Een update vervangt alleen de code van je kalender. Je teksten, kleuren en logo staan in je eigen opslag en blijven bewaard.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Stap 1: zet de update-knop in je GitHub-repo (eenmalig)</h2>
        <p className="text-sm text-slate-700">
          Ben je gestart met de Deploy-knop van Vercel? Dan heeft Vercel de update-knop niet voor je meegekopieerd. Je zet hem één keer zelf neer, en dat gaat met één klik.
          Staat de update-knop er al (je ziet hem op GitHub bij <strong>Actions</strong>)? Dan kun je deze stap overslaan.
        </p>
        {installeerUrl ? (
          <>
            <a href={installeerUrl} target="_blank" rel="noopener noreferrer" className={`${KNOP_PRIMAIR} inline-block`}>
              Installeer de update-knop op GitHub
            </a>
            <ol className="ml-5 list-decimal space-y-1 text-sm text-slate-700">
              <li>GitHub opent een nieuw bestand. De naam en de inhoud zijn al ingevuld, daar hoef je niets aan te veranderen.</li>
              <li>Klik rechtsboven op <strong>Commit changes...</strong> en daarna in het venster op de groene knop <strong>Commit changes</strong>.</li>
              <li>Klaar. Ga terug naar deze pagina voor stap 2.</li>
            </ol>
          </>
        ) : laden ? (
          <p className="text-sm text-slate-500">Even kijken...</p>
        ) : (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              {repoUrl
                ? 'Ik kan de tekst van de update-knop nu niet ophalen. Je kunt hem ook zelf neerzetten:'
                : 'Ik weet niet in welke GitHub-repo je kalender staat. Je kunt de update-knop zelf neerzetten:'}
            </p>
            <ol className="ml-5 list-decimal space-y-1">
              <li>Open je repo op GitHub, klik op <strong>Add file</strong> en dan op <strong>Create new file</strong>.</li>
              <li>Typ als naam <code className="font-mono text-xs">{WORKFLOW_PAD}</code>. Typ de schuine strepen gewoon mee, GitHub maakt de mappen vanzelf.</li>
              <li>Plak de tekst van <a className="underline" href={versie.workflowUrl} target="_blank" rel="noopener noreferrer">dit bestand</a> in het grote vak en klik op <strong>Commit changes</strong>.</li>
            </ol>
          </div>
        )}
        {workflow && (
          <button type="button" onClick={kopieer} className={KNOP}>Kopieer de tekst van de update-knop</button>
        )}
        {bericht && (
          <div
            role={bericht.soort === 'fout' ? 'alert' : 'status'}
            className={`rounded-lg border p-3 text-sm ${bericht.soort === 'ok' ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-red-300 bg-red-50 text-red-900'}`}
          >
            {bericht.regels.map((r) => <p key={r}>{r}</p>)}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Stap 2: start de update</h2>
        <ol className="ml-5 list-decimal space-y-1 text-sm text-slate-700">
          <li>Klik op de knop hieronder. Je komt op GitHub bij <strong>Update van de template</strong>.</li>
          <li>Klik rechts op <strong>Run workflow</strong> en daarna op de groene knop <strong>Run workflow</strong>. Laat het vak &quot;Versie&quot; leeg om de nieuwste te krijgen.</li>
          <li>Wacht tot de run een groen vinkje heeft (ongeveer een halve minuut). Open de run om te zien wat er is veranderd.</li>
          <li>Vercel zet de nieuwe versie daarna vanzelf online, dat duurt ongeveer 1 tot 2 minuten. Ververs deze pagina met Ctrl+F5.</li>
        </ol>
        {startUrl ? (
          <a href={startUrl} target="_blank" rel="noopener noreferrer" className={`${KNOP} inline-block`}>Naar de update-knop op GitHub</a>
        ) : (
          <p className="text-xs text-slate-500">Open je repo op GitHub, ga naar <strong>Actions</strong> en kies <strong>Update van de template</strong>.</p>
        )}
        <p className="text-xs text-slate-500">
          Zie je bij Actions een melding dat workflows uit staan? Klik dan op de groene knop om ze aan te zetten.
          Heb je zelf code in je repo aangepast? De update vervangt die bestanden en laat in het resultaat zien welke dat waren.
        </p>
      </section>

      <section className="space-y-1 text-sm text-slate-700">
        <h2 className="text-sm font-semibold">Liever met Claude Code of de terminal?</h2>
        <p>
          Heb je een kopie van je repo op je computer? Dan draai je <code className="font-mono text-xs">npm run update</code>. Daarna sla je de wijzigingen zelf op met git
          (<code className="font-mono text-xs">git add -A</code>, <code className="font-mono text-xs">git commit</code> en <code className="font-mono text-xs">git push</code>).
        </p>
      </section>
    </div>
  );
}
