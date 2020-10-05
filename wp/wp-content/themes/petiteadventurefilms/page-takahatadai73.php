<?php

$key_messages_path = __DIR__.'/assets/json/key_messages.json';
$key_messages = file_get_contents($key_messages_path);
$residents_path = __DIR__.'/assets/json/residents.json';
$residents = file_get_contents($residents_path);
$timeline_path = __DIR__.'/assets/json/timeline.json';
$timeline = file_get_contents($timeline_path);
$goodbye_gallery_path = __DIR__.'/assets/json/goodbye_gallery.json';
$goodbye_gallery = file_get_contents($goodbye_gallery_path);
$movement_now_path = __DIR__.'/assets/json/movement_now.json';
$movement_now = file_get_contents($movement_now_path);

get_header(); ?>

<div class="single">
    
    <div class="col col_9 last">
    
        <div class="outward_area" ref="outward_area">
        
            <transition name="outward" appear>
                <div v-show="displayTkhtd73 == true" class="outward" ref="outward">
                    <div class="img">
                        <img src="<?php echo bloginfo("template_url"); ?>/assets/img/takahatadai73/takahatadai73.png">
                    </div>
                    <div class="cloud _1"></div>
                    <div class="cloud _2"></div>
                    <div class="cloud _3"></div>
                    <div class="cloud _4"></div>
                    <div class="cloud _5"></div>
                    <div class="cloud _6"></div>
                    <div class="cloud _8"></div>
                </div>
            </transition>
            
            <div class="greeting_director" ref="greeting_director">
                <p class="subhead1 al_c">復刻版公開に寄せて</p>
                <p>
                    映画『さようならUR』の主人公でもある、「高幡台団地73号棟に住み続けたい住民の会」。<br>
                    2013年に立ち退き裁判をたたかっていた当時の「住民の会」ホームページが、この度復刻版となって登場しました！<br>
                    今回新たに、裁判後の情報も追加しました。UR団地の削減方針は、現在も維持されたままです。高幡台団地73号棟のたたかいが、全国で建て替え・取り壊し問題に直面する方々の取り組みに生かされることを願います。
                </p>
                <p class="al_r">
                    2020年10月<br>
                    プチ・アドベンチャー・フィルムズ<br>
                    早川由美子
                </p>
            </div>
    
            <header class="main_visual" ref="main_visual">
                <h1>
                    <div ref="flags">
                        <div class="_flag"><span class="tkhtd_green block">きいろい</span>はたに</div>
                        <div class="_flag"><span class="tkhtd_green block">ねがいを</span>こめて</div>
                    </div>
                    <div class="_subtitle">
                        <span class="block">高幡台団地73号棟に</span><span class="block">住み続けたい住民の会</span><span class="block">の記録</span>
                    </div>
                </h1>
            </header>
    
            <div class="key_messages" ref="key_messages">
                <div
                v-for="arr in key_messages"
                :key="'catch' + arr.key"
                    class="_message">
                    <div
                    :ref="`ur_msg_${arr.key}`"
                    class="__ur" v-html="arr.ur"></div>
                    <transition appear name="key_messages">
                        <div
                        v-show="displayRsdtMsg[(arr.key - 1)]"
                        class="__rsdt"
                        v-html="arr.residents"></div>
                    </transition>
                </div>
            </div>
    
        </div>

        <section class="contents greeting_residents" ref="greeting_residents">
            <h2 class="contents_title"><span class="_text">住民からのご挨拶</span></h2>
            <div class="al_c">
                <p><small>※2013年当時の挨拶</small></p>
            </div>
            <div class="m4_t">
                <p>私たちのホームページにおいでいただきありがとうございます。</p>
                <p>2008年5月1日、読売新聞がスクープして社会問題となった、URの耐震不足住棟の取り壊し問題。この報道で名前が公表された団地は、関東地方では、私たち高幡台団地73号棟のほか、千葉・幸町団地と埼玉・武里団地でした。すでにこの2団地の該当住棟は取り壊されて、更地となってしまいましたが、私たちの73号棟はしっかりと建っています。</p>
                <p>あれから4年半。私たちは悩み、苦しみ、そして多くの皆様の協力を得ながらいろいろなことを学び、行動してきました。早川由美子監督のドキュメンタリー映画「さようならUR」が詳しく伝えています。</p>
                <p><strong>「住み続けたい」と裁判をたたかっています！</strong></p>
                <p>UR都市機構は2011年1月、残っている7戸の住民に対し、住宅の明け渡しを求め裁判に訴えてきました。「73号棟は耐震強度が不足しており、多額の費用がかかる耐震補強をしても住宅環境が悪くなり、商品価値がなくなる。よって建物を除却することにした。この処置は賃貸契約の更新拒絶の正当事由となるので、ただちに建物を明け渡せ。契約終了後は不当占拠にあたるから、1.5倍の損害金を支払え」というのです。</p>
                <p>URは、私たちに「丁寧な説明」をし、「真摯に対応」してきたといいます。しかし私たちは73号棟の耐震補強方法は、URが説明する方法しかないのか、疑問に感じました。73号棟の耐震補強を検討するための基礎資料である、73号棟の構造設計図を公開するよう、情報開示請求をしました。しかし、開示された構造図は全66ページすべて黒塗りでした。</p>
                <p><strong>耐震性不足の建物は全国に存在。裁判の行方が注目されます！</strong></p>
                <p>一昨年の東日本大震災以来、建物の耐震補強の必要性が高まっています。しかし耐震補強が不足している賃貸住宅は国内にたくさん存在しています。この裁判では、UR賃貸住宅の耐震強度不足が、賃貸契約の更新拒絶の「正当事由」となるのかが問われています。耐震強度不足が、更新拒絶の正当事由となるかが主な争点となった裁判は、今回が初めてといいます。ですから今、私たちの裁判は法律家を始め、住宅問題に心を寄せる人たちからも注目されています。</p>
                <p>このホームページでは、73号棟問題の経緯と裁判の経過を、これからも伝えていきます。高幡台団地73号棟のベランダには、住み続けたいという願いをこめて、私たちの黄色い旗が今日もはためいています。ご意見、ご感想をお寄せくださいますよう、お願いいたします。</p>
                <p class="al_r">2013年1月<br>
                高幡台団地73号棟に住み続けたい住民の会<br>
                住民一同</p>
            </div>
        </section>

        <section class="contents about_ur" ref="about_ur">
            <h2 class="_title">URって何？</h2>
            <div class="_wrapper">
                <div class="_contents">
                    <p>高度経済成長真っ只中の<strong>1955年</strong>、
                    主に<strong>大都市圏の深刻な住宅不足を解消</strong>するため、
                    国の住宅政策の一環として設立された、日本住宅公団が始まり。</p>
                    <p><strong>1960年～70年代</strong>にかけ、<strong>全国各地で大量の団地を建設</strong>すると共に、
                    <strong>ニュータウンの計画や建設</strong>、そして<strong>都市再開発事業</strong>にも進出した。</p>
                    <p>日本住宅公団は、時代や政治の流れと共にその役割を変貌させつつ、
                    名称も1981年には住宅・都市整備公団、
                    1999年には都市基盤整備公団、
                    そして<strong>2004年に都市再生機構（UR）</strong>となり現在に至る。</p>
                    <p>URは、全国で約76万の住戸を抱える、”日本最大の大家”。
                    しかし、行政改革の煽りを受け、
                    現在は<strong class="tkhtd_green">民営化も視野に入れた組織の見直し</strong>が検討されている。
                    14兆円という巨額の負債と、住宅不足は解消しURの目的は終えたというのが、
                    見直しの主な理由だ。</p>
                    <p>URの団地に関しては、削減の方針が打ち出され、
                    10年間（2018年まで）で<strong class="tkhtd_green">既存住宅8万戸を削減する「UR賃貸住宅再生・再編計画」</strong>が進行中。</p>
                    <p><strong class="tkhtd_ur">高幡台団地73号棟の取り壊し</strong>は、URの民営化、団地の削減が打ち出されたのと、<strong>時を同じくして発表</strong>された。
                    それ以前は、耐震補強をして使い続けると73号棟住民には周知していたのだが、一転して取り壊しに転じた。</p>
                    <p>73号棟の取り壊しについて、URは耐震性不足のためと主張するが、
                    <strong class="tkhtd_ur">その背景にはURの民営化、そして団地の削減方針があるのでは？と指摘する専門家も多い。</strong></p>
                </div>
                <div class="_timeline">

                    <div class="__contents">
                        <div class="__year">1955</div>
                        <div class="__logo">
                            <img src="<?php echo bloginfo("template_url"); ?>/assets/img/takahatadai73/ur_logo_1.png" class="logo_1">
                            <span>日本住宅公団</span>
                        </div>
                        <p>大都市圏の深刻な住宅不足解消のために設立</p>
                    </div>

                    <div class="__contents">
                        <div class="__year">1981</div>
                        <div class="__logo">
                            <img src="<?php echo bloginfo("template_url"); ?>/assets/img/takahatadai73/ur_logo_2.png" class="logo_2">
                            <span>住宅・都市整備公団</span>
                        </div>
                        <p>全国各地に団地建設<br>ニュータウンの計画や建設<br>都市再開発事業</p>
                    </div>

                    <div class="__contents">
                        <div class="__year">1999</div>
                        <div class="__logo">
                            <img src="<?php echo bloginfo("template_url"); ?>/assets/img/takahatadai73/ur_logo_3.png" class="logo_3">
                            <span>都市基盤整備公団</span>
                        </div>
                        <p><strong>高幡台団地73号棟<br>耐震改修を検討</strong></p>
                    </div>

                    <div class="__contents">
                        <div class="__year">2004</div>
                        <div class="__logo">
                            <img src="<?php echo bloginfo("template_url"); ?>/assets/img/takahatadai73/ur_logo_4.png" class="logo_4">
                            <span>都市再生機構</span>
                        </div>
                        <p>民営化へ…？<br>
                        UR賃貸住宅再生・再編計画<br>既存住宅8万戸を削減</p>
                        <p><strong>高幡台団地73号棟<br>取り壊し決定</strong></p>
                    </div>

                </div>
                <div class="clear"></div>
            </div>
        </section>

        <section class="contents timeline" ref="timeline">
            <h2 class="contents_title"><span class="_text">UR vs 住民の会､その記録</span></h2>
            <div class="al_c">
                <p><small>※2020年10月現在</small></p>
            </div>
            <div class="_wrapper">
                
                <div class="_label_title">UR</div>
                <div class="_label_title">住民の会</div>
                <div
                :class="[
                    'btn _display_all_timeline'
                    , (timelineDisplay) ? '_displayed' : ''
                ]"
                @click="ctrlDisplayTimeline">詳細を<br>全部<br>{{(timelineDisplay) ? '閉じる' : '開く'}}</div>
                
                
                <div
                v-for="(val, id) in timelineCategories"
                :key="`timelineCategory_${id}`"
                :class="`_contents_category _${id}`">
                    <h3 class="_label_category al_c">{{timelineCategories[id]}}</h3>
                    <div
                    v-for="(data, key) in getTimelineByCategories(id)"
                    :key="`timeline_${key}`"
                        class="_contents_year">
                        <div class="_label_year">{{key}}</div>
                        <div
                        v-for="(data2, key2) in data"
                        :key="`timeline_${key}_${key2}`"
                        class="_contents_month">
                            <div
                            :class="[
                                  '_label_month'
                                  , whichData(key, key2)
                                  , checkDisplayedUrData(key, key2)
                                  , checkDisplayedRsdtData(key, key2)
                                  , checkDisplayedAll(key, key2)
                            ]"
                            @click="ctrlDisplayTimelineData(key, key2)">
                                <span class="_text">{{key2}}</span>
                            </div>
                            <div
                            v-if="data2.ur"
                            class="_data_ur">
                                <div
                                v-for="(data3, key3) in data2.ur"
                                :key="`timeline_${key}_${key2}_${key3}_ur`"
                                    v-if="data3.display_flag"
                                    class="__data">
                                        <p v-if="data3.day">{{getTimelineDay(data3.month, data3.day)}}</p>
                                        <p>{{data3.ur}}</p>
                                        <div
                                        v-for="index in 2"
                                        :key="`urMaterial_${index}`"
                                            v-if="data3[`material_${index}`]" class="__material">
                                                <span class="text_shadow_white">{{data3[`material_${index}`]}}</span>
        
                                                <!-- pdf -->
                                                <!-- <span
                                                v-if="data3[`material_${index}`].match(/pdf/)"
                                                    @click="showMaterial(data3[`material_${index}`])" class="icon icon-search"></span> -->
                                                <a
                                                v-if="data3[`material_${index}`].match(/pdf/)"
                                                    :href="`<? echo get_template_directory_uri(); ?>/assets/pdf/${data3[`material_${index}`]}`"
                                                    :download="data3[`material_${index}`]" class="icon icon-file-download"></a>
                                        </div>
                                </div>
                            </div>
                            <div
                            v-if="data2.residents"
                            class="_data_residents">
                                <div
                                v-for="(data3, key3) in data2.residents"
                                :key="`timeline_${key}_${key2}_${key3}_residents`"
                                    v-if="data3.display_flag"
                                    class="__data">
                                        <p v-if="data3.day">{{getTimelineDay(data3.month, data3.day)}}</p>
                                        <p>{{data3.residents}}</p>
                                        <div
                                        v-for="index in 2"
                                        :key="`rsdtMaterial_${index}`"
                                            v-if="data3[`material_${index}`]" class="__material">
                                                <span class="text_shadow_white">{{data3[`material_${index}`].replace(/https:\/\/www\.youtube\.com\/.*/, '')}}</span>
        
                                                <!-- pdf -->
                                                <!-- <span
                                                v-if="data3[`material_${index}`].match(/pdf/)"
                                                    @click="showMaterial(data3[`material_${index}`])" class="icon icon-search"></span> -->
                                                <a
                                                v-if="data3[`material_${index}`].match(/pdf/)"
                                                    :href="`<? echo get_template_directory_uri(); ?>/assets/pdf/${data3[`material_${index}`]}`"
                                                    :download="data3[`material_${index}`]" class="icon icon-file-download"></a>
        
                                                <!-- xls -->
                                                <a
                                                v-if="data3[`material_${index}`].match(/xls/)"
                                                    :href="`<? echo get_template_directory_uri(); ?>/assets/pdf/${data3[`material_${index}`]}`"
                                                    :download="data3[`material_${index}`]" class="icon icon-file-download"></a>
        
                                                <!-- youtube -->
                                                <span
                                                v-if="data3[`material_${index}`].match(/youtube/)"
                                                    @click="showMaterial(data3[`material_${index}`])" class="icon icon-play-circle-fill"></span>
        
                                        </div>
                                </div>
                            </div>
                            <div class="last"></div>
                        </div>
                    </div>
                </div>
                
            </div>
        </section>

    </div>
    
    <section class="contents goodbye" ref="goodbye">
    
        <h2 class="contents_title"><span class="_text">ドキュメント･73号棟解体</span></h2>
        
        <div class="col col_9 last">
            <p>裁判が和解で終了した後、住民たちは転居を余儀なくされ、やがて建物の解体作業が始まりました。元73号棟住民のM.Kさんが、取り壊し直前～解体までの様子を克明に記録し提供してくださいましたので、ここにご紹介します。</p>
            <p>カレンダーの月を選択して、写真を見てください。</p>
            <p><small>撮影・提供：元73号棟住民 M.Kさん</small></p>
        </div>
        
        <div class="m2_t">
            <div class="col col_3">
                
                <div
                v-if="screenSize == 2"
                    class="_calendar_tab">
                    <div
                    v-for="(val, key) in goodbyeGalleryIndexs"
                    :key="`gallery_tab_${key}`"
                    @click="ctrlSelectGoodbyeGalleryTab(key)"
                    :class="[
                          '__year cursor_pointer'
                        , (selectedGoodbyeGalleryTab == key) ? '_selected' : ''
                    ]">
                        {{key}}
                    </div>
                </div>
                
                <div
                v-for="(val, key) in goodbyeGalleryIndexs"
                :key="`gallery_${key}`"
                    v-if="selectedGoodbyeGalleryTab == key || computedGoodbyeGalleryTab == 0">
                    <div v-if="screenSize == 1">
                        <div class="text_shadow_white">{{key}}</div>
                    </div>
                    <div class="_calendar">
                        <div
                        v-for="index in 12"
                        :key="`gallery_${key}_${index}`"
                        @click="displayGoodbyeGalleryByMonth(key, index)"
                        :class="[
                            '_item'
                            , checkHasGoodbyeGallery(key, index)
                            , checkGoodbyeGalleryDisplayed(key, index)
                        ]"><span class="text_shadow_white">{{index}}</span><br>
                            <span
                            v-if="checkHasGoodbyeGallery(key, index)"
                                class="icon icon-photo-camera"></span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col col_6 last _gallery">
            
                <div class="__day_indexs">
                    <div
                    v-for="val in goodbyeGallery"
                    :key="`gallery${val.date}`"
                    @click="displayGoodbyeGalleryByDay(getGoodbyeGalleryDate(val.date))"
                    :class="[
                          '___index'
                        , `_${getGoodbyeGalleryDate(val.date)}`
                        , (currentGoodbyeGalleryDay == getGoodbyeGalleryDate(val.date)) ? '_selected' : '']">
                        <span class="___text">{{getGoodbyeGalleryDate(val.date)}}</span>
                    </div>
                </div>
                
                <div
                v-for="val in goodbyeGalleryByDay"
                :key="`gallery${val.date}`"
                class="__contents m1_t">
                    <div
                    v-for="index in val.count"
                    :key="`gallery${val.date}_${index}`"
                    :class="[
                        '___img'
                        , (displayedGoodbyeGalleryNumber == index) ? '_displayed' : ''
                    ]">
                        <img v-lazy="getGoodbyeGalleryImgPath(val.date, index)">
                    </div>
                    
                    <div
                    v-if="val.count > 1"
                    class="__navi">
                        <div
                        :class="[
                              '___btn_navi _prev'
                            , (displayedGoodbyeGalleryNumber == 1) ? '_disabled' : 'cursor_pointer'
                        ]"
                        @click="ctrlGoodbyeGalleryPrev()">
                            <span class="icon icon-keyboard-arrow-left"></span></div>
                        <div
                        :class="[
                            '___btn_navi _next'
                            , (displayedGoodbyeGalleryNumber == val.count) ? '_disabled' : 'cursor_pointer'
                        ]"
                        @click="ctrlGoodbyeGalleryNext()">
                            <span class="icon icon-keyboard-arrow-right"></span></div>
                    </div>
                    
                    <div class="__thumbs m1_t">
                        <div
                        v-if="val.count > 1"
                            v-for="index in val.count"
                            :key="`gallery${val.date}_navi_${index}`"
                            @click="displayedGoodbyeGalleryNumber = index"
                            :class="[
                                '___thumb'
                                , (displayedGoodbyeGalleryNumber == index) ? '_selected' : ''
                            ]"
                        ><img v-lazy="getGoodbyeGalleryImgPath(val.date, index)"></div>
                        <div class="clear"></div>
                    </div>
                    
                </div>
                
            </div>
            
        </div>
        
    </section>
    
    <section class="contents movements" ref="movements">
        <h2 class="contents_title">
            <span class="_text">高幡台団地の今</span>
            <span class="_sub_text">高幡台団地地区・地区まちづくり計画について</span>
        </h2>
        
        <div class="col col_9 last">
            <p>73号棟問題が表面化した2011年から、高幡台団地自治会、管理組合（分譲）、UR、日野市の4者による、73号棟跡地問題を中心とした高幡台団地地区の再活用について検討が重ねられてきました。</p>
            <p>最初4者勉強会として発足した協議体は、その後準備会を経て2016年、地区まちづくり協議会と改組、2017年12月に日野市まちづくり条例に基づき、「高幡台団地地区 地区まちづくり計画」が作成されました。73号棟問題は、その跡地利用を含め、地域住民（自治会、管理組合）を中心としたURと自治体を巻き込んだ協議体の結成につながり、地域活性化の取り組みの中に生かされようとしています。</p>
            <div class="__material">
                <span class="text_shadow_white">まちづくり計画案.pdf</span>
                <!-- <span @click="showMaterial('town_planning.pdf')" class="icon icon-search"></span> -->
                <a :href="`<? echo get_template_directory_uri(); ?>/assets/pdf/town_planning.pdf`"
                download="まちづくり計画案.pdf" class="icon icon-file-download"></a>
            </div>
        </div>
        
        <div class="col col_9 last m4_t m2_b">
            <h3>高幡台団地地区まちづくり協議会ニュース</h3>
        </div>
        <div class="_contents"
        v-for="(val, key) in movements"
        :key="`movements${val.date}`">
            
            <div
            :class="[
                  'col col_9 last __label text_shadow_white cursor_pointer'
                , (selectedMovementsTab == (key + 1)) ? '_opened' : ''
            ]"
            @click="selectedMovementsTab = (key + 1)">
                <span>{{(key + 1)}}号</span> {{getMovementsDate(val.date)}}
            </div>
            
            <div class="__imgs">
                <div
                v-for="index in val.count"
                :key="`movements${val.date}_${index}`"
                :class="[
                      'col col_2 cursor_pointer ___img m1_t'
                    , (selectedMovementsTab == (key + 1)) ? '_opened' : ''
                ]">
                    <img
                    v-lazy="getMovementsImgPath(val.date, index)"
                    @click="showMovementsImage(val.date, index)">
                </div>
                <div class="clear"></div>
            </div>
            
        </div>
        
    </section>

    <section class="contents about_residents">
        <h2 class="contents_title"><span class="_text">素敵な住民のご紹介</span></h2>
        <div v-masonry item-selector="._resident">
            <div 
            v-for="(arr, key) in residents"
                v-masonry-tile
                class="col col_3 _resident">
                <div class="__img">
                    <img v-lazy="`<?php echo bloginfo("template_url"); ?>/assets/img/takahatadai73/resident_${arr.key}.png`" :title="arr.name">
                </div>
                <div class="__contents">
                    <h3 class="inline_block m1_r">{{arr.name}}</h3>
                    <a v-if="arr.statement"
                        :href="`<? echo get_template_directory_uri(); ?>/assets/pdf/statement_${arr.key}.pdf`"
                        :download="`${arr.name}_陳述書`"
                        class="btn_action">陳述書<span class="icon-file-download"></span></a>
                    
                    <dl v-if="arr.hobby">
                        <dt v-if="arr.hobby">趣味</dt><dd v-if="arr.hobby">{{arr.hobby}}</dd>
                        <dt v-if="arr.favouriteIndex">好きな{{arr.favouriteIndex}}</dt><dd v-if="arr.favouriteContents">{{arr.favouriteContents}}</dd>
                        <dt v-if="arr.karaoke">カラオケ18番</dt><dd v-if="arr.karaoke">{{arr.karaoke}}</dd>
                        <dt v-if="arr.message">ひとこと</dt><dd v-html="arr.message"></dd>
                    </dl>
                    <p class="___notice" v-if="arr.notice" v-html="arr.notice"></p>
                </div>
            </div>
        </div>
    </section>

    <section class="contents">
        <h2 class="contents_title"><span class="_text">私たちについて<br>もっと詳しく知りたい方は…</span></h2>
        <div class="col col_3">
            <?php
            $movie_goodbye_ur = 16;
            $poster_img = get_post_meta($movie_goodbye_ur, 'films_info_00', TRUE);
            echo get_post_meta_img($poster_img, 'large'); ?>
        </div>
        <div class="col col_6 last">
            <p>この高幡台団地73号棟問題、そして私たちの活動は、ドキュメンタリー映画『さようならUR』（監督：早川由美子）に詳しく描かれています。</p>
            <p>映画は、これまでに全国各地で上映され、山形国際ドキュメンタリー映画祭2011では、スカパー！IDEHA賞を受賞しました。中国、韓国でも上映され、国境を越えた共感が寄せられました。映画本編に、3時間の特典映像を加えたDVDが発売中です。ぜひご覧ください！</p>
            <div class="inline_block btn priority1 m2_t">
                <a href="<? echo get_post_permalink($movie_goodbye_ur); ?>">詳しくはこちら</a>
            </div> 
        </div>
        <div class="col col_9 last m2_t">
            <div class="video">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/c7A2uPQ2Pm8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        </div>
    </section>

