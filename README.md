<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./docs/public/hypit-logo-light.svg">
    <img alt="Hypit" src="./docs/public/hypit-logo-dark.svg" width="400" height="122">
  </picture>
</p>

<h3 align="center">讓 AI Agent 復刻任何爆款影片</h3>
<p align="center">一條命令，100 個變體，1 億播放量。</p>

<p align="center">
  <a href="https://hypit.ai"><strong>Demo</strong></a>
  &nbsp;&bull;&nbsp;
  <a href="https://hypit.ai/zh/quickstart/"><strong>快速開始</strong></a>
  &nbsp;&bull;&nbsp;
  <a href="https://hypit.ai/zh/guide/develop/"><strong>開發指南</strong></a>
  &nbsp;&bull;&nbsp;
  <a href="./README.en.md"><strong>English</strong></a>
</p>

<p align="center">
  <img alt="Stars" src="https://img.shields.io/github/stars/hypit-ai/hypit?style=flat-square&color=FFD700&logo=github&logoColor=white&label=Stars">
  <a href="./package.json"><img alt="Node 22.15+" src="https://img.shields.io/badge/Node.js-22.15%2B-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white"></a>
  <a href="./package.json"><img alt="pnpm 10.33" src="https://img.shields.io/badge/pnpm-10.33-F69220?style=flat-square&logo=pnpm&logoColor=white"></a>
  <a href="./package.json"><img alt="TypeScript 5.9" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white"></a>
  <a href="./LICENSE"><img alt="License" src="https://img.shields.io/badge/License-Apache--2.0%20with%20conditions-E3B341?style=flat-square"></a>
</p>

