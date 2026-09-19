---
title: Studio 中的時間編輯
description: 區分跟隨語義、使用時鐘，以及時間編輯實際改變的物件。
---

時間表達記錄作者的選擇。講解畫面可以跟隨一句話，閃光可以響應答案，獨立動畫可以使用影片時鐘。
Studio 修改的是該寫法所表達的選擇。

[Script](../quickstart/script.md) 用 Selection 和 Moment 為語義範圍與事件命名。
Timeline 放置準備好的表演；元件透過這些身份或時鐘位置獲得 Instant、Window。
無聲動畫使用同一種 Timeline，由作者宣告完整時長。

## 選擇需要編輯的關係

| 作者寫法 | 移動時改變什麼 | 裁剪時改變什麼 |
| --- | --- | --- |
| `during={story.selection.proof}` | 兩個共享 Script 錨點移動相同數量的語義停靠點；時長可能變化 | 對應的 Selection 邊界 |
| 事件的 `at={story.moment.reveal}` | 共享 Moment 錨點 | 該寫法沒有宣告持續時間 |
| 事件的 `at={story.selection.proof} boundary="start"` | 僅 Selection 的起點錨點 | 該寫法沒有宣告持續時間 |
| `at={story.moment.reveal} for="8f"` | Moment；持續時間保持八幀 | 從尾端改變持續時間；Moment 保持不變 |
| `until={story.moment.reveal} for="8f"` | Moment；持續時間保持八幀 | 從首端改變持續時間；Moment 保持不變 |
| `at="2s" for="8f"` | 作者指定的時鐘位置 | 從尾端改變持續時間 |
| `instant="moment.cue + 2f" moment={story.moment.reveal}` | 區域性偏移；Moment 保持不變 | 該寫法沒有宣告持續時間 |
| `start="…" end="…"` | 兩個端點表示式移動相同幀數 | 僅對應端點的表示式 |
| `during={story.segment.opening}` 或 `during="program"` | 跟隨結構範圍，不提供時間線拖動 | 不提供時間線裁剪 |

消費元件決定需要 Instant 還是 Window，以及支援哪些寫法。事件跟隨 Selection 終點時使用
`boundary="end"`，同樣只修改選定邊界。

## 分清共享語義與區域性偏移

移動 `at={story.moment.reveal}` 會在 Script 中移動 Moment，所有使用它的元件隨後一起跟隨。
使用相同 Moment 的 `instant="moment.cue"` 則暴露一個初始為零的區域性偏移；移動它不會改寫共享事件。

需要有意提前或延後時，寫 `instant="moment.cue + 2f"` 並繫結 `moment={story.moment.reveal}`。
計算表示式不寫進 `{story.moment.reveal}` 這樣的圖值引用中。

事件與持續時間是兩個獨立決定。`at/for` 只在尾端提供時長裁剪，`until/for` 只在首端提供時長裁剪。
另一端不會提供一個同時移動共享事件、再補償時長的隱藏操作。

## 保留原文與所選邊界

詞首、詞尾和結構邊界是不同的語義錨點。停頓可以屬於前一句，也可以屬於後一句。
拖動沿不同幀位置上的語義停靠點進行；多個錨點重合時，支援該編輯的 Inspector 可以選擇精確身份。
Take 交疊或重排時，Script 順序可以與實際時間順序不同。

移動標記保留無關原文、空格、標點、發音和詞屬性。字幕 Cue 保留來自 Script 的內容及實測詞時間。
在 Script 中修改文案或 Cue 邊界，透過 Caption Style 與帶時間範圍的 Use 修改呈現。

未編輯的表示式保留原單位：`2s` 在幀率變化後仍是兩秒，`60f` 則保持六十幀。
拖動改變的時鐘位置或偏移以當前幀率下的整數幀寫回。

## 編輯專案元件

元件的 Companion 把畫面實體連線到實際作者輸入和已投影的時間。時間形式決定編輯物件，
元件名稱或偶然相同的幀位置不能代替該關係。Script Companion 擁有原始碼觀察和標記移動；
增加新元件不需要讓 Studio 再學習一種 Script 解釋方式。

[Studio](../quickstart/preview.md) 介紹編輯介面，[Companion 指南](./studio-companion-architecture.md)
介紹如何公開實體和控制元件；包內的[時間編輯參考](https://github.com/hypit-ai/hypit/blob/main/packages/temporal-markup/EDITING.md)
維護精確實現介面和支援的操作。
