import Link from 'next/link'
import { AsciiShape } from '@/components/ascii/AsciiShape'
import { Glyphs } from '@/components/ascii/Glyphs'
import { home, type CraftItem } from '@/content/home'
import type { ShapeKind } from '@/lib/ascii/shapes'
import { typo } from '@/lib/typo/czech'
import shared from './home.module.css'
import styles from './Craft.module.css'

function Side({
  title,
  items,
  shape,
  seed,
}: {
  title: string
  items: CraftItem[]
  shape: ShapeKind
  seed: number
}) {
  return (
    <div className={styles.side}>
      <div className={styles.model}>
        <AsciiShape shape={shape} seed={seed} cellSize={7} />
      </div>
      <Glyphs as="h3" className={styles.title} cellSize={6}>
        {title}
      </Glyphs>
      <ul className={styles.list} role="list">
        {items.map((item) => (
          <li key={item.title} className={styles.item}>
            <p className={styles.itemTitle}>
              {item.title}
              {item.tag ? <span className={`meta ${styles.tag}`}>{item.tag}</span> : null}
            </p>
            <p className={styles.itemBody}>{typo(item.body)}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** What I do, split in two: code under turning braces, graphics under a turning pen nib. */
export function Craft() {
  const { craft } = home
  return (
    <section
      data-ground="diagonal"
      id="co-delam"
      className={shared.section}
      aria-labelledby="co-delam-title"
    >
      <div className={`${shared.veil} ${styles.head}`}>
        <h2 id="co-delam-title" className={shared.label}>
          <span>{craft.index}</span>
          <b>{craft.label}</b>
        </h2>
        <p className={shared.lead}>{typo(craft.lead)}</p>
      </div>

      <div className={styles.split}>
        <Side title={craft.code.title} items={craft.code.items} shape="braces" seed={1} />
        <Side title={craft.graphics.title} items={craft.graphics.items} shape="pen" seed={4} />
      </div>

      <Link className={`${shared.button} ${shared.ghost} ${styles.more}`} href="/sluzby">
        {craft.linkLabel}
        <span className={shared.arrow} aria-hidden="true">
          -&gt;
        </span>
      </Link>
    </section>
  )
}
