# Protocol 53 — werkafspraken voor Claude

Persoonlijke trainings-app van Tom. **De app zelf is in het Engels** (alle schermteksten, uitleg,
meldingen, inloggen); met Tom communiceer je in het Nederlands. Draait als web-app (PWA) op
https://sodafish.github.io/Protocol53/ via GitHub Pages (branch `main`, root). Tom gebruikt hem
vooral op zijn iPhone, als app op het beginscherm.

## Bestanden
- `index.html` — de hele app (HTML, CSS en JS in één bestand). Hier gebeuren bijna alle aanpassingen.
- `cloud.js` — opslag in Supabase met offline wachtrij, inlogscherm, back-up (`p53Backup`: alle collecties log, checks, counts,
  hist, prog, cfg, sess als JSON) en uitloggen.
  Statusregel onder de titel (`#syncStamp`, klasse `warn`): offline / database niet bereikbaar
  (bv. gepauzeerd Supabase-project) / nog niet bewaard (pas na 1 s wachtrij, anders flikkert het); bij problemen elke minuut opnieuw proberen.
  Bootst de oude db-API na (`collection().doc().set()/delete()`, `onSnapshot`).
  Race pull/flush opgelost: wat tijdens een lopende pull naar de server ging (lijst `recent`, 2 min) wordt na het pull-antwoord opnieuw
  toegepast, anders verdween een net gezet vinkje/meting uit de snapshot.
  `p53ResetData(logIds)`: wist op de server (alleen online) alle rijen van checks, counts, hist, prog, sess + de log-rijen van de
  invulvelden, plus cache/wachtrij/localStorage daarvan; knop 'Reset data' onder Settings › Your data (`#resetData`, `p53Confirm` danger), daarna
  herladen. Notities, cfg (oefeningkeuze, sets, profiel) blijven.
- `sw.js` — service worker (`const VERSION = 'p53-vN';`, let op de spaties bij zoeken/vervangen). Verhoog `VERSION` bij elke wijziging aan gecachte bestanden
  (icons, cloud.js, vendor) zodat de iPhone de nieuwe versie ophaalt.
  Pagina's/JS worden met `cache: 'no-cache'` opgehaald (anders houdt de HTTP-cache van GitHub Pages ze tot 10 min vast).
- `manifest.webmanifest`, `icons/` — app-naam 'Protocol' (generiek, ook `apple-mobile-web-app-title` en `<title>`) en
  icoon `app-*.png` (180/192/512/1024, beeld van Tom: sporter met oranje cirkel). De oude `p53-*.png` worden niet meer gebruikt.
- `img/` — oefenfoto's (Free Exercise DB, begin/eind), wisselen automatisch onder de i-knop.
- `vendor/supabase.js` — supabase-js v2, lokaal voor offline gebruik.
- `seed.json` — oude gegevens van Tom; wordt niet meer geïmporteerd (nieuwe accounts starten leeg). Niet aanpassen.

