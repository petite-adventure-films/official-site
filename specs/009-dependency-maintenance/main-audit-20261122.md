# mainのAstro依存監査

対象 #437。Nuxtの更新#436とは別。分岐元mainはdfa0d1bd（PR #439統合後）。開発中version-4のAstro/CMSと、mainのAstroを混同しない。

## 更新と確認

- Node 24.22.3 / pnpm 10.28.2。mainのAstro 6系から7.4.13へ更新し、Cloudflare adapter 14.4.9、Sharp 0.35.5、Wrangler 4.166.0を組み合わせた。Viteの指定はpnpmが読み取るpnpm.overridesへ置き、8.3.8系に統一。
- 11/22のpnpm audit：更新前 critical 1 / high 36 / moderate 36 / low 12、更新後すべて0。GitHub Dependabotの件数とは集計対象が異なる。未解消の監査警告はない。
- 更新前/更新後を独立した作業コピーでbuildし、双方27ページを生成。ページパス、本文、通常の画像/リンク参照が一致。最適化された画像や内部バンドルのハッシュ差はこの本文比較から除いた。
- Chromiumでトップ・監督紹介・さようならURを360px/1280pxで比較。外部通信を止めた同一条件で6組のスクリーンショットとレイアウトが一致。さようならURの画像1点は両版で読込未成立のため、この画像自体の表示成立は今回の成功に含めない。
- 出力内に25 MiB以上のファイルはない。静的出力の構成を維持し、APIやCMSをmainへ移植していない。

## 更新根拠

[Astroの画像処理の修正](https://github.com/advisories/GHSA-26w7-cxv4-gfx2)、[Astro 7移行ガイド](https://docs.astro.build/en/guides/upgrade-to/v7/)と公開レジストリの依存/peer条件を照合。6系のまま監査警告解消済みとはしない。

## 本番との境界

このPRはmain向けのレビュー可能な更新であり、本番配備済みではない。mainへのマージは本番Workerの自動配信を起動するため、利用者の「本番配信を変更しない」指定がある間はマージしない。Cloudflare設定・DNS・契約・決済・メール送信は変更していない。#437にはversion-4とmainそれぞれのPR・反映状況を記録する。
