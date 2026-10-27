# Prompt: laat Claude de teksten van je kalender schrijven

Plak onderstaande prompt in claude.ai, vul de stukjes tussen [haakjes] in en laat Claude schrijven. Kopieer daarna het JSON-blok en plak het in je beheerpagina, bij **Importeren en exporteren**.

De prompt staat ook als knop **Kopieer prompt** in de beheerpagina zelf (zie `lib/promptTeksten.ts`).

```
Ik maak een digitale adventkalender voor mijn klanten. Schrijf de inhoud voor me en geef het resultaat als JSON in precies het formaat hieronder. Geef alleen het JSON-blok terug.

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
Maak precies 24 objecten in "dagen".
```

## Tips

- Wil je een kleinere kalender (bijvoorbeeld 12 dagen)? Pas "Aantal deurtjes" in de prompt aan en schrijf "Maak precies 12 objecten". Het aantal deurtjes in je kalender past zich vanzelf aan.
- Je kunt in dezelfde chat doorvragen: "maak dag 7 persoonlijker" of "geef me een nieuwe versie van de opdrachten". Plak daarna de nieuwe JSON opnieuw.
- Check altijd even of de links kloppen. Claude gebruikt alleen de links die jij opgeeft, maar controleren blijft slim.
