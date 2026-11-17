import Image from 'next/image'
import { ShotVideo } from './ShotVideo'
import styles from './UiMock.module.css'

export type MockKind = 'web' | 'shop' | 'redesign' | 'app'

/**
 * A small, living picture of the kind of work — a website, a coffee e-shop, a redesign (before
 * and after), an app — drawn in HTML/CSS so it stays sharp at any size (it scales with its
 * box via container units). Decorative: what it shows is said in the text next to it.
 */
export function UiMock({ kind, className }: { kind: MockKind; className?: string }) {
  return (
    <div className={[styles.mock, className].filter(Boolean).join(' ')} data-kind={kind} aria-hidden="true">
      {kind === 'web' && <Web />}
      {kind === 'shop' && <Shop />}
      {kind === 'redesign' && <Redesign />}
      {kind === 'app' && <App />}
    </div>
  )
}

function Bar({ url }: { url: string }) {
  return (
    <div className={styles.bar}>
      <span className={styles.dots}>
        <i />
        <i />
        <i />
      </span>
      <span className={styles.url}>{url}</span>
    </div>
  )
}

function Web() {
  return (
    <div className={styles.window}>
      <Bar url="sedazona.cz" />
      <div className={styles.webPage}>
        <nav className={styles.webNav}>
          <b>ŠEDÁ ZÓNA</b>
          <span>Projekty</span>
          <span>Ateliér</span>
          <span>Kontakt</span>
        </nav>
        <div className={styles.webHero}>
          <p className={styles.webTitle}>
            Stavíme
            <br />z ticha.
          </p>
          <div className={styles.webPhoto}>
            <span />
          </div>
        </div>
        <div className={styles.webRow}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}

function Shop() {
  const items = [
    { name: 'Noční směs', price: '289 Kč', c: '#c4592b' },
    { name: 'Etiopie', price: '329 Kč', c: '#2f6f62' },
    { name: 'Bez kofeinu', price: '299 Kč', c: '#d9b25c' },
  ]
  return (
    <div className={styles.window}>
      <Bar url="kavarnasum.cz/obchod" />
      <div className={styles.shopPage}>
        <div className={styles.shopHead}>
          <b>ŠUM.</b>
          <span className={styles.cart}>Košík · 2</span>
        </div>
        <div className={styles.shopGrid}>
          {items.map((it) => (
            <div key={it.name} className={styles.product}>
              <div className={styles.bag} style={{ background: it.c }}>
                <span>ŠUM</span>
              </div>
              <p>{it.name}</p>
              <p className={styles.price}>{it.price}</p>
            </div>
          ))}
        </div>
        <div className={styles.buy}>Do košíku</div>
      </div>
    </div>
  )
}

function Redesign() {
  return (
    <div className={styles.window}>
      <Bar url="pekarnakvasek.cz" />
      <div className={styles.split}>
        {/* before: the old site, crowded and tiny */}
        <div className={styles.old}>
          <p className={styles.oldLogo}>Pekárna Kvásek</p>
          <p className={styles.oldMenu}>
            <u>Úvod</u> | <u>O nás</u> | <u>Produkty</u> | <u>Ceník</u> | <u>Fotogalerie</u> | <u>Kontakt</u>
          </p>
          <div className={styles.oldBody}>
            <span className={styles.oldImg} />
            <p>
              Vítejte na našich stránkách! Jsme rodinná pekárna s dlouholetou tradicí. Pečeme chléb, rohlíky, koláče a
              dorty na objednávku. Otevírací doba Po–Pá 6–17, So 7–11. Novinka!!! Kváskový chléb.
            </p>
          </div>
          <span className={styles.tagOld}>Před</span>
        </div>
        {/* after: the same bakery, redrawn */}
        <div className={styles.new}>
          <p className={styles.newNav}>
            <b>Kvásek</b>
            <span>Objednat</span>
          </p>
          <p className={styles.newTitle}>
            Chleba,
            <br />
            co voní
            <br />
            až na ulici.
          </p>
          <span className={styles.newImg} />
          <span className={styles.newBtn}>Objednat dort</span>
          <span className={styles.tagNew}>Po</span>
        </div>
        <span className={styles.handle}>
          <i />
        </span>
      </div>
    </div>
  )
}

function App() {
  return (
    <div className={styles.phone}>
      <div className={styles.notch} />
      <div className={styles.appTop}>
        <b>Oprava kola</b>
        <span>#0042</span>
      </div>
      <div className={styles.map}>
        <svg viewBox="0 0 100 60" preserveAspectRatio="none">
          <path d="M8 52 C 30 20, 55 48, 92 10" />
        </svg>
        <i />
      </div>
      <ul className={styles.steps}>
        <li data-done="">Přijato</li>
        <li data-done="">V opravě</li>
        <li>Hotovo k vyzvednutí</li>
      </ul>
      <div className={styles.appBtn}>Objednat opravu</div>
    </div>
  )
}

/** A real screenshot of a live site, in the same browser window as the drawn mocks. */
export function ShotWindow({
  src,
  alt,
  url,
  sizes,
  video,
  dark,
}: {
  src: string
  alt: string
  url: string
  sizes?: string
  /** A screen recording to loop instead of the still (the still is its poster). */
  video?: { src: string; poster: string }
  /** A black window, for a dark site. */
  dark?: boolean
}) {
  return (
    <div className={styles.mock}>
      <div className={styles.window} data-dark={dark || undefined}>
        <Bar url={url.replace(/^https?:\/\//, '')} />
        <div className={styles.shot}>
          {video ? (
            <ShotVideo src={video.src} poster={video.poster} label={alt} className={styles.shotImg} />
          ) : (
            <Image src={src} alt={alt} fill sizes={sizes ?? '(min-width: 1024px) 60vw, 90vw'} className={styles.shotImg} />
          )}
        </div>
      </div>
    </div>
  )
}
