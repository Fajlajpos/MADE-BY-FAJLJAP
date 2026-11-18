import { NextResponse, type NextRequest } from 'next/server'

/**
 * Czech is the site's home language and keeps the plain addresses: `/` and everything not
 * under `/en` is served from the `cs` segment without showing it. `/cs/...` typed by hand
 * goes back to the plain address. English lives at `/en`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (pathname === '/en' || pathname.startsWith('/en/')) return

  if (pathname === '/cs' || pathname.startsWith('/cs/')) {
    const url = request.nextUrl.clone()
    url.pathname = pathname.slice(3) || '/'
    return NextResponse.redirect(url, 308)
  }

  const url = request.nextUrl.clone()
  url.pathname = `/cs${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // pages only: not Next's own files, the API, or anything with a file extension
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
