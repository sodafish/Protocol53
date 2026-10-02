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
`counts` (`{n,last,prev}`),
`hist` (statistieken: één rij per afvinking `{k,t,s,m}` met een kopie van sets en spieren, plus één rij
`seed` met de tellingen van vóór de statistieken). Sleutels van oefeningen (`data-note` / `data-key`) nooit hernoemen,
anders raakt Tom zijn historiek kwijt.

## Werkwijze
- Kleine, gerichte aanpassingen; stijl en tokens van de bestaande app aanhouden
  (Fraunces + Work Sans, terracotta-accent, licht en donker).
- Eerst lokaal controleren (bv. `python3 -m http.server` + Playwright-screenshot op 375 px breed),
  dan committen en pushen naar `main`. Pages publiceert binnen een minuut.
- Tom ziet de update na de app volledig te sluiten en opnieuw te openen.
- Antwoord Tom kort, in het Nederlands.
- Nieuwe oefening in Kracht? Voeg haar sleutel toe aan `MUSCLES` in `index.html` (spieren met gewicht
  1 / .5 / .25). Zonder eigen lijst valt ze terug op de spiergroep waaronder ze staat.