## Data
Supabase-project `protocol53` (Frankfurt), tabel `public.p53 (user_id, coll, id, data jsonb)`,
RLS: alleen eigen rijen, dus elk account heeft eigen gegevens (aanmelden via het inlogscherm).
Meerdere gebruikers: `cloud.js` onthoudt het laatste account in localStorage `p53-uid`; logt er een ander account in,
dan worden alle lokale gegevens (`fitlog-*`, `p53-queue`, `p53-cache`) gewist (`wipeLocal`). Uitloggen wist ze ook. Collecties: `log` (kilo's en notities, `{t}`), `checks` (`{done}`),
`counts` (`{n,last,prev}`), `hist` (statistieken) en `prog` (progressie), zie hieronder. Sleutels van oefeningen
(`data-note` / `data-key`) nooit hernoemen, anders raakt Tom zijn historiek kwijt.

## Werkwijze
- Kleine, gerichte aanpassingen; stijl en tokens van de bestaande app aanhouden
  (Fraunces + Work Sans, terracotta-accent, licht en donker).
- Eerst lokaal controleren (bv. `python3 -m http.server` + Playwright-screenshot op 375 px breed),
  dan committen en pushen naar `main`. Pages publiceert binnen een minuut.
- Tom ziet de update na de app volledig te sluiten en opnieuw te openen.
- Antwoord Tom kort, in het Nederlands. Nieuwe schermteksten schrijf je in het Engels.
- Engelse teksten in JS-strings tussen enkele quotes: gebruik een typografische apostrof (don’t),
  anders breekt de string. Uitzondering: sleutels die exact moeten overeenkomen met schermnamen
  (bv. `"Farmer's Carry"` in `NAMES`).
- Bij elk notitieveld (`#sessNote`, `#cardioNote`, `#dietNote`) staat rechts op de lijn van de titel 'Notes'
  (`.note-head`) een rond vuilbakje (`.note-erase`, alleen icoon, zelfde stijl als `.grp-edit`, met bevestiging); het
  maakt het veld leeg en stuurt een `input`-event zodat de gewone opslag het wissen bewaart.
- Ronde icoonknoppen overal gelijk (blok onderaan de CSS 'alle ronde icoonknoppen'): 36 px, cirkel 1.5px `--line`, icoon 15 px
  (kruisje 14), druk = `--paper-soft` + scale(.95). Geldt voor `.sheet-x` (sluiten), `.prog-edit`/`.ip-edit`, `.pe-del`, `.grp-edit`,
  `.note-erase`, `.gs-set` en de i-knop. Nieuwe icoonknop: zelfde maat en cirkel.
  Bewerk-icoon (groepspotlood `.grp-edit`, `#progEdit`, `.ip-edit`): Material Symbols 'edit_note' (lijntjes + potlood) als inline SVG,
  20 px (viewBox 0 -960 960 960, `fill=currentColor`), zodat het optisch even groot is als de andere iconen.
- Focus op invulvelden en notities: geen dikke rand, enkel een dunne rand die zacht oplicht (40% inktkleur: in donker lichter/witter, in licht iets donkerder).
- Invulveld aantikken: geen eigen scroll-code (een visualViewport-correctie liet de lijst flikkeren op iOS, teruggedraaid).
  Wel `html:has(input:focus,textarea:focus){scroll-behavior:auto}` zodat iOS het veld zonder 'smooth' in beeld schuift.
  De iOS-balk met pijltjes en vinkje boven het toetsenbord is van Safari en kan een web-app niet weghalen.
- Bevestigen nooit met `confirm()`: gebruik `p53Confirm({title,msg,ok,danger})` (Promise<boolean>),
  een eigen venster in de app-stijl.
- Interne sleutels bleven Nederlands (spiersleutels `borst`, `bil` …, `data-note`, collecties, ids zoals
  `t-kracht`, `t-voeding`): niet vertalen. Schermnamen van oefeningen moeten gelijk zijn aan de sleutels
  in `NAMES` (bv. 'Dead Hang', 'One-Arm Dumbbell Row', 'Bodyweight Squats').

## Profiel (leeftijd in de titel)
- Alleen in de kop van de app: `Protocol <em id="ageNum">` + leeftijd; zonder geboortedatum 53. App-naam, `<title>` en
  icoon blijven generiek ('Protocol'). Het inlogscherm toont gewoon 'Protocol'.
- Onderblad 'Settings' (`#dob-sheet`, id bleef; het uitlegvenster sluit het uit met `:not(#dob-sheet)`): geboortedatum `#dobIn` + Save,
  daaronder 'Your data' (`.st-sec`) met Export backup, Log out en Reset data (`#resetData`); die stonden vroeger onder Info › App (weg).
  Openen via tik op het getal (`button#ageBtn`) of More › Settings (`#moreProfile`, `window.__p53profileOpen`).
- Opslag: collectie `cfg`, doc `profile` (`{dob:'jjjj-mm-dd'}`), cache localStorage `fitlog-dob`. Bij 'Create account' is de
  geboortedatum verplicht (`cloud.js`, `user_metadata.dob` via `signUp`). `cloud.js` zet `window.__p53user` en stuurt event `p53-user`.
  Leeftijd herberekend bij laden en bij terugkeren naar de app.
- Calorieën, geslacht, lengte en gewicht zijn op vraag van Tom weer weggehaald (niet opnieuw toevoegen zonder vraag).

## Navigatie
- Onderaan een zwevende glazen navbar (`.gnav`, klasse `.glass`: zelfde kleur als de invulvelden: `--surface` op 90% in licht (anders lijkt ze op de paginakleur), 62% in donker, blur 26px, saturate 140%, witte lichtrand (vroeger warm glas op 26%)): pil met **Workout** (icoon: Material Symbols 'task_alt', rond vinkje, als inline SVG; vroeger 'target_check')
  en **Coverage** (vroeger Progress/Balance; intern blijft het `progress`, `#k-stats`; icoon: Material Symbols 'man', staand figuurtje), plus een losse ronde knop met drie puntjes (`#gnavMore`) die een onderblad
  `#more-sheet` opent met Cardio, Diet, Info en als laatste Settings (`#moreProfile`, tandwiel). Tik op het actieve item = zacht naar boven scrollen; wisselen van pagina
  begint bovenaan (meteen + na 200/450 ms, omdat het wisselen van tab zelf nog kan scrollen), behalve terug naar Workout: die
  komt terug op de onthouden scrollpositie (`window.__woY`, bewaard bij het verlaten van Workout, op 0 gezet na End workout).
- De oude hoofdtabs bovenaan (`.tabbar`, knoppen `#t-schema`, `#t-cardio`, `#t-voeding`, `#t-kracht`) en
  de subtabs (`.ksub`, `#k-train`/`#k-stats`) bestaan nog maar zijn verborgen; de navbar klikt ze aan.
  `window.__ksub` is omwikkeld zodat sprongen (bv. End workout → Progress) de navbar bijwerken.
- Onder de titel staat de huidige pagina (`#pgTitle`).
- De app opent altijd op Workout (geen vorige pagina terugzetten). Wel onthouden (localStorage): periode statistieken
  `fitlog-stats-per`, oefening en periode progressie `fitlog-prog-sel`/`fitlog-prog-per`, Full/Upper/Lower `fitlog-split`,
  oefeningen per groep `fitlog-groups` (+ cfg/groups), geboortedatum (+ cfg/profile).
- Geen zwevende pijl naar boven meer (tik op het actieve navbar-item). Body heeft extra ruimte onderaan.

## Statistieken (Workout/Progress → Progress)
Figuur voor/achter + lijst per spier. Periodes (`per`, onthouden in localStorage `fitlog-stats-per`):
- Vier knoppen: Last (`dag`, de laatste trainingsdag → totaal aantal sets), Week (`week`, laatste 7 dagen → totaal aantal sets),
  Month (`maand`, laatste 30 dagen) en All (`alles`, sinds de eerste afvinking) → gemiddeld aantal sets per week.
Kleur is relatief t.o.v. de best getrainde spier in die periode, zodat je de balans ziet.
`hist` bewaart alles (nooit opschonen), dus extra periodes kunnen zonder datamigratie.

**Waar staat wat** (allemaal in `index.html`, zoek op `statistieken`):
- `MLAB` — de spiergroepen en hun (Engelse) schermnaam (18 stuks; `add` = Adductors, vlak binnenkant dij vooraan,
  hoofdspier van de adductie-oefeningen in groep 3 en hulpspier bij squats/sumo deadlift).
- `MUSCLES` — per oefeningsleutel welke spieren meetellen: `1` = hoofdspier, `.5` = werkt flink mee,
  `.25` = helpt een beetje. Bv. `'d1-goblet-squat':{quad:1,bil:.5,buik:.25,onderrug:.25}`.
- `GROUPDEF` — terugval voor een oefening zonder eigen regel in `MUSCLES`: de spiergroep-kop waaronder
  ze staat (Chest, Shoulders …, regexen op de Engelse koppen) bepaalt de spieren. Namen met "curl" → biceps, "triceps/pushdown/
  extension" → triceps.
- Workout heeft bovenaan (`.reset-top`, in `.tools-row` naast de split-knop) de omlijnde knop 'Start' (`.wo-btn`, play-icoon):
  start de timer en scrolt naar Warm-up. Tijdens een workout (timer loopt of er staat een vinkje: `woActive`) is die knop uitgegrijsd
  (`aria-disabled`, 35%) en staat rechtsonder boven de navbar een zwevende donkere pil 'End' + verstreken tijd (`#woEnd`, `#woEndT`,
  m:ss / u:mm:ss; body krijgt `wo-on` = extra ruimte onderaan), op elke pagina. Vóór de start is de pil verborgen
  (`.wo-end[hidden]{display:none}` nodig, want `display:inline-flex` overschreef anders het `hidden`-attribuut). De onderste End-knop is weg; de navbar toont altijd 'Workout'.
  Tik op End → `p53Confirm` ('End workout?', met de tijd) → sessie bewaren, alle vinkjes leeg, timer stop, periode Last workout
  (`__statsPer('dag')`), naar Coverage, `__woY=0`, daarna vuurwerk. Alles wat afgevinkt was, is al bewaard (grafiek). Na End kun je niet
  meer uitvinken; corrigeren via het edit-blad van de grafiek. Vinkjes vervallen ook vanzelf de volgende dag.
  Timer: starttijd in localStorage `fitlog-wo-start` (overleeft herladen, vervalt na 12 u); het eerste vinkje start hem ook.
  Sessie in collectie `sess` (id `jjjj-mm-dd@start`, `{d,s,e,n}`; cache `fitlog-sess`, ook in de back-up).
  Vuurwerk `window.__congrats({min,n})`: overlay `.cg` met canvas-vuurwerk (accent/goud/crème), 'Congratulations!' (Fraunces, één regel)
  + duur · oefeningen; tik of 4,5 s = weg. Geen geluid (op vraag van Tom weggehaald). Bij reduced motion zonder vuurwerk.
- Kalender onderaan Coverage (`#cal`, kop 'Workouts', eigen script onderaan `index.html`, `window.__renderCal`, ververst mee met
  `renderStats`), bewust eenvoudig (op vraag van Tom): maand met pijltjes (niet voorbij deze maand), week begint op maandag, bolletje
  in de accentkleur op elke dag met een meting in de grafiek (geen warm-up),
  vandaag in accentkleur, bovenaan 'N workouts · N sets' (sets van die maand). Tik op een dag = eronder 'Dag datum · Programma · N sets' (som van de sets van elke oefening
  die dag, één keer per oefening). Programma (`prog()` in het kalenderscript) wordt per workout afgeleid uit de groepen met een meting: g10 = EGYM (+ rest), enkel g8 = Cardio,
  enkel g2/g4/g5/g7 = Upper body, enkel g1/g3/g6 = Lower body, anders Full body; meerdere workouts op één dag = 'Upper body + Cardio'. Bron = alleen de grafiekdata (`prog`, zoals 'N×'; sets via `window.__setsFor`), ververst bij `p53-prog`. Geen duur, oefeningenlijst of sessiebeheer meer in de kalender (`sess` wordt wel nog bewaard).
  Subtabs (`#k-train` → pane `#s-d3`, `#k-stats` → pane `#s-stats`); bij opstarten altijd Workout.
- Lichaamstekening zit in `drawBody()` (armen langs het lichaam, viewBox 28 0 144 ~400; het lichaam wordt verticaal
  geschaald met `SY` = .86 rond de kin `CY` = 55, hoofd en oor (eerste deel) niet; paden zelf blijven in 450-coördinaten): halve vormen (kijkerslinks, x ≤ 100) die rond x = 100 gespiegeld
  worden, als `[spier|null, pad]`. `null` = neutraal vlak (hoofd, handen, knieën …). Vlakken delen hun
  randen; de naden en de buitenomtrek komen van een tweede laag met dikke lijn (`.o`). Een gat tussen
  vlakken wordt dus zichtbaar als achtergrond: altijd randen laten aansluiten.

**Hoe het telt:**
- ÉÉN BRON: Coverage (`events()`), het getal N×, de kalender en de grafiek komen allemaal uit `prog` (de grafiekdata).
- Eén meting per veld per WORKOUT: id `<veld>@<jjjj-mm-dd>@<woStart>` met `w` = start van de workout (`window.__woStart()`, `sessId`).
  Twee workouts op één dag = twee metingen = 2× / 2 trainingen in Coverage en kalender ('2 workouts', sets opgeteld). Opnieuw afvinken
  binnen dezelfde workout overschrijft. Uitvinken zet alleen de meting van de lopende workout terug (`__progSnap`/`__progDropToday`,
  `fitlog-undo` met `{d,w,p}`); eerdere workouts worden nooit aangeraakt. Handmatig 'Add' in het edit-blad: id `<veld>@<dag>@m`
  (`w:'m'`, één per veld per dag, naast de workouts). Oude metingen `<veld>@<dag>` (zonder w) blijven geldig. Groeperen (N×, Coverage,
  kalender) gebeurt per oefening per `dag|w` (supersets: beide velden één keer). Het edit-blad toont het uur als er die dag meer dan één
  workout-meting is, en wist per meting (`e.id`); is het de lopende workout en staat de rij afgevinkt, dan gaat het vinkje mee weg.
  Afvinken vraagt een getal in elk veld. MIGK-migratie houdt het id-achtervoegsel.
  `hist` wordt nog geschreven (oude code) maar telt nergens meer mee; de 'No value'-dagen (`.pe-gap`/`.ip-gap`) zijn uitgeschakeld.
- Elke afvinking (via `bumpCount`, dus zoals de teller) schrijft een rij in collectie `hist`:
  `{k: oefeningsleutel, t: tijdstip, s: aantal sets, m: {spier: gewicht}}`. Uitvinken verwijdert de
  laatste rij van die oefening; zakt de teller via de min-knop naar 0, dan gaan alle rijen van die
  oefening weg, ook haar deel in `seed` (`histClear`). De opwarming (`w0-…`) telt niet mee.
- Maximaal één training per oefening per kalenderdag: `events()` neemt per oefening per dag maar één `hist`-rij mee.
- Ook metingen in `prog` tellen als training (in `events()`): één per oefening (rijsleutel via `chkKey`) per kalenderdag,
  alleen als er die dag nog geen `hist`-rij voor die oefening is (dus nooit dubbel). Zo telt een achteraf met het potlood
  toegevoegde sessie mee. Sets/spieren van zo'n meting = de huidige van de oefening. Een meting ontstaat alleen bij afvinken (alle velden van
  die rij) of met het potlood; typen in het veld meet alleen als de rij al afgevinkt is (dan wordt de meting van vandaag
  bijgewerkt). Uitvinken wist de meting(en) van vandaag van die rij (`__progDropToday`); de min-knop van de teller niet.
  End workout wist alleen de vinkjes, metingen en hist blijven. Coverage ververst bij `p53-prog`.
