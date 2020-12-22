<?php get_header(); ?>

<?php
$args = array(
    'post_type'      => 'events'
    , 'posts_per_page' => -1
    , 'orderby'        => 'date'
    , 'order'          => 'DESC'
);
$posts = query_posts($args);
if($posts):
    foreach ($posts as $post):
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
        $date = $year.'/'.sprintf('%02d', $month).'/'.sprintf('%02d', $day);
        $post_number = get_post_number($post);
    
        add_post_meta($post->ID, 'events_info_15', $date);
        // add_post_meta($post->ID, 'events_info_17', $post_number);
    
    endforeach;
endif;

?>

 

<?php get_footer(); ?>