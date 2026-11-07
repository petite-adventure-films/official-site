# ブラウザーでの検証

`astro/` で実行する。

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm exec lefthook install
pnpm run test:e2e
pnpm run test:e2e:report
```

初回セットアップ時に `lefthook install` でGitフックを登録する。開発中は `pnpm run test:e2e` で確認し、ファイル変更を含むpush時にもpre-pushフックが同じテストを実行する。失敗した場合はpushを停止する。フックだけを確認する場合は `pnpm exec lefthook run pre-push --force` を実行する。

通常の公開ページをビルドし、専用ポート4325でpreviewを起動する。既存サーバーは再利用しない。ビルド先は `.e2e-dist/` とし、通常の `dist/` と分ける。

日付依存の一覧を安定して確認するため、E2Eビルドだけ `fixed-date.mjs` で2026年11月7日（日本時間）に固定する。保存済みの `data/wordpress-export.json` を使用し、データ更新時には期待する内容も確認する。

ChromiumのPC・360px幅で月別タブ、キーボード操作、カードから詳細への遷移、年別一覧の折り返しを検証する。テストは見た目の完全一致やWCAG全項目の適合を保証しない。

PRでは `Astro E2E / Playwright (Chromium)` が実行される。Actionsの `playwright-report` 成果物をダウンロードするとHTMLレポートと失敗時のスクリーンショット・トレースを確認できる（保存期間7日）。ローカルでは `playwright-report/` と `test-results/` に出力する。
