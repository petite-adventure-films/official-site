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

## US3（P2）ブログ下書きを複製する

2026-11-16、続行依頼に基づき既存共通複製をブログへ接続。保存中の変更をflushし、本文/分類を保ち、新ID・新slugの独立した下書きとして開く。公開・旧記事取り込みは引き続き対象外。

- [X] T010 [US3] cms/src/features/content/components/DuplicateAction.tsx と cms/src/features/blog/components/BlogEditor.tsx をブログ経路に対応し、cms/worker/app.ts の複製制限を解除する。
- [X] T011 [US3] cms/worker/blog-draft.test.ts と cms/e2e/blog.spec.ts で本文保持・slugリセット・原本独立・同一要求再送・保存失敗時の停止を確認する。

T009→T010→T011。既存の原子的複製triggerを再利用し、新たなDB変更は行わない。

## US4（P2）画像・PDFを登録して本文へ挿入する

利用者の続行指示による #395 との接続。[登録契約](contracts/media-upload.md)に従う。

- [X] T012 メディア登録台帳・一時アップロード・実体検証・確定・取得・一覧APIを追加する。
- [X] T013 本文schemaと保存APIに確定asset参照検証を追加する。
- [X] T014 画像/PDFの選択・登録とTiptap挿入を接続する。
- [X] T015 API・E2E・実画面で保存/再編集/複製と失敗時の保持を検証し結果を記録する。

T012→T013→T014→T015。Astro接続後にプレビューを扱う。

US4の自動検証と代表画面確認は[結果](verification/cms-media/README.md)を参照。利用者レビュー、本番R2、Figmaメディア代表状態の一致、実運用ファイルの操作レビューは残り、#395全体の完了とはしない。

## #418受け入れ照合（2026-11-22）

公開一覧/分類の接続漏れ、初期URLの公開失敗、公開時カテゴリ必須の検査漏れを修正。[今回の確認と残条件](contracts/acceptance-20261122.md)を参照。ブログ固有の実装・基本操作への接続は完了。環境適用#336、移行/再編集#338、表示照合#394、IME#334、共通機能#433〜#435/#395へ完了責任を一本化し、#418を同条件で保留しない。

## 旧ブログの公開日・URL（2026-11-22、#418）

- 旧ID/日付/slugの不変台帳と原子的な所有権登録を追加。公開manifestとAstroの置換へ接続し、代表18043/18053で再編集・再公開・復元・転送と画像実体をローカル検証。
- [契約と適用順](contracts/legacy-publication.md)。稼働D1へのmigration/Worker配備・正式取込・検証CMS画面・OS IMEは未実施。既存の代表コピーは変更していない。

## #334 改行候補の保持（2026-11-22）

利用者の続行指示に基づく単位。最新version-4から分岐し同ブランチへPR。既存本文契約のwordBreakを正式CMSへ接続する。チェックリストディレクトリ・拡張hookなし。

- [X] T016 保存schema、Tiptap、公開レンダラーと#338変換器にwordBreakを接続し、位置・数を保持する。未知属性・強制改行化を許さない。
- [X] T017 単体・保存API・ブラウザーで追記/再読込/複製と幅による折返しを検証し、全件事前照合を再実行する。
- [X] T018 結果と未確認事項を記録し、Issueを更新してPRへまとめる。

新しい操作ボタン・動画・旧書式全般・本番適用はこの単位に含めない。

## #334 旧動画埋め込みの保持（2026-11-22）

利用者の続行指示に基づく単位。既存の動画保持契約を正式CMSへ接続する。`codex/issue-334-external-video`、分岐元/統合先version-4。

- [X] T019 許可ホスト/ID/パラメーターの共通検証器、保存schema・CMSノード・公開rendererを接続する。
- [X] T020 #338変換器へ接続し、動画の属性と本文内の順序を照合する。不正な埋め込みや他の未対応内容は停止する。
- [X] T021 API保存/複製/公開候補・実ブラウザーの保持を検証し、全件再照合、Issue更新、レビュー用PRまでまとめる。

新規動画挿入UI、任意iframe、画像/添付移行、稼働環境の更新は含めない。