- Het invulveld toont de laatste waarde uit de grafiek (`syncFromChart`, bij laden, na de log-snapshot en bij `p53-prog`),
  tenzij je daarna zelf iets typte dat nog niet bevestigd is (`local[key].at` > tijd laatste meting). Typen wordt pas een
  meting bij afvinken; aanpassen kan ook via het potlood.
- Twee trainingen op één dag: een meting is er één per veld per dag (de laatste waarde telt). Afvinken bewaart eerst wat er die
  dag al stond (`window.__progSnap`, localStorage `fitlog-undo`); uitvinken zet precies dat terug (`__progDropToday(li,dag,k)`), zodat een
  tweede (test)training nooit de meting van een eerdere training wist. Zonder bewaarde stand: alleen wissen als het de enige hist-rij
  van die dag is (`window.__histCountDay`). 'No value · Add' in `#pe-sheet` stelt de waarde uit het invulveld voor.
- Vinkjes gelden voor één dag: in de `checks`-snapshot vervallen vinkjes van een vorige kalenderdag (of zonder `at`)
  vanzelf (doc gewist); hist en metingen blijven. Uitvinken wist de meting van de dag van de laatste hist-rij van die
  oefening (`__lastHistDay`), niet blind 'vandaag' (middernacht).
- Afvinken kan alleen met een waarde in elk invulveld van de rij (de vorige waarde die er nog staat volstaat): een leeg
  veld licht op in de accentkleur, schudt even (`.need`) en krijgt de focus. Zo heeft elke training een punt in de grafiek.
