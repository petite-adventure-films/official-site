<?php
$contents = apply_filters('the_content', $post->post_content);
get_header(); ?>


<div class="single">


		<header class="header_page">
			<nav class="crumbs">
				<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
					<a href="<?php echo get_bloginfo("url"); ?>" itemprop="url">
						<span itemprop="title">HOME</span>
					</a>
				</div>
				<div itemscope itemtype="http://data-vocabulary.org/Breadcrumb" class="crumb">
					<a href="<?php echo get_permalink($post->ID); ?>" itemprop="url">
						<span itemprop="title"><?php echo $post->post_title; ?></span>
					</a>
				</div>
			</nav>
			<h1>
				<?php if(is_day()){
					printf( __('日別アーカイブ: %s'), get_the_date());
				}elseif(is_month()){
					printf( __('月別アーカイブ: %s'), get_the_date('Y年n月'));
				}elseif(is_year()){
					printf( __('年別アーカイブ: %s'), get_the_date('Y年'));
				}elseif(is_post_type_archive()){
					$post_type = get_post_type_object( get_query_var( 'post_type' ));
					echo $post_type->label;
				}elseif(is_category() || is_tag() || is_tax()){
					single_term_title("", true);
				}else{
					the_title();
				}?>
			</h1>
        <!--.header_page--></header>
        

        <div id="app">
        復刻版公開に寄せて<br>

        映画『さようならUR』の主人公でもある、「高幡台団地73号棟に住み続けたい住民の会」。2013年、立ち退き裁判をたたかっていた当時の「住民の会」ホームページが、復刻版となって登場しました！　今回新たに、裁判後の情報も追加しました。UR団地の削減方針は、現在も維持されたままです。高幡台団地73号棟のたたかいが、全国で建て替え・取り壊し問題に直面する方々の取組に生かされることを願います！
        <br>
        2020年10月　
        プチ・アドベンチャー・フィルムズ
        早川由美子

        <br><br>

        <div
        v-for="arr in catches"
        :key="'catch' + arr.key">
            <span>URは言います</span><br>
            {{arr.ur}}
            <span v-if="showCatch != arr.key" @click="showCatch = arr.key">open</span>
            <span v-if="showCatch == arr.key" @click="showCatch = 0">close</span>
            <div v-if="showCatch == arr.key">
                {{arr.residents}}
            </div>
        </div>

        <br><br>
        <div>
        <h2>住民からのご挨拶（2013年）</h2>

        私たちのホームページにおいでいただきありがとうございます。
        　
        2008年5月1日、読売新聞がスクープして社会問題となった、URの耐震不足住棟の取り壊し問題。この報道で名前が公表された団地は、関東地方では、私たち高幡台団地73号棟のほか、千葉・幸町団地と埼玉・武里団地でした。すでにこの2団地の該当住棟は取り壊されて、更地となってしまいましたが、私たちの73号棟はしっかりと建っています。

        あれから4年半。私たちは悩み、苦しみ、そして多くの皆様の協力を得ながらいろいろなことを学び、行動してきました。早川由美子監督のドキュメンタリー映画「さようならUR」が詳しく伝えています。

        （※イさん：以下の1行はハイライトで）
        「住み続けたい」と裁判をたたかっています！

        UR都市機構は2011年1月、残っている7戸の住民に対し、住宅の明け渡しを求め裁判に訴えてきました。「73号棟は耐震強度が不足しており、多額の費用がかかる耐震補強をしても住宅環境が悪くなり、商品価値がなくなる。よって建物を除却することにした。この処置は賃貸契約の更新拒絶の正当事由となるので、ただちに建物を明け渡せ。契約終了後は不当占拠にあたるから、1.5倍の損害金を支払え」というのです。

        URは、私たちに「丁寧な説明」をし、「真摯に対応」してきたといいます。しかし私たちは73号棟の耐震補強方法は、URが説明する方法しかないのか、疑問に感じました。73号棟の耐震補強を検討するための基礎資料である、73号棟の構造設計図を公開するよう、情報開示請求をしました。しかし、開示された構造図は全66ページすべて黒塗りでした。

        （※イさん：以下の1行はハイライトで）
        耐震性不足の建物は全国に存在。裁判の行方が注目されます！

        昨年の東日本大震災以来、建物の耐震補強の必要性が高まっています。しかし耐震補強が不足している賃貸住宅は国内にたくさん存在しています。この裁判では、UR賃貸住宅の耐震強度不足が、賃貸契約の更新拒絶の「正当事由」となるのかが問われています。耐震強度不足が、更新拒絶の正当事由となるかが主な争点となった裁判は、今回が初めてといいます。ですから今、私たちの裁判は法律家を始め、住宅問題に心を寄せる人たちからも注目されています。

        このホームページでは、73号棟問題の経緯と裁判の経過を、これからも伝えていきます。高幡台団地73号棟のベランダには、住み続けたいという願いをこめて、私たちの黄色い旗が今日もはためいています。ご意見、ご感想をお寄せくださいますよう、お願いいたします。

        2013年1月
        高幡台団地73号棟に住み続けたい住民の会
        住民一同
        </div>

        <br><br>
        <div>
        <h2>URって何？</h2>

