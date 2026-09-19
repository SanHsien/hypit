---
title: 軌道
description: 對等 Track 元件——字幕、媒體、排版與作者宣告的音訊。
---

每個進入最終合成的視聽內容都是一個對等的 **Track**。Track 是扁平的（無巢狀）；視覺層的
z 軸順序由 SVS 中的 `stack-order` 屬性決定。本頁介紹 Caption、Media、Typography 與 Audio
Track 的作者語法。

## 字幕系統

字幕由 Script 產生的單一文件與可替換的樣式族組成：

```text
Script CaptionDocument + Timeline → 完整 Cue 定時 → Use 呈現
```

```svml
<import as="caption" from="@hypit/caption@1"/>
<import as="caption-fine" from="@hypit/caption-fine@1"/>
<import as="media" from="@hypit/media@1"/>
<import as="fonts" from="@hypit/fonts-open@1"/>
```

公共 Caption 負責 CaptionDocument、完整 Alignment Unit 的 Selection/Role 投影、樣式分配與
Timeline 時間拼接。Fine 是一種樣式族，負責自己的幾何、字形/Cue/Pill Paint 與區域性動畫。

### caption-fine:Style

一個 Style 是從包自有 SVS Recipe 解析出的渲染意圖：

```svs
caption.primary {
  stack-order: 70; x: 0.5; y: 0.88; width: 0.84;
  height: 0.22;
  anchor-x: center; anchor-y: bottom;
  size: 58; line-height: 1;
  align: center; block-align: end; inline-size: fixed;
  wrap: word; max-lines: 2; max-words-per-line: 4;
  fill: #FFFFFF; stroke-color: #09090B; stroke-width: 2;
  background: #00000000; padding: 0; radius: 0;
  karaoke: trail; karaoke-transition: wipe; active-fill: #FFD54A;
  active-box: current; active-box-continuity: isolated;
  active-box-background: #FFD54ACC; active-box-padding: 4 8; active-box-radius: 8;
  active-underline: current; active-underline-color: #FFFFFF;
  cue-enter: spring; cue-enter-frames: 6;
  active-response: pop; active-response-frames: 5; active-scale: 1.08;
  lead-frames: 4; tail-frames: 4; handoff: cut;
}
```

```svml
<fonts:Stack id="caption-fonts" family="inter" weight="700" style="normal" emoji="color">
  <fonts:Fallback family="noto-sans-sc" weight="700" style="normal"/>
</fonts:Stack>
<caption-fine:Style id="primary-caption" recipe={recipes.caption.primary}
  font={caption-fonts}/>
```

必填的 `font=` 邊攜帶一個按位元組復現的 `FontStackRef`。字型家族、字重和字形只在這條邊上宣告一次；每個 Fallback 保留自己的真實字型資訊。省略字型棧會在編譯時失敗，不會退回當前機器上的同名字型。

Cue 邊界由 Script 的 Segment、Role、樣式變化和作者寫出的 `||` 決定。Fine 不宣告任何
逐詞規劃欄位；其他字幕包可以定義完全不同的渲染方式，無需修改公共 Caption。

Fine 不是一組互斥預設。基礎/啟用漸變、描邊、陰影、長陰影、外發光、下劃線、Pill
和動畫均為正交維度。文字、下劃線和 Pill 各自選擇 `off | current | trail`；因此可以直接表達“文字保留已讀色，但 Pill 只跟隨當前詞”。`active-box-continuity: joined` 會把已讀字首在每個真實換行片段內連成一個背景，而不是給每個詞分別套膠囊。

包在 Surface 宣告中把引數分成 **Where / How / When**，Studio 直接消費這份作者協議，無需再維護字幕專用引數全集。`lead-frames`、`tail-frames` 先產生顯式可見 Schedule；`handoff: cut` 負責相鄰 Cue 的交接，`overlap` 則保留雙方包絡。二者都不會修改 Karaoke 使用的原始詞幀。

`wrap: word` 優先在完整 Alignment Unit 之間換行；單個顯示單元若比 Region 還寬，會繼續在內部回退換行，不會逃出範圍。`max-words-per-line` 直接構造真實行；宣告 `max-lines` 後，超過行數預算的 Cue 會被拒絕，不會裁掉文字、描邊、陰影或外發光。Cue 分界由 Script 的結構和 `||` 決定。

