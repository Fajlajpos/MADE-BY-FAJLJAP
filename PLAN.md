# FAJLAJP — PLAN

> Stav: **Fáze 1c, verze 4 (ZNAKY, černobílá) 18. 10. 2026.** Předchozí pokusy jsou v `.backup/` (znaky-v1, nocni-smena-v2, osobni archiv v3 nebyl dokončen). Čeká se na tvoje potvrzení vzhledu, pak fáze 2.
>
> **Změna směru (18. 10. 2026):** celý web je předělaný do ASCII. Platný vizuální systém je **ZNAKY** (viz `BRAND.md` a sekce níže). RASTR je zálohovaný v `.backup/rastr-2026-10-18/` (mimo git). Kde se níže mluví o RASTRu, shaderech a `RasterImage`, platí teď ZNAKY a `AsciiScene`.

## Fáze 1c v4 — aktuální podoba úvodu

- **Pozadí:** jedno pole znaků přes celou stránku (asciify `background`), každá sekce má svůj vzor přes `data-ground` (drift → halo → contour → constellation → cascade → ripple) a při scrollu se prolínají; text drží čistou zónu (`data-clear`), klik pošle vlnu.
- **3D modely ze znaků** (`src/lib/ascii/shapes.ts`): `</>` v úvodu, `{ }` a pero v sekci Co dělám, kurzor přesahující z galerie do kontaktu. Otáčí se a naklání ke kurzoru.
- **Nadpisy ve znacích** (`Glyphs`, kit `decode`), panel s kódem, který se dopisuje (`CodePanel`, kit `streamText`), věta s fotkami mezi slovy (`InlinePhoto`), projekty s rozbalovacím náhledem, dvě řemesla (Kód / Grafika), posuvný pás osobních fotek.
- Černobílé, barva se vrátí později jedním tokenem `--spot`.

## Fáze 1c — směr ZNAKY (původní plán redesignu)

**Zadání:** předělat celý web (úvod, hlavička, mobilní menu, patička, 404) do ASCII stylu. Má být interaktivní a pořád se má něco hýbat.

**Myšlenka:** rastr z teček se mění na rastr ze znaků. Obraz, značka i přechody jsou poskládané z písmen `' .:-=+*#%@'`. Paleta zůstává (toner, papír, jedna barva tisku). Barva tisku teď svítí jen ve stopě kurzoru, protože ta je signature prvek: **identita rozmazaná do znaků pod kurzorem**.

**Engine:** `asciify-engine` 4.22 (`/kit`): GPU pole znaků s trailem, `wordmark`, `decode`, `fieldBackground`, `background`, `commandPalette`, `mountSurface`. Bez GPU (software WebGL, starý telefon) přebírá vlastní lehký CPU renderer na 2D canvasu (`src/lib/ascii/`), takže se web hýbe i tam.

| Část | Co tam bude |
|---|---|
| Typografie | **Martian Mono** (variabilní `wdth` 75–112,5 + `wght`) na nadpisy, UI a metadata. **Archivo** zůstává jen na delší odstavce (lidský hlas proti strojovému). V textu jen čisté ASCII znaky, rámečky kreslí CSS, ne box-drawing (font je nemá). |
| Hlavička | Textová značka `FAJLAJP.`, navigace se scramble efektem, ASCII spinner u statusu, živé hodiny, ukazatel scrollu `[####......]`, tlačítko příkazové palety (Ctrl K). |
| Hero | Wordmark FAJLAJP ze znaků přes celou šířku (stopa kurzoru), H1, procedurální ASCII portrét (silueta se rozmazává do pruhů), souřadnice kurzoru v metadatech. |
| Kdo jsem | ASCII oko s řádky kódu v duhovce, fakta jako tečkovaný výpis `Pracuju ........ sám`. |
| Práce | Tři karty s živým ASCII náhledem (panelák, stůl, oko), rohy rámu ze znaků, scramble názvu na hover/focus. |
| Co dělám | Výpis z řádkové tiskárny: papír s perforací `o o o`, příkazový řádek, tabulka služeb. |
| Z dílny | Filmový pás ze znaků se 4 políčky (každé jiná scéna). |
| Teď | Log `tail -f`, řádky se dopisují, blikající kurzor. |
| Kontakt | Obří „Napiš mi“ nad polem `ripple` (kurzor hází do znaků kruhy). |
| Patička | Kontakt, rejstřík, provozovatel, přepínač barvy tisku, obří FAJLAJP ze znaků. |
| 404 | Číslo 404 ze znaků, které se při „Zpátky na úvod“ rozpadne a složí. |
| Navíc | Příkazová paleta Ctrl/⌘ K (navigace, kopírovat e-mail, nahoru). |

**Pravidla:** text nikdy neleží na syrových znacích (clear zóna), nadpisy a odstavce zůstávají v HTML, max. ~12 GPU polí naráz (kit je líně připojuje a uvolňuje), `prefers-reduced-motion` = statické snímky, bez WebGL i bez JS je web čitelný.

