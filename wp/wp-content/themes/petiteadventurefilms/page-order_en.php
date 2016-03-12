<?php
include (TEMPLATEPATH . '/_order_post.php');
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

		<p>Welcome to the online DVD Shop!<p>
		<p>To order, please fill in the form below. Within a few days, you will receive instructions on how to pay securely via PayPal.</p>

		<dl class="m2_t list_definition">
			<dt>DVD format</dt>
			<dd>DVD-R, Region 0 (free), NTSC/PAL available.</dd>
			<dt>DVD types</dt>
			<dd>For Home use/For Library use. Please choose "Library" if you purchase for group/library use.</dd>
		</dl>

		<p class="m2_t">Postage & packing prices</p>
		<p>Postage & packing prices are dependant on country and speed of delivery.</p>
		<dl class="list_definition">
			<dt>To Asia</dt>
			<dd>Registered JP ¥740 / Registered Express JP ¥900</dd>
			<dt>To North America/Europe</dt>
			<dd>Registered JP ¥810 / Registered Express JP ¥1,500</dd>
			<dt>To South America/Africa</dt>
			<dd>Registered JP ¥890 / Registered Express JP ¥1,700 </dd>
		</dl>

		<p class="m4_t pink">* Required</p>
		<form method="post" name="form" enctype="multipart/form-data" action="<?php echo get_permalink(get_page_by_path("order_en/confirm")); ?>" id="order" class="m1_t">
			<?php include (TEMPLATEPATH . "/_order_en_form.php"); ?>
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

		"radio" : function(d){
			var ele;
			if(typeof(d) == "object") ele = $(this);
			else ele = $(d);
			var eleId = ele.attr("name");
			var msgId = eleId+"Msg";
			var msg = $("#"+msgId);

			if($("input[name='"+eleId+"']:checked").length != 0){
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

		"select" : function(d){

			var ele;
			if(typeof(d) == "object") ele = $(this);
			else ele = $(d);
			var eleId = ele.attr("name");
			var msgId = eleId+"Msg";
			var msg = $("#"+msgId);

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
			var errorMsg = "メールアドレスを入力してください";
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

		"cstmOrder" : function(d){

			var ele;
			if(typeof(d) == "object") ele = $(this);
			else ele = $(d);
			var eleId = ele.attr("class");

			var count = 0;
			$(".contact_film_unit").each(function(){
				if($(this).val()) count++;
			});

			if(count > 0){
				$(".contact_film_unit").removeClass("error");
				$(".contact_film_kind").removeClass("error");
				$("#pick_dvd").addClass("correct");
			}else{
				jVal.errors = true
				$(".contact_film_unit").addClass("error");
				$(".contact_film_kind").addClass("error");
				$("#pick_dvd").removeClass("correct");
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
			jVal.text("#contact_address1");
			jVal.text("#contact_zipcode");
			jVal.text("#contact_country");
			jVal.text("#contact_tel");
			jVal.email("#contact_email");
			jVal.emailConfirm("#contact_email_confirm");
			jVal.select("#contact_shipping");
			jVal.cstmOrder(".contact_film_unit");
			jVal.sendIt();
		});

		return false;

	});

	$("#contact_name").blur(jVal.text);
	$("#contact_address1").blur(jVal.text);
	$("#contact_zipcode").blur(jVal.text);
	$("#contact_country").blur(jVal.text);
	$("#contact_tel").blur(jVal.text);
	$("#contact_email").blur(jVal.email);
	$("#contact_email_confirm").blur(jVal.emailConfirm);
	$("#contact_shipping").blur(jVal.select);
	$(".contact_film_unit").blur(jVal.cstmOrder);

});

</script>

<?php get_footer(); ?>