</div><!--.single-->

<?php get_footer('scripts'); ?>

<modal-pdf
    v-if="displayModalPdf == true"
    :url="modalPdfUrl"
    @modal-close="displayModalPdf = false"
></modal-pdf>

<modal-youtube
    v-if="displayModalYoutube == true"
    :url="modalYoutubeUrl"
    @modal-close="displayModalYoutube = false"
></modal-youtube>

<modal-image
    v-if="displayModalImage == true"
    :url="modalImageUrl"
    @modal-close="displayModalImage = false"
></modal-image>

</div><!--#app-->

<!-- pdfモダルtemplate -->
<script type="text/x-template" id="template-modal-pdf">
    <div class="modal-mask">
        <div class="modal-container _contents_modal">
            <div class="icon icon-close" @click="close()"></div>
            <div
            v-if="totalPageNum > 1"
                class="pdf_page_controller al_c">
                <div
                :class="[
                    'btn_icon icon-arrow-back'
                    , (currentPageNum <= 1) ? '_disabled' : ''
                ]"
                @click="displayPrevPage"></div>
                <input type="number" class="input_page_num" v-model="inputPageNum" @change="loadPage()">
                / <span v-if="totalPageNum" v-html="totalPageNum"></span>
                <div
                :class="[
                    'btn_icon icon-arrow-forward'
                    , (currentPageNum >= totalPageNum) ? '_disabled' : ''
                ]"
                @click="displayNextPage"></div>
            </div>
            <div class="m2_t __contents">
                <div v-if="pageLoaded == false" class="p2_t">
                    読み込み中
                    <img src="<?php echo bloginfo("template_url"); ?>/assets/img/loading.gif" class="loading_img">
                </div>
                <canvas v-show="pageLoaded == true" id="pdf_canvas"></canvas>
            </div>
        </div>
    </div>
