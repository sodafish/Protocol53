# Protocol 53 — werkafspraken voor Claude

Persoonlijke trainings-app van Tom (Nederlandstalig, Vlaams). Draait als web-app (PWA) op
https://sodafish.github.io/Protocol53/ via GitHub Pages (branch `main`, root). Tom gebruikt hem
vooral op zijn iPhone, als app op het beginscherm.

## Bestanden
- `index.html` — de hele app (HTML, CSS en JS in één bestand). Hier gebeuren bijna alle aanpassingen.
- `cloud.js` — opslag in Supabase met offline wachtrij, inlogscherm, back-up en uitloggen.
  Bootst de oude db-API na (`collection().doc().set()/delete()`, `onSnapshot`).
- `sw.js` — service worker. Verhoog `VERSION` bij elke wijziging aan gecachte bestanden
  (icons, cloud.js, vendor) zodat de iPhone de nieuwe versie ophaalt.
- `manifest.webmanifest`, `icons/` — app-naam en icoon (eigen ontwerp van Tom, `p53-*.png`).
- `img/` — oefenfoto's (Free Exercise DB, begin/eind), wisselen automatisch onder de i-knop.
- `vendor/supabase.js` — supabase-js v2, lokaal voor offline gebruik.
- `seed.json` — eenmalige import van de oude gegevens; niet meer aanpassen.

## Data
Supabase-project `protocol53` (Frankfurt), tabel `public.p53 (user_id, coll, id, data jsonb)`,
RLS: alleen eigen rijen. Collecties: `log` (kilo's en notities, `{t}`), `checks` (`{done}`),
`counts` (`{n,last,prev}`), `hist` (statistieken) en `prog` (progressie), zie hieronder. Sleutels van oefeningen
(`data-note` / `data-key`) nooit hernoemen, anders raakt Tom zijn historiek kwijt.

## Werkwijze
- Kleine, gerichte aanpassingen; stijl en tokens van de bestaande app aanhouden
  (Fraunces + Work Sans, terracotta-accent, licht en donker).
- Eerst lokaal controleren (bv. `python3 -m http.server` + Playwright-screenshot op 375 px breed),
  dan committen en pushen naar `main`. Pages publiceert binnen een minuut.
- Tom ziet de update na de app volledig te sluiten en opnieuw te openen.
- Antwoord Tom kort, in het Nederlands.

## Statistieken (Kracht → subtab Statistieken)
Figuur voor/achter + lijst per spier. Periodes (`per`, onthouden in localStorage `fitlog-stats-per`):
- Dag = de laatste trainingsdag, Week = laatste 7 dagen → totaal aantal sets.
- Maand = laatste 30 dagen, Alles = sinds de eerste afvinking → gemiddeld aantal sets per week.
Kleur is relatief t.o.v. de best getrainde spier in die periode, zodat je de balans ziet.
`hist` bewaart alles (nooit opschonen), dus extra periodes kunnen zonder datamigratie.

**Waar staat wat** (allemaal in `index.html`, zoek op `statistieken`):
- `MLAB` — de spiergroepen en hun Nederlandse naam (17 stuks).
- `MUSCLES` — per oefeningsleutel welke spieren meetellen: `1` = hoofdspier, `.5` = werkt flink mee,
  `.25` = helpt een beetje. Bv. `'d1-goblet-squat':{quad:1,bil:.5,buik:.25,onderrug:.25}`.
- `GROUPDEF` — terugval voor een oefening zonder eigen regel in `MUSCLES`: de spiergroep-kop waaronder
  ze staat (Borst, Schouders …) bepaalt de spieren. Namen met "curl" → biceps, "triceps/pushdown/
  extension" → triceps.
- Kracht heeft twee subtabs (Training met knoppen 'Start nieuwe training' bovenaan en 'Einde training'
  onderaan, beide `.reset-chk`, volle breedte met plus/vinkje: vinkjes leeg; Start scrolt naar Opwarming,
  Einde opent Statistieken › Dag (`window.__ksub`, `window.__statsPer`); tellingen/hist zijn al bij het afvinken bewaard) (`#k-train` → pane `#s-d3`, `#k-stats` → pane `#s-stats`); laatste keuze
  in localStorage `fitlog-ksub`.
- Lichaamstekening zit in `drawBody()` (armen langs het lichaam, viewBox 28 0 144 450): halve vormen (kijkerslinks, x ≤ 100) die rond x = 100 gespiegeld
  worden, als `[spier|null, pad]`. `null` = neutraal vlak (hoofd, handen, knieën …). Vlakken delen hun
  randen; de naden en de buitenomtrek komen van een tweede laag met dikke lijn (`.o`). Een gat tussen
  vlakken wordt dus zichtbaar als achtergrond: altijd randen laten aansluiten.

**Hoe het telt:**
- Elke afvinking (via `bumpCount`, dus zoals de teller) schrijft een rij in collectie `hist`:
  `{k: oefeningsleutel, t: tijdstip, s: aantal sets, m: {spier: gewicht}}`. Uitvinken verwijdert de
  laatste rij van die oefening; zakt de teller via de min-knop naar 0, dan gaan alle rijen van die
  oefening weg, ook haar deel in `seed` (`histClear`). De opwarming telt niet mee.
- Sets komen uit de tekst onder de oefening (`3 × …`, `2 rondes`, `2 sets`); anders 3.
- Score per spier = som van sets × gewicht binnen de periode (bij Maand/Alles gedeeld door het aantal
  weken vanaf de eerste training in die periode, minstens 1).
- Rij `seed` (eenmalig): tellingen uit `counts` van vóór de statistieken, geteld op hun `last`-datum.

**Oefeningen toevoegen of verwijderen — de geschiedenis blijft kloppen:**
- Elke `hist`-rij bewaart zijn eigen kopie van spieren en sets. Een oefening verwijderen of haar
  spierverdeling aanpassen verandert dus niets aan wat al geteld is; ze telt alleen niet meer mee
  voor nieuwe trainingen en schuift met de tijd vanzelf uit de gekozen periode.
- Nieuwe oefening: geef haar een nieuwe, unieke sleutel én voeg een regel toe aan `MUSCLES`. Zonder
  regel werkt de terugval op `GROUPDEF`, maar die is grover.
- Nooit een bestaande sleutel hergebruiken voor een andere oefening.
- Nieuwe spiergroep nodig? Toevoegen aan `MLAB` én een vlak tekenen in de figuur (front/back, `m`).

## Progressie (onderaan Statistieken)
- Keuzelijst met alle invulvelden van Kracht (`#s-d3 .exr-in`, opwarming niet; supersets = twee
  aparte lijnen), gegroepeerd per spiergroep. Periodes Maand / 3 maanden / Alles. Keuzes onthouden
  in localStorage `fitlog-prog-sel` en `fitlog-prog-per`.
- Collectie `prog`: één meetpunt per invulveld per dag, id `<data-note>@jjjj-mm-dd`,
  `{k: data-note, d: datum, t: tijdstip, v: getal}`. Geschreven bij afvinken (`bumpCount` → alle
  velden van die oefening) en bij elke wijziging van het veld (na de 500 ms-debounce). Zelfde dag
  = overschrijven; veld leegmaken = punt van vandaag weg (ook bij laden). Getal = eerste getal uit het veld ("12,5" → 12.5). Eenheid = placeholder (kg/reps/sec).
- Eenmalig bij een lege `prog`: huidige waarden als eerste punt op de `last`-datum uit `counts`.
- Grafiek: eigen SVG in `renderProg()`, één lijn in de accentkleur, tik/sleep toont datum + waarde.

