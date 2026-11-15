# 共通スキーマとイベントCMSの対応

対象Issue #409（親 #396）。現行実装の照合結果。

| 対象 | 現行の扱い | 互換性上の注意 |
| --- | --- | --- |
| 記事ID・slug | 記事IDはサーバー発行の不変UUID。初期slugはUUIDで、公開URLのslugは手動変更可能 | 旧URLの予約は `0007_publication_urls.sql`。WordPressの旧記事IDと現行UUIDの対応は移行時に別途保持する |
| 日付・時刻 | 開催日は公開用のISO日付、時刻の説明はテキスト。表示はAsia/Tokyo基準。公開・更新時刻は開催日と別 | 開催日の値を日時に読み替えてタイムゾーン変換しない |
| content record / revision | 共通v1は `workingRevisionId` / `publishedRevisionId` を参照する。現行CMSは下書き、公開リビジョン、復元時の保護下書きを別に保持する | 共通v1の列挙値や必須項目を現行データに直接適用しない |
| 公開履歴 | 記事ごとに直近3件を保持（`0006_history_names.sql`）。復元時の保護下書きは公開履歴とは別枠（`services/restore.ts`） | 復元で編集中の下書きを保護し、選択した内容を次の下書きとして扱う |
| snapshot | 公開サイトへの現行出力は `cms-events/v1`。公開確定済みのイベントとタグを含み、ペイロードは `event-publication/v1` | 汎用 `snapshot.schema.json` と別形式。公開出力には下書きや保護下書きを含めない |
| 状態 | 共通v1には `scheduled` / `archived` がある。現行イベントの開催状態は `normal` / `postponed` / `cancelled` | 開催状態を公開状態へ変換しない。公開予約・アーカイブを現行イベントで実装済みとは扱わない |

下書きと公開ペイロードの検証は現行の型とスキーマを参照する。旧共通v1を読み取る既存データには旧定義を維持し、現行の出力を検証する定義は形式とバージョンを明示する。旧IDとUUIDの対応づけは #391 で取り扱う。

## 公開出力の検証

公開サイトが使うJSON Schemaは `packages/content-schema/schemas/cms-events.schema.json`、対応する型は `types/cms-events.ts`。既存サンプルは `astro/fixtures/cms-events.json`。URLの衝突、タグ参照、実在する日付は既存の公開サイト側の検証で確認する。
