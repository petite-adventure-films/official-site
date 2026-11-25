# CMS共通API契約

対象 #392。CMSと同一オリジンの /api。全経路で認証・許可ユーザーを検査し、Cache-Control: no-store。認証情報はログに出さない。

| 操作 | 入出力 |
| --- | --- |
| GET /api/session | 操作者の表示情報。認証失効は401、未許可は403 |
| GET /api/contents?type=event&page=1&q=... | 作成日時の新しい順の一覧。id/title/createdAt/updatedAt/status/versionと一覧表示用タグを返す。1ページ20件。応答は {items,page,pageSize:20,count,total}。countは検索結果、totalは全記事数。同一createdAtではid降順。pageは1からの整数 |
| GET /api/tags | {filmTags,eventTags}。各要素はid/name/kind |
| POST /api/contents | operationId + type + payload→ 201 {id,version,payload,updatedAt} |
| GET /api/contents/:id | 保存済みの下書き → 200 {id,version,payload,updatedAt} |
| PUT /api/contents/:id | operationId + expectedVersion + payload→ 200 {version,updatedAt} |
| POST /api/contents/:id/duplicate | operationId + expectedVersion → 201 新規下書き |
| GET /api/contents/:id/history | kind・対象ID・日時・操作者。protectedDraftを先頭に最大1件、publicationを新しい順に最大3件 |
| GET /api/contents/:id/history/:kind/:sourceId | 種別を区別した履歴・保護データの内容 |
| POST /api/contents/:id/restore | operationId + expectedVersion + sourceKind + sourceId → 200 新しいversionとpayload |

401: 再ログインを案内し入力保持。403: 操作を停止。404: 対象なし。409: 他の更新を通知し、自動上書きしない。413: サイズ超過。422: 項目別エラー。503: 保存不可、再試行可能。

下書き保存では公開用の必須項目・日付整合性を保存拒否条件にしない。空欄・途中入力・不正な日付も保存し、取得時に同じ入力内容を返す。保存用のデータ形式違反・容量超過は従来どおり422/413で拒否する。入力上の問題が残っていても永続保存に成功した応答は成功として扱い、公開可否とは分ける。

変更要求はapplication/jsonのみとし、Originを同一オリジンに限定する。CORSで他オリジンを許可しない。未知のContent-TypeとOrigin不一致は拒否する。保存・作成・複製で公開処理を呼ばない。

自動保存と保存ボタンは同じ下書き保存APIを使い、どちらも公開履歴を作成しない。履歴GETは公開成功した版と復元前保護をkindで区別し、統合リスト用に返す。publicationは「公開済」、protectedDraftは「編集中」に対応する。現在の編集中フォームを履歴として返さない。restoreは競合検査、復元前の下書き保護、下書き更新、操作ID記録を原子的に確定する。公開履歴の生成・3件への整理は公開機能側の契約とし、下書き保存APIから公開を指示できない。restoreはsourceKindに応じて公開版または保護データを参照し、対象記事の所属を検証する。保護枠は復元成功時に直前の下書き1件へ置き換える。protectedDraftからの復元は置き換え前の内容を読み出してから入れ替える。保持・入れ替えの詳細は [データ設計](../data-model.md#履歴の保持) に従う。失敗・競合時は下書きと保護枠の両方を維持し、同一操作IDの再送では再度入れ替えない。

Access JWTはJWKS署名・issuer・audience・期限を検証し、2人の許可リストを照合する。ヘッダー存在のみで信頼しない。Accessを通らない既定ホストにも同じ検証を適用し、可能なら既定公開経路を無効化する。プレビューやデプロイURLも保護対象。

開発用認証はlocalhost限定の独立した設定とする。本番ビルドに認証バイパスを含めない。認証解除はAccessの許可解除・セッション失効とアプリ許可リストの更新を手順化する。

保存APIに公開用snapshotの読み出し権限を共有しない。プレビュー専用API・公開プレビューURLは今回設けない。

全変更要求は操作IDを認証主体とともに記録し、同一内容の再送に元の結果を返す。更新と操作結果の記録を同じトランザクションで確定する。保存応答の喪失を競合や重複作成と取り違えない。認証期限切れに伴うログインHTML・リダイレクトも保存成功と扱わない。

種別はサーバーの登録一覧で検証する。未知・未対応の種別は422。idを使う操作の種別は保存済みレコードから取得し、クライアント指定で切り替えない。複製は同じ種別で作成し、履歴復元は保存時のpayloadSchemaVersionを検査する。


キーワード `q` はtitle/timeDescription/venue/address/access/venueNotes/fee/organizer/notesのいずれかに文字列として部分一致する条件。書式付き項目はtextノードの値で検索し、JSONキー・リンクURLを検索対象にしない。英字は大文字小文字を区別しない。タグ名・地図URL・日付・状態は検索に含めない。SQLのパラメータとして渡し、`%`や`_`もワイルドカードに解釈しない。q未指定または空文字列なら全件。

複製は保存済みのコピー元とexpectedVersionを照合し、入力payloadとpayloadSchemaVersionだけを新IDの下書きへ引き継ぐ。新しい作成・編集日時と操作者を記録し、versionは1、copied_from_idにコピー元IDを記録する。0003_duplicate.sqlでコピー元の版検査・新規下書き・操作結果の記録を同一INSERTのトリガー内で原子的に確定する。同一操作IDの再送はコピー元の現状より先に保存済み結果を返す。

## 公開・公開停止APIの設計状況

API、非同期状態、再送、配信確認、機械認証は [公開接続の設計案](publication.md) に整理した。利用者・配備運用の確認前であり、未実装。202の受付と公開成功を区別し、外部デプロイとD1更新を単一トランザクションとして扱わない。

## 公開前チェック（配信しない）

`POST /api/contents/:id/check-publication` は `{expectedVersion}` を受け、認証・同一Origin・JSON要求を検査する。保存済み下書きとversionを照合し、現在のDBのタグ集合で公開候補を検証する。検証後にも記事versionを再確認し、変更されていれば409。対象なし404、不正な要求422、認証・通信失敗は既存エラー契約に従う。

入力上の問題はHTTP 200で `{ok:false,version,issues:[{field,code,message}]}`、項目検証成功は `{ok:true,version}` を返す。これは公開要求の422とは別の検査用APIで、公開用payloadを返さず、DB・公開状態・履歴・操作記録を変更しない。slugの所有権・旧URL予約・実配信可否は未検証であり、okは確認した版の入力項目に対する結果に限る。

履歴GETと復元POSTは既存の認証・Origin制限を通して接続済み。GETは `{ version, items }` を返し、各itemは `id`, `kind`, `at`, `actorName`, `payload` を持つ。payloadは確認表示用の下書き形式へ変換した値。操作者IDや配信内部情報は返さない。未知の保存スキーマは422として取得／復元を止める。

復元POSTは上表の4項目だけを受け取り、操作者のID・表示名・時刻はサーバーで決定する。競合409、対象なし404、要求不正や未対応snapshot422。再送は同じ操作ID・要求で元の結果を返す。
