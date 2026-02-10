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

/* camelCase ↔ snake_case 변환 */
function toDB(s: Record<string, unknown>) {
  return {
    id: s.id,
    name: s.name,
    grade: s.grade,
    parent_contact: s.parentContact ?? "",
    student_contact: s.studentContact ?? "",
    first_visit: s.firstVisit ?? "",
    status: s.status ?? "새친구",
    last_attend: s.lastAttend ?? "",
    absence_weeks: s.absenceWeeks ?? 0,
    owner: s.owner ?? "",
    last_contact: s.lastContact ?? "",
    contact_method: s.contactMethod ?? "",
    reasons: s.reasons ?? [],
    memo: s.memo ?? "",
    track: s.track ?? [false, false, false, false],
    consent_checked: s.consentChecked ?? false,
    consent_image: s.consentImage ?? null,
    profile_image: s.profileImage ?? null,
    prayer: s.prayer ?? "",
  };
}

function fromDB(r: Record<string, unknown>) {
  return {
    id: r.id,
    name: r.name,
    grade: r.grade,
    parentContact: r.parent_contact ?? "",
    studentContact: r.student_contact ?? "",
    firstVisit: r.first_visit ?? "",
    status: r.status ?? "새친구",
    lastAttend: r.last_attend ?? "",
    absenceWeeks: r.absence_weeks ?? 0,
    owner: r.owner ?? "",
    lastContact: r.last_contact ?? "",
    contactMethod: r.contact_method ?? "",
    reasons: r.reasons ?? [],
    memo: r.memo ?? "",
    track: r.track ?? [false, false, false, false],
    consentChecked: r.consent_checked ?? false,
    consentImage: r.consent_image ?? null,
    profileImage: r.profile_image ?? null,
    prayer: r.prayer ?? "",
  };
}

/* GET: 전체 학생 목록 */
export async function GET() {
  if (!URL || !KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const res = await fetch(`${URL}/rest/v1/students?select=*&order=id`, {
    headers: sbHeaders(),
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: res.status });
  }
  const rows = (await res.json()) as Record<string, unknown>[];
  return NextResponse.json(rows.map(fromDB));
}

/* POST: 학생 등록 */
export async function POST(request: NextRequest) {
  if (!URL || !KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const body = await request.json();
  const dbRow = toDB(body);
  const res = await fetch(`${URL}/rest/v1/students`, {
    method: "POST",
    headers: sbHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(dbRow),
  });
  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }
  const rows = (await res.json()) as Record<string, unknown>[];
  return NextResponse.json(rows.length > 0 ? fromDB(rows[0]) : {});
}

/* PATCH: 학생 수정 */
export async function PATCH(request: NextRequest) {
  if (!URL || !KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const body = await request.json();
  const id = body.id;
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const dbRow = toDB(body);
  const res = await fetch(`${URL}/rest/v1/students?id=eq.${id}`, {
    method: "PATCH",
    headers: sbHeaders({ Prefer: "return=representation" }),
    body: JSON.stringify(dbRow),
  });
  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }
  const rows = (await res.json()) as Record<string, unknown>[];
  return NextResponse.json(rows.length > 0 ? fromDB(rows[0]) : {});
}

/* DELETE: 학생 삭제 */
export async function DELETE(request: NextRequest) {
  if (!URL || !KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  const res = await fetch(`${URL}/rest/v1/students?id=eq.${id}`, {
    method: "DELETE",
    headers: sbHeaders(),
  });
  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }
  return NextResponse.json({ ok: true });
}
