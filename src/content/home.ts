/**
 * Homepage copy, direction ZNAKY v4 (black and white). Raw strings — components run prose
 * through typo() at render time. Voice: first person, tykání, short sentences, concrete.
 * Phase 2: becomes SiteText rows editable in the admin.
 */

/** A run of the „about" sentence: plain words, or a small photo set inline between them. */
export type TalkPart = string | { slot: string; alt: string }

export type CraftItem = { title: string; body: string; tag?: string }

export const home = {
  hero: {
    tag: 'Grafik a webdesignér · Česko',
    title: ['Kód', 'a grafika', 's rukopisem.'],
    intro:
      'Jsem FAJLAJP. Navrhuju a stavím weby, vizuální identity a plakáty. Sám, od první skici po spuštění, takže mluvíš přímo se mnou.',
    ctaPrimary: 'Napiš mi',
    ctaSecondary: 'Práce',
    codeFile: 'fajlajp.ts',
    code: `const fajlajp = {
  role: 'grafik + webdesignér',
  dělám: ['weby', 'identity', 'plakáty'],
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
    talk: [
      'Jsem FAJLAJP',
      { slot: 'home.hero', alt: 'portrét' },
      ', grafik a webdesignér z Česka. Vyrostl jsem mezi paneláky',
      { slot: 'home.studio.5', alt: 'sídliště v noci' },
      ' a dodnes mě víc baví beton než sklo. Kreslím rukou',
      { slot: 'home.studio.2', alt: 'skicák' },
      ', skládám v počítači a stavím v kódu. Dělám sám, nejradši v noci',
      { slot: 'home.studio.1', alt: 'stůl ve dvě ráno' },
      '.',
    ] satisfies TalkPart[],
    facts: [
      { label: 'Pracuju', value: 'sám, bez agentury' },
      { label: 'Nejčastěji', value: '22:00 – 03:00' },
      { label: 'Šablony', value: 'nepoužívám' },
    ],
  },

  work: {
    index: '02',
    label: 'Vybrané práce',
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
  },
}
