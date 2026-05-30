"use client";

import { useState } from "react";

export default function SingToTheLordPage() {
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
          <p className="hero-label">어떤 분위기인지</p>
          <h1 className="hero-title">
            Sing to
            <br />
            the Lord
          </h1>
          <p className="hero-intro">
            우리 초등부의 찬양 시간은 조금 시끄러워요.
            <br />
            박자가 안 맞을 때도 있고, 음정이 삐뚤어질 때도 있어요.
            <br />
            어떤 친구는 너무 크게 부르고, 어떤 친구는 입만 뻥긋거려요.
            <br />
            <br />
            그래도 괜찮아요.
            <br />
            우리는 &quot;완벽한 노래&quot;가 아니라
            <br />
            &quot;하나님을 향한 마음&quot;을 부르거든요.
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
              <dt>Focus</dt>
              <dd>찬양과 경배</dd>
            </div>
          </dl>
        </section>

        <section className="content-grid">
          <div className="grid-text">
            <h2>음정보다 마음이에요</h2>
            <p>
              &quot;선생님, 저 노래 못해요.&quot;
              <br />
              어떤 친구들은 찬양 시간이 부끄러워요.
              <br />
              목소리가 작아서, 음정이 안 맞아서,
              <br />
              가사를 자꾸 까먹어서요.
            </p>
            <p>
              그럴 때 우리는 이렇게 말해요.
              <br />
              &quot;괜찮아, 하나님은 네 목소리를 좋아하셔.&quot;
              <br />
              &quot;못해도 돼. 그냥 불러봐.&quot;
            </p>
            <p>
              하나님은 콘서트를 원하시는 게 아니에요.
              <br />
              아이들의 마음을 원하세요.
              <br />
              서툴러도, 엉망이어도,
              <br />
              &quot;하나님, 사랑해요&quot;라고 부르는 그 마음요.
            </p>
            <div className="highlight-box">
              <p>
                음정보다 중요한 건 방향이에요.
                <br />
                우리의 노래가 하나님께 향하면, 그게 최고의 찬양이에요.
              </p>
            </div>
          </div>
          <div className="grid-image">
            <div className="framed-image">
              <div className="image-placeholder">
                📷 찬양하는 아이들
                <br />
                (함께 노래하는 모습)
              </div>
            </div>
          </div>
        </section>

        <section className="content-grid reverse">
          <div className="grid-text">
            <h2>
              모든 친구가
              <br />
              다르게 찬양해요
            </h2>
            <p>
              찬양 시간을 잘 보면 재미있어요.
              <br />
              모든 친구가 다르게 찬양하거든요.
            </p>
            <p>
              어떤 친구는 눈을 꼭 감고 불러요.
              <br />
              어떤 친구는 손을 번쩍 들어요.
              <br />
              어떤 친구는 뛰면서 불러요.
              <br />
              어떤 친구는 조용히 서서 들어요.
            </p>
            <p>
              다 다른 모습이지만, 다 찬양이에요.
              <br />
              크게 부르는 것만 찬양이 아니에요.
              <br />
              조용히 듣는 것도 찬양이에요.
              <br />
              마음으로 따라 부르는 것도 찬양이에요.
            </p>
            <div className="highlight-box">
              <p>
                우리는 똑같이 부르라고 하지 않아요.
                <br />
                각자의 방식으로 하나님을 만나요.
              </p>
            </div>
          </div>
          <div className="grid-image">
            <div className="framed-image">
              <div className="image-placeholder">
                📷 다양한 모습의 찬양
                <br />
                (손 들기, 눈 감기 등)
              </div>
            </div>
          </div>
        </section>

        <section className="text-full">
          <h2>찬양 시간에는 무슨 일이 일어나나요?</h2>
          <p>
            찬양 시간이 시작되면 음악이 흘러나와요.
            <br />
            처음엔 조금 어색해하던 친구들도
            <br />
            한 소절, 두 소절 부르다 보면
            <br />
            어느새 몸을 흔들고 있어요.
          </p>
          <p>
            빠른 노래를 부를 때는 뛰기도 하고,
            <br />
            손뼉을 치기도 하고, 돌기도 해요.
            <br />
            느린 노래를 부를 때는 눈을 감고,
            <br />
            조용히 하나님께 이야기해요.
          </p>
          <p>
            가끔 가사를 틀리면 서로 웃기도 해요.
            <br />
            그래도 멈추지 않아요.
            <br />
            웃으면서 다시 부르면 되니까요.
            <br />
            하나님도 우리랑 같이 웃고 계실 거예요.
          </p>
        </section>

        <section className="atmosphere-section">
          <div className="atmosphere-container">
            <div className="atmosphere-header">
              <h2>우리 찬양의 분위기</h2>
              <p>이런 마음으로 노래해요</p>
            </div>
            <div className="atmosphere-grid">
              <div className="atmosphere-card">
                <div className="atmosphere-icon">🎵</div>
                <h3>신나게!</h3>
                <p>
                  하나님을 믿는 건 신나는 일이에요. 그래서 우리 찬양도 신나요.
                  뛰어도 되고, 소리 질러도 돼요. 기쁨을 숨기지 않아요.
                </p>
              </div>
              <div className="atmosphere-card">
                <div className="atmosphere-icon">🤲</div>
                <h3>진심으로!</h3>
                <p>
                  찬양은 공연이 아니에요. 잘 보이려고 부르는 게 아니에요. 하나님께
                  마음을 드리는 거예요. 진심이 담기면 다 예뻐요.
                </p>
              </div>
              <div className="atmosphere-card">
                <div className="atmosphere-icon">🤝</div>
                <h3>함께!</h3>
                <p>
                  혼자 부르는 것보다 함께 부르면 더 좋아요. 옆 친구와 손잡고, 다 같이
                  하나님께 노래해요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="lyrics-section">
          <div className="lyrics-container">
            <div className="lyrics-header">
              <h2>우리가 부르는 노래들</h2>
              <p>이런 가사를 마음에 새겨요</p>
            </div>
            <div className="lyrics-box">
              <p>
                &quot;<span className="highlight">주님의 사랑이</span> 나를 감싸네&quot;
                <br />
                &quot;<span className="highlight">두려워 말라</span> 내가 함께하리라&quot;
                <br />
                &quot;나 같은 죄인 살리신{" "}
                <span className="highlight">은혜</span>&quot;
                <br />
                &quot;<span className="highlight">할렐루야</span> 우리 함께 찬양해&quot;
              </p>
            </div>
          </div>
        </section>

        <section className="moments">
          <div className="moments-header">
            <h2>Moments</h2>
            <p>찬양 속 작은 순간들</p>
          </div>
          <p className="moments-intro">
            찬양 시간에는 특별한 순간들이 있어요.
            <br />
            눈으로 보기 어려운, 마음에서 일어나는 순간들이에요.
            <br />
            하나님과 아이들이 만나는 순간이에요.
          </p>
          <div className="moments-grid">
            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 웃으며 노래하는 아이
                  <br />
                  (박자 틀려도 즐거운 모습)
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">01</p>
                <p className="moment-title">박자를 놓쳐도 괜찮아</p>
                <p className="moment-caption">
                  &quot;앗, 틀렸다!&quot; 한 친구가 박자를 놓쳤어요. 하지만 멈추지 않아요.
                  &quot;하하&quot; 웃으면서 다시 불러요. 옆 친구도 같이 웃어요. 실수해도 즐거운
                  게 진짜 찬양이에요.
                </p>
              </div>
            </div>

            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 조용히 서 있는 아이
                  <br />
                  (눈 감고 듣는 모습)
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">02</p>
                <p className="moment-title">조용히 듣는 것도 찬양</p>
                <p className="moment-caption">
                  한 친구는 손을 들지 않아요. 크게 부르지도 않아요. 그냥 가만히 서서
                  들어요. 하지만 그 친구의 마음은 지금 하나님과 대화하고 있어요. 그것도
                  아름다운 찬양이에요.
                </p>
              </div>
            </div>

            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 앙코르 요청하는 아이
                  <br />
                  (손 들고 말하는 모습)
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">03</p>
                <p className="moment-title">&quot;한 번 더 해요!&quot;</p>
                <p className="moment-caption">
                  찬양이 끝나면 꼭 이렇게 말하는 친구가 있어요. &quot;선생님, 한 번 더
                  불러요!&quot; 그 말이 들리면 선생님들은 너무 행복해요. 찬양이 즐거웠다는
                  뜻이니까요. 하나님도 기뻐하실 거예요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="quote-section">
          <blockquote>
            &quot;찬양하는 입술의 열매를
            <br />
            그의 이름을 증언하는 입술의 열매를
            <br />
            하나님께 드리자&quot;
          </blockquote>
          <cite>— 히브리서 13:15</cite>
        </section>

        <section className="closing">
          <p className="closing-label">What We Believe</p>
          <p className="closing-text">
            &quot;하나님은 아이들의 노래를
            <br />
            멈추게 하지 않으십니다.&quot;
          </p>
          <p className="closing-sub">
            예수님은 말씀하셨어요.
            <br />
            &quot;어린이들이 찬양하는 것을 보지 못하였느냐?&quot;
            <br />
            하나님은 아이들의 서툰 노래를 사랑하세요.
            <br />
            음정이 틀려도, 박자가 안 맞아도,
            <br />
            마음을 담아 부르면 그게 최고의 찬양이에요.
            <br />
            그래서 우리는 오늘도 노래해요.
          </p>
          <nav className="closing-nav">
            <a href="/into-the-word">← Into the Word</a>
            <a href="/joyful-activities">Joyful Activities →</a>
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

        .brand-link {
          display: inline-flex;
          align-items: center;
          color: inherit;
          text-decoration: none;
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
            url("https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/Sing%20tothe%20Lord.jpg");
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
        }

        .hero-label {
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 24px;
        }

        .hero-title {
          font-family: "Playfair Display", serif;
          font-size: clamp(48px, 10vw, 120px);
          font-weight: 400;
          letter-spacing: -0.03em;
          line-height: 0.95;
          margin-bottom: 48px;
        }

        .hero-intro {
          max-width: 650px;
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
          color: #666;
        }

        .hero-meta dt {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #999;
          margin-bottom: 6px;
        }

        .hero-meta dd {
          color: #1a1a1a;
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
          border-left: 3px solid #c9a87c;
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
          background: linear-gradient(145deg, #f5efe6 0%, #ebe3d6 100%);
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

        .atmosphere-section {
          padding: 100px 48px;
          background: linear-gradient(180deg, #fff 0%, #f8f7f5 100%);
        }

        .atmosphere-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .atmosphere-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .atmosphere-header h2 {
          font-family: "Playfair Display", serif;
          font-size: 28px;
          font-weight: 400;
          margin-bottom: 16px;
        }

        .atmosphere-header p {
          font-size: 15px;
          color: #888;
        }

        .atmosphere-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }

        .atmosphere-card {
          text-align: center;
          padding: 40px 28px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        .atmosphere-icon {
          font-size: 40px;
          margin-bottom: 20px;
        }

        .atmosphere-card h3 {
          font-size: 17px;
          font-weight: 500;
          margin-bottom: 12px;
          color: #333;
        }

        .atmosphere-card p {
          font-size: 14px;
          line-height: 1.8;
          color: #666;
        }

        .lyrics-section {
          padding: 80px 48px;
          background: #faf8f5;
        }

        .lyrics-container {
          max-width: 700px;
          margin: 0 auto;
          text-align: center;
        }

        .lyrics-header {
          margin-bottom: 40px;
        }

        .lyrics-header h2 {
          font-family: "Playfair Display", serif;
          font-size: 24px;
          font-weight: 400;
          margin-bottom: 12px;
        }

        .lyrics-header p {
          font-size: 14px;
          color: #888;
        }

        .lyrics-box {
          background: #fff;
          padding: 48px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
        }

        .lyrics-box p {
          font-size: 18px;
          line-height: 2.2;
          color: #555;
          font-weight: 300;
        }

        .lyrics-box .highlight {
          color: #c9a87c;
          font-weight: 400;
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
          color: #f5efe6;
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
          background: linear-gradient(135deg, #f5efe6 0%, #ebe3d6 100%);
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
          color: #a08660;
          font-style: normal;
        }

        .closing {
          padding: 160px 48px;
          text-align: center;
          background: #3d3428;
          color: white;
        }

        .closing-label {
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #c9a87c;
          margin-bottom: 32px;
        }

        .closing-text {
          font-family: "Playfair Display", serif;
          font-size: clamp(22px, 3.5vw, 36px);
          font-weight: 400;
          max-width: 700px;
          margin: 0 auto 32px;
          line-height: 1.6;
        }

        .closing-sub {
          font-size: 15px;
          color: #b5a78e;
          max-width: 550px;
          margin: 0 auto 56px;
          line-height: 1.8;
        }

        .closing-nav {
          display: flex;
          justify-content: center;
          gap: 48px;
        }

        .closing-nav a {
          color: #c9a87c;
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

          .hero {
            justify-content: flex-start;
            padding: 100px 24px 60px;
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

          .atmosphere-section {
            padding: 80px 24px;
          }

          .atmosphere-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .lyrics-section {
            padding: 60px 24px;
          }

          .lyrics-box {
            padding: 32px 24px;
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
