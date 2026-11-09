# Implementation Plan: CMS編集基盤

**Branch**: `feat/issue-392-event-draft` | **Date**: 2026-11-08 | **Spec**: [spec.md](spec.md)
**対象Issue**: #392、関連 #333 / #396 / #397
**状態**: 設計レビュー中。最初の実装・統合検証はイベント編集と一緒に行う。

## Summary

Cloudflare Accessの2メールアドレス限定認証、CMS専用Worker、D1による保存を使用する構成。保存・複製・履歴・復元は共通処理とし、種別固有の空データ・検証・入力フォーム・一覧要約・プレビューをアプリの組み立て箇所で接続する。

## Technical Context

- Language/Version: TypeScript、Node 24。
- Primary Dependencies: React、Vite、Tailwind、Workers。選定理由は [research.md](research.md)。
- Storage: D1。保存・再送・履歴の原子的更新は [data-model.md](data-model.md)。
- Testing: Vitest、Worker/D1統合テスト、Playwright。cms/の変更を共通E2E判定へ追加する。
- Target Platform: ブラウザとCloudflare Workers。公開サイトとは別アプリ。
- Performance Goals: 保存待ちでも編集・プレビュー可能。自動保存は入力停止1秒後の案。
- Constraints: 2人・同権限、下書きは非公開、WCAG 2.2 AAを評価。外部設定は導入時に確認する。
- Scale/Scope: イベントを最初の種別とする。使わない種別・拡張機構を先に実装しない。

## Constitution Check

- 保存・公開の分離、入力と履歴の保全、復元検証を契約化する。
- 原則・品質基準は既存の正本を参照し、Figma部品から画面を構成する。
- 技術構成は確認済み。費用・契約条件・バックアップ先・保持条件は本番導入前に確認する。
- 画面設計と操作・品質確認が残っているため、実装完了とは扱わない。

## Project Structure

```text
cms/
  src/
    app/                     # routes/providers、機能を組み合わせる箇所
    features/
      auth/                  # セッション、ログイン状態
      content/               # 一覧・保存・複製・履歴・復元の業務操作
      events/                # イベントの入力項目と表示
    components/              # 汎用のボタン・入力欄など
    hooks/                   # 種別にも業務にも依存しない共通フック
    lib/                     # APIクライアント等
    config/
    types/
    testing/
  worker/                    # サーバー専用。認証、API、保存、種別検証
  migrations/
  e2e/
packages/content-schema/     # 検証契約
packages/event-presentation/ # 公開側と共有するイベント表示
```

フロントエンドの配置・依存方向は [Bulletproof ReactのProject Structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md) を参考基準とする。`app` が各featureと共通部品を組み合わせる。feature間を直接importせず、featureは汎用の共通層を利用する。共通層からfeatureやappをimportしない。各feature内は必要なapi/components/hooks/types等だけを作る。

`features/content` と `features/events` はappで接続する。例えば共通の編集枠へイベントフォームとプレビューを渡す。汎用componentsに業務ロジックを集めない。

Bulletproof Reactはサーバー構成や仕様フォルダーの規則ではない。worker/は実行環境の境界であり、フロントエンド用モジュールからサーバー秘密情報をimportできない構成にする。

## 契約と検証

[API](contracts/api.md)、[画面操作](contracts/screens.md)、[検証手順](quickstart.md)を参照。種別は固定の登録一覧で検証し、最初はeventだけを登録する。履歴のpayloadSchemaVersionを確認してから復元する。

## Complexity Tracking

原則違反に伴う例外なし。標準の参考構成から必要なフォルダーだけを採用する。履歴保持方針とFigma画面確認後に作業分解を行う。
