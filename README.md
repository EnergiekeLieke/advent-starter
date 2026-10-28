# Adventkalender-starter

Een speelse adventkalender met 24 deurtjes die elke dag op datum opengaan. Jij vult de teksten, kleuren en je logo in via een eigen beheerpagina. Geen code nodig.

Je klanten openen elke dag een deurtje met een tip, een opdracht, een weggever of een link naar je aanbod. Dat zijn 24 contactmomenten, en jij hoeft er maar één keer aan te werken.

Wil je de kalender helemaal afmaken voor je eigen klanten, inclusief teksten schrijven, testen, aankondigen en een checklist? Volg dan het adventstappenplan in je cursus in Kennis Shop.

## In 5 stappen live

### Stap 1: kopieer deze repo en zet hem online

Klik op de knop hieronder. Vercel maakt dan in je eigen GitHub-account een kopie en zet die online, inclusief de opslag voor je instellingen.

[![Deploy met Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FEnergiekeLieke%2Fadvent-starter&project-name=mijn-adventkalender&repository-name=mijn-adventkalender&env=BEHEER_WACHTWOORD&envDescription=Kies%20zelf%20een%20wachtwoord%20voor%20je%20beheerpagina&stores=%5B%7B%22type%22%3A%22blob%22%2C%22access%22%3A%22public%22%7D%5D)

Tijdens het importeren vraagt Vercel om:

1. **BEHEER_WACHTWOORD**: kies zelf een wachtwoord. Hiermee log je straks in op je beheerpagina. Bewaar het goed.
2. **Blob-opslag**: laat deze aanmaken zoals Vercel voorstelt (kies **Public** als daar naar gevraagd wordt). Hier worden je teksten, kleuren en logo bewaard.

Klik op **Deploy** en wacht tot het klaar is. Vercel geeft je een link, bijvoorbeeld `mijn-adventkalender.vercel.app`.

### Stap 2: log in op je beheerpagina

Ga naar je link en plak `/beheer` erachter, bijvoorbeeld `mijn-adventkalender.vercel.app/beheer`. Log in met het wachtwoord uit stap 1.

### Stap 3: maak hem van jou

Je ziet links de instellingen en rechts direct een voorbeeld.

- **Algemeen**: titel, ondertitel, de eerste dag (standaard 1 december) en het aantal deurtjes (standaard 24, maximaal 31).
- **Kleuren en logo**: kies een van de vijf thema's (Kerstgroen, Bessenrood, Winterblauw, Licht en warm of Zacht pastel) of vul zelf je huisstijlkleuren in (de kleurcodes die je al hebt, zoals `#3b5633`). Upload je logo of plak een link.
- **Deurtjes**: pas per deurtje de titel en tekst aan. Kies of het een tekst of een opdracht is en voeg eventueel een afbeelding toe.
- **Kennis Shop-links** (optioneel): laat een deurtje naar een les in je Kennis Shop wijzen, of naar een andere pagina zoals een weggever. Zet bij het juiste deurtje de knop aan en plak de link uit de adresbalk van je browser. Heb je veel links? Plak ze dan allemaal onder elkaar in het vak bovenaan: de eerste regel hoort bij deurtje 1, de tweede bij deurtje 2, enzovoort. Een lege regel betekent geen knop. Hier kies je ook de standaard knoptekst en of de link opent in een nieuw tabblad of in hetzelfde venster.
- **Opties**: sneeuw, sterretjes en confetti aan of uit, en de onderkant van de kalender: winterlandschap met sneeuw, zachte heuvels in de kleuren van je thema, alleen golvende heuvels of niets. Bij een licht thema (Licht en warm, Zacht pastel) staan automatisch de zachte heuvels aan, want witte sneeuw valt weg op een lichte achtergrond. Bovenaan vind je ook de **testmodus** (zie "Zo test je").
- **Delen**: je link en een kant-en-klare embedcode om te kopiëren, plus een korte controle voordat je de kalender deelt (nog niet opgeslagen wijzigingen, testmodus die nog aanstaat of voorbeeldteksten die je nog niet hebt aangepast).

Klik rechtsboven op **Opslaan** als je tevreden bent.

### Stap 4: laat Claude de teksten schrijven (scheelt veel tijd)

Geen zin om 24 teksten te verzinnen? Open het tabblad **Importeren en exporteren** en volg de stappen daar:

1. Klik op **Kopieer prompt** en plak hem in claude.ai.
2. Vul de stukjes tussen [haakjes] in over jouw bedrijf en klanten.
3. Kopieer het JSON-blok dat Claude teruggeeft en plak het in het tekstvak.
4. Klik op **Importeren**, bekijk het voorbeeld en klik op **Opslaan**.

Je kleuren en logo blijven staan, alleen de teksten worden vervangen. De prompt staat ook in [docs/PROMPT-TEKSTEN.md](docs/PROMPT-TEKSTEN.md).

### Stap 5: zet hem in je Kennis Shop of website

Open in je beheerpagina het tabblad **Delen** en klik op **Kopieer embedcode**. Je krijgt dan code zoals hieronder, al met jouw link en de juiste hoogte erin:

```html
<iframe src="https://mijn-adventkalender.vercel.app/?embed=true" width="100%" height="1350" frameborder="0" title="Adventkalender"></iframe>
```

Let op: zet de maat als losse onderdelen (`width` en `height`) in de code en niet in een `style`. Kennis Shop haalt `style` er namelijk vaak uit, en dan krijg je een piepklein vakje.

**Wat zie je ingebed?** Gewoon je kalender zelf, precies zoals op de losse pagina: de deurtjes staan 4 naast elkaar en alles werkt hetzelfde. Het enige verschil is dat de achtergrond doorzichtig is, zodat de kalender past op de kleur van je eigen pagina. Klikt je klant op een deurtje, dan verschijnt de popup in het stuk van het iframe dat hij op dat moment ziet, ook als het iframe hoger is dan zijn scherm. Het deurtje van vandaag opent alleen vanzelf als je klant het iframe ook echt in beeld heeft.

**Hoe hoog moet het iframe zijn?** De kalender toont alle rijen met deurtjes en is daardoor vrij hoog. Is het iframe te laag, dan moet je klant in het iframe scrollen. Is het te hoog, dan blijft er lege ruimte onder de kalender. Het tabblad **Delen** rekent de hoogte voor je uit. Vul daar in hoe breed je iframe ongeveer is (in Kennis Shop meestal 450 tot 600 px), want hoe breder het iframe, hoe groter de deurtjes en hoe hoger de kalender. Dit zijn voorbeelden voor een kalender met landschap onderaan:

| Aantal deurtjes | iframe 450 px breed | iframe 600 px breed | iframe 768 px breed |
|---|---|---|---|
| 6 | 750 px | 800 px | 900 px |
| 12 | 850 px | 950 px | 1050 px |
| 18 | 1050 px | 1250 px | 1400 px |
| 24 | 1150 px | 1350 px | 1550 px |
| 31 | 1350 px | 1650 px | 1900 px |

Is je iframe smaller dan je invult, bijvoorbeeld op een telefoon, dan blijft er onderaan wat lege ruimte. Kies je bij **Opties** voor geen onderkant, dan is de kalender ongeveer 110 px lager.

Staat de kalender in Kennis Shop en wijzen je deurtjes naar lessen? Kies dan bij **Kennis Shop-links** hoe de link opent:

- **Een nieuw tabblad** werkt altijd. Je klant verlaat de kalender niet.
- **Hetzelfde venster** opent de les op de plek van je hele Kennis Shop-pagina. Dat voelt het mooist, maar werkt alleen als Kennis Shop dit toestaat. Test het eerst in je eigen shop.

## Zo test je

Je hoeft niet tot 1 december te wachten om te zien hoe je kalender eruitziet. Er zijn twee manieren:

**1. Het voorbeeld in de beheerpagina.** Kies naast het voorbeeld een moment: vandaag, voor de start, halverwege, de laatste dag of na afloop.

**2. De testmodus, om te zien wat je klanten krijgen.** Zet bij **Opties** de testmodus aan en klik op **Opslaan**. Dan staan alle deurtjes open, op de kalenderpagina zelf en in Kennis Shop. Een gele badge "Testmodus: alle deurtjes staan open" laat zien dat de testmodus aanstaat.

> **Let op: de testmodus is tijdelijk.** Zolang hij aanstaat kan iedereen met de link alle deurtjes openen en alle teksten lezen. Zet hem dus weer uit en klik op **Opslaan** voordat je de kalender deelt. De beheerpagina herinnert je eraan met een gele balk en het label TESTMODUS AAN. Standaard staat hij uit.

**Een datum simuleren:** log eerst in op `/beheer` en open daarna in dezelfde browser je kalender met `?datum=2026-12-10` (een volledige datum) of `?day=5` (de 5e dag van jouw kalender) erachter. Dat werkt alleen voor jou als beheerder. Een klant die dit achter de link zet, ziet er niets van.

**Waarom kan een klant niet vooruitkijken?** De teksten, links en afbeeldingen van een deurtje worden pas naar de browser gestuurd als dat deurtje open mag. Je kunt dus ook een kortingscode of weggever achter een latere dag zetten. Een pagina die over middernacht openstaat, haalt zelf de inhoud van het nieuwe deurtje op.

## Kleine kalender of een andere periode?

Zet bij **Algemeen** het aantal deurtjes lager en kies een andere eerste dag. Zo maak je ook een kalender van 7 of 12 dagen, of een versie voor januari of Valentijn.

## Updaten naar een nieuwe versie

Komt er een nieuwe versie van de adventkalender-starter uit? Dan zie je in je beheerpagina een blauwe balk met "Er is een nieuwe versie van de adventkalender". Wat er nieuw is, staat in [CHANGELOG.md](CHANGELOG.md).

**Je teksten, kleuren en logo blijven bewaard.** Die staan in je eigen opslag (Blob) en niet in de bestanden van je kalender. Een update vervangt alleen de code.

### Zo update je

0. **Eenmalig, alleen als je met de Deploy-knop van Vercel bent gestart:** Vercel kopieert de update-knop (de map `.github`) niet mee. Open in je beheerpagina het tabblad **Updates** en klik op **Installeer de update-knop op GitHub**. GitHub opent een nieuw bestand met alles al ingevuld, jij klikt op **Commit changes**. Zegt GitHub "A file with the same name already exists"? Dan staat de update-knop er al en kun je dit overslaan.
1. Klik in de blauwe balk op **Hoe update ik?**, of open het tabblad **Updates**, en kies **Naar de update-knop op GitHub**. Of ga op GitHub naar je eigen repo, kies **Actions** en dan **Update van de template**.
2. Klik rechts op **Run workflow** en daarna op de groene knop **Run workflow**. Laat het vak "Versie" leeg om de nieuwste te krijgen.
3. Wacht tot de run een groen vinkje heeft (ongeveer een halve minuut). Open de run om te zien wat er is veranderd.
4. Vercel zet de nieuwe versie daarna vanzelf online. Dat duurt ongeveer 1 tot 2 minuten. Ververs je beheerpagina met Ctrl+F5, de blauwe balk is dan weg.
5. Controleer je kalender in het voorbeeld en op de pagina zelf.

Zie je bij **Actions** een melding dat workflows uit staan? Klik dan op de groene knop om ze aan te zetten ("I understand my workflows, go ahead and enable them").

### Wat blijft en wat verandert?

- **Blijft:** je teksten, kleuren en logo, `config/advent.json`, je `.env`-bestanden en alle bestanden die je zelf hebt toegevoegd.
- **Wordt vervangen:** de code van de kalender en de beheerpagina. Heb je zelf code aangepast? Dan staat in het resultaat van de update welke bestanden dat waren. Je haalt je eigen versie terug via **History** van dat bestand op GitHub.

### Een bepaalde versie kiezen

Vul bij **Run workflow** in het vak "Versie" een nummer in, bijvoorbeeld `1.0.0`, om terug te gaan naar een oudere versie.

### Met Claude Code of de terminal

Heb je een kopie van je repo op je computer? Dan kan het ook met `npm run update`. Daarna sla je de wijzigingen zelf op met git (`git add -A`, `git commit` en `git push`).

## Lokaal draaien (voor wie wil sleutelen)

```bash
npm install
npm run dev
```

Maak een bestand `.env.local` met daarin `BEHEER_WACHTWOORD=kies-zelf-iets`. De kalender draait dan op `localhost:3000` en de beheerpagina op `localhost:3000/beheer`. Lokaal worden je instellingen bewaard in `.advent-config.local.json`.

Gebruik je Claude Code? Er staat een `CLAUDE.md` in deze map met uitleg over hoe alles in elkaar zit.

## Veelgestelde vragen

**Ik kan niet opslaan.** Dan is er waarschijnlijk geen Blob-opslag gekoppeld. Ga in Vercel naar je project, kies **Storage**, dan **Create** en **Blob** (kies **Public**) en koppel hem aan je project. Deploy daarna opnieuw.

**Ik ben mijn wachtwoord vergeten.** Ga in Vercel naar je project, **Settings**, **Environment Variables**, pas `BEHEER_WACHTWOORD` aan en deploy opnieuw.

**Mijn aanpassingen zijn niet meteen zichtbaar.** Na opslaan is de kalender direct bijgewerkt. Soms houdt je browser nog even de oude versie vast. Ververs de pagina met Ctrl+F5.

**Kunnen klanten in de beheerpagina?** Nee, daarvoor is het wachtwoord. Deel dat alleen met jezelf.

**Welke gegevens verzamelt de kalender?** Geen. Er wordt niets van je bezoekers opgeslagen en er zijn geen cookies voor bezoekers.
