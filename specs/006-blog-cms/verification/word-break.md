# #334 改行候補の保持

2026-11-22。`codex/issue-334-word-break`、分岐元/統合先version-4。既存本文契約のwordBreakを正式CMSへ接続する単位。

## 契約と接続

`{ "type": "wordBreak" }`を段落・見出し等のinline位置に保存し、Tiptapと公開HTMLでは`<wbr>`へ出力する。hardBreak（br）や空白へ置き換えない。文字装飾markは既存inline定義に従い保持する。独自属性・本文子要素・textの注入を拒否する。DB migrationなし。

CMSは既存BodyEditorにノードを登録し、操作ボタンやスタイルを追加しない。Figma `hk5yiH5HW5Es7RMSzzJIIa` / `153:166` のコード・画像を読み、既存MUI操作部品・Content Slot・cms用途別余白を確認した。PC画面を検査し、本文中の改行候補が余計な空白・強制改行として見えないことを確認。新規画面案を作成したものではない。

変換器は入力と出力のwbr位置・数を比較し、未対応属性がある場合は引き続き停止する。原本を変更しない。wbr以外の旧書式を許可する変更は含まない。

## 検証結果

- Node単体13件成功。途中・連続・装飾内のwbrとbrの区別、未知属性の停止を確認。
- CMS API/変換の2ファイル8件成功。隔離D1で保存・読出し・複製・公開snapshot保持、不正ノード拒否、全件候補の現行validator照合を確認。
- Astro公開描画6件成功。`before<wbr>after`として出力され、強制改行・空白へ変わらない。
- Chromium 1件成功。実CMSで追記→保存→再読込→複製後の位置保持、本文幅600pxで同じ行・110pxで候補位置から次行への折返しを確認。PC1440pxの画像は`cms/test-results/word-break-editor.png`（ローカル成果物）。初回試験のOrigin指定漏れによる403は試験側を修正した。
- CMS型検査、変更したAstroファイルのPrettier、差分検査成功。
- 公開スナップショット832件の再照合で候補262→266、停止570→566。新たな候補はブログ4720/4270/4264、お知らせ12775。[全件結果](../../011-wordpress-conversion/verification.md)。他の停止理由は保持する。

## 再現

Node24と既存依存を使用する。

```sh
node --test astro/scripts/prepare-wordpress-conversion.test.mjs
pnpm --dir cms exec vitest run worker/blog-draft.test.ts worker/wordpress-conversion.test.ts
pnpm --dir astro exec vitest run src/lib/released-cms-blogs.test.ts
pnpm --dir cms run test:e2e word-break.spec.ts
pnpm --dir cms exec tsc --noEmit
```

## 残件と適用

#334全体の旧書式・動画・内部リンク・貼付け規則・OS IME・利用者レビューは残る。#338の最新原文/非公開入力・添付・開催形式・全件正式変換も未完了。両IssueはOPENを維持する。本番移行や検証用CMSの更新は行っていない。配備時はwordBreak対応の保存側と公開描画側を揃え、旧rendererへ新ノードを渡さない。
