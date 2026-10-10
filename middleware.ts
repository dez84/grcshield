import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Ensures every device has a stable anonymous identifier. This lets a learner
 * start immediately without signing up, while still persisting progress. They
 * can later bind an email to sync across devices.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (!req.cookies.get('grc_device')?.value) {
    res.cookies.set('grc_device', crypto.randomUUID(), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icons|favicon.ico|sw.js|manifest.json).*)'],
};
