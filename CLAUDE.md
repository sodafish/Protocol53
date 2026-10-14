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
  Geen flits van de app vóór het inlogscherm (13 okt): `<head>`-script zet klasse `p53-out` op `<html>` als localStorage `p53-auth` ontbreekt (CSS verbergt alles behalve `#p53-login`); `showLogin` zet ze ook, `showApp()` in `start()` en bij offline-zonder-sessie haalt ze weg.
  `p53ResetData(logIds)`: wist op de server (alleen online) alle rijen van checks, counts, hist, prog, sess + de log-rijen van de
  invulvelden, plus cache/wachtrij/localStorage daarvan; knop 'Reset data' onder Settings › Your data (`#resetData`, `p53Confirm` danger), daarna
  herladen. Notities, cfg (oefeningkeuze, sets, profiel) blijven. De velden worden gewist via hun logboek-id `'note--'+veld` (QA 11 okt: de knop gaf eerst kale veldnamen door, waardoor de velden gevuld bleven).
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

- SYNC VAN INSTELLINGEN (QA Tom, 14 okt: op de iPhone ontbraken de oefeningkeuze en de tabs die hij 's ochtends in de browser instelde):
  1) `cfg/groups`: de snapshot uit de cache (verouderd toestel) liet `migrate()` nieuwe vlaggen zetten en schreef die OUDE keuze terug naar de server,
     vóór de pull. Nu schrijft het groepsscript een migratie enkel terug na een serversnapshot (`!fromCache`). Regel: nooit naar de server schrijven vanuit een cache-snapshot.
  2) Programs (`p53-progs`), Warm-up (`p53-warmup`), 'Open the app on' (`p53-start`) en Body split (`p53-half-on`) gaan nu ook via `cfg/doc prefs` `{progs,wu,start,half,at}` (settings-script, `prefsPush`/`prefsApply`):
     pas bij een wijziging naar de server; serverversie wint als `at` nieuwer is dan localStorage `p53-prefs-at` (gewist door `wipeLocal`). De localStorage-sleutels blijven de werkkopie.
     Thema (`p53-theme`) en Full/Upper/Lower (`fitlog-half`) blijven bewust per toestel. Waar elders 'per toestel' staat bij Programs/Warm-up/Open the app on: vervangen door dit.

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
- Settings-blad `#st-sheet`: titel + kruisje plakken bovenaan bij scrollen, met lijntje (`.stuck` na 20 px), dezelfde regels als het keuzeblad `#grp-sheet` (op vraag van Tom, 12 okt).
- Eén programma (geen tabs bovenaan Workout): de eerste zichtbare rij van `#s-d3 .exl` krijgt `.list-top` (padding-top 0), zodat de warm-up-kop (of Full/Upper/Lower, of de eerste groep) begint waar de tabs zouden staan: 117 px op 375 px, zelfde hoogte als het eerste kader op Diet/Guide (op vraag van Tom, 12 okt). Script vlak voor `</body>`, `window.__p53listTop()`, ververst bij `p53-groups`/`p53-progs`/`p53-split` en vanuit `apply()` van het split-script.
- Settings › Warm-up PER PROGRAMMA (op vraag van Tom, 13 okt; vervangt de ene schakelaar van 12 okt): sectie `#stWu` (stijl Programs) met vinkrijen Open Gym · eGym · Home (`li[data-wu]` full/egym/home), enkel de programma's die in Programs aan staan (rest `hidden`; enkel Cardio = hele sectie weg), daaronder 'Show the warm-up at the top of these programs.'. Opslag per toestel: localStorage `p53-warmup` = JSON-lijst van programma's ZONDER warm-up (leeg = sleutel weg; oude waarde 'off' = alle drie uit). `window.__p53wuOff()` en `window.__p53wuApply(split)` in het `<head>`-script: klasse `no-wu` op `<html>` als de huidige tab in die lijst staat (bij laden uit `fitlog-split`, daarna vanuit het split-script bij elke wissel). `no-wu` verbergt alle `#s-d3 .exl > [data-grp="g0"]` + de lege-groepknop van g0; Full/Upper/Lower-keuze dan .8rem i.p.v. 3.2rem erboven. Standaard overal aan. Keuze en metingen van de warm-up blijven bewaard.
- Lege groep ('Add exercises', `.gx-empty`): leeg = geen enkele zichtbare rij in de groep (12 okt; vroeger `!on(g).length`, maar cfg kan sleutels van verwijderde oefeningen bevatten, bv. `w0-torso-rotation` via de `tr`-migratie, waardoor een volledig uitgezette warm-up geen plus-knop toonde).
- Eenheidslaag NIET bij verborgen velden (`input[type=hidden]`, eGym): stond als 'kg' onder het vinkje (QA Tom, 14 okt); `setup()` slaat ze over + CSS-vangnet.
- Eenheid in ingevulde velden (op vraag van Tom, 12 okt): elk `input.note.exr-in` dat rechtstreeks in een `.exr` staat en als placeholder een eenheid heeft (kg, reps, sec, min) krijgt erna een laag `.exr-u` (zelfde rastercel, `place()`), die buiten focus en ingevuld 'waarde + eenheid' samen gecentreerd toont (eenheid 11.5 px 500 `--muted`); de tekst van het veld zelf is dan transparant. In focus: gewoon veld. Leeg: placeholder. De app vult velden ook via JS, daarom is de `value`-setter per veld omwikkeld (`sync`). Script vlak voor `</body>`, CSS-blok 'EENHEID ZICHTBAAR'.
- Focus op invulvelden en notities: geen dikke rand, enkel een dunne rand die zacht oplicht (40% inktkleur: in donker lichter/witter, in licht iets donkerder).
- iOS-toetsenbordbug (video Tom, 13 okt): na het sluiten van het toetsenbord bleef de navbar meescrollen en halverwege het scherm hangen (iOS denkt dat het toetsenbord er nog is). Script vlak voor `</body>`: na `focusout` van een tekstveld (60 ms en nog eens 350 ms later), bij `visualViewport` resize terug naar volle hoogte en bij terugkeren naar de app een scroll-nudge van 1 px heen en terug, enkel als er geen tekstveld in focus is. Geen correctie bij focus zelf.
- Invulveld aantikken: geen eigen scroll-code (een visualViewport-correctie liet de lijst flikkeren op iOS, teruggedraaid).
  Wel `html:has(input:focus,textarea:focus){scroll-behavior:auto}` zodat iOS het veld zonder 'smooth' in beeld schuift.
  De iOS-balk met pijltjes en vinkje boven het toetsenbord is van Safari en kan een web-app niet weghalen.
- Thema's (op vraag van Tom, 11 okt): Settings › Appearance = System · Light · Dark · Blue (`data-theme` light/dark/blue, localStorage `p53-theme`; System volgt het toestel = Light of Dark). Blue = de blauwe skin (C1 'Rustig', verzonken): papier `#161D26`, band `--paper-soft` `#0F151C`, `--surface` `#131A23`, `--paper-dark`/`--line-soft` `#2A3542`, `--line` `#313D4A`, muted `#A5B0BC`, muted-soft `#76828F`, glas `--glass-rgb` 38,50,65, `--knob` `#263241`, `--tabs-solid` `#212B38`. Dark = dezelfde verhoudingen in chocolade/cappuccino (elke blauwtint in CIELAB met dezelfde L* en chroma, enkel de tint gedraaid: chocolade h≈52 voor vlakken/lijnen, cappuccino h≈64–68 voor glas/knop/tabs/muted): papier `#251A15` (ook `theme-color`), band `#1C120D`, surface `#221711`, paper-dark/line-soft `#413129`, line `#493831`, muted `#B9ADA2`, muted-soft `#8C7E73`, glas 61,46,35, knob `#3D2E23`, tabs `#35281E`. Inkt `#F5EFE6` en accent `#E08A62` in beide. Alle donkere regels gebruiken de tokens `--glass-rgb`/`--knob`/`--tabs-solid`; elke regel met `:root[data-theme="dark"]` heeft ook een kopie voor `:root[data-theme="blue"]` (de media-regels `:root:not([data-theme="light"])` gelden voor beide). Nieuwe donkere regel = beide selectors. Verzonken: band onder het papier, surface tussen band en papier; navbar `.glass` = `rgba(var(--glass-rgb),.42)` + blur 18px/saturate 180%/brightness 1.15, rand wit 16%; onderbladen/vensters `.84`.
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
- Inlogscherm voor wachtwoordbeheerders (1Password, iCloud-sleutelhanger; op vraag van Tom, 13 okt): `form#p53-login-form` met `method=post action=#`, velden `#lg-email` (`name=username`, `autocomplete=username`, `inputmode=email`) en `#lg-pw` (`name=password`, `autocomplete=current-password`, bij Create account `new-password`), labels met `for`. In `cloud.js` dus `f.username`/`f.password` (vroeger `f.email`/`f.pw`).
- Inlogscherm: het veld 'Date of birth' (`.lg-dob`) staat er enkel bij 'Create account'. `#p53-login label{display:flex}` overschreef het `hidden`-attribuut, waardoor het ook bij 'Log in' zichtbaar was; daarom `#p53-login label[hidden]{display:none}` (13 okt).
- Opslag: collectie `cfg`, doc `profile` (`{dob:'jjjj-mm-dd'}`), cache localStorage `fitlog-dob`. Bij 'Create account' is de
  geboortedatum verplicht (`cloud.js`, `user_metadata.dob` via `signUp`). `cloud.js` zet `window.__p53user` en stuurt event `p53-user`.
  Leeftijd herberekend bij laden en bij terugkeren naar de app.
- Calorieën, geslacht, lengte en gewicht zijn op vraag van Tom weer weggehaald (niet opnieuw toevoegen zonder vraag).

## Guide
- Onderaan Guide (na Sleep) staat 'How Statistics works' (op vraag van Tom, 10 okt): twee korte secties Muscle Balance en Strength Progress
  (zelfde stijl als Intensity: `.section-title sub` + `.section-note` + `.tip ul`). Pas die tekst mee aan als de berekening (MUSCLES-gewichten,
  periodes, `SUG_MIN`, `chainPct`, hele lichaam, `BASEGAP`) verandert.

