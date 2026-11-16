# ブログCMS画面契約案

対象 #418。docs/cms-ui-rules.mdに従う。本文を含む代表画面を作成し、構造・外観を検査済み。利用者レビューと実装後の操作確認は未実施。

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
| 本文編集 | [BodyEditor案](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=153-166) | 既存MUI Button/TypographyとContent標準Slotで構成。本文操作は[本文契約](body.md) |

## 代表画面と検査結果

[ブログ編集の代表案](https://www.figma.com/design/hk5yiH5HW5Es7RMSzzJIIa?node-id=155-1483)は1440px・ライトモード。記事内容は設計用の例。カテゴリ5件、映画タグ9件、イベントタグ10件は既存スナップショットの名称を使い、折り返しとサイドバーの高さを確認した。本文が短い場合もサイドバーと独立して高さが取れ、実装ではページ全体をスクロールする。

2026-11-16にMCPとスクリーンショットで検査した。画面内238ノード、80インスタンス、16 Slot。インスタンスの参照切れ0、Slot違反0、インスタンス外に直接配置した表示要素0、全テキストは既存Roboto。CMSLayout（26:477）、EditorLayout（26:339）、Section（23:611）、Field（23:663）、BodyEditor（153:166）の参照を維持している。

[検査記録](../verification/figma-review.json)を保存した。

BodyEditorはcms/content、heading、actions、背景paper、divider、borderRadiusへバインド。表示用の画像・画面全体のラスター化は使っていない。本文ツールバー、カテゴリ・タグ、Switch、下部の記事操作について、文字切れ・重なりのない通常状態を確認した。

共通CMSLayoutに `Show blog`（既定false）を追加し、この代表案だけtrue。既存イベント画面は既定でブログ項目を表示しない。ブログ画面ではイベントを通常文字、ブログを太字にして現在地を示す。

2026-11-16利用者レビューで方向を承認。未確認: 長いタイトル/本文の限界表示、本文の空・エラー・変換確認待ち状態、キーボード・フォーカス・メニュー/挿入ダイアログ、入力・Undo・保存・公開・実スクロール。Figma上の通常状態の検査をこれらの確認で代替しない。

## 新規下書きのCMS接続

`/cms/blog`、`/cms/blog/new`、`/cms/blog/:id/edit`を実装。Figma 155:1483/153:166をMCPで再確認し、既存CMSLayout/EditorLayout/Section/Field・MUIボタン/Chip/Switchを使用。新規テキスト本文をTiptapで編集し、保存状態と日時を共通位置へ表示。公開・プレビュー・履歴・添付挿入は未接続として非活性。複製は共通DuplicateActionを使用し、新しいブログ編集画面へ移動。複製中は編集領域をinertにして二重操作を防ぐ。本文の操作は段落/見出し2–4・太字・箇条書き/番号付き・引用・リンク・その他の書式・Undo/Redo。

1440px画面で外観を確認。入力/再読込の自動検証と利用者による実装画面の最終確認は区別する。OS日本語IME、旧記事取り込み、添付編集、公開の検証は後続。