> **這是 [`hypit-ai/hypit`](https://github.com/hypit-ai/hypit) 的 Windows 專屬維護型 fork**，沿用 MIT License 與完整 Git 歷史。產品框架、短影音模板與組件模型跟隨上游；**本 fork 僅維護 Windows 版本（Windows 11 + PowerShell 為唯一官方支援環境）**，移除 POSIX / Linux / macOS 等跨平台冗餘腳本，並建立專屬 Windows 開發／驗收 gate 及上游自動化追蹤。差異見 [`FORK.md`](FORK.md)，決策細節見 [`docs/fork/DECISIONS.md`](docs/fork/DECISIONS.md)。

## Hypit

Hypit 為 AI Agent（Claude Code、Codex 等）提供了一套製作影片的語言和系統。給它一條影片，Agent 就能把它復刻成一份完整的 workflow：畫面、字幕、B-roll、特效，全部錨定在詞上，而不是秒上。

**需要說明的是：** 復刻影片是最快的入口，但不是唯一的入口。你可以從我們的模板開始，也可以描述你想要的影片，讓 Agent 從零寫出一份 workflow。生成模型同樣不是必需的：字幕、動效和程式碼渲染的畫面，不呼叫生成模型也能編譯成一條成片，因此可以不產生模型服務費用。

![SVML 原始檔與實時影片預覽](https://github.com/user-attachments/assets/981c28e8-ddab-4164-85bc-03b5d71275dc)

<p align="center"><em>左側是 SVML 原始檔，右側實時呈現對應影片。</em></p>

## 只安裝一次

```bash
npx skills add hypit-ai/hypit -g
```

這條命令安裝 Skill。首次使用時，Agent 會檢查 Hypit 可執行程式，並按需協助安裝。
影片專案可以放在任意位置。

Hypit 本身免費使用；Coding Agent 和模型服務各有自己的賬號與費用。
HypiHub 是我們推薦的託管模型服務，也可以使用你自己的 API 或本地模型。
把服務名稱和 API 文件告訴 Agent，它會據此配置合適的連線。

[Agent 工作環境與入口合作方](./docs/zh/guide/agents.md) ·
[模型與部署服務](./docs/zh/guide/service-partners.md)

## 示例

### UGC

[Generation source](examples/ranking-football/reference.svml) · [Run and production notes](examples/ranking-football/README.md)

<table>
  <tr>
    <th width="16%">參考影片</th>
    <td width="28%"></td>
    <td width="28%"><video src="https://github.com/user-attachments/assets/f573bdac-62da-4b5d-825d-54d5880a7026" controls muted></video></td>
    <td width="28%"></td>
  </tr>
  <tr>
    <th width="16%">復刻影片</th>
    <td width="28%"><video src="https://github.com/user-attachments/assets/3ffd9951-e423-4a48-ad8f-5c596627be69" controls muted></video></td>
    <td width="28%"><video src="https://github.com/user-attachments/assets/eb62372d-2464-4a4b-83ee-41e227f99a8e" controls muted></video></td>
    <td width="28%"><video src="https://github.com/user-attachments/assets/9ba050f6-355d-460c-b684-7344cf49c051" controls muted></video></td>
  </tr>
  <tr>
    <td colspan="4"><p><b>“GOAT DEBATE”</b>——一條 20 秒的足球 Tier List，把 Ronaldo 排進 D 級，把 Messi 排進 S 級。A-roll 是兩段 Seedance 2 Mini 生成的 720p 吐槽片段，B-roll 是 GPT Image 2 生成的一張 2K 哥特女孩肖像和十張 1K 腦腐圖；WhisperX 負責逐詞對齊，排行榜跟著音效逐條落位，再配上彩色詞盒卡拉 OK 字幕、絲滑的動畫和抓耳的背景音樂，最後由 64 個無頭 Chromium 程序併發渲染。</p><p>上面給出了三個復刻版本：把解說員換成香蕉貓；翻轉排名，讓 Ronaldo 成為 GOAT；把所有球員換成科技公司創始人。同一套爆款結構，可以產出完全不同的爆款影片。</p><p>總成本：<b>$1.15</b>。</p></td>
  </tr>
</table>

### 播客

[Generation source](examples/podcast/reference.svml) · [Run and production notes](examples/podcast/README.md)

<table>
  <tr>
    <th width="16%">參考影片</th>
    <td width="28%"></td>
    <td width="28%"><video src="https://github.com/user-attachments/assets/22df72b8-4831-4eb6-957d-676ae9b04f2d" controls muted></video></td>
    <td width="28%"></td>
  </tr>
  <tr>
    <th width="16%">復刻影片</th>
    <td width="28%"><video src="https://github.com/user-attachments/assets/9c14c5ae-bd12-4961-9d57-a46d3a2154c6" controls muted></video></td>
    <td width="28%"><video src="https://github.com/user-attachments/assets/f44c653b-f520-4715-9530-4c2f42114387" controls muted></video></td>
    <td width="28%"><video src="https://github.com/user-attachments/assets/92f9bf8b-4f83-4d9b-a0e8-ca27fab2cc94" controls muted></video></td>
  </tr>
  <tr>
    <td colspan="4"><p><b>“DAILY CREATINE”</b>——一條 18 秒的播客片段，肌肉芭比向一個瘦弱的大學生強推肌酸。A-roll 是 Seedance 2 Mini 生成的三段 720p 對峙鏡頭，外加一段展示理想生活方式的 B-roll；影象是 GPT Image 2 生成的兩張 2K AI 角色肖像和三張 1K 蒙太奇畫面。WhisperX 負責逐詞對齊，再配上分屏訪談版式、區分說話人的卡拉 OK 字幕、產品遞出的瞬間和背景音樂，最後由 64 個無頭 Chromium 程序併發渲染。</p><p>上面給出了三個復刻版本：把兩位主播換成 Pepe 和 Doge，爭論狗狗手臂；把肌酸換成視黃醇，讓漂亮男孩吐槽假小子的毛孔；把實體產品換成 CheatGPT 應用，讓頭腦簡單的體育生績點碾壓博士生。同一套播客形式，三個廣告垂類。</p><p>總成本：<b>$1.07</b>。</p></td>
  </tr>
</table>

### 街頭採訪

[Generation source](examples/interview/reference.svml) · [Run and production notes](examples/interview/README.md)

<table>
  <tr>
    <th width="16%">參考影片</th>
    <td width="28%"></td>
    <td width="28%"><video src="https://github.com/user-attachments/assets/666ad535-3231-44fb-b9bc-271817ae79de" controls muted></video></td>
    <td width="28%"></td>
  </tr>
  <tr>
    <th width="16%">復刻影片</th>
    <td width="28%"><video src="https://github.com/user-attachments/assets/c39a0425-2dcb-4709-b894-6a9423d351e3" controls muted></video></td>
    <td width="28%"><video src="https://github.com/user-attachments/assets/8f71552c-0ad1-4d29-8c4e-3b937ab7c887" controls muted></video></td>
    <td width="28%"><video src="https://github.com/user-attachments/assets/d9cab2e7-e08b-48ef-8d25-bc28ca9efc17" controls muted></video></td>
  </tr>
  <tr>
    <td colspan="4"><p><b>“NICE RIDE”</b>——一條 26 秒的街頭採訪，黑幫太太分享賺到第一個一百萬的三條規則。三段由 Seedance 2 Mini 生成的 720p A-roll，一張由 GPT Image 2 生成的 2K AI 角色肖像；WhisperX 負責逐詞對齊，再利用 Google Video Intelligence 和 YOLOv8 AnimeFace 提供的人臉邊界框，驅動跟隨人臉的說話人專屬彩色字幕；配合跟音效同步的表情符號揭示板、彩色閃爍、揭示音效和背景音樂，最後由 64 個無頭 Chromium 程序併發渲染。</p><p>上面給出了三個復刻版本：把主播換成 Wojak 和 Chad；把所有內容翻譯成西班牙語，同時保持完全相同的 punchline；或者把蘭博基尼換成 F1 賽車，讓 Ada 向 Leon 解釋自己如何因為開 Uber 意外贏得大獎賽。同樣的三階段揭示結構，三種不同的街頭採訪混剪。</p><p>總成本：<b>$1.09</b>。</p></td>
  </tr>
</table>

## 使用 Hypit skill

程式設計 Agent 可以直接使用 `/hypit` skill。在任意空目錄或現有專案目錄中開啟會話，讓 Agent 為你建立影片：

```text
/hypit 復刻這個影片：/path/to/video.mp4，把排行榜內容換成 Hypit（官網：hypit.ai）與其他 AI 影片產品的對比。
```

也可以不提供參考影片，直接從描述開始：

```text
/hypit 做一個 ranking 影片，把 Hypit 排到 S 級。
```

Agent 會檢查環境，索要這條影片需要的憑據，生成素材並構建成片。

### **👉 [免費獲得 100 個擁有獨特音色的 AI 人物形象](https://drive.google.com/drive/u/2/folders/18J9Fz7mkU3OQNJ-2Res3eIyFQ2cemIK5)**

## 為什麼選擇 Hypit

- **真的能 Clone：** 丟一條影片進來，拿到整份 workflow —— 畫面、字幕、B-roll、特效。不是拆解指令碼。
- **一份 workflow，100 個變體：** 複用編排和已有素材，需要變化的部分再生成。
- **可插拔元件：** 換主播不動字幕。用元件庫、fork 一個，或自己寫。
- **開源：** Hypit 不按人頭或渲染次數收費，也不新增水印。模型服務費用由你選擇的服務方收取。

## Hypit 能構建什麼

丟一條影片進來，Agent 把整套 workflow 克隆下來；或者直接描述你想要的影片，讓它從零寫一份。拿到的都是可編輯、可重跑的工作流，而不是一次性的成片。

- **資訊流廣告** —— 從 Meta 廣告庫拉一條正在跑的廣告，克隆成 workflow，換上你的產品，當天發出 50 個 Hook 變體。兩週後創意衰退，換一批開頭重跑，主體一個字不動。
- **復刻爆款** —— 任何 TikTok、Reels、Shorts 都能變成模板：換主播、換 Hook、換產品、換語言、換畫幅。
- **帶貨影片** —— 一個跑通的格式，每天換一個 SKU。換產品、換價格、換 CTA，轉化率跑出來的結構原封不動。
- **AI UGC 與口播** —— 配音、詞級字幕、B-roll、評論區貼紙、卡點剪輯，全部自動掛好。
- **播客與採訪切片** —— 分屏佈局、區分說話人的字幕、反應特效。
- **程式碼渲染的影片** —— 畫面完全由前端程式碼驅動，本地渲染，無需呼叫生成模型 API。
- **多語言版本** —— 同一條影片十種語言。改一句臺詞，時間軸自己重排。

## 貢獻指南

歡迎提交 Pull Request，文件、示例和翻譯與程式碼同樣重要。可以認領一個已有的 issue，也可以為你想做的事新開一個，我們會協助你把它合並進來。環境準備、CI 會跑的檢查和 Pull Request 流程見 [CONTRIBUTING.md](./CONTRIBUTING.md)。

建立元件是正常的影片製作工作，元件通常留在擁有它的影片專案中。所有者希望分享時，可以把同一份包作為版本化 tarball 直接交付，也可以釋出到自己的 npm scope 或私有 registry。希望某個元件由 Hypit 官方 Distribution 維護時，先透過 issue 說明它解決的共同產品需求；官方收錄與普通的社群分享是兩件事。

[開發指南](https://hypit.ai/zh/guide/develop/)說明了前置條件、日常命令和倉庫結構。

<table>
  <tr>
    <td>缺陷回報</td>
    <td><a href="https://github.com/SanHsien/hypit/issues">提交 issue</a></td>
  </tr>
  <tr>
    <td>功能建議</td>
    <td><a href="https://github.com/SanHsien/hypit/issues">提交 issue</a></td>
  </tr>
</table>

## 來源宣告與致敬 (Credits)

本專案 Fork 自 [`hypit-ai/hypit`](https://github.com/hypit-ai/hypit)，原始專案採用 [MIT License](./LICENSE)。
感謝原作者團隊開發並開源 Hypit 程式化剪輯與 AI 短影音生成框架。

## 許可證

Hypit 採用 [Hypit 開源許可證 (MIT)](./LICENSE)。你創作的影片和其他產出歸你所有；第三方模型與服務可能另有條款。
