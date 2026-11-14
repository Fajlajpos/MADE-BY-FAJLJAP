import styles from './UiMock.module.css'

export type MockKind = 'web' | 'shop' | 'brand' | 'app' | 'poster'

/**
 * A small, living picture of the kind of work — a website, a coffee e-shop, a brand board, an
 * app, a festival poster — drawn in HTML/CSS so it stays sharp at any size (it scales with its
 * box via container units). Decorative: what it shows is said in the text next to it.
 */
export function UiMock({ kind, className }: { kind: MockKind; className?: string }) {
  return (
    <div className={[styles.mock, className].filter(Boolean).join(' ')} data-kind={kind} aria-hidden="true">
      {kind === 'web' && <Web />}
      {kind === 'shop' && <Shop />}
      {kind === 'brand' && <Brand />}
      {kind === 'app' && <App />}
      {kind === 'poster' && <Poster />}
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

function Brand() {
  return (
    <div className={styles.board}>
      <div className={styles.logo}>
        <span className={styles.logoMark}>Š</span>
        <span className={styles.logoWord}>ŠUM</span>
      </div>
      <div className={styles.swatches}>
        <span style={{ background: '#c4592b' }}>#C4592B</span>
        <span style={{ background: '#1b1a18' }}>#1B1A18</span>
        <span style={{ background: '#efe6d6', color: '#1b1a18' }}>#EFE6D6</span>
        <span style={{ background: '#2f6f62' }}>#2F6F62</span>
      </div>
      <div className={styles.specimen}>
        <span className={styles.aa}>Aa</span>
        <span className={styles.abc}>
          ABCDEFGHIJ
          <br />
          ěščřžýáíé 0123
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
        <b>Objednávka</b>
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
        <li data-done="">Zabaleno</li>
        <li>Na cestě</li>
      </ul>
      <div className={styles.appBtn}>Sledovat balík</div>
    </div>
  )
}

function Poster() {
  return (
    <div className={styles.poster}>
      <span className={styles.posterEye} />
      <p className={styles.posterTitle}>TMA</p>
      <p className={styles.posterSub}>
        festival audiovizuálního umění
        <br />
        3 noci · 12.–14. 3.
      </p>
    </div>
  )
}
