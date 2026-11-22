# #334 / #394 公開本文のリンク保持

2026-11-22。`codex/issue-334-published-links`、分岐元/統合先version-4。本文の保存形式に存在するtarget/titleを公開HTMLでも保持する小修正。

## 不具合と修正

変換器とCMS保存データにはtarget/titleがある一方、共通公開rendererはhrefと文字列しか出力せず、別タブ指定と説明が欠落していた。修正前の回帰テストで欠落を再現した。

- `_blank` / `_self`を保持する。省略時はtargetを追加しない。
- titleをエスケープして保持する。任意のイベント属性や元HTMLのrelは出力せず、`_blank`では既存契約どおり`noopener noreferrer`を生成する。
- URLは現行CMSと同じvalidatorを使う。不正URL・不正target・不正titleは生成を止め、黙って文字列だけにしない。
- ブログ・お知らせ・メディア掲載・チャンネルの共通描画へ適用。CMS画面部品・保存schema・原文・移行候補件数は変更しない。

## 検証

- `pnpm --dir astro exec vitest run src/lib/released-cms-blogs.test.ts`: 15件成功。target/title、HTMLエスケープ、不正属性、4種別の接続を確認。
- `astro/e2e-cms/published-links.spec.ts`: Chromiumで1件成功。実rendererが出力したHTMLから別タブ/同一タブ/指定なしの遷移先・クエリ・titleを確認。別タブでwindow.openerがnull、referrerが空であることも確認。テスト先はローカル応答へ置換し、外部サイトへ接続していない。
- 対象ブラウザー試験は既存CMS公開E2Eのテスト群に追加。今回は`.local/published-links.config.ts`でサーバー起動を省いた対象1件のみを実行した。通常は`pnpm --dir astro exec playwright test --config playwright.cms.config.ts published-links.spec.ts`で再現できる。
- 初回のNode24 JSON読込指定とテスト応答のUTF-8指定不足は修正済み。Prettier・Git差分検査成功。

実サイト全体の操作・本番配備・旧内部リンクの移行を完了したという判定ではない。#334の旧本文/動画/内部リンク/IME等と#394の全件表示照合は残る。
