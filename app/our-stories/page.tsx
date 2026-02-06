"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface GalleryFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
}

function getCaption(filename: string): string {
  return filename.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "");
}

function formatDate(createdTime?: string): string {
  if (!createdTime) return "";
  try {
    const d = new Date(createdTime);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return "";
  }
}

function thumbnailUrl(fileId: string, sz: "w400" | "w1200" = "w400"): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=${sz}`;
}

const PER_PAGE = 8;

export default function OurStoriesPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lightboxStatePushedRef = useRef(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/gallery?category=all")
      .then((res) => {
        if (!res.ok) throw new Error("갤러리를 불러오지 못했어요.");
        return res.json();
      })
      .then((data: { files: GalleryFile[] }) => setFiles(data.files ?? []))
      .catch((e) => setError(e instanceof Error ? e.message : "오류가 났어요."))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(files.length / PER_PAGE));
  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE;
    return files.slice(start, start + PER_PAGE);
  }, [currentPage, files]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    const total = Math.max(1, Math.ceil(files.length / PER_PAGE));
    setCurrentPage(Math.min(Math.max(page, 1), total));
  };

  const openLightbox = (index: number) => {
    if (files.length === 0) return;
    setLightboxIndex(index);
    history.pushState({ lightbox: true }, "", window.location.href);
    lightboxStatePushedRef.current = true;
  };

  const closeLightbox = () => {
    if (lightboxStatePushedRef.current) {
      lightboxStatePushedRef.current = false;
      history.back();
    } else {
      setLightboxIndex(null);
    }
  };

  useEffect(() => {
    const onPopState = () => {
      lightboxStatePushedRef.current = false;
      setLightboxIndex(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const lightboxPrev = () => {
    if (lightboxIndex === null || files.length === 0) return;
    const prevIndex = (lightboxIndex - 1 + files.length) % files.length;
    setLightboxIndex(prevIndex);
  };

  const lightboxNext = () => {
    if (lightboxIndex === null || files.length === 0) return;
    const nextIndex = (lightboxIndex + 1) % files.length;
    setLightboxIndex(nextIndex);
  };

  const activeLightboxItem =
    lightboxIndex !== null ? files[lightboxIndex] : null;

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

        <section className="gallery-section">
          <div className="gallery-container">
            <div className="gallery-header">
              <h2>📸 우리의 순간들</h2>
              <p>함께 웃고, 기도하고, 뛰어놀았던 순간들이에요</p>
            </div>
            <div className="gallery-grid-wrapper">
              <button
                className="gallery-nav-btn prev"
                onClick={() => goToPage(currentPage - 1)}
                aria-label="이전 페이지"
                type="button"
                disabled={loading || currentPage <= 1}
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
                {loading ? (
                  <div className="gallery-empty">사진을 불러오는 중이에요...</div>
                ) : error ? (
                  <div className="gallery-empty">{error}</div>
                ) : pageItems.length === 0 ? (
                  <div className="gallery-empty">
                    이 카테고리에는 아직 사진이 없어요.
                    <br />
                    곧 추가될 거예요.
                  </div>
                ) : (
                  pageItems.map((item, index) => (
                    <button
                      key={item.id}
                      className="polaroid"
                      type="button"
                      onClick={() =>
                        openLightbox((currentPage - 1) * PER_PAGE + index)
                      }
                    >
                      <div className="polaroid-image">
                        <img
                          src={thumbnailUrl(item.id, "w400")}
                          alt={getCaption(item.name)}
                          loading="lazy"
                        />
                      </div>
                      <p className="polaroid-caption polaroid-caption-handwriting">
                        {getCaption(item.name)}
                        {formatDate(item.createdTime) && (
                          <span className="polaroid-date"> · {formatDate(item.createdTime)}</span>
                        )}
                      </p>
                    </button>
                  ))
                )}
              </div>

              <button
                className="gallery-nav-btn next"
                onClick={() => goToPage(currentPage + 1)}
                aria-label="다음 페이지"
                type="button"
                disabled={loading || currentPage >= totalPages}
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
                    disabled={loading}
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
                <img
                  src={thumbnailUrl(activeLightboxItem.id, "w1200")}
                  alt={getCaption(activeLightboxItem.name)}
                />
              ) : (
                <span>사진을 준비 중이에요</span>
              )}
            </div>
            <p className="lightbox-caption lightbox-caption-handwriting">
              {activeLightboxItem ? (
                <>
                  {getCaption(activeLightboxItem.name)}
                  {formatDate(activeLightboxItem.createdTime) && (
                    <span className="lightbox-date"> · {formatDate(activeLightboxItem.createdTime)}</span>
                  )}
                </>
              ) : ""}
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
          background: linear-gradient(
            145deg,
            #d4d4d4 0%,
            #c9c9c9 25%,
            #e0e0e0 50%,
            #cfcfcf 75%,
            #d8d8d8 100%
          );
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
          border-radius: 0;
          padding: 12px 12px 14px;
          text-align: left;
          min-width: 0;
          box-shadow:
            0 24px 48px rgba(0, 0, 0, 0.14),
            0 12px 24px rgba(0, 0, 0, 0.1),
            0 6px 12px rgba(0, 0, 0, 0.08);
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          font-family: "Noto Sans KR", sans-serif;
        }

        .polaroid:hover {
          transform: translateY(-12px);
          box-shadow:
            0 32px 64px rgba(0, 0, 0, 0.18),
            0 16px 32px rgba(0, 0, 0, 0.12),
            0 8px 16px rgba(0, 0, 0, 0.08);
        }

        .polaroid-image {
          aspect-ratio: 1;
          border-radius: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: #555;
          margin-bottom: 8px;
          background: #e8e4df;
        }

        .polaroid-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .polaroid-caption {
          font-size: 13px;
          color: #888;
          margin-bottom: 0;
          max-width: 100%;
          overflow: hidden;
          word-break: break-word;
          min-width: 0;
        }

        .polaroid-caption-handwriting {
          font-family: "Nanum Pen Script", cursive;
          font-size: 16px;
          color: #333;
          margin-top: 2px;
          line-height: 1.35;
        }

        .polaroid-date {
          font-family: "Noto Sans KR", sans-serif;
          font-size: 12px;
          color: #888;
          font-weight: 400;
        }

        .lightbox-caption-handwriting {
          font-family: "Nanum Pen Script", cursive;
          font-size: 22px;
          color: #fff;
        }

        .lightbox-date {
          font-family: "Noto Sans KR", sans-serif;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.85);
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
          width: min(85vw, 720px);
          max-height: 75vh;
          border-radius: 18px;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-size: 16px;
          margin: 0 auto 20px;
          color: #2f4f4f;
        }

        .lightbox-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
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
            gap: 12px;
          }

          .polaroid {
            padding: 8px 8px 10px;
          }

          .polaroid-image {
            margin-bottom: 6px;
          }

          .polaroid-caption-handwriting {
            font-size: 13px;
            line-height: 1.3;
          }

          .polaroid-date {
            font-size: 11px;
          }
        }
      `}</style>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Noto+Sans+KR:wght@300;400;500&display=swap");
      `}</style>
    </div>
  );
}
