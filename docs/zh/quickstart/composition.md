---
title: Film 與渲染
description: 將 Track 組合為 Film 並渲染為影片。
---

Film 是最終的組裝階段。它接收所有對等的 Track，對其進行驗證，並生成一個
Composition。然後渲染器將該 Composition 編譯為 MP4 影片。

```svml
<import as="space" from="@hypit/spatial@1"/>
<import as="film" from="@hypit/film@1"/>
<import as="render" from="@hypit/render-hyperframes@1"/>
```

## film:Film

將選定的 VisualTrack 和 AudioTrack 組裝為單一的 Composition。每份視覺貢獻保留自己的
定時呈現和繪製順序；聲音透過選定的 AudioTrack 加入。

```svml
<space:Canvas id="vertical" width="1080" height="1920"/>
<import as="sound" from="@hypit/sound@1"/>
<sound:Style id="voice-style"/>
<sound:Track id="voice" timeline={speech.timeline}>
  <sound:Use style={voice-style}/>
</sound:Track>

<film:Film id="main" canvas={vertical} timeline={speech.timeline} appearance={recipes.film.vertical}>
  <film:Track source={performance.visual}/>
  <film:Track source={voice.audio}/>
  <film:Track source={captions.track}/>
  <film:Track source={product-broll.visual}/>
  <film:Track source={titles.track}/>
</film:Film>
```

| 屬性 | 必填 | 說明 |
|---|---|---|
| `id` | 是 | 唯一識別符號 |
| `canvas` | 是 | 與 Track 佈局共享的顯式 CanvasSpace |
| `timeline` | 是 | 完整時間軸及其中的素材放置和語義錨點 |
| `appearance` | 是 | SVS Film Recipe——畫布清除顏色 |

### film:Track

每個 `<film:Track>` 子元素向 Composition 新增一個 Track 來源：

| 屬性 | 必填 | 說明 |
|---|---|---|
| `source` | 是 | 來自任何上游元件的 VisualTrack 或 AudioTrack |

常見的 Track 來源：

| 來源 | 型別 | 來自 |
|---|---|---|
| `{performance.visual}` | VisualTrack | `performance:Track`——已有表演的畫面呈現 |
| `{voice.audio}` | AudioTrack | `sound:Track`——已有聲音的呈現 |
| `{captions.track}` | VisualTrack | Caption 樣式族 Track——定時字幕 |
| `{cards.visual}` | VisualTrack | `media-track:Track`——Media 疊加層或 B-roll |
| `{titles.track}` | VisualTrack | `text:Track`——文字疊加層 |

### Track 堆疊

Film 收集對等的 Track。每個 Track 可以包含多個獨立定時、獨立排序的呈現，稱為 Present。
許多元件透過 Recipe 的 `stack-order` 暴露繪製順序：較低的值在後面，較高的值在前面。
調整 Film 子元素的書寫順序不會改變這一繪製順序。

典型的堆疊順序：

| stack-order | 內容 |
|---|---|
| 10 | 示例口播視覺（作者顯式選擇，不是內建預設值） |
| 40 | Media 疊加層 |
| 70 | 字幕 |
| 90 | 文字疊加層 |

不同元件的 Present 可以交錯排列。每個 Present 內部又擁有自己的元素樹：多個影片、文字
和圖形可以共享佈局、遮罩或協同運動。專案元件可以用 HTML/CSS 瀏覽器程式實現這樣的場景，
獨立字幕或覆蓋畫面仍可以作為對等貢獻。根據共同的表現關係分組，尺寸和素材型別不決定邊界。

**輸出：** `{main.composition}`——完整的 Composition，傳遞給渲染器。

## render:Video

透過 HyperFrames 渲染器將 Composition 編譯為最終影片。

```svml
<render:Video id="final" composition={main.composition} timeline={speech.timeline}/>
```

| 屬性 | 必填 | 說明 |
|---|---|---|
| `id` | 是 | 唯一識別符號 |
| `composition` | 是 | 來自 `film:Film` 的 Composition |
| `timeline` | 是 | 完整時間軸及其中的素材放置和語義錨點 |

渲染器：

1. 將 Composition 編譯為 `HyperframesDocument`——每一幀的 HTML 表示
2. 透過 Chrome/Chromium 渲染每一幀
3. 將幀序列編碼為影片
4. 混合音訊 Track
5. 將影片和音訊混合封裝為最終的 MP4

**輸出：** `{final.video}`——以普通內容定址 `BlobArtifact` 表示的最終影片。這是最常見的
Build Target，也可以直接接到媒體裁切、音訊/幀提取或模型參考輸入等後續 Blob 消費者。

