# 自作CMS Phase 1 コンテンツスキーマ

確定日: 2026-08-11  
実装: `packages/content-schema/`

## 設計の中心

新CMSの正規モデルはWordPress投稿タイプやAstroコンポーネントを再現しない。CMS内部レコード、編集revision、種類別payload、公開snapshot、メディアasset、WordPress移行情報を分離する。

```text
ContentRecord              # ID、公開状態、システム管理値
  ├── workingRevisionId
  └── publishedRevisionId
           ↓
Revision                   # 変更履歴
  └── payload               # 編集者が変更するドメイン情報
           ↓ 公開確定
PublishedSnapshot          # AstroとCheckout APIの入力
  ├── records
  └── assets
```

公開サイトはsnapshotだけを読み、CMSの認証情報、下書き、保存層固有の情報、WordPress移行情報を受け取らない。

## スキーマ構成

| ファイル                       | 責務                                                 |
| ------------------------------ | ---------------------------------------------------- |
| `common.schema.json`           | ID、slug、種別、YouTubeなどの共通値                  |
| `content-record.schema.json`   | 公開状態、revision参照、作成・更新日時、イベント番号 |
| `revision.schema.json`         | working、pending、published、supersededのrevision    |
| `content.schema.json`          | 種類別payloadをまとめる入口                          |
| `content/*.schema.json`        | 10種類のpayload                                      |
| `rich-text.schema.json`        | Tiptap JSONと独自asset image node                    |
| `asset.schema.json`            | 画像・PDFの原本と公開用rendition                     |
| `snapshot.schema.json`         | 公開レコードとasset manifest                         |
| `source-reference.schema.json` | WordPress移行元との照合情報                          |

## コンテンツ種別

| 正式な種別      | 旧WordPress・コード上の名称 | 主なpayload                                            |
| --------------- | --------------------------- | ------------------------------------------------------ |
| `news`          | news                        | title、body                                            |
| `blog`          | blog                        | title、slug、body、categoryId、filmIds、表示フラグ     |
| `event`         | event                       | title、slug、開催日、会場、補足、filmIds、eventKindIds |
| `pressCoverage` | media                       | 掲載元、掲載種別、要約、記事抜粋、添付、動画           |
| `video`         | channel                     | YouTube、説明、制作年、国、尺、filmIds                 |
| `film`          | film定数                    | 作品情報、尺違い、クレジット、上映歴、関連リンク       |
| `product`       | DVD商品定数                 | filmIds、購入variant、同梱内容、販売可否               |
| `faq`           | ショップFAQ                 | section、question、answer、sortOrder                   |
| `category`      | ブログcategory              | slug、label、sortOrder、isActive                       |
| `eventKind`     | eventtags                   | label、sortOrder、isActive                             |

`media`は画像・PDFと意味が衝突し、実態は掲載実績なので`pressCoverage`へ変更した。`channel`もチャンネルそのものではなく個別動画21件なので`video`へ変更した。公開URLは当面`/media/[slug]/`と`/channel/[slug]/`を維持し、ドメイン種別名から分離する。

## CMSレコードと公開状態

payloadには公開状態、作成・更新日時、revision IDを入れない。これらは`ContentRecord`で管理する。

```json
{
  "id": "event_paris_goodbye_ur_20260408",
  "type": "event",
  "publication": {
    "state": "published",
    "publishedAt": "2026-04-01T00:00:00+09:00"
  },
  "workingRevisionId": "rev_event_paris_goodbye_ur_2",
  "publishedRevisionId": "rev_event_paris_goodbye_ur_1",
  "eventNumber": 230
}
```

- 公開状態は`draft`、`scheduled`、`published`、`archived`。
- `scheduled`では`scheduleFor`ではなく`scheduledFor`を必須とする。
- `published`と`archived`では`publishedAt`を必須とする。
- 反映待ちはコンテンツ状態ではなくrevisionの`pending`で表す。
- payloadを再編集しても、公開中recordは新snapshot成功まで`published`のままにする。
- 日時は秒とタイムゾーンを含むISO 8601形式で保存する。

## イベント番号

`eventNumber`は公開画面の`#230`表示を通じて活動実績を表す正式データである。ただし編集者の入力項目ではない。

- 初回公開時にCMSが現在の最大値＋1を採番する。
- 下書き中は未採番でよい。
- 公開済みevent recordと公開snapshotでは必須。
- 採番後は変更・再利用しない。公開停止後も番号を保持する。
- JSON Schemaでは`readOnly: true`を付け、CMS APIでもクライアント入力を拒否する。
- 並び順や配列位置から動的計算しない。

## ID、slug、WordPress移行情報

- `id`は保存先、表示名、公開URLから独立し、一度発行したら変更しない。
- 新規IDは種別prefixと小文字ULID等で発行する。
- slugは公開URLを持つpayloadだけに定義する。news、FAQ、eventKindには強制しない。
- ブログは既存slug、event・pressCoverage・videoは既存数値URLをslugとして維持する。
- WordPress IDは正式payloadへ`legacyId`として入れない。
- 移行照合は`source-reference.schema.json`に従う別データで管理する。
- slug変更履歴とredirectはRepository／routing層で管理し、content IDを変更しない。

## Tiptap本文

本文の正本はHTMLではなく、Tiptapの`editor.getJSON()`を包んだJSONとする。

```json
{
  "schemaVersion": 1,
  "doc": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [{ "type": "text", "text": "本文です。" }]
      }
    ]
  }
}
```