## Diet
- Diet en Guide: de eerste kaders beginnen op dezelfde hoogte als de tabs op Workout/Statistics (115 px op 375 px; `#p-voeding,#p-kracht{padding-top:.6rem}`, eerste marges 0; op vraag van Tom).
- Frequentie-badge 'Freely' (`b-vrij`) is overal 'Often' (`b-groen`) geworden (op vraag van Tom). Alle frequentie-pillen zijn gevuld met tekst in `--paper` (ook leesbaar in donker). Kleuren (op vraag van Tom, 10 okt): Often = donkergroen `--green`, Moderate = lichtgroen `--diet-mid`, Occasionally = bruin `--diet-low`; NOOIT rood (alles is gezond, enkel de frequentie verschilt). Klassen heten nog `b-amber`/`b-rood`; ook het lijntje links van de rij (`tr.row-amber/row-rood`) volgt die kleuren.
- Elke voedingsrij toont onder de naam `<span class="nut">N kcal · N g protein <i>/ eenheid</i></span>` (op vraag van Tom, 9 okt; richtwaarden,
  ranges bij groepen zoals vette vis). Eenheid: per stuk waar dat logisch is (egg, avocado, piece fruit, slice, scoop, tin, tbsp,
  handful, 2 squares), anders per 100 g (raw/cooked/dry erbij); 0-waarden zonder eenheid. Nieuwe voedingsrij: zo'n regel erbij. Getoond als zachte pil (`#p-voeding .nut`, 6% inkt). Eiwit enkel waar relevant: niet bij groenten, fruit, olie, avocado, olijven, cacao, chocolade, hummus, stevia, water (daar enkel kcal). De pil '★ Top protein' is weg (op vraag van Tom).

## Altijd gsm-weergave (op vraag van Tom, 11 okt; vervangt de tablet-layout van 9–10 okt)
- Geen tablet- of desktoplayout meer: op elk scherm dezelfde gsm-kolom, gecentreerd. `--app-w: 430px` (blok 'ALTIJD GSM-WEERGAVE' onderaan de CSS)
  is de max-breedte van `.wrap`/`main.wrap` en van de onderbladen (`.sheet`); `--app-gut` (de lege rand links/rechts) schuift de vaste knoppen
  (`.to-top`, `.wo-end`) mee naar de rand van de kolom.
- De vroegere `@media(max-width:640px)`/`(max-width:520px)`-blokken zijn `@media all{…}` geworden: de gsm-regels gelden altijd.
  Kleine fijnregels voor smalle toestellen (≤ 380/360/350 px) blijven media queries. Geen nieuwe breakpoints voor brede schermen toevoegen.

