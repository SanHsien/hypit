---
title: 程式碼規範
description: 命名、模組邊界、TypeScript 配置與 wire 資料。
---

這些規範面向 Hypit 倉庫內的工作。專案擴充套件使用所有者自己的 scope 和公開的 `@hypit/hypit/*` SDK 子路徑，見 [包與擴充套件](./packages.md)。

## 命名

| 專案 | 約定 | 示例 |
|---|---|---|
| 包目錄 | kebab-case | `packages/speech-alignment/` |
| 包名 | `@hypit/` scope | `@hypit/speech-alignment` |
| Provider 包 | `provider-` 字首 | `@studio/provider-images` |
| TypeScript 檔案 | kebab-case | `align.ts` |
| 匯出型別 | PascalCase | `SpeechAlignment` |
| 匯出函式 | camelCase | `createSpeechAlignment` |

## 模組邊界

- 包透過 `package.json` 的 exports 宣告公開入口；`src/index.ts` 是常見的工作區入口。
- 內部模組使用顯式的 `.js` 副檔名（NodeNext 解析）。
- 跨包匯入使用 `@hypit/*`，絕不跨包邊界使用相對路徑。
- 禁止生產依賴形成迴圈。

## TypeScript 配置

根 `tsconfig.json` 透過普通 pnpm 工作區連結檢查全部包，不維護中央 `paths` 登錄檔。每個包必須在自己的
`dependencies` 或 `devDependencies` 中宣告所有跨包匯入。

| 配置項 | 值 |
|---|---|
| Target | ES2023 |
| Module | NodeNext |
| Module resolution | NodeNext |
| `strict` | `true` |
| `noUncheckedIndexedAccess` | `true` — 索引訪問返回 `T \| undefined` |
| `exactOptionalPropertyTypes` | `true` — `undefined` 必須顯式寫出 |

新增包不需要修改根 TypeScript 配置。

## wire 資料

- 所有持久化資料使用 `@1` wire 格式版本。
- 專案自有的 Module 與 Frontend 身份統一使用邏輯版本字面量 `1`。
- 包版本透過 npm 或 pnpm 選擇物理發行，與邏輯 Module 和 Frontend 介面版本分別表達。
- 包管理器和 lockfile 負責固定安裝版本及其依賴。
- wire 型別定義在 `@hypit/protocol` 中，且不可變。
- Nominal Type 由 Module 擁有，不在中心化的聯合型別中註冊。
- 型別 schema 使用與 JSON 相容的結構，而不是 TypeScript 介面。

## 錯誤處理

- 編譯失敗時丟擲帶有描述性資訊的錯誤，其中包含原始碼位置。
- 執行時失敗在 Build 狀態機中記錄為 Operation 失敗。
- 服務協議允許的有限傳輸重試由 Provider 負責。
- 執行嘗試失敗會結束 Build；後續工作使用新的 Run 與 Build，顯式選擇已完成 Output 複用。
