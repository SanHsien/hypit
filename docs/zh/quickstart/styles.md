---
title: SVS 樣式表
description: SVS Recipe 語言——用於影片、字幕、媒體、文字及生成設定的類 CSS 樣式表。
---

SVS（`.svs`）檔案使用類 CSS 語法定義可複用的型別化配置值。它們用於配置影片外觀、字幕外觀、Media 呈現與運動、文字樣式、生成設定和字型選擇。SVS 中的值稱為 **Recipe**——它們是不可變的型別化記錄，由消費元件進行驗證和解釋。

## 基本語法

```svs
<?svml using="@hypit/svs@1"?>

<sheet version="1" id="studio">
  film.vertical {
    background: #09090B;
  }

  /* Comments use CSS-style block syntax. */
  caption.primary {
    fill: #FFFFFF;
    size: 58;
  }
</sheet>
```

- 處理指令 `<?svml using="@hypit/svs@1"?>` 用於選擇 SVS 解析器。
- `<sheet>` 元素包裹所有宣告。`id` 屬性成為頂層名稱空間。
- 每個塊的格式為 `namespace.name { ... }`，屬性以 `;` 結尾的鍵值對形式書寫。
- 註釋使用 `/* ... */`。

## 匯入與引用

在 `.svml` 原始檔中透過名稱空間字首匯入 SVS 檔案：

```svml
<import as="recipes" source="./recipes.svs"/>
```

然後透過 `{recipes.film.vertical}`、`{recipes.caption.primary}` 等方式引用各個 Recipe。字首來自 `as=` 屬性；路徑來自樣式表中的 `namespace.name`。

## Film

Film 外觀只擁有畫布清除顏色。畫布尺寸是顯式的 `space:Canvas` 圖值，幀率來自 Timeline 使用的 Clock。

```svs
film.vertical {
  background: #09090B;
}
```

| 屬性 | 描述 |
|---|---|
| `background` | 畫布清除顏色（十六進位制） |

透過 `film:Film` 的 `appearance` 屬性引用：

```svml
<space:Canvas id="vertical" width="1080" height="1920"/>
<film:Film id="main" canvas={vertical} timeline={speech.timeline} appearance={recipes.film.vertical}>
```

## Caption Fine

第一種官方 Caption 樣式族把規劃要求和渲染引數放在同一個 Recipe 中。

```svs
caption.dialogue {
  stack-order: 70;
  x: 0.08;
  y: 0.76;
  width: 0.84;
  size: 58;
  line-height: 0.96;
  align: center;
  fill: #FFFFFF;
  background: #09090BCC;
  padding: 16 24;
  radius: 18;
}
```

| 屬性 | 描述 |
|---|---|
| `stack-order` | 所有 Track 之間的 Z 軸層疊順序（值越大越靠前） |
| `x`、`y` | 位置，以畫布比例表示（0–1） |
| `width` | 寬度，以畫布比例表示 |
| `size` | 字型大小（畫素） |
| `line-height` | 行高倍數 |
| `align` | 文字對齊方式：`left`、`center`、`right` |
| `fill` | 文字顏色（十六進位制，支援透明度） |
| `background` | 容器背景顏色（十六進位制，支援透明度，如 `#09090BCC`） |
| `padding` | 容器內邊距（畫素）（單個值或 `垂直 水平`） |
| `radius` | 容器圓角半徑（畫素） |

若要可復現渲染，應在 `.svml` 原始碼中顯式選擇已安裝的精確字型，並把該 Record 傳給 Fine
Style。字型家族、字重和字形只在這條精確字型邊上宣告一次：

```svml
<fonts:Stack id="caption-font" family="inter" weight="600" style="normal"/>
<caption-fine:Style id="primary-caption" recipe={recipes.caption.dialogue}
  font={caption-font}/>
```

### 按角色設定字幕樣式

為不同說話者定義多個字幕 Recipe：

```svs
caption.alice {
  stack-order: 70;
  x: 0.08; y: 0.76; width: 0.84;
  size: 58;
  line-height: 0.96;
  align: center;
  fill: #73FBD3;
  background: #09090BCC;
  padding: 16 24; radius: 18;
}

caption.bob {
  stack-order: 70;
  x: 0.08; y: 0.76; width: 0.84;
  size: 58;
  line-height: 0.96;
  align: center;
  fill: #FFD166;
  background: #09090BCC;
  padding: 16 24; radius: 18;
}
```

然後在 Track 中透過 Use 選擇呈現樣式：

