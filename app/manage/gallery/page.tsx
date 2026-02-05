"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type FolderLinks = { church: string | null; kids: string | null; youth: string | null };

export default function ManageGalleryPage() {
  const [links, setLinks] = useState<FolderLinks | null>(null);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const ok = typeof window !== "undefined" && sessionStorage.getItem("pbcs_admin_authed") === "1";
    setAuthed(ok);
    if (ok) {
      fetch("/api/gallery/folders")
        .then((r) => r.json())
        .then(setLinks)
        .catch(() => setLinks({ church: null, kids: null, youth: null }));
    }
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">관리자 로그인이 필요합니다.</p>
          <Link href="/manage" className="text-blue-600 underline">
            로그인 페이지로 이동
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">갤러리 임베드 관리</h1>
          <Link
            href="/manage"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 관리자 홈
          </Link>
        </div>

        {/* 공개 갤러리 미리보기 */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-2">공개 갤러리</h2>
          <p className="text-sm text-gray-600 mb-4">
            메인 사이트에 노출되는 갤러리(Our Stories)입니다. Drive 폴더에 올린 사진이 여기 반영됩니다.
          </p>
          <a
            href="/our-stories"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2.5 text-sm font-medium hover:bg-blue-700 transition"
          >
            갤러리 페이지 보기 →
          </a>
        </section>

        {/* Drive 연동 폴더 */}
        <section className="bg-white rounded-xl shadow p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-2">Google Drive 연동 폴더</h2>
          <p className="text-sm text-gray-600 mb-4">
            아래 폴더에 이미지를 올리면 갤러리에 자동으로 표시됩니다. <strong>파일명</strong>이 캡션으로 사용됩니다.
          </p>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 mb-4">
            <li>한글, 영문, 숫자, 띄어쓰기, 특수문자·이모지 가능</li>
            <li>예: &quot;성탄절 예배.jpg&quot; → 캡션 &quot;성탄절 예배&quot;</li>
          </ul>
          <div className="space-y-3">
            {links && (
              <>
                {links.church && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">교회행사</span>
                    <a
                      href={links.church}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Drive 폴더 열기
                    </a>
                  </div>
                )}
                {links.kids && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">유치부</span>
                    <a
                      href={links.kids}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Drive 폴더 열기
                    </a>
                  </div>
                )}
                {links.youth && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-700 font-medium">청년부</span>
                    <a
                      href={links.youth}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Drive 폴더 열기
                    </a>
                  </div>
                )}
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            OAuth·Google Picker 연동은 추후 추가 예정입니다. 현재는 Drive에서 직접 업로드해 주세요.
          </p>
        </section>
      </div>
    </div>
  );
}
