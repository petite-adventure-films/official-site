# version-4 引き継ぎ

> 記録日: 2026-08-10

## 今日完了したこと

- Astroへの主要ページ移植
- 404、トップ、contact、events、channel、media、blogの移植
- 高幡台団地73号棟ページの再現とUI調整
- DVDショップ、カート、決済結果ページの移植
- Stripe Checkout処理のVercel Functions化
- 問い合わせ処理のVercel Functions + Resend化
- SEOメタデータ、OGP、サイトマップの整備
- Article、Event、VideoObject等の構造化データ追加
- 既存faviconの移植

Phase 1-2、Phase 3、Phase 4のIssueとマイルストーンは閉じた。

## Gitの状態

- `main`: 現在の本番系として維持
- `version-4`: Astro移植済みコードと、次の自作CMS開発の統合先
- 統合PR: #383

CMS関連の機能ブランチは `version-4` から作り、`version-4` 向けにPRを作成する。

## 本番公開を保留した理由

Vercelの静的生成中にWordPress APIとの通信が切れ、約2,000ページの生成を完了できなかった。
ページは静的化されていても、毎回WordPressから全記事を取り直す限り、WordPressサーバーとネットワークの状態にデプロイが左右される。

このため、現行構成の通信リトライを増やして本番公開を急ぐのではなく、記事データを移行し、自作CMSを構築してからVercelへ公開する方針に変更した。

## WordPress originの状態

- `wporigin.petiteadventurefilms.com` のDNSレコードは作成済み
- 2026-08-10確認時点では、サブドメイン用SSL証明書が未設定
- 同URLのWordPress APIは404で、Webサーバー側の紐づけが未完了

自作CMSへの一括移行でWordPressへ接続する可能性があるため、必要になった時点で設定を再確認する。

## Vercelの状態

- プロジェクトは作成済み
- WordPress API通信切断により最新デプロイは失敗
- Vercel環境変数は未登録
- StripeとResendはコードのみ移行済みで、本番接続確認は未完了

## 次回の開始地点

最初から管理画面を実装せず、次の順番で設計する。

1. CMSの利用者と編集フローを確認する
2. blog / news / events / channel / mediaのデータ構造を棚卸しする
3. DB、認証、画像保存、デプロイ連携の候補を比較する
4. WordPressからの移行方式と再実行方法を決める
5. 最小の1コンテンツタイプで縦に通す
6. AstroからCMSデータを表示し、Vercelプレビューまで確認する

## 未完了として残したもの

- Phase 5: 本番切り替え
- #376 Stripe決済バックエンドの本番設定・確認
- #290 Stripeのセキュリティチェック
- Resendのドメイン認証
- Vercel本番ドメインとDNS切り替え
- 自作CMSと既存WordPress記事の移行
