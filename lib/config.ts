import { z } from 'zod';
import { AUDIO_FOUTMELDING, audioGeldig, schoonAudio } from '@/lib/audio';
import { LETTERTYPE_ID_PATROON } from '@/lib/lettertypeBestand';

// ─── Lettertypes ──────────────────────────────────────────────
// Lato, Libre Baskerville en Poppins worden in app/layout.tsx met next/font geladen (van je eigen site, niet van Google).
// Verdana staat al op de meeste computers, daar valt het terug op een vergelijkbaar lettertype.
export const LETTERTYPES = {
  serif:       { naam: 'Klassiek (serif)',     stack: "Georgia, 'Times New Roman', serif" },
  sierlijk:    { naam: 'Sierlijk',             stack: "'Palatino Linotype', Palatino, 'Book Antiqua', serif" },
  sans:        { naam: 'Strak (sans-serif)',   stack: "system-ui, 'Segoe UI', Roboto, Arial, sans-serif" },
  rond:        { naam: 'Rond en vriendelijk',  stack: "'Trebuchet MS', 'Segoe UI', Verdana, sans-serif" },
  lato:        { naam: 'Lato',                 stack: "var(--font-lato), 'Segoe UI', Arial, sans-serif" },
  baskerville: { naam: 'Libre Baskerville',    stack: "var(--font-baskerville), Georgia, 'Times New Roman', serif" },
  poppins:     { naam: 'Poppins',              stack: "var(--font-poppins), 'Segoe UI', Arial, sans-serif" },
  verdana:     { naam: 'Verdana',              stack: "Verdana, Geneva, 'DejaVu Sans', sans-serif" },
  // Het lettertype dat de beheerder zelf uploadt (zie components/EigenLettertypeStijl.tsx). Zonder upload valt het terug op sans-serif.
  eigen:       { naam: 'Eigen lettertype 1',   stack: "'EigenLettertype', system-ui, 'Segoe UI', Arial, sans-serif" },
  eigen2:      { naam: 'Eigen lettertype 2',   stack: "'EigenLettertype2', system-ui, 'Segoe UI', Arial, sans-serif" },
} as const;

export type Lettertype = keyof typeof LETTERTYPES;
export const LETTERTYPE_SLEUTELS = ['serif', 'sierlijk', 'sans', 'rond', 'lato', 'baskerville', 'poppins', 'verdana', 'eigen', 'eigen2'] as const;

// Waar een lettertype voor kan worden ingezet. Leeg betekent: het standaard lettertype van die plek (zie `lettertypeVoor`).
export const LETTERTYPE_PLEKKEN = {
  titel:      { naam: 'Titel',                                 uitleg: 'De grote titel bovenaan en de voettekst.' },
  ondertitel: { naam: 'Ondertitel',                            uitleg: 'Het regeltje onder de titel.' },
  deurtjes:   { naam: 'Tekst op de deurtjes',                  uitleg: 'Het nummer en de datum op de deurtjes.' },
  popupKop:   { naam: 'Tekst achter de deurtjes (kop)',        uitleg: 'De titel van het deurtje als het openstaat.' },
  popupTekst: { naam: 'Tekst achter de deurtjes (inhoud)',     uitleg: 'De tekst, de knop en de balkjes in het deurtje.' },
} as const;
export type LettertypePlek = keyof typeof LETTERTYPE_PLEKKEN;

// Een kalender heeft standaard 24 deurtjes en maximaal 31 (een hele maand)
export const MAX_DAGEN = 31;

// Onderkant van de kalender: winterlandschap met sneeuw, zachte heuvels in de themakleuren, golvende heuvels, een dorp
// waar bij elk deurtje een raam gaat branden, of niets
export const ONDERKANTEN = ['winter', 'heuvels', 'golven', 'dorp', 'geen'] as const;
export type Onderkant = (typeof ONDERKANTEN)[number];
export type LandschapStijl = Exclude<Onderkant, 'geen'>;

// Hoe een deurtje opengaat: als zwaaideur, als ingepakt cadeautje, als omdraaikaartje of als schuifdeur
export const DEURSTIJLEN = ['zwaai', 'cadeau', 'draai', 'schuif'] as const;
export type DeurStijl = (typeof DEURSTIJLEN)[number];

