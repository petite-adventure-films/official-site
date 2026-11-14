# Tasks: イベントCMSの編集・公開・ゴミ箱

対象: #392、関連 #333 / #334 / #390 / #391 / #394 / #396 / #397。
入力: [イベント仕様](spec.md)、[イベント計画](plan.md)、[CMS共通仕様](../002-cms-foundation/spec.md)、両機能のdata-model・contracts・quickstart。
状態: 実装範囲・着手合意済み。進捗は各チェックボックスに記載する。共通基盤の実行タスクも本書に統合する。

実装順は①編集・保存・複製・プレビュー → ②公開・履歴 → ③ゴミ箱。US番号はイベントspec.mdに対応する。共通基盤US1（認証）は基礎、US2（保存・複製）はイベントUS1/5、US3（状態・プレビュー・履歴）はイベントUS2/3/6へ対応する。

利用者はテストを開発側に任せ、本人のPCでの操作確認は後日行う。本人確認待ちだけでは止めず、確認済みと誤記しない。実装方法は開発側で具体化し、未決定の公開・削除ルールや利用上の判断は必要時に確認する。本番導入のアカウント・契約・ホスト名は別途確定する。

パスは既存のものと、計画に従って作成する予定のものを含む。新設パスは実装済みを意味しない。機能別テストは実装前に失敗する条件を確認し、実装後に通す。

## Phase 1: Setup

- [x] T001 既存Astro・スキーマ・CI構成を確認し、CMSと公開サイトの接続点・開発コマンドを `specs/001-event-draft/plan.md` に具体化する。Node・ライブラリの採用版は既存lockfileと公式資料で確認する。
- [x] T002 React/Vite/TypeScript/TailwindとWorkerの開発構成を `cms/package.json`、`cms/vite.config.ts`、`cms/tsconfig.json`、`cms/wrangler.jsonc`、`cms/.env.example` に用意し、開発データを本番から分離する。
- [x] T003 Vitest・Worker/D1統合テスト・Playwrightのローカル起動と初期データを `cms/vitest.config.ts`、`cms/playwright.config.ts`、`cms/src/testing/fixtures.ts` に用意する。
- [x] T004 `scripts/e2e-scope.mjs` と `scripts/e2e-scope.test.mjs`、`lefthook.yml`、`.github/workflows/astro-e2e.yml` を拡張し、CMS変更時もpre-pushとCIで必要なE2Eを実行する。共有表示変更は公開側も検証し、HTMLレポート・失敗画像・traceを保存する。

## Phase 2: 基礎

- [x] T005 下書きの容量・文字数上限案、タグ参照、全入力フィールドの型を `specs/001-event-draft/data-model.md` と `specs/001-event-draft/contracts/api.md` で具体化する。「1リクエスト256KiB、タイトル200文字、説明欄各20,000文字」は現状案であり、根拠を確認して確定する。空欄・不正日付は保存可能のままとする。
- [x] T006 JWT検証・2人の許可リスト・期限切れ・既定ホスト迂回・Origin・Content-Typeの拒否を `cms/worker/auth.test.ts` に定義し、`cms/worker/auth.ts` と `cms/worker/index.ts` に実装する。開発認証はlocalhost限定で本番へ含めない。
- [x] T007 不変id、version、type、payloadSchemaVersion、payload、UTC時刻・操作者、操作IDの永続化を `cms/migrations/0001_content_drafts.sql` と `cms/worker/repositories/content-drafts.ts` に実装する。条件付き更新と操作ID＋認証主体の一意制約を設ける。
- [ ] T008 FigmaのCMSLayout・EditorLayout・Section・Field・ListLayout・ListRow・Pagination・StatusDialog・ModalBackdropを読み、対応部品を `cms/src/components/` と `cms/src/styles/tokens.css` に実装する。参照URLを先頭に記録し、共通spacing変数を使う。MUI外観とTailwindの役割を維持する。
- [x] T009 APIクライアント、認証セッション、エラー境界を `cms/src/lib/api-client.ts` と `cms/src/features/auth/` に実装する。ログインHTML・リダイレクトを保存成功と見なさず、秘密情報をログへ出さない。

## Phase 3: US1 — 作成・保存・再編集（段階①、P1）

独立確認: 許可ユーザーが新規作成→保存→一覧→再編集し、未認証者は取得できず、公開内容は変わらない。

