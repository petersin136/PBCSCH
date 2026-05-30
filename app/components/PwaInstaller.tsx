"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "pwa_install_dismissed_at";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7일

function isStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as { standalone?: boolean }).standalone === true;
  return Boolean(mq || iosStandalone);
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIosUa = /iPad|iPhone|iPod/.test(ua);
  const isIpadOs =
    ua.includes("Macintosh") &&
    typeof document !== "undefined" &&
    "ontouchend" in document;
  return isIosUa || isIpadOs;
}

function isSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

export default function PwaInstaller() {
  const [mounted, setMounted] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isStandaloneMode()) {
      setInstalled(true);
      return;
    }

    // 서비스 워커: 개발 모드에서는 등록하지 않고 기존 등록분과 캐시도 정리한다.
    // (dev 서버는 매 빌드마다 /_next/static/* 청크의 쿼리스트링이 바뀌어
    //  SW가 캐시한 옛 URL을 fetch하다 ERR_FAILED가 발생하기 때문)
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV !== "production") {
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => Promise.all(regs.map((r) => r.unregister())))
          .catch(() => undefined);
        if (typeof caches !== "undefined") {
          caches
            .keys()
            .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
            .catch(() => undefined);
        }
      } else {
        const onLoad = () => {
          navigator.serviceWorker
            .register("/sw.js", { scope: "/" })
            .catch(() => undefined);
        };
        if (document.readyState === "complete") onLoad();
        else window.addEventListener("load", onLoad, { once: true });
      }
    }

    // 최근 닫음 처리
    try {
      const raw = localStorage.getItem(DISMISS_KEY);
      const dismissedAt = raw ? Number(raw) : 0;
      if (dismissedAt && Date.now() - dismissedAt < DISMISS_TTL_MS) {
        return;
      }
    } catch (e) {
      // ignore
    }

    const handleBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const handleInstalled = () => {
      setInstalled(true);
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);
    window.addEventListener("appinstalled", handleInstalled);

    // iOS Safari: beforeinstallprompt 미지원 → 수동 안내
    if (isIos() && isSafari() && !isStandaloneMode()) {
      // 페이지 로드 후 약간 지연
      const t = window.setTimeout(() => setVisible(true), 1200);
      return () => {
        window.clearTimeout(t);
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstall as EventListener,
        );
        window.removeEventListener("appinstalled", handleInstalled);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    setShowIosSheet(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (e) {
      // ignore
    }
  }, []);

  const onInstallClick = useCallback(async () => {
    if (deferred) {
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice.outcome === "accepted") {
          setInstalled(true);
        }
      } catch (e) {
        // ignore
      } finally {
        setDeferred(null);
        setVisible(false);
      }
    } else if (isIos()) {
      setShowIosSheet(true);
    }
  }, [deferred]);

  const platform: "android" | "ios" | "other" = useMemo(() => {
    if (!mounted) return "other";
    if (deferred) return "android";
    if (isIos() && isSafari()) return "ios";
    return "other";
  }, [mounted, deferred]);

  if (!mounted || installed) return null;
  if (!visible && !showIosSheet) return null;

  return (
    <>
      {visible && !showIosSheet && (
        <div
          role="dialog"
          aria-label="홈 화면에 앱으로 추가하기"
          style={{
            position: "fixed",
            left: "50%",
            bottom: "calc(16px + env(safe-area-inset-bottom))",
            transform: "translateX(-50%)",
            zIndex: 9999,
            width: "min(440px, calc(100% - 24px))",
            background: "#f7f6f3",
            color: "#2a2a2a",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 14,
            boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
            padding: "14px 14px 14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily:
              "'Noto Sans KR', Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          <div
            aria-hidden
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: 8,
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.06)",
              backgroundImage: "url(/icons/icon-192.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.35 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>
              홈 화면에 앱으로 추가하기
            </div>
            <div style={{ fontSize: 12, color: "#6a6a6a", marginTop: 2 }}>
              {platform === "ios"
                ? "사파리에서 공유 → 홈 화면에 추가로 설치하세요."
                : "앱처럼 빠르게 열고 오프라인에서도 사용할 수 있어요."}
            </div>
          </div>
          {platform === "ios" ? (
            <button
              onClick={() => setShowIosSheet(true)}
              style={{
                flexShrink: 0,
                background: "#2a2a2a",
                color: "#f7f6f3",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              방법 보기
            </button>
          ) : (
            <button
              onClick={onInstallClick}
              style={{
                flexShrink: 0,
                background: "#2a2a2a",
                color: "#f7f6f3",
                border: "none",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              설치하기
            </button>
          )}
          <button
            onClick={dismiss}
            aria-label="닫기"
            style={{
              flexShrink: 0,
              background: "transparent",
              border: "none",
              color: "#9a9a9a",
              fontSize: 18,
              lineHeight: 1,
              padding: "4px 6px",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>
      )}

      {showIosSheet && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="홈 화면에 추가하는 방법"
          onClick={dismiss}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(20,20,20,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 12,
            fontFamily:
              "'Noto Sans KR', Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(460px, 100%)",
              background: "#f7f6f3",
              color: "#2a2a2a",
              borderRadius: 16,
              padding: "18px 18px calc(18px + env(safe-area-inset-bottom)) 18px",
              boxShadow: "0 -12px 40px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.06)",
                  backgroundImage: "url(/icons/icon-192.png)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div style={{ lineHeight: 1.35 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  홈 화면에 앱으로 추가하기
                </div>
                <div style={{ fontSize: 12, color: "#6a6a6a", marginTop: 2 }}>
                  아이폰(사파리)에서 두 단계로 끝나요.
                </div>
              </div>
            </div>

            <div
              style={{
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 13.5,
              }}
            >
              <Step
                index={1}
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2a2a2a"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M12 16V4" />
                    <path d="M8 8l4-4 4 4" />
                    <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
                  </svg>
                }
              >
                사파리 하단(또는 상단)의 <strong>공유 버튼</strong> 누르기
              </Step>
              <div
                style={{
                  height: 1,
                  background: "rgba(0,0,0,0.06)",
                  margin: "10px 0",
                }}
              />
              <Step
                index={2}
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2a2a2a"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <rect x="4" y="4" width="16" height="16" rx="2.5" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                  </svg>
                }
              >
                메뉴를 내려서{" "}
                <strong>&ldquo;홈 화면에 추가&rdquo;</strong> 선택
              </Step>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 11.5,
                color: "#8a8a8a",
                lineHeight: 1.5,
              }}
            >
              크롬·인앱브라우저에서는 추가가 안 됩니다. <strong>사파리</strong>로 열어주세요.
            </div>

            <button
              onClick={dismiss}
              style={{
                marginTop: 14,
                width: "100%",
                background: "#2a2a2a",
                color: "#f7f6f3",
                border: "none",
                borderRadius: 10,
                padding: "12px 14px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              알겠어요
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Step({
  index,
  icon,
  children,
}: {
  index: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          background: "#f1efe9",
          color: "#2a2a2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {index}
      </div>
      <div style={{ flexShrink: 0 }}>{icon}</div>
      <div style={{ lineHeight: 1.45 }}>{children}</div>
    </div>
  );
}
