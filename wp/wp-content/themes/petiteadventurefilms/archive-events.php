<?php get_header();?>

<div class="single">

    <router-view
    ></router-view>
    <div class="clear"></div>

<!-- .single --></div>

<?php get_footer('vue'); ?>

<!-- #app --></div>

<?php wp_footer(); ?>
<script type="text/javascript" src="<?php echo get_template_directory_uri().'/dist/events.js?'.filemtime(get_stylesheet_directory().'/dist/pafshop.js'); ?>"></script>

</body>
</html>
