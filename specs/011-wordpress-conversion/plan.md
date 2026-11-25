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
