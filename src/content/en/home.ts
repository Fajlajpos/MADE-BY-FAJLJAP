import type { home as cs } from '../home'

/**
 * The homepage in English: the same shape as content/home.ts, the same voice — first person,
 * direct, relaxed, a little cheeky. Facts follow the Czech copy (its `OVĚŘIT` notes apply here
 * too); prices stay in CZK.
 */
export const home: typeof cs = {
  hero: {
    tag: 'Web designer from Czechia',
    title: ['Hi,', 'I make websites', 'and online shops.'],
    intro:
      "I'm FAJLAJP and I do everything myself. No salesperson, no agency, you write straight to me. I'll design your website or online shop and build it too, start to finish. I reply within two days, usually sooner.",
    arch: ['MADE BY', 'FAJLAJP'],
    notes: [
      { k: 'Websites & shops', v: 'designed and built' },
      { k: 'No agency', v: 'you write straight to me' },
      { k: 'Reply', v: 'within two days' },
    ],
    ctaPrimary: 'Write to me',
    ctaSecondary: 'What I do',
  },

  reel: {
    index: '01',
    label: 'Video',
    heading: 'This is me at the desk',
    caption: "A few minutes of how a website comes together at my place. In real life it takes weeks and a seriously large amount of coffee.",
    soon: "I'm still cutting the video, it'll be here soon.",
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    play: 'Play',
    pause: 'Pause',
  },

  services: {
    index: '02',
    label: 'What I do',
    heading: 'What I can help with',
    lead: "I make websites and everything around them. The design, the build and whatever comes after. And if you've got an old site you don't like, I'll happily redo it.",
    items: [
      {
        id: 'weby',
        object: 'browser',
        index: '01',
        title: 'Websites',
        body: "A site for your company, a portfolio or just one page for an event. I make sure it loads fast and reads well on a phone. You edit the text yourself afterwards, so you don't have to message me about every comma.",
        points: ['Designed from scratch', 'Fast loading and basic SEO', 'You change the text and photos'],
      },
      {
        id: 'e-shopy',
        object: 'parcel',
        index: '02',
        title: 'Online shops',
        body: "I'll build you a shop where customers pay by card and pick their own delivery. Invoices make themselves, so all you really do is pack the orders.",
        points: ['Checkout in a few clicks', 'Card payments, delivery, invoices', 'You add the products yourself'],
      },
      {
        id: 'redesign',
        object: 'pen',
        index: '03',
        title: 'Website redesign',
        body: "Got a site that works but looks like it's from 2012 and falls apart on a phone? I'll redraw it and rebuild it so it's faster and easy to find your way around. The text and page addresses stay, so you don't lose anything on Google.",
        points: ['New look, same content', 'Finally works properly on a phone', 'Addresses and SEO stay'],
      },
      {
        id: 'aplikace',
        object: 'phone',
        index: '04',
        title: 'Apps',
        body: "I'll be honest here, I'm just starting out. I can design the screens and make a clickable prototype you can try before any code gets written. My own first app is in the works and I'm still learning on it.",
        points: ['A clickable prototype before the coding', 'Screen design for web and mobile', 'My own app, still in progress'],
        tag: 'in progress',
      },
    ],
    cta: 'Tell me what you need',
  },

  depth: {
    label: 'How it comes together',
    lines: [
      'It all starts with one message.',
      "Then I sit at the computer and draw until it really fits.",
      "And then I build it. On my own, so you know exactly who to message when something's off.",
    ],
  },
  process: {
    index: '03',
    label: 'How it works',
    heading: 'How it goes with me',
    lead: "I'm not an agency, so nobody passes you around between people. You're talking to me the whole time, even when something gets stuck.",
    steps: [
      {
        title: 'You write to me',
        time: 'within 2 days',
        body: 'A few sentences about what you need is enough. I get back to you within two days, usually sooner.',
        status: ['Reading your message…', 'Thinking how to do it…', 'Writing back…'],
        check: "Feel free to write at night. I'm up anyway.",
      },
      {
        title: 'We have a call',
        time: 'within a week',
        body: 'We go through what it should do and when you need it. Then I send you the price and the date in writing, and we both stick to it.',
        status: ['Dialling…', 'Noting down what it should do…', 'Working out the price and date…'],
      },
      {
        title: 'Design and build',
        time: '3–8 weeks',
        body: "First I show you the design and we fine-tune it together. Then I build, and every week I send you a link so you can see how far I've got.",
        status: ['Drawing the design…', 'Tuning the colours…', 'Copying files…', 'Fixing a bug I made…', 'Sending you the link…'],
      },
      {
        title: 'Launch',
        time: 'and then ongoing',
        body: 'I put the site live and show you how to edit it. If something breaks later or you want to add something, just write to me.',
        status: ['Putting the site live…', 'Showing you how to edit it…', 'Checking everything runs…'],
        check: 'Launch the website when finished',
      },
    ],
    installer: {
      window: 'Website Setup – FAJLAJP',
      stepOf: 'Step {n} of {total}',
      bar: 'Setup progress',
      back: 'Back',
      next: 'Next',
      finish: 'Finish',
      finishHint: 'and write to me',
    },
  },

  work: {
    index: '04',
    label: 'Work',
    heading: "What I've worked on",
    open: 'Open project',
    allLabel: 'All work',
  },

  about: {
    index: '05',
    label: 'About',
    heading: "Who's at the desk",
    body: [
      "I'm FAJLAJP and I make websites. There's nobody else on it, so everything you get from me, I made. Including the bugs, which I then fix myself too.",
      "I work best in the evening and at night, when nobody calls. I still answer messages during the day, though. On top of that I'm making my first app and still learning something new on it all the time.",
    ],
    facts: [
      { label: 'I work', value: 'alone, no agency' },
      { label: 'Best at', value: 'evenings and nights' },
      { label: 'I make', value: 'websites and shops' },
      { label: 'I reply', value: 'within two days' },
    ],
    portraitSlot: 'home.about',
    caption: "Me, winter 2026. I'm not always at the desk.",
    voice: {
      src: '',
      title: 'Hear me',
      sub: 'about 30 seconds, my voice',
      soon: "I'll record it soon",
      transcript: [] as string[],
    },
    print: {
      stamp: "'26 1 31",
      back: ['The back', 'Winter 2026.', 'I build websites at the desk,', 'but ideas come outside.'],
    },
  },

  pricing: {
    index: '06',
    label: 'Pricing',
    heading: 'Roughly what it costs',
    lead: "I'll tell you the exact price once we've talked and I know what it needs to do. These are the numbers I usually start from.",
    note: "Prices are a guide. I'm not a VAT payer, so nothing gets added on top.",
    items: [
      { title: 'Website', from: 'from 25 000 Kč', body: 'A company site or portfolio, up to about six pages.' },
      { title: 'Online shop', from: 'from 60 000 Kč', body: 'A shop with card payments, delivery and an overview of orders.' },
      { title: 'Website redesign', from: 'from 20 000 Kč', body: 'A new look and a new build for the site you already have. Content and addresses stay.' },
      { title: 'Edits and care', from: 'from 800 Kč/h', body: "Fixing or improving a site you already have. You only pay for the time I put in." },
    ],
    faqLabel: 'What people ask',
    faq: [
      { q: 'How long does it take?', a: 'A website usually 4 to 6 weeks, a shop 6 to 10. Text and photos hold things up the most, so it helps to have them ready early.' },
      { q: 'Can I edit the site myself afterwards?', a: 'Yes. You change the text, photos and products yourself, and at the end I show you everything.' },
      { q: 'Do you sort out the domain and hosting?', a: "Yes. We can set it up in your name, or I'll happily handle it." },
      { q: 'Do you take small jobs too?', a: 'Sure. One page for an event or fixing an old site is totally fine.' },
      { q: 'How does payment work?', a: "You pay half at the start and the rest at launch. You get an invoice from me, to your company if you like." },
      { q: 'Do we need to meet in person?', a: "No. We sort most things out over messages and video calls, so it doesn't matter where you are." },
    ],
  },

  contact: {
    index: '07',
    label: 'Contact',
    heading: 'Write to me',
    body: "A few sentences about what you do and what you need is enough. If you know the deadline or budget, add that too. I reply within two days, usually sooner, and happily at night.",
    copyLabel: 'Copy e-mail',
    copied: 'Copied',
    form: {
      title: 'Inquiry',
      steps: ['About you', 'The job', 'Message'],
      next: 'Next',
      back: 'Back',
      fields: {
        name: { label: 'Name', placeholder: 'Jane Smith' },
        email: { label: 'E-mail', placeholder: 'jane@smith.com' },
        company: { label: 'Company or project', placeholder: 'optional' },
        phone: { label: 'Phone', placeholder: 'optional' },
        message: { label: 'Message', placeholder: 'For example: I run a bakery and want a site where people can order a cake.' },
      },
      servicesLabel: 'What you need',
      // Same order and count as the Czech list: the server maps them by position (inquiry.ts).
      services: ['Website', 'Online shop', 'Website redesign', 'Website edits', 'App', 'Something else'],
      budgetLabel: 'Budget',
      budgets: ['up to 30k CZK', '30–80k CZK', '80–150k CZK', 'over 150k CZK', "Don't know yet"],
      deadlineLabel: 'Deadline',
      deadlines: ['As soon as possible', 'Within a month', 'Within three months', 'No rush'],
      messageHint: "A few sentences is enough. If you've got a link to a site you like, or to your old one, drop it here.",
      consent: 'I agree to the processing of my personal data',
      consentLink: 'policy',
      submit: 'Send inquiry',
      pending: 'Sending…',
      sent: {
        title: 'Thanks, got it.',
        body: "I'll read it and get back to you within two days at the latest.",
        again: 'Send another',
        chat: ['Hey {name}, got it 👊', "I'll read it and get back to you within two days at the latest. Usually sooner."],
      },
      failed: "Something went wrong and the message didn't go through. Try again, or write to me directly at",
      errors: {
        name: 'Tell me what to call you.',
        email: "Without an e-mail I've got nowhere to reply.",
        emailFormat: "There's probably a typo in the e-mail.",
        phone: "There's probably a typo in the number.",
        message: 'Write at least one sentence.',
        consent: "Please tick the consent, otherwise I'm not allowed to reply.",
      },
    },
  },
}
