import { NextRequest, NextResponse } from "next/server";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

function sbHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: SB_KEY!,
    Authorization: `Bearer ${SB_KEY}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

/* GET: 특정 학생의 노트 목록 → ?student_id=123 */
export async function GET(request: NextRequest) {
  if (!SB_URL || !SB_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const sid = request.nextUrl.searchParams.get("student_id");
  if (!sid) {
    return NextResponse.json({ error: "student_id required" }, { status: 400 });
  }
  const res = await fetch(
    `${SB_URL}/rest/v1/student_notes?student_id=eq.${sid}&select=*&order=year.desc,month.desc,week.desc`,
    { headers: sbHeaders(), cache: "no-store" }
  );
  if (!res.ok) {
    return NextResponse.json({ error: "fetch failed" }, { status: res.status });
  }
  const rows = await res.json();
  return NextResponse.json(rows);
}

/* POST: 노트 upsert (student_id, year, month, week, note, prayer) */
export async function POST(request: NextRequest) {
  if (!SB_URL || !SB_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const body = await request.json();
  const { student_id, year, month, week, note, prayer } = body;
  if (!student_id || !year || !month || !week) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const res = await fetch(`${SB_URL}/rest/v1/student_notes`, {
    method: "POST",
    headers: sbHeaders({
      Prefer: "resolution=merge-duplicates,return=representation",
    }),
    body: JSON.stringify({ student_id, year, month, week, note: note || "", prayer: prayer || "" }),
  });
  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }
  return NextResponse.json({ ok: true });
}
