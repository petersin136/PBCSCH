"use client";

import { useEffect, useRef, useState } from "react";

const ADMIN_ID = "PBCSCH";
const ADMIN_PW = "369369";

export default function ManagePage() {
  const [adminId, setAdminId] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [error, setError] = useState("");
  const [authed, setAuthed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const skipModalClosedBackRef = useRef(false);

  useEffect(() => {
    const savedId = localStorage.getItem("pbcs_admin_id") || "";
    const savedPw = localStorage.getItem("pbcs_admin_pw") || "";
    if (savedId) setAdminId(savedId);
    if (savedPw) setAdminPw(savedPw);
    const wasAuthed = sessionStorage.getItem("pbcs_admin_authed") === "1";
    if (wasAuthed) setAuthed(true);
    history.pushState({ manage: 1 }, "", window.location.pathname);
  }, []);

  useEffect(() => {
    if (!authed) return;
    const path = "/manage";
    const onMessage = (e: MessageEvent) => {
      if (e.data?.type === "pbcs_modal_opened") {
        history.pushState({ modal: 1 }, "", path);
      }
      if (e.data?.type === "pbcs_modal_closed") {
        if (skipModalClosedBackRef.current) {
          skipModalClosedBackRef.current = false;
          return;
        }
        history.back();
      }
    };
    const onPop = () => {
      if (window.location.pathname === path && iframeRef.current?.contentWindow) {
        skipModalClosedBackRef.current = true;
        iframeRef.current.contentWindow.postMessage({ type: "pbcs_close_modal" }, "*");
      }
      history.pushState({ admin: 1 }, "", path);
    };
    history.pushState({ admin: 1 }, "", path);
    window.addEventListener("message", onMessage);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("popstate", onPop);
    };
  }, [authed]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (adminId === ADMIN_ID && adminPw === ADMIN_PW) {
      sessionStorage.setItem("pbcs_admin_authed", "1");
      setAuthed(true);
      setError("");
    } else {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  if (authed) {
    return (
      <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
        <div style={{ padding: "8px 16px", background: "#1f2937", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
          <a
            href="/manage/gallery"
            className="text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            갤러리 임베드 관리
          </a>
          <a
            href="/"
            onClick={() => sessionStorage.removeItem("pbcs_admin_authed")}
            className="text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          >
            메인 홈
          </a>
        </div>
        <iframe
          ref={iframeRef}
          title="학생관리"
          src="/manage/student-management-v3.html"
          style={{ width: "100%", height: "calc(100vh - 44px)", border: "none" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-lg p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">관리자 로그인</h1>
        <p className="text-sm text-gray-500 mb-6">
          관리자 계정으로만 접근할 수 있습니다.
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">아이디</label>
            <input
              type="text"
              value={adminId}
              onChange={(e) => {
                const value = e.target.value;
                setAdminId(value);
                localStorage.setItem("pbcs_admin_id", value);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="아이디"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">비밀번호</label>
            <input
              type="password"
              value={adminPw}
              onChange={(e) => {
                const value = e.target.value;
                setAdminPw(value);
                localStorage.setItem("pbcs_admin_pw", value);
              }}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="비밀번호"
              autoComplete="current-password"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 text-white py-2 font-semibold hover:bg-blue-700 transition"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
