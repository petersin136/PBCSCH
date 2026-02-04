"use client";

import { useState } from "react";

export default function BelovedTeachersPage() {
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
          <p className="hero-label">누가 아이들을 섬기는지</p>
          <h1 className="hero-title">
            Beloved
            <br />
            Teachers
          </h1>
          <p className="hero-intro">
            우리 초등부에는 특별한 선생님들이 있어요.
            <br />
            <br />
            그냥 봉사하러 온 사람들이 아니에요.
            <br />
            아이들을 진심으로 사랑하는 사람들이에요.
            <br />
            하나님께서 &quot;이 아이들을 맡긴다&quot;고 부르신 사람들이에요.
            <br />
            <br />
            지금부터 우리 선생님들을 소개할게요.
            <br />
            (좀 웃길 수도 있어요. 미리 경고해요! 😄)
          </p>
          <dl className="hero-meta">
            <div>
              <dt>Ministry</dt>
              <dd>주일학교 초등부</dd>
            </div>
            <div>
              <dt>Teachers</dt>
              <dd>사랑으로 섬기는</dd>
            </div>
            <div>
              <dt>Heart</dt>
              <dd>기도로 준비하는</dd>
            </div>
          </dl>
        </section>

        <section className="content-grid">
          <div className="grid-text">
            <h2>부름받은 사람들</h2>
            <p>
              &quot;선생님, 왜 여기서 일해요?&quot;
              <br />
              아이들이 가끔 물어봐요.
            </p>
            <p>
              돈을 받는 것도 아니고,
              <br />
              편하게 쉴 수도 있는 주일 오후에
              <br />
              왜 아이들과 뛰어다니냐고요.
            </p>
            <p>
              선생님들은 이렇게 대답해요.
              <br />
              &quot;하나님이 너희를 사랑하시거든.
              <br />
              그래서 나도 너희를 사랑하는 거야.&quot;
            </p>
            <p>
              우리 선생님들은 지원해서 온 게 아니에요.
              <br />
              하나님께 부름받아서 왔어요.
              <br />
              아이들을 맡기신 하나님의 마음으로
              <br />
              한 명 한 명을 소중히 여겨요.
            </p>
            <div className="highlight-box">
              <p>
                우리 교사들은 단순한 보호자가 아니에요.
                <br />
                아이들과 함께 신앙을 나누는 동역자예요.
              </p>
            </div>
          </div>
          <div className="grid-image">
            <div className="framed-image">
              <div className="image-placeholder">
                📷 선생님들 단체 사진
                <br />
                (밝게 웃는 모습)
              </div>
            </div>
          </div>
        </section>

        <section className="content-grid reverse">
          <div className="grid-text">
            <h2>기도로 준비해요</h2>
            <p>
              아이들은 몰라요.
              <br />
              선생님들이 매주 얼마나 준비하는지.
            </p>
            <p>
              토요일 밤, 선생님들은 기도해요.
              <br />
              &quot;하나님, 내일 민준이가 오게 해주세요.&quot;
              <br />
              &quot;서연이가 요즘 힘들어하는데, 위로해주세요.&quot;
              <br />
              &quot;새로 오는 친구가 잘 적응하게 해주세요.&quot;
            </p>
            <p>
              아이들 이름을 하나씩 부르며 기도해요.
              <br />
              게임도 준비하고, 간식도 준비하지만
              <br />
              제일 중요한 준비는 기도예요.
            </p>
            <p>
              아이들이 교회에 오기 전부터
              <br />
              선생님들의 마음은 이미 아이들에게 가 있어요.
            </p>
            <div className="highlight-box">
              <p>
                아이 한 명, 한 명을
                <br />
                하나님께서 맡기신 생명으로 여겨요.
              </p>
            </div>
          </div>
          <div className="grid-image">
            <div className="framed-image">
              <div className="image-placeholder">
                📷 기도하는 선생님
                <br />
                (준비하는 모습)
              </div>
            </div>
          </div>
        </section>

        <section className="teachers-section">
          <div className="teachers-container">
            <div className="teachers-header">
              <h2>우리 선생님들을 소개합니다!</h2>
              <p>아이들이 사랑하는 선생님들이에요 💜</p>
            </div>
            <div className="teachers-grid">
              <div className="teacher-card">
                <div className="teacher-image">📷 선생님 1 사진</div>
                <div className="teacher-content">
                  <p className="teacher-role">부장 교사</p>
                  <h3 className="teacher-name">김OO 선생님</h3>
                  <p className="teacher-nickname">
                    아이들이 부르는 별명: &quot;웃음 폭탄&quot;
                  </p>
                  <p className="teacher-quote">
                    &quot;아이들 웃음소리가 제 에너지예요. 일주일 내내 그 소리 생각하면서
                    버텨요!&quot;
                  </p>
                  <div className="teacher-traits">
                    <span className="trait-tag">😄 잘 웃어요</span>
                    <span className="trait-tag">🎮 게임 아이디어 뱅크</span>
                    <span className="trait-tag">🍪 간식 담당</span>
                  </div>
                </div>
              </div>

              <div className="teacher-card">
                <div className="teacher-image">📷 선생님 2 사진</div>
                <div className="teacher-content">
                  <p className="teacher-role">교사</p>
                  <h3 className="teacher-name">이OO 선생님</h3>
                  <p className="teacher-nickname">
                    아이들이 부르는 별명: &quot;포옹 선생님&quot;
                  </p>
                  <p className="teacher-quote">
                    &quot;아이들 안아주는 게 제 특기예요. 슬플 때, 기쁠 때, 다 안아줘요!&quot;
                  </p>
                  <div className="teacher-traits">
                    <span className="trait-tag">🤗 포옹 전문가</span>
                    <span className="trait-tag">👂 잘 들어줘요</span>
                    <span className="trait-tag">💌 격려 편지</span>
                  </div>
                </div>
              </div>

              <div className="teacher-card">
                <div className="teacher-image">📷 선생님 3 사진</div>
                <div className="teacher-content">
                  <p className="teacher-role">교사</p>
                  <h3 className="teacher-name">박OO 선생님</h3>
                  <p className="teacher-nickname">
                    아이들이 부르는 별명: &quot;찬양 DJ&quot;
                  </p>
                  <p className="teacher-quote">
                    &quot;찬양 시간이 제일 좋아요. 아이들이랑 같이 뛰면 나이 잊어버려요!&quot;
                  </p>
                  <div className="teacher-traits">
                    <span className="trait-tag">🎵 찬양 인도</span>
                    <span className="trait-tag">💃 춤 실력자</span>
                    <span className="trait-tag">⚡ 에너자이저</span>
                  </div>
                </div>
              </div>

              <div className="teacher-card">
                <div className="teacher-image">📷 선생님 4 사진</div>
                <div className="teacher-content">
                  <p className="teacher-role">교사</p>
                  <h3 className="teacher-name">최OO 선생님</h3>
                  <p className="teacher-nickname">
                    아이들이 부르는 별명: &quot;이야기 할아버지&quot;
                  </p>
                  <p className="teacher-quote">
                    &quot;성경 이야기 할 때 아이들 눈이 반짝반짝해요. 그게 너무 좋아요.&quot;
                  </p>
                  <div className="teacher-traits">
                    <span className="trait-tag">📖 이야기 달인</span>
                    <span className="trait-tag">🎭 연기 실력</span>
                    <span className="trait-tag">🤔 질문 환영</span>
                  </div>
                </div>
              </div>

              <div className="teacher-card">
                <div className="teacher-image">📷 선생님 5 사진</div>
                <div className="teacher-content">
                  <p className="teacher-role">교사</p>
                  <h3 className="teacher-name">정OO 선생님</h3>
                  <p className="teacher-nickname">
                    아이들이 부르는 별명: &quot;기도 용사&quot;
                  </p>
                  <p className="teacher-quote">
                    &quot;아이들 이름 다 외워요. 매일 한 명씩 기도하거든요.&quot;
                  </p>
                  <div className="teacher-traits">
                    <span className="trait-tag">🙏 기도 전사</span>
                    <span className="trait-tag">📝 꼼꼼해요</span>
                    <span className="trait-tag">💪 책임감</span>
                  </div>
                </div>
              </div>

              <div className="teacher-card">
                <div className="teacher-image">📷 선생님 6 사진</div>
                <div className="teacher-content">
                  <p className="teacher-role">교사</p>
                  <h3 className="teacher-name">한OO 선생님</h3>
                  <p className="teacher-nickname">
                    아이들이 부르는 별명: &quot;만들기 천재&quot;
                  </p>
                  <p className="teacher-quote">
                    &quot;손으로 뭔가 만드는 거 좋아해요. 아이들이 완성작 들고 좋아하면
                    뿌듯해요!&quot;
                  </p>
                  <div className="teacher-traits">
                    <span className="trait-tag">✂️ 만들기 전문</span>
                    <span className="trait-tag">🎨 창의력</span>
                    <span className="trait-tag">📦 재료 준비왕</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fun-facts">
          <div className="fun-facts-container">
            <h2>우리 선생님들 TMI 😆</h2>
            <div className="facts-grid">
              <div className="fact-item">
                <div className="fact-number">6</div>
                <p className="fact-label">명의 선생님</p>
              </div>
              <div className="fact-item">
                <div className="fact-number">∞</div>
                <p className="fact-label">무한한 사랑</p>
              </div>
              <div className="fact-item">
                <div className="fact-number">100+</div>
                <p className="fact-label">준비한 게임 수</p>
              </div>
              <div className="fact-item">
                <div className="fact-number">매주</div>
                <p className="fact-label">기도 모임</p>
              </div>
            </div>
          </div>
        </section>

        <section className="text-full">
          <h2>선생님들이 아이들에게 바라는 것</h2>
          <p>
            선생님들은 아이들이 공부 잘하길 바라지 않아요.
            <br />
            성경 많이 외우길 바라지도 않아요.
          </p>
          <p>
            그냥 이것 하나예요.
            <br />
            &quot;하나님이 너를 사랑하신다는 거,
            <br />
            그거 하나만 기억해줘.&quot;
          </p>
          <p>
            선생님들은 아이들이 어른이 되어서도
            <br />
            이 사랑을 기억하길 바라요.
            <br />
            힘들 때, 외로울 때, 길을 잃었을 때
            <br />
            &quot;아, 하나님이 나를 사랑하셨지&quot; 하고
            <br />
            다시 일어날 수 있기를 바라요.
          </p>
        </section>

        <section className="moments">
          <div className="moments-header">
            <h2>Moments</h2>
            <p>선생님들의 작은 순간들</p>
          </div>
          <p className="moments-intro">
            아이들은 모를 수도 있어요.
            <br />
            선생님들이 얼마나 아이들을 생각하는지.
            <br />
            하지만 이런 순간들이 매주 일어나요.
          </p>
          <div className="moments-grid">
            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 기도하는 선생님
                  <br />
                  (이름 부르며 기도)
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">01</p>
                <p className="moment-title">이름을 부르며 기도해요</p>
                <p className="moment-caption">
                  예배 시작 전, 선생님이 기도해요. &quot;하나님, 오늘 민준이가 오게
                  해주세요. 지난주에 아팠던 서연이 낫게 해주세요.&quot; 아이들 이름을
                  하나하나 불러요. 그게 선생님들의 첫 번째 예배예요.
                </p>
              </div>
            </div>

            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 눈높이 맞추는 선생님
                  <br />
                  (앉아서 이야기)
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">02</p>
                <p className="moment-title">눈높이에 앉아서 들어요</p>
                <p className="moment-caption">
                  아이가 뭔가 말하고 싶어해요. 선생님은 서 있지 않아요. 쪼그려 앉아서
                  눈을 맞춰요. &quot;응, 그래서? 더 말해봐.&quot; 끝까지 들어요. 끊지 않아요.
                  아이의 말이 세상에서 제일 중요한 것처럼.
                </p>
              </div>
            </div>

            <div className="moment-card">
              <div className="moment-card-image">
                <div className="image-placeholder">
                  📷 연락하는 선생님
                  <br />
                  (전화/문자하는 모습)
                </div>
              </div>
              <div className="moment-card-content">
                <p className="moment-number">03</p>
                <p className="moment-title">먼저 안부를 물어요</p>
                <p className="moment-caption">
                  한 친구가 두 주째 안 왔어요. 선생님이 부모님께 연락해요. &quot;혹시 OO이
                  괜찮아요? 저희가 많이 보고 싶어해서요.&quot; 아이들은 몰라요. 안 오면
                  선생님들이 걱정한다는 거.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="quote-section">
          <blockquote>
            &quot;내가 너희를 사랑한 것 같이
            <br />
            너희도 서로 사랑하라&quot;
          </blockquote>
          <cite>— 요한복음 13:34</cite>
        </section>

        <section className="closing">
          <p className="closing-label">What We Believe</p>
          <p className="closing-text">
            &quot;아이들은 가르침보다
            <br />
            사랑을 먼저 기억합니다.&quot;
          </p>
          <p className="closing-sub">
            우리 선생님들은 완벽하지 않아요.
            <br />
            실수도 하고, 지칠 때도 있어요.
            <br />
            하지만 한 가지는 확실해요.
            <br />
            아이들을 진심으로 사랑한다는 것.
            <br />
            그 사랑이 아이들 마음에 남기를 기도해요.
          </p>
          <nav className="closing-nav">
            <a href="/joyful-activities">← Joyful Activities</a>
            <a href="/our-stories">Our Stories →</a>
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
            url("https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/BelovedTeachers.jpg");
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
          border-left: 3px solid #b8a5d6;
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
          background: linear-gradient(145deg, #f0eaf8 0%, #e5ddf0 100%);
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

        .teachers-section {
          padding: 100px 48px;
          background: linear-gradient(180deg, #fff 0%, #f8f7f5 100%);
        }

        .teachers-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .teachers-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .teachers-header h2 {
          font-family: "Playfair Display", serif;
          font-size: 36px;
          font-weight: 400;
          margin-bottom: 16px;
        }

        .teachers-header p {
          font-size: 16px;
          color: #888;
        }

        .teachers-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
        }

        .teacher-card {
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
          transition: transform 0.3s;
        }

        .teacher-card:hover {
          transform: translateY(-8px);
        }

        .teacher-image {
          aspect-ratio: 1;
          background: linear-gradient(145deg, #f0eaf8 0%, #e5ddf0 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #999;
          text-align: center;
          padding: 20px;
        }

        .teacher-content {
          padding: 32px;
        }

        .teacher-role {
          font-size: 12px;
          color: #b8a5d6;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        .teacher-name {
          font-size: 22px;
          font-weight: 500;
          margin-bottom: 4px;
          color: #333;
        }

        .teacher-nickname {
          font-size: 14px;
          color: #888;
          margin-bottom: 16px;
        }

        .teacher-quote {
          font-size: 15px;
          line-height: 1.8;
          color: #666;
          font-style: italic;
          padding-left: 16px;
          border-left: 2px solid #e5ddf0;
          margin-bottom: 20px;
        }

        .teacher-traits {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .trait-tag {
          background: #f8f5fc;
          color: #8b7aab;
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 20px;
        }

        .fun-facts {
          padding: 80px 48px;
          background: #f8f5fc;
        }

        .fun-facts-container {
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .fun-facts h2 {
          font-family: "Playfair Display", serif;
          font-size: 28px;
          font-weight: 400;
          margin-bottom: 48px;
        }

        .facts-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }

        .fact-item {
          text-align: center;
        }

        .fact-number {
          font-family: "Playfair Display", serif;
          font-size: 48px;
          color: #b8a5d6;
          margin-bottom: 8px;
        }

        .fact-label {
          font-size: 14px;
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
          color: #f0eaf8;
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
          background: linear-gradient(135deg, #f0eaf8 0%, #e5ddf0 100%);
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
          color: #9585b5;
          font-style: normal;
        }

        .closing {
          padding: 160px 48px;
          text-align: center;
          background: #3d3548;
          color: white;
        }

        .closing-label {
          font-size: 12px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #b8a5d6;
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
          color: #a99bc4;
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
          color: #b8a5d6;
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

          .teachers-section {
            padding: 80px 24px;
          }

          .teachers-grid {
            grid-template-columns: 1fr;
            gap: 32px;
            max-width: 400px;
            margin: 0 auto;
          }

          .fun-facts {
            padding: 60px 24px;
          }

          .facts-grid {
            grid-template-columns: repeat(2, 1fr);
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
