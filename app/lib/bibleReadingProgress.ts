"use client";

import { getSupabaseClient } from "./supabaseClient";
import type { BookId } from "../bible-reading/books";

export type BibleClass = {
  id: string;
  name: string;
};

export type BibleStudent = {
  id: string;
  class_id: string;
  name: string;
};

export type ReadingLogRow = {
  id: string;
  student_id: string;
  class_id: string;
  book: BookId;
  chapter: number;
  translation: "krv" | "kids";
  completed_at: string;
};

export type IdentifiedStudent = {
  id: string;
  name: string;
  classId: string;
  className?: string;
};

const STUDENT_STORAGE_KEY = "pbcs_bible_student_v1";
const PENDING_LOGS_KEY = "pbcs_bible_pending_logs_v1";

export function loadStoredStudent(): IdentifiedStudent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STUDENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IdentifiedStudent;
    if (parsed && parsed.id && parsed.name && parsed.classId) return parsed;
  } catch {
    // ignore
  }
  return null;
}

export function storeStudent(student: IdentifiedStudent) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(student));
}

export function clearStoredStudent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STUDENT_STORAGE_KEY);
}

export async function fetchClasses(): Promise<BibleClass[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("br_classes")
    .select("id, name")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BibleClass[];
}

export async function fetchStudentsByClass(
  classId: string,
): Promise<BibleStudent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("br_students")
    .select("id, class_id, name")
    .eq("class_id", classId)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as BibleStudent[];
}

export async function verifyStudentPin(
  studentId: string,
  pin: string,
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("br_verify_student", {
    p_student_id: studentId,
    p_pin: pin,
  });
  if (error) {
    console.warn("verifyStudentPin failed", error);
    return false;
  }
  return data === true;
}

export async function checkStudentHasPin(studentId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("br_student_has_pin", {
    p_student_id: studentId,
  });
  if (error) {
    console.warn("checkStudentHasPin failed", error);
    return false;
  }
  return data === true;
}

export type SetPinResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "already_set" | "server_error"; message?: string };

export async function setStudentPin(
  studentId: string,
  pin: string,
): Promise<SetPinResult> {
  const supabase = getSupabaseClient();
  if (!supabase) return { ok: false, reason: "not_configured" };
  const { data, error } = await supabase.rpc("br_set_student_pin", {
    p_student_id: studentId,
    p_pin: pin,
  });
  if (error) {
    console.warn("setStudentPin failed", error);
    return { ok: false, reason: "server_error", message: error.message };
  }
  if (data === true) return { ok: true };
  return { ok: false, reason: "already_set" };
}

export async function fetchCompletedChapters(
  studentId: string,
  book: BookId,
): Promise<ReadingLogRow[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("br_reading_logs")
    .select("id, student_id, class_id, book, chapter, translation, completed_at")
    .eq("student_id", studentId)
    .eq("book", book);
  if (error) throw error;
  return (data ?? []) as ReadingLogRow[];
}

type PendingLog = {
  studentId: string;
  classId: string;
  book: BookId;
  chapter: number;
  translation: "krv" | "kids";
  completedAt: string;
};

function readPendingLogs(): PendingLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PENDING_LOGS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as PendingLog[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writePendingLogs(rows: PendingLog[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_LOGS_KEY, JSON.stringify(rows));
}

function queueLog(log: PendingLog) {
  const list = readPendingLogs();
  const exists = list.some(
    (l) =>
      l.studentId === log.studentId &&
      l.book === log.book &&
      l.chapter === log.chapter &&
      l.translation === log.translation,
  );
  if (!exists) {
    list.push(log);
    writePendingLogs(list);
  }
}

async function postLog(log: PendingLog): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  const { error } = await supabase.from("br_reading_logs").upsert(
    {
      student_id: log.studentId,
      class_id: log.classId,
      book: log.book,
      chapter: log.chapter,
      translation: log.translation,
      completed_at: log.completedAt,
    },
    { onConflict: "student_id,book,chapter" },
  );
  if (error) {
    console.warn("postLog failed", error);
    return false;
  }
  return true;
}

export async function recordChapterCompletion(args: {
  student: IdentifiedStudent;
  book: BookId;
  chapter: number;
  translation: "krv" | "kids";
}): Promise<"ok" | "queued" | "skipped"> {
  const log: PendingLog = {
    studentId: args.student.id,
    classId: args.student.classId,
    book: args.book,
    chapter: args.chapter,
    translation: args.translation,
    completedAt: new Date().toISOString(),
  };

  const supabase = getSupabaseClient();
  if (!supabase) {
    queueLog(log);
    return "queued";
  }

  const ok = await postLog(log);
  if (ok) return "ok";
  queueLog(log);
  return "queued";
}

export async function flushPendingLogs(): Promise<number> {
  const supabase = getSupabaseClient();
  if (!supabase) return 0;
  const list = readPendingLogs();
  if (list.length === 0) return 0;

  const remaining: PendingLog[] = [];
  let sent = 0;
  for (const log of list) {
    const ok = await postLog(log);
    if (ok) sent += 1;
    else remaining.push(log);
  }
  writePendingLogs(remaining);
  return sent;
}
