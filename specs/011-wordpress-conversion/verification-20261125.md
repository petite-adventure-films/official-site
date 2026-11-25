# #490 / #491 実装・再照合

2026-11-25、実装・検証: Codex、受入: 依頼者（画面受入は未完了）。対象ブランチは `codex/issue-338-complete-conversion`、分岐元・統合先は `version-4`（開始時 `0c23749b`）。#482の内容を確認し `496710a9` を `3a0a92c5` として取り込んだ。#482の統合先へのマージ完了を意味しない。

## 入力と結果

WordPress公開REST APIを2026-11-25 11:12:31 UTCに読み取り、837件を `.local/wordpress-conversion/public-20261125.json` に保存した。非公開・下書きは含まない。入力SHA-256は `802faeadecfdcf4bdd80805f7e11be6f46106d2209eee40250fcc8d8b27af2c3`。

[旧832件との差分](input-delta-20261125.json)は5件追加、削除なし。既存記事の差は分類の件数メタデータだけで、本文等の差はない。[記事別結果](result-20261125.json)は原文を再掲載せず、停止理由・変換回数・変換理由・原文レコードhashを記録する。個々の属性変換前後はローカルの完全レポートに残す。

| 種別 | 入力 | 候補 | 停止 |
|---|---:|---:|---:|
| ブログ | 311 | 58 | 253 |
| お知らせ | 246 | 228 | 18 |
| イベント | 236 | 236 | 0 |
| メディア掲載 | 23 | 6 | 17 |
| チャンネル | 21 | 21 | 0 |
| 合計 | 837 | 549 | 288 |

残る停止理由は画像・添付参照に関連する。未解決画像等275件、画像属性275件、画像のみのリンク12件、自サイト添付リンク12件、添付PDF13件（重複あり）。本文の装飾・コンテナ・混在動画およびイベント開催形式・HTML欄による停止は解消した。候補は最終取込manifestではなく、正式assetId・URL所有権・非公開範囲の全件照合は未実施。

独立した2回の出力 `colors-20261125-a.json` / `colors-20261125-b.json` はbyte単位で一致し、SHA-256は `e6833b012201a145c468a14ba6d76e3a67b97085e1243d1b1dc210ec8d435f8a`。全候補549件が現行CMS保存validatorに適合し、全イベント236件は公開候補生成にも成功した。

## 合意した変換

- 開催形式を推測せず `unknown` として保存する。会場情報を保持し、構造化データの開催形式・場所を推測で補わない。
- イベント3944/3945の承認済みリンクだけ `_NEW` を `_blank` にする。
- 旧コンテナの文字・段落・リンク・言語・アンカーを保持する。コピー元class/data/tabindex/aria属性の承認済み範囲を原文に保全し、公開HTMLへは適用しない。
- ブログ10297の `fbPhotoSnowliftCaption` は最初のIDだけ残す。原文と重複解消の変換記録を保持する。
- 文字色・書体は許可済み値だけを構造化して保存する。利用者合意に基づき、移行前HTMLをバックアップとしてsource.rawに残し、移行後の保存データの赤を `#d90000`、水色を `#0b75b3` に補正する。CMSと公開ページは保存値をそのまま表示し、表示時だけの色置換はしない。

## 検証

Node 24、ローカルCMS/MiniflareとAstro公開サーバー、Chromiumで確認。本番データ・R2・DNSは変更していない。

- CMS全体: Vitest 27ファイル158件成功。公開runner等のNodeテスト17件成功。失敗ビルドを意図的に発生させ旧公開版を保持するテストのエラーログは期待結果。
- 変換器・書式監査: 補正後22件成功。元HTML保持、補正後の保存値、再変換の安定性、白背景4.5以上を検証。#482参照対応: 4件成功。
- 最新837件の保存validator・イベント公開候補照合: 1件成功。
- Astroのイベント・共通本文renderer: 23件成功。
- Playwright: 旧本文と旧イベントの3件成功。保存→再読込→追記→ローカル公開、属性・構造・リンクの保持、複製を確認。動画は外部通信をテスト応答に置き換え、実サービスの再生確認ではない。
- 画面画像を目視確認。原文書式と追記箇所が表示され、イベントの不明形式・リンク編集を確認。生成画像は `cms/test-results/legacy-*.png`（ローカル生成物）。依頼者の画面受入とは区別する。

再現（出力先は未使用のファイル名にする）:

```sh
node astro/scripts/prepare-wordpress-conversion.mjs .local/wordpress-conversion/public-20261125.json .local/wordpress-conversion/recheck.json
node astro/scripts/audit-wordpress-conversion.mjs .local/wordpress-conversion/public-20261125.json .local/wordpress-conversion/recheck-audit.json
node --test astro/scripts/prepare-wordpress-conversion.test.mjs astro/scripts/audit-wordpress-conversion.test.mjs astro/scripts/prepare-wordpress-media-references.test.mjs
WP_CONVERSION_SNAPSHOT="$PWD/.local/wordpress-conversion/public-20261125.json" pnpm --dir cms exec vitest run worker/wordpress-conversion.test.ts
pnpm --dir cms test
pnpm --dir cms exec tsc --noEmit
pnpm --dir astro exec vitest run src/lib/cms-events.test.ts src/lib/released-cms-blogs.test.ts
pnpm --dir cms run test:e2e legacy-event.spec.ts legacy-body.spec.ts --project=chromium
```

## 残条件と引き継ぎ

1. #490: 赤・水色の補正を実装・検証済み。公開ページ全体のWCAG 2.2 AA評価と画面受入は未完了。
2. #373/#489: 非公開・下書きおよび英語等を含む正式な入力範囲・最終同期を確定する。今回の公開取得だけで完了としない。
3. #494: 正式assetId台帳と原本/添付対応を受け取る。サンプル台帳や架空IDでは停止を解除しない。
4. #492: 上記入力を用いて全件正式変換、状態・URL・分類・資産照合と再現性を確認し、#471へ入力/出力/hashを渡す。
5. #471: 新schemaとrendererを揃えた環境で実取込・再編集・公開の受入を行う。

T010/T012の実装検証は完了。#338・#490・#491のIssue終了、統合先マージ、正式移行は未完了。残作業の作業時間・外部待ち時間の見積は未確認。

色補正の再照合: 8記事・13箇所（資産待ちの記事を含む）の変換前後を記録。候補数と停止理由は変わらない。補正後の代表ブラウザテストでCMS・保存値・公開表示の一致を確認。
