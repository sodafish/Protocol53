# Protocol 53 — werkafspraken voor Claude

Persoonlijke trainings-app van Tom. **De app zelf is in het Engels** (alle schermteksten, uitleg,
meldingen, inloggen); met Tom communiceer je in het Nederlands. Draait als web-app (PWA) op
https://sodafish.github.io/Protocol53/ via GitHub Pages (branch `main`, root). Tom gebruikt hem
vooral op zijn iPhone, als app op het beginscherm.

## Bestanden
- `index.html` — de hele app (HTML, CSS en JS in één bestand). Hier gebeuren bijna alle aanpassingen.
- `cloud.js` — opslag in Supabase met offline wachtrij, inlogscherm, back-up en uitloggen.
  Statusregel onder de titel (`#syncStamp`, klasse `warn`): offline / database niet bereikbaar
  (bv. gepauzeerd Supabase-project) / nog niet bewaard (pas na 1 s wachtrij, anders flikkert het); bij problemen elke minuut opnieuw proberen.
  Bootst de oude db-API na (`collection().doc().set()/delete()`, `onSnapshot`).
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
- Bevestigen nooit met `confirm()`: gebruik `p53Confirm({title,msg,ok,danger})` (Promise<boolean>),
  een eigen venster in de app-stijl.
- Interne sleutels bleven Nederlands (spiersleutels `borst`, `bil` …, `data-note`, collecties, ids zoals
  `t-kracht`, `t-voeding`): niet vertalen. Schermnamen van oefeningen moeten gelijk zijn aan de sleutels
  in `NAMES` (bv. 'Dead Hang', 'One-Arm Dumbbell Row', 'Bodyweight Squats').

## Leeftijd in de titel (Protocol + leeftijd)
- Alleen in de kop van de app: `Protocol <em id="ageNum">` + leeftijd; zonder geboortedatum 53. App-naam, `<title>` en
  icoon blijven generiek ('Protocol'). Het inlogscherm toont gewoon 'Protocol'.
- Tik op het getal (`button#ageBtn`) opent onderblad `#dob-sheet` (eigen id; het uitlegvenster sluit het uit met
  `:not(#dob-sheet)`) met datumveld `#dobIn` + Save. Startwaarde: bewaarde datum, anders die uit de aanmelding
  (`user_metadata.dob`), anders 1 januari van 53 jaar geleden.
- Geboortedatum: bij 'Create account' verplicht veld (`cloud.js`, `user_metadata.dob` via `signUp`); daarna in
  collectie `cfg`, doc `profile` (`{dob:'jjjj-mm-dd'}`), cache localStorage `fitlog-dob`. `cloud.js` zet
  `window.__p53user` en stuurt event `p53-user`. Leeftijd herberekend bij laden en bij terugkeren naar de app.

## Navigatie
- Onderaan een zwevende glazen navbar (`.gnav`, klasse `.glass`: warm frosted glas, 26% oppervlakkleur (donker 24%), blur 30px, saturate 210%, witte lichtrand — Tom verkiest deze warmere tint boven neutraal): pil met **Workout** (icoon: Material Symbols 'target_check', als inline SVG)
  en **Coverage** (vroeger Progress/Balance; intern blijft het `progress`, `#k-stats`; icoon: Material Symbols 'man', staand figuurtje), plus een losse ronde knop met drie puntjes (`#gnavMore`) die een onderblad
  `#more-sheet` opent met Cardio, Diet en Info. Tik op het actieve item = naar boven scrollen.
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
- Last (knop, vroeger Day) = de laatste trainingsdag, Week = laatste 7 dagen → totaal aantal sets.
- Month = laatste 30 dagen, All = sinds de eerste afvinking → gemiddeld aantal sets per week.
(interne waarden van `per` blijven 'dag'/'week'/'maand'/'alles').
Kleur is relatief t.o.v. de best getrainde spier in die periode, zodat je de balans ziet.
`hist` bewaart alles (nooit opschonen), dus extra periodes kunnen zonder datamigratie.

**Waar staat wat** (allemaal in `index.html`, zoek op `statistieken`):
- `MLAB` — de spiergroepen en hun (Engelse) schermnaam (17 stuks).
- `MUSCLES` — per oefeningsleutel welke spieren meetellen: `1` = hoofdspier, `.5` = werkt flink mee,
  `.25` = helpt een beetje. Bv. `'d1-goblet-squat':{quad:1,bil:.5,buik:.25,onderrug:.25}`.
- `GROUPDEF` — terugval voor een oefening zonder eigen regel in `MUSCLES`: de spiergroep-kop waaronder
  ze staat (Chest, Shoulders …, regexen op de Engelse koppen) bepaalt de spieren. Namen met "curl" → biceps, "triceps/pushdown/
  extension" → triceps.
