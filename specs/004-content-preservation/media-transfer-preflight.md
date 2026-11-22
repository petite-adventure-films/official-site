# #339 旧メディア取込の事前台帳

2026-11-22。`codex/issue-339-transfer-preflight`、分岐元/統合先version-4。#337の取得済み実体を、R2登録前に照合し取込対象へ整理する。ネットワーク通信・R2書込・assetId発行・CMS登録・元URL置換は行わない。

## 入力と出力

`astro/scripts/prepare-wordpress-media-transfer.mjs`は取得時のresult.json、公開スナップショット、メディア台帳を読む。スナップショットから台帳を再構成し、計画hash・全ジョブURL/参照元・状態/件数が一致することを要求する。未完了ジョブ、未知の状態、欠落/重複ジョブは停止する。

取得実体をディスクから読み直してSHA-256・容量を検査し、Sharpで画像の形式・寸法・ページ数、pdfinfoでPDFページ数を取得記録と再照合する。#337で実施した全デコード/全ページ描画を再実施したという意味ではない。hashが一致する既検証の実体を引き継ぐ。取得元のSQLite/result.json/blobを書き換えない。

出力は`wordpress-media-transfer-preflight/v1`。全体がローカル準備の状態であり、登録済みasset/v1を装わない。

- `objects`: 同一SHA-256の実体を一つにまとめ、ローカル相対パス・MIME・容量・寸法と保存予定キーを保持。
- `urls`: 取得台帳にあるURLを一つずつ保持し、参照元・役割・対応する保存予定キーまたは欠損理由を記録。
- `paths`: 旧台帳のパスとURL別名をまとめ、参照URLがすべて確認できた場合だけ予定キーを付ける。別名でhashが異なれば全体を停止し、一方へ統合しない。
- `planned`: 現在参照される検証済み実体で、現行CMS容量上限内の取込予定。アップロード済み・公開可能という意味ではない。
- `candidate-only`: 元サイズ/復旧候補として取得しただけの対象。取込予定へ含めず、欠損元URLへ自動的に割り当てない。同じ実体が別記事で参照されていても、候補URLの役割は維持する。
- `missing` / `blocked-upload-limit`: 原因を保持し、予定から除外する。候補への置換・上限変更・切り詰めを行わない。

保存キーは既存CMSと同じ`originals/{SHA-256先頭2文字}/{SHA-256}.{MIME由来拡張子}`。MIME→拡張子と容量上限を共通ファイル`packages/content-schema/media-policy.ts`へ移し、CMSと本処理で共有する。APIの振る舞いを変更しない。assetIdは正式登録台帳の担当で、この台帳には発行しない。

取得台帳はURLのquery/fragmentを正規化済み。元HTMLの参照文字列全体は#338の原文へ残っており、本処理だけで旧URLの互換/転送を確定したとは扱わない。

## 全件の結果

| 区分 | 結果 |
| --- | ---: |
| 取得ジョブURL | 6,097 |
| 参照中URL | 6,073 |
| 欠損URL | 9 |
| 再照合した固有実体 | 5,937 |
| 再照合した容量 | 2,062,041,115 bytes |
| 取込予定の固有実体 | 5,915 |
| 取込予定の容量 | 2,044,007,075 bytes（約1.90 GiB） |
| 候補だけの実体 | 22 |
| 容量上限で停止した予定実体 | 0 |
| 旧パス | 5,935 |
| 全URL確認済みの旧パス | 5,926 |

9欠損と復旧候補の未採用は維持する。元画像候補33関係と候補だけの22実体は母集団が異なる。元サイズへの表示置換、元URL到達性、R2上の実体は未確認。

出力はGit対象外の`.local/issue-339-transfer/manifest.json`。SHA-256は`259a2b574ac7c01942eb4eee3b81739e054adfc7e5920a11169c771097556d3e`。入力取得結果のSHA-256は`75f04ad837bd500f1e9d70e52f314ec3b4423007fff7519bfb4d0d1f2fedb138`で、#337の最終取得記録から不変。[機械可読の集計](media-transfer-result.json)を参照。

## 検証と再現

- 事前台帳の単体8件成功。欠損/候補の分離、別名照合、原文参照の不一致、破損/欠落、メタデータ不一致、シンボリックリンク/異常パス、容量超過、再実行の同一結果、出力の上書き拒否を確認。
- 現行CMSのメディアAPI回帰4件と型検査（tsc --noEmit）成功。共通規則への切り出し後も登録・取得の既存動作を確認。
- 画面と稼働環境は変更せず、ブラウザー/E2Eは今回の対象外。

Node24、既存Astro依存とpdfinfoを使用し、リポジトリ直下で実行する。

```sh
node --test astro/scripts/prepare-wordpress-media-transfer.test.mjs
node astro/scripts/prepare-wordpress-media-transfer.mjs .local/issue-337-media/b187a5330e3aa452 .local/issue-339-transfer/new-manifest.json
pnpm --dir cms exec vitest run worker/media.test.ts
pnpm --dir cms exec tsc --noEmit
```

新しい出力名を指定する。既存出力を上書きしない。不正入力や照合失敗時は台帳を生成しない。次のアップロード処理でも直前に実体/hashを再確認する。

## #339に残るもの

対象R2/配信ドメインの確定、assetIdの永続登録・再実行経路、実アップロードとR2側checksum/件数/容量照合、公開参照と旧URL互換、復旧候補の表示採用、独立バックアップ/復元接続。欠損画像の表示判断は#445の相談を引き継ぐ。#339はOPEN、#337は取得完了を維持する。#338の本文候補件数は今回の準備では増えない。
