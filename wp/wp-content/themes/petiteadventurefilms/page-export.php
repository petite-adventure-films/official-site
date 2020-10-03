<?php get_header(); ?>

<?php

$export_news = true;
$export_events = false;
$export_channel = false;
$export_media = false;
$export_pages = false;
$export_posts = false;

class kara {}
$entries = [];
$titles = [];
$i = 0;



if($export_posts):
	$offset = 200;
	$args = array(
		  'post_type' => 'post'
		, 'posts_per_page' => 100
		, 'offset'         => $offset
		, 'orderby'        => 'date'
		, 'order'          => 'ASC'
	);
	$posts = query_posts($args);
	if($posts):
		foreach($posts as $post):

			$cat_arr = [
				'雑木林コラム'           => '3k7zbt4vJ2DE8vyzSXkkjY'
				, '上映会・イベントレポート' => '5pSHDdKB1goUInTYm7kI4A'
				, '制作日誌'            => '52UAIoSd3RdquK1NxW0KIH'
				, '映画監督、日々の暮らし'  => '3JCGW4YJNRAT6lHEUvFEXv'
			];
			$categories = get_the_category();
			foreach($categories as $category ){
				if(array_key_exists($category->name, $cat_arr)){

					$entries[$i]['sys']['id'] = '';
					$entries[$i]['sys']['contentType'] = [];
					$entries[$i]['sys']['contentType']['sys'] = [];
					$entries[$i]['sys']['contentType']['sys']['type'] = 'Link';
					$entries[$i]['sys']['contentType']['sys']['linkType'] = 'ContentType';
					$entries[$i]['sys']['contentType']['sys']['id'] = 'post';

					$entries[$i]['fields']['title']['ja-JP'] = $post->post_title;
					$entries[$i]['fields']['slug']['ja-JP']  = urldecode($post->post_name);
					$entries[$i]['fields']['order']['ja-JP'] = $i + $offset + 1;
					$entries[$i]['fields']['publishedDate']['ja-JP'] = get_the_date('', $post->ID);
					$entries[$i]['fields']['category']['ja-JP']['sys']['type'] = 'Link';
					$entries[$i]['fields']['category']['ja-JP']['sys']['linkType'] = 'Entry';
					$entries[$i]['fields']['category']['ja-JP']['sys']['id'] = $cat_arr[$category->name];

					$body = preg_split('/&nbsp;/', $post->post_content);

					foreach($body as $key => $data):

						$entries[$i]['fields']['body']['ja-JP']['data'] = new kara;
						$entries[$i]['fields']['body']['ja-JP']['nodeType'] = 'document';
						$entries[$i]['fields']['body']['ja-JP']['content'][$key]['data'] = new kara;
						$entries[$i]['fields']['body']['ja-JP']['content'][$key]['nodeType'] = 'paragraph';

						$has_link = preg_match_all('/(.+?)<a href="(.+?)">(.+?)<\/a>(.+)/', $data, $matches);
						if($has_link)
						{

							$j = 0;
							$link = '';
							for($k=1; $k<count($matches); $k++)
							{

								$test[] = strpos($matches[$k][0], 'http');
								if(strpos($matches[$k][0], 'http') === false)
								{
									if($link)
									{
										$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][$j]['data']['uri'] = $link;
										$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][$j]['nodeType'] = 'hyperlink';
										$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][$j]['content'][0]['data'] = new kara;
										$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][$j]['content'][0]['nodeType'] = 'text';
										$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][$j]['content'][0]['marks'] = [];
										$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][$j]['content'][0]['value'] = $matches[$k][0];

										$link = '';
									}
									else
									{
										$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][$j]['data'] = new kara;
										$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][$j]['nodeType'] = 'text';
										$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][$j]['marks'] = [];
										$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][$j]['value'] = $matches[$k][0];
									}
									$j++;
								}

								else
								{
									$link = $matches[$k][0];
								}
							}

						}

						else
						{
							$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][0]['data'] = new kara;
							$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][0]['marks'] = [];
							$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][0]['value'] = strip_tags($data, '<a><img><br>');
							$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][0]['nodeType'] = 'text';
						}

					endforeach;

					$i++;
				}
			}


		endforeach;
	endif;
endif;