- Workout heeft bovenaan één omlijnde knop 'New workout' (`.reset-top`, niet volle breedte, met plus): vinkjes
  leeg en scrollen naar Warm-up; tellingen/hist zijn al bij het afvinken bewaard. (De oude End-knop is weg;
  `window.__statsPer` bestaat nog.) Onder de laatste groep (Arms) staat 'Finish workout' (`.finish-b`, zelfde omlijnde stijl,
  vinkje-icoon): na `p53Confirm` alle vinkjes leeg en naar boven scrollen; tellingen, kilo's en progressie blijven. Subtabs (`#k-train` → pane `#s-d3`, `#k-stats` → pane `#s-stats`); bij opstarten altijd Workout.
- Lichaamstekening zit in `drawBody()` (armen langs het lichaam, viewBox 28 0 144 ~400; het lichaam wordt verticaal
  geschaald met `SY` = .86 rond de kin `CY` = 55, hoofd en oor (eerste deel) niet; paden zelf blijven in 450-coördinaten): halve vormen (kijkerslinks, x ≤ 100) die rond x = 100 gespiegeld
  worden, als `[spier|null, pad]`. `null` = neutraal vlak (hoofd, handen, knieën …). Vlakken delen hun
  randen; de naden en de buitenomtrek komen van een tweede laag met dikke lijn (`.o`). Een gat tussen
  vlakken wordt dus zichtbaar als achtergrond: altijd randen laten aansluiten.

**Hoe het telt:**
- Elke afvinking (via `bumpCount`, dus zoals de teller) schrijft een rij in collectie `hist`:
  `{k: oefeningsleutel, t: tijdstip, s: aantal sets, m: {spier: gewicht}}`. Uitvinken verwijdert de
  laatste rij van die oefening; zakt de teller via de min-knop naar 0, dan gaan alle rijen van die
  oefening weg, ook haar deel in `seed` (`histClear`). De opwarming (`w0-…`) telt niet mee.
- Ook metingen in `prog` tellen als training (in `events()`): één per oefening (rijsleutel via `chkKey`) per kalenderdag,
  alleen als er die dag nog geen `hist`-rij voor die oefening is (dus nooit dubbel). Zo telt een achteraf met het potlood
  toegevoegde sessie mee. Sets/spieren van zo'n meting = de huidige van de oefening. Een meting ontstaat alleen bij afvinken (alle velden van
  die rij) of met het potlood; typen in het veld meet alleen als de rij al afgevinkt is (dan wordt de meting van vandaag
  bijgewerkt). Uitvinken wist de meting(en) van vandaag van die rij (`__progDropToday`); de min-knop van de teller niet.
  New/Finish workout wissen alleen de vinkjes, metingen en hist blijven. Coverage ververst bij `p53-prog`.
- Afvinken kan alleen met een waarde in elk invulveld van de rij (de vorige waarde die er nog staat volstaat): een leeg
  veld licht op in de accentkleur, schudt even (`.need`) en krijgt de focus. Zo heeft elke training een punt in de grafiek.
- Het getal 'N×' bij een oefening = aantal trainingen in de statistieken (`window.__exStat(k)` uit `events()`: vinkjes +
  metingen, één per dag); warm-up gebruikt nog `counts`. Geen min-knop meer: corrigeren doe je in de grafiek (potlood).
  Een meting verwijderen wist ook de hist-rij(en) van die oefening op die dag (`__histDropDay`), en is het vandaag en
  staat ze afgevinkt, dan gaat ook het vinkje weg. `renderStats` werkt de getallen bij (`paintCounts`).
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
- Eenmalig bij een lege `prog`: huidige waarden als eerste punt op de `last`-datum uit `counts`.
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
  alle metingen (nieuwste eerst) met een vuilbakje, altijd met bevestiging. Lange lijsten scrollen in het blad.
  Let op: `#pe-sheet` deelt de klassen `.sheet`/`.sheet-bg` met het uitlegvenster; die code selecteert
  daarom `.sheet:not(#pe-sheet)`. Nieuwe vensters altijd met een eigen id aanspreken.
- Alle onderbladen: `overscroll-behavior:contain`; zolang een `.sheet` zichtbaar is én klasse `on` heeft, staat de
  pagina vast (body `position:fixed` met `top:-scrollY`, via MutationObserver onderaan `index.html`); bij sluiten komt
  de scrollpositie terug, zonder animatie (tijdelijk `scroll-behavior:auto`, want `html` scrolt standaard smooth). Slepen op `.sheet-bg` doet niets.

## Full / Upper / Lower (dropdown naast New workout)
- Eigen menu (geen native `<select>`: iOS toont dan grote systeemletters): knop `#splitBtn` (pil met chevron, 500 14.5px)
  rechts naast 'New workout' in `.tools-row`, opent kaartje `#splitPop` met Full/Upper/Lower (`menuitemradio`, vinkje in
  accentkleur). Sluit bij keuze, tik ernaast, scrollen of Esc. Full = standaard; keuze in localStorage `fitlog-split`.
- Upper = groepen 2, 4, 5, 6, 8; Lower = 1, 3, 7 (Core bij Lower); Warm-up altijd zichtbaar. Groepsnummers blijven.
- Verbergt via klasse `split-off` op alle `#s-d3 .exl > li[data-grp]` (koppen, rijen; ook de tussenkop
  `.exsub` 'Supersets' heeft `data-grp="g8"`; de kop 'Optional' boven Arms is weg). Vinkjes, tellingen, statistieken en progressie veranderen niet.

