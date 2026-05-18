# URLパス一覧（SEO保護・移行チェック用）

> **このファイルは移行完了後に削除する。**
> Astro移行後、全URLが正常に応答することを確認したら `docs/url-inventory.md` ごと削除してよい。

取得元: `https://www.petiteadventurefilms.com/sitemap.xml`（2026-05-18時点）

---

## 変えてはいけないパス

### ブログ記事（ルートレベルスラッグ）

現行Nuxtでは `[pageName].vue` によって `/スラッグ` として配信。  
Astroでは `src/pages/[slug].astro`（または `[...slug].astro`）で同形式を維持すること。  
固定ページ（`/blog`、`/films` 等）と衝突しないよう、静的ルートが動的ルートより優先されることを確認。

```
/20160719
/20160806_a3bc_workshop
/20160815
/20160911_festival
/20161127_maruki_museum
/20161210_oka_sid
/20161218_inoue_megumi
/20161224_christmas_eve
/20170205-2
/20170405
/20170406
/20170407-2
/20170409
/20170414
/20170415
/20170430_kosaten
/20170507_comments
/201705_civil_ws
/20170801
/20170808_koenavi_screening_report
/20170819_no_nukes_tent
/20170819_report
/20170830_civil_screening
/20170914_tent
/20170924_civil_ws
/20170930_screening_report
/20171001_fij
/20171003_jyoan
/201710_jcj
/20171119_kosaten_ws
/2017_yamagata
/20180414_screening_report
/20180623_screening_report
/20181024_civil_screening
/20181110_shachihokoff_1
/20181110_shachihokoff_2
/20181110_shachihokoff_3
/20181118_1
/20181118_2
/20181118_3
/20181213-2
/20181215
/20190211
/20190223
/20190315
/20190405
/20190506
/20190624
/20190628_rojyo_sake_demo
/20190712_reiwa
/20190727
/20190827_editing_diary
/20190911
/2019_yamagata_ossan
/20200109_nvrn
/20200205
/20200228_peaceful_energy
/20200321_aichi_peace_ff
/20200530
/202005_civil_news
/20200821_editing_dairy
/20200910
/20200914
/20200916_editing_diary
/20200919_musica_report
/20200926_freelance_event
/20201024_civil_ws
/20201110_himawari_pre
/20201112-2
/20201112-3
/20201114_civil
/20201115
/20201115_himawari_report
/20201203
/20201206
/20201219_kakekomi_screening
/20201229
/2020_civil_ws
/20210108_archives_2
/20210114
/20210309_screening_report
/20210311_event_report
/20210311_tent_event
/20210316
/20210723
/20210729_uplan
/20210824
/20210906_santama_event
/20210911_report
/20210917
/20210922_kakekomitei
/20210930-2
/20211003
/20211013_screening
/20211014-2
/20211101
/20211113
/20211123
/20211126
/20211128_civil_kourai
/20211201-2
/20211206_pro_shimin
/20220126-2
/20220126_ooma_honmasan
/20220126_ooma_lawyer_report
/20220209
/20220223_purna
/20220225-2
/20220227
/20220311
/20220319-0320_pro_shimin_report
/20220319-20_pro_shimin_event
/20220319_pro_shimin_videos
/20220511_event
/20220511_report
/20220614
/20220614_report
/20220702_okagami_ws
/20220718_civil
/20220817_archives_3
/20220821
/20220827-0903_fukuoka
/20220911_report
/20220927_state_funeral
/20221019_event_notice
/20221019_video_report
/20230301_ooma_saiban_report
/20230310_report
/20230906_cookinghouse
/20230911_anti_nuke_tent_event_report
/20230911_event_info
/20230911_peace_walk_talk_report
/20230912_report
/20231007_yamamotokenichi
/20231021
/20231119_himawari_report
/2023_civil_video_ws
/2023_civil_ws_report_vol1
/2023_civil_ws_report_vol2
/2023_civil_ws_report_vol3
/2023_civil_ws_report_vol4
/2023_civil_ws_report_vol5
/2023_civil_ws_report_vol6
/2023_civil_ws_report_vol7
/2023_civil_ws_report_vol8
/20240105_report
/20240108_friday_action_600th_report
/20240226_event_info
/20240226_ooma_saiban_report
/20240311_event_info
/20240426_o2_report
/20240902_report
/20240915_atarashiki_mura_screening_report
/20241018_report
/20241117_report
/20241226_nwec
/20250123_o2_saiban_report
/20250205_nwec
/20250222_event
/20250222_report
/20250226_report
/34_bunmei_forum_event
/akane_trespassing
/amnesty_ff_2017
/artgallery_884
/astrazeneca_vaccine_uk
/banksy_genius_or_vandal
/brian_international_archives_week
/bunny_taking_on_trump
/civil_workshop_201609
/column_20171229
/column_20180105
/column_20180202
/column_20180315
/column_20180404
/column_20180410
/column_20180418
/column_20180420
/column_20180614
/column_20180928
/column_20181009
/column_20181030
/column_20181031
/covid_8_report_20221225
/director_life_1_20170805
/director_life_2_20170806
/director_life_3_20170825
/director_life_4_20170907
/director_life_5_20170916
/director_life_7_20171014
/director_life_8_20171027
/director_life_9_20171109
/director_life_10_20171205
/director_life_11_20171205
/director_life_12_20171208
/director_life_13_20171212
/director_life_14_20171214
/director_life_15_20171217
/director_life_16_20171221
/director_life_17_20171230
/director_life_18_20180102
/director_life_19_20180109
/director_life_20_20180112
/director_life_21_20180117
/director_life_22_20180123
/director_life_23_20180125
/director_life_24_20180126
/director_life_25_20180131
/director_life_26_20180201
/director_life_27_20180203
/director_life_28_20180215
/director_life_29_20180216
/director_life_30_20180301
/director_life_31_20180302
/director_life_32_20180314
/director_life_33_20180317
/director_life_34_20180320
/director_life_35_20180321
/director_life_36_20180323
/director_life_37_20180324
/director_life_38_20180328
/director_life_39_20180331
/director_life_40_20180405
/director_life_41_20180406
/director_life_42_20180415
/director_life_43_20180417
/director_life_44_20180508
/director_life_45_20180522
/director_life_46_20180530
/director_life_47_20180602
/director_life_48_20180603
/director_life_49_20180609
/director_life_50_20180620
/director_life_51_20180714
/director_life_52_20180724
/director_life_53_20180728
/director_life_54_20180731
/director_life_55_20180802
/director_life_56_20180809
/director_life_57_20180917
/director_life_58_20180921
/director_life_59_20180926
/director_life_60_20210131
/editing_diary_20171130
/editing_diary_20171202
/editing_diary_20171207
/editing_diary_20171215
/editing_diary_20171219
/editing_diary_20171226
/editing_diary_20180110
/editing_diary_20180118
/editing_diary_20180120
/editing_diary_20180130
/editing_diary_20180220
/editing_diary_20180227
/editing_diary_20180307
/editing_diary_20180318
/editing_diary_20180329
/editing_diary_20180401
/editing_diary_20180403
/editing_diary_20180411
/editing_diary_20180503
/editing_diary_20180504
/editing_diary_20180519
/editing_diary_20180619
/editing_diary_20180715
/editing_diary_20180719
/editing_diary_20180815
/editing_diary_20180901
/editing_diary_20180909
/editing_diary_20180930
/editing_diary_20181003
/editing_diary_20181007
/editing_diary_20190726
/fukuoka_sound_demo
/goodbye_ur_dvd_details
/goodbyeur_france_report
/himawari_2022_report
/how_to_video_workshop
/kidasan_dvd_details
/komiya_chibi
/koyama_kai_small_resistance
/morinoeigasha_20200124
/my_indian_diary_20160802
/my_indian_diary_details_jp
/my_indian_diary_message_of_one_photo
/naito_mitsuhiro
/narita_hidehiko_1
/narita_hidehiko_2
/narita_hidehiko_3
/narita_hidehiko_4
/narita_hidehiko_5
/narita_hidehiko_6
/new_blog_started
/omisenoyounamono
/otome_house_dvd_details
/peace_builders_film_festival
/screening_report_20210424
/screening_report_20210619
/senior_womens_film_festival_2019
/solar_girl_fujii_chikako
/tent_news_20251125
/tent_photos_20160805_0806
/woman_director_now
/zempukuji_homeless_dvd_details
```

