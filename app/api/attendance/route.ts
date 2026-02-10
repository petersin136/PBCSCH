import { NextRequest, NextResponse } from "next/server";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

function sbHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: KEY!,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

/* GET: 전체 출석 기록 → { records: { key: status, ... } } */
export async function GET() {
  if (!URL || !KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const res = await fetch(`${URL}/rest/v1/attendance?select=*`, {
    headers: sbHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: res.status });
  }
  const rows = (await res.json()) as { key: string; status: string }[];
  const records: Record<string, string> = {};
  for (const r of rows) {
    records[r.key] = r.status;
  }
  return NextResponse.json({ records });
}

/* POST: 출석 upsert (key + status) */
export async function POST(request: NextRequest) {
  if (!URL || !KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const body = await request.json();
  const { key, status } = body as { key: string; status: string };
  if (!key || !status) {
    return NextResponse.json({ error: "key and status required" }, { status: 400 });
  }
  const res = await fetch(`${URL}/rest/v1/attendance`, {
    method: "POST",
    headers: sbHeaders({
      Prefer: "resolution=merge-duplicates,return=representation",
    }),
    body: JSON.stringify({ key, status }),
  });
  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }
  return NextResponse.json({ ok: true });
}
