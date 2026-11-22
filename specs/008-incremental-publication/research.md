# 設計調査

対象 #413。2026-11-22。11/22合意済み設計の技術根拠。アカウント・本番配信設定は変更していない。

| 判断 | 根拠・代替との比較 |
| --- | --- |
| ブログ・お知らせは静的年別一覧 | 利用者合意済み。番号付き一覧は先頭追加で後続がずれる。追加取得UIはJSなし/戻る/直接リンクの追加設計が必要なので今回採用しない |
| Astro既定描画を包んで対象だけ生成 | 現在7.4.13の型と実装を確認。既定の画像metadataを保持する。4操作の独立試験でHTML再利用後の全件一致を確認 |
| 実験的incrementalBuildは今回は採用しない | getStaticPathsのcacheKey付きページのみ再利用でき、通常の固定ページは毎回生成される。入力の正しい依存keyとキャッシュ保全は別途必要。選択対象の明示という今回の方式を置き換えたとは扱わない |
| 直前成果物を自前で保全し完全候補をupload | Workersのmanifestはversionごと。未列挙パスを自動で旧版から継承する設計にしない。変更ファイル転送の削減はHTML再生成回避とは別 |
| uploadと活性化を分ける現行経路を再利用 | 現在のhosted runnerがversion作成、活性化、配備IDとmarker照合を分離。新たな公開操作を並行で作らない |
| 全拠点の完全原子性を約束しない | version skewがある。添付の互換性は#395/#339、コード資産は#336/#390の配信契約へ明示し、満たさない候補は公開停止 |

## 一次資料

- [Astro Integration API](https://docs.astro.build/en/reference/integrations-reference/#setprerenderer-option)：既定prerendererを包むAPI。ローカルの7.4.13はStaticPathsResult/PrerenderResultのmetadataも扱う。
- [Astroの実験的incremental build](https://docs.astro.build/en/reference/experimental-flags/incremental-build/)：cacheKeyによる再利用の条件と固定ページの制約。
- [Workers Direct Uploads](https://developers.cloudflare.com/workers/static-assets/direct-upload/)：全パスのmanifestと必要blobの転送は別。
- [Versions and deployments](https://developers.cloudflare.com/workers/versions-and-deployments/)：uploadと配信切替を区別。R2/D1データはWorker版と別。
- [Version skew](https://developers.cloudflare.com/workers/versions-and-deployments/version-skew/)：伝播中の新旧版と資産の不一致。

## 確認した既存コード

`prepare-staging-release.mjs`は現在も全件buildし、入力集合hashをmarkerにする。`run-hosted-staging.mjs`と`hosted-staging-job.mjs`はclaim/prepare/upload/activate/verify/succeedを実装済み。旧ローカル専用runnerを常設配信の正本と取り違えない。

`cms-events.ts`は公開集合からイベント番号を算出。停止例では残るCMSイベントの番号が変化し、詳細HTMLも更新対象だった。`index.astro`は最新お知らせ本文、`workshop/index.astro`は最新WS報告5件を参照。年月・所属・並び・表示派生値を依存に含める必要がある。

## 検証済みと未検証

[試験結果](verification/selected-render-result.json)：タイトル変更・新規追加・slug変更・公開停止で各2ページをrenderし、旧HTMLとの合成が全件生成と一致。自動対象判定ではなく明示したルート集合による試験。新規資産、完全manifest・redirects・sitemapの合成、Cloudflareへの部分候補配備、公開停止API、年別一覧UIは未検証で、後続の実装受け入れに残す。
