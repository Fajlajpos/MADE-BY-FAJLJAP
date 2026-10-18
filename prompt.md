⚑ Aktuální priorita: základ a design

Teď jde hlavně o design a funkční základ webu. Zbytek zadání ber jako cílový stav, na který má být projekt připravený, ale nemusí být hned hotový.

Teď udělej naplno:

vizuální směr, typografii, barvy, grid, kompozice všech stránek (fáze 1),
všechny stránky webu včetně mobilního zobrazení, animací a 3D atmosféry,
základní strukturu projektu, Docker, databázi a datový model,
tajné přihlášení a admin v základní verzi (přidat / upravit projekt, seznam poptávek),
kontaktní formulář, který ukládá do DB a lokálně posílá e-maily do Mailpitu,
SEO základ a semantické HTML.

Teď jen připrav, nekonfiguruj:

Gmail / Google Workspace, SPF/DKIM/DMARC → kód napiš tak, aby stačilo doplnit údaje do .env. Lokálně vše jde do Mailpitu. Na přístupové údaje se mě neptej.
Fotky, videa, logo, reference, finální texty → dodám později. Použij generativní placeholdery (sekce 3), pracovní wordmark „FAJLAJP“ a vlastní návrhy textů. Nečekej na mě a neblokuj práci kvůli chybějícím materiálům.
Telegram/Discord, rezervace hovoru, kalkulačka, automatické náhledy webů, zpracování videí, historie verzí, PWA, CI/CD, monitoring → zapiš do PLAN.md jako další fáze, připrav datový model a strukturu tak, aby šly přidat bez přepisování, ale neimplementuj je teď.

Všechny chybějící údaje veď v CHECKLIST.md v sekci „Doplní FAJLAJP později“.

0. Jak máš postupovat (čti jako první)
Zapni plánovací mód. Nic nepiš, dokud nemáš hotový plán. Nejdřív si celé zadání přečti, polož mi maximálně 5 doplňujících otázek (jen pokud něco opravdu nejde rozumně odhadnout), a pak vytvoř soubor PLAN.md s architekturou, strukturou složek, datovým modelem, seznamem stránek, rozdělením práce a pořadím kroků.
Rozděl práci mezi agenty (sekce 12). Každý agent dělá jen svou oblast, pracuje proti společným rozhraním (typy, API kontrakty, design tokeny), která definuje Architekt na začátku.
Stav po dokončení: projekt musí jít spustit lokálně (docker compose up -d + npm run dev) na http://localhost:3000, všechny node_modules nainstalované, databáze běží v Dockeru, migrace a seed proběhly, build (npm run build) projde bez chyb.
Pokud tě během práce napadne cokoliv, co v zadání chybí nebo by se hodilo, přidej to a zapiš do IDEAS.md (co, proč, jestli je to hotové).
Na konci vytvoř README.md (spuštění, proměnné prostředí, deploy na VPS, zálohy) a CHECKLIST.md (co je hotové / co čeká na mě — např. fotky, texty, Google přístupy).
Postup ve fázích (nedělej všechno najednou)

Zadání je velké. Neimplementuj všechno naráz — jdi po fázích a každou fázi dotáhni do funkčního stavu, než začneš další. Po každé fázi se zastav, shrň, co je hotové, a počkej na moje potvrzení.

