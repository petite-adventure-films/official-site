import type { DVD } from '~/types/dvd';
export const PRODUCTS_DVD: DVD[] = [
  {
    id: 6,
    name: 'my_india_diary',
    film_id: 'my_india_diary',
    title: 'インド日記～ガジュマルの木の女たち～',
    prices: [
      { type: '新作応援', disc: ['DVD', 'ブルーレイ'], amount: 5000 },
      { type: '一般', disc: ['DVD'], amount: 3000 },
      {
        type: '団体･ライブラリー',
        disc: ['DVD', 'ブルーレイ'],
        amount: 10000,
      },
    ],
    disc: [
      {
        index: 'DVD',
        number: 2,
        type: 'NTSC/DVD-R',
        content: '映画本編206分(全6部構成)',
      },
      {
        index: 'ブルーレイ',
        number: 1,
        type: 'NTSC/BD-R',
        content: '映画本編206分(全6部構成)',
      },
    ],
    image_num: 2,
  },
  {
    id: 5,
    name: 'dancing_zempukuji__apprentice_homeless',
    film_id: ['dancing_zempukuji', 'apprentice_homeless'],
    title: '踊る善福寺 / ホームレスごっこ',
    prices: [
      { type: '一般', disc: ['DVD'], amount: 1500 },
      { type: '団体･ライブラリー', disc: ['DVD'], amount: 10000 },
    ],
    disc: [
      {
        index: 'DVD',
        number: 1,
        type: 'NTSC/DVD-R',
        content: '｢踊る善福寺｣(50分) / ｢ホームレスごっこ｣(16分)',
      },
    ],
    image_num: 2,
  },
  {
    id: 4,
    name: 'a_woman_from_fukushima',
    film_id: 'a_woman_from_fukushima',
    title: '木田さんと原発､そして日本',
    prices: [
      { type: '一般 日本語版', disc: ['DVD'], amount: 1000 },
      {
        type: '一般 英語版"A Woman From Fukushima"',
        disc: ['DVD'],
        amount: 1000,
      },
      { type: '団体･ライブラリー', disc: ['DVD'], amount: 10000 },
    ],
    specials: true,
    disc: [
      {
        index: 'DVD',
        number: 1,
        type: 'NTSC/DVD-R',
        content: '本編(前＆後編合計64分)、豪華特典映像',
      },
    ],
    image_num: 2,
  },
  {
    id: 3,
    name: 'otome_house',
    film_id: 'otome_house',
    title: '乙女ハウス',
    prices: [
      { type: '一般', disc: ['DVD'], amount: 1000 },
      { type: '団体･ライブラリー', disc: ['DVD'], amount: 10000 },
    ],
    disc: [
      {
        index: 'DVD',
        number: 1,
        type: 'NTSC/DVD-R',
        content: '本編(43分) / 豪華漫画本(フルカラー12P)',
      },
    ],
    image_num: 3,
  },
  {
    id: 2,
    name: 'goodbye_ur',
    film_id: 'goodbye_ur',
    title: 'さようならUR',
    prices: [
      { type: '一般', disc: ['DVD'], amount: 2500 },
      { type: '団体･ライブラリー', disc: ['DVD'], amount: 10000 },
    ],
    disc: [
      {
        index: 'DVD',
        number: 2,
        type: 'NTSC/DVD-R',
        content: '本編(73分) / 豪華特典映像',
      },
    ],
    image_num: 2,
  },
  {
    id: 1,
    name: 'brian_and_co',
    film_id: 'brian_and_co',
    title: 'ブライアンと仲間たち パーラメント•スクエアSW1',
    prices: [
      { type: '一般', disc: ['DVD'], amount: 1500 },
      { type: '団体･ライブラリー', disc: ['DVD'], amount: 10000 },
    ],
    disc: [
      {
        index: 'DVD',
        number: 1,
        type: 'NTSC/DVD-R',
        content: '本編(97分) / 豪華特典映像',
      },
    ],
    image_num: 2,
  },
];
