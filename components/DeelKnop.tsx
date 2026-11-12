'use client';

import { useEffect, useRef, useState } from 'react';
import { deelBericht, deelLinks, deelTekst, kopieerNaarKlembord } from '@/lib/delen';

interface Props {
  titel: string;
  /** De eigen tekst uit de instellingen; leeg is de standaardtekst */
  sjabloon: string;
  /** De link om te delen (dezelfde als in de agenda-herinnering); leeg is de pagina waar de kalender nu opent */
  eigenLink: string;
  className: string;
}

const ITEM = 'block w-full rounded-lg px-3 py-2 text-left text-sm text-inkt hover:bg-goud/20 focus-visible:outline-goud';

export default function DeelKnop({ titel, sjabloon, eigenLink, className }: Props) {
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState('');
  const [melding, setMelding] = useState('');
  const [kanDelen, setKanDelen] = useState(false);
  const houder = useRef<HTMLDivElement>(null);
  const knop = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setKanDelen(typeof navigator !== 'undefined' && typeof navigator.share === 'function');
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);

  // Sluiten met Escape, met een klik ernaast of als de focus het menu verlaat
  useEffect(() => {
    if (!open) return;
    const sluit = (terugNaarKnop: boolean) => {
      setOpen(false);
      setMelding('');
      if (terugNaarKnop) knop.current?.focus();
    };
    const opToets = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); sluit(true); }
    };
    const opKlik = (e: PointerEvent) => {
      if (houder.current && !houder.current.contains(e.target as Node)) sluit(false);
    };
    const opFocus = (e: FocusEvent) => {
      if (houder.current && e.relatedTarget instanceof Node && !houder.current.contains(e.relatedTarget)) sluit(false);
    };
    window.addEventListener('keydown', opToets, true);
    window.addEventListener('pointerdown', opKlik);
    const el = houder.current;
    el?.addEventListener('focusout', opFocus);
    return () => {
      window.removeEventListener('keydown', opToets, true);
      window.removeEventListener('pointerdown', opKlik);
      el?.removeEventListener('focusout', opFocus);
    };
  }, [open]);

  const tekst = deelTekst(titel, sjabloon);
  const links = deelLinks(titel, tekst, link);

  function wissel() {
    if (!open) {
      // De link bepalen we pas bij het openen, want de pagina-url kennen we alleen in de browser
      setLink(eigenLink || `${window.location.origin}${window.location.pathname}`);
    }
    setOpen((o) => !o);
    setMelding('');
  }

  function sluitNa(ms: number) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setOpen(false); setMelding(''); }, ms);
  }

  async function kopieer() {
    const gelukt = await kopieerNaarKlembord(deelBericht(tekst, link), houder.current ?? document.body);
    setMelding(gelukt ? 'Gekopieerd! Plak het maar in een bericht.' : 'Kopiëren lukt niet. Gebruik een van de andere opties.');
    if (gelukt) sluitNa(1800);
  }

  async function deelViaToestel() {
    try {
      await navigator.share({ title: titel, text: tekst, url: link });
      setOpen(false);
    } catch (fout) {
      // Zelf annuleren is geen fout. Is delen hier niet toegestaan (bijvoorbeeld in een iframe zonder toestemming), dan verbergen we de keuze.
      if (fout instanceof DOMException && fout.name === 'AbortError') return;
      setKanDelen(false);
      setMelding('Delen via je toestel lukt hier niet. Kies een van de andere opties.');
    }
  }

  return (
    <div ref={houder} className="relative inline-block">
      <button
        ref={knop}
        type="button"
        data-kleur="accent"
        onClick={wissel}
        aria-expanded={open}
        aria-controls="adv-deelmenu"
        className={className}
      >
        Deel met anderen
      </button>
      {open && (
        <div
          id="adv-deelmenu"
          role="group"
          aria-label="Deel de kalender"
          className="absolute left-1/2 top-full z-30 mt-2 w-64 max-w-[85vw] -translate-x-1/2 rounded-xl border border-goud/60 bg-licht p-2 text-left shadow-xl"
        >
          <button type="button" onClick={kopieer} className={ITEM} autoFocus>Kopieer tekst en link</button>
          <a href={links.whatsapp} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={ITEM}>WhatsApp</a>
          <a href={links.mail} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={ITEM}>E-mail</a>
          <a href={links.facebook} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={ITEM}>Facebook</a>
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={ITEM}>LinkedIn</a>
          {kanDelen && <button type="button" onClick={deelViaToestel} className={ITEM}>Meer opties…</button>}
          <p role="status" aria-live="polite" className={melding ? 'px-3 pb-1 pt-2 text-xs text-inkt/80' : 'sr-only'}>{melding}</p>
        </div>
      )}
    </div>
  );
}
