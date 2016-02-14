<?php
$disabled = is_page("confirm") ? " disabled" : "";
?>

<div class="form_contents required">
	<div class="form_title"><label for="contact_name">お名前</label></div>
	<div class="form_elements">
		<input type="text" name="contact_name" id="contact_name" value="<?php echo ($contact_name) ? $contact_name : ""; ?>" placeholder="例) 山田花子"<?php echo $disabled; ?> />
	</div>
</div>

<div class="p2_t">
<div class="form_contents required">
	<div class="form_title"><label for="contact_email">メールアドレス</label></div>
	<div class="form_elements">
		<input type="email" name="contact_email" id="contact_email" placeholder="例) abc@example.com" value="<?php echo ($contact_email) ? $contact_email : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
<div class="form_contents required" id="contact_email_confirm_form">
	<div class="form_title"><label for="contact_email_confirm">メールアドレス 再入力</label></div>
	<div class="form_elements">
		<input type="email" name="contact_email_confirm" id="contact_email_confirm" placeholder="例) abc@example.com" onpaste="return false" value="<?php echo ($contact_email_confirm) ? $contact_email_confirm : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
</div>

<div class="p2_t">
<div class="form_contents required">
	<div class="form_title"><label for="contact_contents">お問い合わせ内容</label></div>
	<div class="form_elements">
		<textarea name="contact_contents" id="contact_contents"<?php echo $disabled; ?>><?php echo ($contact_contents) ? $contact_contents : ""; ?></textarea>
	</div>
</div>
</div>