# 為 Hypit 做貢獻

[English](./CONTRIBUTING.en.md)

歡迎提交 Pull Request。文件、示例和翻譯與程式碼同樣重要。

影片元件通常儲存在影片專案自己的 `packages/` 目錄中。需要跨專案共享時，由所有者透過自己的 npm scope 或私有 registry 釋出，再由各專案的包管理器安裝版本化發行包。希望將能力納入官方發行時，可以透過 issue 說明它解決的共同製作需求。

## 開始之前

可以認領一個[已有的 issue](https://github.com/SanHsien/hypit/issues)，也可以新開一個說明你想做的事。凡是會改動協議型別、包邊界或 Provider 契約的改動，請先在 issue 裡說明思路。

## 環境準備

需要 Node.js 22.15+ 和 pnpm 10.33，版本由根目錄的 `packageManager` 欄位指定。

```bash
corepack enable
pnpm install --frozen-lockfile
```

執行真實 Build 還需要 Python 3.10–3.13、uv、ffmpeg 和 Chromium，各自的用途見[開發指南](https://hypit.ai/zh/guide/develop/)。

使用本地渲染的 Profile，首次渲染前執行
`hypit programs up --runtime <profile> --endpoint <render-instance>`；也可以執行
`hypit runtime up --runtime <profile>`，準備整個 Profile 並啟動 Worker。
這一步顯式準備 Chrome，不依賴 pnpm 放行依賴安裝指令碼。
`hypit doctor --runtime <profile>` 只診斷，不安裝。
瀏覽器路徑配置見[本地渲染器 README](packages/provider-hyperframes-local/README.md)。

## 進行改動

| 改動範圍 | 文件 |
| --- | --- |
| 新增 Author 包 | [新增 Author 包](https://hypit.ai/zh/guide/author-packages/) |
| 新增 Provider | [新增 Provider](https://hypit.ai/zh/guide/providers/) |
| 元件內部 | [元件解剖](https://hypit.ai/zh/guide/component-anatomy/) |
| Studio 介面翻譯 | [Studio 本地化](packages/studio/LOCALIZATION.md) |
| 編譯、Run 與 Build | [Runtime](https://hypit.ai/zh/guide/runtime/) |
| 命名、模組邊界、wire 資料 | [程式碼規範](https://hypit.ai/zh/guide/conventions/) |
| 測試與依賴環境的測試套件 | [測試](https://hypit.ai/zh/guide/testing/) |

中英文件分別位於 `docs/` 和 `docs/zh/`，改動一側的頁面時，請一併改動對應的另一側。

## 自查

每個 Pull Request 的 CI 都會執行下面這些命令，提交前先在本地跑一遍：

```bash
pnpm check         # TypeScript 型別檢查
pnpm test          # 包與服務介面卡測試
```

## 打包 Distribution

執行 `npm run pack:distribution`，構建公共型別並將釋出 tarball 寫入 `dist/release/`。
指令碼在臨時目錄中使用 npm 選定的檔案，從英文 README 生成 npm 頁面版本：使用公開圖片地址，
保留兩個 GIF，並將完整影片示例改為連結。倉庫的兩份 README 保持原樣。
`dist/release/README.md` 可用於檢查打包後的文案。

準備好 FFmpeg 和 FFprobe 後，執行
`npm run check:distribution -- dist/release/hypit-hypit-<version>.tgz`。它在倉庫外安裝該包，
編譯包內的聊天示例元件，準備字型和本地渲染器，渲染、匯出並解碼影片。檢查使用獨立的
Hypit 狀態目錄，關閉 Puppeteer 隱式下載，先驗證缺少瀏覽器的診斷，再在獨立快取中
顯式準備瀏覽器。結束時停止自己的 Runtime Worker，失敗時保留臨時專案。
`npm package execution` 工作流在 PR 上執行這項檢查，釋出流程複用它；釋出的就是已經
安裝並執行過的同一份 tarball。

正式釋出請走現有的 GitHub Release 工作流。把下一個穩定 npm 版本寫入 `package.json` 並提交到
`main`。開啟 **Releases → Draft a new release**，選擇該提交，打上標籤 `v<version>`（例如
`v0.1.8`），寫好釋出說明後釋出 Release。帶標籤的提交必須包含此工作流。
`Publish npm` 會核對標籤與版本一致、且該提交屬於 main 的歷史，執行 Linux/Windows 檢查，
構建並檢查打包後的 CLI，再以 `latest` 釋出到 npm，並把 tarball 附加到這次 Release。
檢查與打包使用觸發時的提交，即使隨後 main 繼續前進。此路徑只支援穩定版，不支援預釋出。

**Actions → Publish npm → Run workflow** 在 `main` 上仍然可用：填寫已提交的版本，不勾選
**Publish to npm** 時只執行 Linux/Windows 檢查並提供可下載的 README 與 tarball；勾選後，
在檢查透過後把本次打出的 tarball 釋出為 `latest`。補完一次失敗的 Release 釋出時，先修好
外部問題再重跑該 Release 的工作流。若必須改程式碼，準備新版本和新的 Release。已經發布的
npm 版本會被跳過且不改動 `latest`；已經附在 Release 上的檔案會保留。
push main、只 push 標籤、或儲存草稿 Release 都不會發布 npm。工作流不修改版本，也不建立標籤。
可見的 Release 可以早於 npm 釋出成功；對外宣佈該 npm 版本可用前，先看這次 Actions 的結果。

npm 包的 Trusted Publisher 應配置 GitHub Actions：組織 `hypit-ai`、倉庫 `hypit`、工作流
`publish-npm.yml`，允許直接 `npm publish`，環境名稱留空。釋出 job 使用 OIDC，不需要儲存 npm Token。
已釋出的版本不能覆蓋；`0.1.2` 等 npm 版本與邏輯介面 `@1` 分開管理。

釋出說明應寫明變化的使用者行為，以及受影響的安裝。npm Distribution 與已安裝的 Skill 分開更新：
一次釋出若兩者都變，請同時鏈到相關 Skill 變更並說明兩條更新路徑。已儲存的影片專案及其現有素材
獨立於這兩種安裝。釋出後，先核對工作流結果和 npm 上的已釋出版本，再告訴使用者更新可用。

## 提交 Pull Request

分支名與提交資訊使用同一套字首：分支用 `feat/`、`fix/`、`docs/`，提交資訊用 `feat:`、`fix:`、`docs:`。

## Issue 與 PR 分析

維護者可在 Actions 的 **Repository analysis** 工作流中指定 Issue 或 PR，請求 AI 初步分析。
建議只顯示在該次執行的報告裡，Issue 與 PR 的管理仍由維護者操作。
輸入與分析範圍詳見[維護指南](.github/ISSUE_AUTOMATION_DESIGN.md)。

## 獲取幫助

在 [Discord](https://discord.gg/85hnyQnxpn) 或 [Telegram](https://t.me/hypitai) 提問。
