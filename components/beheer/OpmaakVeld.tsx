'use client';

import { useId, useLayoutEffect, useRef, useState } from 'react';
import { INPUT, KNOP } from '@/components/beheer/velden';
import { wisselOpmaak, type Opmaak } from '@/lib/opmaak';

// Een tekstvak met de knoppen B, I en U voor vet, cursief en onderstreept.
// De opmaak staat in de tekst als **vet**, *cursief* en ++onderstreept++ (zie lib/opmaak.tsx).
// Dit bestand is in de cadeautje-starter en de advent-starter hetzelfde.

const KNOPPEN: { opmaak: Opmaak; letter: string; naam: string; toets: string; stijl: string }[] = [
  { opmaak: 'vet', letter: 'B', naam: 'Vet', toets: 'B', stijl: 'font-bold' },
  { opmaak: 'cursief', letter: 'I', naam: 'Cursief', toets: 'I', stijl: 'italic' },
  { opmaak: 'onderstreept', letter: 'U', naam: 'Onderstreept', toets: 'U', stijl: 'underline' },
];

interface Props {
  label: string;
  value: string;
  onChange: (waarde: string) => void;
  maxLength: number;
  rows?: number;
  /** Staat er een hint onder het vak, bijvoorbeeld het aantal tekens */
  hint?: string;
}

export default function OpmaakVeld({ label, value, onChange, maxLength, rows = 4, hint }: Props) {
  const id = useId();
  const veld = useRef<HTMLTextAreaElement>(null);
  // Na een klik op een knop zetten we de selectie terug, zodra de nieuwe tekst getekend is
  const volgendeSelectie = useRef<{ van: number; tot: number } | null>(null);
  const [melding, setMelding] = useState('');

  useLayoutEffect(() => {
    const sel = volgendeSelectie.current;
    if (!sel || !veld.current) return;
    volgendeSelectie.current = null;
    veld.current.focus();
    veld.current.setSelectionRange(sel.van, sel.tot);
  });

  function pasToe(opmaak: Opmaak) {
    const el = veld.current;
    if (!el) return;
    const uitkomst = wisselOpmaak({ tekst: el.value, van: el.selectionStart, tot: el.selectionEnd }, opmaak, maxLength);
    if (!uitkomst) {
      setMelding(`Dat past er niet meer bij: de tekst mag maximaal ${maxLength} tekens zijn.`);
      return;
    }
    setMelding('');
    volgendeSelectie.current = { van: uitkomst.van, tot: uitkomst.tot };
    onChange(uitkomst.tekst);
  }

  function opToets(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
    const knop = KNOPPEN.find((k) => k.toets.toLowerCase() === e.key.toLowerCase());
    if (!knop) return;
    e.preventDefault();
    pasToe(knop.opmaak);
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      <div role="toolbar" aria-label="Opmaak van de tekst" className="mb-1 flex items-center gap-1.5">
        {KNOPPEN.map((k) => (
          <button
            key={k.opmaak}
            type="button"
            // Met onMouseDown houden we de selectie in het tekstvak, anders verdwijnt die bij een klik op de knop
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pasToe(k.opmaak)}
            title={`${k.naam} (Ctrl+${k.toets})`}
            aria-label={k.naam}
            className={`${KNOP} min-w-9 !px-2.5 !py-1 ${k.stijl}`}
          >
            {k.letter}
          </button>
        ))}
        <span className="ml-1 text-xs text-slate-500">Selecteer tekst en klik op B, I of U.</span>
      </div>
      <textarea
        id={id}
        ref={veld}
        className={INPUT}
        rows={rows}
        value={value}
        maxLength={maxLength}
        onChange={(e) => {
          setMelding('');
          onChange(e.target.value);
        }}
        onKeyDown={opToets}
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {melding && <span role="alert" className="mt-1 block text-xs text-red-700">{melding}</span>}
    </div>
  );
}
