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
- `lib/opslag.ts`: bewaren en lezen. Blob in productie, een lokaal bestand tijdens `npm run dev`. De instellingen staan in Blob onder een naam met willekeurig stuk (`advent/config-xxxx.json`, zie `lib/blobKeuze.ts`), nooit onder een vast adres: dat zou te raden zijn en dan lekken de dichte deurtjes. Blob-aanroepen hebben een tijdslimiet.
- `lib/configLaden.ts`: geeft bij een storing de laatste goede instellingen, en gooit anders een fout. Val nooit stilzwijgend terug op de voorbeeldtekst als er Blob is gekoppeld, want de editor kan die dan over de echte teksten heen opslaan.
- `lib/configLaden.ts`: `laadConfig()` geeft de opgeslagen instellingen, anders `config/advent.json`.
- `components/Adventkalender.tsx`: de kalender zelf (deurtjes, popup, datumlogica).
- `components/AdventDecor.tsx`: sneeuw, sterren, strik en de onderkant (heuvels, huisje, dennen en de kerstboom met de bollen). `Landschap` krijgt een `stijl` en een `palet`.
- `components/beheer/Editor.tsx`: de beheerpagina met live voorbeeld.
- `components/beheer/KnoppenTab.tsx`: tabblad "Kennis Shop-links": per deurtje een knop aan of uit met link en eigen tekst, een plak-veld voor veel links tegelijk en de instellingen voor alle knoppen (`config.knoppen`: standaard knoptekst en `openen`, `nieuw` of `zelfde` venster).
- `components/beheer/DelenTab.tsx`: tabblad "Delen": link, embedcode (de hoogte komt uit `adviesIframeHoogte(aantal, breedte, metOnderkant)` in `lib/embed.ts`, op basis van de breedte van het iframe die de beheerder invult) en een controle op niet-opgeslagen wijzigingen, testmodus en voorbeeldteksten.
- `components/beheer/velden.tsx`: gedeelde stijlen en `Veld` voor de beheerpagina.
- `app/globals.css`: animaties van de kalender (`.adv-*`).

Een knop (`dag.knop`) heeft `aan`, `label` en `url`. De knop verschijnt alleen bij `aan` met een https-link. Is `label` leeg, dan geldt `config.knoppen.standaardLabel`. Ontbreekt `aan` in oude instellingen of geplakte JSON, dan staat de knop aan zodra er een link is.

### Kleuren

Kleuren komen uit `config.kleuren` en worden in `lib/kleur.ts` omgezet naar CSS-variabelen (`--adv-nacht`, `--adv-goud` en meer, als rgb-triplet). `tailwind.config.ts` koppelt daar Tailwind-kleuren aan (`bg-nacht`, `text-goud`, `bg-licht`, `text-primair`, enzovoort). Gebruik in de kalender dus deze namen en geen vaste hex-codes. Tekstkleuren op een gekleurde achtergrond worden automatisch leesbaar gekozen (`leesbaar()`).

### Hoe een deurtje opengaat

`config.opties.deurStijl` is `zwaai` (standaard), `cadeau`, `draai` of `schuif`. De logica van het openen verandert niet (`isOpen`, klasse `is-open` op `.adv-deur`). De stijl zit alleen in CSS: de `<ol>` krijgt `adv-stijl-<naam>` en `app/globals.css` bepaalt de beweging. Twee uitzonderingen in `components/Adventkalender.tsx`: bij `schuif` zitten de lagen in `Omhulsel` (overflow hidden, zodat de deur binnen zijn vakje blijft en de gloed van vandaag niet wordt afgesneden) en bij `cadeau` staat er een `.adv-lint` en staat het nummer op een vlak in tegelkleur. De keuze met mini-deurtjes (`DeurMini`) staat in het tabblad Opties van `Editor.tsx`.

### Onderkant van de kalender

`config.opties.landschap` is `winter`, `heuvels`, `golven` of `geen` (oude instellingen met `true` of `false` worden omgezet naar `winter` en `geen`). `winter` heeft sneeuw en past bij een donkere achtergrond. `heuvels` is dezelfde opzet in de kleuren van het thema en past bij lichte achtergronden. `golven` is alleen heuvels, zonder kerstboom. De kleuren staan in `landschapPalet()` in `lib/kleur.ts`. Elk thema in `THEMAS` heeft een standaard `landschap`, die bij het kiezen van het thema in de editor mee wordt gezet.

### Datums, testmodus en wat een bezoeker te zien krijgt

`startDatum` en `aantalDagen` bepalen wanneer deurtjes opengaan. De **server** bepaalt de datum (tijdzone Europe/Amsterdam, `bepaalNu()` in `lib/datum.ts`) in `app/page.tsx` en geeft die als prop `datum` aan `KalenderPagina` en `Adventkalender`. De client gebruikt zijn eigen klok niet voor de logica.

