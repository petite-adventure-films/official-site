# #334 旧動画埋め込みの保持

2026-11-22。`codex/issue-334-external-video`、分岐元/統合先version-4。既存の動画保持契約を、正式CMS保存・再編集・公開描画・#338の事前変換へ接続する単位。

## 契約

- externalVideoはprovider（youtube/vimeo）・videoId・sourceUrlと、存在するtitle/width/heightを保持する。HTMLをそのまま保存/実行するノードではない。
- HTTPSの`www.youtube.com/embed/{11文字ID}`、`player.vimeo.com/video/{数字ID}`だけを許す。YouTubeのsi/start、Vimeoのhを元URLに保持する。ホスト偽装、資格情報、ポート、フラグメント、未知/重複パラメーターは拒否する。
- 共通検証器をCMS保存と公開rendererで使い、provider/ID/URLの不一致を拒否する。寸法は1〜99999の整数、titleは2000文字以内。任意属性・srcdoc・イベント属性を保存しない。
- 既存iframeのframeborder=0、allowfullscreenを固定の出力へ対応づける。新しい自動再生や権限は付与しない。原本HTMLは変換レポートへ保持する。
- 元の寸法比と最大幅を使って狭い領域へ収める。寸法省略時の表示は560×315を基準とし、省略値を保存データへ追加しない。title省略時は表示だけに「YouTube 動画」「Vimeo 動画」を補う。
- 変換は動画の属性と本文内の順序を照合する。動画だけのpを変換用コピーから外し、Tiptapによる余分な空段落を防ぐ。原本・元からある空段落は変更しない。文章と動画が混在するpは勝手に分割しない。

## UIと範囲

既存BodyEditorのContent内にノードを接続する。Figma `hk5yiH5HW5Es7RMSzzJIIa` / `153:166` のコード・画像と既存MUI部品/cms余白を確認した。新しい動画入力ボタン・ダイアログは追加しない。HTML貼付けから任意iframeを作る経路も開かない。登録済み動画ノードの前後を編集し、保存・複製できる。

スキーマは既存body schemaVersion 2の許可ノード追加。DB migrationはない。Worker・CMS UI・公開rendererの対応版を揃えて適用し、旧rendererへ新ノードを渡さない。

## 検証結果

- Node単体17件成功。旧ブログ90記事の151個（YouTube149/Vimeo2）を動画単体として全件確認し、URL/ID/title/寸法とsi/start/hを保持。未知ホスト・パラメーター・属性、混在段落を停止。
- CMSの3ファイル10件成功。4本文タイプで意味検証、隔離D1で保存/読出し/複製、公開snapshotと復元形式、不正ID拒否を確認。全832件の候補validator照合はレビュー修正後にも再実行し成功。
- Astro描画16件成功。URL/寸法/title、Vimeoのh、意味検証、既存リンク/改行候補を確認。
- CMS Chromium1件成功。2種類の動画を挟む本文の追記・保存・再読込・複製と原本不変、320pxでVimeoの640:512比率が320:256となることを確認。1440px画面を検査。画像は`cms/test-results/external-video-editor.png`（ローカル成果物）。
- 公開rendererのChromium1件成功。生成HTMLのURL/title/referrerpolicyと2種類の比率を確認。初回にブラウザー既定の枠が寸法へ加算されることを検出し、元の枠なし指定を保持して解消。
- CMS型検査、対象AstroのESLint/Prettier、Git差分検査成功。

ブラウザー試験の動画配信先はローカル応答へ置換している。YouTube/Vimeoでの実再生・外部配信のCSP/地域/公開制限等は未確認。今回の結果を動画の視聴確認とは扱わない。

## 全件変換の結果

候補266→283件、停止566→549件。ブログ候補は25→42件。新たな候補は18050/17724/15682/15604/14946/14829/14806/14393/12713/12646/12395/9413/9118/8824/8051/6775/6004。

ブログ14354は動画と文章の混在段落2箇所を確認待ちへ追加（元から他の理由で停止していたため停止件数は不変）。動画単体151個の通過を90記事全体の移行成功としない。画像・旧装飾・添付・開催形式等は引き続き停止。[全件結果](../../011-wordpress-conversion/verification.md)。

## 再現

Node24と既存astro/cms依存を使用する。

```sh
node --test astro/scripts/prepare-wordpress-conversion.test.mjs
pnpm --dir cms exec vitest run worker/external-video.test.ts worker/blog-draft.test.ts worker/wordpress-conversion.test.ts
pnpm --dir astro exec vitest run src/lib/released-cms-blogs.test.ts
pnpm --dir cms run test:e2e external-video.spec.ts
pnpm --dir astro exec playwright test --config playwright.cms.config.ts external-video.spec.ts
pnpm --dir cms exec tsc --noEmit
```

今回の公開HTML試験は`.local/external-video.config.ts`でサーバー起動を省いた対象1件を実行した。正式CMS取込・検証CMS更新・本番移行は実施していない。#334/#338は残件を維持してOPEN。