**Úklid:** `RasterImage`, `ShaderCanvas`, `Grain`, `SpotPlate`, shadery `.glsl` a SVG `Wordmark` komponenta se mažou (záloha v `.backup/`). Brand SVG v `public/brand/` a favicony zůstávají.

**Ověření:** `typecheck`, `lint`, `build`, screenshoty 375 / 768 / 1024 / 1440 s GPU i bez něj, reduced-motion, klávesnice (palette, menu), kontrola horizontálního scrollu a konzole.

## Kontext

Repo je prázdné (jen `prompt.md`). Cíl: osobní web-portfolio značky FAJLAJP, který funguje jako umělecká instalace (zrno, rozmazaná identita, editoriální plakát, 3D). Zároveň musí být jasné, že FAJLAJP dělá weby a digitální produkty, a web má přinášet poptávky. Teď stavím design a funkční základ (fáze 1–2). Zbytek zadání (fáze 3–5) je cílový stav: datový model a struktura na něj budou připravené, ale teď ho neimplementuju.

**Prostředí (ověřeno):** Windows 11, Node 24.11, npm 11.6, Docker 29 + Compose v5, Python 3.12.
**Kolize portů:** jiné tvoje projekty už používají 5432, 5433, 1025 a 8025. FAJLAJP proto pojede na: **app 3000 · Postgres 5434 · Mailpit SMTP 1026 / UI 8026 · Adminer 8081**.

**Odpovědi z fáze 0:**
- Tone of voice: osobní, lidský, žádný „robot“. → psáno v 1. osobě, návštěvníkovi tykám, krátké věty, konkrétní místo obecných frází. Tykání si potvrdíš při čtení textů (zapíšu do CHECKLIST).
- Moodboard: poslal jsi 6 fotek do chatu (rozbor níže). Agenti fotky z chatu nevidí, proto je prosím ulož i do `/moodboard`. Rozbor níže slouží jako závazný brief.
- Referenční weby: žádné.

### Moodboard — rozbor (závazný design brief)

| # | Fotka | Co z ní bereme |
|---|---|---|
| 1 | Makro oka, přes které se promítají řádky kódu | **Horizontální pruhy světla** (kód jako rozmazané linky). Světlo má dvě teploty, **oranžovo-červenou a studeně modrobílou**, na teplé tmavé pleti. Mělká hloubka ostrosti, ostré je jen jedno místo. Motiv „kód v oku“ = shader oka (fáze 3). |
| 2 | Postava, jejíž tvář je vtahovaná do displeje telefonu | **Tvář se rozmazává směrem ke zdroji světla**, smear má směr. Hluboká modročerná tma, jediný zdroj studeného světla. Pohyb kurzoru = „vtahování“ siluety. |
| 3 | Šedý zrnitý plakát s rozostřenou tváří | Přesná šablona editoriální kompozice: silné zrno, **ostrý obdélníkový výřez** s horizontálně rozmazanýma očima, drobná bezpatková/mono typografie `▸ #01 / ▸ SYSTEM`, štítky rozházené po ploše, **jedna tenká diagonální linka**, malý centrovaný odstavec dole. Pozadí je **středně šedé**, ne černé. |
| 4 | Halftone triptych oka a malá bílá postava | Fotokopie / 1bit halftone, **oko opakované v pásech**, **malá bílá postava jde přes kompozici** (pohyb přes sekce), rozmazaný text v pozadí na levém okraji, černé boční pásy. |
| 5 | Double exposure paneláku a postavy | Panelák prolnutý s tělem, **horizontální smear**, škrábance, prach a skvrny starého filmu, čtvercový formát. To je hero 3D: panelák rozpadající se do pruhů. |
| 6 | Noční B&W fotka stolu s bleskem (laptop, graf, telefon, hodinky) | Jiná poloha: **syrová dokumentární noc**, přímý blesk, vysoké ISO, osobní „tady pracuju“. Pro stránky O mně / Teď / Journal: fotky ve stylu behind-the-scenes, ne naleštěné. Z obsahu (peníze, trading) nebereme nic, jen fotografický jazyk. |

**Shrnutí vibe:** identita rozmazaná světlem obrazovky. Je to tma, zrno, horizontální smear a jeden ostrý výřez pravdy.
- **Jeden signature prvek (sem jde všechna odvaha):** *horizontální smear identity*. Shader, který silueta / panelák / náhled projektu horizontálně rozmazává podle pohybu kurzoru a scrollu, a ostrý obdélníkový výřez, kde je obraz čistý (nebo glitchnutý). Stejný princip se opakuje v přechodech stránek a hover náhledech. Všechno ostatní (layout, typografie, UI) zůstává tiché a přesné.
- **Ošetření fotek:** všechna nahraná média půjde automaticky převést do B&W s kontrastem a zrnem (volitelně per médium). Fotky z mobilu pak sednou do celku stejně jako na moodboardu.
- **Šedá vs. černá:** web zůstává tmavý (jediný režim). Fotka 3 ale ukazuje, že občasná **středně šedá zrnitá plocha** (karta projektu jako plakát, 404) dá rytmus. Tokeny na to budou mít `--paper-grey`.

---

## 1. Stack a rozhodnutí (se zdůvodněním)

