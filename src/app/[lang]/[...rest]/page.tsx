import { notFound } from 'next/navigation'

/**
 * Any address that is not a page (`/neexistuje`, `/en/nope`): sends it to the 404 inside the
 * language's own layout, so it gets the snowed-in page in Czech or English, not Next's default.
 */
export default function Missing() {
  notFound()
}