Fine 是“統一文字流”字幕：同一 Cue 的每個 token 遵守同一 Recipe，只允許時間、順序和播放狀態驅動差異。若 Cue 記憶體在不同字型/佈局角色、全屏反色、撕裂或前後語塊之間的合成關係，就應新建另一個 Caption 包，而不是給 Fine 塞隱藏例外。

CJK 口播可以直接書寫。若一個只負責顯示的 emoji 仍需跟隨語音計時，應顯式寫出對應，例如 `<🌐 | globe>`；系統不會替裸符號虛構一個口播詞。

### caption-fine:Track

字幕內容來自 Script 和 Timeline；Use 決定某段時間的呈現方式。後宣告的 Use 在視窗內覆蓋前面的樣式，隱藏也遵守這個規則。

```svml
<caption:Hidden id="hidden"/>
<caption-fine:Track id="captions" document={story.caption} timeline={speech.timeline}>
  <caption-fine:Use style={primary-caption}/>
  <caption-fine:Use role="ALICE" style={alice-caption}/>
  <caption-fine:Use role="BOB" style={bob-caption}/>
  <caption-fine:Use during={story.selection.product-demo} style={dialogue-caption}/>
  <caption-fine:Use during={story.selection.private} style={hidden}/>
</caption-fine:Track>
```

`||` 決定 Cue 分組。視窗可以從 Cue 中間開始，完整文字和原來的逐詞時間仍然保留。`role` 按說話人過濾內容，獨立於時間視窗。也可以使用 `at`/`for`、`until`/`for` 或 `start`/`end`。

## Media 疊加層與 B-roll

B-roll 是通用 Media Track 的一種剪輯用途，不是獨立 Track 家族。一個 Item 可以在語義或絕對視窗內放置圖片、生成影片、已規範化含時素材或 Compositable Surface。

```svml
<import as="media-track" from="@hypit/media-track@1"/>
<import as="wording" from="@hypit/text@1"/>
```

### media-track:Track 與 media-track:Item

位置是一條顯式 Spatial Frame 邊，外觀和運動則是可複用的 SVS 值：

```svml
<wording:Value id="product-direction">
  A clean vertical product film: the written script becomes semantic regions,
  then those regions assemble into a finished video.
</wording:Value>

<seedance:ReferenceVideo id="product-motion" model="mini"
  prompt={product-direction} duration="5">
  <seedance:Reference image={product-reference} person-reference="false"/>
</seedance:ReferenceVideo>

<space:Frame id="product-frame" within={vertical}
  left="8%" top="20%" right="92%" bottom="68%"/>

<pipeline:Normalize id="product-media" source={product-motion.video}
  video="primary-moving" audio="none" span-authority="video" frame-rate="30"/>

<media-track:Track id="product-broll" timeline={speech.timeline} canvas={vertical}>
  <media-track:Item media={product-media.media} frame={product-frame}
    during={story.selection.product-demo}
    appearance={recipes.media.product}
    motion={recipes.motion.product}/>
</media-track:Track>
```

`left`、`top`、`right`、`bottom` 是父 Frame 內的邊座標；`right` 和 `bottom` 不是 CSS 式外邊距。Selection 只貢獻語義點；Media 包負責將這些點投影為視窗。同一個 Item 模型也能表達全屏切換、分屏和角落小窗。需要多個素材時，可以使用有序區域性 Layer 或顯式 Sequence。

每個 Item、Member 或取樣 Layer 都必須且只能宣告一種視覺輸入形式：

| 輸入 | 值 | 含義 |
|---|---|---|
| `image={...}` + `extent={...}` | Blob + 作者宣告的畫素尺寸 | 沒有自帶時長的靜態圖 |
| `media={...}` | `SynchronizedMedia` | 直接連線顯式準備好的含時素材 |
| `surface={...}` | `CompositableSurfaceRef` | 直接連線帶透明度語義的靜態或含時 Surface |

生成或匯入的影片 Blob 經 `<pipeline:Normalize>` 進入 Track：它檢查該 Blob、選出其中的流並放到同一個幀域上，輸出的 `.media` 即 `media=` 所連線的值。`audio="none"` 只取畫面，`audio="default"` 取源自帶的聲音，再由 `audio-gain` 調節。輸入名必須顯式，是為了絕不靠猜測把一個通用 Blob 當成圖片或影片。

**輸出：**`{product-broll.visual}`；只有作者顯式選擇了源音訊或 SFX 時才會出現
`{product-broll.audio}`。

## Audio Track

