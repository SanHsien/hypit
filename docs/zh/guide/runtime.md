---
title: Runtime
description: 選擇執行服務，獨立執行 Build，並保留可持續使用的 Result。
---

Source 描述作品，Run 選擇 Target 與 Candidate，Runtime 使用選定服務執行這些決定，
專案保留實際得到的 Output。

| 所有者 | 職責 |
| --- | --- |
| 專案 | Source、素材、元件包與選定的 Runtime Profile |
| Distribution | 安裝的可執行程式、公共 SDK 與執行實現 |
| Runtime Profile | Provider Endpoint、憑據引用、路由與共享容量 |
| Build | 使用選定依賴圖和配置的一次執行嘗試 |
| Result 倉庫 | 已完成的公開 Output、執行結果和保留的執行證據 |

Core 只規劃和推進依賴，不需要知道作品是一條影片。新元件或
[Provider](./providers.md) 透過相同的包介面提供自己的行為。

## 先確定專案，再選擇 Profile

從影片專案執行命令，或用 `--workspace` 明確指定專案。否則使用當前目錄向上最近的
`package.json`；沒有時，以當前目錄為專案。Source 檔名和 Runtime 配置都不決定這個邊界。

```bash
hypit paths
hypit runtime init
```

`runtime init` 寫入可編輯的起始 `hypit.runtime.json`，透過專案的 `.hypit/runtime`
檔案選擇它。已有 Profile 會保留；此操作不安裝、不登入、不執行。
起始配置提供 HypiHub 託管生成和 WhisperX，以及本地媒體處理、渲染。先按作品需要選擇服務，
再準備它們。本地推理、專案 Provider 可以走同一條路徑，也可以與 HypiHub 混合使用。

`hypit runtime use <profile>` 選擇已有配置；`--runtime <profile>` 只覆蓋當前命令。
命令只讀取當前專案的選擇，不繼承其他專案的 Runtime。命令列相對路徑以當前目錄為基準。

## Runtime Profile

一個只配置本地媒體處理的例子：

```json
{
  "format": "hypit.runtime-local@1",
  "dataRoot": ".hypit/runtimes/local",
  "credentials": {},
  "endpoints": {
    "media.local": { "use": "@hypit/provider-media-local" }
  },
  "bindings": {}
}
```

`dataRoot` 放活躍執行資料和工作檔案，與 `.hypit/runtime` 選擇檔案分開。
`endpoints` 選擇已安裝的 Provider 及其配置。憑據透過選定 Store 中的引用獲取，
金鑰值不寫進 Profile 或 Source。

只有一個相容 Endpoint 時無需 binding；多個 Endpoint 都能提供同一能力時，用 binding
表達選擇。例如已明確配置本地 WhisperX 後：

```json
"bindings": {
  "@hypit/whisperx@1#whisperx-alignment": "whisperx.local"
}
```

安裝包使實現可用，選擇它才賦予它當前環境中的角色。Model 擁有請求含義，Provider 擁有
服務支援、介面對映和價格來源。請求失敗不會偷偷改用另一個賬戶。具體配置看所選 Provider 的 README。

## 按當前需要準備服務

本地媒體處理可以直接準備所選工具並啟動 Worker：

```bash
hypit runtime up --endpoint media.local
hypit runtime status
```

只准備資源、暫不啟動助手或 Worker 時，使用 `hypit programs prepare --endpoint media.local`。
透過 `hypit programs status --endpoint media.local` 檢視就緒情況；檢查配置或排查失敗時，
使用 `hypit doctor --endpoint media.local`。按當前問題選擇命令，不必依次執行所有檢查。

本地媒體處理沒有憑據要求。選中的服務若宣告瞭憑據槽，再單獨使用
`hypit auth status <endpoint>` 檢查。例如，選擇 HypiHub 後使用
`hypit auth status hypihub.default`，需要連線賬戶時執行 `hypit auth login hypihub.default`。

使用 Profile 裡的實際 Endpoint 名稱，可重複 `--endpoint` 選擇多個；省略時覆蓋整個 Profile。
`doctor` 讀取配置、執行 Provider 的診斷，不提交生成。除了錯誤，也要閱讀警告：有憑據或能讀取
模型目錄，不代表每種請求一定成功。沒有選定 Runtime 時，doctor 只檢查專案 Result。

