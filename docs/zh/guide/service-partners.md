---
title: 模型與部署服務
description: 託管模型 API、自有模型部署，以及獨立服務合作方。
---

根據影片需要的素材選擇服務。這與[在哪個 Agent 中工作](./agents.md)是不同的選擇。

HypiHub 是 Hypit 推薦的整合託管服務，提供已支援的生成與 WhisperX 能力，Provider 隨 Hypit
維護。本地能力仍可透過本地 Provider 使用，使用者自己的服務透過專案 Provider 接入。

下面介紹的合作方是獨立服務，各有自己的賬戶、條款、價格、模型可用性和 API。
合作關係提供一個瞭解服務的入口，不共用 HypiHub 賬戶。
發行包為下面每個服務內建了一個使用 API Key 的 Provider，覆蓋該服務提供的已安裝模型，
並按該服務的輸入限制報告不支援的請求；具體清單見各 Provider 的 README。
服務提供、但不在這個範圍內的模型，透過普通的 [Model 與 Provider](./providers.md) 擴充套件方式連線。

## 模型與工具 API 合作方

### TokenDance

[TokenDance](https://tokendance.space) 是多模型閘道器。
[`@hypit/provider-tokendance`](https://github.com/hypit-ai/hypit/blob/main/packages/provider-tokendance/README.md)
按 TokenDance 文件中的方舟與 MiniMax 協議提供 Seedance 2.0、2.5 系列、Seedream 5.0 lite 和 MiniMax H3。
其他模型見它的[文件索引](https://tokendance.space/llms.txt)和實時模型目錄。

### HiAPI

[HiAPI](https://www.hiapi.ai) 透過一個非同步任務介面提供圖片、影片和音訊模型。
[`@hypit/provider-hiapi`](https://github.com/hypit-ai/hypit/blob/main/packages/provider-hiapi/README.md)
提供發行包已描述的 Seedance、Seedream 5.0 lite、MiniMax H3、GPT Image 2、Nano Banana 和 Grok Imagine 模型。
其餘模型見它的[模型索引](https://www.hiapi.ai/docs/models.json)。

### Pollo

[Pollo AI](https://docs.pollo.ai) 按模型路徑提供影片和圖片生成。
[`@hypit/provider-pollo`](https://github.com/hypit-ai/hypit/blob/main/packages/provider-pollo/README.md)
提供 MiniMax H3、Grok Imagine 1.5、GPT Image 2 和 Nano Banana。
Pollo 只接受公網 URL 形式的參考素材，帶參考素材的請求需要由嵌入方提供 URL。

### Monid

[Monid](https://monid.ai) 是 Hypit 的服務合作方。
[它的文件](https://monid.ai/docs)介紹了工具發現、輸入與價格查詢，以及呼叫方式。
[`@hypit/provider-monid`](https://github.com/hypit-ai/hypit/blob/main/packages/provider-monid/README.md)
提供 Seedance 2.0、2.5 系列端點、MiniMax H3 與 Wan 2.7 影象模型，並透過 Monid 的工作區檔案系統上傳參考素材。
使用 Monid 的其他工具時，[HTTP API 文件](https://monid.ai/docs/api/overview)提供接入依據，
Agent 可以在專案包中實現這次所需的請求與結果對映。

## 自己部署模型

部署平臺提供執行模型的地方，部署得到的推理服務沿用 Model–Provider–Endpoint 的關係接入。
完整協議相容時複用 Provider，否則在專案包中實現該服務的 API。算力和部署費用屬於所選雲賬戶，
HypiHub 額度不支付這份部署。

[使用自有模型部署](./providers.md#使用自有模型部署)說明自己管理服務環境時需要處理什麼。
沒有合作關係、沒有官方內建 Provider，也可以使用一份合適的部署。
