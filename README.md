# Petite Adventure Films 日本語版

Petite Adventure Films 公式サイト・ショップ 日本語版を開発・運用するためのリポジトリです。

## 使用技術一覧

<img src="https://img.shields.io/badge/-node.js-000000.svg?logo=node.js&style=for-the-badge"> <img src="https://img.shields.io/badge/-bun-000000.svg?logo=bun&style=for-the-badge"> <img src="https://img.shields.io/badge/-Nuxt.js-000000.svg?logo=Nuxt.js&style=for-the-badge"> <img src="https://img.shields.io/badge/-TailwindCSS-000000.svg?logo=tailwindcss&style=for-the-badge"> <img src="https://img.shields.io/badge/-stripe-000000.svg?logo=stripe&style=for-the-badge"> <img src="https://img.shields.io/badge/-php-000000.svg?logo=php&style=for-the-badge"> <img src="https://img.shields.io/badge/-wordpress-000000.svg?logo=wordpress&style=for-the-badge"> <img src="https://img.shields.io/badge/-Docker-1488C6.svg?logo=docker&style=for-the-badge"> <img src="https://img.shields.io/badge/-githubactions-FFFFFF.svg?logo=github-actions&style=for-the-badge">

## 目次

1. [環境](#環境)
2. [ディレクトリ構成](#ディレクトリ構成)
3. [開発環境構築](#開発環境構築)
4. [公開](#公開)

## 環境

| 言語・フレームワーク | バージョン                                        |
| -------------------- | ------------------------------------------------- |
| Node.js              | 22                                                |
| Bun                  | 1.1.26                                            |
| Nuxt.js              | 3.12.4                                            |
| Tailwind.css         | latest                                            |
| PHP                  | お名前.com サーバー用意されているバージョンの最新 |
| Wordpress            | 最新                                              |
| Docker               | Docker Desktop 4.32.0                             |

その他のパッケージのバージョンは package.json を参照してください

## ディレクトリ構成

<pre>
.
├── .github
│ └── workflows
├── html
│ ├── src - nuxt環境
│ ├── security
│ │ ├── .htaccess - Webサーバー設定ファイル（Basic認証・リダイレクト等）
│ │ └── .htpasswd - Basic認証用パスワードファイル
│ ├── stripe - Stripe関連
│ ├── vendor
│ └── wp - wordpress関連
│ │ └── wp-content
│ │ │ └── themes
│ │ │ │ └── petiteadventurefilms
├── .gitignore
├── .prettierignore
├── .prettierrc
├── docker-compose.yml
└── README.md
</pre>

## 開発環境構築

### 1. 環境変数設置

.env ファイルを以下の環境変数例と[環境変数の一覧](#環境変数の一覧)を元に作成

html/stripe/.env

```DOTENV
IS_DEV = true
STRIPE_SECRET_KEY = （Stripeテスト環境のシークレットキー）
```

html/wp/wp-content/themes/petiteadventurefilme/.env

```DOTENV
ACCESS_TOKEN_DISPATCH = （GITHUBから発行されるアクセストークン）
```

html/.env

```DOTENV
NUXT_PUBLIC_API_BASE = 'http://localhost:8000/'
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = （Stripeテスト環境の公開キー）
```

`（）` 内は管理者に問い合わせください。

### 2. Wordpress 環境立ち上げ

docker から該当の wordpress 環境を立ち上げます。

```sh
docker compose up
```

### 3. nuxt 環境立ち上げ

bun を利用して立ち上げます。

```sh
cd html
bun dev
```

## 公開

### 環境変数

Github Secrets に登録されています。

| 変数名                                  |
| --------------------------------------- |
| ACCESS_TOKEN_DISPATCH                   |
| FTP_PASSWORD                            |
| FTP_SERVER                              |
| FTP_SERVER_DIR_DEV                      |
| FTP_SERVER_DIR_PRD_JA                   |
| FTP_USERNAME                            |
| NUXT_PUBLIC_API_BASE_DEV                |
| NUXT_PUBLIC_API_BASE_PRD                |
| NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_PRD  |
| NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_TEST |
| STRIPE_SECRET_KEY_PRD                   |
| STRIPE_SECRET_KEY_TEST                  |

### Pull request → merge で公開

main ブランチに Pull request が merge されたら、本番環境へ反映  
develop ブランチへの Pull request が merge されたら、開発環境へ反映

この際、`すべて更新` のタグがある時は、以下のファイルが更新される。

- Stripe 関連ファイル
- Wordpress 構築関連ファイル
- セキュリティ設定ファイル（.htaccess / .htpasswd）
- Wordpress の内容を build したすべてのページ

`構築ファイル更新` のタグがある時は、以下のみ更新される。

- Stripe 関連ファイル
- Wordpress 構築関連ファイル
- セキュリティ設定ファイル（.htaccess / .htpasswd）

タグがなにもない時は、公開作業は行われない。

### Wordpress から公開

Wordpress 上で公開する時は、メニューの `サイト更新` → `更新作業を始める` から実行できる。

<img src="https://github.com/user-attachments/assets/008301ec-3bde-45b2-a3a3-6a9494d1cfdf" width="320px">

実行後、[Actions のジョブ](https://github.com/petite-adventure-films/ja/actions) から進行が確認できる。

<img src="https://github.com/user-attachments/assets/78a8aa7a-fbf7-42e1-ab68-b07299e39027" width="420px">

> [!CAUTION] > `更新作業を始める` 実行後、再度更新を行う際には、必ず前回のワークフローが終了しているか確認する  
> 予期せぬエラーが発生する可能性があるので、一度更新作業が始まったら、ワークフローのキャンセルはなるべく避ける

### `すべて更新` 時と Wordpress から公開時の本番公開の流れ

Github Actions が実行されたら、以下の順序でデプロイが行われる。

1. **セキュリティ設定の更新**: `html/security/` 内の `.htaccess` と `.htpasswd` がサーバーのルートディレクトリにアップロードされる。
2. **静的ファイルの同期**: 構築関連ファイルと、Nuxt で generate された静的ファイル一式が更新される。

### 環境変数の一覧

### Stripe 関連

html/stripe/.env

| 変数名                | 役割                                                  | デフォルト値                   | DEV 環境での値                   |
| --------------------- | ----------------------------------------------------- | ------------------------------ | -------------------------------- |
| IS_DEV                | ローカル環境で CORS にならないように設定するため      | false                          | true                             |
| STRIPE_SECRET_KEY     | Stripe が機能するため                                 | （本番環境のシークレットキー） | （テスト環境のシークレットキー） |
| STRIPE_WEBHOOK_SECRET | Stripe 銀行振込が支払い完了したとき、お知らせするため | （本番環境の署名シークレット） | （テスト環境の署名シークレット） |

### Wordpress 関連

| 変数名                | 役割                                               | デフォルト値                    | DEV 環境での値                  |
| --------------------- | -------------------------------------------------- | ------------------------------- | ------------------------------- |
| ACCESS_TOKEN_DISPATCH | Wordpress から Github Actions を実行するために設定 | （GITHUB のパーソナルトークン） | （GITHUB のパーソナルトークン） |

### nuxt 関連

| 変数名               | 役割                             | デフォルト値 | DEV 環境での値         |
| -------------------- | -------------------------------- | ------------ | ---------------------- |
| NUXT_PUBLIC_API_BASE | API 先を環境ごとに設定するために |              | http://localhost:8000/ |
