# CLAUDE.md

Deze map is een adventkalender-starter voor ondernemers. Next.js 16 (App Router), React 19, TypeScript en Tailwind 3. Geen database: instellingen staan in Vercel Blob.

## Commands

```bash
npm install
npm run dev        # localhost:3000, beheer op /beheer
npm run build      # productiebuild
npm run typecheck  # tsc --noEmit
```

Omgevingsvariabelen (zie `.env.example`):
- `BEHEER_WACHTWOORD`: wachtwoord voor `/beheer`
- `BLOB_READ_WRITE_TOKEN`: wordt door Vercel gezet zodra een Blob-opslag (public) is gekoppeld

## Hoe het werkt

De ondernemer past alles aan via `/beheer`. Meestal is er dus geen code nodig. Wil je iets aanpassen aan het gedrag of de vormgeving, dan kijk je hier:

- `config/advent.json`: standaardinstellingen (titel, kleuren, 24 voorbeeldteksten). Geldt zolang er niets is opgeslagen.
- `lib/config.ts`: het zod-schema voor alle instellingen, de thema's en de lettertypes. Een nieuwe instelling begint hier.
- `lib/opslag.ts`: bewaren en lezen. Blob in productie, een lokaal bestand tijdens `npm run dev`.
- `lib/configLaden.ts`: `laadConfig()` geeft de opgeslagen instellingen, anders `config/advent.json`.
- `components/Adventkalender.tsx`: de kalender zelf (deurtjes, popup, datumlogica).
- `components/AdventDecor.tsx`: sneeuw, sterren, strik en de onderkant (heuvels, huisje, dennen en de kerstboom met de bollen). `Landschap` krijgt een `stijl` en een `palet`.
- `components/beheer/Editor.tsx`: de beheerpagina met live voorbeeld.
- `components/beheer/KnoppenTab.tsx`: tabblad "Kennis Shop-links": per deurtje een knop aan of uit met link en eigen tekst, een plak-veld voor veel links tegelijk en de instellingen voor alle knoppen (`config.knoppen`: standaard knoptekst en `openen`, `nieuw` of `zelfde` venster).
- `components/beheer/DelenTab.tsx`: tabblad "Delen": link, embedcode (hoogte uit `adviesIframeHoogte(aantal, kolommen)` in `lib/embed.ts`: bij 6 per rij 350 px plus 100 px per rij, dus 750 px voor 24 deurtjes, bij 4 per rij 300 px plus 120 px per rij, dus 1000 px) en een controle op niet-opgeslagen wijzigingen, testmodus en voorbeeldteksten.
- `components/beheer/velden.tsx`: gedeelde stijlen en `Veld` voor de beheerpagina.
- `app/globals.css`: animaties van de kalender (`.adv-*`).

Een knop (`dag.knop`) heeft `aan`, `label` en `url`. De knop verschijnt alleen bij `aan` met een https-link. Is `label` leeg, dan geldt `config.knoppen.standaardLabel`. Ontbreekt `aan` in oude instellingen of geplakte JSON, dan staat de knop aan zodra er een link is.

### Kleuren

Kleuren komen uit `config.kleuren` en worden in `lib/kleur.ts` omgezet naar CSS-variabelen (`--adv-nacht`, `--adv-goud` en meer, als rgb-triplet). `tailwind.config.ts` koppelt daar Tailwind-kleuren aan (`bg-nacht`, `text-goud`, `bg-licht`, `text-primair`, enzovoort). Gebruik in de kalender dus deze namen en geen vaste hex-codes. Tekstkleuren op een gekleurde achtergrond worden automatisch leesbaar gekozen (`leesbaar()`).

### Onderkant van de kalender

`config.opties.landschap` is `winter`, `heuvels`, `golven` of `geen` (oude instellingen met `true` of `false` worden omgezet naar `winter` en `geen`). `winter` heeft sneeuw en past bij een donkere achtergrond. `heuvels` is dezelfde opzet in de kleuren van het thema en past bij lichte achtergronden. `golven` is alleen heuvels, zonder kerstboom. De kleuren staan in `landschapPalet()` in `lib/kleur.ts`. Elk thema in `THEMAS` heeft een standaard `landschap`, die bij het kiezen van het thema in de editor mee wordt gezet.

### Datums, testmodus en wat een bezoeker te zien krijgt

`startDatum` en `aantalDagen` bepalen wanneer deurtjes opengaan. De **server** bepaalt de datum (tijdzone Europe/Amsterdam, `bepaalNu()` in `lib/datum.ts`) in `app/page.tsx` en geeft die als prop `datum` aan `KalenderPagina` en `Adventkalender`. De client gebruikt zijn eigen klok niet voor de logica.

- `lib/gating.ts` (`verbergToekomst`): de server stuurt alleen de inhoud (titel, tekst, knop, afbeelding) mee van deurtjes die op `datum` open mogen. Latere deurtjes en deurtjes voorbij `aantalDagen` zijn leeg. Teksten van latere dagen staan dus nooit in de paginabron.
- `?datum=2026-12-10` en `?day=5` (`datumUitParams()`) werken alleen voor een ingelogde beheerder (`isIngelogd()`). Voor een bezoeker worden ze genegeerd. `?preview=1` (het voorbeeld in de editor) geldt ook alleen voor de beheerder en krijgt de volledige instellingen.
- `config.testmodus` (standaard `false`): alle deurtjes zijn open en worden meegestuurd. De kalender gedraagt zich dan als in de fase "na afloop" en toont een badge. In de editor staat de schakelaar bij Opties, met een gele balk en een badge zolang hij aanstaat (ook als hij is uitgezet maar nog niet is opgeslagen).
- `KalenderPagina` ververst de pagina (`router.refresh()`) als de klok van de bezoeker een nieuwe dag toont dan de `datum` van de server. Dat gebeurt niet bij een gesimuleerde datum of in het voorbeeld.

### Embed

`/?embed=true` is de compacte variant voor in een iframe (bijvoorbeeld Kennis Shop). `config.opties.embedKolommen` (4 of 6, standaard 6) bepaalt hoeveel deurtjes naast elkaar staan. Bij 6 gebruikt `Adventkalender` kleinere iconen en letters (`compact`), bij 4 de maten van de volledige pagina. Hoe breder het iframe, hoe groter de deurtjes: de hoogte-adviezen in `lib/embed.ts` zijn gemeten bij ongeveer 470 tot 580 px breed. `next.config.ts` laat de kalender overal insluiten (`frame-ancestors *`), `/beheer` alleen binnen deze site.

## Afspraken

- Teksten in de interface zijn Nederlands, in de jij-vorm.
- Geen lange streepjes in teksten. Gebruik een dubbele punt, komma of twee zinnen.
- Teksten van de ondernemer worden alleen als tekst getoond, nooit als HTML. Links van knoppen moeten met `https://` beginnen (zie het schema).
- Voeg bij een nieuwe instelling ook toe: het schema in `lib/config.ts`, het formulier in `Editor.tsx` en (indien nodig) de standaardwaarde in `config/advent.json`.