- [x] T010 [US1] 新規・一覧URL、初回保存後の遷移、検索フィールド対応・安定した並び順・番号付きページ送りのAPIを `specs/002-cms-foundation/contracts/screens.md` と `specs/002-cms-foundation/contracts/api.md` へ具体化する。編集 `/cms/events/:id/edit` と履歴 `/cms/events/:id/history` は維持する。
- [ ] T011 [P] [US1] 空欄・途中入力・不正日付・終了日逆転の往復、形式違反・容量超過の拒否を `packages/content-schema/tests/event-draft.test.ts` に定義する。公開用event/v1を緩めない。
- [ ] T012 [P] [US1] 作成・取得・更新・検索・20件のページ送り・同時更新・再送を `cms/worker/content.test.ts` に定義する。タグ名のみの一致は検索結果に含めない。
- [x] T013 [US1] 全入力項目と複数日設定、任意・複数の映画タグ／イベントタグを `packages/content-schema/schemas/content/event-draft.schema.json` と `cms/src/features/events/draft.ts` に実装する。不正日付を入力文字列のまま保存し、非表示値も保持する。
- [x] T014 [US1] 種別登録、作成・取得・条件付き更新・一覧検索APIを `cms/worker/routes/contents.ts` と `cms/worker/repositories/content-drafts.ts` に実装する。作成日時降順・1ページ20件、保存で公開処理を呼ばず、失敗時は直前の保存内容を保持する。
- [x] T015 [US1] タグ取得経路と参照検証を `cms/worker/routes/tags.ts` と `cms/src/lib/api-client.ts` に実装する。参照不明タグを黙って落とさない。
- [x] T016 [US1] 入力フォーム・新規／編集ルートを `cms/src/features/events/components/EventForm.tsx` と `cms/src/app/routes.tsx` に接続する。空画面を開くだけでは下書きを作らず、新規時の開催形式はオフラインを選択する。
- [x] T017 [US1] 検索・一覧・ページ送りを `cms/src/features/content/components/ContentList.tsx` に実装する。Enterで検索、IME確定では検索しない、空欄Enterで解除、適用時は先頭ページ。タイトル・映画タグ・イベントタグ・公開状態の見出しと表示列を持ち、タグ絞り込みは設けない。
- [ ] T018 [US1] 長いタイトルの1行省略、タグ列維持、一覧だけの横スクロールを `cms/src/features/content/components/ContentList.tsx` に実装する。狭い幅で最小幅を確認しFigma正本と `specs/001-event-draft/contracts/screens.md` に記録する。
- [ ] T019 [US1] `cms/e2e/draft.spec.ts` と `cms/e2e/list.spec.ts` で保存・再表示・検索・解除・ページ送り・狭い幅・アクセス拒否を検証し、段階①の最初の通過点を記録する。

## Phase 4: US2 — 自動保存と失敗回復（段階①、P1）

独立確認: 遅延・通信失敗・競合・認証失効を再現し、入力が残り保存成功を誤表示しない。

- [ ] T020 [US2] 入力停止1秒、保存ボタン、追加入力・遅延応答・応答喪失・409・認証失効の状態遷移を `cms/src/features/content/hooks/useDraftSave.test.ts` に定義する。
- [x] T021 [US2] 保存要求の直列化、操作ID再送、入力世代別の状態管理を `cms/src/features/content/hooks/useDraftSave.ts` に実装する。項目の不正と保存成否を分離する。
- [ ] T022 [US2] 保存状態・再試行・競合・再認証・離脱警告を `cms/src/features/content/components/SaveStatus.tsx` と `cms/src/features/content/hooks/useUnsavedChanges.ts` に実装する。最新入力まで保存成功するまで警告を解除せず、端末内復旧バックアップは設けない。残る状態のFigmaと `specs/002-cms-foundation/contracts/screens.md` を揃える。
- [ ] T023 [US2] `cms/e2e/save-recovery.spec.ts` で自動保存・手動保存・複数タブ競合・離脱取消・再読込を検証する。保存前の強制終了からの復旧は保証しない。

## Phase 5: US3 — 未保存内容のプレビュー（表示実装は後続、P1）

独立確認: 未保存・保存失敗の入力を表示し、編集へ戻って内容・スクロール・フォーカスを維持する。

現在は編集操作行に非活性のプレビューボタンを配置するところまで。以下は後続実装とし、この段階では完了にしない。

