# CHECKLIST

## Hotovo

- [x] Fáze 0: plán, stack, datový model, rozbor moodboardu (`PLAN.md`)
- [x] Fáze 1: tři vizuální směry (zamítnuté, zůstal jen tečkovaný rastr)
- [x] Fáze 1b: směr RASTR (nahrazený, záloha v `.backup/`)
- [x] Fáze 1c: redesign do ASCII, směr ZNAKY: úvod, hlavička, mobilní menu, Ctrl K paleta, patička, 404 (**čeká na tvoje potvrzení + výběr barvy tisku**)
- [ ] Fáze 2: MVP (Docker, DB, stránky, formulář + e-maily, admin, SEO)
- [ ] Fáze 3: umění (3D, shadery, přechody, kurzor, zvuk)
- [ ] Fáze 4: navíc (journal admin, lab, kalkulačka, rezervace, notifikace, video, náhledy webů, verze, PWA)
- [ ] Fáze 5: produkce (CI/CD, staging, monitoring, audit, testy)

## Doplní FAJLAJP později

### Identita a údaje
- [ ] Jméno a příjmení (do patičky, JSON-LD, stránky O mně)
- [ ] Město / místo působení (GEO)
- [ ] Kontaktní e-mail (např. `hello@…`)
- [ ] Doména
- [ ] Sociální sítě (URL → `sameAs` v JSON-LD)
- [ ] IČO, sídlo / místo podnikání, údaj o zápisu do živnostenského rejstříku (§ 435 OZ)

### Značka a obsah
- [ ] Moodboard fotky uložit do `/moodboard` (ze chatu je agenti nevidí)
- [ ] **Vybrat barvu tisku** přepínačem v patičce (Ultramarín / Signální oranžová / Riso růžová)
- [ ] **Tvoje fotky do slotů** (automaticky se převedou do znaků): soubor do `public/photos/`, pak v `src/content/media.ts` doplnit `src` a `alt`. Sloty: `home.hero` (portrét), `home.about`, `home.studio.1–4` (z dílny: stůl v noci, skici, obrazovka, cesta), `project.*`. Ve fázi 2 to půjde přes admin.
- [ ] Potvrdit fakta v textech úvodu (`src/content/home.ts`): „odpovím do dvou dnů“, pracovní doba „22:00 – 03:00“, tři položky v sekci „Teď“
- [ ] Logo, nebo potvrzení, že zůstane typografický wordmark FAJLAJP
- [ ] Fotky a videa do mediálních slotů (hero, O mně, přechody)
- [ ] Reálné projekty (texty, fotky, odkazy) místo 3 smyšlených
- [ ] Kontrola a úprava textů. **Potvrdit tykání** návštěvníkům.
- [ ] Rozpočtové rozsahy pro formulář (zatím návrh)
- [ ] Ceny a parametry pro kalkulačku (fáze 4)

### Přístupy a služby (stačí doplnit do `.env`)
- [ ] Gmail / Google Workspace: OAuth2 údaje (client ID, secret, refresh token), nebo heslo aplikace
- [ ] DNS: SPF, DKIM, DMARC (návod bude v README)
- [ ] Cloudflare Turnstile: site key + secret key
- [ ] Telegram bot token + chat ID / Discord webhook (fáze 4)
- [ ] Cal.com účet nebo URL rezervační stránky Google Calendar (fáze 4)
- [ ] VPS, přístup k registry (GHCR), off-site úložiště pro zálohy (fáze 5)
- [ ] Zkratka pro admin (do té doby `Ctrl + Shift + F` / napsat `fajlajp` / 5× klepnout na logo)
