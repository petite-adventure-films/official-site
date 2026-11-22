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
| Cloudflare接続 | OAuth再認証済み。account `923176c9ca0b65c526be853b018ea36a`、workers.dev subdomain `restard653`。既存Workerはpulse-backend、既存D1・zoneは0件。Access APIは403、管理画面ではZero Trust未設定を確認 |

GitHubの配備記録はAstroの確認用配信がVercelにある根拠であり、正式ドメインが同じサービスに切り替わっている根拠ではない。旧NuxtのFTPワークフローも残る。Cloudflare用secretがGitHubにないことも、Cloudflare側のGit連携が存在しない証拠にはならない。

## 現時点の方針

- 配信先はCloudflareを採用する。CMS認証はAccess、処理と保存はWorkers＋D1、公開サイトはWorkersの静的配信とする。テストが完了するまで既存Vercel・旧サイトの配備を停止・切替しない。
- CMSの保存・認証基盤と公開サイトの配信先を分離する。公開操作・履歴・生成物の仕様は共通にし、配信先に依存するAPI・認証・結果照合はadapter境界に置く。
- 公開用の固定snapshot・release manifestからAstro生成物を作り、候補の検証、反映要求、結果照合、公開停止後の確認を配信先ごとに接続する。受付IDだけを公開成功と扱わない。
- ローカルの公開用検証・履歴確定・URL所有権・公開確定データの受け渡しは実装済み。テストadapterの成功だけで外部公開接続を完了扱いにしない。
- 次はアカウント内の既存資源を確認し、独立したテスト用CMS・D1・サイト配信先を準備する。外部配信の完了確認には実環境での認証・反映・結果照合が必要。

## 配信先決定後に確認・設定する内容

テスト用CMS・テスト用DB・テスト配信先を本番から分ける。既存GitHubのPreview環境を名前だけで流用せず、用途がわかる専用環境を用意する案。CMS・サイトのホストはAccess設定後に有効化する。

共通で必要なのは、対象アカウントとプロジェクト、テストホスト、未公開候補のアクセス制御、配信要求の資格情報、配信結果を照合するAPI、固定releaseを受け渡す機械認証、コード配備とCMS公開を直列化する実行経路。公開リポジトリのログ・cache・artifactへ候補payloadを出さない。実行は信頼するコードrefに限定し、PR由来コードへ配備資格情報を渡さない。

Cloudflareの既存リソースを確認済み。Worker・D1・Accessのテスト環境を具体化する。名称は `paf-cms-staging`（CMS）、`paf-cms-staging-db`（DB）、`paf-site-staging`（サイト）の候補とし、衝突とアカウントを確認してから作成する。実ホスト名、許可する2人のメールアドレス・表示名は確認済み情報を使い、推測で設定しない。CMSとテストサイトの認証範囲は個別に設定する。

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

2026-11-14にOAuth再認証を完了。専用D1 `paf-cms-staging-db`（ID `ba08fb39-5da0-49bf-9b33-0b84d35a4fe9`）を作成し、0001〜0007のmigrationを適用した。未適用migrationが0件であることを確認。既存記事は投入していない。接続検証用の下書き1件のみ作成済み。

`cms/wrangler.staging.jsonc` は対象アカウント・専用DB・認証を行うWorker入口を固定する。CMS Worker配備版は `51fab22b-18a4-4096-b726-9409b6af487d`。CMSビルド・dry-run・認証テスト15件成功、検証開始前にリモートDBの下書き0件を確認した。サイトは未配備。

利用者によるZero Trust Free有効化を確認し、承認された2人の個別メールアドレスを許可する `PAF staging editors` ポリシー（`3e1170be-8795-443e-bf64-e2c0ee9c81e2`）を保存した。Access application `PAF CMS staging`（`1b667f1c-6ed0-4b37-803a-3b90b3e58a1c`）はCMS Worker全体を保護し、他のWorkerは対象にしない。メールのOne-time PIN認証を追加し、アプリへ選択・保存済み。

CMS_ORIGIN・ACCESS_ISSUER・ACCESS_AUDIENCE・ALLOWED_USERSをWorker secretsに登録済み。個人メールアドレス・認証情報はリポジトリへ記録しない。認証設定後にworkers.devを有効化し、preview URLは無効を維持する。テストURLは https://paf-cms-staging.restard653.workers.dev/cms/events 。