### 固定ページ

```
/
/blog
/blog/recommended
/channel
/contact
/copyrights-disclaimers
/director
/events
/films
/four-walling
/gathering-the-personal-information
/media
/news
/pafshop
/pafshop/faq
/privacy-policy
/specified-commercial-transaction-law
/system-requirements
/takahatadai73
/workshop
```

### ページネーション

```
/blog/page/1  〜  /blog/page/31
/blog/recommended/page/1  〜  /blog/recommended/page/3
/news/page/1  〜  /news/page/25
```

### 動的ページ（IDベース）

```
/channel/4737  /channel/4739  /channel/4740  /channel/4741  /channel/4742
/channel/4743  /channel/4744  /channel/4745  /channel/4746  /channel/4747
/channel/4748  /channel/4749  /channel/4750  /channel/12568 /channel/12569
/channel/14156 /channel/17802 /channel/17803 /channel/17804 /channel/17806
/channel/17837

/events/2253  /events/2254  /events/2256  /events/3797 〜 /events/3947（連番、一部欠番）
/events/4033  /events/4525  /events/4526  /events/4614 〜 /events/4779
/events/5228  /events/5302  /events/5307  /events/5334  /events/5414
/events/5464  /events/5588  /events/5590  /events/5592  /events/6255
/events/6492  /events/6967  /events/7648  /events/7860  /events/8675
/events/10128 /events/10276 /events/10279 /events/10282 /events/10355
/events/11227 /events/11228 /events/11654 /events/11788 /events/11789
/events/12056 /events/12216 /events/12407 /events/12560 /events/12608
/events/12794 /events/13266 /events/13594 /events/13620 /events/13786
/events/13836 /events/13954 /events/13959 /events/13962 /events/14380
/events/14821 /events/15355 /events/15356 /events/15623 /events/15631
/events/15660 /events/15839 /events/16004 /events/16185 /events/16222
/events/16226 /events/16437 /events/17216 /events/17436 /events/17531
/events/17548 /events/17713 /events/17776 /events/17813 /events/17820
/events/17835 /events/17836 /events/18035 /events/18036

/events/archive/2011 〜 /events/archive/2025

/media/4783  /media/5231  /media/5235  /media/5237  /media/5239
/media/5241  /media/5244  /media/5246  /media/5247  /media/5248
/media/5249  /media/5251  /media/5256  /media/5266  /media/5270
/media/5935  /media/9130  /media/12207 /media/17462 /media/17542
/media/17707 /media/17839
```

