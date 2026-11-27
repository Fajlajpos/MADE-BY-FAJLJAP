/**
 * Homepage copy. Raw strings — components run prose through typo() at render time. Voice:
 * FAJLAJP as he talks — first person, tykání, spoken Czech ("fakt", "furt", "prostě",
 * "klidně", an occasional -ej), direct, a bit cheeky, no slogans. Readable for companies too. Headings stay short (2–6 words): they are
 * set huge. `// OVĚŘIT:` marks facts to confirm.
 * Phase 2: becomes SiteText rows editable in the admin.
 */

/** The four things I build. `object` is the chrome object that stands for it in 3D. */
export type ServiceObject = 'browser' | 'parcel' | 'pen' | 'phone'

export type Service = {
  id: 'weby' | 'e-shopy' | 'redesign' | 'aplikace'
  object: ServiceObject
  index: string
  title: string
  body: string
  points: string[]
  tag?: string
}

export const home = {
  hero: {
    tag: 'Webdesignér z Česka',
    // Short lines: the hero sets them huge, the last one in the accent ink.
    title: ['Ahoj,', 'dělám weby', 'a e-shopy.'],
    intro:
      'Jsem FAJLAJP a všechno dělám sám. Žádnej obchodník, žádná agentura, píšeš rovnou mně. Web nebo e-shop ti navrhnu i postavím, prostě celý od začátku do konce. Ozvu se do dvou dnů, většinou dřív.',
    /** The arched title over the photo. */
    arch: ['MADE BY', 'FAJLAJP'],
    /** Short notes beside the photo. */
    notes: [
      { k: 'Weby & e-shopy', v: 'navrhnu i postavím' },
      { k: 'Bez agentury', v: 'píšeš rovnou mně' },
      { k: 'Odpověď', v: 'do dvou dnů' },
    ],
    ctaPrimary: 'Napiš mi',
    ctaSecondary: 'Co dělám',
  },

  /** The cinematic reel right after the hero: me making websites. Video comes later (media slot home.reel). */
  reel: {
    index: '01',
    label: 'Video',
    heading: 'Takhle u toho sedím',
    caption: 'Pár minut z toho, jak u mě vzniká web. Ve skutečnosti to trvá týdny a vypije se u toho fakt hodně kafe.',
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
    lead: 'Dělám weby a všechno kolem nich. Návrh, stavbu i to, co přijde potom. A jestli máš starej web, kterej se ti nelíbí, klidně ho předělám.',
    items: [
      {
        id: 'weby',
        object: 'browser',
        index: '01',
        title: 'Weby',
        body: 'Web pro firmu, portfolio nebo jen jedna stránka na akci. Hlídám, aby se načetl rychle a dal se v pohodě číst na mobilu. Texty si v něm pak měníš sám, takže mi nemusíš psát kvůli každé čárce.',
        points: ['Návrh kreslím od nuly', 'Rychlé načítání a základ SEO', 'Texty a fotky si měníš sám'],
      },
      {
        id: 'e-shopy',
        object: 'parcel',
        index: '02',
        title: 'E-shopy',
        body: 'Postavím ti obchod, kde zákazník zaplatí kartou a sám si vybere dopravu. Faktury se dělají samy, takže ty fakt jen balíš objednávky.',
        points: ['Pokladna na pár kliknutí', 'Platba kartou, doprava, faktury', 'Produkty přidáváš sám'],
      },
      {
        id: 'redesign',
        object: 'pen',
        index: '03',
        title: 'Redesign webu',
        body: 'Máš web, kterej funguje, ale vypadá jako z roku 2012 a na mobilu se rozpadá? Překreslím ho a postavím znova, aby byl rychlej a dalo se v něm vyznat. Texty a adresy stránek nechám, ať o nic nepřijdeš na Googlu.',
        points: ['Nový vzhled, stejný obsah', 'Konečně pořádně na mobilu', 'Adresy a SEO zůstanou'],
      },
      {
        id: 'aplikace',
        object: 'phone',
        index: '04',
        title: 'Aplikace',
        body: 'Tady budu upřímnej, jsem na začátku. Umím navrhnout obrazovky a udělat klikací prototyp, kde si to vyzkoušíš dřív, než se to začne programovat. Svoji první appku mám rozdělanou a furt se na ní učím.',
        points: ['Klikací prototyp, než se začne programovat', 'Návrh obrazovek pro web i mobil', 'Vlastní appka zatím rozdělaná'],
        tag: 'rozdělané',
      },
    ] satisfies Service[],
    cta: 'Napiš, co potřebuješ',
  },

  /** How working with me goes — for companies that want to know what happens and when. */
  /** The chrome corridor between the services and the process: three lines while you fly through. */
  depth: {
    label: 'Jak to vzniká',
    lines: [
      'Všechno začne jednou zprávou.',
      'Pak sedím u počítače a kreslím, dokud to fakt nesedí.',
      'A pak to postavím. Sám, takže víš, komu napsat, když něco nejde.',
    ],
  },
  process: {
    index: '03',
    label: 'Jak to probíhá',
    heading: 'Jak to u mě chodí',
    lead: 'Nejsem agentura, takže tě nikdo nepřehazuje mezi lidma. Celou dobu si píšeš se mnou, i když se něco zasekne.',
    steps: [
      {
        title: 'Napíšeš mi',
        time: 'do 2 dnů',
        body: 'Stačí pár vět o tom, co potřebuješ. Ozvu se do dvou dnů, většinou dřív.',
        status: ['Čtu tvoji zprávu…', 'Přemejšlím, jak na to…', 'Píšu ti odpověď…'],
        check: 'Klidně mi napiš i v noci. Stejně jsem vzhůru.',
      },
      {
        title: 'Zavoláme si',
        time: 'do týdne',
        body: 'Probereme, co to má umět a do kdy to chceš. Pak ti pošlu cenu a termín písemně a toho se oba držíme.',
        status: ['Vytáčím číslo…', 'Zapisuju si, co to má umět…', 'Počítám cenu a termín…'],
      },
      // OVĚŘIT: obvyklá délka návrhu a stavby
      {
        title: 'Návrh a stavba',
        time: '3–8 týdnů',
        body: 'Nejdřív ti ukážu návrh a doladíme ho spolu. Pak stavím a každej týden ti pošlu odkaz, kde vidíš, jak jsem daleko.',
        status: ['Kreslím návrh…', 'Ladím barvy…', 'Kopíruju soubory…', 'Opravuju chybu, kterou jsem udělal…', 'Posílám ti odkaz…'],
      },
      {
        title: 'Spuštění',
        time: 'pak průběžně',
        body: 'Web pustím ven a ukážu ti, jak si ho upravovat. Když se pak něco rozbije nebo budeš chtít něco přidat, prostě mi napíšeš.',
        status: ['Pouštím web ven…', 'Ukazuju ti, jak ho upravovat…', 'Hlídám, jestli všechno jede…'],
        check: 'Po dokončení spustit web',
      },
    ],
    /** The steps as an old-school setup wizard (Process.tsx › Installer). `{n}` / `{total}` are filled in. */
    installer: {
      window: 'Instalace webu – FAJLAJP',
      stepOf: 'Krok {n} ze {total}',
      bar: 'Průběh instalace',
      back: 'Zpět',
      next: 'Další',
      finish: 'Dokončit',
      finishHint: 'a napsat mi',
    },
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
      'Jsem FAJLAJP a dělám weby. Nikoho dalšího na to nemám, takže všechno, co ode mě dostaneš, jsem dělal já. Včetně chyb, který pak taky opravuju já.',
      'Nejlíp se mi pracuje večer a v noci, kdy nikdo nevolá. Na zprávy ale odpovídám i přes den. K tomu teď dělám svoji první appku a furt se na ní něco učím.',
    ],
    facts: [
      { label: 'Pracuju', value: 'sám, bez agentury' },
      // OVĚŘIT: kdy pracuje nejradši
      { label: 'Nejlíp mi to jde', value: 'večer a v noci' },
      { label: 'Dělám', value: 'weby a e-shopy' },
      { label: 'Odpovídám', value: 'do dvou dnů' },
    ],
    /** My playlist: five things about me beside the iPod; each opens its chapter on /o-mne. OVĚŘIT: všechno přepiš vlastními slovy. */
    now: {
      label: 'O mně v pěti skladbách',
      count: 'skladeb',
      playing: 'právě hraje',
      more: 'Celej příběh',
      tracks: [
        {
          slug: 'kdo-jsem',
          kind: 'photos',
          title: 'Kdo jsem',
          note: 'FAJLAJP. Weby dělám sám, bez agentury',
          len: 'intro',
          story: [
            'Jsem FAJLAJP a dělám weby, e-shopy a appky. Sám, bez agentury a bez přeposílání mailů mezi pěti lidma.',
            'Všechno, co ode mě dostaneš, jsem udělal já. Takže vím, kde co je, a když se něco rozbije, vím, kam sáhnout.',
          ],
          // OVĚŘIT: popisky fotek; prázdné src = místo na další fotku
          photos: [
            { src: '/photos/o-mne.webp', alt: 'Já', caption: 'Zima 2026' },
            { src: '/photos/cloud-me-v5.webp', alt: 'Já na chromovém mráčku', caption: 'Když se web povede' },
            { src: '/photos/ipod-cover.webp', alt: 'Les', caption: 'Kde mě napadají věci' },
            { src: '', alt: '', caption: 'Sem přijde další fotka' },
          ],
          items: [
            { k: 'Jméno', v: 'FAJLAJP' },
            { k: 'Dělám', v: 'weby, e-shopy, appky' },
            { k: 'Pracuju', v: 'sám, bez agentury' },
            { k: 'Instagram', v: '@fajlajpos' },
          ],
        },
        {
          slug: 'jak-jsem-zacal',
          kind: 'timeline',
          title: 'Jak jsem začal',
          note: 'od prvního webu pro kámoše k zakázkám',
          len: 'flashback',
          story: ['Jak jsem se dostal k webům. Krok po kroku, i s chybama.'],
          photos: [],
          // OVĚŘIT: celá časová osa je vymyšlená, přepiš ji podle pravdy
          items: [
            { k: '20XX', v: 'První stránka. Ošklivá, ale moje.' },
            { k: '20XX', v: 'První web pro kámoše. Zadarmo, za pizzu.' },
            { k: '20XX', v: 'První člověk, kterej mi za web zaplatil.' },
            { k: '2026', v: 'FAJLAJP. Weby, e-shopy a první appka.' },
          ],
        },
        {
          slug: 'na-cem-delam',
          kind: 'now',
          title: 'Na čem dělám teď',
          note: 'svoje první appka a furt se učím',
          len: 'na repeat',
          story: ['Co mám zrovna rozdělaný. Čísla jsou odhad, jak daleko s tím jsem.'],
          photos: [],
          // OVĚŘIT: projekty a procenta
          items: [
            { k: 'Moje první appka', v: '60' },
            { k: 'Učím se 3D', v: '30' },
            { k: 'Reklamy na sebe', v: '15' },
            { k: 'Tenhle web', v: '90' },
          ],
        },
        {
          slug: 'jak-pracuju',
          kind: 'day',
          title: 'Jak pracuju',
          note: 'večer u stolu, odpovídám do dvou dnů',
          len: 'každej den',
          story: [
            'Nejlíp mi to jde večer a v noci, když nikdo nevolá. Na zprávy ale odpovídám i přes den, většinou do dvou dnů.',
            'Takhle zhruba vypadá můj den.',
          ],
          photos: [],
          // OVĚŘIT: časy a co v nich děláš
          items: [
            { k: '09:00', v: 'Kafe a odpovídám na zprávy.' },
            { k: '13:00', v: 'Hovory s klientama, návrhy.' },
            { k: '17:00', v: 'Ven. Tady chodí nápady.' },
            { k: '21:00', v: 'U stolu. Teď se dělá nejvíc práce.' },
            { k: '02:00', v: 'Ještě jedna oprava a jdu spát.' },
          ],
        },
        {
          slug: 'mimo-weby',
          kind: 'outside',
          title: 'Mimo weby',
          note: 'reklamy na sebe, 3D a @fajlajpos',
          len: 'bonus',
          story: [
            'Točím vtipný a trochu drzý reklamy sám na sebe. Najdeš je na Instagramu @fajlajpos.',
            'Doplň, co tě baví, když zrovna nesedíš u stolu.',
          ],
          // OVĚŘIT: fotky a věci mimo weby
          photos: [
            { src: '', alt: '', caption: 'Sem fotka z natáčení' },
            { src: '', alt: '', caption: 'Sem 3D render' },
            { src: '', alt: '', caption: 'Sem cokoliv dalšího' },
          ],
          items: [
            { k: 'Reklamy', v: 'vtipný, trochu drzý' },
            { k: '3D', v: 'zatím hlavně peněženka' },
            { k: 'Hudba', v: 'doplň' },
          ],
        },
      ],
      page: {
        title: 'O mně',
        heading: 'Celej příběh',
        lead: 'Pět kapitol o tom, kdo jsem, jak pracuju a co mě baví. Pusť si je popořadě, nebo přeskoč.',
        chapter: 'Skladba',
        back: 'Zpátky na hlavní stránku',
        backList: 'Celej playlist',
        prev: 'Předchozí skladba',
        next: 'Další skladba',
        open: 'Pustit skladbu',
        empty: 'místo na fotku',
        instagram: 'Sleduj mě na Instagramu',
        cta: 'Napiš mi',
      },
    },
    portraitSlot: 'home.about',
    // OVĚŘIT: popisek k fotce
    caption: 'Já, zima 2026. Ne vždycky sedím u stolu.',
    /** A short voice note from me. Record ~30 s on the phone, put it in /public/audio/ and set `src`. */
    voice: {
      src: '',
      title: 'Pusť si mě',
      sub: 'asi 30 vteřin, můj hlas',
      soon: 'Nahrávku sem brzo namluvím',
      // OVĚŘIT: přepis podle skutečné nahrávky
      transcript: [] as string[],
    },
    /** The portrait as a real print: the camera's date (from the photo, 31. 1. 2026) and its back. */
    print: {
      stamp: "'26 1 31",
      // OVĚŘIT: text na zadní straně fotky
      back: ['Zadní strana', 'Zima 2026.', 'Weby dělám u stolu,', 'ale nápady chodí venku.'],
    },
  },

  /** What it roughly costs, and the questions companies ask first. Prices to confirm (CHECKLIST). */
  pricing: {
    index: '06',
    label: 'Kolik to stojí',
    heading: 'Kolik to zhruba vyjde',
    lead: 'Přesnou cenu ti řeknu, až si zavoláme a budu vědět, co to má umět. Tohle jsou čísla, od kterých většinou začínám.',
    // OVĚŘIT: není plátce DPH
    note: 'Ceny jsou orientační. Nejsem plátce DPH, takže se k nim nic nepřičítá.',
    items: [
      // OVĚŘIT: cena
      { title: 'Web', from: 'od 25 000 Kč', body: 'Web pro firmu nebo portfolio, zhruba do šesti stránek.' },
      // OVĚŘIT: cena
      { title: 'E-shop', from: 'od 60 000 Kč', body: 'Obchod s platbou kartou, dopravou a přehledem objednávek.' },
      // OVĚŘIT: cena
      { title: 'Redesign webu', from: 'od 20 000 Kč', body: 'Nový vzhled a nová stavba pro web, který už máš. Obsah a adresy zůstanou.' },
      // OVĚŘIT: cena
      { title: 'Úpravy a péče', from: 'od 800 Kč/h', body: 'Oprava nebo vylepšení webu, kterej už máš. Platíš jen za čas, co tomu dám.' },
    ],
    faqLabel: 'Na co se lidi ptají',
    faq: [
      // OVĚŘIT: délky zakázek
      { q: 'Jak dlouho to trvá?', a: 'Web obvykle 4 až 6 týdnů, e-shop 6 až 10. Nejvíc to zdrží texty a fotky, takže je dobré je mít připravené dřív.' },
      { q: 'Budu si pak web umět upravovat sám?', a: 'Jo. Texty, fotky i produkty si měníš sám a na konci ti všechno ukážu.' },
      { q: 'Zařídíš i doménu a hosting?', a: 'Jo. Buď to založíme na tebe, nebo to klidně zařídím já.' },
      { q: 'Vezmeš i malou zakázku?', a: 'Jasně. Jedna stránka na akci nebo oprava starýho webu je úplně v pohodě.' },
      // OVĚŘIT: platební podmínky
      { q: 'Jak se platí?', a: 'Polovinu zaplatíš na začátku, zbytek při spuštění. Dostaneš ode mě fakturu, klidně na firmu.' },
      // OVĚŘIT: práce na dálku po celém Česku
      { q: 'Musíme se potkat osobně?', a: 'Nemusíme. Většinu věcí vyřešíme přes zprávy a videohovor, takže je jedno, kde v Česku jsi.' },
    ],
  },

  contact: {
    index: '07',
    label: 'Kontakt',
    heading: 'Napiš mi',
    body: 'Stačí pár vět o tom, co děláš a co potřebuješ. Jestli víš termín nebo rozpočet, napiš ho taky. Odpovím do dvou dnů, většinou dřív a klidně i v noci.',
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
      services: ['Web', 'E-shop', 'Redesign webu', 'Úprava webu', 'Aplikace', 'Něco jiného'],
      budgetLabel: 'Rozpočet',
      // OVĚŘIT: rozpočtové rozsahy (CHECKLIST.md › „Rozpočtové rozsahy pro formulář")
      budgets: ['do 30 tis. Kč', '30 až 80 tis. Kč', '80 až 150 tis. Kč', 'přes 150 tis. Kč', 'Zatím nevím'],
      deadlineLabel: 'Termín',
      deadlines: ['Co nejdřív', 'Do měsíce', 'Do tří měsíců', 'Nespěchá'],
      messageHint: 'Pár vět stačí. Jestli máš odkaz na web, kterej se ti líbí, nebo na ten svůj starej, hoď ho sem.',
      consent: 'Souhlasím se zpracováním osobních údajů',
      consentLink: 'zásady',
      submit: 'Odeslat poptávku',
      pending: 'Odesílám…',
      sent: {
        title: 'Díky, mám to.',
        body: 'Přečtu si to a ozvu se nejpozdějc do dvou dnů.',
        again: 'Poslat další',
        /** My reply in the little DM thread after sending ({name} = their first name). */
        chat: ['Čau {name}, mám to 👊', 'Přečtu si to a ozvu se nejpozdějc do dvou dnů. Většinou dřív.'],
      },
      failed: 'Něco se pokazilo a zpráva neodešla. Zkus to znova, nebo mi napiš rovnou na',
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