// ─── Thema's (kleurensets) ────────────────────────────────────
// Elk thema is gecontroleerd op leesbaarheid: titel op de achtergrond, tekst in de popup en tekst op de deurtjes.
// `landschap` is de onderkant die bij het thema past: sneeuw valt weg op een lichte achtergrond, dus daar komen zachte heuvels.
export const THEMAS = {
  kerst: {
    naam: 'Kerstgroen',
    omschrijving: 'Klassiek donkergroen met goud',
    landschap: 'winter',
    kleuren: {
      achtergrond: '#1f3320', accent: '#c9a24b', licht: '#fcebdc',
      primair: '#3b5633', secundair: '#9e3816', tekst: '#2a3a3c',
      tegels: ['#3b5633', '#9e3816', '#758d69', '#fcebdc'],
    },
  },
  bessen: {
    naam: 'Bessenrood',
    omschrijving: 'Warm wijnrood met goud en dennengroen',
    landschap: 'winter',
    kleuren: {
      achtergrond: '#3a1119', accent: '#e0b85c', licht: '#fbeee0',
      primair: '#7a1f2b', secundair: '#2f5d46', tekst: '#2d2326',
      tegels: ['#7a1f2b', '#2f5d46', '#b5524a', '#fbeee0'],
    },
  },
  winter: {
    naam: 'Winterblauw',
    omschrijving: 'Koel nachtblauw met zacht goud',
    landschap: 'winter',
    kleuren: {
      achtergrond: '#14283f', accent: '#d9b86a', licht: '#f2f6fa',
      primair: '#1f4e79', secundair: '#8a2f45', tekst: '#1e2a38',
      tegels: ['#1f4e79', '#8a2f45', '#5b7fa6', '#f2f6fa'],
    },
  },
  licht: {
    naam: 'Licht en warm',
    omschrijving: 'Crème met terracotta, fris en luchtig',
    landschap: 'heuvels',
    kleuren: {
      achtergrond: '#fff3e2', accent: '#b4561f', licht: '#ffffff',
      primair: '#3b5633', secundair: '#9e3816', tekst: '#2a3a3c',
      tegels: ['#3b5633', '#d56119', '#758d69', '#f4c293'],
    },
  },
  pastel: {
    naam: 'Zacht pastel',
    omschrijving: 'Roze en saliegroen, ook mooi buiten de feestdagen',
    landschap: 'heuvels',
    kleuren: {
      achtergrond: '#f8e8e4', accent: '#a0505f', licht: '#fffaf7',
      primair: '#46665a', secundair: '#a0505f', tekst: '#33302f',
      tegels: ['#46665a', '#c97b86', '#8fae9f', '#e8bcae'],
    },
  },
} as const;

export type ThemaNaam = keyof typeof THEMAS;

/** Welk thema past precies bij deze kleuren? (null als iemand eigen kleuren heeft gekozen) */
export function themaVan(k: { achtergrond: string; accent: string; licht: string; primair: string; secundair: string; tekst: string; tegels: string[] }): ThemaNaam | null {
  const lijst = (x: typeof k) => [x.achtergrond, x.accent, x.licht, x.primair, x.secundair, x.tekst, ...x.tegels].map((c) => c.toLowerCase()).join();
  const huidig = lijst(k);
  return (Object.keys(THEMAS) as ThemaNaam[]).find((n) => lijst({ ...THEMAS[n].kleuren, tegels: [...THEMAS[n].kleuren.tegels] }) === huidig) ?? null;
}

// ─── Schema ───────────────────────────────────────────────────
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Gebruik een kleurcode zoals #c9a24b');

