import type { AdventConfig, AdventDag } from '@/lib/config';
import { parseIso, verschilInDagen, type Datum } from '@/lib/datum';

// Wat een bezoeker (nog) niet mag zien. Alleen de server gebruikt dit, zodat teksten, links en
// afbeeldingen van latere deurtjes nooit in de pagina terechtkomen voordat het deurtje open mag.
const LEEG_DEURTJE: AdventDag = { titel: '', tekst: '', soort: 'tekst', knop: { aan: false, label: '', url: '' }, afbeelding: '' };

/** Het aantal deurtjes dat op deze datum open mag. In testmodus zijn dat alle deurtjes. */
export function aantalOpenDeurtjes(config: AdventConfig, vandaag: Datum): number {
  if (config.testmodus) return config.aantalDagen;
  const start = parseIso(config.startDatum);
  if (!start) return 0;
  const verschil = verschilInDagen(start, vandaag);
  if (verschil < 0) return 0;
  return Math.min(config.aantalDagen, verschil + 1);
}

/** Een kopie van de instellingen zonder de inhoud van deurtjes die nog dicht horen te zijn. */
export function verbergToekomst(config: AdventConfig, vandaag: Datum): AdventConfig {
  const open = aantalOpenDeurtjes(config, vandaag);
  return {
    ...config,
    // Deurtjes voorbij het aantal worden nooit getoond, dus die sturen we ook niet mee
    dagen: Array.from({ length: config.aantalDagen }, (_, i) => (i < open && config.dagen[i] ? config.dagen[i] : LEEG_DEURTJE)),
  };
}
