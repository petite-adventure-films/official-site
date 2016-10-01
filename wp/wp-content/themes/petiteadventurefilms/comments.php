<aside class="comments">

	<?php if(have_comments()): ?>
		<h3>コメント</h3>
		<ol class="comments_list">
			<?php  wp_list_comments(); ?>
		</ol>
	<?php endif; ?>

	<?php
	$commenter = wp_get_current_commenter();
	$req = get_option( 'require_name_email' );
	$aria_req = ( $req ? " aria-required='true'" : '' );
	$comments_args = array(
		'title_reply' => 'コメントする',
		'label_submit' => '投稿する',
		'comment_field' => '<p class="comment-form-comment">'
			.'<textarea id="comment" name="comment" aria-required="true">'
			.'</textarea></p>'
	);
	comment_form($comments_args);
	?>

</aside>