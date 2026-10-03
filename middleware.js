import { NextResponse } from 'next/server';

const open = ['/login', '/api/login', '/manifest.json', '/sw.js', '/icon-'];

export function middleware(req) {
  const p = req.nextUrl.pathname;
  if (open.some((o) => p.startsWith(o))) return NextResponse.next();
  const secret = process.env.SESSION_SECRET || 'koshrk-rider-secret';
  if (req.cookies.get('kr')?.value === secret) return NextResponse.next();
  if (p.startsWith('/api/')) return NextResponse.json({ error: 'auth' }, { status: 401 });
  const url = req.nextUrl.clone(); url.pathname = '/login';
  return NextResponse.redirect(url);
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
