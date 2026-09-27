---
title: 測試
description: 測試執行器、測試模式與環境門控的測試。
---

## 測試執行器

Hypit 使用 Node.js 內建的測試執行器（`node:test`），而不是 Jest、Vitest 或 Mocha。

```bash
pnpm test          # 包測試 + boundary 測試
```

測試檔案位於 `packages/<name>/test/`，副檔名為 `.test.ts`。它們透過 glob `packages/*/test/**/*.test.ts` 被發現。

## 編寫測試

```typescript
import assert from "node:assert/strict";
import { describe, test } from "node:test";

import { someFunction } from "@hypit/example";

describe("someFunction", () => {
  test("returns the expected result", () => {
    const result = someFunction(input);
    assert.deepStrictEqual(result, expected);
  });
});
```

## 准入規則

預設測試集只保留三類測試：可觀察合同、架構邊界，以及可能破壞產物、重複付費呼叫或讓執行環境不安全的失敗模式。同一事實只在其歸屬層測試一次；跨包裝配使用一個已提交的完整圖夾具，不在每個上層重複搭建半條影片鏈路。

不要為了讓每個包看起來都有覆蓋率而寫測試，也不要重複比對 Manifest 陣列、保留已經刪除的預釋出引數或資料庫形態、把純文件 UI helper 塞進系統測試。元件註冊本身會拒絕 Manifest 與實現漂移。過時行為刪除時，其測試也一起刪除，不把測試集當作專案歷史檔案。

## 測試模式

### 純編譯測試

最常見的模式。編譯一份 Author Source 或 Run Source，然後對生成的圖、匯出、Record 或計劃步驟做斷言。絕不呼叫外部服務。

```typescript
test("compiles the expected exports", async () => {
  const compiler = createCompiler({ root, packageContributions });
  const workspace = await compiler.openFile("fixture.svml");
  const result = await compiler.compileSource(workspace.entry, workspace);
  assert.equal(result.exports.length, 3);
});
```

### Provider 測試

在可控的服務 fixture 上驗證請求對映、媒體傳輸與任務推進，包括失敗行為。
[專案 Provider 示例](https://github.com/hypit-ai/hypit/tree/main/examples/provider-package)
包含一個生命週期測試，會收集返回的圖片且不產生生成費用。真實呼叫使用選定服務和明確的花費範圍；僅有可用金鑰並不構成授權。

### 架構邊界

包邊界由 package manifest、公開入口和共享合同表達；測試只驗證邊界上可觀察的行為。
倉庫不再把原始碼文字正則當作依賴分析或架構審查的替代品。

不得提交客戶或品牌 fixture、憑據痕跡、付費產物、工作站絕對路徑與一次性交付指令碼。
通用的真實呼叫測試需要顯式啟用，不能提交金鑰，且在未啟用時不能產生費用。

## 受環境開關控制的測試

| 命令 | 測試內容 | 前置條件 |
|---|---|---|
| `pnpm test:whisperx-service` | Python WhisperX 服務 | Python 3.13、uv、frozen sync |
| `pnpm test:image-opencv` | OpenCV 影象變換 | 服務自帶的直譯器，位於 `services/image-opencv/.venv`；要用別的直譯器就設 `HYPIT_OPENCV_PYTHON` |

要執行本地 HyperFrames 瀏覽器渲染測試，先在當前 shell 環境中設定 `HYPIT_BROWSER_TESTS=1`，再從倉庫根目錄執行以下命令。需要可用的 Chrome、ffmpeg 和 ffprobe。

```sh
node --import tsx --test packages/provider-hyperframes-local/test/provider.test.ts
```

## 測試 fixtures

測試夾具放在 `packages/<name>/test/fixtures/`。它們是普通的 `.svml`、`.svs` 和 `.svrun` 檔案，用於覆蓋特定的編譯路徑。

`examples/` 目錄同時充當整合級別的夾具：
- `examples/interview/`、`examples/podcast/`、`examples/ranking-football/` — 包含 Source、Run 和素材的完整影片專案。
- `examples/minimal-author-package/` — 帶有 Surface 預覽的完整元件包。
