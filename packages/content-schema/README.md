# Content schema package

公開サイトとCMSが共有する、移植可能なJSON契約の正本です。JSON Schema Draft 2020-12を採用しています。

## 境界

- `content-record.schema.json`: ID、公開状態、revision参照、システム採番
- `revision.schema.json`: 編集可能なpayloadの履歴
- `content.schema.json`: 種類別payloadをまとめる入口
- `content/*.schema.json`: 10種類のコンテンツ・参照データ
- `rich-text.schema.json`: Tiptap JSONの共通契約
- `asset.schema.json`: 原本と公開用WebP rendition
- `snapshot.schema.json`: AstroとCheckout APIが読む公開スナップショット
- `source-reference.schema.json`: WordPressとの移行照合情報
- `common.schema.json`: ID、slug、YouTubeなどの共通値

コンテンツpayloadはWordPress ID、CMSの公開状態、作成・更新日時、表示コンポーネント名を持ちません。これらはそれぞれsource reference、content record、コードへ分離します。

本文の正本はTiptap JSONです。WordPress由来HTMLは移行入力としてのみ扱い、Tiptapのextensionsで検証できたJSONへ変換します。公開HTMLはTiptap JSONから生成します。

画像はTiptapからasset IDで参照します。オリジナルをハッシュキーで保存し、初期実装では最大幅960px、拡大なしのWebP renditionを最大1件生成します。AVIFと複数のresponsive renditionは実測で必要になった場合に新しいスキーマ版で追加します。

## サンプル

- `samples/content/`: 10種類のpayload
- `samples/assets/`: 画像とPDF
- `samples/envelopes/`: record、revision、移行元参照
- `mappings/wordpress-film-tags.json`: WordPress作品タグ9件とfilm IDの対応

## 検証

```sh
cd astro
pnpm test -- content-schema.test.ts
```

AjvはJSON全体を検証します。Tiptap文書はさらに、CMSが採用するextensionsから構成したProseMirror Schemaでも保存時と移行時に検証します。ID参照の存在、slug重複、日時の前後関係など、複数レコードをまたぐ整合性はRepository層で検証します。

まだ本番データをこの契約で公開していないため、現在の`v1`を初版として扱います。公開運用開始後の破壊的変更では既存スキーマを上書きせず、schema IDと`schemaVersion`を増やして変換処理を用意します。
