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

const PARENT_NOTICE_HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>포천중앙침례교회 주일학교 안내</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; min-height: 100%; padding: 20px; line-height: 1.7; color: #333; }
    .container { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); overflow: hidden; }
    .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px 30px; text-align: center; color: white; }
    .header h1 { font-size: 1.8rem; font-weight: 700; margin-bottom: 8px; text-shadow: 0 2px 10px rgba(0,0,0,0.2); }
    .header p { font-size: 1rem; opacity: 0.95; }
    .content { padding: 30px; }
    .greeting { background: linear-gradient(135deg, #fff9e6 0%, #fff3cd 100%); border-left: 4px solid #ffc107; padding: 20px; border-radius: 12px; margin-bottom: 25px; font-size: 0.95rem; }
    .greeting strong { color: #e65100; }
    .section { margin-bottom: 28px; }
    .section-title { display: flex; align-items: center; gap: 10px; font-size: 1.15rem; font-weight: 700; color: #1a237e; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e8eaf6; }
    .section-title .icon { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
    .icon-time { background: #e3f2fd; } .icon-bus { background: #fff3e0; } .icon-safety { background: #e8f5e9; } .icon-video { background: #fce4ec; } .icon-heart { background: #f3e5f5; }
    .time-box { background: #f8f9ff; border-radius: 16px; padding: 20px; display: flex; flex-wrap: wrap; gap: 15px; }
    .time-item { flex: 1; min-width: 200px; background: white; border-radius: 12px; padding: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); text-align: center; }
    .time-item .label { font-size: 0.85rem; color: #666; margin-bottom: 8px; }
    .time-item .time { font-size: 1.4rem; font-weight: 700; color: #1565c0; }
    .time-item .note { font-size: 0.8rem; color: #888; margin-top: 6px; }
    .info-list { list-style: none; }
    .info-list li { position: relative; padding: 12px 0 12px 28px; border-bottom: 1px solid #f0f0f0; font-size: 0.95rem; }
    .info-list li:last-child { border-bottom: none; }
    .info-list li::before { content: "✓"; position: absolute; left: 0; color: #4caf50; font-weight: bold; }
    .highlight-box { background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 12px; padding: 18px; margin-top: 15px; }
    .highlight-box.warning { background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%); }
    .highlight-box p { font-size: 0.9rem; display: flex; align-items: flex-start; gap: 10px; }
    .highlight-box .emoji { font-size: 1.2rem; flex-shrink: 0; }
    .bus-schedule { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 15px; }
    .bus-item { background: white; border-radius: 12px; padding: 15px; text-align: center; box-shadow: 0 3px 10px rgba(0,0,0,0.08); }
    .bus-item .direction { font-size: 0.85rem; color: #ff6f00; font-weight: 600; margin-bottom: 6px; }
    .bus-item .schedule { font-size: 1.1rem; font-weight: 700; color: #333; }
    .video-content { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 15px; }
    .video-item { background: white; border-radius: 10px; padding: 12px 15px; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .closing { background: linear-gradient(135deg, #e1f5fe 0%, #b3e5fc 100%); border-radius: 16px; padding: 25px; text-align: center; margin-top: 20px; }
    .closing p { font-size: 0.95rem; margin-bottom: 15px; }
    .closing .signature { font-weight: 700; color: #0277bd; font-size: 1rem; }
    .contact-btn { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 30px; text-decoration: none; font-weight: 600; margin-top: 10px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s, box-shadow 0.2s; }
    .contact-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5); }
    @media (max-width: 500px) { body { padding: 10px; } .header { padding: 30px 20px; } .header h1 { font-size: 1.5rem; } .content { padding: 20px; } .bus-schedule { grid-template-columns: 1fr; } .video-content { grid-template-columns: 1fr; } .time-box { flex-direction: column; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⛪ 포천중앙침례교회 주일학교</h1>
      <p>학부모님 안내문</p>
    </div>
    <div class="content">
      <div class="greeting">
        <strong>학부모님께 💌</strong><br><br>
        안녕하세요! 주일학교 담당 <strong>신승용 전도사</strong>입니다.<br>
        혹시 학부모님들도 어린 시절 주일학교에서 친구들과 뛰어놀고, 찬양하며 보냈던 따뜻한 추억이 있으신가요?<br>
        저희도 우리 아이들에게 그런 소중한 경험을 선물하고 싶습니다. 🙏
      </div>
      <div class="section">
        <div class="section-title"><span class="icon icon-time">⏰</span>예배 시간 안내</div>
        <div class="time-box">
          <div class="time-item">
            <div class="label">예배 시간</div>
            <div class="time">오후 2시 ~ 4시</div>
            <div class="note">교사들이 함께하는 시간</div>
          </div>
          <div class="time-item">
            <div class="label">등교 권장 시간</div>
            <div class="time">오후 1시 50분</div>
            <div class="note">여유있게 준비할 수 있어요</div>
          </div>
        </div>
      </div>
      <div class="section">
        <div class="section-title"><span class="icon icon-bus">🚌</span>차량 운행 안내</div>
        <p style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">아이들의 안전한 등하교를 위해 교회 차량을 운행합니다.</p>
        <div class="bus-schedule">
          <div class="bus-item"><div class="direction">🏠→⛪ 등교</div><div class="schedule">1:30 ~ 2:00</div></div>
          <div class="bus-item"><div class="direction">⛪→🏠 하교</div><div class="schedule">4:00 ~ 4:30</div></div>
        </div>
        <div class="highlight-box warning">
          <p><span class="emoji">📌</span><span>주중 연습(찬양, 워십댄스)이 있을 경우 담당 선생님이 미리 일정과 차량 시간을 공지해드립니다.</span></p>
        </div>
      </div>
      <div class="section">
        <div class="section-title"><span class="icon icon-safety">🛡️</span>안전한 주일학교를 위한 협력</div>
        <ul class="info-list">
          <li>예배 시간 동안 <strong>교회 건물 안</strong>에서 교사들이 함께합니다</li>
          <li>예배 전후에도 <strong>건물 내</strong>에서는 교사들이 살핍니다</li>
          <li>교회 밖(체육공원, 야외)은 교사 동행이 어려워요</li>
          <li>아이가 외부에 나가고 싶을 때는 <strong>학부모님께 먼저 연락</strong>드립니다</li>
        </ul>
        <div class="highlight-box">
          <p><span class="emoji">💡</span><span>가정에서도 이 부분을 아이들과 미리 이야기 나눠주시면 큰 도움이 됩니다!</span></p>
        </div>
      </div>
      <div class="section">
        <div class="section-title"><span class="icon icon-video">📹</span>활동 영상 공유 안내</div>
        <p style="font-size: 0.9rem; color: #666; margin-bottom: 10px;">아이들의 소중한 순간을 유튜브 쇼츠와 인스타그램에 공유합니다.</p>
        <div class="video-content">
          <div class="video-item">🎵 찬양하는 모습</div>
          <div class="video-item">📖 말씀 듣는 모습</div>
          <div class="video-item">🙏 예배드리는 모습</div>
          <div class="video-item">🎉 활동하는 모습</div>
        </div>
        <div class="highlight-box">
          <p><span class="emoji">🤝</span><span>아이들 성격에 맞춰 존중하며 촬영하겠습니다.</span></p>
        </div>
      </div>
      <div class="section">
        <div class="section-title"><span class="icon icon-heart">💝</span>교회와 가정이 함께</div>
        <p style="font-size: 0.95rem;">아이들이 친구들과 어울리며 관계 맺는 법을 배워가는 과정에서 때로는 서툴 수 있습니다. 필요한 경우 학부모님과 소통하며 아이들이 건강하게 성장할 수 있도록 함께 돕겠습니다.</p>
      </div>
      <div class="closing">
        <p>우리 아이들이 주일학교에서 <strong>예수님의 사랑</strong>을 경험하고,<br>친구들과 <strong>행복한 추억</strong>을 만들어갈 수 있도록 최선을 다하겠습니다. 🌈</p>
        <p style="font-size: 0.85rem; color: #666;">늘 감사드리며, 주님의 은혜가 가정에 가득하시길 기도합니다.</p>
        <div class="signature">포천중앙침례교회 주일학교 교사 일동</div>
        <a href="sms:01040028880" class="contact-btn">💬 문의하기</a>
      </div>
    </div>
  </div>
</body>
</html>`;

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [parentNoticeOpen, setParentNoticeOpen] = useState(false);

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
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setMobileNavOpen(false)}
              >
                {section.categoryKr}
              </a>
            ))}
            <a href="/bible-reading" onClick={() => setMobileNavOpen(false)}>
              성경읽기
            </a>
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
            className="hero-mobile-video"
            autoPlay
            muted
            playsInline
            preload="auto"
          >
            <source src="https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/videos/hea.mov" />
          </video>
        </div>
      </section>

      <section id="hero" className="hero">
        <video
          className="hero-video"
          autoPlay
          muted
          playsInline
          preload="auto"
        >
          <source src="https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/videos/hea.mov" />
        </video>
      </section>

      <section
        className="section-after-hero relative z-10 flex min-h-[50vh] flex-col items-center justify-center text-center px-4 pt-0 pb-20 md:min-h-screen md:px-8 md:pt-[100px] md:pb-[100px] bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.84), rgba(255,255,255,0.84)), url('https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/KakaoTalk_Photo_2026-01-04-00-39-12%20003.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <p
          className="text-gray-900 text-sm md:text-base tracking-[0.3em] md:tracking-[0.4em] mb-6 md:mb-8 font-bold"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700, letterSpacing: "0.4em" }}
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
          className="text-gray-900 text-base md:text-lg lg:text-xl mb-1 font-medium"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600, lineHeight: 1.9 }}
        >
          우리는 눈높이에 맞는 예배로 하나님을 만나고,
        </p>
        <p
          className="text-gray-900 text-base md:text-lg lg:text-xl mb-1 font-medium"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600, lineHeight: 1.9 }}
        >
          친구들과 함께 웃고 뛰며 믿음 안에서 자라갑니다.
        </p>
        <p
          className="text-gray-900 text-base md:text-lg lg:text-xl mb-1 font-medium"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600, lineHeight: 1.9 }}
        >
          말씀을 쉽고 재미있게 배우며,
        </p>
        <p
          className="text-gray-900 text-base md:text-lg lg:text-xl mb-10 md:mb-14 font-medium"
          style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 600, lineHeight: 1.9 }}
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
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setParentNoticeOpen(true)}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium text-white transition shadow-md hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #4A90D9 0%, #6BA3E0 100%)", fontFamily: "'Noto Sans KR', sans-serif" }}
            >
              <span>📄</span>
              부모님께 드리는 안내문
            </button>
          </div>
        </div>
      </section>

      {/* 부모님 안내문 모달 - 크게·길게, 모바일 전체화면 대응 */}
      {parentNoticeOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50"
          onClick={() => setParentNoticeOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="parent-notice-title"
        >
          <div
            className="bg-white w-full max-w-4xl h-[95vh] md:h-[90vh] md:max-h-[90vh] flex flex-col overflow-hidden rounded-t-2xl md:rounded-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[#eee] shrink-0">
              <h3 id="parent-notice-title" className="text-base md:text-lg font-semibold text-[#333]" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                부모님께 드리는 안내문
              </h3>
              <button
                type="button"
                onClick={() => setParentNoticeOpen(false)}
                className="p-2.5 -mr-1 text-[#888] hover:text-[#333] rounded-lg hover:bg-[#f5f5f5] transition touch-manipulation"
                aria-label="닫기"
              >
                &times;
              </button>
            </div>
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <iframe
                title="주일학교 안내문"
                srcDoc={PARENT_NOTICE_HTML}
                className="w-full flex-1 min-h-[60vh] border-0 overflow-auto"
                sandbox="allow-same-origin allow-popups"
              />
              <div className="px-4 md:px-6 py-4 border-t border-[#eee] shrink-0 bg-white">
                <a
                  href="/parent-notice.docx"
                  download="포천중앙침례교회_주일학교_안내.docx"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-white font-medium transition touch-manipulation"
                  style={{ background: "linear-gradient(135deg, #4A90D9 0%, #6BA3E0 100%)", fontFamily: "'Noto Sans KR', sans-serif" }}
                >
                  <span>⬇</span>
                  안내문 다운로드
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

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

      <section id="contact" className="py-40 px-8 bg-white text-gray-900" style={{ position: "relative", zIndex: 1 }}>
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900" style={{ lineHeight: 1.8 }}>
            아이 마음이 궁금하거나,
            <br />
            학부모님도 조심스럽게 여쭤보고 싶은 이야기가 있으신가요?
            <br />
            전도사님께 이메일로 편지를 보내주세요.
          </h2>
          <a
            href="mailto:petersin1@hanmail.net"
            className="inline-block mt-12 bg-black text-white px-10 py-4 rounded-full text-lg md:text-xl font-semibold hover:bg-gray-800 transition"
          >
            전도사님께 이메일 보내기 →
          </a>
        </div>
      </section>

      <footer className="bg-[#F1F1F1] text-gray-900 border-t border-black/10">
        <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <p
                className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4"
                style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
              >
                PBCSCH
              </p>
              <h3
                className="text-2xl md:text-3xl text-gray-900 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Children&apos;s Ministry
              </h3>
              <p
                className="text-gray-600 leading-relaxed"
                style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
              >
                따뜻한 환대와 말씀으로 아이들의 마음에
                <br />
                믿음의 씨앗을 심어가는 주일학교입니다.
              </p>
            </div>
            <div>
              <p
                className="text-sm uppercase tracking-[0.3em] text-gray-500 mb-4"
                style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
              >
                WELCOME
              </p>
              <p
                className="text-gray-600 leading-relaxed mb-6"
                style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
              >
                처음 오신 부모님도 편안하게 함께하실 수 있도록
                따뜻하게 안내해 드립니다.
              </p>
              <div
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm text-gray-600"
                style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
              >
                <span className="inline-block h-2 w-2 rounded-full bg-[#F5A962]" />
                언제든 환영합니다
              </div>
              <div className="mt-6 text-sm text-gray-600" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                <p>포천중앙침례교회 담임목사 박상구</p>
                <p className="mt-1">주일학교 담당 전도사 신승용</p>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-black/10 text-sm text-gray-500 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <span>© {new Date().getFullYear()} PBCSCH. All rights reserved.</span>
            <span className="flex items-center gap-3">
              포천중앙침례교회 주일학교
              <a className="admin-key admin-key-footer" href="/manage" aria-label="관리자 페이지">
                🔒
              </a>
            </span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .page {
          background: #000;
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          max-width: 100vw;
        }

        .hero {
          width: 100%;
          min-width: 100%;
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
          object-fit: cover;
          object-position: center center;
          filter: saturate(0.9);
          z-index: 0;
          background: #000;
        }

        .hero-mobile {
          display: none;
          width: 100%;
          margin: 0;
          padding: 0;
          background: #000;
          box-sizing: border-box;
        }

        .hero-mobile-stack {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #000;
        }

        .hero-mobile-video {
          width: 100%;
          height: auto;
          display: block;
          vertical-align: top;
          object-fit: contain;
          object-position: center center;
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

        .admin-key {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.18);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.35);
          font-size: 14px;
          line-height: 1;
          transition: background 0.2s ease, transform 0.2s ease;
          pointer-events: auto;
        }

        .admin-key:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .admin-key-footer {
          width: 24px;
          height: 24px;
          background: rgba(0, 0, 0, 0.06);
          color: #111;
          border-color: rgba(0, 0, 0, 0.12);
          font-size: 12px;
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
          border: 1px solid rgba(255, 255, 255, 0.55);
          background: rgba(255, 255, 255, 0.18);
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
        }

        .indicator.active {
          border-color: rgba(255, 255, 255, 0.95);
          background: rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 900px) {
          .mobile-nav-toggle {
            display: flex;
          }

          .top-right {
            position: fixed;
            top: calc(env(safe-area-inset-top, 0px) + 52px);
            right: 8px;
            left: auto;
            z-index: 200;
            flex-direction: column;
            align-items: stretch;
            gap: 0;
            min-width: 180px;
            max-width: calc(100vw - 16px);
            max-height: calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 60px);
            overflow-y: auto;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            background: rgba(37, 99, 235, 0.98);
            padding: 6px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
            opacity: 0;
            pointer-events: none;
            transform: translateY(-8px);
            transition: opacity 0.2s ease, transform 0.2s ease;
            box-sizing: border-box;
          }

          .top-right.is-open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
          }

          .top-right a {
            font-size: 14px;
            padding: 9px 12px;
            border-radius: 8px;
            line-height: 1.2;
          }

          .top-right a + a {
            margin-top: 1px;
          }

          .top-right a:hover,
          .top-right a:active {
            background: rgba(255, 255, 255, 0.12);
          }

          .top-right a::after {
            display: none;
          }

          .header {
            min-height: 48px;
            padding-top: 8px;
            padding-bottom: 8px;
            box-sizing: border-box;
          }

          .hero-mobile {
            display: block;
            padding-top: 64px;
          }

          .section-after-hero {
            margin-top: 0 !important;
            padding-top: 0 !important;
          }

          .hero {
            display: none !important;
            visibility: hidden;
            height: 0;
            min-height: 0;
            overflow: hidden;
            position: absolute;
            left: -9999px;
            pointer-events: none;
          }
        }

        @media (max-width: 640px) {
          .top-right {
            gap: 0;
          }
        }
      `}</style>
    </main>
  );
}