- Het getal 'N×' bij een oefening (workout én keuzeblad, ook warm-up) = aantal dagen met een meting in `prog` voor de
  invulvelden van die rij (`window.__exStat(k)`, supersets: beide velden samen, één per dag), dus altijd gelijk aan de grafiek.
  Oude vinkjes zonder meting (hist-rijen of `seed` van vóór de verplichte invulvelden) tellen wel in Coverage, niet in N×.
  Zodat alles wat in Coverage telt ook te zien/aan te passen is: `#pe-sheet` toont zulke dagen als 'No value · Add' (`.pe-gap`,
  uit `window.__histDays(rijsleutel)`); tik = datum in het formulier + focus op waarde (toevoegen = gewone meting, telt dan ook in N×),
  vuilbakje = `window.__histDropDayAll` (hist-rijen van die dag + eventueel de seed-beginstand). Onder 'Your progress' staat dan
  'N earlier sessions have no value…' (`.ip-gap`). Geen min-knop meer: corrigeren doe je in de grafiek (potlood).
  Een meting verwijderen wist ook de hist-rij(en) van die oefening op die dag (`__histDropDay`), en is het vandaag en
  staat ze afgevinkt, dan gaat ook het vinkje weg. `renderStats` werkt de getallen bij (`paintCounts`).
- Sets komen uit de tekst onder de oefening (`3 × …`, `2 rounds`, `2 rondes`, `2 sets`); anders 3.
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

## Progressie per oefening
- Het blok 'Active exercises' onder Progress (`#prog`) is verborgen (`hidden`): progressie bekijk je nu onder de uitleg
  (i-knop). De code erachter blijft, want `#pe-sheet`, `prog` en `window.__progPts` worden ook door het uitlegvenster gebruikt.
- Schuifbare rij lijntabs (`#progChips`, zoals de subtabs, met spiergroepnummer ertussen; hero en grafiek
  hebben een vaste hoogte zodat niets verspringt) met alle invulvelden van Kracht (`#s-d3 .exr-in`, opwarming niet; supersets = twee
  aparte lijnen). Periodes Maand / 3 maanden / Alles. Keuzes onthouden
  in localStorage `fitlog-prog-sel` en `fitlog-prog-per`.
- Collectie `prog`: één meetpunt per invulveld per dag, id `<data-note>@jjjj-mm-dd`,
  `{k: data-note, d: datum, t: tijdstip, v: getal}`. Geschreven bij afvinken (`bumpCount` → alle
  velden van die oefening) en bij elke wijziging van het veld (na de 500 ms-debounce). Zelfde dag
  = overschrijven; veld leegmaken (bij een afgevinkte rij) = punt van vandaag weg. Getal = eerste getal uit het veld ("12,5" → 12.5). Eenheid = placeholder (kg/reps/sec).
- Geen automatische meetpunten meer: vroeger werden bij een lege `prog` alle ingevulde velden (ook warm-up) als meting
  bewaard; dat is verwijderd, want het maakte metingen zonder afvinken (o.a. na het wissen van alle metingen).
- Grafiek: eigen SVG in `renderProg()`, één lijn in de accentkleur, tik/sleep toont datum + waarde.
  In beide grafieken loopt de lijn door alle metingen, maar een bolletje staat alleen bij de eerste, de laatste en
  waar de waarde verandert.
- Ook in het uitlegvenster (i-knop, dus ook voor uitgezette oefeningen via het keuzeblad): per invulveld met metingen
  een blok 'Your progress' (supersets: twee blokken met naam) met laatste waarde, verschil sinds de eerste meting,
  potlood (`window.__progEdit(k)` opent `#pe-sheet` bovenop, klasse `.top`) en een mini-grafiek van de eerste tot de
  laatste meting (geen periodefilter), datums altijd met jaar (`dLabY`). Getekend pas als het venster zichtbaar is, op de
  echte breedte (geen `preserveAspectRatio=none`, anders uitgerekt); het blok staat er bij elke oefening met een invulveld: zonder metingen '–' en een lege grafiek met
  'No progress recorded yet', bij één meting een bolletje in het midden met één datum. In de grafiek onder Progress komt het jaar
  erbij zodra een datum niet in dit jaar valt (`dLabYr`). Ververst live via event `p53-prog` (gestuurd door `saveProgLocal`).
- Potloodknop (`#progEdit`, alleen icoon) rechts op de lijn van het huidige gewicht opent een
  onderblad (`#pe-sheet`, zelfde stijl als de oefeninguitleg; sluiten met kruisje, naast tikken of Esc):
  bovenaan datum + waarde + Toevoegen (zelfde datum = overschrijven; tijdstip = 12u die dag), daaronder
  alle metingen (nieuwste eerst) met een vuilbakje (verwijdert meteen, zonder bevestiging). Lange lijsten scrollen in het blad.
  Let op: `#pe-sheet` deelt de klassen `.sheet`/`.sheet-bg` met het uitlegvenster; die code selecteert
  daarom `.sheet:not(#pe-sheet)`. Nieuwe vensters altijd met een eigen id aanspreken.