- `lib/gating.ts` (`verbergToekomst`): de server stuurt alleen de inhoud (titel, tekst, knop, afbeelding) mee van deurtjes die op `datum` open mogen. Latere deurtjes en deurtjes voorbij `aantalDagen` zijn leeg. Teksten van latere dagen staan dus nooit in de paginabron.
- `?datum=2026-12-10` en `?day=5` (`datumUitParams()`) werken alleen voor een ingelogde beheerder (`isIngelogd()`). Voor een bezoeker worden ze genegeerd. `?preview=1` (het voorbeeld in de editor) geldt ook alleen voor de beheerder en krijgt de volledige instellingen.
- `config.testmodus` (standaard `false`): alle deurtjes zijn open en worden meegestuurd. De kalender gedraagt zich dan als in de fase "na afloop" en toont een badge. In de editor staat de schakelaar bij Opties, met een gele balk en een badge zolang hij aanstaat (ook als hij is uitgezet maar nog niet is opgeslagen).
- `KalenderPagina` ververst de pagina (`router.refresh()`) als de klok van de bezoeker een nieuwe dag toont dan de `datum` van de server. Dat gebeurt niet bij een gesimuleerde datum of in het voorbeeld.

### Embed

`/?embed=true` toont dezelfde kalender als de gewone pagina (4 deurtjes naast elkaar, dezelfde kop, knoppen en voet), maar met een doorzichtige achtergrond en weinig marge (`embed`-prop van `Adventkalender`), voor in een iframe zoals Kennis Shop. Er is geen aparte compacte variant meer. Omdat een ingebedde kalender hoger kan zijn dan het scherm van de bezoeker, meet `Adventkalender` bij het openen van een popup (`meetZichtbaar()`, met een IntersectionObserver op een onzichtbaar element over de hele pagina) welk stuk van het iframe zichtbaar is, ook als de kalender op een ander domein staat dan de pagina eromheen. De popup staat dan in dat stuk (`absolute` in plaats van `fixed`). Kan dat niet gemeten worden, dan valt hij terug op het midden van het iframe. Het deurtje van vandaag opent ingebed alleen vanzelf als het iframe zichtbaar is. Omdat de kalender niet meer de hoogte van het iframe vult, schat `adviesIframeHoogte()` in `lib/embed.ts` hoe hoog hij is. De formule is gemeten in de echte kalender (kop en voet ongeveer 470 px, plus de rijen met deurtjes; de deurtjes worden groter tot een kaartbreedte van 768 px) en nooit te laag bevonden. `next.config.ts` laat de kalender overal insluiten (`frame-ancestors *`), `/beheer` alleen binnen deze site.

## Versies en updates

Cursisten hebben een losse kopie van deze repo. Hun inhoud (teksten, kleuren, logo) staat in Blob en niet in de code, dus nieuwe code overschrijft die nooit.

- **Versie:** `version` in `package.json`, en per release een tag `v1.2.3` op GitHub. `lib/versie.ts` leest de nieuwste tag via de GitHub-API en de editor toont een blauwe balk als die nieuwer is.
- **Updaten:** `scripts/update-van-template.mjs` haalt de nieuwste tag op en vervangt de bestanden uit de template. Het raakt nooit aan `config/advent.json`, `.env*`, `.git`, `.github`, `node_modules`, `.next`, `.vercel` en bestanden die niet in de template zitten. Bestanden die in de oude versie zaten en in de nieuwe niet meer, worden verwijderd. Bestanden die de cursist zelf had aangepast, worden vervangen en in de samenvatting genoemd. De GitHub-workflow `.github/workflows/update-van-template.yml` roept alleen dit script aan en slaat het resultaat op. Hij draait niet in de template zelf.
- **Uitbrengen:** zet bovenaan `CHANGELOG.md` een kop `## v1.2.3` met wat er nieuw is, commit alles en draai `npm run release -- 1.2.3` (met `--droog` om alleen te controleren). Het script bouwt, verhoogt de versie, commit en tagt, maar pusht niets.
- **Spelregels voor wijzigingen:**
  - Instellingen moeten altijd terug te lezen zijn. Een nieuw veld krijgt een standaardwaarde in het schema (`lib/config.ts`). Verandert een bestaand veld, zet dan een `preprocess` of `transform` in het schema, zoals bij `landschap` en `knop.aan`.
  - Het workflow-bestand kan niet via een update worden vervangen (de token mag geen workflows schrijven). Houd het klein en laat de logica in het script.
  - `next-env.d.ts` staat bewust in `.gitignore`: Next genereert hem en herschrijft hem bij elke build.

## Afspraken

- Teksten in de interface zijn Nederlands, in de jij-vorm.
- Geen lange streepjes in teksten. Gebruik een dubbele punt, komma of twee zinnen.
- Teksten van de ondernemer worden alleen als tekst getoond, nooit als HTML. Links van knoppen moeten met `https://` beginnen (zie het schema).
- Voeg bij een nieuwe instelling ook toe: het schema in `lib/config.ts`, het formulier in `Editor.tsx` en (indien nodig) de standaardwaarde in `config/advent.json`.
