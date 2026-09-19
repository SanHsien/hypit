---
title: 媒體與生成
description: 宣告媒體資源並使用 Seedance 生成影片。
---

本頁介紹用於宣告靜態資源和生成新媒體的元件——這些是流入下游時序和 Track 階段的原始素材。

此處展示的每個元件在使用前都必須透過包識別符號匯入：

```svml
<import as="media" from="@hypit/media@1"/>
<import as="mediaop" from="@hypit/media-pipeline@1"/>
<import as="text" from="@hypit/text@1"/>
<import as="seedance" from="@hypit/seedance@1"/>
<import as="speaker-kit" source="@hypit/seedance-kits/speaker"/>
```

## media:Image

宣告一個來自本地檔案的內容定址圖片資源。

```svml
<media:Image id="presenter" src="./assets/presenter.png"/>
```

| 屬性 | 必填 | 說明 |
|---|---|---|
| `id` | 是 | 元件的唯一識別符號 |
| `src` | 是 | 圖片檔案路徑，相對於 `.svml` 原始檔 |

該圖片在下游透過 `{presenter}` 引用——例如，作為 `seedance:ReferenceVideo` 中的角色參考或作為 B-roll 來源。

## media:Audio

宣告一個來自本地檔案的內容定址音訊資源。

```svml
<media:Audio id="presenter-voice" src="./assets/presenter-voice.mp3"/>
```

| 屬性 | 必填 | 說明 |
|---|---|---|
| `id` | 是 | 唯一識別符號 |
| `src` | 是 | 音訊檔案路徑，相對於 `.svml` 原始檔 |

通常用作 `seedance:ReferenceVideo` 的語音音色參考。

## 時長是字面量

生成片段的長度由作者決定，直接寫在需要它的元素上。先量稿子，再寫數字：

```bash
hypit measure main.svml --segment hook --language en --pace normal --rounding round
# 7s
```

```svml
<seedance:ReferenceVideo id="hook-take" model="mini" prompt={hook-prompt} duration="7" generate-audio="true">
  …
</seedance:ReferenceVideo>
```

`hypit measure` 按口播策略——`language`、`pace`（英語 `slow = 4.2`、`normal = 4.6`、`fast = 5.0` 音節/秒）或數值 `rate`、`rounding`——統計 Segment 臺詞的讀音單位，不呼叫任何外部服務。請求時長在 Build 開始前已經明確。用估時結果調整稿子並選擇模型支援的時長；實際詞時間由生成表演後的語義處理提供。

## text:Value

一個可複用的字面 `Text` 值。它與模型無關，可以進入 Seedance、GPT Image 或任何宣告的文字埠。

```svml
<import as="text" from="@hypit/text@1"/>

<text:Value id="alice-direction">
  Locked medium close-up. Alice speaks directly to camera in a quiet daylight studio.
  Calm, curious delivery; natural breathing and restrained hand movement.
  Spoken dialogue — say exactly: What if editing began with meaning?
</text:Value>
```

| 屬性 | 必填 | 說明 |
|---|---|---|
| `id` | 是 | 唯一識別符號 |

元素主體就是精確的 Text 值。`text:Render` 也能用模板和顯式圖輸入產出同一型別。

## Seedance 三種呼叫形狀

Seedance 只暴露模型能力，不暴露“口播”“B-roll”等創作用途。`standard`、`fast`、`mini`
和 `2.5` 選擇精確模型；呼叫形狀則獨立分為三種。三者都消費完整的普通 `Text` Prompt，並輸出 `{id.video}`。

Seedance 2.5 複用同樣的 Surface，而不是由 Runtime 把別的模型偷偷替換成 2.5。它的精確合同支援 480p/720p/1080p，最多 30 張參考圖、10 段參考影片、10 段參考音訊；時長可寫 `-1`
交給模型選擇，也可明確寫 4–30 秒的整數：

```svml
<seedance:ReferenceVideo id="long-take" model="2.5"
  prompt={long-direction} duration="30" resolution="720p" generate-audio="true">
  <seedance:Reference image={presenter-reference} person-reference="true"/>
  <seedance:Reference audio={presenter-voice}/>
</seedance:ReferenceVideo>
```

