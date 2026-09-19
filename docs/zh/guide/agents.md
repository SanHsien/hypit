---
title: 在你的 Agent 中使用 Hypit
description: 選擇與 Agent 協作的入口，安裝 Hypit，並讓影片專案持續可用。
---

Hypit 為 Agent 提供影片製作知識與執行工具。你與 Agent 溝通，它讀寫專案、製作素材並執行編排。
選擇哪個 Agent，與選擇哪些[模型和部署服務](./service-partners.md)來製作素材，是兩件事。

## 從你的工作環境開始

Claude Code 和 Codex 是常用入口。在 Agent 中開啟影片專案，透過它支援的 Skill 安裝方式安裝 Hypit。
使用 skills CLI 時，命令為：

```bash
npx skills add hypit-ai/hypit -g
```

隨後 Agent 可以找到或安裝 `@hypit/hypit` 可執行程式。把參考影片或創作要求交給它，說明想要的結果。
[快速開始](../quickstart.md) 介紹實際製作過程。這裡列出的是使用方式；合作關係在下方單獨標明。

終端、桌面應用或瀏覽器都可以是入口。真正影響製作的是背後的工作環境：能否訪問專案檔案、
執行 Hypit 與所選工具，以及把作品展示給你。使用遠端 Agent 時，將素材交給它實際執行的環境，
透過該環境的預覽轉發或檔案交付檢視作品。遠端機器的 localhost 地址，並不是你電腦上的預覽地址。

專案和生成素材應當在會話或臨時環境結束後仍然可用。Agent 可以說明檔案儲存位置，開啟 Studio
供你檢視時間線、調整屬性，也可以開啟 Comments，按具體時刻留下意見。審閱編排與匯出影片是不同的操作。

## Agent 入口合作方：OpenAgents

[OpenAgents](https://openagents.org/) 是 Hypit 的 Agent 入口合作方。它的
[Launcher 與工作區文件](https://openagents.org/docs/en/launcher/what-is-launcher)
介紹瞭如何管理 Coding Agent，並將其連線到共享工作區。

在你透過它執行的 Agent 工作環境中使用 Hypit。Hypit Skill 的維護源是倉庫的
[`skills/hypit/`](https://github.com/hypit-ai/hypit/tree/main/skills/hypit) 目錄；安裝時包含引用頁與支援檔案。
具體入口和安裝選項遵循 OpenAgents 當前提供的方法，製作仍使用同一套 Hypit 工具與專案檔案。
Skill 由所選安裝渠道更新，可執行程式透過自己的包安裝更新；模型服務賬戶另外選擇。

## 接入其他 Agent 環境

整合方可以提供 Skill 的讀取與安裝、專案檔案和命令執行能力，以及預覽和成片的訪問方式。
它沿用 Hypit 已有介面，不需要為每個 Agent 創造另一套影片語法或 Provider。
從環境實際開放的能力出發，把作品儲存在哪裡、能儲存多久、怎樣檢視交代清楚。

素材生成的接入見[模型與 Provider](./providers.md)和[模型與部署服務合作方](./service-partners.md)。
