---
name: add-appearance
description: melocil.de の出演イベントを data/appearances.json に登録する。告知ツイートの URL からタイトル・日付・フライヤーを取り込み、webp に変換して public/flyers/ に置き、JSON へ日付順で差し込んで検証まで通す。「イベントを登録して」「出演を追加して」「このイベント入れといて」や X の告知ツイート URL が投げられたときに使う。
---

# 出演イベントの登録

`data/appearances.json` に 1 件追加する。スキーマは `lib/appearances.ts` の `parseOne` が唯一の正で、
ここに書いてある制約はその写しにすぎない。迷ったら `lib/appearances.ts` を読むこと。

## 0. 何も渡されずに呼ばれたら聞く

`/add-appearance` を引数なしで呼ばれた、あるいは「イベント登録して」だけ言われて URL も
イベント名も無いときは、**推測で進めずに AskUserQuestion で聞く**。直近の会話に登録対象の
イベントが出ていればそれを使ってよく、この節は本当に手がかりが無いときの話。

まず入り口をひとつ聞く（header は `入力方法`）:

- **告知ツイートの URL を貼る** — 「その他」に X の告知ツイート URL を入れてもらう。
  タイトル・日付・フライヤーは 2. の手順でそこから読み取るので、追加で聞くことは無い
- **手で入力する** — 告知が無い / 流れてしまった回

「手で入力する」を選ばれたら、足りないものだけ埋める:

- `role` は `DJ` / `VJ` / `DJVJ` の 3 択なので AskUserQuestion で聞く
- `date` と `title` は自由入力なので、普通に聞き返す（選択肢を無理に作らない）。
  日付は `YYYY-MM-DD`、タイトルは告知どおりの表記で、と添える
- `real`（リアル会場かどうか）は分からなければ一緒に聞く。VRChat の回が既定

`url` と `flyer` は無ければ省いてよいので、わざわざ聞かない。

## 1. 入力を揃える

| フィールド | 必須 | 中身 |
| --- | --- | --- |
| `date` | ○ | 開催日。`YYYY-MM-DD` で実在する日付 |
| `title` | ○ | イベント名。主催の告知どおりに、`vol.5` / `Vol.14` / `Ep.136` の表記も揃える |
| `role` | ○ | `DJ` / `VJ` / `DJVJ` のいずれか |
| `real` | | リアル会場の回だけ `true`。VRChat 内の回には付けない |
| `url` | | **主催側の告知ツイート**の URL（後述） |
| `flyer` | | `public/flyers/` 配下のファイル名。告知に画像が無ければ省く |

`role` が本人の申告と食い違いそうなときだけ聞き返す。それ以外は告知から読み取って進めてよい。

**`real` を付けるなら `title` の末尾に ` <Real>` も付ける。** 二重に持っているので片方だけだとビルドが落ちる
（`EXTREME in Real vol.01 <Real>` のように本文にも Real を含む回があるため、判定は末尾一致）。

`url` は**本人（@zyzyzy_vl）のツイートではなく、それが引用している主催側の告知ツイート**を指す。
本人ツイートの URL を渡されたら、引用先を辿って主催の告知に置き換える。特定できなければ `url` は省略する
（リンクなしの回は普通にある。無理に埋めない）。

## 2. 告知ツイートから読み取る（URL を渡された場合）

X は未ログインだとほとんど返ってこないので、playwright MCP のログイン済みプロファイルを使う。
起動は `--browser chromium` 付き（`/opt/google/chrome/chrome` は無い）、プロファイルは
`--user-data-dir /home/maxmellon/.cache/playwright-mcp-x`。設定は `~/.claude.json` の
`projects["/home/maxmellon/melocil.de"].mcpServers.playwright`。

`browser_navigate` でツイートを開き、`browser_snapshot` から本文とフライヤー画像を拾う。
画像の `src` は `https://pbs.twimg.com/media/<メディア ID>?format=jpg&name=small` の形で、
この `<メディア ID>` がそのまま保存先のファイル名になる。

`browser_evaluate` の `filename` は **絶対パスかつ `/home/maxmellon/melocil.de` 配下**でないと保存されない
（scratchpad は allowed roots の外で拒否される）。`.playwright-mcp/xxx.json` に吐いてからコピーする。
保存される中身は JSON 文字列の二重エンコードなので `json.loads` を 2 回。

日付が告知本文に書かれていない場合は、ツイートのタイムスタンプではなく**開催日**を使う（告知は数日前に出る）。

## 3. フライヤーを取り込む

メディア ID が分かれば画像自体はログイン不要で落とせる。既存の 80 枚と同じ「長辺 640px の lossy webp」に揃える:

```bash
.claude/skills/add-appearance/fetch-flyer.sh <メディア ID>
```

`public/flyers/<メディア ID>.webp` を書いて、`flyer` に入れる値を出力する。
すでに同名のファイルがあれば何もせず終わる。

手元の画像ファイルから作るときは第 2 引数にパスを渡す（ダウンロードを飛ばす）:

```bash
.claude/skills/add-appearance/fetch-flyer.sh <保存名> /path/to/flyer.png
```

## 4. JSON に差し込む

末尾に足すのではなく日付順の位置に入れる。手で編集せずスクリプトを使う（キー順と整形が既存と揃う）:

```bash
.claude/skills/add-appearance/add-appearance.py \
  --date 2026-09-12 \
  --title 'rainymagic vol.5 1st Anniversary Party' \
  --role DJVJ \
  --url https://x.com/yuccue/status/2091069254833700952 \
  --flyer HQT4Xtta8AA_loF.webp
```

リアル会場なら `--real`（`--title` 末尾の ` <Real>` も忘れずに）。
`--dry-run` で書き込まずに差分だけ見られる。同じ日付・同じタイトルの回がすでにあれば拒否する。

## 5. 検証

`lib/appearances.ts` のバリデーションはビルド時に走る。追加したら必ず:

```bash
npm run build
```

トップページの件数と期間（`{n} 件 (最初 〜 最後)`）が増えていることまで確認する。
型だけ見たいなら `npm run typecheck` だが、JSON の中身は落とせないのでビルドの代わりにはならない。

## 6. コミット

`data/appearances.json` と `public/flyers/*.webp` を一緒にコミットする。
`AGENTS.md` は `next dev` が書き戻すので、差分に出ていたら一緒に含めて構わない。
コミットメッセージはイベント名が分かる 1 行にする（例: `Add the rainymagic vol.5 anniversary night`）。