`@hypit/audio-track` 把顯式準備好的音訊放進與視覺 Track 相同的 Timeline。`Item`
消費 `SynchronizedMedia`；先規範化已宣告或生成的音訊 Blob，再選擇精確節目視窗與佔用方式：

```svml
<import as="media" from="@hypit/media@1"/>
<import as="pipeline" from="@hypit/media-pipeline@1"/>
<import as="audio" from="@hypit/audio-track@1"/>

<media:Audio id="music" src="./assets/music.wav"/>
<pipeline:Normalize id="music-media" source={music}
  video="none" audio="default" span-authority="audio" frame-rate="30"/>

<audio:Track id="music-bed" timeline={speech.timeline}>
  <audio:Item source={music-media.media} during="program"
    playback="loop-end" gain="0.28" fade-in="600ms" fade-out="800ms"/>
</audio:Track>
```

| 屬性 | 必填 | 描述 |
|---|---|---|
| `Track.id` | 是 | 穩定的 Audio Track 身份 |
| `Track.timeline` | 是 | 定義精確取樣域與幀域的 Timeline |
| `Item.source` | 是 | 顯式選流並規範化後的 `SynchronizedMedia` |
| `during`、`at`/`for` 或 `start`/`end` | 三種形式選一 | 全節目、Selection、Moment 或顯式視窗 |
| `playback` | 否 | `once`、`once-end`、`loop`、`loop-end` 或有界 `stretch` |
| `trim-start`、`trim-end` | 否 | 精確源裁切 |
| `gain`、`fade-in`、`fade-out` | 否 | 顯式的單 Item 混音值 |

該包不會自動提取、規範化、duck 或分配 bus。同一 Track 內的多個 Item 與多個對等 Audio
Track 都會作為獨立輸入進入 Film。輸出 `{music-bed.audio}` 是普通 `AudioTrack`。

## 文字疊加層

在螢幕上顯示的靜態或定時文字——標題、標註、下方三分之一字幕條。

```svml
<import as="text" from="@hypit/typography-track@1"/>
<import as="wording" from="@hypit/text@1"/>
```

### text:Track

文字專案的容器。

```svml
<space:Canvas id="vertical" width="1080" height="1920"/>
<space:Frame id="title-frame" within={vertical}
  left="6%" top="6%" right="94%" bottom="16%"/>
<fonts:Stack id="title-font" family="inter" weight="900" style="normal"/>
<text:Style id="title-style" recipe={recipes.text.title} font={title-font}/>
<text:Track id="titles" timeline={speech.timeline}>
  <text:Area id="title" placement={title-frame} style={title-style} during="program">
    EDIT MEANING, NOT TIMELINES
  </text:Area>
</text:Track>
```

| 屬性 | 必填 | 描述 |
|---|---|---|
| `id` | 是 | 唯一識別符號 |
| `semantic` | 是 | 來自 `time:Timeline` 的 Timeline——也用於解析基於 Selection 的專案計時 |

### text:Point、text:Area 與 text:Path

每個 Item 都明確選擇一種放置形式、一份精確 Style 和一種時間投影。`Area` 把流式文字放入
`SpatialFrame`：

```svml
<text:Area id="meaning" placement={title-frame} style={title-style} during="program">
  MEANING
</text:Area>
```

| 屬性 | 必填 | 描述 |
|---|---|---|
| `id` | 是 | 穩定的 Item 身份 |
| 子內容或 `content` | 是 | 內聯純文字/富文字，或普通圖 `Text` 引用；兩種形式互斥 |
| `during` | 是 | `"program"` 或 Selection 引用；也可使用 `at` 與顯式 `start`/`end` |
| `placement` | 是 | 與 Item 形式匹配的 `SpatialPoint`、`SpatialFrame` 或 `SpatialPath` |
| `style` | 是 | 由 SVS Recipe 與精確字型位元組共同編譯出的 `text:Style` |

`during` 屬性接受字面字串 `"program"`（表示完整 Timeline），或用於語義計時的 Selection、Segment 引用。同一套時間介面也接受作者宣告的 `start`/`end` 視窗和 `at`/`for` 事件：

```svml
<text:Style id="callout-style" recipe={recipes.text.callout} font={title-font}/>
<text:Track id="callout" timeline={speech.timeline}>
  <text:Area id="callout-copy" placement={callout-frame}
    style={callout-style} during={story.selection.callout}>
    EXACTLY THE RIGHT MOMENT
  </text:Area>
</text:Track>
```

