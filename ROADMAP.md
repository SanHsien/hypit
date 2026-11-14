# 路線圖

> 本 repo 後續工作的單一真相源。做完一項，就在同一個 commit 刪掉那一列；新工作只加在這裡。
> 現況段的數字是 2026-11-07 依 `main` `d0b6f1fb66dc` 查的快照，其中 Dependabot 與 open PR 兩項於 2026-11-15 重查（當時 `main` 為 `daa4a926`）；開工前先重查 GitHub。

## 現況
`hypit-ai/hypit` 的 Windows 專屬維護 fork（AI 代理操控的程式化剪輯與短影音模板）。實際程式基底是 v0.2.8 加逐筆移植，上游 release 軌審到 `v0.3.2`、PR #496、issue #490（2026-11-15），但刻意還沒升 0.3（`tools/upstream_baseline.json`、[`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-25、2026-11-15）。
2026-11-15 重查：open PR 1（Dependabot #16，`opentelemetry-api` 1.45.2，工作目錄已採用其鎖檔變更、尚未推送）；Dependabot open alert 10 筆：`opentelemetry-api` 1 筆（#16 對應的那筆）加 WhisperX 釘版連帶的 `torch` 4 筆、`transformers` 5 筆。2026-11-07 的 `undici` 29 筆已不在 open 清單（當時 `@hyperframes/engine` 0.9.20 精確釘 7.25.0，以 `undici: ^7.30.1` override 解到 7.30.2；engine 0.9.47 自己改釘 7.30.1，override 留作下限，見 DECISIONS 2026-11-15）。2026-11-07 查、未重查：code scanning 0；`main` 最近一次 CI／CodeQL／Dependency freshness success，`Dependabot Updates` failure（uv 解不出 `torch~=2.8.0`，與上述 WhisperX 延後同源）；issues 已停用，open issue 數「未查到」（查法：`gh api repos/SanHsien/hypit/dependabot/alerts?state=open`、`gh run list -R SanHsien/hypit -b main`）。

