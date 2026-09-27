---
title: Agent 使用者快速開始
description: 從參考影片出發，為你的人物、產品和受眾製作新影片。
---

帶來一條你喜歡的影片，告訴 Agent 想怎麼改：換成你的臉、你的產品，面向新的受眾，或再做一個變體。Hypit 提供製作知識與工具，讓它理解參考片、製作素材，並編排出可以繼續編輯的影片。

## 你需要準備

- 支援 Skill 的 Coding Agent，例如 Claude Code 或 Codex。
- 參考影片，或對目標影片的描述。

[在你的 Agent 中使用 Hypit](./guide/agents.md)介紹不同工作環境與 Agent 入口合作方。

## 1. 安裝 Hypit Skill

```bash
npx skills add hypit-ai/hypit -g
```

在 Agent 中開啟你的影片專案。Skill 提供製作知識，`hypit` 包提供可執行工具。Agent 會檢查已有安裝，協助準備缺少的工具。你無需克隆 Hypit 倉庫。

Hypit 框架免費使用；Coding Agent 和模型服務各自有賬戶與費用。安裝 Skill 或程式並不附帶生成額度。使用自己的 API Key 時，告訴 Agent 金鑰屬於哪個服務，並提供對應介面文件。

已有安裝可以讓 Agent 用 `hypit version --check` 核對版本和[釋出說明](https://github.com/hypit-ai/hypit/releases)。舊版沒有這個命令時，可以用 `hypit --version` 和 `npm view @hypit/hypit@latest version`。程式和 Skill 分別更新，Agent 可以保留影片專案，只更新這次需要的安裝。

## 2. 提供參考，說明想改什麼

<video controls playsInline preload="metadata" width="100%" src="https://storage.googleapis.com/hypit-public-assets/quickstart/2026-09-10/clone_a_video_with_your_product.mp4"></video>

把影片檔案或支援的平臺連結交給 Agent，也可以附上人物照片、產品或品牌素材：

```text
/hypit 參考這個影片：/path/to/video.mp4。
把產品換成 Hypit（hypit.ai），保留抓人的開場和 Ranking 呈現方式。
```

人物、產品、語言、畫幅和行動號召都可以調整。Agent 會理解原片為什麼有效，包括圖形、字幕如何落在具體詞語上，再根據你的目標改寫劇本、設計畫面。理解和決定會記進專案，製作過程中也會向你說明作品的方向與進展。

### **👉 [免費領取 100 個擁有獨特音色的 AI 人物](https://drive.google.com/drive/u/2/folders/18J9Fz7mkU3OQNJ-2Res3eIyFQ2cemIK5)**

## 3. 選擇你想使用的服務

<video controls playsInline preload="metadata" width="100%" src="https://storage.googleapis.com/hypit-public-assets/quickstart/2026-09-10/log_in_to_hypit_or_bring_your_own_key.mp4"></video>

Agent 會先檢查相關工具與已有服務。對於有對白的參考影片，WhisperX 提供詞語及其時間，幫助 Agent 把畫面變化和說話內容聯絡起來。缺少時，Agent 可以協助在本機準備，也會說明託管選項。

[HypiHub](https://hypit.ai) 透過一個賬戶提供託管 WhisperX 和圖片、影片、音色模型。本地服務需要準備時，Agent 會先解釋實際安裝成本與託管選擇，再由你選擇；已有模型快取可以減少準備時間，但不代替這個選擇。

你也可以透過已有或專案編寫的 Provider 使用自己的 Key，或組合本地與託管能力。Agent 根據下一步的工作連線所需能力，持續說明進展，並展示對參考影片的理解。等素材方案明確需要哪些模型時，再解決相應生成賬戶的選擇。

[模型與部署服務](./guide/service-partners.md)介紹服務合作方與自有部署選擇；
[模型與 Provider](./guide/providers.md)說明具體如何接入。

## 4. 確認費用，開始製作

<video controls playsInline preload="metadata" width="100%" src="https://storage.googleapis.com/hypit-public-assets/quickstart/2026-09-10/check_the_quote_and_approve.mp4"></video>

付費工作開始前，Agent 會說明使用哪個賬戶、準備做什麼、可用費率或預計費用，以及還不確定的部分。確認製作範圍和預算後，約定覆蓋的呼叫就可以連續推進。更換賬戶、擴大範圍或超出預算時，再由你決定。

```text
用我的 HypiHub 賬戶完成這條影片，按我們確認的預算推進，開始吧。
```

Agent 會從一開始寫好劇本、表演方向和圖片參考關係，讓生成素材承載明確的創作意圖。等待生成時，可以同時製作圖形與字幕。Hypit 將執行情況和產物儲存在 Build Result 中；Agent 隨製作進展向你說明情況。

## 5. 看成片，繼續修改與創作

<video controls playsInline preload="metadata" width="100%" src="https://storage.googleapis.com/hypit-public-assets/quickstart/2026-09-10/watch_the_finished_video.mp4"></video>

真實素材到位後，Agent 會檢查版面、字幕、圖形和 B-roll 是否清楚、時機是否恰當。交付影片時，也可以開啟 Studio，讓你瀏覽時間線、調整支援的屬性。

繼續對話就能修改作品或製作變體。仍適用的素材會繼續複用，Agent 調整相關劇本、元件或位置。專案儲存在普通檔案裡，可以繼續編輯。

進一步瞭解：[與 Agent 一起製作影片](./guide/skill.md)、[Run 與 Build](./quickstart/run.md)、[Studio](./quickstart/preview.md)。