未認証の画面・API・JS・ローカル専用API相当の4経路について、通常のHTTP要求は403、HTML要求はAccessログインへの302を確認。ブラウザーでメール入力と「Send login code」が表示された。利用者のメール認証後、Safariで許可利用者の表示、テスト下書きの手動保存・自動保存、再読込でタイトルと複数行アクセス案内の保持、一覧の下書き表示を確認した。必須項目未入力でも保存され、公開前チェックで開催日・会場名の不足が表示される。リモートDBでもテスト記事のversion 2、公開履歴0件・公開操作0件を確認。テスト下書き「接続確認用テスト記事（公開しません）」（`e05e641b-866b-478e-8563-c1c2c437a414`）は確認用に残す。2人目の実ログインは未確認。テストサイト配備と実公開接続は未完了。

## PAF管理アカウントでの検証環境（#423）

2026-11-15にPAF管理のCloudflareアカウントへ開発担当者の個別ログインで接続し、検証用D1を新規作成した。既存の移行スクリプト0001〜0007を適用し、検証用Worker `paf-cms-staging` をデプロイした（配備版 `eafc0009-1a84-4537-8ee4-e428f5ebf5fa`）。既存データは投入していない。

Zero Trust Free有効化後、検証Workerに専用のAccessアプリを設定し、監督と開発担当者の2人を許可した。開発担当者のログイン先はCloudflareの管理に使用するアドレスと揃えた。Worker側のJWT検証設定を登録してからworkers.devを有効化した（配備版 `1dce3c45-9bcf-458a-b619-1aa6593ae8eb`）。プレビューURLは無効。

検証URLは https://paf-cms-staging.petiteadventurefilms2.workers.dev/cms/events 。未認証のCMS画面とAPIへの要求がHTTP 302を返すことを確認した。開発担当者がログインし、テスト下書きの作成・保存・再読み込み・再編集・再保存を確認した。D1は適用待ちマイグレーション0件、下書き1件、公開記事・公開操作とも0件。監督本人のログインは未確認。

### ブログ公開接続の確認（2026-11-19、#390・#394・#433）

検証環境だけで、CMS画面から公開 → 正式URLで本文・画像・PDFを確認 → 公開履歴参照 → 下書きへ復元 → 再編集・保存 → 再読込を通し確認した。本番Worker・DNS・既存配信先は変更していない。Issueはこの通し確認だけで完了扱いにしない。

| 対象 | 現在の検証設定 |
| --- | --- |
| アカウント | PAF管理 `53b7ac20e59cefa91e5b88831768a248` |
| CMS | `paf-cms-staging`、最終配備版 `cd0b6524-e1a1-4e43-b8ba-1a460c6e0156` |
| サイト | `paf-site-staging`、有効版 `5aa2ebd2-312f-4f5b-bad3-7863536fdd53`、配備ID `acf43fb1-6d98-4eef-932b-92753d948bc7` |
| R2 | `paf-cms-staging-media`。CMSのMEDIAバインディングとアップロード署名キー2件を設定済み |
| サイトAccess | `PAF site staging`（`6afb5a13-3d8e-4e5a-8f7d-34cf33c7a09f`）。既存開発担当者のAllowと、`paf-staging-publication` だけを許可するService Auth |
| URL | `https://paf-site-staging.petiteadventurefilms2.workers.dev`。workers.dev有効、preview URL無効 |
| ランナー | 端末のループバック18789番と、検証中のみのQuick Tunnel。専用の256ビットランダムキーを必須とする |

個人アカウント側の同名Workerは旧検証環境であり、使用しない。R2キーが個人側で発行・登録されていたことを利用者と照合し、PAF側で作成したキーをPAF側CMSへ登録した。旧環境は今回削除していない。

#### 添付とトップ動画

- `cms/r2.staging.cors.json` を検証バケットへ適用し、CMS検証オリジンからのPUTとContent-Typeのみを許可。画像・PDFのブラウザーアップロード成功により、署名とR2書き込みを確認した。
- 検証専用ビルド `node astro/scripts/build-staging.mjs` は生成先のトップ動画だけを再圧縮する。元動画は維持し、配備ファイルは21,803,564バイトでStatic Assetsの1ファイル25 MiB制限内。全件ビルドと実配備を通過した。

#### 公開処理と結果照合

