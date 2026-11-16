# 添付対応の設計検証

[契約と結果](../../contracts/asset-resolution.md)。既存台帳を上書きせず、ブログ本文の用途別参照を抽出する。

Node 24、editor-prototypeと同じ隔離依存（jsdom）、Astro依存（sharp）が必要。リポジトリ直下で実行する。

```sh
TIPTAP_AUDIT_DEPS=/tmp/paf-tiptap-prototype node specs/006-blog-cms/verification/asset-mapping/inventory.mjs
node specs/006-blog-cms/verification/asset-mapping/probe.mjs
node specs/006-blog-cms/verification/asset-mapping/check.mjs
```

inventoryは原本/台帳hash・全URL・用途・記事ID・台帳パス・過去の確認結果を記録する。query/fragmentやURL別名を保持し、パス一致を実体一致と扱わない。

probeはネットワーク接続が必要。既知の自サイトホストだけへ、欠損候補8URLと元サイズ候補7URLのHEAD、代表画像最大3点のGETを行う。GETは1ファイル20MiBまで。取得した画像をdecodeして寸法を確認し、hash名で `/tmp/paf-verified-media/` へ保存する。現在の実行結果は2点取得。自動置換・R2 upload・asset ID発行はしない。

checkは原本hash・参照数・台帳照合・ホスト偽装等の分類負例・実ファイルの再読出しhashを検証する。ローカルファイルが消えている場合はprobeを再実行する。別環境での取得結果は更新日時やサーバー側変更で変わり得る。

保存契約の分類変更は `verification/body-contract/check.mjs` でも検証する。外部PDFの通常リンク保持、自サイト画像/PDF hrefのassetKind分類、asset未解決時の公開停止を合成fixtureと310件の実データで確認する。

全件取得のオフライン計画は `python3 specs/006-blog-cms/verification/asset-mapping/plan-download.py` で再生成する。入力hashを検査し、容量と欠損8件の復旧キューをdownload-plan-result.jsonへ出力する。ネットワークアクセス・画像取得・ID発行は行わない。[実行計画](../../contracts/asset-acquisition.md)を参照。

## 小規模の取得・復旧候補レビュー

Node 24、Astroのsharp、隔離環境のjsdomを使う。リポジトリ直下で実行する。

```sh
node specs/006-blog-cms/verification/asset-mapping/check-download.mjs
node specs/006-blog-cms/verification/asset-mapping/download-sample.mjs
node specs/006-blog-cms/verification/asset-mapping/download-sample.mjs --offline
```

check-downloadはネットワークなしの故障注入テスト。download-sampleは固定20 URLの読み取り取得のみで、最大20MiB/画像・100MiB受信予算・空き領域5GiBを要求する。保存先は入力hashから決めた `/tmp/paf-download-sample-<hash>/`。同じ保存先へ同時実行しない。既存manifestの入力が異なる場合は拒否する。`--offline` は検証済みキャッシュの再利用確認用で、未完了ジョブがあれば取得は失敗する。

[取得結果・目視レビュー・制約](recovery-review.md)を参照。公開データの一時保全であり、長期バックアップや全件移行ツールではない。
