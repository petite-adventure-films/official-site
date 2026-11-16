# 新規ブログ下書きのCMS検証

2026-11-16。Figma 155:1483（代表画面）/153:166（本文部品）をMCPで再取得し、共通Layout/Section/FieldとMUI部品へ対応した。`new-blog.png` は `pnpm --dir cms dev` の1440px実画面。入力欄・本文・操作行・右側設定の重なり/文字切れがないことを確認した。新規下書きの範囲であり、画像登録や旧記事保全の検証ではない。

- `pnpm --dir cms build`、型検査: 成功。
- Vitest: 既存111件と追加ブログ4件を確認（全体実行で移行テストのDBメタデータ比較が失敗し、比較対象を実データ行に修正。ブログ4件を再実行して成功）。
- `node --test cms/scripts/publication-runner.test.mjs`: 成功。意図的に公開ビルドを失敗させても既存公開を保持する回帰。
- Playwright `blog.spec.ts` 2件、`draft.spec.ts` 4件、`slug.spec.ts` 2件: 成功。リンク選択テストをOS依存のHome/Endから選択文字列を確認する操作へ修正し、該当1件を再実行して成功。
- 新規本文・太字・見出し・リスト・安全な外部PDFリンク、分類、フラグ、タグを保存→再読込→再編集。本文検索とevent/blogの分離を確認。
- D1 migration前後で既存event、操作記録、公開履歴/ポインタを比較。foreign_key_checkと旧操作IDの再送を確認。ローカルDBをバックアップ後に0008を適用。本番DBは未変更。

再現: Node 24 + pnpm、`pnpm --dir cms install`、`pnpm --dir cms dev`。`http://127.0.0.1:5174/cms/blog/new` で作成、`/cms/blog` から再編集。E2Eは開発サーバーを止めて `pnpm --dir cms run test:e2e blog.spec.ts draft.spec.ts slug.spec.ts`（独立した一時D1を使用）。

未確認/後続: OS日本語IME実操作、実装画面の最終利用者レビュー、旧記事取り込み、添付登録、複製/履歴復元、ブログ公開・配信。新規本文はv2候補のテキスト部分集合のみ。公開・プレビュー・履歴・複製・添付ボタンは非活性。公開v1形式や旧記事の公開日はこの工程では変更していない。
