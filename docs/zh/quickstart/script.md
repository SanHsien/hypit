---
title: Script
description: Script Surface——Segment、Role Cue、Dual Text、Selection、Moment 與文字投影。
---

`<script>` 元素承載旁白或講者說出的每一個字。Script 以**散文為先**：它不包含時間碼、不引用媒體、不設定樣式、不攜帶生成引數。管線中的其他元件都會讀取 Script；Script 本身不讀取任何內容。

```svml
<import from="@hypit/script@1"/>

<script id="story">
  <opening>
    <HOST> Hello world.
  </opening>
</script>
```

引入 `@hypit/script@1` 會啟用 Script Surface。`id` 屬性讓其他元件可以引用該 Script 及其各部分。

## Segment

Segment 是按順序排列的語音內容塊。標籤名**即**其 id——在同一個 Script 內必須唯一。

```svml
<script id="story">
  <opening>
    Hello world.
  </opening>

  <pause/>

  <middle>
    This is the second part.
  </middle>

  <close>
    Goodbye.
  </close>
</script>
```

- Segment 可以是自閉合標籤（`<pause/>`）。空的 Segment 擁有結構但沒有語音詞元；它並不意味著靜音或任何預設時長。
- Segment 不能巢狀——每個 Segment 都是 `<script>` 的頂層子元素。
- Segment 名稱符合 `[a-z][a-z0-9_-]{0,63}`；`script` 是保留名稱。

其他元件透過 `{story.segment.opening}` 引用單個 Segment，透過 `{story.segment.opening.dialogue}` 或 `{story.segment.opening.speech}` 引用其文字投影。

## Role Cue

Role Cue 標識 Segment 內部**誰說了什麼**。它們不是講者實體，不選擇語音，也不建立角色。

```svml
<dialogue>
  <ALICE> What time is it?
  <BOB> It's 8:30.
</dialogue>
```

- Role Cue **沒有關閉標籤**。一段話從當前 Role Cue 開始，延續到下一個 Role Cue 或 Segment 結尾為止。
- 一個 Segment 必須全部使用或全部不使用 Role Cue——混用會導致錯誤。
- 標籤長度為 1–32 個字元。

Role Cue 會產生不同的文字投影：

| 投影 | 上例的輸出 |
|---|---|
| **dialogue** | `ALICE: What time is it?`<br>`BOB: It's 8:30.` |
| **speech** | `What time is it?`<br>`It's 8:30.` |
| **caption** | `What time is it?`<br>`It's 8:30.` |

dialogue `Text` 包含 Role Cue 字首，speech `Text` 和 CaptionDocument 會去除字首。給
`seedance:ReferenceVideo` 提供輸入的 Prompt Program 可以使用 `{story.segment.dialogue.dialogue}`
（帶標籤）。Script 輸出一份 `{story.caption}` CaptionDocument，裡面有顯示詞、N:M 對齊單元
和作者寫出的 Cue 分界；裡面沒有秒數或幀數。

## Dual Text

當螢幕上顯示的文字與實際說出的文字不同時：

```svml
<explanation>
  <HOST> We call it <SVML | semantic video markup language>.
</explanation>
```

左側進入 **caption** 投影；右側進入 **dialogue** 和 **speech** 投影。

| 投影 | 輸出 |
|---|---|
| **caption** | `We call it SVML.` |
| **speech** | `We call it semantic video markup language.` |

左側為空是合法的：

```svml
<HOST> I was < | um> saying that this works.
```

這意味著 "um" 會被說出但永遠不會顯示為字幕。兩側可以有不同的單詞數量——這是一種 N:M
對齊單元，而非 1:1 替換；即使語義標記定位到口播內部的一個詞，顯示單元仍然保持完整。

兩側都明確書寫時，標記只能出現在 Dual Text 的 spoken side。display side 是字面文字，未轉義的 `@` 會報錯；
如果確實要顯示 at-sign，請寫成 `\@`。

兩邊文案相同時，可以省略豎線後面的口播：

```svml
<explanation><HOST>把<動效|><元件化|>。|| 以後就能<直接複用|>。</explanation>
```

