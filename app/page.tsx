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

      <section
        className="relative z-10 flex min-h-[50vh] flex-col items-center justify-center text-center px-4 pt-20 pb-20 md:min-h-screen md:px-8 md:pt-[100px] md:pb-[100px] bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.68), rgba(255,255,255,0.68)), url('https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/KakaoTalk_Photo_2026-01-04-00-39-12%20003.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <p
          className="text-gray-900 text-sm md:text-base tracking-[0.3em] md:tracking-[0.4em] mb-6 md:mb-8"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 300, letterSpacing: "0.4em" }}
        >
          포 천 중 앙 침 례 교 회
        </p>
        <div className="w-full max-w-3xl h-[1px] bg-gray-700 opacity-60 mb-8 md:mb-12" />
        <h2
          className="text-gray-900 mb-10 md:mb-14"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 400,
            fontSize: "clamp(36px, 7vw, 90px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Children&apos;s Ministry
        </h2>
        <p
          className="text-gray-900 text-lg md:text-xl lg:text-2xl mb-2 font-semibold"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.8 }}
        >
          포천중앙침례교회 주일학교는<br className="md:hidden" /> 아이들이 하나님의 사랑을 경험하는 곳입니다.
        </p>
        <p
          className="text-gray-900 text-base md:text-lg lg:text-xl mb-1"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 300, lineHeight: 1.9 }}
        >
          우리는 눈높이에 맞는 예배로 하나님을 만나고,
        </p>
        <p
          className="text-gray-900 text-base md:text-lg lg:text-xl mb-1"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 300, lineHeight: 1.9 }}
        >
          친구들과 함께 웃고 뛰며 믿음 안에서 자라갑니다.
        </p>
        <p
          className="text-gray-900 text-base md:text-lg lg:text-xl mb-1"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 300, lineHeight: 1.9 }}
        >
          말씀을 쉽고 재미있게 배우며,
        </p>
        <p
          className="text-gray-900 text-base md:text-lg lg:text-xl mb-10 md:mb-14"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 300, lineHeight: 1.9 }}
        >
          하나님을 사랑하는 어린이로 성장합니다.
        </p>
        <p
          className="text-gray-900 text-lg md:text-xl lg:text-2xl font-medium mb-1"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.8 }}
        >
          처음 오는 친구도, 오래 다닌 친구도,
        </p>
        <p
          className="text-gray-900 text-lg md:text-xl lg:text-2xl font-medium mb-12 md:mb-16"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", lineHeight: 1.8 }}
        >
          모두 환영합니다. 함께 신나는 주일을 만들어요!
        </p>
        <a
          href="#worship-times"
          onClick={(e) => {
            e.preventDefault();
            const el = document.getElementById("worship-times");
            if (el) {
              const headerHeight = window.innerWidth <= 768 ? 50 : 40;
              const offset = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
              window.scrollTo({ top: Math.max(0, offset), behavior: "smooth" });
            } else {
              window.location.hash = "worship-times";
            }
            return false;
          }}
          className="inline-block border-2 border-gray-900 text-gray-900 px-6 md:px-10 py-2.5 md:py-3 rounded-lg transition-all duration-300 hover:bg-gray-900 hover:text-white mt-12 md:mt-16"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 400, fontSize: "13px", letterSpacing: "0.5em" }}
        >
          예 배 안 내
        </a>
      </section>

      {/* 마키: P.B.C.S.C.H / 주일학교 무지개 반복 */}
      <section className="marquee-section bg-black py-4 md:py-6" aria-hidden="true">
        <div className="marquee-track">
          {[1, 2].map((copy) => (
            <div
              key={copy}
              className="marquee-row font-bold tracking-[0.25em] md:tracking-[0.35em]"
            >
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-red-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-orange-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-yellow-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-green-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-blue-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-purple-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-pink-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-red-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-orange-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-yellow-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-green-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-blue-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-purple-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-pink-outline">주일학교&nbsp;</span>
              <span className="color-white">P.B.C.S.C.H&nbsp;</span>
              <span className="color-red-outline">주일학교&nbsp;</span>
            </div>
          ))}
        </div>
      </section>

      {/* 부모님 환영 섹션 */}
      <section
        id="parents-welcome"
        className="pt-[60px] pb-8 px-6 md:py-[100px] md:px-6"
        style={{ background: "linear-gradient(180deg, #FDF8F3 0%, #FFFFFF 100%)" }}
      >
        <div className="mx-auto max-w-[900px]">
          {/* 헤더 */}
          <div className="mb-14 md:mb-16 text-center">
            <p
              className="text-sm mb-4 font-[400]"
              style={{ color: "#4A90D9", letterSpacing: "0.2em", fontFamily: "'Noto Sans KR', sans-serif" }}
            >
              FOR PARENTS
            </p>
            <h2
              className="mb-6 text-[#333] font-normal"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(36px, 6vw, 56px)" }}
            >
              Welcome, 부모님
            </h2>
            <p
              className="text-xl text-[#555] font-light"
              style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
            >
              &quot;우리 아이, 맡겨도 괜찮을까요?&quot;
            </p>
            <p
              className="mt-2 text-[17px] text-[#888] font-light"
              style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
            >
              그 마음, 저희도 압니다.
            </p>
          </div>

          {/* 3가지 약속 카드 */}
          <div className="mb-14 md:mb-16 grid gap-6 grid-cols-1 md:grid-cols-3 auto-rows-fr">
            <div
              className="parents-welcome-card rounded-[20px] px-7 py-9 text-center bg-white"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-[28px]"
                style={{ background: "linear-gradient(135deg, #FFE5D0 0%, #FFD4B8 100%)" }}
              >
                👋
              </div>
              <h3 className="text-lg font-semibold text-[#333] mb-3" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                이름을 기억해요
              </h3>
              <p className="text-[15px] text-[#666] leading-[1.35] font-light" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                한 명 한 명,
                <br />
                이름으로 부르고 기억해요.
              </p>
            </div>
            <div
              className="parents-welcome-card rounded-[20px] px-7 py-9 text-center bg-white"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-[28px]"
                style={{ background: "linear-gradient(135deg, #D4EDFF 0%, #B8DFFF 100%)" }}
              >
                🙏
              </div>
              <h3 className="text-lg font-semibold text-[#333] mb-3" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                기도로 준비해요
              </h3>
              <p className="text-[15px] text-[#666] leading-[1.35] font-light" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                선생님들은 예배 전
                <br />
                아이들 이름을 부르며 기도해요.
              </p>
            </div>
            <div
              className="parents-welcome-card rounded-[20px] px-7 py-9 text-center bg-white"
              style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 text-[28px]"
                style={{ background: "linear-gradient(135deg, #E8F5E8 0%, #D0EED0 100%)" }}
              >
                💚
              </div>
              <h3 className="text-lg font-semibold text-[#333] mb-3" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                억지로 시키지 않아요
              </h3>
              <p className="text-[15px] text-[#666] leading-[1.35] font-light" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                기도도, 찬양도, 발표도 강요하지 않아요.
                <br />
                아이의 속도에 맞춰 천천히 함께 가요.
              </p>
            </div>
          </div>

          {/* Q&A 영역 */}
          <div
            className="rounded-[24px] p-8 md:p-10 mb-12 bg-white"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}
          >
            <h3
              className="text-sm mb-7 text-center"
              style={{ color: "#4A90D9", letterSpacing: "0.15em", fontFamily: "'Noto Sans KR', sans-serif" }}
            >
              자주 묻는 질문
            </h3>
            <div className="mb-6 pb-6 border-b border-[#f0f0f0]">
              <p className="text-base font-semibold text-[#333] mb-2" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                Q. 처음 와도 괜찮을까요?
              </p>
              <p className="text-[15px] text-[#666] leading-[1.35] font-light" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                물론이에요! 어색하지 않게 친구들과 어울릴 수 있도록 도와드려요.
              </p>
            </div>
            <div>
              <p className="text-base font-semibold text-[#333] mb-2" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                Q. 아이가 소심한데요...
              </p>
              <p className="text-[15px] text-[#666] leading-[1.35] font-light" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                괜찮아요. 조용히 앉아 있어도 돼요. 그냥 함께 있는 것만으로 충분해요.
              </p>
            </div>
          </div>

          {/* 목표 강조 */}
          <div
            className="text-center py-12 px-6 rounded-[24px] text-white"
            style={{ background: "linear-gradient(135deg, #4A90D9 0%, #6BA3E0 100%)" }}
          >
            <p
              className="text-sm mb-4 opacity-80"
              style={{ letterSpacing: "0.15em", fontFamily: "'Noto Sans KR', sans-serif" }}
            >
              OUR GOAL
            </p>
            <p className="text-[15px] mb-3 opacity-90 font-light" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
              저희 목표는 하나예요.
            </p>
            <p
              className="mb-4 leading-snug font-normal"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 4vw, 32px)" }}
            >
              &quot;하나님은 나를 사랑하신다&quot;
            </p>
            <p className="text-[15px] opacity-90 font-light" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
              이 한 가지만 마음에 새겨지면 충분해요.
            </p>
          </div>

          {/* 마무리 */}
          <p
            className="text-center mt-8 md:mt-12 text-xl text-[#333] font-medium"
            style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
          >
            편하게 보내주세요. 💙
          </p>
        </div>
      </section>

      {sections.map((section, idx) => (
        <div key={`${section.category}-${idx}-wrap`} id={idx === 0 ? "worship-times" : undefined}>
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
        </div>
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
        @media (max-width: 768px) {
          .section {
            height: 88vh;
          }
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
        @media (max-width: 768px) {
          .card-content {
            gap: clamp(9px, 1.1vw, 14px);
          }
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
