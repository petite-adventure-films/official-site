# #338 事前照合タスク

- [x] T001 `specs/011-wordpress-conversion/spec.md`と`plan.md`に今回の範囲・依存・保全条件を固定する。
- [x] T002 `astro/scripts/prepare-wordpress-conversion.mjs`に5タイプの入力・分類・値・URLと本文の検査、変換候補・停止理由の出力を実装する。
- [x] T003 `astro/scripts/prepare-wordpress-conversion.test.mjs`で情報落ち・未知値・重複・再現性を検査する。
- [x] T004 `cms/worker/wordpress-conversion.test.ts`で全件の候補を現行CMS保存validatorへ照合する。
- [x] T005 `specs/011-wordpress-conversion/verification.md`へ全件結果と#338の残条件を記録し、PRとIssueへ反映する。

T001→T002→T003→T004→T005。1作業ずつ実施。#338の全件正式変換、#339の添付解決、#373非公開取得、#471実取込の完了とは区別する。

## #338の次の修正単位

- [x] T006 `cms/migrations/0013_missing_film_tags.sql`で作品タグ2件だけを追加し、`cms/worker/film-catalog.test.ts`で既存データ保全・5タイプ保存/公開候補・未知タグ拒否を検証する。
- [x] T007 `astro/scripts/prepare-wordpress-conversion.mjs`で追加migrationのタグを反映し、外部PDFを通常リンクとして保持する既存契約に合わせる。
- [x] T008 `specs/011-wordpress-conversion/result.json`と`verification.md`を再集計し、Issue/PRに適用済み範囲と稼働環境未適用を記録する。
