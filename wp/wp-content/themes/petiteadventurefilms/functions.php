<?php

//header cleaner
/*remove_action( 'wp_head', 'feed_links_extra');
remove_action( 'wp_head', 'feed_links');
remove_action( 'wp_head', 'rsd_link');
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'index_rel_link' );
remove_action( 'wp_head', 'parent_post_rel_link', 10);
remove_action( 'wp_head', 'start_post_rel_link', 10);
remove_action( 'wp_head', 'adjacent_posts_rel_link_wp_head', 10);
remove_action( 'wp_head', 'wp_generator');*/

add_action('rest_api_init', 'add_custom_fields_to_rest_films');
function add_custom_fields_to_rest_films(){
  register_rest_field(
    'films'
    , 'custom_fields'
    , [
          'get_callback'    => 'get_custom_fields_value_films'
        , 'update_callback' => null
        , 'schema'          => null
    ]
  );
}
function get_custom_fields_value_films(){
    global $post;
    
    $dvd_jacket_jp_front_attachment = wp_get_attachment_image_src(get_post_meta($post->ID, 'films_info_00', true), 'large');
    list($dvd_jacket_jp_front, $width, $height) = $dvd_jacket_jp_front_attachment;
    $dvd_jacket_jp_back_attachment = wp_get_attachment_image_src(get_post_meta($post->ID, 'films_info_31', true), 'large');
    list($dvd_jacket_jp_back, $width, $height) = $dvd_jacket_jp_back_attachment;
    
    $dvd_jacket_en_front_attachment = wp_get_attachment_image_src(get_post_meta($post->ID, 'films_info_23', true), 'large');
    list($dvd_jacket_en_front, $width, $height) = $dvd_jacket_en_front_attachment;
    $dvd_jacket_en_back_attachment = wp_get_attachment_image_src(get_post_meta($post->ID, 'films_info_33', true), 'large');
    list($dvd_jacket_en_back, $width, $height) = $dvd_jacket_en_back_attachment;
    
    $dvd_specials_attachment = wp_get_attachment_image_src(get_post_meta($post->ID, 'films_info_32', true), 'large');
    list($dvd_specials, $width, $height) = $dvd_specials_attachment;
    
    $prizes = get_post_meta($post->ID, 'films_info_07', FALSE);
    $genre = get_post_meta($post->ID, 'films_info_01', TRUE);
    $country = get_post_meta($post->ID, 'films_info_02', TRUE);
    $year = get_post_meta($post->ID, 'films_info_03', TRUE);
    $running_time = get_post_meta($post->ID, 'films_info_04', TRUE);
    $basic_info = array($genre, $country, $year, $running_time);
    $credits_indexs = get_post_meta_arr($post->ID, 'films_info_10');
    $credits_contents = get_post_meta_arr($post->ID, 'films_info_11');
    
    return [
          'dvd_jacket_jp_front' => $dvd_jacket_jp_front
        , 'dvd_jacket_jp_back' => $dvd_jacket_jp_back
        , 'dvd_jacket_en_front' => $dvd_jacket_en_front
        , 'dvd_jacket_en_back' => $dvd_jacket_en_back
        , 'dvd_specials' => $dvd_specials
        
        , 'prizes'              => $prizes
        , 'basic_info'          => $basic_info
        , 'credits_indexs'      => $credits_indexs
        , 'credits_contents'    => $credits_contents
    ];
}

