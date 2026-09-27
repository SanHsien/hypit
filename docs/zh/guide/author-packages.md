---
title: 新增作者包
description: 製作專案元件、將其用於影片，並在有需要時分享。
---

建立元件是製作影片的一部分。從場景需要的行為出發：哪些內容共同出現，哪些內容會變化，由什麼事件驅動。普通素材呈現可以使用 Media Track；一個播放中的影片移到側面、同時讓出空間展示流程圖，可以屬於同一個專案元件，獨立字幕繼續分開。

## 從完整的包開始

安裝的 `@hypit/hypit` Distribution 包含 [`examples/minimal-author-package/packages/example-component`](https://github.com/hypit-ai/hypit/tree/main/examples/minimal-author-package/packages/example-component)。將該目錄複製到影片專案的 `packages/`，把包名與 Module 改為自己的 scope 和名稱，將示例中的 `workspace:*` Hypit 開發依賴改成專案所用的 Distribution 版本。

在複製後的包目錄執行：

```bash
npm install --save-dev @hypit/hypit@<selected-release>
npm run build
```

示例提供 TypeScript 構建配置、Manifest、Surface、Fragment、Producer、activation 和小型 preview Source。[包的 README](https://github.com/hypit-ai/hypit/blob/main/examples/minimal-author-package/packages/example-component/README.md) 介紹準確檔案與設定。專案可以用普通包管理器的 workspace 或本地包依賴安裝元件。

## 給元件有用的介面

公開另一個影片作者真正會改的決定：內容、素材、位置、外觀和有意義的事件。轉場可以接收一個 Moment，決定何時改變佈局；接收一個 Selection，決定整個場景何時存在。純動畫則可以接收作者指定的事件時間。將這些輸入投影到選定時鐘，再按得到的排程繪製場景。

呈現已有說話表演時，消費它的 Timeline，讓畫面取樣與口播使用相同的 Take 和素材位置。其他影片輸入以歸一化媒體進入時間線。[響應式講解場景](https://github.com/hypit-ai/hypit/tree/main/examples/semantic-composition/packages/responsive-explainer) 展示持續播放的影片如何在 HTML 場景裡從全屏移到側邊豎屏。[聊天示例](https://github.com/hypit-ai/hypit/tree/main/examples/semantic-composition/packages/chat-scene) 展示同一個事件介面如何接受作者時間或 Script Moment。

Style 一類 Surface 在裸作者 id 下公開其值，例如 `style={board-style}`；獨立輸出可以使用 `.visual`、`.audio`、`.track` 等有意義的字尾。在元件自己的 vocabulary 和 README 中說明名稱與可用值。

## 實現並檢視場景

作者包 API 使用 `@hypit/hypit/author-kit`，消費的領域值使用對應公開子路徑。[元件結構](./component-anatomy.md) 介紹 Manifest、Surface、Fragment 和 Producer 如何配合。專案文案與素材作為輸入，元件自己的面板、邊框與裝飾由實現繪製。

preview Source 為作者提供可開啟或渲染的小例子。檢視能說明行為的狀態：進入、關鍵變化、停留佈局和退出。也要在實際編排中檢視，這時內容、空間和時機才有具體用途。

需要更豐富的互動編輯時，可以新增 Studio Companion。[Companion SDK](https://github.com/hypit-ai/hypit/blob/main/packages/studio-adapter/README.md) 介紹如何公開時間線實體、屬性和 Source 繫結。繪製程式碼和 Companion 是同一個包中分別提供的貢獻。

## 使用與分享

在 Source 中匯入已安裝元件的邏輯 Module：

```svml
<import as="mine" from="@your-studio/my-component@1"/>
```

將它宣告的元素與輸出用於編排。`hypit vocabulary` 展示作者介面，`hypit check` 檢查 Source 或 Run。元件 README 應包含可複製示例、輸出、實用的創作選擇和行為示意圖。

元件服務於當前作品時，就與專案一起儲存。需要分享時，選擇釋出版本，編譯並用 `npm pack` 打包程式碼和素材，或透過所有者自己的 scope 釋出到 npm 或私有 Registry。釋出到 Registry 時去掉 `private: true`，補充普通包元資訊。使用者安裝選定版本並提交包管理器 lockfile。使用元件不需要 Hypit 倉庫 checkout，也不需要向主倉庫提 PR。

## 閱讀一個完整作品

[複雜口播示例](https://github.com/hypit-ai/hypit/tree/main/examples/complex-explainer) 將主持人變場、獨立字幕、網頁演示和多個協同動效場景組合成完整作品。專案說明把每種修改指向負責它的 Source、Recipe 或元件包。它區分了三件事：劃分元件職責、開放有用引數、為真實需求設計複用。已接受素材單獨提供，預設 Run 可以直接開啟並渲染這份編排，無需重新請求生成。

可以直接[觀看最終成片](https://storage.googleapis.com/hypit-public-assets/assets/examples/complex-explainer/v1/20260914/final.mp4)，也可以按照示例中的下載說明取得素材包，在 Studio 中開啟完整作品。
