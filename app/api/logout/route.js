import { cookies } from 'next/headers';
export async function POST() { cookies().delete('kr'); return Response.json({ ok: true }); }
