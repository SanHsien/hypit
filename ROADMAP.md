# 路線圖

> 本 repo 後續工作的單一真相源。做完一項，就在同一個 commit 刪掉那一列；新工作只加在這裡。
> 現況段的數字是 2026-10-29 依 `main` `07dded3c2b1e` 查的快照，開工前先重查 GitHub。

## 現況
`hypit-ai/hypit` 的 Windows 專屬維護 fork（AI 代理操控的程式化剪輯與短影音模板）。實際程式基底是 v0.2.8 加逐筆移植，上游 release 軌審到 `v0.3.1`、PR #455、issue #456，但刻意還沒升 0.3（`tools/upstream_baseline.json`、[`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-25）。
2026-10-29 查：open PR 0、Dependabot open alert 8 筆（high 4、medium 2、low 2，全是 WhisperX 釘版連帶的 `torch`／`transformers`）、code scanning 0；CI／CodeQL／Dependency freshness／Upstream check 最近一次 success；issues 已停用，open issue 數「未查到」（查法：`gh api repos/SanHsien/hypit/dependabot/alerts?state=open`、`gh run list -R SanHsien/hypit -b main`）。

## 近期：可以直接動手
| 項目 | 為什麼 | 驗收方式 | 建議執行者 | 證據 |
| --- | --- | --- | --- | --- |
| 讓「Windows locker replaces credentials…」測試不再寫入維護者的 Windows 認證管理員 | 這條測試在 win32 會真的啟動 PowerShell 並寫入本機認證管理員；本機驗證目前只能靠 `--test-skip-pattern` 避開 | 預設改成 mock，或只在明確設定的環境變數下才跑真實寫入；`pnpm test` 在 Windows 不再啟動 PowerShell（以 mock 斷言或環境變數未設時 skip 證明）；CI Windows job 綠 | Claude Sonnet | `packages/credential-store-os/test/windows.test.ts:53`；[`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-28「順帶發現」 |
| 決定 fork 是否自行發佈 npm；若不發佈，`publish-npm.yml` 限定只在上游 repo 執行 | fork 發 release 時會嘗試 npm trusted publishing，信任綁在 `hypit-ai/hypit`，在 fork 只會失敗；`sync-hypihub-docs.yml` 已有同樣的閘門；DECISIONS 把「要不要加」留給維護者（取決於 fork 是否可能自行發佈） | `docs/fork/DECISIONS.md` 記下「fork 不自行發佈 npm」的決定；之後在 `version`（`:27`）與 `publish`（`:75`）兩個 job 加 `if: github.repository == 'hypit-ai/hypit'`（與既有條件以 `&&` 合併），`checks`、`package` 靠 `needs` 隨之 skipped、`release-assets` 靠 `needs` 隨 `package`／`publish` skipped；在 fork 手動觸發 workflow 時這五個 job 全顯示 skipped | 維護者（決定）＋Codex（實作） | `.github/workflows/publish-npm.yml:27`、`:75`、`:66-71`、`:117-119`；[`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md):339 |
| 決定 `upstream-review-report.md` 是否改為不追蹤 | 檢查器每次跑都改寫這個被追蹤的檔，內容永遠過期，工作目錄也保持不了乾淨；移出 repo 屬刪除，需要維護者點頭 | 決定寫進 `docs/fork/DECISIONS.md`；若同意：`git rm --cached upstream-review-report.md` 並加進 `.gitignore`，跑完 `tools/dev_check.ps1` 後 `git status` 乾淨 | 維護者 | `git ls-files upstream-review-report.md`；[`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-27「刻意不修」 |
| 依賴新鮮度檢查涵蓋 `packages/*/package.json` | 月報只讀根目錄 `package.json`，`@hyperframes/*`、`@aws-sdk/*`、約 100 個 `@fontsource*` 等 registry 相依完全沒被檢查 | `tools/check_dependency_freshness.py` 讀所有 workspace manifest，`tools/tests` 有對應測試；第一次跑出的新紅燈逐筆升級或寫 hold／deferral（含理由），之後 `Dependency freshness` success | Claude Sonnet（hold／deferral 名單由維護者核可） | [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-27「刻意不修」；`tools/check_dependency_freshness.py` |

## 中期：等條件成立再做
| 項目 | 觸發條件 | 驗收方式 | 建議執行者 | 證據 |
| --- | --- | --- | --- | --- |
| 解除 `torch`／`transformers` 告警 | 穩定版 `whisperx` 的相依圖允許 `torch` ≥ 2.13.0 與 `transformers` ≥ 5.10（未被 yank）及其要求的 `huggingface-hub`，且 `uv lock` 可解；只有預發行或只是版號變成 3.8.7 都不算 | `services/whisperx` 鎖檔更新；`pnpm test:whisperx-service` 與本機對齊模型實跑通過；Dependabot 這 8 筆 state=fixed | Claude Sonnet | [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-26 WhisperX 釘版警示複查；查法 `https://pypi.org/pypi/whisperx/json` 的 `requires_dist` |
| 移植等上游合併的修正：#394＋#399（text replace）、#395 或 #438（script 逗號數字）、#416（Runtime Profile 錯誤訊息）、#441（保留 `data-hypit-*`）、#446（樣板菱形展開）；手工評估 #426、#406、issue #392；issue #456 等上游出 PR | 上游合併對應 PR（`Upstream check` 失敗會提示），或 #441 的 fork 開始載入他人提供的專案、#446 實際遇到 render 卡住 | 每筆 `git cherry-pick -x` 或依判準四移植做法，附修前失敗的測試；`pwsh -NoProfile -File tools/dev_check.ps1` 綠；`docs/fork/DECISIONS.md` 記結論並推進水位 | Claude Sonnet | [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-25、2026-10-28 上游分流表；`tools/upstream_baseline.json` |
| 升到上游 0.3 | 上游出 0.3.2 以上，且 issue #388（Windows 範例重放失敗）與 #433（caption 相鄰 Cue 回歸）已修 | 模擬合併的衝突檔逐一處理並保留 fork 的 markup ReDoS 修正與 Windows 啟動器；完整 render 實測（含內建範例重放）通過；同時處理只在 0.3 存在的 #440、#445、#455；CI 綠 | Claude Opus | [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-25（v0.3.1 模擬合併 50 個衝突檔） |

## 刻意不做
| 不做什麼 | 理由 | 什麼情況下重新考慮 |
| --- | --- | --- |
| 用 override、dismiss 或移除 WhisperX 對齊功能來讓 `torch`／`transformers` 告警消失 | 沒有與 `whisperx 3.8.6` 相容的修補版；版本號以外的方式不能宣稱已修（[`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-26） | 中期表的 WhisperX 觸發條件成立 |
| 帶進上游的微信 QR／合作夥伴行銷 commit、簡中文件與遷移指南 | 與 fork 的繁中、Windows 定位無關（[`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-25「略過」） | 不重新考慮 |
| 恢復上游的 POSIX `hypit` 啟動腳本或非 Windows 驗收 | fork 定位是 Windows 專屬，`hypit.cmd` 取代 POSIX 腳本（[`FORK.md`](FORK.md)「與上游的差異」） | fork 決定支援其他作業系統，且有人能實機驗收 |
| 不經同意對上游開 PR 或推 `upstream` | [`AGENTS.md`](AGENTS.md)「硬性邊界」、[`FORK.md`](FORK.md)「回貢判準」 | 維護者在當次對話明確同意回貢某一筆修正 |

## 維護方式
上游：追 release 軌，`Upstream check` 每週跑；新 PR／issue 逐筆讀 diff、先查缺陷在 fork 是否存在，結論與重看條件寫進 [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 再推進水位；能由外部輸入觸發的安全修正可在上游合併前先移植。依賴：月度新鮮度檢查，要延後就寫 deferral 並附理由；推 `origin/main` 前跑 `pwsh -NoProfile -File tools/dev_check.ps1 -Quick`。
