# 配信環境の確認結果と接続方針

対象 #392・#390・#394。確認日 2026-11-14。利用者合意により、CMSと公開サイトをCloudflareへ集約する。費用の最小化より管理先の統一を優先する。まず本番と独立したテスト環境で検証し、既存データの取り込み・本番切り替えは最後に行う。外部環境の準備状況は下記を参照。

## 確認できた事実

| 対象 | 確認結果 |
| --- | --- |
| GitHub | `petite-adventure-films/official-site` は公開リポジトリ。default branchはmain、開発統合先はversion-4 |
| GitHub Environments | PreviewとProductionが存在し、取得したprotection_rulesは空。環境名だけで配信サービスを判断しない |
| GitHub設定 | リポジトリのsecret名には旧FTP・Stripe等の設定が存在。Cloudflare用の名前は確認できなかった。Previewのsecret・variable、Productionのsecret一覧は空。値は読み取っていない |
| 直近のProduction配備 | deployment `7629480470`、2026-11-08、ref `d07d9a53addb1c569afc752b9d0cb908abeee7aa`。vercel[bot]作成、success、配信URLはvercel.app |
| 直近のPreview配備 | deployment `7629460391`、2026-11-08、vercel[bot]作成、success、配信URLはvercel.app |
| Astro | `output: static`。`astro/wrangler.jsonc` はofficial-site/distの設定。`astro/vercel.json` にはVercel Bot Protection向けrewrite等がある |
| CMS | `cms/wrangler.jsonc` に本番D1 binding・Access設定は未設定。workers.devとpreview URLは無効。ローカル設定は開発専用 |
| Cloudflare接続 | `wrangler whoami` が認証期限切れで失敗。アカウント内のWorker・D1・Access・ドメインは未確認 |

GitHubの配備記録はAstroの確認用配信がVercelにある根拠であり、正式ドメインが同じサービスに切り替わっている根拠ではない。旧NuxtのFTPワークフローも残る。Cloudflare用secretがGitHubにないことも、Cloudflare側のGit連携が存在しない証拠にはならない。

## 現時点の方針

- 配信先はCloudflareを採用する。CMS認証はAccess、処理と保存はWorkers＋D1、公開サイトはWorkersの静的配信とする。テストが完了するまで既存Vercel・旧サイトの配備を停止・切替しない。
- CMSの保存・認証基盤と公開サイトの配信先を分離する。公開操作・履歴・生成物の仕様は共通にし、配信先に依存するAPI・認証・結果照合はadapter境界に置く。
- 公開用の固定snapshot・release manifestからAstro生成物を作り、候補の検証、反映要求、結果照合、公開停止後の確認を配信先ごとに接続する。受付IDだけを公開成功と扱わない。
- ローカルの公開用検証・履歴確定・URL所有権・公開確定データの受け渡しは実装済み。テストadapterの成功だけで外部公開接続を完了扱いにしない。
- 次はアカウント内の既存資源を確認し、独立したテスト用CMS・D1・サイト配信先を準備する。外部配信の完了確認には実環境での認証・反映・結果照合が必要。

## 配信先決定後に確認・設定する内容

テスト用CMS・テスト用DB・テスト配信先を本番から分ける。既存GitHubのPreview環境を名前だけで流用せず、用途がわかる専用環境を用意する案。名称・ホストはまだ仮定しない。

共通で必要なのは、対象アカウントとプロジェクト、テストホスト、未公開候補のアクセス制御、配信要求の資格情報、配信結果を照合するAPI、固定releaseを受け渡す機械認証、コード配備とCMS公開を直列化する実行経路。公開リポジトリのログ・cache・artifactへ候補payloadを出さない。実行は信頼するコードrefに限定し、PR由来コードへ配備資格情報を渡さない。

Cloudflareの再ログイン後に既存リソースを読み取り確認し、Worker・D1・Accessのテスト環境を具体化する。名称は `paf-cms-staging`（CMS）、`paf-cms-staging-db`（DB）、`paf-site-staging`（サイト）の候補とし、衝突とアカウントを確認してから作成する。実ホスト名、許可する2人のメールアドレス・表示名は確認済み情報を使い、推測で設定しない。CMSとテストサイトの認証範囲は個別に設定する。

テストサイトもアクセス制限を有効にしてから候補本文を渡す。CMSは認証を行う本番用Worker入口を使い、ローカルの認証省略入口は配備しない。テスト用D1は空で開始し、既存WordPressやローカル下書きを自動で投入しない。旧サイトを動かしたまま、テスト記事による公開・更新・失敗後の復旧・履歴確定を検証する。

公開サイトのVercel専用rewrite/Bot Protectionは移行確認項目とする。初期のテスト範囲はイベントの静的表示とCMS公開処理に限定し、SHOP・決済・問い合わせ等を移行済みと扱わない。

公開用workflowをGitHub Actionsで用意する案は、main上の起動定義とversion-4の実装参照を区別する必要がある。既存の旧FTP workflowへ処理を追加しない。プロバイダーのGit連携を使う場合も、コードpushによる自動配備とCMS公開が互いを上書きしないよう同じreleaseの調停を通す。

## 参考資料

- [Cloudflare Workers CI/CD](https://developers.cloudflare.com/workers/ci-cd/): Workers Buildsまたは外部CIからの配備が可能。
- [Cloudflare Deploy Hooks](https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/): Git接続したWorkerの指定branchをhookからビルドできる。
- [Vercel Deployments](https://vercel.com/docs/deployments): Git連携・CLI・Deploy Hook等の配備方式。
- [Vercel Deployment Protection](https://vercel.com/docs/deployment-protection): テスト配信先の保護方式は実際のプロジェクト設定・契約で確認する。

サービスに接続方法があることと、この案件に必要な固定snapshot・順序保証・結果照合が満たせることは別であり、hookを呼ぶだけの実装を完成形にしない。


## 接続準備の状況

2026-11-14の再確認でもWranglerのOAuth認証が期限切れで、アカウント一覧を取得できなかった。再ログインを開始し、利用者のブラウザーでの認証待ち。クラウドのWorker・D1・Access設定や本番配備はこの確認時点では変更していない。
