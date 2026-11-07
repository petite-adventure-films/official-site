# Content repository package

CMSの保存方式を管理画面やAstroから分離するRepository契約です。

## 保存先の役割

- 本番CMSの正本: Cloudflare D1
- ローカル開発: SQLite
- ファイルJSON: WordPress移行、テスト、可搬バックアップ、障害調査
- 公開サイト: Repositoryではなく、確定済みの不変な公開snapshotだけを読む

`ContentRepository`にファイルシステムやSQL固有の型を含めないため、Phase 5でD1/SQLiteアダプターを追加しても呼び出し側を変更しません。

## ファイルJSONレイアウト

```text
data/
  records/<content-id>.json
  revisions/<content-id>/<revision-id>.json
  indexes/content.json
```

recordとrevisionが正本で、`indexes/content.json`は再生成できる派生データです。一覧では本文を読まず、タイトル、slug、種別、公開状態、更新日時だけを読みます。書き込みは一時ファイルからのrenameで置換し、同一プロセス内では直列化します。

ファイルアダプターは単一プロセス用途です。複数インスタンスからの同時更新やトランザクションが必要な本番CMSには使用しません。