## 完全由元件繪製的影片

對於口播作品，Script 的 Selection 和 Moment 保留話語與呈現之間的關係。聊天動畫或圖解
也可以自行安排閱讀節奏：宣告影片時鐘，讓場景元件、Film 和 Render 使用它。

```svml
<import as="time" from="@hypit/timeline-author@1"/>
<time:Clock id="animation-clock" frame-rate="30"/>
<time:Timeline id="animation" clock={animation-clock} end="8s"/>
<!-- scene.track 由使用同一時鐘的元件產生。 -->
<film:Film id="main" canvas={canvas} timeline={animation.timeline} appearance={recipes.film.main}>
  <film:Track source={scene.track}/>
</film:Film>
<render:Video id="final" composition={main.composition} timeline={animation.timeline}/>
```

場景事件可以採用作者指定的秒數或幀數。在口播編排中，同一種表現也可以跟隨投影后的 Script
事件。元件直接繪製畫面，宣告時長無需背景圖片或靜音表演；未選擇 AudioTrack 時，交付影片無聲。

## 完整的管線流程

從 Script 到渲染影片的完整資料流。下面的 Source 是刪節示意；可執行的完整專案見
`examples/podcast/`，本節末尾的命令針對該專案。

### Author Source (`main.svml`)

```svml
<?svml using="@hypit/markup@1"?>

<svml>
  <import from="@hypit/script@1"/>
  <import as="wording" from="@hypit/text@1"/>
  <import as="gpt" from="@hypit/gpt-image@1"/>
  <import as="seedance" from="@hypit/seedance@1"/>
  <import as="pipeline" from="@hypit/media-pipeline@1"/>
  <import as="time" from="@hypit/timeline-author@1"/>
  <import as="whisperx" from="@hypit/whisperx@1"/>
  <import as="caption" from="@hypit/caption@1"/>
  <import as="caption-fine" from="@hypit/caption-fine@1"/>
  <import as="fonts" from="@hypit/fonts-open@1"/>
  <import as="media-track" from="@hypit/media-track@1"/>
  <import as="performance" from="@hypit/performance@1"/>
  <import as="text" from="@hypit/typography-track@1"/>
  <import as="space" from="@hypit/spatial@1"/>
  <import as="program" from="@hypit/program-space@1"/>
  <import as="film" from="@hypit/film@1"/>
  <import as="render" from="@hypit/render-hyperframes@1"/>
  <import as="recipes" source="./recipes.svs"/>

  <!-- 1. Script: the semantic truth -->
  <script id="story">
    <opening><HOST>Meaning @{demo}becomes the source.@{/demo}</opening>
  </script>

  <!-- 2. Generation: Seedance talking head + standalone video -->
  <wording:Value id="direction">
    Locked medium close-up in a quiet daylight studio. Spoken dialogue — say exactly: Meaning becomes the source.
  </wording:Value>
  <wording:Value id="scene-look">
    A photograph with the texture of real iPhone footage. Generate a vertical seated medium
    close-up, as one frame cut out of video actually shot on an iPhone: genuinely real rather than
    glossy, carrying the texture of video and not of a posed photograph. The background stays clearly
    visible, with no depth-of-field blur. Skin texture is fine and real, the light is natural, and no
    part of the picture is broken. One presenter at a desk in a quiet daylight studio.
  </wording:Value>
  <gpt:Image id="studio-scene" prompt={scene-look} aspect-ratio="9:16" resolution="2K"/>
  <seedance:ReferenceVideo id="take" model="mini"
    prompt={direction} duration="5" generate-audio="true">
    <seedance:Reference image={studio-scene.image} person-reference="true"/>
  </seedance:ReferenceVideo>
  <seedance:ReferenceVideo id="motion" model="mini"
    prompt={direction} duration="5">
    <seedance:Reference image={studio-scene.image} person-reference="true"/>
  </seedance:ReferenceVideo>

  <space:Canvas id="vertical" width="1080" height="1920"/>
  <program:Clock id="clock" frame-rate="30"/>
  <space:Frame id="speech-frame" within={vertical}
    left="0%" top="0%" right="100%" bottom="100%"/>
  <space:Frame id="title-frame" within={vertical}
    left="6%" top="6%" right="94%" bottom="16%"/>
  <space:Frame id="card-frame" within={vertical}
    left="10%" top="20%" right="90%" bottom="70%"/>

  <!-- 3. Timing：先歸一化並對齊 Segment，再裝配 -->
  <pipeline:Normalize id="take-media" source={take.video}
    video="primary-moving" audio="default" span-authority="video" clock={clock}/>
  <pipeline:Normalize id="motion-media" source={motion.video}
    video="primary-moving" audio="none" span-authority="video" clock={clock}/>
  <whisperx:SemanticTake id="opening-semantic" narrative={story}
    segment={story.segment.opening} media={take-media.media} language="en"/>
  <time:Timeline id="speech" clock={clock}>
    <time:Take source={opening-semantic.take}/>
  </time:Timeline>
<performance:Style id="performance-style" frame={speech-frame} appearance={recipes.media.performance}/>
  <performance:Track id="performance" timeline={speech.timeline} canvas={vertical}>
    <performance:Use style={performance-style} during="program"/>
  </performance:Track>

  <!-- 4. Tracks: captions, Media, text -->
  <fonts:Stack id="caption-font" family="inter" weight="700" style="normal"/>
  <fonts:Stack id="title-font" family="inter" weight="900" style="normal"/>
  <caption-fine:Style id="base-caption" recipe={recipes.caption.base} font={caption-font}/>

  <caption-fine:Track id="captions" document={story.caption}
    timeline={speech.timeline}>
    <caption-fine:Use style={base-caption}/>
  </caption-fine:Track>

  <media-track:Track id="cards" timeline={speech.timeline} canvas={vertical}>
    <media-track:Item media={motion-media.media} during={story.selection.demo}
      frame={card-frame} appearance={recipes.media.card} motion={recipes.motion.card}/>
  </media-track:Track>
  <text:Style id="title-style" recipe={recipes.text.title} font={title-font}/>
  <text:Track id="titles" timeline={speech.timeline}>
    <text:Area id="meaning" placement={title-frame} style={title-style} during="program">
      MEANING
    </text:Area>
  </text:Track>

  <!-- 5. Film: compose all tracks -->
  <import as="sound" from="@hypit/sound@1"/>
<sound:Style id="voice-style"/>
<sound:Track id="voice" timeline={speech.timeline}>
  <sound:Use style={voice-style}/>
</sound:Track>

<film:Film id="main" canvas={vertical} timeline={speech.timeline}
    appearance={recipes.film.vertical}>
    <film:Track source={performance.visual}/>
    <film:Track source={voice.audio}/>
    <film:Track source={cards.visual}/>
    <film:Track source={captions.track}/>
    <film:Track source={titles.track}/>
  </film:Film>

  <!-- 6. Render: compile to MP4 -->
  <render:Video id="final" composition={main.composition}
    timeline={speech.timeline}/>
</svml>
```