- Alle onderbladen: `overscroll-behavior:contain`; zolang een `.sheet` zichtbaar is én klasse `on` heeft, staat de
  pagina vast (body `position:fixed` met `top:-scrollY`, via MutationObserver onderaan `index.html`); bij sluiten komt
  de scrollpositie terug, zonder animatie (tijdelijk `scroll-behavior:auto`, want `html` scrolt standaard smooth). Slepen op `.sheet-bg` doet niets.
  Omlaag vegen sluit een blad (onderaan `index.html`, bij de scroll-lock): vanaf grip/titel altijd, op de inhoud alleen als die
  bovenaan staat; blad + achtergrond volgen de vinger, los na > 30% hoogte (max 140 px) of snelle veeg = klik op `.sheet-x`, anders terugveren.

## Full / Upper / Lower / EGYM / Cardio (dropdown naast Start)
- Bovenaan Workout (`.tools-row`): links 'Start' (`.wo-btn`, play-icoon; label kort 'Start' zodat alles op één lijn past), meteen rechts
  daarvan, alleen als de notitie onderaan (`#sessNote`) iets bevat, een ronde notitieknop `#noteJump`; helemaal rechts (`.split-sel`, margin-left:auto)
  de keuzeknop `#splitBtn`. De notitieknop (48 px, cirkel 1.5px `--line`, Material Symbols 'sticky_note_2' in accentkleur; ≤ 350 px: 42 px). Tik = zacht
  naar de notitie scrollen. Zichtbaarheid volgt input/change + elke 0,7 s (waarde kan uit de database komen zonder input-event).
- Eigen menu (geen native `<select>`): `#splitPop` in de volgorde Warm-up | Open Gym (intern nog `full`, vroeger 'Full body'), EGYM | Cardio | Upper body, Lower body (op vraag van Tom; `|` = scheidingslijn `hr.sm-sep`) (`menuitemradio`, vinkje in accentkleur).
  Keuze in localStorage `fitlog-split` (onbekend = full).
- `SPLIT`: warmup = g0, full = g1–g7, upper = g2, g4, g5, g7, lower = g1, g3, g6, egym = g10, cardio = g8. De warm-up is een eigen keuze (op vraag van Tom:
  ze hoort bij elk programma) en staat in geen enkel ander programma. Laatst gekozen programma (niet warm-up) in localStorage `fitlog-split-last`.
  Is de warm-up af door een vinkje (vinkje-handler stuurt event `p53-grpdone` met de groep zodra die groep `grp-done` wordt), dan schakelt de
  dropdown na 700 ms vanzelf naar dat laatste programma (standaard Open Gym) en scrolt zacht naar de eerste groep. g8 alleen bij Cardio. Verbergt via klasse `split-off` op alle `#s-d3 .exl > li[data-grp]`; body krijgt `split-cardio` in cardiomodus.
  'Start' scrolt naar de eerste zichtbare groepskop.
