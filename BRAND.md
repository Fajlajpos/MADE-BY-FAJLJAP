# BRAND — FAJLAJP

Vizuální směr **NOČNÍ TISK** (od 14. 11. 2026). Web je **černý papír**, na který se tiskne bílým inkoustem a dvěma fluo riso barvami (oranžová a modrá). Na černém se barvy sčítají světlem (`--ink-blend: screen`), kde se potkají, rozsvítí se. **Kurzor je stolní lampa**: teplé světlo jede s ním po stránce (`src/components/fx/LampLight.tsx`, `--lx`/`--ly`) a chromové objekty se v něm lesknou. Jediné lesklé věci jsou **chromové 3D objekty** a **chromová kapsle navigace**. Úvod (noční stůl ve 3D) a filmové video jsou filmové „fotky“ přes celou šířku.

Předchozí směry jsou zálohované mimo git v `.backup/`:
- chrom a dvě světla: `chrom-2026-11-14/`,
- ZNAKY: `znaky-2026-11-14/`,
- starší.

Světlý riso papír (1f) se zastavil v půlce: klient chce tmu.

## Černý papír a inkousty (`src/styles/tokens.css`)
Názvy tokenů zůstaly z papírové verze: „paper“ je teď černý papír, „ink“ bílý inkoust.

| Token | Hex | Použití | Kontrast na `--c-paper` |
|---|---|---|---|
| `--c-paper` | #0E0D0C | černý papír (teplá černá, ne modročerná), vlákna přes SVG šum | — |
| `--c-paper-shade` / `-deep` | #171513 / #211E1B | další archy přes sebe | — |
| `--c-ink` | #ECE6DA | bílý inkoust, text | 15,5 : 1 |
| `--c-ink-soft` / `-faint` | #B8AF9F / #8C8374 | vedlejší text / poznámky | 8,9 / 5,2 : 1 |
| **`--c-orange`** | **#FF7A2F** | fluo oranžová: soutisk, razítka, akce, smí i na text | 7,5 : 1 |
| **`--c-blue`** | **#3D9BE9** | fluo modrá: propiska, rastr, odkazy | 6,5 : 1 |
| `--c-orange-deep` / `--c-blue-deep` | #C4481A / #0D4F86 | plochy, rastry, stíny | — |
| `--c-lamp` | #FFB067 | světlo lampy (kurzor) | — |

## Písmo
- **Gloock** na nadpisy: patkové písmo s vysokým kontrastem a ostrými klíny, sázené obří jako filmový titulek. Má jen řez 400 (nikdy tučně ani zúžit).
- **Familjen Grotesk** na text, tlačítka a formuláře.
- **Courier Prime** na poznámky, čísla stránek a popisky (třída `.note`), nikdy velkými písmeny.

## Tiskové prvky (`src/components/print/`)
- **Soutisk (`Overprint`):** velký nadpis ve dvou barvách. Při rychlém scrollu se barvy rozjedou, v klidu sjedou (`--mis`, `ScrollRegistration`). Podpis webu.
- **Propiska (`Marked`):** zakroužkování, podtržení, škrtnutí nebo šipka, které se při odhalení dokreslí.
- **Razítko (`Stamp`):** oranžové, natočené, otřelé okraje (`#rough`).
- **Arch (`Sheet`):** papír s ořezovými značkami a číslem stránky místo „karty“.
- **Duotón (`Media`):** fotky tištěné oranžovou a černou s modrým rastrem. Náhrada bez fotky je jasně tisk.
- **Tlačítko:** černý blok s oranžovým stínem odsazeným jako nepřesný soutisk. Vedlejší akce je podtržený odkaz psacím strojem.

## Zakázané (to dělalo „AI vzhled“)
- Zaoblené karty s tenkým rámečkem, rozmazané barevné záře, glassmorphism, gradientový text.
- Pilulkové štítky, popisky v UPPERCASE mono, seznamy s fajfkami.
- Symetrické trojsloupcové mřížky, centrovaný hero se dvěma tlačítky.
- Emoji, paneláky.
- Místo toho: asymetrie, linky, ořezové značky, čísla stránek, vrstvy papíru, mírné natočení (±1–3°).

## 3D
- **Chrom** (`src/three/chrome/`) odráží oranžové a modré světelné pruhy. Na papíře stojí s vytištěným rastrovým stínem.
- **Objekty:** prohlížeč (weby), balík (e-shopy), pero (grafika), telefon (aplikace), plecháček (já), vlaštovka (kontakt).
- **Úvod, noční stůl:** služby na stole se štítky, lift-off do chromu. Za oknem noční město (bokeh), žádný panelák.

## Video
Hned po úvodu: filmové video na šířku (16:9), FAJLAJP při práci. Scrollem se z malé vytištěné fotky roztáhne přes celou šířku. Slot `home.reel` v `src/content/media.ts` (`video` + `src` jako poster). Do dodání je tam tištěná náhrada.

## Tone of voice
- Píše FAJLAJP sám: první osoba, tykání, krátké věty, normálně jako zpráva klientovi. Konkrétní detail místo přídavných jmen. Klidně humor a přiznané limity.
- **Zakázané:** slogany, trojice („od skici po spuštění“), „na míru“, „moderní“, „řešení“, „profesionální“, „posuneme váš byznys“, řečnické otázky, vymyšlená fakta.
- Pro firmy musí být jasné: co dělám, jak to probíhá, kolik to zhruba stojí, že odpovím rychle.