## Oefeningen per groep kiezen (Warm-up en groepen 1–8)
- Structuur ligt vast: Warm-up + 8 groepen. Binnen een groep staan álle mogelijke oefeningen als gewone
  rijen in de HTML met `data-grp="g1"`; uitgezette rijen krijgen klasse `ex-off` (verborgen).
- Potloodknop `.grp-edit` in de groepskop opent onderblad `#grp-sheet` met schakelaars (`.sw`). Titel + kruisje blijven
  bovenaan staan (sticky `.sheet-head`; bij scrollen klasse `.stuck` = dunne lijn eronder). Minstens
  één oefening blijft aan. Keuze in localStorage `fitlog-groups` en Supabase collectie `cfg`, doc `groups`
  (`{g1:[sleutels die aan staan]}`); zonder keuze gelden de rijen die in de HTML niet `ex-off` zijn.
- Omdat alles per oefeningsleutel wordt bewaard, blijft de geschiedenis van een uitgezette oefening
  bestaan: Active exercises toont alleen actieve oefeningen (`fillChips` filtert `.ex-off`,
  `window.__progChipsRefresh`), het lichaam/de spierlijst telt alles wat getraind is, ongeacht aan/uit.
- Groep-af-logica (`paintChecks`) negeert `.ex-off`-rijen. Andere oefeningen van een groep worden niet meer doorgestreept
  als er één gedaan is (geen `grp-skip`): meerdere oefeningen per groep mag.
- Extra oefeningen (standaard uit) hebben sleutels `xN-…` (N = groepnummer), elk met MUSCLES, NAMES, EX-uitleg en
  foto's (Free Exercise DB, 640 px). Uitzondering: Crunch Machine gebruikt de oude sleutel `d3-crunch-machine`.
  Extra oefening toevoegen: rij met `data-grp="gN"` + `ex-off` in de groep (bij Arms vóór de kop Supersets), plus MUSCLES/NAMES/EX/IMG.
- Warm-up (groep 0, `data-grp="g0"`) bestaat uit losse rijen met sleutels `w0-…` (zonder invulveld): 4 standaard
  (pull-aparts, squats, glute bridge) + uit: 5 min rowing / cross trainer / bike / incline walk, arm circles.
  Ze tellen wel in `counts` (teller per oefening), nooit in `hist` (`histAdd` slaat `w0-` over). Groep 0 is pas 'af'
  als alle actieve rijen gedaan zijn en wordt nooit doorgestreept. De oude sleutel `d3-wu` wordt niet meer gebruikt.
- Alleen oefeningen met echte foto's (Free Exercise DB, begin/eind in `IMG`); getekende animaties zonder foto's
  (Torso Rotation, Bird Dog) zijn verwijderd. Nieuwe oefeningen dus altijd met twee foto's.
- Het keuzeblad toont ook het aantal trainingen ('· N×', zoals in de workout). De i-knop is overal dezelfde tint (de klasse
  `.nop` wordt nog gezet door `markProg` maar heeft geen stijl meer).
- Sets & reps per oefening: in het keuzeblad een rond knopje met schuifjes (`.gs-set`; standaard lichter, aangepast = gewone tint, zoals de i-knop) opent
  `#set-sheet` (bovenop, klasse `.top`) met stepper Sets (0–10, 0 = geen 'N ×') en tekstveld 'Reps or time', voorbeeld
  'Shows as', Save en 'Reset to default'. Opslag: localStorage `fitlog-sets` + cfg/doc `sets` (`{sleutel:{s,r}}`).
  `applySets` vervangt de eerste tekst van `.exr-s` (origineel in `ORIG`); de statistieken lezen de sets uit die tekst,
  dus een aangepast aantal telt mee voor nieuwe afvinkingen.
- De i-knop toont een cursieve 'i' in Fraunces (`INFO_ICON` = `<span class="ib-i">i</span>`, 600 19px), zoals de titel;
  ze opent uitleg én progressie. Rond knopje (36 px, zoals `.gs-set`) helemaal rechts; in de workout achter het invulveld
  (rij krijgt `.has-info`, grid `2.4rem 1fr 4.2rem 36px`; invulveld smal, past '999'/'12,5'/'reps'), op één lijn met het groepspotlood, in het keuzeblad links van het sets-knopje.
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
  Nieuwe gevaarlijke oefening: sleutel + tip toevoegen aan `RISK`. Volgorde in het keuzeblad (de workout niet): eerst oefeningen zonder aandachtspunt, dan met label (Back! …),
  dan gevaarlijke; binnen elke laag op populariteit volgens `POP` (per groep een lijst sleutels, meest gedaan eerst).
  Nieuwe oefening: ook haar sleutel op de juiste plek in `POP` zetten.
- De tussenkop Supersets (`.exsub`) verdwijnt als er geen zichtbare oefening onder staat.
- De rij-animatie (`cascade`) slaat `.ex-off`-rijen over en stopt de vertraging na 24 rijen.

