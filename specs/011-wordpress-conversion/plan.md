# 実装方針

対象 #338 / #490 / #491 / #492。作業ブランチ `codex/issue-338-complete-conversion`、分岐元/統合先 `version-4`。

現在は本文/イベント対応を先行し、入力と正式assetIdを受領して正式変換を完成させる。開催形式は`unknown`を単独で保持し、未入力と分ける。新規記事の既定値や既存online/offlineの挙動は維持する。不明の会場情報は公開候補にも残し、開催形式の構造化データを出さない。

画面は既存EventFormとField/Outlined（Figma `hk5yiH5HW5Es7RMSzzJIIa`、`17:2247` / `23:678`、2026-11-25 MCPでコード・画像確認済み）とMUI Chipを再利用する。独自の色・寸法・配置は追加しない。本文の新形式はBodyEditorに接続し、共有rendererまで検証する。

イベントは既存文字列と`schemaVersion:2`のテキスト専用JSONの和型で互換を保つ。共有schema `event-text/v1` は現行本文のテキスト構造を限定した定義で、画像・動画・asset参照を許可しない。リンクの意味検証・深さ制限を保存時にも行い、検索はJSONのキーやURLではなくtext値を使う。書式付き項目だけ既存BodyEditor（Figma `153:166`、MCP画像/定義確認済み、利用者の外観受入は未完）をテキスト専用モードで再利用する。

旧書式はblog-draftの許可ノードへ追加する。preservedInline/preservedTextBlock/preservedBlock、legacyTextStyle、inlineExternalVideoとparagraph/headingの意味属性を、変換器・保存・エディター・公開rendererで扱う。コピー元属性は許可リストで原文へ保全し変換記録を付ける。未知属性は引き続き停止する。文字単位のスタイル、lang/dir/idとその対象テキスト、コンテナ数、リンク属性、既存構造、JSON往復を照合する。画像・PDFを含む全記事の最終比較は正式assetId受領後に再実行する。

新形式を含む成果を取り込む前に、CMS・公開ビルド双方へ対応版を適用する。schema IDは既存形式への許可値追加で互換を保つが、旧実行版は新しいノードやunknownを受理できない。配備・取込はこのローカル検証の成功と区別する。

`astro/scripts/prepare-wordpress-conversion.mjs`をNode 24で実行する。既存のjsdomを静的HTML解析に使い、スクリプト/外部資産は実行・取得しない。CMSのStarterKitからProseMirror構造検証、既存JSON Schemaから下書き検証を再利用する。対応外は記事単位で停止し原文を保全する。画像/PDFに架空assetIdを採番しない。

現行の5タイプの下書きフィールドと公開スナップショットを明示的に対応づける。イベントのHTMLからプレーンテキストへの変換は単純段落/改行のみとし、リンク・装飾などは停止する。ブログの旧装飾・埋込・コンテナを勝手に簡略化しない。旧日付/URL/状態はpayloadへ混ぜずsourceに保持する。旧公開状態から新CMSを自動公開しない。

単体テストは情報落ち・未知値・衝突・決定的出力を検査する。全件実行で件数を検査し、候補はCMS現行validatorでも照合する。生成物は`.local/`、再現手順と集計は本仕様内に保存する。画面・DB・公開環境を変更しないためUI/E2Eは対象外。

## タグ不足・外部PDFの修正

同じ#338と未マージPR #477の続行。0013は既存作品対応表から不足2行のみ追加する。実環境適用は本作業に含めず、#336の環境適用時・#471取込前に確認する。外部PDFは`specs/006-blog-cms/contracts/body-storage.md`の通常リンク方針を使い、自サイト添付のasset解決とは分ける。

旧文字色は移行時に補正し、CMS保存値とCMS/公開表示を一致させる。原HTMLはsource.rawにバックアップとして保持する。補正値・合意・検証はspec.mdとverification-20261125.mdを参照。

## 非公開adapterの実装単位（2026-11-28）

 #373 / #489 / #492 の取得済み入力を既存変換器へ接続した。原本・状態を保持し、公開入力との衝突を共通検査する。空slugのdraftのみ既存のslug省略を許可し、URL生成はしない。詳細と再現手順は [非公開変換](nonpublic-conversion.md)。正式資産対応・取込は後続。

## 添付照合・登録（ #494 ）

公開/非公開の実参照を抽出し、WXR宣言サイズと完全URLで対応付ける。scheme差は双方の実体hashで確認する。合意済み復旧/除外を明示的な対応表にし、専用D1/R2で予約→実体照合→asset確定→URL台帳を実行する。再開時のID保持と既存実体の上書き拒否を検証する。記事の公開状態は変更しない。[実装・検証](media-migration-20261128.md)。

## 本文asset接続（ #492 、2026-11-28）

ブランチ `codex/issue-492-asset-body-conversion` は最新 `version-4` から分岐し、同じ統合先へ戻す。登録台帳を入力として、画像の元位置をblock/inlineノードで保持する。寸法・title・既知WordPress class・loading/decoding・srcset/sizesは記事ごとの属性として保持し、実体metadataと混ぜない。旧classは保全用の限定文字列として保持し、Tailwindとの衝突を避けるためHTML classには出さない。画像とPDFへのリンクはassetKind付き参照とし、target/titleを維持する。未登録URL・未知属性・不正な表示値は停止する。合意済み復旧/除外は元URLと記事IDの両方で制限する。

CMSは既存BodyEditorを継続する（Figma `153:166`、2026-11-28 MCPで定義・画像確認）。画像ボタンと代替テキストダイアログをinline画像にも接続する。外観・共通部品は追加しない。既存BodyEditor案の利用者受入とは区別して、保存・再読込と参照保持をブラウザで検証する。レスポンシブ候補も保存時・公開manifest作成時のasset検査に含める。40MiBの公開manifest制限、実記事の取込、旧URL移行と最終同期は別の残条件。
