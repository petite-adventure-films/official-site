<?php

$contents = apply_filters('the_content', $post->post_content);

$contents_titles = get_post_meta_arr($post->ID, "contents_info_01");
$contents_contents = get_post_meta_arr($post->ID, "contents_info_02");
$contents_appendixs = get_post_meta_arr($post->ID, "contents_info_03");

$movie_brian_co = 2161;
$movie_goodbye_ur = 16;
$movie_fukushima = 2171;
$movie_homeless = 2183;
$movie_dancing = 2173;

get_header(); ?>

<div class="single">

<div class="col col_9 last">

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

	<p class="m7_t">Petite Adventure Films creates indepenent documentary films on topics that are overlooked or barely covered by mainstream media. Concentrating on ordinary people's lives and showing how their courage and united voices can change the world for the better.</p>
	<div class="inline_block m2_t btn priority1">
		<a href="<?php echo get_permalink(get_page_by_path("contact_en")); ?>">Contact</a>
	</div>

	<section class="contents">
		<h2 class="contents_title">News</h2>
		<h4 class="m2_t bold">Screening at Pori Art Museum, Finland!</h4>
		<p>"The Apprentice Homeless" will be shown at the exhibition "EAST ASIAN VIDEO FRAMES: SHADES OF URBANIZATION" at Pori Art Museum, Finland, from 12 February to 28th August 2016. For more info, please visit: <a href="http://www.poriartmuseum.fi/eng/exhibitions/" target="_BLANK" />Pori Art Museum</a></p>
	</section>

