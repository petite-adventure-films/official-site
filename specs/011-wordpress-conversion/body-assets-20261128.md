# 正式assetIdと本文の接続

対象: #492 / #373 / #494 / #471。実施・差分レビュー: Codex。受入担当: 依頼者。利用者から実装・検証・問題がなければマージする指示を受領。ブランチ `codex/issue-492-asset-body-conversion`、分岐元・統合先は `version-4`（開始時 `9c30e8e9`）。

## 保存・編集・公開の契約

画像実体のmetadataと記事内の表示属性を区別する。既存 `assetImage` に加え `inlineAssetImage` を追加し、段落内の画像・文字・リンクの順序を保持する。alt・title・width/height・loading/decodingを限定属性として保存する。srcsetは登録済み画像assetIdと幅descriptorの配列、sizesは実入力の限定構文を保持する。srcsetの幅は登録実体の幅とも照合する。

WordPressの既知画像classは `legacyClass` に記録するが、HTMLのclassとして実行しない。`size-full` はTailwindの同名utilityと衝突するため、表示寸法は構造化したwidth/heightで指定する。任意CSS・任意classを許可しない。未知属性は記事単位で停止する。画像の代替テキストを新規に推測・生成しない。

画像/PDFのクリック先は `assetLink` のassetId・assetKindで保存し、target/titleを保持する。通常の外部リンクは従来のlinkを使う。CMSは認証付きmedia経路、公開rendererは公開manifestのasset経路へ解決する。レスポンシブ候補・クリック先も保存時の存在/種別検査と公開manifestの実体集合に含める。未登録参照・種別不一致を通さない。

新しい属性は既存schemaへの追加であり、schemaVersionは2を維持する。旧実行版は新ノードを扱えないため、実取込の前にCMS・公開renderer双方を対応版へ揃える。現行rich-text/v1やレビュー案schemaを正式採用したものではない。

## 移行変換

`prepare-wordpress-nonpublic.mjs` の第4引数に、 PR #518 で作成した正式asset台帳を指定する。専用環境名、asset/v1、URL/asset/配信先/hashの対応、重複を検査してから使用する。入力hashは成果に残す。台帳を指定しない従来実行は引き続き未解決assetで停止する。

src、srcset、画像/PDFのhref、メディア掲載のPDF項目を解決する。旧URLのquery/fragmentを黙って除去せず、それらがある参照は追加確認待ちにする。ソースHTMLから内部assetマーカーを注入できない。外部画像を勝手に取得・登録しない。

 #493 の復旧/除外は元URL・承認済み判断表・記事ID・実体hashを照合する。8点の復旧は元画像の縦横比を保持し、7277の1点除外は元HTMLと除外記録を残す。別記事への適用や除外画像へのリンクの黙示削除は拒否する。原本は従来どおりsource.rawへ保持し、非公開のタイトル・本文・個別URLをGit/Issueへ掲載しない。

## 全件結果

入力は2026-11-25の公開837件、2026-11-27の取得照合済み非公開27件。11月28日に記事を再取得した成果ではない。asset台帳SHA-256は `aca4a69d2499a7db71ebbe4c2aa733fb2ede11d9dfdd7da61a9b6f608d21f040`。

| 元状態 | 入力 | 保存候補 | 停止 |
| --- | ---: | ---: | ---: |
| publish | 837 | 834 | 3 |
| private | 24 | 16 | 8 |
| draft | 3 | 2 | 1 |
| 合計 | 864 | 852 | 12 |

前回555候補/309停止から297件増加。イベント236・お知らせ246・メディア掲載23・チャンネル21は全件保存候補。ブログ338件は326候補/12停止。

候補内の画像6,044箇所、assetリンク128箇所、srcset候補388箇所、PDF項目13件を解決し、参照する実体は6,246点。原本と変換記録を含む出力は29,052,834 bytes。候補payload最大は177,721 bytes（Python JSON UTF-8計測）。復旧8点・除外1点を別々に確認した。

独立2回の出力はbyte一致。SHA-256: `ed20fe1b5c16049a0bbe0fad74f2278a7c2d45a661c8ef4a63bf95ce770187b8`。保存候補は公開許可ではなく、全864行の `publish:false` と元draft/private/publishを維持する。

## 検証

Node 24.22.3。変換・adapter・asset台帳・新本文mediaのNodeテスト35件成功。公開renderer17件成功。全852候補をCMS保存validatorで検査し、画像・レスポンシブ候補・クリック先・PDF項目を正式台帳でCMS asset validatorへ照合した（実データ検査3件成功）。CMS全体29ファイル162件成功・2件skip（実データ専用の2件は前述の別実行で成功）。公開runner/登録等のNodeテスト20件成功。CMS型検査成功。

Figmaの既存BodyEditor `hk5yiH5HW5Es7RMSzzJIIa / 153:166` をMCPの定義・画像で確認。既存画像ボタンとaltダイアログをinline画像へ接続し、外観・共通部品の追加はない。代表合成記事のPlaywrightでアップロード→保存→alt編集→再読込→ローカル公開を確認。画像の実表示幅160px、srcsetの配信先、クリック先とtarget/title、段落内位置、画像デコードを検査し、CMS/公開画面のスクリーンショットを目視した。旧class衝突による幅の拡大を検出・修正して再検証した。

UI操作は合成データのローカル検証であり、非公開実記事の公開や専用移行環境への記事取込ではない。全記事の見た目・公開サイト全体のWCAG適合・利用者の画面受入は未確認。

## 再現と残条件

```sh
node astro/scripts/prepare-wordpress-nonpublic.mjs \
  .local/wordpress-conversion/public-20261125.json \
  .local/wordpress-conversion/nonpublic-intake-20261127.json \
  .local/wordpress-conversion/body-assets-new.json \
  .local/wordpress-conversion/asset-map-20261128-a.json
# WP_COMBINED_REPORTとWP_ASSET_MAPには上記成果の絶対パスを設定:
pnpm --dir cms exec vitest run worker/wordpress-conversion.test.ts
pnpm --dir cms exec playwright test migration-media.spec.ts
```

出力は未使用名の `.local/` 実パス、0600。CLIエラーに非公開入力断片を出さない。

12件の停止は、未対応属性9件（iframe.loading、コピー元のaria/data属性）、対応外画像URL1件、構造往復差2件（strong要素の分割、隣接リンクの結合）。これらを削除・同一視して候補化しない。記事別の情報はローカル成果に残す。残例外の保持方針と実装を次の作業として確認する。

 #492 の最終同期・URL所有権・全件確定成果の完成、 #471 / #495 / #496 の実取込・再編集・2人の認証境界、公開manifestの40MiB制限、旧URL到達・転送、 #474 の独立バックアップ/復元は残る。専用移行環境のCMS記事は今回も取り込んでいない。各IssueはOPENを維持し、作業/外部待ちの残見積は未確認。

残12件は後続の [本文例外検証](body-exceptions-20261128.md) で解消し、取得済み864件は864候補/0停止。本記録の852候補は本文asset接続時点の結果。
