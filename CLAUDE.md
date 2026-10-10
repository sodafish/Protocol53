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
- Settings (op vraag van Tom, 10 okt; vroeger onderaan Guide, nog vroeger `#dob-sheet`): rond tandwiel-icoon `#setBtn` (`.hd-set`, 36 px cirkel zoals de
  andere icoonknoppen, Material Symbols 'settings' inline SVG 20 px) rechts op de regel van 'Protocol 53' in de kop → onderblad `#st-sheet`/`#st-bg`
  (inhoud `.st-body#settings`; script vlak voor `#woEnd`, `window.__p53settings()` opent het). Inhoud: Appearance (`.st-seg`: System · Light · Dark,
  standaard System; per toestel in localStorage `p53-theme`, niet in de database; script in `<head>` zet `data-theme` op `<html>` vóór het tekenen
  en past de `theme-color`-meta's aan, `window.__p53theme(v)`; de CSS kende `[data-theme]` al), dan geboortedatum `#dobIn`, automatisch bewaard bij `change`/`blur` (geen Save-knop meer, op vraag van Tom, 10 okt; melding 'Saved.' in `#dobMsg.ok`, 2,5 s),
  dan 'Open the app on' (`#stStart`, select: Workout · Open Gym (standaard, ook zonder bewaarde keuze; 10 okt) · Where I left off (`last`) · Workout · eGym/Cardio; per toestel in localStorage `p53-start`;
  het `<head>`-script zet bij elke start `fitlog-where`={v:'workout',y:0} en `fitlog-split` vóór de andere scripts ze lezen; op vraag van Tom, 10 okt),
  dan 'Your data' (`.st-sec`) met 'Signed in as e-mail' (`#stUser`, uit `__p53user`), Export backup (volle breedte), daaronder Log out + Reset data naast elkaar (`#resetData`; grid in `.st-body .app-tools`, op vraag van Tom, 10 okt).
  Tik op het getal (`button#ageBtn`) of het tandwiel → `window.__p53profileOpen` (vult het datumveld) → `__p53settings()`.
- Opslag: collectie `cfg`, doc `profile` (`{dob:'jjjj-mm-dd'}`), cache localStorage `fitlog-dob`. Bij 'Create account' is de
  geboortedatum verplicht (`cloud.js`, `user_metadata.dob` via `signUp`). `cloud.js` zet `window.__p53user` en stuurt event `p53-user`.
  Leeftijd herberekend bij laden en bij terugkeren naar de app.
- Calorieën, geslacht, lengte en gewicht zijn op vraag van Tom weer weggehaald (niet opnieuw toevoegen zonder vraag).

## Guide
- Onderaan Guide (na Sleep) staat 'How Statistics works' (op vraag van Tom, 10 okt): twee korte secties Muscle Balance en Strength Progress
  (zelfde stijl als Intensity: `.section-title sub` + `.section-note` + `.tip ul`). Pas die tekst mee aan als de berekening (MUSCLES-gewichten,
  periodes, `SUG_MIN`, `chainPct`) verandert.

## Diet
- Diet en Guide: de eerste kaders beginnen op dezelfde hoogte als de tabs op Workout/Statistics (115 px op 375 px; `#p-voeding,#p-kracht{padding-top:.6rem}`, eerste marges 0; op vraag van Tom).
- Frequentie-badge 'Freely' (`b-vrij`) is overal 'Often' (`b-groen`) geworden (op vraag van Tom). Alle frequentie-pillen zijn gevuld (groen/goud/rood met tekst in `--paper`, dus ook leesbaar in donker; op vraag van Tom).
- Elke voedingsrij toont onder de naam `<span class="nut">N kcal · N g protein <i>/ eenheid</i></span>` (op vraag van Tom, 9 okt; richtwaarden,
  ranges bij groepen zoals vette vis). Eenheid: per stuk waar dat logisch is (egg, avocado, piece fruit, slice, scoop, tin, tbsp,
  handful, 2 squares), anders per 100 g (raw/cooked/dry erbij); 0-waarden zonder eenheid. Nieuwe voedingsrij: zo'n regel erbij. Getoond als zachte pil (`#p-voeding .nut`, 6% inkt). Eiwit enkel waar relevant: niet bij groenten, fruit, olie, avocado, olijven, cacao, chocolade, hummus, stevia, water (daar enkel kcal). De pil '★ Top protein' is weg (op vraag van Tom).

## Tablet / breed scherm (≥ 1000 px; op vraag van Tom, 9 okt)
- Eén `@media (min-width:1000px)`-blok onderaan de CSS; daaronder (gsm, tablet portrait) verandert niets (pixelvergelijking 375/390 px voor/na = gelijk).
- Statistics = dashboard: `#stabs` verborgen, `section.stats` als grid met TWEE kolommen (9 okt; vroeger drie): links Progress (over twee rijen, infographic
  voor en achter naast elkaar, schakelaar `.bal-seg` verborgen, captions zichtbaar), rechts Balance met Calendar eronder (alle `.sv` tegelijk zichtbaar,
  `[hidden]` overschreven; titels via `::before`), pagina tot 84rem breed (`body[data-view=progress]`). Diet/Guide in twee kolommen: nog niet, enkel geopperd.
- Workout: tot 72rem breed, oefeningen in twee kolommen (`#s-d3 .exl` grid; groepskoppen, tussenkoppen, 'Add exercises' over de volle breedte).
- Diet en Guide blijven zoals op gsm (52rem).

## Navigatie
- Navbar-hoogte (op vraag van Tom, 10 okt): `bottom: var(--nav-b)` = max(10 px, veilige zone − 12 px) → op een iPhone met streep ±22 px van de onderrand i.p.v. ±44 px; de End workout-pil volgt mee.
- Onderaan een zwevende glazen navbar (`.gnav`, klasse `.glass`: zelfde kleur als de invulvelden: `--surface` op 90% in licht (anders lijkt ze op de paginakleur), 62% in donker, blur 26px, saturate 140%, witte lichtrand (vroeger warm glas op 26%)): pil (actieve knop: zelfde terracotta-verloop als de Start workout-balk, tekst en icoon `--paper`; op vraag van Tom) met **Workout** (icoon: Material Symbols 'exercise' (halter), als inline SVG; vroeger 'task_alt')
  en **Statistics** (op vraag van Tom, 9 okt even 'Results', daarna terug naar Statistics; vroeger Coverage, Progress/Balance; intern blijft het `progress`, `#k-stats`; icoon: Material Symbols 'monitoring', vroeger 'man'), **Diet** (`data-view=voeding`, Material Symbols 'grocery') en **Guide** (`data-view=kracht`, vroeger 'Info', Material Symbols 'explore' (kompas);
  pil max 440 px). Het More-menu (`#gnavMore`, `#more-sheet`) is weg (op vraag van Tom, 9 okt); de pagina Cardio bestaat nog maar is niet bereikbaar. Tik op het actieve item = zacht naar boven scrollen; wisselen van pagina
  begint bovenaan (meteen + na 200/450 ms, omdat het wisselen van tab zelf nog kan scrollen), behalve terug naar Workout: die
  komt terug op de onthouden scrollpositie (`window.__woY`, bewaard bij het verlaten van Workout, op 0 gezet na End workout).
- De oude hoofdtabs bovenaan (`.tabbar`, knoppen `#t-schema`, `#t-cardio`, `#t-voeding`, `#t-kracht`) en
  de subtabs (`.ksub`, `#k-train`/`#k-stats`) bestaan nog maar zijn verborgen; de navbar klikt ze aan.
  `window.__ksub` is omwikkeld zodat sprongen (bv. End workout → Progress) de navbar bijwerken.
- Onder de titel staat de huidige pagina (`#pgTitle`); ruimte eronder kleiner gemaakt (`#p-schema{padding-top:.6rem}`, ~23 px tot Start/tabs; op vraag van Tom).
- De app opent waar ze gesloten werd (op vraag van Tom, 9 okt; vroeger altijd Workout): pagina + scrollpositie in localStorage `fitlog-where` `{v,y}`
  (bewaard bij `visibilitychange` hidden en `pagehide`; teruggezet onderaan het navbar-script, scroll op 0/200/450/900 ms omdat de data later laadt). Ook onthouden (localStorage): periode statistieken
  `fitlog-stats-per`, oefening en periode progressie `fitlog-prog-sel`/`fitlog-prog-per`, Full/Upper/Lower `fitlog-split`,
  oefeningen per groep `fitlog-groups` (+ cfg/groups), geboortedatum (+ cfg/profile).
- Geen zwevende pijl naar boven meer (tik op het actieve navbar-item). Body heeft extra ruimte onderaan.

## Statistieken (Workout/Progress → Progress)
Figuur voor/achter + lijst per spier. Periodes (`per`, onthouden in localStorage `fitlog-stats-per`):
- Vier knoppen links (op vraag van Tom, 9 okt): Last Workout (`dag`; de laatste trainingsdag → totaal aantal sets), 7 Days (`week` → totaal aantal sets),
  30 Days (`maand`, ook totaal sinds 10 okt, op vraag van Tom) en 90 Days (`kwart`, laatste 90 dagen; 13.5 px, tussenruimte zoveel als past (op vraag van Tom, 10 okt): .85rem (375 px), 1.05rem vanaf 385 px, 1.2rem vanaf 400 px; ≤ 360 px 12.5 px/.45rem) → gemiddeld per week; rechts in dezelfde rij een ronde knop `#balEdit` (icoon Material Symbols 'edit_calendar' als inline SVG 20 px, ook op `#prEdit`; op vraag van Tom, offline-veilig i.p.v. de webfont) (`.per-edit`, accent als actief) = eigen periode
  (`per='range'`, op vraag van Tom, 9 okt; Year/All zijn weg, bewaarde oude keuzes → 30d). Venster `p53EditRange` binnen de eerste/laatste training;
  bewaard in localStorage `fitlog-stats-range` `{f,t}` (leeg = volgt eerste/laatste); `balRange(evs)`. Langer dan 30 dagen = gemiddeld per week (tot 30 dagen = totaal; op vraag van Tom, 10 okt; vroeger > 7 dagen). Tekst eronder
  '27 Sep – 9 Oct 2026, 4 training days, sets per week.'. Selectors op de periodeknoppen gebruiken `.stats-per button[data-d]` (het potlood niet).
De spierlijst (`#statsList`, balkjes) blijft de sets per spier; kleur in de lijst relatief t.o.v. de best getrainde spier.
- Balance-figuur (`#statsFig`) = de gewone twee figuren voor/achter, kleur = sets (zoals altijd).
- Progress-figuur = infographic (variant C, op vraag van Tom, 9 okt; preview gekozen uit A/B/C; eerst onder Balance, op vraag van Tom verhuisd naar
  bovenaan Progress, want kracht en sets zijn twee verschillende zaken): één grote figuur (`#progFig.stats-fig.bal`, viewBox -58 0 316 VH)
  met schakelaar Front/Back (`.bal-seg`, absoluut rechtsboven op de figuur zodat die hoger staat (op vraag van Tom); opent ALTIJD op Front, ook na wisselen van tab of pagina (`__balPre` zet Front terug; keuze niet meer onthouden, op vraag van Tom, 10 okt; vroeger localStorage `fitlog-bal-side`); vanuit elke spier die hoofdspier is van minstens één kg-oefening die AAN staat (`PRIM`, geen `ex-off`), of waarvoor al data is, een lijntje (`.bal-ln`): met data (in `balPct`) oranje %, zonder data grijze 0%; andere spieren: callout verborgen (`display:none`, vaste plekken blijven); ververst bij `p53-groups` (op vraag van Tom, 9 okt); helemaal geen data = zin `#progHint` 'Log an exercise three times to see your progress here.'
  naar links/rechts met groot % (`.bal-pct`, Fraunces 17; `has` = accent zodra die spier minstens één oefening met twee metingen in de periode heeft, ook bij 0% (op vraag van Tom, 9 okt); anders `zero` = muted) en de naam (`.bal-lab`, kapitalen 7). Ankers en
  labelhoogtes in `CO` (drawBody, 450-coördinaten; R-ankers al gespiegeld). Kleur van de spiervlakken = krachttoename (hoe donkerder, hoe meer).
  Bovenaan Progress (op vraag van Tom, 9 okt) de periode `.pr-range` (40 px hoog, lijn en potlood op exact dezelfde hoogte als de periode-rij van Balance): tekst `#prRange` ('3 Oct – 9 Oct 2026 · all data') + potlood `#prEdit` (accent (`on`) zodra er een eigen periode is, én na elke keuze in het venster, ook 'Show all data' (`prR.set`; op vraag van Tom, 10 okt); rand van `.per-edit.on`/`.pr-edit.on` = zelfde als het lampje `.sug-btn` (accent 45% gemengd met `--line`))
  → `p53EditRange({title,msg,min,max,from,to})` (venster met twee datumvelden From/To, min/max = eerste/laatste kg-meting, buiten die grenzen wordt
  geklemd; 'Show all data' = terug naar alles). Bewaard in localStorage `fitlog-prog-range` `{f,t}`; leeg = volgt de eerste/laatste meting (ook nieuwe).
  `window.__progRange()` → `{from,to,f,t,b,all}`; figuur (`balPct(from,to)`) én de lijst `#plList` rekenen eerste → laatste meting BINNEN die periode
  (minstens twee metingen); lijst ververst bij event `p53-prange`. Getekend in `drawBody` (`bodySvg`), gevuld in `renderStats`. Onder de figuur 2.6rem ruimte (`#progFig`, op vraag van Tom).
  % per spier = `balPct(from,to)` = KETTINGINDEX (op vraag van Tom, 9 okt; `chainPct(notes,from,to)`, ook `window.__chainPct`) over de oefeningen waar die spier
  hoofdspier (1) is (één kg-veld, g1–g7 + eGym g10, geen supersets; `progRows`; eGym per methode als aparte reeks `eg-…#ecc` / `eg-…#reg`, zie eGym-methode): elke oefening enkel t.o.v. zichzelf (meting → volgende meting), de EERSTE meting
  van een oefening (ooit) telt niet (leereffect; eerst twee, op vraag van Tom één), een stap telt als ze EINDIGT in de periode (vertrek mag ervoor liggen = vooruitgang sinds de laatste meting vóór de periode; 9 okt, na kritische controle); per week (ma–zo, `weekKey`) per oefening de som van haar log-stapjes, dan het
  gemiddelde over de oefeningen van die week; weken vermenigvuldigd. Wisselen van oefening breekt het getal dus niet. Een oefening telt pas mee vanaf 3 metingen. Achteruitgang (lager gewicht) telt negatief mee.
  Lijntjes tekenen zich in (`.draw`, `window.__balDraw`) bij openen van Statistics/Progress en bij wisselen van kant.
  Geen flits meer bij openen (op vraag van Tom, 10 okt): `window.__balPre()` zet vóór het tonen klasse `.predraw` (lijnen/bolletjes/tekst al in de beginstand,
  na 1,5 s vanzelf weg als veiligheid); `__balDraw` tekent synchroon bij wisselen van tab en probeert tot 20× om de 40 ms opnieuw zolang de pagina nog niet zichtbaar is.
- Periodes zonder data uitgegrijsd (op vraag van Tom, 9 okt; `aria-disabled`, 35%, klik doet niets): Last workout altijd, Week vanaf de eerste meting,
  30d als de oudste meting > 7 dagen terug ligt, 90d > 30 dagen; potlood uit zolang er geen data is. Staat de bewaarde keuze uit, dan toont `renderStats` de langste
  beschikbare (`eff`) zonder de keuze te overschrijven.
`hist` bewaart alles (nooit opschonen), dus extra periodes kunnen zonder datamigratie.

- Tabnamen (op vraag van Tom, 10 okt): **Balance** · **Strength** · **History** (13u59: korter, vroeger Muscle Balance · Strength Progress; ook de Guide-koppen onder 'How Statistics works') (vroeger Balance · Progress · Calendar; ook de `::before`-titels op tablet en de verborgen kop `h2.prog-t`). Intern blijft `body`/`prog`/`cal`.
- Tabs bovenaan Statistics/Results (op vraag van Tom): `#stabs` (klasse `.wtabs stabs`, zelfde plakkende pil als op Workout), volgorde (9 okt) **Balance** (eerst; schermnaam 'Balance', vroeger 'Muscle Balance') · **Progress** (vroeger 'Strength Progress') (`#plist` + lege melding `#plEmpty`, `data-sv=prog`) ·
  Muscle Balance (vroeger 'Balance'/'Muscles'; knoppen `#stabs>button` breedte volgens tekst, 13.5 px; periode + figuur + spierlijst, wrapper `.sv[data-sv=body]`) · **Calendar** (`#cal`, `data-sv=cal`). Stop workout (met vinkjes) → Balance, bovenaan.
- Actieve tab in `#wtabs`/`#stabs`: pil in `--paper-soft` (zelfde kleur als de achtergrond van de Front/Back-schakelaar `.bal-seg`; op vraag van Tom, 10 okt; vroeger `--ink` 9%) met accenttekst (variant A; zwart/wit en volle terracotta (D) geprobeerd en teruggedraaid op vraag van Tom).
- Schuivende pil (op vraag van Tom, 9 okt): in `#wtabs .wd-tabs`, `#stabs` en `.gnav-pill` tekent één `.pill-ind` de achtergrond van de actieve knop en schuift
  zacht (.34 s) naar de nieuwe knop (script onderaan `index.html`; MutationObserver op `aria-selected`, ResizeObserver; actieve knop zelf `background:transparent`).
  Telkens één sectie zichtbaar (`.sv[hidden]`); keuze in localStorage `fitlog-stats-view`; `window.__statsView(v)`; End workout zet Muscles. De koppen
  'Calendar'/'Strength progress' zijn verborgen (de tab zegt het al). Wisselen houdt de geplakte tabs op dezelfde hoogte (`keep`, zoals `toList`).
  Ruimte onder `#stabs` = 1.6rem (op vraag van Tom). Ruimte boven de figuren (`.stats-fig` margin-top) = .8rem (was 1.6rem; op vraag van Tom). Periode Last/Week/Month/All staat nu als tekst-tabs met accent-onderlijn (`.stats>.sv>.stats-per`), niet meer als pillen.
- Sectie **Strength progress** (`#plist`, vroeger 'Progress'/`#plList`, onderaan na de kalender (op vraag van Tom), alleen velden in kg (geen reps/sec), eigen script vóór het kalenderscript; op vraag van Tom): elke
  krachtoefening met minstens één meting in `prog` (ook uitgezette; geen warm-up g0 en cardio g8, op vraag van Tom), per groep (kop `.pl-h` = groepsnaam) in workoutvolgorde; eGym-oefeningen (g10) tellen WEER mee in Progress sinds de methodekeuze (op vraag van Tom, 10 okt; 's ochtends even uitgezet): elke methode is een aparte reeks (`window.__progPts('eg-x#ecc')` filtert op `m`, zonder `m` = ecc), dus een sprong tussen Eccentric en Regular telt nooit; in de lijst staan ze onder de Open Gym-groep van hun hoofdspier (`EGMAP`) als 'eGym Leg Press · Eccentric' / '· Regular'. Toestelverschil tussen gyms (bv. kabels 1:1 vs 2:1): nog niets voor gebouwd; idee 'New baseline' per oefening als het ooit nodig is; geen supersets (op vraag van Tom, 9 okt; dus ook niet in het armgemiddelde). Rechts de laatste waarde + eenheid en groot de toename in procent eerste → laatste (`+25 %`, accent bij stijging), eronder klein 'laatste waarde · verschil'
  (`20 kg · +4 kg`); (op vraag van Tom, 9 okt). Binnen elke groep gesorteerd op procentuele toename (grootste eerst). Rechts in de groepskop het percentage van de groep = kettingindex (`__chainPct`) over al haar oefeningen (9 okt; vroeger gemiddelde van de twee meest gemeten), tussenkop idem over de oefeningen van die tussenkop; de rij per oefening: basis = laatste meting vóór de periode, anders de eerste in de periode, nooit de allereerste meting van de oefening (leereffect; de grafiek toont ze wel) → laatste meting in de periode; een rij verschijnt pas als er zo'n echte stap is (dus vanaf de 3e meting; lege staat zegt 'three times'); verschil 'kg · +x kg' vanaf die basis;
  groepen met tussenkoppen (Back: Rows/Vertical pull; Arms: Biceps/Forearms/Triceps/Supersets) tonen per tussenkop (`.pl-sh`) de kettingindex van die tussenkop;
  de groep = kettingindex over ALLE oefeningen van de groep (geen 'twee meest gemeten' meer; een oefening telt enkel mee in de weken dat ze gedaan is); rijen gesorteerd per tussenkop. Enkel oefeningen met een echte stap staan in de lijst (zie hierboven); groepen (g1–g7 + eGym g10) en
  tussenkoppen (zonder Supersets) verschijnen pas als er zo'n oefening onder staat; niets = lege staat `#plEmpty` (gecentreerd: kaartje met mini-grafiek 1st → 2nd + 'Your progress starts here' + uitleg 'at least twice') (op vraag van Tom, 9 okt). Groepsnaam in de stijl van de oefeningnamen op Workout (Fraunces 600, 18 px), in accentkleur zoals het groeps-%. Tussenkopnaam (`.pl-sh`) als de tussenkoppen op Workout: 11.5 px, kapitalen, letterspatiëring, `--muted`. Groepskop: gewone lijn `--line`, 2.4rem ruimte erboven. Hiërarchie: groeps-% groot (26 px Fraunces), tussenkop-% 19 px, oefening-% gewone tekst 15 px, regel 'kg · verschil' in `--muted-soft`;
  enkel het groeps-% krijgt de accentkleur, altijd (ook 0%) (tussenkop en oefening niet; op vraag van Tom).  Rechts op elke rij een rond icoon (`.pl-chart`, Material Symbols 'timeline', 36 px cirkel zoals de andere icoonknoppen; vroeger een pijltje). Tik (rij of icoon) = uitlegblad met enkel de grafiek ('Your progress', geen beeld/uitleg; `window.__p53info.chart`, op vraag van Tom). Verborgen zolang er niets gemeten is. Ververst bij `p53-prog` en `p53-groups`.

- **Suggestions** (op vraag van Tom, 9 okt): knop `#sugBtn` (enkel lampje-icoon in een ronde 36 px-knop, wél in accentkleur (icoon + rand 45%): er zit belangrijke info achter; op vraag van Tom, 9 okt) rechts op de regel van `#statsSub` (`.stats-subrow`) opent blad `#sug-sheet`.
  Rekent over de laatste 30 dagen (op vraag van Tom, 10 okt; vroeger 4 weken), omgerekend naar sets per week (los van de gekozen periode; via `events()`, dus de metingen): sets per week per spier, gewogen (MUSCLES).
  'Give more attention' = spieren onder het minimum `SUG_MIN` (grote spieren 8, zijkant/achterkant schouder, armen, buik, onderrug, kuiten 3–5;
  NIET onderarmen, trapezius, schuine buik, adductoren, voorste schouder: die krijgen genoeg mee, op vraag van Tom), max. 5, laagste % eerst,
  met staafje en 'Try: …' (actieve oefeningen met die spier als hoofdspier, meest gedaan eerst) of 'Add to your list: …' (uitgezette). 'Balance' =
  paren `SUG_PAIRS` (Chest/Back, Quads/Hamstrings, Biceps/Triceps, Front/Rear delts, Abs/Lower back) bij verhouding ≥ 1,8 en ≥ 3 sets. < 2 trainingsdagen =
  uitleg. Geen slotzin meer ('A guide, not a rule.' weg, op vraag van Tom, 10 okt).

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
  Labels (op vraag van Tom): bovenaan 'Start workout' (zet de tab via `startTab()`/`window.__startTab` en scrolt naar de GROEP waarmee je begon: de groep van de eerste afgevinkte oefening
  in je laatste 3 workouts (`startTab.g`), meest voorkomende groep, gelijkstand = meest recent; handmatige metingen tellen niet; geen geschiedenis = Warm-up; op vraag van Tom, 9 okt), pil rechtsonder 'End workout' + tijd.
  Tik op End zonder één vinkje → timer stopt, geen vraag, geen vuurwerk, Workout scrolt zacht naar boven. Met minstens één vinkje (ook warm-up) → `p53Confirm` ('End workout?', met de tijd)
  → sessie bewaren, alle vinkjes leeg, timer stop, periode Last workout (`__statsPer('dag')`), altijd naar Statistics (bovenaan; ook na enkel cardio), `__woY=0`, daarna vuurwerk. Alles wat afgevinkt was, is al bewaard (grafiek). Na End kun je niet
  meer uitvinken; corrigeren via het edit-blad van de grafiek. Vinkjes vervallen ook vanzelf de volgende dag.
  Timer: starttijd in localStorage `fitlog-wo-start` (overleeft herladen, vervalt na 12 u); het eerste vinkje start hem ook.
  Sessie in collectie `sess` (id `jjjj-mm-dd@start`, `{d,s,e,n}`; cache `fitlog-sess`, ook in de back-up).
  Vuurwerk `window.__congrats({min,n})`: overlay `.cg` met canvas-vuurwerk (accent/goud/crème), 'Congratulations!' (Fraunces, één regel)
  + duur · oefeningen; tik of 4,5 s = weg. Geen geluid (op vraag van Tom weggehaald). Bij reduced motion zonder vuurwerk.
- Maandoverzicht bovenaan History (op vraag van Tom, 10 okt; gekozen uit vier voorstellen = variant B; eGym/Open Gym-onderscheid bewust weg):
  `#calMon`, `renderMon(days)` in het kalenderscript (zelfde dagdata als de kalender). Drie kleine grafieken onder elkaar, elk eigen schaal:
  Training days · Sets · Cardio (in uren en minuten: '40m', '1h 20m', '7h 35m', '2h' (op vraag van Tom korter dan 'min'); `hr(min)`; op vraag van Tom, 10 okt; vroeger even per half uur;
  lange waarden breken boven de staaf op de spatie; groot getal met kleine eenheden `small.u`; ook het maandtotaal boven de kalender, de dagen blijven '40 min'); kop = label links + groot getal (Fraunces 24) van de GEKOZEN kalendermaand ('… so far in October' voor de
  lopende maand, anders 'in September'). 6 maanden naast elkaar (venster `winEnd`), staafjes in inkt 20% op papier, gekozen maand accent,
  lopende maand gearceerd (`.run`). eGym (op vraag van Tom, 10 okt; eGym is tijdelijk): staat er in de 6 getoonde maanden (of de gekozen maand) eGym, dan krijgen Training days en Sets onderaan elke staaf een lichter deel (`.mon-c i b`: inkt 9% op papier + 1px lijn in `--paper` erboven; gekozen maand accent 45% op papier; variant G gekozen uit 12 voorstellen, op vraag van Tom; vroeger goud) = eGym-dagen (`ed`, dag met g10) en eGym-sets (`es`, uit `o.egs` in `data()`), en onder de kop een kleine regel '■ eGym · 1 day' / '· 2 sets' (`p.mon-key`, rechts). Zonder eGym: niets daarvan, weergave zoals voorheen. Ruimte: kop → grafiek .7rem (op vraag van Tom iets meer dan eerst .15rem; rij 62 px), tussen de grafieken groot (2.6rem), zodat de kop zichtbaar bij de grafiek eronder hoort (op vraag van Tom). Navigatie: kalenderpijltjes (venster schuift mee als de maand erbuiten valt), tik op een staaf/maand = kalender
  springt erheen, 'Earlier'/'Later' onderaan (`#monPrev`/`#monNext`) of horizontaal vegen = 6 maanden verder (kalender springt naar de laatste maand
  van het venster); niet vóór de eerste trainingsmaand, niet voorbij deze maand. Geen data = verborgen.
- Kalender onderaan Coverage (`#cal`, kop 'Calendar' (vroeger 'Workouts'), eigen script onderaan `index.html`, `window.__renderCal`, ververst mee met
  `renderStats`), bewust eenvoudig (op vraag van Tom): maand met pijltjes (niet voorbij deze maand, en niet vóór de eerste maand met data: linkerpijl uit, `ym` geklemd; zonder data blijft het deze maand; op vraag van Tom, 10 okt), week begint op maandag, bolletje
  in de accentkleur op elke dag met een meting in de grafiek (geen warm-up),
  vandaag in accentkleur, bovenaan 'N training days · N sets' (sets van die maand; op vraag van Tom telt het dagen, twee workouts op één dag = één dag). Tik op een dag = eronder (1.25rem ruimte onder de kalender, ~26 px van de laatste cijfers tot de lijn met de datum; de grote ruimte staat ONDER de datum: eerste tussenkop padding-top 2.8rem; op vraag van Tom) de datum en daaronder per regel 'Programma · N sets' en 'Cardio · N min' (op vraag van Tom) (som van de sets van elke oefening
  die dag, één keer per oefening). Programma (`prog()` in het kalenderscript) wordt per workout afgeleid uit de groepen met een meting: g10 = EGYM (+ rest), enkel g8 = Cardio,
  enkel g2/g4/g5/g7 = Upper body, enkel g1/g3/g6 = Lower body, anders Full body; meerdere workouts op één dag = 'Open Gym + EGYM'; 'Cardio' staat niet als programma (de minuten staan al in '+ 40 min cardio'), een dag met enkel cardio = 'Cardio · 40 min'. Bron = alleen de grafiekdata (`prog`, zoals 'N×'; sets via `window.__setsFor`), ververst bij `p53-prog`. Onder de datum staat de lijst van gedane oefeningen (`.cal-ex`), gegroepeerd per programma met tussenkop + totaal (Open Gym krijgt altijd ' · Upper Body / Lower Body / Full Body' erachter, uit de groepen
  van die dag: g2/g4/g5/g7 = upper, g1/g3 = lower, core g6 telt neutraal, enkel core = 'Core'; op vraag van Tom) (`.cx-h`, 2rem ruimte erboven, eerste 1.2rem: Open Gym · N sets,
  eGym · N sets, Cardio · N min; vervangt de vroegere regels 'Programma · N sets'), in workoutvolgorde, per rij links de naam, rechts sets/reps (eerste tekst van `.exr-s`,
  niet bij cardio, lichter) · gemeten waarde (supersets 'a / b'). Rechts naast de datum staat subtiel 'Swipe to edit or delete' (`.cx-hint`). Veeg naar RECHTS = donkere Edit-knop links (`.cx-edit`, zelfde mechaniek, 10 px
  naast de rij) → `p53EditVals({title,msg,fields})` (klein venster, één veld per invulveld, supersets twee) → `window.__progSetVals(ids,vals)` past de
  meting(en) in `prog` aan (zelfde id, dus overal mee; op vraag van Tom, 9 okt). Ook in het edit-blad van de grafiek (behalve 'No value'-rijen).
  Het venster heeft bovenaan ook een datumveld (`p53EditVals({date})` → resultaat `.date`, max vandaag; het waardeveld heet dan 'Weight'/'Value'),
  `__progSetVals(ids,vals,d)` verhuist de meting bij een andere dag: nieuw id met de nieuwe datum (zelfde uur en `w`, oud id gewist, bij botsing
  achtervoegsel `~…`); de kalender BLIJFT op de dag waar je was (de oefening verdwijnt daar; `stay` in het kalenderscript; een lege dag toont 'Nothing logged on this day.'; op vraag van Tom, 10 okt; vroeger sprong hij mee).
  Reps in de rij kort gehouden: enkel het stuk met cijfers ('2 rounds × 10–15'). Veeg naar links op een rij (`.cx-row`, pointer events; de knop `.cx-del` (88 px) zit ín de rij, 10 px rechts ernaast (`right:-98px`), en schuift mee in; open = rij −98 px) = rode Delete-knop (tekst wit in licht, `--paper` = donker in dark mode); naam mag afbreken (`min-width:0`) zodat de rechtse tekst nooit over de rand/onder Delete loopt
  (`.cx-del`) → tik = meteen wissen (geen extra bevestiging, op vraag van Tom) → `window.__progDelIds(ids)` wist de metingen in `prog` (de hoofdbron; zelfde regels als het vuilbakje, ook het vinkje
  van de lopende workout) (op vraag van Tom, 9 okt). Geen duur of sessiebeheer meer in de kalender (`sess` wordt wel nog bewaard).
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
- `window.__progPts(k)` gebruikt een index (`PIDX`, veld → gesorteerde metingen), gewist in `saveProgLocal` en bij elk `p53-prog`-event (capture op window); was nodig: 2 jaar data = 0,9 s per render zonder index.
- Grafiek: eigen SVG in `renderProg()`, één lijn in de accentkleur, tik/sleep toont datum + waarde.
  In beide grafieken loopt de lijn door alle metingen, maar een bolletje staat alleen bij de eerste, de laatste en
  waar de waarde verandert.
- Ook in het uitlegvenster (i-knop, dus ook voor uitgezette oefeningen via het keuzeblad): per invulveld met metingen
  een blok 'Your progress' (supersets: twee blokken met naam) met laatste waarde, verschil sinds de eerste meting,
  potlood (`window.__progEdit(k)` opent `#pe-sheet` bovenop, klasse `.top`) en een mini-grafiek van de eerste tot de
  laatste meting (geen periodefilter), datums altijd met jaar (`dLabY`). Getekend pas als het venster zichtbaar is, op de
  echte breedte (geen `preserveAspectRatio=none`, anders uitgerekt); het blok staat er bij elke oefening met een invulveld: zonder metingen '–' en een lege grafiek met
  'No progress recorded yet', bij één meting een bolletje in het midden met één datum. Bij kg-oefeningen rekent het verschil bovenaan ('+x kg since …') vanaf de TWEEDE meting, en is het lijnstuk eerste → tweede meting een stippellijn (`stroke-dasharray`, die eerste meting telt niet in het %; op vraag van Tom, 9 okt). In de grafiek onder Progress komt het jaar
  erbij zodra een datum niet in dit jaar valt (`dLabYr`). Ververst live via event `p53-prog` (gestuurd door `saveProgLocal`).
- Potloodknop (`#progEdit`, alleen icoon) rechts op de lijn van het huidige gewicht opent een
  onderblad (`#pe-sheet`, zelfde stijl als de oefeninguitleg; sluiten met kruisje, naast tikken of Esc):
  bovenaan datum + waarde + Toevoegen (zelfde datum = overschrijven; tijdstip = 12u die dag), daaronder
  alle metingen (nieuwste eerst); verwijderen = veeg naar links + tik op de rode Delete (zoals in de kalender, geen bevestiging; op vraag van Tom, 9 okt;
  gedeelde helper `window.p53Swipe(box,onDel)` vóór de navbar, rijen `li.cx` > `.cx-row` > (inhoud + `.cx-del`); het oude vuilbakje is weg). Lange lijsten scrollen in het blad.
  Let op: `#pe-sheet` deelt de klassen `.sheet`/`.sheet-bg` met het uitlegvenster; die code selecteert
  daarom `.sheet:not(#pe-sheet)`. Nieuwe vensters altijd met een eigen id aanspreken.
- Alle onderbladen: `overscroll-behavior:contain`; zolang een `.sheet` zichtbaar is én klasse `on` heeft, staat de
  pagina vast (body `position:fixed` met `top:-scrollY`, via MutationObserver onderaan `index.html`); bij sluiten komt
  de scrollpositie terug, zonder animatie (tijdelijk `scroll-behavior:auto`, want `html` scrolt standaard smooth). Slepen op `.sheet-bg` doet niets.
  Omlaag vegen sluit een blad (onderaan `index.html`, bij de scroll-lock): vanaf grip/titel altijd, op de inhoud alleen als die
  bovenaan staat; blad + achtergrond volgen de vinger, los na > 30% hoogte (max 140 px) of snelle veeg = klik op `.sheet-x`, anders terugveren.

## Warm-up / Open Gym / EGYM / Cardio (tabs bovenaan Workout)
- Bovenaan Workout (`.tools-row`): links 'Start' (`.wo-btn`, play-icoon; label kort 'Start' zodat alles op één lijn past), meteen rechts
  daarvan, alleen als de notitie onderaan (`#sessNote`) iets bevat, een ronde notitieknop `#noteJump`; helemaal rechts (`.split-sel`, margin-left:auto)
  de keuzeknop `#splitBtn`. De notitieknop (48 px, cirkel 1.5px `--line`, Material Symbols 'sticky_note_2' in accentkleur; ≤ 350 px: 42 px). Tik = zacht
  naar de notitie scrollen. Zichtbaarheid volgt input/change + elke 0,7 s (waarde kan uit de database komen zonder input-event).
- START/END WORKOUT (op vraag van Tom, 10 okt): de zwevende pil rechtsonder (`#woEnd`) is er altijd. Vóór de workout = 'Start workout' (klasse `.is-start`,
  play-icoon, terracotta-verloop zoals de actieve navbar-knop, enkel zichtbaar op Workout); tik = timer start (`woRun(true)`), geen scroll/tabwissel.
  Tijdens de workout = 'End workout' + tijd (donker, op elke pagina), zelfde End-logica als vroeger; End zonder vinkjes → terug naar Start.
  Een vinkje zetten start de workout ook en schakelt de knop om (`paintWoBtns`, aangeroepen vanuit `paintChecks`). Body heeft nu altijd `wo-on` (ruimte onderaan).
- Workout-blok (op vraag van Tom, 9 okt, naar een voorbeeld met een navbar + balk eronder): `#wtabs` (klasse `.wtabs wdock`) = de tabs (`.wd-tabs`,
  role=tablist, eigen witte pil met afgeronde onderkant) + daaronder een balk `.wd-go` in één afgerond, plakkend blok. Vóór de start: balk in
  accentkleur (verloop) met 'Start workout' — WEG (op vraag van Tom, 9 okt): geen startknop meer, de timer start bij het eerste vinkje en de balk `#wdGo` (met End + notitieknop `#noteJump`) is ALTIJD `hidden`: End workout staat (op vraag van Tom, 9 okt) weer altijd als zwevende pil `#woEnd` rechtsonder, ook op Workout; de notitieknop is dus niet zichtbaar. `startTab()` bestaat nog maar wordt niet meer aangeroepen. Tijdens een workout: balk in `--ink` met
  'End workout' + tijd (vroeger 'Stop workout', op vraag van Tom terug naar End; startknop heet 'Start new workout' met play-icoon 21 px, op vraag van Tom; stop 19 px, op vraag van Tom groter; `#woStop`, `#woStopT`; klikt `#woEnd` aan, dus zelfde logica) en het blok krijgt klasse `on`. De notitieknop
  `#noteJump` staat rechts in de balk (`.wd-note`, 38 px, icoon Material Symbols 'sticky_note_2' (vroeger sd_card_alert) outlined FILL 0 · wght 400 · GRAD 0 · opsz 24 (SVG van fonts.gstatic.com), 24 px, op vraag van Tom). De oude `.tools-row` is `hidden` (enkel nog de verborgen dropdown erin), dus de
  tabs staan nu even hoog als `#stabs` op Statistics (115 px op 375 px). De zwevende pil heet ook 'End workout' (confirm 'End workout?')
  en staat op elke pagina, ook op Workout (9 okt).
- WARM-UP IS GEEN EIGEN TAB MEER (op vraag van Tom, 10 okt): tabs = Open Gym · Cardio · eGym (volgorde op vraag van Tom, 10 okt; ook in Settings › Open the app on). De warm-up (g0) staat bovenaan Open Gym én eGym
  (`SPLIT.full`/`SPLIT.egym` beginnen met g0; niet bij Cardio), met een gewone groepskop 'Warm-up' + potlood (zelfde stijl als 'Quads'); ook de eGym-kop
  is nu een gewone groepskop (Cardio houdt de kleine tussenkop). Niet inklappen als ze af is (bewust, op vraag van Tom). Ook geen doorstrepen meer: een warm-up-oefening afvinken streept de andere niet door en de kop wordt niet 'af' (`paintChecks`, alleen eGym g10 kan nog `grp-done` krijgen). Een bewaarde keuze 'warmup'
  (fitlog-split of p53-start) wordt Open Gym / 'Where I left off'. De oude g0-regels (kop hoogte 0, zwevend potlood, `.first-sub`) zijn weg uit de CSS;
  wat hieronder over de Warm-up-tab staat, is de oude werking.
- Nummering van de groepskoppen (op vraag van Tom, 10 okt; enkel de getallen op het scherm, sleutels g0–g10 blijven): Open Gym = 1 Warm-up, 2 Quads,
  3 Chest, 4 Hamstrings…, 5 Back, 6 Shoulders, 7 Core, 8 Arms; eGym = 1 Warm-up, 2 eGym; Cardio = 1 Cardio. Alle koppen hebben dezelfde stijl (getal +
  titel + potlood); de Cardio-kop krijgt in cardiomodus dezelfde padding-top als de eerste kop (1.8rem), zodat lijn en potlood op elke tab even hoog staan.
  Waar in deze notities nog 'groep 1 Quads' e.d. staat, gaat het over de sleutel (g1), niet over het getal op het scherm.
- Keuze via tabs (op vraag van Tom, vervangt de dropdown): `#wtabs` (pil met 4 knoppen `role=tab`, `data-split`): Warm-up · Open Gym · EGYM · Cardio,
  direct onder de tools-row (Start) in `#s-d3`, `position:sticky` onder de statusbalk (`top: safe-area + 8px`, zelfde 8 px als de `--paper`-ring rondom; op vraag van Tom terug van 20 px; z-index 45; ring in `--paper` + (alleen als `.stuck`) een vlak van
  20 px erboven zodat er niets door schemert — niet altijd, anders bedekt het de onderkant van 'Start workout'; klasse `.stuck` = schaduw). Actieve tab: zelfde pil als de actieve navbar-knop (`--ink` 9% + accentkleur, 600). Upper/Lower zijn niet meer te kiezen (opgeslagen keuze → Open
  Gym); de kalender kan ze nog wel tonen. Wisselen terwijl de tabs plakken = tabs blijven op exact dezelfde hoogte, de nieuwe lijst begint eronder (`toList`: natuurlijke plaats gemeten met
  tijdelijk `position:static`; bij een korte lijst krijgt `#s-d3` een `min-height` zodat er tot daar gescrold kan worden, weg zodra je bovenaan bent).
  `window.__wtabsH()` = hoogte van de plakkende tabs; Start, `nextGroup` en het doorschakelen na de warm-up trekken die af bij het scrollen.
  De oude dropdown (`.split-sel`, `#splitBtn`, `#splitPop`) staat nog in de DOM maar is verborgen (`hidden`).
  De groepskop van Warm-up (g0) toont geen titel (`.grp-t` verborgen; de eerste tussenkop 'Cardio' staat op die regel); EGYM (g10) en Cardio (g8) tonen hun titel als kleine tussenkop (zelfde stijl als `.exsub`, op vraag van Tom, 9 okt), potlood rechts. Warm-up-kop heeft hoogte 0; het potlood staat absoluut rechts op de regel van de eerste ZICHTBARE tussenkop (klasse `.first-sub`, gezet in `apply()`, padding 47/18 px; ook als alle cardio-oefeningen uit staan), zodat
  potlood (45 px) en eerste lijn (90 px onder de tabs) op elke tab gelijk staan. Die koppen hebben `padding-top:2.4rem` zoals groep 1, zodat het eerste potlood op elke tab op dezelfde hoogte staat (45 px onder de tabs).
- (oud) Eigen menu (geen native `<select>`): `#splitPop` in de volgorde Warm-up | Open Gym (intern nog `full`, vroeger 'Full body'), EGYM | Cardio | Upper body, Lower body (op vraag van Tom; `|` = scheidingslijn `hr.sm-sep`) (`menuitemradio`, vinkje in accentkleur).
  Keuze in localStorage `fitlog-split` (onbekend = full).
- `SPLIT`: warmup = g0, full = g1–g7, upper = g2, g4, g5, g7, lower = g1, g3, g6, egym = g10, cardio = g8. De warm-up is een eigen keuze (op vraag van Tom:
  ze hoort bij elk programma) en staat in geen enkel ander programma. Laatst gekozen programma (niet warm-up) in localStorage `fitlog-split-last`.
  UITGESCHAKELD (op vraag van Tom, 8 okt): na afvinken wisselt de tab nooit meer vanzelf (de `p53-grpdone`-luisteraar keert meteen terug). Vroeger:
  Is de warm-up af door een vinkje (vinkje-handler stuurt event `p53-grpdone` met de groep zodra die groep `grp-done` wordt), dan schakelt de
  dropdown na 700 ms vanzelf naar dat laatste programma (standaard Open Gym) en scrolt zacht naar de eerste groep. g8 alleen bij Cardio. Verbergt via klasse `split-off` op alle `#s-d3 .exl > li[data-grp]`; body krijgt `split-cardio` in cardiomodus.
  'Start' scrolt naar de eerste zichtbare groepskop.
- Groep 8 'Cardio' (onderaan in `#s-d3`, kop zonder nummer, met potlood/keuzeblad zoals de andere groepen, geen uitleg-regel):
  rijen met sleutels `c-…` en een invulveld in minuten (`placeholder="min"`, data-note = sleutel): standaard aan Walking (`c-walk`,
  foto's walking = loopband), Walk-Jog Outdoors (`c-walkjog`), Jogging (`c-jog`, 'Easy pace · 20–45 min · impact', foto's = die van walk-jog; op vraag van Tom; bestaande cardiokeuzes krijgen het erbij via `migrate()`, vlag `jg`), Treadmill Walk-Jog (`c-treadjog`), Rower (`c-row`), Elliptical (`c-elliptical`),
  Cycling (`c-bike`), Padel (`c-padel`, 'Intervals · 60–90 min', geen foto's: het uitlegblad toont dan enkel tekst + tip);
  OUTDOOR / INDOOR (op vraag van Tom, 10 okt): tussenkoppen in g8 via `SUBS.g8` + `cat` (Outdoor = c-walk, c-walkjog, c-jog, c-bike, c-padel (Padel naar Outdoor op vraag van Tom, 10 okt); de rest Indoor). Walking (`c-walk`) = buiten, Cycling (`c-bike`) = buiten (geen beeld meer, enkel tekst; hun loopband-/hometrainerbeelden gingen naar de
  nieuwe binnenvarianten Treadmill Walk (`c-treadwalk`, EX `ctreadwalk`) en Exercise Bike (`c-xbike`, EX `cxbike`), beide standaard uit; GIF's gekopieerd).
  Oude metingen van c-walk/c-bike blijven onder Walking/Cycling staan.
  Outdoor-cardio (Walking, Walk-Jog Outdoors, Jogging, Cycling, Padel) toont GEEN beelden in het uitlegblad, enkel tekst (op vraag van Tom, 10 okt, bevestigd; geen VID/ANIM/IMG voor cwalk, cwalkjog, cjog, cbike, cpadel). Indoor-cardio: Gym visual-video's die Tom aanleverde: `stepmill` (Stairmaster `cstairs` + warm-up Stair Climber `stairs`), `recumbent` (`crecumbent`), `spinbike` (Exercise Bike `cxbike` + warm-up Stationary Bike `bike`), `treadrun` (Treadmill Walk-Jog `ctreadjog`, Treadmill Walk `ctreadwalk`, Incline Walk `cincline`, warm-up Incline Treadmill Walk `treadmill`; op vraag van Tom).
  uit: Stairmaster (`c-stairs`), Recumbent Bike (`c-recumbent`). Incline Walk (`c-incline`) is samengevoegd met Treadmill Walk (`c-treadwalk`, uitleg 'flat or on an incline'; op vraag van Tom, 10 okt): rij weg, metingen/hist via `MIGK`, tellers (counts, N×) worden in de counts-snapshot opgeteld, keuze via `migrate()` vlag `iw`. Labels '· impact' / '· outdoors' via `.exr-eqp`.
  Eigen namen (uniek t.o.v. de warm-up!) met EX-uitleg (zone 2) en foto's (`cwalk`… in NAMES/EX/IMG; nieuw: trail, jogtread, recumbent).
  Werkt als kracht: afvinken (getal verplicht) = meting per workout, oog-knop = uitleg + grafiek + edit, timer/End, N×.
  Telt NIET in Coverage (spieren: `events()` slaat `w0-` en `c-` over); de kalender telt cardio als minuten i.p.v. sets: '17 sets + 20 min cardio' (plus als er
  kracht én cardio was; `amount()`), per dag en per maand. Een cardio-oefening streept de andere cardio-rijen niet door (je mag combineren). End workout met alleen cardio
  blijft op Workout (geen sprong naar Coverage), wel vuurwerk. De pagina Cardio onder More blijft als uitleg.
- eGym-METHODE (op vraag van Tom, 10 okt): in de eGym-kop (g10) onder de titel 'Method' + schakelaar Eccentric · Regular (`.eg-meth`, `.st-seg`), voor de
  hele sessie; per toestel in localStorage `fitlog-egm` (standaard Eccentric), `window.__egMethod()`. Elke eGym-meting (`progRecord` en 'Add' via `progPut`)
  krijgt `m:'ecc'|'reg'`; oude eGym-metingen zonder `m` = Eccentric (alles tot 10 okt was excentrisch). Het uitlegblad toont per methode een eigen blok
  'Your progress · Eccentric' / '· Regular' met eigen grafiek. Het Edit-venster (veeg naar rechts, kalender én edit-blad) toont bij eGym ook 'Method' (`p53EditVals({method})` → `.method`;
  `__progSetVals(ids,vals,d,m)` zet `m`); het edit-blad toont achter de datum ' · Eccentric'/' · Regular'. Het 'Add'-formulier in het edit-blad heeft bij eGym bovenaan dezelfde schakelaar (`.pe-meth`, start op de sessiemethode, keuze in `peSh.__m` → `progPut(k,d,v,m)`). Het getal dat Tom invult = het kg-getal uit het eGym-overzicht (basis-/duwgewicht).
- Schrijfwijze op het scherm: 'eGym' (op vraag van Tom, 9 okt; tab, namen 'eGym …' in rijen én NAMES-sleutels, uitleg, kalender 'eGym'/'Open Gym + eGym'). Intern blijft `egym`/`g10`/`eg-…`.
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
  Cardio (g8) ongewijzigd. Toms eigen keuze staat in cfg/groups en verandert hier niet door.
  NIEUW ACCOUNT (op vraag van Tom, 9 okt): account aangemaakt na `FRESH_FROM` (2026-10-09 07:30 UTC, `__p53user.created_at`) zonder groups-doc op de
  server (snapshot niet uit cache) → `fresh()` zet alle groepen op `[]` (+ migratievlaggen, `fresh:1`) en bewaart; bestaande accounts houden de
  standaard. Een groep mag leeg zijn (de regel 'minstens één oefening' is weg). Lege groep: kop krijgt `.g-empty` (potlood onzichtbaar) en eronder
  `li.gx-empty` met gestippelde knop '+ Add exercises · Tap to choose from the list' die het keuzeblad van die groep opent (`apply()` zet/verwijdert hem).
  Testen: `window.__p53freshTest()` (alleen lokaal, bewaart niets). Invulvelden starten leeg (geen value in de HTML). Binnen een groep staan álle mogelijke oefeningen als gewone
  rijen in de HTML met `data-grp="g1"`; uitgezette rijen krijgen klasse `ex-off` (verborgen).
- Potloodknop `.grp-edit` in de groepskop opent onderblad `#grp-sheet` met schakelaars (`.sw`). Geen scheidingslijn tussen de infotekst bovenaan en de lijst (`.gs-list` zonder border-top; regel van Tom, 10 okt: nooit een divider onder een infotekst bovenaan een blad). Titel + kruisje blijven
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
- Op vraag van Tom (8 okt): spiergroepen (g1–g7) worden NIET meer doorgestreept na één oefening (geen `grp-done`/`grp-skip`), en er is geen automatisch
  doorscrollen naar de volgende groep meer (`nextGroup` doet niets). Alleen de warm-up (g0) en EGYM (g10, als alles af is) krijgen nog `grp-done`;
  enkel de warm-up streept de overige rijen door. Tik op een tab (Workout én Statistics) = wisselen + zacht scrollen tot de tabs op hun plakpositie staan, lijst er net onder
  (`window.__smoothTop(tabs)`; nog niet geplakt = niets doen; korte lijst = tijdelijke `min-height`).
  Wat hieronder over doorstrepen/doorscrollen staat, is de oude werking.
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
  `VID.legcurl` = seatedlegcurl; ook Band Pull-Aparts `pullapart`, Dead Hang `hang` , Bodyweight Squats `squat` , Rowing Machine `rowing` = ook cardio Rower via `VID.crow`, Side Plank `sideplank`, SkiErg `skierg`, Glute Bridge `bridge`, Single-Leg RDL `slrdl`, Cable Rope Hammer Curl `ropehammer` en Chest Fly Machine `fly` (Gym visual 'Lever Pec Deck Fly', 10 okt; ook eGym Butterfly via alias `VID.egfly`); cardio: `stepmill`, `recumbent`, `spinbike`, `treadrun` (aliassen `VID.c…`, zie Cardio)). Doel (Tom, 10 okt): overal dezelfde stijl Gym visual-video met volle animatie. Encoderen: `ffmpeg -nostdin` (anders eet ffmpeg de stdin van een lus op), `-an`, scale 640, crf 26.
  `VSQ` (vierkante video op wit) bestaat nog maar is leeg. Vervang je een bestaande video, verhoog dan `VIDV` (cache-buster `?v=` op video + poster, anders toont iOS de oude). Bird Dog: video; de getekende `player`-animatie blijft als terugval.
  Padel staat er zonder beeld. Torso Rotation (`w0-torso-rotation`, g0, reps) is op vraag van Tom terug, standaard aan; wie al een
  opwarmingskeuze had krijgt ze erbij via `migrate()` (vlag `tr` in cfg/groups); foto's `img/rotation-0/1.jpg` = afbeelding van Tom (handen op de heupen), in twee
  gesplitst en op wit 3:2 gezet.
  Nieuwe oefening: foto's (Free Exercise DB) + zo mogelijk een animatie toevoegen (sleutel in de `ANIM`-lijst + bestand in img/anim).
- Het keuzeblad toont ook het aantal trainingen ('· N×', zoals in de workout). De i-knop is overal dezelfde tint (de klasse
  `.nop` wordt nog gezet door `markProg` maar heeft geen stijl meer).
- Geen herhalingsbereiken meer (op vraag van Tom, 10 okt): elke oefening heeft één doel (10, 12 of 15; samengesteld 10, grotere isolatie 12, kleine spieren 15; warm-up idem één getal; 8 bestaat niet meer, op vraag van Tom → 10). Omzetting: 6–10/8–10/5–8/8–12… → 10, 10–12/10–15/8–15 → 12, 12–15/12–20/15–20/10–20 → 15 (Goblet Squat en Incline DB Press → 10). Tijd blijft een bereik (plank-sec, cardio-min, bird dog-hold). Guide › Intensity herschreven: vast doel, verhogen als alle sets het doel halen met ~2 in reserve. Eigen sets/reps van Tom in cfg/sets blijven voorrang hebben. Nieuwe oefening: één getal, geen bereik.
- Sets & reps per oefening: in het keuzeblad een rond knopje met icoon '123' (Material Symbols, inline SVG 24 px, viewBox bijgesneden tot `120 -840 720 720`, glyph verticaal gecentreerd) (`.gs-set`; standaard lichter, aangepast = gewone tint, zoals de i-knop) opent
  `#set-sheet` (bovenop, klasse `.top`) met stepper Sets (0–10, 0 = geen 'N ×') en tekstveld 'Reps or time', voorbeeld
  'Shows as', Save en 'Reset to default'. Opslag: localStorage `fitlog-sets` + cfg/doc `sets` (`{sleutel:{s,r}}`).
  `applySets` vervangt de eerste tekst van `.exr-s` (origineel in `ORIG`); de statistieken lezen de sets uit die tekst,
  dus een aangepast aantal telt mee voor nieuwe afvinkingen.
- De i-knop (intern nog zo genoemd) toont Material Symbols 'visibility' (oog) als inline SVG `INFO_ICON`, 20 px,
  viewBox `0 -980 960 960` zodat het oog verticaal gecentreerd staat (vroeger een getekende Fraunces-'i');
  ze opent uitleg én progressie. Rond knopje (36 px, zoals `.gs-set`); in de workout vóór het invulveld
  (rij krijgt `.has-info`, grid `2.4rem 1fr 36px 4.2rem`; invulveld smal en helemaal rechts, past '999'/'12,5'/'reps'), in het keuzeblad links van het sets-knopje.
- Vinkje (`.chk`, 34 px) heeft een groter onzichtbaar tikvlak (`#s-d3 .exr .chk::after`: 14 px boven/onder, 16 px links, 22 px rechts; op vraag van Tom).
- Tik op een oefeningsrij opent NIETS meer (op vraag van Tom, 8 okt); enkel de oog-knop opent uitleg + grafiek. Het script onderaan `index.html` staat nog
  maar keert meteen terug; `cursor:pointer` op de rij is weg.
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
- `sortRows` (`cat`): Back = eerst rows (`data-og` g4), dan verticaal/bovenrug (g6); Arms = curls, triceps (g9), supersets (twee invulvelden),
  onderarmen (wrist/reverse) als laatste; daarbinnen laag + `POP`. Calisthenics-filter is weer verwijderd (op vraag van Tom).
- Tussenkoppen (`li.exsub`, door `sortRows` ingevoegd volgens `SUBS`): Warm-up = Cardio (bike, rowing, incline walk, cross trainer,
  SkiErg (`w0-skierg`, standaard uit, uitleg + tip over de rug), jump rope, stair climber) / Mobility & activation (de rest); Back = Rows / Vertical pull & upper back; Arms = Biceps /
  Triceps / Supersets / Forearms (onderarmen als laatste, op vraag van Tom, 9 okt; `cat` 0–3). Verborgen als er geen zichtbare oefening onder staat (in `apply`). Het keuzeblad toont dezelfde
  koppen (`li.gs-sub-h`, uit `data-sub` op de rij).
- Supersets (Arms, achteraan; volgorde in POP: rope only (ss2), bar only (ss3), mix rope + bar (ss1), reverse (ss4), single-arm (ss5);
  standaard aan: ss2, ss3, ss1; elke superset gebruikt altijd dezelfde hulpstukken zodat de gewichten vergelijkbaar blijven): ss1 Overhead Extension + Biceps Curl, ss2 Rope Pushdown +
  Hammer Curl, ss3 Bar Pushdown + Bar Curl (`x7-ss-bar`), ss4 Reverse-Grip Pushdown + Reverse Curl (`x7-ss-reverse`), ss5
  Single-Arm Pushdown + Single-Arm Curl (`x7-ss-single`). Per superset: rij met `.exr-in2` (twee velden, sleutel + `-b`), MUSCLES,
  NAMES → `ssN`, `EX.ssN`, `IMG.ssN` (4 foto's: begin/eind van beide), `SSL.ssN` (namen voor de foto-labels en progressieblokken), POP.
- Kabeloefeningen tonen het hulpstuk achter de sets: `<span class="exr-eqp">· rope</span>` (ook V-handle, D-handle(s), wide bar,
  close-grip bar, straight bar, straight or EZ bar, ankle strap); het keuzeblad toont het mee. Nieuwe kabeloefening: hulpstuk erbij.
- Arms-kop: gewoon 'Arms' ('(Optional)' weggehaald op vraag van Tom, 9 okt).
- De rij-animatie (`cascade`) en de paneel-animatie (`reveal`) zijn UITGESCHAKELD (op vraag van Tom: na wisselen van pagina leek het tot 2 s te
  duren voor alles getekend was; de rijen kwamen gestaggerd tot ~1,9 s binnen). Beide functies keren meteen terug. Stats/kalender gebruiken
  `window.__liByNote` (cache veld → rij) i.p.v. een querySelector per meting.