add_action('rest_api_init', 'add_custom_fields_to_rest_pafshop');
function add_custom_fields_to_rest_pafshop(){
  register_rest_field(
    'pafshop'
    , 'custom_fields'
    , [
          'get_callback'    => 'get_custom_fields_value_pafshop'
        , 'update_callback' => null
        , 'schema'          => null
    ]
  );
}
function get_custom_fields_value_pafshop(){

    global $post;
    
    $price_indexs = get_post_meta_arr($post->ID, 'product_info_01');
    $price_contents = get_post_meta_arr($post->ID, 'product_info_02');
    
    $dvd_intro     = get_post_meta($post->ID, 'product_info_03', TRUE);
    $dvd_catch     = get_post_meta($post->ID, 'product_info_05', TRUE);
    $dvd_no_specials = get_post_meta($post->ID, 'product_info_06', TRUE);
    $dvd_contents = apply_filters('the_content', $post->post_content);
    $disc_indexs   = get_post_meta_arr($post->ID, "product_info_09");
    $disc_numbers  = get_post_meta_arr($post->ID, "product_info_10");
    $disc_types    = get_post_meta_arr($post->ID, "product_info_11");
    $disc_contents = get_post_meta($post->ID, "product_info_12", TRUE);
    
    $type_indexs   = get_post_meta_arr($post->ID, 'product_info_07');
    $type_contents = get_post_meta_arr($post->ID, 'product_info_08');
    
    return [
          'intro'       => $dvd_intro
        , 'contents'    => $dvd_contents
        , 'catch'       => strip_tags($dvd_catch, '<br>')
        , 'no_specials' => $dvd_no_specials
        , 'disc_indexs'     => $disc_indexs
        , 'disc_numbers'    => $disc_numbers
        , 'disc_types'      => $disc_types
        , 'disc_contents'   => $disc_contents
        , 'price_indexs'    => $price_indexs
        , 'price_contents'  => $price_contents
        , 'type_indexs'     => $type_indexs
        , 'type_contents'   => $type_contents
    ];
    
}

add_action('rest_api_init', 'add_custom_fields_to_rest_events');
function add_custom_fields_to_rest_events(){
  register_rest_field(
    'events'
    , 'custom_fields'
    , [
          'get_callback'    => 'get_custom_fields_value_events'
        , 'update_callback' => 'update_custom_fields_value_events'
        , 'schema'          => null
    ]
  );
}
function get_custom_fields_value_events(){
    global $post;
    
    $events_info_01 = get_post_meta($post->ID, 'events_info_01', TRUE);
    $events_info_02 = get_post_meta($post->ID, 'events_info_02', TRUE);
    $events_info_03 = get_post_meta($post->ID, 'events_info_03', TRUE);
    $events_info_04 = get_post_meta($post->ID, 'events_info_04', TRUE);
    $events_info_15 = get_post_meta($post->ID, 'events_info_15', TRUE);
    $events_info_16 = get_post_meta($post->ID, 'events_info_16', TRUE);
    $events_info_09 = get_post_meta($post->ID, 'events_info_09', TRUE);
    $events_info_14 = get_post_meta($post->ID, 'events_info_14', TRUE);
    $events_info_13 = get_post_meta($post->ID, 'events_info_13', TRUE);
    $events_info_06 = get_post_meta($post->ID, 'events_info_06', TRUE);
    $events_info_17 = get_post_meta($post->ID, 'events_info_17', TRUE);
    $events_info_18 = get_post_meta($post->ID, 'events_info_18', TRUE);
    
    return [
        'events_info_01' => $events_info_01
      , 'events_info_02' => $events_info_02
      , 'events_info_03' => $events_info_03
      , 'events_info_04' => $events_info_04
      , 'events_info_15' => $events_info_15
      , 'events_info_16' => $events_info_16
      , 'events_info_09' => $events_info_09
      , 'events_info_14' => $events_info_14
      , 'events_info_13' => $events_info_13
      , 'events_info_06' => $events_info_06
      , 'events_info_17' => $events_info_17
      , 'events_info_18' => $events_info_18
      
  ];
}
add_filter( 'rest_events_query', function($args){
    
    // 年別
    if($_GET['year'])
    {
        $args['meta_query'] = array(
            'relation' => 'AND'
            , array(
                'key'   => 'events_info_15',
                'value' => esc_sql( $_GET['year'] ).'/01/01',
                'compare' => '>=',
                'type' => 'DATE'
            )
            , array(
                'key'   => 'events_info_15',
                'value' => esc_sql( $_GET['year'] ).'/12/31',
                'compare' => '<=',
                'type' => 'DATE'
            )
        );
    }
    
    return $args;
} );

