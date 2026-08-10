# 2026-08-07: dialog Web APIとブラウザ標準へ任せる責務

## テーマ

`MovementsGallery.tsx`と`Modal.tsx`を読み、画像選択のstate、Modalのprops、ブラウザ標準の`<dialog>`が担う責務を整理した。

約1週間ぶりの朝練だったため、新しい実装は増やさず、前回実装したコードの読解を復帰テーマとした。

## Pre説明

- `selectedImage`はModalに表示する画像。
- 画像のクリックで`setSelectedImage(image)`が呼ばれる。
- `selectedImage`があればModalを開く。
- Modalにはopenの判定、閉じるときの動き、`ariaLabel`を渡す。

当初は、MovementsGalleryは表示を担当し、Modalが開閉のstateを持つと捉えていた。

## Codex Preフィードバック

- `selectedImage`には、表示対象の画像オブジェクトが入る。
- `open`は別のstateではなく、`selectedImage !== null`から作る派生値。
- 開閉のstateをModalが持つのではなく、MovementsGalleryが選択画像をstateとして所有する。
- Modalは`open`、`onClose`、`ariaLabel`、`children`をpropsとして受け取るcontrolled component。
- `onClose`は閉じる操作を親へ通知し、MovementsGalleryが`selectedImage`を`null`へ戻す。

## 方針説明

責務を次のように整理した。

- `MovementsGallery`: 画像一覧を表示し、Modalに表示する画像を選択・管理する。
- `Modal`: 渡された開閉状態に従ってdialogを開閉し、終了操作を呼び出し側へ知らせる。

## テスト方針説明

候補として次を挙げた。

- 正しく開くか。
- 閉じるボタンで閉じるか。
- 画像の`src`がない場合にどうなるか。

検討の結果、`entries`や`images`の内容は静的データ作成時、レビュー、画面確認で判断できるため、現時点ではコンポーネントテストの優先度を上げないことにした。今後データの追加・削除をチームで継続的に行い、機能として保証する必要が生じた場合は別途検討する。

## Codex方針・テスト方針フィードバック

テスト境界を次のように整理した。

- 選択した画像で開く振る舞いは`MovementsGallery`で確認する。
- 閉じるボタンが`onClose`を呼ぶことは`Modal`で確認する。
- 閉じた結果として画像が消えることは`MovementsGallery`で確認する。
- データ内容そのものより、選択、表示、終了、再選択という利用者から見える振る舞いを守る。

既存テストがこれらを押さえているため、今日はテストを追加しなかった。

## 今日の読解

`dialogRef.current`は、画面に配置された実際の`<dialog>` DOM要素を指す。

Reactの`open` propだけでnative dialogがモーダルになるわけではない。`useEffect`が`open`の変化を受け、`HTMLDialogElement`のブラウザ標準Web APIである`showModal()`または`close()`を呼び出して、React側の状態とDOMを同期する。

`showModal()`を使うことで、ブラウザが次の機能を担当する。

- dialogをtop layerへ表示する。
- `::backdrop`を提供する。
- dialog外を操作できない状態にする。
- フォーカスをdialog内へ移す。
- Escapeによる`cancel`イベントを提供する。

`setAttribute('open', '')`は、テスト環境などで`showModal()`が存在しない場合の代替処理として置かれている。

## Post説明

- MovementsGalleryは、Modalへ表示する画像を扱う。
- Modalは、開く・閉じる処理を扱う。
- dialogは、UI・UXの標準機能を提供する。

## Codex Postフィードバック

Post説明の方向は正しい。より具体的には次のように説明できる。

- `MovementsGallery`は画像一覧を表示し、選択画像のstateを所有する。
- `Modal`は開閉stateを所有せず、親から渡された`open`をnative dialogへ同期し、閉じる操作を`onClose`で親へ返す。
- ブラウザ標準の`<dialog>`と`HTMLDialogElement` Web APIが、モーダル表示、top layer、背景の操作抑止、フォーカス、Escapeなどの基礎的なUI・UXを担う。

## Pre/Postの差分

```txt
Pre: Modalが開閉のstateを持つと捉えていた
Post: 選択stateはMovementsGalleryが持ち、ModalはstateとWeb APIを接続すると整理できた
```

さらに、`showModal()`がReact独自機能ではなくブラウザ標準のWeb APIだと理解したことで、HTML、CSS、JavaScriptの役割を「使用言語」ではなく「責務」で考えられるようになった。

## 今日の設計判断

- ブラウザ標準で提供されているUIの基礎機能を、JavaScriptで再発明しない。
- HTMLは意味と標準動作、CSSは見た目、JavaScriptやReactはアプリ固有の状態と動的処理を担当する。
- JavaScriptが不要になったのではなく、ブラウザが担える責務が増えたため、アプリ固有の処理へ集中できる。
- テストでは静的データの現在の内容より、利用者から見える選択・表示・終了・再選択の振る舞いを優先する。

## チーム勉強会へ持ち帰る説明

> 昔はJavaScriptで自作していたUIの土台を、いまはブラウザ標準へ任せられる。JavaScriptを使わないことが目的ではなく、ブラウザ標準を再発明せず、プロダクト固有の処理に集中することが大切。

## 明日への問い

- `open`が`false`になったとき、`useEffect`と`close()`はどの順序で動くか。
- `onCancel`で`preventDefault()`したあと、なぜ`onClose()`を呼ぶ必要があるか。
- Reactのstateとnative DOMの状態がずれた場合、このcontrolled Modalはどう同期を取り直すか。
- `<dialog>`以外に、PAFでJavaScriptによる自作をブラウザ標準へ置き換えられるUIはあるか。
