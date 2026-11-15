# ブログCMS画面契約案

対象 #418。docs/cms-ui-rules.mdに従う。本文を含む代表画面は未作成・未確認。この文書だけを画面実装の開始条件にしない。

## 経路と配置

- /cms/blog、/cms/blog/new、/cms/blog/:id/edit、/cms/blog/:id/historyを提案。公開URLの/{slug}/と区別する。
- 左ナビにブログを追加し現在地だけを太字・aria-currentで示す。
- 一覧は共通ListLayout/ListRow/Pagination。タイトル・映画タグ・イベントタグ・公開状態を表示する案。CMSページ送りと公開サイト年別アーカイブは別。
- 編集本文側は既存操作行、タイトル、slug、本文の順。保存状態・履歴・保存・プレビューの場所は共通ルールを維持。未接続操作を有効と見せない。
- サイドバーは公開管理、ブログ設定、タグ、記事の管理。ブログ設定にカテゴリの単一選択Chipと独立した「おすすめ」「ワークショップ報告」Switchを置く案。
- カテゴリは公開時必須の赤い*。未選択で保存/再読込可。タグは既存候補をインライン表示。一般タグ・サムネイル欄は設けない。
- 作成・最終編集日時は公開管理欄に表示のみ。旧公開日は更新後も維持し、入力欄を設けない。
- 履歴の共通選択/復元操作を使い、本文・カテゴリ・タグ・2スイッチをブログ用に表示。復元だけでは公開しない。

## Figma対応

2026-11-16にMCPでnode種類・標準Slot・代表イベント画面からの参照を確認。外観・数値はFigmaを正本とする。

| 対象 | 正本 | 確認 |
| --- | --- | --- |
| 全体・編集 | [CMSLayout](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=26-477)、[EditorLayout](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=26-339) | COMPONENTとPage/Main/Aside Slot |
| まとまり・項目 | [Section](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=23-611)、[Field](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=23-663)、[Outlined](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=23-678) | Content/Control Slot、ラベル/見出し |
| 一覧 | [ListLayout](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=33-297)、[ListRow](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=33-301)、[Pagination](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=33-304) | Toolbar/Content/Pagination、列切替 |
| 履歴・確認 | [HistoryListItem](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=59-743)、[StatusDialog](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=66-388) | 選択/フォーカスvariant、文言property |
| タイトル・slug | [TextField](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=2-5825) | 代表画面からの参照 |
| 選択・オンオフ | [Chip](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=8-199)、[Switch](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=8-904) | 代表画面からFilled/Outlined ChipとSwitchの参照 |
| 余白 | [CMSスペーシング](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=92-149) | cms/section/content/heading/related/detail/icon/actions/list-padding-x/y、基礎値alias |
| 代表編集 | [イベント編集](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=17-2247) | CMSLayout・入力の参照。ブログ検査を代替しない |
| 本文編集 | 未確定 | 共通部品ページに専用エディター定義を確認できず。#334で操作・部品を定める |

## 代表画面の開始・提出条件

#334で本文操作・形式を確認し、必要な共通部品を定義して代表ブログ編集画面1枚を組む。本文を直接配置テキストや図形で代用して完成としない。標準Slotに部品インスタンスを置き、不要な補助部品を増やさない。

提出時は1440pxの外観、長いタイトル・カテゴリ名、スクロール、必須エラー、全インスタンス参照元、インスタンス外の表示要素、トークン対応を確認しnodeと結果を記録する。現在はブログ画面のスクリーンショット検査・構造検査・利用者確認は未実施。実装後の操作/保存確認とは区別する。