圖中產生的文字會保留為顯式邊：

```svml
<wording:Value id="headline">EXACTLY THE RIGHT MOMENT</wording:Value>
<text:Track id="callout" timeline={speech.timeline}>
  <text:Area id="callout-copy" content={headline}
    placement={callout-frame} style={callout-style} during="program"/>
</text:Track>
```

通用 `Text` 只提供字元；Typography 仍然擁有文件包裝、位置、時間、樣式與動畫。作者需要富文字
Run 時，繼續使用內聯 `P`/`Span`/`Break`。

**輸出：**`{titles.track}` —— 新增到 `film:Film` 的 VisualTrack。

## 榜單板

榜單板讓一份有序列表跟著 Script 動起來。具體的容器、條目和 Style 詞彙由包宣告；寫作前先檢查已安裝包的詞彙。

| 容器 | 條目 | 樣式 |
|---|---|---|
| `ranking:Column` | `ranking:ColumnItem` | `ranking:ColumnStyle` |
| `ranking:TopThree` | `ranking:TopThreeItem` | `ranking:TopThreeStyle` |

```svml
<import as="ranking" from="@hypit/ranking@1"/>
```

### 樣式標籤

標籤必須為空，三個屬性全部必填：`id`、`recipe`（一份 SVS Recipe）與 `font`（Font Stack 或字型產物）。Recipe 由選中的元件變體定義，其他元件族的 Recipe 會被指名拒絕。

### 容器標籤

| 屬性 | 取值 |
|---|---|
| `semantic` | 板據以計時的 Timeline |
| `frame` | 一個 `space:Frame`——選中元件宣告的板面位置 |
| `during` | 選中元件宣告的時間形式 |
| `style` | 對應的樣式記錄，且只接受本變體的 |
| `terminal` | 完整板定格的 Moment。僅 `TopThree` |
| `canvas` | 選中元件可宣告的 `space:Canvas` |
| `appear-sound`、`move-sound` | 可選，Synchronized Media |

只使用所選包明確宣告的時間形式；不要從另一個元件族推斷 terminal 或 reveal 規則。

### 條目標籤

每個變體只接受自己的那一種，至少一個，且 id 在同一塊板內不可重複。

- **`TopThreeItem`** —— `label` 與 item 自己的 `at={story.moment...}` 必填，可選 `icon` 與 `stack`，最多三條。揭示順序由這些 Moment 的真實幀順序決定。
- **`ColumnItem`** —— `label` 與 `rank` 必填，可選 `icon` 與 `stack`。非 preset item 用自己的 `during` Selection；`preset="true"` 的 item 開場已在位且不寫 `during`。

```svml
<ranking:ColumnStyle id="board-style" recipe={recipes.ranking.board} font={ui-font}/>
<ranking:Column id="board" timeline={speech.timeline} canvas={vertical} frame={board-frame}
  during={story.selection.board} style={board-style}>
  <ranking:ColumnItem id="row-regen" rank="1" label="ReGen" icon={icon-regen}
    during={story.selection.regen-reveal}/>
  <ranking:ColumnItem id="row-chatgpt" rank="2" label="ChatGPT" icon={icon-chatgpt}
    during={story.selection.chatgpt-reveal}/>
  <ranking:ColumnItem id="row-remini" rank="3" preset="true" label="Remini" icon={icon-remini}/>
</ranking:Column>
```

**輸出：** `{board.visual}`——一條 VisualTrack。帶了聲音的板還會匯出 `{board.audio}`，一條 AudioTrack；沒有聲音時就沒有這個輸出。

## 卡片堆

卡片堆按深度排布卡片：一張在最前，其餘向後退去，每張新卡在一個 Moment 上發出。Media Item 是把一個鏡頭放進一個 Frame，而卡片堆是在同一個 Frame 裡維持一疊並整體移動它們。

```svml
<import as="deck" from="@hypit/deck-track@1"/>
```

### deck:DepthStack

`id`、`timeline`、`canvas`、`frame` 與 `appearance` 全部必填。同一份 Timeline 提供作者時間和已放置的語義錨點。`until` 同樣必填，指定這疊卡片何時結束：Moment、Selection 或 Segment 的邊界，或 `8s`、`program.end` 等作者時間。Selection 或 Segment 可以用 `until-boundary="start" | "end"` 選擇首尾，預設是 `end`。

### deck:Card

