# 非公開入力の正式 adapter と統合事前照合

対象: #373 / #489 / #492。2026-11-28、実装・検証・差分レビュー: Codex。受入担当: 依頼者。ブランチ `codex/issue-373-nonpublic-conversion`、分岐元・統合先 `version-4`（開始時 PR #515 統合済み）。

## 範囲と依存

取得・照合済み27件を既存変換器へ接続する adapter を実装した。正式取込manifestの完成とは区別する。 #489 の公開837件と合わせてID・パス衝突を検査する。 #494 の正式assetId・添付公開範囲が未確定のため全件変換は完了しない。 #492 の確定成果から #471 配下の #495（再実行可能な取込）→ #496（隔離環境での全件照合）へ進む。 #489 の英語保全・最終同期範囲も未完了。

## adapter の契約

`astro/scripts/prepare-wordpress-nonpublic.mjs` は照合済み `wordpress-nonpublic-intake/v1` を入力にする。WXR分類を公開入力の分類辞書にslug・名称で照合し、REST分類IDと一致を確認する。未知分類・未知独自meta・不正recommend・未解決thumbnailは停止する。運用・SEO・oEmbed metaは原本へ保全し、本文として実行しない。本文変換にはREST renderedを使い、raw本文・rawタイトル・全REST/WXRデータをsource.rawへ保持する。

元draft/privateをsource.statusに、日時・元URL・入力hash・元レコードhashを台帳に残す。公開入力の元状態はpublish。すべての行に `publish:false` を明示する。候補は既存CMS保存schemaであり、公開manifestではない。

空slugのdraftは既存CMSのslug省略形式を使う。source.pathはnullで、`new-url-required-on-publication` を記録する。架空slugや公開URLを作らない。privateの空slugは停止する。slugがある非公開記事のパスは衝突検査用であり公開URL所有権を確定しない。公開/非公開を通じた重複ID・パスは双方を停止する。

添付208レコードは成果に保持するだけで、本文使用照合・実体取得・assetId対応を完了扱いにしない。

CLIの全入力と出力先は実パスでGit対象外 `.local/` に限定し、symlinkによる外部出力を拒否する。出力は新規ファイルのみ・0600。標準出力は集計だけ、失敗時は入力断片を含まない固定メッセージ。非公開の記事別情報はGit・Issue・PRへ載せない。

## 実データ検証

Node 24.22.3。公開入力hashは [公開検証](verification-20261125.md)、REST/WXR原本hashと取得条件は [取得照合](nonpublic-intake.md) を参照。

| 元状態 | 入力 | 保存候補 | 停止 |
|---|---:|---:|---:|
| publish | 837 | 549 | 288 |
| draft | 3 | 2 | 1 |
| private | 24 | 4 | 20 |
| 合計 | 864 | 555 | 309 |

公開入力の結果は不変。非公開は暫定4候補/23停止から6候補/21停止になった。差は空slug下書き2件。停止は画像等・添付対応に関連する。全件の重複ID/パス・分類不一致なし。

独立2回のローカル成果はbyte一致。SHA-256: `7a983f5bc783598111fe27287f69a96829fb440e7a83f37d064c46fd7a01df51`。既存変換器21テストとadapter6テストが成功。合成入力で原文・状態保全、空slug、公開/非公開衝突、未知分類/meta/添付の停止、件数・重複拒否、CLIの出力先制限と非公開エラー漏えい防止を確認。CMS validator照合2件成功（公開837件、統合864件中全555候補）。UI変更なし、ブラウザ確認は対象外。

再現（Node 24のPATHを設定し、未使用の出力名を使う）:

```sh
node astro/scripts/prepare-wordpress-nonpublic.mjs \
  .local/wordpress-conversion/public-20261125.json \
  .local/wordpress-conversion/nonpublic-intake-20261127.json \
  .local/wordpress-conversion/combined-recheck.json
node --test astro/scripts/prepare-wordpress-nonpublic.test.mjs astro/scripts/prepare-wordpress-conversion.test.mjs
WP_COMBINED_REPORT="$PWD/.local/wordpress-conversion/combined-recheck.json" \
WP_CONVERSION_SNAPSHOT="$PWD/.local/wordpress-conversion/public-20261125.json" \
pnpm --dir cms exec vitest run worker/wordpress-conversion.test.ts
```

## 未完了

 #494 の実添付対応・配信範囲、 #489 の最終入力、 #492 の309件停止解消・正式変換、 #495 / #496 の取込先確定・実取込・認証境界確認。非公開本文で使う添付を一般配信してよいとは判断していない。実環境の閲覧制限と許可済み2人のアクセス確認は未実施。作業時間・外部待ちの残見積は未確認。関連IssueはOPENを維持する。
