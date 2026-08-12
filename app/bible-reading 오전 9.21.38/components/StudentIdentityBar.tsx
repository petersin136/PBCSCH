"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  checkStudentHasPin,
  clearStoredStudent,
  fetchClasses,
  fetchStudentsByClass,
  loadStoredStudent,
  setStudentPin,
  storeStudent,
  verifyStudentPin,
  type BibleClass,
  type BibleStudent,
  type IdentifiedStudent,
} from "../../lib/bibleReadingProgress";
import { isSupabaseConfigured } from "../../lib/supabaseClient";

type Props = {
  onChange: (student: IdentifiedStudent | null) => void;
};

type Step = "class" | "student" | "pin" | "setup";

export default function StudentIdentityBar({ onChange }: Props) {
  const [student, setStudent] = useState<IdentifiedStudent | null>(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("class");
  const [classes, setClasses] = useState<BibleClass[]>([]);
  const [students, setStudents] = useState<BibleStudent[]>([]);
  const [selectedClass, setSelectedClass] = useState<BibleClass | null>(null);
  const [selectedStudent, setSelectedStudent] =
    useState<BibleStudent | null>(null);
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const configured = useMemo(() => isSupabaseConfigured(), []);

  useEffect(() => {
    const stored = loadStoredStudent();
    if (stored) {
      setStudent(stored);
      onChange(stored);
    }
  }, [onChange]);

  const completeLogin = useCallback(
    (cls: BibleClass, s: BibleStudent) => {
      const identified: IdentifiedStudent = {
        id: s.id,
        name: s.name,
        classId: s.class_id,
        className: cls.name,
      };
      storeStudent(identified);
      setStudent(identified);
      setOpen(false);
      onChange(identified);
    },
    [onChange],
  );

  const beginIdentify = useCallback(async () => {
    if (!configured) {
      setError(
        "서버 연결이 설정되지 않았어요. 진도는 이 기기에만 저장됩니다.",
      );
      return;
    }
    setOpen(true);
    setStep("class");
    setSelectedClass(null);
    setSelectedStudent(null);
    setPin("");
    setNewPin("");
    setConfirmPin("");
    setError(null);
    setLoading(true);
    try {
      const list = await fetchClasses();
      setClasses(list);
      if (list.length === 0) {
        setError("등록된 반이 없어요. 선생님께 알려 주세요.");
      }
    } catch (e) {
      setError("반 목록을 불러오지 못했어요.");
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [configured]);

  const pickClass = useCallback(async (cls: BibleClass) => {
    setSelectedClass(cls);
    setStep("student");
    setLoading(true);
    setError(null);
    try {
      const list = await fetchStudentsByClass(cls.id);
      setStudents(list);
      if (list.length === 0) {
        setError("이 반에 등록된 학생이 없어요. 선생님께 알려 주세요.");
      }
    } catch (e) {
      setError("학생 목록을 불러오지 못했어요.");
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const pickStudent = useCallback(async (s: BibleStudent) => {
    setSelectedStudent(s);
    setPin("");
    setNewPin("");
    setConfirmPin("");
    setError(null);
    setLoading(true);
    try {
      const has = await checkStudentHasPin(s.id);
      setStep(has ? "pin" : "setup");
    } catch (e) {
      console.warn(e);
      setStep("pin");
    } finally {
      setLoading(false);
    }
  }, []);

  const confirmLoginPin = useCallback(async () => {
    if (!selectedStudent || !selectedClass) return;
    if (!/^\d{4}$/.test(pin)) {
      setError("비밀번호는 숫자 4자리여야 해요.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ok = await verifyStudentPin(selectedStudent.id, pin);
      if (!ok) {
        setError("비밀번호가 달라요. 다시 한 번 입력해 봐.");
        setPin("");
        setLoading(false);
        return;
      }
      completeLogin(selectedClass, selectedStudent);
    } catch (e) {
      setError("로그인에 실패했어요. 잠시 후에 다시 해 봐.");
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [completeLogin, pin, selectedClass, selectedStudent]);

  const confirmSetupPin = useCallback(async () => {
    if (!selectedStudent || !selectedClass) return;
    if (!/^\d{4}$/.test(newPin) || !/^\d{4}$/.test(confirmPin)) {
      setError("비밀번호는 숫자 4자리여야 해요.");
      return;
    }
    if (newPin !== confirmPin) {
      setError("두 번 입력한 비밀번호가 달라요. 다시 해볼까?");
      setConfirmPin("");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await setStudentPin(selectedStudent.id, newPin);
      if (!result.ok) {
        if (result.reason === "already_set") {
          setError(
            "이미 비밀번호가 있어. 아래 '이미 비밀번호가 있어요'를 눌러서 들어가 봐.",
          );
        } else if (result.reason === "not_configured") {
          setError("서버 연결이 설정되지 않았어요.");
        } else {
          setError(
            `서버 오류가 났어. 선생님께 보여줘.\n(${result.message ?? "unknown"})`,
          );
        }
        setLoading(false);
        return;
      }
      completeLogin(selectedClass, selectedStudent);
    } catch (e) {
      setError("문제가 생겼어. 잠시 후에 다시 해 봐.");
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [completeLogin, confirmPin, newPin, selectedClass, selectedStudent]);

  const logout = useCallback(() => {
    clearStoredStudent();
    setStudent(null);
    onChange(null);
  }, [onChange]);

  const switchToLogin = useCallback(() => {
    setStep("pin");
    setPin("");
    setError(null);
  }, []);

  return (
    <>
      <div className="bri-bar">
        {student ? (
          <div className="bri-row">
            <div className="bri-text">
              <span className="bri-eyebrow">읽기 진도 저장 중</span>
              <span className="bri-name">
                {student.className ? `${student.className} · ` : ""}
                {student.name}
              </span>
            </div>
            <button type="button" className="bri-link" onClick={logout}>
              다른 사람이에요
            </button>
          </div>
        ) : (
          <div className="bri-row">
            <div className="bri-text">
              <span className="bri-eyebrow">진도 저장</span>
              <span className="bri-name bri-name-gray">
                {configured
                  ? "내 이름으로 들어가면 선생님이 진도를 볼 수 있어요"
                  : "서버 미설정 — 이 기기에만 저장됩니다"}
              </span>
            </div>
            {configured ? (
              <button
                type="button"
                className="bri-cta"
                onClick={beginIdentify}
              >
                내 이름으로 시작
              </button>
            ) : null}
          </div>
        )}
      </div>

      {open ? (
        <div
          className="bri-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bri-modal">
            <header className="bri-modal-head">
              <h2>
                {step === "class"
                  ? "반을 골라 주세요"
                  : step === "student"
                  ? "내 이름을 골라 주세요"
                  : step === "setup"
                  ? "처음이구나! 나만의 비밀번호를 정해줘"
                  : "비밀번호 4자리를 입력해줘"}
              </h2>
              <button
                type="button"
                className="bri-close"
                aria-label="닫기"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </header>

            {loading ? (
              <div className="bri-loading">잠깐만 기다려 줘…</div>
            ) : null}

            {step === "class" && !loading ? (
              <div className="bri-list">
                {classes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="bri-list-item"
                    onClick={() => pickClass(c)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            ) : null}

            {step === "student" && !loading ? (
              <>
                <div className="bri-crumb">
                  {selectedClass?.name}
                  <button
                    type="button"
                    className="bri-back"
                    onClick={() => setStep("class")}
                  >
                    ← 반 다시 고르기
                  </button>
                </div>
                <div className="bri-list bri-list-grid">
                  {students.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="bri-list-item"
                      onClick={() => pickStudent(s)}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {step === "setup" && !loading ? (
              <>
                <div className="bri-crumb">
                  {selectedClass?.name} · {selectedStudent?.name}
                  <button
                    type="button"
                    className="bri-back"
                    onClick={() => setStep("student")}
                  >
                    ← 이름 다시 고르기
                  </button>
                </div>
                <p className="bri-pin-note">
                  나만 아는 숫자 4자리로 비밀번호를 만들어 봐.
                  <br />
                  다음에 들어올 때는 이 비밀번호로 들어와야 해.
                </p>

                <label className="bri-field-label" htmlFor="bri-new-pin">
                  새 비밀번호 (숫자 4자리)
                </label>
                <input
                  id="bri-new-pin"
                  className="bri-pin-input"
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) =>
                    setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  placeholder="••••"
                  autoFocus
                />

                <label className="bri-field-label" htmlFor="bri-confirm-pin">
                  한 번 더 입력
                </label>
                <input
                  id="bri-confirm-pin"
                  className="bri-pin-input"
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) =>
                    setConfirmPin(
                      e.target.value.replace(/\D/g, "").slice(0, 4),
                    )
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void confirmSetupPin();
                  }}
                  placeholder="••••"
                />

                <button
                  type="button"
                  className="bri-cta bri-cta-full"
                  onClick={() => void confirmSetupPin()}
                  disabled={newPin.length !== 4 || confirmPin.length !== 4}
                >
                  비밀번호 정하기
                </button>
                <button
                  type="button"
                  className="bri-secondary"
                  onClick={switchToLogin}
                >
                  이미 비밀번호가 있어요
                </button>
              </>
            ) : null}

            {step === "pin" && !loading ? (
              <>
                <div className="bri-crumb">
                  {selectedClass?.name} · {selectedStudent?.name}
                  <button
                    type="button"
                    className="bri-back"
                    onClick={() => setStep("student")}
                  >
                    ← 이름 다시 고르기
                  </button>
                </div>
                <p className="bri-pin-note">
                  내가 정한 비밀번호 4자리를 입력해줘.
                </p>
                <input
                  className="bri-pin-input"
                  type="password"
                  inputMode="numeric"
                  autoComplete="current-password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void confirmLoginPin();
                  }}
                  placeholder="••••"
                  autoFocus
                />
                <button
                  type="button"
                  className="bri-cta bri-cta-full"
                  onClick={() => void confirmLoginPin()}
                  disabled={pin.length !== 4}
                >
                  들어가기
                </button>
              </>
            ) : null}

            {error ? <div className="bri-error">{error}</div> : null}
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .bri-bar {
          margin: 12px clamp(16px, 4vw, 40px) 0;
          padding: 12px 16px;
          border-radius: 14px;
          background: rgba(30, 58, 95, 0.05);
          border: 1px solid rgba(30, 58, 95, 0.1);
        }
        .bri-row {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: space-between;
        }
        .bri-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .bri-eyebrow {
          font-size: 11px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #64748b;
        }
        .bri-name {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .bri-name-gray {
          color: #64748b;
          font-weight: 500;
        }
        .bri-cta {
          padding: 9px 16px;
          border-radius: 999px;
          border: none;
          background: #1e3a5f;
          color: #fdfaf3;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .bri-link {
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 12px;
          cursor: pointer;
          text-decoration: underline;
          padding: 4px 6px;
        }
        .bri-overlay {
          position: fixed;
          inset: 0;
          background: rgba(30, 41, 59, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 16px;
        }
        .bri-modal {
          background: #fdfaf3;
          width: 100%;
          max-width: 480px;
          max-height: 84vh;
          overflow-y: auto;
          border-radius: 18px;
          padding: 22px 22px 24px;
          border: 1px solid rgba(148, 134, 109, 0.25);
          box-shadow: 0 6px 24px rgba(64, 51, 28, 0.12);
        }
        .bri-modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          gap: 12px;
        }
        .bri-modal-head h2 {
          margin: 0;
          font-size: 18px;
          color: #2c2417;
          line-height: 1.35;
        }
        .bri-close {
          background: transparent;
          border: none;
          font-size: 24px;
          color: #8a7c61;
          cursor: pointer;
          line-height: 1;
          padding: 0 4px;
        }
        .bri-crumb {
          font-size: 12.5px;
          color: #6b5f47;
          margin-bottom: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }
        .bri-back {
          background: transparent;
          border: none;
          color: #1e3a5f;
          font-size: 12px;
          cursor: pointer;
          padding: 2px 4px;
        }
        .bri-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .bri-list-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
          gap: 8px;
        }
        .bri-list-item {
          padding: 13px 14px;
          background: #f6f1e6;
          border: 1px solid rgba(148, 134, 109, 0.3);
          border-radius: 10px;
          font-size: 15px;
          font-weight: 600;
          color: #2c2417;
          cursor: pointer;
          text-align: left;
        }
        .bri-list-grid .bri-list-item {
          text-align: center;
        }
        .bri-list-item:hover {
          background: #ede4d2;
        }
        .bri-loading {
          padding: 24px;
          text-align: center;
          color: #6b5f47;
        }
        .bri-pin-note {
          margin: 6px 0 14px;
          font-size: 13.5px;
          color: #4f4530;
          line-height: 1.6;
        }
        .bri-field-label {
          display: block;
          font-size: 12.5px;
          color: #6b5f47;
          margin-bottom: 6px;
          margin-top: 6px;
          font-weight: 600;
        }
        .bri-pin-input {
          width: 100%;
          padding: 14px 16px;
          font-size: 24px;
          letter-spacing: 14px;
          text-align: center;
          font-weight: 600;
          background: #fff;
          border: 1.5px solid #d8cdb4;
          border-radius: 12px;
          outline: none;
          margin-bottom: 12px;
          color: #2c2417;
          box-sizing: border-box;
        }
        .bri-pin-input:focus {
          border-color: #1e3a5f;
        }
        .bri-cta-full {
          width: 100%;
          padding: 12px;
          font-size: 15px;
        }
        .bri-cta-full:disabled {
          background: #c8b99d;
          color: #fff;
          cursor: not-allowed;
        }
        .bri-secondary {
          width: 100%;
          margin-top: 10px;
          padding: 10px;
          background: transparent;
          color: #4f4530;
          border: 1px solid #d8cdb4;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
        }
        .bri-secondary:hover {
          background: #f6f1e6;
        }
        .bri-error {
          margin-top: 12px;
          padding: 10px 12px;
          background: #fbeee6;
          border: 1px solid #e7c8b1;
          border-radius: 10px;
          color: #8a3a16;
          font-size: 13px;
          line-height: 1.55;
          white-space: pre-line;
        }
      `}</style>
    </>
  );
}
