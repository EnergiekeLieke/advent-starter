import type { Config } from 'tailwindcss';

// De kleuren komen uit de instellingen (/beheer) en worden als CSS-variabelen op de kalender gezet.
// Elke variabele is een rgb-triplet, zodat Tailwind-doorzichtigheid (bijv. border-goud/60) blijft werken.
const kleur = (naam: string) => `rgb(var(--adv-${naam}) / <alpha-value>)`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nacht: kleur('nacht'),         // achtergrond van de kaart
        goud: kleur('goud'),           // accentkleur
        licht: kleur('licht'),         // popup en pagina-achtergrond
        primair: kleur('primair'),     // knoppen, titels in de popup
        secundair: kleur('secundair'), // 'Dag'-balk en 'Vandaag'
        inkt: kleur('inkt'),           // lopende tekst in de popup
        opach: kleur('opach'),         // tekst op de achtergrond van de kaart
        oppri: kleur('oppri'),         // tekst op primair
        opsec: kleur('opsec'),         // tekst op secundair
      },
      fontFamily: {
        kop: ['var(--adv-font-kop)'],
      },
    },
  },
  plugins: [],
};

export default config;
