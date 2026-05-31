"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import proverbsData from "./proverbs.json";
import matthewData from "./matthew.json";
import markData from "./mark.json";
import lukeData from "./luke.json";
import johnData from "./john.json";
import prayersJson from "./prayers.json";
import { BOOKS, BOOK_ORDER, type BookId } from "./books";

type TranslationKey = "krv" | "kids";

type PrayerGradeKey = "lower" | "upper";

type PrayerEntry = {
  no: number;
  theme: string;
  verse: string;
  ref: string;
  think: string;
  pray: string;
};

type PrayerCardData = {
  grade: PrayerGradeKey;
  title: string;
  prayers: PrayerEntry[];
  lordsPrayer: string;
};

type PrayersData = Record<PrayerGradeKey, PrayerCardData>;

type Verse = {
  n: number;
  t: string;
};

type Chapter = {
  chapter: number;
  title: string;
  verses: Record<TranslationKey, Verse[]>;
};

type BibleData = {
  translations: Record<TranslationKey, { label: string; note?: string }>;
  chapters: Chapter[];
};

type WordToken = {
  id: string;
  verse: number;
  text: string;
  normalized: string;
};

type ReadingMode = "mic" | "scroll";

type QuizQuestion = {
  verseNum: number;
  blanked: string;
  correct: string;
  options: string[];
};

type SpeechRecognitionResultLike = {
  length: number;
  isFinal: boolean;
  [index: number]: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const BOOK_DATA: Record<BookId, BibleData> = {
  proverbs: proverbsData as BibleData,
  matthew: matthewData as BibleData,
  mark: markData as BibleData,
  luke: lukeData as BibleData,
  john: johnData as BibleData,
};

const prayersData = prayersJson as PrayersData;

const doneKey = (bookId: BookId, chapter: number) =>
  `bible_done_${bookId}_${chapter}`;
const verseProgressKey = (bookId: BookId, chapter: number) =>
  `bible_verse_progress_${bookId}_${chapter}`;
const CURRENT_BOOK_KEY = "bible_current_book";
const currentChapterKey = (bookId: BookId) =>
  `bible_current_chapter_${bookId}`;
const MIGRATION_V1_KEY = "bible_migrated_v1";
const READING_MODE_KEY = "bible_reading_mode";

const migrateLegacyKeys = () => {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(MIGRATION_V1_KEY) === "true") return;
  for (let i = 1; i <= 31; i += 1) {
    const oldDone = window.localStorage.getItem(`proverbs_done_${i}`);
    if (oldDone !== null) {
      window.localStorage.setItem(`bible_done_proverbs_${i}`, oldDone);
    }
    const oldProgress = window.localStorage.getItem(
      `proverbs_verse_progress_${i}`,
    );
    if (oldProgress !== null) {
      window.localStorage.setItem(
        `bible_verse_progress_proverbs_${i}`,
        oldProgress,
      );
    }
  }
  window.localStorage.setItem(MIGRATION_V1_KEY, "true");
};

const PRAYER_GRADE_KEY = "prayer_grade";
const prayerChecksKey = (date: string, grade: PrayerGradeKey) =>
  `prayer_checks_${date}_${grade}`;

const getTodayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const PARTICLE_REGEX =
  /(으로|에게|에서|부터|까지|처럼|보다|은|는|이|가|을|를|에|의|와|과|도|만|로|께|야|아)$/u;

const normalizeKorean = (value: string) => {
  let text = value
    .toLowerCase()
    .replace(/[^\u3131-\u318e\uac00-\ud7a3a-z0-9]/g, "")
    .trim();

  // 조사 최대 2번까지 떼되, 절대 빈 문자열로 만들지 않는다.
  // (예: "이는" → "이" 까지만, 더 떼면 "" 이 되어 매칭이 불가능해짐)
  for (let i = 0; i < 2; i += 1) {
    const stripped = text.replace(PARTICLE_REGEX, "");
    if (!stripped || stripped === text) break;
    text = stripped;
  }

  return text;
};

const isLooseMatch = (spoken: string, target: string) => {
  if (!spoken || !target) return false;
  if (spoken === target) return true;

  if (spoken.startsWith(target) || target.startsWith(spoken)) {
    return true;
  }

  if (target.length <= 1 || spoken.length <= 1) {
    return spoken[0] === target[0];
  }

  if (target.includes(spoken) || spoken.includes(target)) {
    return true;
  }

  // Count syllables that match at the head; accept >=50% (min 1).
  let matched = 0;
  for (let i = 0; i < Math.min(spoken.length, target.length); i += 1) {
    if (spoken[i] !== target[i]) break;
    matched += 1;
  }

  const minLength = Math.max(1, Math.floor(Math.min(spoken.length, target.length) * 0.5));
  if (matched >= minLength) return true;

  // Last resort: overlap of 2+ characters anywhere in the head/tail boundary.
  if (target.length >= 3 && spoken.length >= 3) {
    if (spoken.slice(0, 2) === target.slice(0, 2)) return true;
  }

  return false;
};

const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") return null;
  const win = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
};

// 절 단위 매칭. 음성에서 각 절의 "첫 의미 단어"가 순차적으로 등장하면
// 그 절을 "읽음"으로 처리한다. 짧은 단어/조사만 있을 때는 두 번째
// 단어까지 한 절 범위 내에 함께 등장해야 인정한다.
const stripToHangulOnly = (value: string) =>
  value.toLowerCase().replace(/[^\u3131-\u318e\uac00-\ud7a3]/g, "");

const extractVerseSignatures = (verseText: string): string[] => {
  return verseText
    .split(/\s+/)
    .map((word) => normalizeKorean(word))
    .filter((word) => word.length >= 2);
};

const countReadVerses = (transcript: string, verses: Verse[]): number => {
  if (verses.length === 0) return 0;
  const stream = stripToHangulOnly(transcript);
  if (!stream) return 0;

  let count = 0;
  let cursor = 0;

  for (const verse of verses) {
    const sigs = extractVerseSignatures(verse.t);

    if (sigs.length === 0) {
      // 표지(sig) 단어가 없으면(아주 짧은 절) 그냥 통과
      count += 1;
      continue;
    }

    const first = sigs[0];
    const second = sigs.length >= 2 ? sigs[1] : null;

    // 1차: 첫 단어 정확 매칭
    let firstIdx = stream.indexOf(first, cursor);

    // 2차: 음성 인식 누락 대비 prefix 매칭 (3자 이상일 때만)
    if (firstIdx === -1 && first.length >= 3) {
      const prefix = first.slice(0, 2);
      firstIdx = stream.indexOf(prefix, cursor);
    }

    if (firstIdx === -1) break;

    // 두 번째 단어가 있다면 절 길이 안쪽에 함께 등장해야 한다.
    // 그래야 우연히 첫 단어만 잡힌 경우(이전 절 잔여물)를 거른다.
    if (second) {
      const verseLen = stripToHangulOnly(verse.t).length;
      const windowEnd = Math.min(
        stream.length,
        firstIdx + Math.max(verseLen * 2 + 8, second.length + 10),
      );
      let secondIdx = stream.indexOf(second, firstIdx + first.length);
      if (secondIdx === -1 && second.length >= 3) {
        secondIdx = stream.indexOf(second.slice(0, 2), firstIdx + first.length);
      }
      if (secondIdx === -1 || secondIdx > windowEnd) {
        break;
      }
      cursor = secondIdx + second.length;
    } else {
      cursor = firstIdx + first.length;
    }

    count += 1;
  }

  return count;
};

const KOREAN_PARTICLE_TAIL =
  /(으로|에게|에서|부터|까지|처럼|보다|에서는|에서도|에는|에도|이라|이라도|이다|이나|이며|이고|은|는|이|가|을|를|에|의|와|과|도|만|로|께|야|아|라|며|고|도다|니라|이여)$/u;

const stripParticleSuffix = (word: string) => {
  let text = word;
  for (let i = 0; i < 2; i += 1) {
    const stripped = text.replace(KOREAN_PARTICLE_TAIL, "");
    if (!stripped || stripped === text) break;
    text = stripped;
  }
  return text;
};

const shuffleArray = <T,>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const collectQuizWordPool = (verses: Verse[]): string[] => {
  const pool = new Set<string>();
  verses.forEach((verse) => {
    verse.t.split(/\s+/).forEach((rawWord) => {
      const hangul = rawWord.replace(/[^\u3131-\u318e\uac00-\ud7a3]/g, "");
      if (hangul.length >= 2 && hangul.length <= 6) {
        pool.add(hangul);
      }
    });
  });
  return Array.from(pool);
};

const generateChapterQuiz = (verses: Verse[]): QuizQuestion[] => {
  if (verses.length === 0) return [];
  const wordPool = collectQuizWordPool(verses);

  // 4단어 이상 가진 절 중에서 2~3개 무작위 선택
  const longEnough = verses.filter((verse) => {
    const tokens = verse.t.split(/\s+/).filter((token) => {
      const hangul = token.replace(/[^\u3131-\u318e\uac00-\ud7a3]/g, "");
      return hangul.length >= 2;
    });
    return tokens.length >= 4;
  });

  const usable = longEnough.length >= 2 ? longEnough : verses;
  // 문제 수: 2 또는 3 (랜덤). 사용 가능한 절이 부족하면 그만큼만.
  const desired = Math.random() < 0.5 ? 2 : 3;
  const count = Math.min(desired, usable.length);
  const picked = shuffleArray(usable).slice(0, count);

  const questions: QuizQuestion[] = [];

  for (const verse of picked) {
    const tokens = verse.t.split(/\s+/);
    const candidates = tokens
      .map((token, idx) => {
        const hangul = token.replace(/[^\u3131-\u318e\uac00-\ud7a3]/g, "");
        return { token, hangul, idx };
      })
      .filter((item) => item.hangul.length >= 2 && item.hangul.length <= 5);

    if (candidates.length === 0) continue;

    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const targetRoot = stripParticleSuffix(target.hangul);

    const blanked = tokens
      .map((token, idx) => (idx === target.idx ? "____" : token))
      .join(" ");

    const distractors: string[] = [];
    const usedRoots = new Set<string>([targetRoot]);
    const shuffled = shuffleArray(wordPool);
    for (const candidate of shuffled) {
      if (distractors.length >= 3) break;
      const root = stripParticleSuffix(candidate);
      if (!root || root.length < 2) continue;
      if (usedRoots.has(root)) continue;
      usedRoots.add(root);
      distractors.push(candidate);
    }

    // 풀이 너무 작으면 정답만 들어가는 경우가 없게 placeholder 채워두기
    while (distractors.length < 3) {
      distractors.push(`보기${distractors.length + 1}`);
    }

    const options = shuffleArray([target.token, ...distractors]);

    questions.push({
      verseNum: verse.n,
      blanked,
      correct: target.token,
      options,
    });
  }

  return questions;
};