- Groep 8 'Cardio' (onderaan in `#s-d3`, kop zonder nummer, met potlood/keuzeblad zoals de andere groepen, geen uitleg-regel):
  rijen met sleutels `c-…` en een invulveld in minuten (`placeholder="min"`, data-note = sleutel): standaard aan Walking (`c-walk`,
  foto's walking = loopband), Walk-Jog Outdoors (`c-walkjog`), Treadmill Walk-Jog (`c-treadjog`), Rower (`c-row`), Elliptical (`c-elliptical`),
  Cycling (`c-bike`), Padel (`c-padel`, 'Intervals · 60–90 min', geen foto's: het uitlegblad toont dan enkel tekst + tip);
  uit: Incline Walk (`c-incline`), Stairmaster (`c-stairs`), Recumbent Bike (`c-recumbent`). Labels '· impact' / '· outdoors' via `.exr-eqp`.
  Eigen namen (uniek t.o.v. de warm-up!) met EX-uitleg (zone 2) en foto's (`cwalk`… in NAMES/EX/IMG; nieuw: trail, jogtread, recumbent).
  Werkt als kracht: afvinken (getal verplicht) = meting per workout, oog-knop = uitleg + grafiek + edit, timer/End, N×.
  Telt NIET in Coverage (spieren: `events()` slaat `w0-` en `c-` over); de kalender telt cardio als minuten i.p.v. sets: '17 sets + 20 min cardio' (plus als er
  kracht én cardio was; `amount()`), per dag en per maand. Een cardio-oefening streept de andere cardio-rijen niet door (je mag combineren). End workout met alleen cardio
  blijft op Workout (geen sprong naar Coverage), wel vuurwerk. De pagina Cardio onder More blijft als uitleg.
- Groep 10 'EGYM' (Toms EGYM-circuit in de gym; tussen g7 en g8 in `#s-d3`, kop zonder nummer, potlood/keuzeblad):
  alleen zichtbaar bij de keuze EGYM (`data-split="egym"`). Rijen `eg-…` met invulveld kg en schermnaam 'EGYM …' (zoals in de EGYM-app; uniek in NAMES).
  Standaard aan (Toms circuit, volgorde in POP = volgorde van het circuit): Rotary Torso (2 × 6), Lat Pulldown, Leg Press, Abdominal Crunch,
  Seated Row, Leg Extension, Triceps Press, Back Extension, Chest Press (2 × 15); uit: Leg Curl, Shoulder Press, Butterfly, Butterfly Reverse,
  Biceps Curl, Hip Abduction, Hip Adduction, Glute, Squat. Elk met MUSCLES (telt dus in Coverage), eigen EX-uitleg (`eg…`, + 'Enter the weight the
  EGYM screen shows.') en beelden van het vergelijkbare toestel via alias (VID/ANIM/IMG van bv. widepulldown, legpress, chestmachine; script bij `SSL`);
  Eigen EGYM-beelden van Tom (`EGI`, `img/egym/<naam>.jpg`, 640 px op wit, één beeld met bewegingspijl, bron 'Image: EGYM', klasse `.sheet-eg`)
  winnen van video/animatie/foto's; voor 14 toestellen (niet voor Butterfly, Butterfly Reverse, Biceps Curl, Squat: die houden de alias). Circuit-logica (`paintChecks`): niets doorstrepen, kop pas af als alle actieve oefeningen gedaan zijn.
  Mixen kan: EGYM afvinken, dan de dropdown op Full body zetten en losse oefeningen afvinken in dezelfde workout. Kalender (`prog()`): enkel g10 =
  'EGYM', g10 + andere krachtgroepen = 'EGYM + Open Gym' (of Upper/Lower). De kalender noemt een gemengde krachtworkout 'Open Gym' (vroeger 'Full body').

## Oefeningen per groep kiezen (Warm-up en groepen 1–7)
- Structuur ligt vast: Warm-up + 7 groepen (6 à 7 oefeningen per sessie houdt de focus): 1 Quads (vroeger 'Front legs'), 2 Chest,
  3 Hamstrings, glutes & calves (vroeger 'Back legs, glutes & calves'; GROUPDEF-regex kent beide namen), 4 Back (rows + pulldowns/pull-ups + face pull/bovenrug), 5 Shoulders, 6 Core, 7 Arms (biceps, triceps, onderarmen, supersets).
  Vroeger 9 groepen: oude 4+6 = nu g4, oude 7 = nu g6, oude 8+9 = nu g7. Rijen dragen `data-og` (oude groep) voor de
  volgorde (`cat`) en de eenmalige migratie (`migrate()`, vlag `v7` in cfg/groups: keuzes samengevoegd, Calisthenics-keuzes weg).
  Standaardkeuze voor een nieuwe gebruiker = Toms indeling van 6 okt 2026 (rijen zonder `ex-off` in de HTML; op vraag van Tom, met lege
  invul- en notitievelden): Warm-up: Rowing Machine, Cross Trainer, Bodyweight Squats, Band Pull-Aparts, Torso Rotation · 1: Goblet Squat,
  Bulgarian Split Squat, DB Reverse Lunges, DB Forward Lunges · 2: Push-Ups, Chest Press Machine · 3: Seated Leg Curl Machine, Glute Kickback
  Machine · 4: Seated Cable Row, Seated Row Machine, Cable Face Pull, Wide-Grip Lat Pulldown, V-Bar Pulldown, Dead Hang · 5: DB Lateral Raise,
  Seated DB Shoulder Press, Shoulder Press Machine, Reverse Fly Machine · 6: Plank, Side Plank, Weighted Back Extension, Dead Bug, Bird Dog ·
  7: Cable Biceps Curl, Curl Machine, Triceps Rope Pushdown, Triceps Bar Pushdown, Overhead Cable Triceps Extension (geen supersets).
  Cardio (g8) ongewijzigd. Toms eigen keuze staat in cfg/groups en verandert hier niet door. Invulvelden starten leeg (geen value in de HTML). Binnen een groep staan álle mogelijke oefeningen als gewone
  rijen in de HTML met `data-grp="g1"`; uitgezette rijen krijgen klasse `ex-off` (verborgen).
- Potloodknop `.grp-edit` in de groepskop opent onderblad `#grp-sheet` met schakelaars (`.sw`). Titel + kruisje blijven
  bovenaan staan (sticky `.sheet-head`; bij scrollen klasse `.stuck` = dunne lijn eronder). Minstens
  één oefening blijft aan. Keuze in localStorage `fitlog-groups` en Supabase collectie `cfg`, doc `groups`
  (`{g1:[sleutels die aan staan]}`); zonder keuze gelden de rijen die in de HTML niet `ex-off` zijn.
- Volgorde zelf kiezen (op vraag van Tom): in het keuzeblad staat links op elke rij een sleepgreep (`.gs-drag`, Material Symbols
  'drag_indicator', geen ronde knop; pointer events, `touch-action:none`, rij krijgt `.dragging` met schaduw, buren schuiven met een korte FLIP-animatie,
  blad scrolt mee aan de randen). Slepen kan alleen binnen dezelfde tussenkop (`data-sub`). Bij loslaten: `cfg.order[groep]` = alle sleutels in
  de nieuwe volgorde (cfg/groups, dus ook op de server) → `sortRows(groep)` + `apply()`. `sortRows` gebruikt die volgorde i.p.v. laag + POP
  (tussenkoppen blijven; nieuwe oefeningen zonder plaats achteraan op laag + POP) en wist eerst de oude `.exsub` van die groep, zodat opnieuw
  sorteren kan (ook als de snapshot een andere `order` brengt). De veeg-om-te-sluiten negeert aanrakingen op de greep.
- Omdat alles per oefeningsleutel wordt bewaard, blijft de geschiedenis van een uitgezette oefening
  bestaan: Active exercises toont alleen actieve oefeningen (`fillChips` filtert `.ex-off`,
  `window.__progChipsRefresh`), het lichaam/de spierlijst telt alles wat getraind is, ongeacht aan/uit.
- Groep-af-logica (`paintChecks`) negeert `.ex-off`-rijen. Eén oefening gedaan = groep af: kop doorgestreept en de andere
  oefeningen van die groep krijgen `grp-skip` (doorgestreept, 40%, blijven aanklikbaar). Opwarming (op vraag van Tom: cardio óf mobility):
  af zodra één oefening onder 'Cardio' gedaan is, of alle actieve oefeningen onder 'Mobility & activation' (`data-sub`); dan worden de
  andere warm-up-rijen ook doorgestreept (`grp-skip`) en scrolt de pagina door naar groep 1. De tussenkoppen (`.exsub`) van een afgevinkte groep worden mee grijs (`sub-off`).
  Wordt een groep af door een vinkje, dan scrolt de pagina na 450 ms zacht tot de volgende zichtbare, nog niet afgewerkte groepskop
  bovenaan staat (12 px marge; `nextGroup`, toetsenbord gaat dicht); geen volgende groep meer = niet scrollen.
  Doorscrollen gebeurt alleen bij Full body (`window.__split`, gezet door het split-script); bij Upper/Lower/Cardio niet (op vraag van Tom).
- Extra oefeningen (standaard uit) hebben sleutels `xN-…` (N = groepnummer), elk met MUSCLES, NAMES, EX-uitleg en
  foto's (Free Exercise DB, 640 px). Uitzondering: Crunch Machine gebruikt de oude sleutel `d3-crunch-machine`.
  Extra oefening toevoegen: rij met `data-grp="gN"` + `ex-off` in de groep, plus MUSCLES/NAMES/EX/IMG.
- Warm-up (groep 0, `data-grp="g0"`, kop zonder nummer) bestaat uit losse rijen met sleutels `w0-…` (zonder invulveld): 4 standaard
  (pull-aparts, squats, glute bridge) + uit: 5 min rowing / cross trainer / bike / incline walk, arm circles.
  Ze tellen wel in `counts` (teller per oefening), nooit in `hist` (`histAdd` slaat `w0-` over). Groep 0 is 'af' na één cardio-oefening of alle
  mobility-oefeningen (zie groep-af-logica). De oude sleutel `d3-wu` wordt niet meer gebruikt.
- Beelden in het uitlegblad, in volgorde van voorrang (op vraag van Tom): 1) video (`VID`, zie onder); 2) animatie alleen (`ANIM`, GIF 180 px uit
  github.com/hasaneyldrm/exercises-dataset, © Gym visual, alleen voor eigen gebruik, `img/anim/<EX-sleutel>.gif`, `.sheet-gif`);
  3) foto's (Free Exercise DB, `IMG`, wisselen start/eind). Foto's en animatie staan dus niet meer naast
  elkaar (de `.duo`-CSS bestaat nog maar wordt niet gebruikt). 144 oefeningen hebben een
  animatie (Curl Machine bewust niet: vreemde animatie, toont de foto's) (manueel gekozen en nagekeken); zonder goede match (o.a. Bulgarian Split Squat, Face Pull, Dead Hang, Band Pull-Aparts,
  Arm Circles, Cat-Cow, Plank-varianten, Bird Dog, Rower, Padel, supersets) enkel de foto's.
  Geen foto én geen animatie = niets tonen, enkel tekst: getekende figuren (`player`/`poses`) worden niet meer gebruikt (op vraag van Tom).
  Video's (`VID`, `img/vid/<EX-sleutel>.mp4`, 640 px, zonder geluid, autoplay/muted/loop/playsinline, klasse `.sheet-mov` (witte achtergrond),
  poster = `<sleutel>.jpg` (frame uit de video); `.sheet-vid` is de bestaande videolink); een video wint van animatie en foto's.
  Bron: de originele Gym visual-video's (720 px, zelfde stijl als de GIF's, naadloze lus) die Tom aanlevert, voor al zijn actieve oefeningen;
  enkel Arm Circles is nog een MuscleWiki-video (watermerk laten staan). Lijst in `VID` (spatielijst EX-sleutels; `VID.cell` = elliptical,
  `VID.legcurl` = seatedlegcurl; ook Band Pull-Aparts `pullapart`, Dead Hang `hang` , Bodyweight Squats `squat` , Rowing Machine `rowing` = ook cardio Rower via `VID.crow`, Side Plank `sideplank`, SkiErg `skierg`, Glute Bridge `bridge`, Single-Leg RDL `slrdl` en Cable Rope Hammer Curl `ropehammer`). Encoderen: `ffmpeg -nostdin` (anders eet ffmpeg de stdin van een lus op), `-an`, scale 640, crf 26.
  `VSQ` (vierkante video op wit) bestaat nog maar is leeg. Vervang je een bestaande video, verhoog dan `VIDV` (cache-buster `?v=` op video + poster, anders toont iOS de oude). Bird Dog: video; de getekende `player`-animatie blijft als terugval.
  Padel staat er zonder beeld. Torso Rotation (`w0-torso-rotation`, g0, reps) is op vraag van Tom terug, standaard aan; wie al een
  opwarmingskeuze had krijgt ze erbij via `migrate()` (vlag `tr` in cfg/groups); foto's `img/rotation-0/1.jpg` = afbeelding van Tom (handen op de heupen), in twee
  gesplitst en op wit 3:2 gezet.
  Nieuwe oefening: foto's (Free Exercise DB) + zo mogelijk een animatie toevoegen (sleutel in de `ANIM`-lijst + bestand in img/anim).
