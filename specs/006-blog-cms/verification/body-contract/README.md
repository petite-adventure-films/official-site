# 保存・公開契約の設計検証

本番コードへ接続しない実行可能な仕様案。対象と制約は [保存・公開境界](../../contracts/body-storage.md) を参照。

1. editor-prototypeのREADMEに従って依存を復元し、Node 24で試作サーバーを起動する。検証コードはCMSのPlaywrightと `TIPTAP_AUDIT_DEPS`（省略時 `/tmp/paf-tiptap-audit`）のAJVを使う。
2. リポジトリ直下で次を実行する。

```sh
node specs/006-blog-cms/verification/body-contract/export.mjs
python3 specs/006-blog-cms/verification/body-contract/build-schema.py
TIPTAP_AUDIT_DEPS=/tmp/paf-tiptap-prototype node specs/006-blog-cms/verification/body-contract/check.mjs
```

exportはChromiumで310件を旧HTMLから検証済み編集JSONに変換し、`/tmp/paf-body-contract-documents.json` へ出力。build-schemaはcontractsの2つの候補schemaを生成する。checkはエクスポートの原本hash一致を検査してから、候補形式への変換、AJV2020検証、記事所属/URL等の意味検証、逆変換、公開用AST、負例と容量を検査し `result.json` を更新する。

- 310件で編集候補schema通過・正規化した編集JSONへの逆変換成功。
- 添付未解決254件を公開停止。本文のみの公開AST条件を満たす56件は、記事公開の受け入れ完了を示さない。
- 元からある重複アンカーは保全し、公開を停止。生class/data/tabindex等を公開ASTへ出さない。
- schema通過後も原本参照の存在・記事所属・種別、URL、assetのサーバー解決結果を検証する。公開用schemaは未解決ノード/sourceRefを許可しない。
- 旧URLに仮assetIdを与えていない。許可assetの正例は明示した合成fixtureのみ。
- AST検証であり、HTML生成、正式ID解決、CMS/D1/公開接続は未実装。既定null/空文字属性の省略を除いた逆変換を検証し、本文textの空白は削らない。

listItemは先頭paragraph＋可変長のblock列を許可するため、AJVのstrictTuples警告だけを無効化する。schemaのprefixItems/minItems/itemsで構造を検査し、不正な先頭ノードの負例を含む。解決済みassetの逆変換は実asset resolver未実装として明示拒否する。
