/**
 * Homepage copy, phase 1g (night print). Raw strings — components run prose through typo() at
 * render time. Voice: FAJLAJP writing it himself — first person, tykání, short sentences, plain
 * spoken Czech, concrete over adjectives, no slogans. Headings stay short (2–6 words): they are
 * set huge in Gloock. `// OVĚŘIT:` marks facts to confirm.
 * Phase 2: becomes SiteText rows editable in the admin.
 */

/** The four things I build. `object` is the chrome object that stands for it in 3D. */
export type ServiceObject = 'browser' | 'parcel' | 'pen' | 'phone'

export type Service = {
  id: 'weby' | 'e-shopy' | 'grafika' | 'aplikace'
  object: ServiceObject
  index: string
  title: string
  body: string
  points: string[]
  tag?: string
}

export const home = {
  hero: {
    tag: 'Grafik a webdesignér z Česka',
    // Short lines: the hero sets them huge, the last one in the accent ink.
    title: ['Ahoj,', 'dělám weby', 'a loga.'],
    intro:
      'Jsem FAJLAJP a dělám to sám, takže nepíšeš žádnému obchodníkovi, ale rovnou mně. Web nebo e-shop ti navrhnu i postavím. Když k tomu chceš logo nebo leták, udělám ho taky. Ozvu se do dvou dnů.',
    ctaPrimary: 'Napiš mi',
    ctaSecondary: 'Co dělám',
  },

  /** The cinematic reel right after the hero: me making websites. Video comes later (media slot home.reel). */
  reel: {
    index: '01',
    label: 'Video',
    heading: 'Takhle u toho sedím',
    caption: 'Pár minut z toho, jak u mě vzniká web. Ve skutečnosti to trvá týdny a padne u toho víc kafe, než bych rád přiznal.',
    soon: 'Video ještě stříhám, brzo tu bude.',
    soundOn: 'Zapnout zvuk',
    soundOff: 'Vypnout zvuk',
    play: 'Přehrát',
    pause: 'Pozastavit',
  },

  services: {
    index: '02',
    label: 'Co dělám',
    heading: 'S čím ti pomůžu',
    lead: 'Většina lidí přijde kvůli jedné věci a nakonec potřebuje dvě. K webu logo, k e-shopu obaly. Klidně to vezmu celé, ať to pak k sobě sedí.',
    items: [
      {
        id: 'weby',
        object: 'browser',
        index: '01',
        title: 'Weby',
        body: 'Web pro firmu, portfolio, nebo jedna stránka k akci. Hlídám, aby se rychle načetl a dal se v klidu číst na telefonu. Texty si v něm pak přepisuješ sám a nemusíš mi psát kvůli každé čárce.',
        points: ['Návrh kreslím od nuly', 'Rychlé načítání a základ SEO', 'Texty a fotky si měníš sám'],
      },
      {
        id: 'e-shopy',
        object: 'parcel',
        index: '02',
        title: 'E-shopy',
        body: 'Postavím ti obchod, kde zákazník zaplatí kartou a sám si vybere dopravu. Faktura se vystaví sama, takže ty hlavně balíš objednávky.',
        points: ['Pokladna na pár kliknutí', 'Platba kartou, doprava, faktury', 'Produkty přidáváš sám'],
      },
      {
        id: 'grafika',
        object: 'pen',
        index: '03',
        title: 'Logo a grafika',
        body: 'Logo nejdřív kreslím tužkou, teprve pak ho dělám v počítači. Vyberu k němu barvy a písmo a podle toho pak dělám vizitky, plakáty, obaly nebo příspěvky na sítě. Všechno pak vypadá, že je od jedné firmy, a ono taky je.',
        points: ['Logo a jednoduchý manuál', 'Plakáty, letáky, vizitky', 'Obaly a příspěvky na sítě'],
      },
      {
        id: 'aplikace',
        object: 'phone',
        index: '04',
        title: 'Aplikace',
        body: 'Tady jsem upřímně na začátku. Umím navrhnout obrazovky a udělat klikací prototyp, na kterém si to vyzkoušíš dřív, než se začne programovat. Svoji první vlastní aplikaci mám rozdělanou a pořád se na ní učím.',
        points: ['Klikací prototyp, než se začne programovat', 'Návrh obrazovek pro web i mobil', 'Vlastní aplikace zatím rozdělaná'],
        tag: 'rozdělané',
      },
    ] satisfies Service[],
    cta: 'Napiš, co potřebuješ',
  },

  /** How working with me goes — for companies that want to know what happens and when. */
  process: {
    index: '03',
    label: 'Jak to probíhá',
    heading: 'Jak to u mě chodí',
    lead: 'Nejsem agentura, takže tě nikdo nepřehazuje mezi lidmi. Celou dobu si píšeš se mnou, i když se něco zasekne.',
    steps: [
      { title: 'Napíšeš mi', time: 'do 2 dnů', body: 'Stačí pár vět o tom, co potřebuješ. Ozvu se do dvou dnů, většinou dřív.' },
      { title: 'Zavoláme si', time: 'do týdne', body: 'Probereme, co to má umět a do kdy to potřebuješ. Pak ti pošlu cenu a termín písemně a toho se oba držíme.' },
      // OVĚŘIT: obvyklá délka návrhu a stavby
      { title: 'Návrh a stavba', time: '3–8 týdnů', body: 'Nejdřív ti ukážu návrh a doladíme ho. Pak stavím a jednou týdně ti pošlu odkaz, kde vidíš, jak jsem daleko.' },
      { title: 'Spuštění', time: 'pak průběžně', body: 'Web pustím ven a ukážu ti, jak si ho upravovat. Když se pak něco rozbije nebo budeš chtít něco přidat, prostě mi napíšeš.' },
    ],
  },

  work: {
    index: '04',
    label: 'Práce',
    heading: 'Na čem jsem dělal',
    open: 'Otevřít projekt',
    allLabel: 'Všechny práce',
  },

  about: {
    index: '05',
    label: 'O mně',
    heading: 'Kdo u stolu sedí',
    body: [
      'Jsem FAJLAJP, grafik a webdesignér. Skoro všechno začínám tužkou ve skicáku, protože tam je škrtání zadarmo. Nikoho dalšího na to nemám, takže všechno, co ode mě dostaneš, jsem dělal já. Včetně chyb, které pak taky opravuju já.',
      'Nejlíp se mi pracuje v noci, kdy nikdo nevolá a na stole svítí jen lampa. Na zprávy ale odpovídám i přes den. Teď k tomu dělám svoji první aplikaci a pořád se na ní něco učím.',
    ],
    facts: [
      { label: 'Pracuju', value: 'sám, bez agentury' },
      // OVĚŘIT: kdy pracuje nejradši
      { label: 'Nejlíp mi to jde', value: '22:00–03:00' },
      { label: 'Na stole', value: 'lampa a plecháček' },
      { label: 'Odpovídám', value: 'do dvou dnů' },
    ],
    portraitSlot: 'home.about',
    caption: 'Já u stolu, kolem půlnoci.',
  },

  /** What it roughly costs, and the questions companies ask first. Prices to confirm (CHECKLIST). */
  pricing: {
    index: '06',
    label: 'Kolik to stojí',
    heading: 'Kolik to zhruba vyjde',
    lead: 'Přesnou cenu ti řeknu, až si zavoláme a budu vědět, co to má umět. Tohle jsou čísla, od kterých obvykle začínám.',
    // OVĚŘIT: není plátce DPH
    note: 'Ceny jsou orientační. Nejsem plátce DPH, takže se k nim nic nepřičítá.',
    items: [
      // OVĚŘIT: cena
      { title: 'Web', from: 'od 25 000 Kč', body: 'Web pro firmu nebo portfolio, zhruba do šesti stránek.' },
      // OVĚŘIT: cena
      { title: 'E-shop', from: 'od 60 000 Kč', body: 'Obchod s platbou kartou, dopravou a přehledem objednávek.' },
      // OVĚŘIT: cena
      { title: 'Logo a identita', from: 'od 15 000 Kč', body: 'Logo s barvami a písmem. K tomu pár stránek o tom, jak s tím zacházet.' },
      // OVĚŘIT: cena
      { title: 'Grafika', from: 'od 3 000 Kč', body: 'Plakát, leták, obal nebo příspěvky na sítě. Cena podle toho, kolik toho je.' },
    ],
    faqLabel: 'Na co se lidi ptají',
    faq: [
      // OVĚŘIT: délky zakázek
      { q: 'Jak dlouho to trvá?', a: 'Web obvykle 4 až 6 týdnů, e-shop 6 až 10. Nejvíc to zdrží texty a fotky, takže je dobré je mít připravené dřív.' },
      { q: 'Budu si pak web umět upravovat sám?', a: 'Ano. Texty, fotky i produkty si měníš sám a na konci ti to ukážu.' },
      { q: 'Zařídíš i doménu a hosting?', a: 'Ano. Buď to založíme na tebe, nebo to zařídím já.' },
      { q: 'Vezmeš i malou zakázku?', a: 'Jasně. Jeden plakát nebo oprava starého webu je úplně v pohodě.' },
      // OVĚŘIT: platební podmínky
      { q: 'Jak se platí?', a: 'Polovinu zaplatíš na začátku, zbytek při spuštění. Dostaneš ode mě fakturu, klidně na firmu.' },
      // OVĚŘIT: práce na dálku po celém Česku
      { q: 'Musíme se potkat osobně?', a: 'Nemusíme. Většinu věcí vyřešíme přes e-mail a videohovor, takže je jedno, kde v Česku jsi.' },
    ],
  },

  gallery: {
    index: '07',
    label: 'Mimo obrazovku',
    lead: 'Co na hotovém webu neuvidíš. Většinou je to můj stůl ve dvě ráno a skici, které skončily v koši.',
    hint: 'táhni do strany',
    // Captions are drafts until the real photos arrive.
    frames: [
      { slot: 'home.studio.1', caption: 'Stůl, 02:14', ratio: '4 / 5' },
      { slot: 'home.studio.2', caption: 'Skici, které nevyšly', ratio: '1 / 1' },
      { slot: 'home.studio.3', caption: 'Odraz monitoru', ratio: '4 / 5' },
      { slot: 'home.studio.4', caption: 'Cestou domů', ratio: '3 / 2' },
      { slot: 'home.studio.5', caption: 'Pauza venku, 03:10', ratio: '4 / 5' },
      { slot: 'home.studio.6', caption: 'Plecháček, třetí kafe', ratio: '1 / 1' },
    ],
  },

  contact: {
    index: '08',
    label: 'Kontakt',
    heading: 'Napiš mi',
    body: 'Stačí pár vět o tom, co děláš a co potřebuješ. Když víš termín nebo rozpočet, napiš ho taky. Odpovím do dvou dnů, většinou dřív a často v noci.',
    copyLabel: 'Zkopírovat e-mail',
    copied: 'Zkopírováno',
    form: {
      title: 'Poptávka',
      steps: ['O tobě', 'Zakázka', 'Zpráva'],
      next: 'Dál',
      back: 'Zpět',
      fields: {
        name: { label: 'Jméno', placeholder: 'Jan Novák' },
        email: { label: 'E-mail', placeholder: 'jan@novak.cz' },
        company: { label: 'Firma nebo projekt', placeholder: 'nepovinné' },
        phone: { label: 'Telefon', placeholder: 'nepovinné' },
        message: { label: 'Zpráva', placeholder: 'Třeba: mám pekárnu a chci web, kde si lidi objednají dort.' },
      },
      servicesLabel: 'Co potřebuješ',
      // Also the server-side whitelist (inquiry.ts): keep the count.
      services: ['Web', 'E-shop', 'Grafika', 'Logo', 'Návrh rozhraní', 'Aplikace', 'Něco jiného'],
      budgetLabel: 'Rozpočet',
      // OVĚŘIT: rozpočtové rozsahy (CHECKLIST.md › „Rozpočtové rozsahy pro formulář")
      budgets: ['do 30 tis. Kč', '30 až 80 tis. Kč', '80 až 150 tis. Kč', 'přes 150 tis. Kč', 'Zatím nevím'],
      deadlineLabel: 'Termín',
      deadlines: ['Co nejdřív', 'Do měsíce', 'Do tří měsíců', 'Nespěchá'],
      messageHint: 'Pár vět stačí. Jestli máš odkaz na web, který se ti líbí, nebo na ten svůj starý, přidej ho.',
      consent: 'Souhlasím se zpracováním osobních údajů',
      consentLink: 'zásady',
      submit: 'Odeslat poptávku',
      pending: 'Odesílám…',
      sent: {
        title: 'Díky, mám to.',
        body: 'Přečtu si to a ozvu se nejpozději do dvou dnů.',
        again: 'Poslat další',
      },
      failed: 'Něco se pokazilo a zpráva neodešla. Zkus to znovu, nebo mi napiš rovnou na',
      errors: {
        name: 'Napiš, jak ti mám říkat.',
        email: 'Bez e-mailu ti nemám kam odpovědět.',
        emailFormat: 'V e-mailu je asi překlep.',
        phone: 'V čísle je asi překlep.',
        message: 'Napiš aspoň jednu větu.',
        consent: 'Zaškrtni prosím souhlas, jinak ti nesmím odpovědět.',
      },
    },
  },
}
