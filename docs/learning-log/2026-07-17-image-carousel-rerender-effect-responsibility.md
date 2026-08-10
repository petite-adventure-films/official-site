# 2026-07-17: ImageCarouselの再レンダーとeffect責務整理

## テーマ

`ImageCarousel` を題材に、Reactの再レンダー、mount、`useMemo`、参照の安定性、`useEffect` の責務を整理した。

コード変更には進まず、明日以降に「画像セット変更時に `currentIndex` をリセットする」実装とテストを検討するところまで進んだ。

## Pre説明

ユーザー説明:

- `boundedImages` の `useMemo` は必要。
- `boundedImages` は `state` や `props` から算出されるもの。
- 画像そのものを保存する必要はない。
- 長さが変わるときだけ再計算されればよい、という感覚があった。

途中で、`derived` について次の整理をした。

- Reactに `derived` という専用機能や構文があるわけではない。
- Reactでは、`props` や `state` から計算する `const` を設計上 `derived` と呼ぶ。
- `useMemo` は `derived` を state 化するものではなく、依存が同じ間に計算結果を再利用するキャッシュ。

## 今日の論点

### mount と re-render

Reactでは、`setCurrentIndex(...)` のような state 更新が処理されると、コンポーネント関数は再び呼ばれる。

ただし、それは mount し直しではなく re-render。

- mount: コンポーネントが初めて画面に登場する。`useState(0)` の `0` は初回値として採用される。
- re-render: 同じコンポーネント個体が描画し直される。関数は再実行されるが、Reactが保持している state は維持される。

今回の理解:

> 再レンダーでは `ImageCarousel` 関数は毎回動く。
>
> ただし同じ mount 中なら、`state` や `memo` はReactが同じ個体に紐づけて保持する。

### JavaScriptの参照比較

配列やオブジェクトは、中身が同じでも、新しく作られたものなら別参照として扱われる。

```ts
[] === [] // false
{} === {} // false

const images = [];
const a = images;
const b = images;
a === b // true
```

Reactの `useMemo` や `useEffect` の依存配列も、このJavaScriptの参照比較に乗っている。

そのため、同じ配列を使い回すなら参照は同じだが、親のレンダーごとに配列リテラルや `map` で作り直すと、同じ中身でも別参照になる。

### `useMemo` と参照の安定化

現在のコード:

```tsx
const boundedImages = useMemo(() => images.filter((image) => image.src), [images]);
```

この `useMemo` は、`boundedImages` を state として保存しているわけではない。

意味としては:

> 同じ `images` 参照で再レンダーされたとき、`filter` で毎回新しい配列を作らず、前回の `boundedImages` 参照を使う。

`useMemo` なしで `images.filter(...)` を直接書くと、再レンダーごとに新しい配列が作られる。

```txt
1回目 render: boundedImages = 配列A
2回目 render: boundedImages = 配列B
3回目 render: boundedImages = 配列C
```

`useMemo` ありで `images` 参照が同じなら、`boundedImages` も同じ参照として再利用される。

```txt
1回目 render: boundedImages = 配列A
2回目 render: boundedImages = 配列A
3回目 render: boundedImages = 配列A
```

これを「参照が安定している」と整理した。

### effect依存は責務で見る

現在の autoplay effect:

```tsx
useEffect(() => {
  if (!autoplay || !canNavigate) return;

  const id = window.setInterval(() => {
    goTo(currentIndex + 1);
  }, AUTOPLAY_INTERVAL_MS);

  return () => window.clearInterval(id);
}, [autoplay, canNavigate, currentIndex, loop, lastIndex, boundedImages.length]);
```

この effect の責務は、画像セット変更を検知することではなく、autoplay のタイマーを張る・止めること。

そのため、autoplay のタイマー管理という責務だけで見れば、画像の中身そのものより、ナビゲーション計算に関わる `boundedImages.length` が必要になる。

一方で、画像セットが変わったときに `currentIndex` を `0` に戻す責務は別。

```tsx
useEffect(() => {
  setCurrentIndex(0);
}, [boundedImages]);
```

このように別 effect にすると、関心を分離しやすい。

## SoC / 関心の分離

今日出てきた用語:

SoC: Separation of Concerns。

ひとつの処理に複数の関心を混ぜず、それぞれの責務ごとに分ける考え方。

`ImageCarousel` では、少なくとも次の関心が分かれる。

- 画像セットが変わったら、表示位置を初期化する。
- autoplay のタイマーを張る・止める。

`useEffect` も「変わったら何でも同期する箱」ではなく、責務ごとに分けて考えると依存配列の意味が見えやすい。

## 今日の結論

ユーザーの理解:

- `ImageCarousel` は実質30行程度でも、Reactの重要な概念がかなり詰まっている。
- 再レンダーでは関数は毎回呼ばれるが、mountし直しではない。
- `useMemo` は state ではなく、依存が同じ間に計算結果の参照を再利用する仕組み。
- `boundedImages` はReactの専用機能としての derived ではなく、`props` から計算される `const` としての derived。
- effect依存は、ただ値を並べる話ではなく、その effect の責務と関係している。
- 親が同じ中身の配列を毎回作り直して子に渡すなら、まず親側で参照を安定させる設計を疑うのが自然。

今日はコード変更には進まず、概念整理で終了した。

## 次回やること

明日はもう一度、次の順で整理する。

1. mount / re-render / state保持
2. `useMemo` と参照安定化
3. effectの責務分離
4. 画像セット変更時に `currentIndex` をリセットする実装方針
5. そのテスト境界

実装候補:

```tsx
useEffect(() => {
  setCurrentIndex(0);
}, [boundedImages]);
```

ただし、実装前に次を確認する。

- 画像セット変更を `boundedImages` 参照の変更として扱うか。
- `images` 参照の変更として扱うか。
- `src` の一覧など、画像セットの意味を表すキーで扱うか。

テスト候補:

- 現在3枚目を表示している状態で、同じ枚数の別画像セットに props が変わったら、1枚目に戻る。
- `autoplay` のタイマー管理テストとは分け、画像セット変更時の state 同期としてテストする。
