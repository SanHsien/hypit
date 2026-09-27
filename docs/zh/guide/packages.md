---
title: 包與擴充套件
description: 影片專案如何透過普通包選擇元件、模型和服務。
---

Hypit 把影片需要什麼，與哪些程式碼和服務完成它，分別表達。新的圖形、模型或 API 來源可以由包提供，再由專案選擇。每個包擁有自己的介面和實現，執行系統負責執行它們組成的依賴圖。

## 各部分的職責

| 部分 | 職責 | 在哪裡選擇 |
| --- | --- | --- |
| 作者元件 | 將作者輸入轉成素材請求、視覺行為或其他圖輸出 | Source 匯入 |
| Model | 定義明確的生成請求與輸出 | Source 匯入 |
| Provider Endpoint | 透過 API 或本地工具執行支援的請求 | Runtime Profile |
| 憑據儲存 | 為 Endpoint 解析具名憑據 | Runtime Profile |
| Result 倉庫 | 保留專案的 Build 記錄與產物檔案 | 專案 Result 配置 |
| Distribution | 提供可執行應用與官方包 | 安裝的 `hypit` 版本 |

例如，Model 描述要生成的影片，Provider 將請求對映到服務；Ranking 元件描述榜單的行為，渲染器將其貢獻繪製到最終編排。兩者都透過明確輸入與輸出參與同一個圖。

## 元件隨作品需要組織

在適合提取秩序的地方組織空間。Media Track 可以呈現普通影片或圖片；專案元件可以把移動的影片視口、標籤和流程圖作為一個場景協調起來。獨立字幕或疊加層仍可分開。共享行為決定哪些內容屬於同一個元件。

對於說話影片，Script Selection 與 Moment 讓元件跟隨表演的含義；作者主導節奏的動畫，則可以在宣告的時鐘上使用秒或幀。[Film 與渲染](../quickstart/composition.md) 介紹這些貢獻如何組成作品。

新元件通常放在影片專案的 `packages/` 中，使用所有者自己的 scope，由專案的普通包管理器宣告。需要跨專案複用時，所有者可以把同一個元件釋出為有版本的 npm 或私有 Registry 包。使用方安裝選定版本，並將 lockfile 與專案一起儲存。

## 安裝與 Source 匯入

Skill、可執行 Distribution 和影片專案分別安裝與更新。`@hypit/hypit` Distribution 包含官方作者包和公開擴充套件 API。所選 Runtime Adapter 可以透過 `hypit runtime up` 準備額外服務依賴；可選作者素材可以按 CLI 給出的準確 `hypit packages install` 命令安裝。專案元件自己的依賴由專案管理。

Source 使用 `@your-studio/scoreboard@1` 這樣的邏輯 Module 地址。npm 安裝的包版本決定實際實現，邏輯 `@1` 標識作者介面。影片 Build 使用這些已安裝的版本；缺包時會報告安裝所需的資訊。

## 編寫與分享擴充套件

外部包使用 `@hypit/hypit/author-kit`、`@hypit/hypit/composition`、`@hypit/hypit/model-kit` 或 `@hypit/hypit/endpoint-kit` 等公開子路徑。將選定的 `@hypit/hypit` 版本作為開發依賴，把擴充套件編譯為 JavaScript，分發它自己的程式碼與素材。`package.json` 中的 activation 入口描述它提供的能力；載入選中的擴充套件時，當前 Distribution 提供公開 Hypit API。

- [新增作者包](./author-packages.md)：從隨發行包提供的可構建元件開始。
- [元件結構](./component-anatomy.md)：元件內部各部分的職責。
- [模型與 Provider](./providers.md)：新模型、服務與憑據的選擇。
- [Runtime](./runtime.md)：Endpoint 和憑據配置。

精確 SDK 型別與實現示例留在對應包的 README 和原始碼中，它們也隨 Distribution 分發。
