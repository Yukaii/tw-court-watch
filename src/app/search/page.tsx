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
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <p className="text-base font-semibold text-stone-800">
          尚未同步庭期資料，請先執行 <code>bun run sync</code>。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          找可旁聽的庭
        </h1>
        <p className="text-sm text-stone-500">
          涵蓋全台 {meta.courts.length} 所主要法院未來 14 天公開庭期 · 資料同步於{" "}
          {formatSyncedAt(meta.syncedAt)}
        </p>
      </header>

      <Suspense
        fallback={
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
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