`right` 與 `bottom` 是絕對的邊位置，不是內縮量。一個佔父級中間 80% 的 Frame 寫作 `left="10%" right="90%"`，而不是 `left="10%" right="10%"`——後者解出的寬度為零，會被拒絕。

### 樣式表 (`recipes.svs`)

```svs
<?svml using="@hypit/svs@1"?>

<sheet version="1">
  film.vertical {
    background: #09090B;
  }
  media.performance { stack-order: 0; fit: cover; }
  media.card {
    stack-order: 40; fit: cover; playback: hold-start;
    frame-paint: #111116; clip: rounded; radius: 20;
  }
  motion.card {
    enter: slide; enter-frames: 4; enter-direction: up; enter-easing: ease-out;
    exit: fade; exit-frames: 4; exit-easing: ease-in;
  }
  caption.base {
    stack-order: 70; x: 0.08; y: 0.76; width: 0.84;
    size: 58; line-height: 1; align: center;
    fill: #FFFFFF; background: #09090BCC; padding: 16 24; radius: 18;
  }
  text.title {
    stack-order: 90;
    font: Inter; weight: 900; size: 64; align: center;
    fill: #FFFFFF; tracking: -1;
  }
</sheet>
```

### Run Source (`build.svrun`)

```svml
<?svml using="@hypit/run-markup@1"?>

<svrun version="1">
  <author source="./main.svml"/>
  <target output="final.video"/>
</svrun>
```

### 編譯與驗證

```bash
hypit check examples/podcast/reference.svml

hypit plan examples/podcast/reference.svrun
```

`check` 編譯 Author Graph——驗證所有匯入、型別和圖的邊，而不呼叫任何外部服務。`plan`
還會額外編譯 Run Source 並輸出凍結的 BuildPlan，展示排程器將發出的每個 Operation。在花費資金之前請先檢查計劃。