DepthStack 的直接子元素，自閉合，至少一張，按書寫順序發出。

| 屬性 | 取值 |
|---|---|
| `source` | 必填——靜態圖片、Synchronized Medium 或 Compositable Surface |
| `extent` | 靜態圖片必填，其餘情況給了會被拒絕 |
| `at` | 必填——這張卡發出的事件，可以是 Moment 或 `2s`、`12f` 等作者時間 |
| `appearance` | 可選——它自己的 Recipe，否則沿用整疊的 |
| `label` | 可選——一條 `deck:Label` 記錄 |

### deck:Label

`id` 與 `font` 必填。文案來自 `content=` 引用或元素自身的文字，兩個都給會被拒絕。`size`、`color`、`align`、`block`、`padding` 可選。

```svml
<space:Frame id="deck-frame" within={vertical} left="44%" top="60%" right="98%" bottom="88%"/>
<deck:DepthStack id="deck" timeline={speech.timeline} canvas={vertical}
  frame={deck-frame} appearance={recipes.deck.stack} until={story.moment.done}>
  <deck:Card id="card-spatial" source={icon-spatial} extent={square} at={story.moment.deal-one}/>
  <deck:Card id="card-type" source={icon-type} extent={square} at={story.moment.deal-two}/>
</deck:DepthStack>
```

**輸出：** `{deck.track}`——一條 VisualTrack，與 Film 中其它每一條 Track 平級。

## 螢幕疊加層

覆蓋在整個畫面之上、而非落在某個 Frame 裡的效果：切點上的一次閃白、持續整個 Selection 的暗角、鋪滿全片的顆粒。一條 Track 承載全部，每個子元素是一個效果加它自己的時間窗。

```svml
<import as="screen" from="@hypit/screen-overlay@1"/>
```

`screen:Track` 接受 `id`、`canvas`，以及 統一的 `timeline` 時間來源。它的子元素就是各個效果，至少一個，各自為空，都必須帶 `z` 決定層疊順序，並且各有一個時間窗，形式是以下之一：

| 時間窗 | 寫法 |
|---|---|
| 整個節目 | `during="program"` |
| 一個 Selection | 在帶有 `timeline={speech.timeline}` 的 Track 內寫 `during={story.selection.x}` |
| 一個 Moment，持續一段時長 | 在帶有 `timeline={speech.timeline}` 的 Track 內寫 `at={story.moment.x} for="12f"` |
| 顯式區間 | `start="…" end="…"`，可另外指定 `selection=` 或 `moment=` |

時長寫作 `12f`、`250ms` 或 `1.5s`。一個 Selection
只表示一個連續區間，一個 Moment 只表示一個點；同一效果需要再次出現時，應再寫一個 item。

可用的效果有十一種——`Flash`、`ColorWash`、`Vignette`、`ScanLines`、`DirectionalMatte`、`WhipVeil`、`GlitchVeil`、`Grain`、`LightLeak`、`Bokeh` 與 `TVStatic`——每種各有自己的必填屬性，例如 `Flash` 的 `color` / `intensity` / `attack` / `hold` / `decay`，或 `Vignette` 的 `center-x` / `center-y` / `radius-x` / `radius-y` / `softness` / `color` / `opacity`。它們都沒有預設值：一個效果要麼把自己的形狀說全，要麼被拒絕。

```svml
<screen:Track id="effects" timeline={speech.timeline} canvas={vertical}>
  <screen:Flash during={story.selection.overlay} z="80"
    color="#ffffff" intensity="0.6" attack="2" hold="2" decay="6"/>
</screen:Track>
```

**輸出：** `{effects.track}`——一條 VisualTrack。

## 評論貼紙

放置在 Frame 中的社交風格評論卡：頭像、作者、評論正文，以及可選的一行附註。

```svml
<import as="comment" from="@hypit/comment-sticker@1"/>
```

`comment:Style` 必須為空，接受 `id`、`recipe` 與 `font`，全部必填。Recipe 承載整張卡的外觀——背景、描邊、圓角、氣泡尾、頭像、三行文字，以及進入/停留/退出的動效——每個鍵都有預設值，所以一份 recipe 只需寫它要改的部分。

`comment:Track` 接受 `id`、`canvas` 與 `semantic`，三者皆為必填。