</script>

<!-- youtubeモダルtemplate -->
<script type="text/x-template" id="template-modal-youtube">
    <div class="modal-mask">
        <div class="modal-container _contents_modal">
            <div class="icon icon-close" @click="close()"></div>
            <div class="__contents">
                <div class="video">
                    <iframe
                        :src="url" 
                        frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            </div>
        </div>
    </div>
</script>

<script type="text/x-template" id="template-modal-image">
    <div class="modal-mask">
        <div class="modal-container _contents_modal _image">
            <div class="icon icon-close" @click="close()"></div>
            <div class="__contents">
                <img v-lazy="url" class="">
            </div>
        </div>
    </div>
</script>
            
<script type="text/javascript">

Vue.config.devtools = true;

// pdfjs
// requirejs.config({
//     paths:{
//         'pdfjs-dist/build/pdf' : '<? echo get_template_directory_uri(); ?>/assets/js/pdfjs/build/pdf'
//     }
// })

// masonry レイアウト
var VueMasonryPlugin = window['vue-masonry-plugin'].VueMasonryPlugin;
Vue.use(VueMasonryPlugin);

// lazyload
Vue.use(VueLazyload, {
    loading: `<?php echo bloginfo("template_url"); ?>/assets/img/loading.gif`
});

// youtubeモダル
Vue.component('modal-youtube', {
    template: '#template-modal-youtube'
    , props: ['url']
    , methods: {
        close(){
            this.$emit('modal-close')
        }
    }
})

