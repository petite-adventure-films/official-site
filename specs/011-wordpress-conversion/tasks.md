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

## #490 / #491 / #492（2026-11-25着手）

実装担当はCodex、受入確認は依頼者。未確認の受入を完了扱いにしない。作業時間・外部待ちの残見積は未確認。

- [x] T009 最新公開837件を別ファイルへ取得し、旧832件との違いと書式を記事ID/属性値別に調べる。PR #482を内容確認の上で作業ブランチへ取り込み、単体4件を確認する（統合先へのマージは未実施）。
- [x] T010 #491の不明な開催形式をschema・保存・編集・公開表示・構造化データ・変換器へ接続し、会場情報の保持と既存経路を検証する。
- [x] T011 #490の文字色・言語・コンテナ・混在動画を、原文と構造を保持して保存・編集・公開へ接続する。残例外を記事別に記録する。
- [x] T012 #491のHTML項目を保存・編集・公開へ接続し、最新全イベントと代表操作を検証する。
- [ ] T013 #373/#489/#494から非公開/最終入力と正式assetId台帳を受領し、#492の全件正式変換・再現性・状態/URL/分類/参照検査を行う。
- [ ] T014 入力/出力/hash/検証結果を#471へ渡し、依頼者の受入確認と残例外に基づき#338の終了を判定する。

T010/T012は実装と自動・代表操作検証を完了。依頼者による画面受入は未完了。T011は色補正の利用者合意を反映し、実装・代表操作・全件再照合済み。公開ページ全体のアクセシビリティ評価と画面受入は別途必要。詳細は[最新の検証](verification-20261125.md)。
