# ブログCMS：新規下書き保存・再編集

対象 #418 / #334。2026-11-16の利用者レビューで、編集画面/Tiptapの方向、未解決添付の公開停止、下書き保存→再編集まで進める方針を承認。公開接続・旧記事一括取込・画像代替の実行・本番移行は後続。

## 準備

- [X] T001 specs/006-blog-cms/plan.md に承認範囲と今回の限定を記録し、Figma 155:1483/153:166を確認する。

## 共通基盤

- [X] T002 cms/migrations/0008_blog_drafts.sql で既存eventと操作・公開履歴を保持しblogのtype制約・作成trigger・既存カテゴリ台帳を追加する。
- [X] T003 cms/worker/repositories/content-drafts.ts でtype別一覧/検索/件数と保存schemaを扱い、既存event再送fingerprintを維持する。

## US1（P1）新規ブログを下書き保存する

空本文・未分類のまま保存でき、本文/タグ/フラグを再取得して照合できること。

- [X] T004 [US1] packages/content-schema/schemas/content/blog-draft.schema.json と cms/worker/blog-draft.ts で新規本文の構造とURLを検証する。categoryIdはnull許容。旧保全参照の新規注入を拒否する。
- [X] T005 [US1] cms/worker/routes/contents.ts と cms/worker/app.ts にblog保存・カテゴリ取得を接続し、保存済みtypeで更新を検証する。blog公開/履歴復元等の未接続操作を拒否する。
- [X] T006 [US1] cms/src/features/blog/ にTiptap本文・カテゴリ/タグ/スイッチ・共通Layoutのブログ編集を実装する。日時は表示のみ、未接続操作は非活性にする。

## US2（P1）一覧から再編集する

blogとeventが混在しても一覧/検索/件数が混ざらず、ブログ再読込で本文・分類が維持されること。

- [X] T007 [US2] cms/src/features/content/hooks/useDraftSave.ts と cms/src/features/content/components/ContentList.tsx を種別対応し cms/src/app/routes.tsx で種別不一致を拒否する。
- [X] T008 [US2] cms/worker/blog-draft.test.ts と cms/e2e/blog.spec.ts で保存・競合・再送・種別分離・本文再編集と未接続公開の拒否を検証する。

## 仕上げ

- [X] T009 cms/ の型検査・既存テスト・対象E2E・1440px画面確認を実施し specs/006-blog-cms/quickstart.md に結果と未確認事項を記録する。

依存: T001→T002/T004→T003/T005→T006/T007→T008→T009。基盤完成後はフォームと一覧の作業が独立可能だが、今回単一作業として進める。まず新規テキスト本文の保存を一巡し、添付登録/旧記事保全/公開は別の受け入れ単位へ残す。
