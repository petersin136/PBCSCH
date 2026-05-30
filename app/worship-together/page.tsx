"use client";

import { useState } from "react";

export default function WorshipTogetherPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="page">
      <header className="header">
        <a className="brand-link" href="/#hero">
          <div className="brand">
            <img
              className="brand-logo"
              src="https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/logo.jpg"
              alt="포천중앙침례교회 주일학교 로고"
              draggable={false}
              style={{ WebkitUserDrag: 'none', userSelect: 'none' } as React.CSSProperties}
            />
            <span className="brand-main">포천중앙침례교회 주일학교</span>
            <span className="brand-sub">
              Pocheon Central Baptist Church Children School
            </span>
          </div>
        </a>
        <nav className={`nav ${mobileNavOpen ? "is-open" : ""}`}>
          <a href="/#section-1" onClick={() => { setMobileNavOpen(false); window.location.href = "/#section-1"; }}>주일예배</a>
          <a href="/#section-2" onClick={() => { setMobileNavOpen(false); window.location.href = "/#section-2"; }}>성경공부</a>
          <a href="/#section-3" onClick={() => { setMobileNavOpen(false); window.location.href = "/#section-3"; }}>찬양과 경배</a>
          <a href="/#section-4" onClick={() => { setMobileNavOpen(false); window.location.href = "/#section-4"; }}>특별활동</a>
          <a href="/#section-5" onClick={() => { setMobileNavOpen(false); window.location.href = "/#section-5"; }}>사랑하는 교사들</a>
          <a href="/#section-6" onClick={() => { setMobileNavOpen(false); window.location.href = "/#section-6"; }}>갤러리</a>
          <a href="/bible-reading" onClick={() => setMobileNavOpen(false)}>성경읽기</a>
        </nav>
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
      </header>

      <main>
        <section className="hero">
          <p className="hero-label">우리가 어떻게 예배하는지</p>
          <h1 className="hero-title">Worship Together</h1>
          <p className="hero-intro">
            우리 초등부의 주일은 조금 특별해요. 정답을 외우는 것도, 조용히
            앉아 있는 것도 아니에요. 우리는 먼저 하나님 앞에 서는 것부터
            시작해요.
          </p>
          <dl className="hero-meta">
            <div>
              <dt>Ministry</dt>
              <dd>주일학교 초등부</dd>
            </div>
            <div>
              <dt>Age</dt>
              <dd>8-12세</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>주일 오후 2:30-4:00</dd>
            </div>
          </dl>
        </section>

        <section className="content-grid">
          <div className="grid-text">
            <h2>예배가 먼저예요</h2>
            <p>
              어떤 친구들은 물어봐요. &quot;왜 예배를 드려야 해요?&quot;
              &quot;예배가 뭐예요?&quot;
            </p>
            <p>
              우리는 그 질문에 바로 대답하지 않아요. 대신, 먼저 함께 하나님
              앞에 서 봐요. 눈을 감고, 찬양을 부르고, 기도해요.
            </p>
            <p>
              그러면 신기하게도 아이들이 스스로 느끼기 시작해요. &quot;아,
              하나님이 여기 계시구나.&quot; &quot;하나님이 나를 사랑하시는구나.&quot;
            </p>
            <div className="highlight-box">
              <p>
                예배는 배우는 것이 아니라 경험하는 거예요. 설명보다 만남이
                먼저입니다.
              </p>
            </div>
          </div>
          <div className="grid-image">
            <div className="framed-image">
              <img
                src="https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/KakaoTalk_Photo_2026-02-05-05-24-44.jpg"
                alt="예배 전체 분위기 - 아이들이 함께 있는 모습"
              />
            </div>
          </div>
        </section>

        <section className="content-grid reverse">
          <div className="grid-text">
            <h2>
              우리의 예배는
              <br />
              완벽하지 않아도 괜찮아요
            </h2>
            <p>
              솔직히 말할게요. 우리 예배 시간에는 가끔 웃음소리도 나고, 옆
              친구와 속삭이는 소리도 들려요. 찬양 가사를 틀리기도 하고, 기도
              중에 눈을 살짝 뜨는 친구도 있어요.
            </p>
            <p>
              그래도 괜찮아요. 하나님은 완벽한 예배를 원하시는 게 아니거든요.
              하나님은 우리의 마음을 보세요.
            </p>
            <p>
              서툴러도, 조금 산만해도, &quot;하나님, 저 여기 있어요&quot;라고 말하는
              마음. 그게 진짜 예배예요.
            </p>
            <div className="highlight-box">
              <p>
                우리는 &quot;잘하는 예배&quot;보다 &quot;진심으로 드리는 예배&quot;를 배워요.
              </p>
            </div>
          </div>
          <div className="grid-image">
            <div className="framed-image">
              <img
                src="https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/KakaoTalk_Photo_2026-02-05-05-26-17.jpg"
                alt="교사와 아이들 - 눈높이 맞추는 장면"
              />
            </div>
          </div>
        </section>

        <section className="text-full">
          <h2>예배 시간에 무슨 일이 일어나나요?</h2>
          <p>
            우리는 먼저 다 함께 찬양을 불러요. 처음엔 조금 쑥스러워하던
            친구들도 어느새 손뼉을 치고, 뛰기도 해요. 하나님을 향한 기쁨을
            온몸으로 표현하는 거예요.
          </p>
          <p>
            그다음엔 기도 시간이 있어요. 선생님이 먼저 기도하고, 친구들도
            짧게 기도할 수 있어요. &quot;하나님, 감사해요&quot; 한마디도 멋진 기도예요.
          </p>
          <p>
            그리고 말씀 시간! 성경 이야기를 듣고, 함께 이야기 나눠요. &quot;나라면
            어떻게 했을까?&quot; &quot;하나님은 왜 그렇게 하셨을까?&quot; 정답이 아니라 생각을
            나누는 시간이에요.
          </p>
        </section>

        <section className="moments">
          <div className="moments-header">
            <h2>Moments</h2>
            <p>예배 속 작은 순간들</p>
          </div>
          <p className="moments-intro">
            예배 시간에는 특별한 순간들이 있어요. 어른들은 잘 모를 수도 있지만,
            아이들의 마음속에서 하나님을 만나는 순간들이에요.
          </p>
          <div className="moments-grid">
            <div className="moment-card">
              <div className="moment-card-image">
                <img
                  src="https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/KakaoTalk_Photo_2026-02-05-05-44-55.jpg"
                  alt="기도하는 아이 손 클로즈업"
                />
              </div>
              <div className="moment-card-content">
                <p className="moment-number">01</p>
                <p className="moment-title">멈춤의 순간</p>
                <p className="moment-caption">
                  아이의 작은 손이 두 손을 모아 가만히 멈춰요. 평소엔 잠시도
                  가만히 못 있던 친구가 기도 시간만큼은 조용히 눈을 감아요. 그
                  짧은 순간, 아이는 하나님과 대화하고 있어요.
                </p>
              </div>
            </div>

            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 찬양 중인 아이
                  <br />
                  얼굴/옆모습
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">02</p>
                <p className="moment-title">따라 부르는 마음</p>
                <p className="moment-caption">
                  찬양이 시작되면, 가사를 다 몰라도 입술을 움직여요. 멜로디를
                  흥얼거리기도 하고, 어깨를 들썩이기도 해요. 완벽하게 부르지 않아도,
                  하나님은 그 마음을 기뻐하세요.
                </p>
              </div>
            </div>

            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 눈 감고 서 있는 아이
                  <br />
                  전신
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">03</p>
                <p className="moment-title">기다림의 시간</p>
                <p className="moment-caption">
                  기도 시간, 한 친구가 눈을 감고 한참을 서 있어요. &quot;뭘 기도해야 할지
                  모르겠어요&quot;라고 말했던 친구예요. 하지만 지금은 조용히 서서 하나님의
                  음성을 기다려요. 그것도 아름다운 기도예요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="quote-section">
          <blockquote>
            &quot;어린이들이 내게 오는 것을 허락하고 막지 말라.
            하나님의 나라가 이런 사람들의 것이다.&quot;
          </blockquote>
          <cite>— 마가복음 10:14</cite>
        </section>

        <section className="closing">
          <p className="closing-label">What We Believe</p>
          <p className="closing-text">
            &quot;예배는 완벽함이 아니라, 함께 서는 것입니다.&quot;
          </p>
          <p className="closing-sub">
            우리는 아이들이 예배를 &apos;잘&apos; 드리길 바라지 않아요. 예배 안에서
            하나님을 만나고, 사랑받고 있다는 걸 느끼길 바라요. 그래서 우리는 오늘도
            함께 서요.
          </p>
          <nav className="closing-nav">
            <a href="/">← 돌아가기</a>
            <a href="/into-the-word">Into the Word →</a>
          </nav>
        </section>
      </main>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: "Noto Sans KR", sans-serif;
          background: #f8f7f5;
          color: #1a1a1a;
          overflow-x: hidden;
        }

        .page {
          background: #f8f7f5;
          color: #1a1a1a;
          min-height: 100vh;
          font-family: "Noto Sans KR", sans-serif;
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 9px clamp(16px, 4vw, 48px);
          z-index: 100;
          background: #2563eb;
          color: #fff;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          line-height: 1;
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

        .nav {
          display: flex;
          gap: 18px;
          opacity: 0.85;
        }

        .nav a {
          color: #fff;
          text-decoration: none;
          font-size: 14px;
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

        .brand-link {
          display: inline-flex;
          align-items: center;
          color: inherit;
          text-decoration: none;
        }

        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 120px 48px 80px;
          background-image: linear-gradient(
              rgba(255, 255, 255, 0.6),
              rgba(255, 255, 255, 0.6)
            ),
            url("https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/WorshipTogether.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .hero-label {
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #555;
          margin-bottom: 24px;
        }

        .hero-title {
          font-family: "Playfair Display", serif;
          font-size: clamp(56px, 12vw, 140px);
          font-weight: 400;
          letter-spacing: -0.03em;
          line-height: 0.95;
          margin-bottom: 48px;
        }

        .hero-intro {
          max-width: 600px;
          font-size: 17px;
          line-height: 1.9;
          color: #555;
          font-weight: 300;
          margin-bottom: 64px;
        }

        .hero-meta {
          display: flex;
          gap: 64px;
          font-size: 14px;
          color: #444;
        }

        .hero-meta dt {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #666;
          margin-bottom: 6px;
        }

        .hero-meta dd {
          color: #222;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          padding: 0 48px;
        }

        .content-grid.reverse {
          direction: rtl;
        }

        .content-grid.reverse > * {
          direction: ltr;
        }

        .grid-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px;
        }

        .grid-text h2 {
          font-family: "Playfair Display", serif;
          font-size: 28px;
          font-weight: 400;
          margin-bottom: 32px;
          line-height: 1.3;
        }

        .grid-text p {
          font-size: 16px;
          line-height: 2;
          color: #555;
          font-weight: 300;
          margin-bottom: 20px;
        }

        .grid-text p:last-child {
          margin-bottom: 0;
        }

        .highlight-box {
          background: #fff;
          border-left: 3px solid #d4a373;
          padding: 24px 28px;
          margin-top: 32px;
          border-radius: 0 8px 8px 0;
        }

        .highlight-box p {
          font-size: 15px;
          color: #666;
          margin-bottom: 0;
          font-style: italic;
        }

        .grid-image {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 40px;
        }

        .framed-image {
          width: 100%;
          max-width: 400px;
          aspect-ratio: 4/5;
          background: #e8e4df;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .framed-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 14px;
          color: #999;
          padding: 20px;
          background: linear-gradient(145deg, #f0ebe5 0%, #e5dfd8 100%);
        }

        .text-full {
          padding: 120px 48px;
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .text-full h2 {
          font-family: "Playfair Display", serif;
          font-size: 32px;
          font-weight: 400;
          margin-bottom: 40px;
          line-height: 1.4;
        }

        .text-full p {
          font-size: 17px;
          line-height: 2;
          color: #555;
          font-weight: 300;
          margin-bottom: 24px;
        }

        .moments {
          padding: 120px 48px;
          background: #fff;
        }

        .moments-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .moments-header h2 {
          font-family: "Playfair Display", serif;
          font-size: clamp(40px, 8vw, 80px);
          font-weight: 400;
          color: #f0ebe5;
          margin-bottom: 16px;
        }

        .moments-header p {
          font-size: 14px;
          color: #888;
          margin-bottom: 8px;
        }

        .moments-intro {
          max-width: 600px;
          margin: 0 auto 64px;
          text-align: center;
          font-size: 16px;
          line-height: 1.9;
          color: #666;
        }

        .moments-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .moment-card {
          background: #f8f7f5;
          border-radius: 8px;
          overflow: hidden;
        }

        .moment-card-image {
          aspect-ratio: 1;
          background: #e8e4df;
          overflow: hidden;
        }

        .moment-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .moment-card-image .image-placeholder {
          font-size: 13px;
        }

        .moment-card-content {
          padding: 28px;
        }

        .moment-number {
          font-family: "Playfair Display", serif;
          font-size: 12px;
          color: #bbb;
          margin-bottom: 12px;
        }

        .moment-title {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin-bottom: 12px;
        }

        .moment-caption {
          font-size: 14px;
          line-height: 1.8;
          color: #666;
          font-weight: 300;
        }

        .quote-section {
          padding: 100px 48px;
          background: #f0ebe5;
          text-align: center;
        }

        .quote-section blockquote {
          font-family: "Playfair Display", serif;
          font-size: clamp(20px, 3vw, 28px);
          font-weight: 400;
          max-width: 700px;
          margin: 0 auto 24px;
          line-height: 1.6;
          color: #444;
        }

        .quote-section cite {
          font-size: 14px;
          color: #888;
          font-style: normal;
        }

        .closing {
          padding: 160px 48px;
          text-align: center;
          background: #2a2a2a;
          color: white;
        }

        .closing-label {
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 32px;
        }

        .closing-text {
          font-family: "Playfair Display", serif;
          font-size: clamp(22px, 3.5vw, 36px);
          font-weight: 400;
          max-width: 650px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        .closing-sub {
          font-size: 15px;
          color: #888;
          max-width: 500px;
          margin: 0 auto 56px;
          line-height: 1.8;
        }

        .closing-nav {
          display: flex;
          justify-content: center;
          gap: 48px;
        }

        .closing-nav a {
          color: #777;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.3s;
        }

        .closing-nav a:hover {
          color: white;
        }

        @media (max-width: 900px) {
          .header {
            padding: 16px 24px;
          }

          .hero {
            justify-content: flex-start;
            padding: 100px 24px 60px;
          }

          .mobile-nav-toggle {
            display: flex;
          }

          .nav {
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

          .nav.is-open {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
          }

          .nav a {
            font-size: 14px;
            padding: 6px 2px;
          }

          .hero-meta {
            flex-direction: column;
            gap: 20px;
          }

          .content-grid {
            grid-template-columns: 1fr;
            padding: 0 24px;
          }

          .content-grid.reverse {
            direction: ltr;
          }

          .grid-text {
            padding: 60px 0;
            order: 2;
          }

          .grid-image {
            padding: 40px 0;
            order: 1;
          }

          .framed-image {
            max-width: 300px;
          }

          .text-full {
            padding: 80px 24px;
          }

          .moments {
            padding: 80px 24px;
          }

          .moments-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
          }

          .quote-section {
            padding: 80px 24px;
          }

          .closing {
            padding: 100px 24px;
          }
        }
      `}</style>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Noto+Sans+KR:wght@300;400;500&display=swap");
      `}</style>
    </div>
  );
}
