import { NextResponse } from 'next/server';
import { databaseReachable } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await databaseReachable();
  return NextResponse.json({
    ok: true,
    service: 'grc-shield',
    storage: db ? 'postgres' : 'memory',
    time: new Date().toISOString(),
  });
}