- 検証CMSオリジン、DB・R2、HTTPSの `STAGING_RUNNER_URL`、`STAGING_RUNNER_SECRET`、サイトAccessサービス資格情報が揃う場合だけ、検証配信アダプターを有効化する。
- ランナーの `POST /deploy` は固定候補・既存公開版・添付のマニフェストを受け取り、操作ID・試行番号・候補ハッシュで重複排除する。信頼する作業ブランチのコードから、検証Workerだけへ生成・配備を直列実行する。
- `POST /inspect` は同じ試行の配備ID・リリースハッシュを返す。ランナーは有効なCloudflare配備版と、Accessを通したサイトの `/__release.json` を照合する。CMSも同じマーカーを独立に取得し、試行とハッシュが一致した場合に公開状態・履歴を既存トランザクションで確定する。
- 実環境で発見したfetchの呼び出しコンテキストの問題は、グローバルfetchをラッパー経由で呼び出して修正した。CMSからサイトのworkers.devを呼ぶ経路には `global_fetch_strictly_public` を指定し、Accessを通る公開経路で照合する。診断用ログは除去済み。
- 配備結果が不明の試行は新規配備を止め、配備履歴とマーカーを照合する。プロセス中断で状態が残った場合は、旧プロセスと保留中の配備がないことを確認してから復旧する。

#### 通し確認の記録

- 記事ID `7ce968f9-e031-4c47-a9c8-3f479eb6233c`、正式パス `/staging-blog-check-20261119/`。以前の検証下書きは変更していない。
- CMSの公開操作 `8536a309-94be-4889-9d72-a1155c456bce` は試行1回で配備し、照合修正後も同じ試行で成功確定。公開状態version 1、公開履歴ID `728fb712-91d0-478d-bd53-86d2a95a21ef` を確認した。DBの状態を手動で成功へ書き換えていない。
- Safariで正式URLのタイトル・本文・青い検証画像を表示し、PDFリンクから実際のPDF描画を確認した。HTTP確認でも記事・画像・PDFは200。画像は126バイト、PDFは351,057バイトで、いずれも元ファイルとバイト単位で一致した。
- 公開後に下書きタイトルを変更し、公開履歴で元の公開タイトル・本文・画像・PDFを参照した。「この内容を下書きに戻す」で復元メッセージと元タイトルへの復帰を確認した。
- 復元後のタイトル変更・本文追記を保存し、再読込後も画像・PDFとともに保持されることを確認した。公開サイトは元のタイトル・本文のままで、再編集した下書きの内容が含まれないことを確認した。
- サイトは匿名302・サービス認証200。一時ランナーは匿名401・不正キー401・正しいキー200。CMSビルド・型検査、配備照合・認証分離・fetch呼び出しのテスト4件成功。

#### 一時接続の運用と残作業

PAF側でCloudflare管理ドメインを確認できていないため、利用者承認により常設のAccess付きTunnel案から、検証限定のQuick Tunnelと専用キーへ切り替えた。本番DNSは変更しない。サイトのAccess保護は維持する。ランナーにはサイト用Access資格情報を送信せず、ランナー自身のキーだけを送る。

- Git管理対象外・所有者のみ読み書き可能な `cms/.env.staging-publication` に、サイトAccess資格情報、ランナー専用キー、非公開状態ディレクトリ、現在の一時URLを置く。値は文書やログへ記録しない。
- `node --env-file=cms/.env.staging-publication cms/scripts/cloudflare-staging-runner.mjs` で起動する。Wranglerの正規OAuthログインまたはランナー側だけに設定した配備用APIトークンを使う。アカウントと配備先は検証設定に固定する。
- `pnpm --dir cms exec wrangler tunnel quick-start http://127.0.0.1:18789` のURLをCMSの `STAGING_RUNNER_URL` に登録する。再起動でURLが変わるため再登録が必要。端末・プロセス停止中はCMSからの公開が動作しない。公開済みサイトとCMSの下書き保存はCloudflare側に残る。
- 常設ランナー、資格情報の継続管理・更新、端末に依存しない運用、Cloudflare上での失敗・応答紛失・切り戻しの網羅確認、差分生成、他種別の接続は残作業。今回の成功確認だけで #390・#394・#433 をクローズしない。

参照: [Cloudflareのfetch互換フラグ](https://developers.cloudflare.com/workers/configuration/compatibility-flags/#global-fetch-strictly-public)、[Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/)。