`runtime up` 準備所選本地依賴和 Managed Program，再啟動 Worker；它不登入或啟動託管服務。
`programs prepare|up|status|down` 單獨管理這些本地資源和助手。首次推理環境準備可能涉及大量下載，
應先比較本地準備成本和託管方式，再選擇執行路徑。

`plan <run>` 檢查當前工作需要的能力和輕量就緒狀態。發現 Provider 能力需要可載入的包宣告；
沒有明確 binding 時，可能需要載入其他已宣告 Endpoint。未使用的服務不必啟動或登入。
`build` 不做安裝準備：依賴已就緒時，按需啟動 Worker 並提交一次 Build。
[Run 與 Build](../quickstart/run.md) 說明規劃、價格、付費授權和顯式複用。

## 執行獨立於觀察終端

```bash
hypit build build.svrun --follow
hypit status <build-id> --watch
hypit logs <build-id> --lines 80
```

Worker 擁有執行。`--follow` 和 `status --watch` 只是觀察；關閉終端或等待超時不會取消 Build。
停止某一次嘗試用 `hypit cancel <build-id>`。遠端取消盡力而為，已經完成的 Output 會保留。

失敗的嘗試保持失敗。新 Run 可以選擇已有 Output，開啟新的 Build。如果執行已經結束，
只是 Result 儲存需要處理，`status` 會指出 `hypit result finish <build-id>`：它只完成待儲存工作，
不會重新生成素材。

Build 日誌保留 Provider 階段和診斷。`runtime logs` 檢視 Worker 啟動和程序錯誤；
安裝、服務日誌屬於相應 Managed Program。終端記錄丟失不意味著執行證據也丟失。

## 共享容量，獨立推進

多個 Build 可以同時推進。限制屬於實際使用的賬戶、部署或本地計算資源。
遠端等待不會佔住一個整條 Build 的名額、阻止其他 Build 的本地工作。
Provider 可以分別宣告任務容量和 submit、poll、collect 的短呼叫限制。
`hypit activity --verbose` 展示活躍工作和共享容量。

每個 Build 使用獨立載入的專案實現和選定配置。修改專案元件或 Profile 影響下一次 Build，
已開始的工作保留已載入的實現。Managed Program 有獨立生命週期，預熱好的 WhisperX 可以服務多個 Build。

更新 Distribution 或改變 Worker 繼承的 shell 環境，涉及程序生命週期。重啟前檢查活躍工作：
`runtime down` 會結束活躍執行上下文，`programs down` 單獨停止助手。
執行器丟失會結束所屬嘗試，之後透過新 Build 顯式複用。這種執行分離不是安全沙箱，
也不會凍結元件之後才讀取的檔案。

## 產物留在專案裡

預設 Result 位於 `.hypit/results`。專案透過獨立的 `hypit.results.json` 選擇位置或倉庫，
不放進 Runtime Profile：

```json
{
  "format": "hypit.build-results@1",
  "use": "@hypit/build-result-fs",
  "config": { "path": ".hypit/results" }
}
```

S3 介面卡可以把 Result 放進桶及專案專屬字首。介面卡負責訪問和憑據；更換 Result 儲存不會
搬走活躍 Runtime，也不會自動上傳外部檔案引用。已提交 Build 保留提交時的目標位置，
修改選擇不遷移歷史。

Result 在公開 Output 完成時釋出它們，最後保留終態。新 Output 可以引用已有檔案，複合值內部也一樣，
不意味著多一份素材。顯式本地檔案引用保持實時性；繼續複用時需要保留它們的依賴。
需要交給人或其他工具的獨立檔案時，用 `get` 另行匯出。

`builds`、`history`、`inspect`、`get` 讀取專案 Result，不依賴原 Runtime。
精確儲存和執行介面見
[Result 包](https://github.com/hypit-ai/hypit/blob/main/packages/build-result/README.md) 與
[本地 Runtime 包](https://github.com/hypit-ai/hypit/blob/main/packages/runtime-local/README.md)。
