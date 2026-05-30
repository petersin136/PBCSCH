"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import proverbsData from "./proverbs.json";
import prayersJson from "./prayers.json";

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

const data = proverbsData as BibleData;
const prayersData = prayersJson as PrayersData;
const expectedCounts = [
  33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35, 33, 33, 28, 24, 29,
  30, 31, 29, 35, 34, 28, 28, 27, 28, 27, 33, 31,
];

const doneKey = (chapter: number) => `proverbs_done_${chapter}`;
const progressKey = (chapter: number) => `proverbs_progress_${chapter}`;

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

const consumeMatch = (source: string, target: string) => {
  if (!source || !target) return null;

  if (source.startsWith(target)) {
    return source.slice(target.length);
  }

  if (target.length <= 1) {
    return null;
  }

  // Allow consuming when the first ~50% of the target appears at the
  // beginning of the source. Forgiving for kids' pronunciation gaps.
  const headLength = Math.max(1, Math.floor(target.length * 0.5));
  if (headLength < target.length && source.startsWith(target.slice(0, headLength))) {
    return source.slice(headLength);
  }

  // Allow a single mismatched first syllable when the rest matches.
  if (target.length >= 3 && source.length >= target.length - 1) {
    const tail = target.slice(1);
    if (source.slice(1).startsWith(tail)) {
      return source.slice(target.length);
    }
  }

  return null;
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
  const [chapterNumber, setChapterNumber] = useState(1);
  const [translation, setTranslation] = useState<TranslationKey>("krv");
  const [readCount, setReadCount] = useState(0);
  const [doneChapters, setDoneChapters] = useState<Set<number>>(new Set());
  const [listening, setListening] = useState(false);
  const [speechMessage, setSpeechMessage] = useState("");
  const [manualCanFinish, setManualCanFinish] = useState(false);
  const [completeVisible, setCompleteVisible] = useState(false);
  const [prayerGrade, setPrayerGrade] = useState<PrayerGradeKey>("lower");
  const [prayerDate, setPrayerDate] = useState<string>(() => getTodayKey());
  const [prayerChecks, setPrayerChecks] = useState<Set<number>>(new Set());
  const [openPrayer, setOpenPrayer] = useState<number | null>(null);

  const listeningRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const readCountRef = useRef(0);
  const minReadTimeRef = useRef(0);
  const reachedBottomRef = useRef(false);

  const chapter = data.chapters.find((item) => item.chapter === chapterNumber) ?? data.chapters[0];
  const verses = chapter.verses[translation];

  const words = useMemo<WordToken[]>(() => {
    return verses.flatMap((verse) =>
      verse.t
        .split(/\s+/)
        .map((word) => word.trim())
        .filter(Boolean)
        .map((word, index) => ({
          id: `${chapter.chapter}-${translation}-${verse.n}-${index}`,
          verse: verse.n,
          text: word,
          normalized: normalizeKorean(word),
        })),
    );
  }, [chapter, translation, verses]);

  const totalWords = words.length;
  const progress = totalWords > 0 ? Math.min(100, (readCount / totalWords) * 100) : 0;
  const speechSupported = typeof window !== "undefined" && getSpeechRecognition() !== null;
  const hasFilledText = totalWords > 0;

  const groupedWords = useMemo(() => {
    return verses.map((verse) => ({
      n: verse.n,
      text: verse.t,
      words: words.filter((word) => word.verse === verse.n),
    }));
  }, [verses, words]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    setListening(false);
    recognitionRef.current?.abort();
  }, []);

  const finishThreshold = totalWords > 0 ? Math.max(1, Math.floor(totalWords * 0.8)) : 0;

  const markComplete = useCallback(() => {
    if (!hasFilledText) return;
    if (readCountRef.current < finishThreshold) {
      setSpeechMessage(
        "아직 본문을 다 읽지 않았어요. 마이크로 끝까지 읽어 주세요.",
      );
      return;
    }
    stopListening();
    setReadCount(totalWords);
    readCountRef.current = totalWords;
    window.localStorage.setItem(doneKey(chapterNumber), "true");
    window.localStorage.setItem(progressKey(chapterNumber), String(totalWords));
    setDoneChapters((prev) => new Set(prev).add(chapterNumber));
    setCompleteVisible(true);
  }, [chapterNumber, finishThreshold, hasFilledText, stopListening, totalWords]);

  const resetChapter = useCallback(() => {
    stopListening();
    readCountRef.current = 0;
    setReadCount(0);
    setCompleteVisible(false);
    setSpeechMessage("");
    window.localStorage.removeItem(doneKey(chapterNumber));
    window.localStorage.removeItem(progressKey(chapterNumber));
    setDoneChapters((prev) => {
      if (!prev.has(chapterNumber)) return prev;
      const next = new Set(prev);
      next.delete(chapterNumber);
      return next;
    });
  }, [chapterNumber, stopListening]);

  const processTranscript = useCallback(
    (transcript: string) => {
      if (!hasFilledText) return;

      const spokenWords = transcript
        .split(/\s+/)
        .map(normalizeKorean)
        .filter(Boolean);
      let spokenStream = spokenWords.join("");

      // 정규화 결과가 빈 문자열인 단어(예: "이는"가 모든 조사 제거 후 "" 가
      // 되는 등의 극단 케이스)는 매칭이 불가능하므로 자동으로 건너뛴다.
      const skipEmpty = (idx: number) => {
        let i = idx;
        while (i < words.length && words[i] && words[i].normalized === "") {
          i += 1;
        }
        return i;
      };

      let nextIndex = skipEmpty(readCountRef.current);

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

      spokenWords.forEach((spoken) => {
        nextIndex = skipEmpty(nextIndex);
        const current = words[nextIndex];
        if (current && isLooseMatch(spoken, current.normalized)) {
          nextIndex = skipEmpty(nextIndex + 1);
          return;
        }

        if (spoken.length < 2) return;

        // Allow skipping up to 3 missed words but never across duplicates.
        for (let offset = 1; offset <= 3; offset += 1) {
          const candidate = words[nextIndex + offset];
          if (!candidate) break;
          if (!canJumpTo(nextIndex + offset)) break;
          if (isLooseMatch(spoken, candidate.normalized)) {
            nextIndex = skipEmpty(nextIndex + offset + 1);
            return;
          }
        }
      });

      // Korean speech recognition often returns the whole utterance, including
      // already-recognized verses, as a single growing string. Consume the
      // syllable stream from the current reading position, and when nothing
      // matches, slide one character forward to skip past content that was
      // already read (or recognition noise).
      let safety = 0;
      while (spokenStream && safety < 600 && nextIndex < words.length) {
        nextIndex = skipEmpty(nextIndex);
        if (nextIndex >= words.length) break;
        const current = words[nextIndex];
        if (!current) break;

        const remaining = consumeMatch(spokenStream, current.normalized);
        if (remaining !== null) {
          spokenStream = remaining;
          nextIndex = skipEmpty(nextIndex + 1);
          safety += 1;
          continue;
        }

        let jumped = false;
        for (let offset = 1; offset <= 3; offset += 1) {
          const candidate = words[nextIndex + offset];
          if (!candidate || !canJumpTo(nextIndex + offset)) break;
          if (candidate.normalized.length < 1) continue;

          const skipped = consumeMatch(spokenStream, candidate.normalized);
          if (skipped !== null) {
            spokenStream = skipped;
            nextIndex = skipEmpty(nextIndex + offset + 1);
            safety += 1;
            jumped = true;
            break;
          }
        }

        if (!jumped) {
          spokenStream = spokenStream.slice(1);
          safety += 1;
        }
      }

      nextIndex = skipEmpty(nextIndex);

      if (nextIndex !== readCountRef.current) {
        readCountRef.current = nextIndex;
        setReadCount(nextIndex);
        window.localStorage.setItem(progressKey(chapterNumber), String(nextIndex));
      }
    },
    [chapterNumber, hasFilledText, words],
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
      if (listeningRef.current && readCountRef.current < totalWords) {
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
    setSpeechMessage("듣고 있어요. 말씀을 천천히 또박또박 읽어 주세요.");

    try {
      recognition.start();
    } catch {
      setSpeechMessage("음성인식을 시작하지 못했어요. 잠시 후 다시 눌러 주세요.");
      setListening(false);
      listeningRef.current = false;
    }
  }, [hasFilledText, processTranscript, totalWords]);

  const moveChapter = (next: number) => {
    const clamped = Math.min(31, Math.max(1, next));
    setChapterNumber(clamped);
    setCompleteVisible(false);
    stopListening();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const done = new Set<number>();
    data.chapters.forEach((item) => {
      if (window.localStorage.getItem(doneKey(item.chapter)) === "true") {
        done.add(item.chapter);
      }
    });
    setDoneChapters(done);
  }, []);

  useEffect(() => {
    const savedDone = window.localStorage.getItem(doneKey(chapterNumber)) === "true";
    const savedProgress = Number(window.localStorage.getItem(progressKey(chapterNumber)) ?? "0");
    const nextCount = savedDone && totalWords > 0 ? totalWords : Math.min(savedProgress, totalWords);

    readCountRef.current = nextCount;
    setReadCount(nextCount);
    setManualCanFinish(false);
    reachedBottomRef.current = false;
    minReadTimeRef.current = Date.now() + Math.max(15000, Math.ceil((verses.map((v) => v.t).join("").length / 500) * 60000));
  }, [chapterNumber, totalWords, translation, verses]);

  useEffect(() => {
    if (totalWords > 0 && readCount >= totalWords) {
      markComplete();
    }
  }, [markComplete, readCount, totalWords]);

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

  useEffect(() => {
    const onScroll = () => {
      const bottomDistance =
        document.documentElement.scrollHeight - (window.scrollY + window.innerHeight);
      if (bottomDistance < 120) {
        reachedBottomRef.current = true;
      }

      if (reachedBottomRef.current && Date.now() >= minReadTimeRef.current) {
        setManualCanFinish(true);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = window.setInterval(onScroll, 1000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(timer);
    };
  }, [chapterNumber, translation]);

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
        <h1>잠언 통독</h1>
        <p>
          하루 한 장씩 소리 내어 읽어요. 읽은 단어가 차분한 색으로 표시되고,
          한 장을 마치면 완료됩니다.
        </p>
      </section>

      <section className="brp-toolbar" aria-label="성경 읽기 조작">
        <div className="brp-translation">
          {(Object.keys(data.translations) as TranslationKey[]).map((key) => (
            <button
              key={key}
              type="button"
              className={translation === key ? "is-active" : ""}
              onClick={() => setTranslation(key)}
            >
              {data.translations[key].label}
            </button>
          ))}
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
              aria-label="잠언 장 선택"
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

      <section className="brp-reader" aria-label={`잠언 ${chapterNumber}장 본문`}>
        {groupedWords.map((verse) => (
          <div key={`${chapterNumber}-${translation}-${verse.n}`} className="brp-verse">
            <span className="brp-verse-number">{verse.n}</span>
            <p className="brp-verse-text">
              {verse.words.length > 0
                ? verse.words.map((word) => {
                    const wordIndex = words.findIndex((item) => item.id === word.id);
                    return (
                      <span
                        key={word.id}
                        className={`brp-word ${wordIndex < readCount ? "is-read" : ""}`}
                      >
                        {word.text}
                      </span>
                    );
                  })
                : null}
            </p>
          </div>
        ))}
      </section>

      <section className="brp-progress-grid" aria-label="잠언 통독 진도">
        <div>
          <p className="brp-section-label">진도</p>
          <h2>31일 잠언 읽기</h2>
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
              aria-label={`잠언 ${item.chapter}장으로 이동`}
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
                      <p className="brp-prayer-label">따라서 기도해요</p>
                      <p className="brp-prayer-text">{prayer.pray}</p>
                    </div>

                    <div className="brp-prayer-actions">
                      <button
                        type="button"
                        className={`brp-prayer-check ${isDone ? "is-done" : ""}`}
                        onClick={() => togglePrayerCheck(prayer.no)}
                      >
                        {isDone ? "체크 해제" : "이 기도 마쳤어요"}
                      </button>
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
        <button
          type="button"
          className={`brp-mic ${listening ? "is-listening" : ""}`}
          onClick={() => (listening ? stopListening() : startListening())}
          disabled={!hasFilledText}
        >
          <span />
          {listening ? "듣는 중지" : "마이크 시작"}
        </button>
        <span className="brp-count">
          {readCount} / {totalWords || 0} 단어
        </span>
        <button
          type="button"
          className="brp-reset"
          onClick={resetChapter}
          disabled={!hasFilledText || readCount === 0}
          aria-label="이 장 처음부터 다시"
        >
          처음부터 다시
        </button>
        <button
          type="button"
          className="brp-manual"
          onClick={markComplete}
          disabled={
            !hasFilledText ||
            (readCount < finishThreshold && !(manualCanFinish && !speechSupported))
          }
        >
          다 읽었어요
        </button>
      </div>

      {speechMessage && <p className="brp-speech-message">{speechMessage}</p>}

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
          font-size: clamp(17px, 1.75vw, 21px);
          line-height: 1.9;
          font-weight: 400;
          color: #1a1a1a;
          word-break: keep-all;
          overflow-wrap: normal;
        }

        .brp-verse-number {
          color: rgba(26, 26, 26, 0.42);
          font-size: 1em;
          line-height: inherit;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .brp-verse-text {
          min-width: 0;
          margin: 0;
          overflow-wrap: break-word;
        }

        .brp-word {
          display: inline;
          margin-right: 0.28em;
          color: #1a1a1a;
          transition: color 0.25s ease, font-weight 0.25s ease;
        }

        .brp-word.is-read {
          color: #a8403e;
          font-weight: 700;
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
          gap: 10px;
        }

        .brp-prayer-item {
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(26, 26, 26, 0.1);
          transition: border-color 0.2s ease, background 0.2s ease;
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
        }

        .brp-prayer-text {
          white-space: pre-line;
        }

        .brp-prayer-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .brp-prayer-check,
        .brp-prayer-next,
        .brp-prayer-reset {
          border: 0;
          cursor: pointer;
          font: inherit;
          border-radius: 999px;
          padding: 11px 18px;
          font-size: 14px;
          white-space: nowrap;
        }

        .brp-prayer-check {
          background: #1a1a1a;
          color: #f7f6f3;
        }

        .brp-prayer-check.is-done {
          background: transparent;
          color: rgba(26, 26, 26, 0.7);
          border: 1px solid rgba(26, 26, 26, 0.18);
        }

        .brp-prayer-next {
          background: transparent;
          color: rgba(26, 26, 26, 0.72);
          border: 1px solid rgba(26, 26, 26, 0.18);
        }

        .brp-prayer-next:hover,
        .brp-prayer-check.is-done:hover {
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
            margin-bottom: 18px;
            font-size: 16.5px;
            line-height: 1.8;
          }

          .brp-grid {
            grid-template-columns: repeat(6, 1fr);
          }

          .brp-prayer {
            margin-top: 42px;
            padding-top: 28px;
          }

          .brp-prayer-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }

          .brp-prayer-toggle {
            align-self: stretch;
            justify-content: center;
          }

          .brp-prayer-toggle button {
            flex: 1;
            text-align: center;
          }

          .brp-prayer-trigger {
            grid-template-columns: 36px 1fr 26px;
            gap: 10px;
            padding: 14px 16px;
            font-size: 16px;
          }

          .brp-prayer-body {
            padding: 4px 16px 20px;
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

          .brp-prayer-check,
          .brp-prayer-next {
            width: 100%;
            text-align: center;
            padding: 12px 14px;
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
