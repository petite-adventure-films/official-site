# 新規画像・PDFの登録と本文挿入

対象 #418 / #395。利用者の続行指示に基づく実装範囲。旧メディア移行、本番R2設定、削除、Astro接続、プレビューは含めない。プレビューはCMSとAstro接続の後に実施する。

## 保存と検証

登録要求にoperationId、元ファイル名、MIME、サイズ、SHA-256を含める。同一利用者・同一operationIdの同一要求は同じ登録へ戻し、異なる要求は409。サーバーが不変asset IDを発行する。

短時間有効な署名付きPUTで非公開R2の一時キーへ直接送信する。登録確定APIで実体のサイズ、SHA-256、形式を検証し、既存asset/v1に沿った `originals/{hash先頭2文字}/{hash}.{拡張子}` へ保存する。本文が参照できるのは確定したassetのみ。一時URLで確定ファイルを上書きできない。ローカルだけはR2エミュレーターへの専用PUT経路で検証する。

初回はPNG/JPEG/GIF/WebP（10 MiBまで）・PDF（20 MiBまで）。画像寸法をサーバーで取得し、SVG/HTMLや申告形式と異なる実体は拒否する。形式検査はマルウェア検査を意味しない。PDFはCMSで添付ダウンロード扱い。公開配信と画像派生版は後続。

一覧は認証内で種別・元ファイル名検索、20件ずつ。画像の代替テキストは挿入箇所のattrs.altに保存する。本文はassetImage（assetId/alt）、PDFはassetLink mark（assetId/assetKind=document）を使用し、storageKeyや一時URLを本文へ保存しない。保存APIでasset存在・種別を照合する。

## 操作

本文の画像/PDFボタンから登録済み一覧を開き、新規ファイルも登録できる。画像は代替テキスト、PDFはリンク文字列を入力して挿入する。失敗時は本文を変更せず再試行可能。再読込・複製でも参照を保つ。既存の外部PDFリンクは従来の通常linkのまま保持する。

Figma本文153:166、既存ダイアログ66:388を2026-11-16にMCPで確認済み。メディア選択は新しい代表状態として確認対象。共通Layout/Field、MUI入力・ボタン、cms用途別余白を使う。

## 確認

空一覧→登録→挿入→保存→再読込→複製、PDF選択、検索、送信失敗・同じ要求の再送を確認。APIで不明asset/種別不一致/サイズ超過/形式偽装/hash不一致/未確定参照/期限切れを拒否する。既存ブログ・イベント保存と複製を回帰確認する。

参照: [R2署名URL](https://developers.cloudflare.com/r2/api/s3/presigned-urls/)、[Workers R2 API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)。本番のバケット・CORS・署名資格情報は別途設定と実環境確認が必要。

空一覧のFigma代表案: [181:1879](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=181-1879)。既存MUI/Section/Fieldのインスタンス15、標準Slot 3、Roboto、画面直下textなしを検査。利用者レビューと選択後状態の設計照合は後続。

## API

| 経路 | 操作 |
| --- | --- |
| `POST /api/media/uploads` | operationId/filename/mimeType/sizeBytes/sha256から登録を開始。id/uploadUrl/headers/expiresAt、または確定済みassetを返す |
| `POST /api/media/:id/complete` | 実体を検証してasset/v1を確定。再送時も同じasset |
| `GET /api/media?kind=image\|document&q=…&page=1` | 確定assetのitems/count/page |
| `GET /api/media/:id/file` | 認証内で実体を取得。PDFはattachment |
| `PUT /api/local/media/:id` | ローカルentry限定の一時ファイル送信。本番に存在しない |

ユーザー・Originは既存CMSと同じ検証を使う。登録要求の差し替えは409、期限切れ410、不正形式/参照422、容量超過413、未設定503。確定済みのassetはCMSの認証済み編集者間で利用でき、未確定の登録は開始した利用者のみが確定できる。
