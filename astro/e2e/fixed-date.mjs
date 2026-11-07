// E2Eビルドだけに読み込む。日付依存の一覧・年別ルートを再現可能にする。
const NativeDate = globalThis.Date;
const fixedTime = NativeDate.parse('2026-11-07T12:00:00+09:00');
globalThis.Date = class extends NativeDate {
  constructor(...args) {
    super(...(args.length ? args : [fixedTime]));
  }

  static now() {
    return fixedTime;
  }
};
