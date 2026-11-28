# 公開・非公開の添付照合と専用移行検証環境

対象: #373 / #489 / #494 / #492 / #471（取込先は #495 にも引継ぎ）。実施・差分レビュー: Codex。受入担当: 依頼者。作業ブランチ `codex/issue-494-combined-media-usage`、分岐元/統合先 `version-4`（開始時 `42f6b857`）。

## 2026-11-28の利用者合意

- 記事は非公開で保持するが、添付URLの直接閲覧は許可する。監督・開発担当の2人だけが記事を閲覧できる従来合意は維持する。
- 既存検証CMSに混在させず、専用の移行検証環境を新設する。
- 本番切替や既存記事の公開承認ではない。

専用D1は `paf-cms-migration-db`（`be43518c-b1b2-4a08-b04a-1703dee825f2`）、R2は `paf-cms-migration-media`。PAFアカウントに新設し、CMS schema 0001〜0014を専用D1へ適用。既存staging D1/R2と検証記事は変更しない。CMS本体の `wrangler.migration.jsonc` はworkers.dev/previewとも無効で、記事の到達経路は未開設。CMS用Access設定・2人の実アクセス検証は後続。

添付専用Workerは `wrangler.migration-media.jsonc`。 `/media/{assetId}.{ext}` のGET/HEADだけを扱い、確定済みD1レコードとR2実体のsize/hashを検査して返す。記事・一覧・台帳を返さない。R2自体の一般公開設定は変更しない。

## URL使用照合

`prepare-wordpress-media-usage.mjs` は最新公開837件・照合済み非公開27件を入力にする。非公開ではraw/rendered本文を別フィールドとして扱い、WXRの添付メンバーや親IDを本文使用の根拠にしない。絶対uploads URLの原文・UTF-16位置を保存し、query/fragment/entityは原文へ残す。相対uploadsパス・未展開gallery/playlist・未知ホストは未解決にする。HTML表示の完全解析や外部画像の検証とは区別する。

WXRのPHPメタデータは、byte長を検査するscalar/array限定parserで読む。オブジェクト生成・参照復元は行わない。元URLと `_wp_attached_file` / metadata.file の一致、およびmetadata.sizesで宣言されたファイルだけを関連付ける。名前からサイズ違いを推測しない。

| 項目 | 結果 |
|---|---:|
| 記事 | 864 |
| URL出現（raw/rendered別集計） | 7,160 |
| 正規化URL | 6,820 |
| 公開記事だけのURL | 6,076 |
| 非公開記事だけのURL | 744 |
| 公開/非公開で同じ正規化URL | 0 |
| 未解析uploads参照 | 0 |
| WXR添付レコード | 208 |
| 本文使用を確認したWXR添付 | 199 |
| 使用を確認していないWXR添付 | 9 |

WXRとの完全URL一致は559。残る185はHTTP/HTTPS差で、双方の取得済みbytes/hash一致を確認してからscheme aliasとして対応付けた。非公開744URLすべてが添付に対応した。未使用9レコードを削除・移行対象外とは決定しない。

使用照合の独立2回出力はbyte一致。SHA-256: `5f33ffe913456a5746b16df99dd737124afe29152a7fa36e3c6753a32568dda7`。入力hashは各ローカル成果に保持し、非公開URL・本文・タイトル・記事別結果はGitへ掲載しない。

## 取得・復旧・実体照合

新規取得は747URL（非公開744＋公開追加3）。既存の取得・再開・内容検査処理を再利用し、1GiBの取得予算で実行した。初回sandbox通信制限による未完了2URLは、失敗履歴を残して別キャッシュで再取得。747URLすべての形式・デコード・hash・sizeを検証した。

既存キャッシュと新規取得分を再読込してSHA-256/sizeを照合した。 [復旧判断表](media-recovery-decisions.json) は #493 の合意済み9点だけを明示する。8点は指定元画像のhashを確認して復旧、7277の1点は除外として保持。元HTML・欠損記録を保全する。7161の元画像は旧正方形cropと同一ではなく、元画像の縦横比を保持する。

| URLの状態 | 件数 |
|---|---:|
| 元URLの実体を検証 | 6,811 |
| 合意済み元画像からの復旧を検証 | 8 |
| 合意済み除外 | 1 |

重複hashを統合した使用実体は6,472点・2,106,889,101 bytes（公開用5,919・非公開用553、両者の共用hashなし）。実体検証成果のSHA-256は `26a304214ddee13e4f2a3f7078daf2cf851db659d378aa88721e846712b4e415`。除外を取得・復旧成功に含めない。未使用の復旧候補やWXR添付を無断採用しない。

## 登録処理と実行状態

`register-wordpress-media.mjs` は専用環境だけに接続する。ローカル原文を含む入力・成果は `.local/` 内の実パスに制限し、新規0600出力を使う。Wranglerの接続/一時状態はGit対象外。

0014の `wordpress_media_objects` はsha256ごとのassetId予約と確定状態を永続化する。予約だけでは `media_uploads` に確定assetを作らない。各実体を直前hash確認し、R2に既存実体があれば上書きせず照合する。新規保存はchecksum付き条件PUTを使い、GET再読込でsize/SHA-256一致を確認してからCMS asset/v1を登録する。再開時は同じassetIdを使う。URL別のdirect/recovery/exclusionと根拠は `wordpress_media_sources` へ保存する。対象URLや同じhashへの矛盾した対応は拒否する。

メディア一覧用の登録名には取得キャッシュのhashファイル名を使い、元ファイル名・URLと記事別用途は元台帳へ保持する。altや本文上の寸法を実体の共通属性に統合しない。