// イベント番号取得api
function add_rest_original_endpoint(){
    register_rest_route( 'wp/custom', '/get_event_number', array(
        'methods' => 'GET',
        'callback' => 'get_event_number',
    ));
}
add_action('rest_api_init', 'add_rest_original_endpoint');
function get_event_number()
{
    $query = new WP_Query(['post_type' => 'events', 'p' => $_GET['pageID']]);
    return get_post_number($query->posts[0]);
}
  
  
add_filter( 'widget_categories_args', 'exclude_widget_categories');


//sidebar activate
if(function_exists("register_sidebar")){
    register_sidebar();
}
//特定カテゴリを除外
function exclude_widget_categories( $args){
    $exclude = '1';
    $args['exclude'] = $exclude;
    return $args;
}

//スマートフォンキャリア判別
function is_smartphone(){
    $useragents_s = array(
        'iPhone',		 // Apple iPhone
        'iPod',			 // Apple iPod touch
        'Android',		// 1.5+ Android
        'dream',			// Pre 1.5 Android
        'CUPCAKE',		// 1.5+ Android
        'blackberry9500', // Storm
        'blackberry9530', // Storm
        'blackberry9520', // Storm v2
        'blackberry9550', // Storm v2
        'blackberry9800', // Torch
        'webOS',			// Palm Pre Experimental
        'incognito',		// Other iPhone browser
        'webmate'		 // Other iPhone browser
    );
    $pattern_s = '/'.implode('|', $useragents_s).'/i';
    return preg_match($pattern_s, $_SERVER['HTTP_USER_AGENT']);
}

function IEbrowserVer(){
    $ver = "";
    $agent = getenv( "HTTP_USER_AGENT" );

    if(strstr($agent,"MSIE")){
        $ver .= "msie ";
        if(strstr($agent, "MSIE 6.0")) $ver .= "ie6";
        if(strstr($agent, "MSIE 7.0")) $ver .= "ie7";
        if(strstr($agent, "MSIE 8.0")) $ver .= "ie8";
        if(strstr($agent, "MSIE 9.0")) $ver .= "ie9";
    }
    return $ver;
}

function get_post_meta_arr($post, $meta){

    global $wpdb;
    $query = "SELECT meta_id, post_id,meta_key,meta_value FROM $wpdb->postmeta WHERE post_id = $post ORDER BY meta_id ASC";
    $cf = $wpdb->get_results($query, ARRAY_A);
    foreach( $cf as $row ){
        if($row['meta_key'] == $meta){
            if(!empty($row['meta_value'])) $vars[] = $row['meta_value'];
        }
    }
    return $vars;

}

function get_post_meta_img($attached, $size="medium", $class=NULL, $data_src=NULL){

    $image = wp_get_attachment_image_src($attached, $size);
    list($src, $width, $height) = $image;
    $attrs = array(
        "src" => $src,
        "width" => $width,
        "height" => $height,
        "id" => $id,
        "class" => $class,
        "alt" => $alt
    );
    if($data_src) $attrs["data-src"] = $src;
    if($src){
        $html = "<img";
        foreach($attrs as $key=>$value){
            if($value) $html .= ' '.$key.'="'.$value.'"';
        }
        $html .= " />";
    }
    return ($html) ? $html : FALSE;

}

function get_post_meta_img_arr($post, $meta, $size){

    global $wpdb;
    $query = "SELECT meta_id, post_id,meta_key,meta_value FROM $wpdb->postmeta WHERE post_id = $post ORDER BY meta_id ASC";
    $cf = $wpdb->get_results($query, ARRAY_A);
    foreach($cf as $row){
        if($row['meta_key'] == $meta){
            $html[] = get_post_meta_img($post, $meta, $size);
        }
    }
    if($html){
        $html = array_filter($html, "strlen");
        $html = array_values($html);
    }
    return ($html) ? $html : FALSE;

}

