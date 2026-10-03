import { deviceKey } from '@/lib/store';
export const dynamic = 'force-dynamic';
export async function GET(req) { return Response.json({ url: new URL(req.url).origin + '/api/traccar', id: deviceKey() }); }