専用環境で3実体を保存・再読込・assetId確定済み。同じ3実体を再実行し、assetIdと4URL対応が完全一致した。全6,472実体・6,820 URLの登録完了。約1,300実体の確定後に一度中断し、台帳を使って同じassetIdで再開した。登録成果のSHA-256は `3df9862dc9fa451d3db1652fd9263c7da8f9ad2f312a8c97141be553a7d9b4c7`。全asset/v1検査済みの引渡し台帳は独立2回でbyte一致し、SHA-256は `aca4a69d2499a7db71ebbe4c2aa733fb2ede11d9dfdd7da61a9b6f608d21f040`。

## 再現

Node 24.22.3を使用。出力は未使用名を指定する。

```sh
node astro/scripts/prepare-wordpress-media-usage.mjs \
  .local/wordpress-conversion/public-20261125.json \
  .local/wordpress-conversion/nonpublic-intake-20261127.json \
  .local/issue-339-transfer/manifest.json .local/wordpress-conversion/usage-new.json
node astro/scripts/acquire-wordpress-media-usage.mjs \
  .local/wordpress-conversion/usage-new.json .local/wordpress-conversion/cache-new
# 同じcacheへの再実行は取得済みbytesを照合して再開。試行上限に達したものだけを別cacheで再試行:
node astro/scripts/acquire-wordpress-media-usage.mjs \
  .local/wordpress-conversion/usage-new.json .local/wordpress-conversion/cache-retry \
  --retry-unresolved .local/wordpress-conversion/cache-new
node astro/scripts/verify-wordpress-media-usage.mjs \
  .local/wordpress-conversion/usage-new.json .local/issue-339-transfer/manifest.json \
  .local/issue-337-media/b187a5330e3aa452 .local/wordpress-conversion/verified-new.json \
  .local/wordpress-conversion/cache-new .local/wordpress-conversion/cache-retry
# 以下は専用のリモートD1/R2へ書き込む。少数検証には末尾へ --limit 3 を付ける。
node cms/scripts/register-wordpress-media.mjs \
  .local/wordpress-conversion/verified-new.json .local/wordpress-conversion/registered-new.json
```

## 検証と残条件

新規usage/metadata/verification/registration/asset-mapと既存取得・参照照合のNodeテスト29件成功。CMS全体は28ファイル160件成功・1件skip（ローカル統合変換成果が未指定の場合）。公開runner等のNodeテスト17件成功。型検査成功。CLIのエラーは非公開入力を表示しない。UI変更・記事取込は行っていない。

正式assetIdを本文変換へ接続する #492 は [本文asset接続](body-assets-20261128.md) で実装・検証済み。旧画像の表示寸法・title・クリック先・段落内配置を保持し、852候補/12停止となった。現行公開manifestの40MiB制限も全件移行では解消が必要。これらを無視して変換候補数だけ増やさない。

 #495 / #496 の記事取込・再編集・2人の認証境界確認、 #489 の最終同期・英語等、 #474 の独立バックアップと復元、旧添付URLの到達・転送確認は未完了。作業・外部待ちの残見積は未確認。

## 正式asset対応の引渡し契約

`prepare-wordpress-asset-map.mjs` は完全登録成果と実体検証成果のhash・全URL・全実体の一致、asset/v1 schema、専用環境への紐付けを確認する。不完全な少数試験成果、別環境、重複/未知assetId、実体metadata差は拒否する。出力は旧URL→確定assetId→専用配信URLと復旧/除外理由のローカル台帳で、 #492 の入力となる。登録結果の取得名/検証名/出力名の3引数で実行する。

## 保全とローカル復元

専用D1のSQL書出しを `.local/wordpress-conversion/migration-db-20261128.sql`（0600、11,903,193 bytes）へ保存した。SHA-256は `3a5c56aed93b8fc49bfb6aea8601b76b60459af29b8ad9949a0d844c12fc1914`。元の取得キャッシュと復旧元実体も保持している。

SQLを独立したインメモリSQLiteへ復元し、全6,472 assetレコードが登録成果と一致すること、URL台帳6,820件、記事0件・公開履歴0件、integrity_check成功・外部キー違反0を確認した。リモートD1/R2への復元、外付け/独立クラウドの保管、定期運用の受入とは区別し、 #474 / #509 / #513 へ引き継ぐ。

D1書出しはDBを一時的に利用不能にする場合があるため、今後は記事操作や配信検証と重ねない。Wranglerの書出しログには期限付きダウンロードURLが含まれるので、再実行時は標準出力もGit対象外の0600ローカルログへ閉じる。

## 全件配信検査

`audit-wordpress-media.mjs` でD1の全asset JSON・全URL台帳を登録成果と照合し、未確定予約0・記事0・公開履歴0を確認。匿名HTTPは初回6,457件成功・15件未完了。初回成果のhashと成功記録を検査して15件だけ再試行し、全6,472件のsize/SHA-256/MIME/nosniffとPDFのdownload指定を確認した。非添付3ルートは404。初回未完了の原因は特定していない。再検査成果SHA-256: `486fc18ee3e5601e9cb05cad6018830a8f9cdb1c1f9a383bbfab9c5cb1bb2f8c`。

```sh
node cms/scripts/audit-wordpress-media.mjs \
  .local/wordpress-conversion/registered-new.json .local/wordpress-conversion/audit-new.json
# 失敗分だけ再試行。元の成功記録とregistration hashを照合して引き継ぐ:
node cms/scripts/audit-wordpress-media.mjs \
  .local/wordpress-conversion/registered-new.json .local/wordpress-conversion/audit-retry.json \
  --retry .local/wordpress-conversion/audit-new.json
```
