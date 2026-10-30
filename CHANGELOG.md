# Wat is er nieuw?

Hier staat per versie wat er is veranderd. Je teksten, kleuren en logo blijven bij een update altijd bewaard.

## v1.1.2

- Nieuw: je kunt zelf kiezen naar welke pagina de agenda-herinnering linkt. Handig als je kalender is ingesloten op een andere pagina, bijvoorbeeld in Kennis Shop. Je vindt het bij **Opties**. Laat je het leeg, dan werkt het zoals altijd.
- Opgelost: een komma of puntkomma in de titel van je kalender kon de agenda-herinnering laten haperen in sommige agenda-apps. Dat is nu veilig, ook voor lange links.
- In het tabblad Updates en in de uitleg staat nu "ververs de pagina in je browser" in plaats van een toetsencombinatie.

## v1.1.1

- Nieuw: de starter heeft nu een licentie, de BouwClub-licentie (zie het bestand `LICENSE`). Als BouwClub-deelnemer mag je de starter gebruiken en aanpassen voor jezelf en voor je klanten, ook tegen betaling. Je mag hem zelf niet doorverkopen of als eigen template verspreiden.
- Aan je kalender verandert niets.

## v1.1.0

- Nieuw: je kiest hoe een deurtje opengaat. Naast de zwaaideur (de standaard) kun je kiezen voor een cadeautje met lint (het pakje vliegt weg), een omdraaikaartje of een schuifdeur. Je vindt het bij **Opties**, met bij elke keuze een mini-deurtje dat opengaat als je eroverheen beweegt.
- Je huidige kalender verandert niet: die blijft een zwaaideur tot je zelf een andere stijl kiest.
- Bezoekers die op hun apparaat minder beweging hebben ingesteld, zien de deurtjes direct open zonder animatie.

## v1.0.5

- Het tabblad Updates begint nu met het starten van de update. Het neerzetten van de update-knop staat daaronder, in een uitklapkopje, met de uitleg wat "A file with the same name already exists" betekent.

## v1.0.4

- Je instellingen staan nu onder een bestandsnaam die niet te raden is. Daarvoor stond er een vast, openbaar adres, waardoor iemand die het adres van je opslag kende de teksten en links van deurtjes die nog dicht zijn alvast kon lezen. De eerste keer dat je kalender na de update wordt bezocht, verhuist hij vanzelf. Je hoeft niets te doen.
- Haperde de opslag even, dan zag je kalender er soms uit als de voorbeeldkalender. Nu blijft de laatste goede versie staan. Is die er niet, dan krijgt de bezoeker een nette melding met een knop om opnieuw te proberen.
- In de beheerpagina worden de voorbeeldteksten niet meer geladen als het ophalen mislukt. Daardoor kun je ze niet per ongeluk over je eigen teksten heen opslaan.
- Is de opslag niet bereikbaar, dan blijft een pagina niet meer minutenlang hangen maar geeft hij binnen enkele seconden een melding.

## v1.0.3

- Opslaan werkt nu ook als Vercel je Blob-opslag koppelt via de nieuwe manier (BLOB_STORE_ID in plaats van BLOB_READ_WRITE_TOKEN). Daarvoor zag je ten onrechte "er is geen Blob-opslag gekoppeld".
- Nieuw tabblad Updates met uitleg en een link om de update-knop met één klik in je GitHub-repo te zetten. Vercel kopieert die knop niet mee als je met de Deploy-knop begint.
- De melding over een nieuwe versie verschijnt sneller (elk half uur gecontroleerd) en verwijst naar het tabblad Updates.
- Bij een mislukte opslag staat er nu een technische melding bij, zodat de oorzaak makkelijker te vinden is.

## v1.0.2

- De ingebedde kalender (`?embed=true`) toont nu gewoon je kalender zelf, met de deurtjes 4 naast elkaar, in plaats van een compacte variant. De achtergrond is doorzichtig, zodat hij past op je eigen pagina.
- De keuze voor 6 of 4 deurtjes per rij is vervallen, want die is niet meer nodig.
- Het tabblad Delen vraagt hoe breed je iframe ongeveer is en rekent daar de hoogte bij uit. De ingebedde kalender is hoger dan voorheen: heb je de embedcode al gebruikt, haal hem dan opnieuw op in het tabblad Delen.
- In een hoog iframe verschijnt de popup in het stuk dat je klant op dat moment ziet, en niet in het midden van het hele iframe. Het deurtje van vandaag opent alleen vanzelf als het iframe in beeld is.

## v1.0.1

- De update vergelijkt bestanden nu zonder naar regeleinden te kijken (Windows en Mac of Linux gebruiken andere). Daardoor meldt de update geen bestanden meer als "zelf aangepast" terwijl je er niets aan hebt veranderd.

## v1.0.0

De eerste versie van de adventkalender-starter.

- Een kalender met 1 tot 31 deurtjes die op datum opengaan, met sneeuw, sterretjes, confetti en een onderkant naar keuze.
- Een beheerpagina op `/beheer` met vijf thema's, eigen kleuren en logo, en tekst per deurtje.
- Teksten laten schrijven door Claude en in één keer importeren.
- Een knop met link per deurtje, bijvoorbeeld naar een les in Kennis Shop.
- Testmodus om zelf te zien wat je klanten krijgen.
- Latere deurtjes worden pas verstuurd als ze open mogen.
- Embedcode met een hoogte-advies, met 6 of 4 deurtjes per rij.
