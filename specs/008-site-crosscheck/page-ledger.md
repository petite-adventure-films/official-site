# 公開サイト横断照合台帳

対象: [#449](https://github.com/petite-adventure-films/official-site/issues/449)。2026-11-21、監督協議は11/22 20時。
分岐元・統合先: version-4 `c701b8df`（#446・#447統合済み）。作業ブランチ: `codex/issue-449-site-crosscheck`。

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
| 11/22 | `/copyrights-disclaimers/` | 未確認 | `copyrights-disclaimers/index.astro` | 未確認 |
| 11/21 | `/director/` | F1（画面全体未確認） | `director/index.astro` | 一次照合済み・詳細は下記 |
| 11/22 | `/events/[id]/` | F3（部品参照、ページ適合は未確認） | `events/[id].astro` | 未確認 |
| 11/22 | `/events/archive/[year]/` | F3（部品参照、ページ適合は未確認） | `events/archive/[year].astro` | 未確認 |
| 11/22 | `/events/` | F3（部品参照、ページ適合は未確認） | `events/index.astro` | 未確認 |
| 11/21 | `/films/[id]/` | F1（画面全体未確認） | `films/[id].astro` | 一次照合済み・詳細は下記 |
| 11/21 | `/films/` | F1（画面全体未確認） | `films/index.astro` | 一次照合済み・詳細は下記 |
| 11/22 | `/four-walling/` | 未確認 | `four-walling/index.astro` | 未確認 |
| 11/22 | `/gathering-the-personal-information/` | 未確認 | `gathering-the-personal-information/index.astro` | 未確認 |
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
| 11/22 | `/privacy-policy/` | 未確認 | `privacy-policy/index.astro` | 未確認 |
| 11/22 | `/specified-commercial-transaction-law/` | 未確認 | `specified-commercial-transaction-law/index.astro` | 未確認 |
| 11/22 | `/system-requirements/` | 未確認 | `system-requirements/index.astro` | 未確認 |
| 11/21 | `/takahatadai73/` | F2（固有文字基盤のみ） | `takahatadai73/index.astro` | 一次照合済み・詳細は下記 |
| 11/22 | `/workshop/` | 未確認 | `workshop/index.astro` | 未確認 |

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
- push前に本番Workerの非本番自動ビルド設定を読み取り確認し、当該新ブランチの除外が必要なら利用者の許可を得る。過去ブランチの許可を流用しない。本番・DNS・契約の変更は行わない。

## 修正と検証（11/21、ローカルのみ）

- 修正：SNS2リンクにアクセシブル名を付与。ナビの開閉対象をaria-controlsで関連付け、メニュー内からEscapeで閉じた際にMENUへフォーカスを戻す。73号棟のExcel添付をPDF専用モーダルから除外。
- Node 24.22.3、通常の `pnpm --dir astro run dev --host 127.0.0.1 --port 4321` で確認。
- Playwright Chromium、390×900 / 1280×900。トップ・作品一覧・監督・73号棟・9作品詳細の計13ページ×2幅で末尾までスクロール後に画像読込完了を待ち、画像読込失敗・横はみ出しなし。
- 両幅でナビのEscape/フォーカス復帰、SNSのリンク名、Excel通常リンクとHTTP 200、年表の全開閉、PDFモーダルの表示とEscape終了を確認。
- 主要ページで取得した内部リンク・添付81 URLはローカルGETで全件200。外部リンク・本番環境の到達保証にはしない。
- GoodbyeGallery / MovementsGalleryの既存単体テスト計6件成功。変更3ファイルのPrettier成功、ESLintエラー0（既存のクラス省略形等の警告17）、git diff --check成功。
- スクリーンショットで監督紹介、トップ・作品・73号棟の構成、73号棟の挨拶・住民紹介・作品導線を目視。全写真・全文・全ブレークポイントの目視完了とはしない。
- 公開サイトのローカル操作のみ実施。CMSの画面操作は行っていない。push・PR・検証環境反映・本番変更なし。開発サーバーの表示確認は配備後の確認とは分ける。
- 一時検査資料は `/tmp/paf-449/`（取得HTML、Playwrightスクリプト、リンク結果、スクリーンショット）。一時資料の消去後も本台帳の結果・未確認事項を引き継ぐ。


## PR前レビュー

- 変更3ファイルを呼び出し元と合わせてレビュー。PDF対象は現在の添付のpath/nameに対する拡張子で判定し、YouTube等の外部リンクには影響しない。ナビのEscapeは開いている時だけ処理し、メニュー外のフォーカスを奪わない。SNSリンク名は既存リンク先を説明する。
- 今回の差分にPRを妨げるコード上の問題は検出していない。既存のフォーカス可視性不足と未確認範囲は本Issueの残件であり、今回修正済みとは扱わない。
- リモートversion-4は引き続きc701b8df、当該ブランチの既存PRなしを確認。
- 本番Worker official-siteの有効Deploymentは08498b1f-2ce8-4da4-bf92-5142f229feb3（2026-10-21）を読み取り確認。
- ビルド設定のGETは現行Wrangler認証に必要権限がなく403。Chromeの画面閲覧も許可されず、現行の非本番ビルド除外設定は確認できていない。この状態ではpushしない。利用者による設定確認または許可された閲覧経路が必要。新ブランチの除外が必要な場合は別途許可を得てから設定する。

- PR前にAstro本番ビルドを実行し、733ページの生成成功。配備はしていない。
