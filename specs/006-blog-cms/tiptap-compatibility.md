# Tiptapと旧ブログ本文の互換性

対象 #334・#418、移行 #391、添付 #395。Tiptapを第一候補として調査することは利用者合意済み。採用案は「Tiptap＋旧HTML取り込み変換＋PAF用ノード/保存変換」。標準拡張を入れるだけで旧記事を移行できる、という結論ではない。

本書は標準拡張を起点にした基礎検証。後続の専用ノードではYouTube/Vimeoの151個を往復保持できた。[本文契約](contracts/body.md)にその結果と現在の設計案をまとめている。

## 確認方法

2026-11-16、`astro/data/wordpress-export.json` のブログ310件（2026-08-10取得）をローカルで検証した。原本SHA-256は `926a27a215192592cf0e3803a85bd459e5c9e7bf2985ae0e889dd219aaf10cd7`。

Node 24.22.3、Tiptap 3.34.0、jsdom 26.1.0、Ajv 8.20.0を使用。CMSへ依存を追加せず、隔離した一時プロジェクトでHTML→Tiptap JSON→HTML→JSONを実行した。さらに末尾へ段落を追加して再出力・再読込し、追記した文字列と元の文字列の保持を確認した。これは変換APIとJSON編集の検証であり、ブラウザ上の入力・選択・貼り付け・Undoの検証ではない。

構成はStarterKit、Image（inline=true）、Youtube、TableKit、TextStyleKit、TextAlign（heading/paragraph）。比較として旧YouTube iframeを読むparseHTML規則だけを追加した試作も実行。試作の部分文字列セレクターは互換性調査用であり、本番のホスト許可検査・サニタイズとして使わない。

## 全件検証の結果

| 確認項目 | 標準拡張の組合せ | 旧YouTube読込規則を追加 |
| --- | --- | --- |
| 変換例外 | 0/310記事 | 0/310記事 |
| 空白を除いた本文文字列の差 | 0/310記事 | 0/310記事 |
| 画像src・altの欠落 | 0（画像5,923出現、252記事） | 0 |
| リンク先URLそのものの欠落 | 0（リンク829出現、215記事） | 0 |
| PDFリンク | 5記事の5リンクを保持 | 同左 |
| 動画の欠落 | 90記事、iframe 151個すべて | 1記事のVimeo 2個。YouTube 149個は動画IDを保持 |
| id/nameアンカーの欠落 | 3記事 | 3記事 |
| 現行rich-text/v1に不適合 | 264/310記事 | 280/310記事 |
| 2回目のJSONに差 | 1記事 | 1記事 |
| 追記後の文字列の欠落 | 0/310記事 | 0/310記事 |

画像のalt比較では未指定を空文字と同等に扱った。文字列比較は空白を除いているため、改行・段落・見た目の保持を意味しない。URL比較は参照文字列の保持だけで、外部リンクのHTTP到達やファイルの存在確認ではない。

旧ブログにtable・見出し・箇条書きのHTML要素はなかった。別の小さな合成例で見出し・太字・斜体・下線・改行・箇条書き・開始番号付きリスト・引用・表のcolspan/rowspanを往復し、内容と構造属性を確認した。これを実記事の表を検証済みとは扱わない。

## 差分の意味

### 動画

導入したYoutube拡張の読込規則は `div[data-youtube-video] iframe`。旧HTMLの裸のiframeは対象外なので、標準構成ではYouTubeも消える。取り込み用規則を追加すると149個のYouTubeのホスト・動画パスを保持した。URLパラメータやiframeの属性は変わるため、開始位置・表示寸法・タイトルなどは別途照合が必要。

Vimeoは記事ID `15682` に2個（動画ID `50026595`、`49421458`）。YouTube専用ノードでは保持できない。Vimeo用の限定された埋め込みノードか、編集で内容を失わない保護ブロックを設計する。リンクへ置き換えることを無断で確定しない。

### リンク・書式・アンカー

記事ID `4318` では7個のhref出現が減ったが、各URLへのリンクは残る。原本に画像の前の改行だけを囲む同じリンクが重複しており、画像リンク自体の欠落ではなかった。合成例でも画像に付いたリンクを保持した。

同記事の2回目JSONの差はfontFamilyの引用符・空白の正規化。文字の欠落ではないが、履歴の同内容判定には正規化した保存形式が必要。

アンカーが消えた記事は `10297`、`10285`、`4772`。コピー元由来と思われるIDでも、外部から参照されていないと確認せず削除してよいとは判断しない。img class、wbr、lang/dir等の属性・要素も減る。画像配置、言語、改行機会、色・書式の意味を保つ変換規則と画面照合が必要。

