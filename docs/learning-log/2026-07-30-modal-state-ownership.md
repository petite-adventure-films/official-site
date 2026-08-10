# 2026-07-30: 共通Modalとstateの所有場所

## テーマ

高幡台73号棟ページで未再現だった画像拡大modal/dialogを復刻し、共通UIのstateをどこに置くか整理した。

## Pre説明

- 画像ボタンを押すとModalを開く。
- 開閉ステータスをstateとして持つ。
- 閉じるボタンと背景クリックで閉じる。

## Codex Preフィードバック

- 複数画像から表示対象を決めるため、開閉だけでなく選択画像も必要。
- dialogでは閉じるボタンと背景クリックに加え、Escapeキーも自然な終了操作になる。
- stateは、それを読む・変更する部品をすべて囲む最も近い共通の親に置く。

今回、画像ボタンは開く操作と画像選択を行い、Modalは表示と閉じる操作を行う。両方を囲む`MovementsGallery`がstateの自然な所有者になる。

## 方針説明

- 他ページでも使える共通Modalを作る。
- Modalの中身は呼び出し側から渡せるようにする。
- Reactで実装する。
- 呼び出し側が選択画像と開閉を制御し、Modalは`open`と`onClose`を受け取るcontrolled componentにする。

## テスト方針説明

利用者から見える振る舞いを確認する。

- 画像ボタンから開く。
- 選択した画像が表示される。
- 閉じるボタン、背景、Escapeで閉じる。
- 閉じたあと別の画像を開くと、前の画像が残らない。

内部stateそのものは直接テストしない。

## 今日の実装

- `Modal.tsx`を追加した。
- nativeの`<dialog>`と`showModal()`を使用した。
- 任意の内容を`children`として受け取る。
- `open`と`onClose`をpropsとして受け取るcontrolled componentにした。
- 閉じるボタン、背景クリック、Escapeに対応した。
- `MovementsGallery.tsx`を追加し、Astro版で別タブ表示になっていた資料画像をModal表示へ戻した。

`MovementsGallery`が持つstateは`selectedImage`一つだけとした。

```txt
selectedImageが画像 → openはtrue
selectedImageがnull → openはfalse
```

開閉状態を別stateにせず、選択画像から派生させることで、「開いているのに画像がない」という不整合を作れない形にした。

## 今日のテスト

- Modalへ任意の内容を渡して表示できる。
- 閉じるボタンが`onClose`を呼ぶ。
- 背景クリックが`onClose`を呼ぶ。
- Escapeのcancelイベントが`onClose`を呼ぶ。
- 選択した資料画像を開き、閉じると内容が消える。
- 閉じたあと別画像を開くと、新しい画像が表示される。

## 検証

```sh
pnpm test
pnpm exec tsc --noEmit
pnpm build
```

結果:

- 6 test files passed
- 30 tests passed
- TypeScriptチェック成功
- Astro build成功、53ページ生成

ESLintは既存設定の`astro-eslint-parser`とESLint 10の互換問題で起動できなかった。ブラウザ操作環境が利用できなかったため、実画面の見た目と操作感は手元ブラウザでの確認が残っている。

## Codexコード・テストレビュー

- 共通Modalはページ固有の画像データを知らない。
- `MovementsGallery`が選択画像を所有し、Modalは表示と閉じる操作だけを担当する。
- テストは内部stateではなく、dialogの表示、画像、閉じる操作を確認している。
- native dialogを使うことで、dialog semanticsとブラウザのフォーカス管理を利用できる。

## Codex設計レビュー

Astroページはビルド時に画像データを作り、React Islandへpropsとして渡す。React側はブラウザで発生する画像選択とModal開閉だけを担当する。

```txt
Astro: 画像データの組み立て
MovementsGallery: 選択画像のstate
Modal: dialog表示と終了操作
```

データ準備、ページ固有の状態、共通UIの責務を分けた。

ただし、「将来ほかでも使いそう」という想定だけで共通Modalを作っており、サイト内で画像以外のmodal利用が本当にあるかは棚卸しできていない。現状の`Modal`は`children`を受け取る汎用API、`MovementsGallery`は画像専用だが、この分け方がPAFに必要な抽象化かは次回あらためて判断する。

## Post説明

- stateは選択画像。
- openは選択画像から作る派生値。
- 表示画像はModalへ渡す。

## Codex Postフィードバック

Preでは開閉ステータスをstateにすると考えていた。Postでは、必要なstateは選択画像であり、`open`は`selectedImage !== null`から導けると説明できるようになった。

より正確には、Modalは`open`、`onClose`、`ariaLabel`、`children`をpropsとして受け取り、画像は`children`として渡される。

## Pre/Postの差分

```txt
Pre: 開閉ステータスをstateとして持つ
Post: 選択画像をstateとして持ち、openは派生値にする
```

## 今日の設計判断

- stateは、それを読む・変更する部品を囲む最も近い共通の親に置く。
- 同じ情報から計算できる値を別stateとして重複保持しない。
- 共通Modalは内容を決めず、呼び出し側から`children`を受け取る。
- テストはstateの実装詳細ではなく、利用者から見える振る舞いを守る。

### 今日いちばん持ち帰る判断手順

stateの所有場所を決めるときは、次の順番で問う。

1. このstateを変更する判断材料はどこにある？
2. このstateを読む必要があるのは誰？
3. ほかのstateと同時に変更する必要がある？
4. 外部イベントからリセット・変更する必要がある？
5. 内部に隠すことでAPIが簡単になるか、逆に専用APIが増えるか？

この5問は暗記項目ではなく、実際のコードへ繰り返し当てはめる判断手順として扱う。

## 明日への問い

- `Modal.tsx`と`MovementsGallery.tsx`を行単位で読み、state、props、派生値、イベントの流れを説明できるか。
- `selectedImage`と`open`へ「今日いちばん持ち帰る判断手順」の5問を一つずつ当てはめると、所有場所と派生値にした理由をどう説明できるか。
- PAF内でmodal表示する対象は画像以外にもあるか。実際の利用箇所はいくつあるか。
- 利用対象が画像だけなら、汎用`Modal`と画像専用`ImageModal`のどちらがコードと意図を分かりやすくするか。
- 実画面で、元Nuxt版と背景、画像サイズ、閉じる操作、フォーカス移動が同じ体験になっているか。
- 共通Modalを別ページで使うとき、現在の固定サイズやスタイルをpropsで変更可能にする必要があるか。
