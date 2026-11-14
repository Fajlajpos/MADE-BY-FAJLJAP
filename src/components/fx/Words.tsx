import { Fragment, type CSSProperties } from 'react'
import { typo } from '@/lib/typo/czech'

/**
 * A heading split into words, each in its own mask: when the heading (a `[data-reveal]`) enters
 * the viewport, the words rise into place one after another (globals.css › Words). The text
 * stays one plain string for screen readers and search.
 */
export function Words({ text }: { text: string }) {
  // typo() glues short words to the next one with a no-break space, so they rise together
  const words = typo(text).split(' ')
  return (
    <>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className="w" style={{ '--wi': i } as CSSProperties}>
            <span>{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  )
}