if($export_pages):
	$args = array(
		'include'  => '5322, 4580, 4057, 4058, 4056'
	);
	$posts = get_pages($args);
	if($posts):
		foreach($posts as $post):

			$entries[$i]['sys']['id'] = '';
			$entries[$i]['sys']['contentType'] = [];
			$entries[$i]['sys']['contentType']['sys'] = [];
			$entries[$i]['sys']['contentType']['sys']['type'] = 'Link';
			$entries[$i]['sys']['contentType']['sys']['linkType'] = 'ContentType';
			$entries[$i]['sys']['contentType']['sys']['id'] = 'page';

			$entries[$i]['fields']['title']['ja-JP'] = $post->post_title;
			$entries[$i]['fields']['slug']['ja-JP'] = urldecode($post->post_name);

			$body = preg_split('/<div.+>/', $post->post_content);

			foreach($body as $key => $data):
				$entries[$i]['fields']['body']['ja-JP']['data'] = new kara;
				$entries[$i]['fields']['body']['ja-JP']['nodeType'] = 'document';
				$entries[$i]['fields']['body']['ja-JP']['content'][$key]['data'] = new kara;
				$entries[$i]['fields']['body']['ja-JP']['content'][$key]['nodeType'] = 'paragraph';
				$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][0]['data'] = new kara;
				$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][0]['marks'] = [];
				$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][0]['value'] = strip_tags($data, '<a><img><br>');
				$entries[$i]['fields']['body']['ja-JP']['content'][$key]['content'][0]['nodeType'] = 'text';
			endforeach;

			$i++;

		endforeach;
	endif;
endif;

if($export_media):

	$args = array(
			'post_type' => 'media'
		, 'posts_per_page' => -1
		, 'orderby'        => 'date'
		, 'order'          => 'ASC'
	);
	$posts = query_posts($args);
	if($posts):
		foreach($posts as $post):
			$entries[$i]['sys']['id'] = '';
			$entries[$i]['sys']['contentType'] = [];
			$entries[$i]['sys']['contentType']['sys'] = [];
			$entries[$i]['sys']['contentType']['sys']['type'] = 'Link';
			$entries[$i]['sys']['contentType']['sys']['linkType'] = 'ContentType';
			$entries[$i]['sys']['contentType']['sys']['id'] = 'media';

			$entries[$i]['fields']['title']['ja-JP'] = $post->post_title;
			$entries[$i]['fields']['slug']['ja-JP'] = urldecode($post->post_name);
			$entries[$i]['fields']['body']['ja-JP'] = genBody(preg_split('/&nbsp;/', $post->post_content));

			$entries[$i]['fields']['mediaName']['ja-JP'] = get_post_meta($post->ID, 'media_info_01', TRUE);
			$entries[$i]['fields']['mediaVolume']['ja-JP'] = get_post_meta($post->ID, 'media_info_02', TRUE);
			$entries[$i]['fields']['mediaType']['ja-JP'] = get_post_meta($post->ID, 'media_info_03', TRUE);
			$entries[$i]['fields']['youtubeVideoId']['ja-JP'] = get_post_meta($post->ID, 'media_info_04', TRUE);
			$entries[$i]['fields']['articleTitle']['ja-JP'] = get_post_meta($post->ID, 'media_info_06', TRUE);
			$entries[$i]['fields']['articleSubtitle']['ja-JP'] = get_post_meta($post->ID, 'media_info_07', TRUE);
			$entries[$i]['fields']['articleBody']['ja-JP'] = genBody(preg_split('/&nbsp;/', get_post_meta($post->ID, 'media_info_08', TRUE)));

			$entries[$i]['fields']['publishedDate']['ja-JP'] = get_the_date('', $post->ID);
			$entries[$i]['fields']['order']['ja-JP'] = ($i + 1);

			$i++;
			$titles[] = $post->post_title;
		endforeach;
	endif;
endif;

