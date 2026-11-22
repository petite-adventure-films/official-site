# 実装方針

対象 #338。ブランチ codex/issue-338-conversion-preflight、分岐元/統合先 version-4。

`astro/scripts/prepare-wordpress-conversion.mjs`をNode 24で実行する。既存のjsdomを静的HTML解析に使い、スクリプト/外部資産は実行・取得しない。CMSのStarterKitからProseMirror構造検証、既存JSON Schemaから下書き検証を再利用する。対応外は記事単位で停止し原文を保全する。画像/PDFに架空assetIdを採番しない。

現行の5タイプの下書きフィールドと公開スナップショットを明示的に対応づける。イベントのHTMLからプレーンテキストへの変換は単純段落/改行のみとし、リンク・装飾などは停止する。ブログの旧装飾・埋込・コンテナを勝手に簡略化しない。旧日付/URL/状態はpayloadへ混ぜずsourceに保持する。旧公開状態から新CMSを自動公開しない。

単体テストは情報落ち・未知値・衝突・決定的出力を検査する。全件実行で件数を検査し、候補はCMS現行validatorでも照合する。生成物は`.local/`、再現手順と集計は本仕様内に保存する。画面・DB・公開環境を変更しないためUI/E2Eは対象外。