- [ ] T024 [US3] 表示モデルのテストを `packages/event-presentation/src/event-preview.test.ts` に定義する。空欄・不正日付の無補正、非表示値除外、改行保持、HTML無効化、安全なhttp/httpsリンクを確認する。
- [ ] T025 [US3] 表示モデルと本文レンダラーを `packages/event-presentation/src/event-preview.ts` と `packages/event-presentation/src/EventBody.tsx` に実装する。既存HTMLを上書きせず、公開側との共有境界を `specs/001-event-draft/plan.md` に記録する。
- [ ] T026 [US3] 公開ページと同じレイアウト・見た目のプレビューを別タブで開く。URL・未保存データの受け渡し・認証方式を先に設計し、公開ページとの共有方法と代表状態を確認してから実装する。
- [ ] T027 [US3] `cms/e2e/preview.spec.ts` で未保存表示・保存失敗中の表示・編集復帰・公開への副作用なしを検証する。

## Phase 6: US4 — 複数日・オンライン・併催（段階①、P1）

独立確認: 年越しの連続期間、オンラインのみ、併催で保存・再編集・プレビューが一致する。

- [ ] T028 [US4] `cms/src/features/events/components/EventForm.test.tsx` に設定切り替え・非表示値保持・開催形式の全解除・任意複数タグの条件を定義する。
- [x] T029 [US4] `cms/src/features/events/components/EventForm.tsx` に単日／複数日、会場情報の表示切り替え、延期／中止の単一選択・解除を実装する。非表示値は下書きに保存し、再有効化で戻す。下書きでは開催形式を全解除できる。
- [ ] T030 [US4] `cms/e2e/event-formats.spec.ts` で年越し・オンライン・併催・全解除と保存後の再表示を検証する。シリーズの飛び日は別記事として扱い、日付を補わない。

## Phase 7: US5 — 複製（段階①、P1）

独立確認: 日時・会場・状態・タグを引き継ぐ別の下書きを作り、元記事は変わらない。

- [x] T031 [US5] 複製の未保存入力・競合・再送・他記事影響なしを `cms/worker/duplicate.test.ts` に定義し、`cms/worker/routes/duplicate.ts` に実装する。識別子・公開状態・公開日時・公開履歴は引き継がない。
- [x] T032 [US5] 保存完了後の複製導線を `cms/src/features/content/components/DuplicateAction.tsx` に実装し、`cms/e2e/duplicate.spec.ts` で成功・保存失敗・再送を検証する。配置は `specs/002-cms-foundation/contracts/screens.md` とFigmaに反映する。

段階①の完了条件: US1〜5のテストが通る。未接続の公開・履歴・ゴミ箱ボタンを利用可能な機能として出さない。今回全体の完了ではない。

## Phase 8: US6 — 公開・公開停止・履歴復元（段階②、P1）

独立確認: テスト配信先で公開／停止、履歴生成、過去版の下書き復元を一巡する。

- [ ] T033 [US6] 既存の公開データ・デプロイ経路を読み、公開API、成功確定点、非同期配信失敗・再送、公開停止、公開用必須項目、下書きと公開版の関係を `specs/002-cms-foundation/contracts/api.md`、`specs/002-cms-foundation/data-model.md`、`specs/001-event-draft/plan.md` に設計する。配信成功とDB更新を根拠なく単一トランザクションと扱わない。公開・削除ルールに新判断があれば確認してからT034以降へ進む。
T033の現状: [公開接続の設計案](../002-cms-foundation/contracts/publication.md) を作成。必須項目は利用者確認済み。slug方針は合意済み。公開サイトの配信先は未決定で、[配信環境調査](../002-cms-foundation/contracts/deployment-environments.md)と残る配備運用の確認待ちで未完了。

- [ ] T034 [US6] 公開成功・失敗・再送・競合・停止、同内容連続公開、4件目の整理を `cms/worker/publication.test.ts` に定義する。公開失敗は履歴を作らず、現在公開中の版を含む直近3件・期限なしを検証する。
- [ ] T035 [US6] 公開版・履歴・保護枠・処理記録を `cms/migrations/0004_publication_history.sql`・`cms/migrations/0005_restore.sql` と `cms/worker/services/publication.ts` に実装する。公開要求だけが配信に接続し、保存・複製・復元は公開を起動しない。
- [ ] T036 [US6] T033の接続設計に従って `cms/worker/adapters/publication.ts` と `cms/worker/routes/publication.ts` を実装する。公開用検証は開催形式1つ以上必須、非表示値を除外し、不正時に現在の公開内容を変更しない。公開側の必要な変更先はT033で実在経路に確定する。
- [x] T037 [US6] 復元の原子的更新・保護1件の入れ替え・再送・競合・スキーマ互換性・他記事拒否を `cms/worker/services/restore.test.ts`・`cms/worker/history.test.ts` に定義し、`cms/worker/routes/history.ts` と `cms/worker/services/restore.ts` に実装する。保護した下書きを戻すときも交換し、失敗時は両方を維持する。
- [ ] T038 [US6] 公開／停止の確認ダイアログと履歴画面を `cms/src/features/content/components/PublicationActions.tsx` と `cms/src/features/content/components/HistoryView.tsx` に実装する。編集中1件＋公開済最大3件、0件時の非活性と直接URLの編集への置き換え、取得失敗時の再試行、復元成功後の編集復帰を守る。
- [ ] T039 [US6] `cms/e2e/publication-history.spec.ts` で確認ダイアログ、テスト配信、履歴4件目、反復復元、0件・エラー・直接アクセスを検証する。配信をモックしたテストだけでは公開接続確認済みとしない。

