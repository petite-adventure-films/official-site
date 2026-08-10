# 2026-07-13: ImageCarouselの責務分離とReact state/effect理解

## テーマ

`GalleryImage` と呼んでいたUIの中から、ページ固有の「日付別ギャラリー」と、汎用的な「画像カルーセル」を切り分ける。

あわせて、Reactの `useState` / `useMemo` / `useEffect` を、Svelteの `$state` / `$derived` / `$effect` と対応させて理解する。

## Pre説明

最初は `GalleryImage` をAstroのままにするか、Reactにするかを検討した。

議論の中で、`Gallery` という言葉の中に複数の責務が混ざっていることを整理した。

- 高幡台73号棟ページ固有: 年・月・日ごとに写真を分類して見せる
- 汎用UI: 画像配列を受け取り、前後移動・スワイプ・autoplay・bullet表示を行う
- Modal表示はカルーセルの責務に含めない

## 今日やったこと

- React integrationをAstroへ追加した。
- `ImageCarousel.tsx` を追加した。
- `takahatadai73/index.astro` の解体写真セクションだけ、React版 `ImageCarousel` に差し替えた。
- `ImageCarousel.test.tsx` を追加した。
- VitestでReact/TSXを扱うため、`jsdom` とReact plugin設定を追加した。

## 実装メモ

`ImageCarousel` のpropsは、今日必要なものに絞った。

- `images`
- `ariaLabel`
- `autoplay`
- `showBullets`
- `loop`

`initialIndex` は、PAFサイト内で必要になった場面がまだないため追加しなかった。

`currentIndex` はユーザー操作やautoplayで変わるためReact stateとして持つ。

`boundedImages` や `canNavigate` は、props/stateから計算できるため、保存するstateではなく派生値として扱う。

loop時のindex計算は以下の形で、範囲外のindexを `0` から `length - 1` に戻している。

```ts
((nextIndex % length) + length) % length
```

今後は `wrapIndex` のような名前を付けると、算術式そのものを毎回読まなくて済む。

## React理解メモ

`useState` は「自分で変える値」を持つためのHook。

```ts
const [currentIndex, setCurrentIndex] = useState(0);
```

これはJavaScriptの配列分割代入と、Reactの `useState` を組み合わせた定番の書き方。

`setCurrentIndex` はReactが返す更新関数で、名前は自由だが、実務では `setXxx` と書くと読みやすい。

`useMemo` は、props/stateから計算できる値を再計算しすぎないためのHook。Svelte 5の `$derived` に近い。

`useEffect` は、タイマーやイベントリスナーなど、Reactの外側と同期するためのHook。開始したものはcleanupで片付ける。

今回のautoplayでは、`setInterval` を開始し、依存値が変わる前やコンポーネントが消えるときに `clearInterval` する。

## テスト方針

今日のテスト方針は、まだ完全に腹落ちしていないが、次の言葉で整理した。

「何を壊したくないかを、チーム内で共有するためにテストを書く」

優先して見る観点:

- 外から入るもの: propsとして渡す `images`, `autoplay`, `showBullets`, `loop`
- 外に見えるもの: 画像のalt、表示中の画像、active bulletの `aria-current`
- 操作で変わる状態: next / prev / bullet / swipe
- 時間で変わる状態: autoplay
- 境界: 画像1枚、空配列、loopの最後/最初

明日はこの `ImageCarousel.test.tsx` を読みながら、テストがどの仕様を守っているかを理解するところから始める。

## テスト

Node 22.14.0で確認した。

```sh
PATH=/Users/restard/.nvm/versions/node/v22.14.0/bin:$PATH pnpm test
```

結果: 3 files / 19 tests passed

```sh
PATH=/Users/restard/.nvm/versions/node/v22.14.0/bin:$PATH pnpm build
```

結果: 53 pages built

buildはWordPress API取得を含むため、ネットワーク許可つきで確認した。

## 今日の結論

`Gallery` は広すぎる名前で、今回の汎用部品は `ImageCarousel` として切り出すほうが責務を説明しやすい。

React化すると、`currentIndex` のようなUI状態を自然に扱える。一方で、Astro `<Image>` の最適化とは境界が変わるため、画像最適化まで含めるなら次の設計課題になる。

Reactの理解としては、`state / derived / effect` の分け方が重要。

- 保存する値: state
- 計算で出せる値: derived / memo
- 外側と同期する処理: effect

## 次回やること

`ImageCarousel.test.tsx` を読み、各テストがどの仕様を守っているかを説明する。

特に以下を見る。

- `images` という入力が、どの表示として外に見えるか
- 操作によって `currentIndex` がどう変わるか
- `aria-current` はなぜ状態テストとして意味があるか
- autoplayのテストは何を保証し、何を保証していないか
- 空配列や1枚画像は、失敗系ではなく境界としてどう扱うか