// 画像モダル
Vue.component('modal-image', {
    template: '#template-modal-image'
    , props: ['url']
    , methods: {
        close(){
            this.$emit('modal-close')
        }
    }
})

// pdfモダル
Vue.component('modal-pdf', {

    template: '#template-modal-pdf'
    , props: ['url']
    , data: function(){
        return {
            pdf: null
            , pageLoading: false
            , pageLoaded : false
            , currentPageNum: 0
            , totalPageNum: 0
        }
    }
    , computed: {
        inputPageNum:{
            set: function(num){
                if(num >= 1 && num <= this.totalPageNum){
                    this.currentPageNum = num;
                }
                else
                {
                    this.currentPageNum = 1;
                }
            }
            , get: function(){ return this.currentPageNum; }
        }
    }
    , methods: {

        close(){
            this.$emit('modal-close')
        }

        , loadPage()
        {
            
            if(this.pageLoading)
            {
                return;
            }

            var self = this;

            this.pageLoading = true;
            this.pageLoaded = false;

            var pageNum = parseInt(this.currentPageNum);

            if(pageNum > 0 && pageNum <= this.totalPageNum)
            {

                this.pdf.getPage(pageNum).then(function(page) {
                    
                    
                    var scale = 1.5;
                    var viewport = page.getViewport({scale: scale});

                    // Prepare canvas using PDF page dimensions
                    var canvas = document.getElementById('pdf_canvas');
                    var context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    // Render PDF page into canvas context
                    var renderContext = {
                        canvasContext: context,
                        viewport: viewport
                    };
                    var renderTask = page.render(renderContext);
                    renderTask.promise.then(function () {
                        self.pageLoaded = true;
                        self.pageLoading = false;
                    });

                });

            }

            else
            {
                
            }

        }

        , displayNextPage()
        {
            if(this.currentPageNum == this.totalPageNum){
                return false;
            }
            this.currentPageNum++;
            this.loadPage();
        }
        , displayPrevPage()
        {
            if(this.currentPageNum == 1){
                return false;
            }
            this.currentPageNum--;
            this.loadPage();
        }

    }
    , created(){

        // requirejs(['pdfjs-dist/build/pdf'], (pdfjsLib) => {

        //     pdfjsLib.GlobalWorkerOptions.workerSrc = '<? echo get_template_directory_uri(); ?>/assets/js/pdfjs/build/pdf.worker.js';
            
        //     var loadingTask = pdfjsLib.getDocument({
        //         url: this.url
        //         , cMapUrl: '<? echo get_template_directory_uri(); ?>/assets/js/pdfjs/web/cmaps/'
        //         , cMapPacked: true
        //     });

        //     loadingTask.promise.then((pdf) => {
        //         this.pdf = pdf;
        //         this.currentPageNum = 1; 
        //         this.inputedPageNum = 1; 
        //         this.totalPageNum = this.pdf._pdfInfo.numPages;
        //         this.loadPage();
        //         console.log('pdf', this.pdf)
        //     });

        // });

    }

})