## Phase 9: US7 — ゴミ箱・復元・期限削除（段階③、P1）

独立確認: 公開記事の移動で公開停止、30日以内の復元で下書き、期限後の完全削除を再現する。

- [ ] T040 [US7] ゴミ箱一覧とAPI、移動時の公開停止失敗、30日境界・実行時刻・再試行、復元と削除の競合、履歴・保護枠・共有タグ等の関連データ境界を `specs/002-cms-foundation/contracts/api.md` と `specs/002-cms-foundation/data-model.md` に設計する。未合意の削除対象を自動で広げず、判断が必要なら確認する。
- [ ] T041 [US7] 移動・復元・公開停止失敗・再送・期限境界・競合・他記事保持を `cms/worker/trash.test.ts` に定義する。時刻を制御して30日を検証し、実時間の待機や本番データを使わない。
- [ ] T042 [US7] ゴミ箱状態・削除期限を `cms/migrations/0008_trash.sql` に追加し、`cms/worker/services/trash.ts` と `cms/worker/routes/trash.ts` に移動・復元を実装する。元の種別へ下書きとして戻し、再公開しない。
- [ ] T043 [US7] 定期削除と再試行可能な処理記録を `cms/worker/jobs/purge-trash.ts` と `cms/wrangler.jsonc` に実装する。T040の関連データ範囲を守り、二重実行・部分失敗・復元との競合を安全に処理する。
- [ ] T044 [US7] 共通一覧の通常／ゴミ箱切り替えと移動・復元導線を `cms/src/features/content/components/TrashActions.tsx` と `cms/src/features/content/components/ContentList.tsx` に実装する。削除した人・日時を見出しで区別し、復元後もゴミ箱一覧に留まる。Figmaと `specs/002-cms-foundation/contracts/screens.md` を揃える。
- [ ] T045 [US7] `cms/e2e/trash.spec.ts` で移動確認・キャンセル・公開停止・復元後非公開・期限経過後の取得不可を検証する。

## Phase 10: 横断検証と引き継ぎ

- [ ] T046 `cms/e2e/accessibility.spec.ts` にキーボード主経路、ダイアログの初期／復帰フォーカス・Escape・背景操作抑止、表見出し、保存通知、自動アクセシビリティ検査を追加する。`specs/001-event-draft/verification.md` に自動／手動／本人確認の結果と未確認事項を分けて記録する。
- [ ] T047 開発用DBのエクスポート・別DBへの復元を `cms/scripts/backup.mjs`、`cms/scripts/restore.mjs` に実装してテストし、`specs/002-cms-foundation/quickstart.md` に実行手順を記録する。本番バックアップ先・保持期間・失敗検知・復旧責任は導入前に確認する。
- [ ] T048 両機能のquickstartに従いVitest・Worker/D1・Playwrightと必要な公開側回帰を実行し、`specs/001-event-draft/verification.md` にコマンド・結果・成果物を記録する。本人の操作確認は後日欄へ残し、テスト成功と混同しない。
- [ ] T049 `specs/001-event-draft/checklists/requirements.md`、`specs/002-cms-foundation/checklists/requirements.md`、両機能のspec/plan/contractsを実装と照合する。公開・削除契約の未決、配信接続未確認、品質未確認を残したまま全体完了としない。

## 依存順と分担可能箇所

順序: Setup → 基礎 → US1 → US2 → US3 → US4 → US5 → US6 → US7 → 横断検証。
US4の入力状態はT013でデータモデルに含め、T029で切り替えを完成させる。US6はT033、US7はT040の設計完了が各後続タスクの前提。段階①はこれらの未決だけで止めない。

