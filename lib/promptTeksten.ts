// De prompt die een deelnemer in claude.ai plakt om de teksten van de kalender te laten schrijven.
// De uitvoer past precies in "Importeren" op /beheer. Houd docs/PROMPT-TEKSTEN.md gelijk aan deze tekst.
export const PROMPT_TEKSTEN = `Ik maak een digitale adventkalender voor mijn klanten. Schrijf de inhoud voor me en geef het resultaat als JSON in precies het formaat hieronder. Geef alleen het JSON-blok terug.

Over mijn bedrijf en klanten:
- Wat ik doe: [vul in]
- Mijn klanten zijn: [vul in]
- Toon van mijn teksten: [bijvoorbeeld warm, speels of rustig]
- Aantal deurtjes: 24
- Wat klanten mogen ontdekken of doen: [bijvoorbeeld kennismaken met mijn aanbod of een weggever downloaden]
- Aanbod of weggevers die in een deurtje mogen komen, met https-link: [vul in]

Regels:
- Schrijf in correct Nederlands, in de jij-vorm en zonder lange streepjes.
- Elke tekst is maximaal 3 korte zinnen (maximaal 400 tekens).
- Wissel "tekst" (inspiratie of weetje) af met "opdracht" (een kleine opdracht om vandaag te doen).
- Gebruik een knop alleen bij deurtjes waar een link past. Laat de knop anders leeg ("label": "", "url": "").
- Verzin geen links. Gebruik alleen links die ik hierboven geef.
- Laat de laatste dag een warme afsluiting zijn.

Formaat:
{
  "titel": "...",
  "ondertitel": "...",
  "footer": "...",
  "afsluiting": "...",
  "dagen": [
    { "titel": "...", "soort": "tekst", "tekst": "...", "knop": { "label": "", "url": "" } }
  ]
}
Maak precies 24 objecten in "dagen".`;
