# CMS共通設計の選定理由

対象 #392。Access + D1の構成は確認済み。外部設定・契約変更は未実施。詳細な導入条件は設計・導入時に確認する。

## 認証と実行環境

Decision: CMS専用Worker + Accessの2メールアドレス限定認証を推奨する。
Rationale: 公開サイトの静的アセットから管理用APIと下書きを隔離し、独自パスワード管理を省ける。現行wranglerには静的assets設定のみで、CMS認証はまだない。
Alternatives: 独自メール認証は送信・セッション・復旧の保守が増える。既存IdPログインは両者の利用アカウントが判明すれば比較できる。

公式: [メールコード](https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/)、[JWT検証](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)、[セッション管理](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/)。許可メール、管理者の復旧手段、ホスト名、契約・費用は導入前に確認する。

## 保存

Decision: D1と条件付き更新を推奨。下書き用スキーマを公開用から分離する。
Rationale: 2人による同時編集をversion比較で検知できる。現行eventスキーマの必須項目は入力途中の保存と合わない。保存は公開処理を起動しない。
Alternatives: ローカルJSONはローカル検証には使えるが、Workerの永続保存には外部ストレージが必要。保存ごとのGit commitは編集と公開を結びつける。

[D1の更新件数・prepared statements](https://developers.cloudflare.com/d1/worker-api/prepared-statements/)を用いて、1件更新できた場合だけ保存成功とする。操作IDを作成・更新・複製に付け、応答喪失後の再送も同じ結果を返す。

## 復旧

Decision: SQL/JSONの取り出しと別DBへの復元検証を必須にする。外部保管先・頻度・保持期間は#397で確認。
Rationale: D1固有の復旧機能だけに依存せず内容を取り出せるようにする。
Alternatives: Time Travel単独は長期保全の代わりにしない。保持期間はFree 7日、Paid 30日。

公式: [export/import](https://developers.cloudflare.com/d1/best-practices/import-export-data/)、[Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/)、[上限](https://developers.cloudflare.com/d1/platform/limits/)。export中に利用が制限される可能性を保存失敗の処理・実施時間に考慮する。

## プレビューと入力

Decision: 編集画面から別タブを開き、公開ページと同じレイアウト・見た目で現在の入力を確認する。今回は非活性ボタンによる動線の確保までとし、表示機能は後続実装とする。
Rationale: 公開時の見え方を編集画面と見比べることが目的。CMS内で入力内容を並べるだけでは目的を満たさない。
未決事項: 未保存データの受け渡し、プレビューURLと認証、公開ページとの描画共有方式を実装前に設計する。保存済みだけの表示では合意した要件を満たさない。

## 公開接続の調査

静的Astro＋Cloudflareの既存設定を使う設計案と公式資料の根拠は [公開接続](contracts/publication.md) に記載する。静的配信の更新とCMSのD1は別の確定処理なので、配信結果の照合を持つ。動的配信への切替は今回採用せず、変更範囲と運用負担を増やさない案とした。新しい外部接続の導入条件は未確定であり、技術案を配備済みとは扱わない。
