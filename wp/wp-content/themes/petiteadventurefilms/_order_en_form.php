<?php
$disabled = is_page("confirm") ? " disabled" : "";
?>

<div class="form_contents required">
	<div class="form_title"><label for="contact_name">Name</label></div>
	<ul class="form_elements">
		<li><input type="text" name="contact_name" id="contact_name" value="<?php echo ($contact_name) ? $contact_name : ""; ?>" placeholder="ex) Yamada Hanako"<?php echo $disabled; ?> /></li>
	</ul>
</div>

<div class="p2_t">
<div class="form_contents required">
	<div class="form_title"><label for="contact_address1">Address</label></div>
	<div class="form_elements">
		<input type="text" name="contact_address1" id="contact_address1" placeholder="ex) Marunochi , Chiyoda-ku, Tokyo" value="<?php echo ($contact_address1) ? $contact_address1 : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
<div class="form_contents required">
	<div class="form_title"><label for="contact_zipcode">Post code</label></div>
	<div class="form_elements">
		<input type="text" name="contact_zipcode" id="contact_zipcode" placeholder="ex) 100-0005" value="<?php echo ($contact_zipcode) ? $contact_zipcode : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
<div class="form_contents required">
	<div class="form_title"><label for="contact_country">Country</label></div>
	<div class="form_elements">
		<input type="text" name="contact_country" id="contact_country" placeholder="ex) Japan" value="<?php echo ($contact_country) ? $contact_country : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
</div>

<div class="p2_t">
<div class="form_contents required">
	<div class="form_title"><label for="contact_tel">Telephone</label></div>
	<div class="form_elements">
		<input type="text" name="contact_tel" id="contact_tel" placeholder="ex) 08012345678" value="<?php echo ($contact_tel) ? $contact_tel : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
</div>

<div class="p2_t">
<div class="form_contents required">
	<div class="form_title"><label for="contact_email">E-mail</label></div>
	<div class="form_elements">
		<input type="email" name="contact_email" id="contact_email" placeholder="abc@example.com" value="<?php echo ($contact_email) ? $contact_email : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
<div class="form_contents required" id="contact_email_confirm_form">
	<div class="form_title"><label for="contact_email_confirm">Retype e-mail</label></div>
	<div class="form_elements">
		<input type="email" name="contact_email_confirm" id="contact_email_confirm" placeholder="abc@example.com" onpaste="return false" value="<?php echo ($contact_email_confirm) ? $contact_email_confirm : ""; ?>"<?php echo $disabled; ?> />
	</div>
</div>
</div>

<div class="p2_t">
<div class="form_contents required">
	<div class="form_title">
		<label>Shipping</label>
	</div>
	<div class="form_elements">
		<select name="contact_shipping" class="contact_shipping" id="contact_shipping"<?php echo $disabled; ?>>
			<option value=""<?php echo (!$contact_shipping) ? " selected" : ""; ?>>-</option>
			<option value="1"<?php echo ($contact_shipping == 1) ? " selected" : ""; ?>>Registered</option>
			<option value="2"<?php echo ($contact_shipping == 2) ? " selected" : "";?>>Registered Express</option>
		</select>
	</div>
</div>
</div>

