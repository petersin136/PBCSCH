"use client";

import { useState } from "react";

export default function IntoTheWordPage() {
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
          <p className="hero-label">무엇을 배우는지</p>
          <h1 className="hero-title">
            Into
            <br />
            the Word
          </h1>
          <p className="hero-intro">
            성경책은 두껍고, 글씨도 작고, 어려운 말도 많아요.
            <br />
            그래서 어떤 친구들은 성경이 좀 무섭게 느껴지기도 해요.
            <br />
            <br />
            하지만 우리는 성경을 &apos;어려운 책&apos;으로 소개하지 않아요.
            <br />
            성경은 하나님이 우리에게 보내신 편지예요.
            <br />
            &quot;사랑하는 아이야&quot;로 시작하는 긴 편지요.
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
              <dd>말씀 배움</dd>
            </div>
          </dl>
        </section>

        <section className="content-grid">
          <div className="grid-text">
            <h2>말씀이 먼저예요</h2>
            <p>
              &quot;선생님, 성경이 왜 중요해요?&quot;
              <br />
              아이들이 가끔 물어봐요.
            </p>
            <p>
              그럴 때 우리는 이렇게 대답해요.
              <br />
              &quot;성경은 하나님이 직접 쓰신 이야기야.
              <br />
              네가 태어나기 훨씬 전부터,
              <br />
              하나님은 너를 알고 계셨어.
              <br />
              그리고 그 이야기를 성경에 담아두셨어.&quot;
            </p>
            <p>
              성경은 시험 문제가 아니에요.
              <br />
              외워야 점수 받는 책도 아니에요.
              <br />
              하나님이 &quot;너를 사랑해&quot;라고
              <br />
              수천 가지 방법으로 말씀하시는 책이에요.
            </p>
            <div className="highlight-box">
              <p>
                성경은 외워야 할 문장이 아니라,
                <br />
                우리를 부르시는 하나님의 목소리예요.
              </p>
            </div>
          </div>
          <div className="grid-image">
            <div className="framed-image">
              <div className="image-placeholder">
                📷 성경을 보는 아이들
                <br />
                (함께 모여 있는 모습)
              </div>
            </div>
          </div>
        </section>

        <section className="content-grid reverse">
          <div className="grid-text">
            <h2>질문해도 괜찮아요</h2>
            <p>
              우리 초등부에서는 질문을 환영해요.
              <br />
              &quot;왜요?&quot;라는 말을 막지 않아요.
            </p>
            <p>
              &quot;왜 하나님은 홍해를 갈라셨어요?&quot;
              <br />
              &quot;다윗은 왜 골리앗과 싸웠어요?&quot;
              <br />
              &quot;예수님은 왜 십자가에서 돌아가셨어요?&quot;
            </p>
            <p>
              어떤 질문은 선생님도 바로 대답 못 할 때가 있어요.
              <br />
              그래도 괜찮아요.
              <br />
              함께 생각하고, 함께 찾아보면 되니까요.
            </p>
            <p>
              질문은 틀린 게 아니에요.
              <br />
              질문은 하나님을 더 알고 싶다는 뜻이에요.
              <br />
              하나님은 그런 마음을 정말 기뻐하세요.
            </p>
            <div className="highlight-box">
              <p>
                우리는 정답을 알려주기보다
                <br />
                함께 생각할 시간을 남겨둬요.
              </p>
            </div>
          </div>
          <div className="grid-image">
            <div className="framed-image">
              <div className="image-placeholder">
                📷 질문하는 아이
                <br />
                (손 들거나 대화하는 모습)
              </div>
            </div>
          </div>
        </section>

        <section className="text-full">
          <h2>말씀 시간에는 무슨 일이 일어나나요?</h2>
          <p>
            우리의 말씀 시간은 조금 특별해요.
            <br />
            선생님이 혼자 계속 말하지 않아요.
            <br />
            아이들과 함께 이야기를 나눠요.
          </p>
          <p>
            먼저 성경 이야기를 들어요.
            <br />
            옛날 옛적, 아주 먼 나라에서 있었던
            <br />
            진짜 이야기예요.
            <br />
            영웅도 나오고, 실수하는 사람도 나오고,
            <br />
            무서운 순간도 있고, 기적도 일어나요.
          </p>
          <p>
            그다음엔 함께 생각해요.
            <br />
            &quot;나라면 어떻게 했을까?&quot;
            <br />
            &quot;이 이야기에서 하나님은 뭘 말씀하시는 걸까?&quot;
            <br />
            정답이 없는 질문도 있어요.
            <br />
            그래도 괜찮아요. 생각하는 게 중요하니까요.
          </p>
        </section>

        <section className="story-section">
          <div className="story-container">
            <div className="story-header">
              <h2>성경은 어떤 책이에요?</h2>
              <p>아이들에게 이렇게 설명해요</p>
            </div>
            <div className="story-content">
              <div className="story-block">
                <h3>📖 하나님의 편지</h3>
                <p>
                  성경은 하나님이 우리에게 쓰신 편지예요. &quot;사랑하는 아이야, 내가
                  너를 얼마나 사랑하는지 아니?&quot; 그 이야기가 처음부터 끝까지 담겨
                  있어요. 읽을 때마다 새로운 이야기가 보여요.
                </p>
              </div>
              <div className="story-block">
                <h3>🗺️ 보물 지도</h3>
                <p>
                  성경은 보물 지도 같아요. 어떻게 살아야 행복한지, 힘들 때 어떻게
                  해야 하는지, 길을 잃었을 때 어디로 가야 하는지 다 적혀 있어요.
                </p>
              </div>
              <div className="story-block">
                <h3>🌱 씨앗 주머니</h3>
                <p>
                  말씀은 씨앗 같아요. 지금은 작아 보여도, 마음에 심어두면 자라나요.
                  나중에 큰 나무가 되어 좋은 열매를 맺어요.
                </p>
              </div>
              <div className="story-block">
                <h3>💡 손전등</h3>
                <p>
                  어두운 밤에 손전등이 있으면 무섭지 않죠? 말씀도 그래요. 무섭거나
                  걱정될 때, 말씀을 읽으면 마음이 밝아져요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="moments">
          <div className="moments-header">
            <h2>Moments</h2>
            <p>말씀 속 작은 순간들</p>
          </div>
          <p className="moments-intro">
            말씀을 배우는 시간에도 특별한 순간들이 있어요.
            <br />
            아이들의 눈이 반짝이는 순간,
            <br />
            하나님의 말씀이 마음에 닿는 순간들이에요.
          </p>
          <div className="moments-grid">
            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 질문하는 아이
                  <br />
                  (손 들고 있는 모습)
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">01</p>
                <p className="moment-title">&quot;왜요?&quot;라는 질문</p>
                <p className="moment-caption">
                  &quot;선생님, 왜 하나님은 그렇게 하셨어요?&quot; 한 친구가 손을 번쩍 들어요.
                  어른들도 쉽게 대답 못 하는 질문이에요. 하지만 우리는 그 질문을
                  소중히 여겨요. 질문하는 건 더 알고 싶다는 뜻이니까요.
                </p>
              </div>
            </div>

            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 고개 끄덕이는 아이
                  <br />
                  (경청하는 모습)
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">02</p>
                <p className="moment-title">고개를 끄덕이는 순간</p>
                <p className="moment-caption">
                  이야기를 듣다가 한 친구가 고개를 끄덕여요. &quot;아, 그래서 그랬구나...&quot;
                  아무 말 없이 끄덕이는 그 순간, 말씀이 마음에 닿은 거예요. 그 순간이
                  우리에겐 가장 큰 선물이에요.
                </p>
              </div>
            </div>

            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 집에 가는 아이
                  <br />
                  (문 앞에서 인사하는 모습)
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">03</p>
                <p className="moment-title">&quot;집에서 다시 물어볼래요&quot;</p>
                <p className="moment-caption">
                  예배가 끝나고 집에 가면서 한 친구가 말해요. &quot;선생님, 이거 엄마한테
                  다시 물어볼래요!&quot; 말씀이 그 친구 안에서 계속 자라고 있다는 뜻이에요.
                  교회 밖에서도 말씀을 생각하는 거예요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="quote-section">
          <blockquote>
            &quot;주의 말씀은 내 발에 등이요
            <br />
            내 길에 빛이니이다&quot;
          </blockquote>
          <cite>— 시편 119:105</cite>
        </section>

        <section className="closing">
          <p className="closing-label">What We Believe</p>
          <p className="closing-text">
            &quot;말씀이 아이들 안에서
            <br />
            천천히 자라나기를 기다립니다.&quot;
          </p>
          <p className="closing-sub">
            우리는 아이들에게 성경을 빨리 외우라고 하지 않아요.
            <br />
            시험 보듯이 말씀을 가르치지 않아요.
            <br />
            대신 작은 씨앗을 심어요.
            <br />
            그리고 그 씨앗이 아이들 마음속에서
            <br />
            천천히, 깊이 자라나기를 기다려요.
          </p>
          <nav className="closing-nav">
            <a href="/worship-together">← Worship Together</a>
            <a href="/sing-to-the-lord">Sing to the Lord →</a>
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
            url("https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/Into%20theWord.jpg");
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
          font-size: clamp(56px, 12vw, 140px);
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
          border-left: 3px solid #7b9e89;
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
          background: linear-gradient(145deg, #e8f0eb 0%, #d8e5dc 100%);
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

        .story-section {
          padding: 100px 48px;
          background: linear-gradient(180deg, #fff 0%, #f8f7f5 100%);
        }

        .story-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .story-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .story-header h2 {
          font-family: "Playfair Display", serif;
          font-size: 28px;
          font-weight: 400;
          margin-bottom: 16px;
        }

        .story-header p {
          font-size: 15px;
          color: #888;
        }

        .story-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
        }

        .story-block {
          background: #fff;
          padding: 36px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        .story-block h3 {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 16px;
          color: #7b9e89;
        }

        .story-block p {
          font-size: 15px;
          line-height: 1.9;
          color: #555;
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
          color: #e8f0eb;
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
          background: #e8f0eb;
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
          color: #7b9e89;
          font-style: normal;
        }

        .closing {
          padding: 160px 48px;
          text-align: center;
          background: #2d3a32;
          color: white;
        }

        .closing-label {
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #7b9e89;
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
          color: #a0b5a6;
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
          color: #7b9e89;
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

          .story-section {
            padding: 80px 24px;
          }

          .story-content {
            grid-template-columns: 1fr;
            gap: 24px;
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