```svml
<fonts:Stack id="caption-font" family="inter" weight="600" style="normal"/>
<caption-fine:Style id="default-caption" recipe={recipes.caption.dialogue} font={caption-font}/>
<caption-fine:Style id="alice-caption" recipe={recipes.caption.alice} font={caption-font}/>
<caption-fine:Style id="bob-caption" recipe={recipes.caption.bob} font={caption-font}/>
<caption-fine:Track id="captions" document={story.caption} timeline={speech.timeline}>
  <caption-fine:Use style={default-caption}/>
  <caption-fine:Use role="ALICE" style={alice-caption}/>
  <caption-fine:Use role="BOB" style={bob-caption}/>
</caption-fine:Track>
```

## Media Track

Media 將空間位置、框呈現與生命週期運動分開。`SpatialFrame` 負責位置和尺寸；外觀 Recipe
負責素材適配與框材質；可選的 motion Recipe 負責入場、持續和退場。

```svs
media.product {
  stack-order: 40;
  fit: contain;
  playback: hold-start;
  frame-paint: #111116;
  clip: rounded;
  radius: 28;
  padding: "0";
  border-width: 1;
  border-style: solid;
  border-color: #FFFFFF20;
  shadows: 0 10 24 0 #00000066;
}

motion.product {
  enter: slide;
  enter-frames: 8;
  enter-direction: up;
  enter-easing: ease-out;
  exit: fade;
  exit-frames: 6;
  exit-easing: ease-in;
}
```

| 屬性 | 描述 |
|---|---|
| `stack-order` | Z 軸層疊順序 |
| `fit` | `contain`、`cover`、`fit-width`、`fit-height`、`native`、`scale-down` 或 `stretch` |
| `frame-x`、`frame-y` | 放置 Frame 內的對齊點 |
| `content-x`、`content-y` | 素材內部獨立選擇的焦點 |
| `playback` | `once-start`、`hold-start`、`loop-end`、`stretch` 等有時長素材佔用方式 |
| `frame-paint` | 取樣素材背後的純色或漸變 Paint |
| `clip`、`radius`、`padding` | 框裁切與內縮 |
| `border-*`、`shadows` | 框自有的邊框與有序陰影 |
| `enter`、`exit` | 生命週期運算元；幀數、緩動和方向使用獨立屬性 |
| `sustain` | 零個或多個確定性區域性運動，例如 `float 12 2 up` |

位置始終是一條顯式圖邊：

```svml
<space:Frame id="product-frame" within={vertical}
  left="8%" top="20%" right="92%" bottom="68%"/>
<media-track:Item media={product-media.media}
  during={story.selection.demo} frame={product-frame}
  appearance={recipes.media.product} motion={recipes.motion.product}/>
```

## 文字

文字疊加層外觀——排版與 Paint。位置由另一條 `SpatialFrame` 圖邊提供。

```svs
text.title {
  stack-order: 90;
  weight: 900;
  size: 64;
  align: center;
  fill: #FFFFFF;
  tracking: -1;
}
```

| 屬性 | 描述 |
|---|---|
| `stack-order` | Z 軸層疊順序 |
| `weight` | 字型粗細 |
| `size` | 字型大小（畫素） |
| `align` | 文字對齊方式 |
| `fill` | 文字顏色 |
| `tracking` | 字間距調整 |

先與精確字型位元組一起編譯為 `text:Style`，再由具體放置形式引用：

```svml
<fonts:Stack id="title-font" family="inter" weight="900" style="normal"/>
<text:Style id="title-style" recipe={recipes.text.title} font={title-font}/>
<text:Area id="meaning" placement={title-frame} style={title-style} during="program">
  MEANING
</text:Area>
```

## Speaker Text Template

這個 Recipe 選擇純資料 `speaker-v1` Text Template 宣告的 Prompt 軸。模型、解析度、參考素材與時長仍是 `seedance:ReferenceVideo` 的顯式輸入，不藏在 Recipe 裡。

```svs
speaker.host {
  composition-stability: soft-locked;
  camera-motion: none;
  edit-rhythm: continuous-take;
  performance: natural-explainer;
  gesture: natural;
}
```

| 屬性 | 描述 |
|---|---|
| `composition-stability` | 鏡頭/構圖一致性：`flexible-ugc`、`soft-locked`、`strict-locked` |
| `camera-motion` | 鏡頭運動：`none`、`subtle-punch-in-return` |
| `edit-rhythm` | 剪輯風格：`continuous-take`、`pause-trim-jump-cuts` |
| `performance` | 表演風格：`natural-explainer`、`high-energy-ugc`、`calm-authority`、`reactive-playful` |
| `gesture` | 手勢強度：`restrained`、`compact`、`natural`、`expressive` |
與 Kit 的 Template 一起由 `text:Render` 引用：

```svml
<text:Render id="hook-prompt"
  template={speaker-kit.speaker-v1} recipe={recipes.speaker.host}>
  <text:Set name="dialogue" text={story.segment.hook.dialogue}/>
  <text:Set name="action" text={hook-action}/>
</text:Render>
```

## 通用 Text Template Recipe

