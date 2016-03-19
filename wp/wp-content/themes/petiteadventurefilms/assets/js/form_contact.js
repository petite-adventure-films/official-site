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
			var errorTypeMsg = "正しいメール形式ではありません 例) abc@example.com";
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