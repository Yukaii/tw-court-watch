"use client";

import { AlertTriangle, Check, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getTaipeiTodayIso } from "@/lib/date";
import { detectNotePiiWarnings } from "@/lib/filter";
import { getPersonalNoteById, upsertPersonalNote } from "@/lib/storage";
import type { Hearing } from "@/lib/types";

const SUGGESTED_TAGS = [
  "審理",
  "言詞辯論",
  "準備程序",
  "宣判",
  "國民法官",
  "證人詰問",
  "新手友善",
];

interface NoteFormClientProps {
  initialHearing: Hearing | null;
  editNoteId?: string | null;
}

export function NoteFormClient({
  initialHearing,
  editNoteId,
}: NoteFormClientProps) {
  const router = useRouter();
  const today = getTaipeiTodayIso();

  const [courtName, setCourtName] = useState(
    initialHearing?.courtName ?? "",
  );
  const [courtroom, setCourtroom] = useState(initialHearing?.courtroom ?? "");
  const [caseNo, setCaseNo] = useState(initialHearing?.caseNo ?? "");
  const [date, setDate] = useState(initialHearing?.date ?? today);
  const [attendedAt, setAttendedAt] = useState(initialHearing?.date ?? today);
  const [dukd, setDukd] = useState(initialHearing?.dukd ?? "");
  const [reason, setReason] = useState(initialHearing?.reason ?? "");
  const [summary, setSummary] = useState("");
  const [rulesMemo, setRulesMemo] = useState("");
  const [tags, setTags] = useState<string[]>(() => {
    const init: string[] = [];
    if (initialHearing?.dukd) init.push(initialHearing.dukd);
    if (initialHearing?.isLayJudge) init.push("國民法官");
    return init;
  });
  const [clarity, setClarity] = useState<number | null>(null);
  const [friendliness, setFriendliness] = useState<number | null>(null);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editNoteId) return;
    const existing = getPersonalNoteById(editNoteId);
    if (!existing) return;
    setCourtName(existing.courtName);
    setCourtroom(existing.courtroom);
    setCaseNo(existing.caseNo);
    setDate(existing.date);
    setAttendedAt(existing.attendedAt);
    setDukd(existing.dukd ?? "");
    setReason(existing.reason ?? "");
    setSummary(existing.summary);
    setRulesMemo(existing.rulesMemo);
    setTags(existing.tags);
    setClarity(existing.clarity);
    setFriendliness(existing.friendliness);
    setWouldRecommend(existing.wouldRecommend);
  }, [editNoteId]);

  const piiWarnings = useMemo(
    () => detectNotePiiWarnings(`${summary}\n${rulesMemo}`),
    [summary, rulesMemo],
  );

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtName.trim()) {
      setError("請填寫法院名稱。");
      return;
    }
    if (summary.trim().length < 20) {
      setError("請至少輸入 20 字以上的程序與觀察摘要。");
      return;
    }

    const saved = upsertPersonalNote({
      id: editNoteId ?? undefined,
      hearingId: initialHearing?.id ?? null,
      crtid: initialHearing?.crtid,
      courtName: courtName.trim(),
      courtroom: courtroom.trim() || "未填寫法庭",
      caseNo: caseNo.trim() || "未填寫案號",
      date,
      time: initialHearing?.time,
      dukd: dukd.trim() || undefined,
      reason: reason.trim() || undefined,
      attendedAt,
      summary: summary.trim(),
      tags,
      clarity,
      friendliness,
      wouldRecommend,
      rulesMemo: rulesMemo.trim(),
    });

    router.push(`/notes/${saved.id}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Privacy & legal red-line box */}
      <div className="rounded-[2px] border-l-2 border-[var(--seal-text)] bg-[var(--bg-alert)] p-4 text-sm text-[var(--ink-body)]">
        <div className="flex items-start gap-2.5">
          <ShieldAlert
            className="mt-0.5 h-5 w-5 shrink-0 text-[var(--seal-text)]"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="font-semibold text-[var(--seal-text)]">
              觀庭筆記寫作紅線與隱私提醒
            </p>
            <ul className="list-disc space-y-0.5 pl-4 text-xs leading-relaxed text-[var(--ink-body)]">
              <li>
                本筆記<strong className="text-[var(--ink)]">僅儲存在你的瀏覽器本機</strong>，不會上傳伺服器；若未來匯出分享，請務必自行檢查。
              </li>
              <li>
                <strong className="text-[var(--ink)]">禁止</strong>記錄當事人／證人全名、地址、電話、身分證字號或任何未成年人資訊。
              </li>
              <li>
                <strong className="text-[var(--ink)]">禁止</strong>錄音、錄影、拍照（本工具不提供任何影音上傳入口），亦請勿還原逐字證詞或對個人做人身攻擊。
              </li>
              <li>
                下方星等僅記錄<strong className="text-[var(--ink)]">程序易懂度與旁聽動線友善度</strong>，非對法官個人之評價。
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hearing context */}
      <div className="grid gap-4 rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="note-court"
            className="block text-sm font-medium text-[var(--ink-body)]"
          >
            法院名稱 <span className="text-[var(--seal-text)]">*</span>
          </label>
          <input
            id="note-court"
            type="text"
            value={courtName}
            onChange={(e) => setCourtName(e.target.value)}
            placeholder="例如：臺灣臺北地方法院"
            className="mt-1 w-full rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--robe-text)] focus:bg-[var(--bg-surface)] focus:outline-none"
            required
          />
        </div>

        <div>
          <label
            htmlFor="note-room"
            className="block text-sm font-medium text-[var(--ink-body)]"
          >
            法庭
          </label>
          <input
            id="note-room"
            type="text"
            value={courtroom}
            onChange={(e) => setCourtroom(e.target.value)}
            placeholder="例如：第11法庭"
            className="mt-1 w-full rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--robe-text)] focus:bg-[var(--bg-surface)] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="note-caseno"
            className="block text-sm font-medium text-[var(--ink-body)]"
          >
            案號
          </label>
          <input
            id="note-caseno"
            type="text"
            value={caseNo}
            onChange={(e) => setCaseNo(e.target.value)}
            placeholder="例如：115年度訴字第123號"
            className="mt-1 w-full rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--robe-text)] focus:bg-[var(--bg-surface)] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="note-date"
            className="block text-sm font-medium text-[var(--ink-body)]"
          >
            開庭日期
          </label>
          <input
            id="note-date"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setAttendedAt(e.target.value);
            }}
            className="mt-1 w-full rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--robe-text)] focus:bg-[var(--bg-surface)] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="note-dukd"
            className="block text-sm font-medium text-[var(--ink-body)]"
          >
            庭類
          </label>
          <input
            id="note-dukd"
            type="text"
            value={dukd}
            onChange={(e) => setDukd(e.target.value)}
            placeholder="例如：審理、言詞辯論、準備程序"
            className="mt-1 w-full rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--robe-text)] focus:bg-[var(--bg-surface)] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="note-reason"
            className="block text-sm font-medium text-[var(--ink-body)]"
          >
            案由
          </label>
          <input
            id="note-reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="例如：侵權行為損害賠償、詐欺"
            className="mt-1 w-full rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--robe-text)] focus:bg-[var(--bg-surface)] focus:outline-none"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <p className="text-sm font-medium text-[var(--ink)]">
          程序標籤（可多選）
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {SUGGESTED_TAGS.map((tag) => {
            const active = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`inline-flex items-center gap-1 rounded-[2px] border px-3 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "border-[var(--robe)] bg-[var(--robe)] text-[#fcfbf8]"
                    : "border-[var(--rule)] bg-[var(--bg-paper)] text-[var(--ink-body)] hover:bg-[var(--bg-tint)]"
                }`}
              >
                {active && <Check className="h-3 w-3" aria-hidden="true" />}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main summary & rules memo */}
      <div className="space-y-4 rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <div>
          <label
            htmlFor="note-summary"
            className="block text-sm font-medium text-[var(--ink)]"
          >
            程序與觀察摘要 <span className="text-[var(--seal-text)]">*</span>
          </label>
          <p className="mt-0.5 text-xs text-[var(--ink-secondary)]">
            建議寫開庭流程順序、爭點脈絡、雙方主張重點與你的觀察（建議 100–1000 字，勿寫當事人全名）。
          </p>
          <textarea
            id="note-summary"
            rows={7}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="例如：今天上午進行言詞辯論，檢察官先陳述起訴要旨，辯護人針對證據能力提出意見……"
            className="mt-2 w-full rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-paper)] px-3 py-2.5 text-sm leading-relaxed text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--robe-text)] focus:bg-[var(--bg-surface)] focus:outline-none"
            required
          />
          <p className="mt-1 text-right font-tabular text-xs text-[var(--ink-muted)]">
            目前 {summary.trim().length} 字
          </p>
        </div>

        <div>
          <label
            htmlFor="note-rules"
            className="block text-sm font-medium text-[var(--ink)]"
          >
            現場動線與實務提醒（選填）
          </label>
          <textarea
            id="note-rules"
            rows={3}
            value={rulesMemo}
            onChange={(e) => setRulesMemo(e.target.value)}
            placeholder="例如：安檢排隊約 5 分鐘、旁聽席約 20 個座位、麥克風音量清楚……"
            className="mt-1.5 w-full rounded-[2px] border border-[var(--border-medium)] bg-[var(--bg-paper)] px-3 py-2 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:border-[var(--robe-text)] focus:bg-[var(--bg-surface)] focus:outline-none"
          />
        </div>

        {piiWarnings.length > 0 && (
          <div className="rounded-[2px] border border-[var(--seal-text)]/45 bg-[var(--bg-alert)] p-3 text-xs text-[var(--seal-text)]">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>疑似個資提醒</span>
            </div>
            <ul className="mt-1 list-disc pl-5 text-[var(--ink-body)]">
              {piiWarnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Process experience ratings (explicitly NOT judge ratings) */}
      <div className="space-y-4 rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <div>
          <p className="text-sm font-semibold text-[var(--ink)]">
            旁聽體驗紀錄（選填，僅記錄程序與指引，非評價個人）
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-[var(--ink-secondary)]">
              程序是否清楚易懂（1–5）
            </p>
            <div className="mt-1.5 flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setClarity(clarity === n ? null : n)}
                  className={`h-9 w-9 rounded-[2px] border font-tabular text-sm font-semibold transition-colors ${
                    clarity === n
                      ? "border-[var(--robe)] bg-[var(--robe)] text-[#fcfbf8]"
                      : "border-[var(--rule)] bg-[var(--bg-paper)] text-[var(--ink-body)] hover:bg-[var(--bg-tint)]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[var(--ink-secondary)]">
              現場旁聽指引友善度（1–5）
            </p>
            <div className="mt-1.5 flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFriendliness(friendliness === n ? null : n)}
                  className={`h-9 w-9 rounded-[2px] border font-tabular text-sm font-semibold transition-colors ${
                    friendliness === n
                      ? "border-[var(--robe)] bg-[var(--robe)] text-[#fcfbf8]"
                      : "border-[var(--rule)] bg-[var(--bg-paper)] text-[var(--ink-body)] hover:bg-[var(--bg-tint)]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-[var(--ink-secondary)]">
            這類庭適合推薦給第一次旁聽的人嗎？
          </p>
          <div className="mt-1.5 flex gap-2">
            {[
              { label: "推薦新手", val: true },
              { label: "較進階／暫不推薦", val: false },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() =>
                  setWouldRecommend(wouldRecommend === opt.val ? null : opt.val)
                }
                className={`rounded-[2px] border px-3 py-1.5 text-xs font-medium transition-colors ${
                  wouldRecommend === opt.val
                    ? "border-[var(--robe)] bg-[var(--robe)] text-[#fcfbf8]"
                    : "border-[var(--rule)] bg-[var(--bg-paper)] text-[var(--ink-body)] hover:bg-[var(--bg-tint)]"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-[2px] border border-[var(--seal-text)]/45 bg-[var(--bg-alert)] px-3.5 py-2.5 text-sm font-medium text-[var(--seal-text)]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-formal-primary">
          儲存到本機筆記
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-formal-secondary"
        >
          取消
        </button>
      </div>
    </form>
  );
}
