# 自作CMS設計・移行計画

作成日: 2026-08-10  
対象: Petite Adventure Films公式サイトのコンテンツを、独自CMSで一元管理する

## 目的

- 公開サイトはAstroによる静的HTML配信を維持する。
- WordPressをコンテンツ管理・配信経路から外す。
- WordPress投稿だけでなく、現在TypeScriptやAstroへ直接記述されている運用データも対象として見直す。
- 下書き、プレビュー、公開、公開予約を管理画面から操作できるようにする。
- コンテンツは移植しやすいJSONモデルで管理する。
- 初期リリースでは差分HTML生成を作らず、JSONからのAstro全ビルドを採用する。

## CMSの責務

この計画でいうCMSは、単なるWordPress APIの置き換えではない。サイト上の情報について、次を一元管理する。

- 型のあるコンテンツの作成・編集
- コンテンツ間の関連付け
- 画像・PDFなどのメディア管理
- 下書き、プレビュー、公開、公開予約、公開停止
- 入力値の検証
- 公開済みrevisionと編集中revisionの管理、および直前の正常公開への復元
- 管理画面内の検索・絞り込み
- 静的サイトのビルドと公開状態

一方、レイアウト、表示コンポーネント、決済ロジック、入力検証ルールなどはコードで管理する。

## 現時点の設計判断

| 項目              | 方針                                                                     |
| ----------------- | ------------------------------------------------------------------------ |
| 公開方式          | Astroで全ページを静的生成                                                |
| ビルド契機        | 反映待ちをまとめた「サイト更新」と公開予約時刻。下書き保存では実行しない |
| コンテンツモデル  | CMS内部表現と公開スナップショットを分離し、移植可能なJSONを出力する      |
| 本文              | WordPress HTMLを移行入力とし、Tiptap JSONを正本として保存する            |
| 検証              | ZodまたはJSON Schemaを使用する                                           |
| 画像・PDF         | JSONに埋め込まず、オブジェクトストレージへ保存する                       |
| 作品・商品        | TypeScript定数からJSONへ移す。管理画面での編集対応は初期MVPに含めない    |
| SEO               | 通常のJSONからJSON-LDを生成する                                          |
| TOON              | LLM連携が必要になったときの変換形式として検討する                        |
| MessagePack・SJT  | 初期リリースでは採用しない                                               |
| 差分HTML生成・ISR | JSON化後の実測で必要性を判断する                                         |

## なぜ最初は全ビルドにするか

現在の20〜30分のビルド時間は、AstroのHTML生成だけでなく、WordPress APIへの大量アクセスを含んでいる。

- ブログ一覧をページ単位で取得した後、全記事の詳細APIを個別に取得している。
- イベントは2011年以降の年別アーカイブを取得し、さらに各イベントの詳細APIを取得している。
- メディアとチャンネルも一覧取得後に詳細APIを個別に取得している。
- WordPress APIの5xxエラー時には最大3回再試行する。

JSONをローカルまたは一括スナップショットとして読み込めば、このネットワーク待ちの大部分を除去できる可能性がある。独自の差分ビルド基盤を作る前に、JSON入力での純粋な全ビルド時間を計測する。

## 対象コンテンツ

対象は現在の保存場所ではなく、「コードを変更せずに内容を更新したいか」で判断する。

### 構造化コンテンツ

- お知らせ (`news`)
- ブログ (`blog`)
- イベント・上映会 (`event`)
- メディア掲載 (`pressCoverage`。WordPressでは`media`)
- 動画 (`video`。WordPressでは`channel`)
- 作品 (`film`)
- 商品・DVD (`product`)
- FAQ (`faq`。初期用途はショップFAQ)

### 分類・関連

- カテゴリ (`category`)
- 作品との関連 (`filmIds`)
- イベント種別 (`eventKinds`)
- おすすめ・ワークショップレポートの表示フラグ

WordPress標準の投稿タグ1,461件を新CMSへは移行しない。大部分が1記事だけに付与された細粒度の自由入力タグだからである。現時点で汎用ブログタグ機能は作らず、公開サイトで用途が確認できた関係は意味に応じたフィールドへ変換する。

