import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/components/SearchClient";
import { COURT_BY_ID } from "@/lib/courts";
import {
  getCourtHearings,
  getHearingsMeta,
  getHighlightsData,
} from "@/lib/data-server";
import { formatSyncedAt } from "@/lib/date";

export const metadata: Metadata = {
  title: "找庭｜篩選全台法院公開庭期",
  description:
    "依法院、日期（西元與民國對照）、案件類別、庭類（審理／言詞辯論／準備程序／宣判）與國民法官案件快速篩選可旁聽庭期。",
};

interface SearchPageProps {
  searchParams: Promise<{ court?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const requestedCourt = (params.court || "TPD").toUpperCase();
  const initialCourtId = COURT_BY_ID[requestedCourt] ? requestedCourt : "TPD";

  const [meta, highlights, courtFile] = await Promise.all([
    getHearingsMeta(),
    getHighlightsData(),
    getCourtHearings(initialCourtId),
  ]);

  if (!meta || !highlights) {
    return (
      <div className="rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center">
        <p className="text-base font-semibold text-[var(--ink)]">
          尚未同步庭期資料，請先執行 <code>bun run sync</code>。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="legal-rule-bottom space-y-1.5 pb-4">
        <h1 className="font-editorial text-2xl font-semibold text-[var(--ink)] sm:text-3xl">
          找可旁聽的庭
        </h1>
        <p className="text-sm text-[var(--ink-secondary)]">
          涵蓋全台 {meta.courts.length} 所主要法院未來 14 天公開庭期 · 資料同步於{" "}
          {formatSyncedAt(meta.syncedAt)}
        </p>
      </header>

      <Suspense
        fallback={
          <div className="rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--ink-secondary)]">
            載入篩選介面中…
          </div>
        }
      >
        <SearchClient
          meta={meta}
          highlights={highlights}
          initialCourtId={initialCourtId}
          initialHearings={courtFile?.hearings ?? []}
        />
      </Suspense>
    </div>
  );
}