高度経済成長真っ只中の1955年、主に大都市圏の深刻な住宅不足を解消するため、
国の住宅政策の一環として設立された、日本住宅公団が始まり。

1960年～70年代にかけ、全国各地で大量の団地を建設すると共に、
ニュータウンの計画や建設、そして都市再開発事業にも進出した。

日本住宅公団は、時代や政治の流れと共にその役割を変貌させつつ、
名称も1981年には住宅・都市整備公団、
1999年には都市基盤整備公団、
そして2004年に都市再生機構（UR）となり現在に至る。

URは、全国で約76万の住戸を抱える、”日本最大の大家”。
しかし、行政改革の煽りを受け、
現在は民営化も視野に入れた組織の見直しが検討されている。
14兆円という巨額の負債と、住宅不足は解消しURの目的は終えたというのが、
見直しの主な理由だ。

URの団地に関しては、削減の方針が打ち出され、
10年間（2018年まで）で既存住宅8万戸を削減する「UR賃貸住宅再生・再編計画」が進行中。

高幡台団地73号棟の取り壊しは、URの民営化、団地の削減が打ち出されたのと、時を同じくして発表された。
それ以前は、耐震補強をして使い続けると73号棟住民には周知していたのだが、一転して取り壊しに転じた。

73号棟の取り壊しについて、URは耐震性不足のためと主張するが、
その背景にはURの民営化、そして団地の削減方針があるのでは？と指摘する専門家も多い。
        </div>

        <br><br>
        <div class="timeline">
            <h2>UR vs 住民の会、その記録</h2>
            <div @click="ctrlDisplayTimeline">全部見せる</div>
            <div
            v-for="(data, key) in timeline"
            :key="`timeline_${key}`">
                <div class="label_year">{{key}}</div>
                <div
                v-for="(data2, key2) in data"
                :key="`timeline_${key}_${key2}`"
                class="timeline_month">
                    <div
                    class="label_month"
                    @click="ctrlDisplayTimelineData(key, key2)">{{key2}}</div>
                    <div
                    v-if="data2.ur"
                    class="data_ur">
                        <div
                        v-for="(data3, key3) in data2.ur"
                        :key="`timeline_${key}_${key2}_${key3}_ur`"
                            v-if="data3.display_flag">
                                <div v-if="data3.day">{{getTimelineDay(data3.month, data3.day)}}</div>
                                {{data3.ur}}<br>
                                参考資料：<div @click="showMaterialPdf(data3.material_1)">{{data3.material_1}}</div>
                        </div>
                    </div>
                    <div
                    v-if="data2.residents"
                    class="data_residents">
                        <div
                        v-for="(data3, key3) in data2.residents"
                        :key="`timeline_${key}_${key2}_${key3}_residents`"
                            v-if="data3.display_flag">
                                <div v-if="data3.day">{{getTimelineDay(data3.month, data3.day)}}</div>
                                {{data3.residents}}
                        </div>
                    </div>
                    <div class="last"></div>
                </div>
            </div>

        </div>
        <br><br>

        <div>
            <h2>素敵な住民のご紹介</h2>
            <div v-for="arr in residents">
                {{arr.name}} <span v-if="arr.statement" @click="showStatement(arr.key)">陳述書</span><br>
                {{arr.message}}<br>
                <span v-if="arr.hobby">趣味 : {{arr.hobby}}</span><br>
                <span v-if="arr.favouriteIndex">好きな{{arr.favouriteIndex}} : {{arr.favouriteContents}}</span><br>
                <span v-if="arr.karaoke">カラオケ18番 : {{arr.karaoke}}</span>
            </div><br><br>
        </div>

        <modal-pdf v-if="modalPdf == true" :pdf="pdfUrl"></modal-pdf>

        <div class="video">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/dDI5cxmVnIQ" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>


</div>

