# 旁聽小幫手 (`tw-court-watch`)

線上網站：[https://court.yukai.dev](https://court.yukai.dev)

協助一般民眾在 3 分鐘內查詢臺灣主要法院公開庭期的非官方旁聽索引與本機觀庭筆記工具（Next.js 15 + TypeScript + Tailwind CSS v4 + MapLibre GL JS）。

> 非司法院官方網站。庭期資料僅供參考，以法院實際開庭通知單與現場公告為準；家事、少年、調解及依法不公開審理案件不得旁聽；法庭內嚴禁錄音、錄影、拍照。

## 功能特色

- **全台 38 所主要法院靜態同步**：透過 [`scripts/sync-hearings.ts`](scripts/sync-hearings.ts) 與 GitHub Actions（[`.github/workflows/sync-hearings.yml`](.github/workflows/sync-hearings.yml)）每日 2 次（06:30 / 18:30 臺灣時間）低頻同步未來 14 天公開庭期。
- **依系統時間顯示即時開庭狀態**：於瀏覽器端自動對照臺灣時間顯示「開庭中」、「即將開庭／X 分後開庭」與「已過表定時間」，並優先呈現進行中與尚未開庭之場次。
- **互動式法院地圖與最近法院定位**：使用 MapLibre GL JS 與自訂司法公報風格向量圖資（OpenFreeMap），可開啟定位計算直線距離找出離你最近的法院，或依區域快速切換查看全台 38 所主要法院與院區交通資訊。
- **行事曆訂閱與單場匯出（RFC 5545 `.ics`）**：支援透過 `/api/calendar.ics` 一鍵訂閱「全台國民法官」、「精選審理庭」或「單一法院」至 Google 日曆、Apple 行事曆或 Outlook，亦可下載單場或整批 `.ics` 檔。
- **自動濾除不公開與調解庭期**：依字別、庭類、法庭名稱與敏感案由自動濾除家事、少年、調解／調解室、協商及不公開審理庭期，並在 `/about` 透明呈現統計。
- **新手友善的庭類解說、雙曆對照與院區對應**：區分「審理／言詞辯論」、「準備程序」與「宣判」，全站採西元／民國雙曆對照（支援輸入 `2026-11-20` 或 `1151120`），並依實際法庭前綴對應正確院區（例如臺北地院博愛路本院 vs 臺北簡易庭重慶南路）。
- **我的清單與本機私密觀庭筆記**：收藏庭期與撰寫私密本機筆記皆僅儲存在瀏覽器 `localStorage`，內建疑似個資提醒與 Markdown／JSON 匯出，無任何錄音錄影上傳功能。

## 靈感與致謝

本專案發想與旁聽入門守則整理參考自法律百科 [`@legispedia_tw` 於 Threads 分享的法院旁聽指南貼文](https://www.threads.com/@legispedia_tw/post/DO3XNWvD8ku)。

## 開發與測試

```bash
bun install

# 同步全台 38 所主要法院未來 14 天庭期
bun run sync

# 快速測試同步 5 大地院未來 7 天
bun run sync:quick

# 本機開發
bun run dev

# 單元測試、型別檢查與建置
bun test
bun run typecheck
bun run build
```

## 相關文件

- [`docs/original-spec.md`](docs/original-spec.md) — 原始規格草案
- [`docs/spec-review.md`](docs/spec-review.md) — 實測 `csdi3.judicial.gov.tw` 後的規格審查與勘誤

## 授權條款

本專案採 [MIT License](LICENSE) 釋出。
