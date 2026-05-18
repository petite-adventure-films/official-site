import type { DVD } from '@/types/dvd';

export const PRODUCTS_DVD: DVD[] = [
  {
    id: 6,
    name: 'my_indian_diary',
    film_id: 'my_indian_diary',
    article_component: 'MyIndiaDiary',
    title: 'インド日記～ガジュマルの木の女たち～',
    prices: [
      { type: '新作応援', disc: ['DVD', 'ブルーレイ'], amount: 5000 },
      { type: '一般', disc: ['DVD'], amount: 3000 },
      { type: '団体･ライブラリー', disc: ['DVD', 'ブルーレイ'], amount: 10000 },
    ],
    disc: [
      { index: 'DVD', number: 2, type: 'NTSC/DVD-R', content: '映画本編206分(全6部構成)' },
      { index: 'ブルーレイ', number: 1, type: 'NTSC/BD-R', content: '映画本編206分(全6部構成)' },
    ],
    image_num: 2,
    catch: '次回作のエンドクレジットにお名前掲載！<br />新作応援DVD/ブルーレイ販売中！',
    intro:
      '<p class="font-bold">まるでガジュマルの木のように…<br />無数の根を生やし、つながる女性たち。<br />しなやかな底力が、社会を変える！</p><p class="mt-2">インドで出会った女性たちを記録した、映像旅日記。社会の最底辺で働く女性たちの団体・SEWAを取材し、彼女たちがビデオカメラを武器に、生活を向上させていく様子を紹介する。デリーのアジア女性映画祭では、イラン、インドの女性映画監督たちの素顔にも迫る。インドで出会った、パワフルすぎる女性たちに圧倒されよ！</p><p class="mt-2 caption1">※オリジナルは206分ですが、上映用の100分バージョンもあります。</p>',
    article_type: 'main',
  },
  {
    id: 5,
    name: 'dancing_zempukuji__apprentice_homeless',
    film_id: ['dancing_zempukuji', 'apprentice_homeless'],
    article_component: 'DancingZempukujiApprenticeHomeless',
    title: '踊る善福寺 / ホームレスごっこ',
    prices: [
      { type: '一般', disc: ['DVD'], amount: 1500 },
      { type: '団体･ライブラリー', disc: ['DVD'], amount: 10000 },
    ],
    disc: [
      { index: 'DVD', number: 1, type: 'NTSC/DVD-R', content: '｢踊る善福寺｣(50分) / ｢ホームレスごっこ｣(16分)' },
    ],
    image_num: 2,
    catch: 'アートプロジェクト｢Dislocate｣参加<br />２作品を収録！',
    intro:
      '<p class="font-bold">善福寺を舞台に繰り広げられる、<br />古今東西の踊りが心揺さぶる</p><p class="mt-2">アート・プロジェクト「Dislocate（ディスロケイト）」に参加して作られた作品の二本立て。東京西部の小さな町・善福寺に暮らし、歌い、踊る人々を記録した中編、『踊る善福寺』。韓国太鼓・チャンゴから、神楽、江戸かっぽれ、コンテンポラリーダンスまで、古今東西のあらゆる踊りが、善福寺を舞台に繰り広げられる。一方、善福寺に店を構え、百歳を超えてなお現役で働くコーヒー豆店主は、表立って語られることのない、かつてのこの国の姿を今に伝える。短編『ホームレスごっこ』は、公共の場所が自由に使えなくなっている現状を風刺した作品。スーパーでダンボールを調達し、路上で寝るというパフォーマンスを通じて、作者は公共の空間に自分の居場所を確保しようと試みる。</p>',
    article_type: 'main',
  },
  {
    id: 4,
    name: 'a_woman_from_fukushima',
    film_id: 'a_woman_from_fukushima',
    article_component: 'AWomanFromFukushima',
    title: '木田さんと原発､そして日本',
    prices: [
      { type: '一般 日本語版', disc: ['DVD'], amount: 1000 },
      { type: '一般 英語版"A Woman From Fukushima"', disc: ['DVD'], amount: 1000 },
      { type: '団体･ライブラリー', disc: ['DVD'], amount: 10000 },
    ],
    specials: true,
    disc: [
      { index: 'DVD', number: 1, type: 'NTSC/DVD-R', content: '本編(前＆後編合計64分)、豪華特典映像' },
    ],
    image_num: 2,
    catch: '豪華特典映像＆英語版あり！',
    intro:
      '<p class="font-bold">今は福島のこと<br />いつかは貴方の町のこと…</p><p class="mt-2">東日本大震災前、福島県双葉郡富岡町で暮らしていた木田節子さん。原発に近い場所に家を建てた当時のこと、原発関連企業で働く息子のこと、震災を機に変わった夫との関係、避難民になって思うこの「日本」という国について語る。後編では、2013年7月の参議院議員選挙に立候補した木田さんの、選挙活動を取り上げる。"反原発"を掲げ立候補した彼女が直面する数々の出来事は、まさに日本社会の縮図。原発を支えてきた日本社会のありようが、声を上げようと立ち上がった木田さんの前に立ちはだかる。</p><p class="mt-2 font-bold">英語版の内容</p><p class="mt-2">英語版は、「木田さんと原発、そして日本」本編（再編集バージョン56分）のみとなります。特典映像はありません。英語版の国内向け発送は送料300円ですが、海外向けの送料は国によって異なります。海外のご住所宛の発送は、<a href="http://en.petiteadventurefilms.com/" target="_blank" class="link-text">英語ページ</a>からお申し込みください。</p>',
    article_type: 'specials',
  },
  {
    id: 3,
    name: 'otome_house',
    film_id: 'otome_house',
    article_component: 'OtomeHouse',
    title: '乙女ハウス',
    prices: [
      { type: '一般', disc: ['DVD'], amount: 1000 },
      { type: '団体･ライブラリー', disc: ['DVD'], amount: 10000 },
    ],
    disc: [
      { index: 'DVD', number: 1, type: 'NTSC/DVD-R', content: '本編(43分) / 豪華漫画本(フルカラー12P)' },
    ],
    image_num: 3,
    catch: '豪華フルカラー漫画本プレゼント！',
    intro:
      '<p class="font-bold">現代日本の住宅・貧困問題の解決に一石を投じるか？！<br />「乙女ハウス」が投げかける、これからの住まいのカタチ</p><p class="mt-2">持ち家なんてとんでもない！　ワーキングプア世代のキビシイ住宅事情。一方、頑張れば家を持てた世代に重くのしかかる"空き家"の問題･･･。「乙女ハウス」は、空き家を住宅に困る女性たちに提供し、固定資産税分を月1万円の家賃として負担してもらう、ユニークな仕組みの家。この試みは、現代日本の住宅・貧困問題の解決に一石を投じるでしょうか？　オーナーの千野さんと住民に取材した、「乙女ハウス」始まりと終わりの記録。</p>',
    article_type: 'specials',
  },
  {
    id: 2,
    name: 'goodbye_ur',
    film_id: 'goodbye_ur',
    article_component: 'GoodbyeUR',
    title: 'さようならUR',
    prices: [
      { type: '一般', disc: ['DVD'], amount: 2500 },
      { type: '団体･ライブラリー', disc: ['DVD'], amount: 10000 },
    ],
    disc: [
      { index: 'DVD', number: 2, type: 'NTSC/DVD-R', content: '本編(73分) / 豪華特典映像' },
    ],
    image_num: 2,
    intro:
      '<p class="font-bold">耐震問題で揺れるUR（旧住宅公団）の団地<br />生活基盤の住居が足元から揺らぐ…</p><p class="mt-2">UR（旧住宅公団）が突然取り壊しを決めた、東京都日野市の高幡台団地73号棟。URの決定に疑問を持ち、立ち退きを拒否する住民たちへの取材を皮切りに、カメラは住宅問題の専門家、国交省、ついにはURの理事長へと立ち向かう！　映画は映画は公共住宅問題にとどまらず、日本の組織体制の問題をも浮き彫りにする。山形国際ドキュメンタリー映画祭2011 第1回スカパー！IDEHA賞受賞作品。</p>',
    article_type: 'specials',
  },
  {
    id: 1,
    name: 'brian_and_co',
    film_id: 'brian_and_co',
    article_component: 'BrianAndCo',
    title: 'ブライアンと仲間たち パーラメント･スクエアSW1',
    prices: [
      { type: '一般', disc: ['DVD'], amount: 1500 },
      { type: '団体･ライブラリー', disc: ['DVD'], amount: 10000 },
    ],
    disc: [
      { index: 'DVD', number: 1, type: 'NTSC/DVD-R', content: '本編(97分) / 豪華特典映像' },
    ],
    image_num: 2,
    intro:
      '<p class="font-bold">王室でも、サッカーでもない、"新たなイギリス"ここに誕生！</p><p class="mt-2">イギリス国会前の広場で、英米政府によるイラクへの経済制裁・対テロ攻撃に反対し、2001年より10年間座り込みを続けた平和活動家、ブライアン･ホウ。映画は、ブライアンと彼のサポーターたちに密着し、国家の圧力により表現の自由が脅かされている現状と、それに対してユーモアあふれる精神で対抗する人々の姿を伝える。これぞ、イギリス民主主義の底力！　2009年度日本ジャーナリスト会議・黒田清JCJ新人賞受賞作品。</p>',
    article_type: 'specials',
  },
];