| Oblast | Volba | Proč |
|---|---|---|
| Framework | **Next.js 16.4** (App Router, TS, React 19), `src/` layout | Aktuální stable. SSR/SSG kvůli SEO, server actions pro formuláře a admin. V Next 16 se middleware jmenuje `proxy.ts`. |
| Styly | **CSS Modules + `styles/tokens.css`** (CSS proměnné), žádný Tailwind | Požadavek na oddělené styly. Tokeny mají strukturu připravenou na budoucí světlý režim (`[data-theme]`). |
| Animace | **GSAP 3.15 + ScrollTrigger, Lenis 1.3** | Požadováno. Načítá se jen na veřejném webu. |
| 3D | **three 0.186, @react-three/fiber 9, drei, postprocessing**; shadery v `.glsl` (Turbopack `rules` + raw loader) | Požadováno. Vždy přes `dynamic(..., {ssr:false})` až po prvním vykreslení. |
| DB / ORM | **PostgreSQL 17 (Docker) + Prisma 7.10** (stable; tag `latest` na npm je teď 8.0 RC, ten nepoužiju) | Prisma 7 má `prisma.config.ts` a driver adapter `@prisma/adapter-pg`. |
| Fronta | **pg-boss** (nad stejným Postgresem) | Žádný Redis navíc. Job se dá vložit ve stejné transakci jako poptávka, nic se neztratí, a zálohuje se spolu s DB. Objem úloh je malý. Worker běží jako samostatný proces nebo služba. |
| Auth | **vlastní session** (opaque token, v DB jen hash, HttpOnly + Secure + SameSite=Lax cookie), **@node-rs/argon2**, **otplib** (TOTP) | Je jen jeden admin. Auth.js Credentials nepodporuje DB sessions dobře a vlastní řešení dává plnou kontrolu nad lockoutem, 2FA i audit logem. `@node-rs/argon2` má prebuilt binárky pro Windows i Alpine. |
| CSRF | Server actions (vestavěná kontrola Origin) + kontrola `Origin` v route handlerech + SameSite cookie | |
| Validace | **Zod** (sdílená schémata klient/server) | |
| Anti-spam | honeypot + časová kontrola (min. 3 s) + rate limit (tabulka v DB) + **Cloudflare Turnstile** | Turnstile je zdarma, nesleduje uživatele a nepoužívá Google cookies, takže sedí k analytice bez cookies (žádná cookie lišta). Lokálně běží s testovacími klíči Cloudflare. reCAPTCHA v3 by přidala Google tracking. |
| E-maily | **Nodemailer + React Email**. Transport podle `MAIL_TRANSPORT=smtp \| gmail-oauth2 \| gmail-app-password` | Lokálně SMTP do Mailpitu. Na produkci stačí doplnit `.env`. Posílá se přes frontu s retry a každý pokus se zapisuje do `EmailLog`. |
| Média | **sharp** (AVIF + WebP, šířky 480/960/1600/2400, blurDataURL); abstrakce `StorageDriver` (`local` teď, `s3` později) | Soubory leží v Docker volume `/uploads` a servíruje je route `/media/[...key]` s immutable cache. |
| Rezervace hovoru (fáze 4) | **Cal.com cloud (free) jako embed**, fallback je jen URL na rezervační stránku Google Calendar | Cal.com jde nastylovat do tmavého stylu, má webhook (spáruje rezervaci s poptávkou) a později se dá self-hostovat. Google booking page nejde stylovat. V nastavení bude jen URL a typ, takže půjdou obě varianty. |
| Analytika | **Umami** (self-hosted, compose profil `analytics`) | Bez cookies, sdílí Postgres (vlastní databáze), lehčí než Plausible (ten potřebuje ClickHouse). |
| Testy | Vitest (logika), Playwright (smoke) | Smoke testy ve fázi 2, plné pokrytí ve fázi 5. |
| Kvalita | ESLint (flat), Prettier, husky + lint-staged | |
| Dev běh | `npm run dev` = `concurrently` (`next dev` + `tsx watch src/worker/index.ts`) | Díky tomu chodí e-maily do Mailpitu i při čistě lokálním `npm run dev`. |

### Akcentní barva — doporučení
**Signální oranžovo-červená `#FF4A1C`** (pracovní název `--signal`) na téměř černé `#0E0E0E`, lomená bílá `#ECEAE4`.
- Proč: vychází přímo z moodboardu (odraz kódu v oku). Je to jediný teplý bod ve studeném šedém světě, takže přitáhne pozornost přesně tam, kam má (status, CTA, focus, výřez). Kontrast na `#0E0E0E` vychází ≈ 5,7 : 1, splňuje AA i pro běžný text.
- Použití šetrně: focus ring, status ● a aktivní stav. Nikdy ne velké plochy.
- Fotka 1 obsahuje obě teploty světla. Proto ve fázi 1 postavím proti sobě **A = signální oranžovo-červená** a **B = studené obrazovkové světlo** (`#CFE3FF`-ish, s modročernou tmou jako na fotce 2). Finální volbu uděláš ty.

---

