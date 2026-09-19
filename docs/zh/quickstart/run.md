---
title: Run Source 與 Build
description: 宣告 Build 目標、複用結果以及配置執行時環境。
---

Author Source 定義影片本身。Run Source 從中挑選最終目標，以及是否用明確的 Candidate 來滿足它們。
官方 Distribution 提供 Local Runtime；它的 Profile 宣告執行這份計劃可用的憑據、Provider Endpoint 與服務。

先為專案選擇一次 Runtime：

```bash
hypit runtime use hypit.runtime.json
```

日常製作只需要這條短路徑：

```bash
hypit plan build.svrun
hypit build build.svrun --follow
hypit get <build-id> --output final.video --to output/final.mp4
```

快速開始只需全域性安裝一次 Distribution。此後本頁所有命令都直接寫作 `hypit`，在任何獨立影片專案中都一樣。

只有 `build` 會真正提交工作。`plan` 展示選中的工作；`check` 用於編輯原始碼，`doctor` 用於配置和排查部署。它們都安全，但不是每次 Build 前必須重複的儀式。

當專案包含多份 Author、Recipe 和 Run Source 時，一種順手的目錄約定是：

```text
my-video/
  package.json              專案邊界
  authors/
    main.svml               一份 Author 入口
    alternate.svml          確有需要時的另一份 Author 入口
  recipes/
    visual.svs              視覺 Recipe
    generation.svs          生成 Recipe
  runs/
    images.svrun            一種執行意圖
    takes.svrun             另一種執行意圖
    final.svrun             最終交付意圖
  assets/                   專案自己的輸入素材
  kits/                     可選的專案內 Recipe Kit
  packages/                 作品需要時建立的專案本地 Author 包
  output/                   顯式匯出給人或其他工具的副本
  hypit.runtime.json        執行環境
  hypit.results.json        可選的 Result 倉庫選擇
  .hypit/                   自動產生的本地 Runtime 與 Result 資料
```

這只是方便人整理內容的推薦，絕不是強制的專案格式。小專案可以把多份 `.svml`、`.svs` 和
`.svrun` 直接平鋪在根目錄，其他專案也可以採用不同分組。Hypit 只服從 Source import、
`<author source="…">`、CLI 引數和 `get --to` 中明確寫出的路徑，不要求這些名字，也不會特殊識別
`authors/`、`recipes/`、`runs/`、`assets/` 或 `output/`。每份 Run 選擇一份 Author 入口，而這份
Author Source 的閉包可以顯式匯入多份 Author 或 Recipe Source。受管理的 Result 倉庫與它們分開，
零配置時仍位於 `.hypit/results`。

Run Source 與 Runtime Profile 不會悄悄改寫影片。創作性的模型選擇仍然留在 Author Source，或它顯式匯入的包裡。

## Run Source 語法

每個 `.svrun` 檔案都以其處理指令開頭：

```svml
<?svml using="@hypit/run-markup@1"?>
```

### 最簡 Run Source

```svml
<?svml using="@hypit/run-markup@1"?>

<svrun version="1">
  <author source="./main.svml"/>
  <target output="final.video"/>
</svrun>
```

| 元素 | 說明 |
|---|---|
| `<svrun>` | 根元素，唯一屬性是 `version="1"` |
| `<author>` | 必需。`source` 指向 `.svml` Author Source |
| `<target>` | 一個需要得到的公開 Logical Output |

### Target

Target 表達這次 Build 的最終意圖，通常是成片或另一個真正的交付物；它不是“要儲存哪些東西”的列表。編譯器只執行通向 Target 的路線，而這條路上真正完成的每個公開 Author Output 都會自動進入同一個 Build Result。內部 Operation 值不進入 Result。

### 多個 Target

可以在一次 Build 中請求多個輸出：

```svml
<target output="final.video"/>
<target output="captions.track"/>
```

只有一次執行確實存在多個最終目標時才寫多個 Target。不同執行意圖寫成不同的 `.svrun` 檔案即可，它們可以共同指向同一個 Author Source。

## 複用結果

Hypit 沒有隱式快取。複用結果是顯式的執行圖編寫：把某個舊 Build Result 裡的一個具名 Output 宣告為零輸入 Candidate，再透過 Satisfaction 邊連線到當前輸出。

