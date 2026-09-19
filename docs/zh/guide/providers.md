---
title: 模型與 Provider
description: 選擇賬戶、連線服務或新增模型，沿用同一套影片執行系統。
---

**Model** 定義要生成什麼：輸入、支援的引數和輸出型別。**Provider** 知道如何透過某個服務完成這個請求。**Endpoint** 是配置好的 Provider 例項，包含服務地址、憑據引用和容量。Runtime Profile 將所需能力繫結到 Endpoint。

官方發行包含本地 Provider、HypiHub Provider，以及 TokenDance、HiAPI、Pollo、Monid 四個使用 API Key 的 Provider，各自覆蓋該服務提供的已安裝模型。其他服務透過專案或作者自己的包接入；Agent 可以使用公開 SDK 編寫所需接入，就像為影片建立視覺元件。[模型與部署服務](./service-partners.md) 集中介紹獨立合作服務，它們沿用同一套擴充套件方式。選擇執行服務，與[選擇 Agent 工作環境](./agents.md)是兩件事。

HypiHub 是我們推薦的整合託管服務。**BYOK** 指使用自己賬戶的 API Key：Key 透過相容的 Provider 連線到簽發它的服務。告訴 Agent 你已有哪個服務及其 API 文件，具體接線和專案包可以由 Agent 完成。Key 負責授權請求，本身不會實現 API 介面。一個專案可以為不同能力使用不同服務，分別使用各自的賬戶並按各自規則計費。

## 根據需求選擇修改位置

| 你想做什麼 | 修改哪裡 |
| --- | --- |
| 同一服務換 Key | 憑據引用與所選 Endpoint 配置 |
| 換成協議相容的服務地址 | Provider 已支援的地址或部署配置 |
| 在自己的雲部署上執行模型 | 準備推理服務，再配置相容 Provider 或實現其 API |
| 同一模型換成不同 API 來源 | 安裝或編寫該 API 的 Provider，並選擇它的 Endpoint |
| 使用尚未定義的新模型 | 新增 Model 包，並由支援其請求的 Provider 執行 |

兩個服務即使提供同一個模型，請求格式、限制和可用引數也可能不同。Provider 檢查請求是否受該服務支援，並說明不匹配的原因。Profile 決定使用哪個來源；該來源報錯並不授權透過另一個賬戶花錢。

已有安裝時，先檢查所選 Profile 和憑據狀態。起始 Profile 提供配置示例；連線賬戶或準備依賴前，先選擇想使用的服務。[Run 與 Build](../quickstart/run.md) 介紹相關命令。

## 使用自有模型部署

你可以在自己管理的算力上執行模型，將得到的推理服務連線到 Hypit。雲平臺提供部署與算力，
Model 定義生成請求，Provider 實現推理服務的 API，Endpoint 選擇實際部署地址與憑據。

完整協議一致時，可以用已有 Provider 連線新的部署。API 不同時，可以在專案裡建立
`packages/provider-my-cloud/` 這樣的包。實現邊界取決於服務協議，而不是雲平臺的品牌。
如果 Hypit 尚未定義該模型，再補充相應的 Model 定義。

準備部署可能涉及模型檔案、算力配置與推理程序。Agent 可以按所選平臺和模型的說明，
建立可用服務並說明其永續性與算力費用；平臺管理許可權與推理呼叫憑據可能是分開的。
部署可用後，透過 Endpoint 接收普通生成請求；部署準備與影片 Build 執行各有自己的生命週期。

## 新增 Model

專案包使用 `@hypit/hypit/model-kit`、`@hypit/hypit/generation` 和 `@hypit/hypit/author-kit`。宣告準確的請求埠、引數取值、輸出型別和能力。作者 Surface 把 Prompt Text 與參考素材連線到請求，再將生成素材作為普通圖輸出公開。