- Het keuzeblad toont ook het aantal trainingen ('· N×', zoals in de workout). De i-knop is overal dezelfde tint (de klasse
  `.nop` wordt nog gezet door `markProg` maar heeft geen stijl meer).
- Sets & reps per oefening: in het keuzeblad een rond knopje met icoon '123' (Material Symbols, inline SVG 24 px, viewBox bijgesneden tot `120 -840 720 720`, glyph verticaal gecentreerd) (`.gs-set`; standaard lichter, aangepast = gewone tint, zoals de i-knop) opent
  `#set-sheet` (bovenop, klasse `.top`) met stepper Sets (0–10, 0 = geen 'N ×') en tekstveld 'Reps or time', voorbeeld
  'Shows as', Save en 'Reset to default'. Opslag: localStorage `fitlog-sets` + cfg/doc `sets` (`{sleutel:{s,r}}`).
  `applySets` vervangt de eerste tekst van `.exr-s` (origineel in `ORIG`); de statistieken lezen de sets uit die tekst,
  dus een aangepast aantal telt mee voor nieuwe afvinkingen.
- De i-knop (intern nog zo genoemd) toont Material Symbols 'visibility' (oog) als inline SVG `INFO_ICON`, 20 px,
  viewBox `0 -980 960 960` zodat het oog verticaal gecentreerd staat (vroeger een getekende Fraunces-'i');
  ze opent uitleg én progressie. Rond knopje (36 px, zoals `.gs-set`); in de workout vóór het invulveld
  (rij krijgt `.has-info`, grid `2.4rem 1fr 36px 4.2rem`; invulveld smal en helemaal rechts, past '999'/'12,5'/'reps'), in het keuzeblad links van het sets-knopje.
- Tik op een oefeningsrij in de workout (niet op vinkje, invulveld of een knop) = zelfde als de oog-knop (uitleg + grafiek); rijen met
  `.has-info` krijgen `cursor:pointer` (script onderaan `index.html`).
- In het keuzeblad staat naast elke naam de i-knop (`window.__p53info.open`); het uitlegblad komt dan bovenop
  (klasse `.over`, hogere z-index).
- Extra's bevatten bewust ook de klassiekers (barbell squat, deadlift, bench press, rows, overhead press, chin-ups,
  hanging leg raise, skull crusher …), ook als ze minder rug- of kniesparend zijn. Risico's krijgen een label in de
  accentkleur (`--accent`, geen eigen rood): `<span class="exr-warn">· Back!</span>` of `· Knees!` (ook `· Shoulders!`,
  `· Elbows!`), één woord met uitroepteken direct erachter; onderrug/bovenrug heet gewoon Back. Achteraan in `.exr-s`. Het keuzeblad toont dat label mee.
- Elke groep heeft zowel gangbare gym-oefeningen (machines, kabels, dumbbells, barbell) als calisthenics voor thuis
  (push-up-varianten, pistol/jump squat, nordic curl, inverted/ring row, pull-ups, handstand push-ups, core op de mat …).
  Eenheid: kg bij gewicht, reps bij lichaamsgewicht, sec/min bij tijd. Elke oefening heeft een invulveld (ook de warm-up;
  `data-note` = dezelfde sleutel als `data-key`), dus ook een progressiegrafiek.