Fáze	Obsah	Konec fáze
0 — Plán	PLAN.md, otázky na mě, datový model, struktura	Schválím plán
1 — Vizuální směr	Navrhni 2–3 odlišné vizuální směry (jen hero sekce + typografie + barvy + jedna ukázka karty projektu), každý jako samostatnou stránku /_design/a, /_design/b…	Vyberu jeden směr
2 — Základ (MVP)	Docker, DB, všechny stránky se strukturou a obsahem, kontaktní formulář + e-maily, tajné přihlášení, admin (poptávky + projekty), SEO základ	Web jde reálně používat
3 — Umění	3D scény, shadery, přechody, animace, kurzor, zvuk, detaily typografie	Web vypadá jako hotové dílo
4 — Navíc	Journal, Lab, kalkulačka, rezervace hovoru, automatické náhledy webů, notifikace, PWA admin, historie verzí	Rozšíření hotová
5 — Produkce	CI/CD, staging, monitoring, zálohy, výkon, přístupnost, bezpečnostní audit, testy	Připraveno na nasazení
Reference
Přikládám moodboard (fotky). Pokud je nevidíš, řiď se popisem v sekci 2.
Weby, které se mi líbí, a co přesně na nich:
[URL 1] — [co se mi líbí, např. typografie / přechody / navigace]
[URL 2] — [...]
[URL 3] — [...]
Reference nekopíruj. Ber z nich principy a výsledek musí být originální.
1. Kdo jsem a co web má dělat
Značka: FAJLAJP. Jsem grafik, webdesigner a designer. Dělám weby, grafiku, vizuální identity, v budoucnu i aplikace.
Já jsem ta značka. Web nemá působit jako agentura ani jako šablona — má působit osobně, jako autorská práce jednoho člověka s vlastním rukopisem.
Cíl webu:
ukázat moje práce (weby, grafiku, branding, později aplikace),
přesvědčit návštěvníka, že jsem opravdový designer a tvůrce, ne „další člověk s šablonou“,
získat poptávky přes kontaktní formulář.
Celý web je umělecké dílo. Návštěvník má mít pocit, že prochází instalaci / galerii, ne firemní prezentaci. Zároveň musí být na první pohled jasné, že dělám weby a digitální produkty.
Jazyk webu: primárně čeština (plná podpora diakritiky ve fontech!), připrav strukturu pro angličtinu (i18n), i když EN texty zatím nebudou.
Logo a značka
[Vyber jednu možnost: „Logo mám, dodám ho jako SVG.“ / „Logo nemám — navrhni typografický wordmark FAJLAJP.“]
Pokud navrhuješ wordmark: dodej 2–3 varianty v SVG, plus favicon (SVG + PNG + apple-touch-icon), monogram / zkratku pro malé velikosti a variantu pro OG obrázky. Vše zapiš do BRAND.md.
Texty a tone of voice
Texty napiš ty — první kompletní verzi všech stránek v češtině, kterou pak upravím. Žádné „lorem ipsum“.
Tone of voice: [doplň — např. tykání, krátké věty, sebevědomé ale ne arogantní, trochu temné a poetické, žádné korporátní fráze].
Zakázané fráze: „moderní a responzivní“, „na míru vašim potřebám“, „posuneme váš byznys“, „jsem nadšený do…“ a podobná klišé.
Texty piš tak, aby z nich bylo jasné, kdo jsem a co dělám (důležité i pro GEO), ale zněly lidsky.
Hlavní texty ulož tak, aby šly upravit v adminu (nastavení / obsah stránek), ne natvrdo v kódu.
2. Vizuální směr (moodboard popsaný slovy)

Moodboard, ze kterého vycházíme:

černobílé, zrnité fotografie s motion blurem a „rozmazanou“ identitou — obličeje rozpité do horizontálních šmouh, postava bez tváře,
brutalistní paneláky prolnuté s postavou (double exposure), škrábance a prach jako na starém filmu,
světlo z obrazovky dopadající na obličej, tvář „vtahovaná“ do displeje,
kód odrážející se v oku, makro detail oka,
editoriální plakát: velké rozostřené foto, přes něj ostrý obdélníkový „výřez“ s glitchem, drobná monospace typografie se značkami ▸ #01 SYSTEM, tenké linky, číslování,
halftone / fotokopie / vysoký kontrast, opakovaný motiv oka v pásech, malá bílá postava jdoucí přes kompozici, rozmazaný text v pozadí.

Z toho plyne vizuální jazyk:

