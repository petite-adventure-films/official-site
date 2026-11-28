# 残本文例外の解消と全件事前検証

対象: #492 / #373 / #494 / #471 。実施: Codex。利用者の実装・検証・レビュー後マージの依頼に基づく。統合先 `version-4`、作業ブランチ `codex/issue-492-remaining-body-exceptions`。取得済み入力の変換検証であり、実記事取込・本番移行の完了ではない。

## 保存・表示の契約

- iframeの `loading` は `lazy` / `eager` を保存し、CMSと公開HTMLへ同じ値を出す。省略時は従来どおりlazy。未知値は停止する。[HTML標準](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-loading)。
- 子要素がなくテキストが `#` のspanに限り、元のaria-labelをpreservedInlineのariaLabelへ保存する。公開・編集では名前付き記号としてrole=imgを付ける。他のaria-label用途を推測して受理しない。[WAI-ARIA img](https://www.w3.org/TR/wai-aria-1.2/#img)。
- コピー元のdata-aria-label-part/data-testidは既知属性の保全対象に追加する。原文と変換記録へ残し、公開HTMLで動作させない。
- リンクを囲むstrongはpreservedStrongとして囲みを保持する。隣接リンクは保存用legacyBoundaryで同一URLでも結合させない。この内部識別子はCMS表示・公開HTMLに出さない。改行だけのリンクも公開rendererで保持する。
- 文字・書式・意味属性・コンテナ数・リンク・構造数・JSON往復の検査を維持する。未知属性や未登録資産を通す緩和は行わない。

## 透明GIFの個別合意

2026-11-28、利用者から「この1点を除外し、原本を保全する」の回答を受領。公開記事4772の `https://ssl.gstatic.com/ui/v1/icons/mail/images/cleardot.gif` は43 bytes、1×1ピクセル、完全透明、altなし。取得bytesのSHA-256は `b1442e85b03bdcaf66dc58c7abb98745dd2687d86350be9a298a1d9382ac849b`。

[除外台帳](body-exclusions.json)に記事ID・URL・全属性・実体検査結果を記録した。対象記事とURLだけでなく属性集合の一致を要求し、同一対象の複数出現・リンク内・属性追加の場合は停止する。他記事へ除外を広げない。元HTML/URLは入力とsource.raw/変換記録、実体は `.local/wordpress-conversion/cleardot-20261128.gif` に保全。架空assetIdは登録しない。以前の #493 の8点復旧・1点除外とは別の合意。

## 全件結果

| 元状態 | 入力 | 候補 | 停止 |
| --- | ---: | ---: | ---: |
| publish | 837 | 837 | 0 |
| private | 24 | 24 | 0 |
| draft | 3 | 3 | 0 |
| 合計 | 864 | 864 | 0 |

blog338、news246、event236、pressCoverage23、video21の全件が候補。全行 `publish=false`。元状態・原文・旧日付・URLをsourceへ保全する。全864候補をCMS保存validatorと実asset台帳に対する資産validatorで確認した。

入力は `public-20261125.json`、`nonpublic-intake-20261127.json`、`asset-map-20261128-a.json`（すべて `.local/wordpress-conversion/`）。入力hashは各出力内のsourceHashes/intakeSourceHashesに保持。独立2回の出力 `exceptions-final-a-20261128.json` / `exceptions-final-b-20261128.json` は29,585,956 bytesでbyte一致、SHA-256は `c84c529cd89af07efbc7755789da435ecc4d31e80c013dac84c05627a41a295d`。入力・出力・非公開個別情報はGit対象外。

再現（Node 24、未使用の出力ファイル名を指定）:

```sh
node astro/scripts/prepare-wordpress-nonpublic.mjs \
  .local/wordpress-conversion/public-20261125.json \
  .local/wordpress-conversion/nonpublic-intake-20261127.json \
  .local/wordpress-conversion/exceptions-recheck.json \
  .local/wordpress-conversion/asset-map-20261128-a.json
WP_COMBINED_REPORT="$PWD/.local/wordpress-conversion/exceptions-recheck.json" \
WP_ASSET_MAP="$PWD/.local/wordpress-conversion/asset-map-20261128-a.json" \
WP_CONVERSION_SNAPSHOT="$PWD/.local/wordpress-conversion/public-20261125.json" \
pnpm --dir cms exec vitest run worker/wordpress-conversion.test.ts
```

## 検証と受入の範囲

CMS回帰162テスト成功（実データ指定待ち2件は別実行で成功）、運用スクリプト20テスト成功。変換・adapter・画像処理36テスト成功、CMS型検査成功、実データ保存/資産検証3テスト成功。公開rendererは実記事18043/4318の構造数照合を含め20テスト成功。通常実行時の実データ検査は環境変数がなければskipし、非公開情報をfixtureへ複製しない。

Playwright `body-exceptions.spec.ts` は合成記事の保存・追記・再読込・ローカル公開・HTML照合に成功。既存BodyEditor（Figma `153:166`、2026-11-28 MCP確認）を使い、操作部品・外観を追加しない。ローカルスクリーンショット `cms/test-results/body-exceptions-editor.png` / `body-exceptions-public.png` で太字・リンク・記号と周辺配置を確認。動画は外部通信をテストHTMLへ置換した。実動画再生・利用者の正式な画面受入・サイト全体のWCAG適合を確認済みとはしない。

## 未完了

専用環境への実記事取込、2人の認証境界と一般ユーザーからの非公開本文遮断、旧URL所有権・最終同期・英語等の入力確定、40MiB公開manifest制限の全件確認、独立バックアップ/復元と正式受入が残る。 #492 / #373 / #489 / #495 / #496 / #471 はこの変換成功だけでは閉じない。新しい本文形式を使う前にCMS・公開ビルド双方へ対応版を適用する。残作業・外部待ちの所要時間見積は未確認。
