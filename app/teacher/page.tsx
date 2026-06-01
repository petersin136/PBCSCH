"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabaseClient";
import { BOOKS, BOOK_ORDER, type BookId } from "../bible-reading/books";

type AuthState = "loading" | "signed_out" | "signed_in";

type TeacherRow = {
  id: string;
  user_id: string;
  name: string;
  class_id: string;
};

type ClassRow = {
  id: string;
  name: string;
};

type StudentRow = {
  id: string;
  class_id: string;
  name: string;
};

type LogRow = {
  id: string;
  student_id: string;
  class_id: string;
  book: BookId;
  chapter: number;
  translation: "krv" | "kids";
  completed_at: string;
};

type SortKey = "name" | "progress" | "recent";

const formatDateTime = (iso: string) => {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
  } catch {
    return iso;
  }
};

export default function TeacherPage() {
  const configured = useMemo(() => isSupabaseConfigured(), []);
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [authState, setAuthState] = useState<AuthState>("loading");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const [teacher, setTeacher] = useState<TeacherRow | null>(null);
  const [teacherClass, setTeacherClass] = useState<ClassRow | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [book, setBook] = useState<BookId>("proverbs");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("progress");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setAuthState("signed_out");
      return;
    }
    let unsub: (() => void) | null = null;
    (async () => {
      const { data } = await supabase.auth.getSession();
      setAuthState(data.session ? "signed_in" : "signed_out");
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setAuthState(session ? "signed_in" : "signed_out");
      });
      unsub = () => sub.subscription.unsubscribe();
    })();
    return () => {
      if (unsub) unsub();
    };
  }, [supabase]);

  const loadTeacherContext = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const { data: tList, error: tErr } = await supabase
        .from("br_teachers")
        .select("id, user_id, name, class_id")
        .limit(1);
      if (tErr) throw tErr;
      const t = (tList && tList[0]) as TeacherRow | undefined;
      if (!t) {
        setErrorMsg(
          "이 계정에 연결된 선생님 정보가 없어요. SQL Editor에서 br_teachers에 본인 행을 등록해 주세요.",
        );
        setTeacher(null);
        setTeacherClass(null);
        setStudents([]);
        setLogs([]);
        return;
      }
      setTeacher(t);

      const { data: cList, error: cErr } = await supabase
        .from("br_classes")
        .select("id, name")
        .eq("id", t.class_id)
        .limit(1);
      if (cErr) throw cErr;
      setTeacherClass((cList && cList[0]) ?? null);

      const { data: sList, error: sErr } = await supabase
        .from("br_students")
        .select("id, class_id, name")
        .eq("class_id", t.class_id)
        .order("name", { ascending: true });
      if (sErr) throw sErr;
      setStudents((sList ?? []) as StudentRow[]);
    } catch (e) {
      console.warn(e);
      setErrorMsg(
        "선생님 정보 또는 학생 목록을 불러오지 못했어요. RLS 정책과 데이터 등록을 확인해 주세요.",
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const loadLogs = useCallback(async () => {
    if (!supabase || !teacher) return;
    try {
      const { data, error } = await supabase
        .from("br_reading_logs")
        .select(
          "id, student_id, class_id, book, chapter, translation, completed_at",
        )
        .eq("class_id", teacher.class_id)
        .eq("book", book);
      if (error) throw error;
      setLogs((data ?? []) as LogRow[]);
    } catch (e) {
      console.warn(e);
      setErrorMsg("읽기 기록을 불러오지 못했어요.");
    }
  }, [book, supabase, teacher]);

  useEffect(() => {
    if (authState === "signed_in") {
      void loadTeacherContext();
    }
  }, [authState, loadTeacherContext]);

  useEffect(() => {
    if (authState !== "signed_in" || !teacher) return;
    void loadLogs();
  }, [authState, teacher, loadLogs]);

  useEffect(() => {
    if (!supabase || !teacher) return;
    const channel = supabase
      .channel(`br_reading_logs_class_${teacher.class_id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "br_reading_logs",
          filter: `class_id=eq.${teacher.class_id}`,
        },
        (payload) => {
          const newRow = payload.new as LogRow | undefined;
          const oldRow = payload.old as LogRow | undefined;
          setLogs((prev) => {
            if (payload.eventType === "DELETE" && oldRow) {
              return prev.filter((r) => r.id !== oldRow.id);
            }
            if (!newRow) return prev;
            if (newRow.book !== book) return prev;
            const idx = prev.findIndex((r) => r.id === newRow.id);
            if (idx >= 0) {
              const copy = prev.slice();
              copy[idx] = newRow;
              return copy;
            }
            return [...prev, newRow];
          });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [book, supabase, teacher]);

  const studentStats = useMemo(() => {
    const totalChapters = BOOKS[book].totalChapters;
    return students.map((s) => {
      const studentLogs = logs.filter((l) => l.student_id === s.id);
      const chapterSet = new Set<number>();
      studentLogs.forEach((l) => chapterSet.add(l.chapter));
      const latest = studentLogs.reduce<LogRow | null>((acc, l) => {
        if (!acc) return l;
        return l.completed_at > acc.completed_at ? l : acc;
      }, null);
      return {
        student: s,
        chapters: chapterSet,
        readCount: chapterSet.size,
        totalChapters,
        latest,
      };
    });
  }, [book, logs, students]);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? studentStats.filter((row) =>
          row.student.name.toLowerCase().includes(q),
        )
      : studentStats;
    const sorted = filtered.slice();
    if (sortKey === "name") {
      sorted.sort((a, b) =>
        a.student.name.localeCompare(b.student.name, "ko"),
      );
    } else if (sortKey === "progress") {
      sorted.sort((a, b) => b.readCount - a.readCount);
    } else {
      sorted.sort((a, b) => {
        const at = a.latest?.completed_at ?? "";
        const bt = b.latest?.completed_at ?? "";
        return bt.localeCompare(at);
      });
    }
    return sorted;
  }, [search, sortKey, studentStats]);

  const handleSignIn = useCallback(async () => {
    if (!supabase) return;
    setAuthError(null);
    setAuthBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword,
      });
      if (error) {
        setAuthError(error.message);
      }
    } finally {
      setAuthBusy(false);
    }
  }, [authEmail, authPassword, supabase]);

  const handleSignOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setTeacher(null);
    setTeacherClass(null);
    setStudents([]);
    setLogs([]);
  }, [supabase]);

  const headerEyebrow = "담임 대시보드";
  const headerTitle =
    authState === "signed_in" && (teacherClass || teacher)
      ? `${teacherClass ? teacherClass.name : ""}${
          teacher ? `${teacherClass ? " · " : ""}${teacher.name} 선생님` : ""
        }`
      : "담임 선생님";

  const renderHeader = () => (
    <header className="tch-header">
      <div className="tch-header-text">
        <p className="tch-eyebrow">{headerEyebrow}</p>
        <h1>{headerTitle}</h1>
      </div>
      <div className="tch-header-actions">
        <Link href="/" className="tch-home-link" aria-label="홈으로">
          <span aria-hidden="true">←</span> 홈으로
        </Link>
        {authState === "signed_in" ? (
          <button
            type="button"
            className="tch-signout"
            onClick={handleSignOut}
          >
            로그아웃
          </button>
        ) : null}
      </div>
    </header>
  );

  if (!configured) {
    return (
      <main className="tch-page">
        <div className="tch-shell">
          {renderHeader()}
          <div className="tch-empty">
            <h2>설정이 필요합니다</h2>
            <p>
              <code>.env.local</code>에 <code>NEXT_PUBLIC_SUPABASE_URL</code>과
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>를 입력해 주세요.
            </p>
          </div>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  if (authState === "loading") {
    return (
      <main className="tch-page">
        <div className="tch-shell">
          {renderHeader()}
          <div className="tch-empty">불러오는 중…</div>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  if (authState === "signed_out") {
    return (
      <main className="tch-page">
        <div className="tch-shell">
          {renderHeader()}
          <div className="tch-login">
            <h2>담임 선생님 로그인</h2>
            <p className="tch-sub">
              등록된 이메일과 비밀번호로 로그인하면 우리 반 진도를 볼 수 있어요.
            </p>
            <label className="tch-field">
              <span>이메일</span>
              <input
                type="email"
                autoComplete="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </label>
            <label className="tch-field">
              <span>비밀번호</span>
              <input
                type="password"
                autoComplete="current-password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleSignIn();
                }}
              />
            </label>
            <button
              type="button"
              className="tch-primary"
              onClick={() => void handleSignIn()}
              disabled={authBusy || !authEmail || !authPassword}
            >
              {authBusy ? "로그인 중…" : "로그인"}
            </button>
            {authError ? <div className="tch-error">{authError}</div> : null}
            <p className="tch-hint">
              계정이 없다면 Supabase 대시보드 → Authentication → Users에서
              추가해 주세요. 그 다음 SQL Editor에서 <code>br_teachers</code>에
              <code>user_id</code>(= auth user id)와 담당 <code>class_id</code>를
              연결합니다.
            </p>
          </div>
        </div>
        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="tch-page">
      <div className="tch-shell">
      {renderHeader()}

      {errorMsg ? <div className="tch-error">{errorMsg}</div> : null}

      <section className="tch-controls">
        <label className="tch-control">
          <span>책</span>
          <select
            value={book}
            onChange={(e) => setBook(e.target.value as BookId)}
          >
            {BOOK_ORDER.map((id) => (
              <option key={id} value={id}>
                {BOOKS[id].name} ({BOOKS[id].totalChapters}장)
              </option>
            ))}
          </select>
        </label>
        <label className="tch-control">
          <span>정렬</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
          >
            <option value="progress">진도순 (많이 읽은 순)</option>
            <option value="recent">최근 읽은 순</option>
            <option value="name">이름순</option>
          </select>
        </label>
        <label className="tch-control tch-control-grow">
          <span>이름 검색</span>
          <input
            type="search"
            placeholder="이름 일부 입력"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="tch-control tch-control-meta">
          <span>실시간</span>
          <div className="tch-live">
            <span className="tch-live-dot" /> 자동 갱신
          </div>
        </div>
      </section>

      {students.length > 0 ? (
        <section
          className="tch-name-list"
          aria-label="우리 반 학생 이름"
        >
          <div className="tch-name-list-head">
            <span className="tch-name-list-title">우리 반 학생</span>
            <span className="tch-name-list-count">{students.length}명</span>
          </div>
          <div className="tch-name-list-chips">
            {students.map((s) => {
              const isActive = search.trim() !== "" && s.name === search;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`tch-name-chip ${isActive ? "is-active" : ""}`}
                  onClick={() => setSearch(isActive ? "" : s.name)}
                  title={`${s.name} 보기`}
                >
                  {s.name}
                </button>
              );
            })}
            {search ? (
              <button
                type="button"
                className="tch-name-chip tch-name-chip-clear"
                onClick={() => setSearch("")}
              >
                전체 보기
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {loading ? <div className="tch-empty">불러오는 중…</div> : null}

      {!loading && filteredSorted.length === 0 ? (
        <div className="tch-empty">
          표시할 학생이 없어요. 학생을 등록하거나 검색어를 확인해 주세요.
        </div>
      ) : null}

      <section className="tch-grid">
        {filteredSorted.map((row) => {
          const total = row.totalChapters;
          const pct = total > 0 ? Math.round((row.readCount / total) * 100) : 0;
          return (
            <article key={row.student.id} className="tch-card">
              <header className="tch-card-head">
                <div>
                  <h2>{row.student.name}</h2>
                  <p className="tch-card-sub">
                    {row.readCount} / {total}장 ({pct}%)
                  </p>
                </div>
                <div className="tch-card-meta">
                  {row.latest
                    ? `최근 ${row.latest.chapter}장 · ${formatDateTime(row.latest.completed_at)}`
                    : "아직 기록 없음"}
                </div>
              </header>
              <div className="tch-mini-grid">
                {Array.from({ length: total }, (_, i) => i + 1).map((ch) => (
                  <span
                    key={ch}
                    className={`tch-cell ${
                      row.chapters.has(ch) ? "is-done" : ""
                    }`}
                    title={`${ch}장`}
                  >
                    {ch}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </section>
      </div>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  .tch-page {
    min-height: 100vh;
    background: #fdfaf3;
    color: #2c2417;
    font-family: "Noto Sans KR", system-ui, -apple-system, sans-serif;
    width: 100%;
  }
  .tch-shell {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding-left: clamp(10px, 3vw, 36px);
    padding-right: clamp(10px, 3vw, 36px);
    box-sizing: border-box;
  }
  .tch-shell > * {
    width: 100%;
    box-sizing: border-box;
  }
  .tch-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding-top: 18px;
    padding-bottom: 6px;
    flex-wrap: wrap;
  }
  .tch-header-text {
    min-width: 0;
    flex: 1 1 auto;
  }
  .tch-header-actions {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }
  .tch-eyebrow {
    margin: 0;
    font-size: 10px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #8a7c61;
    font-weight: 600;
  }
  .tch-header h1 {
    margin: 2px 0 0;
    font-size: 17px;
    color: #2c2417;
    font-weight: 700;
    line-height: 1.3;
    word-break: keep-all;
  }
  .tch-home-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: transparent;
    border: 1px solid #d8cdb4;
    padding: 5px 9px;
    border-radius: 7px;
    color: #4f4530;
    font-weight: 600;
    font-size: 12px;
    text-decoration: none;
    line-height: 1.1;
    white-space: nowrap;
  }
  .tch-home-link:hover {
    background: #f6f1e6;
  }
  .tch-signout {
    background: transparent;
    border: none;
    padding: 4px 2px;
    cursor: pointer;
    color: #8a7c61;
    font-weight: 500;
    font-size: 12px;
    line-height: 1.1;
    font-family: inherit;
  }
  .tch-signout:hover {
    color: #4f4530;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .tch-login {
    max-width: 460px;
    margin: 8vh auto;
    padding: 28px 26px;
    background: #fff;
    border: 1px solid #d8cdb4;
    border-radius: 18px;
    box-shadow: 0 6px 24px rgba(64, 51, 28, 0.08);
  }
  .tch-login h1 {
    margin: 0 0 8px;
    font-size: 22px;
    color: #2c2417;
  }
  .tch-sub {
    margin: 0 0 18px;
    color: #6b5f47;
    font-size: 14px;
    line-height: 1.55;
  }
  .tch-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }
  .tch-field span {
    font-size: 12px;
    color: #6b5f47;
    font-weight: 600;
  }
  .tch-field input,
  .tch-control select,
  .tch-control input {
    padding: 9px 11px;
    border: 1px solid #d8cdb4;
    background: #fff;
    color: #2c2417;
    border-radius: 9px;
    font-size: 13px;
    outline: none;
    font-family: inherit;
    line-height: 1.3;
    /* select 가 가장 긴 option 만큼 늘어나지 않도록 부모 폭에 맞춰 잠근다. */
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    text-overflow: ellipsis;
  }
  .tch-field input:focus,
  .tch-control select:focus,
  .tch-control input:focus {
    border-color: #1e3a5f;
  }
  .tch-primary {
    width: 100%;
    padding: 12px;
    background: #1e3a5f;
    color: #fdfaf3;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    font-size: 15px;
    margin-top: 4px;
  }
  .tch-primary:disabled {
    background: #c8b99d;
    color: #fff;
    cursor: not-allowed;
  }
  .tch-hint {
    margin-top: 16px;
    font-size: 12px;
    color: #6b5f47;
    line-height: 1.7;
  }
  .tch-hint code {
    background: #f6f1e6;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11.5px;
    color: #4f4530;
  }
  .tch-error {
    margin: 8px 0 14px;
    padding: 10px 12px;
    background: #fbeee6;
    border: 1px solid #e7c8b1;
    border-radius: 10px;
    color: #8a3a16;
    font-size: 13px;
    white-space: pre-line;
  }
  .tch-controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 10px;
    margin: 12px 0 14px;
    padding: 12px;
    background: #f6f1e6;
    border: 1px solid rgba(148, 134, 109, 0.3);
    border-radius: 14px;
    width: 100%;
    box-sizing: border-box;
  }
  .tch-control {
    display: flex;
    flex-direction: column;
    gap: 6px;
    /* grid 아이템은 기본 min-width 가 min-content 라서, select 의 가장 긴
       option 텍스트 길이만큼 셀이 부풀어 부모 폭을 넘어가는 일이 발생한다.
       0 으로 풀어줘야 부모 grid track(1fr)에 맞게 줄어든다. */
    min-width: 0;
  }
  .tch-control span {
    font-size: 11px;
    font-weight: 600;
    color: #8a7c61;
    letter-spacing: 0.3px;
  }
  .tch-control-grow {
    grid-column: span 2;
  }
  .tch-control-meta {
    justify-content: flex-end;
  }
  .tch-live {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 11px;
    background: #ecfdf5;
    border: 1px solid #bbf7d0;
    border-radius: 999px;
    color: #047857;
    font-size: 12px;
    font-weight: 600;
    width: fit-content;
    line-height: 1.2;
  }
  .tch-live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.18);
  }
  .tch-empty {
    padding: 32px;
    text-align: center;
    color: #6b5f47;
    background: #f6f1e6;
    border: 1px dashed #c8b99d;
    border-radius: 14px;
    margin-top: 8px;
    margin-bottom: 24px;
  }
  .tch-name-list {
    margin: 0 0 14px;
    padding: 10px 12px;
    background: #fff;
    border: 1px solid #e6dcc4;
    border-radius: 12px;
  }
  .tch-name-list-head {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 8px;
  }
  .tch-name-list-title {
    font-size: 12px;
    font-weight: 600;
    color: #8a7c61;
    letter-spacing: 0.3px;
  }
  .tch-name-list-count {
    font-size: 11px;
    color: #a89c80;
    font-weight: 600;
  }
  .tch-name-list-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .tch-name-chip {
    appearance: none;
    background: #f6f1e6;
    border: 1px solid #e0d5bb;
    color: #4f4530;
    padding: 5px 11px;
    border-radius: 999px;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    line-height: 1.2;
  }
  .tch-name-chip:hover {
    background: #ede4cf;
  }
  .tch-name-chip.is-active {
    background: #1e3a5f;
    color: #fdfaf3;
    border-color: #1e3a5f;
  }
  .tch-name-chip-clear {
    background: #fff;
    color: #8a3a16;
    border-color: #e7c8b1;
  }
  .tch-name-chip-clear:hover {
    background: #fbeee6;
  }
  .tch-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 14px;
    padding-bottom: 40px;
    width: 100%;
    justify-items: stretch;
  }
  .tch-card {
    background: #fff;
    border: 1px solid #d8cdb4;
    border-radius: 16px;
    padding: 16px 18px;
    box-shadow: 0 4px 14px rgba(64, 51, 28, 0.06);
    width: 100%;
    min-width: 0;
  }
  .tch-card-head {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  .tch-card-head h2 {
    margin: 0;
    font-size: 16px;
    color: #2c2417;
    font-weight: 700;
  }
  .tch-card-sub {
    margin: 4px 0 0;
    font-size: 13px;
    color: #4f4530;
    font-weight: 600;
  }
  .tch-card-meta {
    font-size: 11px;
    color: #8a7c61;
    text-align: right;
    max-width: 55%;
    line-height: 1.5;
  }
  .tch-mini-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
  }
  .tch-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1 / 1;
    background: #f6f1e6;
    border-radius: 6px;
    font-size: 10px;
    color: #a89c80;
    font-weight: 600;
  }
  .tch-cell.is-done {
    background: #1e3a5f;
    color: #fdfaf3;
    font-weight: 700;
  }
  @media (max-width: 600px) {
    .tch-shell {
      padding-left: 12px;
      padding-right: 12px;
    }
    .tch-header {
      padding-top: 12px;
      padding-bottom: 4px;
      gap: 8px;
    }
    .tch-eyebrow {
      font-size: 9.5px;
      letter-spacing: 0.8px;
    }
    .tch-header h1 {
      font-size: 15.5px;
      line-height: 1.35;
    }
    .tch-home-link {
      padding: 4px 8px;
      font-size: 11.5px;
    }
    .tch-signout {
      font-size: 11.5px;
    }
    .tch-header-actions {
      gap: 8px;
    }
    .tch-controls {
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding: 10px;
      margin: 10px 0 12px;
    }
    .tch-control-grow {
      grid-column: span 1;
    }
    .tch-control span {
      font-size: 10.5px;
    }
    .tch-field input,
    .tch-control select,
    .tch-control input {
      padding: 8px 10px;
      font-size: 13px;
      border-radius: 8px;
    }
    .tch-live {
      padding: 6px 10px;
      font-size: 11.5px;
    }
    .tch-card-head {
      flex-direction: column;
    }
    .tch-card-meta {
      max-width: 100%;
      text-align: left;
    }
    .tch-mini-grid {
      grid-template-columns: repeat(7, 1fr);
    }
    .tch-name-list {
      padding: 10px 12px;
    }
    .tch-name-chip {
      padding: 4px 10px;
      font-size: 12px;
    }
    .tch-card {
      padding: 14px 14px;
    }
    .tch-card-head h2 {
      font-size: 15px;
    }
    .tch-card-sub {
      font-size: 12.5px;
    }
  }
`;