Barvy: téměř černá a šedé tóny (ne čistá #000), lomená bílá. Jedna jediná akcentní barva, použitá šetrně (návrh: studené „obrazovkové“ světlo nebo signální oranžovo-červená jako v odrazu kódu) — vyber a zdůvodni v PLAN.md.
Textura: všudypřítomné jemné filmové zrno (animované, přes shader nebo canvas), občas škrábance, scanlines, chromatická aberace jen jako akcent.
Pohyb: horizontální motion blur, „rozmazání identity“, glitch při přechodech, text scramble efekt u nadpisů, plynulý scroll. Pohyb musí mít účel, ne být všude.
Typografie: kontrast velkého display písma a malého monospace pro metadata (▸ 01 / WEB, ROK 2026, STATUS: VOLNÁ KAPACITA). Maximálně 2–3 rodiny, self-hosted, musí podporovat českou diakritiku (ověř ř, ů, ě, č). Vyhni se přehnaně používaným fontům (Inter jako jediný font, Poppins, Montserrat).
Layout: editoriální, asymetrický grid, hodně prázdného prostoru, čísla a indexy, tenké linky, prvky „přes sebe“ (vrstvení).
3D / WebGL: viz sekce 4.
Co NESMÍ web připomínat (anti-AI / anti-šablona pravidla)
žádné fialovo-modré gradientové bloby, glassmorphism karty, emoji v nadpisech,
žádný „hero se dvěma tlačítky a mockupem notebooku“,
žádná mřížka stejných zaoblených karet s ikonkami z ikonové sady,
žádné generické texty typu „Tvořím moderní a responzivní weby na míru“,
žádné stockové ilustrace, žádné „Trusted by“ loga.
Každá sekce musí mít vlastní kompoziční nápad. Když něco vypadá jako z Tailwind UI / Framer šablony, předělej to.
3. Fotky a média
Teď nevkládej žádné fotky ani stockové obrázky. Vizuál dočasně tvoří typografie, zrno, shadery, 3D a generativní prvky.
Navrhni „mediální sloty“ — místa v designu, kam později přidám vlastní fotky a videa, která budou tvořit atmosféru (hero video, pozadí sekcí, přechody). Do té doby v nich běží generativní placeholder, který vypadá záměrně (šum, rozmazaná silueta z shaderu), ne šedý box.
Sloty musí jít naplnit z admina (upload obrázku/videa → automaticky se použije).
Obrázky zpracovávej přes sharp (AVIF/WebP, více velikostí, blur placeholder), videa podporuj MP4/WebM s posterem, autoplay muted, lazy load.
Zpracování videí
Videa nahraná v adminu se automaticky zpracují přes ffmpeg (v Dockeru, ve frontě na pozadí, aby upload neblokoval admin):
komprese do MP4 (H.264) a WebM (VP9/AV1), několik rozlišení (např. 720p a 1080p),
vygenerování posteru (první snímek nebo zvolený čas),
odstranění zvukové stopy u videí na pozadí,
limit velikosti a délky, průběh zpracování viditelný v adminu.
Automatické náhledy mých webů
U projektu typu „Web“ vložím v adminu URL živého webu a systém pomocí Playwright sám vytvoří:
screenshot desktop (1440 px) a mobil (390 px), celý i „nad ohybem“,
krátké scroll video stránky (pro hover náhledy a case study),
vše uloží do knihovny médií a zpracuje stejně jako ruční upload.
Tlačítko „Obnovit náhledy“ (když se web klienta změní). Zpracování běží na pozadí.
Náhledy můžu pak v designu stylizovat (zrno, rámování do zařízení vlastního stylu — ne generický mockup MacBooku).
4. 3D a interaktivita
Použij Three.js přes React Three Fiber (+ drei, postprocessing). Nebo vlastní GLSL shadery.
Návrhy (vyber a rozpracuj, klidně přidej vlastní):
Hero: WebGL scéna — abstraktní 3D objekt / panelový dům rozpadající se do horizontálních pruhů, reaguje na kurzor a scroll; nebo silueta postavy z částic, která se při pohybu myši „rozmaže“.
Oko: shader oka, ve kterém se odráží kód / moje projekty; sleduje kurzor.
Projekty: při hoveru nad názvem projektu se náhled zobrazí s distortion efektem (WebGL plane s displacement shaderem).
Přechody mezi stránkami: glitch / blur wipe.
Modely ve formátu GLB s Draco kompresí, nahrávané líně (lazy), s fallbackem.
Výkon a přístupnost: detekce slabého zařízení / mobilu → jednodušší verze scény; prefers-reduced-motion → statická varianta bez animací; 3D nikdy neblokuje první vykreslení obsahu.
Další interakce: vlastní kurzor (na desktopu, na dotyku vypnutý), magnetická tlačítka, text scramble, command palette (Ctrl/Cmd + K) pro rychlou navigaci, volitelný ambientní zvuk s přepínačem (defaultně vypnutý).
Easter eggy jsou vítané (např. skrytá stránka, konzole v devtools s pozdravem a odkazem na kontakt).
5. Struktura webu (vícestránkový)
Stránka	Obsah
Úvod /	Hero s 3D, kdo jsem v jedné větě, vybrané práce (3–5), služby v kostce, status dostupnosti, CTA na kontakt
Práce /prace	Seznam všech projektů, filtr podle kategorie (Weby, Grafika, Branding, Aplikace), dvě zobrazení (seznam / mřížka)
Detail projektu /prace/[slug]	Case study: zadání, řešení, proces, výsledky, galerie/video, použité technologie, odkaz na živý web, další projekt
O mně /o-mne	Osobní příběh, přístup, nástroje, timeline, „teď pracuji na…“
Služby /sluzby	Weby, grafika, branding, UI/UX, aplikace (označit „brzy“) — jak spolupráce probíhá, proces krok za krokem
Journal /journal	Příspěvky — zápisky, experimenty, behind the scenes (pomáhá i SEO)
Lab /lab	Experimenty, shadery, koncepty (volitelné, ale doporučené)
Kontakt /kontakt	Formulář (sekce 6), e-mail, sociální sítě
Právní	/ochrana-osobnich-udaju, případně /cookies
404	Umělecky zpracovaná, ne výchozí

Navigace musí být zajímavá, ale srozumitelná. Na mobilu fullscreen menu s animací.

6. Kontaktní formulář

Pole:

Jméno*, e-mail*, firma / projekt (volitelné), telefon (volitelné)
Co potřebuješ (výběr více možností jako „chipy“): Web, E-shop, Grafika, Logo / identita, UI/UX, Aplikace, Něco jiného
Rozpočet (rozsahy v Kč — [doplň rozsahy]), termín (ASAP / do měsíce / do 3 měsíců / nespěchá)
Zpráva*, odkud o mně víš (volitelné)
Volitelně příloha (PDF/obrázek, limit velikosti, kontrola typu)
Souhlas se zpracováním osobních údajů* (odkaz na zásady)

Chování:

Formulář může být klidně vícekrokový a interaktivní (krok po kroku, s animací), ale musí jít rychle vyplnit i na mobilu.
Validace na klientu i serveru (Zod), srozumitelné chybové hlášky česky.
Ochrana proti spamu: honeypot pole, rate limiting podle IP, časová kontrola vyplnění, Google reCAPTCHA v3 (nebo Cloudflare Turnstile — doporuč).
Po odeslání: uložení do databáze → odeslání e-mailů → hezká potvrzovací obrazovka.

E-maily (propojení s Googlem):

Odesílání přes můj Google účet / Google Workspace — Gmail přes Nodemailer s OAuth2 (preferováno) nebo SMTP s heslem aplikace. Konfigurace v .env.
Klientovi přijde poděkování v mém vizuálním stylu (HTML šablona přes React Email nebo MJML, s textovou verzí): poděkování, shrnutí toho, co vybral a napsal, kdy se ozvu.
Mně přijde notifikace se vším: jméno, kontakt, vybrané služby, rozpočet, termín, zpráva, příloha, čas, odkaz rovnou do admina na tuto poptávku. Reply-To nastav na e-mail klienta, ať můžu rovnou odpovědět.
Pokud odeslání e-mailu selže, poptávka zůstane uložená v DB a v adminu se zobrazí, že e-mail neodešel (s možností odeslat znovu).
E-maily odcházej přes frontu s opakováním (retry), ne synchronně v požadavku.

Doručitelnost (aby e-maily nepadaly do spamu):

E-maily posílám z vlastní domény přes Google Workspace [nebo: z Gmailu — doplň].
Do README.md přidej návod krok za krokem: nastavení SPF, DKIM a DMARC záznamů v DNS pro Google Workspace, ověření (např. mail-tester.com), a co dělat, když e-maily padají do spamu.
Odesílatel ve tvaru FAJLAJP <hello@[doména]>, správný Reply-To, textová verze každého HTML e-mailu, žádné obrázky jako jediný obsah.

Notifikace na telefon:

Kromě e-mailu mi při nové poptávce přijde zpráva na Telegram (bot) a/nebo Discord (webhook) — krátké shrnutí + odkaz do admina. Zapnutí a údaje přes .env / nastavení v adminu.

Rezervace hovoru:

Na potvrzovací obrazovce po odeslání (a v e-mailu s poděkováním) nabídni klientovi možnost rovnou si rezervovat úvodní hovor — integrace s Google Calendar (rezervační stránka) nebo Cal.com (lze self-hostovat). Doporuč variantu a zdůvodni.
Kalkulačka ceny
Interaktivní odhad ceny (samostatná sekce na Službách nebo krok před formulářem): typ projektu, počet stránek, e-shop ano/ne, admin/CMS, animace/3D, vlastní grafika/branding, jazykové mutace, termín.
Výsledek jako orientační rozsah v Kč (ne přesná cena), s jasnou poznámkou, že finální cena je po konzultaci.
Ceníkové parametry nastavitelné v adminu (nechci je měnit v kódu).
Tlačítko „Poslat poptávku s tímto výběrem“ → předvyplní kontaktní formulář a výběr se uloží k poptávce.
Musí vypadat jako součást uměleckého celku, ne jako formulář z pojišťovny.
7. Tajné přihlášení a admin
Skrytý vstup
Na webu není viditelné tlačítko pro přihlášení.
Přihlašovací okno vyvolám klávesovou zkratkou (návrh: Ctrl + Shift + F nebo napsání slova fajlajp kdekoliv na stránce — udělej konfigurovatelné v .env). Na mobilu alternativa: např. 5× klepnutí na logo.
Po přihlášení se v horní navigaci objeví tlačítko „Admin“ a na stránkách projektů tlačítko „Upravit“.
Přihlašovací stránka/route má noindex, není v sitemapě.
Důležité: skrytá zkratka je jen pohodlí, ne zabezpečení. Skutečná ochrana je na serveru: hash hesla Argon2, session v HttpOnly Secure cookie, CSRF ochrana, rate limiting a dočasné zablokování po neúspěšných pokusech, volitelně 2FA (TOTP) — doporučuji zapnout.
Admin panel /admin

Musí vypadat hezky a ve stejném stylu jako web (tmavý, monospace metadata), ale být hlavně praktický a rychlý.

Dashboard: počet nových poptávek, poslední poptávky, publikované projekty, rychlé akce.

Poptávky (leady):

Přehledná tabulka: jméno, e-mail, vybrané služby (štítky), rozpočet, termín, datum, stav.
Stavy: Nová → Rozpracovaná → Nabídka odeslána → Vyhraná / Prohraná / Archiv.
Detail poptávky: všechna data, příloha, moje interní poznámky, historie změn, tlačítko „Odpovědět“ (otevře mail).
Filtry, vyhledávání, řazení, export do CSV.
Badge s počtem nových v navigaci admina.

Projekty (práce):

Vytvořit / upravit / smazat / duplikovat, koncept vs. publikováno, naplánované publikování.
Pole: název, slug, krátký popis, kategorie, štítky, klient, rok, role, technologie, odkaz na živý web, titulní médium, galerie, „vybraná práce“ (zobrazit na úvodu), pořadí (drag & drop).
Obsah case study přes blokový editor (návrh: Tiptap) — text, nadpis, obrázek, video, galerie, citace, embed, porovnání před/po, kód.
SEO pole pro každý projekt (title, description, OG obrázek — jinak se vygeneruje automaticky).
Náhled před publikováním.

Journal: stejný princip jako projekty (příspěvky).

Média: knihovna nahraných souborů, upload drag & drop, automatická optimalizace, alt texty (povinné kvůli přístupnosti a SEO).

Nastavení: texty na úvodu, status dostupnosti („Volné kapacity od…“), sociální sítě, mediální sloty, e-mailové šablony (texty), změna hesla, 2FA.

Audit log: kdo/kdy co změnil, přihlášení.

Historie verzí: každé uložení projektu, příspěvku i nastavení vytvoří verzi. V adminu jde zobrazit seznam verzí, porovnat je a obnovit předchozí verzi jedním klikem. Smazané položky jdou nejdřív do koše (obnovitelné 30 dní).

Admin jako PWA: admin jde „nainstalovat“ na mobil jako aplikace (manifest, ikona, service worker). Na mobilu musí být pohodlné hlavně čtení a správa poptávek (změna stavu, poznámka, odpověď). Volitelně web push notifikace o nové poptávce.

8. Technický stack (návrh — můžeš upravit, ale zdůvodni v PLAN.md)
Framework: Next.js (App Router, aktuální stabilní verze) + TypeScript, SSR/SSG pro SEO.
Kód piš odděleně podle jazyků: styly v samostatných souborech (CSS Modules / SCSS, design tokeny jako CSS proměnné v tokens.css), shadery v samostatných .glsl souborech, žádné obří inline styly ani skripty v HTML.
Animace: GSAP (+ ScrollTrigger), Lenis pro plynulý scroll.
3D: Three.js, React Three Fiber, drei, postprocessing.
Databáze: PostgreSQL v Dockeru, ORM Prisma (migrace + seed s ukázkovými daty — 3 smyšlené projekty bez fotek, pár poptávek).
Auth: vlastní session řešení nebo Auth.js (Credentials), Argon2, TOTP.
Validace: Zod. E-maily: Nodemailer + React Email.
Média: uložená na disku VPS v Docker volume (/uploads), zpracování přes sharp. Připrav abstrakci, aby šlo později přepnout na S3-kompatibilní úložiště.
Analytika: self-hosted Umami nebo Plausible v Dockeru (bez cookies → není potřeba cookie lišta).
Testy: Playwright (smoke testy: úvod, projekt, odeslání formuláře, přihlášení do admina), Vitest pro logiku.
Kvalita kódu: ESLint, Prettier, husky pre-commit.
Docker
docker-compose.yml pro vývoj: db (PostgreSQL), adminer nebo pgadmin (jen dev), umami (volitelně), mailpit (zachytává e-maily lokálně, ať při vývoji nechodí skutečné maily).
docker-compose.prod.yml pro VPS: app (Next.js, multi-stage Dockerfile, standalone build, non-root user), db, Caddy jako reverse proxy s automatickým HTTPS, umami, služba na automatické zálohy DB (pg_dump denně, uchovat 14 dní).
Healthchecky, restart policy, volumes pro DB a uploady.
.env.example se všemi proměnnými a komentáři.
Lokální spuštění (musí fungovat po dokončení)
bash
cp .env.example .env
docker compose up -d          # databáze, mailpit, adminer
npm install
npx prisma migrate dev
npm run db:seed
npm run dev                   # http://localhost:3000

Sám to spusť, nainstaluj node_modules a ověř, že web, admin i formulář (s Mailpit) opravdu fungují.

Fronta úloh na pozadí
Pro e-maily, zpracování videí, náhledy webů a notifikace použij frontu (např. BullMQ + Redis v Dockeru, nebo pg-boss nad PostgreSQL — doporuč). Worker běží jako samostatná služba v compose.
Git, CI/CD a staging
Repozitář na GitHubu, main = produkce, develop = staging.
GitHub Actions: při pushnutí lint + typecheck + testy + build Docker image → push do registry (GHCR) → nasazení na VPS přes SSH (docker compose pull && up -d) a spuštění migrací.
Staging prostředí na subdoméně (např. staging.[doména]), chráněné heslem, s noindex.
Možnost rychlého rollbacku na předchozí image. Postup popiš v README.
Monitoring
Uptime Kuma (self-hosted v Dockeru) — hlídá web, admin a databázi, při výpadku pošle notifikaci (Telegram/e-mail).
GlitchTip nebo Sentry — zachytávání chyb z frontendu i backendu.
Healthcheck endpoint /api/health (stav aplikace, DB, fronty).
Performance budget
JavaScript na první načtení stránky: max. ~170 kB gzip (bez 3D, které se načítá líně).
3D scéna + modely: max. ~1,5 MB celkem, načítání až po zobrazení obsahu.
Fonty: max. 3 soubory na první načtení, font-display: swap, subset pro latinku + češtinu.
LCP obrázek/text bez závislosti na JS.
Kontrola budgetu v CI (Lighthouse CI nebo size-limit) — build selže, když se překročí.
9. SEO a GEO

SEO:

Metadata pro každou stránku (title, description, canonical), Open Graph a Twitter karty, automaticky generované OG obrázky ve stylu webu.
sitemap.xml (dynamická, s projekty a příspěvky), robots.txt (admin a login vyloučeny).
Strukturovaná data JSON-LD: Person, ProfessionalService, WebSite, CreativeWork / Article pro projekty a příspěvky, BreadcrumbList, FAQPage na Službách.
Sémantické HTML (jeden H1 na stránku, správná hierarchie nadpisů), alt texty, čitelné URL v češtině bez diakritiky.
Připraveno na hreflang (cs/en).
Výkon: cíl Lighthouse 90+ ve všech kategoriích na mobilu, Core Web Vitals v zeleném (LCP < 2,5 s, CLS < 0,1, INP < 200 ms). Obsah se vykreslí na serveru, 3D se načte až potom.

GEO (optimalizace pro AI vyhledávače — ChatGPT, Perplexity, Gemini, Google AI Overviews):

llms.txt v rootu se stručným popisem kdo jsem, co dělám, odkazy na hlavní stránky a projekty.
Jasné, faktické věty o mně a službách v textu (ne jen v obrázcích nebo canvasu): kdo, co, kde působím [doplň město], pro koho.
FAQ sekce s reálnými otázkami klientů (cena webu, délka spolupráce, proces).
Konzistentní údaje napříč webem a profily, sameAs odkazy v JSON-LD na moje sociální sítě [doplň].
Case studies se strukturou zadání → řešení → výsledek (AI to snadno cituje).
Veškerý důležitý obsah musí být čitelný i bez JavaScriptu.
10. Mobil a přístupnost
Mobile-first návrh — mobil není zmenšený desktop, ale vlastní kompozice se stejnou atmosférou.
Testuj šířky 360, 390, 768, 1024, 1440, 1920+. Žádný horizontální scroll.
Dotykové cíle min. 44 px, žádné hover-only interakce bez alternativy.
Přístupnost WCAG 2.2 AA: kontrast textu (i na tmavém pozadí se zrnem), ovládání klávesnicí, viditelný focus (stylizovaný, ne odstraněný), prefers-reduced-motion, aria popisky, skip link.
Česká typografie
Automaticky vkládej nedělitelné mezery za jednopísmenné předložky a spojky (v, k, s, z, o, u, a, i) a mezi číslo a jednotku (10 %, 25 000 Kč) — na veřejném webu i v e-mailech, včetně obsahu z adminu (zpracování při vykreslení).
Správné uvozovky „…“, pomlčka – (ne spojovník) v rozsazích a vsuvkách, tři tečky jako znak …, formát data 17. 10. 2026, měna 25 000 Kč.
Dělení slov (hyphens: auto s lang="cs") jen tam, kde to dává smysl, nikdy v nadpisech.
Velká display typografie: kontrola, aby nevznikaly osamocená slova na posledním řádku (text-wrap: balance / pretty).
11. Bezpečnost a GDPR
HTTPS, bezpečnostní hlavičky (CSP, HSTS, X-Frame-Options, Referrer-Policy).
Rate limiting na formulář a login, ochrana uploadů (typ, velikost, přejmenování souborů).
Tajné údaje jen v .env, nikdy v repozitáři.
GDPR: zásady ochrany osobních údajů, souhlas ve formuláři, nastavitelná doba uchování poptávek (např. automatický archiv/smazání po X měsících), možnost smazat poptávku z admina.
Pravidelné zálohy DB a uploadů, návod na obnovu v README. Zálohy ukládej i mimo VPS (např. S3-kompatibilní úložiště nebo jiný server), jinak při pádu serveru zmizí i zálohy.
Povinné údaje podnikatele
V patičce (a na stránce Kontakt) uveď údaje, které podnikatel musí mít na webu (§ 435 občanského zákoníku): jméno a příjmení, sídlo / místo podnikání, IČO a údaj o zápisu (živnostenský rejstřík) — [doplň údaje].
Ve stylu webu, ale čitelně. Údaje upravitelné v nastavení admina a propsané i do JSON-LD.
12. Rozdělení práce (tým agentů)

Pracujte paralelně, ale v tomto pořadí závislostí. Architekt nejdřív připraví základ, ostatní na něj navazují.

#	Role	Odpovědnost
1	Architekt / Lead	PLAN.md, struktura repozitáře, datový model (Prisma schema), API kontrakty, design tokeny, sdílené typy, finální integrace a code review
2	Art director / UI designer	Vizuální koncept, 2–3 vizuální směry ve fázi 1, logo/wordmark, typografie, barvy, grid, kompozice každé stránky, hlídá anti-AI pravidla (sekce 2) — má právo vetovat cokoliv, co vypadá jako šablona
2b	Copywriter	Tone of voice, všechny texty webu a e-mailů, FAQ, texty kalkulačky, česká typografie — spolupracuje se SEO/GEO
3	Creative frontend developer	Stránky, komponenty, layout, animace (GSAP, Lenis), přechody, kurzor, command palette, responzivita
4	3D / WebGL developer	Three.js scény, shadery (.glsl), mediální sloty s generativními placeholdery, fallbacky a výkon 3D
5	Backend developer	API routes / server actions, kontaktní formulář, e-maily přes Google, fronta úloh, zpracování videí (ffmpeg), automatické náhledy webů (Playwright), notifikace Telegram/Discord, rezervace hovoru, auth, 2FA, rate limiting, uploady
6	Admin / CMS developer	Celý admin panel: poptávky, projekty, journal, média, nastavení, ceník kalkulačky, blokový editor, historie verzí a koš, PWA, tajné přihlášení
7	SEO & GEO specialista	Metadata, JSON-LD (včetně údajů podnikatele), sitemap, OG obrázky, llms.txt, sémantika, Lighthouse
8	DevOps	Docker, compose (dev + prod), Caddy, worker a fronta, zálohy (i mimo VPS), GitHub Actions CI/CD, staging, rollback, Uptime Kuma, GlitchTip, návod na SPF/DKIM/DMARC, .env.example, lokální spuštění
9	QA / přístupnost / bezpečnost	Playwright testy, WCAG kontrola, bezpečnostní audit, kontrola performance budgetu, test na mobilech, finální CHECKLIST.md

Každý agent na konci zapíše do PLAN.md, co udělal a co předává dál.

13. Věci navíc, které chci (a cokoliv dalšího přidej sám)
Status dostupnosti (např. „● Přijímám nové projekty od [měsíc]“) nastavitelný v adminu.
Stránka nebo sekce „Teď“ — na čem právě pracuji.
Odkaz „Další projekt“ na konci každé case study s přechodovou animací.
Možnost označit projekt jako NDA (zobrazí se jen popis, bez médií).
Reference klientů (správa v adminu, zatím prázdné).
Ke stažení / tisku CV stránka (volitelně).
Moderně zpracovaná konzole v devtools a skrytá stránka jako easter egg.
Dark je výchozí a jediný režim — ale připrav tokeny tak, aby šlo v budoucnu přidat světlý.
14. Co mi odevzdáš
Funkční projekt běžící na localhost:3000 (web + admin + formulář + DB v Dockeru).
PLAN.md, README.md, IDEAS.md, CHECKLIST.md, BRAND.md (logo, barvy, fonty, tone of voice).
Výchozí admin účet vytvořený přes seed nebo CLI příkaz (heslo z .env, ne natvrdo v kódu).
Krátké shrnutí: co je hotové, co musím doplnit já (fotky, videa, texty, Google OAuth údaje, doména), a 5 nápadů, jak web posunout dál.

Stačí doplnit teď (kvůli designu):

přilož fotky z moodboardu
[3–5 referenčních webů a co se ti na nich líbí] — volitelné, ale hodně pomůže
[tone of voice — jak chceš, aby texty zněly] — jedna věta stačí

Doplním později (AI na to nečeká):

jméno, město, e-mail, sociální sítě, doména, IČO a sídlo
logo, fotky, videa, finální texty
Gmail / Google Workspace údaje, Telegram / Discord, Google Calendar / Cal.com
rozpočtové rozsahy a ceny pro kalkulačku
zkratka pro admin (do té doby výchozí Ctrl + Shift + F)