// Afbeeldingen en logo: een https-link, een pad op deze site of leeg
const afbeeldingUrl = z
  .string()
  .max(500, 'Deze link is te lang')
  .refine((v) => v === '' || /^https:\/\//i.test(v) || v.startsWith('/'), 'Gebruik een link die met https:// begint');

// Audio: een SoundCloud-link. Plakt iemand de hele insluitcode, dan halen we de link eruit.
const audioUrl = z
  .string()
  .max(1000, 'Deze link is te lang')
  .transform(schoonAudio)
  .refine(audioGeldig, AUDIO_FOUTMELDING);

const knopUrl = z
  .string()
  .max(500, 'Deze link is te lang')
  .refine((v) => v === '' || /^https:\/\//i.test(v), 'Gebruik een link die met https:// begint');

const kerst = THEMAS.kerst.kleuren;

const kleurenSchema = z.object({
  achtergrond: hex.default(kerst.achtergrond),
  accent:      hex.default(kerst.accent),
  licht:       hex.default(kerst.licht),
  primair:     hex.default(kerst.primair),
  secundair:   hex.default(kerst.secundair),
  tekst:       hex.default(kerst.tekst),
  tegels:      z.array(hex).length(4, 'Geef precies 4 tegelkleuren op').default([...kerst.tegels]),
});

const optiesSchema = z.object({
  sneeuw:      z.boolean().default(true),
  confetti:    z.boolean().default(true),
  sterren:     z.boolean().default(true),
  // Oudere instellingen hadden hier true of false: true werd het winterlandschap, false werd geen onderkant
  landschap:   z.preprocess((v) => (v === true ? 'winter' : v === false ? 'geen' : v), z.enum(ONDERKANTEN, { error: 'Kies een van de beschikbare opties' })).default('winter'),
  herinnering: z.boolean().default(true),
  // Link die in de agenda-herinnering staat. Leeg betekent: de pagina waar de bezoeker de kalender opent.
  herinneringUrl: knopUrl.default(''),
  // De regel onder de kalender met het aantal geopende deurtjes. Leeg betekent: de standaardtekst. {open} en {totaal} worden ingevuld.
  teltekstAan: z.boolean().default(true),
  teltekst:    z.string().trim().max(120, 'De tekst onder de kalender is te lang (maximaal 120 tekens)').default(''),
  deurStijl:   z.enum(DEURSTIJLEN, { error: 'Kies een van de beschikbare opties' }).default('zwaai'),
});

const knoppenSchema = z.object({
  standaardLabel: z.string().trim().min(1, 'Vul een standaard knoptekst in').max(40, 'De standaard knoptekst is te lang (maximaal 40 tekens)').default('Open de les'),
  openen:         z.enum(['nieuw', 'zelfde'], { error: 'Kies een van de beschikbare opties' }).default('nieuw'),
});

// Een knop met link onder een deurtje. `aan` bewaart de keuze wel/geen knop, ook als de link blijft staan.
// Ontbreekt `aan` (oude instellingen of JSON van Claude), dan staat de knop aan zodra er een link is.
const knopSchema = z
  .object({
    aan:   z.boolean().optional(),
    label: z.string().trim().max(40, 'De knoptekst is te lang (maximaal 40 tekens)').default(''),
    url:   knopUrl.default(''),
  })
  .transform((k) => ({ ...k, aan: k.aan ?? Boolean(k.url) }))
  .refine((k) => !k.aan || k.url !== '', { message: 'Vul de link in of zet de knop uit', path: ['url'] });

export const dagSchema = z.object({
  titel: z.string().trim().min(1, 'Geef dit deurtje een titel').max(80, 'De titel is te lang (maximaal 80 tekens)'),
  tekst: z.string().max(1500, 'De tekst is te lang (maximaal 1500 tekens)').default(''),
  soort: z.enum(['tekst', 'opdracht'], { error: 'Kies een van de beschikbare opties' }).default('tekst'),
  knop: knopSchema.default({ aan: false, label: '', url: '' }),
  afbeelding: afbeeldingUrl.default(''),
  audio: audioUrl.default(''),
});

const lettertypeKeuze = z.enum([...LETTERTYPE_SLEUTELS, ''], { error: 'Kies een van de beschikbare opties' }).default('');
// Een geüpload lettertype: alleen de naam in de opslag, nooit het adres. Het bestand wordt via /api/lettertype uitgeleverd.
const lettertypeBestand = z.string().max(200).refine((v) => v === '' || LETTERTYPE_ID_PATROON.test(v), 'Ongeldig lettertypebestand').default('');
const eigenLettertypeSchema = z.object({
  naam: z.string().trim().max(40, 'De naam van het lettertype is te lang (maximaal 40 tekens)').default(''),
  normaal: lettertypeBestand,
  vet: lettertypeBestand,
});

const lettertypesSchema = z.object({
  titel: lettertypeKeuze,
  ondertitel: lettertypeKeuze,
  deurtjes: lettertypeKeuze,
  popupKop: lettertypeKeuze,
  popupTekst: lettertypeKeuze,
});

export const configSchema = z.object({
  titel:      z.string().trim().min(1, 'Geef de kalender een titel').max(80, 'De titel is te lang (maximaal 80 tekens)'),
  ondertitel: z.string().trim().max(120, 'De ondertitel is te lang').default(''),
  footer:     z.string().trim().max(200, 'De voettekst is te lang').default(''),
  afsluiting: z.string().trim().max(200, 'De afsluiting is te lang').default(''),
  logoUrl:    afbeeldingUrl.default(''),
  // Grootte van de titel in procenten van de standaardgrootte
  titelGrootte: z.number({ error: 'Kies een grootte voor de titel' }).int('Een heel getal graag').min(60, 'De titel mag niet kleiner dan 60%').max(160, 'De titel mag niet groter dan 160%').default(100),
  // Het oorspronkelijke lettertype voor de titels. Blijft bestaan voor kalenders die het al hebben, de keuze per plek (`lettertypes`) gaat voor.
  lettertype: z.enum(LETTERTYPE_SLEUTELS, { error: 'Kies een van de beschikbare opties' }).default('serif'),
  lettertypes: lettertypesSchema.prefault({}),
  eigenLettertype: eigenLettertypeSchema.prefault({}),
  eigenLettertype2: eigenLettertypeSchema.prefault({}),
  startDatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Gebruik een datum als 2026-12-01'),
  aantalDagen: z.number().int('Een heel getal graag').min(1, 'Minimaal 1 dag').max(MAX_DAGEN, `Maximaal ${MAX_DAGEN} dagen`).default(24),
  kleuren:    kleurenSchema.prefault({}),
  opties:     optiesSchema.prefault({}),
  knoppen:    knoppenSchema.prefault({}),
  // Testmodus: alle deurtjes zijn te openen, ook die van latere datums. Alleen bedoeld om zelf te testen.
  testmodus:  z.boolean().default(false),
  dagen:      z.array(dagSchema).max(MAX_DAGEN, `Maximaal ${MAX_DAGEN} deurtjes`),
});

export type AdventConfig = z.infer<typeof configSchema>;
export type AdventDag = z.infer<typeof dagSchema>;
export type AdventKleuren = AdventConfig['kleuren'];

// ─── Hulpfuncties ─────────────────────────────────────────────
const VELDNAMEN: Record<string, string> = {
  titel: 'titel', ondertitel: 'ondertitel', footer: 'voettekst', afsluiting: 'afsluiting', logoUrl: 'logo',
  startDatum: 'startdatum', aantalDagen: 'aantal dagen', tekst: 'tekst', soort: 'soort', knop: 'knop',
  label: 'knoptekst', url: 'link', afbeelding: 'afbeelding', audio: 'audio', kleuren: 'kleuren', tegels: 'tegelkleuren',
  achtergrond: 'achtergrondkleur', accent: 'accentkleur', licht: 'lichte kleur', primair: 'primaire kleur',
  secundair: 'secundaire kleur', lettertype: 'lettertype', dagen: 'deurtjes', opties: 'opties',
  knoppen: 'knoppen', testmodus: 'testmodus', standaardLabel: 'standaard knoptekst', openen: 'openen', aan: 'knop aan', deurStijl: 'deurstijl',
  herinneringUrl: 'link in de herinnering', teltekst: 'tekst onder de kalender', teltekstAan: 'tekst onder de kalender', titelGrootte: 'grootte van de titel', lettertypes: 'lettertypes', eigenLettertype: 'eigen lettertype 1', eigenLettertype2: 'eigen lettertype 2', normaal: 'gewoon lettertypebestand', vet: 'vet lettertypebestand', deurtjes: 'tekst op de deurtjes',
  popupKop: 'kop achter het deurtje', popupTekst: 'tekst achter het deurtje',
};

/** Vult {open} en {totaal} in de eigen tekst onder de kalender in. */
export function teltekstVul(sjabloon: string, open: number, totaal: number): string {
  return sjabloon.replace(/\{open\}/gi, String(open)).replace(/\{totaal\}/gi, String(totaal));
}

/** Het lettertype voor een plek. Is er niets gekozen, dan geldt het oude standaardgedrag: sans voor lopende tekst, het titel-lettertype voor de rest. */
export function lettertypeVoor(config: Pick<AdventConfig, 'lettertype' | 'lettertypes'>, plek: LettertypePlek): Lettertype {
  const keuze = config.lettertypes[plek];
  if (keuze !== '') return keuze;
  return plek === 'ondertitel' || plek === 'popupTekst' ? 'sans' : config.lettertype;
}

function padNaarTekst(pad: PropertyKey[]): string {
  if (pad[0] === 'dagen' && typeof pad[1] === 'number') {
    const rest = pad.slice(2).map((p) => VELDNAMEN[String(p)] ?? String(p)).join(', ');
    return `Deurtje ${pad[1] + 1}${rest ? `, ${rest}` : ''}`;
  }
  return pad.map((p) => VELDNAMEN[String(p)] ?? String(p)).join(', ') || 'Instellingen';
}

export function foutenNaarRegels(error: z.ZodError): string[] {
  return error.issues.map((i) => `${padNaarTekst(i.path)}: ${i.message}`);
}

/** Valideert willekeurige invoer (bijv. geplakte JSON) en geeft een nette config of Nederlandse foutregels terug. */
export function leesConfig(invoer: unknown): { ok: true; config: AdventConfig } | { ok: false; fouten: string[] } {
  const uitkomst = configSchema.safeParse(invoer);
  if (uitkomst.success) return { ok: true, config: uitkomst.data };
  return { ok: false, fouten: foutenNaarRegels(uitkomst.error) };
}

/** Vult ontbrekende deurtjes aan, zodat er altijd precies `aantalDagen` zijn. */
export function dagenVoor(config: AdventConfig): (AdventDag & { dag: number })[] {
  return Array.from({ length: config.aantalDagen }, (_, i) => ({
    dag: i + 1,
    ...(config.dagen[i] ?? { titel: `Dag ${i + 1}`, tekst: '', soort: 'tekst' as const, knop: { aan: false, label: '', url: '' }, afbeelding: '', audio: '' }),
  }));
}