- Oefeningen met ongevalsrisico (vrije barbell boven lichaam/gezicht, leg press, hack squat, smith, handstand …) staan in
  `RISK` (sleutel → veiligheidstip, in het uitleg-script): rij krijgt klasse `exr-danger` en een oranje driehoekje
  (`.exr-risk`) na de naam, ook in het keuzeblad; de uitleg toont de tip in een kader met driehoek (`EX[..].risk`, `.sheet-risk`).
  Nieuwe gevaarlijke oefening: sleutel + tip toevoegen aan `RISK`. Volgorde in het keuzeblad én in de workout (`sortRows` herschikt de rijen bij het laden): eerst oefeningen zonder aandachtspunt, dan met label (Back! …),
  dan gevaarlijke; binnen elke laag op populariteit volgens `POP` (per groep een lijst sleutels, meest gedaan eerst).
  Nieuwe oefening: ook haar sleutel op de juiste plek in `POP` zetten.
- Glute Kickback Machine (`x3-kickback-machine`, g3, standaard uit, kg): geen foto in de Free Exercise DB. Beeld = Gym visual-video (staand toestel)
  `img/vid/kickbackmachine.mp4`.
- Groep 3 heeft ook adductie (Hip Adduction Machine, Cable/Band Hip Adduction) en Leg Press Calf Raise (in `RISK`).
  Geen foto's in de Free Exercise DB voor: Copenhagen plank, lateral raise machine, tibialis raise, hollow hold,
  suitcase carry, daarom niet toegevoegd.
- Later toegevoegd: Smith Machine Bench Press, Dumbbell Bench Press (g2), Stability Ball Leg Curl (g3), Cable/Band External
  Rotation (g5, rotator cuff, telt als Rear delts), Reverse Crunch, Dumbbell Side Bend (nu g6), EZ-Bar Curl, Triceps Bar Pushdown,
  Spider Curl (nu g7), Cable Rope Hammer Curl (`x7-rope-hammer-curl`, g7 Biceps, standaard uit, · rope; de oude sleutel
  `d3-cable-hammer-curl` bestaat enkel nog in MUSCLES/seed, niet hergebruikt). Bewust niet: Glute-Ham Raise en Smith shoulder press (foto's tonen een verkeerde/riskante variant).
- Dubbels opgeruimd: `x2-incline-db-press` en `x4-incline-db-row` waren dezelfde oefening als `d1-dumbbell-chest-press`
  (nu schermnaam 'Incline Dumbbell Press', bank 15–30°) en `d3-chest-supported-row`; hun rijen zijn weg, MUSCLES-regels
  blijven voor oude historiek. 'Plank + Side Plank' is gesplitst: `d1-plank` = 'Plank', nieuw `x7-side-plank` = 'Side Plank'
  (eenmalige migratie `migrate()` in cfg/groups, vlag `sp`: wie plank aan had krijgt side plank erbij).
  Daarnaast opnieuw een gecombineerde 'Plank + Side Plank' als eigen oefening (`x7-plank-combo`, standaard uit, '2 × 30 sec front ·
  30 sec per side', zelfde tijd voor elke houding; foto's = eindbeeld plank + side plank).
- 'Leg Curl Machine' (`d2-leg-curl-machine`) was dezelfde oefening als 'Seated Leg Curl Machine' (`x3-seated-leg-curl`): rij weg,
  metingen (prog) en hist-rijen verhuizen automatisch naar x3 (`MIGK` in de snapshots), keuzes in cfg/groups ook (`migrate()`, vlag `lc`).
  Zelfde patroon gebruiken bij een volgende dubbel.
- Back!-label alleen bij onondersteund voorover scharnieren met gewicht (deadlifts, RDL, good morning, swing, bent-over rows,
  barbell squats, staande overhead press) en belaste rug-flexie/rotatie in core. Niet bij goblet squat, farmer's carry,
  seated cable row, one-arm DB row (hand op de bank).
- `sortRows` (`cat`): Back = eerst rows (`data-og` g4), dan verticaal/bovenrug (g6); Arms = curls, onderarmen (wrist/reverse),
  triceps (g9), supersets (twee invulvelden); daarbinnen laag + `POP`. Calisthenics-filter is weer verwijderd (op vraag van Tom).
- Tussenkoppen (`li.exsub`, door `sortRows` ingevoegd volgens `SUBS`): Warm-up = Cardio (bike, rowing, incline walk, cross trainer,
  SkiErg (`w0-skierg`, standaard uit, uitleg + tip over de rug), jump rope, stair climber) / Mobility & activation (de rest); Back = Rows / Vertical pull & upper back; Arms = Biceps /
  Forearms / Triceps / Supersets. Verborgen als er geen zichtbare oefening onder staat (in `apply`). Het keuzeblad toont dezelfde
  koppen (`li.gs-sub-h`, uit `data-sub` op de rij).
- Supersets (Arms, achteraan; volgorde in POP: rope only (ss2), bar only (ss3), mix rope + bar (ss1), reverse (ss4), single-arm (ss5);
  standaard aan: ss2, ss3, ss1; elke superset gebruikt altijd dezelfde hulpstukken zodat de gewichten vergelijkbaar blijven): ss1 Overhead Extension + Biceps Curl, ss2 Rope Pushdown +
  Hammer Curl, ss3 Bar Pushdown + Bar Curl (`x7-ss-bar`), ss4 Reverse-Grip Pushdown + Reverse Curl (`x7-ss-reverse`), ss5
  Single-Arm Pushdown + Single-Arm Curl (`x7-ss-single`). Per superset: rij met `.exr-in2` (twee velden, sleutel + `-b`), MUSCLES,
  NAMES → `ssN`, `EX.ssN`, `IMG.ssN` (4 foto's: begin/eind van beide), `SSL.ssN` (namen voor de foto-labels en progressieblokken), POP.
- Kabeloefeningen tonen het hulpstuk achter de sets: `<span class="exr-eqp">· rope</span>` (ook V-handle, D-handle(s), wide bar,
  close-grip bar, straight bar, straight or EZ bar, ankle strap); het keuzeblad toont het mee. Nieuwe kabeloefening: hulpstuk erbij.
- Arms-kop: 'Arms' + `<em class="grp-opt">(Optional)</em>` (cursief, zelfde stijl als de kop): in een full-body training zijn armen
  een extraatje (ze werken al mee bij rows/presses). Warm-up heeft geen 'Optional' meer.
- De rij-animatie (`cascade`) slaat `.ex-off`-rijen over en stopt de vertraging na 24 rijen.

