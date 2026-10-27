import standaard from '@/config/advent.json';
import { configSchema, leesConfig, type AdventConfig } from '@/lib/config';
import { leesOpgeslagen } from '@/lib/opslag';

/** De standaardinstellingen uit config/advent.json. Dit bestand is altijd geldig. */
export const STANDAARD_CONFIG: AdventConfig = configSchema.parse(standaard);

/** Laadt de instellingen voor de pagina: opgeslagen via /beheer, anders config/advent.json. */
export async function laadConfig(): Promise<AdventConfig> {
  try {
    const opgeslagen = await leesOpgeslagen();
    if (opgeslagen) {
      const uitkomst = leesConfig(opgeslagen);
      if (uitkomst.ok) return uitkomst.config;
      console.error('Opgeslagen instellingen zijn ongeldig, standaardinstellingen gebruikt:', uitkomst.fouten);
    }
  } catch (fout) {
    console.error('Instellingen laden mislukt, standaardinstellingen gebruikt:', fout);
  }
  return STANDAARD_CONFIG;
}