## 近期：可以直接動手
| 項目 | 為什麼 | 驗收方式 | 建議執行者 | 證據 |
| --- | --- | --- | --- | --- |
| 決定 fork 繼續保留 `packages/provider-hyperframes-local`，或跟進上游的移除 | 上游在 `589062ef` 刪除這個套件並改用自有的 HTML program／本機影格算圖（已在審核基線內），本 fork 仍保留並於 2026-11-15 升到 `@hyperframes/*` 0.9.47（2026-11-07 為 0.9.20），等於自己維護一條上游已放棄的算圖路線；不決定的話每次依賴更新都要自己驗算圖 | 決定寫進 `docs/fork/DECISIONS.md`；若續留：寫下維護理由與升級驗證方式；若跟進：評估 `html-program` 等套件的移植成本（依賴升 0.3 才有的重寫，見中期表「升到上游 0.3」），並同步移除 `@hyperframes/*` 相依與 `FORK.md` 差異列 | 維護者（決定） | 上游提交 `589062ef`；`FORK.md`「與上游的差異」；[`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-11-07、2026-11-15 |
| 讓 `typescript` 升到 7.x（現釘 5.9.3），並從 `.github/dependency-deferrals.json` 移除這組 deferral | 2026-11-07 全部釘版試升 7.0.2，`pnpm check` 失敗：`packages/package-loader-node/src/module-scope.ts(8,10..53)` 4 筆 TS2305（`typescript` 沒有匯出 `transpileModule`、`ModuleKind`、`ScriptTarget`、`JsxEmit`——7.0.2 的公開入口只匯出版本，編譯器 API 在 `unstable/*`，而該套件在執行期用 `transpileModule` 轉譯專案的 `.ts`），以及 `packages/studio/src/ui/main.ts(19,8)` TS2882（`../style.css` 缺型別宣告）。已還原，釘版維持 5.9.3 | 觸發條件：`typescript` 發佈穩定（非 `unstable/`）的 transpile API，或維護者決定讓 `package-loader-node` 改用別的轉譯器。驗收：補 CSS side-effect import 的 ambient 宣告，所有 `typescript` 釘版一起升 7.x，`pnpm check` 與完整測試綠，`Dependency freshness` 無該筆 | 維護者（決定轉譯器）＋Claude Sonnet（實作） | [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-11-07；`.github/dependency-deferrals.json`（`@types/node` 因 Node 22/24 runtime 留著，不在此列） |

## 中期：等條件成立再做
| 項目 | 觸發條件 | 驗收方式 | 建議執行者 | 證據 |
| --- | --- | --- | --- | --- |
| 解除 `torch`／`transformers` 告警 | 穩定版 `whisperx` 的相依圖允許 `torch` ≥ 2.13.0 與 `transformers` ≥ 5.10（未被 yank）及其要求的 `huggingface-hub`，且 `uv lock` 可解；只有預發行或只是版號變成 3.8.7 都不算 | `services/whisperx` 鎖檔更新；`pnpm test:whisperx-service` 與本機對齊模型實跑通過；Dependabot 這 9 筆（torch 4、transformers 5）state=fixed | Claude Sonnet | [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-26 WhisperX 釘版警示複查；查法 `https://pypi.org/pypi/whisperx/json` 的 `requires_dist` |
| 移植等上游合併的修正：#394＋#399（text replace）、#395 或 #438（script 逗號數字）、#416（Runtime Profile 錯誤訊息）、#441（保留 `data-hypit-*`）、#446（樣板菱形展開）；手工評估 #426、#406、issue #392；issue #456＋PR #458（HypiHub 結果資產下載的主機白名單，2026-11-02 審：head `dbabd8c3`，仍 OPEN，缺陷在 fork 存在、見 DECISIONS 同日條目）、PR #464（只取 `persist-credentials: false` 兩處，`ci.yml`、`sync-hypihub-docs.yml`；npm 釘版不適用）；issue #473（Studio projection unresolved，fork 未重現）；issue #489（Windows 上受管程式因 `program.log` 被占用而起不來：fork 有同一段程式，但 Windows 11 26300／Windows PowerShell 5.1.26100 實跑不重現，上游尚無修正 PR）；issue #490（`wrap="word"` 在字中斷行：fork 的 `packages/hyperframes/src/text.ts` 結構相同，真實 Chrome 實測可重現，上游尚無修正 PR，回報者建議的 `white-space:nowrap` 會讓比 Frame 寬的字改成溢出）；2026-11-07 已先行移植 #466、#467、#469（兩處）、#471，上游合併後改用上游版本取代（五筆皆 OPEN、已釘 `monitored`，見 DECISIONS 同日條目） | 上游合併對應 PR（`Upstream check` 失敗會提示），或 #441 的 fork 開始載入他人提供的專案、#446 實際遇到 render 卡住；#489、#490 沒有 PR、不在 `monitored`，要靠每週分流看到上游出修正 PR，或 #489 在某台 Windows 上重現、#490 有人實際遇到字中斷行 | 每筆 `git cherry-pick -x` 或依判準四移植做法，附修前失敗的測試；`pwsh -NoProfile -File tools/dev_check.ps1` 綠；`docs/fork/DECISIONS.md` 記結論並推進水位 | Claude Sonnet | [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-25、2026-10-28 上游分流表；`tools/upstream_baseline.json` |
| 升到上游 0.3 | 上游出 0.3.2 以上（已成立：`v0.3.2` = `25454bed`），且 issue #388（Windows 範例重放失敗）與 #433（caption 相鄰 Cue 回歸）已修（2026-11-15 查兩筆仍 OPEN，尚未成立） | 模擬合併的衝突檔逐一處理並保留 fork 的 markup ReDoS 修正與 Windows 啟動器；完整 render 實測（含內建範例重放）通過；同時處理只在 0.3 存在的 #440、#445、#455，並決定是否保留 0.3 才有的 `@hypit/provider-sume`（PR #485，2026-11-10 延後）；v0.3.2 帶入的 `html-document`（#387）、`media-local` 影格重用（#389）、Bach（#390）、HypiHub 的 PixVerse／Bach 欄位對應（#487）一併評估；CI 綠 | Claude Opus | [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-25（v0.3.1 模擬合併 50 個衝突檔）、2026-11-15（v0.3.2 分流） |

## 刻意不做
| 不做什麼 | 理由 | 什麼情況下重新考慮 |
| --- | --- | --- |
| 用 override、dismiss 或移除 WhisperX 對齊功能來讓 `torch`／`transformers` 告警消失 | 沒有與 `whisperx 3.8.6` 相容的修補版；版本號以外的方式不能宣稱已修（[`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-26） | 中期表的 WhisperX 觸發條件成立 |
| 帶進上游的微信 QR／合作夥伴行銷 commit、簡中文件與遷移指南 | 與 fork 的繁中、Windows 定位無關（[`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 2026-10-25「略過」） | 不重新考慮 |
| 恢復上游的 POSIX `hypit` 啟動腳本或非 Windows 驗收 | fork 定位是 Windows 專屬，`hypit.cmd` 取代 POSIX 腳本（[`FORK.md`](FORK.md)「與上游的差異」） | fork 決定支援其他作業系統，且有人能實機驗收 |
| 不經同意對上游開 PR 或推 `upstream` | [`AGENTS.md`](AGENTS.md)「硬性邊界」、[`FORK.md`](FORK.md)「回貢判準」 | 維護者在當次對話明確同意回貢某一筆修正 |

## 維護方式
上游：追 release 軌，`Upstream check` 每週跑；新 PR／issue 逐筆讀 diff、先查缺陷在 fork 是否存在，結論與重看條件寫進 [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md) 再推進水位；能由外部輸入觸發的安全修正可在上游合併前先移植。依賴：月度新鮮度檢查，要延後就寫 deferral 並附理由；推 `origin/main` 前跑 `pwsh -NoProfile -File tools/dev_check.ps1 -Quick`。
