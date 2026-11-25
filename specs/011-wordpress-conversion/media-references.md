# #338 記事と取込予定メディアの照合

2026-11-22。作業ブランチ`codex/issue-338-media-reference-preflight`、分岐元/統合先`version-4`。#481で統合した#339の取込前台帳を、同じ公開スナップショットの記事別参照へ接続する。正式assetIdを発行せず、元記事・本文・CMS・R2を書き換えない。

## 照合の範囲

全832記事を保持し、記事の原文hashと型/旧IDを記録。各文字列フィールドにある絶対URLのうち`/wp/wp-content/uploads/`を含む出現を抽出する。同一URLの繰返しも別々に保持する。rawUrlとUTF-16単位の開始/終了位置から元フィールドの文字列へ戻れる。query/fragment・HTMLエンティティはrawUrlへ残し、#337の正規化URLを照合専用に使う。元URLに異なるホストが付いていれば同一パスだけで結び付けない。

台帳とスナップショットのhash一致、URL/保存キーの重複、予定キーに対応する予定実体を検査する。URLが参照用で、記事型・旧ID・フィールドが台帳の参照元と一致する場合だけ対応を採用する。候補専用URLや別記事のURLを欠損の代替にしない。未知URL・参照元不一致・容量超過・欠損・絶対URLとして抽出できないuploadsパスを別に報告する。予定キーを出すのは`planned`だけ。

画像ノードやリンクの正式変換器ではない。CSS/srcset/相対URLなどの文法全体を解析するものではなく、抽出できなかったuploadsパスを報告する。uploads以外の画像・外部添付・内部リンク、HTMLの表示上の役割、旧URL転送は本結果で検証済みとしない。本文装飾/添付の未対応停止条件を緩めない。

入力は#339のローカル照合済み台帳。今回は実体を再読込せず、入力台帳のhashを出力へ残す。実アップロード前の実体再照合・リモート検証は#339で引き続き必要。

## 結果と検証

- 全832記事、うち添付参照あり284記事。
- URL出現6,154か所。保存予定キーへ接続6,145か所、既知欠損9か所。
- 台帳にないURL、参照元不一致、解析できないuploadsパスは今回0件。
- 単体4件成功。元文字列/位置の一致、query/fragment/entity保持、重複出現、欠損/候補/容量超過の非採用、別ホスト/相対パス、入力不一致の拒否を検査。
- ネットワーク操作・UI変更なし。ブラウザー/E2Eは対象外。

[集計と欠損記事](media-references-result.json)に入力/出力hashを記録。全出力はGit対象外`.local/issue-338-media-references/result.json`。#339の6,097取得URLとは異なり、この記事別6,154件は繰返しを含む原文上の出現数。#338の変換候補283件/停止549件は変更しない。

Node24と既存依存を使い、リポジトリ直下で再現する。出力は新しいパスを指定し、既存出力を上書きしない。

```sh
node --test astro/scripts/prepare-wordpress-media-references.test.mjs
node astro/scripts/prepare-wordpress-media-references.mjs astro/data/wordpress-export.json .local/issue-339-transfer/manifest.json .local/issue-338-media-references/new-result.json
```

正式assetId/配信URLへの接続、本文画像/添付の正式変換、最新原文・非公開データ、実取込は未完了。#338と#339はOPENを維持する。
