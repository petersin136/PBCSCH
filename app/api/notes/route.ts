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

/* POST: 노트 upsert (student_id, year, month, week, note, prayer) — 있으면 수정, 없으면 추가 */
export async function POST(request: NextRequest) {
  if (!SB_URL || !SB_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const body = await request.json();
  const { student_id, year, month, week, note, prayer } = body;
  if (!student_id || year == null || !month || !week) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  const noteVal = note ?? "";
  const prayerVal = prayer ?? "";

  /* 같은 학생·년·월·주 기존 행 조회 */
  const checkRes = await fetch(
    `${SB_URL}/rest/v1/student_notes?student_id=eq.${student_id}&year=eq.${year}&month=eq.${month}&week=eq.${week}&select=id`,
    { headers: sbHeaders(), cache: "no-store" }
  );
  if (!checkRes.ok) {
    return NextResponse.json({ error: "fetch failed" }, { status: checkRes.status });
  }
  const existing = await checkRes.json();
  const existingId = Array.isArray(existing) && existing[0] ? (existing[0] as { id: number }).id : null;

  if (existingId != null) {
    /* 기존 행 수정 */
    const patchRes = await fetch(`${SB_URL}/rest/v1/student_notes?id=eq.${existingId}`, {
      method: "PATCH",
      headers: sbHeaders(),
      body: JSON.stringify({ note: noteVal, prayer: prayerVal }),
    });
    if (!patchRes.ok) {
      const err = await patchRes.text();
      return NextResponse.json({ error: err }, { status: patchRes.status });
    }
    return NextResponse.json({ ok: true });
  }

  /* 새 행 추가 */
  const res = await fetch(`${SB_URL}/rest/v1/student_notes`, {
    method: "POST",
    headers: sbHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify({
      student_id,
      year: Number(year),
      month: Number(month),
      week: Number(week),
      note: noteVal,
      prayer: prayerVal,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }
  return NextResponse.json({ ok: true });
}
