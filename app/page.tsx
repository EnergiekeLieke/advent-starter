import KalenderPagina from '@/components/KalenderPagina';
import { isIngelogd } from '@/lib/beheerAuth';
import { laadConfig } from '@/lib/configLaden';
import { bepaalNu, datumUitParams, parseIso } from '@/lib/datum';
import { verbergToekomst } from '@/lib/gating';

type Params = Record<string, string | string[] | undefined>;
const eerste = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const config = await laadConfig();
  const beheerder = await isIngelogd();
  const nu = bepaalNu();

  // Alleen een ingelogde beheerder mag een andere datum simuleren (?datum= of ?day=) of het voorbeeld uit de editor openen.
  // Voor iedereen anders bepaalt de server de datum, zodat latere deurtjes niet vooruit te bekijken zijn.
  const start = parseIso(config.startDatum) ?? nu;
  const gesimuleerd = beheerder ? datumUitParams({ datum: eerste(params.datum), day: eerste(params.day) }, start) : null;
  const preview = beheerder && eerste(params.preview) === '1';
  const datum = gesimuleerd ?? nu;
  const embed = eerste(params.embed);

  return (
    <KalenderPagina
      // Een bezoeker krijgt alleen de inhoud van deurtjes die al open mogen, of alles in testmodus
      config={preview ? config : verbergToekomst(config, datum)}
      datum={datum}
      // Bij een gesimuleerde datum hoort de pagina niet vanzelf te verversen
      live={!gesimuleerd}
      // ?embed=true: compacte variant voor in een iframe (bijv. in Kennis Shop)
      widget={embed === 'true' || embed === '1'}
      // ?preview=1: voorbeeld binnen de editor
      preview={preview}
    />
  );
}