`<元件化|>` 等價於 `<元件化|元件化>`：字幕是一個完整單元，口播中的三個字仍各自保留時間。
字幕樣式可以讓這組文字一起高亮；普通文字仍然可以直接書寫，不必逐詞包裹。`||` 繼續決定
Cue 的切換。這同樣適用於其他語言的短語或名字，例如 `<Git Hub|>`。

這時左側同時提供口播，因此標記也可以放在左側，Studio 會回寫到實際文字上：
`<組@{beat!}件化|>`。標記和顯示屬性不會成為口播內容。若明確寫了右側口播，標記仍然屬於
右側。明確或共享的口播都必須包含可說出的詞；`<API|...>` 只有標點，無法建立時間對應，因此無效。

`||` 是 **Caption Cue Break** 語法，只能位於完整對齊單元之間，不能寫進 Dual Text 或切開
N:M 單元。字幕稍後才把 CaptionDocument 與 Timeline 匯合得到幀時間。

### 空格與拼寫

按想顯示的內容書寫：`是的 就是這樣`、`3개월`、`3 개월`、`3D` 和 `3 D` 會保留各自的
分隔。連續普通空白規範為一個空格；說話輪次首尾的排版空白和 Dual Text 兩側的邊緣空白
不顯示。原始碼換行不是字幕換行；用 `||` 分 Cue，用所選字幕樣式控制視覺換行。

語義標記不貢獻文字或空格。`是的@{part}就是這樣@{/part}` 連續顯示；
`是的 @{part}就是這樣@{/part}` 保留空格。`<文字|>` 用來明確字幕分組，
不是保護拼寫或空格所必需的寫法。

### 扁平詞屬性

顯示詞可以帶一個扁平的屬性塊。屬性寫在詞後面，不巢狀，也不表達時間：

```svml
<line><HOST>This is really{emphasis,keyword} important{brand}.</line>
```

不寫 `=` 的屬性值預設為 `true`，也可以寫成 `name=value`。Caption 家族決定這些顯示詞屬性
如何影響表現。帶時間範圍的 Use 選擇字幕 Style；屬性不會切開、包裹或改變 Dual
對齊單元的時間。

### CaptionDocument 的組成

`CaptionDocument` 是 Script 擁有的字幕真相，包含三種明確的語法物件：

- **Display Word（顯示詞）**：一個用於渲染的詞面，包含應該顯示的標點；
- **Alignment Unit（對齊單元）**：最小的顯示-口播對應關係，Dual Text 的 N:M 對映也保持為一個單元；
- **Cue Break（Cue 分界）**：作者寫出的 `||`，只能放在完整對齊單元之後。

標點不是口播 token，也不會獲得獨立時間窗。Dual Text 後面的句號會吸附到前一個顯示詞：
`<test | now>. here` 顯示為 `test. here`，口播投影仍是 `now. here`。英文按詞拆分；漢字、
平假名和片假名按字元級 lexical unit 拆分，因此中文不會被當成一個巨大的詞。

## Selection

Selection 是內聯宣告的具名語義**範圍**。每個名字只能有一對開啟/關閉標記；它的值是兩個
語義錨點，而不是幀區間：

```svml
<script id="story">
  @{whole}
  <opening>
    <HOST> @{problem} Current tools make agents operate a timeline. @{/problem}
  </opening>

  <answer>
    <HOST> @{solution} SVML removes that editing loop. @{/solution}
  </answer>
  @{/whole~}
</script>
```

### 語法

所有標記都以 `@{` 開始、以 `}` 結束；`/`、`!`、`~` 均在內部。名稱以小寫字母開頭，
後續可用小寫字母、數字、`_`、`-`，總長不超過 64；內部不允許空白或巢狀。
`@{beat!}` 是 Moment，`@{part}!` 則是區間首後跟正文感嘆號。標記不能切開語音 Token，也不能插到它與附著標點之間：應寫 `@{beat!}“測試”`，不能寫 `“@{beat!}測試”`。


| 標記 | 含義 |
|---|---|
| `@{id}` | 開啟，右吸附（從下一個單詞開始） |
| `@{~id}` | 開啟，左吸附（從前一個單詞的末尾開始） |
| `@{/id}` | 關閉，左吸附（在前一個單詞的末尾結束） |
| `@{/id~}` | 關閉，右吸附（在下一個單詞的起始處結束） |