function get_film($term, $index=NULL){

    if($term){
        $args = array(
            "post_type" => "films",
            "filmtags" => $term[0]->slug
        );
        $films = query_posts($args);
        if($films){
            foreach($films as $film){
                switch ($index) {
                    case "label":
                        $value = get_the_title($film->ID);
                        break;
                    case "link":
                        $value = get_permalink($film->ID);
                        break;
                    default:
                        break;
                }
            }
        }else{
            switch ($index){
                case "label":
                    $value = $term[0]->name;
                    break;
                case "link":
                    $value = NULL;
                    break;
                default:
                    break;
            }
        }
        return $value;
    }else{
        return false;
    }

}

function get_news($post){

    $title = $post->post_title;
    $contents = apply_filters("the_content", $post->post_content);

    $filmtags = get_the_terms($post->ID, "filmtags");
    if (!empty($eventtfilmtagsags)){
        $film_label = get_film($filmtags, "label");
        $film_link = get_film($filmtags, "link");
        if($film_label){
            $film_info = '<li class="index film">';
            if($film_link){
                $film_info .= '<a href="'.$film_link.'">'.$film_label.'</a>';
            }else{
                $film_info .= $film_label;
            }
            $film_info .= '</li>';
        }
    }

    $eventtags = get_the_terms($post->ID, "eventtags");
    if (!empty($eventtags)){
        $event_info = '<li class="index label">';
        foreach($eventtags as $event){
            $event_info .= $event->name;
        }
        $event_info .= '</li>';
    }

    if(!empty($film_info) || !empty($event_info)){
        $list_post_info = '<ul class="list_post_info">';
        $list_post_info .= $film_info.$event_info;
        $list_post_info .= '</ul>';
    }

    $time = '<time  datetime="'.get_the_date("Y-m-d h:i:s A", $post->ID).'" class="list_post_time">'.get_the_date("", $post->ID).'</time>';

    $html .= <<<EOF
    <h2 class="title">{$title}</h2>
    {$list_post_info}
    <div class="list_post_contents">
    {$contents}
    </div>
    {$time}
EOF;
    wp_reset_query();
    return $html;

}

function get_post_link($post){

    $title = $post->post_title;
    $link = get_permalink($post->ID);

    $html .= <<<EOF
        <h2>{$title}</h2>
        <div class="list_post_contents">
        </div>
        {$time}
EOF;
    wp_reset_query();
    return $html;

}

function get_blogs($post){

    $title = $post->post_title;
    $link = get_permalink($post->ID);
    $contents = strip_tags($post->post_content);
    $count = mb_strlen($contents);
    $edited_contents = ($count > 100) ? mb_substr($contents, 0, 100) : $contents;
    $abbr = $count > 100 ? "..." : "";
    $time = '<time  datetime="'.get_the_date("Y-m-d h:i:s A", $post->ID).'" class="list_post_time">'.get_the_date("", $post->ID).'</time>';

    $html .= <<<EOF
        <h2 class="title">{$title}</h2>
        <div class="list_post_contents">
            {$edited_contents}{$abbr}<a href="{$link}" class="more_details">もっと見る</a>
        </div>
        {$time}
EOF;
    wp_reset_query();
    return $html;

}