分類の使い分け:

| 種別                   | 用途                                           | 保存値                      |
| ---------------------- | ---------------------------------------------- | --------------------------- |
| `category`             | ブログの単一の主要分類                         | `categoryId`                |
| `film`                 | 作品という独立エンティティとの関連             | `filmIds`                   |
| イベント種別           | 上映、講座などイベント固有の管理された複数選択 | `eventKinds`                |
| おすすめ               | おすすめ一覧と星印へ表示するか                 | `isRecommended: boolean`    |
| ワークショップレポート | 専用一覧とワークショップページへ表示するか     | `isWorkshopReport: boolean` |

WordPressの「映像ワークショップレポート」（term ID `5026`）が実際に付いている16記事だけを`isWorkshopReport: true`へ変換する。「映像ワークショップ」という別タグが付いた28記事とは混同しない。公開URLは互換性のため`/blog/tag/映像ワークショップレポート/`を維持するが、内部モデルではタグとして扱わない。

### 全体設定・固定コンテンツ候補

- 監督プロフィール
- ワークショップ案内
- 自主上映案内
- サイト共通SEO・連絡先
- ナビゲーション
- プライバシーポリシーなどの固定ページ

これらをすべて初期MVPへ含めるとは限らない。更新頻度、誤操作時の影響、専用表示の複雑さを確認し、CMS管理とコード管理の境界を決める。

作品 (`film`) と商品・DVD (`product`) もTypeScript定数からJSONへ移す。ただし、初期MVPでは管理画面から編集する対象に含めず、JSONの参照マスターデータとして扱う。

ブログ、イベント、メディア、チャンネルが持つ`film_tags`は、移行時に作品JSONの`id`へ対応付け、`filmIds`として保存する。WordPress側のタグ名と作品IDの対応表を用意し、対応不能なタグは移行レポートへ出力する。商品JSONも同じ作品IDを参照する。

## 共通データモデル

```ts
type ContentStatus = 'draft' | 'scheduled' | 'published' | 'archived';

type ContentRecord = {
  schemaVersion: number;
  id: string;
  type: ContentType;
  publication: {
    state: ContentStatus;
    publishedAt?: string;
    scheduledFor?: string;
  };
  workingRevisionId: string;
  publishedRevisionId?: string;
  eventNumber?: number; // eventだけ。初回公開時にCMSが採番
  createdAt: string;
  updatedAt: string;
};

type Revision = {
  revisionId: string;
  contentId: string;
  state: 'working' | 'pending' | 'published' | 'superseded';
  payload: ContentPayload;
};

type BlogPayload = {
  schemaVersion: number;
  type: 'blog';
  title: string;
  slug: string;
  body: TiptapDocument;
  categoryId: string;
  filmIds: string[];
  isRecommended: boolean;
  isWorkshopReport: boolean;
};
```

- 日時はタイムゾーンを含むISO 8601形式で保存する。
- `id`は保存先やURLに依存しない不変値とする。
- slugは公開URLを持つpayloadだけに置き、`id`と分離する。
- WordPress IDはpayloadへ残さず、移行用source referenceで照合する。
- 本文の正本はTiptap JSONとし、HTMLは公開時に生成する。
- CMSレコード、revision、編集payload、公開snapshotを分離する。
- スキーマ変更に備えて`schemaVersion`を必須とする。

FAQは固定ページ本文の一部として埋め込まず、並べ替え可能な項目として管理する。

```ts
type FaqPayload = {
  schemaVersion: number;
  type: 'faq';
  section: 'shop';
  question: string;
  answer: TiptapDocument;
  sortOrder: number;
};
```

## 実装フェーズ

### Phase -1: コンテンツ監査とCMS境界の決定

目的: 現在のWordPress投稿タイプをそのまま再現するのではなく、サイト全体で何をCMSが管理すべきか決める。

- [x] WordPress、TypeScript定数、Astroページ、画像・PDFに分散している情報を一覧化する。
- [x] 各情報について、更新者、更新頻度、関連データ、公開手順を記録する。
- [x] 「CMSで編集」「JSON参照マスター」「コードで固定」のいずれかへ分類する。
- [x] コンテンツ間の関連図を作る。
- [x] 一覧・詳細ページとコンテンツ種別の対応を整理する。
- [x] 初期MVPへ含める範囲と後続フェーズを確定する。
- [x] 商品価格など、公開サイトだけでなくサーバー側の処理にも影響するデータを特定する。

