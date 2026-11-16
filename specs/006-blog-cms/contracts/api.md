# ブログCMS API契約案

対象 #418。既存のAccess認証・許可ユーザー・no-store・同一Origin/JSON検査を継承。以下は実装済みという意味ではない。

| 操作 | 拡張 |
| --- | --- |
| GET /api/contents?type=blog&page=1&q=... | blogのみ一覧・検索・件数集計。20件、createdAt降順、同値id降順。countは検索件数、totalはブログ総数 |
| GET /api/categories | {items:[{id,name}]}の読み取り専用API案。照合済み既存カテゴリのみ |
| GET /api/tags | 既存filmTags/eventTagsを継続 |
| POST /api/contents | operationId/type:blog/payload。種別別validatorとschema、201。再送fingerprintにtypeを含める |
| GET /api/contents/:id | type/schemaと下書きを返す。画面は要求種別との一致を確認 |
| PUT /api/contents/:id | operationId/expectedVersion/payload。保存済みtypeで検証、種別変更不可 |
| POST /api/contents/:id/duplicate | 同じtype、新ID・新日時・version=1の下書き。slugは引き継がない |
| GET /api/contents/:id/history | 同じ記事の履歴と保護枠をブログの確認表示形式に変換 |
| POST /api/contents/:id/restore | operationId/expectedVersion/sourceKind/sourceId。所属・type/schema検証、保護と復元を原子的に確定 |
| POST /api/contents/:id/check-publication | expectedVersion。カテゴリ・タグ・本文・URL検査。200のokは配信成功ではない |
| GET/POST /api/contents/:id/publication | 現行実装を種別対応にする案。POSTはoperationId/expectedVersion/expectedPublicationVersion。202は受付、配信確認後に確定 |

保存・複製・履歴復元は配信しない。公開候補はサーバーが保存済み版から生成。eventアダプターしかない環境でblog公開を利用可能として表示しない。

未分類下書きは保存可、カテゴリ未選択・未知IDは公開エラー。保存形式違反は422。参照集合変更で古いIDが残る場合の表示・修復は移行設計と照合し、勝手に値を削除しない。

401/403/404/409/413/422/503、同一operationId再送の契約を継承。type/payloadが異なる操作ID再利用は409。公開失敗・結果不明・復元変換失敗では下書きと現在の公開版を保持する。

## 検索と公開接続のゲート

検索はタイトルと本文の可読テキストを対象とする案。[本文契約](body.md)のtextノード・リンク表示文字列から抽出し、JSON全体・HTML属性・保全原本を検索しない。タグ名・URL等の追加検索は対象外。すべての検索・count・totalにtype条件を付け、SQLはパラメータ化。

ルート直下の予約・転送、正式snapshot、年別一覧、差分生成は#333・#390・#394・#413に従う。eventローカル配信成功をblog公開完了にしない。公開停止は共通設計確定後に接続し、この案だけで新エンドポイントを増やさない。

## 今回接続した範囲

新規blogの一覧/可読本文検索/件数、カテゴリ取得、POST/GET/PUTを実装。categoryIdはWordPress既存term_id文字列の下書き台帳、nullは保存可、未知IDは422。ブログ本文は新規テキスト編集のv2部分集合のみ受理し、未接続の保全参照/添付ノードを新規要求から拒否する。公開用blog/v1は変更しない。既存eventのoperation fingerprintを変更せず、blogではtypeを追加して別種別の操作ID再利用を409にする。

blogのpublication GETはenabled:false。他の公開/チェック/履歴/復元はblog_operation_unavailableで422とし、event専用処理へ流さない。これらをブログ実装済みAPIと扱わない。

ブログのduplicateを共通経路へ接続。保存flush後のexpectedVersionで原子的に複製し、同一operationIdの再送は同じ応答を返す。本文/分類/フラグを保持し、slugは除去、新ID/version=1/新日時/公開状態なしで生成する。元記事が後から変わっても成功済み操作の再送で新しい複製は作らない。
