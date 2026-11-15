# ブログCMSの設計調査

対象 #418。2026-11-16、`version-4` の `6bb55832` とFigma共通定義を確認。以下は設計案。

## 保存・一覧は種別対応に拡張

選択案: 保存・再送・競合検出を共有し、種別別の検証・一覧条件を渡す。
根拠: `useDraftSave.ts` のPOSTと保存後URL、`ContentList.tsx`、`HistoryEntry.tsx`、`HistoryView.tsx`、`DuplicateAction.tsx`、`SlugField.tsx`にevent固定が残る。`ContentDraftRepository.list` はtypeで絞らずイベント欄を検索する。
比較: ブログ専用コピーは再送・競合修正の二重保守になる。UIだけの追加では混在データの件数が誤る。

## 下書きと公開スキーマを分離

選択案: 未分類・空欄を保存する下書き形式を別に追加する。
根拠: `schemas/content/blog.schema.json` はtitle/slug/body/categoryId等が必須。映画はfilmIdsで、現行CMSのfilmTagIdsとの対応が必要。イベントタグは未定義。
比較: 公開用blog/v1を緩めると既存公開データ検査の意味が変わる。

## 追加migrationでD1を拡張

選択案: 既存データ・操作結果・履歴を保持する追加migrationで制約とトリガーを更新。
根拠: `0001_content_drafts.sql` のCHECKと `0003_duplicate.sql` のINSERTはevent固定。作成操作fingerprintにもtypeを追加する必要がある。
比較: 初期migration編集だけでは稼働D1が変わらず、別DBは認証・履歴・保全の運用を増やす。

## URL所有権と日時の分離

選択案: 公開パス単位で所有権を管理し、記事公開日と公開操作日時を別に保持。
根拠: `publication-urls.ts` は/events/専用。`publication-export.ts` の現在の履歴公開時刻を転用するとブログの元公開日が変わる。
比較: prefixを外すだけでは固定ページや転送元との衝突を防げない。更新ごとに公開日を変える案は要件に反する。

## 本文は採用未確定

GitHub #334を確認し、WordPress由来HTMLを保持して基本編集・貼り付けサニタイズ・内部リンク・メディア挿入を扱うこと、方式は比較して決めることを確認した。#395は新規画像/PDFの登録・選択・代替テキスト・本文挿入を対象とする。構造化編集を検討する場合もHTML互換性の検証を省略しない。

`rich-text.schema.json` はTiptap形式のdoc、リンク、assetImage、YouTube等を定義するが、CMS依存に本文エディターはなく、編集UIも未接続。attrsは汎用objectであり、schema適合だけでは安全なURLや表示を保証しない。

既存形式を使う構造化編集と、旧HTMLを保つ編集/移行経路を比較する。#334・#391で往復変換・未対応ノードの保全を検証して決める。本文形式・ツールバー・空本文の公開可否・容量上限・検索用テキスト抽出は未決定。未決事項を解消済みとは扱わず設計ゲートに残す。

## 共通文書と実装の差分

`002-cms-foundation/contracts/api.md` の公開部分には未実装という説明が残るが、コードには `/api/contents/:id/publication` のGET/POSTとローカル配信アダプターがある。本設計は現行コードを接続点にし、文書の/publish案を別APIとして増やさない。ブログのCloudflare公開が成立する根拠にはしない。共通公開文書の整合は #390・#413と確認する。

## Figma

共通node・Slot・代表イベント画面からの参照・cms/*変数をMCPで確認。[画面契約](contracts/screens.md)に記録した。ブログ画面の外観・構造・操作は未確認。