function get_products(){

    $film_query = new WP_Query(['post_type' => 'films', 'orderby'=>'ID','order'=>'ASC']);
    $shop_query = new WP_Query(['post_type' => 'pafshop', 'orderby'=>'ID','order'=>'ASC']);
    
    $products = [];
    $terms = get_terms('filmtags', ['orderby'=>'term_id','order'=>'ASC']);
    
    foreach($terms as $key => $term)
    {
    
        $products[$key]['prod_key'] = $term->term_id;
    
        foreach($film_query->posts as $film)
        {
            $tags = get_the_terms($film, 'filmtags');
            $tag_id = $tags[0]->term_id;
            if($term->term_id == $tag_id)
            {
                $products[$key]['basic_info'] = $film;
            }
        }
        
        foreach($shop_query->posts as $shop)
        {
            $tags = get_the_terms($shop, 'filmtags');
            $tag_id = $tags[0]->term_id;
            if($term->term_id == $tag_id)
            {
    
                $price_indexs = get_post_meta_arr($shop->ID, 'product_info_01');
                $price_contents = get_post_meta_arr($shop->ID, 'product_info_02');
                foreach($price_indexs as $key2 => $index)
                {
                    $products[$key]['price_info'][$key2]['index'] = $index;
                    $products[$key]['price_info'][$key2]['amount'] = $price_contents[$key2];
                }
    
    
            }
        }
        
    }

    return $products;
}

