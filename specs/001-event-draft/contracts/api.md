# イベントAPIの接続

共通の認証・エンドポイント・エラー・再送・履歴の契約は [CMS共通API](../../002-cms-foundation/contracts/api.md) を参照する。

- イベント一覧は `GET /api/contents?type=event`。
- 新規作成は `POST /api/contents` に `type: "event"` とイベントpayloadを渡す。
- 取得・保存・複製・履歴・復元には共通の `/api/contents/:id` 経路を使う。
- イベントpayloadの検証は [イベントデータ設計](../data-model.md) に従う。
- プレビューはイベントの表示モデルを利用し、共通の画面内切替から呼び出す。
