# Tasks: CMS残る3種別

対象 #419/#420/#421/#445。共通基盤を先行し、公開表示の合意後に各種別を一巡させる。

## 準備と共通基盤
- [x] T001 specs/007-cms-remaining-types/ の仕様・設計と既存コードの境界を照合する。
- [x] T002 cms/src/features/articles/draft.ts と cms/worker/article-draft.ts に[data-model](data-model.md)の上限・欠損許容・種別別検証を追加する。
- [x] T003 cms/migrations/0011_article_drafts.sql と cms/worker/repositories/content-drafts.ts で旧データを保持して種別を広げる。
- [x] T004 cms/worker/services/ の参照・公開・履歴・復元・manifestを拡張し、cms/worker/ のテストで同時編集・再試行・公開失敗の保持を確認する。

## US1 お知らせ
- [x] T005 [US1] cms/src/features/articles/ と cms/src/app/routes.tsx に一覧・編集・保存・公開・履歴の共通画面を接続する。
- [x] T006 [US1] astro/src/pages/news/ と cms/scripts/prepare-director-samples.py に表示・代表記事18059を接続し、検証環境で一巡する。

## US2 メディア掲載
- [x] T007 [US2] cms/src/features/articles/ に出典・PDF・記事抜粋項目を接続する。
- [x] T008 [US2] astro/src/pages/media/ と cms/scripts/prepare-director-samples.py に代表17839を接続し、PDF込みで一巡する。

## US3 チャンネル
- [x] T009 [US3] cms/src/features/articles/ に動画・制作情報を接続する。
- [x] T010 [US3] astro/src/pages/channel/ と cms/scripts/prepare-director-samples.py に代表17837を接続し、動画込みで一巡する。

## 全体確認
- [x] T011 specs/007-cms-remaining-types/contracts/screens.md にFigma対応・PC操作・未確認事項を記録する。
- [x] T012 specs/002-cms-foundation/contracts/director-review-20261122.md とIssue/Projectへ結果と明日の説明・相談事項を反映する。

依存: T001→T002/T003→T004→各US→T011/T012。基盤後は種別固有表示を独立して確認できる。作業は逐次実施し、一種別の成功を他種別の完了と扱わない。

ローカル確認: Node 24でCMS全体23ファイル144件、配信スクリプト14件成功。追加のお知らせ11件によるページ送り・公開URL整合テストを含む種別テスト11件成功。実配信ランナーによるブログ・3種別の公開、履歴、復元、再編集、画像/PDF、301転送を確認。検証環境の公開と履歴生成を照合済み。本文・PDF閲覧・動画再生、履歴参照・復元・再編集保存・再読み込みは利用者確認済み。復元記録は各種別1回をDB照合。Figma日本語ラベル外観と監督本人の操作確認は残件。

レビュー修正（11/21）: メディア掲載の見出しが空欄の場合に掲載記事本文が非表示になる条件を修正。見出しなし本文を実配信統合テストへ追加。修正後Node 24でCMS23ファイル145件・配信処理14件・変換5件、型検査と変更公開コードのESLintに成功。今回の追加修正はローカル配信で確認し、検証サイトへの新しい公開操作では未確認。


11/22 #419単独受け入れ：[条件とデータ対応・欠損例](contracts/news-acceptance.md)を追加。既存API/実配信統合12件とお知らせPC操作E2E1件成功。Figma日本語「お知らせ」と1440px実装画面を確認。全件正式移行・他種別・共通機能・本人確認は各担当Issueで継続する。