### seedance:TextVideo

純 Prompt 生成。只有這種形狀允許 `web-search`：

```svml
<seedance:TextVideo id="ambient" model="mini"
  prompt={ambient-direction} duration="5" web-search="false"/>
```
對於反覆出現的人物、產品或場景，先製作參考圖能給影片模型明確的視覺方向。多個 Take 可以複用這些參考，再由 Script 與 action Prompt 指導各段表演。當場景可以直接描述、不需要保持特定視覺身份時，也可以使用 TextVideo。


### seedance:FrameVideo

必須給首幀，可以額外給尾幀：

```svml
<seedance:FrameVideo id="transition" model="fast"
  prompt={transition-direction} duration="5"
  first-frame={opening-image} first-frame-person-reference="false"
  last-frame={closing-image} last-frame-person-reference="false"/>
```

### seedance:ReferenceVideo

多模態參考生成。至少需要一個 `Reference` 子元素，可以顯式接入圖片、影片和音訊：

```svml
<seedance:ReferenceVideo id="alice-take" model="mini"
  prompt={alice-direction}
  duration="5"
  generate-audio="true">
  <seedance:Reference image={alice-reference} person-reference="true"/>
  <seedance:Reference audio={alice-voice}/>
</seedance:ReferenceVideo>
```

每個參考圖片／影片必須填寫 `person-reference="true|false"`：參考素材含人物填 true，不含填 false。
漏填會報錯，音訊不得填寫。首幀必須填寫 `first-frame-person-reference`，提供尾幀時還須填寫 `last-frame-person-reference`。
選定的 Provider 負責把這項事實交給服務的素材準備流程；服務 API 沒有對應欄位時，Provider 接受這項宣告但不傳輸。

舞蹈、身體動作或運鏡可以由參考影片提供運動依據，再用參考圖指定新的形象與場景。
圍繞需要保留的動作選取片段，並核對模型與服務的參考影片時長上限；它和要生成的影片時長是兩回事。

這個低層元件並不知道它被用來做口播；用途只存在於傳入的 Text 中。公共屬性包括
`id`、`model`、`prompt`、`duration`、`resolution`、
`aspect-ratio`、`generate-audio`；`duration` 是模型範圍內的整秒字面量，事先用 `hypit measure` 量好。

可以直接抽取前一段生成影片裡的音訊，並透過普通圖邊給後續片段當作參考。這個操作不會把音訊提升成語音證據，也不會憑空附加說話人語義：

```svml
<mediaop:ExtractAudio id="voice-from-opening"
  source={opening.video} audio="default"/>

<seedance:ReferenceVideo id="follow-up" model="mini"
  prompt={follow-up-direction} duration="5" generate-audio="true">
  <seedance:Reference image={presenter-reference} person-reference="true"/>
  <seedance:Reference audio={voice-from-opening.audio}/>
</seedance:ReferenceVideo>
```

同一個媒體操作包還提供 `Transform`（按順序擷取、變速）和 `ExtractFrame`（首幀、尾幀、指定幀或指定時間取圖）。本地 FFmpeg 實現這些精確 Need；也可以選擇其他相容的 Runtime Endpoint，作者圖保持不變。

## Seedance 語義 Kit

`@hypit/seedance-kits` 包含七個純資料 Text Template。Kit 不是模型包裝器：先用通用
`text:Render` 生成 prompt，再把該 Text 與真實媒體引用顯式接入低層 Seedance Surface。

直接從已安裝的包匯入選中的公開 Kit Source。包管理器或當前 Distribution 管理實際安裝版本，
Source Closure 沿著這個顯式包匯入讀取內容。如果共享措辭不適合當前作品，也可以在專案裡創作並匯入自己的 Kit。

