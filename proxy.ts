import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const WINDOW_SEC = 60
const MAX_TEACHING = 45
const MAX_API = 20

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname

  if (path.startsWith('/teachings')) {
    return rateLimit(request, 'rl_t', MAX_TEACHING)
  }

  if (
    path.startsWith('/api/save-teaching') ||
    path.startsWith('/api/send-teaching') ||
    path.startsWith('/api/welcome-email') ||
    path.startsWith('/api/checkout')
  ) {
    return rateLimit(request, 'rl_a', MAX_API)
  }

  return NextResponse.next()
}

function rateLimit(
  request: NextRequest,
  cookieName: string,
  max: number
) {
  const now = Math.floor(Date.now() / 1000)
  const raw = request.cookies.get(cookieName)?.value

  let start = now
  let count = 0

  if (raw) {
    const parts = raw.split(':')
    const s = parseInt(parts[0], 10)
    const c = parseInt(parts[1], 10)
    if (!Number.isNaN(s) && !Number.isNaN(c) && now - s < WINDOW_SEC) {
      start = s
      count = c
    }
  }

  count += 1

  if (count > max) {
    const retry = Math.max(1, WINDOW_SEC - (now - start))
    return new NextResponse(
      'Too many requests. Please wait a moment, then try again.',
      {
        status: 429,
        headers: {
          'Retry-After': String(retry),
          'Content-Type': 'text/plain; charset=utf-8',
        },
      }
    )
  }

  const res = NextResponse.next()
  res.cookies.set(cookieName, `${start}:${count}`, {
    path: '/',
    maxAge: WINDOW_SEC,
    sameSite: 'lax',
    httpOnly: true,
  })
  return res
}

export const config = {
  matcher: [
    '/teachings/:path*',
    '/api/save-teaching',
    '/api/send-teaching',
    '/api/welcome-email',
    '/api/checkout',
  ],
}