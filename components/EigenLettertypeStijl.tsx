import type { AdventConfig } from '@/lib/config';
import { extensieVan, LETTERTYPE_FORMAAT } from '@/lib/lettertypeBestand';

// Zet het lettertype dat de beheerder zelf heeft geüpload klaar onder de naam 'EigenLettertype' (zie LETTERTYPES.eigen in lib/config.ts).
// Het bestand komt via /api/lettertype, dat alleen laadt vanaf de kalender zelf. De naam in de opslag is gevalideerd in lib/config.ts,
// dus er kan niets onverwachts in de stijl terechtkomen.
export default function EigenLettertypeStijl({ eigen }: { eigen: AdventConfig['eigenLettertype'] }) {
  const { normaal, vet } = eigen;
  if (!normaal && !vet) return null;

  const regel = (id: string, stijl: 'normaal' | 'vet', gewicht: string) => {
    const ext = extensieVan(id);
    if (!ext) return '';
    return `@font-face{font-family:'EigenLettertype';src:url('/api/lettertype/${stijl}?v=${encodeURIComponent(id)}') format('${LETTERTYPE_FORMAAT[ext]}');font-weight:${gewicht};font-style:normal;font-display:swap}`;
  };
  // Is er maar één bestand, dan gebruiken we dat voor gewone en vette tekst
  const css = [
    normaal ? regel(normaal, 'normaal', '400') : regel(vet, 'vet', '400 700'),
    normaal && vet ? regel(vet, 'vet', '700') : '',
  ].join('');

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