### 動的ページ（スラッグベース）

```
/films/a_woman_from_fukushima
/films/apprentice_homeless
/films/atarashikimura
/films/brian_and_co
/films/dancing_zempukuji
/films/four_years_on
/films/goodbye_ur
/films/my_indian_diary
/films/otome_house

/pafshop/a_woman_from_fukushima
/pafshop/brian_and_co
/pafshop/dancing_zempukuji__apprentice_homeless
/pafshop/goodbye_ur
/pafshop/my_indian_diary
/pafshop/otome_house
```

---

## リダイレクト対応が必要なパス

URLが変わらない設計であれば基本的にリダイレクト不要。  
ただし以下は `_redirects` に追加する：

```
# page/1 は一覧ページと同内容のため正規化
/blog/page/1              /blog              301
/news/page/1              /news              301
/blog/recommended/page/1  /blog/recommended  301
```

---

## インデックス対象外（robots.txt disallow）

機能は維持するが、SEO保護の優先度は低い：

```
/contact/thanks
/contact/error
/pafshop/thanks
/pafshop/cancel
/pafshop/error
/pafshop/cart
/404
```

---

## 移行後チェック方法

### ステップ1：WPに追加された記事を洗い出す

移行作業中もWPへの投稿は続くため、DNS切り替え前に差分を確認する。  
このファイル作成時点（2026-05-18）のスラッグ一覧と、切り替え直前のsitemapを比較する。

```bash
# 現在のsitemapからルートスラッグ（ブログ記事）だけ抽出してファイルに保存
curl -s https://www.petiteadventurefilms.com/sitemap.xml \
  | grep -oP '(?<=<loc>)[^<]+' \
  | sed 's|https://www.petiteadventurefilms.com||' \
  | grep -v '/' \
  | sort > /tmp/sitemap_slugs_latest.txt

# このファイル内のスラッグ一覧を抽出して比較
grep -oP '(?<=/)\w[\w-]*$' docs/url-inventory.md \
  | grep -v '/' \
  | sort > /tmp/inventory_slugs.txt

# 差分を表示（左側 = inventory未記載の新規スラッグ）
diff /tmp/inventory_slugs.txt /tmp/sitemap_slugs_latest.txt
```

差分に出たスラッグは、Astro側で正しくレンダリングされるかを個別に確認する。  
ブログ記事は `[slug].astro` の動的ルートで自動対応されるはずなので、**WPのAPIから記事が取得できているかどうか**を確認すれば十分。

### ステップ2：全URLの応答コードチェック

```bash
# sitemap.xmlのURLを全件チェック（200以外を洗い出す）
curl -s https://www.petiteadventurefilms.com/sitemap.xml \
  | grep -oP '(?<=<loc>)[^<]+' \
  | xargs -I{} sh -c 'code=$(curl -o /dev/null -s -w "%{http_code}" "{}"); [ "$code" != "200" ] && echo "$code {}"'
```
