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
`counts` (`{n,last,prev}`), `hist` (statistieken, zie hieronder). Sleutels van oefeningen
(`data-note` / `data-key`) nooit hernoemen, anders raakt Tom zijn historiek kwijt.

## Werkwijze
- Kleine, gerichte aanpassingen; stijl en tokens van de bestaande app aanhouden
  (Fraunces + Work Sans, terracotta-accent, licht en donker).
- Eerst lokaal controleren (bv. `python3 -m http.server` + Playwright-screenshot op 375 px breed),
  dan committen en pushen naar `main`. Pages publiceert binnen een minuut.
- Tom ziet de update na de app volledig te sluiten en opnieuw te openen.
- Antwoord Tom kort, in het Nederlands.

## Statistieken (spierbalans onder Kracht)
Figuur voor/achter + lijst met sets per week per spier, over de laatste 90 dagen. Kleur is relatief
t.o.v. de best getrainde spier, zodat je de balans ziet, niet een absoluut getal.

**Waar staat wat** (allemaal in `index.html`, zoek op `statistieken`):
- `MLAB` — de spiergroepen en hun Nederlandse naam (17 stuks).
- `MUSCLES` — per oefeningsleutel welke spieren meetellen: `1` = hoofdspier, `.5` = werkt flink mee,
  `.25` = helpt een beetje. Bv. `'d1-goblet-squat':{quad:1,bil:.5,buik:.25,onderrug:.25}`.
- `GROUPDEF` — terugval voor een oefening zonder eigen regel in `MUSCLES`: de spiergroep-kop waaronder
  ze staat (Borst, Schouders …) bepaalt de spieren. Namen met "curl" → biceps, "triceps/pushdown/
  extension" → triceps.
- `P53BODY`-tekening zit in `drawBody()`; elk vlak heeft `data-m` = sleutel uit `MLAB`.

**Hoe het telt:**
- Elke afvinking (via `bumpCount`, dus zoals de teller) schrijft een rij in collectie `hist`:
  `{k: oefeningsleutel, t: tijdstip, s: aantal sets, m: {spier: gewicht}}`. Uitvinken verwijdert de
  laatste rij van die oefening. De opwarming telt niet mee.
- Sets komen uit de tekst onder de oefening (`3 × …`, `2 rondes`, `2 sets`); anders 3.
- Score per spier = som van sets × gewicht over 90 dagen, gedeeld door het aantal weken.
- Rij `seed` (eenmalig): tellingen uit `counts` van vóór de statistieken, geteld op hun `last`-datum.

**Oefeningen toevoegen of verwijderen — de geschiedenis blijft kloppen:**
- Elke `hist`-rij bewaart zijn eigen kopie van spieren en sets. Een oefening verwijderen of haar
  spierverdeling aanpassen verandert dus niets aan wat al geteld is; ze telt alleen niet meer mee
  voor nieuwe trainingen en valt na 90 dagen vanzelf uit het venster.
- Nieuwe oefening: geef haar een nieuwe, unieke sleutel én voeg een regel toe aan `MUSCLES`. Zonder
  regel werkt de terugval op `GROUPDEF`, maar die is grover.
- Nooit een bestaande sleutel hergebruiken voor een andere oefening.
- Nieuwe spiergroep nodig? Toevoegen aan `MLAB` én een vlak tekenen in de figuur (front/back, `m`).

