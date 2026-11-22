# 公開成果物のデータ案

対象 #413。実装schemaではなく#336/#394への設計契約。

| データ | 必要項目・関係 |
| --- | --- |
| 公開基準 | release ID、確定入力hash、全成果物manifest hash、コード/lock/設定/schema識別子、JST生成基準日 |
| 固定候補 | operation ID、attempt、内容ID/type、旧/新公開入力、公開基準ID。保存中の下書きは再読込しない |
| ルート台帳 | canonical path、状態（HTML/転送/除外）、表示入力hash、依存する記事/分類/日付/資産、出力ファイルhash |
| 生成計画 | 基準manifest hash、create/render/delete/retainの互いに矛盾しないパス集合、理由。転送元とHTMLの同時所有を拒否 |
| 完全成果物manifest | 全配信ファイルの正規化パス、サイズ、SHA-256、MIME、必要資産参照。パストラバーサル・重複・25MiB超を拒否 |
| 配備記録 | 候補manifest hash、marker自身を除いた内容manifest hash、provider version ID、活性化状態、deployment ID、確認地点/時刻/marker。CMSの履歴とは関係付けるが別データ |

内容manifestは`__release.json`を除いたファイルをパス順に並べ、パス・サイズ・MIME・SHA-256を決まった形式で直列化してhash化する。そのhashをmarkerへ入れた後、marker自身も含む完全配信manifestを作る。完全manifestは配信ディレクトリ外へ保全し、自身のhashを自身やmarkerに埋め込む循環を作らない。markerの内容一致と完全manifestの全実体照合は別々に検査する。

## 状態

`fixed → planned → built → verified → uploaded → activating → observed → confirmed`。

活性化前の失敗は現行版を変えない。活性化後に結果が確定しない場合は`unknown`とし、既存の直列化を解除しない。配備照合後にだけ確定版と履歴へ進む。基準版の不一致は古い差分を破棄し再計画する。

公開停止は新候補から詳細URLを除外する操作で、元本文・添付・履歴の削除ではない。新規slugは現行URL・旧転送元・固定ルート・将来の年別予約パスと衝突しないことを確認する。

資産は不変ID/内容hashで扱い、参照がなくなってもこの処理で物理削除しない。公開可能状態・配信互換・削除/保全は#395/#339/#397の責任とする。
