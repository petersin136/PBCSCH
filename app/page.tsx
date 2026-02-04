"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const sections = [
  {
    id: "section-1",
    category: "Sunday Worship",
    categoryKr: "주일예배",
    title: "Worship\nTogether",
  },
  {
    id: "section-2",
    category: "Bible Study",
    categoryKr: "성경공부",
    title: "Into the\nWord",
  },
  {
    id: "section-3",
    category: "Praise & Worship",
    categoryKr: "찬양과 경배",
    title: "Sing to\nthe Lord",
  },
  {
    id: "section-4",
    category: "Special Activities",
    categoryKr: "특별활동",
    title: "Joyful\nActivities",
  },
  {
    id: "section-5",
    category: "Our Teachers",
    categoryKr: "사랑하는 교사들",
    title: "Beloved\nTeachers",
  },
  {
    id: "section-6",
    category: "Gallery",
    categoryKr: "갤러리",
    title: "Our\nStories",
  },
];

const images = [
  "https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/WorshipTogether.jpg",
  "https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/Into%20theWord.jpg",
  "https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/Sing%20tothe%20Lord.jpg",
  "https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/JoyfulActivities.jpg",
  "https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/BelovedTeachers.jpg",
  "https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/OurStories.jpg",
];

export default function Home() {
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const rafRef = useRef<number | null>(null);
  const smoothScrollYRef = useRef(0);
  const targetScrollYRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const endVideoRef = useRef<HTMLVideoElement | null>(null);

  const imagesByIndex = useMemo(() => {
    return sections.map((_, idx) => images[idx % images.length]);
  }, []);

  const rainbowColors = useMemo(
    () => [
      "#ff3b30",
      "#ff9500",
      "#ffd60a",
      "#34c759",
      "#0a84ff",
      "#5e5ce6",
      "#bf5af2",
    ],
    [],
  );

  const renderRainbowText = (text: string) => {
    return text.split("").map((char, index) => (
      <span
        key={`${char}-${index}`}
        className="hero-char rainbow-char"
        style={{ color: rainbowColors[index % rainbowColors.length] }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  const renderSolidText = (text: string, color: string) => {
    return text.split("").map((char, index) => (
      <span
        key={`${char}-${index}`}
        className="hero-char solid-char"
        style={{ color }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ));
  };

  useEffect(() => {
    // Handle hash navigation - scroll to section if hash exists
    const hash = window.location.hash;
    if (hash && hash !== "#hero") {
      const targetElement = document.querySelector(hash);
      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollIntoView({ behavior: "auto" });
        }, 100);
      }
    } else {
      window.scrollTo(0, 0);
    }

    const updateTargetScroll = () => {
      targetScrollYRef.current = window.scrollY || 0;
    };

    const updateTransforms = () => {
      const windowH = window.innerHeight || 1;
      const vpCenter = windowH / 2;

      smoothScrollYRef.current +=
        (targetScrollYRef.current - smoothScrollYRef.current) * 0.1;

      let closestIdx = 0;
      let closestDist = Number.POSITIVE_INFINITY;

      cardRefs.current.forEach((card, idx) => {
        const section = sectionRefs.current[idx];
        if (!card || !section) {
          return;
        }

        const rect = card.getBoundingClientRect();
        const scrollDelta =
          targetScrollYRef.current - smoothScrollYRef.current;
        const virtualTop = rect.top + scrollDelta;
        const cardHeight = rect.height || 1;
        const cardCenter = virtualTop + cardHeight / 2;

        const nd = (cardCenter - vpCenter) / (windowH * 0.6);
        const clamped = Math.max(-1.5, Math.min(1.5, nd));
        const rotateX = clamped * -9;
        const translateX = clamped * -28;
        const translateZ = -70 - Math.abs(clamped) * 20;

        card.style.transform = `translate3d(${translateX.toFixed(
          2,
        )}px, 0, ${translateZ.toFixed(
          2,
        )}px) rotateZ(0.8deg) rotateY(7deg) rotateX(${rotateX.toFixed(
          3,
        )}deg)`;

        const dist = Math.abs(cardCenter - vpCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = idx;
        }
      });

      setActiveIndex((prev) => (prev === closestIdx ? prev : closestIdx));

      rafRef.current = window.requestAnimationFrame(updateTransforms);
    };

    updateTargetScroll();
    rafRef.current = window.requestAnimationFrame(updateTransforms);

    window.addEventListener("scroll", updateTargetScroll, { passive: true });
    window.addEventListener("resize", updateTargetScroll);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("scroll", updateTargetScroll);
      window.removeEventListener("resize", updateTargetScroll);
    };
  }, []);

  return (
    <main className="page">
      <div className="fixed-ui">
        <header className="header">
          <a className="brand-link" href="#hero">
            <div className="brand">
            <img
              className="brand-logo"
              src="https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/logo.jpg"
              alt="포천중앙침례교회 주일학교 로고"
              draggable={false}
              style={{ WebkitUserDrag: 'none', userSelect: 'none', pointerEvents: 'none' } as React.CSSProperties}
            />
            <span className="brand-main">포천중앙침례교회 주일학교</span>
            <span className="brand-sub">
              Pocheon Central Baptist Church Children School
            </span>
            </div>
          </a>
          <button
            className="mobile-nav-toggle"
            type="button"
            aria-label="모바일 메뉴 열기"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
          <nav className={`top-right ${mobileNavOpen ? "is-open" : ""}`}>
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`}>
                {section.categoryKr}
              </a>
            ))}
          </nav>
        </header>
        <div className="right-indicators" aria-hidden="true">
          {sections.map((_, idx) => (
            <span
              key={`indicator-${idx}`}
              className={`indicator ${activeIndex === idx ? "active" : ""}`}
            />
          ))}
        </div>
      </div>

      <section className="hero-mobile" aria-hidden="true">
        <div className="hero-mobile-stack">
          <video
            className="hero-mobile-video top"
            autoPlay
            muted
            playsInline
            preload="auto"
          >
            <source src="https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/videos/hea.mov" />
          </video>
          <video
            className="hero-mobile-video bottom"
            autoPlay
            muted
            playsInline
            loop
            preload="metadata"
          >
            <source
              src="https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/videos/he.mp4"
              type="video/mp4"
            />
          </video>
        </div>
      </section>

      <section id="hero" className={`hero ${videoEnded ? "hero-ended" : ""}`}>
        <video
          className="hero-video"
          autoPlay
          muted
          playsInline
          preload="metadata"
          onEnded={() => {
            setVideoEnded(true);
            if (endVideoRef.current) {
              endVideoRef.current.currentTime = 0;
              endVideoRef.current.play().catch(() => {});
            }
          }}
        >
          <source
            src="https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/videos/he.mp4"
            type="video/mp4"
          />
        </video>
        <div className="hero-ended-content" aria-hidden={!videoEnded}>
          <video
            className="hero-ended-full"
            autoPlay
            muted
            playsInline
            preload="auto"
            ref={endVideoRef}
          >
            <source
              src="https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/videos/hea.mov"
            />
          </video>
        </div>
      </section>

      {sections.map((section, idx) => (
        <section
          key={`${section.category}-${idx}`}
          id={section.id}
          className="section"
          ref={(el) => {
            sectionRefs.current[idx] = el;
          }}
        >
          <a
            className="card"
            ref={(el) => {
              cardRefs.current[idx] = el;
            }}
            href={
              idx === 0
                ? "/worship-together"
                : idx === 1
                  ? "/into-the-word"
                : idx === 2
                    ? "/sing-to-the-lord"
                  : idx === 3
                    ? "/joyful-activities"
                  : idx === 4
                    ? "/beloved-teachers"
                    : idx === 5
                      ? "/our-stories"
                      : "#"
            }
          >
            <div
              className="card-bg"
              style={{ backgroundImage: `url(${imagesByIndex[idx]})` }}
            />
            <div className="card-overlay" />
            <div className="card-curvature" />
            <div
              className={`card-content ${
                activeIndex === idx ? "is-active" : ""
              }`}
            >
              <span className="category">
                {section.category}
                <span className="category-kr"> · {section.categoryKr}</span>
              </span>
              <h2 className="title" aria-label={section.title}>
                {section.title.split("\n").map((line, lineIdx) => (
                  <span className="title-line" key={`${line}-${lineIdx}`}>
                    {line.split("").map((char, charIdx) => (
                      <span
                        className="title-char"
                        key={`${lineIdx}-${charIdx}-${char}`}
                        style={{
                          transitionDelay: `${
                            0.18 + (lineIdx * 18 + charIdx) * 0.03
                          }s`,
                        }}
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </span>
                ))}
              </h2>
              <button className="arrow" aria-label="Open section">
                <span className="arrow-bg arrow-bg-dark" />
                <span className="arrow-bg arrow-bg-light" />
                <span className="arrow-icon">→</span>
              </button>
            </div>
          </a>
        </section>
      ))}

      <style jsx>{`
        .page {
          background: #000;
          min-height: 100vh;
          position: relative;
        }

        .hero {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: #000;
          padding-top: 52px;
        }

        .hero-video {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          top: 52px;
          width: 100%;
          height: calc(100% - 52px);
          object-fit: contain;
          filter: saturate(0.9);
          z-index: 0;
          background: #000;
          transition: opacity 0.35s ease;
        }

        .hero-ended {
          background: #f6e6a6;
        }

        .hero-ended .hero-video {
          opacity: 0;
          pointer-events: none;
        }

        .hero-ended-content {
          position: absolute;
          inset: 0;
          display: block;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.3s ease, visibility 0.3s ease;
          z-index: 1;
        }

        .hero-ended .hero-ended-content {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .hero-ended-full {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .hero-ended .hero-ended-full {
          opacity: 1;
        }

        .hero-mobile {
          display: none;
          background: #000;
          padding: 90px 16px 24px;
        }

        .hero-mobile-stack {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .hero-mobile-video {
          width: 100%;
          border-radius: 12px;
          background: #000;
        }

        @font-face {
          font-family: "TMoneyDungunbaram";
          src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-07@1.0/TmoneyRoundWindRegular.woff")
            format("woff");
          font-weight: normal;
          font-display: swap;
        }

        @font-face {
          font-family: "TMoneyDungunbaram";
          src: url("https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-07@1.0/TmoneyRoundWindExtraBold.woff")
            format("woff");
          font-weight: 800;
          font-display: swap;
        }

        .section {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1000px;
          perspective-origin: center 50%;
        }

        .card {
          width: min(92%, 1160px);
          height: clamp(420px, 72vh, 680px);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
          transform-origin: 50% 50%;
          backface-visibility: hidden;
          will-change: transform;
          transition: transform 0.2s linear;
        }

        .card-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transform: scale(1);
          transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 0;
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            rgba(0, 0, 0, 0.05),
            rgba(0, 0, 0, 0.25)
          );
          z-index: 1;
        }

        .card-curvature {
          position: absolute;
          inset: 0;
          background: radial-gradient(
              120% 120% at 0% 50%,
              rgba(0, 0, 0, 0.4),
              transparent 60%
            ),
            radial-gradient(
              120% 120% at 100% 50%,
              rgba(0, 0, 0, 0.4),
              transparent 60%
            );
          mix-blend-mode: multiply;
          opacity: 0.7;
          z-index: 1;
          pointer-events: none;
        }

        .card:hover .card-bg {
          transform: scale(1.05);
        }

        .card-content {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: clamp(24px, 6vw, 72px);
          gap: clamp(18px, 2.2vw, 28px);
        }

        .card-content > * {
          opacity: 0;
          transform: translateX(-40px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .card-content.is-active > * {
          opacity: 1;
          transform: translateX(0);
        }

        .card-content.is-active .category {
          transition-delay: 0.12s;
        }

        .card-content.is-active .title {
          transition-delay: 0.22s;
        }

        .card-content.is-active .arrow {
          transition-delay: 0.34s;
        }

        .card-content .title-line {
          display: block;
        }

        .card-content .title-char {
          display: inline-block;
          opacity: 0;
          transform: translateX(-16px);
          transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .card-content.is-active .title-char {
          opacity: 1;
          transform: translateX(0);
        }

        .category {
          font-family: Inter, sans-serif;
          font-size: clamp(13px, 1.15vw, 16px);
          font-weight: 700;
          color: rgba(255, 255, 255, 0.88);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .category-kr {
          font-size: clamp(11px, 1vw, 13px);
          font-weight: 500;
          letter-spacing: 0.02em;
          opacity: 0.7;
        }

        .title {
          font-family: "Playfair Display", Georgia, serif;
          font-style: italic;
          font-weight: 400;
          font-size: clamp(58px, 10vw, 140px);
          line-height: 0.92;
          letter-spacing: -0.03em;
          color: #fff;
          white-space: pre-line;
          margin: 0;
        }

        .arrow {
          position: relative;
          width: 52px;
          height: 52px;
          border: none;
          background: transparent;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          margin-top: clamp(8px, 2vw, 20px);
        }

        .arrow-bg {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .arrow-bg-dark {
          background: rgba(0, 0, 0, 0.65);
          transform: scale(1);
        }

        .arrow-bg-light {
          background: #fff;
          transform: scale(0);
        }

        .arrow-icon {
          position: relative;
          z-index: 1;
          color: #fff;
          font-size: 18px;
          transition: color 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .card:hover .arrow-bg-dark {
          transform: scale(0);
        }

        .card:hover .arrow-bg-light {
          transform: scale(1);
        }

        .card:hover .arrow-icon {
          color: #111;
        }

        .fixed-ui {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 10;
        }

        .header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          pointer-events: auto;
          background: #2563eb;
          padding: 9px clamp(16px, 4vw, 48px);
          border-radius: 0;
          box-shadow: none;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #fff;
          line-height: 1;
          text-align: left;
        }

        .brand-link {
          display: inline-flex;
          align-items: center;
        }

        .brand-logo {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          object-fit: cover;
          flex-shrink: 0;
          padding: 2px;
          background: rgba(255, 255, 255, 0.08);
        }

        .brand-main {
          font-weight: 700;
          font-size: clamp(13px, 1.4vw, 18px);
          letter-spacing: 0.02em;
          word-break: keep-all;
        }

        .brand-sub {
          font-weight: 400;
          font-size: clamp(11px, 1.1vw, 14px);
          opacity: 0.8;
          word-break: keep-all;
        }

        .top-right {
          display: flex;
          gap: 18px;
          font-size: clamp(12px, 1.2vw, 15px);
          opacity: 0.85;
          color: #fff;
          pointer-events: auto;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .mobile-nav-toggle {
          display: none;
          width: 32px;
          height: 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
          z-index: 100;
          flex-direction: column;
          justify-content: space-between;
          align-items: stretch;
        }

        .mobile-nav-toggle span {
          display: block;
          height: 3px;
          background: #fff;
          border-radius: 2px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .top-right a {
          position: relative;
          transition: opacity 0.25s ease, transform 0.25s ease;
        }

        .top-right a::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -6px;
          width: 100%;
          height: 1px;
          background: rgba(255, 255, 255, 0.7);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.35s ease;
        }

        .top-right a:hover {
          opacity: 1;
          transform: translateY(-1px);
        }

        .top-right a:hover::after {
          transform: scaleX(1);
        }

        .bottom-left {
          position: absolute;
          left: clamp(20px, 4vw, 50px);
          bottom: clamp(20px, 4vw, 40px);
          font-size: clamp(11px, 1vw, 13px);
          opacity: 0.4;
          color: rgba(12, 42, 120, 0.6);
          pointer-events: auto;
          line-height: 1.4;
        }

        .right-indicators {
          position: absolute;
          right: clamp(16px, 2.5vw, 36px);
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        }

        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 2px;
          border: 1px solid rgba(0, 0, 0, 0.18);
          background: transparent;
        }

        .indicator.active {
          border-color: rgba(0, 0, 0, 0.75);
          background: rgba(0, 0, 0, 0.08);
        }

        @media (max-width: 900px) {
          .mobile-nav-toggle {
            display: flex;
          }

          .top-right {
            position: absolute;
            top: 100%;
            right: 16px;
            flex-direction: column;
            background: rgba(37, 99, 235, 0.98);
            padding: 12px 16px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
            opacity: 0;
            pointer-events: none;
            transform: translateY(-8px);
            transition: all 0.2s ease;
          }

          .top-right.is-open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
          }

          .top-right a {
            font-size: 14px;
            padding: 6px 2px;
          }

          .hero {
            justify-content: flex-start;
          }

          .hero-mobile {
            display: block;
          }

          .hero {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .top-right {
            gap: 14px;
          }
        }
      `}</style>
    </main>
  );
}
