# 端末に依存しない検証配信（#390・#394・#433）

状態: Workers Builds方式を実装中。検証専用のビルド資格情報・ブランチ・コマンド・秘密変数・Deploy Hookを登録済み。自動pushビルドとプレビューは無効。端末ランナー停止中のCMS操作からホスト配備・公開状態・履歴生成まで成功。正式URLと添付のHTTP検査も成功。利用者の画面確認報告と古い履歴からの復元記録を確認。復元後の再編集・保存は検証DBで確認。追加公開で結果不明が発生し、証拠照合後に手動復旧した。再発防止は残課題。

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
3. ビルドコマンドは `pnpm --dir cms install --frozen-lockfile && pnpm --dir astro install --frozen-lockfile && npm install --prefix /tmp/paf-staging-build-tools --no-audit --no-fund ffmpeg-static@5.3.0 && /tmp/paf-staging-build-tools/node_modules/ffmpeg-static/ffmpeg -version`。ホストにはsudoがなくapt-getの書き込み権限もないため、作業領域に固定バージョンのffmpeg-staticを導入する。
4. デプロイコマンドは `PATH="/tmp/paf-staging-build-tools/node_modules/ffmpeg-static:$PATH" node cms/scripts/run-hosted-staging.mjs` とする。デフォルトの `npx wrangler deploy` は使わない。
5. ビルド変数 `NODE_VERSION=24`、`PNPM_VERSION=10.28.2`、`SKIP_DEPENDENCY_INSTALL=1` を設定する。ビルドシークレットに `STAGING_BUILD_SECRET`、`STAGING_SITE_ACCESS_ID`、`STAGING_SITE_ACCESS_SECRET` を設定する。値の正本はGit管理対象外の `cms/.env.staging-publication`。チャットや文書へ値を貼らない。
6. ビルド用APIトークンはPAFの検証配備用のものを用いる。本番用資格情報を持ち込まない。Workers Buildsのトークン注入と検証Workerへの配備権限を初回実行で確認する。
7. 自動pushビルドは無効、プレビュービルドも無効にし、対象ブランチのDeploy Hookを作成する。Hook URLは認証情報のため同じローカル秘密ファイルの `STAGING_DEPLOY_HOOK` に保存する。
8. Hookと専用キーを検証Workerへ登録し、CMSを常設アダプターへ切り替える。旧ランナー・Tunnel停止後、CMSからテスト公開する。

### 実施済み

- 検証D1に0010マイグレーションを適用し、受付Workerを配備した。
- 型検査・CMSビルド成功。Vitest 132件、Nodeテスト11件成功。
- 候補固定、二重実行拒否、配備許可の単回性、誤ったマーカーの拒否、画面なしの履歴確定、配備前失敗、HTTP認証拒否をローカルで確認。

### 未完了と制約

- CMS操作から端末不要の配備・履歴確定は成功。古い履歴からの復元は確認済み。復元後の再編集保存の最終確認は未完了。
- ffmpeg-static本体は5.3.0に固定したが、導入用の依存ロックファイルと配布バイナリの検証値をリポジトリで固定する対応は残る。
- `preparing`／`building`中の強制終了、配備開始後の結果報告紛失は自動再配備せず保留する。旧実行が停止済みである証拠と有効配備版を照合して復旧する運用が必要。
- R2に保存した生成入力の保管期限・削除処理は未実装。検証記事だけを使用する。
- 全件生成のまま。差分生成・他種別接続・本番移行は対象外。#390・#394・#433はクローズしない。

### 接続確認（2026-11-19）

- `PAF staging builds setup` は設定操作用、`PAF staging deploy` は配備用として分離。既存の `official-site build token` は検証ビルドから外した。
- `paf-site-staging` の対象ブランチを `codex/issue-390-hosted-staging-publication` に固定。自動pushとプレビュービルドはAPIで無効を確認。
- Hookを検証CMS・受付Workerのシークレットへ登録。公開候補なしのビルド `74b0af47-bd04-4bb0-9082-85679b76d6b2` が成功し、専用処理が `idle` で正常終了。ビルド資格情報の注入と受付Workerへの認証成功を確認。実際の版アップロード・100%配信切替も下記の公開試験で成功。
- 検証CMSの型検査・ビルド成功。接続コードを検証CMSへ配備。旧端末ランナー・Quick Tunnelのプロセスは停止済み。検証DBに未完了の公開操作はない。
- 前回pushで起動した本番Worker側の既存非本番ブランチビルド `d4ebdc9d-26c1-4c6f-95da-4ae05e081c00` は失敗終了。実際の本番配備は2026-10-21の `08498b1f-2ce8-4da4-bf92-5142f229feb3` のままであることを読み取り確認した。本番側の設定は変更していない。

- 検証サイトは匿名302・Service Auth 200を維持。検証CMSの `STAGING_HOSTED_PUBLICATION=true` をシークレットとして設定し常設経路へ切り替えた。
- ブラウザー操作制限のため、CMSの公開クリックは利用者が実施した。以下の配信・履歴結果はAPIと検証DBの読み取りで確認した。

### 常設経路の公開試験（2026-11-19）