無需領域包裝器也能使用同一優先順序。`text:Render` 可以讀取任意 SVS Recipe，只投影模板明確宣告的屬性，並允許顯式 `text:Param` 覆蓋。這使 Seedance 的 B-roll、Podcast、Call、
Street Interview 與參考遷移 Kit 可以保持為純資料，而不進入 Seedance 執行程式碼。

```svs
broll.product-demo {
  material-mode: product-beauty;
  story-shape: process-demo;
  edit-language: insert-cutaway;
  camera-language: product-macro;
  motion-intensity: readable;
}
```

Street Interview、Podcast 與 Call 使用同一套 Recipe 機制，不需要手寫固定 Prompt。例如：

```svs
interview.street {
  framing: soft-handheld;
  pacing: compact;
  performance: natural-street;
  reaction: active;
  gesture: natural;
}
```

`street-interview-v1` 讀取這五個軸，每段的鏡頭變化按作者順序直接寫在 `action` 中。`podcast-v1` 與 `call-v1` 讀取同名的 `framing`、
`edit-language`、`pacing`、`performance`、`reaction` 和 `gesture` 軸，但使用各自的有限值。允許值和預設值以所選 Kit 檔案為準。

模型、解析度、時長和參考媒體不是模板策略；它們繼續存在於精確模型 Surface 與顯式圖邊中。

## 精確字型宣告

SVS 描述字型策略，但不選擇或開啟字型位元組。常用開源字型由私有的預釋出字型目錄顯式匯入；只有作者圖真正引用的字型會進入本次 Build：

```svml
<import as="fonts" from="@hypit/fonts-open@1"/>

<fonts:Stack id="caption-fonts" family="inter" weight="600" style="normal" emoji="color">
  <fonts:Fallback family="noto-sans-sc" weight="600" style="normal"/>
</fonts:Stack>
```

| 屬性 | 描述 |
|---|---|
| `family` | 字型包有限目錄中的字型族 |
| `weight` | 精確選擇的字型粗細 |
| `style` | `normal` 或該字型族支援的 `italic` |
| `emoji` | `Stack` 可選的 `color`（COLRv1）或 `mono` 兜底 |

目錄現有 109 個開源字型族，覆蓋手寫、書法、展示、無襯線、襯線、等寬、CJK、其他文字系統與 Emoji。Fontsource 依賴固定為 `5.3.0`，Chromium 相容的 COLRv1 Emoji 包另行鎖定版本；編譯器把已安裝位元組雜湊成內容定址的字型值，Build 過程不會下載字型，Runtime
也不猜字型：

```svml
<caption-fine:Style id="dialogue" recipe={recipes.caption.dialogue}
  font={caption-fonts}/>
```

`fonts:Stack` 產出通用 `FontStackRef`，主字型與 Fallback 都保留自己的真實後設資料；
Caption Recipe 不再重複家族、字重或字形。CJK 與 Emoji 即使由多個 Unicode-range 檔案組成，在作者圖中仍是一條邏輯邊。終端 Text 與 Fine Caption 都拒絕省略字型棧；Visual IR 不接受機器字型兜底。對於同時具有文字與 Emoji 兩種呈現的符號，作者應寫真實的 Unicode Emoji 序列（例如包含 VS16 的 `☎️`）；任何包都不會為了強制彩色而改寫顯示稿。

品牌字型與自定義字型仍是顯式作者資產，不會被塞進共享目錄：

```svml
<import as="media" from="@hypit/media@1"/>
<media:Font id="brand" src="./assets/Brand-Semibold.woff2"
  weight="600" style="normal"/>
```

## 綜合示例

一個完整的 `recipes.svs` 檔案，用於四段式說話人頭像專案：

```svs
<?svml using="@hypit/svs@1"?>

<sheet version="1" id="studio">

  speaker.host {
    composition-stability: soft-locked;
    camera-motion: none;
    edit-rhythm: continuous-take;
    performance: natural-explainer;
    gesture: natural;
  }

  film.vertical {
    background: #09090B;
  }

  caption.primary {
    stack-order: 70;
    x: 0.08;
    y: 0.74;
    width: 0.84;
    size: 44;
    line-height: 1;
    align: center;
    fill: #FFFFFF;
    background: #09090BCC;
    padding: 14 20;
    radius: 16;
  }
</sheet>
```

該檔案在 `.svml` 原始檔中匯入一次，其值在整個檔案中被引用：

```svml
<import as="recipes" source="./recipes.svs"/>

<text:Render id="hook-prompt" template={speaker-kit.speaker-v1}
  recipe={recipes.speaker.host}>...</text:Render>

<caption-fine:Style id="primary-caption" recipe={recipes.caption.primary} font={caption-font}/>

<space:Canvas id="vertical" width="720" height="1280"/>
<film:Film id="main" canvas={vertical} timeline={speech.timeline} appearance={recipes.film.vertical}>
```