if($export_channel):

	$args = array(
			'post_type' => 'channel'
		, 'posts_per_page' => -1
		, 'orderby'        => 'date'
		, 'order'          => 'ASC'
	);
	$posts = query_posts($args);
	if($posts):
		foreach($posts as $post):
			$entries[$i]['sys']['id'] = '';
			$entries[$i]['sys']['contentType'] = [];
			$entries[$i]['sys']['contentType']['sys'] = [];
			$entries[$i]['sys']['contentType']['sys']['type'] = 'Link';
			$entries[$i]['sys']['contentType']['sys']['linkType'] = 'ContentType';
			$entries[$i]['sys']['contentType']['sys']['id'] = 'video';

			$entries[$i]['fields']['title']['ja-JP'] = $post->post_title;
			$entries[$i]['fields']['slug']['ja-JP'] = urldecode($post->post_name);
			$entries[$i]['fields']['body']['ja-JP'] = genBody(preg_split('/&nbsp;/', $post->post_content));
			$entries[$i]['fields']['youtubeVideoId']['ja-JP'] = get_post_meta($post->ID, 'video_info_00', TRUE);
			$entries[$i]['fields']['country']['ja-JP'] = get_post_meta($post->ID, 'video_info_03', TRUE);
			$entries[$i]['fields']['runningTime']['ja-JP'] = get_post_meta($post->ID, 'video_info_04', TRUE);
			$entries[$i]['fields']['releaseYear']['ja-JP'] = get_post_meta($post->ID, 'video_info_02', TRUE);

			$entries[$i]['fields']['publishedDate']['ja-JP'] = get_the_date('', $post->ID);
			$entries[$i]['fields']['order']['ja-JP'] = ($i + 1);

			$i++;
			$titles[] = $post->post_title;
		endforeach;
	endif;
endif;

if($export_events):
	$args = array(
			'post_type'      => 'events'
		, 'posts_per_page' => -1
		, 'orderby'        => 'date'
		, 'order'          => 'ASC'
	);
	$posts = query_posts($args);
	if($posts):
		foreach($posts as $post):
			$dates = get_the_terms( $post->ID, 'eventsdate');
			$year = 0;
			$year_term_id = 0;
			$month = 0;
			$month_term_id = 0;
			$day = 0;
			foreach($dates as $date){
				if($date->parent == 0){
					$year_term_id = $date->term_id;
				}
			}
			foreach($dates as $date){
				if($date->parent == $year_term_id){
					$month_term_id = $date->term_id;
				}
			}
			foreach($dates as $date){
				if($date->parent == $month_term_id){
					$year = intval(substr($date->slug, 0, 4));
					$month = intval(substr($date->slug, 4, 2));
					$day = intval(substr($date->slug, 6, 2));
				}
			}

			if(!is_numeric($year) || !is_numeric($month) || !is_numeric($day)){
				var_dump($post->post_title);
			}
			$date = $year.'-'.sprintf('%02d', $month).'-'.sprintf('%02d', $day);

			$entries[$i]['sys']['id'] = '';
			$entries[$i]['sys']['contentType'] = [];
			$entries[$i]['sys']['contentType']['sys'] = [];
			$entries[$i]['sys']['contentType']['sys']['type'] = 'Link';
			$entries[$i]['sys']['contentType']['sys']['linkType'] = 'ContentType';
			$entries[$i]['sys']['contentType']['sys']['id'] = 'event';

			$entries[$i]['fields']['title']['ja-JP'] = $post->post_title;
			$entries[$i]['fields']['slug']['ja-JP'] = urldecode($post->post_name);
			$entries[$i]['fields']['place']['ja-JP'] = get_post_meta($post->ID, 'events_info_01', TRUE);
			$entries[$i]['fields']['address']['ja-JP'] = get_post_meta($post->ID, 'events_info_02', TRUE);
			$entries[$i]['fields']['mapLink']['ja-JP'] = (strlen(get_post_meta($post->ID, 'events_info_03', TRUE)) > 255)
				? ''
				: get_post_meta($post->ID, 'events_info_03', TRUE);
			$entries[$i]['fields']['access']['ja-JP'] = strip_tags(get_post_meta($post->ID, 'events_info_04', TRUE), '<br />');
			$entries[$i]['fields']['startDate']['ja-JP'] = $year.'-'.sprintf('%02d', $month).'-'.sprintf('%02d', $day);
			$entries[$i]['fields']['schedule']['ja-JP'] = strip_tags(get_post_meta($post->ID, 'events_info_09', TRUE), '<br />');
			$entries[$i]['fields']['organizer']['ja-JP'] = strip_tags(get_post_meta($post->ID, 'events_info_14', TRUE), '<br />');
			$entries[$i]['fields']['fee']['ja-JP'] = strip_tags(get_post_meta($post->ID, 'events_info_13', TRUE), '<br />');
			$entries[$i]['fields']['notes']['ja-JP'] = strip_tags(get_post_meta($post->ID, 'events_info_06', TRUE), '<br />');
			$entries[$i]['fields']['publishedDate']['ja-JP'] = get_the_date('', $post->ID);

			$i++;
			$titles[] = $post->post_title;

		endforeach;
	endif;