[Model SDK](https://github.com/hypit-ai/hypit/blob/main/packages/model-kit/README.md) 提供請求定義與 activation 示例。包擁有模型介面；憑據與 HTTP 對映由 Provider 負責。

## 新增 Provider

將選定的 `@hypit/hypit` 版本作為開發依賴，使用公開 SDK：

```ts
import { defineEndpointPackage } from "@hypit/hypit/endpoint-kit";
import type { AsyncEndpoint, CredentialRef, EndpointRequest } from "@hypit/hypit/endpoint-kit";
```

實現服務支援的準確能力與輸出型別，將請求埠對映到服務 API，解析宣告的憑據並返回結果。即時操作可以直接返回；遠端任務可以先提交得到 ID，再輪詢完成情況、收集輸出檔案。併發和動作限制由 Endpoint 的資源宣告負責。

真正的失敗會結束本次執行嘗試。Build Result 保留已完成的 Output 與公開任務回執。後續工作透過新的 Run 與 Build，選擇仍適用的已有 Output 複用。

[Endpoint SDK](https://github.com/hypit-ai/hypit/blob/main/packages/endpoint-kit/README.md) 維護處理介面、activation、資源宣告和價格 API。將包編譯為 JavaScript，由專案包管理器安裝。在 [Runtime Profile](./runtime.md) 的 `endpoints` 中配置例項，並透過 `bindings` 選擇它。

[完整專案 Provider 示例](https://github.com/hypit-ai/hypit/tree/main/examples/provider-package) 使用示意 API 展示參考上傳、任務回執、結果收集與價格讀取。示例隨執行包分發，Agent 無需倉庫 checkout 就能讀取和改寫。它包含兩個包：`provider-images` 對應生成影象，`provider-videos` 對應生成影片——後者的服務接收更寬的參考詞彙（影象、影片、音訊以及首尾幀），並透過獨立的結果收集步驟返回產物。

實現與服務請求形態相匹配的那個 Capability；同時生成影象和影片的服務可以在同一個包裡宣告兩個 Capability。服務實際支援的範圍常常比 Model 詞彙表更窄，例如解析度更少或最長時長更低。這個差異屬於 Provider：在 Capability 的 `supports` 中報告它，讓 `plan` 帶原因拒絕請求，而不是修改共享 Model 或悄悄收窄作者的請求。

## 為遠端影片任務建模

渲染影片的服務通常先提交任務、再輪詢、最後下載結果，Endpoint SDK 將其表達為三個獨立動作：

- `start` 提交請求並以該服務的任務 id 返回 `pending`。HTTP 超時約束的是這次 API 呼叫而非渲染本身，因此 `start` 在服務受理任務後立即返回。返回前透過 `checkpoint` 記錄任務 id，這樣即使 Build 被中斷，也能指出它已發起的遠端工作。
- `poll` 在任務執行期間返回 `pending`，完成時返回 `ready`，失敗時帶服務自身的錯誤碼返回 `failed`。用 `wakeAfter(handle, delayMs)` 安排下一次檢查。
- `collect` 下載已完成的素材，透過 `context.resources` 儲存，並返回 Model 宣告的結果值。把收集與輪詢分離，可以讓下載併發與任務併發分別配置。

位元組尚不存在、要等上游步驟產出的輸入，仍是普通圖邊。`compileWireRequest` 接收的 URL resolver 就是 Provider 上傳參考並返回服務 URL 的位置，系統的其他部分因此無需瞭解該服務的上傳協議。

## 價格與授權

Provider 可以宣告本地執行沒有 Provider 呼叫費用，或提供公開費率頁面。它也可以使用 Endpoint 憑據讀取當前費率，返回簡潔摘要及原始價格材料。`hypit pricing <run>` 將費率與計劃請求一起展示；未來素材的測量值在產物存在前仍是未知的。

費率幫助說明費用。使用者的委託授權使用所選賬戶、按約定範圍與預算付費。登入成功或賬戶有餘額，是與這份授權分別成立的事實。
