# Fork 維護說明

本 repo fork 自 [`hypit-ai/hypit`](https://github.com/hypit-ai/hypit)，
沿用 MIT License 與完整 Git 歷史。

## 為什麼維護 fork

- 追蹤與使用 hypit 的 AI 代理程式化剪輯、短影音模板流水線（HyperFrames / SVS / Film / Caption / Studio）。
- 採 Windows-first 維護：Windows 11 + PowerShell 是主要開發、除錯與驗收環境。
- 公開入口增加繁體中文文件與指引。
- 建立可重現的 Windows 開發 gate（`tools/dev_check.ps1`）、上游同步檢查與自動化追蹤。

**回貢判準：修的是上游的 bug 就送回去；這裡獨創的文件與 Windows 維護骨架留在這裡。**
回貢前必須在當次對話取得維護者明確同意；「fork」「建開發環境」「開 PR」都不是同意。

## 與上游的差異

| 項目 | 說明 |
|---|---|
| `AGENTS.md` / `CLAUDE.md` | 本 fork 的 AI 維護單一真相源 |
| `NOTICE.md` / `FORK.md` | 來源、授權與同步說明 |
| `tools/dev_check.ps1` | Windows 本機一鍵 gate（TypeCheck + Tests + UpstreamCheck） |
| `tools/check_upstream_updates.py` | 上游 commit / PR / Issue 增量檢查 |
| `tools/upstream_baseline.json` | 上游已審核水位紀錄 |
| `.github/workflows/upstream-check.yml` | 每週對 `upstream/main` 檢查新 commit 與 ticket |
| `docs/fork/DECISIONS.md`、`docs/fork/UPSTREAM.md` | fork 維護決策與同步指引 |
| `.cursor/rules/no-upstream-pr.mdc` | 防呆規則：禁止誤對上游開 PR 或推送 |

## 分支與 remote

- `origin/main`：`SanHsien/hypit`，主要維護線。
- `upstream/main`：`hypit-ai/hypit` 原專案，只追蹤、不推送。
- 日常修改在本機跑 gate（`pwsh -NoProfile -File tools/dev_check.ps1 -Quick` 或完整版）後推 `origin/main`。

不要 `git push upstream`。同步方式見 [`docs/fork/UPSTREAM.md`](docs/fork/UPSTREAM.md)。

## 開發環境指引

```powershell
git clone https://github.com/SanHsien/hypit.git
cd hypit
gh repo set-default SanHsien/hypit
pnpm install
pwsh -NoProfile -File tools/dev_check.ps1 -Quick
```

