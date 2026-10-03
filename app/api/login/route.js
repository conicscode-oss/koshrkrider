import { cookies } from 'next/headers';
export async function POST(req) {
  const { user, pass } = await req.json();
  const U = process.env.ADMIN_USER || 'admin', P = process.env.ADMIN_PASS || '12345';
  if (user !== U || pass !== P) return Response.json({ ok: false }, { status: 401 });
  cookies().set('kr', process.env.SESSION_SECRET || 'koshrk-rider-secret', { httpOnly: true, maxAge: 31536000, path: '/', sameSite: 'lax' });
  return Response.json({ ok: true });
}
