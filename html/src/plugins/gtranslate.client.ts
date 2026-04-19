export default defineNuxtPlugin(() => {
  // 1. 設定オブジェクトを window に登録
  window.gtranslateSettings = {
    default_language: 'ja',
    languages: ['ja', 'en'],
    wrapper_selector: '.gtranslate_wrapper',
    flag_size: 16,
    horizontal_position: 'right',
    vertical_position: 'bottom',
  };

  // 2. GTranslate の本体スクリプトを動的に生成して注入
  const script = document.createElement('script');
  script.src = 'https://cdn.gtranslate.net/widgets/latest/flags.js';
  script.defer = true;

  // body または head に追加
  document.head.appendChild(script);
});
