# Implementation Plan: CMS残る3種別

**Branch**: `codex/issue-445-director-review-preparation` | **Date**: 2026-11-21 | **Spec**: [spec.md](spec.md)
統合先version-4。#419/#420/#421/#445。

## Summary

既存の保存・複製・公開・履歴・復元を種別対応へ拡張する。イベント・ブログの形式と再試行識別は維持する。新種別は news / pressCoverage / video。公開表示は利用者確認済みの既存形式を引き継ぎ、お知らせは一覧内の本文、メディア掲載・チャンネルは個別ページとする。

## Technical Context

TypeScript / React / MUI / Tailwind / Worker / D1 / R2 / Astro。既存依存を使用。Vitest・SQLite/D1 migration・配信スクリプトテストと検証画面で確認。対象はPC管理画面、代表例各1件。全件移行と部分配信は対象外。

## Constitution Check

原文と添付を別途保全、検証コピーで実施、既存の共通部品を再利用、未確認を完了扱いにしない。本番は変更しない。公開表示・画面確認は最終ゲートとして残す。

## Project Structure

- cms/src/features/articles/: 残る種別の入力モデルと編集項目
- cms/worker/article-draft.ts: 種別別検証
- cms/worker/services/: 共通の公開・参照・復元・manifest
- cms/migrations/: CHECK拡張と既存データ保持
- astro/src/lib/ / pages/: 公開データ読取と既存表示への接続
- cms/scripts/prepare-director-samples.py: 保全コピー生成

新しい公開方式は追加せず常設検証配信を利用する。push前に本番の非本番ブランチ自動ビルド対象を確認する。
