# IDEAS

Nápady, které v zadání nebyly nebo by se hodily. U každého je co, proč a stav.

| # | Co | Proč | Stav |
|---|---|---|---|
| 1 | **Automatické ošetření fotek rastrem** (inkoust + barva tisku + zrno) | Fotky z mobilu sednou do celku bez ruční úpravy. | **hotovo** (`RasterImage`) |
| 2 | **Stránka `/ted`** jako samostatná URL (vedle sekce na O mně) | Lidé i AI vyhledávače dostanou citovatelnou odpověď na „na čem teď FAJLAJP dělá“. | plán, fáze 2 |
| 3 | **Papírové archy na toneru** (utilita `.paper`) | Rytmus mezi sekcemi bez světlého režimu. | **hotovo** |
| 4 | **Malá bílá postava jdoucí přes web** (SVG/sprite, pohyb vázaný na scroll) | Motiv z fotky 4. Tichý průvodce napříč stránkami a dobrý easter egg. | nápad, fáze 3 |
| 5 | **Formulář funguje bez JS** jako jedna dlouhá stránka | Přístupnost, odolnost, GEO. Vícekrokovost je jen vylepšení. | plán, fáze 2 |
| 6 | **Číslo poptávky `#0042`** v potvrzení i e-mailu | Klient i ty se můžete na poptávku odkazovat. Působí jako „systém“ z moodboardu. | plán, fáze 2 |
| 7 | **Barva tisku jako jeden token** (`--spot`, presety přes `html[data-spot]`) | Celý web, včetně WebGL, změní barvu jedním přepnutím. Ve fázi 2 může jít o nastavení v adminu. | **hotovo** (dočasný přepínač) |
| 8 | **Kontaktní arch „Z dílny“** (filmové pásy s čísly políček a kroužkem) | Osobní vrstva webu a místo pro syrové fotky z práce. | **hotovo** |
| 9 | **SVG značka `▸`** místo znaku | Plex Mono ho v subsetu nemá, takže se vykresluje záložním fontem. | nápad |
| 10 | **Jeden sdílený WebGL canvas** pro všechny sloty (scissor/viewport) | Úvod měl 9 WebGL kontextů. | vyřešeno jinak: kit drží max. 12 kontextů a líně je uvolňuje |
| 11 | **Příkazová paleta Ctrl/⌘ K** (navigace, napsat / zkopírovat e-mail, nahoru) | Rychlá cesta pro klávesnici a „terminálový“ charakter webu. Ve fázi 2 do ní přibude hledání v projektech a tajné přihlášení. | **hotovo** (fáze 1c) |
| 12 | **Fotky automaticky do znaků** (`AsciiScene` + `src` ve slotu) | Libovolná fotka z mobilu sedne do stylu bez úprav, se stejnou stopou kurzoru. | **hotovo** (fáze 1c) |
| 13 | **CPU renderer znaků** jako fallback bez GPU | Software WebGL kit odmítá (zatěžoval by CPU), web se ale má hýbat všude. | **hotovo** (fáze 1c) |
| 14 | **Přechody mezi stránkami ze znaků** (kit `pageDissolve`) | Až budou další stránky (fáze 2), stránka se při navigaci rozpadne do znaků a složí nová. | nápad, fáze 3 |
| 15 | **Video ve znacích** (kit `asciiVideo`) pro hero slot | Až dodáš video, poběží ve znacích, ztlumené, se zastavením. | nápad, po dodání videa |
