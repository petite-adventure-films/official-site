<?php
include (TEMPLATEPATH . '/_contact_post.php');
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

	<div class="m7_t">

		<p class="pink">* Required<br />
		<form method="post" name="form" enctype="multipart/form-data" action="<?php echo get_permalink(get_page_by_path("contact_en/confirm")); ?>" id="order" class="m1_t">
			<?php include (TEMPLATEPATH . "/_contact_en_form.php"); ?>
			<div class="form_btns m4_t"><div class="btn priority1"><input type="submit" id="send" value="Confirm" /></div></div>
		</form>

	</div>

</div>
</div>

<script type="text/javascript">

$(function(){

	//validation
	var jVal = {

		"text" : function(d){
			var ele;
			if(typeof(d) == "object") ele = $(this);
			else ele = $(d);
			var eleId = ele.attr("id");
			var msgId = eleId+"Msg";
			var msg = $("#"+msgId);
			//var errorMsg = ele.attr("data-error");
			if(ele.val()){
				msg.remove();
				ele.removeClass("error");
				ele.closest(".form_contents").addClass("correct");
			}else{
				jVal.errors = true;
				msg.remove();
				ele.addClass("error");
				ele.closest(".form_contents").removeClass("correct");
			}
		},

		"email" : function(d){
			var ele;
			if(typeof(d) == "object") ele = $(this);
			else ele = $(d);
			var eleId = ele.attr("id");
			var msgId = eleId+"Msg";
			var msg = $("#"+msgId);
			var errorTypeMsg = "A pattern is not right. ex) abc@example.com";
			//var errorMsg = "メールアドレスを入力してください";
			var patt = /^([a-zA-Z0-9])+([a-zA-Z0-9\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)*.([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$/;
			if(ele.val()){
				if(ele.val().match(patt)){
					msg.remove();
					ele.removeClass("error");
					ele.closest(".form_contents").addClass("correct");
				}else{
					jVal.errors = true;
					msg.remove();
					ele.addClass("error");
					ele.closest(".form_contents").removeClass("correct");
					ele.closest(".form_contents").find(".form_elements").after('<div id="'+msgId+'" class="form_err_msg">'+errorTypeMsg+'</div>');
				}
			}else{
				jVal.errors = true;
				msg.remove();
				ele.addClass("error");
				ele.closest(".form_contents").removeClass("correct");
			}
		},

		"emailConfirm" : function(d){
			var ele;
			if(typeof(d) == "object") ele = $(this);
			else ele = $(d);
			var eleId = ele.attr("id");
			var msgId = eleId+"Msg";
			var msg = $("#"+msgId);
			var errorMsg = "Entered-mail addresses do not match.";
			if(ele.val()){
				if(ele.val() == $("#contact_email").val()){
					msg.remove();
					ele.removeClass("error");
					ele.closest(".form_contents").addClass("correct");
				}else{
					jVal.errors = true;
					msg.remove();
					ele.addClass("error");
					ele.closest(".form_contents").removeClass("correct");
					ele.closest(".form_contents").find(".form_elements").after('<div id="'+msgId+'" class="form_err_msg">'+errorMsg+'</div>');
				}
			}else{
				jVal.errors = true;
				msg.remove();
				ele.addClass("error");
				ele.closest(".form_contents").removeClass("correct");
			}
		},

		"sendIt" : function (){
			if(!jVal.errors){
				$('form')[0].submit();
			}
		}
	};

	$('#send').click(function(){

		$("html, body").animate({ scrollTop: $('form').offset().top }, 200, function (){
			jVal.errors = false;
			jVal.text("#contact_name");
			jVal.email("#contact_email");
			jVal.emailConfirm("#contact_email_confirm");
			jVal.text("#contact_contents");
			jVal.sendIt();
		});

		return false;

	});

	$("#contact_name").blur(jVal.text);
	$("#contact_email").blur(jVal.email);
	$("#contact_email_confirm").blur(jVal.emailConfirm);
	$("#contact_contents").blur(jVal.text);

});

</script>

<?php get_footer(); ?>