---
title: Hypit Studio
description: 瀏覽編排、Source 和 Result，編輯作品的時機與外觀。
---

Studio 在瀏覽器中開啟可編輯的影片專案。你可以播放編排、逐幀檢視，在時間線上選擇詞語或圖形，並修改元件公開的屬性。切換到 **Comments** 可以用更大的畫面檢視作品、按時間留下反饋。兩個檢視都可以在匯出之前使用。

## 開啟要編輯的作品

```bash
cd /path/to/my-video
hypit studio --run build.svrun
```

開啟命令列印的網址。Studio 使用這份 Run 選擇的 Author Source 和素材。編輯時要保留已生成素材，可以透過 [`build-record` 與 `satisfy`](./run.md) 選擇已完成的 Output。

**Studio / Comments 左側的地球選單**可以切換介面語言，內建英文和簡體中文。首次訪問跟隨瀏覽器語言，之後記住你的選擇。切換時保留播放位置、選中狀態和評論草稿；稿子、影片字幕和評論內容保持原樣。

| 引數 | 用途 |
| --- | --- |
| `--run <file.svrun>` | 選擇要開啟的 Run。 |
| `--runtime <profile.json>` | 選擇 Runtime Profile；省略時使用專案儲存的 Runtime 選擇。 |
| `--workspace <directory>` | 設定 Source 訪問與修改的專案邊界。 |
| `--port <number>` | 指定瀏覽器服務埠，預設請求 `5179`。 |

所選目標需要指向一個 Film 及其 Timeline。放入的 Take 帶來對應的語義錨點；純動畫也使用 Timeline，宣告結束時間、不放入 Take 即可。兩者都支援視覺元件與屬性編輯。顯示編排所需的素材應已透過 Run 提供。Studio 可以完成所選 Runtime 支援的媒體準備；生成和編碼渲染透過 `hypit build` 提交。

## 在 Comments 一起看作品

開啟命令列印的、以 `#comments` 結尾的網址，可以在畫面旁看到評論區。點選畫面播放或暫停，在選定時間留下意見；點選已儲存的評論即可回到對應幀。評論按時間排列，編號按留言順序顯示。

評論儲存在專案的 `FEEDBACK.json` 中，你和 Agent 都可以讀取、修改、標記完成。傳送評論會儲存意見；寫好後告訴 Agent 開始處理即可。切換到 **Studio** 則可以檢視時間線、Source、Result，以及元件公開的控制元件。開啟兩個檢視都不會編碼影片，也不會提交匯出 Build。

## 瀏覽專案

左側資源庫包含三個檢視：

- **Source** 列出所選 Run 及其 Author、Recipe 檔案，可以選擇檔案檢視或編輯。
- **Tasks** 顯示專案已完成的 Build；選擇 Runtime 後，也能檢視活動執行資訊。
- **Artifacts** 用於檢視 Build Result 中保留的公開產物檔案。

選擇 Artifact 會開啟它供檢視。要將它用於編排，修改 Run 的 Candidate 選擇，讓素材選擇留在可編輯的專案中。

## 畫面、時間線與 Inspector

中央 Preview 使用 HyperFrames 繪製編排，元件佈局、素材取樣和動作與編碼渲染來自同一份編排。調整字幕位置、圖形重點或覆蓋畫面時，可以對照真實素材檢視。

Timeline 把元件的出現放在同一時鐘上。語義編排還會顯示 Segment、Word、Selection 和 Moment。選擇實體即可定位；播放、逐幀、縮放和滾動便於檢視具體轉場或版面。

Inspector 顯示所選實體的屬性。可編輯欄位與時間線手柄由元件的 **Studio Companion** 提供，它負責向 Studio 描述元件。專案元件可以隨繪製程式碼一起提供自己的 Companion。元件能夠渲染，與它開放了哪些編輯控制元件，是兩件事：欄位或手勢需要明確可修改的 Source 值。

## 修改作品

Source 編輯修改所選 `.svml`、`.svs` 或 `.svrun` 檔案。支援的 Inspector 修改和時間線手勢會寫回對應作者值，然後用同一份 Run 重新編譯。移動共享的 Selection 或 Moment，會改變它在 Script 中的位置，使用它的元件隨之更新；修改共享 Frame 或 Recipe，也可能影響多個畫面元素。

編輯後檢視儲存狀態。重新編譯失敗時，Studio 顯示錯誤並恢復之前的檔案。列表與記錄控制元件在結束編輯時儲存完整、有效的值；未填寫完整時會顯示提示。Run 和已載入 Source 檔案會被監聽；更換安裝包、元件程式碼或 Runtime 選擇後，需要重啟 Studio 來載入這些變化。

## 聲音與交付

預覽播放包含 Film 選中的 AudioTrack，例如口播、音樂與音效。匯出影片的音訊由渲染的媒體管線裝配。作品準備好交付後，執行匯出 Build 得到編碼後的成片；Studio 與 Comments 仍可用於檢視可編輯作品、溝通後續修改。

元件作者可以閱讀 [Studio 中的時間編輯](../guide/studio-temporal-windows.md) 瞭解語義編輯，以及 [Companion SDK](https://github.com/hypit-ai/hypit/blob/main/packages/studio-adapter/README.md) 瞭解如何公開元件實體和控制元件。

需要其他介面語言時，可以透過 `--locale-pack ./language.json` 載入本地 JSON 譯文。[本地化指南](https://github.com/hypit-ai/hypit/blob/main/packages/studio/LOCALIZATION.md) 介紹譯文格式、缺項檢查和語言包分享方法。