<div class="p2_t">
<div class="form_contents required" id="pick_dvd">
	<div class="form_title">
		<label>Film</label>
	</div>
	<ul class="form_elements">
		<li>
			<p class="bold">Dancing Zempukuji/The Apprentice Homeless</p>
			<p>For Home: JP ¥1,500 / For Library: JP ¥10,000</p>
			<label for="contact_film1_kind">Type</label>
			<select name="contact_film1_kind" class="contact_film_kind" id="contact_film1_kind"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film1_kind) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film1_kind == 1) ? " selected" : ""; ?>>Home</option>
				<option value="2"<?php echo ($contact_film1_kind == 2) ? " selected" : "";?>>Library</option>
			</select>
			<label for="contact_film1_unit">No</label>
			<select name="contact_film1_unit" class="contact_film_unit" id="contact_film1_unit"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film1_unit) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film1_unit == 1) ? " selected" : "";?>>1</option>
				<option value="2"<?php echo ($contact_film1_unit == 2) ? " selected" : "";?>>2</option>
				<option value="3"<?php echo ($contact_film1_unit == 3) ? " selected" : "";?>>3</option>
				<option value="4"<?php echo ($contact_film1_unit == 4) ? " selected" : "";?>>4</option>
				<option value="5"<?php echo ($contact_film1_unit == 5) ? " selected" : "";?>>5</option>
				<option value="6"<?php echo ($contact_film1_unit == 6) ? " selected" : "";?>>6</option>
				<option value="7"<?php echo ($contact_film1_unit == 7) ? " selected" : "";?>>7</option>
				<option value="8"<?php echo ($contact_film1_unit == 8) ? " selected" : "";?>>8</option>
				<option value="9"<?php echo ($contact_film1_unit == 9) ? " selected" : "";?>>9</option>
				<option value="10"<?php echo ($contact_film1_unit == 10) ? " selected" : "";?>>10</option>
			</select>

		</li>
		<li>
			<p class="bold">A Woman From Fukushima</p>
			<p>For Home: JP ¥1,000 / For Library: JP ¥10,000</p>
			<label for="contact_film3_kind">Type</label>
			<select name="contact_film3_kind" class="contact_film_kind" id="contact_film3_kind"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film3_kind) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film3_kind == 1) ? " selected" : ""; ?>>Home</option>
				<option value="2"<?php echo ($contact_film3_kind == 2) ? " selected" : "";?>>Library</option>
			</select>
			<label for="contact_film3_unit">No</label>
			<select name="contact_film3_unit" class="contact_film_unit" id="contact_film3_unit"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film3_unit) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film3_unit == 1) ? " selected" : "";?>>1</option>
				<option value="2"<?php echo ($contact_film3_unit == 2) ? " selected" : "";?>>2</option>
				<option value="3"<?php echo ($contact_film3_unit == 3) ? " selected" : "";?>>3</option>
				<option value="4"<?php echo ($contact_film3_unit == 4) ? " selected" : "";?>>4</option>
				<option value="5"<?php echo ($contact_film3_unit == 5) ? " selected" : "";?>>5</option>
				<option value="6"<?php echo ($contact_film3_unit == 6) ? " selected" : "";?>>6</option>
				<option value="7"<?php echo ($contact_film3_unit == 7) ? " selected" : "";?>>7</option>
				<option value="8"<?php echo ($contact_film3_unit == 8) ? " selected" : "";?>>8</option>
				<option value="9"<?php echo ($contact_film3_unit == 9) ? " selected" : "";?>>9</option>
				<option value="10"<?php echo ($contact_film3_unit == 10) ? " selected" : "";?>>10</option>
			</select>
		</li>
		<li>
			<p class="bold">Otome House</p>
			<p>For Home: JP ¥1,000 / For Library: JP ¥10,000</p>
			<label for="contact_film4_kind">Type</label>
			<select name="contact_film4_kind" class="contact_film_kind" id="contact_film4_kind"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film4_kind) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film4_kind == 1) ? " selected" : ""; ?>>Home</option>
				<option value="2"<?php echo ($contact_film4_kind == 2) ? " selected" : "";?>>Library</option>
			</select>
			<label for="contact_film4_unit">No</label>
			<select name="contact_film4_unit" class="contact_film_unit" id="contact_film4_unit"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film4_unit) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film4_unit == 1) ? " selected" : "";?>>1</option>
				<option value="2"<?php echo ($contact_film4_unit == 2) ? " selected" : "";?>>2</option>
				<option value="3"<?php echo ($contact_film4_unit == 3) ? " selected" : "";?>>3</option>
				<option value="4"<?php echo ($contact_film4_unit == 4) ? " selected" : "";?>>4</option>
				<option value="5"<?php echo ($contact_film4_unit == 5) ? " selected" : "";?>>5</option>
				<option value="6"<?php echo ($contact_film4_unit == 6) ? " selected" : "";?>>6</option>
				<option value="7"<?php echo ($contact_film4_unit == 7) ? " selected" : "";?>>7</option>
				<option value="8"<?php echo ($contact_film4_unit == 8) ? " selected" : "";?>>8</option>
				<option value="9"<?php echo ($contact_film4_unit == 9) ? " selected" : "";?>>9</option>
				<option value="10"<?php echo ($contact_film4_unit == 10) ? " selected" : "";?>>10</option>
			</select>
		</li>
		<li>
			<p class="bold">Goodbye UR - The Japanese Social Housing Crisis</p>
			<p>For Home: JP ¥2,000 / For Library: JP ¥10,000</p>
			<label for="contact_film5_kind">Type</label>
			<select name="contact_film5_kind" class="contact_film_kind" id="contact_film5_kind"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film5_kind) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film5_kind == 1) ? " selected" : ""; ?>>Home</option>
				<option value="2"<?php echo ($contact_film5_kind == 2) ? " selected" : "";?>>Library</option>
			</select>
			<label for="contact_film5_unit">No</label>
			<select name="contact_film5_unit" class="contact_film_unit" id="contact_film5_unit"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film5_unit) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film5_unit == 1) ? " selected" : "";?>>1</option>
				<option value="2"<?php echo ($contact_film5_unit == 2) ? " selected" : "";?>>2</option>
				<option value="3"<?php echo ($contact_film5_unit == 3) ? " selected" : "";?>>3</option>
				<option value="4"<?php echo ($contact_film5_unit == 4) ? " selected" : "";?>>4</option>
				<option value="5"<?php echo ($contact_film5_unit == 5) ? " selected" : "";?>>5</option>
				<option value="6"<?php echo ($contact_film5_unit == 6) ? " selected" : "";?>>6</option>
				<option value="7"<?php echo ($contact_film5_unit == 7) ? " selected" : "";?>>7</option>
				<option value="8"<?php echo ($contact_film5_unit == 8) ? " selected" : "";?>>8</option>
				<option value="9"<?php echo ($contact_film5_unit == 9) ? " selected" : "";?>>9</option>
				<option value="10"<?php echo ($contact_film5_unit == 10) ? " selected" : "";?>>10</option>
			</select>
		</li>
		<li>
			<p class="bold">Brian & Co. Parliament Square SW1</p>
			<p>For Home: JP ¥1,500 / For Library: JP ¥10,000</p>
			<label for="contact_film6_kind">Type</label>
			<select name="contact_film6_kind" class="contact_film_kind" id="contact_film6_kind"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film6_kind) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film6_kind == 1) ? " selected" : ""; ?>>Home</option>
				<option value="2"<?php echo ($contact_film6_kind == 2) ? " selected" : "";?>>Library</option>
			</select>
			<label for="contact_film6_unit">No</label>
			<select name="contact_film6_unit" class="contact_film_unit" id="contact_film6_unit"<?php echo $disabled; ?>>
				<option value=""<?php echo (!$contact_film6_unit) ? " selected" : ""; ?>>-</option>
				<option value="1"<?php echo ($contact_film6_unit == 1) ? " selected" : "";?>>1</option>
				<option value="2"<?php echo ($contact_film6_unit == 2) ? " selected" : "";?>>2</option>
				<option value="3"<?php echo ($contact_film6_unit == 3) ? " selected" : "";?>>3</option>
				<option value="4"<?php echo ($contact_film6_unit == 4) ? " selected" : "";?>>4</option>
				<option value="5"<?php echo ($contact_film6_unit == 5) ? " selected" : "";?>>5</option>
				<option value="6"<?php echo ($contact_film6_unit == 6) ? " selected" : "";?>>6</option>
				<option value="7"<?php echo ($contact_film6_unit == 7) ? " selected" : "";?>>7</option>
				<option value="8"<?php echo ($contact_film6_unit == 8) ? " selected" : "";?>>8</option>
				<option value="9"<?php echo ($contact_film6_unit == 9) ? " selected" : "";?>>9</option>
				<option value="10"<?php echo ($contact_film6_unit == 10) ? " selected" : "";?>>10</option>
			</select>
		</li>
	</ul>
</div>
</div>

<div class="p2_t">
<div class="form_contents">
	<div class="form_title"><label for="contact_contents">Message</label></div>
	<div class="form_elements">
		<textarea name="contact_contents" id="contact_contents"<?php echo $disabled; ?>><?php echo ($contact_contents) ? $contact_contents : ""; ?></textarea>
	</div>
</div>
</div>