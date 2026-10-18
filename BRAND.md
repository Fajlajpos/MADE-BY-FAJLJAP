# BRAND — FAJLAJP

Vizuální směr **ZNAKY** (od 18. 10. 2026): identita složená z písmen. Rastr už netvoří tečky, ale znaky `' .:-=+*#%@'`. Obraz, značka i 404 jsou z nich poskládané a pořád se jemně hýbou. Kurzor je rozmazává jako kapalinu a zvedá je do barvy tisku. To je jediný signature prvek, všechno ostatní (layout, typografie, UI) zůstává tiché a přesné.

Předchozí směr RASTR je zálohovaný v `.backup/rastr-2026-10-18/` (mimo git).

## Značka
- **Wordmark na webu:** slovo FAJLAJP sázené v Martian Mono 800 / šířka 112,5 % a překreslené do znaků (`AsciiWordmark`: v hero přes celou šířku, v patičce useknuté spodní hranou). Skutečný text zůstává v HTML.
- **Hlavička:** textová značka `FAJLAJP.`, tečka v barvě tisku.
- **SVG wordmark a monogram** v `public/brand/` (konstrukční, z RASTRu) zůstávají pro tisk, OG a favicony. Před finálem je čeká optická korekce nebo přechod na mono kresbu.
- **Favicon:** `src/app/icon.svg` + `src/app/apple-icon.png`.

## Barvy (`src/styles/tokens.css`)
| Token | Hex | Použití | Kontrast |
|---|---|---|---|
| `--c-toner` | #0C0C0B | pozadí | text na něm 15,5 : 1 |
| `--c-paper` | #E6E5E0 | text, papír výpisu tiskárny | 15,5 : 1 na toneru |
| `--c-grey-light` | #A5A49E | tlumený text, inkoust obrazů ve znacích (`--ascii-ink-strong`) | 7,8 : 1 |
| `--c-grey-mid` | #8A8984 | metadata, popisky | 5,6 : 1 |
| `--c-grey-glyph` | #5C5B57 | tiché pozadí ze znaků (`--ascii-ink`), nikdy text | dekor |
| `--spot` | **Ultramarín #2E4BFF** (výchozí) | stopa kurzoru (`--ascii-wake`), spinner, šipky `->`, `>` u aktivní položky | 3,3 : 1, jen UI a znaky |

Barvu tisku vybíráš přepínačem `( ) / (*)` v patičce (Ultramarín / Signální oranžová #FF4A1C / Riso růžová #FF48B0). Přepnutí přebarví i stopu kurzoru ve všech polích. Po výběru ji zapíšu napevno a přepínač smažu.

Pravidlo: barva tisku nikdy na běžný text a nikdy jako plocha. Svítí jen tam, kde se něco děje.

## Písmo
- **Martian Mono** (variabilní, `wght` 100–800 + `wdth` 75–112,5 %) na nadpisy, navigaci, metadata a všechna pole znaků. Osa šířky je typografický smear: nadpisy na 112,5 %.
- **Archivo** jen na delší odstavce: lidský hlas vedle strojového.
- Obě přes `next/font` (self-hosted) se subsety latin + latin-ext, česká diakritika ověřená.
- V textu jen čisté ASCII (`->`, `[x]`, `(*)`, `|/-\`). Box-drawing znaky v subsetu nejsou, takže rámečky kreslí CSS a rohy jsou `+`.

## Obraz
- Každý mediální slot (`AsciiScene`) se kreslí znaky. Bez fotky v něm běží generativní scéna z moodboardu: **portrét** rozmazaný do pruhů, **panelák** s blikajícími okny, **oko** s kódem v duhovce, které sleduje kurzor, a **stůl** v noci s rolujícím kódem.
- Fotka v `src/content/media.ts` (`src`) se automaticky převede do znaků se stejnou stopou kurzoru.
- Engine: `asciify-engine` 4.22 (`/kit`, GPU). Bez GPU (software WebGL, slabé zařízení) kreslí vlastní CPU renderer v `src/lib/ascii/cpu.ts`. Bez JS je vidět tečkovaný podklad a HTML text. Při `prefers-reduced-motion` stojí všechno na jednom snímku.

## Pohyb
- Vždy se něco hýbe: pole znaků driftují, hodiny tikají, spinner `|/-\` se točí, filmový pás jede, log se dopisuje, nadpisy se skládají ze znaků (decode), odkazy při hoveru „projedou“ znaky (scramble).
- Interakce: stopa kurzoru ve všech polích, kruhy ve vodě v sekci Kontakt, rozpad 404 při návratu, příkazová paleta Ctrl/⌘ K.
- Rozhraní ≤ 280 ms, dekorace ≤ 800 ms, easing `cubic-bezier(0.23, 1, 0.32, 1)`.

## Tone of voice
- Osobní, lidský, ne robot. Píšu v první osobě a tykám, krátké věty. Raději konkrétní detail (noc, světlo monitoru, paneláky, „kopie kopie“) než obecné tvrzení. Sebevědomě, ne arogantně, trochu temně. Nově i trochu „terminálově“: `$ tail -f ~/ted.log`, `-- konec výpisu --`.
- **Zakázané:** „moderní a responzivní“, „na míru vašim potřebám“, „posuneme váš byznys“, „jsem nadšený do…“, korporátní fráze, emoji.
- **Česká typografie:** `typo()` v `src/lib/typo/czech.ts` doplňuje nedělitelné mezery po předložkách a mezi číslem a jednotkou, dál „uvozovky“, pomlčky a výpustku (…).