`~` 字尾/字首控制邊界是吸附到左邊還是右邊。預設的開啟標記為右吸附；預設的關閉標記為左吸附。

完整 Script 嚴格擁有 `2M + 2N + 2` 個有序語義錨點：每個 Token 兩個、每個 Segment 兩個，
再加 Program 自己的首尾。最外側切口仍用 affinity 區分語義：第一個 Segment 前的 `@{~id}`
選擇 Program start，`@{id}` 選擇首 Segment start；末 Segment 後的 `@{/id}` 選擇末 Segment end，
`@{/id~}` 選擇 Program end。對齊後它們可能落在同一幀，但作者身份並不相同。

### 多個具名 Selection

不同名字可以重疊或交叉，但每個名字仍然只有一個區間：

Selection 不要求像 XML 標籤那樣巢狀，它們可以互相交叉：

```svml
<demo>
  <HOST> @{a}One @{b}two@{/a} three.@{/b}
</demo>
```

Selection 標記是零寬度的，不會出現在任何文字投影中。它們編譯為帶有
`startAnchorId`/`endAnchorId` 的 `NarrativeSelection`。Script 本身不包含秒數或幀號——時間
資訊來自 Timeline 對齊。

其他元件透過 `{story.selection.problem}` 引用 Selection，將視覺內容繫結到敘事中的語義時刻。

## Moment

Moment 是具名的時間**點**（不是範圍）：

```svml
<ecosystem>
  <HOST> @{ranking!} Image generation, video generation, captions and B-roll
         all become reusable components.
</ecosystem>
```

| 標記 | 含義 |
|---|---|
| `@{id!}` | 右吸附（時間點位於下一個單詞的起始處） |
| `@{~id!}` | 左吸附（時間點位於前一個單詞的末尾） |

每個 Moment 名字只出現一次，編譯為帶有 `anchorId` 的 `NarrativeMoment`。Selection 和 Moment
共享同一名稱空間——同一個 id 不能同時用於兩者。

其他元件透過 `{story.moment.ranking}` 引用 Moment。

## 註釋與轉義

```svml
<!-- This is a comment. Comments never enter any projection. -->

<demo>
  <HOST> Follow us \@svml on social media.
</demo>
```

保留語法起始符必須轉義：

| 轉義 | 產生 |
|---|---|
| `\@` | 字面量 `@` |
| `\<` | 字面量 `<` |
| `\\` | 字面量 `\` |
| `\|` | 字面量 `|`（兩個豎線寫成 `\|\|`） |

普通文字中的單個 `|` 本身就是字面量；未轉義的 `||` 才是 Caption Cue Break。
在 Dual Text 內部，第一個未轉義的 `|` 分隔 display 和 spoken 兩側；display 側的豎線必須
寫成 `\|`，需要字面量右尖括號時寫成 `\>`。

## 綜合示例

一個使用所有語法構造的完整 Script：

```svml
<script id="story">
  @{whole}
  <hook>
    <HOST> @{problem} Girls, you need to hear this. Never let anyone take credit
           for your work. @{/problem}
  </hook>

  <meeting>
    <HOST> @{solution} I started sending <BCC | B C C> recaps after every
           meeting: timestamps, decisions, who said what. @{ranking!} After
           the first recap, everything changed. @{/solution}
  </meeting>

  <evidence>
    <HOST> That gave me @{emphasis}the courage I was missing.@{/emphasis}
  </evidence>

  <payoff>
    <HOST> And guess what? I'm sitting in my old boss's chair now.
  </payoff>
  @{/whole~}
</script>
```

此 Script 宣告瞭：

- 四個 Segment：`hook`、`meeting`、`evidence`、`payoff`
- 一個 Role Cue：`HOST`（在所有 Segment 中保持一致）
- 一個 Dual Text：`<BCC | B C C>`（顯示為 "BCC"，說出為 "B C C"）
- 三個 Selection：`whole`（整個 Script）、`problem`、`solution`、`emphasis`
- 一個 Moment：`ranking`（標記 "After the first recap" 這一瞬間）

下游元件透過名稱引用這些內容：`{story.segment.hook.dialogue}` 用於生成，`{story.selection.problem}` 用於 B-roll 時間繫結，`{story.moment.ranking}` 用於視覺卡片揭示。