判断原則:

- 内容を変えるためにコード修正が必要なら、CMS化の候補とする。
- 表示方法や業務ルールはコードに残す。
- 他コンテンツから参照される情報は、文字列の重複ではなく安定したIDを持つエンティティにする。
- 商品価格など安全性に関わる情報は、公開JSONだけを信用せずサーバー側でも同じ正本を検証する。

### Phase 0: JSONビルド検証（完了）

目的: WordPress APIを除いた本当のビルド時間を確認する。

- [x] WordPressの全コンテンツを一括取得するエクスポート処理を作る。
- [x] 取得結果をローカルJSONスナップショットへ保存する。
- [x] Astroの読み込み先を一時的にJSONへ切り替える。
- [x] ネットワークアクセスなしで全ビルドする。
- [x] 取得時間、HTML生成時間、総時間、生成ページ数を記録する。
- [x] 現行サイトと主要ページのHTML・URLを比較する。

#### 2026-08-10 実施記録

再取得コマンド:

```sh
cd astro
pnpm export:wordpress
```

実装と出力:

- エクスポーター: `astro/scripts/export-wordpress.mjs`
- JSONスナップショット: `astro/data/wordpress-export.json`
- 出力サイズ: 約5.2 MB
- API取得処理時間: 19.2秒（ネットワーク実行開始後）

取得件数:

| 種別                |  件数 |
| ------------------- | ----: |
| ブログ              |   310 |
| ニュース            |   245 |
| イベント            |   234 |
| メディア            |    22 |
| チャンネル          |    21 |
| WordPressブログタグ | 1,461 |
| カテゴリ            |     5 |
| 作品タグ            |     9 |
| イベントタグ        |    10 |

検証結果:

- JSON内の宣言件数と実配列件数は一致した。
- ブログID、ブログslug、イベントIDに重複はなかった。
- ブログ本文とイベントタイトルに欠損はなかった。
- このスナップショットは現行APIのデータを保全するための中間形式であり、新CMS用の最終スキーマではない。
- WordPress標準の投稿タグは1,294件が取得済みブログから参照され、旧実装では約1,326ページのタグアーカイブを生成していた。新CMSへ汎用タグは移行せず、必要な意味だけ型付きフィールドへ変換する。元データは移行変換と旧URL確認が終わるまで生スナップショットにのみ保持する。

#### JSON入力での全ビルド結果

実行コマンド:

```sh
cd astro
/usr/bin/time -p pnpm build
```

結果:

| 項目                       |      結果 |
| -------------------------- | --------: |
| 全ビルド実時間             |    3.58秒 |
| Astroが報告したビルド時間  |    2.49秒 |
| 生成HTML                   | 733ページ |
| イベント詳細               | 234ページ |
| メディア詳細               |  22ページ |
| チャンネル詳細             |  21ページ |
| ワークショップレポート一覧 |   2ページ |

- WordPress APIへのビルド時アクセスはない。
- 画像変換は既存キャッシュを利用した計測である。キャッシュがない環境では追加時間が発生する。
- JSON化後の全ビルドは2分以内という判断基準を十分満たしたため、初期CMSでは独自ISRや差分HTML生成を実装しない。

#### 現行サイトとのHTML・URL比較

2026-08-10に本番サイトとローカル生成物を比較した。