<style>
.modal-mask {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-container {
    position: absolute;
    width: 100%;
    height: 100%; 
    box-sizing: border-box;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    transition: all 0.3s ease;
    border: 1px solid #eeeeee;
}


.timeline{
    position: relative;
}
.label_year{
    position: absolute; 
    left: 50%;
}

.label_month{
    position: absolute; 
    left: 50%;
    width: 30px;
    height: 30px;
}
.timeline_month {
    position: relative;
    padding-top: 16px;
    clear: both;
    min-height: 30px;
}

.data_ur{
    float: left;
    width: 304px;
}
.data_residents{
    float: right;
    width: 304px;
}

</style>


<script type="text/x-template" id="template-modal-pdf">
    <div class="modal-mask">
        <div class="modal-container">
            <canvas id="the-canvas"></canvas>
        </div>
    </div>
</script>

<script type="text/javascript">

requirejs.config({
    paths:{
        'pdfjs-dist/build/pdf' : '<? echo get_template_directory_uri(); ?>/assets/js/pdfjs/build/pdf'
    }
})



Vue.config.devtools = true;

Vue.component('modal-pdf', {
    template: '#template-modal-pdf'
    , props: ['pdf']
    , data: {
        pdfjsLib: null
    }
    , created(){

        requirejs(['pdfjs-dist/build/pdf'], (pdfjsLib) => {
    
            pdfjsLib.GlobalWorkerOptions.workerSrc = '<? echo get_template_directory_uri(); ?>/assets/js/pdfjs/build/pdf.worker.js';
            
            
            var loadingTask = pdfjsLib.getDocument({
                  url: this.pdf
                , cMapUrl: '<? echo get_template_directory_uri(); ?>/assets/js/pdfjs/web/cmaps'
				, cMapPacked: true
            });

            loadingTask.promise.then((pdf) => {
                console.log('PDF loaded', pdf);

                    // Fetch the first page
                var pageNumber = 1;
                pdf.getPage(pageNumber).then(function(page) {
                    console.log('Page loaded');
                    
                    var scale = 1;
                    var viewport = page.getViewport({scale: scale});

                    // Prepare canvas using PDF page dimensions
                    var canvas = document.getElementById('the-canvas');
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
                    console.log('Page rendered');
                    });
                });


            });


        });

    }
    
})


