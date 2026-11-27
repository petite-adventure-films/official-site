# 下書き・非公開の取得と照合（ #373 ）

2026-11-27。実施: Codex。依頼者が開いているChromeのWordPress管理者セッションを指定し、APIによる取得を希望した。作業ブランチは `codex/issue-373-nonpublic-intake`、分岐元・統合先は `version-4`（開始時 `3dbad142`）。

## 取得結果

認証済みREST APIの `posts` を `context=edit&status=draft,private&per_page=100&orderby=id&order=asc` で読み取った。認証は既存のChromeセッションを使用。パスワード新設、権限変更、記事の更新・公開は行っていない。nonceやCookieをGit・報告書・スクリプトへ保存しない。

管理画面の公開311件・下書き3件・非公開24件に対し、APIで下書き3件・非公開24件、重複なしの27件を取得した。全件に `title.raw`・`content.raw`・元のstatusがある。API応答のACFは空、metaに `recommend` がないため、標準WXRの「投稿・下書き」「投稿・非公開」を補助取得して独自項目を保全した。画面からの本文転記は使用しない。

| ローカル原本（ `.local/wordpress-conversion/` ） | SHA-256 |
|---|---|
| `wordpress-nonpublic-20261127.json` | `a809c87a85d561b8256095e5421d723aa67559bb7ed8b7d04c429bd23a37f4eb` |
| `wordpress-draft-20261127.xml` | `fc743093206b3fc7b4dd05ae018cf876b8df37e317bd02d588a5b073896ffcc9` |
| `wordpress-private-20261127.xml` | `263438bbd415efb61a13cc1882eea4cebacbd32cec48500d48b98ad7110047ee` |

27件すべてについて、RESTとWXRのID・タイトル原文・本文原文・status・slug・作成日時・更新日時が一致。XMLパーサーの改行正規化分だけ比較時にCRLF/CRをLFとして照合し、原本ファイルやJSONの原文は変更しない。WXRには添付レコード208件（下書き出力9件・非公開出力199件）が含まれる。これは添付実体の取得完了や本文内の使用数ではない。

## 再照合

```sh
python3 astro/scripts/audit-wordpress-nonpublic.test.py
python3 astro/scripts/audit-wordpress-nonpublic.py \
  .local/wordpress-conversion/wordpress-nonpublic-20261127.json \
  .local/wordpress-conversion/wordpress-draft-20261127.xml \
  .local/wordpress-conversion/wordpress-private-20261127.xml \
  .local/wordpress-conversion/nonpublic-intake-20261127.json
```

出力先は未使用のファイル名にする。入力・出力はGit対象外の `.local` 内に限定し、出力権限は0600。タイトル・本文・個別の非公開URLをGitやIssueに掲載しない。実入力27件の照合成功。合成データの4テストで原文保持・状態保持・再現性、重複/不足/内容差の拒否、公開記事混入の拒否、XML実体宣言の拒否を確認した。

`nonpublic-intake-20261127.json` は各記事の元status、REST原本、WXRの全meta・分類と添付情報を関連付け、`publish: false` を明記する。正式CMS取込manifestではない。

## 正式変換・取込へ渡す条件

- 2026-11-27利用者合意: 閲覧範囲は現在のCMSで許可された2人（監督・開発担当）。一般公開しない。監督だけに制限する新しい記事単位ACLは追加しない。
- 元のdraft/privateの区別を移行原本・台帳に保持する。CMSに未公開で保存するだけで、移行元の状態の区別を捨てない。
- 一般向け公開manifest・ページ・一覧・検索・サイトマップへ自動登録しない。取込後に未認証/未許可ユーザーが取得できないことを実環境で確認する。
- APIのrendered本文とWXR独自項目から既存変換器を試行した暫定結果は4候補/23停止。主因は画像等19件、添付リンク2件、下書きの空slug2件（重複あり）。暫定レポートはローカルのみ。正式adapter・空slug下書きのURL未生成・公開入力との統合衝突照合は実装済み。[最新の正式adapter検証](nonpublic-conversion.md)は6候補/21停止。
- 添付208レコードと本文の実参照を突き合わせ、使用中メディア台帳へ追加し、非公開本文で使う添付の公開範囲も確認する。正式assetIdは #494 と接続する。
- #492 の正式変換と #471 の取込・認証境界の実照合が終わるまで、 #373 は完了としない。取得・照合の完了をCMS取込の完了とは扱わない。残作業・外部待ちの見積は未確認。
