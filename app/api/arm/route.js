import { getState, save } from '@/lib/store';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { armed, radius } = await req.json();
  const s = getState();
  if (armed) {
    if (!s.last || s.last.lat == null) return Response.json({ ok: false, error: 'Bike ki location abhi nahi mili. Pehle bike wale mobile me Tracker chalao.' });
    s.armPos = { lat: s.last.lat, lng: s.last.lng };
    s.radius = Math.min(200, Math.max(5, Number(radius) || 20));
  } else s.armPos = null;
  s.armed = !!armed; s.alarm = false; s.reason = ''; s.lastPush = 0;
  save();
  return Response.json({ ok: true, state: s });
}