function get_post_number($post) {
    global $wpdb;
    $number = $wpdb->get_var("
        SELECT COUNT( * )
        FROM $wpdb->posts
        WHERE post_date <= '{$post->post_date}'
        AND post_status = 'publish'
        AND post_type = ('{$post->post_type}')
    ");
    return $number;
}


function set_body_class(){
    $uri = $_SERVER["REQUEST_URI"];
    $args = explode("/", $uri);
    $args = array_filter($args, "strlen");
    if(($key = array_search("wp", $args)) !== false){
        unset($args[$key]);
    }
    $args = array_values($args);
    return ($args[0]) ? $args[0] : "home";
    //return ($args[0] != "wp") ? $args[1] : "home";
}

function add_alternate_link() {

    $show_off = false;
    $alternate_jp = null;
    $alternate_en = null;

    if( is_home() || is_front_page() ) {
        $alternate_jp = home_url();
    } elseif ( is_category() ) {
        $alternate_jp = get_category_link( get_query_var('cat') );
    }else if(is_post_type_archive()){
        $post_type = get_post_type_object( get_query_var( "post_type" ));
        $alternate_jp = get_post_type_archive_link($post_type->name);
    } elseif ( is_page() || is_single()){
        $show_off = true;
        //監督プロフィールとブログアーカイブは表示
        $page_name = get_query_var('pagename');
        if($page_name == "director" || $page_name == "blog"){
            $show_off = false;
            $alternate_jp = get_permalink($post);
        }
        // 各映画ページは表示
        $post_type = get_post_type_object( get_query_var( "post_type" ));
        if($post_type->name == "films"){
            $show_off = false;
            $alternate_jp = get_permalink($post);
        }
    } else{
        $alternate_jp = home_url();
    }
    $alternate_en = str_replace("//www","//en",$alternate_jp);

    if(!$show_off){
        echo '<link rel="alternate" href="'.$alternate_jp.'" hreflang="ja" />'."\n";
        echo '<link rel="alternate" href="'.$alternate_en.'" hreflang="en" />'."\n";
    }

}

function get_available_events($id){
    //配列宣言
    $available_posts = array();
    //現在時刻取得
    $now = new DateTime();
    $current_timestamp = $now->getTimestamp();
    //期間内のポスト取得
    $filmtag = get_the_terms($id, "filmtags");
    $args = array(
        "post_type" => "events",
        "posts_per_type" => -1,
        "filmtags" => $filmtag[0]->slug
    );
    $events = query_posts($args);
    if($events){
        foreach($events as $event){
            $eventsdate = get_the_terms($event, "eventsdate");
            $event_date_timestamp = get_event_timestamp($eventsdate);
            if($current_timestamp < $event_date_timestamp){
                $available_posts[] = $event;
            }
        }
    }
    return $available_posts;
}

function future_events($term){
    //var_dump($term);
    $term_date = strtotime($term);
    $args = array(
        "orderby" => "name",
        "order" => "DESC"
    );
    $eventsdates = get_terms("eventsdate", $args);
    foreach($eventsdates as $date){
        $post_date = strtotime($date->slug);
        if($post_date >= $term_date){
            $future[] = $date->slug;
        }
    }
    return $future;
}

function get_event_info($post){
    $eventtags = get_the_terms($post->ID, "eventtags");
    if($eventtags){
        $eventtags_count = count($eventtags);
        $count = 0;
        $event_info = '<span class="inline_block index label">';
        foreach($eventtags as $event){
            $count++;
            $event_info .= $event->name;
            if($count != $eventtags_count) $event_info .= ",";
        }
        $event_info .= '</span>';
    }else{
        $event_info = NULL;
    }
    if($event_info){
        $list_post_info =  ($event_info) ? '<li>'.$event_info.'</li>' : "";
    }else{
        $list_post_info = NULL;
    }
    return $list_post_info;
}

function get_place_info($post){
    $place = get_post_meta($post->ID, "events_info_01", TRUE);
    if($place){
        $place_list = '<li class="index place">';
        if($map){
            $place_list .= $place;
            $place_list .= '<span class="block">'.$address.'  <a href="'.$map.'" target="_blank">Map</a></span>';
        }else{
            $place_list .= $place;
            $place_list .= '<span class="block">'.$address.'</span>';
        }
        $place_list .= '</li>';
    }else{
        $place_list = NULL;
    }
    return $place_list;
}

function get_event_timestamp($terms){
    //yearpost_number
    foreach ($terms as $v){
        if ($v -> parent === 0){
            $year_id = $v->term_id;
            $date = $v->slug;
        }
    }
    foreach ($terms as $v){
        if($year_id === $v-> parent){
            $month_id = $v->term_id;
            $date = $v->slug;
        }
    }
    foreach ($terms as $v){
        if($month_id === $v -> parent){
            $date = $v->slug;
        }
    }
    return strtotime($date);
}

function get_date_info($post){
    $dates_details = get_post_meta($post->ID, "events_info_09", TRUE);
    $dates_details = explode("<br />", $dates_details);
    if($dates_details) $dates = '<li class="index date">'.$dates_details[0].'</li>';
    else $dates = NULL;
    return $dates;
}

function get_events($date, $init=FALSE){
    if($init){
        $init_args = array(
            "tax_query" => array(
                array(
                    "taxonomy" => "eventsdate",
                    "field" => "slug",
                    "terms" => future_events($date)
                )
            )
        );
    }else{
        $init_args = array("eventsdate" => $date);
    }
    $args = array(
        "post_type" => "events",
        "posts_per_page" => -1,
    );
    $posts = query_posts(array_merge($args, $init_args));
    $timestamps = array();
    foreach($posts as $post){
        $eventsdate = get_the_terms($post, "eventsdate");
        $event_date_timestamp = get_event_timestamp($eventsdate);
        $timestamps[$event_date_timestamp] = $post->ID;
    }
    ksort($timestamps);
    $timestamps = array_reverse($timestamps);

    foreach($timestamps as $timestamp){
        foreach($posts as $post){
            if($timestamp == $post->ID) $sort_posts[] = $post;
        }
    }


    if($sort_posts){
    $html = '<ul class="list_posts list_events">';
        foreach($sort_posts as $post){
            $post_number = get_post_number($post);
            $post_title = get_the_title($post->ID);
            $event_info = get_event_info($post);
            $place_info = get_place_info($post);
            $date_info = get_date_info($post);
            $permalink = get_permalink($post->ID);
            $html .= <<<EOF
    <li>
        <a href="{$permalink}">
            <h2 class="title"><span class="block caption2">No.{$post_number}</span>{$post_title}</h2>
            <ul class="list_post_info">
                {$place_info}
                {$date_info}
                {$event_info}
            </ul>
        </a>
    </li>
EOF;
        }
    $html .= "</ul>";

    }else{
        $html = <<<EOF
        <div class="m4_t">
            <p> ただ今、予定の上映会・イベントがありません。</p>
        </div>
EOF;
    }

    wp_reset_query();
    return $html;

}

function cms_title($post_type, $submitdate, $lng){

    date_default_timezone_set('Asia/Tokyo');
    $today = getdate();
    $todayposts = query_posts(
        array(
            "posts_per_page" => -1,
            "post_type" => $post_type,
            "post_status" => array("pending", "publish", "draft"),
            "year" => $today["year"],
            "monthnum" => $today["mon"],
            "day" => $today["mday"]
        )
    );

    //post_type判別
    if($post_type == "contactform"){
        $typeid = "C";
    }elseif($post_type == "dvdorder"){
        $typeid = "O";
    }

    //ユーザーエージェント
    $agent = getenv("HTTP_USER_AGENT");
    if(is_smartphone()){
        $ua = "-SP";
    }else{
        $brow = IEbrowserVer();
        if($brow == "msie ie6" || $brow == "msie ie7" || $brow == "msie ie8") $ua = "-LE";
        else $ua = "-PC";
    }

    $postcount = count($todayposts) + 1;
    $postcount = sprintf("%03d", $postcount);
    $cmstitle = $typeid.$today["year"].$ua."-".$lng."-".$submitdate.$postcount;
    return $cmstitle;

}

function mail_header($from = NULL){
    $headers .= "X-Mailer: myphpMail".phpversion()."\n";
    if($from){
        $headers .= "From: ".$from."\r\n";
        $headers .= "Reply-To: ".$from."\r\n";
        $headers .= "Return-Path: ".$from."\r\n";
    }
    return $headers;
}

function mail_footer(){
    $mail_footer = '

*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*

Petite Adventure Films（プチ・アドベンチャー・フィルムズ）
E-mail info@petiteadventurefilms.com
TEL 080-4146-3404（早川由美子）
Web https://www.petiteadventurefilms.com

';

return $mail_footer;
}

/* お問い合わせフォーム
*****************************************************************************************/

function order_ntfct($email, $values){
    $subject = "【PAF DVD注文 : ".$values['contact_lang']."】".$values['contact_name']."様";
    $message = $values['contact_name'].'様

ご注文をいただき誠にありがとうございます。
ご注文いただきました内容は下記の通りです。ご確認ください。';
$message .= '

------------

DVD 注文内容

●インド日記 〜ガジュマルの木の女たち〜
My Indian Diary - The Women of the Banyan Tree
種別 : '.$values['contact_film7_kind'].'
個数 : '.$values['contact_film7_unit'].'

●踊る善福寺/ホームレスごっこ
Dancing Zempukuji/The Apprentice Homeless
種別 : '.$values['contact_film1_kind'].'
個数 : '.$values['contact_film1_unit'].'

●木田さんと原発、そして日本（日本語版）
種別 : '.$values['contact_film2_kind'].'
個数 : '.$values['contact_film2_unit'].'

●木田さんと原発、そして日本（英語字幕版）
A Woman From Fukushima
種別 : '.$values['contact_film3_kind'].'
個数 : '.$values['contact_film3_unit'].'

●乙女ハウス
Otome House
種別 : '.$values['contact_film4_kind'].'
個数 : '.$values['contact_film4_unit'].'

●さようならUR
Goodbye UR - The Japanese Social Housing Crisis
種別 : '.$values['contact_film5_kind'].'
個数 : '.$values['contact_film5_unit'].'

●ブライアンと仲間たち
Brian & Co. Parliament Square SW1
種別 : '.$values['contact_film6_kind'].'
個数 : '.$values['contact_film6_unit'].'

------------

Shipping

'.$values['contact_shipping'].'

------------

支払い方法

'.$values['contact_pay_way'].'

------------

届け先

'.$values['contact_country'].'
'.$values['contact_zipcode'].'
'.$values['contact_address1'].'
'.$values['contact_address2'].'

------------

電話番号

'.$values['contact_tel'].'

------------

領収書

'.$values['contact_receipt'].'
'.$values['contact_receipt_name'].'
'.$values['contact_receipt_proviso'].'

------------

Comments

'.$values['contact_contents'].'

------------';

$message .= '

受付番号: '.$values['contact_id'].'

担当者より後ほどご連絡をさせていただきます。
この度はご注文誠にありがとうございました。

'.
mail_footer();

    //mail($email, $subject, $message, mail_header());
    wp_mail(get_bloginfo("admin_email"), $subject, $message, mail_header($email));
    wp_mail("petiteadventurefilms@gmail.com", $subject, $message, mail_header($email));

}


/* 
 * 注文内容
*/


function order_ntfct2($data){
    $subject = '【プチ・アドベンチャー・フィルムズ】ご注文内容の確認';

    $message .= <<<EOF
{$data['name']}様

このたびはご注文をいただき、誠にありがとうございます。
下記のとおりご注文を承りましたので、内容に間違いがないかご確認ください。

--------------------------------------

■ご注文内容

EOF;
    foreach($data['order'] as $order)
    {
        $message .= <<<EOF
{$order}

EOF;
    }

    $message .= <<<EOF

■お買上金額
商品金額合計: {$data['subtotal']}
送料: {$data['deliveryFee']}
注文金額合計: {$data['total']}
※すべて税込

■お支払い方法
{$data['_paymentMethod']}

EOF;

    if($data['_paymentMethod'] == '銀行振込')
    {
        $message .= <<<EOF

■お振込先情報

※下記の3つよりお選びください。
お振り込み後、ご一報下さればありがたいです。

三菱UFJ銀行
麹町支店（616）普通口座
口座番号 5171182
名義 ハヤカワユミコ

ゆうちょ銀行
記号 10080
番号 65073181
名義 ハヤカワユミコ

PayPay銀行
はやぶさ支店（003）普通口座
口座番号 4744953
名義 ハヤカワユミコ

EOF;
    }
    $message .= <<<EOF

■領収書

EOF;

    if($data['receipt'])
    {
        $message .= <<<EOF
必要
お宛名: {$data['receiptName']}
但し書き: {$data['receiptDescription']}
EOF;
    }
    else
    {
        $message .= '不要';
    }

    $message .= <<<EOF


■お届け先
〒{$data['zipcode']}
{$data['prefecture']}{$data['city']}{$data['address1']}
{$data['address2']}
{$data['tel']}
{$data['email']}

受付番号: {$data['orderID']}

------------------------------------

商品は原則として、お支払い確認後、3～5日以内に発送します。
季節・天候等による道路事情のため、お届けが遅れる場合があります。

※このメールは自動返信システムにより送信されています。
※このメールへの返信は受け付けておりません。お問合せ・ご連絡は下記までお願いします。

EOF;
    
    $message .= mail_footer();

    wp_mail($data['email'], $subject, $message, mail_header());
    wp_mail(get_bloginfo("admin_email"), $subject, $message, mail_header());
    wp_mail("petiteadventurefilms@gmail.com", $subject, $message, mail_header($email));

}





function contact_ntfct($email, $values){
    $subject = "【PAF お問い合わせ : ".$values['contact_lang']."】".$values['contact_name']."様";
    $message = $values['contact_name'].'様

お問合せをいただき誠にありがとうございます。
お問合せいただきました内容は下記の通りです。ご確認ください。';
$message .= '

------------

お問い合わせ内容

'.$values['contact_contents'];
$message .= '

------------';

$message .= '

受付番号: '.$values['contact_id'].'

担当者より後ほどご連絡をさせていただきます。
この度はお問合わせいただき誠にありがとうございました。

'.
mail_footer();

    //mail($email, $subject, $message, mail_header());
    wp_mail(get_bloginfo("admin_email"), $subject, $message, mail_header($email));
    wp_mail("petiteadventurefilms@gmail.com", $subject, $message, mail_header($email));

}?>