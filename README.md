# 旁聽小幫手 (`tw-court-watch`)

現代化、手機優先的台灣法院旁聽查詢入口與本機觀庭筆記工具（Next.js + TypeScript + Tailwind CSS v4）。

目標：讓一般人 **3 分鐘內找到今天或這週值得旁聽的公開庭期**，看懂庭類（審理／言詞辯論 vs 準備程序 vs 宣判）、確認正確院區地址與當日開庭進度，並能在旁聽後用本機私密筆記記錄重點、匯出 Markdown／JSON。

> 非司法院官方網站。庭期資料僅供參考，以法院實際開庭通知單與現場公告為準；法庭內嚴禁錄音、錄影、拍照。

## 功能特色

- **全台 38 所主要法院靜態同步**：透過 [`scripts/sync-hearings.ts`](scripts/sync-hearings.ts) 與 GitHub Actions（[`.github/workflows/sync-hearings.yml`](.github/workflows/sync-hearings.yml)）每日 2 次（06:30 / 18:30 台灣時間）低頻同步未來 14 天公開庭期。
- **自動濾除不公開與調解庭期**：依字別、庭類、法庭名稱與敏感案由自動濾除家事、少年、調解／調解室、協商及不公開審理庭期，並在 `/about` 透明呈現統計。
- **新手友善的庭類解說與國民法官專區**：區分「審理／言詞辯論（新手推）」、「準備程序」與「宣判（快閃約 1 分鐘）」，並直接提供全台國民法官（`國審*`）專區。
- **西元／民國雙曆對照**：所有日期皆同時顯示西元與民國年，並支援直接輸入 `2026-11-20` 或 `1151120`。
- **院區地址對應**：依實際法庭前綴對應正確院區（例如臺北地院本院博愛路 vs 臺北簡易庭重慶南路）。
- **我的清單與本機觀庭筆記**：收藏庭期、單筆／整批下載 `.ics` 行事曆、撰寫私密本機筆記（`localStorage`，含疑似個資提醒與 Markdown／JSON 匯出，無任何錄音錄影上傳入口）。

## 開發指令

```bash
bun install

# 同步全台 38 所主要法院未來 14 天庭期
bun run sync

# 快速測試同步 5 大地院未來 7 天
bun run sync:quick

# 本機開發
bun run dev

# 單元測試與型別檢查
bun test
bun run typecheck
bun run build
```

## 文件

- [`docs/original-spec.md`](docs/original-spec.md) — 原始規格草案
- [`docs/spec-review.md`](docs/spec-review.md) — 實測 `csdi3.judicial.gov.tw` 後的規格審查與勘誤
