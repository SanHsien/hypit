---
title: Studio Companion
description: 為元件提供有意義的時間線實體和 Studio 編輯控制元件。
---

元件繪製影片，**Studio Companion** 向編輯器解釋元件：哪些物件出現在時間線上，標籤代表什麼，哪些 Source 屬性可以編輯。專案元件由此可以提供實用控制元件，同時保持視覺實現的可複用性。

## 與元件一起分發

Companion 是應用貢獻。專案元件可以在同一個物理包中，以獨立檔案和 facet 攜帶它；官方 Distribution 透過獨立包提供官方 Companion。兩種情況下，Studio 都載入當前 Source 和 Distribution 所選包的 Companion。

[Companion SDK](https://github.com/hypit-ai/hypit/blob/main/packages/studio-adapter/README.md) 提供 activation 與介面示例。外部包使用 `@hypit/hypit/studio-adapter`，將 Companion 編譯為 JavaScript 並與元件一起分發。修改安裝程式碼後，重啟 Studio 載入新貢獻。

## 描述作者面對的物件

Track Companion 匹配元件的終端 Type 與作者 Surface，使用元件公開值描述時間線實體、標籤、素材預覽和 Inspector 欄位。圖形可以公開外觀、內容、位置和事件時間，而不必暴露每一個內部繪製數值。

控制元件與互動由 Studio 提供，Companion 選擇標量、列表或記錄控制元件，並將其繫結到 Source 值。Film Companion 指明 Film 的 Timeline 與 Track；Script Companion 支援移動 Selection、Moment 標記所需的原始碼對映。同一種 Timeline 也支援沒有 Take 和 Script 行的動畫，其作者宣告的結束時間定義完整範圍。

## 讓編輯保留含義

時間線編輯沿用所選時間關係。移動共享 Script 事件會改變標記與其消費者；基於引數的手柄修改對應作者引數。沒有可支援反向編輯的值，仍可供檢視。

Inspector 欄位繫結到實際修改的作者值。共享 Recipe 或 Frame 可能影響多個使用位置，因此欄位代表的是這項共享決定。Studio 將修改寫到對應 Source，以同一份 Run 重新編譯；修改無法釋出時，顯示錯誤並恢復之前的檔案。

[Studio 中的時間編輯](./studio-temporal-windows.md) 介紹這些關係如何在投影后保留作者含義，[Studio](../quickstart/preview.md) 介紹編輯介面。
