# AGENTS.md

給 Codex、Claude Code、Cursor 與其他自動化代理在本專案工作時的指引。

## 專案定位

這是 [`hypit-ai/hypit`](https://github.com/hypit-ai/hypit) 的 MIT fork。
專案核心為 AI 代理可操控的程式化剪輯、多軌混音與短影片模板生成系統（含 HyperFrames、SVS、Film、Caption、Studio）。

`origin` 是 `SanHsien/hypit`，`upstream` 是原作者 repo，預設分支皆為 `main`。
本 fork 的維護差異記在 [`FORK.md`](FORK.md) 與 [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md)。

主要開發與完整驗收環境是 **Windows 11 + PowerShell**。

## 硬性邊界

- **對外只打主人的 repo。** PR、push、release 一律指向 `SanHsien/hypit`。
  對上游開 PR 或 push 預設絕對禁止，除非維護者在當次對話明確同意。
- 每個工作環境先確認 `gh repo set-default SanHsien/hypit`。
- 日常開發推送到 `origin/main` 前，必須通過 Windows 閘門：
  `pwsh -NoProfile -File tools/dev_check.ps1 -Quick`（或完整無參數版本）。
- 保持乾淨工作目錄，不隨意刪除上游核心套件或依賴。

