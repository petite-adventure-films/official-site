# 2026-06-09: News型とwpGetListのGenerics

## テーマ

WordPress API 由来の `news` データを、Astro 側で `News` 型として受け取り、`wpGetList<T>` の Generics を説明できるようにする。

## Pre説明

`T` はジェネリック型。メソッドの機能は同じだが、使う側で型を必要に応じて定義したい時に使う。

`news` で今表示しているものは、`id`, `title`, `content`, `published`。

## Codex Preフィードバック

`wpGetList<T>` の `T` は、fetch 処理を変えずに `data` の要素型を呼び出し側で指定するための型引数。

ただし、`T` は実行時にデータを変換・検証するものではなく、TypeScript に「この形として扱う予定」と伝えるためのもの。

API 通信が関わる型定義では、外部 API の response 型を定義するのか、画面が必要とする型を定義するのかが設計判断になる。

## 方針説明

1. `news` の表示するものを確認して、型を定義する。
2. ページャーの実装を考えて、別の型を用意するか、`News` 型に盛り込むか考える。
3. API 通信を行い、データ取得まで確認する。
4. 必要な場合はデータ整形する。
5. 表示するデータが揃ったら、簡易的に表示する。
6. 機能のテストを考えて、実装・テストする。
7. 見た目を実装する。
8. 見た目のテストを考えて、実装・テストする。

## Codex 方針フィードバック

`News` とページャー情報は分けるのが自然。

`News` は1件のお知らせの型で、ページャーは一覧レスポンス全体のメタ情報。既存の `wpGetList<T>` は `{ data: T[]; total_pages: number }` を返すので、`total_pages` は `News` に含めず、一覧レスポンス側で扱う。

15分で進める範囲として、ページャーとテストは次回以降に回し、以下に絞ることにした。

- `News` 型を作る
- `/news/` 一覧で `wpGetList<News>('news')` する
- `title`, `content`, `published` を表示する

## 今日の実装

- `astro/src/types/news.ts` に `News` 型を追加した。
- `astro/src/pages/news/index.astro` を追加した。
- `wpGetList<News>('news')` で `news` 一覧を取得した。
- console で API 取得結果を確認した。
- `title`, `content`, `published` を簡易表示した。

## 今日のテスト

本格的なテストは未実装。

明日のテストに入れるよう、後続作業として Vitest の最小セットアップを追加した。

- `pnpm test`
- `pnpm test:watch`
- `astro/vitest.config.ts`
- `astro/src/lib/test-setup.test.ts`

## Post説明

ジェネリック型。機能は同じ。呼び出す側で型定義したい時に使う。

API 通信が関わる型定義は、API response を定義するか、使うものを定義するかが、アプリ全体的な設計に関わる。

## Codex Postフィードバック

`wpGetList<T>` の `T` は、fetch 処理を変えずに `data` の要素型を呼び出し側で指定するための型引数。

API 通信の型は、外部 API の response 型として定義するか、画面が使う型として定義するかで責務が変わる。

PAF では短期的に WP API 移行を優先しつつ、将来 CMS 移行時には API response 型、画面用型、変換層の境界を再検討する。

## 次回やること

テーマ候補: `published` の整形と news 一覧のテスト境界。

1. API の `published` がどんな文字列で来ているか確認する。
2. `time datetime` に入れてよい形式か判断する。
3. 必要なら `formatNewsDate` / `normalizeNews` のような整形関数を作る。
4. `News` 型を「API由来」と「画面表示用」に分けるべきか考える。
5. news 一覧のテストを書くなら、まず日付整形の純粋関数をテストする。

残課題:

- 現状の `datetime={post.published}` は、表示用日付と machine-readable な日付の区別が曖昧。
- `published` の型を `string` として扱うか、整形後に別フィールドを持たせるかを判断する。
