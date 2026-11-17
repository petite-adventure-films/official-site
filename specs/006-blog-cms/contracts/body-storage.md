# 本文v2の保存・公開境界（レビュー案）

対象 #334 / #418、実ファイル対応 #395 / #391、公開 #394。本書と候補schemaは設計検証用。`packages/content-schema` の登録・CMS/D1/API実装・公開レンダラーは変更していない。

## 3つの保存対象

| 対象 | 内容 | 読み書き・公開 |
| --- | --- | --- |
| 編集本文 | schemaVersion:2 とdoc。意味のある書式・lang/dir・anchorId、asset参照、未解決添付参照 | 許可された編集APIで保存。公開APIへそのまま渡さない |
| 原本・保全記録 | 元HTML、取得hash、記事所属、取り込み時の位置、元ノード種別・attrs | サーバー管理の不変記録。編集APIから作成/書換不可。公開しない |
| 公開本文 | 解決済みasset、検証済みリンク・動画、限定した意味属性 | 保存済み編集版から明示的なallowlistで生成。原本・sourceRef・class/data/tabindex/ariaを出さない |

[編集候補schema](rich-text-v2.candidate.schema.json) と [公開候補schema](rich-text-public-v2.candidate.schema.json) は別IDのschemaとする。候補IDは `/proposals/` 配下で、正式登録済みのv2を装わない。既存rich-text/v1は変更しない。

既存のcontent-schema/common IDは名前付き文字列、CMS記事IDはUUIDであり、同一形式とはみなさない。assetIdは既存assetのID、sourceRefは記事に所属する保全レコードID。検証コードの `legacy_<hash>` はローカル検証の参照キーで、本番発行IDでも仮assetIdでもない。

## ノードと属性

ノードごとにattrsと子要素を限定する。text/inlineとblockを区別し、未知ノード・属性・markを拒否する。段落、h2〜h4、リスト、引用、改行、wordBreak、罫線、表の基本構造を候補schemaに定義した。実データにない表・リスト等の操作/セル結合は別途検証する。

旧div/spanはpreservedBlock/preservedInlineとし、anchorId/lang/dir以外の旧属性をsourceRef先へ移す。旧色/書体はtextStyleの限定値で表す。空の既定値を省き、任意CSS文字列や任意HTML attrsを保存しない。現候補で認める書体・サイズは実データにあるものに限る。

原本参照は、記事所属・存在・元ノード種別と利用先の整合を検査する。同一記事の保全情報でも画像参照を別種別に流用しない。sourceRefは取り込み時に固定し、編集後の位置から再発行しない。複製ではサーバー側で新記事に所属する記録を作り直し、クライアントが別記事のsourceRefを保存することは許可しない。

## 添付が未解決のとき

[添付照合](asset-resolution.md)でブログのPDF5箇所はすべて外部資料と確認した。外部PDFは通常linkで元URLを保持し、自サイトのassetへ自動取り込みしない。自サイト画像へのhrefもassetKind:imageとしてsrcとともに追跡する。

画像はunresolvedImage、自サイト画像/PDFへのリンクはassetKind付きunresolvedAssetLinkとして、元URLを持つ保全参照・alt等を保持する。下書きでのみ許可し、公開候補生成を止める。実ファイルのstorageKey/hash/サイズと旧URL→assetId台帳が確認できてからassetImage/assetLinkへ変換する。外部画像も勝手にローカルassetへ置換しない。

未解決参照を含む候補schemaの受理は、現行CMSで編集可能になったという意味ではない。正式CMSの初回移行では本文契約の「変換確認待ち」を継承し、プレビュー/編集許可条件は添付基盤と接続して確認する。

実assetIdが書かれているだけでは公開を許可しない。サーバーが存在・種別・当該操作での利用権限を解決した種別・利用許可付きの参照集合と照合する。画像へ文書assetを付ける等の種別不一致も拒否する。検証コードの合成fixture以外ではassetIdを発行していない。

## 公開時の扱い

