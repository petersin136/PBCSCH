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
  0: { transcript: string };
  isFinal: boolean;
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

const normalizeKorean = (value: string) => {
  let text = value
    .toLowerCase()
    .replace(/[^\u3131-\u318e\uac00-\ud7a3a-z0-9]/g, "")
    .trim();

  for (let i = 0; i < 2; i += 1) {
    text = text.replace(
      /(으로|에게|에서|부터|까지|처럼|보다|은|는|이|가|을|를|에|의|와|과|도|만|로|께|야|아)$/u,
      "",
    );
  }

  return text;
};

const consumeMatch = (source: string, target: string) => {
  if (!source || !target) return null;

  if (target.length <= 2) {
    if (source.startsWith(target)) {
      return source.slice(target.length);
    }
    return null;
  }

  if (source.startsWith(target)) {
    return source.slice(target.length);
  }

  const headLength = Math.max(2, Math.ceil(target.length * 0.6));
  if (headLength < target.length && source.startsWith(target.slice(0, headLength))) {
    return source.slice(headLength);
  }

  return null;
};

const isLooseMatch = (spoken: string, target: string) => {
  if (!spoken || !target) return false;
  if (spoken === target) return true;

  if (target.length <= 2 || spoken.length <= 2) {
    return spoken === target;
  }

  if (spoken.startsWith(target) || target.startsWith(spoken)) {
    return true;
  }

  const minLength = Math.max(2, Math.ceil(Math.min(spoken.length, target.length) * 0.6));
  let matched = 0;

  for (let i = 0; i < Math.min(spoken.length, target.length); i += 1) {
    if (spoken[i] !== target[i]) break;
    matched += 1;
  }

  return matched >= minLength;
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

  const finishThreshold = totalWords > 0 ? Math.max(1, Math.floor(totalWords * 0.9)) : 0;

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

      let nextIndex = readCountRef.current;

      const canJumpTo = (toIndex: number) => {
        if (toIndex <= nextIndex) return false;
        const seen = new Set<string>();
        for (let i = nextIndex; i <= toIndex; i += 1) {
          const w = words[i];
          if (!w) return false;
          if (seen.has(w.normalized)) return false;
          seen.add(w.normalized);
        }
        return true;
      };

      spokenWords.forEach((spoken) => {
        const current = words[nextIndex];
        if (current && isLooseMatch(spoken, current.normalized)) {
          nextIndex += 1;
          return;
        }

        if (spoken.length < 3) return;

        // Allow skipping 1-2 missed words but never across duplicates.
        for (let offset = 1; offset <= 2; offset += 1) {
          const candidate = words[nextIndex + offset];
          if (!candidate) break;
          if (!canJumpTo(nextIndex + offset)) break;
          if (isLooseMatch(spoken, candidate.normalized)) {
            nextIndex += offset + 1;
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
      while (spokenStream && safety < 400 && nextIndex < words.length) {
        const current = words[nextIndex];
        if (!current) break;

        const remaining = consumeMatch(spokenStream, current.normalized);
        if (remaining !== null) {
          spokenStream = remaining;
          nextIndex += 1;
          safety += 1;
          continue;
        }

        let jumped = false;
        for (let offset = 1; offset <= 2; offset += 1) {
          const candidate = words[nextIndex + offset];
          if (!candidate || !canJumpTo(nextIndex + offset)) break;
          if (candidate.normalized.length < 2) continue;

          const skipped = consumeMatch(spokenStream, candidate.normalized);
          if (skipped !== null) {
            spokenStream = skipped;
            nextIndex += offset + 1;
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
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      processTranscript(transcript);
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
          <a href="/#contact">문의</a>
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

      <section className="brp-prayer">
        <p className="brp-section-label">오늘의 기도</p>
        <div className="brp-prayer-card">
          <h2>기도카드 준비 중</h2>
          <p>추후 기도카드 이미지나 PDF를 받으면 이 영역에 체크리스트를 연결할 수 있어요.</p>
        </div>
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
          padding: 88px clamp(18px, 5vw, 72px) 140px;
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
          padding: clamp(24px, 4.5vw, 52px);
          overflow: hidden;
        }

        .brp-verse {
          display: grid;
          grid-template-columns: 2.25em minmax(0, 1fr);
          column-gap: clamp(12px, 2vw, 22px);
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
          margin-top: 58px;
        }

        .brp-prayer-card {
          border: 1px dashed rgba(26, 26, 26, 0.18);
          background: rgba(255, 255, 255, 0.46);
          padding: 32px;
          color: rgba(26, 26, 26, 0.62);
        }

        .brp-prayer-card p {
          margin: 10px 0 0;
          line-height: 1.7;
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
            padding-left: 16px;
            padding-right: 16px;
            padding-bottom: 132px;
          }

          .brp-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 10px;
          }

          .brp-progress {
            top: 94px;
          }

          .brp-nav {
            width: 100%;
            justify-content: space-between;
            gap: 10px;
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
            margin-top: 30px;
            margin-bottom: 30px;
          }

          .brp-hero h1 {
            font-size: clamp(38px, 13vw, 56px);
          }

          .brp-hero p:last-child {
            max-width: 310px;
            font-size: 15px;
            line-height: 1.75;
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
            padding: 22px 16px;
          }

          .brp-verse {
            grid-template-columns: 1.8em minmax(0, 1fr);
            column-gap: 12px;
            margin-bottom: 20px;
            font-size: 17px;
            line-height: 1.85;
          }

          .brp-grid {
            grid-template-columns: repeat(6, 1fr);
          }

          .brp-dock {
            width: calc(100% - 24px);
            justify-content: space-between;
            gap: 6px;
            bottom: 12px;
          }

          .brp-mic,
          .brp-manual {
            padding: 10px 12px;
            font-size: 13px;
          }

          .brp-count {
            font-size: 12px;
          }
        }
      `}</style>
    </main>
  );
}
