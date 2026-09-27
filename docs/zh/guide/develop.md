---
title: 開發指南
description: 開始 Hypit 開發工作。
---

## 前置條件

| 工具 | 版本 | 用於 |
|---|---|---|
| Node.js | 22.15+ | 所有工作 |
| pnpm | 10.33.x | workspace 管理；由根目錄 `packageManager` 欄位選擇 |
| Python | 3.10–3.13 | 本地 WhisperX 與 OpenCV Managed Program |
| uv | latest | Python 環境管理 |
| ffmpeg / ffprobe | 較新的穩定版 | 媒體處理 |
| Chrome / Chromium | 由 `hypit runtime up` 下載 | 本地 HyperFrames 渲染 |

只有 Node.js 與 pnpm 是硬性要求。其餘都只在跑真實 Builds 時才需要。

首次本地渲染前執行 `hypit programs up --runtime <profile> --endpoint <render-instance>`。
`hypit runtime up --runtime <profile>` 也會準備 Profile 的程式並啟動 Worker。
這一步準備瀏覽器，不依賴 pnpm 放行依賴安裝指令碼。
使用 `hypit doctor --runtime <profile>` 檢查缺失環境；診斷不會安裝瀏覽器。

## 日常工作流

```bash
corepack enable
pnpm install --frozen-lockfile # 拉取程式碼或改動依賴之後
pnpm check            # TypeScript 型別檢查
pnpm test             # 完整測試套件
```

| 命令 | 實際執行什麼 |
|---|---|
| `pnpm check` | `tsc -p tsconfig.json --noEmit` |
| `pnpm test` | 透過 Node test runner 執行 package、service-adapter 與倉庫邊界測試 |

關於受環境開關控制的測試與測試寫法，參見 [測試](./testing.md)。

## 倉庫結構

```text
hypit/
├── packages/              workspace packages
├── docs/                  VitePress documentation site
├── examples/              runnable example sources
├── services/              本地媒體與轉寫服務
├── test/                  repository boundary tests and shared fixtures
├── package.json           root workspace manifest
├── pnpm-workspace.yaml    package, service and example-component workspaces
└── tsconfig.json          TypeScript config
```

## 指南目錄

| 指南 | 主題 |
|---|---|
| [與 Agent 一起製作影片](./skill.md) | 創作方向、服務選擇與可編輯專案 |
| [包與擴充套件](./packages.md) | 元件、模型與服務的職責，安裝與分享 |
| [新增 Author 包](./author-packages.md) | 分步說明：新增元件、Surface、詞表與預覽圖、activation |
| [模型與 Provider](./providers.md) | 選擇賬戶與 API，開發 Model 或 Provider 包 |
| [Runtime](./runtime.md) | Profile、Workspace、執行與生命週期邊界 |
| [Studio 本地化](https://github.com/hypit-ai/hypit/blob/main/packages/studio/LOCALIZATION.md) | 翻譯介面文案，載入本地 JSON 或已安裝的語言包 |
| [測試](./testing.md) | 測試執行器、寫法、示例、boundary tests |
| [程式碼規範](./conventions.md) | 命名、模組邊界、wire 資料、TypeScript 配置 |
