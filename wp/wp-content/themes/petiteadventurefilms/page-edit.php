<?php get_header(); ?>

<?php
// $args = array(
//     'post_type'      => 'events'
//     , 'posts_per_page' => -1
//     , 'orderby'        => 'date'
//     , 'order'          => 'DESC'
// );
// $posts = query_posts($args);
// if($posts):
//     foreach ($posts as $post):
//         $dates = get_the_terms( $post->ID, 'eventsdate');
//         $year = 0;
//         $year_term_id = 0;
//         $month = 0;
//         $month_term_id = 0;
//         $day = 0;
//         foreach($dates as $date){
//             if($date->parent == 0){
//                 $year_term_id = $date->term_id;
//             }
//         }
//         foreach($dates as $date){
//             if($date->parent == $year_term_id){
//                 $month_term_id = $date->term_id;
//             }
//         }
//         foreach($dates as $date){
//             if($date->parent == $month_term_id){
//                 $year = intval(substr($date->slug, 0, 4));
//                 $month = intval(substr($date->slug, 4, 2));
//                 $day = intval(substr($date->slug, 6, 2));
//             }
//         }
    
//         if(!is_numeric($year) || !is_numeric($month) || !is_numeric($day)){
//             var_dump($post->post_title);
//         }
//         $date = $year.'/'.sprintf('%02d', $month).'/'.sprintf('%02d', $day);
//         // $post_number = get_post_number($post);
    
//         add_post_meta($post->ID, 'events_info_15', $date);
//         // add_post_meta($post->ID, 'events_info_17', $post_number);
    
//     endforeach;
// endif;

function set_ids($a)
{
    return $a->term_id;
}

$args = array(
    'post_type'      => 'channel'
    , 'posts_per_page' => -1
    , 'orderby'        => 'date'
    , 'order'          => 'DESC'
);
$posts = query_posts($args);
if($posts):
    foreach ($posts as $post):
    
        $post_type =  'videos';

        $insert_arg = array(
              'post_status'  => 'publish'
            , 'post_title'   => $post->post_title
            , 'post_content' => $post->post_content
            , 'post_date'    => $post->post_date
            , 'comment_status' => 'closed'
            , 'post_type'      => $post_type
        );
        $insert_id = wp_insert_post($insert_arg);
        
        add_post_meta($insert_id, 'video_info_00', get_post_meta($post->ID, 'video_info_00', TRUE));
        add_post_meta($insert_id, 'video_info_01', get_post_meta($post->ID, 'video_info_01', TRUE));
        add_post_meta($insert_id, 'video_info_02', get_post_meta($post->ID, 'video_info_02', TRUE));
        add_post_meta($insert_id, 'video_info_03', get_post_meta($post->ID, 'video_info_03', TRUE));
        add_post_meta($insert_id, 'video_info_04', get_post_meta($post->ID, 'video_info_04', TRUE));
        
        $tags = wp_get_post_terms($post->ID, 'post_tag');
        wp_set_object_terms($insert_id, array_map('set_ids', $tags), 'post_tag');
        
        $filmtags = wp_get_post_terms($post->ID, 'filmtags');
        wp_set_object_terms($insert_id, array_map('set_ids', $filmtags), 'filmtags');
        
        
    endforeach;
endif;
?>

 

<?php get_footer(); ?>