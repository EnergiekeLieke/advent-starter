'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Adventkalender from '@/components/Adventkalender';
import { leesConfig, type AdventConfig } from '@/lib/config';
import { bepaalNu, type Datum } from '@/lib/datum';

// Berichten tussen de editor (/beheer) en het voorbeeld in de iframe
export const BERICHT_CONFIG = 'advent-config';
export const BERICHT_KLAAR = 'advent-klaar';

// Hoe vaak we controleren of er een nieuwe dag is aangebroken terwijl de pagina openstaat
const CONTROLE_INTERVAL_MS = 5 * 60 * 1000;

interface Props {
  config: AdventConfig;
  /** De datum waarop de server de kalender heeft samengesteld */
  datum: Datum;
  /** Klopt de datum met vandaag? Dan verversen we de pagina zodra er een nieuwe dag begint. */
  live: boolean;
  widget: boolean;
  /** Voorbeeldmodus: ontvangt live instellingen van de editor in plaats van de opgeslagen versie */
  preview: boolean;
}

export default function KalenderPagina({ config, datum, live, widget, preview }: Props) {
  const router = useRouter();
  const [actueel, setActueel] = useState(config);

  useEffect(() => {
    setActueel(config);
  }, [config]);

  useEffect(() => {
    if (!preview) return;
    const opBericht = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== BERICHT_CONFIG) return;
      const uitkomst = leesConfig(e.data.config);
      if (uitkomst.ok) setActueel(uitkomst.config);
    };
    window.addEventListener('message', opBericht);
    window.parent.postMessage({ type: BERICHT_KLAAR }, window.location.origin);
    return () => window.removeEventListener('message', opBericht);
  }, [preview]);

  // Een pagina die over middernacht openblijft, haalt zelf de inhoud van het nieuwe deurtje op
  useEffect(() => {
    if (!live || preview) return;
    const controleer = () => {
      if (document.visibilityState !== 'visible') return;
      const nu = bepaalNu();
      if (nu.jaar !== datum.jaar || nu.maand !== datum.maand || nu.dag !== datum.dag) router.refresh();
    };
    document.addEventListener('visibilitychange', controleer);
    const timer = setInterval(controleer, CONTROLE_INTERVAL_MS);
    return () => {
      document.removeEventListener('visibilitychange', controleer);
      clearInterval(timer);
    };
  }, [live, preview, datum, router]);

  return <Adventkalender config={actueel} datum={datum} widget={widget} preview={preview} />;
}