生成圖片或 Take 一完成，就能在下一份 `.svrun` 中用 `build-record` 與 `satisfy` 顯式複用，並在啟動付費下游工作前檢查 plan。

```svml
<?svml using="@hypit/run-markup@1"?>

<svrun version="1">
  <author source="./main.svml"/>
  <target output="final.video"/>

  <build-record id="hook-video"
    build="bld_20260902T142031123Z_0123456789" output="hook-take.video"/>
  <build-record id="meeting-video"
    build="bld_20260902T142031123Z_0123456789" output="meeting-take.video"/>
  <build-record id="evidence-video"
    build="bld_20260902T142031123Z_0123456789" output="evidence-take.video"/>
  <build-record id="payoff-video"
    build="bld_20260902T142031123Z_0123456789" output="payoff-take.video"/>

  <satisfy output="hook-take.video" candidate="hook-video"/>
  <satisfy output="meeting-take.video" candidate="meeting-video"/>
  <satisfy output="evidence-take.video" candidate="evidence-video"/>
  <satisfy output="payoff-take.video" candidate="payoff-video"/>
</svrun>
```

### 查詢可複用輸出

按照輸出在專案本地 Build Result 中的名字查詢：

```bash
hypit history hook-take.video
```

`history` 只查詢明確給出的那個公開 Author Output。只宣告但沒有執行出來的輸出和內部 Operation 值不會混入結果。如果忘了舊名字，先瀏覽 Build，再檢查可能的 Result：

```bash
hypit builds
hypit inspect <build-id>
```

輸出名是某個 Build Result 內供人查詢的名字；`build + output` 這對地址已經足夠精確。假如當前原始碼把 `hook-take.video` 改名為 `opening-shot.video`，`<build-record>` 仍寫歷史舊名，`<satisfy>` 寫當前新名：

```svml
<build-record id="approved-opening"
  build="bld_20260902T110000001Z_0000000001" output="hook-take.video"/>
<satisfy output="opening-shot.video" candidate="approved-opening"/>
```

Hypit 永遠不會猜測兩個名字代表同一份作者意圖。每次執行 `build` 都會得到新的 Build id 和獨立 Result 目錄，即使原始碼完全沒變。後續 Run 只有明確寫出舊 Build id 與 Output 時才複用；若舊 Output 本身繼續轉發到更老的 Result，就沿顯式關係向前解析，不把檔案複製進新 Result。
轉發只適用於完整的公開 Output；結構化 JSON 不能在內部遞迴指向另一個 Output。歷史值若只是新 Fragment 的一項輸入，Fragment 產生的新 Output 仍屬於當前 Result，但其內部的媒體繼續引用原檔案；新 JSON 結構不要求複製已有圖片、影片或音訊。

### build-record

宣告一個由先前 Build Result 的具名 Output 支援的零輸入 Candidate：

| 屬性 | 說明 |
|---|---|
| `id` | 此 Run Source 內的本地 Candidate 識別符號 |
| `build` | 先前 Build 自動分配的 id |
| `output` | 該 Build Result 中的公開 Output 名 |

### satisfy

將 Candidate 連線到邏輯輸出：

| 屬性 | 說明 |
|---|---|
| `output` | 要滿足的邏輯輸出 |
| `candidate` | 由 `build-record`、`file`、`value` 或 Fragment 匯出宣告的 Candidate 識別符號 |

Planner 會同時讀取完整 Author Graph 與 Run Graph：裁剪所選 Candidate 替代掉的預設 Operation，同時保留該 Candidate 自身仍然消費的 Author Output。這是一次新的 Build，而非舊 Build 的延續。複用生成影片時，歸一化和語義準備仍在下游；複用已經準備好的 SemanticTake 時，也保留這些結果。字幕、MG 和渲染只在仍被所選路線需要時計算。選擇哪個 Output，取決於哪些內容應該保留不變。

Core 不再給 Candidate 標註 `exact` 或 `substitute`。選擇 Candidate 本身就是這次執行的明確實現決定。系統校驗型別相容性，但不猜測創作等價性，也不把這種判斷作為冗餘元資訊沿整條圖傳播。

### 使用已有檔案

本地檔案就是最簡單的零輸入 Candidate：

