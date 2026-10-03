import { ingest } from '@/lib/ingest';
export const dynamic = 'force-dynamic';
export async function POST(req) { return Response.json(ingest(await req.json())); }
