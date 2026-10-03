import { ingest } from '@/lib/ingest';
import { deviceKey } from '@/lib/store';
export const dynamic = 'force-dynamic';

async function handle(req) {
  const q = new URL(req.url).searchParams;
  let get = (k) => q.get(k);
  if (req.method === 'POST' && !q.get('id')) {
    try { const f = new URLSearchParams(await req.text()); get = (k) => f.get(k); } catch {}
  }
  if (get('id') !== deviceKey() && get('key') !== deviceKey()) return new Response('forbidden', { status: 403 });
  const num = (k) => (get(k) != null && get(k) !== '' ? Number(get(k)) : null);
  const r = ingest({
    lat: num('lat'), lng: num('lon'),
    speed: (num('speed') || 0) * 0.514444, // knots -> m/s
    acc: num('accuracy') ?? 0,
    battery: num('batt'),
    charging: get('charge') === 'true',
  });
  return new Response('OK', { status: r.ok ? 200 : 500 });
}
export const GET = handle, POST = handle;
