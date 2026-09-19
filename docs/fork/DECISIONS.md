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

