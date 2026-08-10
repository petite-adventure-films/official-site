# 2026-07-15: ImageCarouselテスト読解とderived/effect再整理

## テーマ

`ImageCarousel.test.tsx` を仕様として読み、Reactコンポーネント内の `state` / `props` / `derived` / `effect` の責務を説明する。

前回の続きとして、特に `derived` と `effect` の概念を叩き直す必要があることを確認した。

## Pre説明

ユーザー説明:

- `state` は `currentIndex`。この状態が変わると、もろもろの表示が変わる。
- `props` は、呼び出し側からそれぞれの仕様に合わせて渡す設定。
- `derived` は、`ImageCarousel` が毎回描画されるので、そのとき計算させないもの。
- `effect` は、依存関係の値が変わるときに実行してほしいもの。
- テストは、外側から渡してきたもの、つまり props で来るものが効くかどうかを見る。
- 今回は `autoplay` と `loop` が必要そう。

## Codex Preフィードバック

方向性は合っている。

`state` は「コンポーネント自身が覚えていて、操作や時間で変わる値」。今回だと `currentIndex`。これが変わると、表示中の画像、`data-active`、`aria-current` が変わる。

`props` は「呼び出し側が決める設定と入力」。`images`, `ariaLabel`, `autoplay`, `showBullets`, `loop` が該当する。特に `autoplay` と `loop` は挙動を変える props なので、テスト対象として重要。

`derived` は「毎回計算させないもの」という理解だけだと少し狭い。より重要なのは「props/state から計算できるので state として保存しない値」という点。今回なら `boundedImages`, `canNavigate`, `lastIndex`。

`effect` は「依存関係が変わるときに実行する」に加えて、「Reactの外側と同期する処理」と言えると強い。今回なら `setInterval` を開始し、cleanupで `clearInterval` する処理。

## 今日やったこと

実装には進まず、`ImageCarousel` の概念整理で終了した。

時間切れのため、テスト読解、実装方針、テスト方針、コード変更、検証は行っていない。

## 今日の結論

`state` / `props` は大枠を掴めている。

次回は `derived` と `effect` を重点的に整理する。

- `derived`: props/state から計算できるため、保存しない値
- `effect`: タイマーやイベントリスナーなど、Reactの外側と同期する処理

## 次回やること

`ImageCarousel` を題材に、以下を仕分ける。

- `currentIndex` はなぜ state か
- `boundedImages`, `canNavigate`, `lastIndex` はなぜ derived か
- autoplayの `setInterval` / `clearInterval` はなぜ effect か
- テストでは、それぞれの責務をどの外部挙動として確認しているか
