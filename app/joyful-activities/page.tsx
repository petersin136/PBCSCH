"use client";

import { useState } from "react";

export default function JoyfulActivitiesPage() {
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
          <p className="hero-label">아이들이 얼마나 즐거운지</p>
          <h1 className="hero-title">
            Joyful
            <br />
            Activities
          </h1>
          <p className="hero-intro">
            &quot;재밌다!&quot;
            <br />
            이 말이 들릴 때 우리는 행복해요.
            <br />
            <br />
            우리 초등부는 노는 시간도 있어요.
            <br />
            게임도 하고, 뛰어다니기도 하고, 크게 웃기도 해요.
            <br />
            어떤 친구들은 이 시간이 제일 좋대요.
            <br />
            <br />
            그런데 우리는 그냥 놀지 않아요.
            <br />
            놀면서도 배우는 게 있거든요.
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
              <dd>활동과 교제</dd>
            </div>
          </dl>
        </section>

        <section className="content-grid">
          <div className="grid-text">
            <h2>즐거움도 진지하게</h2>
            <p>
              &quot;노는 게 뭐가 중요해요?&quot;
              <br />
              어른들은 가끔 이렇게 생각해요.
              <br />
              공부가 더 중요하다고, 말씀이 더 중요하다고요.
            </p>
            <p>
              하지만 우리는 다르게 생각해요.
              <br />
              아이들에게 즐거움은 정말 중요해요.
              <br />
              기쁘게 뛰어노는 것도 하나님이 주신 선물이에요.
            </p>
            <p>
              하나님은 우리가 웃기를 원하세요.
              <br />
              친구들과 어울리기를 원하세요.
              <br />
              그래서 우리는 즐거움을 가볍게 여기지 않아요.
              <br />
              진지하게, 정성껏 준비해요.
            </p>
            <div className="highlight-box">
              <p>
                즐거움은 선택이 아니에요.
                <br />
                하나님이 아이들에게 주신 선물이에요.
              </p>
            </div>
          </div>
          <div className="grid-image">
            <div className="framed-image">
              <div className="image-placeholder">
                📷 신나게 노는 아이들
                <br />
                (게임하는 모습)
              </div>
            </div>
          </div>
        </section>

        <section className="content-grid reverse">
          <div className="grid-text">
            <h2>놀면서 배워요</h2>
            <p>
              신기한 게 있어요.
              <br />
              아이들은 놀면서 정말 많은 걸 배워요.
            </p>
            <p>
              게임을 하다 보면 규칙을 지켜야 해요.
              <br />
              내 차례가 아니면 기다려야 해요.
              <br />
              내가 지면 화내지 않고 박수 쳐야 해요.
              <br />
              팀원이 실수하면 &quot;괜찮아&quot;라고 말해줘야 해요.
            </p>
            <p>
              이게 바로 삶이에요.
              <br />
              기다리는 법, 양보하는 법,
              <br />
              이기고 지는 법, 함께하는 법.
              <br />
              교실에서 배우기 어려운 것들을
              <br />
              우리는 놀면서 배워요.
            </p>
            <div className="highlight-box">
              <p>
                웃음과 놀이 속에서도
                <br />
                아이들은 관계와 존중을 배워요.
              </p>
            </div>
          </div>
          <div className="grid-image">
            <div className="framed-image">
              <div className="image-placeholder">
                📷 팀 활동하는 아이들
                <br />
                (협동하는 모습)
              </div>
            </div>
          </div>
        </section>

        <section className="text-full">
          <h2>활동 시간에는 무슨 일이 일어나나요?</h2>
          <p>
            예배가 끝나면 활동 시간이에요.
            <br />
            &quot;오늘은 뭐 해요?&quot; 아이들이 눈을 반짝여요.
            <br />
            선생님이 오늘의 게임을 설명하면
            <br />
            &quot;와!&quot; 하는 소리가 터져 나와요.
          </p>
          <p>
            팀을 나누고, 규칙을 듣고, 시작!
            <br />
            순식간에 온 방이 시끌벅적해져요.
            <br />
            뛰는 소리, 웃는 소리, 응원하는 소리.
            <br />
            이기면 좋지만, 져도 즐거워요.
          </p>
          <p>
            게임이 끝나면 다 같이 간식을 먹어요.
            <br />
            땀을 흘리고 나서 먹는 과자는 정말 맛있어요.
            <br />
            옆 친구와 나눠 먹으면 더 맛있어요.
            <br />
            그렇게 우리는 친구가 돼요.
          </p>
        </section>

        <section className="activities-section">
          <div className="activities-container">
            <div className="activities-header">
              <h2>우리가 하는 활동들</h2>
              <p>매주 다른 재미가 기다려요</p>
            </div>
            <div className="activities-grid">
              <div className="activity-card">
                <div className="activity-icon">🏃</div>
                <h3>릴레이 게임</h3>
                <p>
                  팀을 나눠서 달리기 시합을 해요. 빠른 친구도 있고, 느린 친구도 있어요.
                  하지만 다 같이 응원하면 힘이 나요. &quot;파이팅!&quot; 소리가 끊이질 않아요.
                </p>
              </div>
              <div className="activity-card">
                <div className="activity-icon">🎯</div>
                <h3>미션 게임</h3>
                <p>
                  오늘 배운 말씀과 관련된 미션을 해요. 퀴즈도 풀고, 단어도 찾고, 그림도
                  그려요. 성경 이야기가 게임이 되면 더 재밌고 더 잘 기억나요.
                </p>
              </div>
              <div className="activity-card">
                <div className="activity-icon">🎨</div>
                <h3>만들기 시간</h3>
                <p>
                  가끔은 뭔가를 만들어요. 카드도 만들고, 팔찌도 만들고. 내 손으로 만든
                  건 특별해요. 집에 가져가서 자랑할 수 있어요.
                </p>
              </div>
              <div className="activity-card">
                <div className="activity-icon">🤝</div>
                <h3>친구 사귀기</h3>
                <p>
                  새 친구가 오면 같이 어울려요. 처음엔 어색하지만 금방 친해져요. 이름을
                  외우고, 좋아하는 걸 물어봐요. 다음 주엔 벌써 베프가 돼 있어요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="values-section">
          <div className="values-container">
            <div className="values-header">
              <h2>놀면서 배우는 것들</h2>
              <p>즐거운 시간 속에 숨겨진 가르침</p>
            </div>
            <div className="values-list">
              <div className="value-item">
                <div className="value-number">01</div>
                <h3>기다리기</h3>
                <p>
                  내 차례가 올 때까지 기다려요. 참는 건 어렵지만, 기다리면 더 즐거워요.
                </p>
              </div>
              <div className="value-item">
                <div className="value-number">02</div>
                <h3>양보하기</h3>
                <p>
                  내가 먼저 하고 싶어도 친구에게 양보할 때가 있어요. 그러면 마음이
                  따뜻해져요.
                </p>
              </div>
              <div className="value-item">
                <div className="value-number">03</div>
                <h3>응원하기</h3>
                <p>
                  내 팀이 아니어도 응원해요. &quot;잘했어!&quot; 한마디가 친구에게 힘이 돼요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="moments">
          <div className="moments-header">
            <h2>Moments</h2>
            <p>활동 속 작은 순간들</p>
          </div>
          <p className="moments-intro">
            활동 시간에도 특별한 순간들이 있어요.
            <br />
            그냥 노는 것 같지만,
            <br />
            아이들은 조금씩 자라고 있어요.
          </p>
          <div className="moments-grid">
            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 규칙 지키는 아이
                  <br />
                  (웃으면서 기다리는 모습)
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">01</p>
                <p className="moment-title">웃으면서 규칙 지키기</p>
                <p className="moment-caption">
                  게임이 너무 재밌어서 흥분한 친구가 있어요. 앞으로 튀어나가려다가
                  &quot;아, 내 차례 아니지!&quot; 하고 멈춰요. 크게 웃으면서도 규칙을 기억해요.
                  그게 정말 멋진 거예요.
                </p>
              </div>
            </div>

            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 상대팀 응원하는 아이들
                  <br />
                  (박수 치는 모습)
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">02</p>
                <p className="moment-title">상대팀도 응원해요</p>
                <p className="moment-caption">
                  빨간팀과 파란팀으로 나눴어요. 파란팀이 이겼는데, 빨간팀 친구가
                  말해요. &quot;야, 잘했어! 진짜 빨랐어!&quot; 팀은 달라도 친구니까요. 이기는
                  것보다 함께하는 게 더 중요해요.
                </p>
              </div>
            </div>

            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 돌아가면서 묻는 아이
                  <br />
                  (문 앞에서 손 흔드는 모습)
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">03</p>
                <p className="moment-title">&quot;다음 주에 또 와요?&quot;</p>
                <p className="moment-caption">
                  집에 가려고 신발 신는 친구가 물어요. &quot;선생님, 다음 주에 또 이거
                  해요?&quot; &quot;다음 주 또 오면 되잖아!&quot; 그 말이 선생님들에겐 최고의
                  칭찬이에요. 기다려지는 곳, 오고 싶은 곳이 된 거예요.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="quote-section">
          <blockquote>&quot;웃을 때가 있고 춤출 때가 있으며&quot;</blockquote>
          <cite>— 전도서 3:4</cite>
        </section>

        <section className="closing">
          <p className="closing-label">What We Believe</p>
          <p className="closing-text">
            &quot;아이들의 웃음소리는
            <br />
            하나님이 기뻐하시는 찬양입니다.&quot;
          </p>
          <p className="closing-sub">
            우리는 믿어요.
            <br />
            아이들이 즐거워하는 것,
            <br />
            친구들과 웃고 떠드는 것,
            <br />
            뛰어놀고 땀 흘리는 것,
            <br />
            이 모든 것을 하나님이 기뻐하신다고요.
            <br />
            그래서 우리는 오늘도 함께 놀아요.
          </p>
          <nav className="closing-nav">
            <a href="/sing-to-the-lord">← Sing to the Lord</a>
            <a href="/beloved-teachers">Beloved Teachers →</a>
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
            url("https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/JoyfulActivities.jpg");
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
          border-left: 3px solid #e8a87c;
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
          background: linear-gradient(145deg, #fef3e8 0%, #fce8d8 100%);
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

        .activities-section {
          padding: 100px 48px;
          background: linear-gradient(180deg, #fff 0%, #f8f7f5 100%);
        }

        .activities-container {
          max-width: 1000px;
          margin: 0 auto;
        }

        .activities-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .activities-header h2 {
          font-family: "Playfair Display", serif;
          font-size: 28px;
          font-weight: 400;
          margin-bottom: 16px;
        }

        .activities-header p {
          font-size: 15px;
          color: #888;
        }

        .activities-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
        }

        .activity-card {
          background: #fff;
          padding: 36px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
          transition: transform 0.3s;
        }

        .activity-card:hover {
          transform: translateY(-4px);
        }

        .activity-icon {
          font-size: 36px;
          margin-bottom: 20px;
        }

        .activity-card h3 {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 12px;
          color: #e8a87c;
        }

        .activity-card p {
          font-size: 15px;
          line-height: 1.8;
          color: #666;
        }

        .values-section {
          padding: 100px 48px;
          background: #fef8f3;
        }

        .values-container {
          max-width: 900px;
          margin: 0 auto;
        }

        .values-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .values-header h2 {
          font-family: "Playfair Display", serif;
          font-size: 28px;
          font-weight: 400;
          margin-bottom: 16px;
        }

        .values-header p {
          font-size: 15px;
          color: #888;
        }

        .values-list {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .value-item {
          text-align: center;
        }

        .value-number {
          font-family: "Playfair Display", serif;
          font-size: 48px;
          color: #fce8d8;
          margin-bottom: 16px;
        }

        .value-item h3 {
          font-size: 17px;
          font-weight: 500;
          margin-bottom: 12px;
          color: #333;
        }

        .value-item p {
          font-size: 14px;
          line-height: 1.8;
          color: #666;
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
          color: #fef3e8;
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
          background: linear-gradient(135deg, #fef3e8 0%, #fce8d8 100%);
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
          color: #c98a5c;
          font-style: normal;
        }

        .closing {
          padding: 160px 48px;
          text-align: center;
          background: #4a3728;
          color: white;
        }

        .closing-label {
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #e8a87c;
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
          color: #c9a88e;
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
          color: #e8a87c;
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

          .activities-section {
            padding: 80px 24px;
          }

          .activities-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .values-section {
            padding: 80px 24px;
          }

          .values-list {
            grid-template-columns: 1fr;
            gap: 32px;
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