- テスト記事: `7ce968f9-e031-4c47-a9c8-3f479eb6233c`。正式URLは検証サイトの `/staging-blog-check-20261119/`。
- Build: `d8a6a4b0-bb2e-4ef8-91c2-7fbd9c3ef9bd`、成功。
- 公開操作: `fe1033f4-176a-416c-b9bc-13b9a79c0889`、attempt 1。ジョブと公開操作がともに `succeeded`。
- Worker version: `87a6c82c-2063-4aa4-983e-c49bd5b26f26`、100%。Deployment: `c76abd46-838c-4d16-ab32-8c272e90b1e1`。
- リリースマーカー: `fe1033f4-176a-416c-b9bc-13b9a79c0889-1`。hash `fe9431e8ab9234dc15f6136321719086e5b1108b9b2fe7a1a8cfe2dcae4bbe8d` がジョブと一致。
- 公開履歴version 2: `0b5c0700-46d1-4609-8c53-4178fe604d06`、2026-11-19T14:17:26.857Z。手動DB更新による成功確定は行っていない。
- 正式URLは200。公開操作時の保存済みタイトルと本文（復元後の追記を含む）がHTMLに反映。
- PNG: 200 / image/png / 126 bytes。PDF: 200 / application/pdf / 351057 bytes、元の公開資料とバイト一致。両添付とも匿名アクセスは302でAccessへ転送。
- 同時点の本番配備は `08498b1f-2ce8-4da4-bf92-5142f229feb3` のまま。#390・#394・#433はオープンを維持。
- ブラウザー上の本文・画像・PDF表示、履歴参照→古い公開版の復元→タイトル追記・保存→再読み込みは利用者へ依頼中。HTTP成功だけで画面確認済みとはしない。

### 最終画面確認の照合（2026-11-20）

利用者から画面確認について「問題なさそう」との回答あり。11月20日22:29:53 JSTの復元操作を検証DBで確認。復元元は公開履歴version 1（`728fb712-91d0-478d-bd53-86d2a95a21ef`）、下書きはversion 7、タイトルは「Cloudflare通し確認 2026-11-19（検証専用）」へ戻った。

その後のタイトル追記・保存はまだ記録されていないため、再編集・保存・再読み込みの完了は未確認。公開サイトは復元前の公開タイトルとリリースマーカーを維持し、公開履歴も2件のまま。復元が公開版を書き換えないことを確認した。

### 結果不明による公開ボタン停止と復旧（2026-11-20）

利用者の追加公開操作 `0c186569-8c29-4669-9970-c2b9f4e63e1e` に対応するBuild `54a8ffa1-53a1-408a-9e29-2b9241f317cb` が `unknown` で終了。ジョブは `activating` のため、CMSが二重公開防止で公開ボタンを無効化していた。編集有無や保存前であることが無効化理由ではない。

停止済みビルドであること、有効配備 `b945bf39-addc-4ccc-85a8-35fbd86b635c` がversion `1023d04c-9b9c-447e-bc2e-e61b0aae730c` 100%であること、配信マーカーの操作ID・hash `69a71d4464fa04625f3d375592d2cd3fa06b4b68bb9c4dd1fde757edcab3f36e` がジョブと一致することを確認した。そのうえで既存の認証付きsucceed APIへ同じ実行の成功を再報告し、再照合・公開確定を実施。再配備や手動の成功DB更新は行っていない。公開操作はsucceeded、公開履歴version 3を確認。

復元後の下書き編集・保存も確認できた。下書きversion 14、更新2026-11-20T13:35:19.709Z、タイトル末尾は `hukugensss`。復旧によって下書きを上書きしていない。

残課題: 今回のログはunknownのみで、配備後のどの照合・応答が失敗したか特定できない。成功確認の一時的な不一致・通信失敗を再照合する処理、本文・秘密値を含めず失敗段階を記録する処理、自動復旧の条件を整備する。今回の手動復旧で再発防止まで完了とはしない。

### 二度目の結果不明と復旧

公開操作 `24e69249-f8a4-40f4-be5a-8f24b64f94b6`、Build `baeabea6-35da-408e-bedc-f1f4de95ac6a` もunknownで停止。今回は候補version `c726b3d8-cca0-41ec-a09c-387975e637b2` のアップロードと配備許可は済んでいたが、有効配信は前回版のままだった。従って前回と同じ成功再報告だけでは復旧できない。

ビルド停止と現在の有効版を確認し、利用者が公開した固定候補versionのみを検証Workerへ手動で100%配備。Deployment `b2392de3-2fbe-4bce-ab0d-321b7f75df12` と候補versionの一致を確認して既存succeed APIへ報告し、APIのマーカー照合を経て公開操作succeededを確認。下書きからの候補再生成や本番配備は行っていない。

自動処理の停止原因は現行ログだけでは未特定であり、常設配信の安定運用を完了扱いにしない。手動復旧は再発防止の実装ではない。

### 停止対策の検証中

- 配備許可応答は単回の許可更新だけで返す。終端状態を持たないactivateで履歴の再照合を呼ばず、無関係な後処理失敗で許可応答を失わないようにした。
- ビルド側は段階名・試行回数・許可リストにある数値コード／固定メッセージだけを記録する。本文、秘密値、コマンドや外部ツールの生出力はログに出さない。
- 配備コマンドは繰り返さない。応答を失っても、有効版と固定リリースマーカーの読み取り照合を最大12回（間隔5秒）行う。完全一致だけを成功とし、一致しなければunknownを維持する。
- 同じ確定結果の成功報告は最大6回（間隔5秒）再送する。受信側の冪等性により、履歴の重複生成や再配備は起こさない。配備前失敗の報告は最大3回。
- ローカル検査: Vitest 21ファイル133件、Node 14件、型検査に成功。実Cloudflareでの連続公開確認は未完了であり、過去の停止原因の特定・再発防止完了とはまだ扱わない。
