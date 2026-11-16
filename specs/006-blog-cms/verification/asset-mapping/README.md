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
