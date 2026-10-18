/**
 * Homepage copy, direction ZNAKY v4 (black and white). Raw strings — components run prose
 * through typo() at render time. Voice: first person, tykání, short sentences, concrete.
 * Phase 2: becomes SiteText rows editable in the admin.
 */

export type CraftItem = { title: string; body: string; tag?: string }

export const home = {
  hero: {
    tag: 'Grafik a webdesignér · Česko',
    title: ['Webdesignér.', 'Weby, e-shopy, grafika', 'od A do Z.'],
    intro:
      'Navrhuju a stavím celé weby a e-shopy, k nim logo, vizuál i tiskoviny. Všechno sám, od první skici po spuštění, takže mluvíš přímo se mnou.',
    ctaPrimary: 'Napiš mi',
    ctaSecondary: 'Práce',
    codeFile: 'fajlajp.ts',
    code: `const fajlajp = {
  role: 'grafik + webdesignér',
  dělám: ['weby', 'e-shopy', 'grafika'],
  nástroje: ['tužka', 'Figma', 'kód'],
  nejlíp: '22:00 – 03:00',
  šablony: false,
}

fajlajp.napiš('hello@fajlajp.cz')`,
    replay: 'znovu',
  },

  about: {
    index: '01',
    label: 'Kdo jsem',
    /** Who I am, as a terminal manual page: `$ man fajlajp`. */
    man: {
      command: 'man fajlajp',
      page: 'FAJLAJP(1)',
      manual: 'Uživatelská příručka',
      name: 'fajlajp — grafik a webdesignér z Česka',
      usage: ['fajlajp', '[--web]', '[--e-shop]', '[--grafika]', '[--identita]', '<tvůj nápad>'],
      description:
        'Jsem FAJLAJP, grafik a webdesignér z Česka. Vyrostl jsem mezi paneláky a dodnes mě víc baví beton než sklo. Kreslím rukou, skládám v počítači a stavím v kódu. Dělám sám, nejradši v noci.',
      options: [
        { flag: '--sam', text: 'Pracuju sám, bez agentury. Mluvíš přímo se mnou.' },
        { flag: '--v-noci', text: 'Nejčastěji 22:00 – 03:00.' },
        { flag: '--bez-sablon', text: 'Šablony nepoužívám. Každý web začíná prázdným papírem.' },
      ],
      bugs: 'Na e-maily občas odpovídám ve tři ráno. Neopravuje se.',
      seeAlso: [
        { href: '#prace', label: 'prace(2)' },
        { href: '#co-delam', label: 'sluzby(3)' },
        { href: '#kontakt', label: 'kontakt(5)' },
      ],
      headings: {
        name: 'Jméno',
        usage: 'Použití',
        description: 'Popis',
        options: 'Volby',
        bugs: 'Chyby',
        seeAlso: 'Viz také',
      },
      figure: 'obr. 1 — fajlajp při práci',
      footer: 'FAJLAJP 2026',
      end: '(END)',
    },
  },

  work: {
    index: '02',
    label: 'Vybrané práce',
    heading: 'Tři projekty, tři různé světy.',
    open: 'Otevřít projekt',
    allLabel: 'Všechny práce',
  },

  craft: {
    index: '03',
    label: 'Co dělám',
    lead: 'Dvě řemesla, jedna ruka. Většina projektů potřebuje obě.',
    code: {
      title: 'Kód',
      items: [
        {
          title: 'Weby',
          body: 'Od struktury po poslední pixel. Rychlé, čitelné na telefonu, texty si pak upravíš sám.',
        },
        {
          title: 'UI/UX',
          body: 'Rozhraní aplikací a nástrojů. Nejdřív zjistím, kudy člověk půjde, pak řeším vzhled.',
        },
        {
          title: 'Aplikace',
          body: 'Od nápadu po vydání. První leží rozdělaná na stole.',
          tag: 'brzy',
        },
      ] satisfies CraftItem[],
    },
    graphics: {
      title: 'Grafika',
      items: [
        {
          title: 'Vizuální identity',
          body: 'Logo, písmo, barvy a pravidla. Tak, aby tě poznali i z rozmazané fotky.',
        },
        {
          title: 'Plakáty a tiskoviny',
          body: 'Věci, které se tisknou a lepí na zeď. Kultura, gastro, akce.',
        },
        {
          title: 'Obaly a sítě',
          body: 'Obaly, příspěvky a všechno, kolem čeho se scrolluje.',
        },
      ] satisfies CraftItem[],
    },
    linkLabel: 'Jak spolupráce probíhá',
  },

  gallery: {
    index: '04',
    label: 'Mimo obrazovku',
    lead: 'Věci, které na hotovém webu neuvidíš. Stůl ve dvě ráno, skici, cesta domů přes sídliště.',
    hint: 'táhni do strany',
    frames: [
      { slot: 'home.studio.1', no: '14', caption: 'Stůl, 02:14', ratio: '4 / 5' },
      { slot: 'home.studio.2', no: '14A', caption: 'Skici, které nevyšly', ratio: '1 / 1' },
      { slot: 'home.studio.3', no: '15', caption: 'Odraz monitoru', ratio: '4 / 5' },
      { slot: 'home.studio.4', no: '15A', caption: 'Cestou domů', ratio: '3 / 2' },
      { slot: 'home.studio.5', no: '16', caption: 'Sídliště v noci', ratio: '4 / 5' },
      { slot: 'home.studio.6', no: '16A', caption: 'Káva č. 3', ratio: '1 / 1' },
    ],
  },

  contact: {
    index: '05',
    label: 'Kontakt',
    heading: 'Napiš mi.',
    body: 'Stačí pár vět: co děláš, co potřebuješ a do kdy. Odpovím do dvou dnů. Většinou dřív, často v noci.',
    copyLabel: 'Zkopírovat e-mail',
    copied: 'Zkopírováno',
    formLabel: 'Formulář',
    now: [
      { time: '22:14', text: 'Dokončuju web pro architektonický ateliér.' },
      { time: '00:47', text: 'Kreslím plakáty na zimní sérii koncertů.' },
      { time: '02:31', text: 'Po nocích stavím svoji první aplikaci.' },
    ],
    /** The inquiry form, printed as a till receipt. */
    form: {
      title: 'Poptávka',
      /** The steps, each opened by a reverse-printed bar. */
      sections: ['Kdo jsi', 'Zakázka', 'Zpráva'],
      next: 'Dál',
      edit: 'upravit',
      sub: 'Grafik a webdesignér · Česko',
      register: 'Pokladna 01 · Obsluha FAJLAJP',
      fields: {
        name: { label: 'Jméno', placeholder: 'např. Jan Novák' },
        email: { label: 'E-mail', placeholder: 'např. jan@novak.cz' },
        company: { label: 'Firma / projekt', placeholder: 'nepovinné' },
        phone: { label: 'Telefon', placeholder: 'nepovinné' },
      },
      servicesLabel: 'Co potřebuješ',
      services: ['Web', 'E-shop', 'Grafika', 'Logo / identita', 'UI/UX', 'Aplikace', 'Něco jiného'],
      budgetLabel: 'Rozpočet',
      choose: 'vyber',
      // Placeholder ranges — to confirm, see CHECKLIST.md › „Rozpočtové rozsahy pro formulář".
      budgets: ['do 30 tis. Kč', '30–80 tis. Kč', '80–150 tis. Kč', '150 tis. Kč a víc', 'Nevím'],
      deadlineLabel: 'Termín',
      deadlines: ['ASAP', 'Do měsíce', 'Do 3 měsíců', 'Nespěchá'],
      messageHint: 'Co děláš, co potřebuješ a do kdy. Pár vět stačí.',
      itemsEmpty: 'Bez upřesnění.',
      price: '?,-- Kč',
      total: 'Celkem',
      totalValue: 'domluvíme se',
      consent: 'Souhlasím se zpracováním osobních údajů',
      consentLink: 'zásady',
      submit: 'Vytisknout a odeslat',
      pending: 'Tisknu',
      footer: 'Odpovím do dvou dnů.',
      end: '-- konec výpisu --',
      cut: 'utrhni tady',
      sent: {
        stamp: 'Odesláno',
        title: 'Díky, mám to.',
        body: 'Ozvu se do dvou dnů. Většinou dřív, často v noci.',
        again: 'Napsat další',
      },
      failed: 'Tiskárně došel papír. Zkus to znovu, nebo napiš rovnou na',
      errors: {
        name: 'Napiš, jak ti mám říkat.',
        email: 'Bez e-mailu ti nemám kam odpovědět.',
        emailFormat: 'Tenhle e-mail nevypadá správně.',
        phone: 'Telefon nevypadá správně.',
        message: 'Napiš aspoň pár slov.',
        consent: 'Bez souhlasu ti nemůžu odpovědět.',
      },
    },
  },
}