- トップ、ブログ一覧、おすすめ一覧、ワークショップ、イベント一覧・詳細、メディア一覧・詳細、チャンネル一覧・詳細、ブログ詳細の代表ページについて、URL、`title`、主要見出しを確認した。
- 既存URL台帳の明示的な347パスは、`/404`を`/404.html`へ対応付けたうえで全件生成されている。
- JSON内のブログ310件、イベント234件、メディア22件、チャンネル21件は、URL用のHTMLが全件生成されている。
- 「映像ワークショップレポート」の16記事は、2ページの一覧へ欠落なく出力されている。
- 本番のワークショップページには`/blog/tag/映像ワークショップレポート/`への導線があるが、比較時点の本番ではリンク先が404だった。ローカル生成物では既存URLのまま一覧を復元した。
- 比較時点の本番で404だった新しいイベント詳細も、最新JSONスナップショットから生成されている。これは本番デプロイとWordPressデータの時点差であり、ローカル生成側の欠落ではない。
- 本番の一部ブログ詳細にある`- 'BLOG`というtitle表記は、ローカル生成物で`- BLOG`へ正常化されている。

再検証コマンド:

```sh
cd astro
pnpm build
pnpm verify:static
```

判断基準:

| JSONからの全ビルド時間 | 判断                                             |
| ---------------------- | ------------------------------------------------ |
| 2分以内                | 全ビルド方式を継続する                           |
| 2〜5分                 | 全ビルドで開始し、運用後に最適化する             |
| 5分以上                | セクション別ビルドまたは個別HTML生成を再検討する |

### Phase 1: コンテンツスキーマ確定

- [x] WordPressの投稿タイプ、カスタムフィールド、タクソノミーを棚卸しする。
- [x] 共通スキーマと種類別スキーマを定義する。
- [x] `id`、`slug`、公開状態、日時の規則を決める。
- [x] おすすめ・ワークショップレポートをbooleanフラグとして定義する。
- [x] Tiptap本文、画像、PDF、YouTube、関連作品の表現を決める。
- [x] WordPressの`film_tags`から作品IDへの対応表を作る。
- [x] サンプルJSONを各コンテンツ種別につき1件作る。
- [x] ZodまたはJSON Schemaによる検証テストを作る。

#### 2026-08-11 実施記録

- 正式スキーマ: `packages/content-schema/schemas/content.schema.json`
- CMSレコード契約: `packages/content-schema/schemas/content-record.schema.json`
- revision契約: `packages/content-schema/schemas/revision.schema.json`
- 公開スナップショット契約: `packages/content-schema/schemas/snapshot.schema.json`
- Tiptap JSON契約: `packages/content-schema/schemas/rich-text.schema.json`
- asset契約: `packages/content-schema/schemas/asset.schema.json`
- WordPress移行元参照: `packages/content-schema/schemas/source-reference.schema.json`
- WordPress作品タグ対応表: `packages/content-schema/mappings/wordpress-film-tags.json`
- 種類別サンプル: `packages/content-schema/samples/`
- 設計判断とフィールド棚卸し: `docs/custom-cms-phase1-schema.md`
- Ajvによる検証テスト: `astro/src/lib/content-schema.test.ts`

初回案をWordPress構造から独立させる再レビューを行い、CMSレコード・revision・payload・公開snapshotを分離した。本文はTiptap JSONを正本とし、画像はasset IDで参照する。画像原本はSHA-256ベースのキーで保持し、初期は最大幅960px、拡大なしのWebPを最大1件生成する。

旧`media`は掲載実績を表す`pressCoverage`、旧`channel`は個別動画を表す`video`へ変更した。ブログの未使用`event_tags`は移行せず、イベント連番は活動実績を示す`eventNumber`としてCMSが初回公開時に採番する。filmからproductへの重複参照と、product内のAstroコンポーネント名を廃止した。Checkout APIは商品variant IDから同じ公開snapshotの価格と販売可否を再解決する契約とした。

### Phase 2: 保存層の分離

Astroや管理画面が保存方式へ直接依存しないよう、リポジトリ層を定義する。

```ts
interface ContentRepository {
  findById(id: string): Promise<Content | null>;
  findBySlug(type: ContentType, slug: string): Promise<Content | null>;
  search(query: SearchQuery): Promise<ContentSummary[]>;
  save(content: Content): Promise<void>;
  remove(id: string): Promise<void>;
}
```

- [ ] ファイルJSON用アダプターを実装する。
- [ ] コンテンツ一覧用の軽量インデックスを生成する。
- [ ] 将来R2やD1へ変更できる境界を維持する。
- [x] 公開データとメディアのバックアップ方針を決める。
- [ ] CMS内部の正本をファイルJSON、SQLite/D1等のどこへ置くか確定する。