分担可能な例（依存を満たした場合のみ。自動で別エージェントは起動しない）:

- US1: T011とT012は別のテストファイルで並行可能。
- US2: T021の状態機械とT022の表示は契約を共有した後に分担可能。E2Eは統合後。
- US3: T025の表示モデルとT026の画面枠はインターフェース確定後に分担可能。
- US4: フォーム修正T029とテスト実行T030は同じ動作に依存するため順次。
- US5: APIと導線はT031の契約確定後に分担可能。再送テストは統合後。
- US6: T036の公開接続とT037の履歴復元はT033/T035完了後に分担可能。
- US7: T043の期限処理とT044の画面はT040/T042完了後に分担可能。

最初の検証可能な区切りはUS1。実用の編集段階はUS1〜5まで、今回の納品対象はUS7まで。段階ごとにテストが通った結果を報告し、本番公開・外部契約変更・未合意のデータ削除は実装着手の合意から推測しない。

## 追加合意: slugと公開時必須表示

- [x] T048 タイトル・開催日・開催形式、条件に応じて終了日・会場名に公開時必須を表示する。空欄の下書き保存は継続する。
- [x] T049 slugを任意の下書き項目として保存・再編集する。初期値は記事ID、タイトル変更では不変、複製時は新ID。予定URLと入力途中の案内を表示し、旧下書き互換を検証する。
- [ ] T050 公開処理とともにslugの一意性・既存URL予約・変更時の旧URL転送・canonical・サイトマップ・内部リンクを実装する。公開後の変更案内を共通UIへ反映し、衝突・反復変更・停止・配信失敗をテストする。

## 配信先に依存しない公開データ準備

- [x] T051 `cms/worker/event-publication.ts` に公開候補の検証・生成を実装し、`event-publication/v1` の専用スキーマを定義する。必須・日付・slug形式・地図URL・タグ参照・非表示項目除外・下書き不変性をテストする。公開API・Astro生成・配備はこのタスクの対象外。
- [ ] T052 公開APIにT051を接続し、最新タグ・slugの所有権と予約・公開管理世代の競合を検証する。公開ボタンから項目別エラーを表示し、既存の公開内容を保持する。T033の未決事項を解決してから配信に接続する。

- [x] T053 配信しない公開前チェックAPIと画面操作を実装し、保存完了待ち・項目別エラー・フォーカス・編集時の結果解除・失敗後の再試行・DB無変更を検証する。T052の実公開・URL予約は未完了のままとする。

- [x] T054 配信先に接続しない内部処理として、固定公開候補・操作再送・配信attempt・結果照合・成功時の原子的な履歴確定と最新3件保持を実装する。テスト用配信処理で成功・失敗・再試行・DB失敗・競合・過去内容再公開を検証する。T034〜T039の実配信・公開停止・復元・画面は未完了のままとする。

- [x] T055 公開履歴と復元前保護枠を内部サービスで取得・復元する。復元前下書きの保護、保護枠との交換、原子的な更新、再送・同時操作・他記事・削除済み履歴・スキーマ互換性・DB失敗を検証する。APIと履歴画面への接続はT037/T038に残す。保護枠は追加migration `0005_restore.sql` とし、後続ゴミ箱migrationは `0008_trash.sql` とする。

- [x] T056 履歴取得・復元APIと履歴画面を接続し、保存完了待ち、0件の非活性／URL置換、取得失敗、キーボード選択、復元成功後の編集復帰、競合、応答喪失の同一要求再試行を検証する。表示名は認証済みの情報から保持する。実配信は未接続のため、ブラウザー検証の履歴は一時DB専用のfixtureを使用する。

- [x] T057 イベントのURL所有権・公開成功時の現行URL更新・過去URLからの直接転送計画を内部公開処理へ接続する。既知WordPressイベント234件とarchiveを予約し、同時要求・失敗・再試行・不明結果・履歴3件整理後の所有権・DB確定失敗を検証する。実配信の転送設定、公開APIの項目エラー、公開停止、最新本番URLの棚卸しはT050/T052に残す。追加migrationは `0007_publication_urls.sql`、後続ゴミ箱は `0008_trash.sql`。

- [x] T058 公開前チェックにURL所有権検査を接続し、重複をslugの項目エラーとして表示する。必須項目不足との同時表示、他記事・旧サイトのURL拒否、自記事の過去URL許可、入力と下書きの保持、検査失敗の区別、編集後の再チェックを検証する。チェックはURLを予約せず、実公開時の再検査は維持する。