const advanceReadIndex = (
  transcript: string,
  words: WordToken[],
  startIndex: number,
): number => {
  if (words.length === 0) return startIndex;

  const spokenWords = transcript
    .split(/\s+/)
    .map(normalizeKorean)
    .filter(Boolean);

  const skipEmpty = (idx: number) => {
    let i = idx;
    while (i < words.length && words[i] && words[i].normalized === "") {
      i += 1;
    }
    return i;
  };

  let nextIndex = skipEmpty(startIndex);

  const canJumpTo = (toIndex: number) => {
    if (toIndex <= nextIndex) return false;
    const seen = new Set<string>();
    for (let i = nextIndex; i <= toIndex; i += 1) {
      const w = words[i];
      if (!w) return false;
      if (w.normalized === "") continue;
      if (seen.has(w.normalized)) return false;
      seen.add(w.normalized);
    }
    return true;
  };

  // 한 번 매칭에 실패한 음성 단어가 연속으로 누적되면 더 이상 진행하지 않는다.
  // (이전 절 음성 잔여물이 다음 절 단어와 부분 일치해 과도하게 advance 되는 것 방지)
  let consecutiveMisses = 0;
  const MAX_CONSECUTIVE_MISSES = 6;

  for (const spoken of spokenWords) {
    if (consecutiveMisses >= MAX_CONSECUTIVE_MISSES) break;
    nextIndex = skipEmpty(nextIndex);
    if (nextIndex >= words.length) break;

    const current = words[nextIndex];
    if (current && isLooseMatch(spoken, current.normalized)) {
      nextIndex = skipEmpty(nextIndex + 1);
      consecutiveMisses = 0;
      continue;
    }

    if (spoken.length < 2) {
      // 너무 짧은 음절은 그냥 흘려보낸다 (오매칭 위험 큼).
      continue;
    }

    let jumped = false;
    // 점프는 최대 2칸까지만 허용 — 3칸 이상이면 잘못 건너뛴 가능성 높음.
    for (let offset = 1; offset <= 2; offset += 1) {
      const candidate = words[nextIndex + offset];
      if (!candidate) break;
      if (!canJumpTo(nextIndex + offset)) break;
      if (isLooseMatch(spoken, candidate.normalized)) {
        nextIndex = skipEmpty(nextIndex + offset + 1);
        jumped = true;
        break;
      }
    }

    if (jumped) {
      consecutiveMisses = 0;
    } else {
      consecutiveMisses += 1;
    }
  }

  return skipEmpty(nextIndex);
};

const getMicrophonePermissionState = async () => {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unknown";
  }

  try {
    const status = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });
    return status.state;
  } catch {
    return "unknown";
  }
};

