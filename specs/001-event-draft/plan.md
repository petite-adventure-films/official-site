# Implementation Plan: イベント下書きCMS

**Branch**: `feat/issue-392-event-draft` | **Date**: 2026-11-08 | **Spec**: [spec.md](spec.md)
**対象**: #392、関連 #396（スキーマ）・#397（保存）・#394（公開表示）
**状態**: 編集→公開・履歴→ゴミ箱の3段階で実装着手合意済み。[tasks.md](tasks.md) を実行タスクの正本とする。

## Summary

イベントを最初の対応種別として、[CMS共通基盤](../002-cms-foundation/spec.md)を実装する。認証・新規作成・保存・複製・履歴・復元・保存状態と別タブの公開ページプレビューの操作は共通化し、イベントは入力項目・検証・表示モデルを提供する。

## Technical Context

- Language/Version: TypeScript、Node 24（開発・CI）。既存Astro 7、React 19、Tailwind 4を再利用する設計。
- Primary Dependencies: CMSはReact + Vite + TailwindのUIとWorker API。JWT検証は標準ライブラリ候補jose、実装時に対応バージョンを固定する。
- Storage: 確認済みのD1を使用。保存処理はContentDraftRepository境界とし、業務ロジックとSQLを分ける。
- Testing: Vitest、ローカルWorker/D1統合テスト、Playwright。既存のE2E判定にcms/と共有レンダラーを追加する。
- Target Platform: ブラウザ、Cloudflare Workers。開発用データと本番データを分離。
- Project Type: 公開サイトと独立した管理用Webアプリ。
- Performance Goals: 入力が止まって1秒後に自動保存。保存要求は1件ずつ送信し、応答待ちの追加入力は次回へまとめる。保存遅延中も編集・プレビューを継続できる。
- Constraints: 保存・複製・プレビューから公開ビルドを起動しない。WCAG 2.2 AAを評価する。
- Scale/Scope: 利用者2人、イベントのみ。再編集・複製元を選ぶ最小の一覧、編集、別タブの公開ページプレビューを対象とする。

## Constitution Check

| 条件 | 設計時の判定 |
| --- | --- |
| 監督の入力・運用負担 | 複製、入力途中の保存、保存結果の表示で対応。本人の操作確認は実装後 |
| 文脈・記録の保持 | HTML移行と公開は別契約。既存公開データを下書き用形式へ上書きしない |
| 費用・データの採用判断 | Access/D1構成は確認済み。契約条件・バックアップ先は導入前に確認 |
| 共通デザインシステム | 共通Layout・Section・Fieldと代表画面は作成済み。状態別の確認範囲は画面契約に記載 |
| 保存・復旧 | 競合検知、再試行、エクスポートと別DBへの復元確認を含める |
| 品質 | 公開と下書きの分離、未保存プレビュー、認証失効の検証を定義 |

認証・保存構成と主要画面は確認済み。残る仕様判断・設計作業・本番導入条件は [共通計画](../002-cms-foundation/plan.md#残る確認事項) に区別して整理する。3段階の実装着手は合意済み。未決事項は各段階の設計タスクで具体化する。

## Project Structure

```text
specs/002-cms-foundation/             # 共通設計の参照先
specs/001-event-draft/
  spec.md / plan.md / research.md / data-model.md / quickstart.md
  contracts/api.md / contracts/screens.md
cms/src/features/events/     # 入力項目・種別固有の表示
packages/content-schema/     # イベント下書き検証
packages/event-presentation/ # 公開側と共有する表示
astro/                       # 公開表示への接続は#394で照合
```

CMS全体の配置と依存方向は [基盤の実装計画](../002-cms-foundation/plan.md) を参照する。

公開用スキーマを緩めず、入力途中を扱う下書きスキーマを追加する。共有表示はイベントの本文に限定し、公開側のヘッダー・メタ情報はAstroに残す。

## 設計レビュー項目

1. 導入条件: 確認済みのAccessメールコード + D1構成について、利用アカウント・ドメイン・費用・復旧手段を本番導入前に確認。
2. 操作案: 自動保存 + 保存ボタン。複製はCMS共通の操作として設計し、日時・開催状態を含む入力内容をそのまま新しい下書きへコピーする。最初の対応種別はイベント。
3. Figma: 編集・一覧・履歴・ダイアログは作成済み。保存失敗・競合・再認証など残る状態の設計と確認を行う。
4. 履歴: 作成契機と公開履歴の保持方針はCMS共通データ設計で合意済み。スナップショット保存・復元の実装負担と容量を評価し、合意済みの復元前保護・反復復元時の扱いに沿って設計する。
5. 運用: セッション失効・復旧、バックアップ保存先と保持期間。本番利用前に復元を実証する。

## 公開一覧との境界

### 実在する接続点と開発環境

公開サイトは `astro/src/lib/wp-api.ts` が `astro/data/wordpress-export.json` を読み、`astro/src/pages/events/[id].astro` が静的ページを生成する。既存本文にはHTMLがあり、新規CMSのプレーンテキスト保存とは分離する。`astro/wrangler.jsonc` は静的成果物の配信設定。既存のmain/develop向けワークフローは `html/` のNuxt生成・FTP配信であり、CMS用の公開接続として流用しない。段階②のT033で新規公開データの取込・配信成功の確定点を設計する。

CMSは独立した `cms/package.json` とlockfileを持つ。Node 24、pnpm 10.28.2を使い、React 19.2.7、Vite 8.1.3、Tailwind 4.3.2、Vitest 4.1.10、Playwright 1.65.0、Wrangler 4.107.1は既存Astroのlockfileに合わせて固定した。署名検証はjose 6.2.17。ローカルコマンドは [quickstart](quickstart.md) を参照する。

参照した公式資料: [Viteの実行環境](https://vite.dev/guide/)、[MiniflareのD1テスト](https://developers.cloudflare.com/workers/testing/miniflare/storage/d1/)、[静的アセットより先にWorkerを実行する設定](https://developers.cloudflare.com/workers/static-assets/binding/)、[Accessトークン検証](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/application-token/)。本番は全アセットを含めWorkerの認証を先に通し、既定WorkerホストとプレビューURLを無効化する。実アカウントへの配備確認は未実施。

`scripts/e2e-scope.mjs` はCMS変更時にCMS、Astro変更時にAstro、共有packages・テスト実行基盤変更時に両方のテストを選ぶ。pre-pushとCIはこの判定を共有する。

#394で、開催中の期間は今日を並び替えの基準日として扱い、予定イベントは開始日の順とする案。年月タブには期間が交差する月の告知を載せる。「今日」はAsia/Tokyoで統一する案。静的出力では日付変更後の更新が必要なので、公開時の定期再ビルド方式と失敗検知を#390で評価する。#392の保存処理に公開処理を混ぜない。

延期・中止は元の開催日と状態を保持して表示する案。延期日未定や最新一覧の掲載期限は公開表示のレビュー事項。今回の設計では削除・非表示へ自動変換しない。

プレビューは今回、編集画面の非活性ボタンによる動線の確保までとする。本文レンダラー・表示モデル・別タブへのデータ受け渡しは後続実装とし、公開ページと見た目を共有する方式を先に設計する。
