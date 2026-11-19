# 端末に依存しない検証配信（#390・#394・#433）

状態: Workers Builds方式を実装中。GitHub Appはofficial-siteのみに認可済み。利用者の画面で検証WorkerへのGit接続と自動ビルド無効を確認。ホスト上の通し確認は未完了。

## 目的と範囲

CMSの公開操作から固定候補を生成・配備し、公開状態と履歴を確定するまでをホスト側で完結させる。端末のNodeプロセス・Quick Tunnel・対話的Wranglerログインに依存しない。本番Worker・本番DNS・旧サイトを変更しない。3件のIssueはオープンを維持する。

## 構成候補

| 方式 | 利点 | 接続に必要なもの・制約 |
| --- | --- | --- |
| Cloudflare Workers Builds | 検証Workerに紐づくビルド環境とDeploy Hookを利用できる | GitHub App連携、検証専用の配備資格情報、候補取得と結果報告の経路。ffmpegはビルドイメージの標準搭載一覧にないため別途対応が必要 |
| GitHub Actions | Node・ffmpegを含むビルドと履歴を管理しやすい | dispatchの起動定義、GitHub起動権限、Cloudflare検証配備資格情報。デフォルトブランチの既存本番workflowから分離する必要がある |
| 常設VM／Container | 現在のランナーを移しやすい | 常時運用・契約・費用・状態永続化・パッチ更新の追加負担がある |

まずWorkers Buildsの接続可能性を確認する。Deploy Hookを呼ぶだけでは採用条件を満たさない。

## 実装で保持する条件

- CMS認証・検証サイトのAccess保護を維持し、ビルドサービスへCMS編集権限を渡さない。
- 公開操作ID・試行番号・候補ハッシュに対応する生成入力を永続化し、実行中の下書き編集で入力を変えない。本文や添付を公開リポジトリやビルドログに出さない。
- 配備はサイト単位で直列化する。同じ起動通知の再送・ビルド再実行が二重配備や古い公開版への上書きを起こさないよう、実行権の取得を永続的・原子的に行う。
- ビルド失敗と配備結果不明を区別する。配備開始後の応答紛失を失敗と即断せず、結果不明中は次の配備を止める。
- 有効なCloudflare配備版と正式URL上のリリースマーカーを照合してから、既存の公開確定トランザクションで公開状態・履歴を更新する。
- CMS画面を閉じても進行・結果照合できるようにする。タイムアウトだけによる実行権の再付与はしない。
- 自動push配備とCMS公開が競合しないようにする。コードを置くブランチと、サイトへの配備を許可する起動条件を明示する。
- 検証配備先はPAF管理の `paf-site-staging` に固定する。秘密値をGit管理せず、本番用資格情報を使用しない。

## 通し確認の受け入れ

1. 端末上の旧配信ランナーとQuick Tunnelが停止した状態を確認する。
2. CMS画面からテスト記事を公開し、ホスト側の実行履歴・配備ID・公開状態・公開履歴の対応を確認する。
3. 正式URLで本文・画像・PDFを確認する。
4. 履歴参照→復元→再編集・保存→再読み込みを確認し、下書き編集だけでは公開サイトが変わらないことを確認する。
5. 認証拒否、同一実行の再送、候補固定、ビルド失敗と結果不明時の停止を自動テストで確認する。実環境で未確認の障害条件は残作業として明示する。

## 調査資料

- https://developers.cloudflare.com/workers/ci-cd/builds/api-reference/
- https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/
- https://developers.cloudflare.com/workers/ci-cd/builds/build-image/
- https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow

## 接続する構成

- CMS: 既存検証Worker。`STAGING_HOSTED_PUBLICATION=true` と `STAGING_DEPLOY_HOOK` を登録した場合だけ常設アダプターを選択する。設定が揃う前は既存の一時接続を維持する。
- 受付: `paf-publication-staging`。公開HTTPにはビルド専用キーを要求し、claim/activate/succeed/failだけを提供する。CMS編集や候補投入のHTTP APIは提供しない。
- 永続状態: 検証D1の `hosted_staging_jobs`。生成入力は検証R2の `staging-publication/` に保存する。ビルドの実行権と配備許可をそれぞれ一度だけ渡す。
- ビルド: `cms/scripts/run-hosted-staging.mjs`。固定した検証サイト設定を用いて生成・版アップロード・配備を実行し、有効配備版とAccess経由のマーカーを照合して結果を報告する。
- 確定: 結果報告時と受付Workerの毎分cronで既存PublicationServiceを呼ぶ。CMS画面のポーリングなしでも履歴を確定する。

## 検証接続手順

対象はPAFアカウントの `paf-site-staging` のみ。本番Workerには設定しない。

1. この作業ブランチ `codex/issue-390-hosted-staging-publication` をGitHubへpushする。
2. 検証サイトのBuildsで対象ブランチを上記に設定し、ルートは `/` とする。
3. ビルドコマンドは `pnpm --dir cms install --frozen-lockfile && pnpm --dir astro install --frozen-lockfile && sudo apt-get update && sudo apt-get install -y ffmpeg`。ffmpegの導入可否はホスト初回実行で確認する。
4. デプロイコマンドは `node cms/scripts/run-hosted-staging.mjs` とする。デフォルトの `npx wrangler deploy` は使わない。
5. ビルド変数 `NODE_VERSION=24`、`PNPM_VERSION=10.28.2`、`SKIP_DEPENDENCY_INSTALL=1` を設定する。ビルドシークレットに `STAGING_BUILD_SECRET`、`STAGING_SITE_ACCESS_ID`、`STAGING_SITE_ACCESS_SECRET` を設定する。値の正本はGit管理対象外の `cms/.env.staging-publication`。チャットや文書へ値を貼らない。
6. ビルド用APIトークンはPAFの検証配備用のものを用いる。本番用資格情報を持ち込まない。Workers Buildsのトークン注入と検証Workerへの配備権限を初回実行で確認する。
7. 自動pushビルドは無効、プレビュービルドも無効にし、対象ブランチのDeploy Hookを作成する。Hook URLは認証情報のため同じローカル秘密ファイルの `STAGING_DEPLOY_HOOK` に保存する。
8. Hookと専用キーを検証Workerへ登録し、CMSを常設アダプターへ切り替える。旧ランナー・Tunnel停止後、CMSからテスト公開する。

### 実施済み

- 検証D1に0010マイグレーションを適用し、受付Workerを配備した。
- 型検査・CMSビルド成功。Vitest 132件、Nodeテスト11件成功。
- 候補固定、二重実行拒否、配備許可の単回性、誤ったマーカーの拒否、画面なしの履歴確定、配備前失敗、HTTP認証拒否をローカルで確認。

### 未完了と制約

- Workers Buildsへのブランチ・コマンド・秘密変数・Hookの登録、ホスト上の初回実行、端末停止時の通し確認は未完了。
- `preparing`／`building`中の強制終了、配備開始後の結果報告紛失は自動再配備せず保留する。旧実行が停止済みである証拠と有効配備版を照合して復旧する運用が必要。
- R2に保存した生成入力の保管期限・削除処理は未実装。検証記事だけを使用する。
- 全件生成のまま。差分生成・他種別接続・本番移行は対象外。#390・#394・#433はクローズしない。
