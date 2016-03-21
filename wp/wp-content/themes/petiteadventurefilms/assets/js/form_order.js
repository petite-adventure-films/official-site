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

			}

		},



		"email" : function(d){
			var ele;
			if(typeof(d) == "object") ele = $(this);
			else ele = $(d);
			var eleId = ele.attr("id");
			var msgId = eleId+"Msg";
			var msg = $("#"+msgId);
			var errorTypeMsg = "正しいメール形式ではありません 例)abc@example.com";
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
			var errorMsg = "メールアドレスが一致していません";
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

		"cstmOrderCheck" : function(d){

			var count = 0;
			$(".contact_film_kind").each(function(){
				var strRare = $(this).attr("Id").slice(-4);
				var strFront = $(this).attr("Id").slice(0, -4);
				if (strRare == "kind"){
					var target = $("#" + strFront + "unit");
				}else{
					var target = $("#" + strFront + "kind");
				}
				if($(this).val() && target.val()){
					count++;
				}
			});

			if(count > 0){
				$(".contact_film_kind").each(function(){
					jVal.cstmOrder($(self).attr("id"));
					console.debug($(self).attr("id"));
				});
			}else{
				jVal.errors = true
				$(".contact_film_kind").addClass("error");
				$(".contact_film_unit").addClass("error");
				$("#pick_dvd").removeClass("correct");
			}

		},

		"cstmOrder" : function(d){

			var ele;
			if(typeof(d) == "object") ele = $(this);
			else ele = $(d);
			var eleId = ele.attr("Id");

			var strRare = eleId.slice(-4);
			var strFront = eleId.slice(0, -4);
			if (strRare == "kind"){
				var target = $("#" + strFront + "unit");
			}else{
				var target = $("#" + strFront + "kind");
			}

			if(ele.val() && target.val()){
				$(".contact_film_kind").removeClass("error");
				$(".contact_film_unit").removeClass("error");
				$("#pick_dvd").addClass("correct");
			}else{
				jVal.errors = true
				$(ele).addClass("error");
				$(target).addClass("error");
				$("#pick_dvd").removeClass("correct");
			}

		},

		"cstmZip" : function(d){
			var ele;
			if(typeof(d) == "object") ele = $(this);
			else ele = $(d);
			var eleId = ele.attr("id");
			var msgId = eleId+"Msg";
			var msg = $("#"+msgId);
			var errorTypeMsg = "正しい形式ではありません 例) 1000005";
			var errorMsg = "郵便番号を入力してください";
			var patt = /^\d{3}-?\d{4}$/;
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
			jVal.cstmZip("#contact_zipcode");
			jVal.text("#contact_address1");
			jVal.text("#contact_address2");
			jVal.email("#contact_email");
			jVal.text("#contact_tel");
			jVal.emailConfirm("#contact_email_confirm");
			jVal.radio("input[name='contact_pay_way']");
			$(".contact_film_kind").each(function(){
				jVal.cstmOrder($(this));
			});
			$(".contact_film_unit").each(function(){
				jVal.cstmOrder($(this));
			});
			jVal.sendIt();
		});

		return false;

	});

	$("#contact_name").blur(jVal.text);
	$("#contact_zipcode").blur(jVal.cstmZip);
	$("#contact_address1").blur(jVal.text);
	$("#contact_address2").blur(jVal.text);
	$("#contact_tel").blur(jVal.text);
	$("#contact_email").blur(jVal.email);
	$("#contact_email_confirm").blur(jVal.emailConfirm);
	$(".contact_film_kind").blur(jVal.cstmOrder);
	$(".contact_film_unit").blur(jVal.cstmOrder);
	$("input[name='contact_pay_way']").blur(jVal.radio);

});