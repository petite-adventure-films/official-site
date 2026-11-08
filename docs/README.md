# プロジェクト文書

`docs/` は現在の運用・共通ルールを簡潔にまとめる。機能ごとの仕様・設計・タスクと確認資料は [`specs/`](../specs/) でGit管理する。変更時は本文を更新し、変更の経緯はGitの差分・コミット・PRでたどる。

- [プロジェクト原則](../.specify/memory/constitution.md)
- [共通品質基準](./quality-criteria.md)
- [開発・実装ルール](./development-rules.md)
- [移行検証用URL台帳](./url-inventory.md)：`astro/scripts/verify-static-output.mjs` の検証入力

学習ログ・会話の書き起こし・一時的な作業メモは `.local/notes/` に置く。新たな運用文書は採用内容を確認して追跡対象に加える。
別ディレクトリの試行資料は参考資料とし、原則の正本は `.specify/memory/constitution.md`、品質基準と開発ルールの正本は本ディレクトリとする。
