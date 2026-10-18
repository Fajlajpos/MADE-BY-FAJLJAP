import { printRow, type PrintLayout } from './drift'

/**
 * Prints the page's ground off the main thread. Ground.tsx sends the layout and the rows to
 * print; rows go out nearest the screen first, in small batches, so scrolling never waits on the
 * noise. A new `print` replaces the job; `focus` only reorders what is left of it.
 */

export type GroundJob = {
  type: 'print'
  /** Echoed back so the page can drop batches from a layout it has moved on from. */
  gen: number
  layout: PrintLayout
  /** Rows [from, to) to print. */
  from: number
  to: number
  /** The row in the middle of the screen. */
  focus: number
}

export type GroundFocus = { type: 'focus'; focus: number }

export type GroundBatch = {
  gen: number
  /** Page rows of this batch, in order of `data`. */
  rows: number[]
  /** rows.length × layout.cols densities. */
  data: Float32Array
}

const BATCH = 12

let job: GroundJob | null = null
/** Rows of the current job not printed yet. */
let todo = new Set<number>()
let focus = 0
let scheduled = false

/** The unprinted rows nearest the focus, outward in both directions. */
function nearest(count: number) {
  const out: number[] = []
  if (!job) return out
  for (let d = 0; out.length < count && (focus - d >= job.from || focus + d < job.to); d++) {
    if (todo.has(focus + d)) out.push(focus + d)
    if (d > 0 && out.length < count && todo.has(focus - d)) out.push(focus - d)
  }
  return out
}

function work() {
  scheduled = false
  if (!job || todo.size === 0) return
  const { layout, gen } = job
  const rows = nearest(BATCH)
  const data = new Float32Array(rows.length * layout.cols)
  rows.forEach((row, i) => {
    printRow(layout, row, data.subarray(i * layout.cols, (i + 1) * layout.cols))
    todo.delete(row)
  })
  const batch: GroundBatch = { gen, rows, data }
  self.postMessage(batch, { transfer: [data.buffer] })
  schedule()
}

/** Yields between batches so a newer job or focus can come in. */
function schedule() {
  if (scheduled || todo.size === 0) return
  scheduled = true
  setTimeout(work, 0)
}

self.onmessage = (event: MessageEvent<GroundJob | GroundFocus>) => {
  const msg = event.data
  if (msg.type === 'print') {
    job = msg
    focus = msg.focus
    todo = new Set()
    for (let r = msg.from; r < msg.to; r++) todo.add(r)
  } else {
    focus = msg.focus
  }
  schedule()
}