```svml
<file id="approved-opening" type="@hypit/artifact@1#BlobArtifact" from="./approved-opening.mp4" media-type="video/mp4"/>
<satisfy output="opening-shot.video" candidate="approved-opening"/>
```

檔案相對於 `.svrun` 讀取。如果它在 Target 路線上成為已完成的公開 Output，Result 儲存明確的外部檔案引用，不會為每次 Build 複製一份檔案。引用保持實時性：替換檔案會改變後續讀取，刪除檔案會使依賴不可用。使用者提供的圖片、錄製的影片使用相同機制。

## Runtime Profile

官方影片 Distribution 已經選擇 Local Runtime。它的 Profile 透過邏輯 `use` 名稱選擇 Credential
Store 與 Endpoint，並配置 Endpoint 容量等部署引數；它不選擇 Runtime Host，也不定義 Source
Workspace、Author 包或專案 Result Repository。

```bash
hypit runtime init
hypit paths
```

`runtime init` 會寫入影片 Distribution 提供的起始 `hypit.runtime.json` 並完成選擇。它不覆蓋
已有檔案，不安裝任何東西、不連線服務，也不啟動 Worker。專案已有明確 Profile 時，使用
`hypit runtime use <profile>`；該命令只寫入 `.hypit/runtime`。

`runtime use` 只寫入 `.hypit/runtime`，不會啟動 Worker、建立 Runtime 資料或修改已安裝
包。Profile 結構和完整邊界見 [Runtime](../guide/runtime.md)。
CLI 必須先確定專案：顯式 `--workspace` 直接給出邊界；否則使用當前目錄向上的最近
`package.json`，普通創作目錄沒有該檔案時就以當前目錄為邊界。隨後只讀取這個專案自己的
`.hypit/runtime`。它不會按約定檔名猜 Profile，也不會從父目錄繼承另一個專案的選擇。
## 配置所選憑據

`check` 與 `plan` 不會請求線上 Provider。沒有所選 Runtime 的 `plan` 只看圖，不需要部署
憑據；有 Runtime 時，便宜預檢會檢查本次 Plan 所需憑據是否存在。在執行 `doctor` 或付費/
外部 `build` 之前，只配置當前 Runtime Profile 實際引用的憑據。先檢查已有選擇：

```bash
hypit auth status hypihub.default
```

需要的服務未就緒時，先決定配置它，還是選擇其他支援的本地或託管方式。例如 WhisperX 可以在本機或透過 HypiHub 執行。起始 Endpoint 是配置起點，並不代表已經選擇某個賬戶。

選擇服務後，再連線其憑據：

已選擇 HypiHub 賬戶時：

```bash
hypit auth login hypihub.default
```

其他所選 Endpoint 使用它宣告的安全輸入方式，例如 `hypit auth login images.personal`。
Provider 說明需要哪種憑據，Profile 選擇儲存方式；專案 Provider 沿用同一條路徑。
如果使用環境變數儲存，則按 Provider 的配置在 Worker 環境中設定。

不要把憑據寫進 Author Source、Run Source、Runtime Profile 原始檔或提交內容。`doctor` 會驗證所需憑據是否存在，但不會列印秘密值。

## 查詢所選 Run 的費用資訊

```bash
hypit pricing reference.svrun
hypit pricing reference.svrun --json
```

所選 Runtime 決定每個請求由哪個 Endpoint 執行。`pricing` 讀取對應 Provider 的費率資訊，將匹配請求分組，展示已知引數與請求數量。明確宣告為本地無 Provider 呼叫費用的工作彙總顯示；未知價格、不支援的請求和價格讀取失敗繼續可見。`--verbose` 補充本地請求細節與原始價格材料。

用報告說明準備怎麼花費：所選賬戶、計劃素材、計價單位與適用費率。命令讀取價格，不提交生成，也不計算一個保證準確的總價。未來素材的時長可能還未知，估價時保留這部分不確定性。JSON 在 `groups[].requests` 中保留請求引數，在 `groups[].pricingDocuments` 中保留價格來源材料。

付費呼叫前，確認賬戶、工作範圍和預算。已有授權覆蓋約定內的工作；價格輸出與登入成功提供資訊，本身不代表同意花費。

## Build 工作流

不要提交憑據、生成媒體、Runtime 狀態/資料庫或日誌。

### 0. 準備按需依賴

