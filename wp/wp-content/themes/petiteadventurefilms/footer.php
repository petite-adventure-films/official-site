	<!--article--></article>
<?php if(!is_home()): ?>
<!--.container--></div>
<?php endif;?>

<footer id="site_footer">
	<div class="container">
	<div class="single">
	<div class="col col_9 last">
		<ul>
			<li><a href="<?php echo get_permalink(get_page_by_path("specified-commercial-transaction-law")); ?>">特定商取引法に基づく表記</a></li>
			<li><a href="<?php echo get_permalink(get_page_by_path("privacy-policy")); ?>">プライバシーポリシー</a></li>
			<li><a href="<?php echo get_permalink(get_page_by_path("gathering-the-personal-information")); ?>">個人情報の扱いについて</a></li>
		</ul>
		<p>Copyright © <?php echo date("Y"); ?> <?php echo get_bloginfo("site_name"); ?>. All rights reserved.</p>
	</div>
	</div>
	</div>
<!--footer--></footer>

<div id="additional">
	<div class="icon_btn" id="en_btn"><a href="<?php echo get_permalink(get_page_by_path("about-petite-adventure-films")); ?>">EN</a></div>
	<div class="icon_btn" id="twitter"><a href="https://twitter.com/brianandco?lang=ja" target="_blank"><span class="icon-twitter twitter"></span></a></div>
	<div class="icon_btn" id="facebook"><a href="https://www.facebook.com/Petite-Adventure-Films-156815051365447/" target="_blank"><span class="icon-facebook facebook"></span></a></div>
	<div class="icon_btn" id="go_top"><a href="#site_header"><span class="inline_block icon-keyboard-arrow-up"></span></a></div>
</div>

<?php wp_footer(); ?>
</body>
</html>