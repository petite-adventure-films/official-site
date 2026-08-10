# Astroサイト設計

> 最終更新: 2026-08-10

## 役割

AstroはPAF公式サイトの表示層を担当する。基本は静的HTMLを生成し、ブラウザ上の状態や操作が必要な箇所だけReact islandsを使用する。

## 設計原則

- 閲覧中心のページはAstroコンポーネントで実装する
- モーダル、カート、フォームなど状態を持つUIだけReactを使用する
- 記事データの保存・編集責務をAstroへ持たせない
- CMSとAstroの間に共通データ型を置き、保存先を変更しても表示側への影響を限定する
- 既存URLを維持し、静的ルートを動的な記事ルートより優先する
- 本番ビルドが外部APIの大量通信に依存しない構成を目指す

## ページとデータソース

### ローカルデータで生成するページ

| ページ | データソース |
| --- | --- |
| `/films/`、`/films/[id]/` | 映画作品の定数 |
| `/pafshop/`、`/pafshop/[name]/` | 商品の型付きTypeScript定数 |
| `/takahatadai73/` | ローカルコンテンツ・画像・PDF |
| 規約・プロフィール等 | Astroページ内の静的コンテンツ |

### 記事データで生成するページ

| ページ | コンテンツタイプ |
| --- | --- |
| `/news/` | news |
| `/blog/`、ルートレベルの記事slug | blog |
| `/events/`、`/events/[id]/`、年別一覧 | events |
| `/channel/`、`/channel/[id]/` | channel |
| `/media/`、`/media/[id]/` | media |

現在はWordPress REST APIからビルド時に取得している。自作CMS移行後は、CMS APIまたは事前生成した静的スナップショットから同じ型のデータを受け取る。

## 実行場所の分担

| 処理 | 実行場所 |
| --- | --- |
| ページHTML生成 | Astro build |
| モーダル・カート状態 | ブラウザ上のReact |
| カート保存 | sessionStorage |
| 問い合わせ送信 | Vercel Function + Resend |
| Checkout Session作成 | Vercel Function + Stripe |
| 記事編集・保存 | 自作CMS（次Phase） |

## Vercelビルドの既知課題

2026-08-10、WordPressから大量の記事を取得するVercelビルドが `/events/3805` の生成中に `fetch failed` で終了した。
リトライ回数の追加だけでは、デプロイのたびに全記事を外部サーバーから取得する構造上の不安定さは解消できない。

次Phaseでは以下へ変更する。

1. WordPressから既存記事を再実行可能な移行処理で取得する
2. CMSまたは静的スナップショットへ保存する
3. Astroの本番ビルドをWordPressの可用性から切り離す

## SEOとURL

- title、description、OGPは共通レイアウトから出力する
- BreadcrumbList、Article、Event、VideoObject等のJSON-LDをページ種別に応じて出力する
- `/404.html`、フォーム結果、カート・決済結果ページ等はサイトマップから除外する
- 旧サイトのslugとルートレベル記事URLを維持する
- URL移行確認には `docs/url-inventory.md` を使用する

## 関連文書

- `docs/migration-plan.md`: 全体の移行方針と残作業
- `docs/version-4-handoff.md`: 2026-08-10時点の引き継ぎ
- `docs/url-inventory.md`: 既存URLの保護一覧
- `docs/learning-log.md`: 実装・設計学習の記録
