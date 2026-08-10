# 2026-07-24: ImageCarouselのテスト境界と設計判断

## テーマ

`ImageCarousel` の `images` 変更時リセットについて、テストが保証していることと、設計判断として決めることを整理した。

前回追加した実装:

```tsx
useEffect(() => {
  setCurrentIndex(0);
}, [images]);
```

## Pre説明

ユーザー説明:

- props が変わったとき、state 同期はなおすべき。
- 判断材料は props の `images` を見る。
- `useEffect` 依存は `images` でよい。理由は、`images` が変わったかどうかの判断でよいから。

## Codexフィードバック

- `ImageCarousel` の外部入力は `images` なので、「画像セットが変わった」という判断を props の境界で見る説明は自然。
- `boundedImages` は表示用に正規化された内部値であり、変更検知の主語とは少し違う。
- ただし `images` は配列なので、親が毎回新しい配列を作ると、中身が同じでも参照変更によりリセットされる。
- この設計は「親は意味なく `images` を作り直さない」か、「作り直されても先頭に戻ってよい」という前提を含む。

## テスト境界の整理

既存テスト:

```tsx
it('resets the active image when the image set changes', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<ImageCarousel images={images} ariaLabel="テスト写真" />);

  await user.click(screen.getByRole('button', { name: '画像3' }));
  expect(activeItems()[0]?.contains(screen.getByAltText('3枚目の写真'))).toBe(true);

  rerender(<ImageCarousel images={otherImages} ariaLabel="テスト写真" />);

  await waitFor(() => {
    expect(activeItems()[0]?.contains(screen.getByAltText('別セットの1枚目'))).toBe(true);
  });
});
```

このテストが保証していること:

- 別の画像セットが渡されたら、前の表示位置を引きずらない。
- 新しい画像セットの1枚目が active になる。
- `currentIndex` や `setCurrentIndex(0)` を直接見ず、ユーザーから見える表示結果を見ている。

このテストが保証していないこと:

- `useEffect` の依存配列を `images` にするべきか。
- `boundedImages` や `boundedImages.length` に依存するべきか。
- `key` で別コンポーネントとして扱うべきか。

依存配列の選択は、テストではなく設計判断の領域。

## Post説明

ユーザー説明:

- テストで保証していることは、`images` が変わっても React が前回の振る舞いを持ち続けず、state が初期化されているかを見ていること。
- 設計判断で決めることは、state を初期化する判断材料として `images` が正しいかを判断すること。

## Codex Postフィードバック

方向性は合っている。

より振る舞い寄りに言い換えるなら:

```txt
テストで保証しているのは、images が別の画像セットに変わったとき、
前の表示位置を引きずらず、新しい画像セットの1枚目が表示されること。

内部的には state が初期化されているはずだが、
テストは state そのものではなく、画面上の active 画像を見る。
```

設計判断としては:

```txt
state を初期化する判断材料を、外部入力である props.images にする。
boundedImages は表示用に加工された内部値なので、
変更検知の主語をどちらに置くかは設計として選ぶ。
```

## 今日の要点

```txt
テストは、ユーザーから見える約束を保証する。
設計判断は、その約束をどの入力・責務・境界で実現するかを決める。
```

## 明日への問い

- `images` 参照が変わるだけでリセットされる設計は、親コンポーネントの責務とどう関係するか。
- 親側の `key={galleryId}` と子側の `useEffect` 同期は、どんな基準で使い分けるか。
- `currentIndex` が `boundedImages.length` を超えたとき、先頭に戻すべきか、最後の画像に丸めるべきか。
