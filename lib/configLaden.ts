import { cache } from 'react';
import standaard from '@/config/advent.json';
import { configSchema, leesConfig, type AdventConfig } from '@/lib/config';
import { leesOpgeslagen, opslagModus } from '@/lib/opslag';

/** De standaardinstellingen uit config/advent.json. Dit bestand is altijd geldig. */
export const STANDAARD_CONFIG: AdventConfig = configSchema.parse(standaard);

// De laatste geldige instellingen die deze server heeft gezien, voor als het ophalen een keer misgaat
let laatsteGoede: AdventConfig | null = null;

/**
 * Laadt de instellingen voor de pagina: opgeslagen via /beheer, anders config/advent.json.
 * Gaat het ophalen uit de opslag mis, dan tonen we de laatste goede instellingen. Is die er niet, dan geven we een fout
 * in plaats van de voorbeeldtekst: de bezoeker ziet dan geen verkeerde kalender, en de editor slaat de voorbeeldtekst
 * niet per ongeluk over de echte teksten heen.
 */
// cache() zorgt dat de pagina en de titel in dezelfde aanvraag maar één keer ophalen
export const laadConfig = cache(async (): Promise<AdventConfig> => {
  try {
    const opgeslagen = await leesOpgeslagen();
    if (opgeslagen) {
      const uitkomst = leesConfig(opgeslagen);
      if (uitkomst.ok) {
        laatsteGoede = uitkomst.config;
        return uitkomst.config;
      }
      console.error('Opgeslagen instellingen zijn ongeldig:', uitkomst.fouten);
      return laatsteGoede ?? STANDAARD_CONFIG;
    }
  } catch (fout) {
    console.error('Instellingen laden mislukt:', fout);
    if (laatsteGoede) return laatsteGoede;
    if (opslagModus() === 'blob') throw new Error('De instellingen konden niet worden opgehaald.');
  }
  return STANDAARD_CONFIG;
});