</div>

	<section class="contents">
		<div class="col col_6">
			<h2 class="contents_title">About the Director</h2>
			<p>Yumiko HAYAKAWA was born in Tokyo, Japan in 1975. She graduated from Seikei University in Japan, and the London School of Journalism in the UK. During her studies in London, she began her filmmaking career and in 2009, she completed her first documentary film, "Brian and Co. Parliament Square SW1". With this film, she won the, "New Face Award 2009" from the Japanese Congress of Journalists. Her second film, "Goodbye UR - The Japanese Social Housing Crisis" won the, "Sky Perfect IDEHA Prize" from Yamagata International Documentary Film Festival 2011. HAYAKAWA's films focus on various social issues and inequality in today's Japan from various perceptions. She also organizes filmmaking workshops for alternative media and students. She is known as one of the most active independent documentary filmmakers in Japan.</p>
		</div>
		<div class="col col_3 last">
			<div id="director_profile_img">
				<img src="<?php echo bloginfo("template_url"); ?>/assets/img/director_img_01.jpg" alt="" />
			</div>
		</div>
	</section>


	<section class="contents">

		<div class="col col_9 last">

			<h2 class="contents_title">Films</h2>

			<section class="m7_t">
				<h2 class="contents_title">FOUR YEARS ON</h2>
				<p class="m2_t">Documentary/2015/HD Video/Colour/21 minutes/Japan</p>
				<dl class="list_definition">
					<dt>Language</dt>
					<dd>Japanese</dd>
					<dt>Subtitles</dt>
					<dd>English / French</dd>
					<dt>Director</dt>
					<dd>Yumiko Hayakawa</dd>
				</dl>
				<h4 class="m2_t bold">Story</h4>
				<p>The Japan's most "radical" graffiti artist, 281 Anti nuke's documentary film. Full version of the film (with English/French subtitles) is now on Youtube!</p>
				<div class="m1_t video">
					<iframe width="560" height="315" src="https://www.youtube.com/embed/1udWacAJJx4" frameborder="0" allowfullscreen></iframe>
				</div>

				<h4 class="m2_t bold">Festivals</h4>
				<h5 class="m1_t">Domestic</h5>
				<ul>
					<li>Mitaka Peace Film Festival (2015)</li>
					<li>Fukuoka Asian Film Festival (2015)</li>
				</ul>
			</section>

		</div>

		<section class="m7_t">
			<div class="col col_6">
				<h3 class="contents_title">The Apprentice Homeless</h3>
				<p class="m2_t">Documentary/2014/HD Video/Colour/16 minutes/Japan</p>
				<dl class="list_definition">
					<dt>Language</dt>
					<dd>Japanese</dd>
					<dt>Subtitles</dt>
					<dd>English</dd>
					<dt>Director</dt>
					<dd>Yumiko Hayakawa</dd>
				</dl>
				<div class="inline_block m2_t btn priority2">
					<a href="<?php echo get_permalink(get_page_by_path("order_en")); ?>">BUY DVD</a>
				</div>
			</div>
			<div class="col col_3 last">
				<?php
				$poster_img = get_post_meta($movie_homeless, "films_info_23", TRUE);
				$poster_img = ($poster_img) ? $poster_img : get_post_meta($movie_homeless, "films_info_00", TRUE);
				echo get_post_meta_img($poster_img, "large"); ?>
			</div>
			<div class="col col_9 last">
				<h4 class="m2_t bold">Story</h4>
				<p>When did we come to lose our freedom in public space? Benches have been removed, performances banned and homeless people are finding it increasingly difficult to find somewhere to sleep.</p>
				<p>Collecting cardboard from a supermarket, and setting up a “home” upon the sidewalk, here the artist endeavors, through a performance, to create her own living space within public space. See the reactions of passers-by and police interventions as Hayakawa attempts an apprenticeship of homeless life, the struggle of which is not without humor.</p>
				<p>Accompanying the footage of an enactment of homelessness is sound track of interviews with those actually living on the streets of Shinjuku, mixing constructed images with raw voices of anger, sadness, hope and laughter.</p>
				<p>This is a document of a small act of resistance, attempting to restore public space to our own hands.</p>
				<h4 class="m2_t bold">Festivals</h4>
				<h5 class="m1_t">Domestic</h5>
				<ul>
					<li>Sapporo International Short Film Festival (2014)</li>
					<li>O! iDO Short Film Festival (2014)</li>
				</ul>
				<h5 class="m1_t">International</h5>
				<ul>
					<li>Exhibition "EAST ASIAN VIDEO FRAMES: SHADES OF URBANIZATION" (2016) - Finland</li>
					<li>Split Film Festival (2014) - Croatia</li>
					<li>A Corto di Donne Film Festival (2014) - Italy</li>
					<li>Hanoi DOCLAB (2014) - Viet Nam</li>
				</ul>
			</div>
		</section>

		<section class="m7_t">
			<div class="col col_6">
				<h3 class="contents_title">Dancing Zempukuji</h3>
				<p class="m2_t">Documentary/2013/HD Video/Colour/50 minutes/Japan</p>
				<dl class="list_definition">
					<dt>Language</dt>
					<dd>Japanese</dd>
					<dt>Subtitles</dt>
					<dd>English</dd>
					<dt>Director</dt>
					<dd>Yumiko Hayakawa</dd>
				</dl>
				<div class="inline_block m2_t btn priority2">
					<a href="<?php echo get_permalink(get_page_by_path("order_en")); ?>">BUY DVD</a>
				</div>
			</div>
			<div class="col col_3 last">
				<?php
				$poster_img = get_post_meta($movie_dancing, "films_info_23", TRUE);
				$poster_img = ($poster_img) ? $poster_img : get_post_meta($movie_dancing, "films_info_00", TRUE);
				echo get_post_meta_img($poster_img, "large"); ?>
			</div>
			<div class="col col_9 last">
				<h4 class="m2_t bold">Story</h4>
				<p>Tucked in a corner of Tokyo’s Western district, Zempukuji is one of the neighborhoods to which people fled to during the bombings of WWII, and it has come to foster a unique culture which has attracted many artists and creators.</p>
				<p>This film documents the song and dance of those who live in Zempukuji. From Korean drumming “Chango” to Kagura, Edo kappore, Butoh and contemporary dance, this is a celebration of all forms of performing arts which play out upon the stage of Zempukuji.</p>
				<p>At the same time this film also offers an insight into the everyday lives of some of Zempukuji’s oldest inhabitants, its centenarian. In the span of a century how have we changed? What has remained unchanging? Here one resident of 102 years, still actively running his own coffee bean store, talks of a Japan which few have heard of before.</p>
				<p>This work aims to reawaken something sleeping within us all, to open our eyes, catch our spirit and send us into a dance.</p>
				<h4 class="m2_t bold">Festivals</h4>
				<h5 class="m1_t">Domestic</h5>
				<ul>
					<li>Mid-length Film Festival (2014)</li>
				</ul>
				<h5 class="m1_t">International</h5>
				<ul>
					<li>Afghanistan International Women's Film Festival (2015) - Afghanistan</li>
					<li>International Association of Women in Radio & Television (IAWRT) (2015) - India</li>
					<li>Hanoi DOCLAB (2014) - Viet Nam</li>
				</ul>
			</div>
		</section>

		<section class="m7_t">
			<div class="col col_6">
				<h3 class="contents_title">A Woman From Fukushima</h3>
				<p class="m2_t">Documentary/2014/HD Video/Colour/56 minutes (Part1&2)/Japan</p>
				<dl class="list_definition">
					<dt>Language</dt>
					<dd>Japanese</dd>
					<dt>Subtitles</dt>
					<dd>English</dd>
					<dt>Director</dt>
					<dd>Yumiko Hayakawa</dd>
				</dl>
				<div class="inline_block m2_t btn priority2">
					<a href="<?php echo get_permalink(get_page_by_path("order_en")); ?>">BUY DVD</a>
				</div>
			</div>
			<div class="col col_3 last">
				<?php
				$poster_img = get_post_meta($movie_fukushima, "films_info_23", TRUE);
				$poster_img = ($poster_img) ? $poster_img : get_post_meta($movie_fukushima, "films_info_00", TRUE);
				echo get_post_meta_img($poster_img, "large"); ?>
			</div>
			<div class="col col_9 last">
				<h4 class="m2_t bold">Story</h4>
				<p>Setsuko Kida lost her way of life due to the Great East Japan Earthquake and subsequent Fukushima Daiichi Nuclear Power Plant disaster on 11th March 2011.<br />
				The Japanese government has claimed to have resolved the disaster, but even now irradiated water continues to flow directly into the sea. Even the very fear of radiation invisible to the eye has caused rifts in communities and families.<br />
				Determined to prevent a second Fukushima, Setsuko has come to speak out. And as we hear her words what are we to think and how are we to live?</p>
				<h4 class="m2_t bold">Synopsis</h4>
				<h5 class="m1_t">Part 1</h5>
				<p>As a result of the nuclear disaster Setsuko Kida was forced from her home in Tomioka, Fukushima. Here she talks about her home and family, from the building of her house close to the Fukushima Daiichi Nuclear Power Plant, to her son working at the nuclear power station, to the changes in relations with her husband as a result of the nuclear accident, as well as her current thoughts towards "Japan" since becoming a "nuclear evacuee".</p>
				<p>Up until now, having been sited by the media as "the mother of a nuclear plant worker", this film shifts the focus to highlight her changing relationship with her husband. Emerging from her self imposed isolation, Setsuko carries a new wind as she comes to raise her voice.</p>
				<h5 class="m1_t">Part 2: </h5>
				<p>In July 2013, Setsuko stood as a candidate for the House of Councilors elections. What was driving Setsuko to take such a challenge? In heat exceeding 35 degrees centigrade, we follow her on the campaign trail through the crowded shopping streets of Ginza, Tokyo.</p>
				<p>Running for the election with an anti-nuclear message, the issues which she faces along this road may be said to be a reflection of wider Japanese society. From her husband opposing his "wife" joining the election, to the mass media's refusal to refer to her as a "refugee of nuclear disaster".</p>
				<p>Here we observe the confrontation between a woman moved to speak out, and the structure of Japanese society which has continued to support nuclear power.</p>
				<h4 class="m2_t bold">Festivals</h4>
				<h5 class="m1_t">Domestic</h5>
				<ul>
					<li>Mitaka Peace Film Festival (2013)</li>
				</ul>
				<h5 class="m1_t">International</h5>
				<ul>
					<li>HALBWERTSZEIT Film Festival (2015) - Switzerland</li>
					<li>Cinema Nova (2014) - Belgium</li>
					<li>Ecozine Film Festival (2014) - Spain</li>
					<li>International Uranium Film Festival (2014) - Brazil</li>
				</ul>

			</div>
		</section>

		<section class="contents">

			<div class="col col_6">
				<h3 class="contents_title">Goodbye UR - The Japanese Social Housing Crisis</h3>
				<p class="m2_t">Documentary/2011/HD Video/Colour/73 minutes/Japan</p>
				<dl class="list_definition">
					<dt>Language</dt>
					<dd>Japanese</dd>
					<dt>Director</dt>
					<dd>Yumiko Hayakawa</dd>
				</dl>
				<div class="inline_block m2_t btn priority2">
					<a href="<?php echo get_permalink(get_page_by_path("order_en")); ?>">BUY DVD</a>
				</div>
			</div>
			<div class="col col_3 last">
				<?php
				$poster_img = get_post_meta($movie_goodbye_ur, "films_info_23", TRUE);
				$poster_img = ($poster_img) ? $poster_img : get_post_meta($movie_goodbye_ur, "films_info_00", TRUE);
				echo get_post_meta_img($poster_img, "large"); ?>
			</div>

			<div class="col col_9 last">

				<div class="m2_t video">
					<iframe width="410" height="280" src="http://www.youtube.com/embed/gqEwKffRgNU?rel=0" frameborder="0" allowfullscreen></iframe>
				</div>

				<h4 class="m2_t bold">Story</h4>
				<p>Due to a lack of social welfare services for public housing in Japan, reasonable state-run accommodation is not adequately provided for low-income earners. Therefore, people who are excluded from social welfare live in social housing provided by the semi-public organisation, UR (Urban Renaissance Agency). </p>
				<p>UR is now facing privatisation. The Japanese government announced plans to demolish 50,000 UR owned apartments, selling the land to private developers.</p>
				<p>Japanese filmmaker, Yumiko Hayakawa, met a group of UR residents who are facing eviction from their much-loved apartment building. Many of the residents are pensioners who would find it hard to relocate after spending a lifetime there.</p>
				<p>Through interviews with the residents, housing experts, lawyers and UR's president, this film highlights the complex social housing situation in Japan.</p>

				<h4 class="m2_t bold">Awards</h4>
				<p>Sky Perfect IDEHA Prize - Yamagata International Documentary Film Festival, Japan(2011)</p>

				<h4 class="m2_t bold">Festivals</h4>
				<h5 class="m1_t">Domestic</h5>
				<ul>
					<li>Yamagata International Documentary Film Festival (2011)</li>
					<li>Aichi International Women's Film Festival (2011)</li>
					<li>Fukuoka Asian Film Festival (2011)</li>
					<li>Hiroshima Peace Film Festival(2011)</li>
					<li>Shintoku Kuusonomori Film Festival (2011)</li>
					<li>Housing Rights Film Festival (2012)</li>
					<li>Okayama Film Festival (2012)</li>
				</ul>
				<h5 class="m1_t">International</h5>
				<ul>
					<li>YUNFEST (2011) - China</li>
					<li>International Women's Film Festival in Seoul (2012) - S. Korea</li>
					<li>Seoul Independent Documentary Film & Video Festival (2013) - S. Korea</li>
				</ul>

				<h4 class="m2_t bold">Theatrical screenings</h4>
				<p>Cine Nouveau (2012) - Osaka, Japan</p>
			</div>
		</section>

		<section class="contents">

			<div class="col col_6">
				<h3 class="contents_title">Brian & Co. Parliament Square SW1</h3>
				<p class="m2_t">Documentary/2009/Video/Colour/97 minutes/UK, Japan</p>
				<dl class="list_definition">
					<dt>Language</dt>
					<dd>English/Japanese</dd>
					<dt>Director</dt>
					<dd>Yumiko Hayakawa</dd>
				</dl>
				<div class="inline_block m2_t btn priority2">
					<a href="<?php echo get_permalink(get_page_by_path("order_en")); ?>">BUY DVD</a>
				</div>
			</div>
			<div class="col col_3 last">
				<?php
				$poster_img = get_post_meta($movie_brian_co, "films_info_23", TRUE);
				$poster_img = ($poster_img) ? $poster_img : get_post_meta($movie_brian_co, "films_info_00", TRUE);
				echo get_post_meta_img($poster_img, "large"); ?>
			</div>

			<div class="col col_9 last">

				<div class="m2_t video">
					<iframe width="560" height="315" src="https://www.youtube.com/embed/kglMUYoocNs" frameborder="0" allowfullscreen></iframe>
				</div>

				<h4 class="m2_t bold">Story</h4>
				<p>Brian & Co. Parliament Square SW1 is a documentary film by Japanese film-maker Yumiko Hayakawa. The film details life in and around Brian Haw's peace campaign in Parliament Square, London. Filmed over the course of one and a half years, the film captures this legendary peace campaign through interviews with Brian, his supporters, former Labour MP Tony Benn and UK/Japanese peace campaigners. The film also sheds light on how freedom of speech is threatened in the UK and people's imaginative and unrelenting ways of defending their rights.</p>

				<h4 class="m2_t bold">Awards</h4>
				<p>Japan Congress of Journalists New Face Award (2009) - Japan</p>

				<h4 class="m2_t bold">Festivals</h4>
				<h5 class="m1_t">Domestic</h5>
				<ul>
					<li>Awa Peace Film Festival (2009)</li>
					<li>Fukuoka Asian Film Festival (2009)</li>
					<li>Toyonaka Peace Film Festival (2009)</li>
					<li>Shure University International Film Festival (2009)</li>
					<li>Hiroshima Peace Film Festival (2009)</li>
					<li>Anti-war, Resistance Documentary Film Festival in Okinawa (2009) </li>
					<li>Aichi International Women's Film Festival (2009)</li>
					<li>Nagaoka Asian Film Festival (2009)</li>
					<li>Shintoku Kuusonomori Film Festival (2009)</li>
					<li>Okayama Film Festival (2009)</li>
					<li>Wakuwaku Narashino Film Festival (2009)</li>
					<li>Kyoto University International Sit-in Film Festival (2009)</li>
					<li>Tama Cinema Forum, Tama New Wave (2009)</li>
					<li>Aichi Peace Film Festival (2010)</li>
					<li>Mitaka Life and Peace Film Festival (2010)</li>
					<li>Awa Peace Film Festival (2010)
				</ul>
				<h5 class="m1_t">International</h5>
				<ul>
					<li>Portobello Film Festival (2009) - UK</li>
					<li>International 1001 Documentary Film Festival (2009) - Turkey</li>
				</ul>
			</div>

		</section>

	</section>










</div>


<script type="text/javascript">

	$(function(){
		$(".owl-carousel").owlCarousel({
			items: 1,
			autoHeight: true,
			lazyLoad : true,
			loop: true,
			dots: true,
			nav: true,
			navText: ["",""]
		});
	});

</script>


<?php get_footer(); ?>