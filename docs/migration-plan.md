# PAF サイト全面移行計画

> 最終更新: 2026-08-10

## 目的

現行の Nuxt 3 + WordPress + お名前.com サーバー構成を、Astro + 自作CMS + Vercelへ段階的に移行する。
表示側とコンテンツ管理側を分離し、既存URL、編集可能性、ショップ機能を維持する。

## 現在地

- Phase 1-2「Astroサイト構築」完了
- Phase 3「DVDショップ移植」完了
- Phase 4「SEO / AEO」完了
- 上記は `version-4` に統合済み（PR #383）
- `main` は現在の本番系として維持
- Phase 5「本番切り替え」は自作CMS移行後まで保留

## 現在の構成

| レイヤー | 現在の実装 | 状態 |
| --- | --- | --- |
| 表示 | Astro（静的出力） | `version-4` で移植完了 |
| インタラクション | React islands | モーダル、カート、フォーム等に限定 |
| 記事データ | WordPress REST API | Astroビルド時に取得する暫定構成 |
| 商品データ | TypeScript定数 | Astro側を正規データとして利用 |
| 問い合わせ | Vercel Function + Resend | 本番用ドメイン・環境変数設定が未完了 |
| 決済 | Vercel Function + Stripe Checkout | 本番キー・実決済確認が未完了 |
| ホスティング | Vercel予定 | 本番DNS切り替えは未実施 |

## 2026-08-10の判断

Vercelでは、約2,000ページを生成する途中でWordPress APIとの通信が切れ、デプロイが失敗した。
完成ページは静的でも、デプロイのたびに全記事をWordPressから再取得する構成は安定しない。

そのため、WordPressへの大量のビルド時通信を補強し続けるのではなく、次のPhaseで記事データ自体を静的化し、自作CMSへ移行する。

```text
現状:
WordPress → デプロイごとに全件取得 → Astro → Vercel

移行後:
WordPress → 一度だけ移行処理 → CMS / 静的スナップショット
                                      ↓
                                    Astro → Vercel
```

## ブランチ方針

| ブランチ | 役割 |
| --- | --- |
| `main` | 現在の本番系。Vercel公開可能になるまで維持する |
| `version-4` | Astro移植と自作CMS開発の統合先 |
| 機能ブランチ | `version-4` から作成し、PRで `version-4` に戻す |

自作CMS、記事移行、Vercelプレビューが完了した段階で `version-4` を `main` に統合する。

## 次のPhase: 自作CMS

### 最初に決めること

- コンテンツモデル（blog / news / events / channel / media）
- DBとデータ保存方式
- 管理画面の認証方式
- 画像・PDFの保存先
- 下書き、公開、更新日時の扱い
- Astroへ渡すAPIまたは静的スナップショットの形式
- 公開操作からVercel再ビルドまでの流れ

### MVP

- 管理者ログイン
- 記事一覧・詳細
- 新規作成・編集
- 下書き・公開
- カテゴリー・タグ
- 画像管理
- WordPress既存記事の取り込み
- Astroが安定して読み込めるデータ出力

### 移行原則

- WordPressの記事ID・slug・公開日時を可能な限り維持する
- 既存URLを変更しない
- 本文HTMLを安全に保持する
- 取り込み処理は中断・再開・再実行できるようにする
- 全件移行だけでなく、特定記事の再同期も可能にする
- CMSの内部実装とAstroの表示を、共通のデータ型で分離する

## Phase 5で残している作業

- Vercelプレビューの安定化
- `WP_API_BASE_URL` 依存の解消または移行用接続への限定
- Stripeテスト・本番環境変数設定と決済確認（#376）
- Stripe運用・セキュリティ確認（#290）
- Resendドメイン認証と問い合わせ送信確認
- Vercel本番ドメイン設定
- DNS切り替え
- 公開後のURL、404、SEO、決済、問い合わせ確認
- ロールバック手順の確認

## Vercel環境変数（現行実装）

```text
WP_API_BASE_URL
STRIPE_SECRET_KEY
RESEND_API_KEY
CONTACT_FROM_EMAIL
CONTACT_TO_EMAIL
```

CMS移行後は `WP_API_BASE_URL` をCMSまたは静的データの接続設定へ置き換える。