初期extension集合はparagraph、heading、bold、italic、underline、strike、code、link、箇条書き、引用、code block、改行、水平線、table、YouTube、独自`assetImage`を想定する。JSON Schemaは共通形と独自node属性を検証し、保存時と移行時には同じextensionsから構成したTiptap／ProseMirror Schemaでも検証する。

WordPress HTMLは移行入力としてのみ扱う。Tiptapへ読み込ませ、未対応要素・属性の欠落を検査した後、JSONを正本として保存する。HTMLは公開ビルドで生成し、CMS内部の正本として併記しない。

文章として編集する本文、FAQ回答、イベント補足、作品紹介等だけをrich textにする。タイトル、日付、場所、価格、尺、関連IDなどは構造化フィールドのままにする。

## Tiptapからの画像参照

Tiptap本文は公開URLや保存キーではなくasset IDを持つ。

```json
{
  "type": "assetImage",
  "attrs": {
    "assetId": "asset_workshop_2026",
    "alt": "映像ワークショップの案内",
    "caption": null
  }
}
```

- `assetImage`は独自Tiptap nodeとして実装する。
- 管理画面のnode viewはasset IDからプレビューを解決する。
- Astroはsnapshotのasset manifestから公開画像を解決する。
- assetには既定altを持たせ、利用箇所のnodeで上書きできる。
- 装飾画像は利用箇所で`alt: ""`を明示する。

## 画像・PDF asset

画像はオリジナルと公開用renditionを分ける。

```text
アップロード
  ↓ MIME type・容量・画像寸法を検証
SHA-256を計算
  ↓
originals/<先頭2文字>/<SHA-256>.<ext>
  ↓
最大幅960pxのWebPを生成（拡大しない）
  ↓
renditions/<先頭2文字>/<生成物SHA-256>.webp
```

- オリジナルは将来の再変換と復旧のため保持する。
- 元ファイル名は管理画面表示用に保持し、公開保存キーへ使わない。
- 初期実装のrenditionは最大1件、`display`用途、WebP、最大幅960px。
- AVIFは生成しない。
- 元画像が960px未満なら拡大しない。
- renditionにも幅、高さ、容量、SHA-256、保存キーを記録する。
- PDFはdocument assetとして原本だけを保存する。
- 実際の変換、R2保存、重複時UIはPhase 6で実装する。

## eventの正規化

イベント234件では旧`content`が全件空なので、汎用`body`を持たせない。開催情報を次へ分ける。

- `dateRange`: 検索・並び替え用の開始日と終了日
- `venue`: 名称、住所、地図URL
- `scheduleNotes`: 時刻や複雑な開催説明
- `access`: アクセス補足
- `admission`: 料金・参加条件
- `organizer`: 主催情報
- `notes`: その他注意事項

後半5項目は必要なときだけ持ち、空文字を必須にしない。`eventStatus`は通常、延期、中止を表し、CMSの公開状態とは分離する。

## blogの分類

ブログには`categoryId`、`filmIds`、`isRecommended`、`isWorkshopReport`を持たせる。WordPress上で9記事に付く`event_tags`は現在のブログ表示で利用されておらず、意味のないWordPress構造を残すことになるため`eventKindIds`へ移行しない。元値は生スナップショットと移行レポートで確認可能にする。

## filmとproduct

filmから`hasProduct`や`productId`を持たせない。productの`filmIds`から逆引きする。1商品に複数作品が含まれる現在の商品にも対応でき、双方向参照の不整合を防ぐ。

商品は購入可能な組み合わせをvariantとして保存する。

```json
{
  "id": "variant_goodbye_ur_general_dvd",
  "label": "一般 DVD",
  "format": "DVD",
  "priceJpy": 2500,
  "isAvailable": true
}
```

Checkout APIはproduct slug、価格名、discの組み合わせではなくvariant IDを受け取り、同じ公開snapshotから価格と販売可否を再解決する。product全体の`isAvailable`もサーバー側で確認する。

`articleTemplateId`と`articleType`はAstro表示コンポーネントの都合なのでpayloadへ保存しない。必要なコンポーネント対応はコード側でproduct IDから解決する。

## 公開snapshot

snapshotには公開するrecord、元revision ID、参照するasset manifestを含める。各公開recordにも直接`revisionId`を持たせ、生成物から出典revisionを追跡できるようにする。下書きとWordPress source referenceは含めない。

- news、blog、event、pressCoverage、videoには`publishedAt`を必須とする。
- eventには`eventNumber`を必須とする。
- productを含む同じsnapshot versionをAstroとCheckout APIが読む。
- 全JSON Schema検証とリポジトリ横断検証に成功した場合だけ確定する。
- snapshotは不変とし、Astroビルド成功後に公開済みポインターを切り替える。

## JSON Schema外の整合性検証

Phase 2以降のRepositoryとPhase 4の移行処理で次を検査する。

- record ID、revision ID、payload typeの対応
- 同一種別内slug重複、全種別を通したID重複
- `updatedAt >= createdAt`、`endsOn >= startsOn`
- category、eventKind、film、assetの参照先存在
- Tiptap文書が採用extensionsのSchemaへ適合すること
- product variant IDの重複と販売中variantの存在
- `product.isAvailable`とvariant販売可否の整合
- asset実ファイルの容量、SHA-256、画像寸法
- renditionが原画像を拡大していないこと
- 壊れた内部リンクと未移行WordPressメディアURL

## 将来のpageとsiteSettings

固定ページをCMS化する場合は`page` payload、共通設定は`siteSettings`として新しいschemaVersionで追加する。既存payloadへ無関係なoptionalフィールドを積み増さない。
