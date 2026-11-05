import type { AdventConfig } from '@/lib/config';
import { extensieVan, LETTERTYPE_FORMAAT } from '@/lib/lettertypeBestand';

type Eigen = AdventConfig['eigenLettertype'];

// Zet de lettertypes die de beheerder zelf heeft geüpload klaar onder de namen 'EigenLettertype' en 'EigenLettertype2'
// (zie LETTERTYPES.eigen en LETTERTYPES.eigen2 in lib/config.ts). De bestanden komen via /api/lettertype, dat alleen laadt vanaf de kalender zelf.
// De namen in de opslag zijn gevalideerd in lib/config.ts, dus er kan niets onverwachts in de stijl terechtkomen.
function css(eigen: Eigen, familie: string, normaalAdres: 'normaal' | 'normaal2', vetAdres: 'vet' | 'vet2'): string {
  const { normaal, vet } = eigen;
  const regel = (id: string, adres: string, gewicht: string) => {
    const ext = extensieVan(id);
    if (!ext) return '';
    return `@font-face{font-family:'${familie}';src:url('/api/lettertype/${adres}?v=${encodeURIComponent(id)}') format('${LETTERTYPE_FORMAAT[ext]}');font-weight:${gewicht};font-style:normal;font-display:swap}`;
  };
  if (!normaal && !vet) return '';
  // Is er maar één bestand, dan gebruiken we dat voor gewone en vette tekst
  return (normaal ? regel(normaal, normaalAdres, '400') : regel(vet, vetAdres, '400 700')) + (normaal && vet ? regel(vet, vetAdres, '700') : '');
}

export default function EigenLettertypeStijl({ eigen, eigen2 }: { eigen: Eigen; eigen2: Eigen }) {
  const tekst = css(eigen, 'EigenLettertype', 'normaal', 'vet') + css(eigen2, 'EigenLettertype2', 'normaal2', 'vet2');
  if (!tekst) return null;
  return <style dangerouslySetInnerHTML={{ __html: tekst }} />;
}