## 2. Struktura repozitáře

```
/
├─ moodboard/                  # tvoje fotky (jen reference, nenasazuje se)
├─ prisma/  schema.prisma · migrations/ · seed.ts
├─ prisma.config.ts
├─ public/  brand/ (wordmarky SVG, favicon, apple-touch) · fonts/ (ttf pro OG)
├─ docker/  Dockerfile · Caddyfile · backup/backup.sh · postgres/init.sql (umami db)
├─ docker-compose.yml          # dev: db, mailpit, adminer, (umami – profil)
├─ docker-compose.prod.yml     # VPS: app, worker, db, caddy, umami, backup
├─ src/
│  ├─ app/
│  │  ├─ (site)/               # veřejný web – layout: nav, zrno, kurzor, Lenis
│  │  │  ├─ page.tsx                     /
│  │  │  ├─ prace/page.tsx · prace/[slug]/page.tsx
│  │  │  ├─ o-mne/ · ted/ · sluzby/ · journal/ · journal/[slug]/ · lab/
│  │  │  ├─ kontakt/ · ochrana-osobnich-udaju/
│  │  │  └─ not-found.tsx               # umělecká 404
│  │  ├─ admin/                # admin – vlastní layout, noindex
│  │  │  ├─ prihlaseni/ · page.tsx (dashboard) · poptavky/[id] · projekty/[id] · media/ · nastaveni/ · audit/
│  │  ├─ %5Fdesign/a|b|c/      # fáze 1 – URL /_design/a (podtržítko musí být zakódované, jinak Next složku ignoruje)
│  │  ├─ api/health/ · api/admin/leads/export/ · api/admin/upload/ · api/admin/attachments/[id]/
│  │  ├─ media/[...key]/route.ts
│  │  ├─ sitemap.ts · robots.ts · llms.txt/route.ts · opengraph-image.tsx · manifest.ts
│  ├─ components/  ui/ (Meta, Index, Rule, Chip, Field, Button) · layout/ (Header, Footer, MobileMenu, SkipLink) · fx/ (Grain, Scramble, Cursor, Magnetic, Transition)
│  ├─ three/       Stage.tsx (lazy canvas, detekce výkonu) · scenes/ · MediaSlot.tsx
│  ├─ shaders/     *.glsl
│  ├─ features/    contact/ · projects/ · journal/ · admin/{leads,projects,media,settings,auth}/
│  ├─ server/      db.ts · auth/ · mail/ · queue/ · storage/ · rate-limit.ts · audit.ts · settings.ts · media/
│  ├─ emails/      LeadConfirmation.tsx · LeadNotification.tsx (React Email)
│  ├─ content/     cs.ts (výchozí texty, slouží jako seed) · en.ts (prázdná kostra)
│  ├─ lib/         typo/czech.ts (nedělitelné mezery, uvozovky) · i18n/ · seo/ (jsonld, metadata) · format.ts
│  ├─ contracts/   # SDÍLENÁ ROZHRANÍ – typy, Zod schémata, názvy jobů, klíče nastavení
│  ├─ styles/      tokens.css · reset.css · typography.css · globals.css
│  ├─ worker/      index.ts · jobs/*.ts
│  └─ proxy.ts     # ochrana /admin, bezpečnostní hlavičky
├─ tests/  unit/ · e2e/
├─ PLAN.md · README.md · CHECKLIST.md · IDEAS.md · BRAND.md · .env.example
```

**i18n:** čeština běží na rootu (`/prace`). Route soubory jsou tenké a předávají `locale` do komponent stránek. Až přijde angličtina, přibude `/en/...` s mapou slugů (`/prace` → `/en/work`) a `hreflang`, bez přepisování komponent. Dlouhý obsah ukládám do `*Translation` tabulek, krátké popisky jako `Json {cs, en}`, texty stránek do `SiteText(key, locale)`.

**Česká typografie:** funkce `typo()` v `lib/typo/czech.ts` (nedělitelné mezery po v/k/s/z/o/u/a/i, mezi číslem a jednotkou, „…“ uvozovky, pomlčky, …). Aplikuje se při vykreslení: komponenta `<T>`, renderer Tiptap obsahu i e-maily. Pokrytá Vitest testy.

---

## 3. Datový model (Prisma — přehled)

Enumy: `Locale(cs,en)`, `LeadStatus(NEW, IN_PROGRESS, OFFER_SENT, WON, LOST, ARCHIVED)`, `LeadService(WEB, ESHOP, GRAPHIC, IDENTITY, UIUX, APP, OTHER)`, `LeadTimeline(ASAP, MONTH, QUARTER, NO_RUSH)`, `PublishStatus(DRAFT, SCHEDULED, PUBLISHED)`, `MediaKind(IMAGE, VIDEO, DOCUMENT, MODEL)`, `MediaStatus(UPLOADED, PROCESSING, READY, FAILED)`, `EmailStatus(QUEUED, SENT, FAILED)`, `EmailKind(LEAD_CONFIRMATION, LEAD_NOTIFICATION, …)`.