export default function BibleReadingPage() {
  const [bookId, setBookId] = useState<BookId>("proverbs");
  const [chapterNumber, setChapterNumber] = useState(1);
  const [translation, setTranslation] = useState<TranslationKey>("krv");
  const [readingMode, setReadingMode] = useState<ReadingMode>("mic");
  const [readVerseCount, setReadVerseCount] = useState(0);
  // 현재 듣고 있는 (= 아직 다 안 읽은 첫 번째) 절 안에서, 노래방 가사처럼
  // 왼쪽부터 색이 차오르도록 단어 단위 진행도를 따로 추적한다.
  const [currentVerseWordIndex, setCurrentVerseWordIndex] = useState(0);
  const [doneChapters, setDoneChapters] = useState<Set<number>>(new Set());
  const [listening, setListening] = useState(false);
  const [speechMessage, setSpeechMessage] = useState("");
  const [scrollReady, setScrollReady] = useState(false);
  const [scrollReachedBottom, setScrollReachedBottom] = useState(false);
  const [scrollSecondsLeft, setScrollSecondsLeft] = useState(0);
  const [chapterMinSeconds, setChapterMinSeconds] = useState(3);
  const [completeVisible, setCompleteVisible] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<(string | null)[]>([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [prayerGrade, setPrayerGrade] = useState<PrayerGradeKey>("lower");
  const [prayerDate, setPrayerDate] = useState<string>(() => getTodayKey());
  const [prayerChecks, setPrayerChecks] = useState<Set<number>>(new Set());
  const [openPrayer, setOpenPrayer] = useState<number | null>(null);
  const [prayerListeningNo, setPrayerListeningNo] = useState<number | null>(null);
  const [prayerReadCounts, setPrayerReadCounts] = useState<Record<number, number>>({});
  const [prayerSpeechMessage, setPrayerSpeechMessage] = useState("");

  const listeningRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const readVerseCountRef = useRef(0);
  const currentVerseWordIndexRef = useRef(0);
  const minReadTimeRef = useRef(0);
  const reachedBottomRef = useRef(false);
  const readerSectionRef = useRef<HTMLElement | null>(null);
  const prayerListeningRef = useRef<number | null>(null);
  const prayerRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const prayerReadCountRefs = useRef<Record<number, number>>({});

  const bookMeta = BOOKS[bookId];
  const data = BOOK_DATA[bookId];
  const chapter =
    data.chapters.find((item) => item.chapter === chapterNumber) ??
    data.chapters[0];
  const hasKrv = chapter.verses.krv.length > 0;
  const hasKids = chapter.verses.kids.length > 0;
  const effectiveTranslation: TranslationKey =
    translation === "krv" && !hasKrv && hasKids ? "kids" : translation;
  const verses = chapter.verses[effectiveTranslation];

  const totalVerses = verses.length;
  const progress = totalVerses > 0
    ? Math.min(100, (readVerseCount / totalVerses) * 100)
    : 0;
  const speechSupported = typeof window !== "undefined" && getSpeechRecognition() !== null;
  const hasFilledText = totalVerses > 0;

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    setListening(false);
    recognitionRef.current?.abort();
  }, []);

  const finalizeChapter = useCallback(() => {
    stopListening();
    setReadVerseCount(totalVerses);
    readVerseCountRef.current = totalVerses;
    window.localStorage.setItem(doneKey(bookId, chapterNumber), "true");
    window.localStorage.setItem(
      verseProgressKey(bookId, chapterNumber),
      String(totalVerses),
    );
    setDoneChapters((prev) => new Set(prev).add(chapterNumber));
    setCompleteVisible(true);
  }, [bookId, chapterNumber, stopListening, totalVerses]);

  const openChapterQuiz = useCallback(() => {
    if (!hasFilledText) return;
    const generated = generateChapterQuiz(verses);
    if (generated.length === 0) {
      finalizeChapter();
      return;
    }
    setQuizQuestions(generated);
    setQuizAnswers(new Array(generated.length).fill(null));
    setQuizSubmitted(false);
    setQuizOpen(true);
  }, [finalizeChapter, hasFilledText, verses]);

  const handleManualFinish = useCallback(() => {
    if (!hasFilledText) return;

    if (readingMode === "mic") {
      // 음성 모드: 절을 80% 이상 잡았으면 바로 완료
      const threshold = Math.max(1, Math.floor(totalVerses * 0.8));
      if (readVerseCountRef.current >= threshold) {
        finalizeChapter();
      } else {
        setSpeechMessage(
          "아직 본문을 다 읽지 않았어요. 절을 끝까지 읽어 주세요.",
        );
      }
      return;
    }

    // 스크롤 모드: 본문 끝까지 + 최소 시간 모두 충족해야 퀴즈로 진행
    if (!reachedBottomRef.current) {
      setSpeechMessage(
        "아직 본문을 다 보지 않았어요. 마지막 절까지 내려서 읽어 주세요.",
      );
      return;
    }
    const remainingMs = minReadTimeRef.current - Date.now();
    if (remainingMs > 0) {
      const sec = Math.ceil(remainingMs / 1000);
      setSpeechMessage(
        `조금만 더 천천히 읽어 주세요. ${sec}초 후에 다시 눌러주세요.`,
      );
      return;
    }
    setSpeechMessage("");
    openChapterQuiz();
  }, [
    finalizeChapter,
    hasFilledText,
    openChapterQuiz,
    readingMode,
    totalVerses,
  ]);

  const resetChapter = useCallback(() => {
    stopListening();
    readVerseCountRef.current = 0;
    setReadVerseCount(0);
    currentVerseWordIndexRef.current = 0;
    setCurrentVerseWordIndex(0);
    setCompleteVisible(false);
    setSpeechMessage("");
    setQuizOpen(false);
    setQuizSubmitted(false);
    setQuizAnswers([]);
    setQuizQuestions([]);
    window.localStorage.removeItem(doneKey(bookId, chapterNumber));
    window.localStorage.removeItem(verseProgressKey(bookId, chapterNumber));
    setDoneChapters((prev) => {
      if (!prev.has(chapterNumber)) return prev;
      const next = new Set(prev);
      next.delete(chapterNumber);
      return next;
    });
  }, [bookId, chapterNumber, stopListening]);

  const processTranscript = useCallback(
    (transcript: string) => {
      if (!hasFilledText) return;
      const detected = countReadVerses(transcript, verses);
      let nextVerseCount = readVerseCountRef.current;
      if (detected > nextVerseCount) {
        nextVerseCount = Math.min(totalVerses, detected);
        readVerseCountRef.current = nextVerseCount;
        setReadVerseCount(nextVerseCount);
        window.localStorage.setItem(
          verseProgressKey(bookId, chapterNumber),
          String(nextVerseCount),
        );
        // 절이 넘어갔으니 단어 진행도는 0부터 다시 차오른다.
        currentVerseWordIndexRef.current = 0;
        setCurrentVerseWordIndex(0);
      }

      // 현재(아직 안 읽힌 첫 번째) 절 안에서 단어 단위로 색이 차오르도록
      // 진행 인덱스를 advance 한다. 절 단위 매칭(countReadVerses)이 절을
      // 통째로 "읽음" 처리하기 전까지, 단어들이 왼쪽부터 순서대로 색이 바뀐다.
      if (nextVerseCount < totalVerses) {
        const verse = verses[nextVerseCount];
        const tokens: WordToken[] = verse.t
          .split(/\s+/)
          .map((w) => w.trim())
          .filter(Boolean)
          .map((word, index) => ({
            id: `verse-${verse.n}-${index}`,
            verse: verse.n,
            text: word,
            normalized: normalizeKorean(word),
          }));
        if (tokens.length > 0) {
          const startIdx = currentVerseWordIndexRef.current;
          const nextIdx = advanceReadIndex(transcript, tokens, startIdx);
          if (nextIdx > startIdx) {
            currentVerseWordIndexRef.current = nextIdx;
            setCurrentVerseWordIndex(nextIdx);
          }
        }
      }
    },
    [bookId, chapterNumber, hasFilledText, totalVerses, verses],
  );

  const handleReadingModeChange = useCallback(
    (next: ReadingMode) => {
      if (next === readingMode) return;
      setReadingMode(next);
      window.localStorage.setItem(READING_MODE_KEY, next);
      setSpeechMessage("");
      if (next === "scroll") {
        // 마이크 모드에서 켜져있던 인식 종료
        listeningRef.current = false;
        setListening(false);
        recognitionRef.current?.abort();
      }
    },
    [readingMode],
  );

  const startListening = useCallback(() => {
    if (!hasFilledText) {
      setSpeechMessage("본문을 먼저 채워 넣으면 음성 읽기를 시작할 수 있어요.");
      return;
    }

    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setSpeechMessage("이 브라우저는 음성인식을 지원하지 않아 스크롤 백업을 사용해 주세요.");
      return;
    }

    if (prayerListeningRef.current !== null) {
      prayerListeningRef.current = null;
      setPrayerListeningNo(null);
      prayerRecognitionRef.current?.abort();
    }

    const recognition = new Recognition();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.onresult = (event) => {
      // Concatenate the best alternative of each chunk, then run the matcher
      // again with the secondary alternatives merged in. This gives the loose
      // matcher more chances to catch syllables the primary guess missed.
      let primary = "";
      let merged = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        primary += result[0].transcript;
        for (let alt = 0; alt < Math.min(result.length, 3); alt += 1) {
          merged += " " + result[alt].transcript;
        }
      }
      processTranscript(primary);
      if (merged.trim() && merged.trim() !== primary.trim()) {
        processTranscript(merged);
      }
    };
    recognition.onerror = async (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        const currentPermissionState = await getMicrophonePermissionState();
        setSpeechMessage(
          currentPermissionState === "denied"
            ? "마이크 권한이 차단되어 있어요. 주소창 왼쪽 권한 설정에서 허용해 주세요."
            : `Chrome 음성인식이 막혔어요. 새로고침 후 다시 눌러 주세요. (${event.error})`,
        );
        listeningRef.current = false;
        setListening(false);
        return;
      }

      if (event.error === "no-speech") {
        setSpeechMessage("소리가 잘 들리지 않았어요. 조금 더 가까이에서 다시 읽어 주세요.");
      }
    };
    recognition.onend = () => {
      if (listeningRef.current && readVerseCountRef.current < totalVerses) {
        window.setTimeout(() => {
          if (!listeningRef.current) return;
          try {
            recognition.start();
          } catch {
            setSpeechMessage("음성인식이 멈췄어요. 버튼을 다시 눌러 시작해 주세요.");
            listeningRef.current = false;
            setListening(false);
          }
        }, 250);
      }
    };

    recognitionRef.current = recognition;
    listeningRef.current = true;
    setListening(true);
    setSpeechMessage("듣고 있어요. 절의 첫 부분을 또박또박 읽어 주세요.");

    try {
      recognition.start();
    } catch {
      setSpeechMessage("음성인식을 시작하지 못했어요. 잠시 후 다시 눌러 주세요.");
      setListening(false);
      listeningRef.current = false;
    }
  }, [hasFilledText, processTranscript, totalVerses]);

  const moveChapter = (next: number) => {
    const clamped = Math.min(bookMeta.totalChapters, Math.max(1, next));
    setChapterNumber(clamped);
    setCompleteVisible(false);
    setQuizOpen(false);
    setQuizSubmitted(false);
    setQuizAnswers([]);
    setQuizQuestions([]);
    stopListening();
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        currentChapterKey(bookId),
        String(clamped),
      );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeBook = useCallback(
    (nextBookId: BookId) => {
      if (nextBookId === bookId) return;
      stopListening();
      setCompleteVisible(false);
      setQuizOpen(false);
      setQuizSubmitted(false);
      setQuizAnswers([]);
      setQuizQuestions([]);
      setBookId(nextBookId);
      const savedChapter = window.localStorage.getItem(
        currentChapterKey(nextBookId),
      );
      const next = savedChapter ? Number(savedChapter) : 1;
      const meta = BOOKS[nextBookId];
      const safeChapter =
        Number.isFinite(next) && next >= 1 && next <= meta.totalChapters
          ? next
          : 1;
      setChapterNumber(safeChapter);
      window.localStorage.setItem(CURRENT_BOOK_KEY, nextBookId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [bookId, stopListening],
  );

  useEffect(() => {
    migrateLegacyKeys();

    const savedBook = window.localStorage.getItem(CURRENT_BOOK_KEY);
    if (
      savedBook === "proverbs" ||
      savedBook === "matthew" ||
      savedBook === "mark" ||
      savedBook === "luke" ||
      savedBook === "john"
    ) {
      setBookId(savedBook);
      const savedChapter = window.localStorage.getItem(
        currentChapterKey(savedBook),
      );
      const meta = BOOKS[savedBook];
      const next = savedChapter ? Number(savedChapter) : 1;
      if (Number.isFinite(next) && next >= 1 && next <= meta.totalChapters) {
        setChapterNumber(next);
      }
    }

    const savedMode = window.localStorage.getItem(READING_MODE_KEY);
    if (savedMode === "mic" || savedMode === "scroll") {
      setReadingMode(savedMode);
    }
  }, []);

  useEffect(() => {
    const done = new Set<number>();
    data.chapters.forEach((item) => {
      if (
        window.localStorage.getItem(doneKey(bookId, item.chapter)) === "true"
      ) {
        done.add(item.chapter);
      }
    });
    setDoneChapters(done);
  }, [bookId, data]);

  useEffect(() => {
    const savedDone =
      window.localStorage.getItem(doneKey(bookId, chapterNumber)) === "true";
    const savedProgress = Number(
      window.localStorage.getItem(verseProgressKey(bookId, chapterNumber)) ??
        "0",
    );
    const nextCount =
      savedDone && totalVerses > 0
        ? totalVerses
        : Math.min(Math.max(0, savedProgress), totalVerses);

    readVerseCountRef.current = nextCount;
    setReadVerseCount(nextCount);
    currentVerseWordIndexRef.current = 0;
    setCurrentVerseWordIndex(0);
    setScrollReady(false);
    setScrollReachedBottom(false);
    reachedBottomRef.current = false;

    // 장마다 최소 읽기 시간: 단어 수 + 절 수 기반으로 동적 계산.
    // - 묵독 속도 가정: ~150 단어/분 → 단어당 0.4초
    // - 절마다 시선 이동/번호 인지: 0.4초 추가
    // - 짧은 본문은 최소 3초 보장
    const wordCount = verses.reduce(
      (sum, verse) =>
        sum + verse.t.split(/\s+/).filter(Boolean).length,
      0,
    );
    const verseCount = verses.length;
    const computedSeconds = Math.max(
      3,
      Math.round(verseCount * 0.4 + wordCount * 0.4),
    );
    setChapterMinSeconds(computedSeconds);
    setScrollSecondsLeft(computedSeconds);
    minReadTimeRef.current = Date.now() + computedSeconds * 1000;
  }, [bookId, chapterNumber, totalVerses, translation, verses]);

  useEffect(() => {
    if (
      readingMode === "mic" &&
      totalVerses > 0 &&
      readVerseCount >= totalVerses
    ) {
      finalizeChapter();
    }
  }, [finalizeChapter, readVerseCount, readingMode, totalVerses]);

  useEffect(() => {
    const savedGrade = window.localStorage.getItem(PRAYER_GRADE_KEY);
    if (savedGrade === "lower" || savedGrade === "upper") {
      setPrayerGrade(savedGrade);
    }
  }, []);

  useEffect(() => {
    const today = getTodayKey();
    setPrayerDate(today);
    const raw = window.localStorage.getItem(prayerChecksKey(today, prayerGrade));
    if (!raw) {
      setPrayerChecks(new Set());
      return;
    }
    try {
      const parsed = JSON.parse(raw) as number[];
      setPrayerChecks(new Set(Array.isArray(parsed) ? parsed : []));
    } catch {
      setPrayerChecks(new Set());
    }
  }, [prayerGrade]);

  const togglePrayerCheck = useCallback(
    (no: number) => {
      setPrayerChecks((prev) => {
        const next = new Set(prev);
        if (next.has(no)) {
          next.delete(no);
        } else {
          next.add(no);
        }
        window.localStorage.setItem(
          prayerChecksKey(prayerDate, prayerGrade),
          JSON.stringify(Array.from(next).sort((a, b) => a - b)),
        );
        return next;
      });
    },
    [prayerDate, prayerGrade],
  );

  const handlePrayerGradeChange = useCallback((grade: PrayerGradeKey) => {
    setPrayerGrade(grade);
    setOpenPrayer(null);
    window.localStorage.setItem(PRAYER_GRADE_KEY, grade);
  }, []);

  const resetPrayers = useCallback(() => {
    window.localStorage.removeItem(prayerChecksKey(prayerDate, prayerGrade));
    setPrayerChecks(new Set());
    setOpenPrayer(null);
  }, [prayerDate, prayerGrade]);

  const prayerCard = prayersData[prayerGrade];
  const prayerTotal = prayerCard.prayers.length;
  const prayerDone = prayerChecks.size;
  const prayerAllDone = prayerTotal > 0 && prayerDone >= prayerTotal;
  const prayerPercent = prayerTotal > 0 ? (prayerDone / prayerTotal) * 100 : 0;

  const prayerWordsByNo = useMemo(() => {
    const map: Record<number, WordToken[]> = {};
    prayerCard.prayers.forEach((p) => {
      const stripped = p.pray.replace(/\([^)]*\)/g, " ");
      map[p.no] = stripped
        .split(/\s+/)
        .map((w) => w.trim())
        .filter(Boolean)
        .map((word, index) => ({
          id: `prayer-${prayerGrade}-${p.no}-${index}`,
          verse: p.no,
          text: word,
          normalized: normalizeKorean(word),
        }));
    });
    return map;
  }, [prayerCard, prayerGrade]);

  const stopPrayerListening = useCallback(() => {
    prayerListeningRef.current = null;
    setPrayerListeningNo(null);
    prayerRecognitionRef.current?.abort();
  }, []);

  useEffect(() => {
    setPrayerReadCounts({});
    prayerReadCountRefs.current = {};
    stopPrayerListening();
  }, [prayerGrade, stopPrayerListening]);

  useEffect(() => {
    if (
      prayerListeningRef.current !== null &&
      prayerListeningRef.current !== openPrayer
    ) {
      stopPrayerListening();
    }
  }, [openPrayer, stopPrayerListening]);

  const processPrayerTranscript = useCallback(
    (no: number, transcript: string) => {
      const words = prayerWordsByNo[no];
      if (!words || words.length === 0) return;
      const startIndex = prayerReadCountRefs.current[no] ?? 0;
      const nextIndex = advanceReadIndex(transcript, words, startIndex);
      if (nextIndex === startIndex) return;

      prayerReadCountRefs.current[no] = nextIndex;
      setPrayerReadCounts((prev) => ({ ...prev, [no]: nextIndex }));

      const threshold = Math.max(1, Math.floor(words.length * 0.8));
      if (nextIndex >= threshold) {
        setPrayerChecks((prev) => {
          if (prev.has(no)) return prev;
          const next = new Set(prev);
          next.add(no);
          window.localStorage.setItem(
            prayerChecksKey(prayerDate, prayerGrade),
            JSON.stringify(Array.from(next).sort((a, b) => a - b)),
          );
          return next;
        });
      }
    },
    [prayerDate, prayerGrade, prayerWordsByNo],
  );

  const startPrayerListening = useCallback(
    (no: number) => {
      const Recognition = getSpeechRecognition();
      if (!Recognition) {
        setPrayerSpeechMessage("이 브라우저는 음성인식을 지원하지 않아 직접 체크해 주세요.");
        return;
      }

      if (listeningRef.current) {
        listeningRef.current = false;
        setListening(false);
        recognitionRef.current?.abort();
      }

      if (prayerListeningRef.current !== null) {
        prayerListeningRef.current = null;
        prayerRecognitionRef.current?.abort();
      }

      const recognition = new Recognition();
      recognition.lang = "ko-KR";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      recognition.onresult = (event) => {
        const targetNo = prayerListeningRef.current;
        if (targetNo == null) return;
        let primary = "";
        let merged = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          primary += result[0].transcript;
          for (let alt = 0; alt < Math.min(result.length, 3); alt += 1) {
            merged += " " + result[alt].transcript;
          }
        }
        processPrayerTranscript(targetNo, primary);
        if (merged.trim() && merged.trim() !== primary.trim()) {
          processPrayerTranscript(targetNo, merged);
        }
      };
      recognition.onerror = async (event) => {
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          const currentPermissionState = await getMicrophonePermissionState();
          setPrayerSpeechMessage(
            currentPermissionState === "denied"
              ? "마이크 권한이 차단되어 있어요. 주소창 왼쪽 권한 설정에서 허용해 주세요."
              : `Chrome 음성인식이 막혔어요. 새로고침 후 다시 눌러 주세요. (${event.error})`,
          );
          prayerListeningRef.current = null;
          setPrayerListeningNo(null);
          return;
        }
        if (event.error === "no-speech") {
          setPrayerSpeechMessage("소리가 잘 들리지 않았어요. 조금 더 가까이에서 다시 읽어 주세요.");
        }
      };
      recognition.onend = () => {
        if (prayerListeningRef.current === no) {
          window.setTimeout(() => {
            if (prayerListeningRef.current !== no) return;
            try {
              recognition.start();
            } catch {
              setPrayerSpeechMessage("음성인식이 멈췄어요. 버튼을 다시 눌러 시작해 주세요.");
              prayerListeningRef.current = null;
              setPrayerListeningNo(null);
            }
          }, 250);
        }
      };

      prayerRecognitionRef.current = recognition;
      prayerListeningRef.current = no;
      setPrayerListeningNo(no);
      setPrayerSpeechMessage("듣고 있어요. 기도문을 천천히 따라 읽어 주세요.");
      setOpenPrayer(no);

      try {
        recognition.start();
      } catch {
        setPrayerSpeechMessage("음성인식을 시작하지 못했어요. 잠시 후 다시 눌러 주세요.");
        prayerListeningRef.current = null;
        setPrayerListeningNo(null);
      }
    },
    [processPrayerTranscript],
  );

  const resetPrayerProgress = useCallback((no: number) => {
    prayerReadCountRefs.current[no] = 0;
    setPrayerReadCounts((prev) => {
      if (!prev[no]) return prev;
      const next = { ...prev };
      next[no] = 0;
      return next;
    });
  }, []);

  useEffect(() => {
    const tick = () => {
      // 본문(.brp-reader)의 마지막 줄을 지나면 "바닥 도달"로 본다.
      // 기도카드까지 끝까지 내려갈 필요 없이, 그 장의 마지막 절을 보기만 하면 활성화.
      const reader = readerSectionRef.current;
      if (reader) {
        const rect = reader.getBoundingClientRect();
        const viewportH = window.innerHeight;
        // 본문 박스의 하단이 뷰포트 하단보다 약간 위까지 올라왔으면(=마지막 절을 보고 있다는 뜻) 활성화.
        if (rect.bottom <= viewportH - 80) {
          if (!reachedBottomRef.current) {
            reachedBottomRef.current = true;
            setScrollReachedBottom(true);
          }
        }
      } else {
        // ref가 아직 안 잡혔으면 fallback: 페이지 바닥 근처
        const bottomDistance =
          document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
        if (bottomDistance < 160) {
          if (!reachedBottomRef.current) {
            reachedBottomRef.current = true;
            setScrollReachedBottom(true);
          }
        }
      }

      const remainingMs = Math.max(0, minReadTimeRef.current - Date.now());
      const remainingSec = Math.ceil(remainingMs / 1000);
      setScrollSecondsLeft(remainingSec);

      if (reachedBottomRef.current && remainingMs === 0) {
        setScrollReady(true);
      }
    };

    // 첫 렌더 직후 한 번 호출 — 본문이 매우 짧아 처음부터 화면에 다 들어오는 경우 대비
    tick();

    window.addEventListener("scroll", tick, { passive: true });
    const timer = window.setInterval(tick, 500);

    return () => {
      window.removeEventListener("scroll", tick);
      window.clearInterval(timer);
    };
  }, [chapterNumber, translation, bookId]);

  const handleQuizAnswer = useCallback((idx: number, option: string) => {
    setQuizAnswers((prev) => {
      const next = [...prev];
      next[idx] = option;
      return next;
    });
  }, []);

  const quizAllCorrect = useMemo(() => {
    if (quizQuestions.length === 0) return false;
    return quizQuestions.every((q, i) => quizAnswers[i] === q.correct);
  }, [quizAnswers, quizQuestions]);

  const handleQuizSubmit = useCallback(() => {
    if (quizAnswers.some((a) => !a)) return;
    setQuizSubmitted(true);
    const allCorrect = quizQuestions.every((q, i) => quizAnswers[i] === q.correct);
    if (allCorrect) {
      window.setTimeout(() => {
        setQuizOpen(false);
        finalizeChapter();
      }, 1100);
    }
  }, [finalizeChapter, quizAnswers, quizQuestions]);

  const handleQuizRetry = useCallback(() => {
    setQuizSubmitted(false);
    setQuizAnswers(new Array(quizQuestions.length).fill(null));
  }, [quizQuestions.length]);

  const handleQuizClose = useCallback(() => {
    setQuizOpen(false);
    setQuizSubmitted(false);
  }, []);

  return (
    <main className="brp-page">
      <header className="brp-header">
        <a className="brp-brand" href="/#hero">
          <img
            className="brp-logo"
            src="https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/logo.jpg"
            alt="포천중앙침례교회 주일학교 로고"
          />
          <span>포천중앙침례교회 주일학교</span>
        </a>
        <nav className="brp-nav">
          <a href="/bible-reading" aria-current="page">
            성경읽기
          </a>
          <a className="brp-nav-contact" href="/#contact">
            문의
          </a>
        </nav>
      </header>

      <div className="brp-progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>

      <section className="brp-hero">
        <p className="brp-eyebrow">말씀 성경 읽기 프로젝트</p>
        <h1>{bookMeta.name} 통독</h1>
        <p>
          하루 한 장씩 읽어요. 읽은 절은 차분한 색으로 표시되고,
          한 장을 마치면 완료됩니다.
        </p>
      </section>

      <section
        className="brp-book-tabs"
        role="tablist"
        aria-label="성경 책 선택"
      >
        {BOOK_ORDER.map((id) => {
          const meta = BOOKS[id];
          const isActive = id === bookId;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`brp-book-tab ${isActive ? "is-active" : ""}`}
              onClick={() => changeBook(id)}
            >
              {meta.name}
            </button>
          );
        })}
      </section>

      <section className="brp-mode-tabs" role="tablist" aria-label="읽기 모드 선택">
        <button
          type="button"
          role="tab"
          aria-selected={readingMode === "mic"}
          className={`brp-mode-tab ${readingMode === "mic" ? "is-active" : ""}`}
          onClick={() => handleReadingModeChange("mic")}
        >
          <span className="brp-mode-tab-name">직접 읽기</span>
          <span className="brp-mode-tab-desc">
            소리내어 읽으면 절이 자동으로 표시돼요
          </span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={readingMode === "scroll"}
          className={`brp-mode-tab ${readingMode === "scroll" ? "is-active" : ""}`}
          onClick={() => handleReadingModeChange("scroll")}
        >
          <span className="brp-mode-tab-name">스크롤로 읽기</span>
          <span className="brp-mode-tab-desc">
            눈으로 읽고 간단한 퀴즈로 확인해요
          </span>
        </button>
      </section>

      <section className="brp-toolbar" aria-label="성경 읽기 조작">
        <div className="brp-translation">
          {(Object.keys(data.translations) as TranslationKey[]).map((key) => {
            const isKrvDisabled = key === "krv" && !hasKrv;
            return (
              <button
                key={key}
                type="button"
                className={`${
                  effectiveTranslation === key ? "is-active" : ""
                } ${isKrvDisabled ? "is-disabled" : ""}`}
                disabled={isKrvDisabled}
                title={
                  isKrvDisabled
                    ? "이 책의 개역한글 본문은 아직 준비되지 않았어요."
                    : undefined
                }
                onClick={() => setTranslation(key)}
              >
                {data.translations[key].label}
              </button>
            );
          })}
        </div>

        <div className="brp-chapter-switcher">
          <button type="button" onClick={() => moveChapter(chapterNumber - 1)} aria-label="이전 장">
            ←
          </button>
          <label className="brp-chapter-select">
            <span className="brp-select-label">장 선택</span>
            <select
              value={chapterNumber}
              onChange={(event) => moveChapter(Number(event.target.value))}
              aria-label={`${bookMeta.name} 장 선택`}
            >
              {data.chapters.map((item) => (
                <option key={item.chapter} value={item.chapter}>
                  제 {item.chapter} 장
                </option>
              ))}
            </select>
            <span className="brp-select-title">{chapter.title}</span>
          </label>
          <button type="button" onClick={() => moveChapter(chapterNumber + 1)} aria-label="다음 장">
            →
          </button>
        </div>
      </section>

      <section
        ref={readerSectionRef}
        className="brp-reader"
        aria-label={`${bookMeta.name} ${chapterNumber}장 본문`}
      >
        {!hasFilledText && (
          <p className="brp-reader-empty">
            이 장의 {translation === "krv" ? "개역한글" : "어린이 쉬운"} 본문이
            아직 준비되지 않았어요. 다른 번역을 선택해 보세요.
          </p>
        )}
        {verses.map((verse, idx) => {
          const isRead = idx < readVerseCount;
          const isCurrent =
            !isRead && idx === readVerseCount && readingMode === "mic" && listening;
          const karaokeWords = isCurrent
            ? verse.t.split(/\s+/).filter(Boolean)
            : null;
          return (
            <div
              key={`${bookId}-${chapterNumber}-${effectiveTranslation}-${verse.n}`}
              className={`brp-verse ${isRead ? "is-read" : ""} ${
                isCurrent ? "is-current" : ""
              }`}
            >
              <span className="brp-verse-number">{verse.n}</span>
              {karaokeWords ? (
                <p className="brp-verse-text">
                  {karaokeWords.map((word, wIdx) => (
                    <span
                      key={`${verse.n}-${wIdx}`}
                      className={`brp-verse-word ${
                        wIdx < currentVerseWordIndex ? "is-read" : ""
                      }`}
                    >
                      {word}
                    </span>
                  ))}
                </p>
              ) : (
                <p className="brp-verse-text">{verse.t}</p>
              )}
            </div>
          );
        })}
      </section>

      <section
        className="brp-progress-grid"
        aria-label={`${bookMeta.name} 통독 진도`}
      >
        <div>
          <p className="brp-section-label">진도</p>
          <h2>
            {bookMeta.totalChapters}장 {bookMeta.name} 읽기
          </h2>
        </div>
        <div className="brp-grid">
          {data.chapters.map((item) => (
            <button
              key={item.chapter}
              type="button"
              className={`${item.chapter === chapterNumber ? "is-current" : ""} ${
                doneChapters.has(item.chapter) ? "is-done" : ""
              }`}
              onClick={() => moveChapter(item.chapter)}
              aria-label={`${bookMeta.name} ${item.chapter}장으로 이동`}
            >
              {item.chapter}
            </button>
          ))}
        </div>
      </section>

      <section className="brp-prayer" aria-label="오늘의 기도">
        <header className="brp-prayer-header">
          <div className="brp-prayer-heading">
            <p className="brp-section-label">오늘의 기도</p>
            <h2>
              {prayerAllDone ? "오늘의 기도 완료" : "7가지 기도를 차례로 따라해요"}
            </h2>
            <p className="brp-prayer-meta">
              <span className="brp-prayer-count">{prayerDone} / {prayerTotal} 마침</span>
              <span className="brp-prayer-divider" aria-hidden>·</span>
              <span className="brp-prayer-date">{prayerDate}</span>
            </p>
          </div>

          <div
            className="brp-prayer-toggle"
            role="tablist"
            aria-label="학년 선택"
          >
            <button
              type="button"
              role="tab"
              aria-selected={prayerGrade === "lower"}
              className={prayerGrade === "lower" ? "is-active" : ""}
              onClick={() => handlePrayerGradeChange("lower")}
            >
              저학년
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={prayerGrade === "upper"}
              className={prayerGrade === "upper" ? "is-active" : ""}
              onClick={() => handlePrayerGradeChange("upper")}
            >
              고학년
            </button>
          </div>
        </header>

        <div className="brp-prayer-bar" aria-hidden="true">
          <span style={{ width: `${prayerPercent}%` }} />
        </div>

        <ol className="brp-prayer-list">
          {prayerCard.prayers.map((prayer) => {
            const isOpen = openPrayer === prayer.no;
            const isDone = prayerChecks.has(prayer.no);
            return (
              <li
                key={prayer.no}
                className={`brp-prayer-item ${isOpen ? "is-open" : ""} ${
                  isDone ? "is-done" : ""
                }`}
              >
                <button
                  type="button"
                  className="brp-prayer-trigger"
                  aria-expanded={isOpen}
                  onClick={() => setOpenPrayer(isOpen ? null : prayer.no)}
                >
                  <span className="brp-prayer-no">
                    {String(prayer.no).padStart(2, "0")}
                  </span>
                  <span className="brp-prayer-theme">{prayer.theme}</span>
                  <span className="brp-prayer-mark" aria-hidden="true">
                    {isDone ? (
                      <svg viewBox="0 0 20 20" width="14" height="14">
                        <path
                          d="M4.5 10.5l3.2 3.2L15.5 6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <span className="brp-prayer-mark-dot" />
                    )}
                  </span>
                </button>

                {isOpen && (
                  <div className="brp-prayer-body">
                    <blockquote className="brp-prayer-verse">
                      <p>{prayer.verse}</p>
                      <cite>{prayer.ref}</cite>
                    </blockquote>

                    <div className="brp-prayer-section">
                      <p className="brp-prayer-label">생각해보기</p>
                      <p className="brp-prayer-think">{prayer.think}</p>
                    </div>

                    <div className="brp-prayer-section">
                      <div className="brp-prayer-text-head">
                        <p className="brp-prayer-label">따라서 기도해요</p>
                        {(() => {
                          const totalPrayerWords = (prayerWordsByNo[prayer.no] ?? []).length;
                          const readPrayerWords = prayerReadCounts[prayer.no] ?? 0;
                          if (totalPrayerWords === 0) return null;
                          return (
                            <span className="brp-prayer-word-count">
                              {readPrayerWords} / {totalPrayerWords} 단어
                            </span>
                          );
                        })()}
                      </div>
                      <div className="brp-prayer-text">
                        {(() => {
                          const readUpTo = prayerReadCounts[prayer.no] ?? 0;
                          let globalIdx = 0;
                          return prayer.pray.split("\n").map((line, lineIdx) => {
                            const segments = line.split(/(\([^)]*\))/g);
                            return (
                              <div key={lineIdx} className="brp-prayer-text-line">
                                {segments.flatMap((segment, segIdx) => {
                                  if (!segment) return [];
                                  if (/^\([^)]*\)$/.test(segment)) {
                                    return [
                                      <span
                                        key={`p-${segIdx}`}
                                        className="brp-prayer-blank"
                                        aria-label="직접 채워 넣어요"
                                      >
                                        {segment}
                                      </span>,
                                    ];
                                  }
                                  const tokens = segment.split(/\s+/).filter(Boolean);
                                  return tokens.map((token, tokenIdx) => {
                                    const idx = globalIdx;
                                    globalIdx += 1;
                                    return (
                                      <span
                                        key={`w-${segIdx}-${tokenIdx}`}
                                        className={`brp-prayer-word ${
                                          idx < readUpTo ? "is-read" : ""
                                        }`}
                                      >
                                        {token}
                                      </span>
                                    );
                                  });
                                })}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                    <div className="brp-prayer-actions">
                      <button
                        type="button"
                        className={`brp-prayer-mic ${
                          prayerListeningNo === prayer.no ? "is-listening" : ""
                        }`}
                        onClick={() =>
                          prayerListeningNo === prayer.no
                            ? stopPrayerListening()
                            : startPrayerListening(prayer.no)
                        }
                        disabled={!speechSupported}
                      >
                        <span className="brp-prayer-mic-dot" />
                        {prayerListeningNo === prayer.no ? "듣는 중지" : "기도 따라하기"}
                      </button>
                      <button
                        type="button"
                        className={`brp-prayer-check ${isDone ? "is-done" : ""}`}
                        onClick={() => togglePrayerCheck(prayer.no)}
                      >
                        {isDone ? "체크 해제" : "이 기도 마쳤어요"}
                      </button>
                      {(prayerReadCounts[prayer.no] ?? 0) > 0 && (
                        <button
                          type="button"
                          className="brp-prayer-restart"
                          onClick={() => resetPrayerProgress(prayer.no)}
                        >
                          처음부터
                        </button>
                      )}
                      {prayer.no < prayerTotal && (
                        <button
                          type="button"
                          className="brp-prayer-next"
                          onClick={() => setOpenPrayer(prayer.no + 1)}
                        >
                          다음 기도 →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        <div className="brp-prayer-lords">
          <p className="brp-prayer-label">주기도문 (마태복음 6:9-13)</p>
          <p>{prayerCard.lordsPrayer}</p>
        </div>

        {prayerDone > 0 && (
          <div className="brp-prayer-foot">
            <button type="button" className="brp-prayer-reset" onClick={resetPrayers}>
              오늘 기도 다시하기
            </button>
          </div>
        )}
      </section>

      <div className="brp-dock" role="region" aria-label="읽기 컨트롤">
        {readingMode === "mic" ? (
          <button
            type="button"
            className={`brp-mic ${listening ? "is-listening" : ""}`}
            onClick={() => (listening ? stopListening() : startListening())}
            disabled={!hasFilledText || !speechSupported}
          >
            <span />
            {listening ? "듣는 중지" : "마이크 시작"}
          </button>
        ) : (
          <span
            className={`brp-scroll-status ${scrollReady ? "is-ready" : ""}`}
            aria-live="polite"
            title={`이 장 최소 ${chapterMinSeconds}초`}
          >
            {scrollReady
              ? "다 읽었어요를 눌러주세요"
              : !scrollReachedBottom
              ? `본문 끝까지 (≥${chapterMinSeconds}초)`
              : `${scrollSecondsLeft}초만 더 천천히`}
          </span>
        )}
        <span className="brp-count">
          {readVerseCount} / {totalVerses || 0} 절
        </span>
        <button
          type="button"
          className="brp-reset"
          onClick={resetChapter}
          disabled={!hasFilledText || readVerseCount === 0}
          aria-label="이 장 처음부터 다시"
        >
          처음부터 다시
        </button>
        <button
          type="button"
          className={`brp-manual ${
            (
              readingMode === "mic"
                ? readVerseCount < Math.max(1, Math.floor(totalVerses * 0.8))
                : !scrollReady
            )
              ? "is-pending"
              : ""
          }`}
          onClick={handleManualFinish}
          disabled={!hasFilledText}
          aria-disabled={
            readingMode === "mic"
              ? readVerseCount < Math.max(1, Math.floor(totalVerses * 0.8))
              : !scrollReady
          }
        >
          다 읽었어요
        </button>
      </div>

      {(() => {
        const showPrayer = prayerListeningNo !== null || (prayerSpeechMessage && !speechMessage);
        const msg = showPrayer ? prayerSpeechMessage : speechMessage;
        if (!msg) return null;
        return <p className="brp-speech-message">{msg}</p>;
      })()}

      {completeVisible && (
        <div className="brp-complete" role="dialog" aria-modal="true">
          <div>
            <p>완료</p>
            <h2>{chapterNumber}장을 다 읽었어요</h2>
            <button type="button" onClick={() => setCompleteVisible(false)}>
              계속 보기
            </button>
          </div>
        </div>
      )}

      {quizOpen && quizQuestions.length > 0 && (
        <div className="brp-quiz" role="dialog" aria-modal="true">
          <div className="brp-quiz-card">
            <p className="brp-quiz-eyebrow">읽기 확인</p>
            <h2>{bookMeta.name} {chapterNumber}장 짧은 퀴즈</h2>
            <p className="brp-quiz-sub">
              두 문제 모두 맞히면 완료로 처리해요. 본문을 다시 보고 와도 괜찮아요.
            </p>

            <ol className="brp-quiz-list">
              {quizQuestions.map((q, idx) => {
                const selected = quizAnswers[idx];
                return (
                  <li key={`${q.verseNum}-${idx}`} className="brp-quiz-item">
                    <p className="brp-quiz-prompt">
                      <strong>{q.verseNum}절</strong> 빈칸에 들어갈 단어는?
                    </p>
                    <p className="brp-quiz-blanked">"{q.blanked}"</p>
                    <div className="brp-quiz-options">
                      {q.options.map((opt) => {
                        const isSelected = selected === opt;
                        const isCorrect = q.correct === opt;
                        const showCorrect = quizSubmitted && isCorrect;
                        const showWrong =
                          quizSubmitted && isSelected && !isCorrect;
                        return (
                          <button
                            key={opt}
                            type="button"
                            className={`brp-quiz-opt ${
                              isSelected ? "is-selected" : ""
                            } ${showCorrect ? "is-correct" : ""} ${
                              showWrong ? "is-wrong" : ""
                            }`}
                            disabled={quizSubmitted}
                            onClick={() => handleQuizAnswer(idx, opt)}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ol>

            {quizSubmitted && (
              <p
                className={`brp-quiz-result ${
                  quizAllCorrect ? "is-pass" : "is-fail"
                }`}
              >
                {quizAllCorrect
                  ? "잘했어요! 이 장을 완료로 처리할게요."
                  : "조금 더 읽고 다시 도전해 주세요."}
              </p>
            )}

            <div className="brp-quiz-actions">
              <button
                type="button"
                className="brp-quiz-cancel"
                onClick={handleQuizClose}
              >
                나중에
              </button>
              {!quizSubmitted ? (
                <button
                  type="button"
                  className="brp-quiz-submit"
                  disabled={quizAnswers.some((a) => !a)}
                  onClick={handleQuizSubmit}
                >
                  제출하기
                </button>
              ) : quizAllCorrect ? (
                <button
                  type="button"
                  className="brp-quiz-submit"
                  onClick={handleQuizClose}
                >
                  닫기
                </button>
              ) : (
                <button
                  type="button"
                  className="brp-quiz-submit"
                  onClick={handleQuizRetry}
                >
                  다시 풀기
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .brp-page {
          min-height: 100vh;
          background: #f7f6f3;
          color: #1a1a1a;
          font-family: Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui,
            sans-serif;
          padding: 88px clamp(8px, 2.4vw, 32px) 140px;
        }

        .brp-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 14px clamp(18px, 5vw, 72px);
          background: rgba(247, 246, 243, 0.82);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(26, 26, 26, 0.08);
        }

        .brp-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 520;
          color: #1a1a1a;
        }

        .brp-logo {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          object-fit: cover;
        }

        .brp-nav {
          display: flex;
          align-items: center;
          gap: 18px;
          font-size: 14px;
          color: rgba(26, 26, 26, 0.62);
        }

        .brp-nav a[aria-current="page"] {
          color: #1a1a1a;
          text-decoration: underline;
          text-underline-offset: 6px;
        }

        .brp-progress {
          position: fixed;
          top: 63px;
          left: 0;
          right: 0;
          z-index: 21;
          height: 2px;
          background: rgba(26, 26, 26, 0.08);
        }

        .brp-progress span {
          display: block;
          height: 100%;
          background: #1a1a1a;
          transition: width 0.25s ease;
        }

        .brp-hero {
          max-width: 900px;
          margin: 44px auto 44px;
          text-align: center;
        }

        .brp-eyebrow,
        .brp-section-label {
          margin: 0 0 14px;
          font-size: 12px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(26, 26, 26, 0.46);
        }

        .brp-hero h1 {
          margin: 0;
          font-family: Pretendard, "Noto Sans KR", -apple-system, BlinkMacSystemFont, "Segoe UI",
            system-ui, sans-serif;
          font-size: clamp(42px, 8vw, 82px);
          font-weight: 520;
          letter-spacing: -0.06em;
          line-height: 1.08;
        }

        .brp-hero p:last-child {
          max-width: 560px;
          margin: 24px auto 0;
          color: rgba(26, 26, 26, 0.64);
          font-size: clamp(15px, 1.6vw, 17px);
          line-height: 1.85;
          font-weight: 400;
          text-wrap: balance;
        }

        .brp-toolbar {
          max-width: 960px;
          margin: 0 auto 36px;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 18px;
        }

        .brp-translation,
        .brp-chapter-switcher {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(26, 26, 26, 0.1);
          border-radius: 999px;
          padding: 5px;
        }

        .brp-translation button,
        .brp-chapter-switcher button,
        .brp-dock button,
        .brp-grid button,
        .brp-complete button {
          border: 0;
          cursor: pointer;
          font: inherit;
        }

        .brp-translation button {
          padding: 9px 14px;
          border-radius: 999px;
          background: transparent;
          color: rgba(26, 26, 26, 0.58);
        }

        .brp-translation button.is-active {
          background: #1a1a1a;
          color: #f7f6f3;
        }

        .brp-chapter-switcher {
          gap: 10px;
          min-width: 280px;
          justify-content: center;
        }

        .brp-chapter-switcher button {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #1a1a1a;
          color: #f7f6f3;
        }

        .brp-chapter-select {
          position: relative;
          display: grid;
          min-width: 150px;
          padding: 3px 8px;
          text-align: center;
          cursor: pointer;
        }

        .brp-select-label {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(26, 26, 26, 0.36);
        }

        .brp-chapter-select select {
          width: 100%;
          appearance: none;
          -webkit-appearance: none;
          border: 0;
          border-radius: 0;
          background: transparent;
          background-image: none;
          color: #1a1a1a;
          cursor: pointer;
          font: inherit;
          font-size: 16px;
          font-weight: 650;
          line-height: 1.25;
          text-align: center;
          text-align-last: center;
          outline: none;
        }

        .brp-chapter-select select::-ms-expand {
          display: none;
        }

        .brp-select-title {
          margin-top: 2px;
          font-size: 12px;
          line-height: 1.25;
          color: rgba(26, 26, 26, 0.48);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .brp-chapter-select:focus-within .brp-select-label,
        .brp-chapter-select:focus-within .brp-select-title {
          color: rgba(26, 26, 26, 0.72);
        }

        .brp-chapter-select:focus-within select {
          color: #000;
        }

        .brp-reader,
        .brp-progress-grid,
        .brp-prayer {
          max-width: 960px;
          margin: 0 auto;
        }

        .brp-reader {
          background: rgba(255, 255, 255, 0.52);
          border: 1px solid rgba(26, 26, 26, 0.08);
          padding: clamp(16px, 2.4vw, 28px) clamp(12px, 2vw, 22px);
          overflow: hidden;
        }

        .brp-verse {
          display: grid;
          grid-template-columns: 1.8em minmax(0, 1fr);
          column-gap: clamp(8px, 1.2vw, 14px);
          align-items: start;
          margin: 0 0 22px;
          padding: 4px 8px;
          border-radius: 10px;
          font-size: clamp(17px, 1.75vw, 21px);
          line-height: 1.9;
          font-weight: 400;
          color: #1a1a1a;
          word-break: keep-all;
          overflow-wrap: normal;
          transition: background 0.3s ease, color 0.3s ease;
        }

        .brp-verse.is-read {
          color: #a8403e;
        }

        .brp-verse.is-read .brp-verse-number {
          color: rgba(168, 64, 62, 0.7);
        }

        .brp-verse.is-read .brp-verse-text {
          font-weight: 600;
        }

        .brp-verse.is-current {
          background: rgba(26, 26, 26, 0.05);
          box-shadow: inset 3px 0 0 #1a1a1a;
        }

        .brp-verse-number {
          color: rgba(26, 26, 26, 0.42);
          font-size: 1em;
          line-height: inherit;
          text-align: right;
          font-variant-numeric: tabular-nums;
          transition: color 0.3s ease;
        }

        .brp-verse-text {
          min-width: 0;
          margin: 0;
          overflow-wrap: break-word;
          transition: font-weight 0.3s ease;
        }

        .brp-verse-word {
          display: inline;
          margin-right: 0.28em;
          color: inherit;
          transition: color 0.28s ease, font-weight 0.28s ease;
        }

        .brp-verse-word.is-read {
          color: #a8403e;
          font-weight: 600;
        }

        .brp-book-tabs {
          max-width: 960px;
          margin: 0 auto 18px;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          padding: 6px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(26, 26, 26, 0.1);
          border-radius: 999px;
        }

        .brp-book-tab {
          all: unset;
          cursor: pointer;
          box-sizing: border-box;
          padding: 9px 18px;
          border-radius: 999px;
          background: transparent;
          color: rgba(26, 26, 26, 0.62);
          font-size: 14px;
          font-weight: 500;
          letter-spacing: -0.01em;
          transition: background 0.18s ease, color 0.18s ease;
        }

        .brp-book-tab:hover:not(.is-active) {
          background: rgba(26, 26, 26, 0.05);
          color: rgba(26, 26, 26, 0.82);
        }

        .brp-book-tab.is-active {
          background: #1a1a1a;
          color: #f7f6f3;
        }

        .brp-translation button.is-disabled,
        .brp-translation button:disabled {
          color: rgba(26, 26, 26, 0.3);
          cursor: not-allowed;
          background: transparent;
        }

        .brp-reader-empty {
          margin: 0 0 20px;
          padding: 18px 20px;
          border-radius: 12px;
          background: rgba(26, 26, 26, 0.04);
          color: rgba(26, 26, 26, 0.6);
          font-size: 14.5px;
          line-height: 1.7;
          text-align: center;
        }

        .brp-mode-tabs {
          max-width: 960px;
          margin: 0 auto 22px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(26, 26, 26, 0.1);
          border-radius: 18px;
          padding: 6px;
        }

        .brp-mode-tab {
          all: unset;
          cursor: pointer;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: flex-start;
          padding: 12px 16px;
          border-radius: 14px;
          background: transparent;
          color: rgba(26, 26, 26, 0.62);
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }

        .brp-mode-tab:hover:not(.is-active) {
          background: rgba(26, 26, 26, 0.04);
          color: rgba(26, 26, 26, 0.82);
        }

        .brp-mode-tab.is-active {
          background: #1a1a1a;
          color: #f7f6f3;
        }

        .brp-mode-tab-name {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .brp-mode-tab-desc {
          font-size: 12.5px;
          letter-spacing: -0.005em;
          opacity: 0.78;
          line-height: 1.4;
        }

        .brp-scroll-status {
          display: inline-flex;
          align-items: center;
          padding: 12px 14px;
          color: rgba(26, 26, 26, 0.62);
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
        }

        .brp-scroll-status.is-ready {
          color: #1a1a1a;
        }

        .brp-quiz {
          position: fixed;
          inset: 0;
          z-index: 32;
          display: grid;
          place-items: center;
          padding: 16px;
          background: rgba(26, 26, 26, 0.42);
          backdrop-filter: blur(8px);
        }

        .brp-quiz-card {
          width: min(94vw, 520px);
          max-height: 88vh;
          overflow-y: auto;
          background: #f7f6f3;
          border: 1px solid rgba(26, 26, 26, 0.1);
          border-radius: 18px;
          padding: 26px;
          box-shadow: 0 28px 80px rgba(26, 26, 26, 0.2);
        }

        .brp-quiz-eyebrow {
          margin: 0 0 8px;
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(26, 26, 26, 0.46);
        }

        .brp-quiz-card h2 {
          margin: 0 0 6px;
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.02em;
        }

        .brp-quiz-sub {
          margin: 0 0 22px;
          font-size: 13.5px;
          color: rgba(26, 26, 26, 0.56);
          line-height: 1.6;
        }

        .brp-quiz-list {
          list-style: none;
          margin: 0 0 18px;
          padding: 0;
          display: grid;
          gap: 18px;
        }

        .brp-quiz-item {
          background: #ffffff;
          border: 1px solid rgba(26, 26, 26, 0.1);
          border-radius: 14px;
          padding: 16px 16px 14px;
        }

        .brp-quiz-prompt {
          margin: 0 0 8px;
          font-size: 13px;
          color: rgba(26, 26, 26, 0.56);
        }

        .brp-quiz-prompt strong {
          color: #1a1a1a;
          font-weight: 600;
        }

        .brp-quiz-blanked {
          margin: 0 0 14px;
          font-size: 15.5px;
          line-height: 1.7;
          color: #1a1a1a;
          word-break: keep-all;
        }

        .brp-quiz-options {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .brp-quiz-opt {
          border: 1px solid rgba(26, 26, 26, 0.14);
          border-radius: 12px;
          padding: 11px 12px;
          background: transparent;
          color: #1a1a1a;
          font: inherit;
          font-size: 14.5px;
          cursor: pointer;
          text-align: center;
          transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
        }

        .brp-quiz-opt:hover:not(:disabled):not(.is-selected) {
          background: rgba(26, 26, 26, 0.04);
        }

        .brp-quiz-opt.is-selected {
          background: #1a1a1a;
          border-color: #1a1a1a;
          color: #f7f6f3;
        }

        .brp-quiz-opt.is-correct {
          background: rgba(56, 142, 60, 0.15);
          border-color: rgba(56, 142, 60, 0.7);
          color: #2e7d32;
        }

        .brp-quiz-opt.is-wrong {
          background: rgba(180, 63, 63, 0.12);
          border-color: rgba(180, 63, 63, 0.5);
          color: #b43f3f;
        }

        .brp-quiz-opt:disabled {
          cursor: default;
        }

        .brp-quiz-result {
          margin: 0 0 14px;
          padding: 10px 12px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 600;
          text-align: center;
        }

        .brp-quiz-result.is-pass {
          background: rgba(56, 142, 60, 0.12);
          color: #2e7d32;
        }

        .brp-quiz-result.is-fail {
          background: rgba(180, 63, 63, 0.1);
          color: #b43f3f;
        }

        .brp-quiz-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .brp-quiz-cancel,
        .brp-quiz-submit {
          border: 0;
          cursor: pointer;
          font: inherit;
          border-radius: 999px;
          padding: 11px 18px;
          font-size: 14px;
        }

        .brp-quiz-cancel {
          background: transparent;
          color: rgba(26, 26, 26, 0.65);
          border: 1px solid rgba(26, 26, 26, 0.16);
        }

        .brp-quiz-cancel:hover {
          background: rgba(26, 26, 26, 0.05);
          color: #1a1a1a;
        }

        .brp-quiz-submit {
          background: #1a1a1a;
          color: #f7f6f3;
        }

        .brp-quiz-submit:disabled {
          background: rgba(26, 26, 26, 0.18);
          color: rgba(247, 246, 243, 0.8);
          cursor: not-allowed;
        }

        .brp-progress-grid {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 28px;
          margin-top: 54px;
          padding-top: 42px;
          border-top: 1px solid rgba(26, 26, 26, 0.1);
        }

        .brp-progress-grid h2,
        .brp-prayer h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 500;
        }

        .brp-grid {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 10px;
        }

        .brp-grid button {
          aspect-ratio: 1;
          border-radius: 50%;
          background: transparent;
          color: rgba(26, 26, 26, 0.62);
          border: 1px solid rgba(26, 26, 26, 0.14);
        }

        .brp-grid button.is-current {
          outline: 2px solid #1a1a1a;
          outline-offset: 2px;
        }

        .brp-grid button.is-done {
          background: #1a1a1a;
          color: #f7f6f3;
        }

        .brp-prayer {
          margin-top: 64px;
          padding-top: 42px;
          border-top: 1px solid rgba(26, 26, 26, 0.1);
        }

        .brp-prayer-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 20px;
        }

        .brp-prayer-heading h2 {
          margin: 0;
        }

        .brp-prayer-meta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 10px 0 0;
          font-size: 13px;
          color: rgba(26, 26, 26, 0.5);
          font-variant-numeric: tabular-nums;
        }

        .brp-prayer-divider {
          color: rgba(26, 26, 26, 0.28);
        }

        .brp-prayer-count {
          color: rgba(26, 26, 26, 0.72);
          font-weight: 600;
        }

        .brp-prayer-toggle {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(26, 26, 26, 0.1);
          border-radius: 999px;
          padding: 4px;
          flex-shrink: 0;
        }

        .brp-prayer-toggle button {
          border: 0;
          cursor: pointer;
          font: inherit;
          padding: 8px 14px;
          border-radius: 999px;
          background: transparent;
          color: rgba(26, 26, 26, 0.58);
          font-size: 13px;
          letter-spacing: -0.01em;
        }

        .brp-prayer-toggle button.is-active {
          background: #1a1a1a;
          color: #f7f6f3;
        }

        .brp-prayer-bar {
          height: 2px;
          background: rgba(26, 26, 26, 0.08);
          margin-bottom: 22px;
        }

        .brp-prayer-bar span {
          display: block;
          height: 100%;
          background: #1a1a1a;
          transition: width 0.3s ease;
        }

        .brp-prayer-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: 10px;
        }

        .brp-prayer-item {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(26, 26, 26, 0.1);
          transition: border-color 0.2s ease, background 0.2s ease;
          min-width: 0;
          overflow: hidden;
        }

        .brp-prayer-item.is-open {
          background: #ffffff;
          border-color: rgba(26, 26, 26, 0.22);
        }

        .brp-prayer-item.is-done .brp-prayer-no {
          color: rgba(26, 26, 26, 0.32);
          text-decoration: line-through;
        }

        .brp-prayer-item.is-done .brp-prayer-theme {
          color: rgba(26, 26, 26, 0.52);
        }

        .brp-prayer-trigger {
          all: unset;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: 44px 1fr 28px;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 18px 22px;
          cursor: pointer;
          font-size: 17px;
        }

        .brp-prayer-trigger:focus-visible {
          outline: 2px solid #1a1a1a;
          outline-offset: 2px;
        }

        .brp-prayer-no {
          font-size: 13px;
          letter-spacing: 0.12em;
          color: rgba(26, 26, 26, 0.42);
          font-variant-numeric: tabular-nums;
        }

        .brp-prayer-theme {
          font-weight: 500;
          color: #1a1a1a;
          letter-spacing: -0.01em;
        }

        .brp-prayer-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1px solid rgba(26, 26, 26, 0.18);
          color: rgba(26, 26, 26, 0.52);
          background: transparent;
        }

        .brp-prayer-item.is-done .brp-prayer-mark {
          background: #1a1a1a;
          border-color: #1a1a1a;
          color: #f7f6f3;
        }

        .brp-prayer-mark-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(26, 26, 26, 0.22);
        }

        .brp-prayer-body {
          padding: 4px 22px 24px;
          border-top: 1px solid rgba(26, 26, 26, 0.06);
          display: grid;
          gap: 22px;
          min-width: 0;
        }

        .brp-prayer-body > * {
          min-width: 0;
        }

        .brp-prayer-verse {
          margin: 18px 0 0;
          padding: 0 0 0 16px;
          border-left: 2px solid rgba(26, 26, 26, 0.5);
          color: #1a1a1a;
        }

        .brp-prayer-verse p {
          margin: 0;
          font-size: 16px;
          line-height: 1.85;
          letter-spacing: -0.005em;
          word-break: keep-all;
          overflow-wrap: anywhere;
        }

        .brp-prayer-verse cite {
          display: block;
          margin-top: 8px;
          font-style: normal;
          font-size: 12px;
          letter-spacing: 0.04em;
          color: rgba(26, 26, 26, 0.5);
        }

        .brp-prayer-section {
          display: grid;
          gap: 8px;
        }

        .brp-prayer-label {
          margin: 0;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(26, 26, 26, 0.46);
        }

        .brp-prayer-think,
        .brp-prayer-text {
          margin: 0;
          color: #1a1a1a;
          font-size: 15.5px;
          line-height: 1.9;
          word-break: keep-all;
          overflow-wrap: anywhere;
          min-width: 0;
        }

        .brp-prayer-text-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 10px;
        }

        .brp-prayer-word-count {
          font-size: 12px;
          color: rgba(26, 26, 26, 0.5);
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }

        .brp-prayer-text-line {
          margin-bottom: 6px;
        }

        .brp-prayer-text-line:last-child {
          margin-bottom: 0;
        }

        .brp-prayer-word {
          display: inline;
          margin-right: 0.28em;
          color: #1a1a1a;
          transition: color 0.25s ease, font-weight 0.25s ease;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .brp-prayer-word.is-read {
          color: #a8403e;
          font-weight: 700;
        }

        .brp-prayer-blank {
          color: rgba(26, 26, 26, 0.42);
          font-style: italic;
          font-size: 0.92em;
          padding: 0 2px;
        }

        .brp-prayer-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .brp-prayer-mic,
        .brp-prayer-check,
        .brp-prayer-next,
        .brp-prayer-restart,
        .brp-prayer-reset {
          border: 0;
          cursor: pointer;
          font: inherit;
          border-radius: 999px;
          padding: 11px 18px;
          font-size: 14px;
          white-space: nowrap;
        }

        .brp-prayer-mic {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #1a1a1a;
          color: #f7f6f3;
        }

        .brp-prayer-mic.is-listening {
          background: #b43f3f;
          color: #fff;
        }

        .brp-prayer-mic:disabled {
          cursor: not-allowed;
          background: rgba(26, 26, 26, 0.08);
          color: rgba(26, 26, 26, 0.32);
        }

        .brp-prayer-mic-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }

        .brp-prayer-mic.is-listening .brp-prayer-mic-dot {
          animation: brpPulse 1.2s ease infinite;
        }

        .brp-prayer-restart {
          background: transparent;
          color: rgba(26, 26, 26, 0.6);
          border: 1px solid rgba(26, 26, 26, 0.16);
          font-size: 13px;
          padding: 10px 14px;
        }

        .brp-prayer-restart:hover {
          color: #1a1a1a;
          background: rgba(26, 26, 26, 0.05);
        }

        .brp-prayer-check {
          background: transparent;
          color: rgba(26, 26, 26, 0.72);
          border: 1px solid rgba(26, 26, 26, 0.18);
        }

        .brp-prayer-check.is-done {
          background: rgba(26, 26, 26, 0.06);
          color: rgba(26, 26, 26, 0.62);
          border: 1px solid rgba(26, 26, 26, 0.18);
        }

        .brp-prayer-next {
          background: transparent;
          color: rgba(26, 26, 26, 0.72);
          border: 1px solid rgba(26, 26, 26, 0.18);
        }

        .brp-prayer-next:hover,
        .brp-prayer-check:hover {
          background: rgba(26, 26, 26, 0.05);
          color: #1a1a1a;
        }

        .brp-prayer-lords {
          margin-top: 28px;
          padding: 26px 24px;
          background: rgba(26, 26, 26, 0.04);
          border-left: 2px solid rgba(26, 26, 26, 0.5);
        }

        .brp-prayer-lords p:last-child {
          margin: 12px 0 0;
          color: #1a1a1a;
          font-size: 15.5px;
          line-height: 1.95;
          word-break: keep-all;
        }

        .brp-prayer-foot {
          display: flex;
          justify-content: flex-end;
          margin-top: 18px;
        }

        .brp-prayer-reset {
          background: transparent;
          color: rgba(26, 26, 26, 0.6);
          border: 1px solid rgba(26, 26, 26, 0.16);
          font-size: 13px;
          padding: 9px 14px;
        }

        .brp-prayer-reset:hover {
          color: #1a1a1a;
          background: rgba(26, 26, 26, 0.05);
        }

        .brp-dock {
          position: fixed;
          left: 50%;
          bottom: 24px;
          z-index: 22;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.84);
          border: 1px solid rgba(26, 26, 26, 0.12);
          backdrop-filter: blur(18px);
          box-shadow: 0 18px 60px rgba(26, 26, 26, 0.12);
        }

        .brp-mic,
        .brp-manual {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 12px 16px;
          background: #1a1a1a;
          color: #f7f6f3;
          white-space: nowrap;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .brp-manual.is-pending {
          background: rgba(26, 26, 26, 0.18);
          color: rgba(247, 246, 243, 0.85);
        }

        .brp-manual.is-pending:hover {
          background: rgba(26, 26, 26, 0.28);
        }

        .brp-reset {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 10px 14px;
          background: transparent;
          color: rgba(26, 26, 26, 0.7);
          border: 1px solid rgba(26, 26, 26, 0.18);
          white-space: nowrap;
          font-size: 13px;
        }

        .brp-reset:hover:not(:disabled) {
          background: rgba(26, 26, 26, 0.05);
          color: #1a1a1a;
        }

        .brp-mic:disabled,
        .brp-manual:disabled,
        .brp-reset:disabled {
          cursor: not-allowed;
          background: rgba(26, 26, 26, 0.06);
          color: rgba(26, 26, 26, 0.32);
          border-color: transparent;
        }

        .brp-mic span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
        }

        .brp-mic.is-listening span {
          animation: brpPulse 1.2s ease infinite;
        }

        .brp-mic.is-listening {
          background: #b43f3f;
          color: #fff;
        }

        .brp-count {
          color: rgba(26, 26, 26, 0.6);
          font-size: 14px;
          white-space: nowrap;
        }

        .brp-speech-message {
          position: fixed;
          left: 50%;
          bottom: 92px;
          z-index: 22;
          transform: translateX(-50%);
          margin: 0;
          padding: 10px 14px;
          background: rgba(26, 26, 26, 0.82);
          color: #f7f6f3;
          border-radius: 999px;
          font-size: 13px;
        }

        .brp-complete {
          position: fixed;
          inset: 0;
          z-index: 30;
          display: grid;
          place-items: center;
          background: rgba(247, 246, 243, 0.78);
          backdrop-filter: blur(16px);
        }

        .brp-complete div {
          width: min(90vw, 420px);
          background: #f7f6f3;
          border: 1px solid rgba(26, 26, 26, 0.1);
          padding: 40px;
          text-align: center;
          box-shadow: 0 24px 80px rgba(26, 26, 26, 0.12);
        }

        .brp-complete p {
          margin: 0 0 12px;
          color: rgba(26, 26, 26, 0.44);
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: 12px;
        }

        .brp-complete h2 {
          margin: 0 0 24px;
          font-size: 28px;
          font-weight: 500;
        }

        .brp-complete button {
          border-radius: 999px;
          padding: 12px 18px;
          background: #1a1a1a;
          color: #f7f6f3;
        }

        @keyframes brpPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(180, 63, 63, 0.35);
          }
          100% {
            box-shadow: 0 0 0 12px rgba(180, 63, 63, 0);
          }
        }

        @media (max-width: 760px) {
          .brp-page {
            padding-top: 60px;
            padding-left: 4px;
            padding-right: 4px;
            padding-bottom: 188px;
          }

          .brp-header {
            flex-direction: row;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
          }

          .brp-brand {
            gap: 8px;
            font-size: 12.5px;
            font-weight: 500;
            min-width: 0;
            flex: 1;
          }

          .brp-brand span {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .brp-logo {
            width: 26px;
            height: 26px;
            border-radius: 7px;
          }

          .brp-progress {
            top: 47px;
          }

          .brp-nav {
            width: auto;
            justify-content: flex-end;
            gap: 12px;
            font-size: 13px;
            flex-shrink: 0;
          }

          .brp-nav a[aria-current="page"] {
            text-underline-offset: 4px;
          }

          .brp-nav-contact {
            display: none;
          }

          .brp-toolbar,
          .brp-progress-grid {
            grid-template-columns: 1fr;
          }

          .brp-toolbar {
            gap: 12px;
            margin-bottom: 22px;
          }

          .brp-hero {
            margin-top: 16px;
            margin-bottom: 22px;
          }

          .brp-eyebrow,
          .brp-section-label {
            margin-bottom: 8px;
            font-size: 10.5px;
            letter-spacing: 0.16em;
          }

          .brp-hero h1 {
            font-size: clamp(28px, 8.4vw, 38px);
            letter-spacing: -0.04em;
            line-height: 1.15;
          }

          .brp-hero p:last-child {
            max-width: 320px;
            margin-top: 14px;
            font-size: 13.5px;
            line-height: 1.7;
          }

          .brp-translation,
          .brp-chapter-switcher {
            width: 100%;
            justify-content: center;
          }

          .brp-chapter-switcher {
            min-width: 0;
          }

          .brp-chapter-select {
            flex: 1;
            min-width: 0;
            padding-right: 8px;
          }

          .brp-chapter-select select {
            font-size: 15px;
          }

          .brp-reader {
            padding: 14px 6px;
            border-radius: 14px;
          }

          .brp-verse {
            grid-template-columns: 1.4em minmax(0, 1fr);
            column-gap: 6px;
            margin-bottom: 14px;
            padding: 3px 6px;
            font-size: 16.5px;
            line-height: 1.8;
          }

          .brp-book-tabs {
            gap: 4px;
            padding: 4px;
            border-radius: 14px;
            margin-bottom: 12px;
          }

          .brp-book-tab {
            padding: 7px 11px;
            font-size: 12.5px;
            border-radius: 999px;
          }

          .brp-mode-tabs {
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            padding: 5px;
            border-radius: 14px;
            margin-bottom: 14px;
          }

          .brp-mode-tab {
            padding: 9px 10px;
            border-radius: 10px;
            gap: 2px;
          }

          .brp-mode-tab-name {
            font-size: 13.5px;
          }

          .brp-mode-tab-desc {
            font-size: 11px;
            line-height: 1.35;
          }

          .brp-quiz {
            padding: 12px;
          }

          .brp-quiz-card {
            padding: 20px 18px;
            border-radius: 16px;
          }

          .brp-quiz-card h2 {
            font-size: 19px;
          }

          .brp-quiz-sub {
            font-size: 12.5px;
            margin-bottom: 18px;
          }

          .brp-quiz-item {
            padding: 14px 14px 12px;
          }

          .brp-quiz-blanked {
            font-size: 14.5px;
            line-height: 1.7;
          }

          .brp-quiz-options {
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }

          .brp-quiz-opt {
            padding: 10px 8px;
            font-size: 13.5px;
          }

          .brp-quiz-actions {
            gap: 6px;
          }

          .brp-quiz-cancel,
          .brp-quiz-submit {
            padding: 10px 14px;
            font-size: 13px;
          }

          .brp-scroll-status {
            padding: 10px 8px;
            font-size: 12px;
          }

          .brp-progress-grid {
            margin-top: 36px;
            padding: 22px 16px;
            background: rgba(255, 255, 255, 0.55);
            border: 1px solid rgba(26, 26, 26, 0.08);
            border-radius: 14px;
            border-top: 1px solid rgba(26, 26, 26, 0.08);
            gap: 18px;
          }

          .brp-progress-grid h2,
          .brp-prayer h2 {
            font-size: 19px;
          }

          .brp-grid {
            grid-template-columns: repeat(6, 1fr);
            gap: 12px;
            row-gap: 14px;
          }

          .brp-grid button {
            font-size: 14px;
          }

          .brp-prayer {
            margin-top: 28px;
            padding: 22px 16px;
            background: rgba(255, 255, 255, 0.55);
            border: 1px solid rgba(26, 26, 26, 0.08);
            border-radius: 14px;
            border-top: 1px solid rgba(26, 26, 26, 0.08);
          }

          .brp-prayer-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
            margin-bottom: 16px;
          }

          .brp-prayer-bar {
            margin-bottom: 18px;
          }

          .brp-prayer-toggle {
            align-self: stretch;
            justify-content: center;
          }

          .brp-prayer-toggle button {
            flex: 1;
            text-align: center;
          }

          .brp-prayer-list {
            gap: 12px;
          }

          .brp-prayer-item {
            border-radius: 12px;
          }

          .brp-prayer-trigger {
            grid-template-columns: 32px 1fr 26px;
            gap: 10px;
            padding: 14px 14px;
            font-size: 15.5px;
          }

          .brp-prayer-body {
            padding: 4px 14px 18px;
            gap: 18px;
          }

          .brp-prayer-verse p,
          .brp-prayer-think,
          .brp-prayer-text,
          .brp-prayer-lords p:last-child {
            font-size: 15px;
            line-height: 1.85;
          }

          .brp-prayer-lords {
            padding: 20px 18px;
          }

          .brp-prayer-actions {
            flex-direction: column-reverse;
            align-items: stretch;
          }

          .brp-prayer-mic,
          .brp-prayer-check,
          .brp-prayer-next,
          .brp-prayer-restart {
            width: 100%;
            text-align: center;
            padding: 12px 14px;
            justify-content: center;
          }

          .brp-dock {
            width: calc(100% - 16px);
            flex-wrap: wrap;
            justify-content: center;
            gap: 6px;
            padding: 8px 10px;
            border-radius: 22px;
            bottom: 12px;
          }

          .brp-count {
            order: -1;
            flex-basis: 100%;
            text-align: center;
            font-size: 12px;
            padding: 2px 0 0;
          }

          .brp-mic,
          .brp-manual {
            flex: 1 1 0;
            min-width: 0;
            justify-content: center;
            padding: 10px 8px;
            font-size: 12.5px;
            gap: 6px;
          }

          .brp-reset {
            flex: 1 1 0;
            min-width: 0;
            justify-content: center;
            padding: 10px 8px;
            font-size: 12px;
          }

          .brp-mic span {
            width: 6px;
            height: 6px;
          }
        }

        @media (max-width: 380px) {
          .brp-dock {
            gap: 4px;
            padding: 7px 8px;
          }

          .brp-mic,
          .brp-manual,
          .brp-reset {
            padding: 9px 6px;
            font-size: 11.5px;
            letter-spacing: -0.02em;
          }

          .brp-mic {
            gap: 4px;
          }
        }
      `}</style>
    </main>
  );
}