## Cardio en Group
- DRIE PILLEN MET LABEL (op vraag van Tom, 14 okt; vervangt 'GEEN LABELS' van 12 okt en de rechtse pil Cardio · Group): `.wd-blk-str` (Gym · eGym · Home, band 'Strength'), `.wd-blk-card` (Cardio, band 'Cardio'), `.wd-blk-grp` (Group, band 'Group'). Band = de stijl van 10–11 okt: `.wd-blk` beige `--paper-soft`, `.wd-band` onder de pil (order 2, 30 px, 10.5 px kapitalen `--muted`), pil valt 4 px over de band. Breedte: `.wd-blk{flex:var(--n) 1 calc(10px + (n-1)·2px)}` → alle tabs even breed, rij altijd volle breedte; `--n` van de krachtpil = aantal zichtbare krachttabs (gezet in `layout()`). Eén zichtbare pil = `.wd-tabs.solo` = geen labels/band. De oude `--ns`/`--nc`-breedte (`.wd-blk-card-old`) is buiten gebruik.
- 'Open Gym' heet op het scherm OVERAL 'Gym' (op vraag van Tom, 14 okt): tab, Settings › Programs/Warm-up/'Open the app on', History-kopjes ('Gym · Upper Body', 'eGym + Gym'). Intern blijft het `full`; waar deze notities 'Open Gym' zeggen, is dat dit programma.
- GROUP = vijfde programma (op vraag van Tom, 14 okt; variant A uit een voorbeeld: rechtse pil Cardio · Group naast de krachtpil). Groep `g11` 'Group' (kop zoals Cardio: zonder nummer, `.grp-t` 14 px lager, `body.split-group` = padding-top 1.8rem), `SPLIT.group=['g11']`, tab `data-split="group"` in `.wd-card`, Settings › Programs-rij 'Group · Classes', 'Open the app on' kent `group`. Rijen: 'HIIT Session' (`c-hiit`, info `chiit`) en 'Core Session' (`c-core`, info `ccore`), minuten; sleutels ongewijzigd, dus de metingen bleven. POP.g11. Cardio (g8) heeft weer enkel Outdoor/Indoor.
- Migratie `cfg.gr` (ook in `fresh()`, samen met `hi`/`cs`): c-hiit/c-core uit `cfg.g8` en `cfg.order.g8` → `cfg.g11` (wat aan stond; niets = beide). Programma's: standaard full/egym/cardio/group (Home uit); bestaande `p53-progs` krijgen eenmalig `group` erbij (vlag `p53-progs-gr`, in het `<head>`-script).
- Tabbreedte: `.wd-blk-card` rekent met `--ns` (krachttabs) én `--nc` (tabs in de rechtse pil, gezet in `layout()`), dus alle zichtbare tabs zijn even breed en de rij blijft volle breedte als er programma's uit staan.
- Tellen: HIIT = cardiominuten (maandoverzicht Cardio, maandtotaal); Core Session telt NIET als cardio maar in Balance als core-oefening: `MUSCLES['c-core']={buik:1,schuin:.5,onderrug:.5}`, 3 sets (uitzondering op de `c-`-regel in `events()`). Kalender: blok 'Group · N min' (`o.gmin`), programma 'Group'; geen sets in de kalender.
- Maandoverzicht History: vierde grafiek 'Group' (minuten HIIT + Core, `a.gm` uit `o.gmin`, zelfde stijl als Cardio via `MK={h:'c',gh:'gm'}`), ENKEL als er ooit een Group-sessie geregistreerd is (`anyGr`). Ook 'Cardio' staat er enkel als er ooit cardiominuten zijn (`anyCa`, HIIT telt mee) (beide op vraag van Tom, 14 okt).
- `setsFor` leest enkel de eerste tekst van `.exr-s` (14 okt): de teller '· 1×' erachter telde anders als 1 set bij rijen zonder 'N ×' (enkel HIIT/Core).

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
  met schakelaar Front/Back (`.bal-seg`; actieve knop met dezelfde zachte schaduw als `.st-seg`/`#wdHalf`, op vraag van Tom, 12 okt; sinds 11 okt gecentreerd ACHTER het hoofd: Front links, Back rechts, top 12 px, gat 100 px, knoppen 84 px; `.bal-figs` ligt erboven met `pointer-events:none`; op vraag van Tom, variant B uit drie voorbeelden; vroeger absoluut rechtsboven; opent ALTIJD op Front, ook na wisselen van tab of pagina (`__balPre` zet Front terug; keuze niet meer onthouden, op vraag van Tom, 10 okt; vroeger localStorage `fitlog-bal-side`); vanuit elke spier die hoofdspier is van minstens één kg-oefening die AAN staat (`PRIM`, geen `ex-off`), of waarvoor al data is, een lijntje (`.bal-ln`): met data (in `balPct`) oranje %, zonder data grijze 0%; andere spieren: callout verborgen (`display:none`, vaste plekken blijven); ververst bij `p53-groups` (op vraag van Tom, 9 okt); helemaal geen data = zin `#progHint` 'Log an exercise three times to see your progress here.'
  naar links/rechts met groot % (`.bal-pct`, Fraunces 17; `has` = accent zodra die spier minstens één oefening met twee metingen in de periode heeft, ook bij 0% (op vraag van Tom, 9 okt); anders `zero` = muted) en de naam (`.bal-lab`, kapitalen 7). Ankers en
  labelhoogtes in `CO` (drawBody, 450-coördinaten; R-ankers al gespiegeld). Kleur van de spiervlakken = krachttoename (hoe donkerder, hoe meer).
  Bovenaan Progress (op vraag van Tom, 9 okt) de periode `.pr-range` (40 px hoog, lijn en potlood op exact dezelfde hoogte als de periode-rij van Balance): tekst `#prRange` ('3 Oct – 9 Oct 2026 · all data') + potlood `#prEdit` (accent (`on`) zodra er een eigen periode is, én na elke keuze in het venster, ook 'Show all data' (`prR.set`; op vraag van Tom, 10 okt); rand van `.per-edit.on`/`.pr-edit.on` = zelfde als het lampje `.sug-btn` (accent 45% gemengd met `--line`))
  → `p53EditRange({title,msg,min,max,from,to})` (venster met twee datumvelden From/To, min/max = eerste/laatste kg-meting, buiten die grenzen wordt
  geklemd; 'Show all data' = terug naar alles). Bewaard in localStorage `fitlog-prog-range` `{f,t}`; leeg = volgt de eerste/laatste meting (ook nieuwe).
  `window.__progRange()` → `{from,to,f,t,b,all}`; figuur (`balPct(from,to)`) én de lijst `#plList` rekenen eerste → laatste meting BINNEN die periode
  (minstens twee metingen); lijst ververst bij event `p53-prange`. Getekend in `drawBody` (`bodySvg`), gevuld in `renderStats`. Onder de figuur 2.6rem ruimte (`#progFig`, op vraag van Tom).
  % per spier = `balPct(from,to)` = GEMIDDELDE VOORUITGANG (op vraag van Tom, 11 okt; vroeger kettingindex per week, die stijgingen van oefeningen in verschillende weken vermenigvuldigde: biceps +16% en triceps +13% gaf Arms +31%). `chainPct(notes,from,to)` (ook `window.__chainPct`, naam behouden) = per oefening de som van haar log-stapjes in de periode, daarna het meetkundig gemiddelde over de oefeningen met minstens één stap → `{p,n,k}`. Groep met tussenkoppen (Back, Arms) = meetkundig gemiddelde van haar tussenkoppen. Wat hierna over 'per week … vermenigvuldigd' staat, is de oude werking. Oude tekst: over de oefeningen waar die spier
  hoofdspier (1) is (één kg-veld, g1–g7 + eGym g10, geen supersets; `progRows`; eGym = de krachttest `eg-…#test`, zie eGym-KRACHTTEST; vroeger per methode): elke oefening enkel t.o.v. zichzelf (meting → volgende meting), de EERSTE meting
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
  Volgt de gekozen periode van Balance (op vraag van Tom, 11 okt; vroeger altijd 30 dagen): `renderStats` bewaart `window.__balState` {sc,n,eff,perWeek,spanW,head}; per-week-periodes vergelijken met `SUG_MIN` per week, totaal-periodes met `SUG_MIN × spanW` (7 dagen = 1 week, 30 dagen = 30/7, eigen periode = lengte; geklemd op tijd sinds eerste training, min. 1 dag; Last workout = weekminimum / trainingen per week uit de laatste 30 dagen). Ook de Balance-drempels (≥ 3 sets, vloer .5) schalen mee. Geen training in de periode = uitleg. Tijdens een lopende workout (laatste meting ≥ `__woStart()`) heet Last workout 'This workout' (kop + blad); intro bij Last workout: 'Aim for about N sets per large muscle per workout.'
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
- (VERVANGEN 14 okt door HISTORY DAY · MONTH hierboven; staafstijl, koppen en eGym-deel gelden nog) Maandoverzicht bovenaan History (op vraag van Tom, 10 okt; gekozen uit vier voorstellen = variant B; eGym/Open Gym-onderscheid bewust weg):
  `#calMon`, `renderMon(days)` in het kalenderscript (zelfde dagdata als de kalender). Drie kleine grafieken onder elkaar, elk eigen schaal:
  Training days · Sets · Cardio (in uren en minuten: '40m', '1h 20m', '7h 35m', '2h' (op vraag van Tom korter dan 'min'); `hr(min)`; op vraag van Tom, 10 okt; vroeger even per half uur;
  lange waarden breken boven de staaf op de spatie; groot getal met kleine eenheden `small.u`; ook het maandtotaal boven de kalender, de dagen blijven '40 min'); kop = label links + groot getal (Fraunces 24) van de GEKOZEN kalendermaand ('… so far in October' voor de
  lopende maand, anders 'in September'). 6 maanden naast elkaar (venster `winEnd`), staafjes in inkt 20% op papier, gekozen maand accent,
  lopende maand gearceerd (`.run`). eGym (op vraag van Tom, 10 okt; eGym is tijdelijk): staat er in de 6 getoonde maanden (of de gekozen maand) eGym, dan krijgen Training days en Sets onderaan elke staaf een lichter deel (`.mon-c i b`: inkt 9% op papier + 1px lijn in `--paper` erboven; gekozen maand accent 45% op papier; variant G gekozen uit 12 voorstellen, op vraag van Tom; vroeger goud) = eGym-dagen (`ed`, dag met g10) en eGym-sets (`es`, uit `o.egs` in `data()`), en onder de kop een kleine regel '■ eGym · 1 day' / '· 2 sets' (`p.mon-key`, rechts). Zonder eGym: niets daarvan, weergave zoals voorheen. Ruimte: kop → grafiek .7rem (op vraag van Tom iets meer dan eerst .15rem; rij 62 px), tussen de grafieken groot (2.6rem), zodat de kop zichtbaar bij de grafiek eronder hoort (op vraag van Tom). Navigatie: kalenderpijltjes (venster schuift mee als de maand erbuiten valt), tik op een staaf/maand = kalender
  springt erheen, 'Earlier'/'Later' onderaan (`#monPrev`/`#monNext`) of horizontaal vegen = 6 maanden verder (kalender springt naar de laatste maand
  van het venster); niet vóór de eerste trainingsmaand, niet voorbij deze maand. Geen data = verborgen.
- HISTORY DAY · MONTH (op vraag van Tom, 14 okt; Day = voorstel D3, Month = voorstel Y2 '12 maanden'; de oude 6-maandenweergave hieronder is WEG, en 'Year' heet nu 'Month'): tekst-tabs `#histPer.stats-per.hist-per` (knoppen `data-hv` d/y, NIET `data-d`; Month = `y`) boven `#calMon`, verborgen samen met het maandoverzicht zonder data; keuze per toestel in localStorage `fitlog-hist-view` (standaard y; oude waarde m → y). Alles in `renderMon` (lokale samenvatting heet `cs`, want `sel` is de gekozen kalenderdag); `renderMon` wordt pas aangeroepen NA het bepalen van `sel` in `render()`.
  GEEN eGym-ONDERSCHEID MEER IN HISTORY (op vraag van Tom, 14 okt): `EGK={}`, dus nergens een lichter eGym-deel of '■ eGym'-regel; `ed`/`es`/`o.egs` worden nog berekend maar niet getoond.
  SCHERMNAMEN (op vraag van Tom, 14 okt, later): de tabs heten **Month** (`d`, de dagen van één maand) en **Year** (`y`, de 12 maanden van één jaar). Waar hieronder 'Day' staat = tab Month, 'Month' (12 maanden) = tab Year.
  KOP (op vraag van Tom, 14 okt: 'één zin links' geprobeerd en teruggedraaid): kapitalenlabel links (Training days · Strength sets (vroeger 'Sets'; op vraag van Tom, 14 okt) · Cardio · Group), groot getal + kleine tekst rechts ('150 days so far in 2026', '6 sets on Wed 14 Oct'); eGym-regel rechts.
  GEKOZEN STAAF (op vraag van Tom, 14 okt; eerst inkt/zwart, teruggedraaid): gekozen staaf vol accent (`.mon-c.sel i`), de andere accent 72% op papier (`.mon-c i{background-color:…}`), allemaal gearceerd; waarde en aslabel van de keuze accent 600. In Month = de kalenderdag waarvan de oefeningen onderaan staan, in Year = de kalendermaand. Month toont om de twee dagen een dagnummer (oneven dagen; op vraag van Tom, 14 okt, vervangt 'alle dagnummers in 8.5 px'), zelfde grootte als Year (10.5 px); de as is VAST: een gekozen even dag krijgt geen eigen nummer (de kop rechtsboven toont de datum al; op vraag van Tom, 14 okt).
  ALLE STAVEN GEARCEERD + BOLLETJE (op vraag van Tom, 14 okt): de arcering (vroeger enkel `.run`) staat op elke staaf (`.mon-c i,.mon-c i b`); vandaag (Month) / deze maand (Year) krijgt onder de lijn een bolletje van 6 px in accent (`.mon-mo button.now::before`, 4 px onder de lijn = midden tussen lijn en aslabel (op vraag van Tom, eerst 2 px), as padding-top .7rem; eerst 4 px, op vraag van Tom groter). `.run` blijft als klasse op de staaf maar heeft geen eigen stijl meer.
  ALLE STAVEN IN DE ACCENTKLEUR (op vraag van Tom, 14 okt; vroeger inkt 20% met enkel de gekozen in accent); de keuze toont zich enkel in de waarde (accent, vet) en het aslabel. eGym-deel = accent 45% op papier (ook het blokje in de '■ eGym'-regel). Lopende maand / vandaag blijft gearceerd.
  Kolommen `repeat(var(--mon-n),minmax(0,1fr))` + `.mon-c{min-width:0}`: met gewone `1fr` maakten verborgen waarden ('1h 20m') kolommen breder, waardoor Sets en Cardio in Day niet gelijk liepen.
  Day = elke dag van de kalendermaand (`ym`) als dunne staaf (klasse `.dense`, gap 2 px, ENKEL DE GEKOZEN/AANGETIKTE STAAF TOONT HAAR WAARDE (op vraag van Tom, 14 okt, na tussenstappen 'waarde op elke staaf' en 'cardio om en om in twee rijen'): ('6'; cardio/group als kaal getal in minuten '30'), 10.5 px zoals de as; de KOP blijft in uren en minuten ('1h 45m so far in October'; op vraag van Tom, 14 okt, 'min' in de kop geprobeerd en teruggedraaid); eerste twee/laatste twee dagen: label naar binnen (`.el`/`.er`), nowrap, as 1/8/15/22/29), groot getal = MAANDTOTAAL ('29 sets so far in October' / 'in September', jaar erbij buiten het lopende jaar; op vraag van Tom, 14 okt, zoals Year het jaartotaal toont; vroeger de gekozen dag 'on Tue 13 Oct'); Training days valt weg (de kalenderbolletjes doen dat); tik op een staaf = die dag in de kalender (`sel=pick`); toekomst leeg/niet aantikbaar. Month = jan–dec van het jaar van de kalendermaand (as J F M…, gap 3 px; ook hier ENKEL DE GEKOZEN STAAF TOONT HAAR WAARDE, voluit '7h 35m' (klasse `.one` op elke `.mon-blk`, jan/dec label naar binnen `.el`/`.er`; op vraag van Tom, 14 okt; vroeger een korte waarde boven elke maand '12h'/'40m')), groot getal = JAARtotaal ('so far in 2026' / 'in 2025', duizendtallen met komma), maanden in de toekomst of vóór de eerste training leeg en `disabled` (50%); tik = kalender springt naar die maand.
  Earlier/Later en vegen (`monPage`): Day = 1 maand, Month = 1 jaar (kalender naar december, of deze maand in het lopende jaar); nooit vóór de eerste trainingsmaand of voorbij deze maand. `winEnd` (6-maandenvenster) bestaat niet meer.
- Kalender onderaan Coverage (`#cal`, kop 'Calendar' (vroeger 'Workouts'), eigen script onderaan `index.html`, `window.__renderCal`, ververst mee met
  `renderStats`), bewust eenvoudig (op vraag van Tom): maand met pijltjes (niet voorbij deze maand, en niet vóór de eerste maand met data: linkerpijl uit, `ym` geklemd; zonder data blijft het deze maand; op vraag van Tom, 10 okt), week begint op maandag, bolletje
  in de accentkleur op elke dag met een meting in de grafiek (geen warm-up),
  vandaag in accentkleur, bovenaan 'N training days · N sets' (sets van die maand; op vraag van Tom telt het dagen, twee workouts op één dag = één dag). Tik op een dag = eronder (1.25rem ruimte onder de kalender, ~26 px van de laatste cijfers tot de lijn met de datum; de grote ruimte staat ONDER de datum: eerste tussenkop padding-top 2.8rem; op vraag van Tom) de datum en daaronder per regel 'Programma · N sets' en 'Cardio · N min' (op vraag van Tom) (som van de sets van elke oefening
  die dag, één keer per oefening). Programma (`prog()` in het kalenderscript) wordt per workout afgeleid uit de groepen met een meting: g10 = EGYM (+ rest), enkel g8 = Cardio,
  enkel g2/g4/g5/g7 = Upper body, enkel g1/g3/g6 = Lower body, anders Full body; meerdere workouts op één dag = 'Open Gym + EGYM'; 'Cardio' staat niet als programma (de minuten staan al in '+ 40 min cardio'), een dag met enkel cardio = 'Cardio · 40 min'. Bron = alleen de grafiekdata (`prog`, zoals 'N×'; sets via `window.__setsFor`), ververst bij `p53-prog`. Onder de datum staat de lijst van gedane oefeningen (`.cal-ex`; sinds 11 okt bovenaan ook een blok 'Warm-up' (g0, `WU` in `data()`, `exList(o,WU[sel])`) zonder totaal en zonder reps, enkel naam + waarde, wel vegen voor Edit/Delete; de warm-up telt verder NERGENS mee: geen bolletje, geen sets/dagen/maandoverzicht, een dag met enkel warm-up is geen trainingsdag; op vraag van Tom), gegroepeerd per programma met tussenkop + totaal (Open Gym krijgt altijd ' · Upper Body / Lower Body / Full Body' erachter, uit de groepen
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
- SESSIE ACHTERAF (op vraag van Tom, 11 okt; eerst enkel eGym, daarna uitgebreid): in History is elke dag die niet in de toekomst ligt aantikbaar, ook zonder data (`pick` = gekozen lege dag, blijft geselecteerd). Onder de dag een omlijnde pil `.cx-add` '+ Add session' (of 'Edit session' als er die dag iets staat, ook enkel warm-up) → blad `#egs-sheet`/`#egs-bg` (titel 'Session'; in het kalenderscript, `egsOpen(d)`, `window.__egsOpen`; staat in de :not()-uitsluitingen van het uitlegblad): datum (max vandaag; wijzigen laadt die dag) + per groep in workoutvolgorde (Warm-up, spiergroepen, eGym, Cardio; kop `.ebt-h.egs-h` = `.grp-t`) de ACTIEVE oefeningen van de ACTIEVE programma's (`window.__p53active()` in het groepsscript: unie van Open Gym `cfg[g]`, Home `cfg.home`, eGym `cfg.eg0`+`g10`, Cardio `g8`, volgens `__p53progs()`), plus wat die dag al gelogd is ('Logged'). Rij `.egs-row`: rond vinkje `.egs-ck` (accent), naam, waardeveld(en) `.egs-v` met eenheid (placeholder van het workoutveld; supersets twee velden op een tweede regel, `.two`; eGym geen veld). Voorgevuld met de waarde van die dag, anders de laatste meting; typen vinkt aan; uitgevinkt = velden 45%. Save: aangevinkt zonder meting → `window.__progAdd(k,d,v)` (= `progPut`, id `k@d@m`) of bij eGym `__progMark`; bestaande meting met andere waarde → `__progSetVals` (laatste meting van die dag); uitgevinkt met metingen → `__progDelIds`; leeg veld bij aangevinkte rij = `.need` + melding. Kalender springt naar die dag. Warm-up blijft enkel in de dagenlijst zichtbaar (telt nergens mee).
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
- Het invulveld toont de laatste waarde uit de grafiek (`syncFromChart`, bij laden, na de log-snapshot, bij `p53-prog` en `p53-checks`),
  tenzij je zelf iets typte dat nog niet bevestigd is. 'Bevestigd' = `local[key].c` (gezet door `progRecord` via `window.__fieldConfirm` en door `syncFromChart`); veld ≠ c = zelf getypt (`pendingTyped`). Zonder c (oude data) valt het terug op `at` > tijd laatste meting. (QA 11 okt: de oude tijdsregel blokkeerde het veld na wissen/bewerken van een meting, want het logboek kreeg vaak een latere tijd dan de meting.) Typen wordt pas een
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

## Opruimen
- Metingen (`prog`) van oefeningen die niet meer in de app staan (geen element met die `data-note`) worden bij elke serversnapshot gewist (op vraag van Tom, 11 okt; ze telden mee in de History-totalen maar stonden in geen enkele lijst). Kopie van wat gewist werd: localStorage `p53-orphans` (max 1000). Een oefening verwijderen = haar metingen verdwijnen dus ook; wil je ze bewaren, laat de rij dan staan met `ex-off`.

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
- Notitieknop `#noteJump` (op vraag van Tom, 14 okt; vervangt de knop in `.tools-row`/`#wdGo`, die er niet meer in staat): zwevende ronde knop
  (`.note-jump.note-float.glass`, 48 px, ≤ 350 px 42 px, glas zoals de navbar, Material Symbols 'sticky_note_2' 24 px in accent) RECHTS van de
  Start/End workout-pil `#woEnd`, zelfde hoogte; enkel op Workout (`body[data-view="workout"]`) en enkel als `#sessNote` iets bevat. Dan krijgt body
  `has-note` en schuift de pil 58 px naar links. Tik = zacht naar de notitie scrollen. Zichtbaarheid volgt input/change + elke 0,7 s
  (waarde kan uit de database komen zonder input-event).
- Notitie enkel nog onderaan Workout (`#sessNote`; op vraag van Tom, 14 okt): de Diet-notitie (`#dietNote` + kop) staat `hidden`
  (inhoud `dieet-notitie` blijft bewaard). `.note-head[hidden]`/`textarea.sess-note[hidden]` nodig, anders overschrijft `display` het attribuut.
- Notitieknop `#noteJump.note-float` (zwevend naast de Start/End-pil) volgt de kleuren van die pil (op vraag van Tom, 14 okt): vóór de workout terracotta-verloop met icoon `--paper` (`body:has(#woEnd.is-start)`), tijdens de workout `--ink` met icoon in accent; geen `.glass` meer, geen rand, zelfde schaduw.
- START/END WORKOUT (op vraag van Tom, 10 okt): de zwevende pil rechtsonder (`#woEnd`) is er altijd. Vóór de workout = 'Start workout' (klasse `.is-start`,
  play-icoon, terracotta-verloop zoals de actieve navbar-knop, enkel zichtbaar op Workout); tik = timer start (`woRun(true)`) en de pagina scrolt zacht naar boven (op vraag van Tom, 12 okt; geen sprong naar een groep, geen tabwissel).
  Tijdens de workout = 'End workout' + tijd (donker, op elke pagina), zelfde End-logica als vroeger; End zonder vinkjes → terug naar Start.
  Een vinkje zetten start de workout ook en schakelt de knop om (`paintWoBtns`, aangeroepen vanuit `paintChecks`). Body heeft nu altijd `wo-on` (ruimte onderaan).
- Workout-blok (op vraag van Tom, 9 okt, naar een voorbeeld met een navbar + balk eronder): `#wtabs` (klasse `.wtabs wdock`) = de tabs (`.wd-tabs`,
  role=tablist, eigen witte pil met afgeronde onderkant) + daaronder een balk `.wd-go` in één afgerond, plakkend blok. Vóór de start: balk in
  accentkleur (verloop) met 'Start workout' — WEG (op vraag van Tom, 9 okt): geen startknop meer, de timer start bij het eerste vinkje en de balk `#wdGo` (met End + notitieknop `#noteJump`) is ALTIJD `hidden`: End workout staat (op vraag van Tom, 9 okt) weer altijd als zwevende pil `#woEnd` rechtsonder, ook op Workout; de notitieknop is dus niet zichtbaar. `startTab()` bestaat nog maar wordt niet meer aangeroepen. Tijdens een workout: balk in `--ink` met
  'End workout' + tijd (vroeger 'Stop workout', op vraag van Tom terug naar End; startknop heet 'Start new workout' met play-icoon 21 px, op vraag van Tom; stop 19 px, op vraag van Tom groter; `#woStop`, `#woStopT`; klikt `#woEnd` aan, dus zelfde logica) en het blok krijgt klasse `on`. De notitieknop
  `#noteJump` staat rechts in de balk (`.wd-note`, 38 px, icoon Material Symbols 'sticky_note_2' (vroeger sd_card_alert) outlined FILL 0 · wght 400 · GRAD 0 · opsz 24 (SVG van fonts.gstatic.com), 24 px, op vraag van Tom). De oude `.tools-row` is `hidden` (enkel nog de verborgen dropdown erin), dus de
  tabs staan nu even hoog als `#stabs` op Statistics (115 px op 375 px). De zwevende pil heet ook 'End workout' (confirm 'End workout?')
  en staat op elke pagina, ook op Workout (9 okt).
- Shoulders (10 okt): video's `shrug`, `frontraise`, `cablelateral`; Arnold Press verwijderd (zelfde als Seated Dumbbell Shoulder Press; op vraag van Tom). Ook weg (geen video): Seated Rear Delt Raise, Standing Barbell Overhead Press, Barbell/Dumbbell Upright Row, Handstand Push-Ups, Band Lateral Raise, Cable/Band External Rotation.
- Core (10 okt): video's `crunches`, `cablecrunch`, `crunch` (Crunch Machine), `bicycle`, `carry` (Farmer's Carry), `kneeraise` (captain's chair), `woodchop` (hoog→laag), `superman`, `hangingraise`, `russiantwist`; nieuw (standaard uit): Cable Reverse Woodchop (`x7-reverse-woodchop`, `revwoodchop`, kg), Decline Crunch (`x7-decline-crunch`, `declinecrunch`, reps). Plank + Side Plank (`x7-plank-combo`, `plankcombo`, sec, MUSCLES = som van Plank + Side Plank {buik:1.5,schuin:1.25} zodat hij telt als beide samen (op vraag van Tom, 12 okt; hoofdspier-checks zijn daarom `>=1` i.p.v. `===1`), standaard uit, ook in `HOME`) 10 okt verwijderd, 12 okt terug (op vraag van Tom); uitlegblad speelt de video's `plank` en `sideplank` NA elkaar af in één kader (`SEQV`, klasse `.sheet-seq`: tweede video absoluut erover, wissel op `ended`, geen `loop`, telkens één keer en dan de volgende). Pallof Press: video `pallof`. Ook weg (geen video): Ab Wheel Rollout, Lying Leg Raise, Reverse Crunch, Sit-Ups, V-Up, Mountain Climbers, Flutter Kicks, Dumbbell Side Bend.
- Arms (10 okt): video's `dipmachine`, `benchdips`, `diamond`, `wristcurl`, `barbellcurl`, `preacher`, `dbhammer`, `spidercurl` (Gym visual 'Prone Incline Curl'), `concentration`, `kickbacktri`, `dbcurl`; nieuw (standaard uit): Preacher Curl Machine (`x8-preacher-machine`, `preachermachine`), Wrist Roller (`x8-wrist-roller`, `wristroller`), Assisted Triceps Dip Machine (`x8-assisted-tri-dip`, `assistedtridip`, kg = hulpgewicht), Triceps Dips (`x8-triceps-dips`, `tricepsdips`, reps); triceps-rijen hebben `data-og="g9"` (bepaalt tussenkop Triceps). Supersets Reverse-Grip Pushdown + Reverse Curl en Single-Arm Pushdown + Single-Arm Curl verwijderd. Ook weg (geen video): EZ-Bar Curl, Incline Dumbbell Curl, Reverse Barbell Curl, Dumbbell Overhead Triceps Extension, Triceps Extension Machine, EZ-Bar Skull Crusher, Close-Grip Bench Press; en uit de warm-up Torso Rotation (de `tr`-migratie kan de sleutel nog in cfg.g0 zetten: onschadelijk). Supersets tonen TWEE video's onder elkaar: `SSV` (ss1 = ohext + cablecurl, ss2 = pushdown + ropehammer, ss3 = barpushdown + cablecurl), klasse `.sheet-ss`.
- Uit Back verwijderd (geen Gym visual-video; op vraag van Tom, 10 okt): Single-Arm Cable Row, High Row Machine, Chest-Supported T-Bar Row, T-Bar Row, Bent-Over Dumbbell Row, Ring/TRX Row, Close-Grip Lat Pulldown (= V-Bar), Underhand Pulldown, Single-Arm Lat Pulldown, Cable Rear Delt Fly, Chin-Ups, Barbell Shrug, Dumbbell Pullover, Scapular Pull-Ups. Chest-Supported Row bewust behouden (rugvriendelijk); video `csrow` (Gym visual 'Dumbbell Incline Row').
- Uit Hamstrings/Glutes/Calves verwijderd (geen Gym visual-video; op vraag van Tom, 10 okt): Hip Abduction/Adduction Machine, Cable/Band Hip Adduction, Seated Calf Raise Machine, Single-Leg Dumbbell Calf Raise, Barbell Deadlift, Sumo Deadlift, Good Morning, Nordic Hamstring Curl, Single-Leg Glute Bridge, Reverse Hyperextension, Cable Glute Kickback, Stability Ball Leg Curl (rijen + POP.g3).
- Uit Chest verwijderd (geen Gym visual-video; op vraag van Tom, 10 okt): Low-to-High Cable Fly, Plyo Push-Ups, Dumbbell Floor Press, Decline Dumbbell Press (rijen + POP.g2).
- Uit Quads verwijderd (geen video; op vraag van Tom, 10 okt): Hack Squat Machine, Barbell Front Squat, Pistol Squat, Sissy Squat, Bodyweight Split Squat (rijen + POP.g1; MUSCLES/RISK/NAMES blijven voor oude data).
- Uit de warm-up verwijderd (op vraag van Tom, 10 okt): World’s Greatest Stretch, Cat-Cow Stretch, Hip Circles, Inchworm, Arm Circles (rijen + POP.g0; LET OP bij bewerken van de POP-regel: `.split(' ')` heeft een spatie, nooit globaal " '" vervangen; oude sleutels in cfg worden genegeerd; NAMES/EX/VID-restjes onschadelijk).
- STATISTICS-TABS PLAKKEN WEER (op vraag van Tom, 12 okt, later die avond): `#stabs.wtabs{position:sticky;top:safe-area+8px}` en `#tabShade.on{display:block}`; het `#tabShade`-script kijkt enkel naar tabs met `position:sticky`, dus de Workout-tabs (`#wtabs`) scrollen nog altijd mee. Wat hieronder staat geldt dus enkel nog voor Workout.
- TABS PLAKKEN NIET MEER (op vraag van Tom, 12 okt): `.wtabs` (Workout `#wtabs` én Statistics `#stabs`) is `position:relative;top:auto` en scrolt mee met de pagina; naar boven = tik op het actieve navbar-item. `#tabShade` blijft in de DOM maar is altijd `display:none`; `window.__wtabsH()` geeft 0. De scroll-luisteraar zet nog `.stuck` (onschadelijk), `toList`/`__smoothTop`/`keep` bestaan nog maar doen in de praktijk niets meer. Wat hieronder over plakken staat, is de oude werking. Niet terugzetten zonder vraag.
- (oud) Plakkende tabs (Workout `#wtabs`, Statistics `#stabs`): achter de geplakte tabs ligt `#tabShade` (fixed, volle breedte, `--paper`, z-index 44, zachte schaduw onderaan), hoogte = onderkant tabs + 8 px; script onderaan (scroll/resize/MutationObserver op body). De oude papierring (box-shadow op `.wtabs.stuck`) is weg: op iOS scheen de inhoud met de systeem-blur erdoor (op vraag van Tom, 10 okt).
- KLEURTEST ACTIEF (op vraag van Tom, 10 okt): actieve tab bovenaan (Workout `#wtabs` en Statistics `#stabs`, `.wtabs .pill-ind` + `.wtabs button[aria-selected]`) = terracotta-verloop met tekst `--paper` (vroeger beige `--paper-soft` + accentkleur); actieve navbar-knop onderaan (`.gnav-pill>.pill-ind`, `.gnav-i[aria-selected]`) = `--ink` (zwart; in donker licht) met tekst `--paper` (vroeger het verloop). Terugdraaien = die drie regels terug.
- Warm-up bij eGym apart onthouden (op vraag van Tom, 10 okt): zelfde lijst (g0), maar op de eGym-tab leest/schrijft het groepsscript `cfg.eg0` (`isEgW(g)`); zolang `cfg.eg0` niet bestaat = de Open Gym-keuze (`cfg.g0`/DEF). Wisselen van tab → `p53-split` → `apply()`.
- SETTINGS › PROGRAMS (op vraag van Tom, 11 okt; vervangt 'Home-tab voorlopig verborgen' hieronder): sectie boven 'Open the app on', lijst `#stProgs` met 4 rijen (`button[role=checkbox][data-prog]`: Open Gym, eGym, Home, Cardio; rond vinkje rechts in accent). Per toestel in localStorage `p53-progs` (JSON-lijst), `window.__p53progs()` (in het `<head>`-script; standaard full/egym/cardio, Home uit). Minstens één: de laatste aangevinkte krijgt `aria-disabled` en kan niet uit. Wijzigen → event `p53-progs` → `layout()` in het split-script: knoppen buiten de lijst `hidden` (Home-knop staat weer in `.wd-str`); 1 programma = hele `#wtabs` verborgen; Cardio én minstens één krachttab = twee pillen; enkel krachttabs = één pil (geen labels meer, zie GEEN LABELS hieronder). Tabs altijd even breed via `--ns` (aantal krachttabs) in de breedte van `.wd-blk-card`. Staat de huidige tab niet meer in de lijst → eerste zichtbare. 'Open the app on' toont enkel zichtbare programma's (+ Where I left off, nu ook Home); een starttab die niet zichtbaar is valt terug op de eerste zichtbare (ook in het `<head>`-script).
- (vervallen 11 okt) (10 okt, later) Home-tab VOORLOPIG VERBORGEN (op vraag van Tom): knop en Settings-optie weg, een bewaarde 'home' → Open Gym; de Home-logica (SPLIT.home, HOME-lijst, cfg.home) blijft in de code. Naam terug 'Open Gym' (niet 'Gym'). Alle drie de tabs even breed: `.wd-blk-card{width:calc((100% - 36px)/3 + 10px)}` (36 = 14 tussenruimte + 2×(4 padding + 1 rand) + 2 gap… zie berekening: 3 knoppen = W − 36).
- SUBTAB FULL · UPPER · LOWER (op vraag van Tom, 12 okt; variant B, na een teruggedraaide poging met blokkoppen in de lijst): `#wdHalf.wd-half` (Full Body · Upper Body · Lower Body, `data-half` all/upper/lower) staat IN de lijst, na de warm-up: `li.wd-half-li` vlak vóór de g1-kop (op vraag van Tom, 12 okt: opwarmen doe je altijd, daarna kies je en dat bepaalt de rest van de lijst; eerst stond hij onder de tabs, nog eerder in de plakkende `#wtabs` waar hij wegklapte — niet meer doen). `li` padding-top 3.2rem (op vraag van Tom, 12 okt: iets meer dan de 2.4rem tussen twee groepen), de volgende groepskop geeft de ruimte eronder; verborgen via `:has(#wdHalf[hidden])`. De scripts die per groep van kop tot kop lopen, zien hem als gewone rij zonder `.exr` (onschadelijk). Start workout scrolt enkel naar boven (zie START/END), dus geen sprong erover. Stijl = de Front/Back-schakelaar `.bal-seg` op Strength (op vraag van Tom; eerst tekst-tabs, daarna een mini-pil): band `--paper-soft` zonder rand over de volle breedte, maat = Settings › Appearance `.st-seg` (op vraag van Tom, 12 okt): 46 px (padding 3 px, knoppen min. 40 px, 14 px 500 `--muted`), actief `--surface` + accent 600 + zachte schaduw zoals `.st-seg` (donker/blauw `--knob`), geen schuivende pil. Enkel zichtbaar bij Open Gym en Home (`hidden` anders). Keuze per programma in localStorage `fitlog-half` `{full,home}` (standaard all). Filter in `apply()` van het split-script: `HALF.upper` = g0,g2,g4,g5,g7, `HALF.lower` = g0,g1,g3,g6 (Core enkel bij Lower, op vraag van Tom, 12 okt; eerst in beide; los van de oude `SPLIT.upper/lower`); `cur`/`window.__split` blijft full/home. Volgorde van de groepen ongewijzigd (afwisselend). Nummering loopt door over de zichtbare groepen (op vraag van Tom, 12 okt): `apply()` hernummert elke `.grp-n` van een zichtbare kop (geen `split-off`), behalve de warm-up, van 1 af. WARM-UP ZONDER NUMMER (op vraag van Tom, 12 okt): 1 = eerste groep onder de keuze. Full = 1 Quads, 2 Chest, 3 Hamstrings…, 4 Back, 5 Shoulders, 6 Core, 7 Arms; Upper = 1 Chest, 2 Back, 3 Shoulders, 4 Arms; Lower = 1 Quads, 2 Hamstrings…, 3 Core; eGym = 1 eGym. Warm-up-kop: `.grp-n` verborgen en `.grp-t` 14 px lager, zoals de Cardio-kop (titel, potlood en lijn exact even hoog als Cardio: gemeten). De vaste nummering hieronder is de oude.
- SETTINGS › BODY SPLIT (op vraag van Tom, 14 okt): sectie `#stHalfSec` na Warm-up, één vinkrij `#stHalfBtn` 'Full · Upper · Lower' (stijl Programs), standaard AAN; enkel zichtbaar als Gym of Home aan staat. Uit = localStorage `p53-half-on`='0' (aan = sleutel weg), `window.__p53halfOn()` in het `<head>`-script; het split-script (`hon()`) verbergt dan `#wdHalf` en toont de volledige lijst (`hcur()`='all'); de bewaarde keuze in `fitlog-half` blijft en komt terug bij weer aanzetten. Synct mee via `cfg/prefs` (`half`, boolean).
- SETTINGS › WORKOUT TABS (op vraag van Tom, 14 okt): sectie `#stTabsSec` na Programs, `.st-seg` Grouped · Single bar (`button[data-tabs]`). Grouped = de drie pillen met labels (standaard). Single bar = localStorage `p53-tabs`='bar', `window.__p53tabsBar()` in het `<head>`-script; `layout()` zet `.flat` op `.wd-tabs` (niet bij `.solo`): de `.wd-tabs` wordt zelf de pil (surface, rand, 4 px padding), `.wd-blk`/`.wd-pill` `display:contents`, geen banden, alle tabs even breed. Schuivende pil: `setup(box,sel,on)` in het pill-script; per-pil-indicatoren uit bij `.flat`, één indicator op `.wd-tabs` (`.wd-pill>button[aria-selected]`). Sectie verborgen als er minder dan twee pillen zouden staan. Synct via `cfg/prefs` (`tabs`: 'bar'|'grouped'). Het thema-script selecteert nu `button[data-th]` (niet meer alle `.st-seg button`).
- SETTINGS › MUSCLE GROUP ORDER (op vraag van Tom, 14 okt): sectie `#stOrderSec` na Body split (enkel als Gym of Home aan staat), lijst `#stOrder` (`.st-progs.st-order`) met greep `.gs-drag` links, nummer (Fraunces italic, accent) en groepsnaam (uit `.grp-t`); slepen zoals het keuzeblad, 'Reset to default order' (`#stOrderReset`) enkel bij een eigen volgorde. Opslag localStorage `p53-gorder` (JSON g1–g7, standaard = sleutel weg), `window.__p53gorder()` in het `<head>`-script; synct via `cfg/prefs` (`gorder`). Event `p53-gorder` → script na het split-script verplaatst per groep alle `li[data-grp]` + `li.gx-empty[data-g]` na `li.wd-half-li`, dan `p53-progs` (hernummering in `apply()`). Upper/Lower volgen de gekozen volgorde (filter op de DOM). Statistics blijft in de vaste volgorde. Sleutels en rijvolgorde binnen een groep ongewijzigd.
- GEEN LABELS STRENGTH/CARDIO MEER (op vraag van Tom, 12 okt; vervangt de drie punten hieronder over `.wd-band`): de banden, hun beige `.wd-blk`-achtergrond, de −4 px-overlap, de inklap-animatie bij `.stuck` en de klasse `.solo` zijn weg. De groepering zit enkel nog in de twee pillen met 14 px ertussen. Niet terugzetten zonder vraag.
- (vervallen 12 okt) LABELS ENKEL BOVENAAN (op vraag van Tom, 11 okt): zodra `#wtabs` plakt (`.stuck`, gezet door de scroll-luisteraar in het split-script) klapt `.wd-band` weg (hoogte/padding 0, opacity 0, .25 s) en verliest de pil haar −4 px; `#wtabs.stuck:has(.wd-tabs:not(.solo))` krijgt `margin-bottom:calc(.4rem + 26px)`, zodat de lijst eronder niet verspringt (getest: rijpositie in het document blijft gelijk). `#tabShade` volgt de overgang frame per frame (MutationObserver op de klasse van `#wtabs`, 320 ms).
- LABEL ONDER DE PIL (op vraag van Tom, 11 okt; vervangt 'label erboven' hieronder): `.wd-band` heeft `order:2` (onder de pil, padding-top 11 px), de pil `margin-bottom:-4px` + z-index 1 en valt over de bovenkant van de band; `.wd-tabs{align-items:flex-start}`. Zo staat de pil altijd op dezelfde hoogte als `#stabs` op Statistics (117–171 px op 375 px), met of zonder labels; de lijst eronder schuift 26 px op als de labels er staan.
- TABS IN TWEE PILLEN + HOME (op vraag van Tom, 10 okt, variant B uit een schets): `.wd-tabs` bevat twee `.wd-pill`'s: kracht `.wd-str` (Gym · eGym · Home) en rechts apart `.wd-card` (Cardio), 14 px ertussen (op vraag van Tom; eerst 8); label-band 30 px; het blok staat op zijn gewone plaats (10 okt even hoger gezet zodat de pillen gelijk stonden met Statistics, op vraag van Tom teruggezet); elke pil zit in een `.wd-blk` met erboven een label `.wd-band` ('Strength' / 'Cardio', 10.5 px hoofdletters, `--muted`) op een beige band (`--paper-soft`, geen rand) waar de pil 4 px over valt (op vraag van Tom, 10 okt; schets B, linkse versie); elke pil heeft een eigen schuivende `.pill-ind` (de pil zonder actieve tab toont er geen). 'Open Gym' heet op het scherm overal 'Gym' (tab, Settings, kalender/History-labels); intern blijft het `full`.
  Home (`data-split="home"`, SPLIT.home = g0–g7): eigen keuze per groep in `cfg.home[g]` (start leeg → 'Add exercises'); keuzeblad toont enkel thuisoefeningen (lijst `HOME` in het groepsscript, `window.__p53home`: lichaamsgewicht, halters, bank/stoel, elastiek, springtouw; ook in de warm-up). `isHome(g)` geldt enkel voor g0–g7. Het split-script stuurt `p53-split` bij wissel → groepsscript `apply()`. Metingen zijn per oefening, dus Home telt gewoon mee in Statistics/Progress/kalender (als 'Gym'). Settings › Open the app on kent ook `home`.
- WARM-UP IS GEEN EIGEN TAB MEER (op vraag van Tom, 10 okt): tabs = Open Gym · Cardio · eGym (volgorde op vraag van Tom, 10 okt; ook in Settings › Open the app on). De warm-up (g0) staat bovenaan Open Gym én eGym
  (`SPLIT.full`/`SPLIT.egym` beginnen met g0; niet bij Cardio), met een gewone groepskop 'Warm-up' + potlood (zelfde stijl als 'Quads'); ook de eGym-kop
  is nu een gewone groepskop (Cardio houdt de kleine tussenkop). Niet inklappen als ze af is (bewust, op vraag van Tom). Ook geen doorstrepen meer: een warm-up-oefening afvinken streept de andere niet door en de kop wordt niet 'af' (`paintChecks`, alleen eGym g10 kan nog `grp-done` krijgen). Een bewaarde keuze 'warmup'
  (fitlog-split of p53-start) wordt Open Gym / 'Where I left off'. De oude g0-regels (kop hoogte 0, zwevend potlood, `.first-sub`) zijn weg uit de CSS;
  wat hieronder over de Warm-up-tab staat, is de oude werking.
- Nummering van de groepskoppen (op vraag van Tom, 10 okt; enkel de getallen op het scherm, sleutels g0–g10 blijven): Open Gym = 1 Warm-up, 2 Quads,
  3 Chest, 4 Hamstrings…, 5 Back, 6 Shoulders, 7 Core, 8 Arms; eGym = 1 Warm-up, 2 eGym; Cardio = geen nummer (op vraag van Tom, 10 okt; enkel de titel). Alle koppen hebben dezelfde stijl (getal +
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
  foto's walking = loopband), Walk-Jog (`c-walkjog`; heette 'Walk-Jog Outdoors', ingekort op vraag van Tom, 10 okt: staat al onder Outdoor), Jogging (`c-jog`, 'Easy pace · 20–45 min · impact', foto's = die van walk-jog; op vraag van Tom; bestaande cardiokeuzes krijgen het erbij via `migrate()`, vlag `jg`), Treadmill Walk-Jog (`c-treadjog`), Rower (`c-row`), Elliptical (`c-elliptical`),
  Cycling (`c-bike`), Padel (`c-padel`, 'Intervals · 60–90 min', geen foto's: het uitlegblad toont dan enkel tekst + tip);
  OUTDOOR / INDOOR (op vraag van Tom, 10 okt): tussenkoppen in g8 via `SUBS.g8` + `cat` (Outdoor = c-walk, c-walkjog, c-jog, c-bike, c-padel (Padel naar Outdoor op vraag van Tom, 10 okt); de rest Indoor). Walking (`c-walk`) = buiten, Cycling (`c-bike`) = buiten (geen beeld meer, enkel tekst; hun loopband-/hometrainerbeelden gingen naar de
  nieuwe binnenvarianten Treadmill Walk (`c-treadwalk`, EX `ctreadwalk`) en Exercise Bike (`c-xbike`, EX `cxbike`), beide standaard uit; GIF's gekopieerd).
  Oude metingen van c-walk/c-bike blijven onder Walking/Cycling staan.
  Outdoor-cardio (Walking, Walk-Jog Outdoors, Jogging, Cycling, Padel) toont GEEN beelden in het uitlegblad, enkel tekst (op vraag van Tom, 10 okt, bevestigd; geen VID/ANIM/IMG voor cwalk, cwalkjog, cjog, cbike, cpadel). Indoor-cardio: Gym visual-video's die Tom aanleverde: `stepmill` (Stairmaster `cstairs` + warm-up Stair Climber `stairs`), `recumbent` (`crecumbent`), `spinbike` (Exercise Bike `cxbike` + warm-up Stationary Bike `bike`), `treadrun` (Treadmill Walk-Jog `ctreadjog`, Treadmill Walk `ctreadwalk`, Incline Walk `cincline`, warm-up Incline Treadmill Walk `treadmill`; op vraag van Tom).
  uit: Stairmaster (`c-stairs`), Recumbent Bike (`c-recumbent`). Air Bike (`c-airbike`, EX `cairbike`, indoor, standaard uit; Gym visual-video `airbike`; op vraag van Tom, 10 okt). SkiErg Machine (`c-skierg`, EX `cskierg`, indoor, standaard uit, video = die van warm-up SkiErg; eigen naam want namen moeten uniek zijn t.o.v. de warm-up; op vraag van Tom, 10 okt). Incline Walk (`c-incline`) is samengevoegd met Treadmill Walk (`c-treadwalk`, uitleg 'flat or on an incline'; op vraag van Tom, 10 okt): rij weg, metingen/hist via `MIGK`, tellers (counts, N×) worden in de counts-snapshot opgeteld, keuze via `migrate()` vlag `iw`. Labels '· impact' / '· outdoors' via `.exr-eqp`.
  Eigen namen (uniek t.o.v. de warm-up!) met EX-uitleg (zone 2) en foto's (`cwalk`… in NAMES/EX/IMG; nieuw: trail, jogtread, recumbent).
  Werkt als kracht: afvinken (getal verplicht) = meting per workout, oog-knop = uitleg + grafiek + edit, timer/End, N×.
  Telt NIET in Coverage (spieren: `events()` slaat `w0-` en `c-` over); de kalender telt cardio als minuten i.p.v. sets: '17 sets + 20 min cardio' (plus als er
  kracht én cardio was; `amount()`), per dag en per maand. Een cardio-oefening streept de andere cardio-rijen niet door (je mag combineren). End workout met alleen cardio
  blijft op Workout (geen sprong naar Coverage), wel vuurwerk. De pagina Cardio onder More blijft als uitleg.
- eGym ZONDER GEWICHT EN METHODE (op vraag van Tom, 11 okt; vervangt eGym-METHODE hieronder en de kg-velden): bij eGym telt enkel de krachttest. Elke eGym-rij = vinkje (spier getraind) + rechts read-only de laatste krachttest (`button.eg-last[data-eg]`, '85 kg' met eronder '3 Oct' of 'Oct 2024' als het niet dit jaar is, 'No test' als er geen is; kolom 3, of 4 met i-knop); tik = `__etestEdit(k,naam)` (testblad van dat toestel). Getekend in het etest-script, ververst bij `p53-prog`. Het kg-veld bestaat nog als `<input type="hidden" class="note exr-in" data-note="eg-…">` (sleutels, undo, Reset data en `machines()` hangen eraan). Afvinken vraagt bij een verborgen veld geen getal; `progRecord` bewaart dan een markering `{k,d,t,w,v:0,x:1}` (telt voor kalender, maandoverzicht, sets, spieren en 'N×'), `pidx`/`__progPts` slaan `x` over. Kop: geen 'Method'/Eccentric·Regular meer; de krachttest-knop `.eg-tbtn` staat links van het potlood. Uitlegblad bij eGym: enkel het blok 'Strength tests' (geen grafieken van trainingsgewichten). Kalender: eGym-rijen zonder gewicht en methode; veeg rechts = Edit met enkel de datum ('Move this exercise to another day.', `fields:[]`, de markering verhuist via `__progSetVals` met haar eigen v), links = Delete (op vraag van Tom, 11 okt; vroeger geen Edit). Oude kg-metingen met `m` blijven in de data. Code rond `__egMethod`/`peSh.__m` is voor eGym onbereikbaar geworden maar niet verwijderd. Caps: 'Enter the weight the eGym screen shows.' weg.
- (vervallen 11 okt) eGym-METHODE (op vraag van Tom, 10 okt): in de eGym-kop (g10) onder de titel 'Method' + schakelaar Eccentric · Regular (`.eg-meth`, `.st-seg`), voor de
  hele sessie; per toestel in localStorage `fitlog-egm` (standaard Eccentric), `window.__egMethod()`. Elke eGym-meting (`progRecord` en 'Add' via `progPut`)
  krijgt `m:'ecc'|'reg'`; oude eGym-metingen zonder `m` = Eccentric (alles tot 10 okt was excentrisch). Het uitlegblad toont per methode een eigen blok
  'Your progress · Eccentric' / '· Regular' met eigen grafiek. Het Edit-venster (veeg naar rechts, kalender én edit-blad) toont bij eGym ook 'Method' (`p53EditVals({method})` → `.method`;
  `__progSetVals(ids,vals,d,m)` zet `m`); het edit-blad toont achter de datum ' · Eccentric'/' · Regular'. Het 'Add'-formulier in het edit-blad heeft bij eGym bovenaan dezelfde schakelaar (`.pe-meth`, start op de sessiemethode, keuze in `peSh.__m` → `progPut(k,d,v,m)`). Het getal dat Tom invult = het kg-getal uit het eGym-overzicht (basis-/duwgewicht). Kalender (dagenlijst): eGym-rijen tonen de methode achter de naam ('eGym Leg Press · Eccentric'; op vraag van Tom, 11 okt). Invulvelden eGym volgen de methode (op vraag van Tom, 11 okt): `syncFromChart` toont de laatste meting van de GEKOZEN methode (`__progPts(note+'#'+methode)`), leeg als die methode op dat toestel nog niet gemeten is; wissel stuurt event `p53-egm` → `syncFromChart`. Niet aangeraakt: zelf getypt en nog niet afgevinkt (`at` > laatste meting), of rij afgevinkt in de lopende workout.
- eGym-KRACHTTEST (op vraag van Tom, 11 okt): per toestel een reeks 'Strength tests' (resultaat; in Strength als 'eGym … · Strength tests' uit de eGym-app, kg), collectie `etest` (id `<veld>@<jjjj-mm-dd>`, `{k,d,t,v}`, t = 12u), cache localStorage `fitlog-etest`; `window.__etestPts(k)`, `__etestPut(k,d,v,oudId)`, `__etestDel(id)`; `__progPts('eg-…#test')` geeft die reeks. Invullen in het uitlegblad (oog-knop) van een eGym-toestel: blok 'Strength tests' bovenaan de progressie (`testBlock`; potlood `.ip-tedit` zoals bij de andere grafieken → eigen bewerkblad `#et-sheet`/`#et-bg` (klassen `.sheet.pe-sheet.top`, `window.__etestEdit(k,naam)`): bovenaan datum + resultaat + Add, daaronder alle testen met veeg rechts = Edit, links = Delete; op vraag van Tom, 11 okt; staat in de :not()-uitsluitingen van het uitlegblad); in het blok een grafiek zoals de andere progressiegrafieken maar volle lijn vanaf de eerste test, bolletje op elke test (op vraag van Tom, 11 okt)). Strength (lijst + figuur, `progRows`) gebruikt voor eGym ENKEL de krachttest (niet meer de Eccentric/Regular-trainingsgewichten), en daar telt de EERSTE test wél mee (geen leereffect; `chainPct` en de lijst slaan `slice(1)` over bij `#test`). Balance, N×, kalender en History blijven de sessies (metingen in `prog`) gebruiken; de trainingsgewichten per methode blijven zichtbaar in het uitlegblad. In back-up en Reset data zit `etest` mee. De snelknop in de eGym-rijen is weer weg (op vraag van Tom, 11 okt): testen invullen via het potlood in het uitlegblad.
- STRENGTH-PERIODE + HELE LICHAAM (op vraag van Tom, 11 okt; vervangt de tekstregel `.pr-range`): bovenaan Strength tekst-tabs **3 Months · 1 Year · All** (`.stats-per.str-per`, knoppen `data-r` = 3m/1y/all, NIET `data-d`: de Balance-code selecteert globaal `.stats-per button[data-d]`) + potlood `#prEdit` (`.pr-edit.per-edit`, accent enkel bij eigen periode). Keuze in localStorage `fitlog-str-per` (standaard all; oude eigen periode in `fitlog-prog-range` → 'range'). 3M/1Y = vandaag − 3 maanden / 1 jaar tot de laatste meting; uitgegrijsd zolang de data niet verder teruggaat (1Y als de oudste meting > 3 maanden terug ligt, All > 1 jaar); bewaarde keuze die uit staat → langste beschikbare (`strEff`), zonder te overschrijven. 'Show all data' in het venster = All. `__progRange()` geeft ook `per`. Daaronder (boven de figuur, in de normale flow: over de figuur botste het met het hoofd; geen lijn eronder) `.pr-lab`: links 'WHOLE BODY' + groot % (`#prBody`, Fraunces 26 accent), rechts op dezelfde regel de periode (`#prRange`, 12.5 px, nowrap; ≤ 370 px kleinere letterspatiëring en 23 px zodat het past). Figuur 1.6rem eronder. Hele lichaam = meetkundig gemiddelde van de groeps-% (elke groep met een rij in de lijst weegt even zwaar), berekend in de render van de Strength-lijst.
- NEGATIEF = IETS RODER ORANJE (op vraag van Tom, 11 okt): token `--neg` naast `--accent` (licht `#B8261E`, donker/blauw `#F25C4A`; 11 okt nog iets duidelijker rood gemaakt, op vraag van Tom; eerst #A3302A / #E46F5C). Geldt waar Strength oranje toont: groeps-% in de lijst (`b.down`), Whole body (`#prBody b.down`) en de %-labels in de figuur (`.bal-pct.has.neg`). Tussenkop- en oefening-% blijven zoals ze waren.
- PERIODE IS STRIKT (op vraag van Tom, 11 okt; vervangt 'vertrek mag vóór de periode liggen' en de grens van 120 dagen `BASEGAP`, die nog als ongebruikte variabele bestaat): in `chainPct` en de Strength-lijst telt een stap enkel als begin ÉN einde in de periode liggen; basis per oefening = eerste meting in de periode (bij gewone oefeningen nooit de allereerste meting ooit, bij de eGym-krachttest wel). 3 Months = enkel wat er die 3 maanden bijkwam; een test van 2024 telt enkel onder All (of een eigen periode die ze bevat). Waar elders in deze notities 'basis = laatste meting vóór de periode' staat, is dat de oude werking.
- eGym-KRACHTTEST ALLE TOESTELLEN TEGELIJK (op vraag van Tom, 11 okt; voor zijn testen van 2 jaar terug én nieuwe testen): in de eGym-kop een ronde iconknop links van de Eccentric/Regular-schakelaar (`.eg-tbtn#egTestBtn`, 36 px zoals de andere icoonknoppen, Material Symbols 'add_chart' inline SVG 20 px, `--muted`; op vraag van Tom, 11 okt; eerst een eigen rij 'Strength test' + knop 'Add results'; schakelaar 200 px) → blad `#ebt-sheet`/`#ebt-bg` (`window.__etestBulk()`, in het etest-script; staat in de :not()-uitsluitingen van het uitlegblad). Datum bovenaan (max vandaag, geen min), per toestel een veld (actieve toestellen in circuitvolgorde, dan uitgezette met testen, de rest achter 'Show all machines'), onder de naam 'Previous: x kg · datum'. Datum wijzigen = velden tonen wat er die dag staat; Save bewaart/overschrijft (`__etestPut`), een leeggemaakt veld dat een waarde had wordt gewist. Onderaan 'Saved tests' = alle testdagen (tik = die dag laden). Testgrafiek in het uitlegblad: altijd volle lijn (een stippellijn bij een pauze > 120 dagen is weer weg: leek op 'telt niet mee'; op vraag van Tom, 11 okt).
- Schrijfwijze op het scherm: 'eGym' (op vraag van Tom, 9 okt; tab, namen 'eGym …' in rijen én NAMES-sleutels, uitleg, kalender 'eGym'/'Open Gym + eGym'). Intern blijft `egym`/`g10`/`eg-…`.
- Groep 10 'EGYM' (Toms EGYM-circuit in de gym; tussen g7 en g8 in `#s-d3`, kop zonder nummer, potlood/keuzeblad):
  alleen zichtbaar bij de keuze EGYM (`data-split="egym"`). Rijen `eg-…` met invulveld kg en schermnaam 'EGYM …' (zoals in de EGYM-app; uniek in NAMES).
  Standaard aan (Toms circuit, volgorde in POP = volgorde van het circuit): Rotary Torso (2 × 6), Lat Pulldown, Leg Press, Abdominal Crunch,
  Seated Row, Leg Extension, Triceps Press, Back Extension, Chest Press (2 × 15); uit: Leg Curl, Shoulder Press, Butterfly, Butterfly Reverse,
  Biceps Curl, Hip Abduction, Hip Adduction, Glute, Squat, Hip Thrust, Calf Raise. Elk met MUSCLES (telt dus in Coverage), eigen EX-uitleg (`eg…`, + 'Enter the weight the
  EGYM screen shows.') en beelden van het vergelijkbare toestel via alias (VID/ANIM/IMG van bv. widepulldown, legpress, chestmachine; script bij `SSL`);
  Eigen EGYM-beelden van Tom (`EGI`, `img/egym/<naam>.jpg`, 640 px op wit, één beeld met bewegingspijl, bron 'Image: EGYM', klasse `.sheet-eg`)
  winnen van video/animatie/foto's; voor alle toestellen (10 okt: ook Butterfly `fly`, Butterfly Reverse `revfly`, Biceps Curl `curl`, Squat `squat`). Nieuw (10 okt, standaard uit, beeld van Tom): eGym Hip Thrust (`eg-hip-thrust`, EX `eghipthrust`, bil/ham) en eGym Calf Raise (`eg-calf`, EX `egcalf`, kuit). Circuit-logica (`paintChecks`): niets doorstrepen, kop pas af als alle actieve oefeningen gedaan zijn.
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
  (Arm Circles was nog een MuscleWiki-video; de oefening is weg.) Lijst in `VID` (spatielijst EX-sleutels; `VID.cell` = elliptical,
  `VID.legcurl` = seatedlegcurl; ook Band Pull-Aparts `pullapart`, Dead Hang `hang` , Bodyweight Squats `squat` , Rowing Machine `rowing` = ook cardio Rower via `VID.crow`, Side Plank `sideplank`, SkiErg `skierg`, Glute Bridge `bridge`, Single-Leg RDL `slrdl`, Cable Rope Hammer Curl `ropehammer` en Chest Fly Machine `fly` (Gym visual 'Lever Pec Deck Fly', 10 okt; ook eGym Butterfly via alias `VID.egfly`); cardio: `stepmill`, `recumbent`, `spinbike`, `treadrun`, `airbike`; warm-up Jump Rope `jumprope` (Gym visual 'Double Under'); quads (10 okt): `smithsquat`, `bwlunge`, `legpress`, `legext`, `backsquat`, `jumpsquat` (Gym visual 'Frog Jump'), `walklunge`, `stepup`, plus nieuwe oefeningen (standaard uit, kg) Dumbbell Split Squat (`x1-db-split-squat`, EX `dbsplitsquat`) en Dumbbell Squat (`x1-db-squat`, EX `dbsquat`); chest (10 okt): `dbbench`, `dips`, `declinepushup`, `dbfly`, `dbpress` (Incline Dumbbell Press), `crossover`, `inclinemachine`, `inclinepushup`, `benchpress`, `inclinebench`, `smithbench`, `smithincline`, hamstrings/glutes/calves (10 okt): `donkey`, `barbellrdl`, `dbcalf`, `kbswing`, `standingcalf`, `legpresscalf`, `hipthrust` (Gym visual 'Glute Bridge from Bench'), `lyinglegcurl`, `pullthrough`, `rdl`, plus nieuwe oefeningen (standaard uit, kg): Hip Thrust Machine (`x3-hip-thrust-machine`, `hipthrustmachine`), Smith Machine Romanian Deadlift (`x3-smith-rdl`, `smithrdl`), Single-Leg Calf Raise Machine (`x3-sl-calf-machine`, `slcalfmachine`), Standing Glute Kickback Machine (`x3-standing-kickback`, `standkick`); back (10 okt): `onearmrow`, `invertedrow`, `barbellrow`, `pullups`, `pullup` ((Assisted) Pull-Ups, toestel), `straightarm`, plus nieuw Weighted Pull-Ups (`x6-weighted-pull-ups`, `weightedpullup`, kg = extra gewicht); plus nieuw Assisted Dip Machine (`x2-assisted-dip`, EX `assisteddip`, kg = hulpgewicht, lager = sterker; standaard uit) (aliassen `VID.c…`, zie Cardio)). Doel (Tom, 10 okt): overal dezelfde stijl Gym visual-video met volle animatie. Encoderen: `ffmpeg -nostdin` (anders eet ffmpeg de stdin van een lus op), `-an`, scale 640, crf 26.
  `VSQ` (vierkante video op wit) bestaat nog maar is leeg. Vervang je een bestaande video, verhoog dan `VIDV` (cache-buster `?v=` op video + poster, anders toont iOS de oude). Bird Dog: video; de getekende `player`-animatie blijft als terugval.
  Padel staat er zonder beeld. Torso Rotation (`w0-torso-rotation`, g0, reps) is op vraag van Tom terug, standaard aan; wie al een
  opwarmingskeuze had krijgt ze erbij via `migrate()` (vlag `tr` in cfg/groups); foto's `img/rotation-0/1.jpg` = afbeelding van Tom (handen op de heupen), in twee
  gesplitst en op wit 3:2 gezet.
- Stretching in de warm-up (op vraag van Tom, 14 okt): rij `w0-stretching` (g0 › Mobility & activation, '5–10 min · calm, no bouncing', min, standaard UIT (`ex-off`; op vraag van Tom, 14 okt), POP.g0 na dead hang, in `HOME`, NAMES 'Stretching' → EX `stretch` (enkel tekst). Vlag `st` zette hem kort aan; `st2` haalt hem eenmalig weer uit `cfg.g0`/`cfg.eg0` (beide ook in `fresh()`).
- Dead Bug en Bird Dog ook in de warm-up (op vraag van Tom, 11 okt): eigen rijen `w0-dead-bug` ('1 set · 8 per side · slow') en `w0-bird-dog` ('1 set · 8 per side · 3 sec hold'), g0 › Mobility & activation, standaard uit (`ex-off`), in POP.g0 na glute bridge en in `HOME`. Zelfde schermnaam als de core-rijen (`x7-dead-bug`, `d3-bird-dog`), dus uitleg/video via `NAMES`; aparte sleutels = aparte teller, de core-rijen blijven ongewijzigd.
- BACK HERSCHIKT (op vraag van Tom, 11 okt; hij doet 1 oefening per groep en wisselt af, dus Back = enkel rows + vertical pulls, strikt afwisselen): Cable Face Pull (`d2-face-pull`, sleutel ongewijzigd, `data-og` blijft g6) staat nu in Shoulders (g5, rij fysiek na de g5-kop, POP.g5 na lateral raise). Dead Hang in de warm-up als eigen rij `w0-dead-hang` ('1 × 15–20 sec · feet supported', sec, standaard aan, na bird dog); `d1-dead-hang` in Back staat standaard uit (rij blijft voor de historiek). `migrate()` vlag `fp`: face pull uit cfg.g4/cfg.home.g4/order.g4 → cfg.g5; vlag `dh`: had je `d1-dead-hang` aan in g4 → weg uit g4, `w0-dead-hang` erbij in cfg.g0 en cfg.eg0. Beide vlaggen ook in `fresh()`.
  Nieuwe oefening: foto's (Free Exercise DB) + zo mogelijk een animatie toevoegen (sleutel in de `ANIM`-lijst + bestand in img/anim).
- KRACHTTOENAME ACHTER N× (op vraag van Tom, 11 okt): in de workoutrij na '· N×' een '· +12%' (`.cnt-p` in `.exr-cnt`, accent; negatief `--neg` met '−'), gezet in `paintCounts` (ververst via `renderStats` bij `p53-prog`, dus ook na een krachttest). Enkel rijen met één kg-veld (geen warm-up g0, cardio g8, supersets). Gewone oefening: tweede meting → laatste (eerste telt niet), dus pas vanaf 3 metingen. eGym: krachttest (`__etestPts`) eerste → laatste, vanaf 2 testen. Altijd over alle data (geen periode), afgerond op hele %. Niet in het keuzeblad.
- Het keuzeblad toont ook het aantal trainingen ('· N×', zoals in de workout). De i-knop is overal dezelfde tint (de klasse
  `.nop` wordt nog gezet door `markProg` maar heeft geen stijl meer).
- Geen herhalingsbereiken meer (op vraag van Tom, 10 okt): elke oefening heeft één doel (10, 12 of 15; samengesteld 10, grotere isolatie 12, kleine spieren 15; warm-up idem één getal; 8 bestaat niet meer, op vraag van Tom → 10). Omzetting: 6–10/8–10/5–8/8–12… → 10, 10–12/10–15/8–15 → 12, 12–15/12–20/15–20/10–20 → 15 (Goblet Squat en Incline DB Press → 10). Tijd blijft een bereik (plank-sec, cardio-min, bird dog-hold). Guide › Intensity herschreven: vast doel, verhogen als alle sets het doel halen met ~2 in reserve. Eigen sets/reps van Tom in cfg/sets blijven voorrang hebben. Nieuwe oefening: één getal, geen bereik.
- Sets & reps per oefening: in het keuzeblad een rond knopje met icoon '123' (Material Symbols, inline SVG 24 px, viewBox bijgesneden tot `120 -840 720 720`, glyph verticaal gecentreerd) (`.gs-set`; standaard lichter, aangepast = gewone tint, zoals de i-knop) opent
  `#set-sheet` (bovenop, klasse `.top`) met stepper Sets (0–10, 0 = geen 'N ×') en tekstveld 'Reps or time', voorbeeld
  'Shows as', Save en 'Reset to default'. Opslag: localStorage `fitlog-sets` + cfg/doc `sets` (`{sleutel:{s,r}}`).
  `applySets` vervangt de eerste tekst van `.exr-s` (origineel in `ORIG`); de statistieken lezen de sets uit die tekst,
  dus een aangepast aantal telt mee voor nieuwe afvinkingen.
- De i-knop toont Material Symbols 'visibility' (oog) als inline SVG `INFO_ICON` (10 okt even 'info_i' geprobeerd, op vraag van Tom terug naar het oog), 20 px,
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
- Single-Leg Calf Raise (op vraag van Tom, 12 okt): nieuwe sleutel `x3-sl-calf-raise` (g3, standaard uit, reps, '3 × 15 per leg', lichaamsgewicht op een trede, handen tegen de muur; halter erbij vanaf 20 makkelijke reps), EX `calfraise` (via NAMES; uitleg herschreven), video van Tom `img/vid/calfraise.mp4` + poster (Gym visual 'Single Leg Calf Raise Off Step'), in VID, POP.g3 na `x3-db-calf-raise`, MUSCLES `{kuit:1}`, ook in `HOME`. De oude rij 'Single-Leg Dumbbell Calf Raise' (`d3-single-leg-calf-raise`, kg) blijft weg; de NAMES-sleutel ervan staat er nog.
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
- WARM-UP ZONDER TUSSENKOP 'CARDIO' (op vraag van Tom, 12 okt): de cardio-opwarmers staan bovenaan zonder kop, daarna enkel 'Mobility & activation'; in de workoutlijst (`sortRows`) én het keuzeblad (`gs-sub-h`). `data-sub='Cardio'` blijft op de rijen (af-logica van de warm-up).
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

