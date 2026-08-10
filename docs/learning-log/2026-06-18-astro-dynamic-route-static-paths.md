# 2026-06-18: Astro動的ルートのgetStaticPaths整理

## テーマ

`/news/page/[page].astro` の実装前に、Astro の動的ルートにおける `getStaticPaths`、`Astro.params`、`Astro.props` の責務を整理する。

## Pre説明

`getStaticPaths` は生成する静的ページ一覧を作るもの。

`params` は URL の構成に関わる情報で、`props` はページへ渡す変数。

`getStaticPaths` では `total_pages` を使って一覧を作り、`props` には `totalPages` や `currentPage` のようなページ情報を渡して UI 制御に使う。

## Codex Preフィードバック

大枠は合っている。

`params` に入れるべきものは、URL の一部になる値。`/news/page/[page].astro` なら `params: { page: '3' }` が `/news/page/3/` を生成するための指定になる。

`props` に入れるべきものは、その URL を描画するためにページへ渡したい追加データ。たとえば `currentPage` や `totalPages`。

`currentPage` は `params.page` から導けるため、`props` に入れるかページ本体で変換するかは設計判断になる。

## 方針説明

当初は、`getStaticPaths` で `wpGetList` を使い news 一覧を取得し、現在ページ数と `total_pages` から offset を計算して該当ページの news 一覧を取得する方針を考えた。

その途中で、これは全件取得に近い形になり、責務が重くなるのではないかと気づいた。

言い直した方針:

- `getStaticPaths` はページ一覧を作る。
- `params` はそのページの URL 情報を持つ。
- `props` はページで使う変数を持つ。
- ページ本体は、表示すべき記事一覧を取得する。

## Codex方針フィードバック

`getStaticPaths` の主目的は、どの URL を生成するか決めること。

必要なのは基本的に `totalPages` を知るための最小取得であり、記事一覧本文を全ページ分集める場所ではない。

ページ本体は、`currentPage` または `Astro.params.page` を使って、そのページに表示する news 一覧を取得する。

WordPress REST API では、自前で `offset` を計算するより、`page` と `per_page` を渡す方が自然。

## テスト方針

見るべき観点:

- `params` が正常時に正しい `props` を渡しているか。
- 最初と最後のページでも正しい `props` になっているか。
- ありえない `params`、たとえば文字列や極端な数字を 404 にできるか。
- ページャー表示で `... 4 5 6 ...` のような配列を作るなら、その配列が正しいか。
- 最初と最後のページでページャー配列が崩れないか。
- 前後ボタンがある場合、最初と最後で正しく非活性になるか。

## Codexテスト方針フィードバック

テスト観点はよく分かれている。

ただし、すべてを一度に自動テストにする必要はない。

- `getStaticPaths` 周辺: `totalPages = 10` のとき、必要な `params.page` が作られるか。
- ページ本体: `currentPage` に応じて該当ページの news 一覧を取得するか。ただし実装詳細に寄りやすいため、まずは build と目視でもよい。
- 404: SSG では `getStaticPaths` が生成していない URL はそもそも存在しないため、Astro のモードによって扱いが変わる。
- Pager配列: `buildPageItems(currentPage, totalPages)` のような純粋関数にできれば、正常系・最初・最後・ページ数が少ない場合をユニットテストしやすい。
- 前後ボタン: まずは目視確認でもよい。テストするなら `prevUrl` / `nextUrl` の生成ロジックを純粋関数に切れるかを見る。

## 今日の結論

時間切れのため実装は明日に回す。

明日は `/news/page/[page].astro` を最小で動く形に近づける。

## 次回やること

1. `getStaticPaths` で `totalPages` を取得する。
2. `params: { page: String(page) }` と `props: { currentPage, totalPages }` の形を作る。
3. ページ本体で `currentPage` を使って `wpGetList<News>('news', { page: String(currentPage), per_page: 10 })` を呼ぶ。
4. 余裕があれば Pager 配列生成の責務を純粋関数として切り出す。
