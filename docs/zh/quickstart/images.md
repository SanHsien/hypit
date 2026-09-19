---
title: 圖片操作
description: 在圖片流向生成器或 Track 之前，對它做合成、校正與摳圖。
---

有三個包接收一張圖片、交還一張圖片。它們都不產出 Track：每個輸出都是一張可供下游引用的圖片——作為 Seedance 的參考幀、作為 Media Item，或作為下一次操作的來源。

它們都需要 Endpoint。`image-compose` 與 `image-transform` 索取 raster 能力，由 `@hypit/provider-image-opencv-local` 在本機執行 OpenCV 來滿足；`background-removal` 索取的是它自己宣告的能力，由所選專案 Provider 實現。使用這些操作時，在 [Runtime Profile](/zh/guide/runtime) 中選擇支援它們的 Endpoint。

## 合成圖層

`compose:Image` 按書寫順序把各圖層畫到同一張畫布上，交還一張 PNG。

```svml
<import as="compose" from="@hypit/image-compose@1"/>
```

元素接受 `id` 與 `canvas`，以及可選的 `background`——它必須帶 alpha，寫作 `#RRGGBBAA`，預設為完全透明。子元素是 `compose:Layer`，至少一個、至多六十四個，各自為空：

| 屬性 | 取值 |
|---|---|
| `source` | 必填——一張圖片 |
| `frame` | 必填——一個 `space:Frame` |
| `fit` | 可選——`contain`（預設）、`cover` 或 `stretch` |
| `interpolation` | 可選——`nearest`、`linear`、`cubic`、`area` 或 `lanczos`（預設） |
| `opacity` | 可選——0 到 1，預設 1 |

```svml
<compose:Image id="card" canvas={portrait} background="#00000000">
  <compose:Layer source={background.image} frame={full} fit="cover"/>
  <compose:Layer source={product.image} frame={product-frame} fit="contain"/>
</compose:Image>
```

**輸出：** `{card.image}`——一張圖片，不是 Track。

## 校正圖片

`image:Program` 是一份具名的操作清單，`image:Transform` 把它作用在某個來源上。這樣拆開是有意的：一份寫好的 program 可以套用到每一個需要同樣處理的鏡頭上。

```svml
<import as="image" from="@hypit/image-transform@1"/>
```

`image:Program` 只接受 `id`，操作以子元素形式書寫，按書寫順序依次施加：

| 操作 | 屬性 |
|---|---|
| `Crop` | `x`、`y`、`width`、`height`；可選 `unit="fraction" \| "pixel"` |
| `Resize` | `width`、`height`；可選 `fit`、`interpolation`、`background` |
| `Rotate` | `degrees`，只能是 `90`、`180` 或 `270` |
| `Flip` | 可選 `axis="horizontal" \| "vertical" \| "both"` |
| `Denoise` | 可選 `luma`、`chroma`、`template-window`、`search-window`、`saturation-recovery` |
| `Color` | 可選 `exposure-stops`、`contrast`、`saturation`、`temperature`、`tint`、`gamma` |
| `Sharpen` | 可選 `amount`、`radius`、`threshold` |
| `Blur` | `sigma` |
| `Alpha` | 可選 `mode="preserve" \| "flatten"`；`flatten` 要求給出 `background`，`preserve` 則拒絕它 |
| `Encode` | 可選 `format="png" \| "jpeg" \| "webp"`、`quality`、`background` |

一份 program 至多只能有一個 `Encode`，且必須放在最後。除 `Blur`、`Rotate` 與 `Crop` 之外，每個操作都能僅憑預設值執行，所以 `<image:Denoise/>` 本身就是一條完整的指令。

`image:Transform` 接受 `id`、`source` 與 `program`，全部必填。

```svml
<image:Program id="clean-gpt-image">
  <image:Denoise/>
  <image:Encode format="png"/>
</image:Program>

<image:Transform id="clean-shot" source={shot.image} program={clean-gpt-image}/>
```

**輸出：** `{clean-shot.image}`。program 本身不產出任何圖片——它是一份配方，在 `Transform` 中指名它才會真正執行。

## 去除背景

```svml
<import as="remove" from="@hypit/background-removal@1"/>
```

`remove:Background` 必須為空，接受 `id` 與 `source`。它不挑選模型、閾值或儲存——那是 endpoint 的事，不是 Source 的事。

```svml
<remove:Background id="cutout" source={portrait.image}/>
```

**輸出：** `{cutout.image}`——通常餵給一個 Media Item，好讓出鏡者疊在畫面上，而不是待在一個方框裡。

## 移動人物摳像

人物需要出現在其他畫面之上時，可以將生成或已有影片交給 [`@hypit/volcengine-matting`](https://github.com/hypit-ai/hypit/blob/main/packages/volcengine-matting/README.md)，由支援該能力的 HypiHub Endpoint 執行：

```svml
<import as="matte" from="@hypit/volcengine-matting@1"/>
<matte:Portrait id="cutout" source={performance.video}/>
```

將 `cutout.video` 歸一化，準備進入時間線。如果它建立說話節目的語義骨架，再把準備好的媒體與 Script Segment 對齊，透過 Timeline assembly 裝配。畫面由 Media Track 或專案場景按選擇的位置、繪製順序呈現。作為 B-roll 時，歸一化後的摳像可以直接進入 Media Track。摳像改變畫面背景，具體角色由編排決定。
