# 公開サイト横断照合台帳

対象: [#449](https://github.com/petite-adventure-films/official-site/issues/449)。2026-11-21、監督協議は11/22 20時。
統合先: version-4。主要ページの一次照合はPR #450で統合済み。固定ページ照合は `eef34f33` から分岐した `codex/issue-449-fixed-pages-crosscheck` で進める。

## 判定と対象

既存サイトは内容・機能、Figmaは共通デザイン定義、Astroは実装の比較対象。
差分は「意図した変更」「明確な移植漏れ・実装不具合」「判断が必要」「未確認」に分類する。
旧移植Issueの完了を変更せず、今回の結果は#449で管理する。#390・#394・#433はオープン維持。
全WCAG適合、全件正式移行、本番利用可能とは判定しない。

下表のURLは `https://www.petiteadventurefilms.com` に続く既存URLとAstroの対応パターン。`[id]` 等は実URLではなく生成パラメーター。
Astroパスは `astro/src/pages/` 基準。動的記事の全URL照合は未実施。`[pageName]` はルート直下の旧ブログ個別URL。
完了・エラー・404は到達条件も含め翌日の点検対象とする。

| 優先日 | 既存URL／Astro URL | Figma参照 | Astroページ | 確認状態 |
| --- | --- | --- | --- | --- |
| 11/22 | `/404.html` | 未確認 | `404.astro` | 未確認 |
| 11/22 | `/[pageName]/` | F3（部品参照、ページ適合は未確認） | `[pageName].astro` | 未確認 |
| 11/22 | `/blog/[categoryName]/` | F3（部品参照、ページ適合は未確認） | `blog/[categoryName]/index.astro` | 未確認 |
| 11/22 | `/blog/[categoryName]/page/[page]/` | F3（部品参照、ページ適合は未確認） | `blog/[categoryName]/page/[page].astro` | 未確認 |
| 11/22 | `/blog/` | F3（部品参照、ページ適合は未確認） | `blog/index.astro` | 未確認 |
| 11/22 | `/blog/page/[page]/` | F3（部品参照、ページ適合は未確認） | `blog/page/[page].astro` | 未確認 |
| 11/22 | `/blog/recommended/` | F3（部品参照、ページ適合は未確認） | `blog/recommended/index.astro` | 未確認 |
| 11/22 | `/blog/recommended/page/[page]/` | F3（部品参照、ページ適合は未確認） | `blog/recommended/page/[page].astro` | 未確認 |
| 11/22 | `/blog/tag/[tagName]/` | F3（部品参照、ページ適合は未確認） | `blog/tag/[tagName]/index.astro` | 未確認 |
| 11/22 | `/blog/tag/[tagName]/page/[page]/` | F3（部品参照、ページ適合は未確認） | `blog/tag/[tagName]/page/[page].astro` | 未確認 |
| 11/22 | `/channel/[id]/` | F3（部品参照、ページ適合は未確認） | `channel/[id].astro` | 未確認 |
| 11/22 | `/channel/` | F3（部品参照、ページ適合は未確認） | `channel/index.astro` | 未確認 |
| 11/22 | `/contact/error/` | 未確認 | `contact/error/index.astro` | 未確認 |
| 11/22 | `/contact/` | 未確認 | `contact/index.astro` | 未確認 |
| 11/22 | `/contact/thanks/` | 未確認 | `contact/thanks/index.astro` | 未確認 |
| 11/22 | `/copyrights-disclaimers/` | F4（共通基盤のみ） | `copyrights-disclaimers/index.astro` | 11/21一次照合済み・固定ページ節参照 |
| 11/21 | `/director/` | F1（画面全体未確認） | `director/index.astro` | 一次照合済み・詳細は下記 |
| 11/22 | `/events/[id]/` | F3（部品参照、ページ適合は未確認） | `events/[id].astro` | 未確認 |
| 11/22 | `/events/archive/[year]/` | F3（部品参照、ページ適合は未確認） | `events/archive/[year].astro` | 未確認 |
| 11/22 | `/events/` | F3（部品参照、ページ適合は未確認） | `events/index.astro` | 未確認 |
| 11/21 | `/films/[id]/` | F1（画面全体未確認） | `films/[id].astro` | 一次照合済み・詳細は下記 |
| 11/21 | `/films/` | F1（画面全体未確認） | `films/index.astro` | 一次照合済み・詳細は下記 |
| 11/22 | `/four-walling/` | F4（共通基盤のみ） | `four-walling/index.astro` | 11/21一次照合済み・固定ページ節参照 |
| 11/22 | `/gathering-the-personal-information/` | F4（共通基盤のみ） | `gathering-the-personal-information/index.astro` | 11/21一次照合済み・固定ページ節参照 |
| 11/21 | `/` | F1（画面全体未確認） | `index.astro` | 一次照合済み・詳細は下記 |
| 11/22 | `/media/[id]/` | F3（部品参照、ページ適合は未確認） | `media/[id].astro` | 未確認 |
| 11/22 | `/media/` | F3（部品参照、ページ適合は未確認） | `media/index.astro` | 未確認 |
| 11/22 | `/news/` | 未確認 | `news/index.astro` | 未確認 |
| 11/22 | `/news/page/[page]/` | 未確認 | `news/page/[page].astro` | 未確認 |
| 11/22 | `/pafshop/[name]/` | 未確認 | `pafshop/[name].astro` | 未確認 |
| 11/22 | `/pafshop/cancel/` | 未確認 | `pafshop/cancel/index.astro` | 未確認 |
| 11/22 | `/pafshop/cart/` | 未確認 | `pafshop/cart/index.astro` | 未確認 |
| 11/22 | `/pafshop/error/` | 未確認 | `pafshop/error/index.astro` | 未確認 |
| 11/22 | `/pafshop/faq/` | 未確認 | `pafshop/faq/index.astro` | 未確認 |
| 11/22 | `/pafshop/` | 未確認 | `pafshop/index.astro` | 未確認 |
| 11/22 | `/pafshop/thanks/` | 未確認 | `pafshop/thanks/index.astro` | 未確認 |
| 11/22 | `/privacy-policy/` | F4（共通基盤のみ） | `privacy-policy/index.astro` | 11/21一次照合済み・固定ページ節参照 |
| 11/22 | `/specified-commercial-transaction-law/` | F4（共通基盤のみ） | `specified-commercial-transaction-law/index.astro` | 11/21一次照合済み・固定ページ節参照 |
| 11/22 | `/system-requirements/` | F4（共通基盤のみ） | `system-requirements/index.astro` | 11/21一次照合済み・固定ページ節参照 |
| 11/21 | `/takahatadai73/` | F2（固有文字基盤のみ） | `takahatadai73/index.astro` | 一次照合済み・詳細は下記 |
| 11/22 | `/workshop/` | F4（共通基盤のみ） | `workshop/index.astro` | 11/21一次照合済み・固定ページ節参照 |

共通部品は通常ページで `Layout.astro` → `AppHeader.astro` / `SiteName.astro` / `AppNav.astro` / `AppFooter.astro` を確認対象とする。SHOPは専用レイアウト・ヘッダーも翌日確認。
`robots.txt.ts` と生成sitemapは画面外の確認対象（未確認）。

## Figma対応（11/21 MCP読み取り）

ファイル: [公開サイト共通定義](https://www.figma.com/design/KOXqODf4v4aBYzNOyFipMO)。全4ページの直下node一覧と基礎注記を確認。

- F1: [8:4 本体と特設／現行の文字基盤](https://www.figma.com/design/KOXqODf4v4aBYzNOyFipMO?node-id=8-4)。サイト名Dosis 24/32は採用済み。本文14/22.75、記事タイトル20/28は現行値。本文16/28は未採用の改善案。トップ・ヘッダー・ナビ・フッター・作品・監督紹介の画面全体に対応する定義はこのファイルでは見つからない。別ファイルの有無は未確認。
- F2: 同じ8:4に73号棟紹介文Noto Serif JP 24/32の現行値。固有の年表・ギャラリー・住民紹介のレイアウト全体を承認済みとは扱わない。
- F3: [EventCard 14:51](https://www.figma.com/design/KOXqODf4v4aBYzNOyFipMO?node-id=14-51)、[Tag 20:53](https://www.figma.com/design/KOXqODf4v4aBYzNOyFipMO?node-id=20-53)、[ArticleHeaderTags 20:57](https://www.figma.com/design/KOXqODf4v4aBYzNOyFipMO?node-id=20-57)、[ArchiveList 14:53](https://www.figma.com/design/KOXqODf4v4aBYzNOyFipMO?node-id=14-53) / [14:60](https://www.figma.com/design/KOXqODf4v4aBYzNOyFipMO?node-id=14-60)。コード先頭参照とnode存在を確認。寸法・状態・変数の詳細照合は翌日分。
- 1:4は定義前の確認項目、4:37・4:92とButton/Link/Input等は確認案。採用済みと誤認して展開しない。

## 主要ページの一次照合

既存4ページのHTMLを11/21に直接GET。本文の空白を除去して比較し、旧Vue側の定数とAstro定数はTypeScript変換後の全データを比較した。旧ローカル実装との一致は、現行本番の全件一致を意味しない。

| 対象 | 確認した事実 | 分類・残件 |
| --- | --- | --- |
| トップ | 主要9導線と73号棟バナーが存在。現行本番のお知らせは10/9ラジオ告知、ローカルは8/3ワークショップ告知 | 判断が必要：8/10取得スナップショットと現行データの差。全件正式移行・最新同期の範囲で扱い、今回上書きしない。OP・動画の再生と終了操作は別途確認 |
| 作品一覧 | 9作品の表示本文（空白除去）が現行本番と一致、作品リンク欠落なし | 未確認：全要素の視覚適合 |
| 作品詳細 | 9作品の全情報定数が旧Vue実装と一致 | 未確認：本番9詳細との逐語照合、各動画の再生、外部上映履歴リンクの到達 |
| 監督紹介 | 現行本番との差は本文読点1字のみ。9作品のFilmographyリンク欠落なし | 判断が必要：読点の軽微差。経歴の書き換えはしない |
| 共通部品 | フッターのSNSリンク2件に名前なし。ナビ内フォーカスでEscapeを押すと非表示内へフォーカスが残る実装 | 明確な実装不具合：ローカル修正済み。フォーカス可視性は別の残件 |

作品詳細の対象URL: `/films/atarashikimura/`、`/films/my_indian_diary/`、`/films/four_years_on/`、`/films/apprentice_homeless/`、`/films/dancing_zempukuji/`、`/films/a_woman_from_fukushima/`、`/films/otome_house/`、`/films/goodbye_ur/`、`/films/brian_and_co/`。

## 73号棟の独立点検

比較元: [既存73号棟](https://www.petiteadventurefilms.com/takahatadai73/)、`html/src/pages/takahatadai73/` と `html/src/constants/takahatadai73.ts`。
実装: `astro/src/pages/takahatadai73/index.astro`、同名定数、GoodbyeGallery / MovementsGallery / PdfModalController。

- 本文：復刻版の挨拶、2013年の住民挨拶、UR説明、年表、解体記録、まちづくり、住民紹介、さようならURへの導線を確認。本番HTMLにある本文リンクの欠落なし。動的表示の違いがあり、本文全体の単純文字数一致では判定しない。
- データ：keyMessages・urTimeline・takahatadai73Timeline・goodbyeGallery・movements・residentsの6定数が旧実装と一致。
- 写真：解体写真77枚、まちづくり資料・住民肖像を合わせた参照画像104点がローカルに存在。全写真の内容・画質の目視は未確認。
- 添付：年表・住民陳述書・まちづくり計画の参照48件が存在（PDF47件、Excel1件）。PDF全ページの内容・原本とのハッシュ一致は未確認。
- 明確な実装不具合：2008年の「情報開示内容全体経過一覧.xls」もPDFモーダルへ渡していた。PDF拡張子のみビューア対象にし、Excelは元ファイルへの通常リンクへ修正。
- 固有レイアウト：背景・斜め見出し、UR/住民の左右年表、月ごとの開閉、写真の日付選択、資料拡大、住民の段組を独立した確認対象とする。Figma上で全体定義済みとは扱わない。
- 判断が必要：既存サイトにもある見出し「高畑台団地の今」は他の正式表記「高幡台」と不一致。原稿由来の表記として相談事項に残す。

## CMSと本番利用の評価を分離

| 対象 | Astro表示 | 新CMS編集 | 本番利用 |
| --- | --- | --- | --- |
| 主要固定ページ・作品・73号棟 | ローカル一次照合対象 | 今回確認・追加していない | 未判定 |
| 5記事タイプ | 翌日の横断点検対象 | #445に記録された代表6件の通し確認済み。旧記事全件の編集可能とはしない | 未判定 |
| SHOP | 翌日の画面点検対象 | 未確認 | 決済・通知未確認 |
| お問い合わせ | 翌日の画面点検対象 | 対象外 | 実送信未確認 |

## 残件・相談事項

- 全画面に `*:focus { outline: none }` があり、共通ナビ等のキーボードフォーカス表示が不足する。Figmaの確認案をそのまま全体採用せず、既存採用部品のフォーカス定義との照合と適用範囲の判断が必要。
- Figmaに見つからないページ全体・固有レイアウトの定義と、確認案の採否。見つからないことを「定義不存在」と断定しない。
- 最新記事同期、監督本人ログイン、SHOP決済・通知、問い合わせ実送信、全件保全は別評価。
- 11/22：残る固定・記事・SHOP・問い合わせ、PC/スマホ再確認。18時に大きな変更を止め、#445/#427の検証環境・紹介URL・操作手順・本人ログイン・必要な保全を確認。
- push前に本番Workerの非本番自動ビルド設定を確認する。今回の確認結果は下記。設定変更が必要な場合は利用者の許可を得る。本番・DNS・契約の変更は行わない。

## 修正と検証（11/21、ローカルのみ）

- 修正：SNS2リンクにアクセシブル名を付与。ナビの開閉対象をaria-controlsで関連付け、メニュー内からEscapeで閉じた際にMENUへフォーカスを戻す。73号棟のExcel添付をPDF専用モーダルから除外。
- Node 24.22.3、通常の `pnpm --dir astro run dev --host 127.0.0.1 --port 4321` で確認。
- Playwright Chromium、390×900 / 1280×900。トップ・作品一覧・監督・73号棟・9作品詳細の計13ページ×2幅で末尾までスクロール後に画像読込完了を待ち、画像読込失敗・横はみ出しなし。
- 両幅でナビのEscape/フォーカス復帰、SNSのリンク名、Excel通常リンクとHTTP 200、年表の全開閉、PDFモーダルの表示とEscape終了を確認。
- 主要ページで取得した内部リンク・添付81 URLはローカルGETで全件200。外部リンク・本番環境の到達保証にはしない。
- GoodbyeGallery / MovementsGalleryの既存単体テスト計6件成功。変更3ファイルのPrettier成功、ESLintエラー0（初回は既存のクラス省略形等の警告17。コミット時の既定hookが同値の省略形へ自動修正し、差分を再レビュー、本番ビルドも再成功）、git diff --check成功。
- スクリーンショットで監督紹介、トップ・作品・73号棟の構成、73号棟の挨拶・住民紹介・作品導線を目視。全写真・全文・全ブレークポイントの目視完了とはしない。
- 公開サイトのローカル操作のみ実施。CMSの画面操作は行っていない。検証環境への反映・本番変更は行っていない。開発サーバーの表示確認は配備後の確認とは分ける。
- 一時検査資料は `/tmp/paf-449/`（取得HTML、Playwrightスクリプト、リンク結果、スクリーンショット）。一時資料の消去後も本台帳の結果・未確認事項を引き継ぐ。

## 主要ページのPR #450レビュー

- 変更3ファイルを呼び出し元と合わせてレビュー。PDF対象は現在の添付のpath/nameに対する拡張子で判定し、YouTube等の外部リンクには影響しない。ナビのEscapeは開いている時だけ処理し、メニュー外のフォーカスを奪わない。SNSリンク名は既存リンク先を説明する。
- 今回の差分にPRを妨げるコード上の問題は検出していない。既存のフォーカス可視性不足と未確認範囲は本Issueの残件であり、今回修正済みとは扱わない。
- リモートversion-4は引き続きc701b8df、当該ブランチの既存PRなしを確認。
- 本番Worker official-siteの有効Deploymentは08498b1f-2ce8-4da4-bf92-5142f229feb3（2026-10-21）を読み取り確認。
- 非本番ビルド設定は未解決：利用者は `previews_enabled = false`・既存Preview 0件を確認したが、PRのコミット12d165f2に対して `Workers Builds: official-site` が実際に起動し失敗した。従って「非本番ブランチのビルドは起動しない」とは扱わない。`path_excludes` はファイルパスのフィルタであり、個別ブランチの除外リストへ追加する案内も撤回。エージェントのビルド設定・ログGETは403であり、設定と起動実績の食い違いは本番切替前の残件。Cloudflare設定は変更していない。
- 利用者提供の失敗ログ：ビルド875d3a7c-ad7d-439f-a1c5-c084ee70bf27は `astro/dist/assets/video/home.mp4`（29.9 MiB）が25 MiB上限を超えて配備段階で失敗。version-4とPRの元動画は同じGit blob `d3bef266aff3514c4099a8f548b7fda98eb4822b`、31,388,267バイト。今回のコード差分による回帰ではない。検証用 `astro/scripts/build-staging.mjs` は生成先動画のみ再圧縮する既存経路。今回、本番用動画や配備設定は変更しない。
- 本番Deploymentは失敗後も08498b1f-2ce8-4da4-bf92-5142f229feb3のままとAPIで再確認。Vercel成功、今回のローカル検証成功を踏まえ、既存のWorkers配備失敗は今回の修正のマージを妨げないと判断。全チェック成功や本番利用可能とは扱わない。

- PR前にAstro本番ビルドを実行し、733ページの生成成功。配備はしていない。

## 固定ページ照合（11/21、PR #450統合後）

対象の既存7 URLを11/21に直接GETし、通常のAstro開発サーバーと比較した。ブラウザーが構築したmain本文の空白を除去して照合。規約の法的適合性、料金・個人情報の扱いの現在の運用まで保証する検査ではない。

F4: 共通文字基盤はF1の [8:4](https://www.figma.com/design/KOXqODf4v4aBYzNOyFipMO?node-id=8-4) を参照。今回の7ページはPostLayout / Section / H3 / DefinitionList / ButtonLink等を使用。自主上映・ワークショップのGalleryImage、レポートのPostCardも照合対象。同日のFigma構造読み取りでは、これらのページ全体・ギャラリー・規約本文の部品構成に対応する採用済み定義は特定できていない。画面全体のFigma適合とは扱わず、確認案の色・文字・余白は適用していない。

| ページ | 内容・機能照合 | 差分の分類・判断 |
| --- | --- | --- |
| 自主上映 | 本文一致。上映条件、チラシ6点・ポスター3点、ギャラリー4点、お問い合わせ2導線を保持 | 本文・画像の移植差分なし。ギャラリーの読み上げ状態を下記のとおり修正 |
| ワークショップ | 固定本文・開催実績は一致。ギャラリー7点、お問い合わせ、講座例への導線を保持 | 判断が必要：最近の記事5件の抽出条件が旧実装と異なる。詳細は下記 |
| サイト利用条件 | main本文一致、お問い合わせリンク200 | 差分なし。本文の法的見直しは実施していない |
| 個人情報の取り扱い | main本文一致、1〜5項・管理者・お問い合わせを保持 | 差分なし。現在のデータ提供・委託の運用との整合は別確認 |
| プライバシーポリシー | main本文一致、運用開始日・4項・お問い合わせを保持 | 差分なし。本文内のHTTP表記も原文を維持 |
| 特定商取引法表記 | main本文一致、販売者・連絡先・支払方法・引渡時期・返品条件を保持 | 差分なし。SHOPの決済・通知や販売条件の運用確認とは分ける |
| 推奨環境 | main本文一致、ブラウザ案内とJavaScriptの説明を保持 | 現行リンク3件はHTTPから公式HTTPSへ転送して200。明確なリンク切れなし。推奨端末の実機検証は未確認 |

### 修正した明確な実装不具合

GalleryImageは画像を透明にして切り替えていたが、非表示画像の代替テキストも支援技術に公開され、選択中の番号も色だけで示していた。
初期表示・前後移動・番号選択で `aria-hidden` と `aria-pressed` を表示状態に同期する。見た目、画像、順番、トークンは変更しない。
共通部品なので、自主上映・ワークショップに加え、作品とSHOPの商品詳細も影響範囲。今回の商品確認はギャラリーだけであり、SHOP全体の点検完了ではない。

### ワークショップの相談事項

- 現行本番の先頭は募集記事 `/2026_civil_video_ws/`（旧ID18053）。同記事はローカルスナップショットにも存在するため、単なる取得日差や記事そのものの移植漏れではない。
- 旧Vueは `tag: '映像ワークショップ'` で最新5件を取得。Astroは `filterWorkshopReportBlog` により旧タグ5026「映像ワークショップレポート」由来の `isWorkshopReport` で抽出する。募集記事の旧タグは3318/255/254/3299で、5026は含まない。
- 新CMSの採用仕様 `specs/006-blog-cms/spec.md` は報告分類を5026から引き継ぐため、分類全体を255に置換する修正は行わない。「最近の映像ワークショップレポート」に募集告知も含めるか、報告だけを載せるかを相談する。現行の5件では募集記事の代わりに振り返り#5が末尾へ入る。
- 旧本文の `/contact` はAstroで `/contact/` に正規化され、リンク先は保持されている。

### 未確認・相談事項

- 自主上映のJASRACリンク `https://www.jasrac.or.jp/users/` は直接GETが接続拒否、Web取得も502。サイト廃止・リンク切れとは断定しない。別環境での到達確認と、案内先が上映手続きとして適切かの確認を残す。
- 自主上映料・宣伝資材価格・楽曲使用料の案内、特商法の連絡先・発送/返品条件が現在の運用と合うかは監督との確認事項。今回、原稿・契約条件を変更していない。
- ワークショップ講座例 `https://civiltachikawa.sakura.ne.jp/shimin-koza-n49.html` は200。ブラウザ案内3件も転送先200。外部リンクの到達を外部サービス全体の品質保証とは扱わない。
- 共通フォーカス表示不足、ギャラリーの小さい番号ボタンの操作領域、本文のコントラストなどは全WCAG評価を完了していない。今回の状態通知の修正だけで適合とはしない。
- 記事一覧/詳細、SHOP全体、お問い合わせの入力・完了/エラーは引き続き未確認。既存データの正式移行、新CMSでの全件編集、決済・通知・実送信は別評価。

### 検証

- 固定7ページ×390/1280pxの14表示で画像読込失敗・横はみ出しなし。スクリーンショットを取得し、主要な固定本文・画像・連絡導線を目視。全内容の拡大表示・実機読み上げは未確認。
- 自主上映13点・ワークショップ7点の画像は旧Vue資産とSHA-256一致。最新本番の画像バイナリとの全件比較は未実施。
- 固定ページからの内部リンク24 URLがローカルGETですべて200。外部リンク確認は上記。
- `pnpm --dir astro exec playwright test e2e/gallery.spec.ts --workers=2` で8件成功（デスクトップと360pxモバイル）。実ビルド＋preview上で自主上映・ワークショップ・さようならUR作品詳細/商品詳細の初期状態、前後の循環、番号ボタンのEnter操作と支援技術向けの画像・選択状態を検査。実機スクリーンリーダーによる確認とは分ける。
- 変更コンポーネントと追加テストのPrettier成功、ESLintエラー0（既存の省略形警告4は同値のsize指定へ整形済み）、git diff --check成功。
- 作業資料は `/tmp/paf-449-fixed/`。配備は実施していない。Cloudflare非本番ビルド設定の食い違いは未解決であり、以前の「非本番ビルドは起動しない」という案内を今回のpush判断に流用しない。
- PR前レビュー：画像内にはフォーカス可能要素がなく、非表示画像へのaria-hidden追加がフォーカスを隠す問題はない。前後・番号・スワイプは同じ切替処理を使い、表示状態と選択状態を同期する。今回の差分にPRを妨げる問題は検出していない。相談事項・未確認範囲は維持する。
- push前に本番Deploymentが08498b1f-2ce8-4da4-bf92-5142f229feb3のままであることを再確認。ビルド設定GETは引き続き403。前PRで確認した動画容量超過によるWorkers Builds失敗は別課題としてPRにも明記し、動画・本番配信設定は変更しない。