### Phase 3: AstroのJSON対応

- [ ] `wp-api.ts`を直接参照しないデータアクセス層を作る。
- [ ] 一覧、詳細、カテゴリ、関連コンテンツ、ページネーションをJSONから構築する。
- [x] 汎用ブログタグアーカイブ生成を廃止する。
- [x] ワークショップ記事を`isWorkshopReport`で抽出する。
- [ ] 現在のURL構造を維持する。
- [ ] JSON-LDを新しいコンテンツモデルから生成する。
- [ ] WordPressなしでテストとビルドが成功する状態にする。
- [ ] URL一覧と生成ページ数を照合する。

### Phase 4: WordPress移行ツール

- [ ] 繰り返し実行可能なWordPressエクスポーターを作る。
- [ ] WordPressデータを新スキーマへ正規化する。
- [ ] WordPress HTMLをTiptap JSONへ変換し、採用extensionsで検証する。
- [ ] 本文中の内部URLとメディアURLを変換する。
- [ ] `film_info.ts`と`products_dvd.ts`をJSONへ変換する。
- [ ] `film_tags`を作品ID参照へ変換する。
- [x] WordPress term ID `5026`が付いた16記事だけを`isWorkshopReport: true`へ変換する。
- [ ] 廃止するタグアーカイブURLの扱い（404、410、リダイレクト）を決める。
- [ ] 画像・PDFを移行する。
- [ ] 全JSONをスキーマ検証する。
- [ ] 欠損、重複slug、壊れたリンクを移行レポートへ出力する。
- [ ] 件数と公開状態をWordPress側と照合する。

### Phase 5: 管理画面MVP

まず項目の少ない`news`で一連の操作を完成させ、同じ仕組みを他の種別へ展開する。

- [ ] 管理者認証
- [ ] 記事一覧
- [ ] タイトル・slug検索
- [ ] 種別・公開状態による絞り込み
- [ ] 新規作成・編集
- [ ] 下書き保存
- [ ] プレビュー
- [ ] 記事を反映待ちにする・反映待ちを取り消す
- [ ] 反映待ち一覧と「サイト更新」
- [ ] 公開停止を反映待ちにする
- [ ] バリデーションエラー表示
- [ ] 公開済みrevisionと編集中revisionの確認

コンテンツ種別の実装順:

1. news
2. blog
3. event
4. pressCoverage
5. video

作品と商品はJSONとして読み込めるようにするが、管理画面での編集対応は初期MVP後に判断する。

### Phase 6: 画像・PDF管理

- [ ] ファイルアップロードAPIを作る。
- [ ] ファイル一覧と選択UIを作る。
- [ ] 画像の代替テキストを管理する。
- [ ] SHA-256ベースの不変storage keyを生成する。
- [ ] オリジナル画像を保存する。
- [ ] 最大幅960px、拡大なしのWebP renditionをアップロード時に生成する。
- [ ] Tiptapの`assetImage` nodeをasset IDからプレビュー・公開表示する。
- [ ] 同一ハッシュのアップロード時に既存assetを提示する。
- [ ] 削除前に利用箇所を確認する。
- [ ] WordPressメディアから移行する。

### Phase 7: 公開パイプライン

- [ ] 下書き保存ではビルドを起動しない。
- [ ] 記事単位の操作では反映待ちにし、ビルドを起動しない。
- [ ] 「サイト更新」で全反映待ちを1つの公開スナップショットへ確定する。
- [ ] 確定したスナップショットを入力にAstro全ビルドを1回要求する。
- [ ] ビルドの多重起動を防ぐ。
- [ ] ビルド中に更新された場合、完了後に最新版を再ビルドする。
- [ ] 管理画面に待機中・実行中・成功・失敗を表示する。
- [ ] 直前の正常なデプロイへ戻せるようにする。

### Phase 8: 公開予約

- [ ] `scheduled`状態と`scheduledFor`を実装する。
- [ ] 定期処理で公開時刻を迎えたコンテンツを検出する。
- [ ] 対象を`published`へ変更し、ビルドを要求する。
- [ ] 同じ処理を複数回実行しても壊れないようにする。
- [ ] 失敗時の再試行と管理画面での通知を実装する。
- [ ] 日本時間とUTCの境界をテストする。