endif;

if($export_news):

	$args = array(
			'post_type' => 'news'
		, 'posts_per_page' => 1
		, 'orderby'        => 'date'
		, 'order'          => 'ASC'
	);
	$posts = query_posts($args);
	if($posts):
		foreach($posts as $post):
			$entries[$i]['sys']['id'] = '';
			$entries[$i]['sys']['contentType'] = [];
			$entries[$i]['sys']['contentType']['sys'] = [];
			$entries[$i]['sys']['contentType']['sys']['type'] = 'Link';
			$entries[$i]['sys']['contentType']['sys']['linkType'] = 'ContentType';
			$entries[$i]['sys']['contentType']['sys']['id'] = 'news';
			$entries[$i]['sys']['contentType']['sys']['firstPublishedAt'] = get_the_date('', $post->ID);

			$entries[$i]['fields']['title']['ja-JP'] = $post->post_title;
			$entries[$i]['fields']['slug']['ja-JP'] = urldecode($post->post_name);

			$entries[$i]['fields']['body']['ja-JP'] = genBody(preg_split('/&nbsp;/', $post->post_content));
			$entries[$i]['fields']['publishedDate']['ja-JP'] = get_the_date('', $post->ID);

			$i++;
			$titles[] = $post->post_title;
		endforeach;
	endif;
endif;

function genBody($body)
{

	$arr = [];

	foreach($body as $key => $data):

		$arr['data'] = new kara;
		$arr['nodeType'] = 'document';
		$arr['content'][$key]['data'] = new kara;
		$arr['content'][$key]['nodeType'] = 'paragraph';

		$has_link = preg_match_all('/(.+?)<a href="(.+?)">(.+?)<\/a>(.+)/', $data, $matches);
		if($has_link)
		{

			$j = 0;
			$link = '';
			for($k=1; $k<count($matches); $k++)
			{

				if(strpos($matches[$k][0], 'http') === false)
				{
					if($link)
					{
						$arr['content'][$key]['content'][$j]['data']['uri'] = $link;
						$arr['content'][$key]['content'][$j]['nodeType'] = 'hyperlink';
						$arr['content'][$key]['content'][$j]['content'][0]['data'] = new kara;
						$arr['content'][$key]['content'][$j]['content'][0]['nodeType'] = 'text';
						$arr['content'][$key]['content'][$j]['content'][0]['marks'] = [];
						$arr['content'][$key]['content'][$j]['content'][0]['value'] = $matches[$k][0];

						$link = '';
					}
					else
					{
						$arr['content'][$key]['content'][$j]['data'] = new kara;
						$arr['content'][$key]['content'][$j]['nodeType'] = 'text';
						$arr['content'][$key]['content'][$j]['marks'] = [];
						$arr['content'][$key]['content'][$j]['value'] = $matches[$k][0];
					}
					$j++;
				}

				else
				{
					$link = $matches[$k][0];
				}
			}

		}

		else
		{
			$arr['content'][$key]['content'][0]['data'] = new kara;
			$arr['content'][$key]['content'][0]['marks'] = [];
			$arr['content'][$key]['content'][0]['value'] = strip_tags($data, '<a><img><br>');
			$arr['content'][$key]['content'][0]['nodeType'] = 'text';
		}

	endforeach;

	return $arr;

}




?>

<div class="copy" style="display: inline-block; padding: 8px; border: 1px solid;">COPY</div>
<div id="jsonData"></div>

<script>
	console.log('test', <? echo json_encode($test) ?>);
	console.log('entries', <? echo json_encode($entries) ?>);
	$('#jsonData').text(
		JSON.stringify(<? echo json_encode($entries) ?>)
			.replace(/\\r/g, '\r').replace(/\\n/g, '\n'));
	$('.copy').on('click', function(){
		onClickCopy();
	});

	function onClickCopy() {
		// コピー対象のpタグオブジェクトを取得する.
		let pTag = document.getElementById('jsonData');
		// コピー内容を選択する.
		let range = document.createRange();
		range.selectNodeContents(pTag);
		let selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		// 選択したものをコピーする.
		document.execCommand('copy');
		// コピー内容の選択を解除する.
		selection.removeAllRanges();
		alert('copied');
	}
</script>

<?php get_footer(); ?>