# Fork 決策紀錄 (DECISIONS.md)

本文件記錄本 fork 相對於上游的所有架構決策、取捨與已審核變更。

## 2026-09-19: Fork 建立與 Windows 開發環境初始化

- **背景**：Fork `hypit-ai/hypit`，建立 Windows-first 治理與自動化驗證機制。
- **基準版本**：`v0.2.7` (Commit: `a45224c32da6e25bd641e403920ab17d48838417`)。
- **治理決策**：
  1. 對外只打主人的 repo（`SanHsien/hypit`），嚴禁自動向上游開 PR 或 push。
  2. 建立 `tools/dev_check.ps1`，包含 TypeScript 型別檢查、單元測試套件與上游更新查驗。
  3. 發現 Node.js v26 環境下 `NODE_NO_WARNINGS=1` 可避免 `module.register()` 的 stderr deprecation warning 干擾子程序 stderr 嚴格斷言。
  4. 建立每週自動執行的 `upstream-check.yml`，對齊 `paulsha-cortex` 與 `cangjie-skill` 的上游查驗水位線架構。


## 2026-09-19: 合併 upstream v0.2.8 release

- **版本與 Commit**：`v0.2.8` (`168c537c4f48e48e1919beb8661cfa4d2b13336f`)。
- **改動重點**：`fix(seedance): require visual reference classification for 0.2.8`。更新 Seedance 參考圖類型分類與文檔範例。
- **審核決策**：乾淨合併至本 fork main。更新 upstream_baseline.json 水位線為 v0.2.8。


## 2026-09-19: 語系繁體化與上游 PR/Issue 評估

### 1. 繁體中文與語系重整
- **README 重構**：
  - `README.md` 改以繁體中文（台灣習慣用詞）為主，翻譯自原簡體中文版。
  - 保留英文版為 `README.en.md`，並於頂部語言切換連結雙向對齊。
  - 刪除簡體中文版 `README.zh-CN.md` 與 `CONTRIBUTING.zh-CN.md`。
  - `package.json` 與 `scripts/pack-distribution.mjs` 移除對 `README.zh-CN.md` 的打包依賴。
- **去除上游行銷與外部服務宣傳**：
  - 移除 Trendshift 等第三方非開源徽章。
  - 移除上游 Discord、Telegram、X/Twitter 官方帳號、微信群 QR 碼、Launch 夥伴商業合作牆、Star History 與 Contrib.rocks。
  - 保留完整 Fork Credit 與來源致敬（`hypit-ai/hypit`，MIT License）。
- **文件繁體化**：
  - 將 `docs/zh/`、`skills/hypit/`、`examples/` 等所有繁中與文件說明全面轉為標準繁體中文。
  - 核心測試套件維持原始斷言與國際化相容性。

### 2. 上游待合併分支 (codex/*) 評估處理
- **已合併分支確認**：
  - `codex/credential-management-portability`, `codex/local-render-browser`, `codex/publish-september-production-20260919`, `codex/release-0.2.7`, `codex/script-display-0.2` 已由上游正式合併進 main。
- **未合併/歷史分支評估**：
  - `codex/diagnose-windows-replace`：為 v0.2.2 期間的上游 Windows 測試診斷實驗分支，包含針對已被重構模組之測試，不宜直接合併至目前已是 v0.2.8 的 main 分支。已自 origin 清理，只保留 main。
  - `codex/repair-request-and-local-io`, `codex/issue-bot-gh-aw`, `codex/fix-analysis-runner-context`：在上游已透過 Squash/Rebase 方式納入主線（PR #278, #273, #279）。
  - **結論**：本 fork 嚴格遵循只保留 `main`、最新 Release 與 Tag `v0.2.8` 之原則，清理所有冗餘遠端分支。

### 3. 上游 Open PR 與 Issue 審核
- **PR #318 (fix: preserve still frame domains across frame rates)** 與 **Issue #316**：
  - 評估：修復 `executeRenderStillVideo` 在特定幀率下的 timebase 設定，為合理 bugfix，但目前 upstream CI 仍在評審討論階段，待上游發布 v0.2.9 時再隨 Release 基準統一納入。
- **PR #317 (fix: preserve AAC tail for non-integer frame rates)** 與 **Issue #315**：
  - 評估：移除 final mux 時的 `-frames:v` 限制以防 ffmpeg 丟棄末尾 AAC 音訊封包。暫緩引入，留待上游 release 週期。
- **PR #312, #313, #314 (WSL 與路徑邊界修復)** 與 **Issue #309, #310, #311**：
  - 評估：修復 WSL 環境下的 OAuth 與本機路徑限制，目前本 fork 主要在 Windows 原生 PowerShell 環境下驗收與運作，暫時不對核心程式碼打入未經上游測試認可的補丁，避免脫離上游主流維護線。