| Model | Klíčová pole | Pozn. |
|---|---|---|
| **User** | email, name, passwordHash, totpSecret (šifrovaný), totpEnabled, failedLogins, lockedUntil | Výchozí účet vytvoří seed z `.env`. |
| **Session** | tokenHash (unique), userId, expiresAt, ip, userAgent, lastSeenAt | |
| **RateLimit** | key (PK), count, windowStart | Formulář, login, upload. |
| **AuditLog** | userId?, action, entityType, entityId, meta Json, ip, createdAt | Přihlášení i změny. |
| **Lead** | number (#0042), name, email, company?, phone?, services LeadService[], budget (klíč rozsahu), timeline, message, source?, consentAt + consentVersion, locale, status, **calculatorSnapshot Json?** (fáze 4), **bookingRef?** (fáze 4), ipHash, createdAt, archivedAt, deletedAt | |
| LeadNote · LeadEvent · LeadAttachment | poznámky, historie změn (stavy, e-maily), přílohy | Přílohy leží mimo veřejné úložiště. |
| **EmailLog** | kind, to, subject, status, attempts, lastError, leadId?, jobId, sentAt | Zdroj pro „e-mail neodešel, poslat znovu“. |
| **Project** | slug, status, publishedAt, featured, sortOrder, nda, categoryId, client, year, role, technologies String[], liveUrl, coverMediaId, deletedAt | Pole `liveUrl` poslouží i automatickým náhledům ve fázi 4. |
| **ProjectTranslation** | locale, title, summary, **brief / solution / result** (strukturovaně kvůli GEO), content Json (Tiptap), seoTitle, seoDescription, ogMediaId | unique(projectId, locale) |
| Category · Tag · ProjectTag · ProjectMedia | label Json {cs,en}, galerie s pořadím a popiskem | |
| **Post** + PostTranslation | stejný princip jako Project | Model a výpis ve fázi 2, admin ve fázi 4. |
| **MediaAsset** | kind, status, storageKey, mime, size, width, height, durationMs, alt Json (cs povinné), blurDataUrl, variants Json, posterId?, progress, error, deletedAt | Pole `status` a `progress` jsou připravené pro ffmpeg. |
| **MediaSlot** | key (`home.hero`, `about.portrait`, `transition.*` …), mediaId?, placeholder (preset shaderu) | Prázdný slot zobrazí generativní placeholder. |
| **SiteText** | key, locale, value | Texty stránek upravitelné v adminu. |
| **Setting** | key, value Json (typováno Zod v `contracts/settings.ts`) | `availability`, `socials`, `business` (§ 435), `mailTemplates`, `leadRetention`, `budgetRanges`, později `pricing`, `notifications`, `booking`. |
| **Testimonial** | author, role, company, quote Json, projectId?, published, sortOrder | Zatím prázdné. |
| **Version** | entityType, entityId, data Json, userId, createdAt | Tabulka hned, zápisy od fáze 4. Koš funguje přes `deletedAt`. |

pg-boss si vytvoří vlastní schéma `pgboss`. Další fáze přidávají jen nové tabulky, sloupce nebo joby, žádné přepisování.

---

## 4. Rozhraní (kontrakty, `src/contracts/`)

- **Server actions (veřejné):** `submitLead(FormData) → {ok:true, number} | {ok:false, fieldErrors, formError}`
- **Server actions (admin):** `login`, `verifyTotp`, `logout`, `updateLeadStatus`, `addLeadNote`, `deleteLead`, `resendLeadEmails`, `upsertProject`, `duplicateProject`, `deleteProject`, `reorderProjects`, `updateMediaAlt`, `updateSettings`, `updateSiteTexts`, `assignMediaSlot`, `changePassword`, `setupTotp/enableTotp/disableTotp`
- **Route handlers:** `GET /api/health` (app, DB, fronta) · `POST /api/admin/upload` · `GET /api/admin/leads/export` (CSV) · `GET /api/admin/attachments/[id]` · `GET /media/[...key]`
- **Joby:** `email.send {emailLogId}` (retry 5×, exponenciálně) · `leads.retention` (cron, denně) · připraveno pro: `media.video.process`, `web.preview.capture`, `notify.telegram`, `notify.discord`, `trash.purge`
- **Design tokeny:** `styles/tokens.css`: barvy (`--bg`, `--fg`, `--muted`, `--line`, `--signal`), typo škála (fluid `clamp`), mezery, grid (12 sloupců desktop / 4 mobil), z-indexy, easing + délky animací.

---

## 5. Stránky a kompoziční nápad každé z nich

| Stránka | Kompozice (každá má vlastní nápad, žádné šablony) |
|---|---|
| `/` | Hero: rozmazaná silueta / panelák rozpadající se do horizontálních pruhů (WebGL, statický poster bez JS). Přes ni ostrý obdélníkový **výřez** s H1 a glitchem, v rozích monospace metadata (▸ #01 SYSTEM · ROK 2026 · STATUS). Vybrané práce jako **index s obřími čísly** (hover = distortion náhled, na mobilu inline náhled). Služby jako „technický list“ s linkami. Status jako běžící páska. CTA je velké „Napiš mi“ přes celou šířku. |
| `/prace` | Přepínač **Index** (tabulka č. / název / kategorie / rok) ↔ **Mřížka** (asymetrická, různé velikosti). Filtr chipy synchronizované s URL (`?kategorie=weby`). |
| `/prace/[slug]` | Editoriální case study: hlavička s metadata gridem, kapitoly **01 Zadání → 02 Řešení → 03 Proces → 04 Výsledek**, sticky boční index, galerie, technologie, živý web. Na konci full-bleed „Další projekt“ s přechodem. NDA = bez médií. |
| `/o-mne` | Příběh jako filmový pás / vertikální timeline s roky, nástroje jako prostý monospace výpis, blok „Teď“. |
| `/ted` | Krátká stránka „na čem právě dělám“ (dobrá pro GEO). |
| `/sluzby` | Služby jako číslované kapitoly, Aplikace se štítkem „brzy“. Proces jako kroky (na desktopu pinned scroll, na mobilu pod sebou). FAQ přes `<details>` + JSON-LD FAQPage. |
| `/journal`, `/journal/[slug]` | Výpis jako deník nebo log (datum · titul · štítky). 2 seed příspěvky. |
| `/lab` | Seznam experimentů (zatím statický, rozšíření ve fázi 4). |
| `/kontakt` | Vícekrokový formulář (krok = jedna otázka, šipky a Enter, na mobilu rychlé). Bez JS funguje jako jedna dlouhá stránka. Vedle e-mail, sítě a údaje podnikatele. |
| `/ochrana-osobnich-udaju` | Zásady (koncept textu, ke kontrole). `/cookies` nebude, protože web nepoužívá žádné cookies kromě přihlášení do adminu. |
| 404 | „Signál ztracen“: šum a rozpadající se číslo 404, nabídka navigace a nápověda k Ctrl+K. |
| `/admin/*` | Tmavý styl webu, monospace metadata, ale hlavně rychlý: hustá tabulka, klávesové zkratky. |

Navigace: desktop má tenkou lištu s indexy (`01 Práce`…) a statusem. Mobil má fullscreen menu s velkou typografií a wipe animací. Command palette (Ctrl/Cmd+K) přijde ve fázi 3, na mobilu bude jako tlačítko v menu.

**Tajné přihlášení:** zkratka `Ctrl+Shift+F` nebo napsání `fajlajp`, na mobilu 5× klepnutí na logo (vše konfigurovatelné v `.env` přes `NEXT_PUBLIC_ADMIN_*`). Otevře modal, který volá server action. Fallback stránka `/admin/prihlaseni` má noindex a není v sitemapě. Po přihlášení se v navigaci objeví „Admin“ a na projektech „Upravit“. Lockout: 5 neúspěchů znamená blokaci na 15 min (IP + účet). Každé přihlášení jde do audit logu.

---

## 6. Fáze a pořadí kroků

### Fáze 1 — Vizuální směr *(konec: vybereš jeden)*
1. Projdu `/moodboard`. Přes skill `ui-ux-pro-max` vygeneruju podklad pro design systém a ověřím fonty.
2. Scaffold Next.js (minimum, které design stránky potřebují): tokens.css, reset, fonty.
3. Tři **odlišné** směry. Každý má hero, typografickou ukázku, paletu, jednu kartu projektu a vlastní wordmark:
   - **A — SIGNÁL** (fotky 3 + 1): editoriální plakát. Zrnitá silueta, ostrý výřez s horizontálním smearem, štítky `▸ #01 SYSTEM` rozházené po ploše, diagonální linka. Kondenzovaný display + mono, akcent `#FF4A1C`.
   - **B — OBRAZOVKA** (fotky 2 + 1): modročerná tma, jediný zdroj studeného světla. Silueta se při pohybu kurzoru vtahuje do světla, pruhy kódu jako světelné linky. Grotesk, akcent studená modrobílá.
   - **C — FOTOKOPIE** (fotky 4 + 5): halftone/xerox, extrémní kontrast, pásy opakovaného oka, panelák s double exposure a škrábanci, malá bílá postava jdoucí přes kompozici, rozmazaný text na okraji. Téměř monochrom, akcent jen jako jeden bod, široký grotesk.
   - Všechny tři směry sdílí signature *horizontální smear identity*, liší se tónem, typografií a barvou. Na kartě projektu ukážu i ošetření fotky ve stylu fotky 6 (B&W blesk + zrno).
   - Fonty: kandidáti s plnou latin-ext/CZ podporou (např. Big Shoulders Display, Anton, Archivo, Bricolage Grotesque, Schibsted Grotesk, Hanken Grotesk + JetBrains / IBM Plex / Martian Mono), self-hosted woff2, ověřím „ř ů ě č ž š ť ď ň“. Žádný Inter jako jediný font, Poppins ani Montserrat.
4. Screenshoty 375 / 1440 px, kontrola kontrastu a reduced-motion.

### Fáze 2 — MVP *(konec: web jde reálně používat)*
1. **Architekt:** Docker dev compose, Prisma schema + migrace + seed (3 smyšlené projekty bez fotek, 4 poptávky v různých stavech, 2 příspěvky, admin z `.env`), `contracts/`, finální tokeny podle zvoleného směru, layout shell, `.env.example`. Všechny závislosti nainstaluju najednou, aby agenti neměnili `package.json` paralelně.
2. **Paralelně (agenti, každý ve vlastních složkách):**
   - *Copywriter + Frontend:* všechny veřejné stránky, `content/cs.ts`, navigace, mobilní menu, Lenis, základní GSAP reveal, scramble.
   - *Backend:* `submitLead` + Turnstile + honeypot + rate limit, pg-boss + worker, e-maily (React Email, textové verze, Reply-To), EmailLog + resend, upload (sharp, kontrola magic bytes), `/media`, `/api/health`, auth (Argon2, session, lockout, TOTP), retention cron.
   - *Admin:* dashboard, poptávky (tabulka, filtry, hledání, řazení, detail, stavy, poznámky, historie, CSV, smazání, badge), projekty (CRUD, duplikace, koncept / publikováno / naplánováno, featured, drag&drop pořadí přes dnd-kit, Tiptap se základními bloky, SEO pole, náhled přes draft mode), média (drag&drop, povinný alt), nastavení (texty, status, sítě, údaje podnikatele, mediální sloty, rozpočtové rozsahy, heslo, 2FA), audit log.
   - *SEO/GEO:* metadata, canonical, OG obrázky (`next/og`), sitemap, robots, JSON-LD (Person, ProfessionalService + údaje podnikatele, WebSite, CreativeWork, Article, BreadcrumbList, FAQPage), `llms.txt`.
3. **DevOps:** Dockerfile (multi-stage, standalone, non-root), `docker-compose.prod.yml` (app, worker, db, caddy, umami, backup 14 dní + připravené rclone off-site), README včetně SPF/DKIM/DMARC.
4. **QA:** Vitest (typo, Zod, rate limit), Playwright smoke (úvod, projekt, formulář → Mailpit, login), kontrola 360–1920 px, klávesnice, kontrast. Architekt dělá integraci a review.

### Fáze 3 — Umění
Hero 3D scéna a shader oka, distortion náhledy projektů, generativní placeholdery mediálních slotů, glitch/blur přechody stránek, kurzor, magnetická tlačítka, command palette, ambientní zvuk (výchozí stav vypnuto), easter eggy (skrytá stránka + konzole v devtools), jemné ladění typografie. Fallbacky: slabé zařízení, reduced-motion, bez WebGL.

### Fáze 4 — Navíc
Journal admin, Lab, kalkulačka (ceník v `Setting.pricing`, předvyplní formulář a uloží `calculatorSnapshot`), Cal.com rezervace, Telegram/Discord notifikace, zpracování videí přes ffmpeg (worker), Playwright náhledy webů, verze a koš (30 dní), PWA admin + web push, CV stránka, reference.

### Fáze 5 — Produkce
GitHub Actions (lint, typecheck, testy, build → GHCR → SSH deploy + migrace), staging (`develop`, basic auth, noindex), rollback na předchozí tag, Uptime Kuma, GlitchTip, size-limit / Lighthouse CI budget, finální CSP s nonce, bezpečnostní audit, WCAG 2.2 AA audit, plné e2e testy.

---

## 7. Tým agentů (sekce 12)

Ve fázích 0 a 1 dělám **Architekta** já: definuju kontrakty, tokeny, schema a integraci. Ve fázi 1 pustím **3 paralelní agenty Art directora**, každý staví jeden směr ve vlastní složce `src/app/%5Fdesign/<x>` + `src/design/<x>`. Ve fázi 2 a dál běží agenti podle tabulky výše paralelně, každý vlastní své složky (frontend `app/(site)` + `components/`, backend `server/` + `worker/` + `emails/`, admin `app/admin` + `features/admin`, SEO `lib/seo` + metadata soubory). Sdílené soubory (`contracts/`, `tokens.css`, `schema.prisma`, `package.json`) mění jen Architekt. Na konci fáze proběhne QA agent a já udělám review. Každý agent připíše do `PLAN.md → Log předávek`, co udělal a co předává dál. Art director má veto vůči čemukoliv, co vypadá jako šablona.

---

## 8. Dokumenty

- `CHECKLIST.md`: hotovo / čeká + sekce **„Doplní FAJLAJP později“**: jméno, město, e-mail, doména, sítě, IČO + sídlo, logo (pokud nebude wordmark), fotky a videa do slotů, finální texty a potvrzení tykání, rozpočtové rozsahy, ceny pro kalkulačku, Gmail/Workspace OAuth, DNS (SPF/DKIM/DMARC), Turnstile klíče, Telegram/Discord, Cal.com, zkratka pro admin.
- `IDEAS.md` průběžně, `BRAND.md` po fázi 1, `README.md` ve fázi 2 (spuštění, `.env`, deploy na VPS, zálohy a obnova, e-mailová doručitelnost).

---

## 9. Ověření

- **Fáze 1:** `npm run dev` → `/_design/a|b|c`. Playwright screenshoty 375/768/1440, kontrola diakritiky ve fontech, konzole bez chyb, reduced-motion varianta.
- **Fáze 2 (cílový stav ze zadání):**
  ```
  cp .env.example .env && docker compose up -d && npm install
  npx prisma migrate dev && npm run db:seed && npm run dev   # http://localhost:3000
  ```
  - Projdu všechny stránky na 360 / 390 / 768 / 1024 / 1440 / 1920 px bez horizontálního scrollu.
  - Odeslání formuláře → záznam v DB → 2 e-maily v Mailpitu (`http://localhost:8026`), notifikace má Reply-To klienta a odkaz do admina.
  - Simulace pádu SMTP → poptávka zůstane uložená, v adminu je stav „neodešlo“ a funguje „poslat znovu“.
  - `Ctrl+Shift+F` → login → poptávka v adminu → změna stavu a poznámka → CSV export. Vytvoření projektu, který se zobrazí na `/prace`.
  - `npm run build`, `npm run lint`, `npm run typecheck`, `npm test` a `npm run test:e2e` musí projít.
  - `/api/health` vrací ok, `sitemap.xml`, `robots.txt` a `llms.txt` jsou validní. Bez JS je obsah čitelný.

---

## Log předávek

| Datum | Role | Co je hotové | Předává dál |
|---|---|---|---|
| 17. 10. 2026 | Architekt | Fáze 0: plán, stack, datový model, kontrakty, rozbor moodboardu | Fáze 1: 3 vizuální směry |
| 17. 10. 2026 | Architekt | Scaffold Next.js 16.4 (TS strict, CSS Modules, tokens.css, reset), sdílené `ShaderCanvas` (WebGL runner) + `Grain` + `shaders/lib/noise.glsl`, `.glsl` import, `scripts/screenshot.mjs`, Playwright | Art directorům A/B/C |
| 17. 10. 2026 | Art director A | `/_design/a` Signál: šedý zrnitý plakát, silueta se SDF, ostrý výřez s kódem a smearem. Big Shoulders + Hanken Grotesk + JetBrains Mono, akcent #FF4A1C. Detaily v `src/design/a/README.md` | Výběr směru |
| 17. 10. 2026 | Art director B | `/_design/b` Obrazovka: modročerná tma, profil vtahovaný do displeje, řádky kódu. Schibsted Grotesk + Martian Mono, akcent #CFE3FF. Detaily v `src/design/b/README.md` | Výběr směru |
| 17. 10. 2026 | Art director C | `/_design/c` Fotokopie: triptych oka v halftonu, výřez s „originálem“, kráčející postava, panelák. Archivo (wdth 62–125) + IBM Plex Mono, akcent jen jako jeden bod. Detaily v `src/design/c/README.md` | Výběr směru |

| 17. 10. 2026 | Architekt | Fáze 1b: tokeny RASTR, `ShaderCanvas` (textury, `frameloop: demand`, `u_dpr`), shadery `src/shaders/raster/*`, `RasterImage` (fotka nebo generativní placeholder ve dvou plátech), `src/content/*` (typy, sloty, projekty, web), `typo()`, `(site)` layout, úklid `/_design` | Shell + úvod |
| 17. 10. 2026 | Frontend shell | Header (wordmark, nav, status), MobileMenu (rastrový wipe, focus trap, Esc, inert), Footer (údaje § 435, sítě, dočasný přepínač barvy tisku), 404, favicony | Fáze 2: stránky |
| 17. 10. 2026 | Frontend úvod + copy | Úvod v 7 sekcích (hero, kdo jsem, vybrané práce, co dělám, z dílny, teď, kontakt), texty v `src/content/home.ts` | Fáze 2: DB seed z `src/content/*` |
| 18. 10. 2026 | Architekt + frontend | Fáze 1c: kompletní redesign do ASCII (směr ZNAKY). `asciify-engine` 4.22 + vlastní CPU fallback (`src/lib/ascii/`), komponenty `src/components/ascii/*`, nová hlavička (hodiny, spinner, Ctrl K paleta), mobilní menu, všech 7 sekcí úvodu, patička, 404. RASTR zálohovaný v `.backup/`, shadery a `raw-loader` odstraněné | Výběr barvy tisku, fáze 2 |

### Známé drobnosti z fáze 1 / 1b
- `▸` není v subsetu IBM Plex Mono → kreslí ho záložní font; zvážit SVG/CSS značku.
- Hero shadery jsou nejdražší prvek → ve fázi 3 přidat detekci výkonu a snížené rozlišení na mobilu.
- Wordmarky jsou konstrukční → optické korekce u vítězného směru.
- Dočasný přepínač barvy tisku (Footer `SpotSwitcher` + inline skript v `src/app/layout.tsx`) po výběru barvy odstranit.
- ~~9 WebGL canvasů na úvodu~~ → vyřešeno ve fázi 1c: kit drží max. 12 kontextů a pole mimo obrazovku uvolňuje.
- Fáze 1c: `/prace`, `/o-mne`, `/sluzby`, `/journal`, `/kontakt` zatím vedou na 404 (stránky přijdou ve fázi 2).