呼出順はschema検証→意味/原本参照/asset検証→公開AST生成→公開schema検証とする。検証コードのprojection/restore単体はschema検証済み入力を前提にしており、正式APIで順序を省略しない。

- `anchorId` は検証してDOMのidへ、lang/dirは許可値のみ、書式は固定のrendererへ対応させる。旧class/data/tabindex/aria属性は公開用データから外し、保全記録に残す。
- linkは元のhrefを使う。コピー元の転送用data属性へ置換しない。targetは限定し、_blankのrelはrenderer側でnoopener/noreferrerを付ける。原本のrelをそのままHTMLへ展開しない。
- URL構文・動画provider/ID/URLの一致、許可パラメータは意味検証で確認する。JSON Schemaだけで保証しない。現検証はhttp/httpsと単一ASCIIのmailtoを対象とし、相対URL・tel・新規動画URLの正規化は正式実装前に追加検証する。
- 重複anchorIdは公開を止める。10297の `fbPhotoSnowliftCaption` は2回存在する。編集/保全には両方残し、自動的な削除・末尾番号付けはしない。本文外のページIDとの衝突も正式rendererで検査する。重複の解決方針は移行台帳で明示する。
- 旧属性を公開から外すため、コピー元CSS等に依存していた表示は別途照合する。原文の保持を、公開外観の完全一致と混同しない。

検証コードが生成するのは公開用ASTまでであり、HTML renderer・CSP・WCAG評価・公開配信を実装したものではない。

## 履歴と復元

公開用ASTからclass/data属性や原本参照を推測復元しない。公開操作のサーバー記録に、対応する不変の編集snapshotと保全記録への関係を保持する。公開履歴を復元する際はその編集snapshotを起点にし、現在の本文を保護してから復元する。公開配信データに内部snapshot参照を含める必要はない。

snapshot・保全記録・assetの参照関係を履歴保持/削除の対象に含める。編集で削除した意味属性を原本から勝手に戻さない。検証コードのrestoreは「候補形式から試作編集JSONへの逆変換」の検査であり、CMS履歴復元の実装ではない。解決済みassetを編集ノードへ戻すには実asset resolverが必要なため、現検証では明示拒否する。旧srcとassetIdを混ぜたノードを生成しない。

## 既存コードへの接続順

1. `packages/content-schema` に正式な編集/公開schemaとvalidatorを追加。候補をそのまま登録せず、未検証ノード・URL範囲・ID対応を埋める。
2. 保存route/repositoryをtype/schemaで分岐。更新は保存済み種別を正とし、再送fingerprintにもtype/schemaを含める。一覧・検索・件数をtypeで分離。
3. D1のevent限定CHECK/トリガーを追加migrationで拡張。原本保全、sourceRef所属、編集snapshotとの関連を永続化。
4. restore/publication/export/local adapterのevent固定型をブログへ拡張し、公開allowlistとasset解決・重複anchor検査を接続。
5. 公開AST→HTML、プレビュー、履歴表示、公開配信を接続し、既存eventの保存/公開/復元と両方を回帰確認。

## 設計検証の結果

310件すべてが編集候補schemaと意味検証を通過し、既定値のnull/空文字省略を正規化した試作編集JSONへ逆変換できた。252件は画像/PDF未解決で公開AST生成を停止。58件は本文単体のAST生成条件を満たすが、カテゴリ・タグ・URL・添付基盤・配信等は未検証であり公開可能な記事数ではない。10297は重複anchorでも停止する。

候補本文の最大148,935 bytes、暫定要求149,338 bytes（14975）。保全情報を要求本文から分離したため、試作の226,810 bytesより小さい。保全データ容量は別に存在し、最終の分類ID・要求形式と正式ノードで再測定する。下書き・公開schema、原本参照、未知属性、URL、重複anchor、asset未解決/未検証の負例を検証した。

[再現手順と結果](../verification/body-contract/README.md)。次に必要なのは添付台帳・正式validator/renderer・公開履歴と編集snapshotの接続設計、および利用者の操作レビューである。
