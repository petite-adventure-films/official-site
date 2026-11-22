# 全未完了Issue台帳

2026-11-22の再計画適用後: OPEN 39件（当初38件＋新規5件−個別終了4件）。期限フィルタなしで照合する。件数を進捗率には使わない。

| 分類 | 件数 | 意味 |
|---|---:|---|
| 完了整理候補 | 1 | #335は未確認条件が残るためOPEN |
| 親・集約 | 5 | 子の結果を受領する。独立した同じ実装を数えない |
| 作業・確認が残る | 20 | 有限の終了範囲で1件ずつ進める |
| 本人・協議待ち | 7 | 開発作業中とは表示しない |
| 将来拡張 | 6 | 採用判断待ち。旧環境廃止の必須工程にしない |

## 完了整理候補（1件）

| Issue | 現在地・証拠 | 閉じる前の整理／このIssueに追加しない範囲 |
|---|---|---|
| [#335](https://github.com/petite-adventure-films/official-site/issues/335) アップロード | 当初の署名URL・R2直送・PDFは実装、検証R2でPNG/PDF確認済み | 接続単体の未確認失敗ケースを受入条件と照合する。必要ならその有限の確認だけ残す。長期監視・ローテーションを終了条件へ足し続けない。管理は#395、旧資産は#339 |

## 親・集約（5件）

| Issue | 現在地 | 終了範囲・受領先 |
|---|---|---|
| [#333](https://github.com/petite-adventure-films/official-site/issues/333) CMS基本操作 | 5タイプ基本操作済み。ただし当初から削除を含む | 本文#334・メディア#395・履歴#433・ゴミ箱#434・プレビュー#435の結果を集約。子待ちと表示。独自の再実装・横断試験を増やさない |
| [#389](https://github.com/petite-adventure-films/official-site/issues/389) 切替全体 | 未切替 | #391移行・#332切替・#341停止・#376決済・#390公開などを受領し、順序・承認・総合照合を管理。問い合わせ#472・メール#473・バックアップ#474・全体品質#475を受領 |
| [#391](https://github.com/petite-adventure-films/official-site/issues/391) 移行全体 | 取得#337済み、正式取込未実施 | #338変換・#339旧添付・#373非公開と正式取込の結果を受領。全体件数・公開状態・URL集合・欠損例外を照合。子の変換器を再実装しない |
| [#398](https://github.com/petite-adventure-films/official-site/issues/398) 全体方針 | 全体トラッカー | 全体の終了判定と各担当の所在と旧Nuxt更新の配備要否を管理。自身を大きな実装Issueにしない。旧Phase番号を現在の実行順に使わない |
| [#405](https://github.com/petite-adventure-films/official-site/issues/405) 依存調査 | #411済み、#412協議待ち | 調査結果・判断・担当の対応を#389へ渡して終了。契約やメール移設の実行は抱えない |

## 作業・確認が残る（20件）

| Issue | 現在地 | このIssueの終了範囲 | 依存／重複を外す先 |
|---|---|---|---|
| [#332](https://github.com/petite-adventure-films/official-site/issues/332) 本番切替 | 未実施、旧Pages表記を更新済み | 切替前結果を受領し、承認後のDNS・Web/メール到達・切戻し確認 | 全体順序#389、停止#341。問い合わせ・決済の実装を持たない。今回操作しない |
| [#334](https://github.com/petite-adventure-films/official-site/issues/334) 本文編集 | 基本編集、添付、保存・再編集済み | HTML貼付け・本文形式・内部リンク/動画・日本語入力の代表ケースを固定して確認・修正 | 登録#335、資産選択#395、全件変換#338、プレビュー#435、本人操作#445 |
| [#336](https://github.com/petite-adventure-films/official-site/issues/336) 生成・配備 | 5タイプ全件生成で接続済み。部分生成は設計・限定実証まで | #413承認設計の差分判定・必要HTML生成・成果物継承・完全候補・配備照合、コード資産の整合 | 制御#390、描画#394、画像/PDF契約#395。0012適用は明示した一度の環境適用項目。全件移行の完了まで抱えない |
| [#338](https://github.com/petite-adventure-films/official-site/issues/338) コンテンツ変換 | 当初のJSON出力済み。正式変換・取込が後から追加。旧ブログ対応と代表2件のローカル検証済み | 正式変換成果、旧ID/URL/添付対応、変換不能一覧の確定 | CMSへの実取込・再編集照合は#471へ引継ぎ済み。共通変換を#373も使用 |
| [#339](https://github.com/petite-adventure-films/official-site/issues/339) 旧添付移行 | #337取得済み。正式R2移行未実施 | 旧添付R2保存、hash/件数照合、旧URL→assetId→配信URLと本文参照を成立させる | 公開資産契約#395を利用。配備照合#336、公開制御#390。新規登録や復元基盤を再実装しない |
| [#341](https://github.com/petite-adventure-films/official-site/issues/341) 旧環境停止 | 未実施 | 並行期間終了・引継ぎ・保全確認後にWP/API/管理画面・Docker停止、旧サーバー停止判断 | 移行#391、DNS#332、順序と承認#389。今回停止しない |
| [#371](https://github.com/petite-adventure-films/official-site/issues/371) 応援価格撤去 | Nuxt/Astro双方に5,000円の選択肢・告知が残る | 応援価格選択肢と告知を撤去、通常価格を保持、映画ページとSHOPを確認 | #376決済移行や販売条件全体へ広げない。どの配信へ反映したか別記 |
| [#373](https://github.com/petite-adventure-films/official-site/issues/373) 非公開記事移行 | 権限付き対象件数未確認 | 対象確認・取得・状態を保つ移行・件数と閲覧制限の照合 | 共通変換#338、全体#391。0件の推測不可。停止直前の増分は#389手順 |
| [#376](https://github.com/petite-adventure-films/official-site/issues/376) 決済移行 | 旧checkout.php依存。画面移植と別 | サーバー価格/送料、Checkout、成功/中止/失敗、必要な通知のテストと本番設定手順 | 本番切替#332/#389、レンタル#343は別。本番決済・メール実送信は承認なしに行わない |
| [#390](https://github.com/petite-adventure-films/official-site/issues/390) 公開制御 | 代表公開・履歴・復元済み | 公開停止、同時更新・再送・結果不明、確定判定・復旧の共通制御 | 生成#336、描画#394、資産#395/#339。OPEN維持 |
| [#394](https://github.com/petite-adventure-films/official-site/issues/394) 正式データ描画 | 5タイプ代表接続済み | 正式データの一覧/詳細/関連/年別/URL/JSON-LD、WP直接参照撤廃、移行前後照合 | 変換#338、全体移行#391。描画実装は全件移行前に進め、最終全件照合だけ依存。OPEN維持 |
| [#395](https://github.com/petite-adventure-films/official-site/issues/395) 添付管理 | 登録・選択・挿入・alt済み | 利用箇所確認・削除保護、選択画面の不足、公開用画像/PDF契約と版互換 | 登録#335、旧資産取込#339。削除保護は当初からの要件で落とさない |
| [#400](https://github.com/petite-adventure-films/official-site/issues/400) 旧バックアップ質問 | 回答証拠なし | 189GB→15GB、構成差、転送失敗の根拠と保存対象を回答 | #337の添付取得、#397のCMS復元とは別。現物・ログ不足は必要資料として限定して依頼 |
| [#402](https://github.com/petite-adventure-films/official-site/issues/402) Chargeflow質問 | 回答証拠なし | 提示画面の権限・共有内容と不明点を回答 | 導入・解除・包括監査へ広げない |
| [#433](https://github.com/petite-adventure-films/official-site/issues/433) 履歴・復元 | 5タイプ代表操作、27件＋ブラウザー8件の開発検証済み | 開発検証の済チェック反映済み。不足する実記事コピー・実環境の具体的ケースだけ確認 | 全件旧記事#338/#394、本人操作#445、0012適用#336。OPEN維持 |
| [#434](https://github.com/petite-adventure-films/official-site/issues/434) ゴミ箱 | 未実装。30日保持の合意へ本文を整合済み | 5タイプの移動・一覧・復元・期限後削除、権限/競合/再送・参照整合 | foundation planの30日合意を先に照合。公開停止#390、添付保護#395を利用。#397を再開しない |
| [#435](https://github.com/petite-adventure-films/official-site/issues/435) 認証プレビュー | 未実装 | 共通Astro描画、下書きの認証外漏洩防止、公開状態不変、5タイプ照合 | #394の必要な共通描画処理を使う。サイト全件移行完了を開始条件にしない |
| [#448](https://github.com/petite-adventure-films/official-site/issues/448) コピー表記 | 小さな追加機能、未実装 | 新規コピーのタイトルに表記、元記事不変、編集可能、対応タイプ確認 | 既存コピーの遡及変更を含めない。複製基盤を未実装扱いにしない |
| [#449](https://github.com/petite-adventure-films/official-site/issues/449) 横断照合 | PR #450〜#456で主要ページ・73号棟ほか限定点検済み | 古いPR/点検状態は更新済み。限定点検の残る調査・相談・未確認の所在を確定 | 具体的残件：JASRACリンク、イベント18010公開状態、PDF環境、カート完了到達、フォーカス、配備先404/検索制御。相談すべての解決や全件移行まで抱えない。詳細台帳を維持 |
| [#475](https://github.com/petite-adventure-films/official-site/issues/475) 全体品質評価 | 新規割当・未実施 | 既存証拠を再利用しWCAG A/AA全基準・主要操作・情報公開を評価、不適合を修正単位へ分割 | 限定点検#449・描画#394と重複させず、#389へ結果を渡す |

## 本人・協議待ち（7件）

| Issue | 済んだこと | 残り・終了条件 |
|---|---|---|
| [#412](https://github.com/petite-adventure-films/official-site/issues/412) 契約調査 | 手順・待ち時間はPR #465で調査済み | 監督協議で操作者・承認者・登録移管先を決め、手順への影響を記録。契約実行を追加しない |
| [#427](https://github.com/petite-adventure-films/official-site/issues/427) 本人ログイン | 開発者・利用者は到達済み | 監督本人のコード受信→一覧到達を確認。編集・公開全体は#445 |
| [#445](https://github.com/petite-adventure-films/official-site/issues/445) 監督操作会 | 代表記事・検証反映・紹介URL・保全・利用者実機再生済み | 当日前最終確認、本人操作、相談の決定/保留/担当を記録して終了。相談内容の全実装まで持たない。未統合PR #457を照合 |
| [#471](https://github.com/petite-adventure-films/official-site/issues/471) 正式CMS取込 | #338から実取込・代表再編集の責任を分離 | 正式取込環境・実行承認を確定後、ID/件数/状態/添付・再実行と代表再編集を照合し#391へ |
| [#472](https://github.com/petite-adventure-films/official-site/issues/472) 問い合わせ移行 | #411/#389/#332から送信処理の責任を分離 | サービス・送信元/宛先合意後、送信/返信/失敗/迷惑送信対策を試験し#389へ |
| [#473](https://github.com/petite-adventure-films/official-site/issues/473) メール移設 | #412の調査と実移設を分離 | 提供先・操作/承認担当を確定し、承認後に移設・受信/送信・切戻しを確認し#389へ |
| [#474](https://github.com/petite-adventure-films/official-site/issues/474) 継続バックアップ | #397の復元基礎を利用し継続運用を割当 | 費用・保存先・担当・保持等を合意し、定期取得/通知/独立保管/復旧を検証し#389へ |

## 将来拡張（6件）

| Issue | 採用された場合の範囲 | 境界 |
|---|---|---|
| [#302](https://github.com/petite-adventure-films/official-site/issues/302) 自動翻訳 | 対象・確認方法から決定 | 既存英語の保全とは別 |
| [#342](https://github.com/petite-adventure-films/official-site/issues/342) Stream | 動画配信基盤 | レンタル構想との採用判断。home.mp4容量問題は解決済み |
| [#343](https://github.com/petite-adventure-films/official-site/issues/343) レンタル | 購入・視聴URL・通知・期限 | 物販#376と別 |
| [#344](https://github.com/petite-adventure-films/official-site/issues/344) 英語経路 | /en/とhreflang | 旧英語URL・内容の保全を先送りする理由にはしない |
| [#345](https://github.com/petite-adventure-films/official-site/issues/345) CMS英語欄 | 多言語編集 | 既存英語データの移行と別 |
| [#388](https://github.com/petite-adventure-films/official-site/issues/388) 予約公開 | 予約・時刻・実行・再試行 | 通常公開#390の終了条件にしない |

## 個別の終了判定（4件・OPEN集計外）

| Issue | 根拠と終了範囲 | 残作業の受領先 |
|---|---|---|
| #273 | #340/#393・PR #399の静的生成・旧URL照合でタイトルの目的を満たす。元詳細意図は不明と明記 | 正式移行#391、本番切替#332 |
| #280 | PHP更新保留の回答と監督了承。PHP更新実施とはしない | 旧バックアップ質問#400 |
| #290 | 質問票の回答・提出と取引継続の報告。審査合格通知を確認したとはしない | 新決済#376 |
| #436 | PR #439統合・監査・回帰・配備前未確認事項の記録で元の完了条件を達成。#469もmain統合済み | 旧配信への更新反映は未確認。要否・担当は#398で判断し、必要なら独立Issue化 |

GitHubの各本文に証拠・境界を記録して個別にCLOSEDへ変更。#335は実環境の失敗ケース・初期運用設定等を残してOPEN。#390/#394/#433はOPEN維持。既存の完了Issueは再開していない。
