# CHECKLIST

## Hotovo

- [x] Fáze 0: plán, stack, datový model, rozbor moodboardu (`PLAN.md`)
- [x] Fáze 1: tři vizuální směry (zamítnuté, zůstal jen tečkovaný rastr)
- [x] Fáze 1b: směr RASTR (nahrazený, záloha v `.backup/`)
- [x] Fáze 1c: redesign do ASCII, směr ZNAKY (nahrazený, záloha v `.backup/znaky-2026-11-14/`)
- [x] Fáze 1d: 3D úvod „Noční stůl“ (přepracovaný ve fázi 1e)
- [x] Fáze 1e: konec ASCII, směr CHROM A DVĚ SVĚTLA: stůl se službami a lift-off do chromu, sekce Služby s 3D prstencem, Práce, O mně, Mimo obrazovku, Kontakt (formulář po krocích), nová hlavička, menu, Ctrl K, patička, 404 (**čeká na tvoje potvrzení**)
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
- [ ] **Tvoje fotky do slotů**: soubor do `public/photos/`, pak v `src/content/media.ts` doplnit `src` a `alt` (fotka zůstane barevná, ořízne se podle `focal`). Sloty: `home.about` (portrét v O mně), `home.studio.1–6` (pás Mimo obrazovku), `project.*` (karty projektů: s fotkou zmizí chromový objekt), `desk.photo` (polaroid na stole). Ve fázi 2 to půjde přes admin.
- [ ] Potvrdit texty v `src/content/home.ts`: nadpis úvodu, popisy a body služeb, text O mně (paneláky, „22:00 – 03:00“, „odpovím do dvou dnů“)
- [ ] Logo, nebo potvrzení, že zůstane typografický wordmark FAJLAJP
- [ ] Fotky a videa do mediálních slotů (hero, O mně, přechody)
- [ ] Reálné projekty (texty, fotky, odkazy) místo 3 smyšlených
- [ ] Kontrola a úprava textů. **Potvrdit tykání** návštěvníkům.
- [ ] Rozpočtové rozsahy pro formulář (zatím návrh)
- [ ] Ceny a parametry pro kalkulačku (fáze 4)

### 3D úvod (Noční stůl)
- [ ] **Potvrdit texty štítků** v `src/content/desk.ts` (Weby, E-shopy #0042, Aplikace, Grafika a logo, Lampa) a závěrečnou větu „Z rozdělaných věcí na stole hotová práce…“
- [ ] **Fotka na stole** (polaroid): soubor do `public/photos/`, pak `src` u slotu `desk.photo` v `src/content/media.ts`. Je barevná, oříznutá na čtverec podle `focal`.
- [ ] **Vlastní 3D modely** (volitelné): `.glb` do `public/models/`, cestu do `src/content/models.ts` (postup je v hlavičce souboru). Bez nich zůstávají modely z kódu.
- [ ] Po změně scény nebo objektu znovu vyrenderovat statické obrázky: `npm run dev` a pak `node scripts/scene-poster.mjs`
- [ ] Podstránky projektů zatím nejsou (fáze 2), karty v Práce proto nikam nevedou; navigace vede na sekce úvodní stránky

### Přístupy a služby (stačí doplnit do `.env`)
- [ ] Gmail / Google Workspace: OAuth2 údaje (client ID, secret, refresh token), nebo heslo aplikace
- [ ] DNS: SPF, DKIM, DMARC (návod bude v README)
- [ ] Cloudflare Turnstile: site key + secret key
- [ ] Telegram bot token + chat ID / Discord webhook (fáze 4)
- [ ] Cal.com účet nebo URL rezervační stránky Google Calendar (fáze 4)
- [ ] VPS, přístup k registry (GHCR), off-site úložiště pro zálohy (fáze 5)
- [ ] Zkratka pro admin (do té doby `Ctrl + Shift + F` / napsat `fajlajp` / 5× klepnout na logo)
