"use client";

import { useEffect, useMemo, useState } from "react";

type GalleryItem = {
  id: number;
  category: "worship" | "activity" | "event" | "outdoor";
  date: string;
  title: string;
  accent: "teal" | "peach" | "lavender" | "sage";
};

const galleryItems: GalleryItem[] = [
  { id: 1, category: "worship", date: "2024.12.01", title: "주일예배", accent: "teal" },
  { id: 2, category: "activity", date: "2024.11.24", title: "게임시간", accent: "peach" },
  { id: 3, category: "event", date: "2024.12.25", title: "성탄절", accent: "lavender" },
  { id: 4, category: "outdoor", date: "2024.10.15", title: "가을소풍", accent: "sage" },
  { id: 5, category: "worship", date: "2024.11.17", title: "찬양시간", accent: "teal" },
  { id: 6, category: "activity", date: "2024.11.10", title: "만들기", accent: "peach" },
  { id: 7, category: "event", date: "2024.08.15", title: "여름성경학교", accent: "lavender" },
  { id: 8, category: "outdoor", date: "2024.05.05", title: "봄소풍", accent: "sage" },
];

const totalPages = 3;
const perPage = 8;

export default function OurStoriesPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "all" | "worship" | "activity" | "event" | "outdoor"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (activeTab === "all") {
      return galleryItems;
    }
    return galleryItems.filter((item) => item.category === activeTab);
  }, [activeTab]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [currentPage, filtered]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const goToPage = (page: number) => {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(safePage);
  };

  const openLightbox = (index: number) => {
    if (filtered.length === 0) {
      return;
    }
    setLightboxIndex(index);
  };

  const closeLightbox = () => setLightboxIndex(null);

  const lightboxPrev = () => {
    if (lightboxIndex === null || filtered.length === 0) {
      return;
    }
    const prevIndex = (lightboxIndex - 1 + filtered.length) % filtered.length;
    setLightboxIndex(prevIndex);
  };

  const lightboxNext = () => {
    if (lightboxIndex === null || filtered.length === 0) {
      return;
    }
    const nextIndex = (lightboxIndex + 1) % filtered.length;
    setLightboxIndex(nextIndex);
  };

  const activeLightboxItem =
    lightboxIndex !== null ? filtered[lightboxIndex] : null;

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
          <p className="hero-label">그래서, 이곳에서 실제로 일어나는 일</p>
          <h1 className="hero-title">
            Our
            <br />
            Stories
          </h1>
          <p className="hero-intro">
            여기 담긴 이야기들은 아직 완성되지 않았어요.
            <br />
            <br />
            우리는 &quot;성공 사례&quot;를 만들지 않아요.
            <br />
            멋있어 보이려고 꾸미지도 않아요.
            <br />
            그냥 있는 그대로의 순간들을 담아요.
            <br />
            <br />
            하나님이 아이들 안에서 일하시는 순간,
            <br />
            작지만 소중한 변화의 순간,
            <br />
            그 순간들을 조용히 기록해요.
          </p>
          <dl className="hero-meta">
            <div>
              <dt>Ministry</dt>
              <dd>주일학교 초등부</dd>
            </div>
            <div>
              <dt>Stories</dt>
              <dd>진행 중인</dd>
            </div>
            <div>
              <dt>Archive</dt>
              <dd>사진 갤러리</dd>
            </div>
          </dl>
        </section>

        <section className="content-grid">
          <div className="grid-text">
            <h2>아직 쓰이고 있는 이야기</h2>
            <p>
              어떤 친구는 1년 전만 해도
              <br />
              &quot;교회 가기 싫어요&quot;라고 말했어요.
              <br />
              지금은 &quot;다음 주 언제예요?&quot;라고 물어요.
            </p>
            <p>
              어떤 친구는 기도가 뭔지 몰랐어요.
              <br />
              지금은 밥 먹기 전에
              <br />
              &quot;하나님, 감사해요&quot; 하고 눈을 감아요.
            </p>
            <p>
              작은 변화예요.
              <br />
              눈에 잘 안 보이는 변화예요.
              <br />
              하지만 우리는 알아요.
              <br />
              하나님이 아이들 마음에서 일하고 계신다는 걸.
            </p>
            <div className="highlight-box">
              <p>
                우리는 &quot;성공 사례&quot;를 만들지 않아요.
                <br />
                하나님이 일하시는 순간을 조용히 기록할 뿐이에요.
              </p>
            </div>
          </div>
          <div className="grid-image">
            <div className="framed-image">
              <div className="image-placeholder">
                📷 예배하는 아이들
                <br />
                (자연스러운 모습)
              </div>
            </div>
          </div>
        </section>

        <section className="gallery-section">
          <div className="gallery-container">
            <div className="gallery-header">
              <h2>📸 우리의 순간들</h2>
              <p>함께 웃고, 기도하고, 뛰어놀았던 순간들이에요</p>
            </div>
            <div className="gallery-tabs">
              <button
                className={`gallery-tab ${activeTab === "all" ? "active" : ""}`}
                data-tab="all"
                onClick={() => setActiveTab("all")}
              >
                전체보기
              </button>
              <button
                className={`gallery-tab ${
                  activeTab === "worship" ? "active" : ""
                }`}
                data-tab="worship"
                onClick={() => setActiveTab("worship")}
              >
                예배
              </button>
              <button
                className={`gallery-tab ${
                  activeTab === "activity" ? "active" : ""
                }`}
                data-tab="activity"
                onClick={() => setActiveTab("activity")}
              >
                활동
              </button>
              <button
                className={`gallery-tab ${activeTab === "event" ? "active" : ""}`}
                data-tab="event"
                onClick={() => setActiveTab("event")}
              >
                특별행사
              </button>
              <button
                className={`gallery-tab ${
                  activeTab === "outdoor" ? "active" : ""
                }`}
                data-tab="outdoor"
                onClick={() => setActiveTab("outdoor")}
              >
                야외활동
              </button>
            </div>

            <div className="gallery-grid-wrapper">
              <button
                className="gallery-nav-btn prev"
                onClick={() => goToPage(currentPage - 1)}
                aria-label="이전 페이지"
                type="button"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#333"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6"></path>
                </svg>
              </button>

              <div id="gallery-grid" className="polaroid-grid">
                {pageItems.length === 0 ? (
                  <div className="gallery-empty">
                    아직 준비 중인 페이지입니다.
                    <br />
                    사진이 곧 추가돼요.
                  </div>
                ) : (
                  pageItems.map((item, index) => (
                    <button
                      key={item.id}
                      className={`polaroid accent-${item.accent}`}
                      data-category={item.category}
                      type="button"
                      onClick={() =>
                        openLightbox((currentPage - 1) * perPage + index)
                      }
                    >
                      <div className="polaroid-image">
                        <span>📷 {item.title}</span>
                      </div>
                      <p className="polaroid-caption">{item.date}</p>
                      <p className="polaroid-filename">{item.title}</p>
                    </button>
                  ))
                )}
              </div>

              <button
                className="gallery-nav-btn next"
                onClick={() => goToPage(currentPage + 1)}
                aria-label="다음 페이지"
                type="button"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#333"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6"></path>
                </svg>
              </button>
            </div>

            <div className="gallery-pagination" id="gallery-pagination">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1;
                return (
                  <button
                    key={page}
                    className={`pagination-btn ${
                      currentPage === page ? "active" : ""
                    }`}
                    onClick={() => goToPage(page)}
                    type="button"
                  >
                    {page}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className={`lightbox ${lightboxIndex !== null ? "is-open" : ""}`}>
          <button className="lightbox-close" onClick={closeLightbox} type="button">
            ×
          </button>
          <button className="lightbox-nav prev" onClick={lightboxPrev} type="button">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6"></path>
            </svg>
          </button>
          <div className="lightbox-content">
            <div className="lightbox-image">
              {activeLightboxItem ? (
                <span>📷 {activeLightboxItem.title}</span>
              ) : (
                <span>사진을 준비 중이에요</span>
              )}
            </div>
            <p className="lightbox-caption">
              {activeLightboxItem
                ? `${activeLightboxItem.date} · ${activeLightboxItem.title}`
                : ""}
            </p>
          </div>
          <button className="lightbox-nav next" onClick={lightboxNext} type="button">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6"></path>
            </svg>
          </button>
        </div>
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
            url("https://macmcfqzyejmgeabxupb.supabase.co/storage/v1/object/public/images/OurStories.jpg");
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
          border-left: 3px solid #7eb8b8;
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
          background: linear-gradient(145deg, #e8f4f4 0%, #d5ebeb 100%);
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

        .gallery-section {
          padding: 100px 48px;
          background: #fff;
        }

        .gallery-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .gallery-header {
          text-align: center;
          margin-bottom: 48px;
        }

        .gallery-header h2 {
          font-family: "Playfair Display", serif;
          font-size: 36px;
          font-weight: 400;
          margin-bottom: 16px;
        }

        .gallery-header p {
          font-size: 16px;
          color: #888;
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.7;
        }

        .gallery-tabs {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .gallery-tab {
          padding: 12px 28px;
          background: #f8f7f5;
          border: none;
          border-radius: 30px;
          font-size: 14px;
          color: #666;
          cursor: pointer;
          transition: all 0.3s;
          font-family: "Noto Sans KR", sans-serif;
        }

        .gallery-tab:hover {
          background: #e8f4f4;
          color: #5a9e9e;
        }

        .gallery-tab.active {
          background: #7eb8b8;
          color: white;
        }

        .gallery-grid-wrapper {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 20px;
          align-items: center;
        }

        .gallery-nav-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: #fff;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .gallery-nav-btn:disabled {
          opacity: 0.4;
          cursor: default;
        }

        .polaroid-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 24px;
        }

        .polaroid {
          border: none;
          background: #fff;
          border-radius: 18px;
          padding: 16px 16px 20px;
          text-align: left;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          transition: transform 0.2s ease;
          font-family: "Noto Sans KR", sans-serif;
        }

        .polaroid:hover {
          transform: translateY(-6px);
        }

        .polaroid-image {
          aspect-ratio: 1;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #555;
          margin-bottom: 12px;
        }

        .polaroid-caption {
          font-size: 13px;
          color: #888;
          margin-bottom: 4px;
        }

        .polaroid-filename {
          font-size: 15px;
          font-weight: 500;
          color: #333;
        }

        .accent-teal .polaroid-image {
          background: linear-gradient(145deg, #e8f4f4 0%, #d5ebeb 100%);
        }

        .accent-peach .polaroid-image {
          background: linear-gradient(145deg, #fef3e8 0%, #fce8d8 100%);
        }

        .accent-lavender .polaroid-image {
          background: linear-gradient(145deg, #f0eaf8 0%, #e5ddf0 100%);
        }

        .accent-sage .polaroid-image {
          background: linear-gradient(145deg, #e8f0eb 0%, #d8e5dc 100%);
        }

        .gallery-empty {
          grid-column: 1 / -1;
          padding: 80px 24px;
          text-align: center;
          background: #f8f7f5;
          border-radius: 16px;
          color: #888;
          font-size: 15px;
        }

        .gallery-pagination {
          margin-top: 32px;
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .pagination-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: #f8f7f5;
          color: #666;
          cursor: pointer;
          font-size: 13px;
        }

        .pagination-btn.active {
          background: #7eb8b8;
          color: #fff;
        }

        .lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          z-index: 200;
        }

        .lightbox.is-open {
          opacity: 1;
          pointer-events: auto;
        }

        .lightbox-content {
          max-width: min(90vw, 720px);
          text-align: center;
          color: #fff;
        }

        .lightbox-image {
          width: min(70vw, 520px);
          aspect-ratio: 1;
          border-radius: 18px;
          background: linear-gradient(145deg, #e8f4f4 0%, #d5ebeb 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          margin: 0 auto 20px;
          color: #2f4f4f;
        }

        .lightbox-caption {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }

        .lightbox-close {
          position: absolute;
          top: 24px;
          right: 24px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
          font-size: 22px;
          cursor: pointer;
        }

        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .lightbox-nav.prev {
          left: 24px;
        }

        .lightbox-nav.next {
          right: 24px;
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

          .gallery-section {
            padding: 80px 24px;
          }

          .gallery-grid-wrapper {
            grid-template-columns: 1fr;
          }

          .gallery-nav-btn {
            display: none;
          }

          .polaroid-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Noto+Sans+KR:wght@300;400;500&display=swap");
      `}</style>
    </div>
  );
}
