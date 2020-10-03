<?php
$disabled = is_page("confirm") ? " disabled" : "";
?>

<div class="p2_t">
<div class="form_contents required">
	<div class="form_title"><label>お問い合わせ種類</label></div>
	<div class="form_elements">
		<select name="contact_kind" id="contact_kind"<?php echo $disabled; ?>>
			<option value=""<?php echo (!$contact_kind) ? " selected" : ""; ?>>選択してください</option>
			<option value="1"<?php echo ($contact_kind == 1) ? " selected" : "";?>>映画について</option>
			<option value="2"<?php echo ($contact_kind == 2) ? " selected" : "";?>>イベントについて</option>
			<option value="3"<?php echo ($contact_kind == 3) ? " selected" : "";?>>監督について</option>
			<option value="4"<?php echo ($contact_kind == 4) ? " selected" : "";?>>自主上映について</option>
		</select>
	</div>
</div>
</div>

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
		<input type="email" name="contact_email" id="contact_email" placeholder="例) hoge@example.com" value="<?php echo ($contact_email) ? $contact_email : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
<div class="form_contents required" id="contact_email_confirm_form">
	<div class="form_title"><label for="contact_email_confirm">メールアドレス 確認用</label></div>
	<div class="form_elements">
		<input type="email" name="contact_email_confirm" id="contact_email_confirm" placeholder="例) hoge@example.com" onpaste="return false" value="<?php echo ($contact_email_confirm) ? $contact_email_confirm : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
</div>

<div class="p2_t">
<div class="form_contents required">
	<div class="form_title"><label for="contact_contents">問い合わせ内容</label></div>
	<div class="form_elements">
		<textarea name="contact_contents" id="contact_contents"<?php echo $disabled; ?>><?php echo ($contact_contents) ? $contact_contents : ""; ?></textarea>
	</div>
</div>
</div>