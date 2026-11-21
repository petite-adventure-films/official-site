# データモデル

新種別: news、pressCoverage、video。既存event/blogは変更しない。
共通: title最大200字、slug最大200字（省略可）、bodyは既存v2、filmTagIdsは重複なし最大100件。
newsはタイトルと本文。pressCoverageはsourceName/sourceIssue/coverageLabel（各200字）、attachmentAssetIds（PDF最大20件）、youtubeId（下書きは最大200字、公開時は空欄または11文字のID）、articleHeadline/articleSubheadline（各200字）、articleBody（v2本文）。videoはyoutubeId、productionYear（入力文字列最大20字）、productionCountry最大200字、duration最大40字。制作情報は欠損を許容し、表記を勝手に数値へ変換しない。
下書きは未入力可。公開時はタイトルとURLを検査。videoはYouTube ID必須。添付は存在と種類、作品はタグ一覧に存在することを検査する。
保存状態の楽観ロックと操作ID再試行、公開候補の不変性、成功時の履歴生成、下書きのみの復元は既存共通契約に従う。
