# CMS共通API契約

対象 #392。CMSと同一オリジンの /api。全経路で認証・許可ユーザーを検査し、Cache-Control: no-store。認証情報はログに出さない。

| 操作 | 入出力 |
| --- | --- |
| GET /api/session | 操作者の表示情報。認証失効は401、未許可は403 |
| GET /api/contents?type=event&cursor=... | 更新順の下書き一覧。id/title/updatedAt/status/versionと次cursor。20件ずつの案 |
| POST /api/contents | operationId + type + payload → 201 {id,version,payload,updatedAt} |
| GET /api/contents/:id | 保存済みの下書き → 200 {id,version,payload,updatedAt} |
| PUT /api/contents/:id | operationId + expectedVersion + payload → 200 {version,updatedAt} |
| POST /api/contents/:id/duplicate | operationId + expectedVersion → 201 新規下書き |
| GET /api/contents/:id/history?cursor=... | 保存日時・操作者・version・保存種別、次cursor |
| GET /api/contents/:id/history/:version | 履歴の入力内容 |
| POST /api/contents/:id/restore | operationId + expectedVersion + sourceVersion → 200 新しいversionとpayload |

401: 再ログインを案内し入力保持。403: 操作を停止。404: 対象なし。409: 他の更新を通知し、自動上書きしない。413: サイズ超過。422: 項目別エラー。503: 保存不可、再試行可能。

変更要求はapplication/jsonのみとし、Originを同一オリジンに限定する。CORSで他オリジンを許可しない。未知のContent-TypeとOrigin不一致は拒否する。保存・作成・複製で公開処理を呼ばない。

Access JWTはJWKS署名・issuer・audience・期限を検証し、2人の許可リストを照合する。ヘッダー存在のみで信頼しない。Accessを通らない既定ホストにも同じ検証を適用し、可能なら既定公開経路を無効化する。プレビューやデプロイURLも保護対象。

開発用認証はlocalhost限定の独立した設定とする。本番ビルドに認証バイパスを含めない。認証解除はAccessの許可解除・セッション失効とアプリ許可リストの更新を手順化する。

保存APIに公開用snapshotの読み出し権限を共有しない。プレビュー専用API・公開プレビューURLは今回設けない。

全変更要求は操作IDを認証主体とともに記録し、同一内容の再送に元の結果を返す。更新と操作結果の記録を同じトランザクションで確定する。保存応答の喪失を競合や重複作成と取り違えない。認証期限切れに伴うログインHTML・リダイレクトも保存成功と扱わない。

種別はサーバーの登録一覧で検証する。未知・未対応の種別は422。idを使う操作の種別は保存済みレコードから取得し、クライアント指定で切り替えない。複製は同じ種別で作成し、履歴復元は保存時のpayloadSchemaVersionを検査する。
