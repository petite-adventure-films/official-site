# 本文エディター操作試作

対象 #418 / #334。本文の操作・保全方針を検証する独立した試作で、正式なrich-text/v2、CMS実装、移行処理ではない。Figma BodyEditor案（153:166）のMUI部品・2段ツールバーと既存CMSトークンを使う。CMSLayout全体の再現ではない。

## 起動

リポジトリ直下、Node 24、CMS依存導入済み環境で実行する。Tiptap依存は監査用パッケージ一式の固定lockを別ディレクトリへ復元する（既存監査の依存lockは変更しない）。

```sh
mkdir -p /tmp/paf-tiptap-prototype
cp specs/006-blog-cms/verification/editor-prototype/deps-package.json /tmp/paf-tiptap-prototype/package.json
cp specs/006-blog-cms/verification/editor-prototype/deps-package-lock.json /tmp/paf-tiptap-prototype/package-lock.json
npm ci --prefix /tmp/paf-tiptap-prototype
TIPTAP_AUDIT_DEPS=/tmp/paf-tiptap-prototype node specs/006-blog-cms/verification/editor-prototype/server.mjs
```

<http://127.0.0.1:4390/> を開く。試作の保存先はこのoriginのlocalStorageのみ。試作専用キー `paf-body-prototype:<記事ID>` を使う。原文と版が一致しない保存データは読み込まない。画像・動画はURLのプレースホルダーで表示し、外部ファイルを自動取得しない。選択時は未保存変更の破棄を確認する。ブラウザ自体を閉じる際の未保存警告は未実装。

## 検証

サーバー起動中に以下を実行する。

```sh
node specs/006-blog-cms/verification/editor-prototype/check.mjs
```

結果は `result.json`、1440pxのスクリーンショットは `/tmp/paf-body-prototype.png`。Chromiumで入力・Undo/Redo・書式付き貼り付け・保存/再読込・保存失敗・未対応HTML拒否を確認する。日本語入力は文字列挿入であり、OS IMEの変換・確定は確認していない。貼り付けはClipboardEventを使い、OSクリップボード自体は確認していない。

## 保全と制約

- 未知の要素・属性・URL・装飾・クラスは取り込み前に拒否。既知のWordPress画像管理クラスは除き、配置クラスは確認待ちにする。
- インポート前後で文字列・要素・装飾・画像/PDF/動画参照を照合し、JSON→HTML→JSONが一致しない場合も編集・保存を止め、原文をエスケープして表示する。
- この照合は限定的な試作。空白や段落の完全な意味比較、旧HTML全310件の移行承認、サニタイザー/正式schemaの代替ではない。リンクのtarget/rel、iframe再生ポリシー等は比較対象外。
- 旧記事18050（YouTube）、15682（Vimeo）、14975（最大本文）は保存・再読込成功。17696はJSON往復不一致、4318はlang属性が未対応で確認待ち。理由を保持し、通すためにチェックを緩めない。
- 新しい画像/PDF/動画の追加、リンク編集ダイアログ、外部ファイルの表示・実再生、公開、サーバー保存は未実装。既存参照の保存と再読込は確認用本文でも検証。
- 通常画面を1440pxのスクリーンショットで確認。長文は操作試験のみ。利用者の操作レビュー、OS IME、貼り付け元アプリごとの差、正式v2での検証が残る。
