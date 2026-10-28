# Fork 決策紀錄 (DECISIONS.md)

本文件記錄本 fork 相對於上游的所有架構決策、取捨與已審核變更。

## 2026-09-19: Fork 建立與 Windows 開發環境初始化

- **背景**：Fork `hypit-ai/hypit`，建立 Windows-first 治理與自動化驗證機制。
- **基準版本**：`v0.2.7` (Commit: `a45224c32da6e25bd641e403920ab17d48838417`)。
- **治理決策**：
  1. 對外只打維護者的 repo（`SanHsien/hypit`），嚴禁自動向上游開 PR 或 push。
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

- **背景**：本次任務範圍明確要求不對上游做任何合併／寫入動作，僅完成逐筆 triage 記錄與水位線推進。因此本輪與先前「2026-09-19：合併 upstream v0.2.8 release」的處理方式不同——**19 個 commit（v0.2.9–v0.2.12）本次不執行 `git merge`**，改為記錄審核決策，待維護者在後續對話明確同意後再實際合併。
- **上游最新 release**：`v0.2.12`（`5a568f4be485ab5e735fe95533cd5f77a85c66ee`）。

### Release commits（v0.2.9–v0.2.12，19 筆）

| Commit | 主題 | 決策 |
| --- | --- | --- |
| `62da67d` | fix(media-execution): preserve AAC tail for non-integer frame rates (#317) | 暫不採用，待維護者決定。延續 2026-09-19 決策「待上游發布 v0.2.9 時再隨 Release 基準統一納入」；upstream 已發布，但本次任務範圍不合併程式碼，待維護者授權後合併。 |
| `5d52f8d` | fix: treat snapshot HTML URLs like capture and reject invalid --studio bases (#323) | 暫不採用，待維護者決定。Windows CLI 路徑/URL 解析 bugfix，未涉及本 fork 專屬骨架，待授權後合併。 |
| `247fdad` | fix(media-execution): preserve still frame domains across frame rates (#318) | 暫不採用，待維護者決定。延續 2026-09-19 決策，同 `62da67d`。 |
| `8f1b91a` | feat(pixverse): add the C1 model and reference modes, and serve PixVerse on HypiHub (#326) | 暫不採用，待維護者決定。新 Provider 功能擴充，非缺陷修復，需維護者評估是否引入。 |
| `0336a6f` | chore(release): prepare @hypit/hypit 0.2.9 (#328) | 不適用。上游 release 版務 commit，非功能變更。 |
| `deb799b` | fix(studio): serve composition material in the ranges a media element asks for (#329) | 暫不採用，待維護者決定。修正 Studio HTTP Range 支援缺陷，對應 issue #327，未涉及本 fork 專屬骨架。 |
| `9489535` | docs: add BeatAPI to the launch partners | 不適用。上游行銷/合作夥伴文件異動，本 fork 已移除第三方行銷連結區塊，不隨上游文件同步。 |
| `a2d13d5` | feat(beatapi): serve the installed video and image models on BeatAPI (#331) | 暫不採用，待維護者決定。新 Provider 功能擴充，需維護者評估。 |
| `e7a886c` | docs(providers): drop the portrait-material paragraph from the Monid and HiAPI READMEs | 不適用。上游 Provider README 文字異動，非功能變更。 |
| `46b882d` | chore(release): prepare @hypit/hypit 0.2.10 | 不適用。上游 release 版務 commit。 |
| `b85a707` | docs(zh): refresh WeChat group QR code | 不適用。上游社群行銷素材，本 fork 已移除微信群 QR 碼區塊，不同步。 |
| `1af179d` | docs: point the Watcha launch-partner links to the referral URL | 不適用。上游合作夥伴推廣連結，本 fork 不採用第三方行銷區塊。 |
| `56057fd` | fix(pixverse): render at 540p or 720p | 暫不採用，待維護者決定。PixVerse Provider 輸出解析度修正，需維護者評估是否引入。 |
| `d24583e` | docs: arrange Trendshift badges and add TypeScript weekly badge | 不適用。上游 README 徽章排版，本 fork 已移除 Trendshift 等第三方徽章。 |
| `802ecb4` | docs: point the BeatAPI launch-partner links to the referral sign-up URL | 不適用。上游合作夥伴推廣連結，同 `1af179d`。 |
| `636270f` | fix(providers): keep async jobs pending when a progress poll hits a transport error (#336) | 已移植（`4eeb814f`，2026-10-25）。跨多個 Provider 的輪詢錯誤處理修正，具通用可靠性價值，待授權後評估合併。 |
| `5d257c5` | chore(release): prepare @hypit/hypit 0.2.11 | 不適用。上游 release 版務 commit。 |
| `ec6f208` | fix(endpoint-kit): share the poll error decision across asynchronous Providers (#337) | 已移植（`134d4a97`，2026-10-25）。`636270f` 的後續一般化重構，同一輪詢錯誤處理修正系列。 |
| `5a568f4` | chore(release): prepare @hypit/hypit 0.2.12 | 不適用。上游 release 版務 commit。 |

共 19 筆 commit，全數 triage 完畢；本次不執行 `git merge`。

### Pull Requests（逐筆，`reviewed_pr_through` 推進至 `#337`）

| PR | 決策 | 理由 |
| --- | --- | --- |
| [#322](https://github.com/hypit-ai/hypit/pull/322) | 暫不採用，待維護者決定 | 對應 issue #319，修正 HyperFrames 在 Windows 下透過 PATHEXT 解析 ffmpeg cmd/bat shim 的問題——**Windows 相容性直接相關**，建議下次授權移植時優先評估。 |
| [#323](https://github.com/hypit-ai/hypit/pull/323) | 暫不採用，待維護者決定 | 對應 issue #320，已隨 v0.2.9 併入 commit `5d52f8d`，見上表。 |
| [#324](https://github.com/hypit-ai/hypit/pull/324) | 暫不採用，待維護者決定 | 對應 issue #321，修正 HyperFrames capture 在 work 目錄內以 `startsWith(work+sep)` 誤判暫存來源的問題，屬路徑處理缺陷修復，未涉及本 fork 專屬骨架。 |
| [#325](https://github.com/hypit-ai/hypit/pull/325) | 暫不採用，待維護者決定 | Studio 播放改用共用 transport clock 取樣，一般性可靠性修正，需維護者評估後合併。 |
| [#326](https://github.com/hypit-ai/hypit/pull/326) | 暫不採用，待維護者決定 | 對應 commit `8f1b91a`，新 Provider 功能擴充，見上表。 |
| [#328](https://github.com/hypit-ai/hypit/pull/328) | 不適用 | Release 版務 PR，對應 commit `0336a6f`。 |
| [#329](https://github.com/hypit-ai/hypit/pull/329) | 暫不採用，待維護者決定 | 對應 issue #327 與 commit `deb799b`，見上表。 |
| [#331](https://github.com/hypit-ai/hypit/pull/331) | 暫不採用，待維護者決定 | 對應 commit `a2d13d5`，新 Provider 功能擴充，見上表。 |
| [#334](https://github.com/hypit-ai/hypit/pull/334) | 暫不採用，待維護者決定 | 對應 issue #333，新增 Higgsfield Provider（Seedance 2.0/2.5），新功能提案，需維護者評估是否引入。 |
| [#335](https://github.com/hypit-ai/hypit/pull/335) | 不適用 | 僅新增「reproducible renderer bug reporting」文件指引，不影響程式碼行為。 |
| [#336](https://github.com/hypit-ai/hypit/pull/336) | 已移植（2026-10-25） | 對應 commit `636270f`，見上表。 |
| [#337](https://github.com/hypit-ai/hypit/pull/337) | 已移植（2026-10-25） | 對應 commit `ec6f208`，見上表。 |

共 12 筆 PR，全數 triage 完畢。

### Issues（逐筆，`reviewed_issue_through` 推進至 `#333`）

| Issue | 決策 | 理由 |
| --- | --- | --- |
| [#319](https://github.com/hypit-ai/hypit/issues/319) | 暫不採用，待維護者決定 | HyperFrames ffmpeg 查找忽略 Windows PATHEXT，導致 cmd/bat shim 無法被找到——**Windows 相容性直接相關**，本 fork Windows-first 維護宗旨下建議優先評估；對應 PR #322 已有修正，待維護者授權後移植。 |
| [#320](https://github.com/hypit-ai/hypit/issues/320) | 暫不採用，待維護者決定 | `hypit snapshot` 誤將 HTTPS:// HTML 判斷為本機路徑，且 `--studio` 缺 scheme 時拋出 TypeError；對應 PR #323／commit `5d52f8d`，已記錄於上表。 |
| [#321](https://github.com/hypit-ai/hypit/issues/321) | 暫不採用，待維護者決定 | HyperFrames capture 的 `startsWith(work+sep)` 誤拒暫存於 work 根目錄內的來源檔案；對應 PR #324，待維護者授權後移植。 |
| [#327](https://github.com/hypit-ai/hypit/issues/327) | 暫不採用，待維護者決定 | Studio 素材路由宣告支援 byte range 卻回傳完整資源；對應 PR #329／commit `deb799b`，已記錄於上表。 |
| [#330](https://github.com/hypit-ai/hypit/issues/330) | 監控（monitor） | Render 加入圖片軌後導致跨 cue 字幕污染；目前上游尚無對應 PR 或已驗證修正，待上游釋出修正或維護者授權獨立調查後再評估。 |
| [#333](https://github.com/hypit-ai/hypit/issues/333) | 暫不採用，待維護者決定 | 請求新增 Higgsfield API Provider（Seedance 2.0/2.5）；對應 PR #334，新功能提案，需維護者評估是否引入。 |

共 6 筆 issue，全數 triage 完畢。

- **水位推進**：`tools/upstream_baseline.json` 更新為 `reviewed_through=5a568f4be485ab5e735fe95533cd5f77a85c66ee`（`v0.2.12`）、`reviewed_pr_through=337`、`reviewed_issue_through=333`、`reviewed_date=2026-09-21`。**Git 工作樹本身未合併任何 v0.2.9–v0.2.12 上游程式碼**；下次由維護者明確同意後，可依本輪逐筆決策執行實際合併。


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

`nltk` 可達性：弱點在 `TransitionParser`、`AveragedPerceptron`、`PerceptronTagger.save_to_json`、`save_maxent_params` 的模型讀寫，且僅在啟用 `pathsec` 時才構成沙箱繞過。`whisperx` 只用 `nltk.data.load('tokenizers/punkt_tab/...')` 載入斷句器，本服務只設定 `nltk.data.path`，兩者都不呼叫上述 API。


## 2026-10-24: 依賴安全升級（Dependabot 91 筆開啟警示）

範圍：`package.json`／`packages/*/package.json`／`pnpm-lock.yaml`、`services/whisperx/uv.lock`、`services/yt-dlp/uv.lock`。作法同 2026-09-30：同主版、`overrides` 用 `^`、每個 Python 套件單獨 `uv lock --upgrade-package <pkg>==<最小修補版>`，鎖檔一律由工具重生；`pnpm install --ignore-scripts`。

**已升級**

- `sharp` 0.35.4 -> 0.35.5（`package.json`、`packages/browser-capture`、`packages/video-cli`，三處皆為精確版本）。
- `vite` 8.2.2 -> 8.2.4（`package.json`、`packages/studio`）。vitepress 用的那份由 `overrides` 的 `vitepress>vite: ^6.4.4` 解析為 6.4.5（6.4.4 是首個修補版，^ 取得範圍內最新）。
- `@vue/server-renderer`／`postcss-selector-parser`／`source-map-js`：僅出現在 `pnpm-lock.yaml`（vitepress、`@hyperframes/*` 的間接依賴），以 `pnpm update -r --depth Infinity --lockfile-only vue "@vue/*" postcss-selector-parser source-map-js` 在原範圍內升級。vue 家族一起到 3.5.44（`@vue/server-renderer` 對 `vue` 是精確相依，無法單獨取 3.5.42）、`postcss-selector-parser` 7.1.7、`source-map-js` 1.2.2。
- whisperx 鎖：`aiohttp` 3.14.4（`yarl` 1.25.1 隨之）、`certifi` 2026.10.19、`mako` 1.4.2、`multidict` 6.9.1、`opentelemetry-api` 1.45.1（整個 OpenTelemetry 家族升到 1.45.1／0.66b1，新增 `opentelemetry-exporter-http-transport`、`opentelemetry-exporter-otlp-common` 兩個同專案套件）、`pillow` 13.0.0。
- yt-dlp 鎖：`certifi` 2026.10.19。
- `nanoid` 3.3.16 -> 3.3.20（`pnpm audit` 的 high，GHSA-2v37-7h3g-55p8，範圍 `<3.3.18`；當時沒有對應的 Dependabot 警示）：`@hyperframes/core` 的 `postcss` 8.5.25 帶入，以 `overrides` 的 `nanoid: ^3.3.18` 限在 3.x。
- `nltk` 3.10.3 -> 3.10.4（GHSA-8mgp-746c-j5xp，警示範圍 `<= 3.10.3` 但 advisory 沒填 first_patched_version；3.10.4 於 2026-10-21 發行，三個修補 PR #3757／#3759／#3813 皆為其祖先 commit）。3.10.4 對缺少的 Punkt 檔案改丟 `LookupError`（3.10.3 是 `OSError`），`assert_sentence_data` 原本只攔 `(OSError, ValueError)`，缺資料時不會轉成 `UnpreparedResourceError`。已在 `except` 加入 `LookupError`，並新增 `test_a_lookup_error_from_nltk_for_missing_sentence_data_means_unprepared`（還原修正後該測試會失敗）；`pnpm test:whisperx-service` 19 項通過。

**Python 下限提到 3.11（`services/whisperx`）**

`pillow` 的 39 筆警示（4 critical、23 high、12 medium）唯一的修補版是 13.0.0，而它要求 `Python>=3.11`；`requires-python = ">=3.10,<3.14"` 讓 uv 為 3.10 分支留下 12.3.0，警示因此關不掉。有修補版的 high／critical 不能延後，所以把 `services/whisperx/pyproject.toml` 提到 `>=3.11,<3.14`。理由：`.github/workflows` 沒有任何一處測 Python 3.10（只有 3.12），checked-in 鎖選的是 3.13，等於降低的支援範圍從未被驗證過。重生後鎖內沒有 pillow 12.x，另外移除只給 3.10 分支用的 `async-timeout`、`tomli`、`numpy` 2.2.6、`pandas` 2.3.3、`scipy` 1.15.3、`scikit-learn` 1.7.2 等；沒有任何套件被升級或新增。同步改為一致：`services/whisperx/README.md`、`check.py` 的執行期檢查、`CONTRIBUTING*.md`、`docs/guide/develop.md`、`docs/zh/guide/develop.md`（Python 3.11–3.13）。`services/yt-dlp` 不用 pillow，維持 `>=3.10`。

觸發條件：若日後要恢復支援 Python 3.10，必須等 Pillow 釋出給 3.10 使用的修補版（13.x 以後的 3.10 相容發行或 12.x 的回補）。

**延後**

| 套件 | 現在 | 修補版 | 延後原因 | 觸發條件 |
| --- | --- | --- | --- | --- |
| `torch` | 2.8.0 | 2.9.1／2.10.0／2.13.0 | `uv lock --upgrade-package torch==2.9.1` 回報 `whisperx==3.8.6 depends on torch>=2.8.0,<2.9.dev0`；`whisperx 3.8.7rc1` 仍是 `torch~=2.8.0` | 穩定版 `whisperx` 放寬 torch 上限 |
| `transformers` | 4.57.6 | 5.10.0 以上（4.x 無修補版；5.10.0 已被 PyPI yanked，實際要取未被 yank 的 5.10 以上版本，目前最新為 5.20.2） | `transformers 5.x` 要求 `huggingface-hub>=1.5`，`whisperx 3.8.6` 要求 `huggingface-hub<1.0`，`uv lock` 無解。`whisperx 3.8.7rc1`（預發行）已放寬為 `huggingface-hub>=0.28.1`，在暫存目錄實測可解出 transformers 5.10.0／huggingface-hub 1.33.0，但那是預發行版、需改 `pyproject.toml` 的釘版，且 4.x -> 5.x 是主版升級，需實跑對齊模型才能驗 | `whisperx` 3.8.7 穩定版釋出，且能在本機實跑對齊 |
| `zod`（`pnpm audit` 的 high，GHSA-mrhx-c7xc-m3w5，範圍 `<4.6.6`；沒有對應的 Dependabot 警示） | 3.25.76 | 4.6.6 | 唯一修補版是 4.x，而 `chromium-bidi 17.0.2` 要求 `zod ^3.24.1`，它由 `puppeteer 25.5.0`（`@hyperframes/engine` 精確釘住）與 `puppeteer-core 25.10.0` 精確釘住。實測用 `chromium-bidi>zod: ^4.6.6` 覆寫後，`parseObject` 的錯誤分支用了 zod 3 才有的 `error.errors`，輸入不合法時丟 `TypeError: Cannot read properties of undefined (reading 'map')`，而不是 `InvalidArgumentException`（合法輸入仍正常）。本 repo 的 `browser-capture` 與 hyperframes 走預設 CDP，沒有啟用 WebDriver BiDi，但覆寫會留下潛在的相容問題，故不採用。`chromium-bidi` 最新版（158.0.8120-0）已改用 `zod ^4.6.5`，不過 `puppeteer-core` 25.10.0 與 `puppeteer` 25.5.0 都精確釘住 17.0.2 | `@hyperframes/*` 更新 `puppeteer`，且 `puppeteer-core` 升到引用 zod 4 版 `chromium-bidi` 的版本（25.16.0 引用 `chromium-bidi 157.0.8090-0`），並以實跑驗證 `browser-capture` |

重新檢查：每次 Dependabot 警示清單變動，或上述任一觸發條件成立時，重跑 `gh api repos/SanHsien/hypit/dependabot/alerts?state=open`。

**Dependabot PR 的處置**

| PR | 內容 | 與本批的關係 |
| --- | --- | --- |
| #3 | aiohttp 3.14.3 -> 3.14.4（whisperx 鎖） | 本批已包含，合併後即過時 |
| #4 | vite 8.2.2 -> 8.2.4（根） | 本批已包含，合併後即過時；#4 另外帶入 rolldown／postcss 等間接依賴更新，本批只取修補所需 |
| #5 | vite 8.2.2 -> 8.2.4（`packages/studio`） | 本批已包含，合併後即過時 |
| #6 | certifi -> 2026.10.19（yt-dlp 鎖） | 本批已包含，合併後即過時；#6 把 `uv.lock` 的 `revision` 從 3 改成 5，本批保持 3 |
| #7 | opentelemetry-api 1.44.0 -> 1.45.1（whisperx 鎖） | 本批已包含，合併後即過時；#7 同時降級 `onnxruntime` 並新增 `coloredlogs`／`humanfriendly`（與先前 PR #1 同型），**不要單獨合併** |

**`package` job（npm-package.yml）：`README Examples section could not be located`**

原因：fork 把 `README.md` 改成繁體中文（2026-09-19，標題變成 `## 示例`、`## 使用 Hypit skill`、`## 只安裝一次`），英文版另存 `README.en.md`；上游的 `scripts/pack-distribution.mjs` 仍以英文標題 `## Examples`、`## Use the Hypit skill`、`## Install once` 當錨點，所以每個 PR 的兩個 `package` job 都失敗（Dependabot PR #3 到 #7 同樣失敗）。與依賴升級無關。

取捨：這支腳本產生的是 npm 套件頁的 README，錨點、插入的 `Install the Hypit CLI (Node.js 22.15 or newer)` 段落與 `Watch the complete video examples on GitHub` 連結全是英文。
- 讓腳本也認得中文標題：要在三個錨點加中文別名，還要決定插入的是中文還是英文文字，npm 頁會變成中英混雜，之後每次改標題都要同步。
- 把 `README.md` 的標題改回英文：中文文件配英文標題，等於撤回 2026-09-19 的繁體化，且仍然是兩份 README 靠標題字面值綁在一起。
- 採用：腳本改讀 `README.en.md`。它的標題與上游相同，npm 頁維持英文，繁中 `README.md` 不受影響，錨點檢查（找不到章節就丟錯）保持原樣、沒有被跳過或放寬。

驗證：本機 `npm run pack:distribution` 成功，產出的 `dist/release/README.md` 有 `Install the Hypit CLI` 段落與 `Watch the complete video examples` 連結。接著的 `npm run check:distribution` 在本機走過安裝、`--version`、`studio --help`、`check`、`runtime up`、`doctor`，最後在清理暫存目錄時遇到 Windows 的 `EPERM`（chrome-headless-shell 仍占用檔案），本機未能看到結尾結果，以 CI 的結果為準。

## 2026-10-24：brotli／brotlicffi／setuptools 安全修補（Dependabot #110、#111、#112）

| 警示 | 套件 | 鎖檔 | 版本 |
| --- | --- | --- | --- |
| #111（critical） | brotli | `services/yt-dlp/uv.lock` | 1.2.0 -> 1.2.1 |
| #112（critical） | brotlicffi | `services/yt-dlp/uv.lock` | 1.2.0.2 -> 1.2.1.0 |
| #110（low） | setuptools | `services/whisperx/uv.lock` | 83.0.0 -> 84.1.0 |

做法：每個套件各跑一次 `uv lock --upgrade-package <套件>==<修補版>`，取最小修補版；只動鎖檔，`pyproject.toml` 的下限不需調整。鎖檔差異只含這三個套件的版本與 `files.pythonhosted.org` 的檔案網址／雜湊，沒有新增套件。

驗證：`pnpm test:whisperx-service` 19 個測試全過。yt-dlp 服務沒有測試腳本，只以 `uv run --project services/yt-dlp --frozen` 確認環境可安裝並能匯入 `brotli` 與 `yt_dlp`。

刻意不處理：#109（zod high）。chromium-bidi 17.0.2 要求 `zod ^3`，升到修補版會破壞相依，維持既有延後決定。

## 2026-10-24：修正兩個 CodeQL 判定為真的問題（js/redos、js/double-escaping）

背景：同日對 open 的 CodeQL alert 做唯讀判讀，兩個確認為真且修法明確，本次只修這兩個；其餘多為測試碼或誤報，維持不處理。兩者都是上游程式碼的缺陷，依 FORK.md 回貢判準屬於可送回上游的修正，回貢與否待維護者另行決定。

| CodeQL 規則 | 位置 | Alert 編號 |
| --- | --- | --- |
| `js/redos`（指數級回溯） | `packages/markup/src/syntax.ts:14`（`REFERENCE`） | #12 |
| `js/double-escaping` | `packages/provider-hyperframes-local/src/sampling.ts:25`（`videoSlots` 的屬性解碼） | #14 |

Alert 編號的來源：雲端工作環境查詢時回 `403 Resource not accessible by integration`，表中編號於合併前由本機維護帳號以 `gh api repos/SanHsien/hypit/code-scanning/alerts?state=open` 查得補上。

### 1. `REFERENCE` 正則的 ReDoS

- **問題**：原式 `/^[A-Za-z_][A-Za-z0-9_.:-]*(?:\.[A-Za-z_][A-Za-z0-9_.:-]*)*$/u` 的字元類 `[A-Za-z0-9_.:-]` 已含 `.`，`X*(\.X*)*` 對同一段字串有指數多種切法。輸入 `"A.".repeat(30) + "!"`（61 字元）在本次測試環境要約 13 秒才判定不合法。
- **修正**：改為 `/^[A-Za-z_][A-Za-z0-9_.:-]*$/u`。
- **等價性**：後面的群組每個字元都落在前段字元類內，所以原式能接受的字串新式都接受；新式就是原式群組重複 0 次的情形，所以反過來也成立。另以字母表 `A z _ 0 9 . : - !` 窮舉所有長度 ≤6 的字串（597,871 個）比對新舊兩式，結果 0 筆不一致。
- **測試**：`packages/markup/test/reference.test.ts`，以原式所接受的語言（不用正則的逐字元判斷）為對照，經 `parseOpeningTag` 檢查合法／不合法參考的結果不變（含長度 ≤4 的窮舉），並要求病態輸入在 50ms 內被拒絕。

### 2. HTML 實體重複還原

- **問題**：`&amp;` 先於 `&quot;`、`&lt;`、`&gt;` 還原，`&amp;lt;` 會先變成 `&lt;` 再變成 `<`，被解碼兩次。
- **修正**：`&amp;` 改為最後還原，每個實體只解碼一次。
- **測試**：`packages/provider-hyperframes-local/test/sampling.test.ts`，`&amp;lt;` 得 `&lt;`、`&amp;amp;` 得 `&amp;`，一般實體照常還原。

驗證：兩項修正各自還原後，對應測試都會失敗；`pnpm check`、`pnpm test` 前後比對沒有新增失敗。


## 2026-10-25: 依賴下限刷新、zod 警示 #109 關閉、程式碼掃描分流

- **依賴下限**：`@puppeteer/browsers` 3.2.6、`puppeteer-core` 25.16.0、`koffi` 3.3.4、`cjs-module-lexer` 2.3.0、`rollup` 4.65.0、`vite` 8.3.5（根與各套件同步）；Actions 依 SHA 重新釘選（download-artifact v8.0.2、setup-node／setup-python v7.1.0、upload-artifact v7.0.2、codeql-action v4.39.1）。已到最新的 deferral 條目移除，`@types/node` 刷到 26.6.5，`rollup-plugin-dts` 改寫真實延後原因。
- **zod #109 關閉**：先前「zod 延後」的出口條件（puppeteer-core 升到 25.16.0）已成立。`@hyperframes/engine` 實際要求的是 `puppeteer ^25.2.1`（舊鎖檔只是解析成 25.5.0，並非精確釘住），新增 `overrides` 的 `puppeteer@<25.16.0: ^25.16.0` 後，`chromium-bidi` 157 帶入 `zod` 4.6.7，鎖檔不再含 zod 3。這取代上面 2026-10-24 表格中 `zod` 一列的延後。
- **Dependabot #111／#112（brotli／brotlicffi）**：`services/yt-dlp/uv.lock` 在 main 已是 1.2.1／1.2.1.0，Dependabot 未重掃，以 inaccurate 駁回。
- **程式碼掃描 24 筆**：逐筆讀碼與實測後全數駁回，無需改碼。10 筆為測試或獨立 mkdtemp 目錄、`.github/automation` 受 `github.repository == 'hypit-ai/hypit'` 限制不在 fork 執行、其餘為本機 CLI 對自己文件／設定的多項式回溯或同使用者 stat 後讀取（需 10^4 以上病態字元才有可測延遲，無安全後果）。
- **刻意延後**：torch 3、transformers 5 仍等穩定版 `whisperx` 3.8.7（PyPI 目前只有 3.8.7rc1）。


## 2026-10-25：上游 v0.2.16 → v0.3.1 審查（移植 0.2.x 修復，暫不升 0.3）

- **審查範圍**：release 軌 63 個 commit、PR #375–#437、issue #380–#435；水位推到 `v0.3.1`（`8efbac03`）、PR 437、issue 435。
- **fork 實際程式碼基底**是 v0.2.8 加少數 cherry-pick 與自己的安全修復，`v0.2.16` 只是「已審視」水位。模擬合併：v0.2.18 只有 4 個衝突檔；v0.3.1 有 50 個（`docs/zh` 20、workflows 4、package.json／lock、examples 等），且 0.3 重寫套件結構與語法。
- **決策：現在不升 0.3。** 等 0.3.2 以上穩定；上游 issue #388（內建範例重放失敗，Windows）與 #433（caption 相鄰 Cue 回歸）仍 open，另有約 40 個修復 PR 未合併。升級前須先有完整的 render 實測。fork 的 markup 正則 ReDoS 修復在 0.3.1 仍需保留（同一個正則），HTML 實體重複還原的修復在 0.3 已不適用。
- **已移植（`git cherry-pick -x`，各自獨立 commit）**：#383 alpha Normalize 加速、#384 yt-dlp 加 curl_cffi（`uv lock --check` 通過）、#363 still-video 的 BT.709、#348 plan 回報無請求的 Producer 失敗、#355 Timeline 精確幀預檢、#377 SVS 允許 sheet 結尾文字、#336→#337→#376 poll／transport 錯誤鏈（`provider-beatapi` 在 fork 已不存在，衝突以刪除解決）。
- **略過**：#373（修的是 fork 沒取的 `089c39a` 回歸）、`5885c00`（0.3 基底）、#378 與所有微信 QR／合作夥伴行銷 commit、版號 commit、簡中文件與遷移指南、新功能 #387／#389／#390。
- **待上游合併後移植**：#394+#399（text replace 字面化，issue #393）、#395 或其後繼 #438（script 逗號數字，issue #391；10-25 複查 #438 diff 乾淨，無隱藏內容，兩者仍 open 未合併，fork 的 `lexical.ts` 有同一缺陷）、#416（Runtime Profile 解析錯誤訊息）；手工評估：#426（issue #425）、#406（簽名 URL 不入錯誤訊息）、issue #392（svs 引號值還原，疑似同源未驗證）。其餘 PR 目標套件只在 0.3 存在，隨 0.3 處理。
- **#437**（html-local GPU 影片匯出，上游標 DO NOT MERGE 的 0.3 新功能）：略過。
- **issue**：#381、#382 由上述移植解決；#380、#386、#432、#435 與 fork 無關；#388、#433 僅升 0.3 才相關。


## 2026-10-26：WhisperX 釘版警示複查（Dependabot #14–#20、#26）——無可相容修補，維持延後

沒有改任何依賴。對照 2026-10-24／10-25 的延後表，逐筆複查結果：

| 警示 | 套件／嚴重度 | 修補版 | 對應延後列 |
| --- | --- | --- | --- |
| #15、#16、#19 | `torch` medium／low／low | 2.9.1、2.10.0、2.13.0（#19 的 2.13.0 一次涵蓋三筆） | `torch` |
| #14、#17、#18、#20 | `transformers` medium／high／high／high | 5.0.0rc3、5.3.0、5.5.0、5.10.0 | `transformers` |
| #26 | `transformers` high（GHSA-x9r9-c232-4q39，範圍 `>= 4.49.0, <= 5.8.1`） | 無 `first_patched_version` | `transformers`，見下 |

**#26 之前沒有被明寫**：這筆沒有修補版，4.x 內無解（鎖檔 4.57.6 在範圍內，PyPI 上 4.57.x 最新就是 4.57.6）。
只有離開 5.8.1 以下（5.9 以上，取未被 yank 的版本）才脫離範圍，所以出口條件與 #14／#17／#18／#20 相同，
不另設一條，也不能靠版本號以外的方式宣稱已修。

**2026-10-26 複查事實**（PyPI JSON 實查）：
- `whisperx` 最新穩定版仍是 3.8.6（`torch~=2.8.0`、`huggingface-hub<1.0.0`）；預發行 3.8.7rc1 放寬了 `huggingface-hub>=0.28.1`，但仍是 `torch~=2.8.0`。
- `torch` 沒有 2.8.x 的修補發行（2.8.0 之後的穩定版是 2.9 以上）；`transformers` 4.x 沒有修補發行，最新穩定 5.20.x。
- 因此沒有任何與 `whisperx 3.8.6` 相容的修補版；不強制升級、不 override、不 dismiss、不移除 WhisperX 對齊功能。

**觸發條件（比 10-25 的「等 3.8.7」更精確）**：10-25 寫「等穩定版 `whisperx` 3.8.7」，但對 `torch` 而言 3.8.7rc1 仍卡在 2.8。
重新檢查要同時成立：(1) 穩定版 `whisperx` 的相依圖允許實際修補版的 `torch`（至少 2.13.0）與 `transformers`（5.10 以上、未被 yank）及其要求的 `huggingface-hub>=1.5`，`uv lock` 可解；
(2) `pnpm test:whisperx-service` 與本機實跑對齊模型通過。只是版本號變成 3.8.7，或只有預發行，都不算成立。
重跑：`gh api repos/SanHsien/hypit/dependabot/alerts?state=open`，並對 `https://pypi.org/pypi/whisperx/json` 查最新穩定版的 `requires_dist`。

這些警示的程式碼可達性沒有逐筆驗證，因此不主張「不受影響」，只主張「沒有相容修補可套」。

## 2026-10-27：深度掃描——fork 自有程式的缺陷修正（8 個 commit）

範圍：只看 fork 自己加的程式——`tools/`（兩支 Python 檢查腳本）、`hypit.cmd`、`.github/workflows/` 中 fork 加的與被 fork 改過的、`scripts/pack-distribution.mjs`、`services/whisperx` 的 NLTK 修補，以及 cherry-pick 的整合點（#336／#337／#376 輪詢錯誤鏈、#361 `packages status`、#345 vocabulary、#339 mux、#347 media probe）。上游原有程式不改。依賴不動：WhisperX 釘版造成的 torch／transformers 延後維持原決定，沒有升級、override 或 dismiss。

`tools/` 以前完全沒有測試。新增 `tools/tests/`（stdlib `unittest`，不連網：`gh`、registry 都以替身取代，git 只在暫存的本機 repo 跑），並由 `test/fork-tools.test.ts` 掛進 `pnpm test`，CI 的 Windows job 因此會跑。

| # | commit | 位置 | 什麼輸入出錯、錯成什麼 | 重現測試（修前失敗） |
| --- | --- | --- | --- | --- |
| 1 | `62c6f925` | `tools/check_dependency_freshness.py` `parse_workflow_actions` | `uses: owner/repo@<40 位 SHA>` 沒有版本註解時，SHA 開頭的十進位數字被當成版本（`3d3c42e…` → 下限 `3`），對任何較新 major 報 REVIEW UPDATE；字母開頭的 SHA 卻是 NO FLOOR，行為不一致 | `test_check_dependency_freshness.py::test_a_pinned_sha_without_a_version_comment_has_no_floor`（`'3' != ''`） |
| 2 | `78021b10` | 同檔 `_get_json` | 回應中途被切斷，`response.read()` 丟 `http.client.IncompleteRead`（`HTTPException`，不是 `OSError`），整支腳本帶 traceback 結束、不產報告；其他連線失敗都會變成 CHECK FAILED 並照常寫報告與 workflow output | `test_a_response_cut_off_mid_body_reads_as_unavailable_not_as_a_crash`（`IncompleteRead`） |
| 3 | `9b7a9efd` | `tools/check_upstream_updates.py` `collect_new_tickets` | `gh … list --limit 50` 只回最新 50 筆。兩次審查之間超過 50 筆新 PR／issue 時，較舊的未審項目被靜默丟掉，報告寫「N 筆」而 N 偏小，之後推進水位更把它們標成已 triage。上一輪（v0.2.16→v0.3.1）就是 63 個 commit、#375–#437 | `test_a_listing_cut_off_above_the_watermark_is_reported_as_not_checked`（4900 筆新項目只回 50 筆且當成全部）。現在上限 1000，填滿且全部仍高於水位就回 `None`（未檢查、exit 2） |
| 4 | `0c186058` | 同檔 `collect_new_commits` | `str.splitlines()` 也會在 U+2028／U+2029／U+0085／換頁／垂直定位處斷行；commit 標題含其一，一筆紀錄被切兩段，`line.split("\x1f", 2)` 丟 `ValueError`（不是 `UpstreamCheckError`），每週檢查帶 traceback 結束 | `test_a_subject_with_a_unicode_line_separator_is_one_commit`（五種分隔字元皆 `ValueError`） |
| 5 | `fd58ac7e` | 同檔 `fork_status` | 本 fork 是 clean-init 歷史，與 upstream 沒有共同祖先，`reviewed..HEAD` 就是整個 fork 歷史：報告寫「共同 baseline … baseline 之後 ahead 30」，數字隨每個 fork commit 增加，說的是假事實。現在先 `git merge-base HEAD <reviewed>`，沒有共同祖先時 `ahead` 為 `None`、報告明說；從 upstream 分出的 fork 行為不變 | `test_a_fork_with_its_own_history_has_no_ahead_count`（`3 is not None`），其兄弟測試釘住分支型 fork 的舊行為 |
| 6 | `7c70e8bc` | `tools/check_dependency_freshness.py` `_USES_RE` | YAML 允許 `uses: "owner/repo@v6"`、`uses: 'owner/repo@<sha>' # v7.0.1`；只認裸值的樣式整行不匹配，那個 Action 連 NO FLOOR 都不會出現，報告裡沒有任何一列 | `test_a_quoted_uses_value_is_read_like_an_unquoted_one`（三種寫法皆 `0 != 1`） |
| 7 | `8954e41b` | `.github/workflows/automation-check.yml`、`repository-analysis.yml` | 兩處 `actions/checkout` 釘在 `d23441a`（v6.1.0）且沒有版本註解，所以被讀成 NO FLOOR，比其他七個 workflow（v7.0.1）落後一個 major，月報從未顯示；10-25 的重新釘選也因此漏掉。改釘 `3d3c42e…`（v7.0.1，與其餘一致） | `test_every_action_pinned_in_this_repository_has_a_floor_the_check_can_compare`（修前列出 `actions/checkout@d23441a48e51`）。這兩個 workflow 無法在本機執行，推送後以 `Check repository analysis` 的 CI 結果為準 |
| 8 | `1f8331e4` | `hypit.cmd` | 「依賴未安裝」訊息在 `if not exist (...)` 區塊內、未加引號地印 `%LAUNCHER_DIR%`。cmd 在解析區塊時就展開變數（不管條件真假），安裝目錄如 `C:\Program Files (x86)\hypit\` 的 `)` 提早結束區塊：`\hypit\ was unexpected at this time`，exit 255，依賴全裝好也到不了 `node`；路徑含 `&` 時（`Tom & Jerry`）缺依賴的訊息同樣壞掉。現在路徑加引號 | `test/hypit-cmd.test.ts`（隱藏的 console 子行程，替身 `bin/hypit.mjs`；`plain`、`Program Files (x86)`、`Tom & Jerry` 三個目錄。修前 `(x86)` 兩項與 `&` 缺依賴一項失敗） |

### 刻意不修

- **`upstream-review-report.md` 被追蹤進 git**：`check_upstream_updates.py` 預設把報告寫到 repo 根目錄，每次 `dev_check.ps1` 都會改動這個被追蹤的檔，內容（HEAD、數字）永遠過期，也讓「保持乾淨工作目錄」做不到。正解是 `git rm --cached` 並加進 `.gitignore`，但那是從 repo 移除檔案，需要維護者決定；沒有動它。
- **`check_dependency_freshness.py` 只讀根目錄 `package.json`**：`packages/*/package.json` 的 registry 相依（`@hyperframes/engine`、`@hyperframes/producer`、`@aws-sdk/*`、約 100 個 `@fontsource*`）完全不在月報裡。補上會一次出現大量新紅燈，其中字型套件是刻意精確釘版，需要先決定哪些要 hold／deferral，不是機械修正；留給維護者。
- **`publish-npm.yml` 未限定在上游 repo**：fork 若發 release 會嘗試走 npm trusted publishing；該信任綁在 `hypit-ai/hypit`，在 fork 只會失敗而不會發出去。要不要像 `sync-hypihub-docs.yml` 一樣加 `if: github.repository == 'hypit-ai/hypit'` 取決於 fork 是否可能自行發佈，未改。
- **`packages/markup/test/reference.test.ts` 的 50ms 牆鐘上限**：病態輸入修前要約 13 秒，50ms 在極重負載下理論上會誤報，但這次整套測試並行跑時穩定通過，沒有可重現的失敗，不動。
- **整套測試中兩個偶發失敗**（`credential-store-os/test/windows.test.ts`、`runtime-local/test/programs.test.ts`）：整套並行時一次逾時、一次 `EBUSY` 清理暫存目錄；單獨重跑都通過，判定為負載造成，與本批無關。

### 上游程式觀察清單（不改，記錄）

- `packages/package-loader-node/src/location.ts` 的 `distributionPackageDeclaring`（#361）對每個 `packages/*/package.json` 與 `services/*/package.json` 直接 `JSON.parse`、沒有 try/catch：任何一個 manifest 格式錯誤，`hypit packages status` 會以原始 `SyntaxError` 結束，而不是報告是哪個檔案。
- `services/whisperx/src/hypit_whisperx_service/resources.py` 的 `prepare_punkt_tab` 只檢查 `tokenizers/punkt_tab` 目錄存在就視為已完成，不檢查各語言檔；目錄在、語言檔缺時 `prepare` 直接返回，`assert_sentence_data` 之後才失敗。`assert_punkt_tab` 還會改寫全域 `nltk.data.path`。
- `packages/provider-hyperframes-local/src/sampling.ts` 的 `videoSlots` 只還原 `&quot; &lt; &gt; &amp;`，不認 `&#39;`／`&apos;`／數字實體；目前編譯器不會輸出這些，編譯器若改變轉義方式需同步。

### 驗證

- `tools/tests`：14 個測試通過（`python -I -m unittest discover -s tools/tests -t tools/tests`），並經 `test/fork-tools.test.ts` 由 Node 執行；每個重現測試都在修前先確認失敗。
- `test/hypit-cmd.test.ts`：6 個測試通過。
- `pnpm check` exit 0；單元測試 202 個檔案（排除 3 個會啟動 headless Chrome 的檔案）：第二次完整執行 1065 項，通過 1042、略過 23、失敗 0；第一次完整執行有上述 2 個偶發失敗，單獨重跑皆通過。
- 未執行：WhisperX 服務測試（需安裝 torch 等重型相依）、啟動瀏覽器的 3 個測試、需要 GPU 或真實模型的測試。

## 2026-10-28：依賴新鮮度（rollup）與上游 PR #439–#455、issue #447–#456 分流

**新鮮度**：月檢查只有 `rollup` 4.65.0 → 4.65.1（修補版，10-26 發佈）不是 OK 或已延後。直接升級（`266615ca`），鎖檔只動 rollup 與 26 個平台套件的雜湊，用指定的 pnpm 10.33.0 重產。`@types/node`、`rollup-plugin-dts`、`typescript` 的既有延後維持不變。上次紅燈另一個來源是當時開著的 Dependabot PR，現在 open PR 為 0。

**上游**：release 軌沒有新版（仍 `v0.3.1`）。PR #439–#446 是同一位作者（Wenjix）的安全強化，各對應 issue #447–#454。fork 基底是 v0.2.8 加移植，**8 筆 diff 都套不上**，所以照判準四移植做法，並先實查缺陷在 fork 是否存在。隱藏內容掃描（空白夾內容、超長行、`eval`／`new Function(`／`globalThis`／長 base64）8 筆皆無命中。

**提前移植**（fork 現在就有、且可由外部輸入觸發）：

| PR | head | fork 實況 | commit |
|---|---|---|---|
| #444（issue #452） | `d137a532af` | `packages/yt-dlp/src/download.ts` 把連結直接放在最後一個參數、沒有 `--`；`--plugin-dirs=<dir>` 形式的「連結」會被當選項，可從指定目錄執行 Python。新測試修前 2 筆失敗（選項形式的連結一路走到環境檢查） | `5dc763c0` |
| #443（issue #451） | `926502ed1a` | `packages/runtime-local/src/programs.ts:187` 只跳脫 ASCII 引號（U+2018–U+201B 也會結束字面值）、`$env:` 名稱未驗證、`:258` 與 `packages/credential-store-os/src/windows.ts:34` 以裸名稱 `powershell.exe` 啟動（會先找工作目錄）。測試 mock 掉 spawn／execFile，不會啟動 PowerShell；修前 4 筆失敗 | `541ab592` |
| #442（issue #450） | `3e2399d1a3` | 跨磁碟機或 UNC 目標讓 `relative()` 回絕對路徑，`build-result/src/store.ts`（兩處）、`cli/src/result-export.ts:38`、`runtime-local/src/config.ts:994` 的包含檢查都放行；build id `d:build` 是磁碟機相對路徑。build id 測試修前失敗；產生的 build id 格式 `bld_<數字>T<數字>Z_<nonce>` 不含冒號 | `d5afdfeb` |

**不提前移植（附證據與重看條件）**

| 項目 | fork 實況 | 重看條件 |
|---|---|---|
| PR #439（issue #447）markup 參照名稱 ReDoS | 已不存在：fork 的 `packages/markup/src/syntax.ts:14` 是線性的 `/^[A-Za-z_][A-Za-z0-9_.:-]*$/u`（2026-10-24 已修） | 無 |
| PR #440（issue #448）style 值跳脫 | 目標檔 `packages/composition/src/visual.ts` 只在 0.3 存在 | 升 0.3 時 |
| PR #441（issue #449）保留 `data-hypit-*` 屬性 | 缺陷存在：`packages/composition/src/track.ts:565` 允許所有 `data-*`。需要作者在自己的專案裡寫入該屬性才觸發，不是外部輸入 | 上游合併，或 fork 開始載入他人提供的專案 |
| PR #445（issue #453）三個二次方正則 | `recipe`、`text-fine` 套件 fork 沒有；`studio/src/parameters.ts` 沒有同一個正則 | 升 0.3 時 |
| PR #446（issue #454）樣板菱形展開 | 缺陷存在：`packages/text/src/program.ts:291` 同樣遞迴展開；只在作者寫出菱形呼叫圖時變慢，對自己的輸入 | 上游合併，或實際遇到 render 卡住 |
| PR #455 產品導覽錄影範例（+2102） | 0.3 新功能與範例 | 升 0.3 時 |
| issue #456 HypiHub provider 下載網址未限制 | 缺陷可能存在：fork 有 `packages/provider-hypihub`；要能影響已設定服務的回應才觸發；上游尚無 PR | 上游出修正 PR |

**順帶發現（未修，另報）**：`packages/credential-store-os/test/windows.test.ts` 的「Windows locker replaces credentials…」在 win32 會真的啟動 PowerShell 並寫入維護者的 Windows 認證管理員（測試名用隨機 service、結束時刪除）。本輪本機驗證一律以 `--test-skip-pattern`／`--test-name-pattern` 避開它。

**水位**：release `v0.3.1`（不變）、PR #455、issue #456、日期 2026-10-28。
