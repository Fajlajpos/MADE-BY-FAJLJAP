import styles from './UiMock.module.css'

export type MockKind = 'web' | 'shop' | 'design' | 'app'

/**
 * A small, living picture of the kind of work — a website, a coffee e-shop, a design file, an
 * app — drawn in HTML/CSS so it stays sharp at any size (it scales with its
 * box via container units). Decorative: what it shows is said in the text next to it.
 */
export function UiMock({ kind, className }: { kind: MockKind; className?: string }) {
  return (
    <div className={[styles.mock, className].filter(Boolean).join(' ')} data-kind={kind} aria-hidden="true">
      {kind === 'web' && <Web />}
      {kind === 'shop' && <Shop />}
      {kind === 'design' && <Design />}
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

function Design() {
  return (
    <div className={styles.canvas}>
      <div className={styles.layers}>
        <b>Vrstvy</b>
        <span>Menu</span>
        <span data-on="">Hlavička</span>
        <span>Fotka</span>
        <span>Tlačítko</span>
        <span>Patička</span>
      </div>
      <div className={styles.board}>
        <div className={styles.artboard}>
          <small>Počítač · 1440</small>
          <div className={styles.frameDesk}>
            <i style={{ width: '30%' }} />
            <i className={`${styles.big} ${styles.select}`} />
            <i className={styles.img} />
            <i className={styles.btn} />
          </div>
        </div>
        <div className={styles.artboard}>
          <small>Telefon · 390</small>
          <div className={styles.framePhone}>
            <i style={{ width: '50%' }} />
            <i className={styles.big} />
            <i className={styles.img} />
            <i className={styles.btn} />
          </div>
        </div>
        <svg className={styles.cursor} viewBox="0 0 24 24">
          <path d="M4 2l16 10-7 1.5L9.5 21z" />
        </svg>
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
