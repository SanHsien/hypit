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


## 2026-09-21: 上游 v0.2.9–v0.2.12 release 與 PR/Issue 追加審核（僅 triage，不合併程式碼）

- **背景**：本次任務範圍明確要求不對上游做任何合併／寫入動作，僅完成逐筆 triage 記錄與水位線推進。因此本輪與先前「2026-09-19：合併 upstream v0.2.8 release」的處理方式不同——**19 個 commit（v0.2.9–v0.2.12）本次不執行 `git merge`**，改為記錄審核決策，待主人在後續對話明確同意後再實際合併。
- **上游最新 release**：`v0.2.12`（`5a568f4be485ab5e735fe95533cd5f77a85c66ee`）。

### Release commits（v0.2.9–v0.2.12，19 筆）

| Commit | 主題 | 決策 |
| --- | --- | --- |
| `62da67d` | fix(media-execution): preserve AAC tail for non-integer frame rates (#317) | 暫不採用，待主人決定。延續 2026-09-19 決策「待上游發布 v0.2.9 時再隨 Release 基準統一納入」；upstream 已發布，但本次任務範圍不合併程式碼，待主人授權後合併。 |
| `5d52f8d` | fix: treat snapshot HTML URLs like capture and reject invalid --studio bases (#323) | 暫不採用，待主人決定。Windows CLI 路徑/URL 解析 bugfix，未涉及本 fork 專屬骨架，待授權後合併。 |
| `247fdad` | fix(media-execution): preserve still frame domains across frame rates (#318) | 暫不採用，待主人決定。延續 2026-09-19 決策，同 `62da67d`。 |
| `8f1b91a` | feat(pixverse): add the C1 model and reference modes, and serve PixVerse on HypiHub (#326) | 暫不採用，待主人決定。新 Provider 功能擴充，非缺陷修復，需主人評估是否引入。 |
| `0336a6f` | chore(release): prepare @hypit/hypit 0.2.9 (#328) | 不適用。上游 release 版務 commit，非功能變更。 |
| `deb799b` | fix(studio): serve composition material in the ranges a media element asks for (#329) | 暫不採用，待主人決定。修正 Studio HTTP Range 支援缺陷，對應 issue #327，未涉及本 fork 專屬骨架。 |
| `9489535` | docs: add BeatAPI to the launch partners | 不適用。上游行銷/合作夥伴文件異動，本 fork 已移除第三方行銷連結區塊，不隨上游文件同步。 |
| `a2d13d5` | feat(beatapi): serve the installed video and image models on BeatAPI (#331) | 暫不採用，待主人決定。新 Provider 功能擴充，需主人評估。 |
| `e7a886c` | docs(providers): drop the portrait-material paragraph from the Monid and HiAPI READMEs | 不適用。上游 Provider README 文字異動，非功能變更。 |
| `46b882d` | chore(release): prepare @hypit/hypit 0.2.10 | 不適用。上游 release 版務 commit。 |
| `b85a707` | docs(zh): refresh WeChat group QR code | 不適用。上游社群行銷素材，本 fork 已移除微信群 QR 碼區塊，不同步。 |
| `1af179d` | docs: point the Watcha launch-partner links to the referral URL | 不適用。上游合作夥伴推廣連結，本 fork 不採用第三方行銷區塊。 |
| `56057fd` | fix(pixverse): render at 540p or 720p | 暫不採用，待主人決定。PixVerse Provider 輸出解析度修正，需主人評估是否引入。 |
| `d24583e` | docs: arrange Trendshift badges and add TypeScript weekly badge | 不適用。上游 README 徽章排版，本 fork 已移除 Trendshift 等第三方徽章。 |
| `802ecb4` | docs: point the BeatAPI launch-partner links to the referral sign-up URL | 不適用。上游合作夥伴推廣連結，同 `1af179d`。 |
| `636270f` | fix(providers): keep async jobs pending when a progress poll hits a transport error (#336) | 暫不採用，待主人決定。跨多個 Provider 的輪詢錯誤處理修正，具通用可靠性價值，待授權後評估合併。 |
| `5d257c5` | chore(release): prepare @hypit/hypit 0.2.11 | 不適用。上游 release 版務 commit。 |
| `ec6f208` | fix(endpoint-kit): share the poll error decision across asynchronous Providers (#337) | 暫不採用，待主人決定。`636270f` 的後續一般化重構，同一輪詢錯誤處理修正系列。 |
| `5a568f4` | chore(release): prepare @hypit/hypit 0.2.12 | 不適用。上游 release 版務 commit。 |

共 19 筆 commit，全數 triage 完畢；本次不執行 `git merge`。

### Pull Requests（逐筆，`reviewed_pr_through` 推進至 `#337`）

| PR | 決策 | 理由 |
| --- | --- | --- |
| [#322](https://github.com/hypit-ai/hypit/pull/322) | 暫不採用，待主人決定 | 對應 issue #319，修正 HyperFrames 在 Windows 下透過 PATHEXT 解析 ffmpeg cmd/bat shim 的問題——**Windows 相容性直接相關**，建議下次授權移植時優先評估。 |
| [#323](https://github.com/hypit-ai/hypit/pull/323) | 暫不採用，待主人決定 | 對應 issue #320，已隨 v0.2.9 併入 commit `5d52f8d`，見上表。 |
| [#324](https://github.com/hypit-ai/hypit/pull/324) | 暫不採用，待主人決定 | 對應 issue #321，修正 HyperFrames capture 在 work 目錄內以 `startsWith(work+sep)` 誤判暫存來源的問題，屬路徑處理缺陷修復，未涉及本 fork 專屬骨架。 |
| [#325](https://github.com/hypit-ai/hypit/pull/325) | 暫不採用，待主人決定 | Studio 播放改用共用 transport clock 取樣，一般性可靠性修正，需主人評估後合併。 |
| [#326](https://github.com/hypit-ai/hypit/pull/326) | 暫不採用，待主人決定 | 對應 commit `8f1b91a`，新 Provider 功能擴充，見上表。 |
| [#328](https://github.com/hypit-ai/hypit/pull/328) | 不適用 | Release 版務 PR，對應 commit `0336a6f`。 |
| [#329](https://github.com/hypit-ai/hypit/pull/329) | 暫不採用，待主人決定 | 對應 issue #327 與 commit `deb799b`，見上表。 |
| [#331](https://github.com/hypit-ai/hypit/pull/331) | 暫不採用，待主人決定 | 對應 commit `a2d13d5`，新 Provider 功能擴充，見上表。 |
| [#334](https://github.com/hypit-ai/hypit/pull/334) | 暫不採用，待主人決定 | 對應 issue #333，新增 Higgsfield Provider（Seedance 2.0/2.5），新功能提案，需主人評估是否引入。 |
| [#335](https://github.com/hypit-ai/hypit/pull/335) | 不適用 | 僅新增「reproducible renderer bug reporting」文件指引，不影響程式碼行為。 |
| [#336](https://github.com/hypit-ai/hypit/pull/336) | 暫不採用，待主人決定 | 對應 commit `636270f`，見上表。 |
| [#337](https://github.com/hypit-ai/hypit/pull/337) | 暫不採用，待主人決定 | 對應 commit `ec6f208`，見上表。 |

共 12 筆 PR，全數 triage 完畢。

### Issues（逐筆，`reviewed_issue_through` 推進至 `#333`）

| Issue | 決策 | 理由 |
| --- | --- | --- |
| [#319](https://github.com/hypit-ai/hypit/issues/319) | 暫不採用，待主人決定 | HyperFrames ffmpeg 查找忽略 Windows PATHEXT，導致 cmd/bat shim 無法被找到——**Windows 相容性直接相關**，本 fork Windows-first 維護宗旨下建議優先評估；對應 PR #322 已有修正，待主人授權後移植。 |
| [#320](https://github.com/hypit-ai/hypit/issues/320) | 暫不採用，待主人決定 | `hypit snapshot` 誤將 HTTPS:// HTML 判斷為本機路徑，且 `--studio` 缺 scheme 時拋出 TypeError；對應 PR #323／commit `5d52f8d`，已記錄於上表。 |
| [#321](https://github.com/hypit-ai/hypit/issues/321) | 暫不採用，待主人決定 | HyperFrames capture 的 `startsWith(work+sep)` 誤拒暫存於 work 根目錄內的來源檔案；對應 PR #324，待主人授權後移植。 |
| [#327](https://github.com/hypit-ai/hypit/issues/327) | 暫不採用，待主人決定 | Studio 素材路由宣告支援 byte range 卻回傳完整資源；對應 PR #329／commit `deb799b`，已記錄於上表。 |
| [#330](https://github.com/hypit-ai/hypit/issues/330) | 監控（monitor） | Render 加入圖片軌後導致跨 cue 字幕污染；目前上游尚無對應 PR 或已驗證修正，待上游釋出修正或主人授權獨立調查後再評估。 |
| [#333](https://github.com/hypit-ai/hypit/issues/333) | 暫不採用，待主人決定 | 請求新增 Higgsfield API Provider（Seedance 2.0/2.5）；對應 PR #334，新功能提案，需主人評估是否引入。 |

共 6 筆 issue，全數 triage 完畢。

- **水位推進**：`tools/upstream_baseline.json` 更新為 `reviewed_through=5a568f4be485ab5e735fe95533cd5f77a85c66ee`（`v0.2.12`）、`reviewed_pr_through=337`、`reviewed_issue_through=333`、`reviewed_date=2026-09-21`。**Git 工作樹本身未合併任何 v0.2.9–v0.2.12 上游程式碼**；下次由主人明確同意後，可依本輪逐筆決策執行實際合併。
