---
title: 時序與裝配
description: 逐 Take 歸一化與語義對齊，然後裝配為 Timeline。
---

對於說話影片，`Timeline` 把作者的 Script 與實際表演聯絡起來，是字幕、隨詞語出現的圖形和覆蓋畫面的自然時間來源。它按 Segment 粒度構建：

1. 把每個已接受的音影片 Take 歸一化到同一個精確幀域；
2. 將歸一化媒體與對應的 Script Segment 對齊，得到自包含的 `SemanticTake`；
3. 用 `time:Timeline` 按節目順序裝配這些 Semantic Take。

每個 Take 在進入 Timeline assembly 之前就已經具有語義。畫面由 Media Track 或專案元件呈現，與這裡的語義和音訊裝配分別表達。

純視覺動畫使用同一種 Timeline 宣告：指定結束時間，不放入 Take，見 [純元件繪製的影片](./composition.md)。其事件可以使用秒或幀；說話影片則可以用 Script Selection 和 Moment 驅動相同的視覺行為。

```svml
<import as="program" from="@hypit/program-space@1"/>
<import as="pipeline" from="@hypit/media-pipeline@1"/>
<import as="whisperx" from="@hypit/whisperx@1"/>
<import as="time" from="@hypit/timeline-author@1"/>
<import as="media-track" from="@hypit/media-track@1"/>
  <import as="performance" from="@hypit/performance@1"/>
<import as="space" from="@hypit/spatial@1"/>
<import as="recipes" source="./recipes.svs"/>
```

## 逐 Take 歸一化

歸一化把影片、音訊、時長和幀率變成一個明確的 `SynchronizedMedia` 事實。同一條
Timeline 內的所有 Take 共享作者顯式宣告的 Clock。

```svml
<program:Clock id="clock" frame-rate="30"/>

<pipeline:Normalize id="opening-media" source={opening-video.video}
  video="primary-moving" audio="default" span-authority="video" clock={clock}/>
<pipeline:Normalize id="answer-media" source={answer-video.video}
  video="primary-moving" audio="default" span-authority="video" clock={clock}/>
```

歸一化不包含 Script 語義，也不負責轉錄；它只建立後續語義對齊可以信任的客觀媒體事實。

## 每個 Segment 產生一個 SemanticTake

`whisperx:SemanticTake` 測量一段歸一化媒體，並把聲學證據與唯一一個作者 Segment 對齊：

```svml
<whisperx:SemanticTake id="opening-semantic" narrative={story}
  segment={story.segment.opening} media={opening-media.media} language="en"/>
<whisperx:SemanticTake id="answer-semantic" narrative={story}
  segment={story.segment.answer} media={answer-media.media} language="en"/>
```

含有臺詞的 Segment 必須顯式填寫 `language`，例如 `en`、`zh` 或 `ko`。使用所選
WhisperX 服務支援的小寫兩字母或三字母語言程式碼。該值原樣傳遞；Hypit 不會根據 Script
文字或音訊自動檢測、分流語言。無臺詞的空 Segment 省略 `language`，直接使用歸一化媒體邊界。

每個輸出都自帶歸一化媒體、Segment 身份、每個作者詞語的區域性幀視窗以及該 Segment 的全部
結構錨點：Segment 有兩個錨點，每個詞也有兩個錨點。聲學證據只是這一步的實現輸入；下游
元件看到的是完成後的 `SemanticTake`，而不是第二套 evidence 形狀的時間結構。

## 裝配 Timeline

`time:Timeline` 預設順接已經準備好的 Take，也允許透過 `at` 自由放置，提供完整 Timeline。
Performance 和 Sound 分別呈現其中的畫面和聲音：

```svml
<space:Canvas id="vertical" width="1080" height="1920"/>
<space:Frame id="speech-frame" within={vertical}
  left="0%" top="0%" right="100%" bottom="100%"/>

<time:Timeline id="speech" clock={clock}>
  <time:Take source={opening-semantic.take}/>
  <time:Take source={answer-semantic.take}/>
</time:Timeline>
<import as="sound" from="@hypit/sound@1"/>
<sound:Style id="voice-style"/>
<sound:Track id="voice" timeline={speech.timeline}>
  <sound:Use style={voice-style}/>
</sound:Track>
<performance:Style id="performance-style" frame={speech-frame} appearance={recipes.media.performance}/>
  <performance:Track id="performance" timeline={speech.timeline} canvas={vertical}>
    <performance:Use style={performance-style} during="program"/>
  </performance:Track>
```

| 輸出 | 型別 | 含義 |
|---|---|---|
| `{speech.timeline}` | Timeline | 全域性語義與幀域真相 |
| `{voice.audio}` | AudioTrack | Sound 對已有 Take 聲音的呈現 |

Performance 和 Sound 使用同一批素材及源位置。每個 Take 的全域性位置由放置起點加區域性位置得到。
第一段省略 `at` 表示從零開始，後續省略則順接上一段。`at="previous.end+2s"` 留出間隔，
`at="previous.end-12f"` 表示交疊，也可以寫絕對位置。Timeline 的 `end` 預設取所有 Take 的最晚終點；
`end="content.end+2s"` 留出片尾，`end="30s"` 指定完整時長。位置須落在精確幀上，完整範圍須容納所有 Take。
零 Take 的 Timeline 需要明確的正時長，空隔不生成佔位素材。

## 消費語義時間

Selection、Moment 與完整 Segment 始終是 Script 中的作者身份。下游元件只接收一次
Timeline，並在構建確定性 Track 時把這些身份投影成幀：

```svml
<media-track:Track id="cards" timeline={speech.timeline} canvas={vertical}>
  <media-track:Item image={card.image} extent={card-extent}
    during={story.selection.demo} frame={card-frame}
    appearance={recipes.media.card} motion={recipes.motion.card}/>
</media-track:Track>

<caption-fine:Track id="captions"
  document={story.caption}
  timeline={speech.timeline}
>
  <caption-fine:Use style={primary-caption}/>
</caption-fine:Track>

<film:Film id="main" canvas={vertical}
  timeline={speech.timeline} appearance={recipes.film.vertical}>
  <film:Track source={performance.visual}/>
  <film:Track source={voice.audio}/>
  <film:Track source={cards.visual}/>
  <film:Track source={captions.track}/>
</film:Film>

<render:Video id="final"
  composition={main.composition} timeline={speech.timeline}/>
```

整段使用 `during={story.segment.answer}`，作者範圍使用 Selection，點事件使用 Moment，完整節目使用 `during="program"`。元件統一消費 `timeline={speech.timeline}`。

```text
prepared Takes → Timeline → Performance / project scene → visual ─┐
                         ├→ Caption / semantic graphics → visual ┤
                         └→ Sound → audio ───────────────────────┤
                                                                Film
```
