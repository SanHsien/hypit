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


## 2026-09-30: 上游 v0.2.16 審查（v0.2.13–v0.2.16）

範圍：`5a568f4`（v0.2.12）→ `557497b`（tag `v0.2.16`）共 19 commit；PR `#339`–`#373`（20 筆）；issue `#338`–`#374`（17 筆）。release 軌，不審查 tag 之後的 commit。

**採納方式**：本 fork 是 clean-init 歷史，與上游沒有共同祖先，`git merge` 不可行，一律以 `git cherry-pick -x` 逐筆移植（保留原作者與來源 SHA）。只採納「明確的缺陷修復、有單元測試、可乾淨套用、本機 Windows 閘門全綠」者；其餘記為 adoption pending。Baseline 代表已審查，不代表全部已合併。

### Commit（19 筆）

| 決策 | Commit | 說明 |
| --- | --- | --- |
| adopt（4） | `ecf69e4` -> `c19a09a9`（#347）、`7e03b01` -> `164c09de`（#345）、`59d5e29` -> `d29f941a`（#339）、`32baae6` -> `8ead4d76`（#361） | 專輯封面誤判為影片、vocabulary 缺漏內建 package、NTSC 混音時長取整、`packages status` 解析；各自附測試、互不相依 |
| adoption pending（6） | `465bef7`（#342）、`66a3529`／`78d7436`（#349）、`9ac471d`（#353）、`089c39a`、`c80e513` | `465bef7` 改變輸出色彩空間，需實際 render 驗證；OAuth 兩筆需真實 HypiHub 登入驗證；`9ac471d` 是 Studio 新功能；`089c39a` 為 79 檔效能重構、`c80e513` 是其測試相依（動 `package.json`／lockfile）；併同 v0.2.9–v0.2.12 待決項一次評估 |
| not-applicable（9） | `238fe97` `2acc41c` `8a3af4f` `557497b`（版號）、`9c9918d` `33fb1a1` `2c32005`（微信群 QR）、`2c7fefd`（README 圖例）、`453be6c`（上游文件站連結） | 版務與上游社群／行銷素材；本 fork 已移除 QR 與第三方推廣區塊 |

### Pull requests（20 筆）

| 決策 | PR | 說明 |
| --- | --- | --- |
| adopt（4） | #339 #345 #347 #361 | 見上表 |
| adoption pending（3） | #342 #349 #353 | 上游已合併；理由見上表 |
| follow-upstream（8） | #348 #355 #363 #370 #371 #373（open 的修復）、#358 #364（新 Provider） | 上游尚未合併；待其合併或隨 release 帶入。#358／#364 為新功能，非缺陷 |
| not-applicable（5） | #341（文件連結）、#351（已關閉未合併）、#356（合作夥伴 RevShare）、#357（Manim 範例）、#362（上游 CI pin） | 行銷、範例或上游專屬 CI |

### Issues（17 筆）

| 決策 | Issue | 說明 |
| --- | --- | --- |
| resolved by adopted fix（3） | #338 #344 #346 | 分別由 #339、#345、#347 修復 |
| follow-upstream（7） | #343 #354（無修復／對應 open PR #355）、#366 #367 #368 #369 #374 | `-autorotate` 與 ffmpeg 6.x、Timeline 精確幀預檢；HypiHub 402／目錄不可達屬託管服務行為，對應修復 #370／#371 尚未合併 |
| monitor（2） | #360 #372 | 回報版本 0.2.15（0.2.13 正常）的 Caption／frame animation 回歸；本 fork 未取 `089c39a`，未受影響，取該重構前須先確認 |
| not-applicable（5） | #340 #350 #352 #359 #365 | 文件連結、MuAPI Provider 請求（已關閉）、使用問答、訂閱服務、社群群組詢問 |

**水位**：`reviewed_release=v0.2.16`、`reviewed_through=557497b32a6658067c11bf924c7511e61c61df4e`、`reviewed_pr_through=373`、`reviewed_issue_through=374`、`reviewed_date=2026-09-30`。


## 2026-09-30: 依賴安全升級（Dependabot）

範圍：前端 `pnpm-lock.yaml` 與 `services/whisperx/uv.lock`。原則同前：只在依賴方要求的主版內升級，`overrides` 一律用 `^` 限主版。

**已升級**

- `hono` 4.12.32 -> 4.13.12：`@hyperframes/*` 把它固定為 4.12.32，修補版是 4.12.34／4.13.5，因此在 `pnpm-workspace.yaml` 以 `overrides` 鎖 `^4.13.5`。
- `vite`（vitepress 用的那份）5.4.21 -> 6.4.3：vitepress 1.6.4 要求 `vite ^5.4.14`，5.x 沒有修補版，以 `overrides` 的 `vitepress>vite: ^6.4.3` 換到 6.x 的修補版。`pnpm docs:build` 通過。直接依賴的 `vite` 8.2.2 不受影響。
- `esbuild`：0.21.5（隨 vite 5 移除）與 0.27.7 -> 0.28.2。0.27.7 由 `tsx` 4.21.0（`esbuild ~0.27.0`）帶入，故 `tsx` 升到 4.23.15（同為 4.x，`esbuild ~0.28.0`）；`packages/provider-hyperframes-local` 同步。0.25.12 不在影響範圍。
- `urllib3` 2.7.0 -> 2.8.0（`uv lock --upgrade-package`，同主版，只動這一個套件）。
- `lightning`／`pytorch-lightning` 2.6.5 -> 2.6.6（`uv lock --upgrade-package`），只動這兩個套件；`pnpm test:whisperx-service` 18 項通過。Dependabot PR #1 同時降級 `onnxruntime` 並新增 `coloredlogs`／`humanfriendly`，未合併，由本次提交取代後關閉。

**延後**

| 套件 | 現在 | 修補版 | 延後原因 | 觸發條件 |
| --- | --- | --- | --- | --- |
| `torch` | 2.8.0 | 2.9.1／2.10.0／2.13.0 | `whisperx 3.8.6` 要求 `torch ~=2.8.0`、`torchaudio ~=2.8.0`、`torchvision ~=0.23.0`、`torchcodec <0.8`，任何修補版都會與之衝突 | 上游 `whisperx` 放寬 torch 上限 |
| `transformers` | 4.57.6 | 5.x（4.x 無修補版） | 5.x 需要 `huggingface-hub >=1.5`，`whisperx 3.8.6` 要求 `huggingface-hub <1.0`，`uv lock` 無解；且是主版升級，需實跑對齊模型才能驗 | 上游 `whisperx` 放寬 `huggingface-hub`，且能在本機實跑對齊 |
| `nltk` | 3.10.3 | 無修補版（GHSA-8mgp-746c-j5xp） | 無可升版本；警示保持開啟，不 dismiss | 上游釋出修補版 |

`nltk` 可達性：弱點在 `TransitionParser`、`AveragedPerceptron`、`PerceptronTagger.save_to_json`、`save_maxent_params` 的模型讀寫，且僅在啟用 `pathsec` 時才構成沙箱繞過。`whisperx` 只用 `nltk.data.load('tokenizers/punkt_tab/...')` 載入斷句器，本服務只設定 `nltk.data.path`，兩者都不呼叫上述 API。