創作前閱讀
[`@hypit/seedance-kits` 指南](https://github.com/hypit-ai/hypit/blob/main/packages/seedance-kits/README.md)
和 [所選 Kit 原始檔](https://github.com/hypit-ai/hypit/tree/main/packages/seedance-kits/kits)，判斷它的鏡頭假設和措辭是否適合當前表演。也可以直接編寫 prompt Text，或創作專案自己的 Kit。提示詞語言按所選模型決定，對白使用實際需要說出的語言。

```svml
<import as="text" from="@hypit/text@1"/>
<import as="seedance" from="@hypit/seedance@1"/>
<import as="broll-kit" source="@hypit/seedance-kits/broll"/>

<text:Value id="product-story">
  Show the product opening, the primary feature activating, and the finished result in one readable sequence.
</text:Value>
<text:Render id="demo-prompt"
  template={broll-kit.broll-v1}
  recipe={recipes.broll.product-demo}>
  <text:Set name="story" text={product-story}/>
</text:Render>

<seedance:ReferenceVideo id="demo" model="mini"
  prompt={demo-prompt} duration="5"
  resolution="720p" aspect-ratio="9:16" generate-audio="false">
  <seedance:Reference image={scene} person-reference="false"/>
  <seedance:Reference image={product} person-reference="false"/>
</seedance:ReferenceVideo>
```

專案 Recipe 選擇模板宣告的軸；顯式 `text:Param` 可以覆蓋 Recipe。按格式選擇 Kit，再提供它宣告的動態 slot 與有序參考：

| 格式 | Kit | 動態 slot | 有序參考 |
|---|---|---|---|
| 單人口播 | `speaker-v1` | `dialogue`；可選 `action` | image 1 = 人物/場景；audio 1 = 聲音 |
| 無聲 B-roll | `broll-v1` | `story` | 一張或多張作者宣告圖片 |
| 雙人 Podcast | `podcast-v1` | `dialogue`；可選 `action` | image 1/2 = A/B 視角；audio 1/2 = A/B 聲音 |
| 視訊通話 | `call-v1` | `dialogue`；可選 `action` | image 1/2 = 相反通話佈局；audio 1/2 = A/B 聲音 |
| 街訪 | `street-interview-v1` | `dialogue`；可選 `action` | image 1/2/3 = 採訪者/受訪者/雙人視角；audio 1/2 = 採訪者/受訪者 |
| 動作遷移 | `motion-reference-v1` | 可選 `direction` | image 1 = 主體；video 1 = 動作參考 |
| 運鏡遷移 | `camera-reference-v1` | 可選 `direction` | image 1 = 主體；video 1 = 運鏡參考 |

這些形狀仍然清楚地寫在 `seedance:ReferenceVideo` 中；Kit 渲染不會隱藏媒體數量與順序。

## 街訪 Prompt 組裝

使用 `street-interview-v1` 複用視角順序、角色、麥克風、音色和無疊加文字契約。構圖、節奏、表演、反應與手勢由 SVS Recipe 選擇；每段的鏡頭變化和表演按實際發生順序直接寫在 `action` 中：

```svml
<import as="text" from="@hypit/text@1"/>
<import as="seedance" from="@hypit/seedance@1"/>
<import as="interview-kit" source="@hypit/seedance-kits/street-interview"/>

<text:Value id="interview-action">
  Begin with the shared view from @image3 while A asks the question.
  Cut to B's view from @image2 as B pauses briefly, then answers.
</text:Value>

<text:Render id="interview-prompt"
  template={interview-kit.street-interview-v1}
  recipe={recipes.interview.street}>
  <text:Set name="dialogue" text={story.segment.interview.dialogue}/>
  <text:Set name="action" text={interview-action}/>
</text:Render>

<seedance:ReferenceVideo id="interview-take" model="mini"
  prompt={interview-prompt} duration="8"
  resolution="720p" aspect-ratio="9:16" generate-audio="true">
  <seedance:Reference image={interviewer-view} person-reference="true"/>
  <seedance:Reference image={guest-view} person-reference="true"/>
  <seedance:Reference image={shared-view} person-reference="true"/>
  <seedance:Reference audio={interviewer-voice}/>
  <seedance:Reference audio={guest-voice}/>
</seedance:ReferenceVideo>
```

對白使用明確的 `A:`/`B:` 順序：A 是採訪者並繫結第一段音訊參考，B 是受訪者並繫結第二段。固定英文 Prompt 骨架由 Kit 負責，不要在手寫 Prompt 中重複一遍。

## 口播 Prompt 組裝

口播創作不需要一個特殊的可執行元件。資料化的 `speaker-v1` Template、專案 Recipe 與每段的
dialogue/action 由普通 Text 模組組裝，結果再像其他生成任務一樣透過顯式 `prompt` 邊進入 Seedance。

```svml
<import as="text" from="@hypit/text@1"/>
<import as="seedance" from="@hypit/seedance@1"/>
<import as="speaker-kit" source="@hypit/seedance-kits/speaker"/>

<text:Value id="hook-action">
  Begin with urgent direct eye contact, then let the final admission land more quietly.
</text:Value>

<text:Render id="hook-prompt"
  template={speaker-kit.speaker-v1}
  recipe={recipes.speaker.host}>
  <text:Set name="dialogue" text={story.segment.hook.dialogue}/>
  <text:Set name="action" text={hook-action}/>
</text:Render>

<seedance:ReferenceVideo id="hook-take" model="mini"
  prompt={hook-prompt} duration="8"
  resolution="720p" aspect-ratio="9:16" generate-audio="true">
  <seedance:Reference image={presenter-clean} person-reference="true"/>
  <seedance:Reference audio={presenter-voice}/>
</seedance:ReferenceVideo>
```

`speaker-v1.svs` 自己選擇 Text Template Frontend。`recipes.svs` 提供具名軸值，`dialogue` 與
`action` 保持為普通圖輸入。Kit 和 Text 都不選擇模型、參考素材或 Provider。

## 組合示例

一個兩段拍攝的設定，量好的時長寫成字面量，顯式 Text 組裝與 Seedance 生成：

```svml
<import as="media" from="@hypit/media@1"/>
<import as="text" from="@hypit/text@1"/>
<import as="seedance" from="@hypit/seedance@1"/>
<import as="recipes" source="./recipes.svs"/>
<import as="speaker-kit" source="@hypit/seedance-kits/speaker"/>

<media:Image id="presenter-clean" src="./assets/presenter-clean.png"/>
<media:Image id="presenter-alt" src="./assets/presenter-alt.png"/>
<media:Audio id="presenter-voice" src="./assets/presenter-voice.mp3"/>

<text:Value id="hook-action">Start urgently, then become quieter.</text:Value>
<text:Value id="meeting-action">Indicate the product, then return to the lens.</text:Value>

<text:Render id="hook-prompt" template={speaker-kit.speaker-v1} recipe={recipes.speaker.host}>
  <text:Set name="dialogue" text={story.segment.hook.dialogue}/>
  <text:Set name="action" text={hook-action}/>
</text:Render>
<text:Render id="meeting-prompt" template={speaker-kit.speaker-v1} recipe={recipes.speaker.host}>
  <text:Set name="dialogue" text={story.segment.meeting.dialogue}/>
  <text:Set name="action" text={meeting-action}/>
</text:Render>

<seedance:ReferenceVideo id="hook-take" model="mini" prompt={hook-prompt}
  duration="8" resolution="720p" aspect-ratio="9:16" generate-audio="true">
  <seedance:Reference image={presenter-clean} person-reference="true"/>
  <seedance:Reference audio={presenter-voice}/>
</seedance:ReferenceVideo>
<seedance:ReferenceVideo id="meeting-take" model="mini" prompt={meeting-prompt}
  duration="6" resolution="720p" aspect-ratio="9:16" generate-audio="true">
  <seedance:Reference image={presenter-alt} person-reference="true"/>
  <seedance:Reference audio={presenter-voice}/>
</seedance:ReferenceVideo>
```

每個 `seedance:ReferenceVideo` 產出 `{*.video}`，進入下一階段的 `time:Timeline`。不同 Take
可以使用不同參考圖，同時共享相同的音色與 Prompt Recipe。