### PAFの保存スキーマ

既存スキーマは標準Tiptap出力と同一ではない。画像は `image(src,alt,...)` ではなく `assetImage(assetId,alt,caption)`、動画は標準Youtubeのsrc等ではなく `youtube(videoId)` を要求する。TextStyleKitのtextStyle markも現行の許可一覧にない。

したがって、不適合を解消するためにスキーマの検証を無条件に緩めない。#334・#395・#394でPAF用画像/動画/書式の保存形式とバージョンを決め、編集用ノード・公開表示・履歴復元を同じ契約へ対応させる。asset IDに未対応の旧URLは保持し、移行対応が取れる前に捨てない。

## 採用案と比較

| 方式 | 判断 |
| --- | --- |
| Tiptap＋取り込み/保存変換 | 第一候補。基本本文と参照は保持でき、旧YouTubeも追加規則で対応可能。Vimeo・属性・PAFノード・実操作の追加検証が条件 |
| Tiptap標準構成へそのまま全件変換 | 不採用案。動画が欠落し、既存保存スキーマにも適合しない |
| 生HTMLを直接編集する画面 | 原本の保全先としては必要。監督の日常編集UIにはHTML知識と誤編集の負担があり推奨しない。別製品との実測比較は今回行っていない |

原本HTMLは変換後も取得時点・hash付きで保全する。変換で落ちる要素を記事別に検出し、未対応記事を通常編集・自動保存へ流さない。未対応部分の保護表示/編集方法は代表例を使って合意する。JSONから生成したHTMLが安全とは限らないため、URLプロトコル・埋め込みホスト・属性・貼り付けサニタイズはサーバーでも検証する。

## 次の設計・検証

1. 原本HTML→編集用JSON→保存形式の対応を定める。assetImage、YouTube、Vimeo、必要な書式/アンカー/言語属性を含める。
2. 元URLとasset IDの対応、未対応要素の検出・保護を実記事で検証する。
3. MUIの共通ルールに沿う本文ツールバー・入力領域をFigmaで定義し、代表画面を確認する。
4. ブラウザで日本語入力、貼り付け、選択、Undo/Redo、画像/PDF挿入、動画、保存・再編集を確認する。
5. 変換前後の表示とリンク到達を照合し、既存スキーマの正式変更・採用条件を合意する。

今回の結果はTiptapを第一候補として具体化する根拠。本文設計・移行・公開の完了条件を満たしたという判定ではない。

## 再実行

[検証コード](verification/tiptap-roundtrip.mjs)、[集計と代表例](verification/tiptap-summary.json)、[依存](verification/tiptap-package.json)、[lock](verification/tiptap-package-lock.json)を保存した。全記事の差分はスクリプトの出力JSONに含まれる。リポジトリ直下・Node 24で実行する。

```sh
mkdir -p /tmp/paf-tiptap-recheck
cp specs/006-blog-cms/verification/tiptap-package.json /tmp/paf-tiptap-recheck/package.json
cp specs/006-blog-cms/verification/tiptap-package-lock.json /tmp/paf-tiptap-recheck/package-lock.json
npm ci --prefix /tmp/paf-tiptap-recheck
TIPTAP_AUDIT_DEPS=/tmp/paf-tiptap-recheck node specs/006-blog-cms/verification/tiptap-roundtrip.mjs
TIPTAP_AUDIT_DEPS=/tmp/paf-tiptap-recheck TIPTAP_LEGACY_YOUTUBE=1 TIPTAP_AUDIT_OUTPUT=/tmp/paf-tiptap-legacy-result.json node specs/006-blog-cms/verification/tiptap-roundtrip.mjs
```

全件合格を主張するテストではなく差分を採取する監査なので、差分があっても終了コード0になる。集計の欠落・不適合・例外と記事別結果を確認する。

## 一次資料

- [Tiptap HTML utility](https://tiptap.dev/docs/editor/api/utilities/html): 拡張の定義を使ってHTML/JSONを相互変換するAPI。
- [Tiptap FAQ](https://tiptap.dev/docs/guides/faq): スキーマに適合しないHTML内容を失い得ることを説明。
- [Image](https://tiptap.dev/docs/editor/extensions/nodes/image): inline設定と表示機能。アップロード処理は別途必要。
- [YouTube](https://tiptap.dev/docs/editor/extensions/nodes/youtube): 動画専用ノードと設定。今回の具体的な読込規則は導入した3.34.0のソースでも確認。
