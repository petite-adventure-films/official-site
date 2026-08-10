# 2026-07-16: ImageCarouselのderivedとmemoization整理

## テーマ

`ImageCarousel` を題材に、Reactにおける `state` / `props` / `derived` / `effect` の区別を整理し、特に `derived` と `useMemo` / memoization の違いを確認した。

## Pre説明

ユーザー説明:

- `state` は内部で記憶しておきたい値。今回なら `currentIndex`。
- `props` は外から渡されるデータ。
- `derived` は `props` によって変わるデータ、または `state` によって変わるデータ。
- `effect` は `state` / `derived` の変化に合わせて機能させたいもの。

途中で、次のように整理し直した。

- `state`: 覚えておきたいもの
- `props`: 外部から渡ってくるもの
- `derived`: `props` と `state` で計算されるもの
- `effect`: `state` / `derived` の変化によって、フレームワーク外側との関係・制御をするもの

## Codex Preフィードバック

大枠はかなり良い。

`state` は、コンポーネントの状態として保持する値。今回なら `currentIndex`。ユーザー操作や autoplay によって変わり、次の描画でも意味として保持したい。

`props` は、親や呼び出し側から渡ってくる入力。今回なら `images`, `ariaLabel`, `autoplay`, `showBullets`, `loop`, `className`。

`derived` は、`props` や `state` から導ける値。元データとしては持たず、依存元が変わると更新される。今回なら `boundedImages`, `canNavigate`, `lastIndex`。

`effect` は、Reactの状態や表示に合わせて、Reactが直接管理していないブラウザ機能や外部処理を開始・同期・片付けする場所。今回なら `setInterval` / `clearInterval`。

## 今日の論点

### Reactの外側とは何か

「Reactの外側」は、Reactが自動では管理してくれないもの。

例:

- `setInterval` のタイマー
- `addEventListener` で登録したイベント
- `fetch`
- `localStorage`
- `document.title`
- WebSocket接続

今回の `ImageCarousel` では、`setInterval` は一度作るとReactの再描画とは別にブラウザ側で動き続ける。だから `autoplay` がONのときだけ開始し、条件が変わったりコンポーネントが消えたりしたら `clearInterval` で止める必要がある。

### `lastIndex` をstateにしない理由

ユーザー回答:

`lastIndex` はstateにしたところで使わない。覚えておく必要がない。

Codex補足:

本質は「覚えておく必要がない」こと。`boundedImages.length - 1` から毎回計算できるので、stateにすると `images` が変わったときに `lastIndex` も更新しなければならない。これは同期ズレの原因になる。

### `setInterval` をeffect外に書かない理由

ユーザー回答:

`setInterval` は effect内で動かさないと、`currentIndex` の変化が感知できず、制御が難しい。

Codex補足:

方向は合っている。さらに、effect外に直接書くとレンダリングのたびに新しいタイマーが作られる。cleanupもできないので、古いタイマーが残ったまま動き続けやすい。

## derived と useMemo / memoization

ユーザーから、`derived` を「別に覚えない値」と説明すると、`useMemo` は一応覚えておくためのものではないか、という違和感が出た。

ここで、`覚える` という言葉が2種類を混ぜていることを確認した。

- `state` が保持するのは、次の描画でも意味として保持したい状態。
- `useMemo` が保持するのは、同じ入力なら計算結果を再利用するキャッシュ。

より正確には:

- `derived` は値の性質。
- `useMemo` はReactでその値を再計算しすぎないための手段。
- Svelteの `$derived` は、導出値であることの宣言と、依存追跡・再計算制御をある程度まとめて担う。

結論:

`derived` は「覚えない値」というより、「元データとしては持たず、依存元から導く値」。フレームワークによっては、その導出結果をキャッシュ・再利用する。

## Reactでderivedをどう書くか

Reactでは、derivedはただの `const` として書くことが多い。

```tsx
const lastIndex = images.length - 1;
const canNavigate = images.length > 1;
```

この程度の計算はほぼ無料なので、`useMemo` しないのが普通。

`useMemo` を使う主な理由:

1. 計算が本当に重い。
2. 配列・オブジェクト・関数の参照同一性を安定させたい。

今回の `boundedImages` は、`filter` が重いというより、配列の参照を安定させる意図がある。ただし現在の `useEffect` 依存は `boundedImages.length` なので、`useMemo` が必須というほどではない。

## 参照の安定性

配列やオブジェクトは、中身が同じでも毎回新しい個体なら別物として扱われる。

```ts
[] === [] // false
{} === {} // false

const a = [];
const b = a;
a === b // true
```

Reactの `useEffect` 依存配列や `React.memo` の比較も、このJavaScriptの参照比較に乗っている。

そのため、次のように毎回 `filter` した配列を作ると、中身が同じでも参照は毎回変わる。

```tsx
const boundedImages = images.filter((image) => image.src);
```

これを `useEffect` の依存に直接入れると、毎レンダーでeffectが動く可能性がある。

ただし今回のコードでは依存に入っているのは `boundedImages.length` であり、これはnumberなので、長さが同じなら安定する。

## 今日の結論

モダンフレームワーク共通の見取り図として、以下の理解に進んだ。

- `state`: 状態の元データ。ユーザー操作や外部入力で変わる、アプリが保持する値。
- `props`: 親や外部から渡される入力。
- `derived`: `state` や `props` から導ける値。元データとしては持たず、依存元から導く。
- `memo/cache`: derivedを毎回計算せず、依存が同じ間は再利用する最適化・仕組み。
- `effect`: `state` / `props` / `derived` の変化に応じて、フレームワーク外側の処理を開始・同期・片付けするもの。

今日はコード変更には進まず、概念整理で終了した。

## 次回やること

`boundedImages` の `useMemo` を残すか外すかを、次の3つの言葉を使って説明する。

- `derived`
- `memoization`
- `effect依存`

そのうえで、必要なら `ImageCarousel` の実装とテストを小さく調整する。