var app = new Vue({
      el: '#app'
    , data: {
          key_messages:    <? echo $key_messages; ?>
        , residents:       <? echo $residents; ?>
        , goodbyeGalleryData: <? echo $goodbye_gallery; ?>
        , movements: <? echo $movement_now; ?>
        
        , displayTkhtd73: false
        , displayRsdtMsg: [false, false, false]
        
        , displayBubbles: {}
        
        , screenSize: 0
        
        , timelineData: <? echo $timeline; ?>
        , timelineCategories: {
              1: '高幡台団地73号棟取り壊しが決まるまで'
            , 2: '73号棟取り壊し公表後の動き'
            , 3: '裁判が始まってから'
        }
        , timelineDisplay: false
        
        , goodbyeGallery: []
        , goodbyeGalleryByDay: null
        , currentGoodbyeGalleryYear: 0
        , currentGoodbyeGalleryMonth: 0
        , currentGoodbyeGalleryDay: 0
        , displayedGoodbyeGalleryNumber: 1
        , selectedGoodbyeGalleryTab: 0
        
        , selectedMovementsTab: 1
        
        , displayModalImage: false
        , modalImageUrl: ''
        
        , displayModalPdf: false
        , modalPdfUrl: ''
        
        , displayModalYoutube: false
        , modalYoutubeUrl: ''
    }
    , computed: {
    
        timelineCategories(){
            var categories = this.timelineData.map(a => a.category );
            return categories.filter((v, k, self) => { return self.indexOf(v) === k });
        }
        , timeline(){ return this.sortTimeline(this.timelineData); }
        
        , goodbyeGalleryIndexs()
        {
            var years = this.goodbyeGalleryData.map(a => new Date(a.date).getFullYear());
            
            var arr = {};
            this.goodbyeGalleryData.forEach(a => {
                var year = new Date(a.date).getFullYear();
                var month = new Date(a.date).getMonth() + 1;
                if(arr[year] == undefined)
                {
                    arr[year] = [];
                }
                arr[year].push(month);
                arr[year] = arr[year].filter((v, k, self) => { return self.indexOf(v) === k });
            })
            
            return arr;
        }
        
        , computedGoodbyeGalleryTab()
        {
            return (this.screenSize == 1) ? 0 : this.selectedGoodbyeGalleryTab
        }

    }
    , methods: {
        
        // showStatement(key)
        // {
        //     this.displayModalPdf = true;
        //     this.modalPdfUrl = `<? echo get_template_directory_uri(); ?>/assets/pdf/statement_${key}.pdf`;
        // }

        showMaterial(fileName)
        {

            var youtubePattern = /https:\/\/www\.youtube\.com\/.*/;

            if(fileName.match(/pdf/))
            {
                this.displayModalPdf = true;
                this.modalPdfUrl = `<? echo get_template_directory_uri(); ?>/assets/pdf/${fileName}`;
            }
            else if(fileName.match(youtubePattern))
            {
                var pos = fileName.search(youtubePattern);
                this.displayModalYoutube = true;
                this.modalYoutubeUrl = fileName.substr(pos);
            }
        }
        
        , showImage(date, index)
        {
            this.displayModalImage = true;
            var date = date.replace(/-/g, '');
            this.modalImageUrl = `<?php echo bloginfo("template_url"); ?>/assets/img/takahatadai73/goodbye_${date}_${index}.jpg`;
        }
         
        , showMovementsImage(date, index)
        {
            this.displayModalImage = true;
            var date = date.replace(/-/g, '');
            this.modalImageUrl = `<?php echo bloginfo("template_url"); ?>/assets/img/takahatadai73/movements_${date}_${index}.jpg`;
        }
        
        , getGoodbyeGalleryImgPath(date, index)
        {
            var date = date.replace(/-/g, '');
            return `<?php echo bloginfo("template_url"); ?>/assets/img/takahatadai73/goodbye_${date}_${index}.jpg`;
        }
        
        , getGoodbyeGalleryDate(date, index)
        {
            // var year = new Date(date).get;
            var month = new Date(date).getMonth() + 1;
            var day = new Date(date).getDate();
            return (index == 'month') ?  `${month}` : day;
        }
        
        , displayGoodbyeGalleryByMonth(year, month)
        {
            
            if(this.goodbyeGalleryIndexs[year].some(a => a == month)){
                
                this.currentGoodbyeGalleryYear = year;
                this.currentGoodbyeGalleryMonth = month;
                
                this.goodbyeGallery = this.goodbyeGalleryData.filter(a =>
                    new Date(a.date).getFullYear() == year && (new Date(a.date).getMonth() + 1) == month);
                    
                this.displayGoodbyeGalleryByDay();
            }
        }
        
        , displayGoodbyeGalleryByDay(day)
        {
        
            this.displayedGoodbyeGalleryNumber = 1;
            
            var monthData = this.goodbyeGallery[0];
            var _day = day || new Date(monthData.date).getDate();
            
            this.currentGoodbyeGalleryDay = _day;
            
            this.goodbyeGalleryByDay = this.goodbyeGallery.filter(a => new Date(a.date).getDate() == _day);
            
        }
        
        , ctrlSelectGoodbyeGalleryTab(year)
        {
            this.selectedGoodbyeGalleryTab = year;
            
            var data = this.goodbyeGalleryData.filter(a => new Date(a.date).getFullYear() == year);
            var month = new Date(data[0].date).getMonth() + 1;
            this.displayGoodbyeGalleryByMonth(year, month);
            
        }
        
        , ctrlGoodbyeGalleryNext()
        {
            var max = this.goodbyeGalleryByDay[0].count;
            // console.log('d', max, this.displayedGoodbyeGalleryNumber)
            if(this.displayedGoodbyeGalleryNumber < max)
            {
                this.displayedGoodbyeGalleryNumber = this.displayedGoodbyeGalleryNumber + 1;
                // console.log('d', max, this.displayedGoodbyeGalleryNumber)
            }
            
        }
        , ctrlGoodbyeGalleryPrev()
        {
            if(this.displayedGoodbyeGalleryNumber > 1)
            {
                this.displayedGoodbyeGalleryNumber = this.displayedGoodbyeGalleryNumber - 1;
            }
            
        }
        
        , checkHasGoodbyeGallery(year, month)
        {
            return (this.goodbyeGalleryIndexs[year].some(a => a == month)) ? '_active' : false;
        }
        
        , checkGoodbyeGalleryDisplayed(year, month)
        {
            if(this.checkHasGoodbyeGallery(year, month)){
                return (year == this.currentGoodbyeGalleryYear && month == this.currentGoodbyeGalleryMonth) ? '_selected' : false;
            }
        }
        
        , getMovementsDate(date)
        {
            var _date = date.replace('-', '年');
            return _date + '月';
        }
        
        , getMovementsImgPath(date, index)
        {
            var date = date.replace(/-/g, '');
            return `<?php echo bloginfo("template_url"); ?>/assets/img/takahatadai73/movements_${date}_${index}.jpg`;
        }
        
        , getTimelineByCategories(category)
        {
            var data = this.timelineData.filter(a => a.category == category);
            return this.sortTimeline(data);   
        }
        
        
        , sortTimeline(data)
        {

            var years = data.map(a => a.year );
            years = years.filter((v, k, self) => { return self.indexOf(v) === k });

            var arr = {};
            var residents = {};

            years.forEach(v => {
                
                var dataByYear = data.filter(a => a.year == v);
                var months = dataByYear.map(a => a.month);
                months = months.filter((v, k, self) => { return self.indexOf(v) === k }).sort((a, b) => a - b);

                arr[v] = {};
                months.forEach(v2 => {
                    arr[v][v2] = {};
                    var dataByMonth = dataByYear.filter(a => a.month == v2);
                    var dataUR = dataByMonth.filter(a => a.ur !== '');
                    var dataRsdt = dataByMonth.filter(a => a.residents !== '');
                    if(dataUR.length > 0){
                        arr[v][v2]['ur'] = dataUR;
                    }
                    if(dataRsdt.length > 0){
                        arr[v][v2]['residents'] = dataRsdt;
                    }
                });

            })

            // console.log('arr2', arr);

            return arr;
        }

        , ctrlDisplayTimeline()
        {

            var self = this;
            this.timelineDisplay = (this.timelineDisplay == false) ? true : false;
            Object.keys(this.timeline).forEach(k1 => {
                Object.keys(self.timeline[k1]).forEach(k2 => {
                    Object.keys(self.timeline[k1][k2]).forEach(k3 => {
                        Object.keys(self.timeline[k1][k2][k3]).forEach(k4 => {
                            var data = self.timeline[k1][k2][k3][k4];
                            if(self.timelineDisplay)
                            {
                                data.display_flag = self.timelineDisplay;
                            }
                            else
                            {
                                data.display_flag = data.display_default;
                            }
                        })
                    })
                })
            })
        }

        , ctrlDisplayTimelineData(year, month)
        {

            var data = this.timeline[year][month];
            Object.keys(data).forEach(k => {
                data[k].forEach(a => {
                    a.display_flag = (a.display_flag == true) ? a.display_default : true;
                })
            })

        }

        , checkDisplayedUrData(year, month)
        {
            var data = this.timeline[year][month];
            var urCheck = false;
            if(data['ur']){
                urCheck = data['ur'].some(a => a.display_flag == false);
            }
            return (urCheck) ? false : '_displayed_all_ur';
        }

        , checkDisplayedRsdtData(year, month)
        {
            var data = this.timeline[year][month];
            var rsdtCheck = false;
            if(data['residents']){
                rsdtCheck = data['residents'].some(a => a.display_flag == false);
            }
            return (rsdtCheck) ? false : '_displayed_all_rsdt';
        }

        , checkDisplayedAll(year, month)
        {
            var data = this.timeline[year][month];
            var checkUr = this.checkDisplayedUrData(year, month);
            var checkRsdt = this.checkDisplayedRsdtData(year, month);
            return (checkUr && checkRsdt) ? ' _displayed_all' : false;
        }

        , whichData(year, month)
        {
            var data = this.timeline[year][month];
            var hasUrData = (data.ur) ? '_hasUrData' : '';
            var hasRsdtData = (data.residents) ? '_hasRsdtData' : '';
            return `${hasUrData}${(hasRsdtData) ? ' '+hasRsdtData : ''}`;
        }

        , getTimelineDay(month, day)
        {
            return typeof day === 'string' ? `${month}月${day}` : `${day}日`;
        }
        
        , handleResize(){
            if(window.innerWidth >= 960)
            {
                this.screenSize = 1; // PC
            }
            else if(window.innerWidth < 960)
            {
                this.screenSize = 2; // mobile
            }
        }
        
        , genBubble(min, max)
        {
        
            for(var i=0; i < (Math.floor(Math.random() * 10) + 1); i++)
            {
            
                var bubble = document.createElement('div'); 
                var colors = ['yellow', 'white', 'green'];
                bubble.classList.add('bubble');
                bubble.classList.add(`_${colors[Math.floor(Math.random() * 3)]}`);
                bubble.animate([{opacity: '0'}, {opacity: '1'}], 3000)
                
                var size = Math.floor(Math.random() * 200) + 10;
                var pos = Math.floor(Math.random() * (window.innerWidth - size)) + size;
                
                bubble.style.width = `${size}px`;
                bubble.style.height = `${size}px`;
                
                
                if(pos + size > window.innerWidth)
                {
                    bubble.style.right = `${pos + size - window.innerWidth}px`;
                }
                else
                {
                    bubble.style.left = `${pos}px`;
                }
                
                bubble.style.top = `${Math.floor(Math.random() * max) + min}px`;
                
                document.body.prepend(bubble);
                
                var speed = Math.floor(Math.random() * 200) + 1;
            
                StartInterval(bubble, size, speed)
            }
        
            function StartInterval(el, size, speed) {
            
                var diff = 0;
                var direction = -1;
            
                var timer = setInterval(function(a){
                    
                    diff += 1 * direction;
                    el.style.transform = `translateY(${diff}px)`;
                
                    if(el.getBoundingClientRect().top == (size * -1))
                    {
                        clearInterval(timer);
                    }
                    
                }, speed);
                
            }

        }
        
        , handleScroll()
        {
            
            var $el_main_visual  = this.$refs.main_visual.getBoundingClientRect();
            var $el_outward      = this.$refs.outward;
            var $el_outward_area = this.$refs.outward_area;
            var $el_outward_area_rect = $el_outward_area.getBoundingClientRect();
            
            if(this.screenSize == 1)
            {
            
                var outwardPos = ($el_outward_area_rect.top + window.scrollY + $el_outward_area_rect.height) - (window.scrollY + window.innerHeight);
    
                if(outwardPos < 0)
                {
                    $el_outward.style.bottom =  0;
                }
                else if(window.scrollY > ($el_main_visual.top + window.scrollY))
                {
                    this.displayTkhtd73 = true;
                    $el_outward.style.bottom =  `${outwardPos}px`;
                }
                
            }
            
            else
            {
                this.displayTkhtd73 = true;
            }
            
            //  urメッセージ表示アニメーション
            if(this.displayRsdtMsg.some(v => v == false)){
                for(var i=0; i<3; i++)
                {
                    var $el_ur_msg = this.$refs[`ur_msg_${i + 1}`][0].getBoundingClientRect();
                    if(window.scrollY > ($el_ur_msg.top + window.scrollY) - (window.innerHeight * 4 / 5))
                    {
                        this.$set(this.displayRsdtMsg, i, true);
                    }
                }
            }
            
        }

    }
    
    , mounted(){
        this.displayGoodbyeGalleryByMonth(2013, 11);
        this.selectedGoodbyeGalleryTab = 2013;
    }
    
    , created(){
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
        
        window.addEventListener('scroll', this.handleScroll);
    }
    
})

</script>

</body>
</html>