使用已釋出的 Hypit 命令，無需在 Hypit 原始碼倉庫執行 `pnpm install`。`runtime up` 會讀取所選
Runtime Profile，把其 Adapter 宣告的上游 npm 包安裝到機器共享目錄，並準備外部程式。專案
自己的元件和 Provider 仍是普通專案依賴，由專案的包管理器安裝。只有 Profile 選擇 WhisperX、
OpenCV 等本地 Python 程式時，才需要先安裝 [`uv`](https://docs.astral.sh/uv/)。

作者側缺少 Fontsource 等上游包時，`check`/`plan` 會給出精確命令，例如：

```bash
hypit packages install @fontsource-variable/inter@5.3.0
```

`hypit runtime up` 管理依賴、後臺 Worker 和外部程式；`build` 不做部署準備。

#### 把正式影片專案放在 Hypit 倉庫之外

作者檔案不必位於本倉庫之下。例如，專案放在 `/work/my-film`，同時複用
`/opt/hypit` 中已安裝的包：

```bash
cd /work/my-film

hypit runtime use hypit.runtime.json
hypit plan build.svrun
```

Workspace 在 Runtime Profile 之前確定；顯式 `--workspace` 可以覆蓋它，入口 Source 路徑和
Runtime 選擇都無權改變這條原始碼邊界。`--package-root` 只定位已經安裝的
`node_modules`；`--asset-root` 只額外授權讀取素材位元組。

外部專案通常應提交如下 `.gitignore`：

```text
.hypit/
output/
```

每次 Build 的權威結果位於 `.hypit/results/<UTC-date>/<build-id>/`：`result.json` 記錄名字、狀態、Target
和公開 Output，媒體在 `files/`，結構化值在 `values/`。

這是無需配置的預設 Result 倉庫。專案根的 `hypit.results.json` 也可以選擇 `@hypit/build-result-s3`；歷史命令
與 `.svrun` 中的 `build-record` 會使用同一個倉庫。活躍 Build 的臨時 Resource 仍由 Runtime 在本地
私有管理。

`status`、`builds` 等只讀歸檔命令不會在狀態尚不存在時初始化 Runtime 資料庫。

共享只讀素材庫不必複製進專案，也不必放寬 Source 邊界：

```bash
hypit plan /work/my-film/build.svrun --asset-root /work/shared-media
```

`--asset-root` 可重複使用，只授權讀取素材位元組，不允許從那裡匯入 `.svml/.svs` 原始碼。該 Host
選項不進入作者或 Build 身份；真正進入圖的是由該檔案形成的顯式 Resource 值。

Runtime Profile 只選擇 Credential Store、Endpoint 及其封閉配置。完整結構只在
[Runtime](../guide/runtime.md) 維護，不在 Quickstart 複製第二份。

### 1. 選擇 Runtime

```bash
cd examples/podcast
hypit runtime use hypit.runtime.json
```

Author/Run Source 透過 import 選擇作者包；官方影片 Distribution 已經選擇 Local Runtime，Profile
只透過 `use` 選擇 Credential Store 與 Endpoint。安裝、版本與完整性由 npm 或 pnpm 負責。

### 2. 診斷環境

```bash
hypit doctor
```

Doctor 總會校驗專案選擇的 Result Repository；存在已選或顯式傳入的 Runtime Profile 時，還會校驗全部
Runtime 角色、Endpoint 配置、憑據是否存在和有界環境探測。它不啟動 Worker，也不發付費請求。

存在 Profile 時，`doctor` 預設檢查整個 Profile，也可以重複 `--endpoint <instance>` 限定服務。
若只想檢查某次 Run 真正需要的環境，請使用帶
所選 Runtime 的 `plan`。未就緒會寫入 `preflight` 並令命令非零退出，但 JSON 中仍保留
凍結計劃供檢查。

### 3. 檢查 Source 與計劃

```bash
hypit check reference.svml
```

```bash
hypit plan reference.svrun
```

花費資金前審查所選工作。預設計劃展示 Target、實際需要的外部請求及其已知引數；
`--verbose` 增加圖和 Candidate 選擇詳情。選擇 Runtime 後預檢這次計劃需要的 Endpoint、
憑據和外部程式，不啟動任何外部工作。

`plan` 可以完全不帶 Runtime；執行過 `hypit runtime use` 後，`plan` 和 `build` 都不必再寫
`--runtime`。`build` 必須能找到所選或顯式 Profile。

選擇或改變 Profile 後，用 `runtime up` 安裝所選上游依賴、準備本地 Managed Program 並啟動
本地 Worker。它不會啟動或探測遠端 Endpoint；需要主動只讀檢查遠端能力時使用 `doctor`。
`build` 只重跑便宜的只讀預檢；任何依賴或 Program 未就緒都會在提交前失敗，絕不在 Build
中準備它們。若部署已經準備完畢而只有 Worker 停止，`build` 會在耐久提交前啟動該 Worker。
`runtime status` 用於觀察，`programs up|status|down` 只管理外部程式。

### 4. 提交 Build

```bash
hypit build reference.svrun --title first-cut --follow
```

不帶 `--follow` 時，Build 在耐久提交後退出，後臺 Worker 繼續。帶 `--follow` 時終端也只是觀察者，並會報告 phase / Operation 數量變化；Ctrl-C 不會取消任務。

任何時候都可以重新接入觀察：

```bash
hypit status <build-id> --watch
```

普通的 `status <build-id>` 只列印一次快照。`status --watch` 會在 Result 得到 outcome 時退出；指令碼需要限制等待時間時可以加 `--max-wait-ms`。

| 標誌 | 說明 |
|---|---|
| `--runtime` | 單次命令的 Runtime Profile 覆蓋；通常用 `runtime use` 選擇一次即可 |
| `--package-root` | 存放已安裝包的 Host 目錄 |
| `--workspace` | 顯式 Source Workspace 覆蓋項 |
| `--title` | 給這次 Result 一個供人閱讀的標題 |
| `--follow` | 將 Build 進度流式輸出到終端 |

每次執行都會建立新的 Build id，即使 Author Source 和 Run Source 完全沒變。這是非確定性生成
所要求的邊界：跨 Build 複用只能由 Run Source 裡的顯式 Candidate 決定。關閉觀察終端不會停止
Worker；但 Build 一旦失去執行上下文，這次嘗試就結束，重啟 Worker 不會恢復它。已完成的
Output 和記錄下來的任務憑據會保留；後續執行透過新 Build 顯式複用已有工作。

### 5. 檢查並獲取結果

```bash
hypit inspect <build-id>
```

`inspect` 直接讀取專案 Result，預設展示 Target、高亮 Output 和失敗證據。
`--output <name>` 精確檢視一個 Output；`--verbose` 瀏覽其他 Output 和任務回執，
`--limit <count>` 擴充套件這個詳細列表。匯出指定 Output 用：

```bash
hypit get <build-id> \
  --output final.video \
  --to output/final.mp4
```

`get` 把一個精確的 `build + output` 地址匯出到必填的 `--to` 目的地。Scalar 寫成 JSON 檔案；
Resource 原樣寫成一個檔案；Composite 寫成一個自足目錄，其中 `value.json` 儲存它的 Composite 值
文件，被引用的 Resource 則按 Result 內的相對路徑一起寫入。目的地必須尚不存在。

歷史轉發會透明地沿顯式關係找到更早的 Result。這個過程不會建立 Build、修改 Result，或把
副本寫回 Result 倉庫，也不需要 Runtime Profile。檢視 Output 用 `inspect`；`get` 只負責顯式
本地匯出。Build 的最終輸出會為每個檔案 Target 列印精確的 `get --output …` 命令。

### 6. 在新 Build 中複用

建立一個引用已完成 Build Output 的新 `.svrun` 檔案（參見上文 [複用結果](#複用結果)），然後提交：

```bash
hypit build reuse-generated.svrun --follow
```

### 7. 診斷或停止本地 Runtime

```bash
hypit runtime logs
hypit runtime down
```

`runtime down` 停止協調器及其執行程序，保留獨立的 Managed Program。未完成的 Build 一旦
失去執行上下文，就不會在 Worker 重啟後恢復；保留其已完成 Output 和任務憑據，透過新 Build
繼續製作。已提交但從未開始的 Build 仍可開始。只有確實要停掉獨立程式時才執行 `programs down`。
要取消某個 Build 的遠端工作，應在其執行上下文仍可用時呼叫 `hypit cancel <build-id>`；
停止本地程序本身不會取消遠端 Provider 任務。