var app = new Vue({
      el: '#app'
    , data: {
        
          showCatch : 0
        , catches: [
              { key: 1, ur : '人は、ふれあって育つ UR賃貸住宅', residents: 'つながりを壊さないで<br>大家(UR)さん！' }
            , { key: 2, ur : 'ふるさとになる住宅', residents: '終の棲家と<br>思っていたのに…' }
            , { key: 3, ur : 'やさしさにふれる住宅', residents: '大家(UR)さんから<br>立ち退き訴訟！？' }
        ]

        , residents: [
            {
                  key: 1
                , name: '中川京子'
                , message: '住宅に惚れてます。麻布十番の生まれです。'
                , hobby: '小唄、義太夫、謡曲'
                , favouriteIndex: '言葉'
                , favouriteContents: '人に触れ合う'
                , karaoke: '　「隅田川」（市丸）、「夜のプラットフォーム」（渡辺はま子）'
                , statement: true
            }
            , {
                  key: 2
                , name: '村田英法'
                , message: '定年になったら晴耕雨読を夢見ていたのに…。<br>でもこれも人生！　楽しまなきゃね！！'
                , hobby: '山歩き、旅行、外に出るのが大好き'
                , favouriteIndex: '本'
                , favouriteContents: '人に触れ合う'
                , karaoke: 'フォークから北島三郎まで'
                , statement: false
            }
            , {
                  key: 3
                , name: '栗原明・（桂城）清子夫妻'
                , message: '夫婦共に九州出身。上京して東京に家を買う夢がありました。それが叶わず賃貸に。<br>大きな問題に関わり、裁判をして、勉強にはなったが、でも悔しい。<br>国の人は国民の気持ちを考えてほしい。いつになったら”我が家”が持てるのでしょうか？'
                , hobby: '映画鑑賞'
                , favouriteIndex: '歌手'
                , favouriteContents: '吉幾三'
                , karaoke: '小指の想い出'
                , statement: true
            }
            , {
                key: 4
                , name: '村井和子'
                , message: '高幡台団地73号棟、なんとしても守りたい。'
                , hobby: '民謡、和裁'
                , favouriteIndex: '言葉'
                , favouriteContents: '挨拶、ありがとう'
                , karaoke: '奥飛騨慕情'
                , statement: true
            }
            , {
                  key: 5
                , name: '村田公子'
                , message: '戦争のない世界、格差のない社会、憲法を守って戦争で生命を脅かされることのないように。'
                , hobby: '山野草を眺めるのが大好き。植物や野菜を育てること。山歩き。'
                , favouriteIndex: '言葉'
                , favouriteContents: 'すこやかに生まれ、すこやかに育ち、すこやかに老いる＝岩手・旧沢内村村長・深沢晟雄の言葉。'
                , karaoke: '特になし、けれど歌うのは好き。'
                , statement: true
            }
            , {
                  key: 6
                , name: 'K.T'
                , message: '常に前を向いて進むように、心がけています。'
                , hobby: '草花'
                , favouriteIndex: '芸能人'
                , favouriteContents: '吉永小百合'
                , karaoke: '岬めぐり、他'
                , statement: true
            }
            , {
                  key: 7
                , name: '畦地笙子'
                , message: 'やっぱり、ずっと73号棟に住みたいなー！'
                , hobby: '読書（高村薫、桐野夏生など）'
                , favouriteIndex: '言葉'
                , favouriteContents: '晴耕雨読'
                , karaoke: '？（何でも出来るよ！←ウソ！）'
                , statement: false
            }
            , {
                  key: 8
                , name: 'M.K'
                , message: '挨拶代わりの「バカヤロー！」。実は照れ屋です。'
                , hobby: 'ウォーキング'
                , favouriteIndex: '言葉'
                , favouriteContents: '成せば成る'
                , karaoke: '北島三郎'
                , statement: true
            }
            , {
                  key: 9
                , name: '畦地豊彦さん'
                , message: '畦地豊彦さんは2012年1月27日に亡くなられました。享年68歳。心よりご冥福をお祈りします。'
                , hobby: ''
                , favouriteIndex: ''
                , favouriteContents: ''
                , karaoke: ''
                , statement: true
            }
        ]

        , modalPdf: false
        , pdfUrl: null

        , timelineDisplay: false
        , timelineData:
[
  {
    "year": 1996,
    "month": 7,
    "day": "",
    "category": 1,
    "display_default": 1,
    "display_flag": 1,
    "ur": "阪神淡路大震災を受け、UR技術検討委員会で住宅耐震化協議を開始",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2003,
    "month": 8,
    "day": "",
    "category": 1,
    "display_default": 1,
    "display_flag": 1,
    "ur": "都市基盤整備公団東京支社（URの前身）で、73号棟の耐震改修を検討。検討案では、工法の違うA,B,Cの3案が検討されていた。",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2005,
    "month": 3,
    "day": "から",
    "category": 1,
    "display_default": "",
    "display_flag": "",
    "ur": "UR、高幡台団地73号棟1階店舗部分の耐震改修工事を開始",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2006,
    "month": 4,
    "day": "",
    "category": 1,
    "display_default": 1,
    "display_flag": 1,
    "ur": "URが73号棟住民に、73号棟改修のお知らせを配布。73号棟は「平成21年度までに耐震改修等実施してまいります」と約束",
    "residents": "",
    "material_1": "Ｈ18年お知らせ_処理不要.pdf",
    "material_2": ""
  },
  {
    "year": 2007,
    "month": 2,
    "day": "",
    "category": 1,
    "display_default": "",
    "display_flag": "",
    "ur": "UR、第6回東日本耐震化推進会議で、73号棟除却方針を決定。4月に理事長承認",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2007,
    "month": 12,
    "day": "",
    "category": 1,
    "display_default": "",
    "display_flag": "",
    "ur": "独立行政法人整理合理化計画が内閣で閣議決定される",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2007,
    "month": 12,
    "day": 25,
    "category": 1,
    "display_default": "",
    "display_flag": "",
    "ur": "URより高幡台団地住民へ、東日本支社サポート業務部長名にて「高幡台団地はストック活用類型分類」とのお知らせ文書。ここには73号棟除却に関する記述は一切なし",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2007,
    "month": 12,
    "day": 26,
    "category": 1,
    "display_default": "",
    "display_flag": "",
    "ur": "UR賃貸住宅ストック再生・再編方針発表。同日にURは第10回東日本耐震化推進会議で、73号棟の除却を正式決定",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 3,
    "day": 1,
    "category": 1,
    "display_default": "",
    "display_flag": "",
    "ur": "URが、高幡台団地自治会運営委員会に除却方針を説明。自治会運営委員会はこの説明を受け、73号棟住民に説明することなく「除却やむなし」の結論に。これを5日付高幡台団地自治会広報号外で公表",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 3,
    "day": 7,
    "category": 2,
    "display_default": 1,
    "display_flag": 1,
    "ur": "UR、73号棟住民に73号棟除却決定と説明会開催を伝えるお知らせ配布",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 3,
    "day": 29,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "UR、七生公会堂で73号棟住民への説明会を実施。当時の居住者204世帯中168世帯参加。説明会は紛糾し、URは住民の要求に応えて4月18日・19日に追加説明会を開催",
    "residents": "",
    "material_1": "①取扱いについて_処理済_cube.pdf",
    "material_2": "①取扱いについて_処理済_cube.pdf"
  },
  {
    "year": 2008,
    "month": 4,
    "day": 25,
    "category": 2,
    "display_default": 1,
    "display_flag": 1,
    "ur": "",
    "residents": "「73号棟に住み続けたい住民の会」（以下、住民の会）発足。住民の会、URに対する署名「73号棟除却計画の撤回と速やかな耐震対策の実施を要望します」集めを開始",
    "material_1": "73号棟署名簿UR向け_処理済_cube.pdf",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 6,
    "day": 10,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース1（創刊号）",
    "material_1": "住民の会ニュース1（創刊号）2008年6月10日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 6,
    "day": 18,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会、署名146筆（当時の73号棟居住者の過半数に相当）をUR東日本支社に提出",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 7,
    "day": 10,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース2",
    "material_1": "住民の会ニュース2 2008年7月10日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 8,
    "day": 1,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース3",
    "material_1": "住民の会ニュース3 2008年8月1日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 9,
    "day": 1,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース4",
    "material_1": "住民の会ニュース4 2008年9月1日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 9,
    "day": 8,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "URが日野市に73号棟問題を説明。日野市は減築をしてでも73号棟を残してほしいと要望",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 9,
    "day": 19,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会、UR東日本支社に対し情報公開法に基づく、18項目にのぼる情報開示を請求（9月30日に正式に受理となる）",
    "material_1": "情報開示内容全体経過一覧_処理不要.pdf",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 10,
    "day": 5,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース5",
    "material_1": "住民の会ニュース5 2008年10月5日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 10,
    "day": 20,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "自由法曹団が、UR住宅除却方針撤回を求める決議、2009年1月29日に耐震改修を求める決議",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 10,
    "day": 30,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "UR、情報開示を決定。構造設計図は表紙以外66ページ全部が黒塗り。その他も一部黒塗りや不開示など不誠実な対応",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 11,
    "day": 3,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース6",
    "material_1": "住民の会ニュース6 2008年11月3日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 11,
    "day": 15,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース7",
    "material_1": "住民の会ニュース7 2008年11月15日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 11,
    "day": 30,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "「73号棟を応援する有志の会」が結成される。その後「高幡台団地を考える会」に発展し現在に至る",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 12,
    "day": 3,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会、9月30日の情報開示の結果に対し、UR東日本支社に異議申立て。12月18日、新たに7項目の第2次情報開示請求",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 12,
    "day": 7,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "弁護士と建築家による、73号棟現地調査と住民懇談会開催される。弁護士と建築専門家20名以上参加",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 12,
    "day": 9,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "日野市議会で、市長が73号棟について「減築をしても残してほしい」と表明",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2008,
    "month": 12,
    "day": 20,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース8",
    "material_1": "住民の会ニュース8 2008年12月20日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2009,
    "month": 1,
    "day": 18,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース9",
    "material_1": "住民の会ニュース9 2009年1月18日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2009,
    "month": 2,
    "day": 20,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース10",
    "material_1": "住民の会ニュース10 2009年2月20日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2009,
    "month": 3,
    "day": 5,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会、日野市議会に「高幡台団地73号棟の存続と必要な耐震対策の実施を求める」請願を提出。自民、民主、公明、共産など議会全会派6名が紹介議員となる",
    "material_1": "日野市議会請願書名_処理済_cube.pdf",
    "material_2": ""
  },
  {
    "year": 2009,
    "month": 3,
    "day": 12,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "提出した請願は、市議会総務企画委員会で審議、継続審査となる。その後6月、9月、と審議が行われたが、自公民3党が紹介議員を辞退し、12月14日に不採択となった。請願署名数は総計940筆となり、高幡台団地全戸数の過半数を超えた",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2009,
    "month": 3,
    "day": 25,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース11",
    "material_1": "住民の会ニュース11 2009年3月25日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2009,
    "month": 3,
    "day": 26,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "自由法曹団による国会要請行動に参加。自由法曹団による意見書「UR賃貸住宅の除却方針を撤回し修繕義務の履行を求める」（4月1日付）をもって、弁護士とともに各党国会議員に陳情。11月26日にも再陳情",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2009,
    "month": 5,
    "day": 28,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "日野市長がURに「73号棟の減築による耐震対策等の実施について」と題したお願い文書を提出",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2009,
    "month": 6,
    "day": 6,
    "category": 2,
    "display_default": 1,
    "display_flag": 1,
    "ur": "",
    "residents": "住民の会、UR東日本支社と第1回「話し合い」。テーマは「なぜ北側から改修できないか」。URは73号棟設計図の一部を示したが、説明後にすべて回収。73号棟の耐震改修工事について、「居つき工事が前提」等の6項目の条件が初めて示される",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2009,
    "month": 6,
    "day": 8,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会、「73号棟を残してください」と題した手記集を、日野市議会全議員に手渡し、請願採択を求める",
    "material_1": "高幡台団地住民の手記_処理済_cube.pdf",
    "material_2": ""
  },
  {
    "year": 2009,
    "month": 9,
    "day": 5,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース11-2",
    "material_1": "住民の会ニュース11-2 2009年9月5日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2009,
    "month": 9,
    "day": 27,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会、UR東日本支社と第2回「話し合い」。ＵＲが横浜・奈良北団地で制震工法を使った改修を行ったことを知った住民が、なぜ73号棟では制震工法が適用できないのか説明を求める。初めて、「73号棟のエキスパンションジョイントが狭いので、耐震工法が適用できない」との説明あり",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2009,
    "month": 11,
    "day": 17,
    "category": 2,
    "display_default": 1,
    "display_flag": 1,
    "ur": "73号棟住民のうち5月起算の契約者に、URから「更新拒絶」の内容証明郵便が送付される。以後、契約期日の6か月前に順次内容証明到着（6か月前に送達することが法律で定められている）",
    "residents": "",
    "material_1": "更新拒絶事前連絡_処理済_cube.pdf",
    "material_2": ""
  },
  {
    "year": 2010,
    "month": 2,
    "day": "末",
    "category": 2,
    "display_default": 1,
    "display_flag": 1,
    "ur": "",
    "residents": "住民の会、73号棟のベランダに黄色い旗を掲げる。団地内の支援者宅にも掲示",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2010,
    "month": 3,
    "day": 26,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会、UR東日本支社と第3回「話し合い」。住民側の要求に、URは初めて構造図を開示したが、持ってきたのは66ページ中42ページのみ。3月29日になって改めて全面開示された",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2010,
    "month": 5,
    "day": 18,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "衆院国土交通委員会で、73号棟問題が取り上げられる。共産党・穀田恵二議員が質問",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2010,
    "month": 6,
    "day": 20,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース12",
    "material_1": "住民の会ニュース12 2010年6月20日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2010,
    "month": 6,
    "day": 27,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "TBSテレビ「噂の東京マガジン」で、73号棟問題が放送される",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2010,
    "month": 7,
    "day": 18,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース12-2",
    "material_1": "住民の会ニュース12-2 2010年7月18日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2010,
    "month": 7,
    "day": 30,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース13",
    "material_1": "住民の会ニュース13 2010年7月30日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2010,
    "month": 8,
    "day": 6,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "7月起算の73号棟住民2人に、URより契約終了確認と住宅返還催告が送付される。以後5人に順次送付される【関連資料を見る】",
    "residents": "",
    "material_1": "更新拒絶通知_処理済_cube.pdf",
    "material_2": ""
  },
  {
    "year": 2010,
    "month": 8,
    "day": 11,
    "category": 2,
    "display_default": 1,
    "display_flag": 1,
    "ur": "",
    "residents": "73号棟住民、東京法務局に家賃供託を開始。以後家賃の自動引き落としを拒否された住民は、毎月の家賃供託をつづける",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2010,
    "month": 9,
    "day": 5,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース14",
    "material_1": "住民の会ニュース14 2010年9月5日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2010,
    "month": 10,
    "day": 12,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "UR、高幡台団地住民に対し、73号棟1階店舗部分の代替施設設置工事説明会を開催。翌日から73号棟前の樹木を伐採、広場を閉鎖して代替施設の工事を開始",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2010,
    "month": 11,
    "day": 7,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース15",
    "material_1": "住民の会ニュース15 2010年11月7日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2010,
    "month": 12,
    "day": 27,
    "category": 2,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース16",
    "material_1": "住民の会ニュース16 2010年12月27日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 1,
    "day": 21,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "UR、73号棟住民に対し、建物明け渡し訴訟を東京地裁立川支部に起こす",
    "residents": "",
    "material_1": "訴状全文_処理済_cube.pdf",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 2,
    "day": 5,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会、建築家グループと共催で、「高幡台団地を考えるワークショップ」（第1回）を開催。同日、裁判所より住民に訴状が届く",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 2,
    "day": 25,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会、インターネットTV「住まいるチャンネル」に出演。建築家摺木勉、住民の会より村田栄法、中川京子が出演",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 2,
    "day": 27,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "「73号棟を支援する市民の会」結成。日野市内で「73号棟から住まいを考える集い」（7月30日）などの支援集会を主催",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 3,
    "day": 7,
    "category": 3,
    "display_default": 1,
    "display_flag": 1,
    "ur": "",
    "residents": "第1回裁判、住民側の答弁書提出。URの訴状に対し全面的に争うことを表明",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 3,
    "day": 11,
    "category": 3,
    "display_default": 1,
    "display_flag": 1,
    "ur": "東日本大震災。73号棟では、窓ガラスが割れたり、エキスパンションジョイントのカバーが破損するなどの被害があったが、建物本体に影響を与える被害はなかった",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 3,
    "day": 21,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "「住まいの貧困に取り組むネットワーク」2周年の集いにて、映画『さようならUR』（早川由美子監督）完成発表",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 3,
    "day": 22,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース17",
    "material_1": "住民の会ニュース17 2011年3月22日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 4,
    "day": 10,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "TBS「噂の東京マガジン」が2回目の放送。73号棟問題の裁判等、その後の経過を伝える",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 5,
    "day": 9,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "第2回裁判、住民第1準備書面提出。住民にとって73号棟は「終の棲家」。耐震改修はURの責任と主張",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 5,
    "day": 28,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "「高幡台団地を考えるワークショップ」（第2回）を団地内で開催。73号棟積極活用提案の第1次案発表、映画『さようならUR』が団地内で初めて上映される",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 7,
    "day": 12,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "第3回裁判。この回から裁判官3人による合議制となる。UR側、第１準備書面提出。2003年（平成15年）73号棟の耐震改修の検討をしていた内容（平成15年検討）を、初めて明らかにした。住民側、畦地豊彦意見陳述。",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 7,
    "day": 23,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース18",
    "material_1": "住民の会ニュース18 2011年7月23日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 9,
    "day": 13,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "考える会、裁判所あて「73号棟の存続を求める」署名、172筆提出。その後追加で提出し、総計200筆を超えた",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 9,
    "day": 15,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "第4回裁判。住民側、第2、第3準備書面提出。URによる説明経過とその問題点、借地借家法による正当事由の欠如を指摘。改修費用7.5億円の根拠などの釈明を求める。中川京子意見陳述",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 10,
    "day": 5,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース19",
    "material_1": "住民の会ニュース19 2011年10月5日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 10,
    "day": 27,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "第5回裁判。UR側、第2準備書面提出。住民側の求釈明に対する回答とのことだが、まともに答えず。住民側、建築家・摺木勉の意見書＝制震工法による73号棟の改修方法の検討結果＝を提出。村田栄法意見陳述",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2011,
    "month": 12,
    "day": 22,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "第6回裁判。UR側、第3準備書面提出。住民に丁寧に説明してきたと主張。耐震補強は努力義務であり、法律上は義務ではないと強弁。住民側、第4準備書面提出。摺木改修案によれば、費用は4.2億円程度。村井和子意見陳述",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 1,
    "day": 28,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "支援団体ら、「73号棟問題から公営公共住宅を考える集い」を日野市内で開催",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 2,
    "day": 18,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "支援団体ら、「73号棟のたたかい連帯集会」を都内で開催。新建築家技術家集団による、「高幡台団地センター高層住棟 73号棟積極活用計画」が発表される",
    "material_1": "積極活用案120218_処理不要.pdf",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 2,
    "day": 23,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "第7回裁判。UR側、第4準備書面提出。摺木改修案への反論意見書を提出。住民側、第5準備書面提出。多くの住民が転居したのは偽りの情報に誤導されたもの。栗原明意見陳述",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 3,
    "day": 29,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "第8回裁判。UR側、第5準備書面提出。耐震改修は一戸の移転も行わせないのが基本を繰り返す。住民側、奈良北団地の資料提出を求める。KT意見陳述",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 5,
    "day": 3,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース20",
    "material_1": "住民の会ニュース20 2012年5月3日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 5,
    "day": 17,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "第9回裁判。住民側、第6準備書面提出。URの社会的使命を指摘。MK意見陳述",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 7,
    "day": 4,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "第10回裁判。住民側、第7準備書面提出。ＵＲ第4準備書面（摺木改修案反論）への再反論",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 8,
    "day": 25,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース21",
    "material_1": "住民の会ニュース21 2012年8月25日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 8,
    "day": 30,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "第11回裁判。住民側、民法学者として早稲田大学教授吉田克己、「国民の住まいを守る全国連絡会」から代表幹事の坂庭国晴両氏の意見書提出",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 9,
    "day": 1,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "支援団体ら、七生公会堂にて「高幡台団地73暑棟裁判と連帯するつどい」",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 9,
    "day": 13,
    "category": 3,
    "display_default": 1,
    "display_flag": 1,
    "ur": "",
    "residents": "第12回裁判、証人尋問。午前10時から夕方までの集中証拠調べ 。UR側2人、住民側から建築家・摺木勉と住民2人（村田栄法、畦地笙子）が証言",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 10,
    "day": 15,
    "category": 3,
    "display_default": 1,
    "display_flag": 1,
    "ur": "裁判所による和解意向聴取。URからは、当初住民に示された移転条件そのままの和解案が示される",
    "residents": "",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 11,
    "day": 15,
    "category": 3,
    "display_default": 1,
    "display_flag": 1,
    "ur": "",
    "residents": "住民側、裁判所へ10月15日の和解条件では納得できないと連絡。これを受け、裁判所は12月13日に予定されていた裁判を翌年1月24日に延期",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 11,
    "day": 30,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民側、ＵＲ側とも裁判所へ最終準備書面提出。住民側はＵＲ側の最終準備書面に反論する第10準備書面提出（12月12日）",
    "material_1": "",
    "material_2": ""
  },
  {
    "year": 2012,
    "month": 12,
    "day": 10,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース22",
    "material_1": "住民の会ニュース22 2012年12月10日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2013,
    "month": 2,
    "day": 28,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース23",
    "material_1": "住民の会ニュース23 2013年2月28日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2013,
    "month": 3,
    "day": 24,
    "category": 3,
    "display_default": "",
    "display_flag": "",
    "ur": "",
    "residents": "住民の会ニュース24",
    "material_1": "住民の会ニュース24 2013年3月24日発行 PDF",
    "material_2": ""
  },
  {
    "year": 2013,
    "month": 3,
    "day": 28,
    "category": 3,
    "display_default": 1,
    "display_flag": 1,
    "ur": "",
    "residents": "東京地裁立川支部にて、三村晶子裁判長より判決の言い渡し。UR側の主張を全面的に認め、住民側の主張を一切認めない、不当判決だった",
    "material_1": "20130328_UR判決_処理済_cube.pdf",
    "material_2": ""
  }
]
        
    }

    , computed: {

        timeline: function()
        {

            var years = this.timelineData.map(a => a.year );
            years = years.filter((v, k, self) => { return self.indexOf(v) === k });

            var arr = {};
            var residents = {};

            years.forEach(v => {
                
                var dataByYear = this.timelineData.filter(a => a.year == v);
                var months = dataByYear.map(a => a.month);
                months = months.filter((v, k, self) => { return self.indexOf(v) === k }).sort((a, b) => a - b);

                arr[v] = {};
                months.forEach(v2 => {
                    arr[v][v2] = {};
                    var dataByMonth = dataByYear.filter(a => a.month == v2);
                    arr[v][v2]['ur'] = dataByMonth.filter(a => a.ur !== '');
                    arr[v][v2]['residents'] = dataByMonth.filter(a => a.residents !== '');
                });

            })

            return arr;
        }
        
    }
    
    , methods: {

        showStatement(key)
        {
            this.modalPdf = true;
            this.pdfUrl = `<? echo get_template_directory_uri(); ?>/assets/pdf/statement_${key}.pdf`;
        }

        , showMaterialPdf(fileName)
        {
            this.modalPdf = true;
            this.pdfUrl = `<? echo get_template_directory_uri(); ?>/assets/pdf/${fileName}`;
        }

        , ctrlDisplayTimeline()
        {

            var self = this;
            this.timelineDisplay = (this.timelineDisplay === false) ? true : false;
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
                    a.display_flag = (a.display_flag === true) ? a.display_default : true;
                })
            })

        }

        , getTimelineDay(month, day)
        {
            return typeof day === 'string' ? month + day : (day + '日');
        }

    }

});


</script>

<?php get_footer(); ?>