### Phase 9: 本番移行

- [ ] WordPressの更新を一時停止する。
- [ ] 最終エクスポートを実行する。
- [ ] 件数、URL、画像、添付ファイルを照合する。
- [ ] JSONから本番用静的サイトをビルドする。
- [ ] SEO、OGP、構造化データ、フォーム、ショップを確認する。
- [ ] 本番へデプロイする。
- [ ] WordPressを読み取り専用で一定期間保持する。
- [ ] 問題がなければWordPress APIと管理画面を停止する。

## 初期リリースで作らないもの

- 差分HTML生成
- 独自ISR
- CSR fallback
- リアルタイム共同編集
- 複雑な承認フロー
- TOON、MessagePack、SJTによる正本保存
- WordPress HTMLの内容を独自ブロックへ意味的に再設計すること（Tiptap JSONへの機械変換と検証は実施する）

## リポジトリとデプロイ境界

公開サイトと管理画面は、当面は同じGitリポジトリ `official-site` で管理する。ただし、同じアプリとして混在させず、トップレベルの別アプリとして分離する。

```text
official-site/
  astro/                    # 公開サイト。公開スナップショットから静的生成
  cms/                      # 管理画面とCMS API（Phase 5で追加）
  packages/content-schema/  # 両者が共有する型・スキーマ（Phase 1で追加）
  docs/                     # 設計・移行・復旧手順
```

- 公開サイトとCMSは別プロジェクトとして独立にビルド・デプロイする。
- CMSの認証情報、R2/B2資格情報、下書きデータを公開サイトのビルドへ渡さない。
- 共有するのはコンテンツスキーマ、公開スナップショット契約、JSON参照マスターである。
- デプロイはパスフィルターを使い、CMSだけの変更で公開サイトを不要に再ビルドしない。
- 開発者が1人の間は、別リポジトリ化による同期コストを増やさない。権限分離や開発チームの分離が必要になった時点で再検討する。

## メディア移行とバックアップ方針

- WordPressのメディアライブラリ全体ではなく、移行スナップショット内の `news`、`blog`、`event`、旧`media`、旧`channel` から実際に参照される画像・PDFだけを移行する。
- 2026-08-11の台帳では、保存キー単位で5,935ファイル、URL表記6,073種類、参照6,154回、取得可能5,926ファイル、合計約1.91 GiBである。
- 欠損候補9件のうち8件はWordPress生成画像の元サイズで復旧可能、1件は復旧候補がない。
- 調査時点ではURL抽出とHEAD確認だけを実施し、ファイル本体はまだダウンロードしていない。
- 公開用の正本をCloudflare R2へ置き、別事業者・別認証のBackblaze B2へ自動複製する。
- 初回移行時と半年ごと、または大規模変更前後に、外付けSSDへオフラインコピーを保存する。
- オーナーには月1回、CMSデータの圧縮JSON、メディア台帳、件数・容量・照合結果をメールする。メディア本体は添付しない。
- バックアップ失敗は月次報告を待たず通知する。
- メディアは原則として不変キーで追加し、削除を別バックアップへ即時伝播させない。

## 将来の差分生成に備える設計

初期実装では全ビルドを使うが、次の境界は保つ。

- コンテンツ取得と表示コンポーネントを分離する。
- ページが必要とするデータを明示的な型で表す。
- コンテンツから影響URLを計算できるようにする。
- `id`、`slug`、コンテンツ種別を安定させる。
- コード変更によるビルドと、コンテンツ公開によるビルドを区別する。

JSON化後も全ビルドが5分以上かかる場合に限り、Cloudflare Queueと共有Viewコンポーネントによる個別HTML生成を別フェーズとして検討する。

## 次に着手する作業

Phase 1までにCMSの管理境界、正式なコンテンツpayload、Tiptap本文、asset、revision、公開snapshotを確定した。次はPhase 2へ進み、CMS内部の正本をファイルJSON、SQLite/D1等のどこへ置くかを決め、Repository境界を実装する。