`comment:Sticker` 必填 `id`、`frame` 與 `style`，時間窗與上面的螢幕疊加層相同。它的文案來自 `comment=` 屬性或元素自身的文字，兩個都給會被拒絕。可選的 `author`、`header` 與 `meta` 各接受字串或 Text 引用，`avatar` 接受一張圖片；這裡沒有 `z`，層疊順序來自 recipe 的 `stack-order`。

```svml
<comment:Style id="social" recipe={recipes.comment} font={ui-font}/>
<comment:Track id="comments" canvas={vertical} timeline={speech.timeline}>
  <comment:Sticker id="one" frame={comment-frame} style={social} avatar={viewer-avatar}
    author="@viewer" meta="Featured" during={story.selection.reaction}>
    原來它把字幕釘在詞上，而不是釘在秒上。
  </comment:Sticker>
</comment:Track>
```

**輸出：** `{comments.track}`——一條 VisualTrack。

## 組合示例

四類 Track 在一個原始檔中協同使用：

```svml
<import as="caption" from="@hypit/caption@1"/>
<import as="caption-fine" from="@hypit/caption-fine@1"/>
<import as="fonts" from="@hypit/fonts-open@1"/>
<import as="media" from="@hypit/media@1"/>
<import as="pipeline" from="@hypit/media-pipeline@1"/>
<import as="media-track" from="@hypit/media-track@1"/>
<import as="text" from="@hypit/typography-track@1"/>
<import as="audio" from="@hypit/audio-track@1"/>
<import as="space" from="@hypit/spatial@1"/>

<!-- Captions: primary style for all text -->
<fonts:Stack id="caption-font" family="inter" weight="700" style="normal"/>
<fonts:Stack id="title-font" family="inter" weight="900" style="normal"/>
<caption-fine:Style id="base-caption" recipe={recipes.caption.base} font={caption-font}/>

<caption-fine:Track id="captions" document={story.caption}
  timeline={speech.timeline}>
    <caption-fine:Use style={base-caption}/>
  </caption-fine:Track>

<!-- 共享位置是顯式邊，與 Media/Text 外觀分開。 -->
<space:Canvas id="vertical" width="1080" height="1920"/>
<space:Frame id="title-frame" within={vertical}
  left="6%" top="6%" right="94%" bottom="16%"/>
<space:Frame id="card-frame" within={vertical}
  left="10%" top="20%" right="90%" bottom="70%"/>

<!-- Media：Selection 期間顯示一個普通 Item -->
<pipeline:Normalize id="card-media" source={motion.video}
  video="primary-moving" audio="none" span-authority="video" frame-rate="30"/>
<media-track:Track id="cards" timeline={speech.timeline} canvas={vertical}>
  <media-track:Item media={card-media.media} frame={card-frame}
    during={story.selection.demo} appearance={recipes.media.card} motion={recipes.motion.card}/>
</media-track:Track>

<!-- Text: persistent title overlay -->
<text:Style id="title-style" recipe={recipes.text.title} font={title-font}/>
<text:Track id="titles" timeline={speech.timeline}>
  <text:Area id="meaning" placement={title-frame} style={title-style} during="program">
    MEANING
  </text:Area>
</text:Track>

<!-- Audio：先規範化一份已宣告素材，再把它放滿整個節目 -->
<media:Audio id="music" src="./assets/music.wav"/>
<pipeline:Normalize id="music-media" source={music}
  video="none" audio="default" span-authority="audio" frame-rate="30"/>
<audio:Track id="music-bed" timeline={speech.timeline}>
  <audio:Item source={music-media.media} during="program"
    playback="loop-end" gain="0.28" fade-in="600ms" fade-out="800ms"/>
</audio:Track>

<!-- 所有對等 Track 都進入 Film -->
<import as="sound" from="@hypit/sound@1"/>
<sound:Style id="voice-style"/>
<sound:Track id="voice" timeline={speech.timeline}>
  <sound:Use style={voice-style}/>
</sound:Track>

<film:Film id="main" canvas={vertical} timeline={speech.timeline} appearance={recipes.film.vertical}>
  <film:Track source={performance.visual}/>
  <film:Track source={voice.audio}/>
  <film:Track source={cards.visual}/>
  <film:Track source={captions.track}/>
  <film:Track source={titles.track}/>
  <film:Track source={music-bed.audio}/>
</film:Film>
```

本例的 Recipe 將表演畫面放在 10，Media 放在 40，字幕放在 70，文字放在 90。
數值越高，繪製位置越靠前；作者按作品需要選擇這些關係。
