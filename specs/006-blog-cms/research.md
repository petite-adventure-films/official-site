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

Tiptapを第一候補として具体化する方針は利用者合意済み。[旧ブログ310件の互換性検証](tiptap-compatibility.md)で、本文文字列・画像参照・PDFリンクの保持と、旧動画の取り込み規則・PAF保存スキーマへの対応の必要性を確認した。標準構成のままの採用ではなく、取り込み/保存変換を含める案とする。

GitHub #334を確認し、WordPress由来HTMLを保持して基本編集・貼り付けサニタイズ・内部リンク・メディア挿入を扱うこと、方式は比較して決めることを確認した。#395は新規画像/PDFの登録・選択・代替テキスト・本文挿入を対象とする。構造化編集を検討する場合もHTML互換性の検証を省略しない。

`rich-text.schema.json` はTiptap形式のdoc、リンク、assetImage、YouTube等を定義するが、CMS依存に本文エディターはなく、編集UIも未接続。attrsは汎用objectであり、schema適合だけでは安全なURLや表示を保証しない。

具体案は[本文契約](contracts/body.md)に集約した。v2のPAF用ノード、原本保全と確認待ち記事、ツールバー、空本文の扱い、容量、検索用テキストを定義。旧動画151個を専用ノードで往復保持する試作は確認済み。正式スキーマと全本文要素の変換、画面操作、公開接続の検証は残る。

## 共通文書と実装の差分

`002-cms-foundation/contracts/api.md` の公開部分には未実装という説明が残るが、コードには `/api/contents/:id/publication` のGET/POSTとローカル配信アダプターがある。本設計は現行コードを接続点にし、文書の/publish案を別APIとして増やさない。ブログのCloudflare公開が成立する根拠にはしない。共通公開文書の整合は #390・#413と確認する。

## Figma

共通node・Slot・代表イベント画面からの参照・cms/*変数をMCPで確認。本文部品と代表ブログ画面を作成し、通常状態の外観・構造を検査した。[画面契約](contracts/screens.md)にnodeと結果を記録。利用者レビュー・実際の操作は未確認。


## 保存・公開形式の設計検証

- 方針案: 編集本文・不変の保全記録・公開本文を分ける。旧class/data/tabindex/aria等は保全し、公開ASTには明示allowlistだけを出す。未解決添付は専用の下書きノードで表し、仮assetIdを使わない。
- 根拠: event固定の保存route/repository/publication/export/restoreはschema追加だけではブログへ接続されない。assetは実ファイルhash/storageKeyを要求し、source-referenceも解決済みtargetIdを要求するため、未解決URLを既存assetとして扱えない。公開用データだけでは保全属性を履歴復元できない。
- 比較: 試作のattrsをそのまま正式schemaへ許可する案は、コピー元属性が公開へ混入するため採らない。公開ASTだけを履歴の復元元にする案も、編集情報が失われるため採らない。
- 証拠: 候補schemaで310件通過、既定値省略を正規化した編集JSONへ310件逆変換。添付未解決254件を公開AST生成で停止。残る56件も本文単体の条件であり記事公開可能数ではない。

[保存/公開契約](contracts/body-storage.md)と[再現コード](verification/body-contract/README.md)を参照。正式schema登録、実ID台帳、公開HTML、重複IDの解決方針、利用者レビューは残る。
