# 新規メディア登録・本文挿入の確認

対象 #418 / #395。2026-11-16、ローカルD1/R2エミュレーターで確認。[契約](../../contracts/media-upload.md)。本番R2・旧メディア移行・Astro接続・プレビューは未実施。

## 実装

- 登録要求→一時キーへのPUT→サイズ/hash/形式・画像寸法検査→確定asset。再送は同じoperationId・登録IDへ戻す。確定ファイルはhash由来キーで、一時URLから変更できない。
- 認証内で一覧・ファイル名検索・20件ずつの選択。画像/PDFを本文へ挿入し、画像選択後の「画像」ボタンで代替テキストを編集できる。
- 本文には不変assetIdだけを保存。保存APIが確定状態と種別を確認する。PDFはassetLink mark、外部PDFは従来の通常link。
- 新規ファイルは自動公開しない。CMSのファイル取得も認証の内側で、PDFはダウンロード扱い。

## 検証

- `pnpm --dir cms typecheck` / `pnpm --dir cms build`: 成功。従来からの大きいクライアントchunk警告は残る。
- `pnpm --dir cms test`: Vitest 18ファイル120件成功、公開runner 1件成功。runnerの意図したAstroビルド失敗で以前の公開版を維持する試験を含む。
- `pnpm --dir cms exec vitest run worker/media.test.ts worker/blog-draft.test.ts worker/duplicate.test.ts`: 15件成功。
- `pnpm --dir cms run test:e2e media.spec.ts blog.spec.ts duplicate.spec.ts`: 既存8件と添付通常操作1件成功。添付失敗系1件はモーダル背面の本文をroleで取得していたテストが失敗。背景がaria-hiddenになる動作に合わせて本文DOMを照合するよう修正。
- 修正後 `pnpm --dir cms run test:e2e media.spec.ts`: 3件成功。PNG/JPEG/GIF/WebPの実ファイル登録・ブラウザーdecodeと再読込、および画像/PDF登録、alt編集、保存、再読込、複製、登録済み選択、送信失敗、確定応答紛失→同じassetへ再送、キャンセルによる本文保持を確認。
- 1440pxで[選択ダイアログ](media-picker.png)・[添付を含む本文](media-editor.png)を確認。小さい確認画像が拡大される問題を修正し、自然寸法・最大高さで表示。ファイル選択は日本語MUIボタン。

## 残る確認・境界

- 利用者による代表操作のレビュー待ち。Figma既存本文153:166とダイアログ66:388の定義を参照した。[メディア選択の空一覧案](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=181-1879)を既存MUI/Section/Fieldで作成。15 instances、標準Slot 3、外部に直接配置したtext 0、フォントRoboto、画像化したUIなしを確認。選択後・登録中・エラーのFigma状態、および実装との完全な外観一致は未確認。今回の状態を他画面へ展開する採用済み共通パターンとはしない。
- 実R2への署名PUTとCORS、権限設定、失敗時の一時オブジェクトの保持期限/回収、容量監視は本番接続前に確認する。ローカルPUTは本番Workerに公開しない。
- 形式検査はヘッダー・寸法・一部終端を確認するもので、完全なデコード・マルウェア検査ではない。ブラウザー画像表示はPNG/JPEG/GIF/WebPの生成した32×24 fixtureで確認。実運用の多様な写真・アニメーション・大きいPDFはレビュー時に追加確認する。
- asset/v1の画像renditionsは空。公開用派生画像、一覧サムネイル最適化、既存添付移行、削除・利用箇所の管理は未実装。

## 本番設定の境界

本番wrangler設定は未変更。将来、非公開R2を `MEDIA` にbindし、`MEDIA_ACCOUNT_ID` / `MEDIA_BUCKET_NAME` とsecretの `MEDIA_ACCESS_KEY_ID` / `MEDIA_SECRET_ACCESS_KEY` を用意する。署名は15分以内、PUTとContent-Typeを固定。一時キーは `uploads/asset_…`。バケットのCORSはCMSの正確なOriginとPUT/Content-Typeを許可する。

本番APIはAccess認証後に署名設定を構成し、ローカルモードを強制無効化する。未設定では登録を503で停止する。既存CMSと同じOrigin・JSON条件を登録/確定に適用する。

通常の `pnpm --dir cms dev` でもPNG登録とダイアログ操作を確認。ローカルD1を `.local/cms-backups/20261116-media/d1` に保全して0009を適用し、既存下書きを維持した。確認用sample.pngをローカルだけに登録。記事は作成せずキャンセルし、最新の選択ダイアログ画像を記録した。
