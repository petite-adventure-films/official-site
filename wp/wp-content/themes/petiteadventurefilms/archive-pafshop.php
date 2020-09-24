<?php
if(is_post_type_archive()){
    $post_type = get_post_type_object( get_query_var( 'post_type' ));
    $termLink = get_post_type_archive_link($post_type->name);
    $termName = $post_type->label;
}elseif(is_category() || is_tag() || is_tax()){
    $cat = get_the_category();
    $cat = $cat[0];
    $termLink = get_term_link($cat);
    $termName = $cat->name;
}
get_header('pafshop');?>

<div class="single">

    <?php
    $i = 1;
    $args = array(
        "post_type" => "pafshop",
        "posts_per_page" => -1
    );
    $posts = query_posts($args);
    if($posts): ?>
        <ul class="list_films">
        <?php foreach($posts as $post): ?>
            <li class="col col_3<?php ($i % 3) ? "" : " last"; ?>">
                <a href="<?php echo get_permalink($post->ID); ?>">
                <?php
                $poster_img = get_post_meta($post->ID, "product_info_03", TRUE);
                echo get_post_meta_img($poster_img, "large");
                ?>
                <p class="film_title"><?php echo $post->post_title; ?></p>
                </a>
            </li>
        <?php $i++; endforeach; ?>
        </ul>
    <?php endif; ?>
    <div class="last"></div>

</div>

<?php get_footer('scripts'); ?>

<script type="text/javascript">

var strgPafCartCount = JSON.parse(localStorage.getItem('pafCartCount')) || localStorage.setItem('pafCartCount', 0);

var app = new Vue({
    el: '#app'
    , data: {
        pafCartCount: strgPafCartCount || 0
    }
});
</script>

</body>
</html>
